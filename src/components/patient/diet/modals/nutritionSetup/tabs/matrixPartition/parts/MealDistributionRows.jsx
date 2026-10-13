import React from 'react';

export const MealDistributionRows = ({
    currentDistribution,
    duplicateMatrixMeal,
    handleMatrixDrop,
    matrixDragOverId,
    removeMatrixMeal,
    setMatrixDragId,
    setMatrixDragOverId,
    tdee,
    totalC_g,
    totalF_g,
    totalP_g,
    updateMatrixMeal,
}) => {
    return currentDistribution.map((meal) => {
        const pct = meal.value / 100;
        return (
            <tr
                key={meal.id}
                className={`laf-row ${matrixDragOverId === meal.id ? 'drag-over-active' : ''}`}
                draggable
                onDragStart={(e) => {
                    setMatrixDragId(meal.id);
                    setTimeout(() => (e.target.style.opacity = '0.4'), 0);
                }}
                onDragEnd={(e) => {
                    e.target.style.opacity = '1';
                    setMatrixDragId(null);
                    setMatrixDragOverId(null);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (matrixDragOverId !== meal.id) setMatrixDragOverId(meal.id);
                }}
                onDragLeave={() => setMatrixDragOverId(null)}
                onDrop={(e) => handleMatrixDrop(e, meal.id)}
                style={{ cursor: 'grab' }}
            >
                <td>
                    <input
                        type="text"
                        className="laf-input"
                        value={meal.name}
                        onChange={(e) => updateMatrixMeal(meal.id, 'name', e.target.value)}
                        style={{ padding: '4px', margin: 0, cursor: 'text' }}
                    />
                </td>
                <td data-label="% die" style={{ textAlign: 'center' }}>
                    <input
                        type="number"
                        className="matrix-input"
                        value={meal.value}
                        onChange={(e) => updateMatrixMeal(meal.id, 'value', Number(e.target.value))}
                    />{' '}
                    <span style={{ fontSize: '10px', color: '#6E6D69' }}>%</span>
                </td>
                <td data-label="Kcal" style={{ textAlign: 'center', color: '#1F8A5B', fontWeight: 900 }}>{Math.round(tdee * pct)}</td>
                <td data-label="Carbo g" style={{ textAlign: 'center' }}>{Math.round(totalC_g * pct)}</td>
                <td data-label="Prot g" style={{ textAlign: 'center' }}>{Math.round(totalP_g * pct)}</td>
                <td data-label="Grassi g" style={{ textAlign: 'center' }}>{Math.round(totalF_g * pct)}</td>
                <td className="mx-act" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                            onClick={() => duplicateMatrixMeal(meal.id)}
                            title="Duplica Pasto"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#121317',
                                fontWeight: 900,
                                cursor: 'pointer',
                                padding: '5px',
                                fontSize: '14px',
                            }}
                        >
                            ⧉
                        </button>
                        <button
                            onClick={() => removeMatrixMeal(meal.id)}
                            title="Elimina Pasto"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#C2413A',
                                fontWeight: 900,
                                cursor: 'pointer',
                                padding: '5px',
                                fontSize: '14px',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </td>
            </tr>
        );
    });
};
