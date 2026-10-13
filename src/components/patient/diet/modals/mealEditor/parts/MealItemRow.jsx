import React from 'react';

export const MealItemRow = ({
    addSubstitution,
    applyFoodSuggestion,
    applySubSuggestion,
    currentDay,
    currentMeal,
    i,
    item,
    removeFoodItem,
    removeSubstitution,
    suggestions,
    swapSubstitution,
    updateFoodValue,
    updateSubstitutionValue,
}) => {
    return (
        <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {/* RIGA DELL'ALIMENTO PRINCIPALE */}
            <div className="t-exercise-item" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: 0 }}>
                <div className="t-set-badge" style={{ flexShrink: 0 }}>
                    {i + 1}
                </div>

                {/* Blocco Ricerca Alimento */}
                <div style={{ flex: 2, position: 'relative' }}>
                    <input
                        type="text"
                        className="t-ex-input"
                        value={item.name}
                        onChange={(e) => updateFoodValue(currentDay.id, currentMeal.id, item.id, 'name', e.target.value)}
                        placeholder="Cerca alimento dal database..."
                    />
                    {suggestions[item.id] && (
                        <div className="t-suggestions-list">
                            {suggestions[item.id].map((sugg, sIdx) => (
                                <div key={sIdx} className="t-suggestion-item" onClick={() => applyFoodSuggestion(currentDay.id, currentMeal.id, item.id, sugg)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span>{sugg.name}</span>
                                        <span style={{ fontWeight: 700, color: '#1D1D1F' }}>{sugg.kcal} kcal/100g</span>
                                    </div>
                                    <span className="t-suggestion-tag">{sugg.category}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Grammatura */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '0 10px',
                        border: '1px solid #E5E5EA',
                        width: '100px',
                    }}
                >
                    <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateFoodValue(currentDay.id, currentMeal.id, item.id, 'weight', e.target.value)}
                        style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontWeight: 700,
                            textAlign: 'right',
                            fontSize: '15px',
                            color: '#00C853',
                            padding: '10px 0',
                        }}
                    />
                    <span style={{ fontSize: '13px', color: '#86868B', marginLeft: '4px', fontWeight: 600 }}>g</span>
                </div>

                {/* Riepilogo Macro */}
                <div style={{ width: '140px', textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1D1D1F' }}>{((item.kcal * item.weight) / 100).toFixed(0)} kcal</span>
                    <span style={{ fontSize: '11px', color: '#86868B', fontWeight: 600 }}>
                        C:{((item.c * item.weight) / 100).toFixed(1)} P:{((item.p * item.weight) / 100).toFixed(1)} F:
                        {((item.f * item.weight) / 100).toFixed(1)}
                    </span>
                </div>

                {/* NUOVO TASTO: Aggiungi Sostituzione */}
                <button className="t-icon-btn" title="Aggiungi Sostituzione" onClick={() => addSubstitution(currentDay.id, currentMeal.id, item.id)}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 14 20 9 15 4"></polyline>
                        <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
                    </svg>
                </button>

                {/* Tasto Rimuovi Riga */}
                <button className="t-icon-btn danger" onClick={() => removeFoodItem(currentDay.id, currentMeal.id, item.id)}>
                    Del
                </button>
            </div>

            {/* RIGHE DELLE SOSTITUZIONI (Se l'utente ne ha aggiunte) */}
            {(item.subs || []).map((sub) => (
                <div
                    key={sub.id}
                    style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        marginLeft: '46px',
                        padding: '12px 18px',
                        background: '#F2FFF7',
                        borderRadius: '16px',
                        borderLeft: '4px solid #00C853',
                        border: '1px solid #E8F5E9',
                        position: 'relative',
                    }}
                >
                    <span style={{ fontSize: '11px', color: '#00C853', fontWeight: 900, textTransform: 'uppercase' }}>OR</span>

                    {/* Ricerca per la Sostituzione */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            className="t-ex-input"
                            value={sub.name}
                            onChange={(e) => updateSubstitutionValue(currentDay.id, currentMeal.id, item.id, sub.id, 'name', e.target.value)}
                            placeholder="Cerca alternativa..."
                            style={{ fontSize: '14px', padding: '8px 12px', background: 'white', border: '1px solid #E5E5EA' }}
                        />
                        {suggestions[sub.id] && (
                            <div className="t-suggestions-list">
                                {suggestions[sub.id].map((sugg, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="t-suggestion-item"
                                        onClick={() => applySubSuggestion(currentDay.id, currentMeal.id, item.id, sub.id, sugg)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span>{sugg.name}</span>
                                            <span style={{ fontWeight: 700, color: '#1D1D1F' }}>{sugg.kcal} kcal/100g</span>
                                        </div>
                                        <span className="t-suggestion-tag">{sugg.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottoni Modalità: Isocalorica, ecc. */}
                    <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #E5E5EA' }}>
                        {[
                            { val: 'kcal', label: 'Iso-Kcal' },
                            { val: 'p', label: 'Iso-Pro' },
                            { val: 'c', label: 'Iso-Car' },
                            { val: 'f', label: 'Iso-Fat' },
                        ].map((m) => (
                            <button
                                key={m.val}
                                onClick={() => updateSubstitutionValue(currentDay.id, currentMeal.id, item.id, sub.id, 'mode', m.val)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    background: sub.mode === m.val ? '#00C853' : 'transparent',
                                    color: sub.mode === m.val ? 'white' : '#86868B',
                                    boxShadow: sub.mode === m.val ? '0 2px 6px rgba(0,200,83,0.3)' : 'none',
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Quantità calcolata automaticamente (ma modificabile) */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#FFFFFF',
                            borderRadius: '10px',
                            padding: '0 10px',
                            border: '1px solid #E5E5EA',
                            width: '90px',
                        }}
                    >
                        <input
                            type="number"
                            value={sub.weight}
                            onChange={(e) => updateSubstitutionValue(currentDay.id, currentMeal.id, item.id, sub.id, 'weight', e.target.value)}
                            style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontWeight: 800,
                                textAlign: 'right',
                                fontSize: '15px',
                                color: '#1D1D1F',
                                padding: '8px 0',
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#86868B', marginLeft: '4px', fontWeight: 600 }}>g</span>
                    </div>

                    {/* Recap Macro Sostituzione */}
                    <div style={{ width: '130px', textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>{((sub.kcal * sub.weight) / 100).toFixed(0)} kcal</span>
                        <span style={{ fontSize: '10px', color: '#86868B', fontWeight: 700 }}>
                            C:{((sub.c * sub.weight) / 100).toFixed(1)} P:{((sub.p * sub.weight) / 100).toFixed(1)} F:{((sub.f * sub.weight) / 100).toFixed(1)}
                        </span>
                    </div>

                    {/* TASTO NUOVO: Scambia con Principale */}
                    <button
                        className="t-icon-btn"
                        title="Imposta come alimento principale"
                        style={{ width: '32px', height: '32px', border: 'none', background: '#F5F5F7', color: '#007AFF' }}
                        onClick={() => swapSubstitution(currentDay.id, currentMeal.id, item.id, sub.id)}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="16 3 21 8 16 13"></polyline>
                            <line x1="21" y1="8" x2="9" y2="8"></line>
                            <polyline points="8 21 3 16 8 11"></polyline>
                            <line x1="3" y1="16" x2="15" y2="16"></line>
                        </svg>
                    </button>

                    {/* Tasto Rimuovi Sostituzione */}
                    <button
                        className="t-icon-btn danger"
                        style={{ width: '32px', height: '32px', border: 'none', background: 'white' }}
                        onClick={() => removeSubstitution(currentDay.id, currentMeal.id, item.id, sub.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};
