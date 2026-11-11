import React from 'react';
import { Icon } from './bits.jsx';

// «3-1-2-1», «3010», «3/1/X/0» → quattro tempi (giù, fermo, su, fermo); non riconosciuto → null
export const parseTempo = (s) => {
    const v = String(s || '').trim(); if (!v) return null;
    const a = /[^0-9xX]/.test(v) ? v.split(/[^0-9xX]+/).filter(Boolean) : v.split('');
    return a.length === 4 ? a.map((x) => x.toUpperCase()) : null;
};
const secs = (x) => (x === 'X' ? 0.5 : x === '0' ? 0.3 : +x || 0.3);

// Grafico del movimento: altezza del bilanciere nel tempo. Scende (giù), resta in basso (fermo), sale (su), resta in alto (fermo).
// Con `run` un pallino percorre la linea al ritmo prescritto (animazione CSS generata per questo tempo, così «pausa» la ferma).
export const TempoBar = ({ tempo, run, dark }) => {
    const w = tempo.map(secs), W = w.reduce((a, b) => a + b, 0), f = [0]; w.forEach((x, i) => f.push(f[i] + x / W));
    const total = tempo.reduce((s, x) => s + (x === 'X' ? 0 : +x || 0), 0) || 1;
    const X = f.map((v) => +(v * 100).toFixed(2)), Y = [0, 100, 100, 0, 0];
    const name = 'pt-tg-' + tempo.join('');
    const kf = X.map((x, i) => `${x}% { left: ${x}%; top: ${Y[i]}%; }`).join(' ');
    return (
        <div className={'pt-tb pt-tg' + (dark ? ' is-dark' : '')} role="img" aria-label={`Tempi: giù ${tempo[0]}, fermo ${tempo[1]}, su ${tempo[2]}, fermo ${tempo[3]} secondi`}>
            <div className="pt-tg-in">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <line x1="0" y1="0" x2="100" y2="0" className="g" /><line x1="0" y1="100" x2="100" y2="100" className="g" />
                    {[0, 1, 2, 3].map((i) => <line key={i} x1={X[i]} y1={Y[i]} x2={X[i + 1]} y2={Y[i + 1]} className={'l l' + i} />)}
                </svg>
                {run && <><style>{`@keyframes ${name} { ${kf} }`}</style><i className="pt-tg-c" style={{ animationName: name, '--tb': total + 's' }} /></>}
            </div>
            <div className="pt-tb-n">
                {tempo.map((x, i) => <span key={i} style={{ flexGrow: w[i] }}>{i === 0 && <Icon name="down" size={12} />}{i === 2 && <Icon name="send" size={12} />}{x}</span>)}
            </div>
        </div>
    );
};
