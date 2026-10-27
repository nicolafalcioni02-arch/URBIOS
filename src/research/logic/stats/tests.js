// Test d'ipotesi (funzioni pure). Ogni test restituisce un oggetto "risultato" con la stessa forma:
// { test, stat: { name, value }, df, p, effect: { name, value }, ci?, groups?, notes: [] }
// così report.js può scrivere la frase in stile APA e la UI può mostrarlo senza casi speciali.
import { chi2Sf, fSf, normCdf, normInv, tInv, tTwoTailed } from './distributions.js';
import { clean, mean, median, rank, sd, sum, variance } from './descriptive.js';

const groupSummary = (name, xs) => ({ name, n: xs.length, mean: mean(xs), sd: sd(xs), median: median(xs) });

// ---------------- normalità ----------------

// Shapiro-Wilk, algoritmo di Royston (AS R94, lo stesso di R `shapiro.test`), 3 ≤ n ≤ 5000
export const shapiroWilk = (raw) => {
    const x = clean(raw).sort((a, b) => a - b);
    const n = x.length;
    if (n < 3 || n > 5000) return { test: 'Shapiro-Wilk', error: 'Servono da 3 a 5000 valori' };
    const range = x[n - 1] - x[0];
    if (range < 1e-19) return { test: 'Shapiro-Wilk', error: 'Tutti i valori sono uguali' };
    const poly = (c, v) => c.reduce((acc, ci, j) => acc + ci * v ** j, 0);
    const nn2 = Math.floor(n / 2);
    const a = new Array(nn2 + 1).fill(0); // 1-indicizzato
    if (n === 3) a[1] = Math.SQRT1_2;
    else {
        const m = [0];
        let summ2 = 0;
        for (let i = 1; i <= nn2; i++) {
            m[i] = normInv((i - 0.375) / (n + 0.25));
            summ2 += m[i] ** 2;
        }
        summ2 *= 2;
        const ssumm2 = Math.sqrt(summ2);
        const rsn = 1 / Math.sqrt(n);
        const a1 = poly([0, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056], rsn) - m[1] / ssumm2;
        let i1;
        let fac;
        if (n > 5) {
            i1 = 3;
            const a2 = -m[2] / ssumm2 + poly([0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633], rsn);
            fac = Math.sqrt((summ2 - 2 * m[1] ** 2 - 2 * m[2] ** 2) / (1 - 2 * a1 ** 2 - 2 * a2 ** 2));
            a[2] = a2;
        } else {
            i1 = 2;
            fac = Math.sqrt((summ2 - 2 * m[1] ** 2) / (1 - 2 * a1 ** 2));
        }
        a[1] = a1;
        for (let i = i1; i <= nn2; i++) a[i] = -m[i] / fac;
    }
    let num = 0;
    for (let i = 1; i <= nn2; i++) num += a[i] * (x[n - i] - x[i - 1]);
    const mu = mean(x);
    const ss = x.reduce((acc, v) => acc + (v - mu) ** 2, 0);
    const w = Math.min(1, (num * num) / ss);

    let p;
    if (n === 3) p = Math.max(0, (6 / Math.PI) * (Math.asin(Math.sqrt(w)) - Math.PI / 3));
    else {
        let y = Math.log(1 - w);
        const lx = Math.log(n);
        let m;
        let s;
        if (n <= 11) {
            const gamma = -2.273 + 0.459 * n;
            if (y >= gamma) p = 1e-99;
            else {
                y = -Math.log(gamma - y);
                m = poly([0.544, -0.39978, 0.025054, -6.714e-4], n);
                s = Math.exp(poly([1.3822, -0.77857, 0.062767, -0.0020322], n));
            }
        } else {
            m = poly([-1.5861, -0.31082, -0.083751, 0.0038915], lx);
            s = Math.exp(poly([-0.4803, -0.082676, 0.0030302], lx));
        }
        if (p === undefined) p = 1 - normCdf((y - m) / s);
    }
    return { test: 'Shapiro-Wilk', stat: { name: 'W', value: w }, n, p, notes: [] };
};

// ---------------- confronto di due gruppi ----------------

// t di Student per campioni indipendenti: restituisce Welch (default consigliato) e la versione a varianze uguali
export const tTestIndependent = (rawA, rawB, { names = ['A', 'B'], welch = true } = {}) => {
    const a = clean(rawA);
    const b = clean(rawB);
    const n1 = a.length;
    const n2 = b.length;
    if (n1 < 2 || n2 < 2) return { test: 't di Student', error: 'Servono almeno 2 valori per gruppo' };
    const m1 = mean(a);
    const m2 = mean(b);
    const v1 = variance(a);
    const v2 = variance(b);
    const diff = m1 - m2;
    const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    let se;
    let df;
    if (welch) {
        se = Math.sqrt(v1 / n1 + v2 / n2);
        df = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
    } else {
        se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
        df = n1 + n2 - 2;
    }
    const t = diff / se;
    const tq = tInv(0.975, df);
    const d = diff / Math.sqrt(sp2);
    const g = d * (1 - 3 / (4 * (n1 + n2) - 9)); // g di Hedges
    return {
        test: welch ? 't di Welch (campioni indipendenti)' : 't di Student (campioni indipendenti)',
        stat: { name: 't', value: t },
        df,
        p: tTwoTailed(t, df),
        diff,
        ci: [diff - tq * se, diff + tq * se],
        effect: { name: 'd di Cohen', value: d, extra: { name: 'g di Hedges', value: g } },
        groups: [groupSummary(names[0], a), groupSummary(names[1], b)],
        notes: [],
    };
};

// t per dati appaiati (es. prima visita vs ultima)
export const tTestPaired = (rawA, rawB, { names = ['Prima', 'Dopo'] } = {}) => {
    const pairs = (rawA || []).map((x, i) => [x, (rawB || [])[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    const n = pairs.length;
    if (n < 2) return { test: 't per dati appaiati', error: 'Servono almeno 2 coppie complete' };
    const dif = pairs.map(([x, y]) => y - x);
    const md = mean(dif);
    const sdd = sd(dif);
    const se = sdd / Math.sqrt(n);
    const df = n - 1;
    const t = md / se;
    const tq = tInv(0.975, df);
    return {
        test: 't per dati appaiati',
        stat: { name: 't', value: t },
        df,
        p: tTwoTailed(t, df),
        diff: md,
        ci: [md - tq * se, md + tq * se],
        effect: { name: 'dz di Cohen', value: md / sdd },
        groups: [groupSummary(names[0], pairs.map((p) => p[0])), groupSummary(names[1], pairs.map((p) => p[1]))],
        notes: [],
    };
};

// t a un campione contro un valore di riferimento
export const tTestOneSample = (raw, mu0 = 0) => {
    const x = clean(raw);
    const n = x.length;
    if (n < 2) return { test: 't a un campione', error: 'Servono almeno 2 valori' };
    const m = mean(x);
    const s = sd(x);
    const se = s / Math.sqrt(n);
    const t = (m - mu0) / se;
    const df = n - 1;
    const tq = tInv(0.975, df);
    return {
        test: `t a un campione (μ₀ = ${mu0})`,
        stat: { name: 't', value: t },
        df,
        p: tTwoTailed(t, df),
        diff: m - mu0,
        ci: [m - mu0 - tq * se, m - mu0 + tq * se],
        effect: { name: 'd di Cohen', value: (m - mu0) / s },
        notes: [],
    };
};

// Mann-Whitney U (approssimazione normale con correzione per continuità e pari merito, come SPSS)
export const mannWhitney = (rawA, rawB, { names = ['A', 'B'] } = {}) => {
    const a = clean(rawA);
    const b = clean(rawB);
    const n1 = a.length;
    const n2 = b.length;
    if (n1 < 1 || n2 < 1) return { test: 'Mann-Whitney U', error: 'Servono valori in entrambi i gruppi' };
    const { ranks, tieSum } = rank([...a, ...b]);
    const r1 = sum(ranks.slice(0, n1));
    const u1 = r1 - (n1 * (n1 + 1)) / 2;
    const u = Math.min(u1, n1 * n2 - u1);
    const N = n1 + n2;
    const mu = (n1 * n2) / 2;
    const sigma = Math.sqrt(((n1 * n2) / 12) * (N + 1 - tieSum / (N * (N - 1))));
    const z = sigma > 0 ? (Math.abs(u1 - mu) - 0.5) / sigma : 0;
    const zs = Math.sign(u1 - mu) * Math.max(0, z);
    const notes = [];
    if (n1 < 10 || n2 < 10) notes.push('Gruppi piccoli: il p-value usa l’approssimazione normale (indicativo).');
    return {
        test: 'Mann-Whitney U',
        stat: { name: 'U', value: u },
        z: zs,
        p: 2 * (1 - normCdf(Math.abs(zs))),
        effect: { name: 'r', value: Math.abs(zs) / Math.sqrt(N) },
        groups: [groupSummary(names[0], a), groupSummary(names[1], b)],
        notes,
    };
};

// Wilcoxon per dati appaiati (ranghi con segno, differenze nulle escluse, approssimazione normale)
export const wilcoxonSigned = (rawA, rawB, { names = ['Prima', 'Dopo'] } = {}) => {
    const pairs = (rawA || []).map((x, i) => [x, (rawB || [])[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    const d = pairs.map(([x, y]) => y - x).filter((v) => v !== 0);
    const n = d.length;
    if (n < 1) return { test: 'Wilcoxon (ranghi con segno)', error: 'Nessuna differenza diversa da zero' };
    const { ranks, tieSum } = rank(d.map(Math.abs));
    const wPlus = sum(ranks.filter((_, i) => d[i] > 0));
    const mu = (n * (n + 1)) / 4;
    const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24 - tieSum / 48);
    const z = sigma > 0 ? (Math.sign(wPlus - mu) * Math.max(0, Math.abs(wPlus - mu) - 0.5)) / sigma : 0;
    const notes = [];
    if (n < 10) notes.push('Poche coppie: il p-value usa l’approssimazione normale (indicativo).');
    if (pairs.length > n) notes.push(`${pairs.length - n} coppie con differenza nulla escluse.`);
    return {
        test: 'Wilcoxon (ranghi con segno)',
        stat: { name: 'V', value: wPlus },
        z,
        p: 2 * (1 - normCdf(Math.abs(z))),
        effect: { name: 'r', value: Math.abs(z) / Math.sqrt(n) },
        groups: [groupSummary(names[0], pairs.map((p) => p[0])), groupSummary(names[1], pairs.map((p) => p[1]))],
        notes,
    };
};

// ---------------- più di due gruppi ----------------

// groups: [{ name, values }]
export const anovaOneWay = (groups) => {
    const gs = groups.map((g) => ({ name: g.name, x: clean(g.values) })).filter((g) => g.x.length > 0);
    const k = gs.length;
    const all = gs.flatMap((g) => g.x);
    const N = all.length;
    if (k < 2 || N - k < 1) return { test: 'ANOVA a una via', error: 'Servono almeno 2 gruppi con dati' };
    const gm = mean(all);
    const ssb = gs.reduce((a, g) => a + g.x.length * (mean(g.x) - gm) ** 2, 0);
    const ssw = gs.reduce((a, g) => a + g.x.reduce((b, v) => b + (v - mean(g.x)) ** 2, 0), 0);
    const df1 = k - 1;
    const df2 = N - k;
    const F = ssb / df1 / (ssw / df2);
    return {
        test: 'ANOVA a una via',
        stat: { name: 'F', value: F },
        df: [df1, df2],
        p: fSf(F, df1, df2),
        effect: { name: 'η²', value: ssb / (ssb + ssw) },
        groups: gs.map((g) => groupSummary(g.name, g.x)),
        notes: [],
    };
};

// Levene (variante di Brown-Forsythe, centrata sulla mediana: robusta, default di R car::leveneTest)
export const levene = (groups) => {
    const dev = groups.map((g) => {
        const x = clean(g.values);
        const md = median(x);
        return { name: g.name, values: x.map((v) => Math.abs(v - md)) };
    });
    const r = anovaOneWay(dev);
    if (r.error) return { test: 'Levene', error: r.error };
    return { test: 'Levene (omogeneità delle varianze)', stat: r.stat, df: r.df, p: r.p, notes: [] };
};

export const kruskalWallis = (groups) => {
    const gs = groups.map((g) => ({ name: g.name, x: clean(g.values) })).filter((g) => g.x.length > 0);
    const k = gs.length;
    const all = gs.flatMap((g) => g.x);
    const N = all.length;
    if (k < 2) return { test: 'Kruskal-Wallis', error: 'Servono almeno 2 gruppi con dati' };
    const { ranks, tieSum } = rank(all);
    let off = 0;
    let h = 0;
    gs.forEach((g) => {
        const r = sum(ranks.slice(off, off + g.x.length));
        h += (r * r) / g.x.length;
        off += g.x.length;
    });
    h = (12 / (N * (N + 1))) * h - 3 * (N + 1);
    const corr = 1 - tieSum / (N ** 3 - N);
    if (corr > 0) h /= corr;
    return {
        test: 'Kruskal-Wallis',
        stat: { name: 'H', value: h },
        df: k - 1,
        p: chi2Sf(h, k - 1),
        effect: { name: 'ε²', value: h / ((N * N - 1) / (N + 1)) },
        groups: gs.map((g) => groupSummary(g.name, g.x)),
        notes: [],
    };
};

// ---------------- variabili categoriche ----------------

// tabella di contingenza da due colonne
export const crosstab = (rawA, rawB) => {
    const ok = (v) => v !== null && v !== undefined && v !== '';
    const pairs = (rawA || []).map((a, i) => [a, (rawB || [])[i]]).filter(([a, b]) => ok(a) && ok(b));
    const rows = [...new Set(pairs.map((p) => String(p[0])))].sort();
    const cols = [...new Set(pairs.map((p) => String(p[1])))].sort();
    const table = rows.map((r) => cols.map((c) => pairs.filter((p) => String(p[0]) === r && String(p[1]) === c).length));
    return { rows, cols, table, n: pairs.length };
};

const lfact = (n) => {
    let s = 0;
    for (let i = 2; i <= n; i++) s += Math.log(i);
    return s;
};

// Fisher esatto per tabelle 2x2 (bilaterale, come R)
export const fisherExact = ([[a, b], [c, d]]) => {
    const r1 = a + b;
    const r2 = c + d;
    const c1 = a + c;
    const n = r1 + r2;
    const prob = (x) => Math.exp(lfact(r1) + lfact(r2) + lfact(c1) + lfact(n - c1) - lfact(n) - lfact(x) - lfact(r1 - x) - lfact(c1 - x) - lfact(r2 - c1 + x));
    const pObs = prob(a);
    let p = 0;
    for (let x = Math.max(0, c1 - r2); x <= Math.min(r1, c1); x++) {
        const px = prob(x);
        if (px <= pObs * (1 + 1e-7)) p += px;
    }
    const or = b * c === 0 ? Infinity : (a * d) / (b * c);
    return { test: 'Fisher esatto', p: Math.min(1, p), effect: { name: 'odds ratio', value: or }, notes: [] };
};

// chi quadro di indipendenza (+ Fisher automatico se 2x2 con attese < 5)
export const chiSquare = ({ table, rows, cols }) => {
    const R = table.length;
    const C = table[0] ? table[0].length : 0;
    if (R < 2 || C < 2) return { test: 'Chi quadro', error: 'Servono almeno 2 categorie per variabile' };
    const rs = table.map((r) => sum(r));
    const cs = table[0].map((_, j) => sum(table.map((r) => r[j])));
    const N = sum(rs);
    let chi = 0;
    let low = 0;
    const expected = table.map((r, i) =>
        r.map((o, j) => {
            const e = (rs[i] * cs[j]) / N;
            if (e < 5) low++;
            chi += e > 0 ? (o - e) ** 2 / e : 0;
            return e;
        })
    );
    const df = (R - 1) * (C - 1);
    const notes = [];
    const res = {
        test: 'Chi quadro di indipendenza',
        stat: { name: 'χ²', value: chi },
        df,
        n: N,
        p: chi2Sf(chi, df),
        effect: { name: 'V di Cramér', value: Math.sqrt(chi / (N * Math.min(R - 1, C - 1))) },
        expected,
        rows,
        cols,
        table,
        notes,
    };
    if (low > 0) {
        notes.push(`${low} celle su ${R * C} hanno frequenza attesa < 5.`);
        if (R === 2 && C === 2) {
            const f = fisherExact(table);
            res.fisher = f;
            notes.push(`Usare il test esatto di Fisher: p = ${f.p.toFixed(4)}.`);
        }
    }
    return res;
};

// ---------------- correlazione ----------------

const pairsOf = (rawX, rawY) => (rawX || []).map((x, i) => [x, (rawY || [])[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

const pearsonCore = (xs, ys) => {
    const mx = mean(xs);
    const my = mean(ys);
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    xs.forEach((x, i) => {
        sxy += (x - mx) * (ys[i] - my);
        sxx += (x - mx) ** 2;
        syy += (ys[i] - my) ** 2;
    });
    return sxy / Math.sqrt(sxx * syy);
};

export const pearson = (rawX, rawY) => {
    const p = pairsOf(rawX, rawY);
    const n = p.length;
    if (n < 3) return { test: 'Correlazione di Pearson', error: 'Servono almeno 3 coppie complete' };
    const r = pearsonCore(p.map((q) => q[0]), p.map((q) => q[1]));
    const df = n - 2;
    const t = (r * Math.sqrt(df)) / Math.sqrt(Math.max(1e-300, 1 - r * r));
    const z = Math.atanh(r);
    const se = 1 / Math.sqrt(n - 3);
    const ci = n > 3 ? [Math.tanh(z - 1.959964 * se), Math.tanh(z + 1.959964 * se)] : null;
    return { test: 'Correlazione di Pearson', stat: { name: 'r', value: r }, df, n, p: Math.abs(r) >= 1 ? 0 : tTwoTailed(t, df), ci, effect: { name: 'r²', value: r * r }, notes: [] };
};

export const spearman = (rawX, rawY) => {
    const p = pairsOf(rawX, rawY);
    const n = p.length;
    if (n < 3) return { test: 'Correlazione di Spearman', error: 'Servono almeno 3 coppie complete' };
    const rho = pearsonCore(rank(p.map((q) => q[0])).ranks, rank(p.map((q) => q[1])).ranks);
    const df = n - 2;
    const t = (rho * Math.sqrt(df)) / Math.sqrt(Math.max(1e-300, 1 - rho * rho));
    const notes = n < 10 ? ['Campione piccolo: p-value approssimato con la t (indicativo).'] : [];
    return { test: 'Correlazione di Spearman', stat: { name: 'ρ', value: rho }, df, n, p: Math.abs(rho) >= 1 ? 0 : tTwoTailed(t, df), notes };
};
