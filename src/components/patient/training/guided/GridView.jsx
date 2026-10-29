import React from 'react';
import { summarizeSets } from '../logic/trainingModel';

// Vista a griglia: gli esercizi di una seduta (A, B, C…) in righe, le settimane in colonne.
// Serve a leggere la progressione (serie, carico, RPE) a colpo d'occhio; un tocco su una cella apre quella settimana per modificarla.
const norm = (s) => String(s || '').trim().toLowerCase();

export const GridView = ({ weeks, di, onDay, onOpen }) => {
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
                                        {w.title || `Sett. ${wi + 1}`}
                                        {w.kind === 'deload' && <em>scarico</em>}
                                    </th>
                                ))}
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
                                                    <button onClick={() => onOpen(wi, d)} aria-label={`Modifica ${r.name}, ${w.title}`}>
                                                        <b>{S.serie}</b>
                                                        {S.load && <span>{S.load} kg</span>}
                                                        {S.rpe && <small>RPE {S.rpe}</small>}
                                                    </button>
                                                ) : (
                                                    <button className="empty" onClick={() => onOpen(wi, d)} aria-label={`Apri ${w.title}`}>–</button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="dg-hint mt-3">Tocca una cella per modificare quella settimana.</p>
        </div>
    );
};
