import React, { useMemo } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { analyzeDay, oneRmFor } from '../../logic/analysis';
import { fmtDuration } from '../../logic/science/parse';

const label = { fontSize: 11, fontWeight: 700, color: '#86868B', textTransform: 'uppercase', marginBottom: 8, display: 'block' };
const field = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E5EA', fontSize: 15, background: '#fff', outline: 'none' };

const Stat = ({ k, v, hint }) => (
    <div title={hint} style={{ background: '#fff', border: '1px solid #EDEDF0', borderRadius: 12, padding: '8px 12px', minWidth: 96 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#86868B', textTransform: 'uppercase', letterSpacing: 0.6 }}>{k}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1D1D1F' }}>{v}</div>
    </div>
);

// Finestra di modifica di un giorno di allenamento.
export const DayEditorModal = ({ week, day, exerciseDB, suggestions, massimali, analysisCtx, ops, onClose }) => {
    const A = useMemo(() => analyzeDay(day, analysisCtx), [day, analysisCtx]);
    // sigla delle superserie: A1, A2, B1...
    const labels = {};
    {
        let n = 0;
        day.exercises.forEach((e, i) => {
            if (!e.ss) return;
            const prev = day.exercises[i - 1];
            n = prev && prev.ss === e.ss ? n + 1 : 1;
            labels[e.id] = `${e.ss}${n}`;
        });
    }
    const fmtKg = (x) => (x >= 1000 ? `${(x / 1000).toFixed(2).replace('.', ',')} t` : `${Math.round(x)} kg`);

    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <div
                    style={{
                        padding: '25px 40px',
                        borderBottom: '1px solid #F0F0F2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'white',
                    }}
                >
                    <div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#007AFF', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            {week.title}
                        </span>
                        <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#1D1D1F' }}>{day.title || 'Nuova Scheda'}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <label
                            style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                            title="Settimana di scarico: meno volume e/o carico per recuperare"
                        >
                            <input
                                type="checkbox"
                                checked={week.kind === 'deload'}
                                onChange={(e) => ops.updateWeekField(week.id, 'kind', e.target.checked ? 'deload' : '')}
                            />{' '}
                            Settimana di scarico
                        </label>
                        <button onClick={onClose} className="t-icon-btn" style={{ width: 44, height: 44, background: '#F5F5F7', border: 'none' }}>
                            <i className="ph-bold ph-x" style={{ fontSize: 20 }}></i>
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
                    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                            <div style={{ flex: 3, minWidth: 260 }}>
                                <label style={label}>Titolo Giornata</label>
                                <input
                                    type="text"
                                    value={day.title}
                                    onChange={(e) => ops.updateDayTitle(week.id, day.id, e.target.value)}
                                    style={{ ...field, fontSize: 24, fontWeight: 800, border: 'none', padding: 0, background: 'transparent' }}
                                    placeholder="es. Upper Body Power"
                                />
                            </div>
                            <div style={{ width: 130 }}>
                                <label style={label} title="Se la lasci vuota viene stimata dalla scheda">
                                    Durata (min)
                                </label>
                                <input
                                    type="text"
                                    value={day.minutes ?? ''}
                                    onChange={(e) => ops.updateDayField(week.id, day.id, 'minutes', e.target.value)}
                                    placeholder={A.trains ? String(Math.round(A.estimatedMin)) : '—'}
                                    style={field}
                                />
                            </div>
                            <div style={{ width: 130 }}>
                                <label style={label} title="Sforzo percepito dell'intera seduta (scala 1-10, Foster). Se vuoto si usa l'RPE medio delle serie.">
                                    RPE seduta
                                </label>
                                <input
                                    type="text"
                                    value={day.sessionRpe ?? ''}
                                    onChange={(e) => ops.updateDayField(week.id, day.id, 'sessionRpe', e.target.value)}
                                    placeholder={A.sessionRpe !== null ? String(Math.round(A.sessionRpe * 10) / 10) : '—'}
                                    style={field}
                                />
                            </div>
                        </div>

                        {A.trains && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, padding: 14, background: '#F5F5F7', borderRadius: 16 }}>
                                <Stat k="Serie di lavoro" v={A.workSets} hint="Serie di lavoro (riscaldamento escluso)" />
                                <Stat k="Volume" v={A.volumeLoad ? fmtKg(A.volumeLoad) : '—'} hint="Tonnellaggio: Σ ripetizioni × carico" />
                                <Stat
                                    k="Intensità"
                                    v={A.avgPct !== null ? `${Math.round(A.avgPct)}% 1RM` : '—'}
                                    hint="Media delle % del massimale (serve il 1RM o la % scritta)"
                                />
                                <Stat k="RPE medio" v={A.avgRpe !== null ? (Math.round(A.avgRpe * 10) / 10).toString().replace('.', ',') : '—'} />
                                <Stat
                                    k="Durata"
                                    v={`${Math.round(A.minutes)} min${A.overridden ? '' : ' ~'}`}
                                    hint="Stima: tempo sotto tensione + recuperi + cambi attrezzo + riscaldamento/defaticamento"
                                />
                                <Stat k="Carico (sRPE)" v={Math.round(A.loadAU)} hint="RPE della seduta × minuti (unità arbitrarie, Foster 2001)" />
                                <Stat
                                    k="Energia"
                                    v={A.kcal !== null ? `${Math.round(A.kcal)} kcal` : 'peso mancante'}
                                    hint="Stima con i MET (Compendium of Physical Activities): serve il peso del cliente"
                                />
                            </div>
                        )}
                        {!A.trains && (
                            <p style={{ fontSize: 13, color: '#86868B', marginBottom: 14 }}>
                                Compila ripetizioni (o durata) per vedere volume, durata ed energia della seduta.
                            </p>
                        )}
                        {week.kind === 'deload' && (
                            <p style={{ fontSize: 12, color: '#B26A00', background: '#FFF4DD', borderRadius: 10, padding: '8px 12px', marginBottom: 14 }}>
                                Settimana di scarico: gli avvisi sul volume non vengono applicati.
                            </p>
                        )}

                        {day.exercises.map((ex) => (
                            <ExerciseCard
                                key={ex.id}
                                ex={ex}
                                label={labels[ex.id]}
                                weekId={week.id}
                                dayId={day.id}
                                exerciseDB={exerciseDB}
                                suggestions={suggestions}
                                oneRm={oneRmFor(massimali, ex.name)}
                                ops={ops}
                            />
                        ))}

                        <button
                            onClick={() => ops.addExercise(week.id, day.id)}
                            style={{
                                width: '100%',
                                padding: 25,
                                borderRadius: 24,
                                border: '2px dashed #E5E5EA',
                                background: '#F9F9FB',
                                color: '#86868B',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: '0.3s',
                                marginBottom: 24,
                            }}
                        >
                            + Aggiungi Nuovo Esercizio
                        </button>

                        <div style={{ marginBottom: 24 }}>
                            <label style={label}>Note della giornata (riscaldamento, mobilità, indicazioni)</label>
                            <textarea
                                value={day.note || ''}
                                onChange={(e) => ops.updateDayField(week.id, day.id, 'note', e.target.value)}
                                rows={2}
                                style={{ ...field, resize: 'vertical', fontSize: 14 }}
                                placeholder="Es. 10 min di riscaldamento generale + mobilità spalle. Defaticamento con stretching."
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    background: '#1D1D1F',
                                    color: 'white',
                                    border: 'none',
                                    padding: '14px 28px',
                                    borderRadius: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Salva e Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
