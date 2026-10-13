import React from 'react';
import { DayEditorModal } from './dayEditor/DayEditorModal';
import { TrainingHeaderCard } from './TrainingHeaderCard';

const tool = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: '1px solid #E6E4DE',
    background: '#fff',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#121317',
    cursor: 'pointer',
};

export const TrainingMainContent = ({
    activeDayInfo,
    weeks,
    header,
    setHeader,
    exerciseDB,
    suggestions,
    massimali,
    analysisCtx,
    ops,
    setActiveDayInfo,
    onOpenAnalysis,
    onOpenTools,
    onOpenProgression,
    onPrint,
}) => {
    return (
        <main className="t-main">
            <div className="t-container-wrapper" style={{ height: '100%' }}>
                {/* INTESTAZIONE CLIENTE E OBIETTIVO */}
                <TrainingHeaderCard header={header} setHeader={setHeader} />

                {/* STRUMENTI */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                    <button style={tool} onClick={onOpenAnalysis}>
                        <i className="ph ph-chart-bar"></i> Analisi della scheda
                    </button>
                    <button style={tool} onClick={onOpenProgression}>
                        <i className="ph ph-trend-up"></i> Genera progressione
                    </button>
                    <button style={tool} onClick={onOpenTools}>
                        <i className="ph ph-calculator"></i> Calcolatori e massimali
                    </button>
                    <button style={tool} onClick={onPrint}>
                        <i className="ph ph-printer"></i> Stampa
                    </button>
                </div>

                {!activeDayInfo && (
                    <div
                        style={{
                            width: '100%',
                            minHeight: 400,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6E6D69',
                            background: 'rgba(255,255,255,0.5)',
                            borderRadius: 24,
                            border: '2px dashed #E6E4DE',
                        }}
                    >
                        <i className="ph ph-hand-pointing" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}></i>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#121317' }}>Seleziona un Giorno</h3>
                        <p style={{ fontSize: 14 }}>Clicca su un giorno dall'indice a sinistra per compilare la scheda.</p>
                    </div>
                )}

                {activeDayInfo &&
                    (() => {
                        const week = weeks.find((w) => w.id === activeDayInfo.weekId);
                        const day = week && week.days.find((d) => d.id === activeDayInfo.dayId);
                        if (!day) return null;
                        return (
                            <DayEditorModal
                                week={week}
                                day={day}
                                exerciseDB={exerciseDB}
                                suggestions={suggestions}
                                massimali={massimali}
                                analysisCtx={analysisCtx}
                                ops={ops}
                                onClose={() => setActiveDayInfo(null)}
                            />
                        );
                    })()}
            </div>
        </main>
    );
};
