import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayEditor } from './DayEditor';
import { move } from './trainingGuidedLogic';
import { useCompact } from '../../../../hooks/useCompact';
import { ActionSheet } from '../../../mobile/MobileChrome';

// Passo 2 — Scheda: settimane → sedute → esercizi, tutto nella stessa pagina.
// Settimane e sedute si riordinano trascinando (o con le frecce).
// Su telefono le azioni di settimana e seduta (sposta, duplica, scarico, elimina) stanno in un foglio dal basso, come nel resto dell'app.

const Tabs = ({ items, current, onSelect, onMove, onAdd, addLabel, badge, onMore, cls = '' }) => {
    const [dragId, setDragId] = useState(null);
    const [overId, setOverId] = useState(null);
    const idx = Math.min(current, items.length - 1);
    return (
        <div className={`flex items-center gap-2 ${cls}`}>
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
            {onMore ? (
                <button className="dg-ghost t-more" aria-label={`Azioni: ${addLabel}`} onClick={onMore}>
                    <i className="ph-bold ph-dots-three"></i>
                </button>
            ) : items.length > 1 && (
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
    const compact = useCompact(639);
    // foglio di azioni aperto su telefono; il token tiene separati un foglio e quello che lo sostituisce (es. la conferma)
    const [sheet, setSheet] = useState(null); // { kind: 'week' | 'day' | 'delWeek' | 'delDay', token }
    const openSheet = (kind) => setSheet({ kind, token: Date.now() + Math.random() });
    // la conferma si apre quando il foglio precedente ha finito di chiudersi: lo stesso tocco non la chiude subito
    const thenRename = (id, cur) => setTimeout(() => {
        const v = window.prompt('Nome della settimana', cur || '');
        if (v !== null) ops.updateWeekField(id, 'title', v);
    }, 280);
    const thenSheet = (kind) => setTimeout(() => openSheet(kind), 280);

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
            {!compact && <div className="dg-toolbar" style={{ marginTop: 0 }}>
                <button className="dg-sm" onClick={onExercises}>
                    <i className="ph ph-list-magnifying-glass"></i> {compact ? 'Esercizi' : 'Database esercizi'}
                </button>
                <button className="dg-sm" onClick={onTools}>
                    <i className="ph ph-calculator"></i> {compact ? 'Massimali' : 'Massimali e calcolatori'}
                </button>
                <button className="dg-sm" onClick={onProgression}>
                    <i className="ph ph-trend-up"></i> {compact ? 'Progressione' : 'Genera progressione'}
                </button>
                <button className="dg-sm" onClick={onAnalysis}>
                    <i className="ph ph-chart-bar"></i> {compact ? 'Analisi' : 'Analisi della scheda'}
                </button>
            </div>}

            {/* settimane */}
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mt-1 mb-2 t-lab">Settimana</p>
            {compact ? (
                <button className="t-weekpill" onClick={() => openSheet('weeks')}>
                    <span>{week.title || `Settimana ${wi + 1}`}{week.kind === 'deload' ? ' · scarico' : ''}</span>
                    <small>{weeks.length > 1 ? `${wi + 1} di ${weeks.length}` : ''}</small>
                    <i className="ph ph-caret-down"></i>
                </button>
            ) : (
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
                cls="t-tier-week"
                badge={(w) => (w.kind === 'deload' ? 'scarico' : '')}
                onMore={compact ? () => openSheet('week') : undefined}
            />
            )}
            {compact ? null : (
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
            )}

            {/* sedute */}
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mt-4 mb-2 t-lab">Seduta</p>
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
                    cls="t-tier-day"
                    onMore={compact ? () => openSheet('day') : undefined}
                />
            ) : (
                <button className="dg-add" onClick={() => ops.addDay(week.id)}>
                    <i className="ph ph-plus-circle"></i> Aggiungi la prima seduta
                </button>
            )}

            {day && (
                <section className="dg-card t-day-sec">
                    <DayEditor week={week} day={day} exerciseDB={exerciseDB} suggestions={suggestions} massimali={massimali} analysisCtx={analysisCtx} ops={ops} compact={compact} />
                    {!compact && (
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
                    )}
                </section>
            )}

            <div className="dg-foot">
                <button className="vw-back" onClick={onSetup} aria-label="Torna all'obiettivo">
                    <i className="ph ph-arrow-left"></i> <span>Obiettivo</span>
                </button>
                <button className="vw-next" onClick={onNext}>
                    {compact ? 'Consegna' : 'Verifica e consegna'} <i className="ph ph-arrow-right"></i>
                </button>
            </div>

            {sheet && (() => {
                const wIdx = weeks.indexOf(week);
                const dIdx = day ? week.days.indexOf(day) : -1;
                const moveWeek = (to) => {
                    setWeeks((w) => move(w, wIdx, to));
                    setWi(to);
                };
                const moveDay = (to) => {
                    setWeeks((ws) => ws.map((w) => (w.id === week.id ? { ...w, days: move(w.days, dIdx, to) } : w)));
                    setDi(to);
                };
                const cfg = {
                    weeks: {
                        title: 'Settimane',
                        subtitle: 'Scegli quale modificare',
                        groups: [
                            weeks.map((w, i) => ({ label: w.title || `Settimana ${i + 1}`, icon: i === wIdx ? 'ph-check-circle' : 'ph-circle', note: w.kind === 'deload' ? 'scarico' : '', onClick: () => setWi(i) })),
                            [
                                { label: 'Nuova settimana', icon: 'ph-plus', onClick: () => { ops.addNewWeek(); setWi(weeks.length); setDi(0); } },
                                { label: 'Opzioni di questa settimana', icon: 'ph-dots-three', onClick: () => thenSheet('week') },
                            ],
                        ],
                    },
                    week: {
                        title: week.title || `Settimana ${wIdx + 1}`,
                        subtitle: `${week.days.length} ${week.days.length === 1 ? 'seduta' : 'sedute'}${week.kind === 'deload' ? ' · scarico' : ''}`,
                        groups: [
                            [
                                { label: 'Sposta prima', icon: 'ph-arrow-left', disabled: wIdx <= 0, onClick: () => moveWeek(wIdx - 1) },
                                { label: 'Sposta dopo', icon: 'ph-arrow-right', disabled: wIdx >= weeks.length - 1, onClick: () => moveWeek(wIdx + 1) },
                            ],
                            [
                                { label: 'Rinomina', icon: 'ph-pencil-simple', note: week.title || `Settimana ${wIdx + 1}`, onClick: () => thenRename(week.id, week.title) },
                                {
                                    label: week.kind === 'deload' ? 'Togli lo scarico' : 'Segna come scarico',
                                    icon: 'ph-battery-low',
                                    onClick: () => ops.updateWeekField(week.id, 'kind', week.kind === 'deload' ? '' : 'deload'),
                                },
                                { label: 'Duplica la settimana', icon: 'ph-copy', onClick: () => { ops.duplicateWeek(week.id); setWi(weeks.length); } },
                            ],
                            [{ label: 'Elimina la settimana', icon: 'ph-trash', tone: 'danger', disabled: weeks.length < 2, onClick: () => thenSheet('delWeek') }],
                        ],
                    },
                    day: day && {
                        title: day.title || `Seduta ${dIdx + 1}`,
                        subtitle: `${day.exercises.length} ${day.exercises.length === 1 ? 'esercizio' : 'esercizi'}`,
                        groups: [
                            [
                                { label: 'Sposta prima', icon: 'ph-arrow-left', disabled: dIdx <= 0, onClick: () => moveDay(dIdx - 1) },
                                { label: 'Sposta dopo', icon: 'ph-arrow-right', disabled: dIdx >= week.days.length - 1, onClick: () => moveDay(dIdx + 1) },
                            ],
                            [{ label: 'Duplica la seduta', icon: 'ph-copy', onClick: () => { ops.duplicateDay(week.id, day.id); setDi(week.days.length); } }],
                            [{ label: 'Elimina la seduta', icon: 'ph-trash', tone: 'danger', onClick: () => thenSheet('delDay') }],
                        ],
                    },
                    delWeek: {
                        title: `Eliminare ${week.title || 'la settimana'}?`,
                        subtitle: 'Sedute ed esercizi della settimana andranno persi.',
                        groups: [[{ label: 'Elimina la settimana', icon: 'ph-trash', tone: 'danger', onClick: () => { ops.removeWeek(week.id); setWi(0); } }], [{ label: 'Annulla', icon: 'ph-x', onClick: () => {} }]],
                    },
                    delDay: day && {
                        title: `Eliminare ${day.title || 'la seduta'}?`,
                        subtitle: 'Gli esercizi della seduta andranno persi.',
                        groups: [[{ label: 'Elimina la seduta', icon: 'ph-trash', tone: 'danger', onClick: () => { ops.removeDay(week.id, day.id); setDi(0); } }], [{ label: 'Annulla', icon: 'ph-x', onClick: () => {} }]],
                    },
                }[sheet.kind];
                if (!cfg) return null;
                // sul body: il contenitore animato del passo farebbe da riferimento al foglio fisso e lo taglierebbe
                return createPortal(<ActionSheet key={sheet.token} {...cfg} onClose={() => setSheet((s) => (s && s.token === sheet.token ? null : s))} />, document.body);
            })()}
        </div>
    );
};
