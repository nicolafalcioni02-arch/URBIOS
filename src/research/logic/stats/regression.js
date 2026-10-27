// Regressione lineare (semplice e multipla) con minimi quadrati ordinari. Funzione pura.
import { fSf, tInv, tTwoTailed } from './distributions.js';
import { mean } from './descriptive.js';

// inversa di matrice quadrata (Gauss-Jordan con pivot parziale); null se singolare
const invert = (M) => {
    const n = M.length;
    const A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
        let piv = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
        if (Math.abs(A[piv][c]) < 1e-12) return null;
        [A[c], A[piv]] = [A[piv], A[c]];
        const d = A[c][c];
        for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
        for (let r = 0; r < n; r++) {
            if (r === c) continue;
            const f = A[r][c];
            if (f) for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j];
        }
    }
    return A.map((r) => r.slice(n));
};

// y: array numeri; X: { nome: array numeri } (stessa lunghezza). Le righe con un valore mancante sono escluse.
export const linearRegression = (y, X) => {
    const names = Object.keys(X);
    const rows = [];
    (y || []).forEach((yi, i) => {
        const xi = names.map((k) => X[k][i]);
        if (Number.isFinite(yi) && xi.every(Number.isFinite)) rows.push([yi, xi]);
    });
    const n = rows.length;
    const p = names.length + 1;
    if (n <= p) return { test: 'Regressione lineare', error: `Servono più di ${p} osservazioni complete (ora ${n})` };
    const D = rows.map(([, xi]) => [1, ...xi]);
    const Y = rows.map(([yi]) => yi);
    const XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => D.reduce((s, r) => s + r[a] * r[b], 0)));
    const inv = invert(XtX);
    if (!inv) return { test: 'Regressione lineare', error: 'Predittori collineari (uno è combinazione degli altri)' };
    const XtY = Array.from({ length: p }, (_, a) => D.reduce((s, r, i) => s + r[a] * Y[i], 0));
    const beta = inv.map((r) => r.reduce((s, v, j) => s + v * XtY[j], 0));
    const fitted = D.map((r) => r.reduce((s, v, j) => s + v * beta[j], 0));
    const resid = Y.map((v, i) => v - fitted[i]);
    const ssr = resid.reduce((s, e) => s + e * e, 0);
    const my = mean(Y);
    const sst = Y.reduce((s, v) => s + (v - my) ** 2, 0);
    const dfRes = n - p;
    const sigma2 = ssr / dfRes;
    const tq = tInv(0.975, dfRes);
    const coefs = beta.map((b, j) => {
        const se = Math.sqrt(sigma2 * inv[j][j]);
        const t = b / se;
        return { name: j === 0 ? '(Intercetta)' : names[j - 1], b, se, t, p: tTwoTailed(t, dfRes), ci: [b - tq * se, b + tq * se] };
    });
    const r2 = 1 - ssr / sst;
    const dfModel = p - 1;
    const F = (sst - ssr) / dfModel / sigma2;
    return {
        test: names.length === 1 ? 'Regressione lineare semplice' : 'Regressione lineare multipla',
        stat: { name: 'F', value: F },
        df: [dfModel, dfRes],
        p: fSf(F, dfModel, dfRes),
        n,
        r2,
        adjR2: 1 - (1 - r2) * ((n - 1) / dfRes),
        rmse: Math.sqrt(sigma2),
        coefs,
        effect: { name: 'R²', value: r2 },
        fitted,
        resid,
        notes: n < 10 * names.length ? ['Poche osservazioni per predittore (regola indicativa: almeno 10).'] : [],
    };
};
