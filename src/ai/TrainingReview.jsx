import React, { useEffect, useMemo, useState } from 'react';
import { buildIndex, searchFoods } from './foodMatcher';
import { buildTrainingPayload, defaultTrainingChoice, exerciseEntries } from './trainingSection';
import { analyzeScheda } from '../components/patient/training/logic/analysis';
import { summarizeSets } from '../components/patient/training/logic/trainingModel';
import { goalById, LEVELS } from '../components/patient/training/logic/science/guidelines';

// Verifica della scheda proposta dall'AI: esercizi riconosciuti, serie, durata stimata e avvisi di programmazione.

const BADGE = {
    ok: { t: 'Riconosciuto', bg: '#DCE9E1', fg: '#1F6B49', icon: 'ph-check-circle' },
    check: { t: 'Da verificare', bg: '#FFF1D6', fg: '#9A5B00', icon: 'ph-question' },
    free: { t: 'Fuori database', bg: '#EAF1FB', fg: '#1F4E8A', icon: 'ph-pencil-simple' },
    skip: { t: 'Escluso', bg: '#EDEBE6', fg: '#6E6D69', icon: 'ph-minus-circle' },
};

export const TrainingReview = ({ parsed, patient, exerciseDB, opts, ctx, onPayload }) => {
    const index = useMemo(() => buildIndex(exerciseEntries(exerciseDB)), [exerciseDB]);
    const [choices, setChoices] = useState({});
    const [dayIdx, setDayIdx] = useState(0);
    const [open, setOpen] = useState(null);
    const [query, setQuery] = useState('');

    const built = useMemo(() => buildTrainingPayload({ parsed, choices, patient, opts }), [parsed, choices, patient, opts]);
    useEffect(() => {
        onPayload(built);
    }, [built]); // eslint-disable-line react-hooks/exhaustive-deps

    const header = built.scheda;
    const analysis = useMemo(
        () => analyzeScheda({ weeks: header.weeks.slice(0, 1), header, massimali: ctx.massimali, profile: ctx.profile }),
        [header, ctx]
    );
    const week1 = analysis.weeks[0];
    const goal = goalById(parsed.tipo);
    const level = LEVELS.find((l) => l.id === parsed.livello);
    const day = parsed.days[Math.min(dayIdx, parsed.days.length - 1)];

    const kindOf = (e) => {
        const c = choices[e.key] || defaultTrainingChoice(e);
        return c.type === 'skip' ? 'skip' : c.type === 'free' ? 'free' : e.match.status === 'ok' ? 'ok' : 'check';
    };
    const counts = parsed.days.flatMap((d) => d.exercises).reduce((a, e) => ((a[kindOf(e)] = (a[kindOf(e)] || 0) + 1), a), {});
    const setChoice = (key, c) => {
        setChoices((p) => ({ ...p, [key]: c }));
        setOpen(null);
        setQuery('');
    };
    const warnings = analysis.warnings.filter((w) => w.level === 'warn' || w.level === 'info').slice(0, 8);

    return (
        <div className="mt-6 uai-in">
            <div className="rounded-2xl p-5 text-white" style={{ background: 'var(--ink)' }}>
                <p className="text-[12px] uppercase tracking-wider opacity-70 font-semibold">Scheda di allenamento</p>
                <p className="text-[22px] font-semibold mt-1">{header.titolo}</p>
                {header.obiettivo && <p className="text-[13.5px] opacity-80 mt-0.5">{header.obiettivo}</p>}
                <div className="flex flex-wrap gap-1.5 mt-3 text-[12px]">
                    {[goal && goal.label, level && level.label, `${parsed.days.length} sedute/settimana`, `${header.weeks.length} ${header.weeks.length === 1 ? 'settimana' : 'settimane'}`].filter(Boolean).map((x) => (
                        <span key={x} className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.14)' }}>
                            {x}
                        </span>
                    ))}
                </div>
                <p className="text-[12px] opacity-70 mt-3">Si aggiunge alle schede esistenti di {patient.nome}: non ne sostituisce nessuna.</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 text-[12.5px]">
                {['ok', 'check', 'free', 'skip'].map(
                    (k) =>
                        counts[k] > 0 && (
                            <span key={k} className="px-2.5 py-1 rounded-full font-semibold" style={{ background: BADGE[k].bg, color: BADGE[k].fg }}>
                                {counts[k]} {BADGE[k].t.toLowerCase()}
                            </span>
                        )
                )}
            </div>
            {(counts.check > 0 || counts.free > 0) && (
                <p className="text-[13px] text-[color:var(--muted)] mt-2">Gli esercizi “fuori database” restano con il nome scritto dall’AI (senza figure né analisi dei muscoli). Toccali per abbinarli a uno del database.</p>
            )}

            {parsed.days.length > 1 && (
                <div className="flex gap-1.5 mt-5 overflow-x-auto no-scrollbar">
                    {parsed.days.map((d, i) => (
                        <button key={i} className={`uai-chip ${i === dayIdx ? 'on' : ''}`} onClick={() => setDayIdx(i)}>
                            {d.title}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-4 p-4 rounded-2xl border border-[color:var(--line)] bg-white text-[13.5px]">
                <b>{day.title}</b>
                {week1 && week1.days[dayIdx] && (
                    <span className="text-[color:var(--muted)]">
                        {' '}
                        · durata stimata {Math.round(week1.days[dayIdx].minutes)} min{day.minutes ? ` (l’AI indicava ${Math.round(day.minutes)})` : ''}
                    </span>
                )}
            </div>

            <div className="mt-3 rounded-2xl border border-[color:var(--line)] bg-white overflow-hidden">
                {day.exercises.map((e) => {
                    const c = choices[e.key] || defaultTrainingChoice(e);
                    const k = kindOf(e);
                    const b = BADGE[k];
                    const sum = summarizeSets(e.sets);
                    const isOpen = open === e.key;
                    const results = isOpen && query ? searchFoods(query, index, 8).map((x) => x.ex) : [];
                    const uniqueResults = results.filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i);
                    return (
                        <div key={e.key} className="border-b last:border-b-0 border-[color:var(--line)]">
                            <button className="w-full text-left flex items-center gap-3 p-3.5" onClick={() => { setOpen(isOpen ? null : e.key); setQuery(''); }}>
                                <i className={`ph ${b.icon} text-xl flex-none`} style={{ color: b.fg }}></i>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14.5px] font-medium break-words" style={{ textDecoration: k === 'skip' ? 'line-through' : 'none' }}>
                                        {e.ss && <span className="inline-block mr-1.5 text-[11px] font-bold px-1.5 rounded bg-[color:var(--soft)]">{e.ss}</span>}
                                        {c.type === 'db' ? c.ex.name : e.aiName}
                                    </p>
                                    {c.type === 'db' && c.ex.name !== e.aiName && <p className="text-[12px] text-[color:var(--muted)]">l’AI aveva scritto “{e.aiName}”</p>}
                                    {e.note && <p className="text-[12.5px] text-[color:var(--muted)]">{e.note}</p>}
                                    {e.warn && <p className="text-[12px]" style={{ color: '#B25E00' }}>{e.warn}</p>}
                                </div>
                                <div className="text-right flex-none text-[13px]">
                                    <p className="font-semibold">{sum.serie}</p>
                                    <p className="text-[color:var(--muted)]">{[sum.rpe && `RPE ${sum.rpe}`, sum.pct && `${sum.pct}%`, sum.rec && `rec ${sum.rec}`].filter(Boolean).join(' · ')}</p>
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-3.5 pb-3.5 space-y-2" style={{ background: '#FBFAF8' }}>
                                    {e.match.alternatives.length > 0 && <p className="text-[12px] text-[color:var(--muted)] pt-2">Possibili corrispondenze</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {e.match.alternatives.map((x) => (
                                            <button key={x.name} className={`uai-chip !h-9 !text-[13px] ${c.type === 'db' && c.ex.name === x.name ? 'on' : ''}`} onClick={() => setChoice(e.key, { type: 'db', ex: x })}>
                                                {x.name}
                                            </button>
                                        ))}
                                    </div>
                                    <input className="fld" placeholder="Cerca nel database esercizi…" value={query} onChange={(ev) => setQuery(ev.target.value)} />
                                    {uniqueResults.length > 0 && (
                                        <div className="rounded-xl border border-[color:var(--line)] bg-white overflow-hidden">
                                            {uniqueResults.map((x) => (
                                                <button key={x.name} className="w-full text-left px-3 py-2 text-[13.5px] border-b last:border-b-0 border-[color:var(--line)] hover:bg-[color:var(--soft)]" onClick={() => setChoice(e.key, { type: 'db', ex: x })}>
                                                    {x.name} <span className="text-[color:var(--muted)]">· {x.group}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <button className="uai-chip !h-9 !text-[13px]" onClick={() => setChoice(e.key, { type: 'free' })}>
                                            Tieni il nome dell’AI
                                        </button>
                                        <button className="uai-chip !h-9 !text-[13px]" onClick={() => setChoice(e.key, { type: 'skip' })}>
                                            Escludi dalla scheda
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {warnings.length > 0 && (
                <div className="mt-5">
                    <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">
                        <i className="ph ph-chart-line-up text-base"></i> Controllo di programmazione (settimana tipo)
                    </p>
                    <div className="rounded-2xl p-4 text-[13.5px] space-y-1.5" style={{ background: '#FFF6E5' }}>
                        {warnings.map((w, i) => (
                            <p key={i}>
                                <i className={`ph ${w.level === 'warn' ? 'ph-warning' : 'ph-info'} mr-1`}></i>
                                {w.text}
                            </p>
                        ))}
                    </div>
                    <p className="text-[12px] text-[color:var(--muted)] mt-2">Sono indicazioni di letteratura, non prescrizioni: la decisione è tua.</p>
                </div>
            )}
        </div>
    );
};
