import React, { useRef, useState } from 'react';
import { TabBar, Button } from 'glisse';

// Cornice delle schermate su telefono: barra delle sezioni in basso e foglio di azioni.
// Stessa logica delle app native: in alto solo dove sei, in basso dove puoi andare.

// items: [{ id, label, icon, badge?, dot? }]
// Barra delle sezioni in vetro liquido (glisse): la pastiglia segue il dito e si solleva come una lente.
export const MobileTabBar = ({ items, active, onSelect }) => (
    <nav className="m-tabbar" aria-label="Sezioni">
        <TabBar
            aria-label="Sezioni"
            value={active}
            onValueChange={onSelect}
            items={items.map((it) => ({
                value: it.id,
                label: it.label,
                icon: (
                    <span className="m-tab-ico">
                        <i className={`${it.id === active ? 'ph-fill' : 'ph'} ${it.icon}`}></i>
                        {it.badge ? <span className="m-tab-badge">{it.badge}</span> : it.dot ? <span className="m-tab-dot" style={it.dot === true ? undefined : { background: it.dot }}></span> : null}
                    </span>
                ),
            }))}
        />
    </nav>
);

// Tasto tondo in vetro per le barre in alto (glisse Button): `solid` = azione principale con l'accento.
export const GlassIconButton = ({ icon, solid, ...rest }) => (
    <Button className="m-gbtn" variant={solid ? 'filled' : 'glass'} icon={<i className={`ph${solid ? '-bold' : ''} ${icon}`}></i>} {...rest} />
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
