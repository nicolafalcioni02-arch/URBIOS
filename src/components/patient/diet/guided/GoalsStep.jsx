import React, { useEffect, useMemo, useState } from 'react';
import { ACTIVITY, GOALS, MACRO_PRESETS, MEAL_PRESETS, applyGoals, computeRmr, computeTdee, macroGrams, prefillCalc, sumDist, sumPct } from './guidedLogic';
import { dietContext } from '../../../../ai/dietSection';

// Passo 1 — Obiettivi: poche domande in parole semplici; il resto (kcal, macro, pasti) si calcola da solo.

const Chip = ({ on, children, onClick, sub }) => (
    <button type="button" onClick={onClick} className={`dg-chip ${on ? 'on' : ''}`}>
        <span>{children}</span>
        {sub && <small>{sub}</small>}
    </button>
);

const Field = ({ label, unit, value, onChange, children }) => (
    <div>
        <label className="fld-label">
            {label} {unit && <span className="opacity-60">({unit})</span>}
        </label>
        {children || <input className="fld" inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
    </div>
);

// formule del metabolismo basale disponibili (adulti)
const FORMULAS = [
    ['mifflin', 'Mifflin-St Jeor (consigliata)'],
    ['harris', 'Harris-Benedict'],
    ['katch', 'Katch-McArdle (serve la % di massa grassa)'],
    ['schofield_18_29', 'Schofield 18-29 anni'],
    ['schofield_30_59', 'Schofield 30-59 anni'],
    ['schofield_60', 'Schofield oltre 60 anni'],
    ['schofield_wh_18_29', 'Schofield con altezza 18-29 anni'],
    ['schofield_wh_30_59', 'Schofield con altezza 30-59 anni'],
];

export const GoalsStep = ({ patient, calcData, setCalcData, setTargets, setDietDays, targets, onLaf, onDone }) => {
    // precompila i campi vuoti con ciò che URBIOS già sa (anagrafica e ultima visita)
    useEffect(() => {
        const known = dietContext(patient, {}).calc;
        let next = prefillCalc(calcData, known);
        // piano nuovo: parto da una ripartizione equilibrata invece di un valore "personalizzato" non scelto da nessuno
        if (!targets?.isConfigured && !(calcData.guided || {}).macro) {
            next = { ...next, macroTargets: { c: 50, p: 20, f: 30 }, guided: { ...(next.guided || {}), macro: 'eq' } };
        }
        if (JSON.stringify(next) !== JSON.stringify(calcData)) setCalcData(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patient?.id]);

    const g = calcData.guided || {};
    // l'attività va scelta esplicitamente (il valore di partenza 1.2 non è una scelta); se il piano è già impostato la ricavo dal LAF
    const activityId = g.activity === 'custom' ? 'custom' : g.activity || (targets?.isConfigured ? (ACTIVITY.find((a) => Math.abs(a.laf - Number(calcData.laf)) < 0.01) || {}).id : '') || '';
    const goalId = g.goal || (GOALS.find((x) => x.adj === (Number(calcData.kcalAdjustPct) || 0)) || {}).id || 'man';
    const macroId = g.macro || (MACRO_PRESETS.find((m) => m.c === calcData.macroTargets?.c && m.p === calcData.macroTargets?.p && m.f === calcData.macroTargets?.f) || {}).id || 'custom';
    const mealsN = g.meals || (MEAL_PRESETS[calcData.distribution?.length] ? calcData.distribution.length : 0);
    const [customMacro, setCustomMacro] = useState(macroId === 'custom');

    // se il LAF cambia per altra via (calcolatore 24 ore), l'attività diventa "personalizzata"
    useEffect(() => {
        const sel = ACTIVITY.find((a) => a.id === g.activity);
        if (sel && Math.abs(sel.laf - Number(calcData.laf)) > 0.004) setCalcData((c) => ({ ...c, guided: { ...(c.guided || {}), activity: 'custom' } }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calcData.laf]);

    const set = (patch) => setCalcData((c) => ({ ...c, ...patch }));
    const setG = (patch, extra = {}) => setCalcData((c) => ({ ...c, ...extra, guided: { ...(c.guided || {}), ...patch } }));

    const tdee = computeTdee(calcData);
    const rmr = computeRmr(calcData);
    const missing = [];
    const n = (v) => parseFloat(String(v).replace(',', '.'));
    if (!(n(calcData.age) > 0)) missing.push('età');
    if (!(n(calcData.weight) > 0)) missing.push('peso');
    if (!(n(calcData.height) > 0)) missing.push('altezza');
    const macroOk = sumPct(calcData.macroTargets) === 100;
    const distOk = sumDist(calcData.distribution) === 100;
    const ready = tdee > 0 && macroOk && distOk && !!activityId;

    const grams = useMemo(() => (tdee ? macroGrams(tdee, calcData.macroTargets) : null), [tdee, calcData.macroTargets]);
    const bmi = n(calcData.weight) > 0 && n(calcData.height) > 0 ? n(calcData.weight) / Math.pow(n(calcData.height) / 100, 2) : null;

    const confirm = () => {
        applyGoals({ calcData, setCalcData, setTargets, setDietDays });
        onDone();
    };

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <h2 className="dg-h">Partiamo dall’obiettivo</h2>
            <p className="dg-sub">Poche domande: kcal, macro e pasti li calcolo io. {targets?.isConfigured && 'Puoi sempre cambiare le risposte.'}</p>

            <section className="dg-card">
                <p className="dg-q">1 · Chi è il paziente?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Sesso">
                        <div className="flex gap-2">
                            {['M', 'F'].map((s) => (
                                <Chip key={s} on={calcData.sex === s} onClick={() => set({ sex: s })}>
                                    {s === 'M' ? 'Uomo' : 'Donna'}
                                </Chip>
                            ))}
                        </div>
                    </Field>
                    <Field label="Età" unit="anni" value={calcData.age} onChange={(v) => set({ age: v })} />
                    <Field label="Peso" unit="kg" value={calcData.weight} onChange={(v) => set({ weight: v })} />
                    <Field label="Altezza" unit="cm" value={calcData.height} onChange={(v) => set({ height: v })} />
                </div>
                {missing.length > 0 ? (
                    <p className="dg-warn">Mancano: {missing.join(', ')}. Li trovi in anagrafica e nelle visite, oppure scrivili qui.</p>
                ) : (
                    <p className="dg-hint">
                        Dati presi dalla scheda del paziente{bmi ? ` · BMI ${bmi.toFixed(1)}` : ''}.
                    </p>
                )}
            </section>

            <section className="dg-card">
                <p className="dg-q">2 · Cosa vuole ottenere?</p>
                <div className="flex flex-wrap gap-2">
                    {GOALS.map((x) => (
                        <Chip key={x.id} on={goalId === x.id} sub={x.hint} onClick={() => setG({ goal: x.id }, { kcalAdjustPct: x.adj })}>
                            <i className={`ph ${x.icon}`}></i> {x.label}
                        </Chip>
                    ))}
                </div>
            </section>

            <section className="dg-card">
                <p className="dg-q">3 · Quanto è attivo nella giornata?</p>
                <div className="flex flex-wrap gap-2">
                    {ACTIVITY.map((a) => (
                        <Chip key={a.id} on={activityId === a.id} sub={a.hint} onClick={() => setG({ activity: a.id }, { laf: a.laf })}>
                            {a.label}
                        </Chip>
                    ))}
                    {onLaf && (
                        <Chip on={activityId === 'custom'} sub={activityId === 'custom' ? `LAF ${Number(calcData.laf).toFixed(2)}` : 'ora per ora, più preciso'} onClick={onLaf}>
                            <i className="ph ph-clock"></i> Calcolo in 24 ore
                        </Chip>
                    )}
                </div>
            </section>

            <section className="dg-card">
                <p className="dg-q">4 · Come ripartire i nutrienti?</p>
                <div className="flex flex-wrap gap-2">
                    {MACRO_PRESETS.map((m) => (
                        <Chip
                            key={m.id}
                            on={macroId === m.id && !customMacro}
                            sub={`C ${m.c} · P ${m.p} · G ${m.f}`}
                            onClick={() => {
                                setCustomMacro(false);
                                setG({ macro: m.id }, { macroTargets: { c: m.c, p: m.p, f: m.f } });
                            }}
                        >
                            {m.label}
                        </Chip>
                    ))}
                    <Chip on={customMacro} onClick={() => setCustomMacro(true)}>
                        Personalizza
                    </Chip>
                </div>
                {customMacro && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            ['c', 'Carboidrati'],
                            ['p', 'Proteine'],
                            ['f', 'Grassi'],
                        ].map(([k, l]) => (
                            <Field key={k} label={l} unit="%" value={calcData.macroTargets?.[k]} onChange={(v) => setG({ macro: 'custom' }, { macroTargets: { ...calcData.macroTargets, [k]: Number(v) || 0 } })} />
                        ))}
                    </div>
                )}
                {!macroOk && <p className="dg-warn">Le percentuali sommano {sumPct(calcData.macroTargets)}: devono fare 100.</p>}
            </section>

            <section className="dg-card">
                <p className="dg-q">5 · Quanti pasti al giorno?</p>
                <div className="flex flex-wrap gap-2">
                    {[3, 4, 5, 6].map((k) => (
                        <Chip key={k} on={mealsN === k} onClick={() => setG({ meals: k }, { distribution: MEAL_PRESETS[k].map((m) => ({ ...m })) })}>
                            {k} pasti
                        </Chip>
                    ))}
                </div>
                {calcData.distribution?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {calcData.distribution.map((d, i) => (
                            <div key={d.id}>
                                <label className="fld-label">{d.name} (%)</label>
                                <input
                                    className="fld"
                                    inputMode="numeric"
                                    value={d.value}
                                    onChange={(e) => set({ distribution: calcData.distribution.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) || 0 } : x)) })}
                                />
                            </div>
                        ))}
                    </div>
                )}
                {!distOk && calcData.distribution?.length > 0 && <p className="dg-warn">Le percentuali dei pasti sommano {sumDist(calcData.distribution)}: devono fare 100.</p>}
            </section>

            <details className="dg-card dg-adv">
                <summary>
                    <span>
                        <i className="ph ph-sliders-horizontal"></i> Opzioni di calcolo <small>facoltative</small>
                    </span>
                    <i className="ph ph-caret-down"></i>
                </summary>
                <p className="dg-hint !mt-3">Di solito non serve toccarle: i valori predefiniti vanno bene per la maggior parte dei pazienti.</p>
                <label className="fld-label mt-3">Formula del metabolismo basale</label>
                <select className="fld" value={calcData.formula || 'mifflin'} onChange={(e) => set({ formula: e.target.value })}>
                    {FORMULAS.map(([v, l]) => (
                        <option key={v} value={v}>
                            {l}
                        </option>
                    ))}
                </select>
                <label className="fld-label mt-4">Peso di riferimento</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        ['actual', 'Attuale'],
                        ['ideal', 'Ideale'],
                        ['adjusted', 'Aggiustato'],
                    ].map(([v, l]) => (
                        <Chip key={v} on={(calcData.weightTarget || 'actual') === v} onClick={() => set({ weightTarget: v })}>
                            {l}
                        </Chip>
                    ))}
                </div>
                <p className="dg-hint">In sovrappeso o obesità si usa spesso il peso ideale o aggiustato per non sovrastimare il fabbisogno.</p>
                {(calcData.formula || 'mifflin') === 'katch' && (
                    <div className="mt-3" style={{ maxWidth: 220 }}>
                        <Field label="Massa grassa" unit="%" value={calcData.fatPct} onChange={(v) => set({ fatPct: v })} />
                    </div>
                )}
            </details>

            {/* Risultato */}
            <section className="dg-result">
                {tdee && activityId ? (
                    <>
                        <p className="text-[12px] uppercase tracking-wider opacity-70 font-semibold">Fabbisogno stimato</p>
                        <p className="text-[34px] font-semibold leading-tight">
                            {tdee.toLocaleString('it-IT')} <span className="text-[16px] font-medium opacity-80">kcal al giorno</span>
                        </p>
                        {grams && (
                            <p className="text-[14px] opacity-85 mt-1">
                                Carboidrati {grams.c} g · Proteine {grams.p} g · Grassi {grams.f} g
                            </p>
                        )}
                        <p className="text-[12px] opacity-60 mt-2">Metabolismo basale {rmr} kcal × attività {Number(calcData.laf).toFixed(2)}{Number(calcData.kcalAdjustPct) ? ` ${calcData.kcalAdjustPct > 0 ? '+' : '−'}${Math.abs(calcData.kcalAdjustPct)}%` : ''}</p>
                    </>
                ) : (
                    <p className="text-[15px]">{missing.length ? `Completa ${missing.join(', ')} per calcolare il fabbisogno.` : 'Scegli quanto è attivo (punto 3) per calcolare il fabbisogno.'}</p>
                )}
            </section>

            <div className="flex justify-end mt-6">
                <button className="vw-next" disabled={!ready} onClick={confirm} style={!ready ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
                    {targets?.isConfigured ? 'Aggiorna e torna al menù' : 'Conferma e costruisci il menù'} <i className="ph ph-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};
