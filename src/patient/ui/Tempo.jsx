import React from 'react';
import { Icon } from './bits.jsx';

// «3-1-2-1», «3010», «3/1/X/0» → quattro tempi (giù, fermo, su, fermo); non riconosciuto → null
export const parseTempo = (s) => {
    const v = String(s || '').trim(); if (!v) return null;
    const a = /[^0-9xX]/.test(v) ? v.split(/[^0-9xX]+/).filter(Boolean) : v.split('');
    return a.length === 4 ? a.map((x) => x.toUpperCase()) : null;
};
const secs = (x) => (x === 'X' ? 0.5 : x === '0' ? 0.3 : +x || 0.3);

// Barra del tempo: quattro segmenti larghi quanto i secondi; con `run` un cursore scorre al ritmo prescritto.
export const TempoBar = ({ tempo, run, dark }) => {
    const total = tempo.reduce((s, x) => s + (x === 'X' ? 0 : +x || 0), 0) || 1;
    return (
        <div className={'pt-tb' + (dark ? ' is-dark' : '')} role="img" aria-label={`Tempi: giù ${tempo[0]}, fermo ${tempo[1]}, su ${tempo[2]}, fermo ${tempo[3]} secondi`}>
            <div className="pt-tb-bar">
                {tempo.map((x, i) => <i key={i} className={'pt-tb-s s' + i} style={{ flexGrow: secs(x) }} />)}
                {run && <i className="pt-tb-c" style={{ '--tb': total + 's' }} />}
            </div>
            <div className="pt-tb-n">
                {tempo.map((x, i) => <span key={i} style={{ flexGrow: secs(x) }}>{i === 0 && <Icon name="down" size={12} />}{i === 2 && <Icon name="send" size={12} />}{x}</span>)}
            </div>
        </div>
    );
};
