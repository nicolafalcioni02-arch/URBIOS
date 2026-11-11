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
// La curva è una «smoothstep» (parte e arriva piano, come un movimento controllato); con `run` il pallino la percorre al ritmo
// prescritto (animazione CSS generata per questo tempo, così «pausa» la ferma).
const ease = (u) => u * u * (3 - 2 * u);
export const TempoBar = ({ tempo, run, dark }) => {
    const w = tempo.map(secs), W = w.reduce((a, b) => a + b, 0), f = [0]; w.forEach((x, i) => f.push(f[i] + x / W));
    const total = tempo.reduce((s, x) => s + (x === 'X' ? 0 : +x || 0), 0) || 1;
    const X = f.map((v) => +(v * 100).toFixed(2)), Y = [0, 100, 100, 0, 0], r = (n) => +n.toFixed(2);
    const seg = (i) => {
        const x0 = X[i], x1 = X[i + 1], d = x1 - x0;
        return i % 2 ? `M${x0} ${Y[i]}H${x1}` : `M${x0} ${Y[i]}C${r(x0 + d / 3)} ${Y[i]} ${r(x0 + d * 2 / 3)} ${Y[i + 1]} ${x1} ${Y[i + 1]}`;
    };
    const full = [0, 1, 2, 3].map(seg).map((d, i) => (i ? d.replace(/^M[^CH]*/, '') : d)).join('');
    const name = 'pt-tg-' + tempo.join('');
    const steps = [];
    for (let i = 0; i < 4; i++) {
        const n = i % 2 ? 1 : 10;
        for (let k = i ? 1 : 0; k <= n; k++) {
            const u = k / n, x = X[i] + (X[i + 1] - X[i]) * u, y = i % 2 ? Y[i] : Y[i] + (Y[i + 1] - Y[i]) * ease(u);
            steps.push(`${r(x)}% { left: ${r(x)}%; top: ${r(y)}%; }`);
        }
    }
    return (
        <div className={'pt-tb pt-tg' + (dark ? ' is-dark' : '')} role="img" aria-label={`Tempi: giù ${tempo[0]}, fermo ${tempo[1]}, su ${tempo[2]}, fermo ${tempo[3]} secondi`}>
            <div className="pt-tg-in">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs><linearGradient id={name + 'f'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--tb-a)" stopOpacity=".38" /><stop offset="1" stopColor="var(--tb-a)" stopOpacity="0" /></linearGradient></defs>
                    <path d={`${full}V100H0Z`} fill={`url(#${name}f)`} stroke="none" />
                    <path d="M0 0H100M0 100H100" className="g" />
                    {[0, 1, 2, 3].map((i) => <path key={i} d={seg(i)} className={'l l' + i} />)}
                </svg>
                {run && <><style>{`@keyframes ${name} { ${steps.join(' ')} }`}</style><i className="pt-tg-c" style={{ animationName: name, '--tb': total + 's' }} /></>}
            </div>
            <div className="pt-tb-n">
                {tempo.map((x, i) => <span key={i} className={'n' + i} style={{ flexGrow: w[i] }}>{i === 0 && <Icon name="down" size={12} />}{i === 2 && <Icon name="send" size={12} />}{x}</span>)}
            </div>
        </div>
    );
};
