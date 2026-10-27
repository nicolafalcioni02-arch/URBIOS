// Formattazione dei risultati: numeri all'italiana e frase pronta da incollare nella tesi (stile APA 7, in italiano).
import { shapiroWilk, tTestIndependent, mannWhitney, anovaOneWay, kruskalWallis, levene, tTestPaired, wilcoxonSigned } from './stats/tests';
import { clean } from './stats/descriptive';

export const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
export const fmtInt = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString('it-IT') : '—');

// APA: p senza zero iniziale, "< ,001" sotto la soglia
export const fmtP = (p) => {
    if (!Number.isFinite(p)) return '—';
    if (p < 0.001) return '< ,001';
    return '= ' + p.toFixed(3).replace(/^0/, '').replace('.', ',');
};
const fmtDf = (df) => (Array.isArray(df) ? df.map((x) => fmtDfOne(x)).join(', ') : fmtDfOne(df));
const fmtDfOne = (x) => (Number.isInteger(x) ? String(x) : fmt(x, 2));

export const stars = (p) => (p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : 'n.s.');

// lettura indicativa della grandezza dell'effetto (soglie di Cohen)
export const effectWord = (effect) => {
    if (!effect || !Number.isFinite(effect.value)) return '';
    const v = Math.abs(effect.value);
    const scales = {
        'd di Cohen': [0.2, 0.5, 0.8],
        'dz di Cohen': [0.2, 0.5, 0.8],
        r: [0.1, 0.3, 0.5],
        'r²': [0.01, 0.09, 0.25],
        'η²': [0.01, 0.06, 0.14],
        'ε²': [0.01, 0.06, 0.14],
        'R²': [0.02, 0.13, 0.26],
        'V di Cramér': [0.1, 0.3, 0.5],
    };
    const s = scales[effect.name];
    if (!s) return '';
    return v < s[0] ? 'trascurabile' : v < s[1] ? 'piccolo' : v < s[2] ? 'medio' : 'grande';
};

// "t(17,82) = −5,57, p < ,001, d = −2,49"
export const apaLine = (r) => {
    if (!r || r.error) return '';
    const parts = [];
    if (r.stat) {
        const df = r.df !== undefined ? `(${fmtDf(r.df)}${r.stat.name === 'χ²' && r.n ? `, N = ${r.n}` : ''})` : '';
        parts.push(`${r.stat.name}${df} = ${fmt(r.stat.value, r.stat.name === 'U' || r.stat.name === 'V' ? 1 : 2)}`);
    }
    if (Number.isFinite(r.z)) parts.push(`z = ${fmt(r.z)}`);
    parts.push(`p ${fmtP(r.p)}`);
    if (r.effect && Number.isFinite(r.effect.value)) parts.push(`${r.effect.name} = ${fmt(r.effect.value)}`);
    if (r.ci) parts.push(`IC 95% [${fmt(r.ci[0])}; ${fmt(r.ci[1])}]`);
    return parts.join(', ');
};

// frase in prosa per il capitolo "Risultati"
export const sentence = (r, { outcome = 'la variabile', alpha = 0.05 } = {}) => {
    if (!r || r.error) return '';
    const sig = r.p < alpha;
    const eff = effectWord(r.effect);
    const effTxt = eff ? ` L’effetto è ${eff}.` : '';
    const g = r.groups || [];
    const desc = g.map((x) => `${x.name}: M = ${fmt(x.mean)}, DS = ${fmt(x.sd)}, n = ${x.n}`).join('; ');
    const descTxt = desc ? ` (${desc})` : '';
    if (/correlazione/i.test(r.test))
        return `${r.test}: ${sig ? 'è emersa una correlazione statisticamente significativa' : 'non è emersa una correlazione statisticamente significativa'} (${apaLine(r)}).${effTxt}`;
    if (/regressione/i.test(r.test))
        return `Il modello di ${r.test.toLowerCase()} ${sig ? 'è statisticamente significativo' : 'non è statisticamente significativo'} (${apaLine(r)}) e spiega una quota pari al ${fmt(r.r2 * 100, 1)}% della varianza di ${outcome} (R² corretto = ${fmt(r.adjR2)}).`;
    if (/chi quadro|fisher/i.test(r.test)) return `${r.test}: l’associazione ${sig ? 'è statisticamente significativa' : 'non è statisticamente significativa'} (${apaLine(r)}).${effTxt}`;
    return `${r.test} su ${outcome}${descTxt}: la differenza ${sig ? 'è statisticamente significativa' : 'non è statisticamente significativa'} (${apaLine(r)}).${effTxt}`;
};

// ---------------- scelta guidata del test ----------------

const normalityOf = (groups) =>
    groups.map((g) => {
        const x = clean(g.values);
        const sw = x.length >= 3 ? shapiroWilk(x) : null;
        return { name: g.name, n: x.length, sw, normal: sw && !sw.error ? sw.p >= 0.05 : null };
    });

// confronto tra gruppi indipendenti: controlla le assunzioni e propone il test adatto (con l'alternativa)
export const compareGroups = (groups, { force = 'auto' } = {}) => {
    const gs = groups.filter((g) => clean(g.values).length > 0);
    if (gs.length < 2) return { error: 'Servono almeno 2 gruppi con dati.' };
    const checks = normalityOf(gs);
    const allNormal = checks.every((c) => c.normal === true || c.n >= 30);
    const lev = levene(gs);
    const parametric = force === 'auto' ? allNormal : force === 'parametric';
    const why = [];
    checks.forEach((c) => {
        if (c.normal === null) why.push(`${c.name}: troppo pochi dati per verificare la normalità (n = ${c.n}).`);
        else why.push(`${c.name}: Shapiro-Wilk W = ${fmt(c.sw.stat.value, 3)}, p ${fmtP(c.sw.p)} → ${c.normal ? 'compatibile con la normale' : 'non normale'}${!c.normal && c.n >= 30 ? ' (ma n ≥ 30: il test parametrico resta robusto)' : ''}.`);
    });
    if (!lev.error) why.push(`Levene (varianze): F(${fmtDf(lev.df)}) = ${fmt(lev.stat.value)}, p ${fmtP(lev.p)}${gs.length === 2 ? ' — il t di Welch non richiede varianze uguali.' : lev.p < 0.05 ? ' → varianze diverse: interpretare l’ANOVA con cautela.' : '.'}`);
    const names = gs.map((g) => g.name);
    let main;
    let alt;
    if (gs.length === 2) {
        const t = tTestIndependent(gs[0].values, gs[1].values, { names });
        const u = mannWhitney(gs[0].values, gs[1].values, { names });
        [main, alt] = parametric ? [t, u] : [u, t];
    } else {
        const a = anovaOneWay(gs);
        const k = kruskalWallis(gs);
        [main, alt] = parametric ? [a, k] : [k, a];
    }
    return { main, alt, checks: why, auto: force === 'auto', parametric };
};

// confronto appaiato (prima vs dopo)
export const comparePaired = (pre, post, { force = 'auto', names = ['Prima visita', 'Ultima visita'] } = {}) => {
    const diffs = pre.map((x, i) => post[i] - x).filter(Number.isFinite);
    if (diffs.length < 2) return { error: 'Servono almeno 2 pazienti con il valore misurato alla prima e all’ultima visita.' };
    const sw = diffs.length >= 3 ? shapiroWilk(diffs) : null;
    const normal = sw && !sw.error ? sw.p >= 0.05 || diffs.length >= 30 : false;
    const parametric = force === 'auto' ? normal : force === 'parametric';
    const why = [sw && !sw.error ? `Differenze: Shapiro-Wilk W = ${fmt(sw.stat.value, 3)}, p ${fmtP(sw.p)} → ${sw.p >= 0.05 ? 'compatibili con la normale' : 'non normali'}.` : `Troppo poche coppie per verificare la normalità (n = ${diffs.length}).`];
    const t = tTestPaired(pre, post, { names });
    const w = wilcoxonSigned(pre, post, { names });
    const [main, alt] = parametric ? [t, w] : [w, t];
    return { main, alt, checks: why, auto: force === 'auto', parametric };
};
