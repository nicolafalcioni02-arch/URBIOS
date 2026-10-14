import React from 'react';

const TABS = [
    { id: 'dieta', label: 'Dieta', icon: 'ph-fork-knife' },
    { id: 'training', label: 'Training', icon: 'ph-barbell' },
];

// Dopo il salvataggio della visita: Dieta e Training sono due lavori distinti, si passa dall'uno all'altro quando si vuole.
export const PlansWorkspace = ({ patient, active, setActive, onDone, children }) => (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
        <div className="vw-steps sticky top-0 z-30 px-4 md:px-8 py-3">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[color:var(--muted)] leading-tight">Visita salvata · {patient.nome} {patient.cognome}</p>
                    <div className="vw-seg mt-1.5" role="tablist">
                        {TABS.map((t) => (
                            <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)} className={active === t.id ? 'is-on' : ''}>
                                <i className={`ph ${t.icon}`}></i>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onDone} className="vw-next vw-save" style={{ minWidth: 0, height: 42 }}>
                    <i className="ph-bold ph-check"></i>
                    <span>Fine</span>
                </button>
            </div>
        </div>
        <div className="flex-1">{children}</div>
    </div>
);
