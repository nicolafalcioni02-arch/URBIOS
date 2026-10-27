import React from 'react';

// Grafici in SVG puro: nitidi a qualsiasi dimensione, identici a video e in stampa, senza canvas da ridimensionare.

const fmt = (v, d = 1) => (Number.isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: d }) : '');
export { fmt };

// Ciambella: parti [{ value, color, label }], testo al centro
export const Donut = ({ parts, center, sub, size = 150, thick = 20 }) => {
    const tot = parts.reduce((a, p) => a + p.value, 0) || 1;
    const R = size / 2 - 2;
    const r = R - thick / 2;
    const C = 2 * Math.PI * r;
    let acc = 0;
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, display: 'block', margin: '0 auto' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1efec" strokeWidth={thick} />
            {parts.map((p, i) => {
                const len = (p.value / tot) * C;
                const el = (
                    <circle
                        key={i}
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={thick}
                        strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`}
                        strokeDashoffset={-acc}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        strokeLinecap="butt"
                    />
                );
                acc += len;
                return el;
            })}
            <text x={size / 2} y={size / 2 + (sub ? -2 : 6)} textAnchor="middle" style={{ font: `800 ${size * 0.17}px Inter, system-ui, sans-serif`, fill: '#1c1917' }}>
                {center}
            </text>
            {sub && (
                <text x={size / 2} y={size / 2 + size * 0.12} textAnchor="middle" style={{ font: `600 ${size * 0.07}px Inter, system-ui, sans-serif`, fill: '#78716c', letterSpacing: '.06em' }}>
                    {sub}
                </text>
            )}
        </svg>
    );
};

// Barra a fasce con il valore del paziente. bands: [{ label, max, color }] (la prima parte da `min`)
export const BandGauge = ({ value, bands, min = 0, max, unit = '', digits = 1, label, height = 64 }) => {
    const W = 320;
    const top = 26;
    const barH = 12;
    const hi = max ?? bands[bands.length - 1].max;
    const x = (v) => 6 + ((Math.max(min, Math.min(hi, v)) - min) / (hi - min)) * (W - 12);
    const band = bands.find((b) => value <= b.max) || bands[bands.length - 1];
    const vx = x(value);
    const txt = `${fmt(value, digits)}${unit}`;
    const bw = Math.max(34, txt.length * 6.6 + 14);
    const bx = Math.max(6, Math.min(W - 6 - bw, vx - bw / 2));
    return (
        <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label={`${label || ''} ${txt} ${band.label}`}>
            {bands.map((b, i) => {
                const x0 = x(i ? bands[i - 1].max : min);
                const x1 = x(b.max);
                const on = b === band;
                return (
                    <g key={b.label}>
                        <rect x={x0 + (i ? 1 : 0)} y={top} width={Math.max(0, x1 - x0 - (i ? 1 : 0))} height={barH} rx={i === 0 || i === bands.length - 1 ? 6 : 0} fill={b.color} opacity={on ? 1 : 0.45} />
                        <text x={(x0 + x1) / 2} y={top + barH + 14} textAnchor="middle" style={{ font: `${on ? 700 : 500} 9px Inter, system-ui, sans-serif`, fill: on ? '#1c1917' : '#a8a29e' }}>
                            {b.label}
                        </text>
                    </g>
                );
            })}
            <line x1={vx} x2={vx} y1={top - 4} y2={top + barH + 3} stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
            <rect x={bx} y={1} width={bw} height={19} rx={9.5} fill="#1c1917" />
            <path d={`M${vx - 4} 19.5 L${vx} 24 L${vx + 4} 19.5 Z`} fill="#1c1917" />
            <text x={bx + bw / 2} y={14.2} textAnchor="middle" style={{ font: '700 11px Inter, system-ui, sans-serif', fill: '#fff' }}>
                {txt}
            </text>
        </svg>
    );
};

// Barre orizzontali con il valore in fondo. rows: [{ label, value, value2?, color? }] (value2 = secondo lato, es. sinistro)
export const HBars = ({ rows, unit = '', color = '#0ea5e9', color2 = '#94a3b8', legend, rowH = 22 }) => {
    const W = 320;
    const L = 86;
    const R = 46;
    const max = Math.max(...rows.map((r) => Math.max(r.value || 0, r.value2 || 0)), 1);
    const pair = rows.some((r) => r.value2 > 0);
    const H = rows.length * rowH + (legend && pair ? 18 : 2);
    const bw = (v) => ((v || 0) / max) * (W - L - R);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {rows.map((r, i) => {
                const y = i * rowH;
                const th = pair ? 7 : 11;
                const val = pair && r.value2 > 0 ? `${fmt(r.value)} · ${fmt(r.value2)}` : fmt(r.value);
                return (
                    <g key={r.label}>
                        <text x={L - 8} y={y + rowH / 2 + 3.5} textAnchor="end" style={{ font: '500 10.5px Inter, system-ui, sans-serif', fill: '#57534e' }}>
                            {r.label}
                        </text>
                        <rect x={L} y={y + rowH / 2 - (pair ? th + 0.5 : th / 2)} width={W - L - R} height={pair ? th * 2 + 1 : th} rx={th / 2} fill="#f5f5f4" />
                        <rect x={L} y={y + rowH / 2 - (pair ? th + 0.5 : th / 2)} width={bw(r.value)} height={th} rx={th / 2} fill={r.color || color} />
                        {pair && r.value2 > 0 && <rect x={L} y={y + rowH / 2 + 0.5} width={bw(r.value2)} height={th} rx={th / 2} fill={color2} />}
                        <text x={W - R + 6} y={y + rowH / 2 + 3.5} style={{ font: '700 10.5px Inter, system-ui, sans-serif', fill: '#1c1917' }}>
                            {val}
                            <tspan style={{ fontWeight: 500, fill: '#a8a29e' }}> {unit}</tspan>
                        </text>
                    </g>
                );
            })}
            {legend && pair && (
                <g transform={`translate(${L}, ${H - 8})`}>
                    <rect width="8" height="8" y="-7" rx="2" fill={color} />
                    <text x="12" style={{ font: '500 9px Inter, sans-serif', fill: '#78716c' }}>
                        {legend[0]}
                    </text>
                    <rect x="70" width="8" height="8" y="-7" rx="2" fill={color2} />
                    <text x="82" style={{ font: '500 9px Inter, sans-serif', fill: '#78716c' }}>
                        {legend[1]}
                    </text>
                </g>
            )}
        </svg>
    );
};

// Andamento di una grandezza nel tempo: pts [{ date, v }], l'ultimo punto è evidenziato
export const MiniTrend = ({ pts, unit = '', color = '#4f46e5', height = 110 }) => {
    const W = 300;
    const P = { l: 34, r: 10, t: 18, b: 20 };
    const vals = pts.map((p) => p.v);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    if (hi - lo < 1e-9) {
        lo -= 1;
        hi += 1;
    }
    const pad = (hi - lo) * 0.18;
    lo -= pad;
    hi += pad;
    const x = (i) => P.l + (pts.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (pts.length - 1));
    const y = (v) => P.t + ((hi - v) * (height - P.t - P.b)) / (hi - lo);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const area = `${line} L${x(pts.length - 1).toFixed(1)},${height - P.b} L${x(0).toFixed(1)},${height - P.b} Z`;
    const d = pts.length > 1 ? pts[pts.length - 1].v - pts[0].v : 0;
    const short = (dt) => new Date(dt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    return (
        <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block' }}>
            {[0, 0.5, 1].map((f) => {
                const v = lo + pad + (hi - lo - 2 * pad) * f;
                return (
                    <g key={f}>
                        <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#f0eeeb" />
                        <text x={P.l - 5} y={y(v) + 3} textAnchor="end" style={{ font: '500 8.5px Inter, sans-serif', fill: '#a8a29e' }}>
                            {fmt(v)}
                        </text>
                    </g>
                );
            })}
            {/* tinta piatta e non sfumatura trasparente: Safari in PDF la renderebbe piena */}
            <path d={area} fill={color} fillOpacity="0.1" />
            <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
                <circle key={i} cx={x(i)} cy={y(p.v)} r={i === pts.length - 1 ? 4.2 : 2.8} fill={i === pts.length - 1 ? color : '#fff'} stroke={color} strokeWidth="1.8" />
            ))}
            {pts.map((p, i) =>
                pts.length <= 6 || i === 0 || i === pts.length - 1 ? (
                    <text key={`t${i}`} x={x(i)} y={height - 6} textAnchor="middle" style={{ font: '500 8.5px Inter, sans-serif', fill: '#78716c' }}>
                        {short(p.date)}
                    </text>
                ) : null
            )}
            <text x={W - P.r} y={10} textAnchor="end" style={{ font: '700 10px Inter, sans-serif', fill: color }}>
                {fmt(pts[pts.length - 1].v)} {unit}
                {pts.length > 1 && <tspan style={{ fill: '#78716c', fontWeight: 600 }}>{`  (${d > 0 ? '+' : d < 0 ? '−' : '±'}${fmt(Math.abs(d))})`}</tspan>}
            </text>
        </svg>
    );
};
