import React, { useState } from 'react';
import { SetRow, SetRowCompact } from './SetRow';
import { getExerciseImages } from '../../logic/exerciseMedia';
import { isCardio } from '../../logic/analysis';
import { estimate1RM } from '../../logic/science/oneRm';
import { MET_ACTIVITIES } from '../../logic/science/energy';
import { numOrNull } from '../../logic/science/parse';

const SS = ['', 'A', 'B', 'C', 'D', 'E', 'F'];
const chip = {
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 10,
    padding: '8px 12px',
    border: '1px solid #E6E4DE',
    background: '#fff',
    color: '#121317',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
};

// Una scheda-esercizio: nome (con suggerimenti), figure, superserie, serie con carico/%/RPE/tempo, riscaldamento, 1RM.
export const ExerciseCard = ({ ex, label, weekId, dayId, exerciseDB, suggestions, oneRm, ops, compact = false }) => {
    const imgs = getExerciseImages(ex.name, exerciseDB);
    const cardio = isCardio(ex);
    const workWithLoad = ex.sets.filter((s) => s.tipo !== 'riscaldamento' && numOrNull(s.load) && numOrNull(s.reps) && numOrNull(s.reps) <= 10);
    const best = workWithLoad.length
        ? workWithLoad.reduce((a, s) => (numOrNull(s.load) * (1 + numOrNull(s.reps) / 30) > numOrNull(a.load) * (1 + numOrNull(a.reps) / 30) ? s : a))
        : null;
    const est = best ? estimate1RM(numOrNull(best.load), numOrNull(best.reps)) : null;
    // su telefono tempo, recupero, %1RM e nota di serie stanno dietro "Dettagli": aperti da soli se già compilati
    const [detail, setDetail] = useState(() => ex.sets.some((s) => s.tempo || s.rec || s.note || s.pct));
    const set = (setId) => (field, value) => ops.updateSetFieldValue(weekId, dayId, ex.id, setId, field, value);

    return (
        <div
            className="t-exercise-item"
            style={{ marginBottom: 16, padding: 18, borderRadius: 20, background: '#FBFAF8', border: '1px solid #EDEBE5', position: 'relative' }}
        >
            <div className="t-ex-head" style={{ display: 'flex', gap: 10, marginBottom: 14, position: 'relative', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="t-ex-photos" style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    {imgs.slice(0, 2).map((src, i) => (
                        <img key={i} src={src} alt="" style={{ width: 56, height: 'auto', borderRadius: 10, border: '1px solid #E6E4DE' }} />
                    ))}
                    <button
                        title={imgs.length ? 'Gestisci le foto di questo esercizio' : 'Aggiungi le tue foto di questo esercizio'}
                        style={{ ...chip, padding: '9px 11px' }}
                        onClick={() => ops.openPhotos(ex)}
                    >
                        <i className="ph ph-camera" style={{ fontSize: 17 }}></i>
                        {imgs.length > 2 ? `+${imgs.length - 2}` : imgs.length ? '' : 'Foto'}
                    </button>
                </div>
                <div className="t-ex-name" style={{ flex: '2 1 200px', position: 'relative', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {label && (
                            <span style={{ background: '#121317', color: '#fff', borderRadius: 6, padding: '3px 7px', fontSize: 12, fontWeight: 700 }}>
                                {label}
                            </span>
                        )}
                        <input
                            type="text"
                            className="t-ex-input"
                            value={ex.name}
                            onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'name', e.target.value)}
                            style={{ fontSize: 17, fontWeight: 700, width: '100%' }}
                            placeholder="Nome esercizio..."
                        />
                    </div>
                    {suggestions[ex.id] && (
                        <div className="t-suggestions-list" style={{ width: '100%', top: '100%' }}>
                            {suggestions[ex.id].map((sugg, i) => (
                                <div key={i} className="t-suggestion-item" onClick={() => ops.applySuggestion(weekId, dayId, ex.id, sugg)}>
                                    <span>{sugg.name}</span> <span className="t-suggestion-tag">{sugg.group}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="t-ex-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px', minWidth: 0 }}>
                    <input
                        type="text"
                        className="t-ex-input"
                        value={ex.group}
                        onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'group', e.target.value)}
                        style={{ flex: 1, minWidth: 0, color: '#6E6D69', fontSize: 14, fontWeight: 500 }}
                        placeholder="Gruppo muscolare"
                    />
                    <select
                        title="Superserie: gli esercizi consecutivi con la stessa lettera si eseguono uno dopo l'altro, senza recupero in mezzo"
                        value={ex.ss || ''}
                        onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'ss', e.target.value)}
                        style={{ ...chip, padding: '9px 10px', flex: 'none' }}
                    >
                        {SS.map((l) => (
                            <option key={l} value={l}>
                                {l ? (compact ? `Super ${l}` : `Superserie ${l}`) : 'Singolo'}
                            </option>
                        ))}
                    </select>
                    <button className="t-icon-btn danger" style={{ marginLeft: 0, flex: 'none' }} onClick={() => ops.removeExercise(weekId, dayId, ex.id)} aria-label="Elimina l'esercizio">
                        <i className="ph ph-trash"></i>
                    </button>
                </div>
            </div>

            {cardio && (
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                    <i className="ph ph-heartbeat"></i> Intensità (per il dispendio):
                    <select
                        value={ex.met || ''}
                        onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'met', e.target.value)}
                        style={{ ...chip, maxWidth: 380 }}
                    >
                        <option value="">Predefinita per questo esercizio</option>
                        {MET_ACTIVITIES.map((a) => (
                            <option key={a.id} value={a.met}>
                                {a.group}: {a.label} ({a.met} MET)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {compact ? (
                <div className="t-setc-list">
                    <div className={`t-setc-row t-setc-head ${cardio ? 'cardio' : ''}`} aria-hidden="true">
                        <span>#</span>
                        <span>{cardio ? 'Durata' : 'Reps'}</span>
                        {!cardio && <span>Kg</span>}
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
                            onChange={set(s.id)}
                            onRemove={() => ops.removeSet(weekId, dayId, ex.id, s.id)}
                        />
                    ))}
                </div>
            ) : (
            <div className="t-table-scroll">
            <table className="t-sets-table">
                <thead>
                    <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th style={{ width: 80 }} title="Ripetizioni (anche range 8-12) oppure durata (45'' / 20')">
                            {cardio ? 'Durata' : 'Reps'}
                        </th>
                        {!cardio && <th style={{ width: 70 }}>Kg</th>}
                        {!cardio && (
                            <th style={{ width: 62 }} title="Percentuale del massimale (1RM)">
                                %1RM
                            </th>
                        )}
                        <th style={{ width: 56 }} title="Sforzo percepito 1-10 (10 = nessuna ripetizione di riserva)">
                            RPE
                        </th>
                        {!cardio && (
                            <th style={{ width: 82 }} title="Tempo di esecuzione: eccentrica-pausa-concentrica-pausa (es. 3-1-1-0, X = esplosivo)">
                                Tempo
                            </th>
                        )}
                        <th style={{ width: 70 }}>Rec.</th>
                        <th>Note</th>
                        <th style={{ width: 30 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {ex.sets.map((s, i) => (
                        <SetRow
                            key={s.id}
                            set={s}
                            index={ex.sets.filter((x, k) => k < i && x.tipo !== 'riscaldamento').length}
                            cardio={cardio}
                            oneRm={oneRm}
                            onChange={set(s.id)}
                            onRemove={() => ops.removeSet(weekId, dayId, ex.id, s.id)}
                        />
                    ))}
                </tbody>
            </table>
            </div>
            )}

            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button style={{ ...chip, color: '#121317', borderColor: '#CFCBC2' }} onClick={() => ops.addSet(weekId, dayId, ex.id)}>
                    <i className="ph ph-plus-circle"></i> Aggiungi serie
                </button>
                {compact && (
                    <button style={chip} aria-expanded={detail} onClick={() => setDetail(!detail)}>
                        <i className={`ph ${detail ? 'ph-caret-up' : 'ph-sliders-horizontal'}`}></i> {detail ? 'Meno' : 'Dettagli'}
                    </button>
                )}
                {!cardio && (
                    <button
                        style={chip}
                        title="Aggiunge le serie di riscaldamento fino al carico della prima serie di lavoro"
                        onClick={() => ops.addWarmup(weekId, dayId, ex.id)}
                    >
                        <i className="ph ph-fire"></i> Riscaldamento
                    </button>
                )}
                <input
                    type="text"
                    value={ex.note || ''}
                    onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'note', e.target.value)}
                    placeholder="Nota sull'esecuzione"
                    title="Si stampa sotto l'esercizio"
                    style={{ display: compact && !detail && !ex.note ? 'none' : undefined, flex: '1 1 200px', border: '1px solid #E6E4DE', borderRadius: 10, padding: '9px 12px', fontSize: 13, background: '#fff', outline: 'none' }}
                />
                {!cardio && oneRm && (
                    <span style={{ fontSize: 13, color: '#555' }}>
                        1RM salvato: <b>{oneRm} kg</b>
                    </span>
                )}
                {!cardio && est && (
                    <button
                        style={chip}
                        title={`Stima da ${best.load} kg × ${best.reps} (media di ${Object.keys(est.byFormula).length} formule)${est.reliable ? '' : ' · poco affidabile oltre 10 ripetizioni'}`}
                        onClick={() => ops.saveMassimale(ex.name, Math.round(est.average * 2) / 2, 'stimato')}
                    >
                        <i className="ph ph-trophy"></i> 1RM stimato ≈ {Math.round(est.average)} kg · salva
                    </button>
                )}
            </div>
        </div>
    );
};
