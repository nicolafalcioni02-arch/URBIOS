import React from 'react';
import { weeklySetsRange } from '../logic/science/guidelines';

const f1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

// Serie dirette settimanali per muscolo, con la fascia indicata per obiettivo e livello (banda verde).
export const MuscleBars = ({ muscles, goal, level, deload }) => {
    const range = goal && level ? weeklySetsRange(goal.id, level) : null;
    const rows = Object.entries(muscles).sort((a, b) => b[1].weighted - a[1].weighted);
    if (!rows.length) return <div style={{ fontSize: 13, color: '#86868B' }}>Nessuna serie di lavoro pianificata in questa settimana.</div>;
    const scale = Math.max(range ? range[1] * 1.25 : 0, ...rows.map(([, v]) => v.weighted), 6);
    return (
        <div>
            {rows.map(([m, v]) => {
                const low = range && !deload && v.direct > 0 && v.direct < range[0];
                const high = range && v.direct > range[1];
                const color = high ? '#FF9500' : low ? '#FFCC00' : '#34C759';
                return (
                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, fontSize: 13 }}>
                        <div style={{ width: 110, fontWeight: 700 }}>{m}</div>
                        <div style={{ flex: 1, position: 'relative', height: 18, background: '#F0F0F3', borderRadius: 6 }}>
                            {range && (
                                <div
                                    title={`Fascia indicata ${range[0]}-${range[1]} serie`}
                                    style={{
                                        position: 'absolute',
                                        left: `${(range[0] / scale) * 100}%`,
                                        width: `${((range[1] - range[0]) / scale) * 100}%`,
                                        top: 0,
                                        bottom: 0,
                                        background: 'rgba(52,199,89,0.22)',
                                        borderRadius: 4,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 3,
                                    height: 12,
                                    width: `${(v.weighted / scale) * 100}%`,
                                    background: '#C7C7CC',
                                    borderRadius: 4,
                                }}
                                title="Serie ponderate (indirette al 50%)"
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 3,
                                    height: 12,
                                    width: `${(v.direct / scale) * 100}%`,
                                    background: color,
                                    borderRadius: 4,
                                }}
                                title="Serie dirette"
                            />
                        </div>
                        <div style={{ width: 190, color: '#444' }}>
                            <b>{f1(v.direct)}</b> dirette{v.weighted > v.direct ? ` · ${f1(v.weighted)} pond.` : ''} · {v.days}×/sett.
                        </div>
                    </div>
                );
            })}
            <div style={{ fontSize: 11, color: '#86868B', marginTop: 4 }}>
                Barra colorata = serie dirette · grigio = serie ponderate (secondari al 50%) · banda verde = fascia indicata per obiettivo e livello.
            </div>
        </div>
    );
};
