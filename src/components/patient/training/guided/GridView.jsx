import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { summarizeSets } from '../logic/trainingModel';

// Vista a griglia: gli esercizi di una seduta (A, B, C…) in righe, le settimane in colonne.
// Serve a leggere la progressione (serie, carico, RPE) a colpo d'occhio; un tocco su una cella apre quella settimana per modificarla.
const norm = (s) => String(s || '').trim().toLowerCase();

export const GridView = ({ weeks, di, onDay, onOpen, onAddWeek, onAddExercise, onWeek, onSuperset, onAddDay, onTools }) => {
    const [ask, setAsk] = useState(null); // 'ex' | 'day': pannello per il nome
    const [name, setName] = useState('');
    const [ssMode, setSsMode] = useState(false);
    const [sel, setSel] = useState([]); // chiavi delle righe scelte
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
    // sigla di una riga (A1, B2...) dalla prima settimana in cui l'esercizio è in una superserie
    const ssInfo = (k) => {
        for (const w of weeks) {
            const day = w.days[d];
            if (!day) continue;
            const i = day.exercises.findIndex((e) => norm(e.name) === rows[k].k);
            if (i < 0 || !day.exercises[i].ss) continue;
            let n = 1;
            for (let j = i - 1; j >= 0 && day.exercises[j].ss === day.exercises[i].ss; j--) n++;
            return `${day.exercises[i].ss}${n}`;
        }
        return '';
    };
    const sigs = rows.map((r, k) => ssInfo(k));
    const linkedNext = (k) => !!sigs[k] && !!sigs[k + 1] && sigs[k][0] === sigs[k + 1][0];
    const pick = (key) => setSel((c) => (c.includes(key) ? c.filter((x) => x !== key) : [...c, key]));
    const idx = sel.map((k) => rows.findIndex((r) => r.k === k)).filter((i) => i >= 0).sort((a, b) => a - b);
    const consecutive = idx.length >= 2 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    const anyLinked = idx.some((i) => !!sigs[i]);
    const apply = (link) => {
        onSuperset(d, idx.map((i) => rows[i].k), link);
        setSel([]);
        setSsMode(false);
    };
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
                            {rows.map((r, k) => (
                                <React.Fragment key={r.k}>
                                <tr>
                                    <th scope="row" onClick={ssMode ? () => pick(r.k) : undefined} className={ssMode ? 'pickable' : ''}>
                                        {ssMode && <i className={`t-grid-check ${sel.includes(r.k) ? 'on' : ''}`}>{sel.includes(r.k) && <i className="ph-bold ph-check"></i>}</i>}
                                        {sigs[k] && <b className="t-grid-sig">{sigs[k]}</b>}{r.name}
                                    </th>
                                    {weeks.map((w, wi) => {
                                        const ex = w.days[d] && w.days[d].exercises.find((e) => norm(e.name) === r.k);
                                        const S = ex && summarizeSets(ex.sets);
                                        return (
                                            <td key={w.id}>
                                                {S && S.serie ? (
                                                    <button onClick={() => (ssMode ? pick(r.k) : onOpen(w.id, d, r.k))} aria-label={`Modifica ${r.name}, ${w.title}`}>
                                                        <b>{S.serie}</b>
                                                        {S.load && <span>{S.load} kg</span>}
                                                        {S.rpe && <small>RPE {S.rpe}</small>}
                                                    </button>
                                                ) : (
                                                    <span className="empty" onClick={ssMode ? () => pick(r.k) : undefined}>–</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td></td>
                                </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {ssMode && sel.length > 0 && (
                <div className="t-grid-bar">
                    {consecutive ? (
                        <button className="t-grid-bar-go" onClick={() => apply(true)}>
                            <i className="ph-bold ph-link-simple"></i> Unisci {idx.length} in superserie
                        </button>
                    ) : (
                        <p>{idx.length < 2 ? 'Scegli almeno un altro esercizio' : 'Scegli esercizi uno sotto l’altro'}</p>
                    )}
                    {anyLinked && (
                        <button className="t-grid-bar-sep" onClick={() => apply(false)}>
                            Separa
                        </button>
                    )}
                </div>
            )}
            <div className="t-grid-actions">
                <button className="dg-sm" onClick={() => { setName(''); setAsk('ex'); }}>
                    <i className="ph ph-plus"></i> Esercizio
                </button>
                <button className="dg-sm" onClick={() => { setName(''); setAsk('day'); }}>
                    <i className="ph ph-plus"></i> Seduta
                </button>
                {rows.length > 1 && (
                    <button className={`dg-sm ${ssMode ? 't-on' : ''}`} onClick={() => { setSsMode(!ssMode); setSel([]); }} aria-pressed={ssMode}>
                        <i className="ph ph-link-simple"></i> {ssMode ? 'Fine' : 'Superserie'}
                    </button>
                )}
            </div>
            {ssMode && sel.length === 0 && <p className="t-hint">Tocca gli esercizi da unire (uno sotto l’altro).</p>}
            <div className="t-grid-tools2 no-scrollbar">
                <button className="dg-sm" onClick={onTools.progression}><i className="ph ph-trend-up"></i> Progressione</button>
                <button className="dg-sm" onClick={onTools.analysis}><i className="ph ph-chart-bar"></i> Analisi</button>
                <button className="dg-sm" onClick={onTools.massimali}><i className="ph ph-calculator"></i> Massimali</button>
                <button className="dg-sm" onClick={onTools.exercises}><i className="ph ph-list-magnifying-glass"></i> Esercizi</button>
            </div>
            {ask && createPortal(
                <div className="sheet-back" onClick={() => setAsk(null)}>
                    <form
                        className="sheet t-cellsheet"
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const v = name.trim();
                            if (ask === 'ex') {
                                if (!v) return;
                                onAddExercise(d, v);
                            } else {
                                onAddDay(v);
                                onDay(maxDays);
                            }
                            setAsk(null);
                        }}
                    >
                        <div className="t-cell-head">
                            <div className="min-w-0">
                                <p>{ask === 'ex' ? 'Nuovo esercizio' : 'Nuova seduta'}</p>
                                <span>{ask === 'ex' ? `Si aggiunge a ${titleOf(d)} in tutte le settimane` : 'Si aggiunge a tutte le settimane'}</span>
                            </div>
                            <button type="button" className="dg-ghost" onClick={() => setAsk(null)} aria-label="Chiudi">
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>
                        <input className="fld" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={ask === 'ex' ? 'Nome (es. Squat)' : 'Nome (es. Gambe) — facoltativo'} aria-label="Nome" />
                        <button type="submit" className="vw-next t-cell-done" style={{ marginTop: 12 }} disabled={ask === 'ex' && !name.trim()}>
                            Aggiungi
                        </button>
                    </form>
                </div>,
                document.body
            )}
            <p className="dg-hint mt-3">Tocca una cella per modificare l’esercizio, il nome di una settimana per rinominarla, duplicarla o eliminarla. Il tasto “Superserie” unisce più esercizi di fila, in tutte le settimane.</p>
        </div>
    );
};
