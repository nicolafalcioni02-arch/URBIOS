import React, { useEffect, useRef, useState } from 'react';

// Numero che sale da 0 al valore (easing out). Rispetta prefers-reduced-motion.
export const useCountUp = (value, ms = 900) => {
    const [v, setV] = useState(0);
    const from = useRef(0);
    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setV(value);
        const start = performance.now();
        const a = from.current;
        let raf;
        const tick = (t) => {
            const k = Math.min(1, (t - start) / ms);
            const e = 1 - Math.pow(1 - k, 4);
            setV(a + (value - a) * e);
            if (k < 1) raf = requestAnimationFrame(tick);
            else from.current = value;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, ms]);
    return v;
};

export const Count = ({ value, suffix = '' }) => <>{Math.round(useCountUp(value)).toLocaleString('it-IT')}{suffix}</>;

// Ciambella dei macro (quota di kcal: P e C 4, G 9), si disegna da sola
export const MacroDonut = ({ kcal, p, c, f, size = 190 }) => {
    const parts = [
        { k: 'Proteine', g: p, e: p * 4, o: 1 },
        { k: 'Carboidrati', g: c, e: c * 4, o: 0.5 },
        { k: 'Grassi', g: f, e: f * 9, o: 0.22 },
    ];
    const tot = parts.reduce((s, x) => s + x.e, 0) || 1;
    const R = 70, C = 2 * Math.PI * R, gap = 5;
    let acc = 0;
    return (
        <div className="ch-donut">
            <svg viewBox="0 0 180 180" width={size} height={size}>
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--soft)" strokeWidth="16" />
                {parts.map((x, i) => {
                    const len = Math.max(0, (x.e / tot) * C - gap);
                    const el = (
                        <circle key={x.k} className="ch-arc" cx="90" cy="90" r={R} fill="none" stroke={i === 0 ? 'var(--accent)' : 'var(--ink)'} strokeOpacity={i === 0 ? 1 : x.o} strokeWidth="16" strokeLinecap="round"
                            strokeDasharray={`${len} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 90 90)" style={{ '--len': len, animationDelay: `${i * 0.15}s` }} />
                    );
                    acc += (x.e / tot) * C;
                    return el;
                })}
            </svg>
            <div className="ch-donut-c"><b><Count value={kcal} /></b><small>kcal / porzione</small></div>
            <div className="ch-legend ch-legend-col">
                {parts.map((x, i) => (
                    <span key={x.k}><i style={{ background: i === 0 ? 'var(--accent)' : 'var(--ink)', opacity: i === 0 ? 1 : x.o }}></i>{x.k}<b>{Math.round(x.g)} g</b><em>{Math.round((x.e / tot) * 100)}%</em></span>
                ))}
            </div>
        </div>
    );
};

// Quanto pesa ogni ingrediente sulle calorie del piatto
export const IngredientBars = ({ items }) => {
    const rows = items.map((i) => ({ name: i.name, kcal: (i.kcal * i.weight) / 100 })).sort((a, b) => b.kcal - a.kcal);
    const tot = rows.reduce((s, r) => s + r.kcal, 0) || 1;
    return (
        <div className="ch-ibars">
            {rows.slice(0, 7).map((r, i) => (
                <div key={r.name + i} className="ch-ibar" style={{ animationDelay: `${i * 0.06}s` }}>
                    <span>{r.name}</span>
                    <div><i style={{ width: `${(r.kcal / tot) * 100}%`, animationDelay: `${0.2 + i * 0.06}s`, opacity: i === 0 ? 1 : 0.55 }}></i></div>
                    <em>{Math.round((r.kcal / tot) * 100)}%</em>
                </div>
            ))}
        </div>
    );
};

// Scheda con inclinazione 3D e luce che segue il mouse
export const Tilt = ({ children, className = '', ...rest }) => {
    const ref = useRef(null);
    const move = (e) => {
        const el = ref.current, r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;
    };
    const leave = () => { ref.current.style.transform = ''; };
    return <button ref={ref} className={`ch-card ${className}`} onMouseMove={move} onMouseLeave={leave} {...rest}>{children}</button>;
};

// Statistiche del ricettario: contatori + distribuzione per categoria
export const ChefStats = ({ recipes }) => {
    if (!recipes.length) return null;
    const kcal = recipes.reduce((s, r) => s + r.totals.kcal / (r.servings || 1), 0) / recipes.length;
    const timed = recipes.filter((r) => r.minutes > 0);
    const min = timed.length ? timed.reduce((s, r) => s + r.minutes, 0) / timed.length : 0;
    const cats = {};
    recipes.forEach((r) => { const c = r.category || 'Altro'; cats[c] = (cats[c] || 0) + 1; });
    const max = Math.max(...Object.values(cats));
    return (
        <div className="ch-stats rise">
            {[['Ricette', recipes.length, ''], ['kcal medie a porzione', kcal, ''], ['Minuti medi', min, '′']].map(([l, v, s]) => (
                <div key={l}><b><Count value={v} suffix={s} /></b><small>{l}</small></div>
            ))}
            <div className="ch-cats">
                {Object.entries(cats).map(([c, n]) => (
                    <span key={c} title={`${c}: ${n}`}><i style={{ height: `${(n / max) * 100}%` }}></i><small>{c.slice(0, 4)}</small></span>
                ))}
            </div>
        </div>
    );
};
