// Statistiche descrittive (funzioni pure). Tutte accettano array di numeri e ignorano NaN/null.
import { tInv } from './distributions.js';

export const clean = (xs) => (xs || []).filter((x) => typeof x === 'number' && Number.isFinite(x));
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs) => (xs.length ? sum(xs) / xs.length : NaN);

export const variance = (xs) => {
    const n = xs.length;
    if (n < 2) return NaN;
    const m = mean(xs);
    return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1);
};
export const sd = (xs) => Math.sqrt(variance(xs));

// quantile "tipo 7" (default di R ed Excel)
export const quantile = (xs, p) => {
    const s = [...xs].sort((a, b) => a - b);
    if (!s.length) return NaN;
    const h = (s.length - 1) * p;
    const lo = Math.floor(h);
    return s[lo] + (h - lo) * ((s[Math.min(lo + 1, s.length - 1)] ?? s[lo]) - s[lo]);
};
export const median = (xs) => quantile(xs, 0.5);

// asimmetria e curtosi in eccesso "campionarie" (come SPSS / Excel)
export const skewness = (xs) => {
    const n = xs.length;
    if (n < 3) return NaN;
    const m = mean(xs);
    const s = sd(xs);
    return (n / ((n - 1) * (n - 2))) * xs.reduce((a, x) => a + ((x - m) / s) ** 3, 0);
};
export const kurtosis = (xs) => {
    const n = xs.length;
    if (n < 4) return NaN;
    const m = mean(xs);
    const s = sd(xs);
    const s4 = xs.reduce((a, x) => a + ((x - m) / s) ** 4, 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * s4 - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
};

// riepilogo completo di una variabile numerica
export const describe = (raw) => {
    const total = (raw || []).length;
    const xs = clean(raw);
    const n = xs.length;
    const m = mean(xs);
    const s = sd(xs);
    const se = s / Math.sqrt(n);
    const tq = n > 1 ? tInv(0.975, n - 1) : NaN;
    return {
        n,
        missing: total - n,
        mean: m,
        sd: s,
        se,
        ci95: [m - tq * se, m + tq * se],
        median: median(xs),
        q1: quantile(xs, 0.25),
        q3: quantile(xs, 0.75),
        min: n ? Math.min(...xs) : NaN,
        max: n ? Math.max(...xs) : NaN,
        skewness: skewness(xs),
        kurtosis: kurtosis(xs),
        cv: m ? (s / Math.abs(m)) * 100 : NaN,
    };
};

// frequenze di una variabile categorica (vuoti contati a parte)
export const frequencies = (raw) => {
    const counts = new Map();
    let missing = 0;
    (raw || []).forEach((v) => {
        if (v === null || v === undefined || v === '') missing++;
        else counts.set(String(v), (counts.get(String(v)) || 0) + 1);
    });
    const n = [...counts.values()].reduce((a, b) => a + b, 0);
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count, pct: n ? (count / n) * 100 : 0 }));
    return { n, missing, rows };
};

// ranghi medi (gestisce i pari merito); restituisce anche la correzione per i ties
export const rank = (xs) => {
    const idx = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(xs.length);
    let tieSum = 0;
    for (let i = 0; i < idx.length; ) {
        let j = i;
        while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
        const avg = (i + j) / 2 + 1;
        for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
        const t = j - i + 1;
        tieSum += t ** 3 - t;
        i = j + 1;
    }
    return { ranks: r, tieSum };
};
