import React from 'react';
import { GOALS, LEVELS, goalById } from '../logic/science/guidelines';

// Dati generali della scheda: titolo, cliente, obiettivo, livello, durata extra
export const TrainingHeaderCard = ({ header, setHeader }) => {
    const goal = goalById(header.tipo);
    const set = (k) => (e) => setHeader({ ...header, [k]: e.target.value });

    return (
        <div className="t-client-header-card">
                    <div className="t-input-floating">
                        <label>Titolo scheda</label>
                        <input type="text" value={header.titolo} onChange={set('titolo')} placeholder="Es. Mesociclo 1" />
                    </div>
                    <div className="t-input-floating">
                        <label>Cliente</label>
                        <input type="text" value={header.cliente} onChange={set('cliente')} placeholder="Nome Cognome" />
                    </div>
                    <div className="t-input-floating">
                        <label>Obiettivo (descrizione)</label>
                        <input type="text" value={header.obiettivo} onChange={set('obiettivo')} placeholder="Es. Ipertrofia e ricomposizione" />
                    </div>
                    <div className="t-input-floating">
                        <label>Data</label>
                        <input type="date" value={header.data} onChange={set('data')} />
                    </div>
                    <div className="t-input-floating">
                        <label>Tipo di obiettivo</label>
                        <select value={header.tipo || ''} onChange={set('tipo')}>
                            <option value="">Scegli</option>
                            {GOALS.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <label>Livello del cliente</label>
                        <select value={header.livello || ''} onChange={set('livello')}>
                            <option value="">Scegli</option>
                            {LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <label title="Riscaldamento generale + defaticamento, per stimare la durata delle sedute">Extra seduta (min)</label>
                        <input type="number" min="0" value={header.extraMin ?? 10} onChange={set('extraMin')} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                        {goal ? (
                            <>
                                <b>{goal.label}:</b> {goal.reps[0]}-{goal.reps[1]} ripetizioni · {goal.pct[0]}-{goal.pct[1]}% del massimale · recupero{' '}
                                {goal.rest[0]}-{goal.rest[1]} s · RPE {goal.rpe[0]}-{goal.rpe[1]}. {goal.hint}
                                {header.livello ? ` Livello: ${LEVELS.find((l) => l.id === header.livello).sessions}.` : ''}
                            </>
                        ) : (
                            <span style={{ color: '#6E6D69' }}>
                                Scegli il tipo di obiettivo e il livello: la scheda mostrerà le indicazioni di riferimento e controllerà volume, recuperi e
                                carico.
                            </span>
                        )}
                    </div>
                </div>
    );
};
