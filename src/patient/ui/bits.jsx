import React from 'react';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const PATHS = {
    back: <path d="M15 5 8 12l7 7" />,
    lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
    refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />,
    scale: (<><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 9.5a4.5 3 0 0 1 7 0M12 9.5l1.6-1.4" /></>),
    fork: <path d="M7 4v7a2 2 0 0 0 2 2v7M11 4v7a2 2 0 0 1-2 2M9 4v6M17 4c-2 1.5-3 4-3 7h3v9" />,
    bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6z" />,
    home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
    apple: (<><path d="M12 8c-2-2-6-1.5-6 3 0 4 2.5 9 4.5 9 .8 0 1-.5 1.5-.5s.7.5 1.5.5c2 0 4.5-5 4.5-9 0-4.5-4-5-6-3z" /><path d="M12 8c0-2 1-3.5 3-4" /></>),
    dumbbell: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
    user: (<><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.6-3.6 3.6-5.6 7-5.6s6.4 2 7 5.6" /></>),
    pause: <path d="M9 6v12M15 6v12" />,
    play: <path d="M8 5.5v13l11-6.5z" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    arrow: <path d="M7 17 17 7M9 7h8v8" />,
    info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
    calendar: (<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>),
    cart: (<><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="10" cy="19" r="1" /><circle cx="16" cy="19" r="1" /></>),
    note: (<><path d="M5 20h4L19 10l-4-4L5 16z" /><path d="m13.5 7.5 3 3" /></>),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    gear: (<><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>),
};
export const Icon = ({ name, size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" {...P} aria-hidden="true">{PATHS[name]}</svg>;

export const Head = ({ title, onBack, children }) => (
    <header className="pt-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onBack && <button type="button" className="pt-icon" aria-label="Indietro" onClick={onBack}><Icon name="back" /></button>}
            <h1>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </header>
);
export const IconBtn = ({ icon, label, onClick }) => <button type="button" className="pt-icon" aria-label={label} title={label} onClick={onClick}><Icon name={icon} /></button>;
export const Note = ({ tone = '', children }) => <div className={`pt-note ${tone}`} role={tone === 'bad' ? 'alert' : undefined}>{children}</div>;

// Cornice delle schermate di accesso: logo, passi (1 Informativa · 2 Passphrase · 3 Collegamento), titolo e testo.
export const AuthShell = ({ step, title, sub, children, big, fit }) => (
    <section className={'pt-auth' + (fit ? ' is-fit' : '')}>
        <div className={'pt-auth-logo' + (big ? ' is-big' : '')}><UrbiosLogo size={big ? 96 : 52} /></div>
        {big && <span className="pt-auth-word">URBIOS</span>}
        {step ? <div className="pt-steps" aria-label={`Passo ${step} di 3`}>{[1, 2, 3].map((i) => <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />)}</div> : null}
        <h1 className="pt-auth-t">{title}</h1>
        {sub && <p className="pt-auth-s">{sub}</p>}
        {children}
    </section>
);

// Sfondo «acqua»: riflessi di luce che si muovono sul fondo, come sul fondo di una piscina. Disegnato in piccolo su un canvas
// (circa 90x160 punti, ingrandito dal browser: l'effetto morbido viene gratis) e a 20 fotogrammi al secondo: leggero.
// Fermo se la pagina è nascosta o se il telefono chiede «riduci animazioni». Nessun dato, nessuna rete.
const W = 90, H = 160, SPEED = 0.6;   // 1 = velocità originale
const paint = (ctx, img, t) => {
    const d = img.data;
    let p = 0;
    for (let j = 0; j < H; j++) {
        const y = j / H * 1.9;
        for (let i = 0; i < W; i++) {
            const x = i / W;
            const a = Math.sin(x * 7 + t * 0.9 + Math.sin(y * 4.2 + t * 0.7) * 1.6);
            const b = Math.sin(y * 6.5 - t * 0.8 + Math.sin(x * 5.1 - t * 0.6) * 1.7);
            const c = Math.sin((x * 0.8 + y) * 5.2 + t * 0.55 + Math.sin(x * 9 + t) * 0.5);
            const v = (a + b + c) / 3;
            let k = 1 - Math.abs(v); k = k * k * k * k * k * k;            // linee chiare sottili dove le onde si incontrano
            const glow = (Math.sin(x * 2.4 + y * 1.6 + t * 0.35) + 1) * 0.5;  // chiazze lente di luce
            const m = (Math.sin(x * 3 + t * 0.2) + 1) * 0.5;                 // dal turchese al lavanda
            const L = k * 0.34 + glow * 0.07;
            d[p++] = 8 + L * (110 + 60 * m);
            d[p++] = 13 + L * (215 - 60 * m);
            d[p++] = 22 + L * (210 + 40 * m);
            d[p++] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
};

export const Backdrop = () => {
    const ref = React.useRef(null);
    React.useEffect(() => {
        const cv = ref.current, ctx = cv && cv.getContext && cv.getContext('2d');
        if (!ctx) return undefined;
        const img = ctx.createImageData(W, H);
        const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let raf = 0, last = 0, t = 3;
        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            if (document.hidden || now - last < 50) return;
            t += (now - last > 500 ? 0.05 : (now - last) / 1000) * SPEED; last = now;
            paint(ctx, img, t);
        };
        paint(ctx, img, t);
        if (!still) raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, []);
    return <div className="pt-bg" aria-hidden="true"><canvas ref={ref} width={W} height={H} /><i className="pt-bg-v" /></div>;
};
