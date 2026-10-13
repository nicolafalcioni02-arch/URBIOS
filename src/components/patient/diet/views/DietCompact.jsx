import React, { useEffect, useRef, useState } from 'react';
import { calculateTotals } from '../logic/dietTotals';
import { MacroProgressBar } from '../ui/MacroProgressBar';
import { AnalysisStatsPanel } from './dietMain/parts/AnalysisStatsPanel';
import { SavedReportsArchive } from './dietMain/parts/SavedReportsArchive';

// Obiettivi del giorno (stessa logica dell'editor del pasto): kcal e grammi di proteine, carboidrati, grassi
const dayTargets = (day, calcData, targets) => {
    const cfg =
        calcData.matrixMode === 'daily' && calcData.dailyConfigs && calcData.dailyConfigs[day.id]
            ? calcData.dailyConfigs[day.id]
            : { macroTargets: calcData.macroTargets, distribution: calcData.distribution };
    const kcal = (day.targets && day.targets.kcal) || targets.kcal || 0;
    const pPct = (day.targets && day.targets.p) || (cfg.macroTargets && cfg.macroTargets.p) || 0;
    const cPct = (day.targets && day.targets.c) || (cfg.macroTargets && cfg.macroTargets.c) || 0;
    const fPct = (day.targets && day.targets.f) || (cfg.macroTargets && cfg.macroTargets.f) || 0;
    return { kcal, p: (kcal * pPct) / 100 / 4, c: (kcal * cPct) / 100 / 4, f: (kcal * fPct) / 100 / 9 };
};

const sumDay = (day) =>
    (day.meals || []).reduce(
        (acc, m) => {
            const t = calculateTotals(m.items);
            return { kcal: acc.kcal + t.kcal, p: acc.p + t.p, c: acc.c + t.c, f: acc.f + t.f };
        },
        { kcal: 0, p: 0, c: 0, f: 0 }
    );

// Vista della Dieta per telefono e tablet: i giorni in alto, i pasti come schede grandi (un tocco per compilarli),
// le azioni che servono davvero in una barra in basso.
export const DietCompact = ({
    dietDays,
    calcData,
    targets,
    patient,
    visitaAttiva,
    savedReports,
    deleteReport,
    addNewDay,
    duplicateDay,
    removeDay,
    updateDayTitle,
    setActiveMealInfo,
    onSave,
    onAnalysis,
    onChart,
    onPrint,
    onSetup,
    onDatabase,
    onChangeVisit,
    onBackToMenu,
}) => {
    const [dayId, setDayId] = useState(dietDays[0] && dietDays[0].id);
    const [moreOpen, setMoreOpen] = useState(false);
    const [chartsOpen, setChartsOpen] = useState(false);
    const prevLen = useRef(dietDays.length);

    // un giorno appena aggiunto si apre da solo; se quello aperto sparisce si torna al primo
    useEffect(() => {
        if (dietDays.length > prevLen.current) setDayId(dietDays[dietDays.length - 1].id);
        else if (!dietDays.some((d) => d.id === dayId)) setDayId(dietDays[0] && dietDays[0].id);
        prevLen.current = dietDays.length;
    }, [dietDays, dayId]);

    const configured = !!(targets && targets.isConfigured);
    const day = dietDays.find((d) => d.id === dayId) || dietDays[0];
    const independent = visitaAttiva && visitaAttiva.note && visitaAttiva.note.includes('Solo Dieta');

    const tot = day ? sumDay(day) : null;
    const tg = day ? dayTargets(day, calcData, targets) : null;

    return (
        <div className="d-c-root">
            {!configured ? (
                <div className="d-c-lock rise">
                    <h2>Prima gli obiettivi</h2>
                    <p>Servono peso, fabbisogno e ripartizione dei pasti: bastano un paio di minuti, poi il piano si compila da solo a pezzi.</p>
                    <button className="d-c-primary" onClick={onSetup}>
                        Imposta gli obiettivi
                        <i className="ph-bold ph-arrow-right"></i>
                    </button>
                </div>
            ) : (
                <>
                    {/* Giorni */}
                    <div className="d-c-days no-scrollbar">
                        {dietDays.map((d, i) => (
                            <button key={d.id} onClick={() => setDayId(d.id)} className={`d-c-chip ${day && d.id === day.id ? 'on' : ''}`}>
                                {d.title || `Giorno ${i + 1}`}
                            </button>
                        ))}
                        <button onClick={addNewDay} className="d-c-chip add" aria-label="Aggiungi un giorno">
                            <i className="ph-bold ph-plus"></i>
                        </button>
                    </div>

                    <div className="d-c-body">
                        {!day ? (
                            <div className="d-c-lock rise">
                                <h2>Nessun giorno</h2>
                                <p>Aggiungi il primo giorno: i pasti arrivano dalla ripartizione che hai impostato.</p>
                                <button className="d-c-primary" onClick={addNewDay}>
                                    Aggiungi il primo giorno
                                    <i className="ph-bold ph-plus"></i>
                                </button>
                            </div>
                        ) : (
                            <div key={day.id}>
                                {/* Riepilogo del giorno rispetto agli obiettivi */}
                                <section className="d-c-sum rise">
                                    <input
                                        className="d-c-day-title"
                                        value={day.title}
                                        onChange={(e) => updateDayTitle(day.id, e.target.value)}
                                        placeholder="Nome del giorno"
                                        aria-label="Nome del giorno"
                                    />
                                    <div className="d-c-kcal">
                                        <span className="d-c-kcal-n">{tot.kcal.toFixed(0)}</span>
                                        <span className="d-c-kcal-of">/ {tg.kcal.toFixed(0)} kcal</span>
                                    </div>
                                    <div className="d-c-bars">
                                        <MacroProgressBar label="Pro" current={tot.p} target={tg.p} hexColor="#1F8A5B" />
                                        <MacroProgressBar label="Car" current={tot.c} target={tg.c} hexColor="#121317" />
                                        <MacroProgressBar label="Fat" current={tot.f} target={tg.f} hexColor="#6E6D69" />
                                    </div>
                                </section>

                                {/* Pasti */}
                                <div className="d-c-meals stagger">
                                    {(day.meals || []).map((m, i) => {
                                        const t = calculateTotals(m.items);
                                        const n = m.items ? m.items.length : 0;
                                        const names = (m.items || [])
                                            .filter((x) => x.name)
                                            .slice(0, 3)
                                            .map((x) => x.name)
                                            .join(' · ');
                                        return (
                                            <button key={m.id} className="d-c-meal" onClick={() => setActiveMealInfo({ dayId: day.id, mealId: m.id })}>
                                                <span className="d-c-meal-num">{i + 1}</span>
                                                <span className="min-w-0 flex-1 text-left">
                                                    <span className="d-c-meal-title">{m.title || `Pasto ${i + 1}`}</span>
                                                    <span className="d-c-meal-meta">
                                                        {n === 0 ? 'Vuoto, tocca per compilarlo' : `${n} ${n === 1 ? 'alimento' : 'alimenti'} · P ${t.p.toFixed(0)} C ${t.c.toFixed(0)} F ${t.f.toFixed(0)}`}
                                                    </span>
                                                    {names && <span className="d-c-meal-names">{names}</span>}
                                                </span>
                                                <span className="d-c-meal-kcal">
                                                    <b>{t.kcal.toFixed(0)}</b>
                                                    <small>kcal</small>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="d-c-day-tools">
                                    <button onClick={() => duplicateDay(day.id)}>
                                        <i className="ph ph-copy"></i> Duplica il giorno
                                    </button>
                                    <button
                                        className="del"
                                        onClick={() => {
                                            if (window.confirm('Eliminare questo giorno?')) removeDay(day.id);
                                        }}
                                    >
                                        <i className="ph ph-trash"></i> Elimina
                                    </button>
                                </div>

                                {/* Analisi del giorno: chiusa di default */}
                                <button className="d-c-fold" onClick={() => setChartsOpen(!chartsOpen)} aria-expanded={chartsOpen}>
                                    <span>Analisi del giorno</span>
                                    <i className={`ph ph-caret-down ${chartsOpen ? 'open' : ''}`}></i>
                                </button>
                                {chartsOpen && (
                                    <div className="d-c-charts rise">
                                        <AnalysisStatsPanel analysisTargetId={day.id} dietDays={dietDays} />
                                    </div>
                                )}

                                {savedReports && savedReports.length > 0 && <SavedReportsArchive deleteReport={deleteReport} dietDays={dietDays} savedReports={savedReports} />}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Azioni principali, a portata di pollice */}
            <nav className="d-c-bar" aria-label="Azioni della dieta">
                <button onClick={onSave} disabled={!configured}>
                    <i className="ph ph-floppy-disk"></i>
                    <span>Salva</span>
                </button>
                <button onClick={onAnalysis} disabled={!configured}>
                    <i className="ph ph-microscope"></i>
                    <span>Analisi</span>
                </button>
                <button onClick={onChart} disabled={!configured}>
                    <i className="ph ph-chart-line-up"></i>
                    <span>Grafici</span>
                </button>
                <button onClick={onPrint} disabled={!configured}>
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
                        <p className="d-c-mode">
                            {independent ? 'Dieta indipendente' : `Dieta associata alla visita${visitaAttiva && visitaAttiva.data ? ` del ${visitaAttiva.data}` : ''}`}
                            {patient ? ` · ${patient.nome} ${patient.cognome}` : ''}
                        </p>
                        <div className="t-c-more">
                            <button
                                onClick={() => {
                                    setMoreOpen(false);
                                    onSetup();
                                }}
                            >
                                <i className="ph ph-sliders-horizontal"></i>
                                <span>
                                    Setup obiettivi
                                    <small>Peso, fabbisogno e ripartizione dei pasti</small>
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setMoreOpen(false);
                                    onDatabase();
                                }}
                            >
                                <i className="ph ph-database"></i>
                                <span>
                                    Database alimenti
                                    <small>Cerca, modifica e importa alimenti</small>
                                </span>
                            </button>
                            {!independent && (
                                <button
                                    onClick={() => {
                                        setMoreOpen(false);
                                        onChangeVisit();
                                    }}
                                >
                                    <i className="ph ph-calendar-check"></i>
                                    <span>
                                        Cambia visita associata
                                        <small>Collega il piano a un'altra visita</small>
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setMoreOpen(false);
                                    onBackToMenu();
                                }}
                            >
                                <i className="ph ph-arrow-u-up-left"></i>
                                <span>
                                    Cambia modalità
                                    <small>Torna alla scelta tra dieta associata e indipendente</small>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
