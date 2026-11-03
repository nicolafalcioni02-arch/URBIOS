import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Menù a tendina personalizzato: bottone + elenco con ricerca (opzioni: { value, label, sub }). Sostituisce il <select> del browser.
export const ChefPick = ({ value, options, onChange, placeholder = 'Scegli…', searchable = true, minSearch = 6, style, className = '' }) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [pos, setPos] = useState(null);
    const btn = useRef(null);
    const cur = options.find((o) => o.value === value);
    const list = useMemo(() => (q.trim() ? options.filter((o) => `${o.label} ${o.sub || ''}`.toLowerCase().includes(q.trim().toLowerCase())) : options), [options, q]);

    const toggle = () => {
        if (!open) {
            const r = btn.current.getBoundingClientRect();
            const below = window.innerHeight - r.bottom;
            const up = below < 260 && r.top > below;
            const w = Math.min(Math.max(r.width, 240), window.innerWidth - 24);
            setPos({ left: Math.min(Math.max(12, r.left), window.innerWidth - w - 12), width: w, ...(up ? { bottom: window.innerHeight - r.top + 6, maxH: Math.min(320, r.top - 16) } : { top: r.bottom + 6, maxH: Math.min(320, below - 16) }) });
            setQ('');
        }
        setOpen(!open);
    };
    useEffect(() => {
        if (!open) return;
        const away = (e) => { if (!e.target.closest?.('.ch-pop') && !btn.current?.contains(e.target)) setOpen(false); };
        const key = (e) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false));
        const close = (e) => { if (!e.target.closest?.('.ch-pop')) setOpen(false); };
        document.addEventListener('mousedown', away);
        document.addEventListener('keydown', key, true);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key, true); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
    }, [open]);

    return (
        <>
            <button type="button" ref={btn} className={`ch-pick ${open ? 'open' : ''} ${className}`} style={style} onClick={toggle} aria-haspopup="listbox" aria-expanded={open}>
                <span className={cur?.value ? '' : 'ph-text'}>{cur?.value ? cur.label : placeholder}</span>
                <i className="ph ph-caret-down"></i>
            </button>
            {open && pos && createPortal(
                <div className="ch-pop" style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH }} role="listbox">
                    {searchable && options.length > minSearch && (
                        <div className="ch-pop-s"><i className="ph ph-magnifying-glass"></i><input autoFocus placeholder="Cerca" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                    )}
                    <div className="ch-pop-l">
                        {list.length === 0 && <p className="ch-pop-e">Nessun risultato</p>}
                        {list.map((o) => (
                            <button type="button" key={o.value} role="option" aria-selected={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => { onChange(o.value); setOpen(false); }}>
                                <span>{o.label}</span>
                                {o.sub && <small>{o.sub}</small>}
                                {o.value === value && <i className="ph ph-check"></i>}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
