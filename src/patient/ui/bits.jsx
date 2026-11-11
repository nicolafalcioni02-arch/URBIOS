import React, { useEffect, useRef, useState } from 'react';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const PATHS = {
    back: <path d="M15 5 8 12l7 7" />,
    lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
    refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />,
    scale: (<><circle cx="12" cy="12" r="8.5" /><path d="M8.5 10.5a4.5 4.5 0 0 1 7 0M12 12.5l2-2.5" /></>),
    fork: <path d="M7 4v7a2 2 0 0 0 2 2v7M11 4v7a2 2 0 0 1-2 2M9 4v6M17 4c-2 1.5-3 4-3 7h3v9" />,
    swap: <path d="M7 7h11l-3-3M17 17H6l3 3" />,
    bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6z" />,
    home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
    apple: (<><path d="M12 8c-2-2-6-1.5-6 3 0 4 2.5 9 4.5 9 .8 0 1-.5 1.5-.5s.7.5 1.5.5c2 0 4.5-5 4.5-9 0-4.5-4-5-6-3z" /><path d="M12 8c0-2 1-3.5 3-4" /></>),
    dumbbell: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
    user: (<><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.6-3.6 3.6-5.6 7-5.6s6.4 2 7 5.6" /></>),
    pause: <path d="M9 6v12M15 6v12" />,
    play: <path d="M8 5.5v13l11-6.5z" />,
    doc: (<><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4M9 13h6M9 17h4" /></>),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    arrow: <path d="M7 17 17 7M9 7h8v8" />,
    info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
    calendar: (<><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>),
    cart: (<><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="10" cy="19" r="1" /><circle cx="16" cy="19" r="1" /></>),
    note: (<><path d="M5 20h4L19 10l-4-4L5 16z" /><path d="m13.5 7.5 3 3" /></>),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
    archive: (<><rect x="4" y="5" width="16" height="4" rx="1.5" /><path d="M6 9v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9M10 13h4" /></>),
    trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />,
    send: <path d="M12 19V5M6 11l6-6 6 6" />,
    share: <path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6" />,
    link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
    eye: (<><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.6" /></>),
    eyeoff: <path d="M4 4l16 16M10 6.2A8.6 8.6 0 0 1 12 6c5 0 8 6 8 6a13 13 0 0 1-2.4 3M6.5 8.5A13 13 0 0 0 4 12s3 6 8 6c1 0 2-.2 2.8-.6M10 10a3 3 0 0 0 4 4" />,
    phone: (<><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></>),
    warn: <path d="M12 4 3 19h18zM12 10v4M12 16.5h.01" />,
    qr: (<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6h-4M14 20h.01" /></>),
    down: <path d="M12 5v14M6 13l6 6 6-6" />,
    chev: <path d="m9 5 7 7-7 7" />,
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

const EASE = 'cubic-bezier(.2,.8,.2,1)';
// Trascinare il foglio verso il basso per chiuderlo: `ref` sull'elemento-foglio, `grab` sull'intestazione (non sul corpo che scorre).
// Si scrive direttamente nello stile (niente stato React) per restare fluidi.
export const useDragClose = (onClose) => {
    const ref = useRef(null), st = useRef(null), cb = useRef(onClose); cb.current = onClose;
    const grab = {
        onPointerDown: (e) => { if (e.target.closest && e.target.closest('button')) return; st.current = { y: e.clientY, t: performance.now(), dy: 0 }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* non supportato */ } },
        onPointerMove: (e) => { const s = st.current, el = ref.current; if (!s || !el) return; s.dy = Math.max(0, e.clientY - s.y); el.style.transition = 'none'; el.style.translate = '0 ' + s.dy + 'px'; },
        onPointerUp: () => {
            const s = st.current, el = ref.current; st.current = null; if (!s || !el) return;
            if (s.dy > 90 || s.dy / Math.max(1, performance.now() - s.t) > 0.5) { let done = false; const fin = () => { if (!done) { done = true; cb.current(); } }; el.style.transition = 'translate 180ms ease-in'; el.style.translate = '0 100%'; el.addEventListener('transitionend', fin, { once: true }); setTimeout(fin, 220); }
            else { el.style.transition = 'translate 220ms ' + EASE; el.style.translate = '0 0'; }
        },
        onPointerCancel: () => { const el = ref.current; st.current = null; if (el) { el.style.transition = 'translate 220ms ' + EASE; el.style.translate = '0 0'; } },
    };
    return { ref, grab };
};

// Foglio dal basso con maniglia: stesso markup di sempre, più il trascinamento per chiudere.
export const Sheet = ({ title, extra, label, onClose, children }) => {
    const { ref, grab } = useDragClose(onClose);
    return (
        <div className="pt-ov" role="dialog" aria-modal="true" aria-label={label || title}>
            <div className="pt-ov-back" onClick={onClose} />
            <section className="pt-dsheet" ref={ref}>
                <header {...grab}><i className="pt-grab" /><b>{title}</b>{extra}<button type="button" className="pt-round" aria-label="Chiudi" onClick={onClose}><Icon name="close" /></button></header>
                {children}
            </section>
        </div>
    );
};

// Pulsante «±» tenuto premuto: subito un passo, dopo 400 ms ripete ogni 90 ms, dopo 20 ripetizioni passo ×5. Il click serve solo alla tastiera.
export const useHold = (fn) => {
    const t = useRef(null), f = useRef(fn); f.current = fn;
    const stop = () => { clearTimeout(t.current); clearInterval(t.current); t.current = null; };
    useEffect(() => stop, []);
    return {
        onPointerDown: (e) => { if (e.button) return; stop(); f.current(1); let n = 0; t.current = setTimeout(() => { t.current = setInterval(() => { n += 1; f.current(n > 20 ? 5 : 1); }, 90); }, 400); },
        onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
        onClick: (e) => { if (e.detail === 0) f.current(1); },
    };
};

// Stepper «− valore +»: il valore è toccabile e si può scrivere (virgola o punto).
export const Step = ({ value, onChange, step = 1, min = 0, max = 1e9, fmt = (x) => String(x).replace('.', ','), unit = '', text, dark, hot, label }) => {
    const [ed, setEd] = useState(false), [raw, setRaw] = useState('');
    const clamp = (x) => Math.min(max, Math.max(min, Math.round(x * 10) / 10));
    const hm = useHold((k) => onChange(clamp(value - step * k))), hp = useHold((k) => onChange(clamp(value + step * k)));
    const done = () => { setEd(false); const n = parseFloat(raw.replace(',', '.')); if (Number.isFinite(n)) onChange(clamp(n)); };
    return (
        <div className={'pt-step' + (dark ? ' dark' : '') + (hot ? ' is-hot' : '')}>
            <button type="button" aria-label="Meno" {...hm}><Icon name="minus" size={16} /></button>
            {ed ? <input className="pt-step-in" type="text" inputMode="decimal" autoFocus aria-label={label} value={raw} onFocus={(e) => e.target.select()} onChange={(e) => setRaw(e.target.value)} onBlur={done} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} />
                : <button type="button" className="pt-step-v" aria-label={label} onClick={() => { setRaw(fmt(value)); setEd(true); }}><b>{text || (fmt(value) + (unit ? ' ' + unit : ''))}</b></button>}
            <button type="button" aria-label="Più" {...hp}><Icon name="plus" size={16} /></button>
        </div>
    );
};

// Numero che sale da 0 al valore (500 ms); con «riduci animazioni» mostra subito il valore finale.
export const Count = ({ n, sep }) => {
    const still = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [v, setV] = useState(still ? n : 0);
    useEffect(() => {
        if (still) { setV(n); return undefined; }
        let raf, t0; const f = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 500); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); };
        raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
    }, [n, still]);
    return <>{sep ? v.toLocaleString('it-IT') : v}</>;
};

// Foglio «a lista» (storico, esercizi…): stesso markup di sempre, con maniglia e trascinamento sull'intestazione.
export const Lst = ({ title, label, onClose, xLabel = 'Chiudi', xIcon = 'close', onX, children }) => {
    const { ref, grab } = useDragClose(onClose);
    return (
        <div className="pt-lst-ov" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
            <div className="pt-lst" ref={ref} onClick={(e) => e.stopPropagation()}>
                <div className="pt-lst-h" {...grab}><i className="pt-grab" /><b>{title}</b><button type="button" className="pt-lst-x" aria-label={xLabel} onClick={onX || onClose}><Icon name={xIcon} size={18} /></button></div>
                <div className="pt-lst-b">{children}</div>
            </div>
        </div>
    );
};
