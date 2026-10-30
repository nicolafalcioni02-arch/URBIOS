import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionSheet } from '../../../mobile/MobileChrome';
import { SupplementSheet } from './MealSheets';
import { confetti } from '../../shared/fx';
import { STATUSES, dayTarget, dayTypeOf, dayStatus, dayTotals, patchVisit, setPlanStatus, statusOf } from './guidedLogic';

// Passo 3 — Consegna: controllo finale, poi stampa, analisi e stato del piano.

const Action = ({ icon, title, sub, onClick, primary }) => (
    <button onClick={onClick} className={`dg-action ${primary ? 'primary' : ''}`}>
        <i className={`ph ${icon}`}></i>
        <span className="flex-1 text-left">
            <b>{title}</b>
            <small>{sub}</small>
        </span>
        <i className="ph ph-caret-right opacity-60"></i>
    </button>
);

export const DeliverStep = ({ patient, targets, dietDays, visitaAttiva, onUpdateDb, onPrint, onAnalysis, onChart, onMenu }) => {
    const tdee = targets?.isConfigured ? targets.kcal : 0;
    const tdeeOf = (d) => (dayTarget(d, targets)?.isConfigured ? dayTarget(d, targets).kcal : 0);
    const rows = dietDays.map((d) => ({ d, st: dayStatus(d, tdeeOf(d)), tot: dayTotals(d), emptyMeals: d.meals.filter((m) => m.items.length === 0).length }));
    const problems = rows.filter((r) => r.st.id === 'off' || r.st.id === 'empty' || r.emptyMeals > 0).length;
    const det = visitaAttiva?.dettagli || {};
    const supplements = Array.isArray(det.diet_supplements) ? det.diet_supplements : [];
    const advice = Array.isArray(det.diet_notes) ? det.diet_notes : [];
    const [suppSheet, setSuppSheet] = useState(null); // { index | -1 (nuovo), kind: 'form' | 'del' }
    const saveSupps = (list) => patchVisit(onUpdateDb, patient.id, visitaAttiva.id, (v) => ({ ...v, dettagli: { ...v.dettagli, diet_supplements: list } }));

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <p className="dg-sub">{problems === 0 ? 'Tutto in ordine: puoi consegnare il piano.' : `${problems} ${problems === 1 ? 'giorno merita' : 'giorni meritano'} un’occhiata prima della consegna.`}</p>

            <section className="dg-card">
                <p className="dg-q">Riepilogo dei giorni</p>
                {rows.length === 0 && <p className="text-[14px] text-[color:var(--muted)]">Non c’è ancora nessun giorno nel piano.</p>}
                {rows.map(({ d, st, tot, emptyMeals }) => (
                    <div key={d.id} className="dg-row">
                        <i className={`ph ${st.id === 'ok' ? 'ph-check-circle' : st.id === 'empty' ? 'ph-circle-dashed' : 'ph-warning'} text-xl`} style={{ color: st.color }}></i>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14.5px] font-medium">
                                {d.title}
                                {dayTypeOf(d) && d.targets && <em className="dg-badge-type">{dayTypeOf(d).short || dayTypeOf(d).label}</em>}
                            </p>
                            <p className="text-[12.5px] text-[color:var(--muted)]">
                                {Math.round(tot.kcal)}{tdeeOf(d) ? ` / ${Math.round(tdeeOf(d))}` : ''} kcal · C {Math.round(tot.c)} g · P {Math.round(tot.p)} g · G {Math.round(tot.f)} g
                                {emptyMeals > 0 && st.id !== 'empty' ? ` · ${emptyMeals} ${emptyMeals === 1 ? 'pasto vuoto' : 'pasti vuoti'}` : ''}
                            </p>
                        </div>
                        {st.label && (
                            <span className="text-[12px] font-semibold" style={{ color: st.color }}>
                                {st.label}
                            </span>
                        )}
                    </div>
                ))}
                {rows.length > 1 && rows.some((r) => r.d.type && r.d.targets) && tdee > 0 && (() => {
                    const avgGoal = rows.reduce((a, r) => a + tdeeOf(r.d), 0) / rows.length;
                    const avgPlan = rows.reduce((a, r) => a + r.tot.kcal, 0) / rows.length;
                    return (
                        <p className="dg-hint mt-3">
                            Media dei giorni: <b>{Math.round(avgPlan)}</b> kcal nel menù, <b>{Math.round(avgGoal)}</b> kcal di obiettivo (piano: {Math.round(tdee)}).
                        </p>
                    );
                })()}
                {problems > 0 && (
                    <button className="dg-link mt-3" onClick={onMenu}>
                        <i className="ph ph-pencil-simple"></i> Torna al menù
                    </button>
                )}
            </section>

            <section className="dg-card">
                <p className="dg-q">Integratori</p>
                {supplements.length === 0 && <p className="text-[14px] text-[color:var(--muted)] mb-1">Nessun integratore. Aggiungine uno se serve.</p>}
                {supplements.map((s, i) => (
                    <div key={s.id || `${s.name}-${i}`} className="dg-row" style={{ alignItems: 'flex-start' }}>
                        <div className="flex-1 min-w-0" style={{ flex: '1 1 0' }}>
                            <p className="text-[14.5px] font-medium">
                                {s.name} {s.dose && <span className="text-[color:var(--muted)] font-normal">· {s.dose}</span>}
                            </p>
                            {s.when && <p className="text-[12.5px] text-[color:var(--muted)]">Quando: {s.when}</p>}
                            {s.why && <p className="text-[12.5px] text-[color:var(--muted)]">Perché: {s.why}</p>}
                        </div>
                        <button className="dg-ghost" aria-label={`Modifica ${s.name}`} onClick={() => setSuppSheet({ index: i, kind: 'form' })}>
                            <i className="ph ph-pencil-simple"></i>
                        </button>
                        <button className="dg-ghost" aria-label={`Elimina ${s.name}`} onClick={() => setSuppSheet({ index: i, kind: 'del' })}>
                            <i className="ph ph-trash"></i>
                        </button>
                    </div>
                ))}
                <button className="dg-add" onClick={() => setSuppSheet({ index: -1, kind: 'form' })}>
                    <i className="ph ph-plus-circle"></i> Aggiungi integratore
                </button>
                {supplements.length > 0 && <p className="dg-hint mt-2">Se i suggerimenti sono generati da un’AI, valuta tu l’opportunità clinica prima della consegna.</p>}
            </section>
            {advice.length > 0 && (
                <section className="dg-card">
                    <p className="dg-q">Consigli per il paziente</p>
                    <ul className="list-disc pl-6 space-y-1 text-[14px]">
                        {advice.map((a, i) => (
                            <li key={i}>{a}</li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="dg-card">
                <p className="dg-q">Stato del piano</p>
                <div className="flex gap-1.5 flex-wrap">
                    {STATUSES.filter((x) => x.id !== 'active' || statusOf(visitaAttiva).id === 'active').map((x) => {
                        const on = statusOf(visitaAttiva).id === x.id;
                        return (
                            <button key={x.id} className="dg-mini !h-9 !text-[13px]" style={on ? { background: x.color, color: '#fff', borderColor: x.color } : undefined} onClick={(e) => { setPlanStatus(onUpdateDb, patient.id, visitaAttiva.id, x.id); if (x.id === 'delivery') confetti(e.currentTarget); }}>
                                <i className={`ph ${x.icon}`}></i> {x.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <Action primary icon="ph-printer" title="Anteprima e stampa" sub="Il piano pronto da consegnare" onClick={onPrint} />
                <Action icon="ph-chart-line-up" title="Grafici" sub="Macro, kcal e andamento (si aggiungono alla stampa)" onClick={onChart} />
                <Action icon="ph-stethoscope" title="Analisi nutrienti" sub="Vitamine, minerali e valori di riferimento" onClick={onAnalysis} />
            </div>
            <p className="dg-hint text-center mt-6">
                <i className="ph ph-cloud-check"></i> Le modifiche si salvano da sole nella visita.
            </p>

            {suppSheet && suppSheet.kind === 'form' && (
                <SupplementSheet
                    initial={suppSheet.index >= 0 ? supplements[suppSheet.index] : null}
                    onSubmit={(v) => saveSupps(suppSheet.index >= 0 ? supplements.map((x, i) => (i === suppSheet.index ? { ...x, ...v } : x)) : [...supplements, { id: 'sup-' + Date.now(), ...v }])}
                    onClose={() => setSuppSheet(null)}
                />
            )}
            {suppSheet && suppSheet.kind === 'del' && supplements[suppSheet.index] && createPortal(
                <ActionSheet
                    title={`Eliminare ${supplements[suppSheet.index].name}?`}
                    subtitle="L'integratore verrà tolto dal piano."
                    onClose={() => setSuppSheet(null)}
                    groups={[
                        [{ label: 'Elimina l’integratore', icon: 'ph-trash', tone: 'danger', onClick: () => saveSupps(supplements.filter((_, i) => i !== suppSheet.index)) }],
                        [{ label: 'Annulla', icon: 'ph-x', onClick: () => {} }],
                    ]}
                />,
                document.body
            )}
        </div>
    );
};
