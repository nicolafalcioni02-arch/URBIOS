import React, { useRef, useState } from 'react';

// Cornice delle schermate su telefono: barra delle sezioni in basso e foglio di azioni.
// Stessa logica delle app native: in alto solo dove sei, in basso dove puoi andare.

// items: [{ id, label, icon, badge?, dot?, primary? }]
export const MobileTabBar = ({ items, active, onSelect }) => (
    <nav className="m-tabbar" aria-label="Sezioni">
        {items.map((it) => {
            const on = it.id === active;
            return (
                <button key={it.id} className={`m-tab ${on ? 'on' : ''}`} onClick={() => onSelect(it.id)} aria-current={on ? 'page' : undefined}>
                    {it.primary ? (
                        <span className="m-tab-fab">
                            <i className={`ph-bold ${it.icon}`}></i>
                        </span>
                    ) : (
                        <i className={`${on ? 'ph-fill' : 'ph'} ${it.icon}`}></i>
                    )}
                    <span>{it.label}</span>
                    {it.badge ? <span className="m-tab-badge">{it.badge}</span> : it.dot ? <span className="m-tab-dot" style={it.dot === true ? undefined : { background: it.dot }}></span> : null}
                </button>
            );
        })}
    </nav>
);

// groups: [[{ label, icon, onClick, note?, tone?: 'danger', disabled? }]]
// Si apre con una molla dal basso, le righe entrano in cascata, si chiude trascinando verso il basso o toccando fuori.
export const ActionSheet = ({ title, subtitle, groups, onClose }) => {
    const [closing, setClosing] = useState(false);
    const sheet = useRef(null);
    const drag = useRef(null);

    const close = (after) => {
        if (closing) return;
        setClosing(true);
        if (after) after();
        setTimeout(onClose, 260);
    };

    const onStart = (e) => {
        drag.current = { y: e.touches[0].clientY, t: Date.now(), dy: 0 };
        if (sheet.current) sheet.current.style.transition = 'none';
    };
    const onMove = (e) => {
        if (!drag.current) return;
        const raw = e.touches[0].clientY - drag.current.y;
        drag.current.dy = raw;
        // verso l'alto si oppone resistenza (effetto elastico), verso il basso segue il dito
        const y = raw < 0 ? -22 * (1 - Math.exp(raw / 90)) : raw;
        if (sheet.current) sheet.current.style.transform = `translateY(${y}px)`;
    };
    const onEnd = () => {
        const d = drag.current;
        drag.current = null;
        if (!d || !sheet.current) return;
        sheet.current.style.transition = '';
        const fast = d.dy / Math.max(1, Date.now() - d.t) > 0.6;
        if (d.dy > 90 || (fast && d.dy > 20)) close();
        else sheet.current.style.transform = '';
    };

    let n = 0;
    return (
        <div className={`sheet-back m-sheet-back ${closing ? 'is-closing' : ''}`} onClick={() => close()}>
            <div ref={sheet} className={`sheet m-sheet ${closing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
                <div className="m-grab-zone">
                    <div className="m-grabber" aria-hidden="true"></div>
                    {title && (
                        <div className="m-sheet-head">
                            <p>{title}</p>
                            {subtitle && <span>{subtitle}</span>}
                        </div>
                    )}
                </div>
                {groups.map((g, i) => (
                    <div key={i} className="m-group m-sheet-group" style={{ '--i': i }}>
                        {g.map((it) => (
                            <button key={it.label} className={`m-sheet-row ${it.tone || ''}`} disabled={it.disabled} style={{ '--n': n++ }} onClick={() => close(it.onClick)}>
                                {typeof it.icon === 'string' ? <i className={`ph ${it.icon}`}></i> : it.icon}
                                <span className="flex-1 text-left">{it.label}</span>
                                {it.note && <span className="m-sheet-note">{it.note}</span>}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
