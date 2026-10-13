// URBIOS AI — sezione ALLENAMENTO: blocco di prompt, lettura della risposta, costruzione della scheda.
// L'AI scrive UNA settimana tipo in forma compatta (esercizio, n. serie, ripetizioni, RPE, recupero...).
// URBIOS espande le serie, abbina gli esercizi al database (nome, gruppo, muscoli) e replica le settimane.
// I carichi in kg non vengono inventati: senza massimali noti l'AI usa RPE o %1RM.
import { buildIndex, matchFood, normalize } from './foodMatcher';
import { GOALS, LEVELS, goalById } from '../components/patient/training/logic/science/guidelines';
import { parseReps, parseRest, parseTempo, numOrNull } from '../components/patient/training/logic/science/parse';
import { getMassimali, getProfile, getSchede, todayIso } from '../components/patient/training/logic/trainingModel';
import { EXERCISE_CATALOG } from '../components/patient/training/data/exerciseCatalog';

const genId = () => 'id-' + Math.random().toString(36).slice(2, 11);
const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
    return undefined;
};

export const trainingContext = (patient) => ({
    profile: getProfile(patient),
    massimali: getMassimali(patient),
    existing: getSchede(patient),
});

// Esercizi noti: database dell'utente + catalogo (con alias). Ogni voce punta all'esercizio "canonico" {name, group}.
export const exerciseEntries = (exerciseDB) => {
    const seen = new Set();
    const out = [];
    const add = (label, ex) => {
        const k = normalize(label);
        if (!k || seen.has(k + '|' + ex.name)) return;
        seen.add(k + '|' + ex.name);
        out.push({ name: label, ex });
    };
    (exerciseDB || []).forEach((e) => add(e.name, { name: e.name, group: e.group || '' }));
    EXERCISE_CATALOG.forEach((c) => {
        const canonical = (exerciseDB || []).find((e) => normalize(e.name) === normalize(c.name));
        const ex = canonical ? { name: canonical.name, group: canonical.group || c.group } : { name: c.name, group: c.group };
        add(c.name, ex);
        (c.aliases || []).forEach((a) => add(a, ex));
    });
    return out;
};

export const exerciseListText = (exerciseDB) => {
    const byGroup = {};
    (exerciseDB || []).forEach((e) => (byGroup[e.group || 'Altro'] ||= []).push(e.name));
    return Object.entries(byGroup)
        .map(([g, n]) => `${g}: ${n.join('; ')}`)
        .join('\n');
};

// ---------------------------------------------------------------- PROMPT
export const trainingPromptBlock = ({ ctx, exerciseDB, opts }) => {
    const mass = Object.values(ctx.massimali || {})
        .filter((m) => m && Number(m.kg) > 0)
        .map((m) => `${m.name}: ${m.kg} kg`);
    const goals = GOALS.map((g) => `"${g.id}" (${g.label}: ${g.reps[0]}-${g.reps[1]} rip., recuperi ${g.rest[0]}-${g.rest[1]} s, RPE ${g.rpe[0]}-${g.rpe[1]})`).join('; ');
    return `
SEZIONE "allenamento" — regole specifiche:
- Costruisci UNA settimana tipo: ${opts.weeks > 1 ? `URBIOS la ripeterà per ${opts.weeks} settimane${opts.deload ? ' (l’ultima di scarico)' : ''}; non scrivere le altre settimane` : 'una sola settimana'}.
- "giorni": le sedute della settimana. Il numero e la durata devono rispettare disponibilità e tempo emersi nell'intervista. Ogni giorno ha "titolo" (es. "Upper A", "Gambe"), "esercizi" e facoltativamente "minuti" e "note".
- "tipo": obiettivo principale, uno tra: ${goals}.
- "livello": uno tra ${LEVELS.map((l) => `"${l.id}"`).join(', ')}, coerente con l'esperienza reale della persona.
- Ogni esercizio: "nome", "serie" (numero di serie di lavoro), "ripetizioni" (es. "8-12", oppure durata "45''" o "20 min" per cardio/isometrici), "riposo" (es. "90''" o "2'"), "rpe" (1-10), facoltativi: "tempo" (es. "3-0-1-0"), "pct" (% del massimale), "carico_kg", "superserie" (stessa lettera per esercizi in sequenza, es. "A"), "nota" (indicazione tecnica breve), "gruppo" (solo se l'esercizio non è nell'elenco).
- Per serie diverse tra loro (piramide, drop set) "serie" può essere una lista di oggetti con "ripetizioni", "rpe", "pct", "carico_kg", "riposo", "tipo" ("" | "drop").
- ${mass.length ? `Massimali noti: ${mass.join('; ')}. Puoi usare "pct" su questi esercizi.` : 'Non ci sono massimali noti: NON inventare carichi in kg, usa "rpe" (e "pct" solo se hai una base).'}
- Cardio: esercizio con gruppo "Cardio", "serie": 1 e "ripetizioni" in minuti (es. "20 min").
- Sicurezza: rispetta infortuni, dolori e limitazioni emersi; evita esercizi controindicati e segnalalo in "avvisi". Progressione prudente per principianti, ordine sensato (multiarticolari prima), volume per gruppo muscolare coerente con livello e obiettivo, equilibrio spinta/trazione, recuperi coerenti con l'obiettivo.
- Usa SOLO l'attrezzatura disponibile (palestra, casa, corpo libero) come emerso.
${
    opts.includeExerciseList
        ? `\nESERCIZI NEL DATABASE DI URBIOS (usa PREFERIBILMENTE questi nomi, identici):\n${exerciseListText(exerciseDB)}\n`
        : '\nUsa nomi italiani comuni degli esercizi (es. "Panca piana bilanciere", "Squat", "Lat machine").\n'
}`;
};

export const trainingTemplate = () => ({
    titolo: '<titolo scheda>',
    obiettivo: '<obiettivo in una frase>',
    tipo: 'ipertrofia',
    livello: 'intermedio',
    giorni: [
        {
            titolo: 'Giorno A',
            minuti: 60,
            esercizi: [{ nome: '<esercizio>', serie: 3, ripetizioni: '8-12', riposo: "90''", rpe: 8, tempo: '', nota: '' }],
        },
    ],
});

// ---------------------------------------------------------------- LETTURA
export const parseTraining = (raw, { exerciseDB }) => {
    const out = { ok: false, warnings: [], titolo: '', obiettivo: '', tipo: '', livello: '', days: [] };
    if (!raw || typeof raw !== 'object') {
        out.warnings.push('La sezione "allenamento" è vuota.');
        return out;
    }
    const index = buildIndex(exerciseEntries(exerciseDB));

    out.titolo = String(raw.titolo || '').trim();
    out.obiettivo = String(raw.obiettivo || '').trim();
    const tipo = String(raw.tipo || '').trim().toLowerCase();
    if (goalById(tipo)) out.tipo = tipo;
    else if (tipo) out.warnings.push(`Tipo di obiettivo "${raw.tipo}" non riconosciuto: lasciato vuoto.`);
    const liv = String(raw.livello || '').trim().toLowerCase();
    if (LEVELS.some((l) => l.id === liv)) out.livello = liv;
    else if (liv) out.warnings.push(`Livello "${raw.livello}" non riconosciuto: lasciato vuoto.`);

    const rawDays = Array.isArray(raw.giorni) ? raw.giorni : [];
    if (rawDays.length > 7) out.warnings.push('Più di 7 sedute nella settimana: tengo le prime 7.');
    rawDays.slice(0, 7).forEach((d, di) => {
        const exercises = (Array.isArray(d?.esercizi) ? d.esercizi : [])
            .map((e, ei) => {
                const name = String(pick(e, 'nome', 'name') || '').trim();
                if (!name) return null;
                const match = matchFood(name, index);
                // più voci (nome + alias) possono puntare allo stesso esercizio: tolgo i doppioni
                const seen = new Set();
                const alternatives = match.alternatives.map((a) => a.ex).filter((x) => (seen.has(x.name) ? false : seen.add(x.name)));
                const cleanNote = (s) => String(s || '').trim();

                // serie: numero oppure lista
                const base = {
                    reps: String(pick(e, 'ripetizioni', 'reps') ?? '').trim(),
                    rpe: pick(e, 'rpe'),
                    pct: pick(e, 'pct'),
                    load: pick(e, 'carico_kg', 'carico'),
                    rec: String(pick(e, 'riposo', 'recupero', 'rec') ?? '').trim(),
                    tempo: String(pick(e, 'tempo') ?? '').trim(),
                    tipo: '',
                };
                let sets = [];
                if (Array.isArray(e.serie)) sets = e.serie.map((s) => ({ ...base, reps: String(pick(s, 'ripetizioni', 'reps') ?? base.reps).trim(), rpe: pick(s, 'rpe') ?? base.rpe, pct: pick(s, 'pct') ?? base.pct, load: pick(s, 'carico_kg', 'carico') ?? base.load, rec: String(pick(s, 'riposo', 'recupero', 'rec') ?? base.rec).trim(), tempo: String(pick(s, 'tempo') ?? base.tempo).trim(), tipo: s.tipo === 'drop' ? 'drop' : '' }));
                else {
                    const n = Math.round(numOrNull(e.serie) ?? 3);
                    sets = Array.from({ length: Math.min(Math.max(n, 1), 10) }, () => ({ ...base }));
                    if (n > 8) out.warnings.push(`${name}: ${n} serie sembrano molte.`);
                }
                const warn = [];
                sets = sets.slice(0, 10).map((s) => {
                    const r = { ...s, rpe: '', pct: '', load: '' };
                    if (s.reps && parseReps(s.reps).reps === null && parseReps(s.reps).seconds === null) {
                        warn.push(`ripetizioni "${s.reps}" non leggibili`);
                        r.reps = '';
                    } else r.reps = s.reps;
                    const rpe = numOrNull(s.rpe);
                    if (rpe !== null) r.rpe = rpe >= 1 && rpe <= 10 ? String(rpe) : (warn.push(`RPE ${rpe} fuori scala`), '');
                    const pct = numOrNull(s.pct);
                    if (pct !== null) r.pct = pct >= 20 && pct <= 105 ? String(pct) : (warn.push(`% ${pct} fuori scala`), '');
                    const load = numOrNull(s.load);
                    if (load !== null && load > 0) r.load = String(load);
                    if (s.rec && parseRest(s.rec) === null) {
                        warn.push(`recupero "${s.rec}" non leggibile`);
                        r.rec = '';
                    }
                    if (s.tempo && parseTempo(s.tempo) === null) {
                        warn.push(`tempo "${s.tempo}" non leggibile`);
                        r.tempo = '';
                    }
                    return r;
                });
                return {
                    key: `${di}.${ei}`,
                    aiName: name,
                    aiGroup: String(pick(e, 'gruppo', 'group') || '').trim(),
                    ss: String(pick(e, 'superserie', 'ss') || '').trim().slice(0, 2),
                    note: cleanNote(pick(e, 'nota', 'note')),
                    sets,
                    match: { status: match.status, best: match.best?.ex || null, alternatives },
                    warn: warn.length ? [...new Set(warn)].join('; ') : null,
                };
            })
            .filter(Boolean);
        if (exercises.length) out.days.push({ title: String(d.titolo || d.title || `Giorno ${di + 1}`).trim(), minutes: numOrNull(d.minuti), note: String(d.note || '').trim(), exercises });
    });
    if (!out.days.length) out.warnings.push('Nessuna seduta valida nella risposta.');
    out.ok = out.days.length > 0;
    return out;
};

// Scelta per esercizio: { type:'db', ex:{name,group} } | { type:'free' } | { type:'skip' }
export const defaultTrainingChoice = (e) => (e.match.best && e.match.status !== 'none' ? { type: 'db', ex: e.match.best } : { type: 'free' });

// ---------------------------------------------------------------- SCHEDA
const buildDay = (d, choices) => ({
    id: genId(),
    title: d.title,
    collapsed: false,
    minutes: '', // la durata la stima URBIOS dalle serie; quella dell'AI resta solo un riferimento
    sessionRpe: '',
    note: d.note,
    exercises: d.exercises
        .map((e) => {
            const c = choices[e.key] || defaultTrainingChoice(e);
            if (c.type === 'skip') return null;
            return {
                id: genId(),
                name: c.type === 'db' ? c.ex.name : e.aiName,
                group: c.type === 'db' ? c.ex.group : e.aiGroup,
                ss: e.ss,
                note: e.note,
                sets: e.sets.map((s) => ({ id: genId(), reps: s.reps, load: s.load, pct: s.pct, rpe: s.rpe, tempo: s.tempo, rec: s.rec, note: '', tipo: s.tipo })),
            };
        })
        .filter(Boolean),
});

// Settimana di scarico: ~60% delle serie (almeno 1), stesso resto.
const deloadDay = (day) => ({
    ...day,
    id: genId(),
    exercises: day.exercises.map((e) => ({ ...e, id: genId(), sets: e.sets.slice(0, Math.max(1, Math.ceil(e.sets.length * 0.6))).map((s) => ({ ...s, id: genId() })) })),
});
const cloneDay = (day) => ({ ...day, id: genId(), exercises: day.exercises.map((e) => ({ ...e, id: genId(), sets: e.sets.map((s) => ({ ...s, id: genId() })) })) });

export const buildTrainingPayload = ({ parsed, choices, patient, opts }) => {
    const baseDays = parsed.days.map((d) => buildDay(d, choices)).filter((d) => d.exercises.length);
    const total = Math.max(1, opts.weeks || 1);
    const weeks = Array.from({ length: total }, (_, i) => {
        const isDeload = opts.deload && total >= 4 && i === total - 1;
        return {
            id: genId(),
            title: `Settimana ${i + 1}`,
            kind: isDeload ? 'deload' : '',
            note: isDeload ? 'Settimana di scarico: serie ridotte, stessa intensità.' : '',
            days: baseDays.map((d) => (isDeload ? deloadDay(d) : cloneDay(d))),
        };
    });
    const goal = goalById(parsed.tipo);
    const scheda = {
        id: genId(),
        titolo: parsed.titolo || `Scheda ${goal ? goal.label.split(' ')[0].toLowerCase() : 'AI'}`,
        cliente: `${patient.nome || ''} ${patient.cognome || ''}`.trim(),
        obiettivo: parsed.obiettivo,
        tipo: parsed.tipo,
        livello: parsed.livello,
        extraMin: 10,
        data: todayIso(),
        weeks,
        updatedAt: new Date().toISOString(),
    };
    const allenamento = {
        ...(patient.allenamento || {}),
        schede: [...getSchede(patient), scheda],
        attiva: scheda.id,
    };
    return { scheda, allenamento, exercisesCount: baseDays.reduce((n, d) => n + d.exercises.length, 0) };
};
