import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { VisitDetailContent } from './VisitDetailContent';

export const VisitDetailModal = ({ selectedVisit, setSelectedVisit, onOpenAnalisi, onPrintCharts, onOpenDiet, previousVisit, sesso, hasDiet, swap }) => {
    useEffect(() => {
        if (!selectedVisit) return undefined;
        const onKey = (e) => e.key === 'Escape' && setSelectedVisit(null);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectedVisit, setSelectedVisit]);

    if (!selectedVisit) return null;
    const date = new Date(selectedVisit.data);
    const title = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^./, (c) => c.toUpperCase());

    return ReactDOM.createPortal(
        <div className={`vd-back ${swap ? 'is-swap' : ''}`} onClick={() => setSelectedVisit(null)}>
            <div className={`vd-sheet ${swap ? `is-swap-${swap}` : ''}`} role="dialog" aria-modal="true" aria-label="Dettaglio visita" onClick={(e) => e.stopPropagation()}>
                <header className="vd-head">
                    <div className="min-w-0">
                        <h3 className="vd-title">{title}</h3>
                        <p className="vd-sub">{hasDiet ? 'Visita con piano alimentare' : 'Visita di controllo'}</p>
                    </div>
                    <button onClick={() => setSelectedVisit(null)} className="hs-icon" aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </header>

                <div className="vd-actions">
                    {onOpenAnalisi && (
                        <button onClick={() => onOpenAnalisi(selectedVisit)} className="vd-btn is-primary">
                            <i className="ph-bold ph-chart-pie-slice"></i>
                            Analisi clinica avanzata
                        </button>
                    )}
                    {hasDiet && onOpenDiet && (
                        <button onClick={() => onOpenDiet(selectedVisit)} className="vd-btn">
                            <i className="ph ph-leaf"></i>
                            Piano alimentare
                        </button>
                    )}
                    {onPrintCharts && (
                        <button onClick={() => onPrintCharts(selectedVisit)} className="vd-btn">
                            <i className="ph ph-printer"></i>
                            Stampa
                        </button>
                    )}
                </div>

                <div className="vd-scroll">
                    <VisitDetailContent selectedVisit={selectedVisit} previousVisit={previousVisit} sesso={sesso} />
                </div>
            </div>
        </div>,
        document.body
    );
};
