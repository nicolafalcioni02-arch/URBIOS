// Archivio (db) → dataset di ricerca: righe anonime (codice paziente al posto del nome) + catalogo delle variabili.
// Riusa le tabelle dell'export (dataExchange/export/tables.js) così ogni campo nuovo delle visite compare da solo.
import { buildVisitTable } from '../../dataExchange/export/tables';
import { PATIENT_FIELDS, FREE_TEXT_KEY_RE } from '../../dataExchange/anonymize';
import { humanize, toNum } from '../../dataExchange/util';
import { isExample } from '../../storage/example/example';
import { VAR_LABELS } from '../data/labels';

// livelli di analisi: cosa rappresenta una riga
export const LEVELS = [
    { id: 'prima', label: 'Pazienti · prima visita', hint: 'Una riga per paziente, con i dati della prima visita' },
    { id: 'ultima', label: 'Pazienti · ultima visita', hint: 'Una riga per paziente, con i dati dell’ultima visita' },
    { id: 'visite', label: 'Tutte le visite', hint: 'Una riga per visita: attenzione, le visite dello stesso paziente non sono indipendenti' },
];

// mai tra le variabili: identificativi, date esatte, testi liberi
const BLOCKED = new Set(['id', 'paziente_id', 'visita_id', 'data', 'dataNascita', 'esempio', 'professionista', 'documenti', 'anamnesi_verificata', 'nome', 'cognome', ...PATIENT_FIELDS.map((f) => f.key)]);
const isBlocked = (k) => BLOCKED.has(k) || FREE_TEXT_KEY_RE.test(k) || /^_/.test(k);

export const labelOf = (key) => VAR_LABELS[key] || humanize(key);

const byDate = (a, b) => String(a.data || '').localeCompare(String(b.data || ''));

// codici stabili per la sessione: P001, P002... nell'ordine dell'archivio
const patientCodes = (patients) => new Map(patients.map((p, i) => [String(p.id), `P${String(i + 1).padStart(3, '0')}`]));

// options: { includeExample }
export const buildDataset = (db, level = 'prima', { includeExample = false } = {}) => {
    const patients = (db.pazienti || []).filter((p) => includeExample || !isExample(p));
    const codes = patientCodes(patients);
    const ids = new Set(codes.keys());
    const visitRows = buildVisitTable({ pazienti: patients }).rows.filter((r) => ids.has(String(r.paziente_id))).sort(byDate);

    const pInfo = new Map(patients.map((p) => [String(p.id), { status: p.status || 'Attivo', n_visite: (p.visite || []).length }]));
    const withCode = (r) => ({ _code: codes.get(String(r.paziente_id)), ...pInfo.get(String(r.paziente_id)), ...r });

    let raw;
    if (level === 'visite') raw = visitRows.map(withCode);
    else {
        const per = new Map();
        visitRows.forEach((r) => {
            const k = String(r.paziente_id);
            if (level === 'prima' ? !per.has(k) : true) per.set(k, r);
        });
        // pazienti senza visite: restano con i soli dati anagrafici (sesso)
        patients.forEach((p) => !per.has(String(p.id)) && per.set(String(p.id), { paziente_id: p.id, sesso: p.sesso }));
        raw = [...per.values()].map(withCode);
    }

    const vars = inferVars(raw);
    const rows = raw.map((r) => {
        const out = { _code: r._code, _pid: String(r.paziente_id), _date: r.data || '' };
        vars.forEach((v) => {
            out[v.key] = v.type === 'num' ? toNum(r[v.key]) : r[v.key] === undefined || r[v.key] === null ? '' : String(r[v.key]);
        });
        return out;
    });
    return { level, rows, vars, nPatients: patients.length, nVisits: visitRows.length };
};

// tipo di ogni colonna: numerica se quasi tutti i valori sono numeri; categorica se poche modalità; altrimenti esclusa
const inferVars = (rows) => {
    const keys = [];
    const seen = new Set();
    rows.forEach((r) => Object.keys(r).forEach((k) => !seen.has(k) && !isBlocked(k) && (seen.add(k), keys.push(k))));
    const vars = [];
    keys.forEach((key) => {
        const vals = rows.map((r) => r[key]).filter((v) => v !== undefined && v !== null && v !== '');
        if (!vals.length) return;
        const nums = vals.map(toNum).filter(Number.isFinite);
        const distinct = new Set(vals.map(String)).size;
        if (nums.length >= 0.8 * vals.length) vars.push({ key, label: labelOf(key), type: 'num', n: nums.length, distinct });
        else if (distinct <= 15) vars.push({ key, label: labelOf(key), type: 'cat', n: vals.length, distinct });
    });
    return vars.sort((a, b) => a.label.localeCompare(b.label, 'it'));
};

// variabili adatte a formare gruppi (categoriche o numeriche con poche modalità)
export const groupingVars = (ds) => ds.vars.filter((v) => (v.type === 'cat' || v.distinct <= 6) && v.distinct >= 2);

export const column = (ds, key) => ds.rows.map((r) => r[key]);

// divide una variabile numerica secondo i valori di una variabile di gruppo
export const splitBy = (ds, valueKey, groupKey) => {
    const m = new Map();
    ds.rows.forEach((r) => {
        const g = r[groupKey];
        if (g === '' || g === undefined || (typeof g === 'number' && !Number.isFinite(g))) return;
        const k = String(g);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(r[valueKey]);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'it', { numeric: true })).map(([name, values]) => ({ name, values }));
};

// coppie prima visita → ultima visita per i pazienti con almeno 2 visite misurate (per i test appaiati)
export const firstLastPairs = (db, key, { includeExample = false } = {}) => {
    const ds = buildDataset(db, 'visite', { includeExample });
    const per = new Map();
    ds.rows.forEach((r) => {
        if (!Number.isFinite(r[key])) return;
        if (!per.has(r._pid)) per.set(r._pid, []);
        per.get(r._pid).push(r);
    });
    const pre = [];
    const post = [];
    const codes = [];
    per.forEach((list) => {
        if (list.length < 2) return;
        pre.push(list[0][key]);
        post.push(list[list.length - 1][key]);
        codes.push(list[0]._code);
    });
    return { pre, post, codes, vars: ds.vars };
};
