import React, { useEffect, useState } from 'react';
import { DayEditor } from './DayEditor';
import { move } from './trainingGuidedLogic';

// Passo 2 — Scheda: settimane → sedute → esercizi, tutto nella stessa pagina.
// Settimane e sedute si riordinano trascinando (o con le frecce, comode sul telefono).

const Tabs = ({ items, current, onSelect, onMove, onAdd, addLabel, badge }) => {
    const [dragId, setDragId] = useState(null);
    const [overId, setOverId] = useState(null);
    const idx = Math.min(current, items.length - 1);
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1 min-w-0">
                {items.map((it, i) => (
                    <button
                        key={it.id}
                        draggable
                        onDragStart={() => setDragId(it.id)}
                        onDragEnd={() => {
                            setDragId(null);
                            setOverId(null);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOverId(it.id);
                        }}
                        onDrop={() => {
                            const from = items.findIndex((x) => x.id === dragId);
                            if (from >= 0) onMove(from, i);
                            setDragId(null);
                            setOverId(null);
                        }}
                        className={`dg-chip row ${i === idx ? 'on' : ''}`}
                        style={{ opacity: dragId === it.id ? 0.4 : 1, outline: overId === it.id && dragId && dragId !== it.id ? '2px dashed var(--ink)' : 'none', outlineOffset: 2 }}
                        onClick={() => onSelect(i)}
                    >
                        {it.title || 'Senza nome'}
                        {badge && badge(it) && <em className="dg-badge">{badge(it)}</em>}
                    </button>
                ))}
                <button className="dg-chip row" onClick={onAdd}>
                    <i className="ph ph-plus"></i> {addLabel}
                </button>
            </div>
            {items.length > 1 && (
                <div className="flex gap-1 flex-none">
                    <button className="dg-ghost" title="Sposta prima" aria-label={`Sposta prima: ${addLabel}`} disabled={idx === 0} style={idx === 0 ? { opacity: 0.3 } : undefined} onClick={() => onMove(idx, idx - 1)}>
                        <i className="ph ph-arrow-left"></i>
                    </button>
                    <button className="dg-ghost" title="Sposta dopo" aria-label={`Sposta dopo: ${addLabel}`} disabled={idx === items.length - 1} style={idx === items.length - 1 ? { opacity: 0.3 } : undefined} onClick={() => onMove(idx, idx + 1)}>
                        <i className="ph ph-arrow-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export const ProgramStep = ({ weeks, setWeeks, ops, exerciseDB, suggestions, massimali, analysisCtx, onExercises, onTools, onProgression, onAnalysis, onSetup, onNext }) => {
    const [wi, setWi] = useState(0);
    const [di, setDi] = useState(0);
    const [confirmDel, setConfirmDel] = useState(null); // 'week' | 'day'

    const week = weeks[Math.min(wi, weeks.length - 1)];
    const day = week && week.days[Math.min(di, week.days.length - 1)];

    // cambiando settimana si resta sulla stessa posizione di seduta, se esiste
    useEffect(() => {
        if (week && di > week.days.length - 1) setDi(Math.max(0, week.days.length - 1));
        setConfirmDel(null);
    }, [wi, di, weeks.length]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!weeks.length) {
        return (
            <div className="max-w-xl mx-auto text-center dg-in py-10">
                <div className="mx-auto w-16 h-16 rounded-full grid place-items-center text-3xl" style={{ background: 'var(--soft)' }}>
                    <i className="ph ph-barbell"></i>
                </div>
                <h2 className="dg-h mt-5">Costruiamo la scheda</h2>
                <p className="dg-sub">Aggiungi la prima settimana: poi le sedute e gli esercizi.</p>
                <button className="vw-next mt-6" onClick={() => ops.addNewWeek()}>
                    <i className="ph ph-plus"></i> Aggiungi la prima settimana
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto dg-in">
            {/* strumenti del passo */}
            <div className="dg-toolbar" style={{ marginTop: 0 }}>
                <button className="dg-sm" onClick={onExercises}>
                    <i className="ph ph-list-magnifying-glass"></i> Database esercizi
                </button>
                <button className="dg-sm" onClick={onTools}>
                    <i className="ph ph-calculator"></i> Massimali e calcolatori
                </button>
                <button className="dg-sm" onClick={onProgression}>
                    <i className="ph ph-trend-up"></i> Genera progressione
                </button>
                <button className="dg-sm" onClick={onAnalysis}>
                    <i className="ph ph-chart-bar"></i> Analisi della scheda
                </button>
            </div>

            {/* settimane */}
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mt-5 mb-2">Settimana</p>
            <Tabs
                items={weeks}
                current={wi}
                onSelect={(i) => setWi(i)}
                onMove={(from, to) => {
                    setWeeks((w) => move(w, from, to));
                    setWi(to);
                }}
                onAdd={() => {
                    ops.addNewWeek();
                    setWi(weeks.length);
                    setDi(0);
                }}
                addLabel="Settimana"
                badge={(w) => (w.kind === 'deload' ? 'scarico' : '')}
            />
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <input className="fld !w-auto min-w-[170px]" value={week.title} onChange={(e) => ops.updateWeekField(week.id, 'title', e.target.value)} aria-label="Nome della settimana" />
                <label className="flex items-center gap-2 text-[13.5px] cursor-pointer" title="Meno volume e/o carico per recuperare">
                    <input type="checkbox" className="w-4 h-4" checked={week.kind === 'deload'} onChange={(e) => ops.updateWeekField(week.id, 'kind', e.target.checked ? 'deload' : '')} />
                    Scarico
                </label>
                <button className="dg-sm" onClick={() => { ops.duplicateWeek(week.id); setWi(weeks.length); }}>
                    <i className="ph ph-copy"></i> Duplica
                </button>
                {confirmDel === 'week' ? (
                    <>
                        <button className="dg-sm" style={{ color: '#C2413A' }} onClick={() => { ops.removeWeek(week.id); setWi(0); setConfirmDel(null); }}>
                            Sì, elimina la settimana
                        </button>
                        <button className="dg-sm" onClick={() => setConfirmDel(null)}>
                            Annulla
                        </button>
                    </>
                ) : (
                    <button className="dg-sm" onClick={() => setConfirmDel('week')}>
                        <i className="ph ph-trash"></i> Elimina
                    </button>
                )}
            </div>

            {/* sedute */}
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mt-6 mb-2">Seduta</p>
            {week.days.length > 0 ? (
                <Tabs
                    items={week.days}
                    current={di}
                    onSelect={(i) => setDi(i)}
                    onMove={(from, to) => {
                        setWeeks((ws) => ws.map((w) => (w.id === week.id ? { ...w, days: move(w.days, from, to) } : w)));
                        setDi(to);
                    }}
                    onAdd={() => {
                        ops.addDay(week.id);
                        setDi(week.days.length);
                    }}
                    addLabel="Seduta"
                />
            ) : (
                <button className="dg-add" onClick={() => ops.addDay(week.id)}>
                    <i className="ph ph-plus-circle"></i> Aggiungi la prima seduta
                </button>
            )}

            {day && (
                <section className="dg-card">
                    <DayEditor week={week} day={day} exerciseDB={exerciseDB} suggestions={suggestions} massimali={massimali} analysisCtx={analysisCtx} ops={ops} />
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[color:var(--line)]">
                        <button className="dg-sm" onClick={() => { ops.duplicateDay(week.id, day.id); setDi(week.days.length); }}>
                            <i className="ph ph-copy"></i> Duplica la seduta
                        </button>
                        {confirmDel === 'day' ? (
                            <>
                                <button className="dg-sm" style={{ color: '#C2413A' }} onClick={() => { ops.removeDay(week.id, day.id); setDi(0); setConfirmDel(null); }}>
                                    Sì, elimina la seduta
                                </button>
                                <button className="dg-sm" onClick={() => setConfirmDel(null)}>
                                    Annulla
                                </button>
                            </>
                        ) : (
                            <button className="dg-sm" onClick={() => setConfirmDel('day')}>
                                <i className="ph ph-trash"></i> Elimina la seduta
                            </button>
                        )}
                    </div>
                </section>
            )}

            <div className="dg-foot">
                <button className="vw-back" onClick={onSetup}>
                    <i className="ph ph-arrow-left"></i> Obiettivo
                </button>
                <button className="vw-next" onClick={onNext}>
                    Verifica e consegna <i className="ph ph-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};
