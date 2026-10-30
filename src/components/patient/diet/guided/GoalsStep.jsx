import React, { useEffect, useMemo, useState } from 'react';
import { ACTIVITY, BASE_TYPE, GOALS, MACRO_PRESETS, MEAL_PRESETS, applyGoals, getTypes, typeIcon, typeName, computeRmr, computeTdee, distFor, macroGrams, prefillCalc, sumDist, sumPct, typeLaf, typeTargetKcal } from './guidedLogic';
import { dietContext } from '../../../../ai/dietSection';
import { CountUp } from '../../shared/fx';

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
    const [editP, setEditP] = useState(false);
    // sesso non indicato in anagrafica: il valore di partenza è Uomo, ma va segnalato finché non lo si conferma
    const sexMissing = !['M', 'F'].includes(String(patient?.sesso || '').toUpperCase()) && !(calcData.guided || {}).sexChecked;
    const diff = g.dayMode === 'diff';
    const perType = diff && !!g.distByType; // ripartizione dei pasti diversa per tipo di giornata
    const types = getTypes(calcData);
    const cols = perType ? types.map((t) => t.id) : [null];
    const setTypes = (list, extra = {}) => setG({ dayTypes: list, ...extra });
    const patchType = (id, patch) => setTypes(types.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const addType = () => {
        const id = 't' + Date.now();
        setTypes([...types, { id, name: 'Nuova giornata' }], g.distByType ? { distByType: { ...g.distByType, [id]: calcData.distribution.map((m) => ({ ...m })) } } : {});
    };
    const removeType = (id) => {
        const rest = { ...(g.distByType || {}) };
        delete rest[id];
        setTypes(types.filter((t) => t.id !== id), g.distByType ? { distByType: rest } : {});
    };

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
    const distOk = cols.every((c) => sumDist(c ? distFor(calcData, c) : calcData.distribution) === 100);
    const ready = tdee > 0 && macroOk && distOk && !!activityId;

    const grams = useMemo(() => (tdee ? macroGrams(tdee, calcData.macroTargets) : null), [tdee, calcData.macroTargets]);
    const bmi = n(calcData.weight) > 0 && n(calcData.height) > 0 ? n(calcData.weight) / Math.pow(n(calcData.height) / 100, 2) : null;

    const confirm = () => {
        applyGoals({ calcData, setCalcData, setTargets, setDietDays });
        onDone();
    };

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <section className="dg-card">
                <p className="dg-q">1 · Paziente</p>
                {sexMissing && (
                    <div className="dg-warn" style={{ marginTop: 0, marginBottom: 12 }} role="alert">
                        <b>Sesso biologico mancante</b>
                        <div className="flex gap-2 mt-2">
                            {['M', 'F'].map((sx) => (
                                <button key={sx} type="button" className={`dg-chip row ${calcData.sex === sx ? 'on' : ''}`} onClick={() => setG({ sexChecked: true }, { sex: sx })}>
                                    {sx === 'M' ? 'Uomo' : 'Donna'}{calcData.sex === sx ? ' · confermo' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {!editP && missing.length === 0 ? (
                    <div className="gm-sum">
                        <span>
                            {calcData.sex === 'F' ? 'Donna' : 'Uomo'} · {calcData.age} anni · {calcData.weight} kg · {calcData.height} cm{bmi ? ` · BMI ${bmi.toFixed(1)}` : ''}
                        </span>
                        <button className="dg-link" onClick={() => setEditP(true)}>Modifica</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Field label="Sesso">
                                <div className="flex gap-2">
                                    {['M', 'F'].map((sx) => (
                                        <Chip key={sx} on={calcData.sex === sx} onClick={() => setG({ sexChecked: true }, { sex: sx })}>
                                            {sx === 'M' ? 'Uomo' : 'Donna'}
                                        </Chip>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Età" unit="anni" value={calcData.age} onChange={(v) => set({ age: v })} />
                            <Field label="Peso" unit="kg" value={calcData.weight} onChange={(v) => set({ weight: v })} />
                            <Field label="Altezza" unit="cm" value={calcData.height} onChange={(v) => set({ height: v })} />
                        </div>
                        {missing.length > 0 ? <p className="dg-warn">Mancano: {missing.join(', ')}. Li trovi in anagrafica e nelle visite, oppure scrivili qui.</p> : <button className="dg-link mt-3" onClick={() => setEditP(false)}>Fatto</button>}
                    </>
                )}
            </section>

            <section className="dg-card">
                <p className="dg-q">2 · Obiettivo</p>
                <div className="flex flex-wrap gap-2">
                    {GOALS.map((x) => (
                        <Chip key={x.id} on={goalId === x.id} sub={x.hint} onClick={() => setG({ goal: x.id }, { kcalAdjustPct: x.adj })}>
                            <i className={`ph ${x.icon}`}></i> {x.label}
                        </Chip>
                    ))}
                </div>
            </section>

            <section className="dg-card">
                <p className="dg-q">3 · Come sono le giornate?</p>
                <div className="dg-seg" role="tablist" aria-label="Giornate">
                    <button role="tab" aria-selected={!diff} className={!diff ? 'on' : ''} onClick={() => setG({ dayMode: 'same' })}>Tutte uguali</button>
                    <button role="tab" aria-selected={diff} className={diff ? 'on' : ''} onClick={() => setG({ dayMode: 'diff' })}>Differenziate</button>
                </div>
                <p className="dg-hint" style={{ marginTop: 10 }}>
                    {diff ? 'Parti dalla giornata media e aggiungi le altre (riposo, allenamento, turno di notte…) con il nome che preferisci: ognuna ha le sue kcal.' : 'Un solo obiettivo di kcal per tutti i giorni.'}
                </p>
                <p className="fld-label" style={{ marginTop: 12 }}>{diff ? 'Com’è una giornata media?' : 'Quanto è attivo nella giornata?'}</p>
                <div className="flex flex-wrap gap-2">
                    {ACTIVITY.map((a) => (
                        <Chip key={a.id} on={activityId === a.id} sub={a.hint} onClick={() => setG({ activity: a.id }, { laf: a.laf })}>
                            {a.label}
                        </Chip>
                    ))}
                    {onLaf && (
                        <Chip on={activityId === 'custom'} sub={activityId === 'custom' ? `LAF ${Number(calcData.laf).toFixed(2)}` : 'ora per ora, più preciso'} onClick={() => onLaf()}>
                            <i className="ph ph-clock"></i> Calcolo in 24 ore
                        </Chip>
                    )}
                </div>
                {diff && activityId && (
                    <div className="gm-types">
                        <p className="gm-types-h"><span>Giornata</span><span>LAF</span><span>kcal</span><span></span></p>
                        {types.map((t) => {
                            const id = t.id;
                            const base = id === BASE_TYPE;
                            return (
                                <div className="gm-type" key={id}>
                                    {base ? (
                                        <span className="gm-tn"><i className="ph ph-sun"></i> Giornata media</span>
                                    ) : (
                                        <span className="gm-tn gm-edit">
                                            <i className={`ph ${typeIcon(id)}`}></i>
                                            <input value={t.name} onChange={(e) => patchType(id, { name: e.target.value })} onBlur={(e) => !e.target.value.trim() && patchType(id, { name: 'Giornata' })} aria-label="Nome della giornata" placeholder="Nome" />
                                        </span>
                                    )}
                                    {base ? (
                                        <b className="gm-laf ro">{Number(calcData.laf).toFixed(2).replace('.', ',')}</b>
                                    ) : (
                                        <input
                                            className="gm-laf"
                                            inputMode="decimal"
                                            value={t.laf ?? typeLaf(calcData, id).toFixed(2).replace('.', ',')}
                                            onChange={(e) => patchType(id, { laf: e.target.value })}
                                            aria-label={`LAF ${t.name}`}
                                        />
                                    )}
                                    <b className="gm-k">{typeTargetKcal(calcData, id) || '–'}</b>
                                    {base ? (
                                        <span></span>
                                    ) : (
                                        <span className="gm-act">
                                            {onLaf && (
                                                <button className="gm-calc" onClick={() => onLaf((v) => patchType(id, { laf: String(v) }))} aria-label={`Calcola il LAF: ${t.name}`}>
                                                    <i className="ph ph-clock"></i>
                                                </button>
                                            )}
                                            <button className="gm-calc gm-del" onClick={() => removeType(id)} aria-label={`Elimina ${t.name}`}>
                                                <i className="ph ph-trash"></i>
                                            </button>
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                        {types.length < 6 && (
                            <button className="gm-addtype" onClick={addType}>
                                <i className="ph ph-plus-circle"></i> Aggiungi giornata
                            </button>
                        )}
                    </div>
                )}
            </section>

            <section className="dg-card">
                <p className="dg-q">4 · Nutrienti</p>
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
                <p className="dg-q">5 · Pasti</p>
                <div className="flex flex-wrap gap-2">
                    {[3, 4, 5, 6].map((k) => (
                        <Chip key={k} on={mealsN === k} onClick={() => setG({ meals: k, distByType: undefined }, { distribution: MEAL_PRESETS[k].map((m) => ({ ...m })) })}>
                            {k} pasti
                        </Chip>
                    ))}
                </div>
                {diff && calcData.distribution?.length > 0 && (
                    <label className="gm-check">
                        <input
                            type="checkbox"
                            checked={perType}
                            onChange={(e) => setG({ distByType: e.target.checked ? Object.fromEntries(types.map((t) => [t.id, calcData.distribution.map((m) => ({ ...m }))])) : undefined })}
                        />
                        <span>
                            <b>Ripartizione diversa per tipo di giornata</b>
                            <small>Es. più carboidrati prima dell’allenamento</small>
                        </span>
                    </label>
                )}
                {calcData.distribution?.length > 0 && (
                    <div className="gm-wrap">
                        <table className="gm-table">
                            <thead>
                                <tr>
                                    <th>Pasto</th>
                                    {cols.map((c) => (
                                        <th key={c || 'all'}>{c ? typeName(calcData, c) : '% kcal'}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {calcData.distribution.map((m, i) => (
                                    <tr key={m.id}>
                                        <th scope="row">{m.name}</th>
                                        {cols.map((c) => {
                                            const list = c ? distFor(calcData, c) : calcData.distribution;
                                            const v = list[i] ? list[i].value : 0;
                                            const kc = c ? typeTargetKcal(calcData, c) : tdee;
                                            return (
                                                <td key={c || 'all'}>
                                                    <input
                                                        inputMode="numeric"
                                                        value={v}
                                                        aria-label={`${m.name}${c ? ` · ${typeName(calcData, c)}` : ''}`}
                                                        onChange={(e) => {
                                                            const nv = Number(e.target.value.replace(/[^\d]/g, '')) || 0;
                                                            if (!c) set({ distribution: calcData.distribution.map((x, j) => (j === i ? { ...x, value: nv } : x)) });
                                                            else setG({ distByType: { ...g.distByType, [c]: list.map((x, j) => (j === i ? { ...x, value: nv } : x)) } });
                                                        }}
                                                    />
                                                    {kc > 0 && <em>{Math.round((kc * v) / 100)} kcal</em>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Totale</th>
                                    {cols.map((c) => {
                                        const t = sumDist(c ? distFor(calcData, c) : calcData.distribution);
                                        return (
                                            <td key={c || 'all'} className={t === 100 ? 'ok' : 'no'}>
                                                {t}%
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
                {!distOk && calcData.distribution?.length > 0 && <p className="dg-warn">Ogni colonna deve sommare 100%.</p>}
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
                        <p className="text-[12px] uppercase tracking-wider opacity-70 font-semibold">{diff ? 'Fabbisogno stimato · giornata media' : 'Fabbisogno stimato'}</p>
                        <p className="text-[34px] font-semibold leading-tight">
                            <CountUp value={tdee} /> <span className="text-[16px] font-medium opacity-80">kcal al giorno</span>
                        </p>
                        {grams && !diff && (
                            <p className="text-[14px] opacity-85 mt-1">
                                Carboidrati {grams.c} g · Proteine {grams.p} g · Grassi {grams.f} g
                            </p>
                        )}
                        {diff && (
                            <div className="gm-res">
                                {types.map(({ id }) => {
                                    const k = typeTargetKcal(calcData, id);
                                    const gm = macroGrams(k, calcData.macroTargets);
                                    return (
                                        <p key={id}>
                                            <b>{typeName(calcData, id)}</b>
                                            <span>{k} kcal</span>
                                            <small>C {gm.c} · P {gm.p} · G {gm.f}</small>
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-[12px] opacity-60 mt-2">Metabolismo basale {rmr} kcal × attività {Number(calcData.laf).toFixed(2)}{Number(calcData.kcalAdjustPct) ? ` ${calcData.kcalAdjustPct > 0 ? '+' : '−'}${Math.abs(calcData.kcalAdjustPct)}%` : ''}</p>
                    </>
                ) : (
                    <p className="text-[15px]">{missing.length ? `Completa ${missing.join(', ')} per calcolare il fabbisogno.` : 'Scegli quanto è attivo (punto 3) per calcolare il fabbisogno.'}</p>
                )}
            </section>

            <div className="dg-foot">
                <button className="vw-next" disabled={!ready} onClick={confirm} style={!ready ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
                    {targets?.isConfigured ? 'Aggiorna e torna al menù' : 'Conferma e costruisci il menù'} <i className="ph ph-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};
