import React from 'react';

const SYNODIC = 29.530588853;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // luna nuova di riferimento
const NAMES = ['Luna nuova', 'Luna crescente', 'Primo quarto', 'Gibbosa crescente', 'Luna piena', 'Gibbosa calante', 'Ultimo quarto', 'Luna calante'];

// Fase lunare calcolata offline, disegnata con il terminatore ellittico. Colori dal tono scelto.
export const MoonPhase = () => {
    const age = ((((Date.now() - NEW_MOON) / 86400000) % SYNODIC) + SYNODIC) % SYNODIC;
    const p = age / SYNODIC; // 0 nuova, .5 piena
    const k = Math.cos(2 * Math.PI * p);
    const illum = Math.round(((1 - k) / 2) * 100);
    const r = 40;
    const path = `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${Math.abs(k) * r} ${r} 0 0 ${k > 0 ? 0 : 1} 0 ${-r} Z`;
    const name = NAMES[Math.round(p * 8) % 8];
    return (
        <div className="wd-card wd-moon">
            <svg viewBox="0 0 100 100" role="img" aria-label={name}>
                <g transform="translate(50 50)">
                    <circle r={r} style={{ fill: 'color-mix(in srgb, var(--wd-fg) 14%, var(--wd-bg))' }} />
                    <g transform={p < 0.5 ? undefined : 'scale(-1 1)'}>
                        <path d={path} style={{ fill: 'var(--wd-fg)' }} />
                    </g>
                    <circle r={r} fill="none" style={{ stroke: 'var(--wd-fg)' }} strokeOpacity=".22" />
                </g>
            </svg>
            <p>
                <b>{name}</b>
                <span>
                    {illum}% illuminata · giorno {Math.floor(age) + 1}
                </span>
            </p>
        </div>
    );
};
