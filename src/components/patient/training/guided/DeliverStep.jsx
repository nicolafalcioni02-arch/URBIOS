import React, { useMemo } from 'react';
import { analyzeScheda } from '../logic/analysis';
import { STATUSES, statusById } from '../../shared/planCommon';
import { confetti } from '../../shared/fx';

// Passo 3 — Consegna: controllo finale (avvisi di programmazione), stato della scheda, stampa.

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

export const DeliverStep = ({ weeks, header, setHeader, massimali, profile, onPrint, onAnalysis, onProgression, onTools, onProgram }) => {
    const A = useMemo(() => analyzeScheda({ weeks, header, massimali, profile }), [weeks, header, massimali, profile]);
    const st = statusById(header.stato);
    const warnings = A.warnings.filter((w) => w.level === 'warn' || w.level === 'info');
    const warn = warnings.filter((w) => w.level === 'warn');
    const emptyDays = weeks.reduce((n, w) => n + w.days.filter((d) => !d.exercises.some((e) => e.name)).length, 0);
    const problems = warn.length + (emptyDays ? 1 : 0);

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <p className="dg-sub">{problems === 0 ? 'Tutto in ordine: puoi consegnare la scheda.' : `${problems} ${problems === 1 ? 'cosa merita' : 'cose meritano'} un’occhiata prima della consegna.`}</p>

            <section className="dg-card">
                <p className="dg-q">Riepilogo</p>
                {A.weeks.map((w, i) => {
                    const src = weeks[i];
                    const exs = src.days.reduce((n, d) => n + d.exercises.filter((e) => e.name).length, 0);
                    const mins = w.days.filter((d) => d.trains).map((d) => d.minutes);
                    const avg = mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
                    return (
                        <div key={src.id} className="dg-row">
                            <i className={`ph ${exs ? 'ph-check-circle' : 'ph-circle-dashed'} text-xl`} style={{ color: exs ? '#1F8A5B' : '#9A988F' }}></i>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14.5px] font-medium">
                                    {src.title}
                                    {src.kind === 'deload' && <span className="dg-badge">scarico</span>}
                                </p>
                                <p className="text-[12.5px] text-[color:var(--muted)]">
                                    {src.days.length} sedute · {exs} esercizi{avg ? ` · circa ${avg} min a seduta` : ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {emptyDays > 0 && (
                    <p className="dg-warn">
                        {emptyDays} {emptyDays === 1 ? 'seduta è vuota' : 'sedute sono vuote'}.{' '}
                        <button className="dg-link" onClick={onProgram}>
                            Torna alla scheda
                        </button>
                    </p>
                )}
            </section>

            {warnings.length > 0 && (
                <section className="dg-card">
                    <p className="dg-q">Controllo di programmazione</p>
                    <div className="space-y-1.5 text-[13.5px]">
                        {warnings.slice(0, 8).map((w, i) => (
                            <p key={i}>
                                <i className={`ph ${w.level === 'warn' ? 'ph-warning' : 'ph-info'} mr-1.5`} style={{ color: w.level === 'warn' ? '#C2413A' : '#6E6D69' }}></i>
                                <span className="text-[color:var(--muted)]">{w.weekTitle}:</span> {w.text}
                            </p>
                        ))}
                        {warnings.length > 8 && <p className="text-[color:var(--muted)]">…e altri {warnings.length - 8} avvisi nell’analisi della scheda.</p>}
                    </div>
                    <p className="dg-hint">Sono indicazioni di letteratura, non prescrizioni: la decisione è tua.</p>
                </section>
            )}

            <section className="dg-card">
                <p className="dg-q">Stato della scheda</p>
                <div className="flex gap-1.5 flex-wrap">
                    {STATUSES.filter((x) => x.id !== 'active' || st.id === 'active').map((x) => (
                        <button key={x.id} className="dg-mini !h-9 !text-[13px]" style={st.id === x.id ? { background: x.color, color: '#fff', borderColor: x.color } : undefined} onClick={(e) => { setHeader({ ...header, stato: x.id }); if (x.id === 'delivery') confetti(e.currentTarget); }}>
                            <i className={`ph ${x.icon}`}></i> {x.label}
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <Action primary icon="ph-printer" title="Anteprima e stampa" sub="La scheda pronta da consegnare" onClick={onPrint} />
                <Action icon="ph-chart-bar" title="Analisi della scheda" sub="Volume per muscolo, carico, avvisi" onClick={onAnalysis} />
                <Action icon="ph-trend-up" title="Genera progressione" sub="Costruisce le settimane successive" onClick={onProgression} />
                <Action icon="ph-calculator" title="Massimali e calcolatori" sub="1RM, cardio, energia, recupero" onClick={onTools} />
            </div>
            <p className="dg-hint text-center mt-6">
                <i className="ph ph-cloud-check"></i> Le modifiche si salvano da sole.
            </p>
        </div>
    );
};
