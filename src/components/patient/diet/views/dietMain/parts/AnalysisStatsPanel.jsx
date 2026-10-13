import React from 'react';
import { calculateTotals } from '../../../logic/dietTotals';

export const AnalysisStatsPanel = ({ analysisTargetId, dietDays }) => {
    return (() => {
        let stats = [];
        let totals = { kcal: 0, p: 0, c: 0, f: 0 };
        const isAll = analysisTargetId === 'all';

        if (isAll) {
            stats = dietDays.map((d, i) => ({
                sigla: `G${i + 1}`,
                totals: calculateTotals(d.meals.flatMap((m) => m.items)),
            }));
        } else {
            const selectedDay = dietDays.find((d) => d.id === analysisTargetId);
            if (!selectedDay) return null;
            stats = selectedDay.meals.map((m, i) => ({
                sigla: `P${i + 1}`,
                totals: calculateTotals(m.items),
            }));
        }

        totals = stats.reduce(
            (acc, curr) => ({
                kcal: acc.kcal + curr.totals.kcal,
                p: acc.p + curr.totals.p,
                c: acc.c + curr.totals.c,
                f: acc.f + curr.totals.f,
            }),
            { kcal: 0, p: 0, c: 0, f: 0 }
        );

        const maxKcal = Math.max(...stats.map((s) => s.totals.kcal), 1);
        const totalMacro = totals.p + totals.c + totals.f || 1;

        return (
            <div className="dashboard-grid">
                {/* Torta Composizione con Legenda */}
                <div className="chart-card">
                    <span className="scope-indicator">{isAll ? 'PIANO SETTIMANALE' : 'DETTAGLIO GIORNO'}</span>
                    <div className="chart-title">Macro Totali</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                        <div
                            className="pie-chart"
                            style={{
                                background: `conic-gradient(#1F8A5B ${(totals.p / totalMacro) * 100}%, #121317 0 ${((totals.p + totals.c) / totalMacro) * 100}%, #6E6D69 0 100%)`,
                            }}
                        >
                            <div className="pie-hole">
                                <span style={{ fontSize: '18px', fontWeight: 900 }}>{Math.round(totals.kcal)}</span>
                                <span style={{ fontSize: '8px', fontWeight: 800, color: '#6E6D69' }}>KCAL</span>
                            </div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#121317' }}></div> CAR {Math.round((totals.c / totalMacro) * 100)}%
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#1F8A5B' }}></div> PRO {Math.round((totals.p / totalMacro) * 100)}%
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{ background: '#6E6D69' }}></div> FAT {Math.round((totals.f / totalMacro) * 100)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Istogramma Calorie con Valori Esposti */}
                <div className="chart-card">
                    <span className="scope-indicator">Andamento energetico</span>
                    <div className="chart-title">Kcal per {isAll ? 'Giorno' : 'Pasto'}</div>
                    <div className="bar-container" style={{ paddingBottom: '10px' }}>
                        {stats.map((s, i) => (
                            <div key={i} className="bar-col">
                                <div className="bar-value-top">{Math.round(s.totals.kcal)}</div>
                                <div
                                    className="bar-fill"
                                    style={{ height: `${(s.totals.kcal / maxKcal) * 75}%`, background: '#121317', borderRadius: '4px' }}
                                ></div>
                                <div className="bar-label-sigla">{s.sigla}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <span style={{ fontSize: '9px', color: '#6E6D69', fontWeight: 800 }}>{isAll ? 'G = GIORNO' : 'P = PASTO'}</span>
                    </div>
                </div>

                {/* Bilanciamento Macro con Legenda Colori */}
                <div className="chart-card">
                    <span className="scope-indicator">Scomposizione interna</span>
                    <div className="chart-title">Rapporto Nutrienti</div>
                    <div className="bar-container">
                        {stats.map((s, i) => {
                            const mTotal = s.totals.p + s.totals.c + s.totals.f || 1;
                            return (
                                <div key={i} className="bar-col" style={{ width: '100%' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            width: '16px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{ height: `${(s.totals.p / mTotal) * 100}%`, background: '#1F8A5B' }}
                                            title={`Pro: ${s.totals.p.toFixed(1)}g`}
                                        ></div>
                                        <div
                                            style={{ height: `${(s.totals.c / mTotal) * 100}%`, background: '#121317' }}
                                            title={`Car: ${s.totals.c.toFixed(1)}g`}
                                        ></div>
                                        <div
                                            style={{ height: `${(s.totals.f / mTotal) * 100}%`, background: '#6E6D69' }}
                                            title={`Fat: ${s.totals.f.toFixed(1)}g`}
                                        ></div>
                                    </div>
                                    <div className="bar-label-sigla">{s.sigla}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#121317' }}></div> C
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#1F8A5B' }}></div> P
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#6E6D69' }}></div> F
                        </div>
                    </div>
                </div>
            </div>
        );
    })();
};
