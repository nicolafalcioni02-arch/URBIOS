import React, { useEffect, useRef, useState } from 'react';
import { DayEditorModal } from './dayEditor/DayEditorModal';
import { TrainingHeaderCard } from './TrainingHeaderCard';
import { analyzeDay } from '../logic/analysis';

// Vista del Training per telefono e tablet: tutto a portata di pollice.
// In alto le settimane, al centro i giorni come schede grandi (un tocco per modificarli),
// in basso le azioni che servono davvero. Niente indice laterale.
export const TrainingCompact = ({
    weeks,
    header,
    setHeader,
    activeDayInfo,
    setActiveDayInfo,
    ops,
    analysisCtx,
    exerciseDB,
    suggestions,
    massimali,
    onOpenAnalysis,
    onOpenTools,
    onOpenProgression,
    onPrint,
    onOpenSchede,
    onOpenExercises,
}) => {
    const [weekId, setWeekId] = useState(weeks[0] && weeks[0].id);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const prevLen = useRef(weeks.length);

    // una settimana appena aggiunta si apre da sola; se quella aperta sparisce si torna alla prima
    useEffect(() => {
        if (weeks.length > prevLen.current) setWeekId(weeks[weeks.length - 1].id);
        else if (!weeks.some((w) => w.id === weekId)) setWeekId(weeks[0] && weeks[0].id);
        prevLen.current = weeks.length;
    }, [weeks, weekId]);

    const week = weeks.find((w) => w.id === weekId) || weeks[0];
    const wIndex = week ? weeks.indexOf(week) : 0;

    const askDelete = (what, fn) => {
        if (window.confirm(`Eliminare ${what}?`)) fn();
    };

    const dayInfo = (d) => {
        const A = analyzeDay(d, analysisCtx);
        const named = d.exercises.filter((e) => e.name && e.name.trim());
        return { A, named, nEx: named.length };
    };

    return (
        <div className="t-c-root">
            {/* Settimane */}
            <div className="t-c-weeks no-scrollbar">
                {weeks.map((w, i) => (
                    <button key={w.id} onClick={() => setWeekId(w.id)} className={`t-c-chip ${week && w.id === week.id ? 'on' : ''}`}>
                        {w.title || `Settimana ${i + 1}`}
                        {w.kind === 'deload' && <span className="t-c-dot" title="Settimana di scarico"></span>}
                    </button>
                ))}
                <button onClick={ops.addNewWeek} className="t-c-chip add" aria-label="Aggiungi una settimana">
                    <i className="ph-bold ph-plus"></i>
                </button>
            </div>

            <div className="t-c-body">
                {/* Dati della scheda: chiusi di default, un tocco per aprirli */}
                <button className="t-c-details" onClick={() => setDetailsOpen(!detailsOpen)} aria-expanded={detailsOpen}>
                    <span className="min-w-0">
                        <span className="t-c-details-title">{header.titolo || 'Dati della scheda'}</span>
                        <span className="t-c-details-sub">{[header.cliente, header.obiettivo].filter(Boolean).join(' · ') || 'Titolo, obiettivo, livello'}</span>
                    </span>
                    <i className={`ph ph-caret-down ${detailsOpen ? 'open' : ''}`}></i>
                </button>
                <div className="t-c-collapse" style={{ gridTemplateRows: detailsOpen ? '1fr' : '0fr' }}>
                    <div style={{ overflow: 'hidden' }}>
                        <TrainingHeaderCard header={header} setHeader={setHeader} />
                    </div>
                </div>

                {/* Giorni della settimana */}
                {week && (
                    <div className="t-c-days" key={week.id}>
                        {week.days.map((d, i) => {
                            const { A, named, nEx } = dayInfo(d);
                            return (
                                <div key={d.id} className="t-c-day" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <button className="t-c-day-main" onClick={() => setActiveDayInfo({ weekId: week.id, dayId: d.id })}>
                                        <span className="t-c-day-num">{i + 1}</span>
                                        <span className="min-w-0 flex-1 text-left">
                                            <span className="t-c-day-title">{d.title || `Giorno ${i + 1}`}</span>
                                            <span className="t-c-day-meta">
                                                {nEx === 0 ? 'Ancora vuoto, tocca per iniziare' : `${nEx} ${nEx === 1 ? 'esercizio' : 'esercizi'}`}
                                                {A.trains && ` · ${A.workSets} serie · ~${Math.round(A.minutes)} min`}
                                            </span>
                                            {nEx > 0 && <span className="t-c-day-names">{named.slice(0, 3).map((e) => e.name).join(' · ')}</span>}
                                        </span>
                                        <i className="ph ph-caret-right"></i>
                                    </button>
                                    <div className="t-c-day-tools">
                                        <button onClick={() => ops.duplicateDay(week.id, d.id)} aria-label="Duplica il giorno">
                                            <i className="ph ph-copy"></i>
                                        </button>
                                        <button onClick={() => askDelete('questo giorno', () => ops.removeDay(week.id, d.id))} aria-label="Elimina il giorno" className="del">
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button className="t-c-add-day" onClick={() => ops.addDay(week.id)}>
                            <i className="ph-bold ph-plus"></i> Aggiungi un giorno
                        </button>

                        <div className="t-c-week-tools">
                            <button onClick={() => ops.duplicateWeek(week.id)}>
                                <i className="ph ph-copy"></i> Duplica la settimana
                            </button>
                            {weeks.length > 1 && (
                                <button className="del" onClick={() => askDelete(`la settimana ${wIndex + 1}`, () => ops.removeWeek(week.id))}>
                                    <i className="ph ph-trash"></i> Elimina
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Azioni principali, a portata di pollice */}
            <nav className="t-c-bar" aria-label="Azioni della scheda">
                <button onClick={onOpenAnalysis}>
                    <i className="ph ph-chart-bar"></i>
                    <span>Analisi</span>
                </button>
                <button onClick={onOpenProgression}>
                    <i className="ph ph-trend-up"></i>
                    <span>Progressione</span>
                </button>
                <button onClick={onOpenTools}>
                    <i className="ph ph-calculator"></i>
                    <span>Calcolatori</span>
                </button>
                <button onClick={onPrint}>
                    <i className="ph ph-printer"></i>
                    <span>Stampa</span>
                </button>
                <button onClick={() => setMoreOpen(true)}>
                    <i className="ph ph-dots-three-outline"></i>
                    <span>Altro</span>
                </button>
            </nav>

            {moreOpen && (
                <div className="sheet-back" onClick={() => setMoreOpen(false)}>
                    <div className="sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="t-c-more">
                            <button
                                onClick={() => {
                                    setMoreOpen(false);
                                    onOpenSchede();
                                }}
                            >
                                <i className="ph ph-folder-notch"></i>
                                <span>
                                    Schede salvate
                                    <small>Apri, duplica o crea una nuova scheda</small>
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setMoreOpen(false);
                                    onOpenExercises();
                                }}
                            >
                                <i className="ph ph-database"></i>
                                <span>
                                    Gestione esercizi
                                    <small>Database, foto e catalogo</small>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeDayInfo &&
                (() => {
                    const wk = weeks.find((w) => w.id === activeDayInfo.weekId);
                    const day = wk && wk.days.find((d) => d.id === activeDayInfo.dayId);
                    if (!day) return null;
                    return (
                        <DayEditorModal
                            week={wk}
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
    );
};
