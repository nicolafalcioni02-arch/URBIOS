import React, { useEffect, useMemo, useState } from 'react';
import { buildIndex, foodValues, searchFoods } from '../../../../ai/foodMatcher';
import { addFood, addSub, removeSub, setSubMode, suggestSubs, swapSub, SUB_MODES, dayStatus, dayTotals, duplicateDay, macroGrams, mealKcal, newDay, removeItem, scaleDayTo, setGrams } from './guidedLogic';

// Passo 2 — Menù: giorni, pasti e alimenti si modificano sul posto. In alto, sempre visibile, l'andamento rispetto all'obiettivo.

const Bar = ({ label, value, target, unit, color }) => {
    const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
    const over = target > 0 && value > target * 1.08;
    return (
        <div className="flex-1 min-w-[110px]">
            <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[color:var(--muted)]">{label}</span>
                <span className="font-semibold">
                    {Math.round(value)}
                    {target > 0 && <span className="text-[color:var(--muted)] font-normal"> / {Math.round(target)}</span>} {unit}
                </span>
            </div>
            <div className="dg-bar">
                <i style={{ width: `${pct}%`, background: over ? '#C2413A' : color }}></i>
            </div>
        </div>
    );
};

export const FoodSearch = ({ index, onPick, onClose }) => {
    const [q, setQ] = useState('');
    const results = q.trim().length >= 2 ? searchFoods(q, index, 8) : [];
    return (
        <div className="dg-search">
            <div className="flex gap-2">
                <input autoFocus className="fld" placeholder="Cerca un alimento (es. pollo, riso, mela)…" value={q} onChange={(e) => setQ(e.target.value)} />
                <button className="dg-ghost" onClick={onClose} aria-label="Chiudi ricerca">
                    <i className="ph ph-x"></i>
                </button>
            </div>
            {q.trim().length >= 2 && results.length === 0 && <p className="text-[13px] text-[color:var(--muted)] mt-2">Nessun risultato. Aggiungi l’alimento dal pulsante “Alimenti” in alto.</p>}
            {results.length > 0 && (
                <div className="mt-2 rounded-xl border border-[color:var(--line)] bg-white overflow-hidden">
                    {results.map((f, i) => (
                        <button key={i} className="w-full text-left px-3.5 py-2.5 border-b last:border-b-0 border-[color:var(--line)] hover:bg-[color:var(--soft)] flex justify-between gap-3" onClick={() => onPick(f)}>
                            <span className="text-[14.5px]">{f.name}</span>
                            <span className="text-[12.5px] text-[color:var(--muted)] flex-none">{Math.round(foodValues(f).kcal)} kcal/100 g</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// Alternative equivalenti di un alimento: grammi calcolati per pareggiare kcal o un macro dell'originale.
const SubsPanel = ({ item, day, meal, foodDB, index, update }) => {
    const [adding, setAdding] = useState(false);
    const suggestions = useMemo(() => suggestSubs(item, foodDB), [item, foodDB]);
    const subs = item.subs || [];
    return (
        <div className="dg-subs">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">Alternative a {item.name}</p>
            {subs.length === 0 && <p className="text-[13px] text-[color:var(--muted)] mb-2">Nessuna alternativa. Scegline una qui sotto o cercala.</p>}
            {subs.map((s) => (
                <div key={s.id} className="dg-sub">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium break-words">{s.name}</p>
                            <p className="text-[12px] text-[color:var(--muted)]">{Math.round((s.kcal * s.weight) / 100)} kcal · P {Math.round((s.p * s.weight) / 100)} · C {Math.round((s.c * s.weight) / 100)} · G {Math.round((s.f * s.weight) / 100)}</p>
                        </div>
                        <b className="text-[15px]">{s.weight} g</b>
                        <button className="dg-ghost" title="Usa questa nel piano" aria-label="Usa questa nel piano" onClick={() => update((d) => swapSub(d, day.id, meal.id, item.id, s.id))}>
                            <i className="ph ph-arrows-left-right"></i>
                        </button>
                        <button className="dg-ghost" aria-label="Rimuovi alternativa" onClick={() => update((d) => removeSub(d, day.id, meal.id, item.id, s.id))}>
                            <i className="ph ph-x"></i>
                        </button>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                        {SUB_MODES.map((m) => (
                            <button key={m.val} className={`dg-mini ${(s.mode || 'kcal') === m.val ? 'on' : ''}`} onClick={() => update((d) => setSubMode(d, day.id, meal.id, item.id, s.id, m.val))}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            {suggestions.length > 0 && (
                <>
                    <p className="text-[12px] text-[color:var(--muted)] mt-3 mb-1.5">Proposte simili</p>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((f) => (
                            <button key={f.name} className="dg-mini" onClick={() => update((d) => addSub(d, day.id, meal.id, item.id, f))}>
                                <i className="ph ph-plus"></i> {f.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
            {adding ? (
                <FoodSearch
                    index={index}
                    onClose={() => setAdding(false)}
                    onPick={(f) => {
                        update((d) => addSub(d, day.id, meal.id, item.id, f));
                        setAdding(false);
                    }}
                />
            ) : (
                <button className="dg-link mt-3" onClick={() => setAdding(true)}>
                    <i className="ph ph-magnifying-glass"></i> Cerca un’altra alternativa
                </button>
            )}
        </div>
    );
};

export const MenuStep = ({ calcData, targets, dietDays, setDietDays, foodDB, setMealLibrary, onFoods, onAnalysis, onActiveDay, onRecipe, onGoals, onNext }) => {
    const index = useMemo(() => buildIndex(foodDB), [foodDB]);
    const [dayIdx, setDayIdx] = useState(0);
    const [searching, setSearching] = useState(null); // id del pasto con la ricerca aperta
    const [confirmDel, setConfirmDel] = useState(false);
    const [openSubs, setOpenSubs] = useState(null); // id dell'alimento con le alternative aperte
    const [dragId, setDragId] = useState(null); // giorno trascinato
    const [overId, setOverId] = useState(null);
    const [savedMeal, setSavedMeal] = useState(null);

    const tdee = targets?.isConfigured ? targets.kcal : 0;
    const gT = tdee ? macroGrams(tdee, { c: targets.c, p: targets.p, f: targets.f }) : { c: 0, p: 0, f: 0 };
    const day = dietDays[Math.min(dayIdx, dietDays.length - 1)];

    // il grafico "Smart" lavora sul giorno aperto
    useEffect(() => {
        if (day && onActiveDay) onActiveDay(day.id);
    }, [day?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // sposta un giorno (trascinando o con le frecce): il giorno resta quello selezionato
    const moveDay = (from, to) => {
        if (from === to || to < 0 || to >= dietDays.length) return;
        setDietDays((days) => {
            const next = [...days];
            const [d] = next.splice(from, 1);
            next.splice(to, 0, d);
            return next;
        });
        setDayIdx(to);
    };

    const saveMeal = (meal) => {
        if (!meal.items.length) return;
        const t = dayTotals({ meals: [meal] });
        setMealLibrary((prev) => [{ id: 'lib-' + Date.now(), title: meal.title, items: JSON.parse(JSON.stringify(meal.items)), totals: t, savedAt: new Date().toLocaleDateString('it-IT'), note: '' }, ...prev]);
        setSavedMeal(meal.id);
        setTimeout(() => setSavedMeal(null), 2500);
    };

    const addDay = () => {
        setDietDays((d) => [...d, newDay(calcData, d.length + 1)]);
        setDayIdx(dietDays.length);
    };

    if (!dietDays.length) {
        return (
            <div className="max-w-xl mx-auto text-center dg-in py-10">
                <div className="mx-auto w-16 h-16 rounded-full grid place-items-center text-3xl" style={{ background: 'var(--soft)' }}>
                    <i className="ph ph-fork-knife"></i>
                </div>
                <h2 className="dg-h mt-5">Costruiamo il menù</h2>
                <p className="dg-sub">Crea il primo giorno: avrà già i pasti che hai scelto. Poi aggiungi gli alimenti con la ricerca.</p>
                <button className="vw-next mt-6" onClick={addDay}>
                    <i className="ph ph-plus"></i> Crea il primo giorno
                </button>
            </div>
        );
    }

    const tot = dayTotals(day);
    const st = dayStatus(day, tdee);
    const budgetFor = (meal) => {
        const d = calcData.distribution?.find((x) => String(x.name).toLowerCase() === String(meal.title).toLowerCase());
        return d && tdee ? Math.round((tdee * (Number(d.value) || 0)) / 100) : 0;
    };
    const update = (fn) => setDietDays((days) => fn(days));

    return (
        <div className="max-w-3xl mx-auto dg-in">
            {/* Strumenti del passo */}
            <div className="dg-toolbar" style={{ marginTop: 0 }}>
                <button className="dg-sm" onClick={onFoods}>
                    <i className="ph ph-database"></i> Database alimenti
                </button>
                <button className="dg-sm" onClick={onAnalysis}>
                    <i className="ph ph-stethoscope"></i> Analisi nutrienti
                </button>
            </div>

            {/* Giorni (si riordinano trascinando o con le frecce) */}
            <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-1 min-w-0">
                    {dietDays.map((d, i) => {
                        const sd = dayStatus(d, tdee);
                        return (
                            <button
                                key={d.id}
                                draggable
                                onDragStart={() => setDragId(d.id)}
                                onDragEnd={() => {
                                    setDragId(null);
                                    setOverId(null);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setOverId(d.id);
                                }}
                                onDrop={() => {
                                    const from = dietDays.findIndex((x) => x.id === dragId);
                                    if (from >= 0) moveDay(from, i);
                                    setDragId(null);
                                    setOverId(null);
                                }}
                                className={`dg-chip row ${i === dayIdx ? 'on' : ''}`}
                                style={{ opacity: dragId === d.id ? 0.4 : 1, outline: overId === d.id && dragId && dragId !== d.id ? '2px dashed var(--ink)' : 'none', outlineOffset: 2 }}
                                onClick={() => setDayIdx(i)}
                            >
                                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: i === dayIdx ? '#fff' : sd.color }}></span>
                                {d.title}
                            </button>
                        );
                    })}
                    <button className="dg-chip row" onClick={addDay}>
                        <i className="ph ph-plus"></i> Giorno
                    </button>
                </div>
                {dietDays.length > 1 && (
                    <div className="flex gap-1 flex-none">
                        <button className="dg-ghost" title="Sposta il giorno prima" aria-label="Sposta il giorno prima" disabled={dayIdx === 0} style={dayIdx === 0 ? { opacity: 0.3 } : undefined} onClick={() => moveDay(dayIdx, dayIdx - 1)}>
                            <i className="ph ph-arrow-left"></i>
                        </button>
                        <button className="dg-ghost" title="Sposta il giorno dopo" aria-label="Sposta il giorno dopo" disabled={dayIdx === dietDays.length - 1} style={dayIdx === dietDays.length - 1 ? { opacity: 0.3 } : undefined} onClick={() => moveDay(dayIdx, dayIdx + 1)}>
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Riepilogo sticky */}
            <div className="dg-sticky">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className="text-[26px] font-semibold leading-none">
                        {Math.round(tot.kcal)} <span className="text-[14px] font-medium text-[color:var(--muted)]">{tdee ? `/ ${tdee} kcal` : 'kcal'}</span>
                    </p>
                    {st.label && (
                        <span className="text-[12.5px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.id === 'ok' ? '#DCE9E1' : st.id === 'off' ? '#FDECEA' : 'var(--soft)', color: st.color }}>
                            {st.label}
                        </span>
                    )}
                </div>
                <div className="flex gap-4 flex-wrap mt-3">
                    <Bar label="Carboidrati" value={tot.c} target={gT.c} unit="g" color="#121317" />
                    <Bar label="Proteine" value={tot.p} target={gT.p} unit="g" color="#1F8A5B" />
                    <Bar label="Grassi" value={tot.f} target={gT.f} unit="g" color="#8A8780" />
                </div>
                {st.id === 'off' && tot.kcal > 0 && tdee / tot.kcal >= 0.5 && tdee / tot.kcal <= 1.8 && (
                    <button className="dg-link mt-3" onClick={() => update((days) => days.map((d) => (d.id === day.id ? scaleDayTo(d, tdee) : d)))}>
                        <i className="ph ph-magic-wand"></i> Adatta le quantità a {tdee} kcal
                    </button>
                )}
            </div>

            {/* Pasti */}
            {day.meals.map((meal) => {
                const mk = mealKcal(meal);
                const budget = budgetFor(meal);
                return (
                    <section key={meal.id} className="dg-card">
                        <div className="flex items-baseline justify-between gap-3">
                            <h3 className="text-[17px] font-semibold flex-1 min-w-0">{meal.title}</h3>
                            <span className="text-[13px] text-[color:var(--muted)]">
                                {Math.round(mk)} kcal{budget ? ` · obiettivo ${budget}` : ''}
                            </span>
                            {meal.items.length > 0 && (
                                <button className="dg-ghost !w-8 !h-8" title="Salva questo pasto nella libreria (si ritrova da “Ricetta”)" aria-label="Salva il pasto" onClick={() => saveMeal(meal)}>
                                    <i className={`ph ${savedMeal === meal.id ? 'ph-check' : 'ph-bookmark-simple'}`} style={savedMeal === meal.id ? { color: 'var(--ok)' } : undefined}></i>
                                </button>
                            )}
                        </div>
                        {budget > 0 && (
                            <div className="dg-bar mt-2">
                                <i style={{ width: `${Math.min(100, (mk / budget) * 100)}%`, background: mk > budget * 1.15 ? '#C2413A' : '#121317' }}></i>
                            </div>
                        )}

                        <div className="mt-3">
                            {meal.items.length === 0 && <p className="text-[13.5px] text-[color:var(--muted)] py-2">Ancora vuoto.</p>}
                            {meal.items.map((it) => {
                                const k = ((parseFloat(it.kcal) || 0) * (parseFloat(it.weight) || 0)) / 100;
                                return (
                                    <div key={it.id}>
                                    <div className="dg-row">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14.5px] font-medium break-words">{it.name || 'Alimento senza nome'}</p>
                                            <p className="text-[12px] text-[color:var(--muted)]">
                                                {Math.round(k)} kcal · P {Math.round(((parseFloat(it.p) || 0) * (parseFloat(it.weight) || 0)) / 100)} · C {Math.round(((parseFloat(it.c) || 0) * (parseFloat(it.weight) || 0)) / 100)} · G {Math.round(((parseFloat(it.f) || 0) * (parseFloat(it.weight) || 0)) / 100)}
                                            </p>
                                        </div>
                                        <div className="dg-stepper">
                                            <button aria-label="Meno" onClick={() => update((d) => setGrams(d, day.id, meal.id, it.id, Math.max(0, (parseFloat(it.weight) || 0) - 10)))}>
                                                <i className="ph ph-minus"></i>
                                            </button>
                                            <input inputMode="decimal" value={it.weight} onChange={(e) => update((d) => setGrams(d, day.id, meal.id, it.id, e.target.value))} aria-label="Grammi" />
                                            <span>g</span>
                                            <button aria-label="Più" onClick={() => update((d) => setGrams(d, day.id, meal.id, it.id, (parseFloat(it.weight) || 0) + 10))}>
                                                <i className="ph ph-plus"></i>
                                            </button>
                                        </div>
                                        <button className={`dg-ghost ${(it.subs || []).length ? 'has' : ''}`} title="Alternative" aria-label="Alternative" onClick={() => setOpenSubs(openSubs === it.id ? null : it.id)}>
                                            <i className="ph ph-arrows-left-right"></i>
                                            {(it.subs || []).length > 0 && <em>{it.subs.length}</em>}
                                        </button>
                                        <button className="dg-ghost" aria-label="Rimuovi" onClick={() => update((d) => removeItem(d, day.id, meal.id, it.id))}>
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </div>
                                    {openSubs === it.id && <SubsPanel item={it} day={day} meal={meal} foodDB={foodDB} index={index} update={update} />}
                                    </div>
                                );
                            })}
                        </div>

                        {searching === meal.id ? (
                            <FoodSearch
                                index={index}
                                onClose={() => setSearching(null)}
                                onPick={(f) => {
                                    update((d) => addFood(d, day.id, meal.id, f, Number(f.portion) > 0 ? Number(f.portion) : 100));
                                    setSearching(null);
                                }}
                            />
                        ) : (
                            <div className="flex gap-2">
                                <button className="dg-add" onClick={() => setSearching(meal.id)}>
                                    <i className="ph ph-plus-circle"></i> Aggiungi alimento
                                </button>
                                <button className="dg-add" onClick={() => onRecipe(day.id, meal.id)}>
                                    <i className="ph ph-cooking-pot"></i> Ricetta
                                </button>
                            </div>
                        )}
                    </section>
                );
            })}

            {/* Azioni del giorno */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
                <input className="fld !w-auto min-w-[180px]" value={day.title} onChange={(e) => update((d) => d.map((x) => (x.id === day.id ? { ...x, title: e.target.value } : x)))} aria-label="Nome del giorno" />
                <button className="dg-chip row" onClick={() => { update((d) => [...d, duplicateDay(day)]); setDayIdx(dietDays.length); }}>
                    <i className="ph ph-copy"></i> Duplica giorno
                </button>
                {confirmDel ? (
                    <>
                        <button className="dg-chip row" style={{ color: '#C2413A' }} onClick={() => { update((d) => d.filter((x) => x.id !== day.id)); setDayIdx(0); setConfirmDel(false); }}>
                            Sì, elimina
                        </button>
                        <button className="dg-chip row" onClick={() => setConfirmDel(false)}>
                            Annulla
                        </button>
                    </>
                ) : (
                    <button className="dg-chip row" onClick={() => setConfirmDel(true)}>
                        <i className="ph ph-trash"></i> Elimina giorno
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center mt-8">
                <button className="vw-back" onClick={onGoals}>
                    <i className="ph ph-arrow-left"></i> Obiettivi
                </button>
                <button className="vw-next" onClick={onNext}>
                    Verifica e consegna <i className="ph ph-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};
