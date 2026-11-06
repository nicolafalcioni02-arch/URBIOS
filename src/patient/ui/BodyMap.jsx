import React, { useState } from 'react';
import { MUSCLES } from './muscles.js';

// Omino (davanti e dietro) con i muscoli colorati in base alle serie fatte. Si tocca un muscolo per leggerne il nome.
// Colore: grigio = non lavorato → lime chiaro → lime pieno (10+ serie pesate in una settimana, 40 in un mese).
const lerp = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
export const heat = (v, full) => { if (!v) return '#BFC4D0'; const t = Math.min(1, v / full), c = lerp([236, 250, 176], [150, 200, 0], t); return `rgb(${c[0]},${c[1]},${c[2]})`; };

const BASE = '#D3D7E0';
const Base = () => (
    <g fill={BASE}>
        <ellipse cx="60" cy="16" rx="10" ry="12" /><rect x="54" y="26" width="12" height="11" rx="4" />
        <path d="M40 44 Q60 36 80 44 L78 98 Q76 124 70 134 L50 134 Q44 124 42 98 Z" />
        {[0, 1].map((s) => <g key={s} transform={s ? 'translate(120 0) scale(-1 1)' : undefined}>
            <path d="M82 46 Q101 48 103 68 L105 118 Q105 130 98 130 Q91 130 91 118 L90 72 Z" />
            <path d="M60 132 L85 132 Q89 172 83 204 L83 248 Q83 255 74 255 Q65 255 65 248 L64 204 Q59 172 60 132 Z" />
        </g>)}
    </g>
);

// una forma si disegna due volte (destra e specchiata) se `pair`
const Shape = ({ k, d, el, pair, fill, sel, onPick }) => {
    const props = { fill, className: 'pt-mu' + (sel === k ? ' is-sel' : ''), onClick: () => onPick(k) };
    const one = (t) => (d ? <path d={d} {...props} transform={t} /> : React.cloneElement(el, { ...props, transform: t }));
    return <>{one(undefined)}{pair ? one('translate(120 0) scale(-1 1)') : null}</>;
};

const FRONT = [
    ['shoulders', { el: <ellipse cx="85" cy="53" rx="9" ry="10" />, pair: true }],
    ['chest', { d: 'M61 48 Q78 44 87 57 Q85 71 74 75 Q64 75 61 68 Z', pair: true }],
    ['abs', { el: <rect x="52" y="79" width="16" height="44" rx="6" /> }],
    ['biceps', { el: <ellipse cx="96" cy="85" rx="6" ry="17" />, pair: true }],
    ['forearms', { el: <ellipse cx="98" cy="114" rx="5.5" ry="14" />, pair: true }],
    ['quads', { d: 'M62 136 L83 136 Q87 162 81 194 L67 194 Q60 164 62 136 Z', pair: true }],
    ['calves', { el: <ellipse cx="74" cy="224" rx="6.5" ry="21" />, pair: true }],
];
const BACK = [
    ['traps', { d: 'M48 38 Q60 33 72 38 L82 52 Q60 62 38 52 Z' }],
    ['shoulders', { el: <ellipse cx="85" cy="55" rx="9" ry="10" />, pair: true }],
    ['lats', { d: 'M62 64 Q80 58 81 76 L75 102 Q67 106 62 102 Z', pair: true }],
    ['lower', { el: <rect x="52" y="104" width="16" height="22" rx="5" /> }],
    ['triceps', { el: <ellipse cx="96" cy="85" rx="6" ry="17" />, pair: true }],
    ['forearms', { el: <ellipse cx="98" cy="114" rx="5.5" ry="14" />, pair: true }],
    ['glutes', { el: <ellipse cx="72" cy="142" rx="11" ry="12" />, pair: true }],
    ['hams', { d: 'M62 156 L83 156 Q87 176 81 196 L67 196 Q60 176 62 156 Z', pair: true }],
    ['calves', { el: <ellipse cx="74" cy="224" rx="7" ry="21" />, pair: true }],
];

export const BodyMap = ({ sets, full }) => {
    const [sel, setSel] = useState(null);
    const pick = (k) => setSel((s) => (s === k ? null : k));
    const fig = (list, label) => (
        <svg viewBox="0 0 120 262" className="pt-body-s" role="img" aria-label={label}>
            <Base />
            {list.map(([k, o]) => <Shape key={k} k={k} d={o.d} el={o.el} pair={o.pair} fill={heat(sets[k], full)} sel={sel} onPick={pick} />)}
        </svg>
    );
    const v = sel ? Math.round((sets[sel] || 0) * 10) / 10 : 0;
    return (
        <div className="pt-body">
            <div className="pt-body-f">{fig(FRONT, 'Davanti')}{fig(BACK, 'Dietro')}</div>
            <p className="pt-body-c" aria-live="polite">{sel ? <><b>{MUSCLES[sel]}</b> · {v ? String(v).replace('.', ',') + ' serie' : 'non lavorato'}</> : <span className="pt-body-h">Clicca sul muscolo</span>}</p>
        </div>
    );
};
