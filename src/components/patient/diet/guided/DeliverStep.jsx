import React from 'react';
import { STATUSES, dayStatus, dayTotals, setPlanStatus, statusOf } from './guidedLogic';

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
    const rows = dietDays.map((d) => ({ d, st: dayStatus(d, tdee), tot: dayTotals(d), emptyMeals: d.meals.filter((m) => m.items.length === 0).length }));
    const problems = rows.filter((r) => r.st.id === 'off' || r.st.id === 'empty' || r.emptyMeals > 0).length;
    const det = visitaAttiva?.dettagli || {};
    const supplements = Array.isArray(det.diet_supplements) ? det.diet_supplements : [];
    const advice = Array.isArray(det.diet_notes) ? det.diet_notes : [];

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <h2 className="dg-h">Ultimo controllo</h2>
            <p className="dg-sub">{problems === 0 ? 'Tutto in ordine: puoi consegnare il piano.' : `${problems} ${problems === 1 ? 'giorno merita' : 'giorni meritano'} un’occhiata prima della consegna.`}</p>

            <section className="dg-card">
                <p className="dg-q">Riepilogo dei giorni</p>
                {rows.length === 0 && <p className="text-[14px] text-[color:var(--muted)]">Non c’è ancora nessun giorno nel piano.</p>}
                {rows.map(({ d, st, tot, emptyMeals }) => (
                    <div key={d.id} className="dg-row">
                        <i className={`ph ${st.id === 'ok' ? 'ph-check-circle' : st.id === 'empty' ? 'ph-circle-dashed' : 'ph-warning'} text-xl`} style={{ color: st.color }}></i>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14.5px] font-medium">{d.title}</p>
                            <p className="text-[12.5px] text-[color:var(--muted)]">
                                {Math.round(tot.kcal)} kcal · C {Math.round(tot.c)} g · P {Math.round(tot.p)} g · G {Math.round(tot.f)} g
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
                {problems > 0 && (
                    <button className="dg-link mt-3" onClick={onMenu}>
                        <i className="ph ph-pencil-simple"></i> Torna al menù
                    </button>
                )}
            </section>

            {supplements.length > 0 && (
                <section className="dg-card">
                    <p className="dg-q">Integratori consigliati</p>
                    {supplements.map((s) => (
                        <div key={s.id || s.name} className="dg-row" style={{ display: 'block' }}>
                            <p className="text-[14.5px] font-medium">
                                {s.name} {s.dose && <span className="text-[color:var(--muted)] font-normal">· {s.dose}</span>}
                            </p>
                            {s.when && <p className="text-[12.5px] text-[color:var(--muted)]">Quando: {s.when}</p>}
                            {s.why && <p className="text-[12.5px] text-[color:var(--muted)]">Perché: {s.why}</p>}
                        </div>
                    ))}
                    <p className="dg-hint mt-2">Suggerimenti generati da un’AI: valuta tu l’opportunità clinica prima della consegna.</p>
                </section>
            )}
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
                            <button key={x.id} className="dg-mini !h-9 !text-[13px]" style={on ? { background: x.color, color: '#fff', borderColor: x.color } : undefined} onClick={() => setPlanStatus(onUpdateDb, patient.id, visitaAttiva.id, x.id)}>
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
        </div>
    );
};
