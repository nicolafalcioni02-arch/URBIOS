import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { analyzeScheda } from '../logic/analysis';
import { MuscleBars } from './MuscleBars';
import { WeekLoadChart } from './WeekLoadChart';
import { Card, Table, n1 } from '../tools/ui';
import { fmtDuration } from '../logic/science/parse';

const COLORS = { info: ['#EAF3FF', '#0A57B5', 'ℹ'], warn: ['#FFF4DD', '#8A5A00', '⚠'], alert: ['#FFE5E3', '#B3261E', '⛔'] };
const kg = (x) => (x >= 1000 ? `${n1(x / 1000, 2)} t` : x ? `${Math.round(x)} kg` : '—');

// Cruscotto di analisi della scheda: serve al professionista per controllare volume, intensità, carico e coerenza con l'obiettivo.
export const AnalysisModal = ({ weeks, header, massimali, profile, onClose }) => {
    const A = useMemo(() => analyzeScheda({ weeks, header, massimali, profile }), [weeks, header, massimali, profile]);
    const [sel, setSel] = useState(A.weeks[0] ? A.weeks[0].id : null);
    const W = A.weeks.find((w) => w.id === sel) || A.weeks[0];
    const warns = A.warnings;

    return ReactDOM.createPortal(
        <div className="t-modal-overlay" style={{ display: 'flex', zIndex: 25000 }} onClick={onClose}>
            <div
                className="t-modal-card"
                style={{ width: 1040, maxWidth: '96vw', height: '90vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 8px' }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Analisi della scheda</h2>
                        <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>
                            {A.goal ? A.goal.label : 'Obiettivo non scelto'}
                            {A.level ? ` · livello ${A.level}` : ''} ·{' '}
                            {profile && profile.weightKg ? `${profile.weightKg} kg` : 'peso del cliente non disponibile (le kcal non si calcolano)'}
                        </div>
                    </div>
                    <button onClick={onClose} className="t-icon-btn" style={{ width: 40, height: 40, background: '#F5F5F7', border: 'none' }}>
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 28px 28px' }}>
                    {(!A.goal || !A.level) && (
                        <div style={{ background: '#FFF4DD', color: '#8A5A00', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                            Scegli <b>tipo di obiettivo</b> e <b>livello</b> nell'intestazione della scheda: l'analisi confronterà il volume con le fasce
                            indicate e controllerà ripetizioni e recuperi.
                        </div>
                    )}

                    <Card
                        title={`Avvisi (${warns.length})`}
                        hint="Indicazioni di supporto alla programmazione basate sulla letteratura: la decisione resta del professionista."
                    >
                        {warns.length === 0 && (
                            <div style={{ fontSize: 13, color: '#1E7B34' }}>✓ Nessun avviso: volume, carico e distribuzione sono nelle fasce indicate.</div>
                        )}
                        {warns.slice(0, 40).map((w, i) => {
                            const [bg, fg, ic] = COLORS[w.level];
                            return (
                                <div
                                    key={i}
                                    style={{ background: bg, color: fg, borderRadius: 10, padding: '7px 11px', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}
                                >
                                    {ic} <b>{w.weekTitle}:</b> {w.text}
                                </div>
                            );
                        })}
                        {warns.length > 40 && <div style={{ fontSize: 12, color: '#86868B' }}>… e altri {warns.length - 40} avvisi.</div>}
                    </Card>

                    {A.weeks.length > 0 && (
                        <Card
                            title="Andamento settimanale"
                            hint="Carico = RPE della seduta × minuti (sRPE). ACWR = carico della settimana ÷ media delle 4 precedenti (zona ottimale 0,8-1,3). Barra arancio = scarico, rossa = picco."
                        >
                            <WeekLoadChart weeks={A.weeks} />
                            <Table
                                small
                                head={[
                                    'Settimana',
                                    'Giorni',
                                    'Serie',
                                    'Volume',
                                    'Intens. media',
                                    'RPE medio',
                                    'Durata',
                                    'kcal',
                                    'Carico',
                                    'Monotonia',
                                    'Strain',
                                    'ACWR',
                                ]}
                                rows={A.weeks.map((w) => [
                                    <span key={w.id} style={{ cursor: 'pointer', color: '#007AFF', fontWeight: 700 }} onClick={() => setSel(w.id)}>
                                        {w.title}
                                    </span>,
                                    w.trainingDays,
                                    w.workSets,
                                    kg(w.volumeLoad),
                                    w.avgPct !== null ? `${Math.round(w.avgPct)}%` : '—',
                                    w.avgRpe !== null ? n1(w.avgRpe) : '—',
                                    fmtDuration(w.minutes * 60),
                                    w.kcal !== null ? Math.round(w.kcal) : '—',
                                    Math.round(w.weekLoad),
                                    w.monotony !== null ? n1(w.monotony, 2) : '—',
                                    w.strain !== null ? Math.round(w.strain) : '—',
                                    w.acwr !== null ? n1(w.acwr, 2) : '—',
                                ])}
                            />
                        </Card>
                    )}

                    {W && (
                        <>
                            <Card
                                title={`Volume per gruppo muscolare — ${W.title}`}
                                hint="Serie di lavoro (il riscaldamento non conta). Gli esercizi cardio sono esclusi."
                            >
                                <MuscleBars muscles={W.muscles} goal={A.goal} level={A.level} deload={W.kind === 'deload'} />
                            </Card>
                            <Card title={`Giorni — ${W.title}`}>
                                <Table
                                    small
                                    head={['Giorno', 'Serie', 'Volume', 'Intens.', 'RPE seduta', 'Durata', 'Densità', 'Carico', 'kcal', 'Cardio']}
                                    rows={W.days.map((d, i) => [
                                        d.title || `Giorno ${i + 1}`,
                                        d.workSets,
                                        kg(d.volumeLoad),
                                        d.avgPct !== null ? `${Math.round(d.avgPct)}%` : '—',
                                        d.sessionRpe !== null ? n1(d.sessionRpe) : '—',
                                        d.trains ? `${Math.round(d.minutes)} min${d.overridden ? '' : ' ~'}` : '—',
                                        d.density ? `${n1(d.density, 0)} kg/min` : '—',
                                        Math.round(d.loadAU),
                                        d.kcal !== null ? Math.round(d.kcal) : '—',
                                        d.cardioMin ? `${Math.round(d.cardioMin)} min` : '—',
                                    ])}
                                />
                            </Card>
                        </>
                    )}
                    <div style={{ fontSize: 11, color: '#86868B', lineHeight: 1.5 }}>
                        Metodo: serie dirette = serie di lavoro sul muscolo principale dell'esercizio; serie ponderate = dirette + 50% delle serie sui muscoli
                        secondari (muscoli da free-exercise-db). Durata stimata = tempo sotto tensione (tempo di esecuzione o 4 s/ripetizione) + recuperi + 45 s
                        di cambio attrezzo + minuti extra. Energia = MET × peso × ore (Compendium of Physical Activities). Sono stime di supporto, non misure.
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
