import React, { useEffect, useMemo, useState } from 'react';
import { ExerciseCard } from '../views/dayEditor/ExerciseCard';
import { analyzeDay, oneRmFor } from '../logic/analysis';
import { ssClean, ssCanon, ssToggle } from './trainingGuidedLogic';

// Editor di un giorno di allenamento, direttamente nella pagina (non più in una finestra).
// Riusa la scheda-esercizio con tutte le funzioni: serie, carico, %1RM, RPE, tempo, superserie, riscaldamento, foto.

const Stat = ({ k, v, hint }) => (
    <div className="dg-stat2" title={hint}>
        <small>{k}</small>
        <b>{v}</b>
    </div>
);
const fmtKg = (x) => (x >= 1000 ? `${(x / 1000).toFixed(2).replace('.', ',')} t` : `${Math.round(x)} kg`);

export const DayEditor = ({ week, day, exerciseDB, suggestions, massimali, analysisCtx, ops, compact = false }) => {
    // sigle sempre in ordine di posizione (anche dopo aver riordinato o eliminato esercizi)
    const ssSig = day.exercises.map((e) => e.ss || '').join('|');
    useEffect(() => {
        const cur = day.exercises.map((e) => e.ss || '');
        const want = ssCanon(ssClean(cur));
        want.forEach((v, k) => v !== cur[k] && ops.updateExValue(week.id, day.id, day.exercises[k].id, 'ss', v));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ssSig]);
    const [more, setMore] = useState(false); // su telefono nome, durata, RPE e note della seduta stanno dietro "Dettagli"
    const A = useMemo(() => analyzeDay(day, analysisCtx), [day, analysisCtx]);
    // sigla delle superserie: A1, A2, B1…
    const labels = {};
    let n = 0;
    day.exercises.forEach((e, i) => {
        if (!e.ss) return;
        const prev = day.exercises[i - 1];
        n = prev && prev.ss === e.ss ? n + 1 : 1;
        labels[e.id] = `${e.ss}${n}`;
    });

    return (
        <div>
            {/* riepilogo del giorno */}
            <div className={`dg-sticky t-day-stats ${compact ? 'hidden' : ''}`}>
                {A.trains && compact ? (
                    <p className="t-sumline">
                        <b>{A.workSets}</b> serie · <b>{Math.round(A.minutes)}</b> min{A.volumeLoad ? <> · <b>{fmtKg(A.volumeLoad)}</b></> : null}
                    </p>
                ) : A.trains ? (
                    <div className="flex gap-2 flex-wrap t-stats">
                        <Stat k={compact ? 'Serie' : 'Serie di lavoro'} v={A.workSets} hint="Riscaldamento escluso" />
                        <Stat k="Durata" v={`${Math.round(A.minutes)} min${A.overridden ? '' : ' ~'}`} hint="Tempo sotto tensione + recuperi + cambi attrezzo + riscaldamento/defaticamento" />
                        <Stat k="Volume" v={A.volumeLoad ? fmtKg(A.volumeLoad) : '–'} hint="Tonnellaggio: Σ ripetizioni × carico" />
                        <Stat k="RPE medio" v={A.avgRpe !== null ? (Math.round(A.avgRpe * 10) / 10).toString().replace('.', ',') : '–'} />
                        <Stat k="Intensità" v={A.avgPct !== null ? `${Math.round(A.avgPct)}% 1RM` : '–'} hint="Serve il massimale o la % scritta" />
                        <Stat k="Energia" v={A.kcal !== null ? `${Math.round(A.kcal)} kcal` : compact ? '–' : 'peso mancante'} hint="Stima con i MET" />
                    </div>
                ) : (
                    <p className="text-[13.5px] text-[color:var(--muted)]">Compila ripetizioni (o durata) per vedere serie, durata, volume ed energia della seduta.</p>
                )}
            </div>

            {compact && (
                <button className="t-det" onClick={() => setMore(!more)} aria-expanded={more}>
                    <span>
                        <b>{A.trains ? `${A.workSets} serie · ${Math.round(A.minutes)} min${A.volumeLoad ? ` · ${fmtKg(A.volumeLoad)}` : ''}` : 'Seduta vuota'}</b>
                    </span>
                    <i className={`ph ph-caret-down ${more ? 'open' : ''}`}></i>
                </button>
            )}
            <div className={`grid grid-cols-2 sm:grid-cols-[1fr_130px_130px] gap-3 mt-4 ${compact && !more ? 'hidden' : ''}`}>
                <div className="col-span-2 sm:col-span-1">
                    <label className="fld-label">Nome della seduta</label>
                    <input className="fld" placeholder="es. Upper body, Gambe, Full body" value={day.title} onChange={(e) => ops.updateDayTitle(week.id, day.id, e.target.value)} />
                </div>
                <div>
                    <label className="fld-label" title="Se la lasci vuota viene stimata dalla scheda">
                        Durata (min)
                    </label>
                    <input className="fld" value={day.minutes ?? ''} placeholder={A.trains ? String(Math.round(A.estimatedMin)) : '–'} onChange={(e) => ops.updateDayField(week.id, day.id, 'minutes', e.target.value)} />
                </div>
                <div>
                    <label className="fld-label" title="Sforzo percepito dell'intera seduta (1-10). Se vuoto si usa l'RPE medio delle serie.">
                        RPE seduta
                    </label>
                    <input className="fld" value={day.sessionRpe ?? ''} placeholder={A.sessionRpe !== null ? String(Math.round(A.sessionRpe * 10) / 10) : '–'} onChange={(e) => ops.updateDayField(week.id, day.id, 'sessionRpe', e.target.value)} />
                </div>
            </div>

            {week.kind === 'deload' && <p className="dg-warn">Settimana di scarico: gli avvisi sul volume non vengono applicati.</p>}

            <div className="mt-4">
                {(() => {
                    const exs = day.exercises;
                    // blocchi: una superserie (esercizi di fila con la stessa sigla) o un esercizio singolo
                    const blocks = [];
                    exs.forEach((e, i) => {
                        const last = blocks[blocks.length - 1];
                        if (e.ss && last && exs[last[last.length - 1]].ss === e.ss) last.push(i);
                        else blocks.push([i]);
                    });
                    const toggle = (i, linked) => {
                        const out = ssToggle(exs.map((e) => e.ss || ''), i, !linked);
                        out.forEach((v, k) => v !== (exs[k].ss || '') && ops.updateExValue(week.id, day.id, exs[k].id, 'ss', v));
                    };
                    const linkBtn = (i, linked) => (
                        <button key={`l${i}`} className={`t-ss-link ${linked ? 'on' : ''}`} onClick={() => toggle(i, linked)} aria-pressed={linked}>
                            <i className={`ph-bold ${linked ? 'ph-link-simple' : 'ph-link-simple-break'}`}></i>
                            <span>{linked ? 'Superserie · separa' : 'Collega in superserie'}</span>
                        </button>
                    );
                    const card = (i, role) => (
                        <ExerciseCard key={exs[i].id} ex={exs[i]} label={labels[exs[i].id]} weekId={week.id} dayId={day.id} exerciseDB={exerciseDB} suggestions={suggestions} oneRm={oneRmFor(massimali, exs[i].name)} ops={ops} compact={compact} ssRole={role} />
                    );
                    return blocks.map((blk) => {
                        const lastIdx = blk[blk.length - 1];
                        const after = exs[lastIdx + 1] ? linkBtn(lastIdx, false) : null;
                        if (blk.length === 1) {
                            return (
                                <React.Fragment key={exs[blk[0]].id}>
                                    {card(blk[0], '')}
                                    {after}
                                </React.Fragment>
                            );
                        }
                        return (
                            <React.Fragment key={exs[blk[0]].id}>
                                <div className="t-ss-box">
                                    {blk.map((i, k) => (
                                        <React.Fragment key={exs[i].id}>
                                            {card(i, k === 0 ? 'first' : k === blk.length - 1 ? 'last' : 'mid')}
                                            {k < blk.length - 1 && linkBtn(i, true)}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {after}
                            </React.Fragment>
                        );
                    });
                })()}
            </div>
            <button className="dg-add" onClick={() => ops.addExercise(week.id, day.id)}>
                <i className="ph ph-plus-circle"></i> Aggiungi esercizio
            </button>

            <label className={`fld-label mt-5 ${compact && !more ? 'hidden' : ''}`}>Note della seduta (riscaldamento, mobilità, indicazioni)</label>
            <textarea className={`fld ${compact && !more ? 'hidden' : ''}`} rows={2} style={{ height: 'auto', padding: 14 }} placeholder="Es. 10 min di riscaldamento generale + mobilità spalle. Defaticamento con stretching." value={day.note || ''} onChange={(e) => ops.updateDayField(week.id, day.id, 'note', e.target.value)} />
        </div>
    );
};
