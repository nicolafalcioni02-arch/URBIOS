import React from 'react';

export const FloatingActions = ({ setIsAnalysisOpen, setIsPrintReportOpen, setIsSmartOpen }) => {
    return (
        <div className="fab-container no-print">
            {/* Pulsante 1: Analisi Avanzata (Microscopio) */}
            <button
                className="t-fab-print"
                onClick={() => setIsAnalysisOpen(true)}
                style={{ position: 'relative', bottom: 'auto', right: 'auto', background: 'linear-gradient(135deg, #121317 0%, #434345 100%)' }}
                title="Analisi Nutrizionale Avanzata"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18h8" />
                    <path d="M3 22h18" />
                    <path d="M14 22a7 7 0 1 0 0-14h-1" />
                    <path d="M9 14h2" />
                    <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
                    <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                </svg>
            </button>

            {/* Pulsante 2: Smart Chart Maker (Plot/Grafico) */}
            <button
                className="t-fab-print"
                onClick={() => setIsSmartOpen(true)}
                style={{ position: 'relative', bottom: 'auto', right: 'auto', background: 'linear-gradient(135deg, #1F8A5B 0%, #16694A 100%)' }}
                title="Smart Chart Maker"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M18 9l-5 5-3-3-4 4" />
                    <circle cx="18" cy="9" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="14" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="11" r="1.5" fill="currentColor" />
                    <circle cx="6" cy="15" r="1.5" fill="currentColor" />
                </svg>
            </button>

            {/* Pulsante 3: Stampa Documento (Stampante) */}
            <button
                className="t-fab-print"
                onClick={() => setIsPrintReportOpen(true)}
                style={{ position: 'relative', bottom: 'auto', right: 'auto', background: '#FFFFFF', color: '#121317', border: '1px solid #E6E4DE' }}
                title="Stampa Documento"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
            </button>
        </div>
    );
};
