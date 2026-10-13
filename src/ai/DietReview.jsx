import React, { useEffect, useMemo, useState } from 'react';
import { buildIndex, foodValues, searchFoods } from './foodMatcher';
import { buildDietPayload, defaultChoice, dayKcal } from './dietSection';

// Verifica del piano alimentare proposto dall'AI: alimenti riconosciuti, dubbi da risolvere, totali del giorno.
// Comunica al modale il "payload" pronto da scrivere (onPayload) ogni volta che qualcosa cambia.

const BADGE = {
    ok: { t: 'Riconosciuto', bg: '#DCE9E1', fg: '#1F6B49', icon: 'ph-check-circle' },
    check: { t: 'Da verificare', bg: '#FFF1D6', fg: '#9A5B00', icon: 'ph-question' },
    none: { t: 'Non trovato', bg: '#FDECEA', fg: '#8A1F11', icon: 'ph-x-circle' },
    ai: { t: 'Valori stimati AI', bg: '#EAF1FB', fg: '#1F4E8A', icon: 'ph-sparkle' },
    skip: { t: 'Escluso', bg: '#EDEBE6', fg: '#6E6D69', icon: 'ph-minus-circle' },
};

const kcalOf = (choice, grams) => {
    const v = choice.type === 'db' ? foodValues(choice.food) : choice.type === 'ai' ? choice.values : null;
    return v ? (v.kcal * grams) / 100 : 0;
};

export const DietReview = ({ parsed, foodDB, ctx, onPayload }) => {
    const index = useMemo(() => buildIndex(foodDB), [foodDB]);
    const [choices, setChoices] = useState({});
    const [align, setAlign] = useState(true);
    const [dayIdx, setDayIdx] = useState(0);
    const [open, setOpen] = useState(null);
    const [query, setQuery] = useState('');

    const choiceOf = (it) => choices[it.key] || defaultChoice(it);
    const built = useMemo(() => buildDietPayload({ parsed, choices, ctx, align }), [parsed, choices, ctx, align]);

    useEffect(() => {
        onPayload(built);
    }, [built]); // eslint-disable-line react-hooks/exhaustive-deps

    const allItems = parsed.days.flatMap((d) => d.meals.flatMap((m) => m.items));
    const counts = allItems.reduce(
        (a, it) => {
            const c = choiceOf(it);
            const k = c.type === 'skip' ? 'skip' : c.type === 'ai' ? 'ai' : it.match.status;
            a[k] = (a[k] || 0) + 1;
            return a;
        },
        {}
    );
    const day = parsed.days[Math.min(dayIdx, parsed.days.length - 1)];
    const tdee = built.tdee;
    const rawKcal = Math.round(dayKcal(day, choices));
    const finalDay = built.payload.diet_plan_data[Math.min(dayIdx, parsed.days.length - 1)];
    const finalTot = finalDay.meals.reduce(
        (t, m) => m.items.reduce((s, i) => ({ k: s.k + (i.kcal * i.weight) / 100, p: s.p + (i.p * i.weight) / 100, c: s.c + (i.c * i.weight) / 100, f: s.f + (i.f * i.weight) / 100 }), t),
        { k: 0, p: 0, c: 0, f: 0 }
    );
    const pct = tdee ? Math.min(150, (finalTot.k / tdee) * 100) : 0;

    const setChoice = (key, c) => {
        setChoices((p) => ({ ...p, [key]: c }));
        setOpen(null);
        setQuery('');
    };

    return (
        <div className="mt-6 uai-in">
            {/* Riepilogo energetico */}
            <div className="rounded-2xl p-5 text-white" style={{ background: 'var(--ink)' }}>
                <p className="text-[12px] uppercase tracking-wider opacity-70 font-semibold">Piano alimentare</p>
                {tdee ? (
                    <p className="text-[28px] font-semibold mt-1">
                        {tdee} <span className="text-[15px] font-medium opacity-80">kcal/die</span>
                    </p>
                ) : (
                    <p className="text-[15px] mt-1">Mancano peso, altezza o data di nascita: il fabbisogno non si può calcolare. Il menù viene salvato comunque; imposta gli obiettivi nella Dieta.</p>
                )}
                <p className="text-[13px] opacity-80 mt-1">
                    {ctx.rmr ? `Metabolismo basale ${ctx.rmr} kcal × LAF ${parsed.laf} · ` : ''}Carboidrati {parsed.macro.c}% · Proteine {parsed.macro.p}% · Grassi {parsed.macro.f}%
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {parsed.distribution.map((d) => (
                        <span key={d.id} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.14)' }}>
                            {d.name} {d.value}%
                        </span>
                    ))}
                </div>
            </div>

            {/* Stato riconoscimento alimenti */}
            <div className="flex flex-wrap gap-2 mt-4 text-[12.5px]">
                {['ok', 'check', 'none', 'ai', 'skip'].map(
                    (k) =>
                        counts[k] > 0 && (
                            <span key={k} className="px-2.5 py-1 rounded-full font-semibold" style={{ background: BADGE[k].bg, color: BADGE[k].fg }}>
                                {counts[k]} {BADGE[k].t.toLowerCase()}
                            </span>
                        )
                )}
            </div>
            {(counts.none > 0 || counts.check > 0) && <p className="text-[13px] text-[color:var(--muted)] mt-2">Tocca gli alimenti “da verificare” o “non trovati” per scegliere quello giusto dal database. Quelli esclusi non entrano nel piano.</p>}

            {/* Tab giorni */}
            {parsed.days.length > 1 && (
                <div className="flex gap-1.5 mt-5 overflow-x-auto no-scrollbar">
                    {parsed.days.map((d, i) => (
                        <button key={i} className={`uai-chip ${i === dayIdx ? 'on' : ''}`} onClick={() => setDayIdx(i)}>
                            {d.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Totali del giorno */}
            <div className="mt-4 p-4 rounded-2xl border border-[color:var(--line)] bg-white">
                <div className="flex items-baseline justify-between">
                    <p className="text-[13px] text-[color:var(--muted)]">Totale {day.title}</p>
                    <p className="text-[18px] font-semibold">
                        {Math.round(finalTot.k)} <span className="text-[13px] font-medium text-[color:var(--muted)]">{tdee ? `/ ${tdee} kcal` : 'kcal'}</span>
                    </p>
                </div>
                {tdee > 0 && (
                    <div className="uai-bar mt-2">
                        <i style={{ width: `${Math.min(100, pct)}%`, background: pct > 105 || pct < 92 ? '#C2413A' : 'var(--ok)' }}></i>
                    </div>
                )}
                <p className="text-[12.5px] text-[color:var(--muted)] mt-2">
                    Carboidrati {Math.round(finalTot.c)} g · Proteine {Math.round(finalTot.p)} g · Grassi {Math.round(finalTot.f)} g
                </p>
                {tdee > 0 && (
                    <label className="flex items-start gap-2.5 mt-3 pt-3 border-t border-[color:var(--line)] cursor-pointer">
                        <input type="checkbox" className="mt-1 w-4 h-4" checked={align} onChange={(e) => setAlign(e.target.checked)} />
                        <span className="text-[13.5px]">
                            <b>Allinea le quantità al fabbisogno</b>
                            <span className="block text-[12.5px] text-[color:var(--muted)]">
                                L’AI propone {rawKcal} kcal: con la spunta scalo i grammi (arrotondati a 5) per arrivare a {tdee}. Le proporzioni tra gli alimenti restano le stesse.
                            </span>
                        </span>
                    </label>
                )}
            </div>

            {/* Pasti */}
            {parsed.distribution.map((dm) => {
                const meal = day.meals.find((m) => m.title.toLowerCase() === dm.name.toLowerCase());
                if (!meal || !meal.items.length) return null;
                const fm = finalDay.meals.find((m) => m.title === dm.name);
                const mealKcal = fm ? fm.items.reduce((s, i) => s + (i.kcal * i.weight) / 100, 0) : 0;
                return (
                    <div key={dm.id} className="mt-4">
                        <p className="flex items-baseline justify-between text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">
                            <span>{dm.name}</span>
                            <span className="normal-case tracking-normal font-medium">
                                {Math.round(mealKcal)} kcal{tdee ? ` · obiettivo ${Math.round((tdee * dm.value) / 100)}` : ''}
                            </span>
                        </p>
                        <div className="rounded-2xl border border-[color:var(--line)] bg-white overflow-hidden">
                            {meal.items.map((it) => {
                                const c = choiceOf(it);
                                const st = c.type === 'skip' ? 'skip' : c.type === 'ai' ? 'ai' : it.match.status;
                                const b = BADGE[st];
                                const grams = built.weights[it.key] ?? it.grams;
                                const isOpen = open === it.key;
                                const results = isOpen && query ? searchFoods(query, index) : [];
                                return (
                                    <div key={it.key} className="border-b last:border-b-0 border-[color:var(--line)]">
                                        <button className="w-full text-left flex items-center gap-3 p-3.5" onClick={() => { setOpen(isOpen ? null : it.key); setQuery(''); }}>
                                            <i className={`ph ${b.icon} text-xl flex-none`} style={{ color: b.fg }}></i>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14.5px] font-medium break-words" style={{ textDecoration: c.type === 'skip' ? 'line-through' : 'none' }}>
                                                    {c.type === 'db' ? c.food.name : it.aiName}
                                                </p>
                                                {c.type === 'db' && c.food.name !== it.aiName && <p className="text-[12px] text-[color:var(--muted)]">l’AI aveva scritto “{it.aiName}”</p>}
                                                {it.warn && <p className="text-[12px]" style={{ color: '#B25E00' }}>{it.warn}</p>}
                                            </div>
                                            <div className="text-right flex-none">
                                                <p className="text-[14px] font-semibold">{grams} g</p>
                                                <p className="text-[12px] text-[color:var(--muted)]">{Math.round(kcalOf(c, grams))} kcal</p>
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <div className="px-3.5 pb-3.5 space-y-2" style={{ background: '#FBFAF8' }}>
                                                {it.match.alternatives.length > 0 && <p className="text-[12px] text-[color:var(--muted)] pt-2">Possibili corrispondenze</p>}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {it.match.alternatives.map((f, i) => (
                                                        <button key={i} className={`uai-chip !h-9 !text-[13px] ${c.type === 'db' && c.food === f ? 'on' : ''}`} onClick={() => setChoice(it.key, { type: 'db', food: f })}>
                                                            {f.name}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input className="fld" placeholder="Cerca nel database alimenti…" value={query} onChange={(e) => setQuery(e.target.value)} />
                                                {results.length > 0 && (
                                                    <div className="rounded-xl border border-[color:var(--line)] bg-white overflow-hidden">
                                                        {results.map((f, i) => (
                                                            <button key={i} className="w-full text-left px-3 py-2 text-[13.5px] border-b last:border-b-0 border-[color:var(--line)] hover:bg-[color:var(--soft)]" onClick={() => setChoice(it.key, { type: 'db', food: f })}>
                                                                {f.name} <span className="text-[color:var(--muted)]">· {Math.round(foodValues(f).kcal)} kcal/100 g</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {it.aiValues && (
                                                        <button className="uai-chip !h-9 !text-[13px]" onClick={() => setChoice(it.key, { type: 'ai', values: it.aiValues })}>
                                                            Usa i valori stimati dall’AI ({Math.round(it.aiValues.kcal)} kcal/100 g)
                                                        </button>
                                                    )}
                                                    <button className="uai-chip !h-9 !text-[13px]" onClick={() => setChoice(it.key, { type: 'skip' })}>
                                                        Escludi dal piano
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {built.notes.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl text-[13.5px] space-y-1" style={{ background: '#FFF6E5' }}>
                    {built.notes.map((n, i) => (
                        <p key={i}><i className="ph ph-warning mr-1"></i>{n}</p>
                    ))}
                </div>
            )}

            {/* Integratori */}
            {parsed.supplements.length > 0 && (
                <div className="mt-6">
                    <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">
                        <i className="ph ph-pill text-base"></i> Integratori consigliati
                    </p>
                    <div className="rounded-2xl border border-[color:var(--line)] bg-white overflow-hidden">
                        {parsed.supplements.map((s) => (
                            <div key={s.id} className="p-3.5 border-b last:border-b-0 border-[color:var(--line)]">
                                <p className="text-[14.5px] font-medium">
                                    {s.name} {s.dose && <span className="text-[color:var(--muted)] font-normal">· {s.dose}</span>}
                                </p>
                                {s.when && <p className="text-[13px] text-[color:var(--muted)]">Quando: {s.when}</p>}
                                {s.why && <p className="text-[13px] text-[color:var(--muted)]">Perché: {s.why}</p>}
                            </div>
                        ))}
                    </div>
                    <p className="text-[12px] text-[color:var(--muted)] mt-2">Suggerimenti generati da un’AI: valuta tu l’opportunità clinica prima di consegnarli al paziente.</p>
                </div>
            )}

            {parsed.advice.length > 0 && (
                <div className="mt-6">
                    <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">
                        <i className="ph ph-lightbulb text-base"></i> Consigli per il paziente
                    </p>
                    <ul className="rounded-2xl border border-[color:var(--line)] bg-white p-4 list-disc pl-8 space-y-1 text-[14px]">
                        {parsed.advice.map((a, i) => (
                            <li key={i}>{a}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
