import React from 'react';
import { clean, quantile } from '../logic/stats/descriptive';
import { fmt } from '../logic/report';

// Grafici SVG leggeri (niente librerie): istogramma, boxplot per gruppi, dispersione, prima/dopo.
const W = 520;
const H = 220;
const PAD = { l: 44, r: 12, t: 12, b: 30 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;
const INK = 'var(--ink)';
const ACC = 'var(--accent)';

const ticks = (lo, hi, n = 4) => Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n);
const extent = (xs) => {
    let lo = Math.min(...xs);
    let hi = Math.max(...xs);
    if (lo === hi) {
        lo -= 1;
        hi += 1;
    }
    const pad = (hi - lo) * 0.05;
    return [lo - pad, hi + pad];
};

const YAxis = ({ lo, hi, y }) =>
    ticks(lo, hi).map((t) => (
        <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end">
                {fmt(t, Math.abs(hi - lo) < 10 ? 1 : 0)}
            </text>
        </g>
    ));

export const Histogram = ({ values }) => {
    const xs = clean(values);
    if (xs.length < 2) return null;
    const [lo, hi] = extent(xs);
    const k = Math.max(4, Math.min(20, Math.ceil(Math.log2(xs.length) + 1))); // regola di Sturges
    const bw = (hi - lo) / k;
    const bins = Array.from({ length: k }, (_, i) => xs.filter((x) => x >= lo + i * bw && (i === k - 1 ? x <= hi : x < lo + (i + 1) * bw)).length);
    const top = Math.max(...bins);
    const x = (v) => PAD.l + ((v - lo) / (hi - lo)) * IW;
    const y = (c) => PAD.t + IH - (c / top) * IH;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="rs-chart" role="img" aria-label="Istogramma">
            <YAxis lo={0} hi={top} y={y} />
            {bins.map((c, i) => (
                <rect key={i} x={x(lo + i * bw) + 1} y={y(c)} width={Math.max(0, x(lo + bw) - x(lo) - 2)} height={PAD.t + IH - y(c)} fill={ACC} opacity=".75" rx="2" />
            ))}
            {ticks(lo, hi).map((t) => (
                <text key={t} x={x(t)} y={H - 10} textAnchor="middle">
                    {fmt(t, hi - lo < 10 ? 1 : 0)}
                </text>
            ))}
        </svg>
    );
};

// groups: [{ name, values }]
export const BoxPlot = ({ groups }) => {
    const gs = groups.map((g) => ({ name: g.name, x: clean(g.values) })).filter((g) => g.x.length);
    if (!gs.length) return null;
    const [lo, hi] = extent(gs.flatMap((g) => g.x));
    const y = (v) => PAD.t + IH - ((v - lo) / (hi - lo)) * IH;
    const slot = IW / gs.length;
    const bw = Math.min(70, slot * 0.5);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="rs-chart" role="img" aria-label="Boxplot per gruppo">
            <YAxis lo={lo} hi={hi} y={y} />
            {gs.map((g, i) => {
                const cx = PAD.l + slot * (i + 0.5);
                const q1 = quantile(g.x, 0.25);
                const q3 = quantile(g.x, 0.75);
                const md = quantile(g.x, 0.5);
                const iqr = q3 - q1;
                const inside = g.x.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
                const wlo = Math.min(...inside);
                const whi = Math.max(...inside);
                const out = g.x.filter((v) => v < wlo || v > whi);
                return (
                    <g key={g.name}>
                        <line x1={cx} x2={cx} y1={y(whi)} y2={y(wlo)} stroke={INK} />
                        <rect x={cx - bw / 2} y={y(q3)} width={bw} height={Math.max(1, y(q1) - y(q3))} fill="var(--surface)" stroke={INK} rx="3" />
                        <line x1={cx - bw / 2} x2={cx + bw / 2} y1={y(md)} y2={y(md)} stroke={ACC} strokeWidth="2.5" />
                        {out.map((v, j) => (
                            <circle key={j} cx={cx} cy={y(v)} r="3" fill="none" stroke={INK} />
                        ))}
                        <text x={cx} y={H - 10} textAnchor="middle">
                            {g.name.length > 14 ? g.name.slice(0, 13) + '…' : g.name} (n={g.x.length})
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// punti + retta di regressione opzionale (line = { a, b } con y = a + b·x)
export const Scatter = ({ xs: rx, ys: ry, line }) => {
    const pts = (rx || []).map((x, i) => [x, ry[i]]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
    if (pts.length < 2) return null;
    const [xl, xh] = extent(pts.map((p) => p[0]));
    const [yl, yh] = extent(pts.map((p) => p[1]));
    const x = (v) => PAD.l + ((v - xl) / (xh - xl)) * IW;
    const y = (v) => PAD.t + IH - ((v - yl) / (yh - yl)) * IH;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="rs-chart" role="img" aria-label="Grafico di dispersione">
            <YAxis lo={yl} hi={yh} y={y} />
            {ticks(xl, xh).map((t) => (
                <text key={t} x={x(t)} y={H - 10} textAnchor="middle">
                    {fmt(t, xh - xl < 10 ? 1 : 0)}
                </text>
            ))}
            {line && <line x1={x(xl)} x2={x(xh)} y1={y(line.a + line.b * xl)} y2={y(line.a + line.b * xh)} stroke={ACC} strokeWidth="2" clipPath="url(#rs-clip)" />}
            <clipPath id="rs-clip">
                <rect x={PAD.l} y={PAD.t} width={IW} height={IH} />
            </clipPath>
            {pts.map(([a, b], i) => (
                <circle key={i} cx={x(a)} cy={y(b)} r="3.5" fill={INK} opacity=".7" />
            ))}
        </svg>
    );
};

// una linea per paziente dalla prima all'ultima visita
export const PrePost = ({ pre, post, names = ['Prima', 'Dopo'] }) => {
    const pairs = pre.map((a, i) => [a, post[i]]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
    if (!pairs.length) return null;
    const [lo, hi] = extent(pairs.flat());
    const y = (v) => PAD.t + IH - ((v - lo) / (hi - lo)) * IH;
    const x0 = PAD.l + IW * 0.25;
    const x1 = PAD.l + IW * 0.75;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="rs-chart" role="img" aria-label="Prima e dopo per paziente">
            <YAxis lo={lo} hi={hi} y={y} />
            {pairs.map(([a, b], i) => (
                <g key={i}>
                    <line x1={x0} x2={x1} y1={y(a)} y2={y(b)} stroke={b < a ? 'var(--ok)' : b > a ? 'var(--bad)' : INK} opacity=".55" />
                    <circle cx={x0} cy={y(a)} r="3" fill={INK} />
                    <circle cx={x1} cy={y(b)} r="3" fill={INK} />
                </g>
            ))}
            <text x={x0} y={H - 10} textAnchor="middle">
                {names[0]}
            </text>
            <text x={x1} y={H - 10} textAnchor="middle">
                {names[1]}
            </text>
        </svg>
    );
};
