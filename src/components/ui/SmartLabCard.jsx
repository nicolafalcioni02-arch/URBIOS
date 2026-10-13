import React, { useState, useEffect, useRef } from 'react';

// Aggiungiamo il prop "onSettingsChange"
export const SmartLabCard = ({ label, name, unit, defaultMin, defaultMax, value, onChange, onSettingsChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

    // Stato Locale
    const [range, setRange] = useState({
        min: Number(defaultMin) || 0,
        max: Number(defaultMax) || 0,
    });
    const [currentUnit, setCurrentUnit] = useState(unit || '');

    // Sincronizzazione con props (se il DB cambia, aggiorna la card)
    useEffect(() => {
        setRange({ min: Number(defaultMin) || 0, max: Number(defaultMax) || 0 });
        setCurrentUnit(unit || '');
    }, [defaultMin, defaultMax, unit]);

    // Focus automatico
    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    // --- RILEVAMENTO CAMBIAMENTI (Trigger onBlur) ---
    const checkUpdate = (field, oldVal, newVal) => {
        // Se il valore è diverso e abbiamo una funzione per gestire il cambio...
        if (String(oldVal) !== String(newVal) && onSettingsChange) {
            onSettingsChange(field, oldVal, newVal);
        }
    };

    // --- LOGICA COLORI ---
    let statusClass = 'border-gray-200 bg-white';
    let icon = 'ph-circle';
    let iconClass = 'text-gray-300';
    let textClass = 'text-gray-700';

    const val = parseFloat(value);
    const hasValue = !isNaN(val) && value !== '';

    if (hasValue) {
        const tolerance = (range.max - range.min) * 0.1;
        if (val >= range.min && val <= range.max) {
            statusClass = 'border-emerald-300 bg-emerald-50/50 shadow-emerald-100';
            icon = 'ph-check-circle';
            iconClass = 'text-emerald-500';
            textClass = 'text-emerald-700 font-bold';
        } else if ((val >= range.min - tolerance && val < range.min) || (val > range.max && val <= range.max + tolerance)) {
            statusClass = 'border-amber-300 bg-amber-50/50 shadow-amber-100';
            icon = 'ph-warning';
            iconClass = 'text-amber-500';
            textClass = 'text-amber-700 font-bold';
        } else {
            statusClass = 'border-rose-300 bg-rose-50/50 shadow-rose-100';
            icon = 'ph-warning-octagon';
            iconClass = 'text-rose-500';
            textClass = 'text-rose-700 font-bold';
        }
    }

    // --- RENDER COMPATTO ---
    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                className={`relative p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md flex items-center justify-between h-[60px] ${hasValue ? statusClass : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${hasValue ? 'text-gray-600' : 'text-gray-400'}`} title={label}>
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {hasValue ? (
                        <span className={`text-sm ${textClass}`}>
                            {value} <span className="text-[9px] text-gray-500 font-normal">{currentUnit}</span>
                        </span>
                    ) : (
                        <span className="text-xs text-gray-300 italic">Inserisci</span>
                    )}
                    {hasValue ? <i className={`ph-fill ${icon} ${iconClass} text-lg`}></i> : <i className="ph ph-plus-circle text-gray-300 text-lg"></i>}
                </div>
            </div>
        );
    }

    // --- RENDER APERTO ---
    return (
        <div className={`relative p-3 rounded-xl border transition-all duration-100 ${statusClass} shadow-md ring-2 ring-blue-500/20 z-10 scale-[1.00]`}>
            <div
                className="flex justify-between items-start mb-2 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                }}
            >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate w-3/4" title={label}>
                    {label}
                </span>
                <i className="ph ph-caret-up text-gray-400 hover:text-gray-600"></i>
            </div>

            <div className="flex items-baseline justify-center gap-1 mb-2">
                <input
                    ref={inputRef}
                    type="number"
                    step="0.1"
                    placeholder="-"
                    className={`w-full text-center text-3xl bg-transparent outline-none p-0 m-0 ${textClass} placeholder:text-gray-200 transition-colors duration-300`}
                    name={name}
                    value={value !== undefined && value !== null ? value : ''}
                    onChange={(e) => onChange && onChange(name, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsOpen(false);
                    }}
                />
            </div>

            <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-gray-100/50 pt-2">
                <div className="flex gap-1 items-center bg-white/60 px-1.5 py-0.5 rounded border border-gray-100">
                    <input
                        type="number"
                        className="w-8 text-center bg-transparent outline-none text-gray-500 focus:text-black"
                        value={range.min}
                        onChange={(e) => setRange({ ...range, min: parseFloat(e.target.value) })}
                        onBlur={() => checkUpdate('min', defaultMin, range.min)} // <--- TRIGGER UPDATE
                    />
                    <span>-</span>
                    <input
                        type="number"
                        className="w-8 text-center bg-transparent outline-none text-gray-500 focus:text-black"
                        value={range.max}
                        onChange={(e) => setRange({ ...range, max: parseFloat(e.target.value) })}
                        onBlur={() => checkUpdate('max', defaultMax, range.max)} // <--- TRIGGER UPDATE
                    />
                </div>
                <input
                    type="text"
                    className="font-bold bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-500 w-16 text-center outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all"
                    value={currentUnit}
                    onChange={(e) => setCurrentUnit(e.target.value)}
                    onBlur={() => checkUpdate('unit', unit, currentUnit)} // <--- TRIGGER UPDATE
                />
            </div>
        </div>
    );
};
