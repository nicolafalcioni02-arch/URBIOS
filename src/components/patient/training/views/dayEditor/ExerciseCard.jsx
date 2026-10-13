import React from 'react';
import { SetRow } from './SetRow';
import { getExerciseImages } from '../../logic/exerciseMedia';
import { isCardio } from '../../logic/analysis';
import { estimate1RM } from '../../logic/science/oneRm';
import { MET_ACTIVITIES } from '../../logic/science/energy';
import { numOrNull } from '../../logic/science/parse';

const SS = ['', 'A', 'B', 'C', 'D', 'E', 'F'];
const chip = {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 8,
    padding: '5px 9px',
    border: '1px solid #E5E5EA',
    background: '#fff',
    color: '#555',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
};

// Una scheda-esercizio: nome (con suggerimenti), figure, superserie, serie con carico/%/RPE/tempo, riscaldamento, 1RM.
export const ExerciseCard = ({ ex, label, weekId, dayId, exerciseDB, suggestions, oneRm, ops }) => {
    const imgs = getExerciseImages(ex.name, exerciseDB);
    const cardio = isCardio(ex);
    const workWithLoad = ex.sets.filter((s) => s.tipo !== 'riscaldamento' && numOrNull(s.load) && numOrNull(s.reps) && numOrNull(s.reps) <= 10);
    const best = workWithLoad.length
        ? workWithLoad.reduce((a, s) => (numOrNull(s.load) * (1 + numOrNull(s.reps) / 30) > numOrNull(a.load) * (1 + numOrNull(a.reps) / 30) ? s : a))
        : null;
    const est = best ? estimate1RM(numOrNull(best.load), numOrNull(best.reps)) : null;
    const set = (setId) => (field, value) => ops.updateSetFieldValue(weekId, dayId, ex.id, setId, field, value);

    return (
        <div
            className="t-exercise-item"
            style={{ marginBottom: 24, padding: 25, borderRadius: 24, background: '#F9F9FB', border: '1px solid #F0F0F2', position: 'relative' }}
        >
            <div style={{ display: 'flex', gap: 15, marginBottom: 14, position: 'relative', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    {imgs.slice(0, 2).map((src, i) => (
                        <img key={i} src={src} alt="" style={{ width: 70, height: 'auto', borderRadius: 8, border: '1px solid #E5E5EA' }} />
                    ))}
                    <button
                        title={imgs.length ? 'Gestisci le foto di questo esercizio' : 'Aggiungi le tue foto di questo esercizio'}
                        style={{ ...chip, padding: '8px 10px' }}
                        onClick={() => ops.openPhotos(ex)}
                    >
                        <i className="ph ph-camera" style={{ fontSize: 15 }}></i>
                        {imgs.length > 2 ? `+${imgs.length - 2}` : imgs.length ? '' : 'Foto'}
                    </button>
                </div>
                <div style={{ flex: 2, position: 'relative', minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {label && (
                            <span style={{ background: '#1D1D1F', color: '#fff', borderRadius: 6, padding: '3px 7px', fontSize: 11, fontWeight: 800 }}>
                                {label}
                            </span>
                        )}
                        <input
                            type="text"
                            className="t-ex-input"
                            value={ex.name}
                            onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'name', e.target.value)}
                            style={{ fontSize: 18, fontWeight: 700, width: '100%' }}
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
                <input
                    type="text"
                    className="t-ex-input"
                    value={ex.group}
                    onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'group', e.target.value)}
                    style={{ width: 130, textAlign: 'right', color: '#86868B' }}
                    placeholder="Gruppo"
                />
                <select
                    title="Superserie: gli esercizi consecutivi con la stessa lettera si eseguono uno dopo l'altro, senza recupero in mezzo"
                    value={ex.ss || ''}
                    onChange={(e) => ops.updateExValue(weekId, dayId, ex.id, 'ss', e.target.value)}
                    style={{ ...chip, padding: '8px 6px' }}
                >
                    {SS.map((l) => (
                        <option key={l} value={l}>
                            {l ? `Superserie ${l}` : 'Singolo'}
                        </option>
                    ))}
                </select>
                <button className="t-icon-btn danger" onClick={() => ops.removeExercise(weekId, dayId, ex.id)}>
                    <i className="ph ph-trash"></i>
                </button>
            </div>

            {cardio && (
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
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

            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button style={{ ...chip, color: '#007AFF', borderColor: '#BFD9FF' }} onClick={() => ops.addSet(weekId, dayId, ex.id)}>
                    <i className="ph ph-plus-circle"></i> Aggiungi serie
                </button>
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
                    placeholder="Nota sull'esecuzione (si stampa sotto l'esercizio)"
                    style={{ flex: 1, minWidth: 200, border: '1px solid #E5E5EA', borderRadius: 8, padding: '7px 10px', fontSize: 12, background: '#fff' }}
                />
                {!cardio && oneRm && (
                    <span style={{ fontSize: 12, color: '#555' }}>
                        1RM salvato: <b>{oneRm} kg</b>
                    </span>
                )}
                {!cardio && est && (
                    <button
                        style={chip}
                        title={`Stima da ${best.load} kg × ${best.reps} (media di ${Object.keys(est.byFormula).length} formule)${est.reliable ? '' : ' — poco affidabile oltre 10 ripetizioni'}`}
                        onClick={() => ops.saveMassimale(ex.name, Math.round(est.average * 2) / 2, 'stimato')}
                    >
                        <i className="ph ph-trophy"></i> 1RM stimato ≈ {Math.round(est.average)} kg · salva
                    </button>
                )}
            </div>
        </div>
    );
};
