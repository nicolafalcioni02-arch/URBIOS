import React, { useState } from 'react';
import { MUSCLES } from './muscles.js';

// Omino (davanti e dietro) con i muscoli colorati in base alle serie fatte. Si tocca un muscolo per leggerne il nome.
// Colore: grigio = non lavorato → lime chiaro → lime pieno (10+ serie pesate in una settimana, 40 in un mese).
const lerp = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
export const heat = (v, full) => { if (!v) return '#BFC4D0'; const t = Math.min(1, v / full), c = lerp([236, 250, 176], [150, 200, 0], t); return `rgb(${c[0]},${c[1]},${c[2]})`; };

import DATA from './bodyData.js';

const BASE = '#E3E6EC', HAIR = '#C3C8D2', LINE = '#CDD1DA';
// Dal nome del tracciato al nostro muscolo (le altre parti — testa, mani, piedi, ginocchia — restano grigie)
const KEY = { chest: 'chest', abs: 'abs', obliques: 'abs', biceps: 'biceps', triceps: 'triceps', forearm: 'forearms', deltoids: 'shoulders', trapezius: 'traps', 'upper-back': 'lats', 'lower-back': 'lower', gluteal: 'glutes', hamstring: 'hams', quadriceps: 'quads', adductors: 'quads', calves: 'calves', tibialis: 'calves' };

const Figure = ({ fig, sets, full, sel, onPick, label }) => (
    <svg viewBox={fig.vb} className="pt-body-s" role="img" aria-label={label}>
        <path d={fig.outline} fill={BASE} />
        {fig.parts.map((p, i) => {
            const k = KEY[p.slug];
            if (!k) return p.d.map((d, j) => <path key={i + '-' + j} d={d} fill={p.slug === 'hair' ? HAIR : BASE} />);
            return p.d.map((d, j) => <path key={i + '-' + j} d={d} fill={heat(sets[k], full)} stroke="#fff" strokeWidth="2" strokeLinejoin="round" className={'pt-mu' + (sel === k ? ' is-sel' : '')} onClick={(e) => { e.stopPropagation(); onPick(k); }} />);
        })}
        <path d={fig.outline} fill="none" stroke={LINE} strokeWidth="2" />
    </svg>
);

export const BodyMap = ({ sets, full }) => {
    const [sel, setSel] = useState(null);
    const [f, setF] = useState(() => { try { return localStorage.getItem('pt-sex') === 'f'; } catch { return false; } });
    const pick = (k) => setSel((s) => (s === k ? null : k));
    const setSex = (v) => { setF(v); try { localStorage.setItem('pt-sex', v ? 'f' : 'm'); } catch { /* ok */ } };
    const v = sel ? Math.round(sets[sel] || 0) : 0;
    return (
        <div className="pt-body" onClick={() => setSel(null)}>
            <div className="pt-sex" role="tablist" aria-label="Figura" onClick={(e) => e.stopPropagation()}>{[[false, 'Uomo'], [true, 'Donna']].map(([x, l]) => <button key={l} type="button" role="tab" aria-selected={f === x} className={f === x ? 'is-on' : ''} onClick={() => setSex(x)}>{l}</button>)}</div>
            <div className="pt-body-f">
                <Figure fig={DATA[f ? 'ff' : 'mf']} sets={sets} full={full} sel={sel} onPick={pick} label="Davanti" />
                <Figure fig={DATA[f ? 'fb' : 'mb']} sets={sets} full={full} sel={sel} onPick={pick} label="Dietro" />
            </div>
            <div className="pt-body-c" aria-live="polite">{sel ? <span className="pt-body-t"><b>{MUSCLES[sel]}</b><em>{v ? v + (v === 1 ? ' serie' : ' serie') : 'non lavorato'}</em></span> : <span className="pt-body-h">Tocca un muscolo</span>}</div>
        </div>
    );
};
