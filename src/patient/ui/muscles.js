// Da nome dell'esercizio ai muscoli lavorati, e conteggio delle serie per muscolo dal diario locale. Funzioni pure.
// Le regole guardano parole comuni (italiano e inglese); la PRIMA che corrisponde vince. Esercizio sconosciuto ⇒ nessun muscolo.
export const MUSCLES = { chest: 'Petto', shoulders: 'Spalle', biceps: 'Bicipiti', triceps: 'Tricipiti', forearms: 'Avambracci', abs: 'Addome', traps: 'Trapezio', lats: 'Dorso', lower: 'Lombari', glutes: 'Glutei', quads: 'Quadricipiti', hams: 'Femorali', calves: 'Polpacci' };
const RULES = [
    [/leg curl|femoral|curl (da )?sdraiato|nordic/i, { hams: 1, calves: 0.2 }],
    [/stacco rumeno|romanian|rdl|good ?morning/i, { hams: 1, glutes: 0.7, lower: 0.5 }],
    [/stacco/i, { hams: 0.7, glutes: 0.8, lower: 0.8, lats: 0.3, traps: 0.3 }],
    [/hip ?thrust|ponte|glute|gluteo|kick ?back/i, { glutes: 1, hams: 0.4 }],
    [/leg ?press|pressa|squat|goblet|hack|affond|lunge|step ?up|split|leg ?extension/i, { quads: 1, glutes: 0.6, hams: 0.2 }],
    [/calf|polpacc|gemell|soleo/i, { calves: 1 }],
    [/hyperext|iperext|lombar|superman|bird ?dog/i, { lower: 1, glutes: 0.4 }],
    [/crunch|plank|addom|dead ?bug|sit[- ]?up|core|russian|mountain|ab wheel|leg raise|sollevamento gambe/i, { abs: 1 }],
    [/face ?pull|shrug|scrollat|trapez|alzate posteriori|rear/i, { traps: 0.8, shoulders: 0.6 }],
    [/lat |lat$|pulldown|trazion|pull[- ]?up|chin|rematore|row|rowing|t-bar/i, { lats: 1, biceps: 0.5, traps: 0.4 }],
    [/alzate|military|shoulder|spalle|arnold|overhead|lento|press sopra/i, { shoulders: 1, triceps: 0.4 }],
    [/tricip|french|pushdown|skull|estension\w* (al )?cavo|kickback tri|dip|parallele/i, { triceps: 1, chest: 0.3, shoulders: 0.2 }],
    [/bicip|curl|hammer|martello|preacher|scott/i, { biceps: 1, forearms: 0.4 }],
    [/panca|chest|croci|fly|pectoral|distension|piegament|push[- ]?up|cavi incrociati/i, { chest: 1, triceps: 0.5, shoulders: 0.4 }],
    [/avambrac|wrist|polso|farmer/i, { forearms: 1 }],
];
export const muscleOf = (name) => { const n = String(name || ''); for (const [re, m] of RULES) if (re.test(n)) return m; return null; };

const dayMs = 86400000;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const sinceDate = (days, now = Date.now()) => iso(new Date(now - (days - 1) * dayMs));

// serie (pesate) per muscolo negli ultimi `days` giorni, oggi compreso
export const setsByMuscle = (hist, days, now = Date.now()) => {
    const from = sinceDate(days, now), out = {};
    for (const [name, list] of Object.entries(hist || {})) {
        const m = muscleOf(name); if (!m) continue;
        for (const h of list || []) { if (h.date < from) continue; const n = (h.sets || []).length; for (const [k, w] of Object.entries(m)) out[k] = (out[k] || 0) + n * w; }
    }
    return out;
};
// riepilogo: giorni di allenamento, serie totali negli ultimi `days` giorni
export const summary = (hist, days, now = Date.now()) => {
    const from = sinceDate(days, now), dates = new Set(); let sets = 0;
    for (const list of Object.values(hist || {})) for (const h of list || []) { if (h.date < from) continue; dates.add(h.date); sets += (h.sets || []).length; }
    return { workouts: dates.size, sets };
};
// serie totali per settimana (lunedì-domenica), ultime `n` settimane, dalla più vecchia
export const weekly = (hist, n = 6, now = Date.now()) => {
    const d = new Date(now); const dow = (d.getDay() + 6) % 7; const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
    const weeks = Array.from({ length: n }, (_, i) => { const s = new Date(mon.getTime() - (n - 1 - i) * 7 * dayMs); return { from: iso(s), to: iso(new Date(s.getTime() + 6 * dayMs)), label: `${s.getDate()}/${s.getMonth() + 1}`, sets: 0 }; });
    for (const list of Object.values(hist || {})) for (const h of list || []) for (const w of weeks) if (h.date >= w.from && h.date <= w.to) w.sets += (h.sets || []).length;
    return weeks;
};

// Forza e volume: periodo attuale (ultimi `days` giorni) contro il precedente. Volume = somma dei kg di ogni serie (le ripetizioni
// non si registrano). Forza = per ogni esercizio, carico massimo del periodo contro quello del periodo prima: media della variazione.
export const strength = (hist, days, now = Date.now()) => {
    const from = sinceDate(days, now), prev = sinceDate(days * 2, now); let vol = 0, pvol = 0; const rows = [];
    for (const [name, list] of Object.entries(hist || {})) {
        let cur = 0, old = 0;
        for (const h of list || []) {
            const ks = (h.sets || []).map((s) => +s.kg || 0), t = ks.reduce((a, b) => a + b, 0), mx = Math.max(0, ...ks);
            if (h.date >= from) { vol += t; cur = Math.max(cur, mx); } else if (h.date >= prev) { pvol += t; old = Math.max(old, mx); }
        }
        if (cur > 0 && old > 0) rows.push({ name, cur, old, pct: (cur - old) / old * 100 });
    }
    rows.sort((a, b) => b.pct - a.pct);
    return { vol: Math.round(vol), pvol: Math.round(pvol), rows, avg: rows.length ? rows.reduce((t, r) => t + r.pct, 0) / rows.length : null };
};
