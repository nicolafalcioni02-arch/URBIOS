// URBIOS AI — legge la risposta dell'agente AI e la trasforma in una lista di modifiche verificate.
// Tollerante sul contorno (testo prima/dopo, ```json, virgolette tipografiche, virgole finali),
// rigido sui contenuti (chiavi note, tipi, enum, soglie di plausibilità).
import { PATIENT_FIELDS, getVisitFields, isEmpty } from './fieldRegistry';
import { FORMAT_NAME } from './promptBuilder';
import { dietContext, parseDiet } from './dietSection';
import { buildIndex } from './foodMatcher';
import { parseTraining } from './trainingSection';
import { parseRecipe } from './recipeSection';

// Estrae il primo oggetto JSON bilanciato dal testo.
const extractJson = (raw) => {
    let t = String(raw || '')
        .replace(/[“”„‟]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/^﻿/, '');
    const start = t.indexOf('{');
    if (start < 0) return null;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < t.length; i++) {
        const c = t[i];
        if (inStr) {
            if (esc) esc = false;
            else if (c === '\\') esc = true;
            else if (c === '"') inStr = false;
        } else if (c === '"') inStr = true;
        else if (c === '{') depth++;
        else if (c === '}' && --depth === 0) return t.slice(start, i + 1);
    }
    return t.slice(start); // JSON troncato: lo riporta il parser come errore
};

const parseLoose = (s) => {
    try {
        return JSON.parse(s);
    } catch {
        return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); // virgole finali
    }
};

const toNumber = (v) => {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    const m = String(v).replace(',', '.').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
};

const toIsoDate = (v) => {
    const s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return null;
};

const coerce = (f, raw) => {
    if (raw === null || raw === undefined) return { skip: true };
    if (f.type === 'number') {
        const n = toNumber(raw);
        if (n === null) return { error: `"${raw}" non è un numero` };
        const out = { value: String(n) };
        if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) out.warn = `valore insolito (${n}${f.unit ? ' ' + f.unit : ''}): controlla`;
        return out;
    }
    if (f.type === 'date') {
        const d = toIsoDate(raw);
        return d ? { value: d } : { error: `"${raw}" non è una data valida` };
    }
    if (f.type === 'enum') {
        const hit = f.options.find((o) => o.toLowerCase() === String(raw).trim().toLowerCase());
        return hit ? { value: hit } : { error: `"${raw}" non è tra: ${f.options.join(', ')}` };
    }
    const text = Array.isArray(raw) ? raw.join(', ') : typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
    const t = text.trim();
    return t ? { value: t } : { skip: true };
};

// Ritorna { ok, fatal, changes, notes, aiNotes, ignored }
//  changes: [{ id, scope, key, label, group, unit, old, new, kind:'new'|'update'|'same', warn, selected }]
export const parseAiResponse = (raw, { patient, visitDraft, db, requestId, foodDB, exerciseDB }) => {
    const res = { ok: false, fatal: null, changes: [], notes: [], aiNotes: [], ignored: [], diet: null, training: null, recipe: null };

    const jsonText = extractJson(raw);
    if (!jsonText) {
        res.fatal = 'Non trovo nessun JSON nel testo incollato. Copia la risposta intera dell’AI, dal primo all’ultimo carattere.';
        return res;
    }
    let obj;
    try {
        obj = parseLoose(jsonText);
    } catch {
        res.fatal = 'Il JSON è incompleto o malformato (spesso la risposta è stata tagliata). Chiedi all’AI di ripeterla per intero e incolla di nuovo.';
        return res;
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        res.fatal = 'La risposta non ha il formato URBIOS AI.';
        return res;
    }
    if (obj.format !== FORMAT_NAME) {
        res.fatal = `La risposta non è nel formato ${FORMAT_NAME}: manca l’intestazione "format". Rigenera con il prompt di URBIOS.`;
        return res;
    }
    if (obj.paziente_id !== undefined && String(obj.paziente_id) !== String(patient.id)) {
        res.fatal = `Questa risposta è per un altro paziente (n. ${obj.paziente_id}). Qui stai lavorando su n. ${patient.id}: non applico nulla.`;
        return res;
    }
    if (obj.richiesta && requestId && obj.richiesta !== requestId) {
        res.notes.push('La risposta appartiene a una richiesta precedente (non all’ultimo prompt copiato). Controlla che i dati siano quelli giusti.');
    }

    const sections = [
        { id: 'anagrafica', fields: PATIENT_FIELDS, current: patient },
        { id: 'visita', fields: getVisitFields(db?.rangeEmato), current: visitDraft },
    ];

    for (const sec of sections) {
        const data = obj[sec.id];
        if (!data) continue;
        if (typeof data !== 'object' || Array.isArray(data)) {
            res.notes.push(`La sezione "${sec.id}" non ha il formato atteso e viene ignorata.`);
            continue;
        }
        const byKey = Object.fromEntries(sec.fields.map((f) => [f.key, f]));
        for (const [key, raw] of Object.entries(data)) {
            const f = byKey[key];
            if (!f) {
                res.ignored.push(`${sec.id}.${key}`);
                continue;
            }
            const c = coerce(f, raw);
            if (c.skip) continue;
            if (c.error) {
                res.notes.push(`${f.label}: ${c.error} — ignorato.`);
                continue;
            }
            const old = sec.current?.[key];
            const kind = isEmpty(old) ? 'new' : String(old).trim() === c.value ? 'same' : 'update';
            if (kind === 'same') continue;
            res.changes.push({
                id: `${sec.id}.${key}`,
                scope: sec.id,
                key,
                label: f.label,
                group: f.group,
                unit: f.unit,
                old: isEmpty(old) ? '' : String(old),
                new: c.value,
                kind,
                warn: c.warn || null,
                selected: !c.warn, // i valori sospetti partono deselezionati
            });
        }
    }

    if (obj.dieta) {
        const d = parseDiet(obj.dieta, { foodIndex: buildIndex(foodDB), ctx: dietContext(patient, visitDraft) });
        if (d.ok) res.diet = d;
        else res.notes.push('La sezione "dieta" non contiene un menù utilizzabile e viene saltata.');
        if (d.warnings.length) res.notes.push(...d.warnings);
    }
    if (obj.allenamento) {
        const t = parseTraining(obj.allenamento, { exerciseDB });
        if (t.ok) res.training = t;
        else res.notes.push('La sezione "allenamento" non contiene una scheda utilizzabile e viene saltata.');
        if (t.warnings.length) res.notes.push(...t.warnings);
    }
    if (obj.ricetta) {
        const r = parseRecipe(obj.ricetta, { foodIndex: buildIndex(foodDB) });
        if (r.ok) res.recipe = r;
        else res.notes.push('La sezione "ricetta" non contiene ingredienti utilizzabili e viene saltata.');
        if (r.warnings.length) res.notes.push(...r.warnings);
    }
    if (Array.isArray(obj.avvisi)) res.aiNotes = obj.avvisi.filter((x) => typeof x === 'string' && x.trim());
    else if (typeof obj.avvisi === 'string' && obj.avvisi.trim()) res.aiNotes = [obj.avvisi];

    res.ok = true;
    return res;
};
