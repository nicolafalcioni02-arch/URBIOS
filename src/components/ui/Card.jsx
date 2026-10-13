import React, { createContext, useContext, useState } from 'react';

// Dentro Nuova Visita ogni sezione e' una schermata a se': niente intestazione a fisarmonica, solo il contenuto.
export const StepContext = createContext(false);

export const Card = ({ children, title, icon, colorTheme = 'gray', className = '' }) => {
    // il colore del tema resta come prop per compatibilita', ma lo stile e' unico: carta bianca, filo sottile
    const tint = { red: '#C2413A', orange: '#B7791F', green: '#1F8A5B', blue: '#2F54EB' }[colorTheme];

    return (
        <div className={`panel ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    {icon && <i className={`ph ${icon} text-[17px]`} style={{ color: tint || 'var(--muted)' }}></i>}
                    <h4 className="font-semibold text-[15px] text-[color:var(--ink)]">{title}</h4>
                </div>
            )}
            {children}
        </div>
    );
};

export const CardCompattabile = ({ children, title, icon, colorTheme = 'gray', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`panel h-fit !p-0 overflow-hidden ${className}`}>
            {title && (
                <button
                    type="button"
                    className="w-full flex items-center justify-between gap-3 text-left select-none px-4 py-3.5 transition-colors hover:bg-[color:var(--soft)]"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <span className="flex items-center gap-2.5 min-w-0">
                        {icon && <i className={`ph ${icon} text-[18px] text-[color:var(--muted)]`}></i>}
                        <span className="font-semibold text-[15px] text-[color:var(--ink)] truncate">{title}</span>
                    </span>
                    <i className={`ph ph-plus text-[color:var(--muted)] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}></i>
                </button>
            )}
            {/* apertura morbida: la riga della griglia passa da 0 a tutta l'altezza */}
            <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease)' }}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1">{children}</div>
                </div>
            </div>
        </div>
    );
};

export const CollapsibleSection = ({ title, children, defaultOpen = false, isOpen, onToggle }) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isExpanded = isOpen !== undefined ? isOpen : internalOpen;
    const bare = useContext(StepContext);

    const handleToggle = () => {
        if (onToggle) onToggle();
        else setInternalOpen(!internalOpen);
    };

    if (bare) return <div className="stagger">{children}</div>;

    return (
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
            <button onClick={handleToggle} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <span className=" font-bold text-lg text-gray-800">{title}</span>
                <i className={`ph ph-caret-down text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {children}
            </div>
        </div>
    );
};
