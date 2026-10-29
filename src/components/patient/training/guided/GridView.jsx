import React, { useState } from 'react';
import { summarizeSets } from '../logic/trainingModel';

// Vista a griglia: gli esercizi di una seduta (A, B, C…) in righe, le settimane in colonne.
// Serve a leggere la progressione (serie, carico, RPE) a colpo d'occhio; un tocco su una cella apre quella settimana per modificarla.
const norm = (s) => String(s || '').trim().toLowerCase();

export const GridView = ({ weeks, di, onDay, onOpen, onAddWeek, onAddExercise, onWeek }) => {
    const [name, setName] = useState('');
    const maxDays = Math.max(...weeks.map((w) => w.days.length), 0);
    const d = Math.min(di, Math.max(0, maxDays - 1));
    // esercizi in ordine di comparsa, uniti per nome
    const rows = [];
    weeks.forEach((w) => {
        const day = w.days[d];
        if (!day) return;
        day.exercises.forEach((e) => {
            const k = norm(e.name);
            if (k && !rows.some((r) => r.k === k)) rows.push({ k, name: e.name });
        });
    });
    const titleOf = (i) => {
        const w = weeks.find((x) => x.days[i]);
        return (w && w.days[i].title) || `Seduta ${i + 1}`;
    };

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {Array.from({ length: maxDays }, (_, i) => (
                    <button key={i} className={`dg-chip row ${i === d ? 'on' : ''}`} onClick={() => onDay(i)}>
                        {titleOf(i)}
                    </button>
                ))}
            </div>
            {rows.length === 0 ? (
                <p className="dg-sub mt-4">Questa seduta non ha ancora esercizi con un nome.</p>
            ) : (
                <div className="t-grid-wrap">
                    <table className="t-grid">
                        <thead>
                            <tr>
                                <th>Esercizio</th>
                                {weeks.map((w, wi) => (
                                    <th key={w.id}>
                                        <button className="t-grid-wk" onClick={() => onWeek(w.id)} aria-label={`Opzioni di ${w.title || `settimana ${wi + 1}`}`}>
                                            <span>{w.title || `Sett. ${wi + 1}`} <i className="ph ph-caret-down"></i></span>
                                            {w.kind === 'deload' && <em>scarico</em>}
                                        </button>
                                    </th>
                                ))}
                                <th>
                                    <button className="t-grid-add" onClick={onAddWeek} aria-label="Aggiungi una settimana (copia l’ultima)">
                                        <i className="ph-bold ph-plus"></i> Sett.
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.k}>
                                    <th scope="row">{r.name}</th>
                                    {weeks.map((w, wi) => {
                                        const ex = w.days[d] && w.days[d].exercises.find((e) => norm(e.name) === r.k);
                                        const S = ex && summarizeSets(ex.sets);
                                        return (
                                            <td key={w.id}>
                                                {S && S.serie ? (
                                                    <button onClick={() => onOpen(w.id, d, r.k)} aria-label={`Modifica ${r.name}, ${w.title}`}>
                                                        <b>{S.serie}</b>
                                                        {S.load && <span>{S.load} kg</span>}
                                                        {S.rpe && <small>RPE {S.rpe}</small>}
                                                    </button>
                                                ) : (
                                                    <span className="empty">–</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <form
                className="t-grid-new"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!name.trim()) return;
                    onAddExercise(d, name.trim());
                    setName('');
                }}
            >
                <input className="fld" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nuovo esercizio (es. Squat)" aria-label="Nome del nuovo esercizio" />
                <button type="submit" className="dg-sm" disabled={!name.trim()}>
                    <i className="ph ph-plus"></i> Esercizio
                </button>
            </form>
            <p className="dg-hint mt-3">Tocca una cella per modificare l’esercizio, il nome di una settimana per rinominarla, duplicarla o eliminarla.</p>
        </div>
    );
};
