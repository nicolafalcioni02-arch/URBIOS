import React, { useEffect, useRef, useState } from 'react';

// Effetti condivisi

// Numero che "scorre" fino al nuovo valore (kcal, grammi…)
export const CountUp = ({ value, duration = 650, format = (v) => Math.round(v).toLocaleString('it-IT') }) => {
    const [shown, setShown] = useState(value);
    const from = useRef(value);
    useEffect(() => {
        const start = performance.now();
        const a = from.current;
        const b = Number(value) || 0;
        if (a === b || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setShown(b);
            from.current = b;
            return;
        }
        let raf;
        const tick = (t) => {
            const k = Math.min(1, (t - start) / duration);
            const e = 1 - Math.pow(1 - k, 3); // ease-out
            setShown(a + (b - a) * e);
            if (k < 1) raf = requestAnimationFrame(tick);
            else from.current = b;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <>{format(shown)}</>;
};

// Coriandoli che partono da un elemento (es. quando il piano viene segnato "Consegnato")
export const confetti = (el) => {
    if (!el || typeof document === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const colors = ['#1F8A5B', '#121317', '#F2B84B', '#7AA7FF', '#E8795B'];
    for (let i = 0; i < 26; i++) {
        const c = document.createElement('span');
        c.className = 'dg-confetti';
        const ang = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 110;
        c.style.left = `${r.left + r.width / 2}px`;
        c.style.top = `${r.top + r.height / 2}px`;
        c.style.background = colors[i % colors.length];
        c.style.setProperty('--x', `${Math.cos(ang) * dist}px`);
        c.style.setProperty('--y', `${Math.sin(ang) * dist - 30}px`);
        c.style.setProperty('--r', `${Math.random() * 540 - 270}deg`);
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1000);
    }
};
