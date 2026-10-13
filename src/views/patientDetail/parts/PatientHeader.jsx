import React, { useLayoutEffect, useRef, useState } from 'react';

const TABS = [
    { id: 'info', label: 'Anagrafica', icon: 'ph-user' },
    { id: 'history', label: 'Storico', icon: 'ph-clock-counter-clockwise' },
    { id: 'visit', label: 'Nuova visita', icon: 'ph-plus-circle' },
    { id: 'Allenamento', label: 'Training', icon: 'ph-barbell' },
    { id: 'diet', label: 'Diet', icon: 'ph-carrot' },
];

export const PatientHeader = ({ onBack, patient, setView, status, view, readOnly = false }) => {
    const wrap = useRef(null);
    const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

    // la pillola scura scivola sotto la scheda attiva
    useLayoutEffect(() => {
        const measure = () => {
            const el = wrap.current && wrap.current.querySelector(`[data-tab="${view}"]`);
            if (el && el.offsetWidth > 0) setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
        };
        measure();
        // si ricalcola quando cambia la misura dei bottoni (font caricati, finestra ridimensionata)
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
        if (ro && wrap.current) {
            ro.observe(wrap.current);
            wrap.current.querySelectorAll('[data-tab]').forEach((b) => ro.observe(b));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        window.addEventListener('resize', measure);
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [view]);

    // sui telefoni la scheda attiva resta visibile nella riga che scorre
    useLayoutEffect(() => {
        const el = wrap.current && wrap.current.querySelector(`[data-tab="${view}"]`);
        if (el && el.scrollIntoView) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }, [view]);

    const active = status === 'Attivo';

    return (
        <div className="bg-[var(--paper)]/90 backdrop-blur-xl border-b border-[color:var(--line)] px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-30 flex flex-col lg:flex-row justify-between items-stretch lg:items-center flex-none gap-3 sm:gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto min-w-0">
                <button onClick={onBack} className="vw-chip !px-0 w-10 !h-10 justify-center flex-none" aria-label="Torna ai pazienti">
                    <i className="ph ph-arrow-left"></i>
                </button>
                <div className="min-w-0">
                    <h2 className="text-[19px] sm:text-[22px] font-semibold leading-tight text-[color:var(--ink)] truncate">
                        {patient.nome} {patient.cognome}
                    </h2>
                    <p className="flex items-center gap-2 text-[13px] text-[color:var(--muted)]">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--ok)' : '#B5B3AE' }}></span>
                            {status}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>n. {patient.id}</span>
                        {readOnly && (
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--ink)', color: '#fff' }}>
                                Caso dimostrativo
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div ref={wrap} className="relative flex p-1 rounded-full bg-[color:var(--soft)] overflow-x-auto max-w-full no-scrollbar">
                <span
                    className="absolute top-1 bottom-1 rounded-full bg-[color:var(--ink)]"
                    style={{
                        left: pill.left,
                        width: pill.width,
                        opacity: pill.ready ? 1 : 0,
                        transition: 'left .45s var(--ease), width .45s var(--ease), opacity .2s',
                    }}
                />
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        data-tab={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`relative z-10 flex flex-1 lg:flex-none items-center justify-center gap-2 px-3.5 sm:px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 ${view === tab.id ? 'text-white' : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'}`}
                    >
                        <i className={`ph ${tab.icon} text-[17px]`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
