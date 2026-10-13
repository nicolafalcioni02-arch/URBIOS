import React from 'react';
import { DayEditorModal } from './dayEditor/DayEditorModal';
import { GOALS, LEVELS, goalById } from '../logic/science/guidelines';

const tool = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: '1px solid #E5E5EA',
    background: '#fff',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#1D1D1F',
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
    const goal = goalById(header.tipo);
    const set = (k) => (e) => setHeader({ ...header, [k]: e.target.value });

    return (
        <main style={{ flex: 1, position: 'relative', overflowY: 'auto', padding: '40px', background: '#F5F5F7' }}>
            <div className="t-container-wrapper" style={{ height: '100%' }}>
                {/* INTESTAZIONE CLIENTE E OBIETTIVO */}
                <div className="t-client-header-card">
                    <div className="t-input-floating">
                        <label>Titolo scheda</label>
                        <input type="text" value={header.titolo} onChange={set('titolo')} placeholder="Es. Mesociclo 1" />
                    </div>
                    <div className="t-input-floating">
                        <label>Cliente</label>
                        <input type="text" value={header.cliente} onChange={set('cliente')} placeholder="Nome Cognome" />
                    </div>
                    <div className="t-input-floating">
                        <label>Obiettivo (descrizione)</label>
                        <input type="text" value={header.obiettivo} onChange={set('obiettivo')} placeholder="Es. Ipertrofia e ricomposizione" />
                    </div>
                    <div className="t-input-floating">
                        <label>Data</label>
                        <input type="date" value={header.data} onChange={set('data')} />
                    </div>
                    <div className="t-input-floating">
                        <label>Tipo di obiettivo</label>
                        <select value={header.tipo || ''} onChange={set('tipo')}>
                            <option value="">— scegli —</option>
                            {GOALS.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <label>Livello del cliente</label>
                        <select value={header.livello || ''} onChange={set('livello')}>
                            <option value="">— scegli —</option>
                            {LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <label title="Riscaldamento generale + defaticamento, per stimare la durata delle sedute">Extra seduta (min)</label>
                        <input type="number" min="0" value={header.extraMin ?? 10} onChange={set('extraMin')} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                        {goal ? (
                            <>
                                <b>{goal.label}:</b> {goal.reps[0]}-{goal.reps[1]} ripetizioni · {goal.pct[0]}-{goal.pct[1]}% del massimale · recupero{' '}
                                {goal.rest[0]}-{goal.rest[1]} s · RPE {goal.rpe[0]}-{goal.rpe[1]}. {goal.hint}
                                {header.livello ? ` Livello: ${LEVELS.find((l) => l.id === header.livello).sessions}.` : ''}
                            </>
                        ) : (
                            <span style={{ color: '#86868B' }}>
                                Scegli il tipo di obiettivo e il livello: la scheda mostrerà le indicazioni di riferimento e controllerà volume, recuperi e
                                carico.
                            </span>
                        )}
                    </div>
                </div>

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
                            color: '#86868B',
                            background: 'rgba(255,255,255,0.5)',
                            borderRadius: 24,
                            border: '2px dashed #E5E5EA',
                        }}
                    >
                        <i className="ph ph-hand-pointing" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}></i>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1D1D1F' }}>Seleziona un Giorno</h3>
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
