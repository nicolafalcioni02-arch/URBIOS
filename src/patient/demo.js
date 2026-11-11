// MODALITÀ PROVA (solo in sviluppo, `import.meta.env.DEV`): salta accesso e collegamento e usa dati finti, in memoria.
// Non tocca cassaforte, chiavi né IndexedDB; non viene inclusa nella versione pubblicata.
const SQ = 'Squat bulgaro con bilanciere olimpico, presa larga e pausa al fondo';
const ex = (nome, serie, carico, rec, extra = {}) => ({ nome, ss: '', serie, carico, pct: '', rpe: '', tempo: '', rec, note: '', ...extra });
const DOCS = {
    t1: { docId: 't1', kind: 'training', title: 'Scheda forza (prova)', rev: 2, at: 1793000000, body: { settimane: [
        { titolo: 'Settimana 1', scarico: false, nota: 'Settimana di adattamento: lascia 2 ripetizioni di scorta.', giorni: [
            { titolo: 'Lower body', nota: '', esercizi: [ex(SQ, '4x10', '70', '35s', { rpe: '8', tempo: '3-1-2-1', note: 'Schiena neutra, scendi sotto il parallelo.' }), ex('Stacco rumeno', '3x12', '50', '35s'), ex('Affondi con manubri', '3x10', '16', '35s', { tempo: '2-0-1' }), ex('Calf in piedi', '4x15', '40', '45s')] },
            { titolo: 'Upper body', nota: '', esercizi: [ex('Panca piana', '4x8', '60', '2 min', { rpe: '8' }), ex('Rematore con manubrio', '3x10', '24', '35s'), ex('Military press', '3x8', '35', '35s'), ex('Curl con manubri', '3x12', '12', '35s')] },
            { titolo: 'Full body', nota: 'Veloce: 3 giri, riposo breve.', esercizi: [ex('Goblet squat', '3x12', '20', '45s'), ex('Piegamenti', '3x10', '', '45s'), ex('Plank', '3x1', '', '30s', { note: '40 secondi a serie.' })] },
        ] },
        { titolo: 'Settimana 2', scarico: true, nota: 'Scarico: carichi al 70%.', giorni: [
            { titolo: 'Lower body', nota: '', esercizi: [ex(SQ, '3x8', '50', '35s'), ex('Stacco rumeno', '2x10', '40', '35s')] },
        ] },
    ] } },
    t2: { docId: 't2', kind: 'training', title: 'Mobilità (prova)', rev: 1, at: 1793000000, body: { settimane: [{ titolo: 'Settimana 1', scarico: false, nota: '', giorni: [
        { titolo: 'Mobilità e core', nota: '', esercizi: [ex('Cat-cow', '2x10', '', '20s'), ex('Dead bug', '3x8', '', '30s'), ex('Ponte glutei', '3x12', '', '30s')] },
    ] }] } },
    d1: { docId: 'd1', kind: 'diet', title: 'Piano alimentare', rev: 3, at: 1793000000, body: { obiettivo: { kcal: 2200, p: 150, c: 240, f: 65 }, giorni: [
        { titolo: 'Giorno allenamento', pasti: [
            { nome: 'Colazione', voci: [{ n: 'Pancake proteici', g: 120, kcal: 300 }, { n: 'Mirtilli', g: 80, kcal: 45 }, { n: 'Noci', g: 20, kcal: 130 }] },
            { nome: 'Pranzo', voci: [{ n: 'Riso basmati integrale', g: 90, kcal: 320 }, { n: 'Salmone al vapore', g: 150, kcal: 310 }, { n: 'Zucchine', g: 200, kcal: 34 }] },
            { nome: 'Spuntino', voci: [{ n: 'Yogurt greco', g: 170, kcal: 100 }, { n: 'Mela', g: 150, kcal: 78 }] },
            { nome: 'Cena', voci: [{ n: 'Pollo alla piastra', g: 160, kcal: 260 }, { n: 'Patate al forno', g: 200, kcal: 170 }, { n: 'Insalata mista', g: 150, kcal: 30 }] },
        ] },
        { titolo: 'Giorno riposo', pasti: [
            { nome: 'Colazione', voci: [{ n: 'Fiocchi d\'avena', g: 60, kcal: 220 }, { n: 'Latte parzialmente scremato', g: 200, kcal: 92 }] },
            { nome: 'Pranzo', voci: [{ n: 'Pasta di farro', g: 80, kcal: 270 }, { n: 'Legumi', g: 150, kcal: 180 }] },
            { nome: 'Cena', voci: [{ n: 'Merluzzo', g: 200, kcal: 160 }, { n: 'Verdure grigliate', g: 250, kcal: 70 }] },
        ] },
    ] } },
};

// storico finto: ogni esercizio fatto 4-5 volte negli ultimi giorni, con date relative a oggi
const ago = (n) => { const t = new Date(Date.now() - n * 86400000); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const makeHist = () => {
    const out = {}, offs = { [SQ]: [2, 5, 9, 16, 23], 'Stacco rumeno': [2, 5, 9, 16], 'Affondi con manubri': [2, 9, 16], 'Calf in piedi': [5, 16], 'Panca piana': [3, 6, 10, 17, 24], 'Rematore con manubrio': [3, 10, 17], 'Military press': [3, 6, 17], 'Curl con manubri': [6, 10], 'Goblet squat': [4, 11], 'Piegamenti': [4, 11], 'Plank': [4], 'Dead bug': [1, 8], 'Ponte glutei': [1, 8] };
    for (const [n, days] of Object.entries(offs)) out[n] = days.slice().reverse().map((k, i) => ({ date: ago(k), sets: Array.from({ length: 3 + (i % 2) }, () => ({ kg: 40 + i * 2.5, rpe: 7 + (i % 3) })) }));
    return out;
};
export const createDemoRuntime = ({ onChange }) => {
    const meals = {}; Array.from({ length: 38 }, (_, i) => [i + 1, 3 + (i % 2), 1950 + ((i * 97) % 450) - Math.floor(i / 7) * 40]).filter(([n]) => n % 5 !== 0).forEach(([n, c, k]) => { for (let m = 0; m < c; m++) meals[`d1|0|${m}|${ago(n)}`] = { items: [], list: [], kcal: Math.round(k / c), at: 1 }; });
    const log = { tools: { notes: [{ t: 'Ho avuto un po’ di mal di schiena dopo lo stacco, soprattutto lunedì.', at: Date.now() - 86400000 * 3 }, { t: 'Il pranzo di sabato era fuori casa: ho mangiato più carboidrati del previsto.', at: Date.now() - 86400000 }], visit: '2026-11-24' }, sessions: {}, meals, extras: {}, hist: { ...makeHist(), [SQ]: [{ date: '2026-10-21', sets: [{ kg: 67.5, rpe: 8 }, { kg: 67.5, rpe: 8 }, { kg: 67.5, rpe: 9 }, { kg: 67.5, rpe: 9, note: 'Ultima serie dura' }] }, { date: '2026-10-28', sets: [{ kg: 70, rpe: 7 }, { kg: 70, rpe: 7 }, { kg: 70, rpe: 7 }, { kg: 70, rpe: 7 }] }, ...makeHist()[SQ].slice(-2), { date: '2026-11-05', sets: [{ kg: 50, reps: 8, rpe: 4 }, { kg: 60, reps: 6, rpe: 8 }, { kg: 100, reps: 1, rpe: 4 }] }] }, weights: [{ date: ago(35), kg: 74.1, at: 1 }, { date: ago(28), kg: 73.6, at: 1 }, { date: ago(21), kg: 73.2, at: 1 }, { date: ago(14), kg: 72.9, at: 1 }, { date: ago(7), kg: 72.6, at: 1 }, { date: ago(1), kg: 72.4, at: 1 }], last: { [SQ]: 70, 'Panca piana': 55 } };
    // ?lungo: testi molto lunghi (e parole senza spazi) per provare il layout
    if (/[?&]lungo/.test(location.search)) {
        const W = ' con una descrizione davvero molto lunga per provare come va a capo il testo', U = 'Supercalifragilistichespiralidosissimo-esercizio-isometrico-unilaterale';
        let i = 0; const lng = (o) => { if (Array.isArray(o)) o.forEach(lng); else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (['titolo', 'title', 'nome', 'n'].includes(k) && typeof o[k] === 'string') { i++; o[k] = o[k] + W + (i % 3 === 0 ? ' ' + U : ''); } else if (['note', 'nota'].includes(k) && typeof o[k] === 'string') o[k] = (o[k] || 'Nota') + W + W + W + ' ' + U; else lng(o[k]); } };
        lng(Object.values(DOCS));
    }
    if (/[?&]vuoto/.test(location.search)) { log.sessions = {}; log.meals = {}; log.extras = {}; log.hist = {}; log.weights = []; log.last = {}; log.tools = {}; }
    if (typeof window !== 'undefined') { window.__demoLog = log; window.__demoChange = onChange; }
    return {
        demo: true, deviceId: 'prova00000000',
        status: () => ({ linked: true, consent: null, lastSync: Date.now(), lastError: null }),
        docs: { list: () => Object.values(DOCS).filter((d) => !/[?&]solo=/.test(location.search) || (location.search.includes('solo=dieta') ? d.kind === 'diet' : d.kind === 'training')).map((d) => ({ ...d, body: undefined })), get: (id) => DOCS[id], conflicts: () => [] },
        log: { get: () => log, update: async (fn) => { fn(log); onChange(); } },
        sync: async () => {}, stop() {}, forgetAll: async () => {},
    };
};
