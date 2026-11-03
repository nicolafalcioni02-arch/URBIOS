import React from 'react';
import { UrbiosLogo } from '../brand/UrbiosLogo';
import { LabIcon } from '../lab/LabIcon';
import { useCompact } from '../hooks/useCompact';

// Scelta dell'area dopo il login: Laboratorio oppure Sport & Nutrizione (la suite con pazienti, agenda, ecc.)
const AREAS = [
    { id: 'lab', title: 'Laboratorio', icon: <LabIcon size="1.2em" /> },
    { id: 'sport', title: 'Sport & Nutrizione', icon: <i className="ph ph-heartbeat"></i> },
];

export const ModeSelect = ({ data, onSelect, onExit }) => {
    const compact = useCompact(639);
    const nome = [data?.utente?.nome, data?.utente?.cognome].filter(Boolean).join(' ');
    return (
        <div className="h-screen w-full bg-[var(--paper)] overflow-y-auto font-sans">
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col" style={{ minHeight: '100%', paddingTop: compact ? 'calc(20px + env(safe-area-inset-top))' : 48, paddingBottom: compact ? 'calc(24px + env(safe-area-inset-bottom))' : 48 }}>
                <div className="flex items-center justify-between rise">
                    <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.32em] text-[color:var(--ink)]"><UrbiosLogo size={26} />URBIOS</span>
                    {onExit && <button onClick={onExit} className="home-quiet" aria-label="Esci"><i className="ph ph-sign-out"></i>{!compact && <span>Esci</span>}</button>}
                </div>
                <div className="flex-1 flex flex-col justify-center py-10">
                    <p className="text-sm text-[color:var(--muted)] mb-1 rise">{nome ? `Ciao ${nome}` : 'Ciao'}</p>
                    <h1 className="display text-[30px] sm:text-[40px] text-[color:var(--ink)] mb-8 rise">Dove vuoi lavorare?</h1>
                    <div className="home-list stagger flex flex-col gap-2">
                        {AREAS.map((a) => (
                            <button key={a.id} type="button" onClick={() => onSelect(a.id)} className="patient-row group">
                                <span className="patient-avatar">{a.icon}</span>
                                <span className="min-w-0 flex-1 text-left font-semibold text-[16px] text-[color:var(--ink)] truncate">{a.title}</span>
                                <i className="ph ph-arrow-right text-[color:var(--muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--ink)]"></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
