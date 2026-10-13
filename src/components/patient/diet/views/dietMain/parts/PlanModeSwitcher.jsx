import React from 'react';

export const PlanModeSwitcher = ({ setIsChangeVisitOpen, visitaAttiva }) => {
    return visitaAttiva?.note?.includes('Solo Dieta') ? (
        /* RAMO DIETA INDIPENDENTE: Ora avvolto in un div per ospitare futuri nodi in sicurezza */
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#007AFF', background: '#E6F0FF', padding: '6px 12px', borderRadius: '10px' }}>
                Dieta Indipendente
            </span>
        </div>
    ) : (
        /* RAMO DIETA ASSOCIATA (CON INGRANAGGIO) */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#00C853', background: '#E8F5E9', padding: '6px 12px', borderRadius: '10px' }}>
                Dieta Associata a Visita ({visitaAttiva?.data || 'Nessuna data'})
            </span>
            <button
                onClick={() => setIsChangeVisitOpen(true)}
                className="t-icon-btn"
                style={{ margin: 0, width: '32px', height: '32px', background: '#F5F5F7', border: 'none', borderRadius: '8px' }}
                title="Cambia Visita Associata"
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </button>
        </div>
    );
};
