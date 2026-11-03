import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Menu "altro" (tre puntini): raccoglie le azioni secondarie sotto un solo tasto. items: { label, icon, onClick, danger }
export const ChefMore = ({ items, up = false, label = 'Altre azioni' }) => {
    const [pos, setPos] = useState(null);
    const btn = useRef(null);
    const toggle = () => {
        if (pos) return setPos(null);
        const r = btn.current.getBoundingClientRect();
        const w = 220;
        const left = Math.min(Math.max(12, r.right - w), window.innerWidth - w - 12);
        setPos(up ? { left, width: w, bottom: window.innerHeight - r.top + 6 } : { left, width: w, top: r.bottom + 6 });
    };
    useEffect(() => {
        if (!pos) return;
        const away = (e) => { if (!e.target.closest?.('.ch-pop') && !btn.current?.contains(e.target)) setPos(null); };
        const key = (e) => e.key === 'Escape' && (e.stopPropagation(), setPos(null));
        const close = (e) => { if (!e.target.closest?.('.ch-pop')) setPos(null); };
        document.addEventListener('mousedown', away);
        document.addEventListener('keydown', key, true);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key, true); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
    }, [pos]);
    return (
        <>
            <button type="button" ref={btn} className="vw-chip ch-more" onClick={toggle} aria-haspopup="menu" aria-expanded={Boolean(pos)} aria-label={label} title={label}>
                <i className="ph ph-dots-three-vertical"></i>
            </button>
            {pos && createPortal(
                <div className="ch-pop" style={pos} role="menu">
                    <div className="ch-pop-l">
                        {items.map((it) => (
                            <button type="button" key={it.label} role="menuitem" className={it.danger ? 'bad' : ''} onClick={() => { setPos(null); it.onClick(); }}>
                                <i className={`ph ph-${it.icon}`}></i><span>{it.label}</span>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
