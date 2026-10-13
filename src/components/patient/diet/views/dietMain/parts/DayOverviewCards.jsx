import React from 'react';
import { calculateTotals } from '../../../logic/dietTotals';

export const DayOverviewCards = ({ dietDays, setActiveMealInfo, updateDayTitle, updateMealTitle }) => {
    return dietDays.map((day) => {
        const currentDayMeals = day.meals || [];
        const currentMealStats = currentDayMeals.map((m) => ({
            title: m.title,
            totals: calculateTotals(m.items),
            id: m.id,
        }));

        const currentDayTotals = currentMealStats.reduce(
            (acc, curr) => ({
                kcal: acc.kcal + curr.totals.kcal,
                p: acc.p + curr.totals.p,
                c: acc.c + curr.totals.c,
                f: acc.f + curr.totals.f,
            }),
            { kcal: 0, p: 0, c: 0, f: 0 }
        );

        return (
            <div key={day.id} id={day.id} className="day-summary-card">
                <div className="day-summary-header">
                    <input
                        type="text"
                        className="day-title-input"
                        value={day.title}
                        onChange={(e) => updateDayTitle(day.id, e.target.value)}
                        placeholder="Nome Giornata..."
                    />
                    <div className="day-macro-summary no-print">
                        <span style={{ color: '#1D1D1F' }}>{currentDayTotals.kcal.toFixed(0)} kcal</span>
                        <span style={{ color: '#1D1D1F' }}>C: {currentDayTotals.c.toFixed(0)}g</span>
                        <span style={{ color: '#00C853' }}>P: {currentDayTotals.p.toFixed(0)}g</span>
                        <span style={{ color: '#86868B' }}>F: {currentDayTotals.f.toFixed(0)}g</span>
                    </div>
                </div>

                <div className="meal-rect-grid">
                    {currentMealStats.map((m) => (
                        <div key={m.id} className="meal-rect-card" onClick={() => setActiveMealInfo({ dayId: day.id, mealId: m.id })}>
                            <input
                                type="text"
                                className="meal-title-input"
                                value={m.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateMealTitle(day.id, m.id, e.target.value)}
                            />
                            <div className="meal-rect-stats">
                                <div className="meal-macro-col">
                                    <span>
                                        <span style={{ color: '#1D1D1F' }}>C:</span> {m.totals.c.toFixed(0)}g
                                    </span>
                                    <span>
                                        <span style={{ color: '#00C853' }}>P:</span> {m.totals.p.toFixed(0)}g
                                    </span>
                                    <span>
                                        <span style={{ color: '#86868B' }}>F:</span> {m.totals.f.toFixed(0)}g
                                    </span>
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#00C853', lineHeight: '1' }}>{m.totals.kcal.toFixed(0)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    });
};
