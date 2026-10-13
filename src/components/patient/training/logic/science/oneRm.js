// Massimale (1RM) e relazione carico / ripetizioni / sforzo.
// Formule di letteratura: valgono bene fino a ~10 ripetizioni (oltre diventano meno precise).

export const FORMULAS = {
    Epley: (w, r) => w * (1 + r / 30),
    Brzycki: (w, r) => (r >= 37 ? NaN : (w * 36) / (37 - r)),
    Lander: (w, r) => (100 * w) / (101.3 - 2.67123 * r),
    Lombardi: (w, r) => w * Math.pow(r, 0.1),
    Mayhew: (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
    "O'Conner": (w, r) => w * (1 + 0.025 * r),
    Wathan: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)),
};

const valid = (n) => Number.isFinite(n) && n > 0;

// stima del 1RM da un carico sollevato per r ripetizioni (al cedimento o vicino). Restituisce { average, byFormula }
export const estimate1RM = (load, reps) => {
    const w = Number(load);
    const r = Math.round(Number(reps));
    if (!valid(w) || !valid(r)) return null;
    const byFormula = {};
    Object.entries(FORMULAS).forEach(([k, f]) => {
        const v = r === 1 ? w : f(w, r);
        if (valid(v)) byFormula[k] = v;
    });
    const vals = Object.values(byFormula);
    if (!vals.length) return null;
    return { average: vals.reduce((a, b) => a + b, 0) / vals.length, byFormula, reliable: r <= 10 };
};

// frazione del 1RM sollevabile per n ripetizioni al cedimento (media delle formule invertite)
const RATIOS = {
    Epley: (r) => 1 / (1 + r / 30),
    Brzycki: (r) => (37 - r) / 36,
    Lander: (r) => (101.3 - 2.67123 * r) / 100,
    Lombardi: (r) => Math.pow(r, -0.1),
    Mayhew: (r) => (52.2 + 41.9 * Math.exp(-0.055 * r)) / 100,
    "O'Conner": (r) => 1 / (1 + 0.025 * r),
    Wathan: (r) => (48.8 + 53.8 * Math.exp(-0.075 * r)) / 100,
};
export const pctAtReps = (n) => {
    const r = Math.max(1, Number(n));
    if (r === 1) return 1;
    const v = Object.values(RATIOS)
        .map((f) => f(r))
        .filter((x) => Number.isFinite(x) && x > 0);
    return v.reduce((a, b) => a + b, 0) / v.length;
};

// quante ripetizioni al cedimento a una certa % del 1RM (inversa numerica)
export const repsAtPct = (pct) => {
    const p = Number(pct) / 100;
    if (!(p > 0)) return null;
    if (p >= 1) return 1;
    let lo = 1,
        hi = 40;
    if (pctAtReps(hi) > p) return hi;
    for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (pctAtReps(mid) > p) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
};

// Tabella ripetizioni ↔ percentuale (1..15)
export const repTable = (oneRm) =>
    Array.from({ length: 15 }, (_, i) => {
        const reps = i + 1;
        const pct = pctAtReps(reps) * 100;
        return { reps, pct, load: valid(Number(oneRm)) ? (Number(oneRm) * pct) / 100 : null };
    });

// RPE ↔ %1RM: RPE 10 = nessuna ripetizione di riserva; ogni punto in meno = 1 ripetizione di riserva (RIR)
export const rirFromRpe = (rpe) => Math.max(0, 10 - Number(rpe));
export const pctFromRepsRpe = (reps, rpe) => {
    const r = Number(reps),
        e = Number(rpe);
    if (!valid(r) || !Number.isFinite(e)) return null;
    return pctAtReps(r + rirFromRpe(e)) * 100;
};
export const rpeTable = (oneRm) => {
    const rpes = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6];
    return Array.from({ length: 12 }, (_, i) => ({
        reps: i + 1,
        cells: rpes.map((rpe) => {
            const pct = pctFromRepsRpe(i + 1, rpe);
            return { rpe, pct, load: valid(Number(oneRm)) ? (Number(oneRm) * pct) / 100 : null };
        }),
    }));
};
export const RPE_SCALE = [
    [10, 'Massimo sforzo, nessuna ripetizione di riserva'],
    [9.5, 'Nessuna ripetizione di riserva ma si potrebbe aumentare il carico'],
    [9, '1 ripetizione di riserva'],
    [8.5, '1-2 ripetizioni di riserva'],
    [8, '2 ripetizioni di riserva'],
    [7.5, '2-3 ripetizioni di riserva'],
    [7, '3 ripetizioni di riserva (velocità del bilanciere invariata)'],
    [5, 'Sforzo leggero: 5+ ripetizioni di riserva'],
];

export const roundTo = (x, step = 2.5) => (Number.isFinite(x) ? Math.round(x / step) * step : x);
export const loadFromPct = (oneRm, pct, step = 2.5) => (valid(Number(oneRm)) && valid(Number(pct)) ? roundTo((Number(oneRm) * Number(pct)) / 100, step) : null);
export const pctFromLoad = (oneRm, load) => (valid(Number(oneRm)) && valid(Number(load)) ? (Number(load) / Number(oneRm)) * 100 : null);

// Riscaldamento: piramide fino al carico di lavoro
export const warmupSets = (workLoad, workReps = 8, bar = 20) => {
    const w = Number(workLoad);
    if (!valid(w)) return [];
    const heavy = Number(workReps) <= 5;
    const steps = heavy
        ? [
              [0.4, 8],
              [0.6, 5],
              [0.75, 3],
              [0.88, 1],
          ]
        : [
              [0.4, 10],
              [0.6, 6],
              [0.8, 3],
          ];
    return steps
        .map(([f, reps]) => ({ pct: f * 100, reps, load: Math.max(roundTo(w * f), w * f < bar ? bar : 0) }))
        .filter((s, i, a) => s.load > 0 && s.load < w && (i === 0 || s.load > a[i - 1].load));
};
