import React, { useEffect, useLayoutEffect, useRef } from 'react';

// Righello a passo 0,1: un solo elemento con le tacche disegnate dal CSS, l'aggancio alla tacca lo fa il codice.
const TICK = 8;
export const Ruler = ({ value, onChange, min = 20, max = 300 }) => {
    const ref = useRef(null), st = useRef({ lo: 0, n: 0, v: value, raf: 0, snap: 0, mine: false });
    if (!st.current.n) {
        const lo = Math.max(min, Math.round((value - 15) * 10) / 10), hi = Math.min(max, Math.round((value + 15) * 10) / 10);
        st.current.lo = lo; st.current.n = Math.round((hi - lo) * 10) + 1;
    }
    const s = st.current, hi = s.lo + (s.n - 1) / 10;
    const pos = (v) => Math.round((Math.min(hi, Math.max(s.lo, v)) - s.lo) * 10) * TICK;
    useLayoutEffect(() => { if (ref.current) ref.current.scrollLeft = pos(value); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const el = ref.current;
        if (el && !s.mine && Math.abs(el.scrollLeft - pos(value)) > 1) { el.style.scrollBehavior = 'auto'; el.scrollLeft = pos(value); }
        s.mine = false; s.v = value;
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => { cancelAnimationFrame(s.raf); clearTimeout(s.snap); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const settle = () => { const el = ref.current; if (!el) return; const t = Math.round(el.scrollLeft / TICK) * TICK; if (Math.abs(t - el.scrollLeft) > 0.5) el.scrollTo({ left: t, behavior: 'smooth' }); };
    const onScroll = () => {
        clearTimeout(s.snap); s.snap = setTimeout(settle, 120);
        if (s.raf) return;
        s.raf = requestAnimationFrame(() => {
            s.raf = 0; const el = ref.current; if (!el) return;
            const v = Math.round((s.lo + Math.round(el.scrollLeft / TICK) / 10) * 10) / 10;
            if (v !== s.v && v >= s.lo && v <= hi) { s.v = v; s.mine = true; onChange(v); try { navigator.vibrate && navigator.vibrate(5); } catch (e) { /* niente vibrazione */ } }
        });
    };
    const key = (e) => { const d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!d) return; e.preventDefault(); onChange(Math.min(hi, Math.max(s.lo, Math.round((value + d * 0.1) * 10) / 10))); };
    return (
        <div className="pt-ruler">
            <div className="pt-ruler-s" ref={ref} role="slider" tabIndex={0} aria-label="Peso" aria-valuenow={value} aria-valuemin={s.lo} aria-valuemax={hi} onScroll={onScroll} onKeyDown={key}>
                <div className="pt-ruler-t" style={{ width: s.n * TICK }} />
            </div>
            <i className="pt-ruler-i" aria-hidden="true" />
        </div>
    );
};
