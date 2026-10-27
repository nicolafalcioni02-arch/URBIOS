import React, { useMemo } from 'react';
import { ExerciseCard } from '../views/dayEditor/ExerciseCard';
import { analyzeDay, oneRmFor } from '../logic/analysis';

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
            <div className="dg-sticky t-day-stats">
                {A.trains ? (
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

            <div className="grid grid-cols-2 sm:grid-cols-[1fr_130px_130px] gap-3 mt-4">
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
                {day.exercises.map((ex) => (
                    <ExerciseCard key={ex.id} ex={ex} label={labels[ex.id]} weekId={week.id} dayId={day.id} exerciseDB={exerciseDB} suggestions={suggestions} oneRm={oneRmFor(massimali, ex.name)} ops={ops} compact={compact} />
                ))}
            </div>
            <button className="dg-add" onClick={() => ops.addExercise(week.id, day.id)}>
                <i className="ph ph-plus-circle"></i> Aggiungi esercizio
            </button>

            <label className="fld-label mt-5">Note della seduta (riscaldamento, mobilità, indicazioni)</label>
            <textarea className="fld" rows={2} style={{ height: 'auto', padding: 14 }} placeholder="Es. 10 min di riscaldamento generale + mobilità spalle. Defaticamento con stretching." value={day.note || ''} onChange={(e) => ops.updateDayField(week.id, day.id, 'note', e.target.value)} />
        </div>
    );
};
