import React from 'react';
import { DailyDaySelector } from './parts/DailyDaySelector';
import { MealDistributionRows } from './parts/MealDistributionRows';

export const MatrixPartitionTab = ({
    addMatrixMeal,
    calcData,
    currentDistribution,
    currentMacroTargets,
    dietDays,
    duplicateMatrixMeal,
    handleMatrixDrop,
    isDailyMode,
    matrixDragOverId,
    removeDay,
    removeMatrixMeal,
    setCalcData,
    setDietDays,
    setMatrixDragId,
    setMatrixDragOverId,
    setupTab,
    tdee,
    totalC_g,
    totalDist,
    totalF_g,
    totalP_g,
    updateDayTitle,
    updateMatrixMacro,
    updateMatrixMeal,
}) => {
    return (
        setupTab === 'partizione matriciale' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* TOGGLE MODALITÀ GLOBALE vs DAILY */}
                <div style={{ display: 'flex', gap: '10px', background: '#FFFFFF', padding: '8px', borderRadius: '16px', border: '1px solid #E5E5EA' }}>
                    <button
                        className={`segmented-btn ${!isDailyMode ? 'active' : ''}`}
                        onClick={() => setCalcData({ ...calcData, matrixMode: 'global' })}
                        style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: 800 }}
                    >
                        Generale
                    </button>
                    <button
                        className={`segmented-btn ${isDailyMode ? 'active' : ''}`}
                        onClick={() => {
                            const firstId = dietDays[0]?.id;
                            setCalcData((p) => {
                                const newDailyConfigs = { ...p.dailyConfigs };
                                if (firstId && !newDailyConfigs[firstId]) {
                                    newDailyConfigs[firstId] = {
                                        macroTargets: { ...p.macroTargets },
                                        distribution: p.distribution.map((d) => ({ ...d })),
                                    };
                                }
                                return { ...p, matrixMode: 'daily', activeMatrixDayId: firstId, dailyConfigs: newDailyConfigs };
                            });
                        }}
                        style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: 800 }}
                    >
                        Giorno per Giorno
                    </button>
                </div>

                {/* SELETTORE GIORNO (Solo in modalità Daily) */}
                {
                    <DailyDaySelector
                        calcData={calcData}
                        dietDays={dietDays}
                        isDailyMode={isDailyMode}
                        removeDay={removeDay}
                        setCalcData={setCalcData}
                        setDietDays={setDietDays}
                        updateDayTitle={updateDayTitle}
                    />
                }
                {/* Target Macro Globali */}
                <div className="smart-card" style={{ padding: '20px 25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span className="smart-title" style={{ margin: 0 }}>
                            Distribuzione Macronutrienti (%)
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: calcData.macroTargets.c + calcData.macroTargets.p + calcData.macroTargets.f === 100 ? '#00C853' : '#FF3B30',
                            }}
                        >
                            TOTALE: {currentMacroTargets.c + currentMacroTargets.p + currentMacroTargets.f}%
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {['c', 'p', 'f'].map((m) => (
                            <div
                                key={m}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: '#FAFAFC',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                }}
                            >
                                <span style={{ fontWeight: 800, color: m === 'c' ? '#1D1D1F' : m === 'p' ? '#00C853' : '#86868B', textTransform: 'uppercase' }}>
                                    {m}
                                </span>
                                <input
                                    type="number"
                                    className="matrix-input"
                                    value={currentMacroTargets[m]}
                                    onChange={(e) => updateMatrixMacro(m, e.target.value)}
                                />
                                <span style={{ fontWeight: 800, color: '#86868B' }}>%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Matrice Partizione Pasti Dinamica */}
                <div className="smart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="smart-title" style={{ margin: 0 }}>
                            Matrice Intra-Pasto Dinamica
                        </span>
                        <button
                            onClick={addMatrixMeal}
                            style={{
                                background: '#F2F2F7',
                                color: '#1D1D1F',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                            }}
                        >
                            + Aggiungi Pasto
                        </button>
                    </div>

                    <table className="matrix-table">
                        <thead>
                            <tr>
                                <th>Nome Pasto</th>
                                <th style={{ textAlign: 'center' }}>% Die</th>
                                <th style={{ textAlign: 'center' }}>Kcal</th>
                                <th style={{ textAlign: 'center' }}>C (g)</th>
                                <th style={{ textAlign: 'center' }}>P (g)</th>
                                <th style={{ textAlign: 'center' }}>F (g)</th>
                                <th style={{ textAlign: 'center', width: '30px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <MealDistributionRows
                                    currentDistribution={currentDistribution}
                                    duplicateMatrixMeal={duplicateMatrixMeal}
                                    handleMatrixDrop={handleMatrixDrop}
                                    matrixDragOverId={matrixDragOverId}
                                    removeMatrixMeal={removeMatrixMeal}
                                    setMatrixDragId={setMatrixDragId}
                                    setMatrixDragOverId={setMatrixDragOverId}
                                    tdee={tdee}
                                    totalC_g={totalC_g}
                                    totalF_g={totalF_g}
                                    totalP_g={totalP_g}
                                    updateMatrixMeal={updateMatrixMeal}
                                />
                            }
                        </tbody>
                    </table>

                    {/* Contatore in tempo reale */}
                    <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '14px', fontWeight: 900, color: totalDist === 100 ? '#00C853' : '#FF3B30' }}>
                        SOMMA PASTI: {totalDist}%
                    </div>
                </div>
            </div>
        )
    );
};
