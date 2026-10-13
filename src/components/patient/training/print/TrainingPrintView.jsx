import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { trainingPrintCss } from './printStyles';
import { buildPrintPlan, columnsFor } from '../logic/printPlan';
import { goalById } from '../logic/science/guidelines';

const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};
const kgFmt = (x) => (x >= 1000 ? `${(x / 1000).toFixed(1).replace('.', ',')} t` : `${Math.round(x)} kg`);

// Anteprima + stampa della scheda su A4. "Stampa" apre la finestra di stampa del browser (da lì anche "Salva come PDF").
export const TrainingPrintView = ({ header, weeks, exerciseDB, massimali, profile, professional, onClose, initialOptions }) => {
    const [opts, setOpts] = useState({
        weekId: 'all',
        images: true,
        pagePerDay: true,
        notes: true,
        studio: true,
        summary: false,
        legend: true,
        ...(initialOptions || {}),
    });
    const set = (patch) => setOpts((o) => ({ ...o, ...patch }));
    const prof = professional || {};

    useEffect(() => {
        document.body.classList.add('tp-open');
        return () => document.body.classList.remove('tp-open');
    }, []);

    const ctx = useMemo(
        () => ({
            massimali: massimali || {},
            profile: profile || null,
            goal: goalById(header.tipo),
            extraMin: Number.isFinite(parseFloat(header.extraMin)) ? parseFloat(header.extraMin) : 10,
        }),
        [massimali, profile, header.tipo, header.extraMin]
    );
    const plan = useMemo(
        () => buildPrintPlan(weeks, exerciseDB, { weekId: opts.weekId, ctx: opts.summary ? ctx : null }),
        [weeks, exerciseDB, opts.weekId, opts.summary, ctx]
    );
    const totals = plan.reduce((a, w) => ({ days: a.days + w.days.length, ex: a.ex + w.days.reduce((b, d) => b + d.rows.length, 0) }), { days: 0, ex: 0 });
    const allRows = plan.flatMap((w) => w.days.flatMap((d) => d.rows));
    const usesSS = allRows.some((r) => r.ss),
        usesRpe = allRows.some((r) => r.rpe),
        usesTempo = allRows.some((r) => r.tempo),
        usesWarm = allRows.some((r) => /risc\./.test(r.serie));
    const profName = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    const hasProfile = profName && !(prof.nome === 'Dottore' && !prof.cognome); // 'Dottore' è il valore predefinito: non va stampato
    const goal = goalById(header.tipo);

    return ReactDOM.createPortal(
        <div className="tp-overlay">
            <style>{trainingPrintCss}</style>
            <div className="tp-toolbar">
                <strong style={{ fontSize: 14 }}>Stampa scheda</strong>
                <label>
                    Cosa stampare:&nbsp;
                    <select value={opts.weekId} onChange={(e) => set({ weekId: e.target.value })}>
                        <option value="all">Tutta la scheda</option>
                        {weeks.map((w, i) => (
                            <option key={w.id} value={w.id}>
                                {w.title || `Settimana ${i + 1}`}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <input type="checkbox" checked={opts.images} onChange={(e) => set({ images: e.target.checked })} /> Figure esercizi
                </label>
                <label>
                    <input type="checkbox" checked={opts.pagePerDay} onChange={(e) => set({ pagePerDay: e.target.checked })} /> Un giorno per pagina
                </label>
                <label>
                    <input type="checkbox" checked={opts.notes} onChange={(e) => set({ notes: e.target.checked })} /> Note
                </label>
                <label>
                    <input type="checkbox" checked={opts.summary} onChange={(e) => set({ summary: e.target.checked })} /> Riepilogo seduta (durata, volume)
                </label>
                <label>
                    <input type="checkbox" checked={opts.legend} onChange={(e) => set({ legend: e.target.checked })} /> Legenda
                </label>
                <label>
                    <input type="checkbox" checked={opts.studio} onChange={(e) => set({ studio: e.target.checked })} /> Intestazione studio
                </label>
                <span style={{ flex: 1 }} />
                <button className="tp-btn main" onClick={() => window.print()}>
                    Stampa / Salva PDF
                </button>
                <button className="tp-btn alt" onClick={onClose}>
                    Chiudi
                </button>
            </div>

            <div className="tp-scroll">
                <div className="tp-doc" id="tp-doc">
                    {opts.studio && (hasProfile || prof.titolo_professionale) && (
                        <div className="tp-head">
                            <div>
                                <div className="tp-studio-name">{hasProfile ? profName : ''}</div>
                                {prof.titolo_professionale && <div className="tp-studio-sub">{prof.titolo_professionale}</div>}
                            </div>
                            <div className="tp-studio-right">
                                {prof.indirizzo_studio && <div>{prof.indirizzo_studio}</div>}
                                {(prof.numero_albo || prof.p_iva) && (
                                    <div>
                                        {prof.numero_albo ? `Albo n. ${prof.numero_albo}` : ''}
                                        {prof.numero_albo && prof.p_iva ? ' | ' : ''}
                                        {prof.p_iva ? `P.IVA ${prof.p_iva}` : ''}
                                    </div>
                                )}
                                {(prof.telefono || prof.email) && <div>{[prof.telefono, prof.email].filter(Boolean).join(' · ')}</div>}
                            </div>
                        </div>
                    )}

                    <h1 className="tp-doc-title">Scheda di allenamento</h1>
                    <p className="tp-doc-sub">
                        {header.titolo ||
                            `${plan.length} ${plan.length === 1 ? 'settimana' : 'settimane'} · ${totals.days} ${totals.days === 1 ? 'giorno' : 'giorni'} · ${totals.ex} esercizi`}
                    </p>
                    <div className="tp-client">
                        <div>
                            <small>Cliente</small>
                            <b>{header.cliente || '—'}</b>
                        </div>
                        <div>
                            <small>Obiettivo</small>
                            <b>{header.obiettivo || (goal ? goal.label : '—')}</b>
                        </div>
                        <div>
                            <small>Data</small>
                            <b>{fmtDate(header.data) || '—'}</b>
                        </div>
                    </div>

                    {plan.length === 0 && <p className="tp-empty">La scheda è vuota: compila almeno un esercizio.</p>}

                    {plan.map((week, wi) => (
                        <section key={week.id}>
                            <h2 className={`tp-week-title ${wi > 0 ? 'tp-newpage' : ''}`}>
                                {week.title}
                                {week.kind === 'deload' && <span className="tp-deload">SCARICO</span>}
                            </h2>
                            {week.note && <p className="tp-weeknote">{week.note}</p>}
                            {week.days.map((day, di) => {
                                const cols = columnsFor(day.rows, opts);
                                const colKeys = cols.map((c) => c.k);
                                return (
                                    <div key={day.id} className={`tp-day tp-flow ${opts.pagePerDay && di > 0 ? 'tp-newpage' : ''}`}>
                                        <h3 className="tp-day-title">
                                            Giorno {day.number}
                                            {day.title ? ` — ${day.title}` : ''}
                                            <span>{day.rows.length} esercizi</span>
                                        </h3>
                                        {day.summary && (
                                            <p className="tp-sum">
                                                Durata stimata ~{Math.round(day.summary.minutes)} min · {day.summary.workSets} serie di lavoro
                                                {day.summary.volumeLoad ? ` · volume ${kgFmt(day.summary.volumeLoad)}` : ''}
                                                {day.summary.avgPct !== null ? ` · intensità media ${Math.round(day.summary.avgPct)}% 1RM` : ''}
                                                {day.summary.kcal !== null ? ` · ≈ ${Math.round(day.summary.kcal)} kcal` : ''}
                                            </p>
                                        )}
                                        <table className="tp-table">
                                            <colgroup>
                                                {cols.map((c) => (
                                                    <col key={c.k} style={{ width: `${c.w}mm` }} />
                                                ))}
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    {cols.map((c) => (
                                                        <th key={c.k}>{c.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {day.rows.map((r) => (
                                                    <tr key={r.id} className="tp-row">
                                                        {colKeys.includes('img') && (
                                                            <td className={`tp-img n${Math.min(r.images.length, 4)}`}>
                                                                {r.images.map((src, i) => (
                                                                    <img key={i} src={src} alt="" />
                                                                ))}
                                                            </td>
                                                        )}
                                                        <td className="tp-name">
                                                            <b>
                                                                {r.ss && <span className="tp-ss">{r.ss}</span>}
                                                                {r.name}
                                                            </b>
                                                            {r.group && <span>{r.group}</span>}
                                                            {r.note && <em className="tp-exnote">{r.note}</em>}
                                                        </td>
                                                        <td className="tp-serie">{r.serie}</td>
                                                        {colKeys.includes('load') && (
                                                            <td className="tp-load">
                                                                {r.load && <b>{r.load.includes('/') ? r.load : `${r.load} kg`}</b>}
                                                                {r.pct && <small>{r.pct.includes('/') ? r.pct : `${r.pct}%`} 1RM</small>}
                                                            </td>
                                                        )}
                                                        {colKeys.includes('rpe') && <td className="tp-rpe">{r.rpe}</td>}
                                                        {colKeys.includes('tempo') && <td className="tp-tempo">{r.tempo}</td>}
                                                        <td className="tp-rec">{r.rec}</td>
                                                        {colKeys.includes('note') && <td className="tp-note">{r.notes.join(' · ')}</td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {day.note && <div className="tp-daynote">{day.note}</div>}
                                    </div>
                                );
                            })}
                        </section>
                    ))}

                    {opts.legend && (usesSS || usesRpe || usesTempo || usesWarm) && (
                        <div className="tp-legend">
                            <b>Legenda.</b>
                            {usesRpe && <> RPE = sforzo percepito da 1 a 10 (10 = massimo, nessuna ripetizione di riserva; 8 = 2 ripetizioni di riserva).</>}
                            {usesTempo && <> Tempo = secondi di discesa – pausa in basso – salita – pausa in alto (X = salita esplosiva).</>}
                            {usesSS && <> A1/A2 = superserie: esegui gli esercizi uno dopo l'altro senza recupero, poi recupera.</>}
                            {usesWarm && <> risc. = serie di riscaldamento prima delle serie di lavoro.</>}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
