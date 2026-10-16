import React from 'react';

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
export const ActionSheet = ({ title, subtitle, groups, onClose }) => (
    <div className="sheet-back" onClick={onClose}>
        <div className="sheet m-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="m-grabber" aria-hidden="true"></div>
            {title && (
                <div className="m-sheet-head">
                    <p>{title}</p>
                    {subtitle && <span>{subtitle}</span>}
                </div>
            )}
            {groups.map((g, i) => (
                <div key={i} className="m-group m-sheet-group">
                    {g.map((it) => (
                        <button
                            key={it.label}
                            className={`m-sheet-row ${it.tone || ''}`}
                            disabled={it.disabled}
                            onClick={() => {
                                onClose();
                                it.onClick();
                            }}
                        >
                            <i className={`ph ${it.icon}`}></i>
                            <span className="flex-1 text-left">{it.label}</span>
                            {it.note && <span className="m-sheet-note">{it.note}</span>}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    </div>
);
