import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SetRowCompact } from '../views/dayEditor/SetRow';
import { oneRmFor } from '../logic/analysis';
import { blankExercise, genId } from '../logic/trainingModel';

// Pannello della griglia: UN esercizio, una settimana alla volta.
// In alto il nome dell'esercizio, poi le settimane (si passa dall'una all'altra senza chiudere), sotto le sue serie.
const norm = (s) => String(s || '').trim().toLowerCase();

export const CellPanel = ({ weeks, setWeeks, dayIndex, exKey, startWeekId, massimali, ops, onClose }) => {
    const [weekId, setWeekId] = useState(startWeekId);
    const [detail, setDetail] = useState(false);
    const week = weeks.find((w) => w.id === weekId) || weeks[0];
    const day = week.days[dayIndex];
    const ex = day && day.exercises.find((e) => norm(e.name) === exKey);
    const anyDay = weeks.map((w) => w.days[dayIndex]).find(Boolean);
    const name = (weeks.map((w) => w.days[dayIndex] && w.days[dayIndex].exercises.find((e) => norm(e.name) === exKey)).find(Boolean) || {}).name || '';
    const oneRm = oneRmFor(massimali, name);
    const cardio = false;

    const addHere = () =>
        setWeeks((prev) => prev.map((w) => (w.id === week.id ? { ...w, days: w.days.map((d, i) => (i === dayIndex ? { ...d, exercises: [...d.exercises, { ...blankExercise(), id: genId(), name }] } : d)) } : w)));

    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <div className="sheet t-cellsheet" onClick={(e) => e.stopPropagation()}>
                <div className="t-cell-head">
                    <div className="min-w-0">
                        <p>{name || 'Esercizio'}</p>
                        <span>{(anyDay && anyDay.title) || 'Seduta'}</span>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>

                <div className="t-cell-weeks no-scrollbar" role="tablist" aria-label="Settimana">
                    {weeks.map((w, i) => (
                        <button key={w.id} role="tab" aria-selected={w.id === week.id} className={`dg-chip row ${w.id === week.id ? 'on' : ''}`} onClick={() => setWeekId(w.id)}>
                            {`Sett. ${i + 1}`}
                            {w.kind === 'deload' && <em className="dg-badge">scarico</em>}
                        </button>
                    ))}
                </div>

                <div className="t-root dg-page t-cell-body">
                    {ex ? (
                        <>
                            <div className="t-setc-list">
                                <div className="t-setc-row t-setc-head" aria-hidden="true">
                                    <span>#</span>
                                    <span>Reps</span>
                                    <span>Kg</span>
                                    <span>RPE</span>
                                    <span></span>
                                </div>
                                {ex.sets.map((s, i) => (
                                    <SetRowCompact
                                        key={s.id}
                                        set={s}
                                        index={ex.sets.filter((x, k) => k < i && x.tipo !== 'riscaldamento').length}
                                        cardio={cardio}
                                        oneRm={oneRm}
                                        detail={detail}
                                        onChange={(field, value) => ops.updateSetFieldValue(week.id, day.id, ex.id, s.id, field, value)}
                                        onRemove={() => ops.removeSet(week.id, day.id, ex.id, s.id)}
                                    />
                                ))}
                            </div>
                            <p className="t-hint">Tocca il numero della serie per cambiarne il tipo: lavoro, <b>R</b> riscaldamento, <b>D</b> drop set.</p>
                            <div className="t-cell-actions">
                                <button className="dg-sm" onClick={() => ops.addSet(week.id, day.id, ex.id)}>
                                    <i className="ph ph-plus"></i> Serie
                                </button>
                                <button className="dg-sm" onClick={() => setDetail(!detail)} aria-expanded={detail}>
                                    <i className="ph ph-sliders-horizontal"></i> {detail ? 'Meno' : 'Dettagli'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="t-cell-empty">
                            <p>Questo esercizio non c’è in questa settimana.</p>
                            {day && (
                                <button className="dg-sm" onClick={addHere}>
                                    <i className="ph ph-plus"></i> Aggiungilo qui
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <button className="vw-next t-cell-done" onClick={onClose}>Fatto</button>
            </div>
        </div>,
        document.body
    );
};
