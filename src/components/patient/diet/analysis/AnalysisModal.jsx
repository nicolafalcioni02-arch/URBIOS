import React, { useMemo, useState } from 'react';
import { guidedCss } from '../guided/guidedStyles';
import { GROUPS, STATUS, analyzePlan, richFoods } from './drvEngine';

// Analisi del piano — una schermata sola: sintesi, energia e macro, vitamine e minerali.
// Mostra solo ciò che si può dire con onestà: un dato mancante nel database alimenti non diventa una "carenza".

const fmt = (x, d = 0) => (Number.isFinite(x) ? x.toLocaleString('it-IT', { maximumFractionDigits: d, minimumFractionDigits: d }) : '–');
const amount = (x, unit) => `${fmt(x, x < 10 ? 1 : 0)} ${unit}`;

const Chip = ({ s }) => (
    <span className="an-chip" style={{ background: STATUS[s].bg, color: STATUS[s].color }}>
        {STATUS[s].label}
    </span>
);

// barra con fascia di riferimento (es. carboidrati 45–60% dell'energia)
const RangeBar = ({ value, lo, hi, max = 100, color = 'var(--ink)' }) => (
    <div className="an-bar" style={{ position: 'relative' }}>
        {lo !== undefined && <span className="an-band" style={{ left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%` }}></span>}
        <i style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}></i>
    </div>
);

const NutrientRow = ({ n, foodDB, open, onToggle }) => {
    const color = STATUS[n.status].color;
    const rich = open && ['low', 'mid'].includes(n.status) ? richFoods(n.def, foodDB) : [];
    return (
        <div className="an-row">
            <button className="an-rowhead" onClick={onToggle}>
                <span className="flex-1 min-w-0 text-left">
                    <b className="text-[14.5px]">{n.def.label}</b>
                    <small className="block text-[12.5px] text-[color:var(--muted)]">
                        {n.status === 'partial'
                            ? `almeno ${amount(n.value, n.def.unit)}${n.target ? ` · riferimento ${amount(n.target, n.def.unit)}` : ''}`
                            : n.def.limitOnly
                              ? `${amount(n.value, n.def.unit)} · massimo consigliato ${amount(n.limit, n.def.unit)}`
                              : `${amount(n.value, n.def.unit)} su ${amount(n.target, n.def.unit)} (${n.basis})`}
                    </small>
                </span>
                <Chip s={n.status} />
            </button>
            {n.status !== 'partial' && n.target && <RangeBar value={Math.min(n.pct, 100)} color={color} />}
            {open && (
                <div className="an-more">
                    {n.status === 'partial' && <p>Nel piano solo il {Math.round(n.knownShare * 100)}% degli alimenti riporta questo dato nel database: il valore reale è più alto di quello mostrato.</p>}
                    {n.ar && n.status !== 'partial' && <p>Fabbisogno medio (AR): {amount(n.ar, n.def.unit)}.</p>}
                    {n.ul && <p>Limite massimo (UL): {amount(n.ul, n.def.unit)}.</p>}
                    {n.status === 'high' && n.def.limitOnly && <p>Meglio ridurre il sale e i prodotti conservati o trasformati.</p>}
                    {rich.length > 0 && (
                        <p>
                            Alimenti comuni ricchi di {n.def.label.toLowerCase()}:{' '}
                            {rich.map((r, i) => (
                                <span key={r.name}>
                                    {i > 0 && ', '}
                                    <b>{r.name}</b> ({fmt(r.value, r.value < 10 ? 1 : 0)} {n.def.unit}/100 g)
                                </span>
                            ))}
                            .
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export const AnalysisModal = ({ isOpen, onClose, patient, calcData, targets, dietDays, foodDB, drvDB, onOpenDrv }) => {
    const [scope, setScope] = useState('avg');
    const [mode, setMode] = useState('standard');
    const [openRow, setOpenRow] = useState(null);

    const days = scope === 'avg' ? dietDays : dietDays.filter((d) => d.id === scope);
    const profile = { sex: calcData?.sex, age: calcData?.age, weight: calcData?.weight };
    const a = useMemo(() => (isOpen ? analyzePlan({ days: days.length ? days : dietDays, foodDB, drvDB, profile, mode, targets }) : null), [isOpen, scope, mode, dietDays, foodDB, drvDB, calcData, targets]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!isOpen || !a) return null;

    const m = a.macros;
    const fiber = a.nutrients.find((n) => n.def.key === 'total_fiber');
    const micro = (list) => list.filter((n) => n.def.key !== 'total_fiber');
    const problems = a.problems.filter((n) => n.def.key !== 'total_fiber');
    const high = problems.filter((n) => n.status === 'high');
    const needs = problems.filter((n) => n.status !== 'high');
    const adequate = micro(a.adequate);
    const partial = micro(a.partial);
    const nodata = a.nodata.filter((n) => n.def.key !== 'total_fiber');
    const isWoman = calcData?.sex === 'F' && Number(calcData?.age) >= 18;

    // sintesi in parole semplici
    const lines = [];
    if (m.kcalTarget) {
        const d = ((m.kcal - m.kcalTarget) / m.kcalTarget) * 100;
        lines.push({ ok: Math.abs(d) <= 8, text: `Energia: ${fmt(m.kcal)} kcal al giorno (obiettivo ${fmt(m.kcalTarget)}${Math.abs(d) > 8 ? `, ${d < 0 ? 'sotto' : 'sopra'} del ${Math.round(Math.abs(d))}%` : ''}).` });
    } else lines.push({ ok: true, text: `Energia: ${fmt(m.kcal)} kcal al giorno.` });
    const rangeNote = (name, r, e) => (r && (e < r[0] - 1 || e > r[1] + 1) ? `${name} al ${Math.round(e)}% dell'energia (indicato ${r[0]}–${r[1]}%)` : null);
    const off = [rangeNote('Carboidrati', m.c.range, m.c.e), rangeNote('Grassi', m.f.range, m.f.e)].filter(Boolean);
    if (m.p.perKg && m.p.ref && m.p.perKg < m.p.ref) off.push(`proteine ${fmt(m.p.perKg, 2)} g/kg (minimo ${m.p.ref})`);
    lines.push({ ok: off.length === 0, text: off.length ? `Macronutrienti da rivedere: ${off.join('; ')}.` : 'Macronutrienti in equilibrio rispetto ai riferimenti.' });
    if (needs.length) lines.push({ ok: false, text: `Da migliorare: ${needs.map((n) => n.def.label.toLowerCase()).join(', ')}.` });
    if (high.length) lines.push({ ok: false, text: `Sopra il limite: ${high.map((n) => n.def.label.toLowerCase()).join(', ')}.` });
    if (!needs.length && !high.length) lines.push({ ok: true, text: 'Nessuna carenza né eccesso sui nutrienti valutabili.' });
    if (fiber && ['low', 'mid'].includes(fiber.status)) lines.push({ ok: false, text: `Fibre ${fmt(fiber.value)} g: ne servono almeno ${fmt(fiber.target)} g.` });

    const toggle = (k) => setOpenRow(openRow === k ? null : k);

    return (
        <div className="dg-overlay" style={{ zIndex: 13000 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <style>{guidedCss + anCss}</style>
            <div className="dg-modal" style={{ maxWidth: '52rem' }}>
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-stethoscope text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[18px] font-semibold leading-tight">Analisi del piano</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)] truncate">
                            {patient?.nome} {patient?.cognome} · {a.reference}
                        </p>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    {/* Cosa si sta analizzando */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {dietDays.length > 1 && (
                            <button className={`dg-chip row ${scope === 'avg' ? 'on' : ''}`} onClick={() => setScope('avg')}>
                                Media dei giorni
                            </button>
                        )}
                        {dietDays.map((d) => (
                            <button key={d.id} className={`dg-chip row ${scope === d.id || (dietDays.length === 1 && scope === 'avg') ? 'on' : ''}`} onClick={() => setScope(d.id)}>
                                {d.title}
                            </button>
                        ))}
                    </div>
                    {isWoman && (
                        <div className="flex gap-1.5 mt-3 flex-wrap items-center">
                            <span className="text-[12.5px] text-[color:var(--muted)] mr-1">Riferimento:</span>
                            {[
                                ['standard', 'Standard'],
                                ['pregnant', 'Gravidanza'],
                                ['lactating', 'Allattamento'],
                            ].map(([k, l]) => (
                                <button key={k} className={`dg-mini ${mode === k ? 'on' : ''}`} onClick={() => setMode(k)}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    )}
                    {a.missingProfile.length > 0 && <p className="dg-warn">Manca {a.missingProfile.join(' e ')} del paziente: uso valori da adulto standard. Completali negli Obiettivi per un confronto preciso.</p>}

                    {!a.ready ? (
                        <div className="text-center py-14">
                            <div className="mx-auto w-14 h-14 rounded-full grid place-items-center text-2xl" style={{ background: 'var(--soft)' }}>
                                <i className="ph ph-fork-knife"></i>
                            </div>
                            <p className="dg-h !text-[22px] mt-4">Non c’è ancora niente da analizzare</p>
                            <p className="dg-sub">Aggiungi degli alimenti al menù e l’analisi comparirà qui.</p>
                        </div>
                    ) : (
                        <>
                            {/* In sintesi */}
                            <section className="dg-card an-sum">
                                <p className="dg-q">In sintesi</p>
                                {lines.map((l, i) => (
                                    <p key={i} className="an-line">
                                        <i className={`ph ${l.ok ? 'ph-check-circle' : 'ph-warning'}`} style={{ color: l.ok ? '#1F8A5B' : '#C2413A' }}></i>
                                        <span>{l.text}</span>
                                    </p>
                                ))}
                            </section>

                            {/* Energia e macro */}
                            <section className="dg-card">
                                <p className="dg-q">Energia e macronutrienti</p>
                                <div className="an-row">
                                    <div className="an-rowhead" style={{ cursor: 'default' }}>
                                        <span className="flex-1">
                                            <b className="text-[14.5px]">Energia</b>
                                            <small className="block text-[12.5px] text-[color:var(--muted)]">
                                                {fmt(m.kcal)} kcal{m.kcalTarget ? ` su ${fmt(m.kcalTarget)}` : ''}
                                            </small>
                                        </span>
                                    </div>
                                    {m.kcalTarget && <RangeBar value={(m.kcal / m.kcalTarget) * 100} color={Math.abs(m.kcal - m.kcalTarget) / m.kcalTarget <= 0.08 ? '#1F8A5B' : '#C2413A'} />}
                                </div>
                                {[
                                    ['Carboidrati', m.c.g, m.c.e, m.c.range, null],
                                    ['Proteine', m.p.g, m.p.e, null, m.p.perKg ? `${fmt(m.p.perKg, 2)} g/kg${m.p.ref ? ` (minimo ${m.p.ref})` : ''}` : null],
                                    ['Grassi', m.f.g, m.f.e, m.f.range, null],
                                ].map(([label, g, e, range, extra]) => {
                                    const inRange = !range || (e >= range[0] - 1 && e <= range[1] + 1);
                                    return (
                                        <div className="an-row" key={label}>
                                            <div className="an-rowhead" style={{ cursor: 'default' }}>
                                                <span className="flex-1">
                                                    <b className="text-[14.5px]">{label}</b>
                                                    <small className="block text-[12.5px] text-[color:var(--muted)]">
                                                        {fmt(g)} g · {fmt(e)}% dell’energia{range ? ` (indicato ${range[0]}–${range[1]}%)` : ''}
                                                        {extra ? ` · ${extra}` : ''}
                                                    </small>
                                                </span>
                                            </div>
                                            <RangeBar value={e} lo={range ? range[0] : undefined} hi={range ? range[1] : undefined} max={80} color={inRange ? '#1F8A5B' : '#C2413A'} />
                                        </div>
                                    );
                                })}
                                {fiber && fiber.target && <NutrientRow n={fiber} foodDB={foodDB} open={openRow === 'fiber'} onToggle={() => toggle('fiber')} />}
                            </section>

                            {/* Vitamine e minerali */}
                            <section className="dg-card">
                                <p className="dg-q">Vitamine e minerali</p>
                                {problems.length === 0 && <p className="text-[14px] text-[color:var(--muted)]">Nessun nutriente da correggere tra quelli valutabili.</p>}
                                {problems.map((n) => (
                                    <NutrientRow key={n.def.drv} n={n} foodDB={foodDB} open={openRow === n.def.drv} onToggle={() => toggle(n.def.drv)} />
                                ))}

                                {adequate.length > 0 && (
                                    <details className="an-details">
                                        <summary>
                                            Adeguati ({adequate.length}) <i className="ph ph-caret-down"></i>
                                        </summary>
                                        {GROUPS.map((g) => {
                                            const list = adequate.filter((n) => n.def.group === g);
                                            return (
                                                list.length > 0 && (
                                                    <div key={g}>
                                                        <p className="an-group">{g}</p>
                                                        {list.map((n) => (
                                                            <NutrientRow key={n.def.drv} n={n} foodDB={foodDB} open={openRow === n.def.drv} onToggle={() => toggle(n.def.drv)} />
                                                        ))}
                                                    </div>
                                                )
                                            );
                                        })}
                                    </details>
                                )}

                                {partial.length > 0 && (
                                    <details className="an-details">
                                        <summary>
                                            Dato incompleto ({partial.length}) <i className="ph ph-caret-down"></i>
                                        </summary>
                                        <p className="dg-hint !mt-2 !mb-1">Il database alimenti non riporta questi nutrienti per molti degli alimenti scelti: il valore mostrato è un minimo, non una carenza.</p>
                                        {partial.map((n) => (
                                            <NutrientRow key={n.def.drv} n={n} foodDB={foodDB} open={openRow === n.def.drv} onToggle={() => toggle(n.def.drv)} />
                                        ))}
                                    </details>
                                )}

                                {nodata.length > 0 && (
                                    <details className="an-details">
                                        <summary>
                                            Non valutabili con il database attuale ({nodata.length}) <i className="ph ph-caret-down"></i>
                                        </summary>
                                        <p className="dg-hint !mt-2">{nodata.map((n) => n.def.label).join(', ')}. Nel database alimenti non ci sono dati sufficienti: nessun giudizio, per non segnalare carenze che non esistono.</p>
                                    </details>
                                )}
                            </section>

                            {a.unmatched.length > 0 && (
                                <p className="dg-warn">
                                    Alimenti non trovati nel database ({a.unmatched.slice(0, 4).join(', ')}
                                    {a.unmatched.length > 4 ? '…' : ''}): contano per kcal e macro, ma non per vitamine e minerali.
                                </p>
                            )}
                            <p className="dg-hint text-center mt-5">
                                Riferimenti EFSA (DRV) scelti per età, sesso e condizione. Stime calcolate sui valori medi del database alimenti: non sostituiscono la valutazione clinica.
                                {onOpenDrv && (
                                    <>
                                        {' '}
                                        <button className="dg-link" onClick={onOpenDrv}>
                                            Database dei riferimenti
                                        </button>
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const anCss = `
.an-chip { font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; flex: none; }
.an-bar { height: 7px; border-radius: 99px; background: var(--soft); overflow: hidden; margin-top: 8px; }
.an-bar > i { display: block; height: 100%; border-radius: 99px; transition: width .4s var(--ease, ease); position: relative; }
.an-band { position: absolute; top: 0; bottom: 0; background: rgba(31,138,91,.22); z-index: 0; }
.an-row { padding: 12px 0; border-bottom: 1px solid var(--line); }
.an-row:last-child { border-bottom: 0; }
.an-rowhead { display: flex; align-items: center; gap: 12px; width: 100%; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; }
.an-more { margin-top: 10px; padding: 12px 14px; border-radius: 14px; background: #FBFAF8; font-size: 13px; line-height: 1.5; color: #3b3a36; }
.an-more p + p { margin-top: 6px; }
.an-sum { background: var(--ink); color: #fff; border-color: var(--ink); }
.an-sum .dg-q { color: rgba(255,255,255,.7); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
.an-line { display: flex; gap: 10px; align-items: flex-start; font-size: 14.5px; line-height: 1.45; padding: 5px 0; }
.an-line i { font-size: 19px; flex: none; margin-top: 1px; }
.an-sum .an-line i { filter: brightness(1.5); }
.an-details { margin-top: 14px; border-top: 1px solid var(--line); padding-top: 12px; }
.an-details summary { cursor: pointer; font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; list-style: none; }
.an-details summary::-webkit-details-marker { display: none; }
.an-details[open] summary i { transform: rotate(180deg); }
.an-group { font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 14px 0 0; }
`;
