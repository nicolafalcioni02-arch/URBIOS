import React from 'react';

export const DailyDaySelector = ({ calcData, dietDays, isDailyMode, removeDay, setCalcData, setDietDays, updateDayTitle }) => {
    return (
        isDailyMode && (
            <div className="analysis-nav" style={{ padding: '0', marginBottom: '0', border: 'none' }}>
                {dietDays.map((day, idx) => {
                    const isActive = calcData.activeMatrixDayId === day.id;
                    return (
                        <div
                            key={day.id}
                            className={`analysis-chip ${isActive ? 'active' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                position: 'relative',
                            }}
                            onClick={() =>
                                setCalcData((p) => {
                                    const newDailyConfigs = { ...p.dailyConfigs };
                                    if (!newDailyConfigs[day.id]) {
                                        newDailyConfigs[day.id] = {
                                            macroTargets: { ...p.macroTargets },
                                            distribution: p.distribution.map((d) => ({ ...d })),
                                        };
                                    }
                                    return { ...p, activeMatrixDayId: day.id, dailyConfigs: newDailyConfigs };
                                })
                            }
                        >
                            {/* NOME EDITABILE INLINE */}
                            <input
                                value={day.title || `Giorno ${idx + 1}`}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateDayTitle(day.id, e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    color: isActive ? '#FFFFFF' : '#636366',
                                    width: `${Math.max((day.title || '').length, 6)}ch`,
                                    cursor: 'text',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    minWidth: '50px',
                                    maxWidth: '120px',
                                }}
                            />

                            {/* TASTO ELIMINA — visibile solo se ci sono almeno 2 giorni */}
                            {dietDays.length > 1 && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Eliminare "${day.title}"? Perderai tutti i pasti e la configurazione di questo giorno.`)) {
                                            // 1. Rimuovi il giorno dal piano
                                            removeDay(day.id);

                                            // 2. Rimuovi la config daily
                                            setCalcData((p) => {
                                                const newConfigs = { ...p.dailyConfigs };
                                                delete newConfigs[day.id];

                                                // 3. Sposta il focus al primo giorno rimasto
                                                const remainingDays = dietDays.filter((d) => d.id !== day.id);
                                                return {
                                                    ...p,
                                                    dailyConfigs: newConfigs,
                                                    activeMatrixDayId: remainingDays[0]?.id || null,
                                                };
                                            });
                                        }
                                    }}
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        color: isActive ? 'rgba(255,255,255,0.6)' : '#C7C7CC',
                                        cursor: 'pointer',
                                        lineHeight: 1,
                                        padding: '2px 3px',
                                        borderRadius: '4px',
                                        transition: 'all 0.15s',
                                        flexShrink: 0,
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.color = isActive ? 'white' : '#FF3B30')}
                                    onMouseOut={(e) => (e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.6)' : '#C7C7CC')}
                                >
                                    ✕
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* TASTO AGGIUNGI GIORNO */}
                <div
                    className="analysis-chip"
                    style={{
                        borderStyle: 'dashed',
                        color: '#00C853',
                        borderColor: '#00C853',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                    onClick={() => {
                        const newDayId = 'id-' + Math.random().toString(36).substr(2, 9);
                        const newDayTitle = `Giorno ${dietDays.length + 1}`;

                        setDietDays((prev) => [
                            ...prev,
                            {
                                id: newDayId,
                                title: newDayTitle,
                                meals: calcData.distribution.map((m) => ({
                                    id: 'id-' + Math.random().toString(36).substr(2, 9),
                                    title: m.name,
                                    items: [],
                                })),
                            },
                        ]);

                        setCalcData((p) => ({
                            ...p,
                            activeMatrixDayId: newDayId,
                            dailyConfigs: {
                                ...p.dailyConfigs,
                                [newDayId]: {
                                    macroTargets: { ...p.macroTargets },
                                    distribution: p.distribution.map((d) => ({ ...d })),
                                },
                            },
                        }));
                    }}
                >
                    + Giorno
                </div>
            </div>
        )
    );
};
