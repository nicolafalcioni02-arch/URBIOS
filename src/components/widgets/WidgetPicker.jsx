// Menù per aggiungere un widget: si apre sopra il "+", fuori dalla colonna (quindi mai coperto da altro).
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WIDGETS } from './widgetCatalog';

export const WidgetPicker = ({ anchor, onPick, onClose, list = WIDGETS, hint = '', below = false }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    const r = anchor.getBoundingClientRect();
    const W = 300;
    const left = Math.max(10, Math.min(window.innerWidth - W - 10, r.left + r.width / 2 - W / 2));
    const maxH = Math.max(160, below ? window.innerHeight - r.bottom - 24 : r.top - 24);
    const pos = below ? { top: r.bottom + 10 } : { bottom: window.innerHeight - r.top + 10 };
    return createPortal(
        <div className="wd-pick-layer" onPointerDown={onClose}>
            <div className="wd-pick" style={{ left, ...pos, width: W, maxHeight: maxH, transformOrigin: below ? 'top center' : undefined }} onPointerDown={(e) => e.stopPropagation()} role="menu">
                <p className="wd-pick-title">Aggiungi un widget</p>
                <div className="wd-pick-grid">
                    {list.map((w) => (
                        <button key={w.type} role="menuitem" onClick={() => onPick(w.type)}>
                            <i className={`ph ${w.icon}`} />
                            <span>{w.label}</span>
                        </button>
                    ))}
                </div>
                {hint && <p className="wd-pick-hint">{hint}</p>}
            </div>
        </div>,
        document.body
    );
};
