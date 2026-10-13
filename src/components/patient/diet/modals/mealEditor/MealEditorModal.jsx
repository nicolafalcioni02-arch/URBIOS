import React from 'react';
import { calculateTotals } from '../../logic/dietTotals';
import { MacroProgressBar } from '../../ui/MacroProgressBar';
import { HistoryIcon, SaveIcon } from '../../ui/icons';
import { MealItemRow } from './parts/MealItemRow';

export const MealEditorModal = ({
    activeMealInfo,
    addFoodItem,
    addSubstitution,
    applyFoodSuggestion,
    applySubSuggestion,
    calcData,
    dietDays,
    handleSaveClick,
    removeFoodItem,
    removeSubstitution,
    setActiveMealInfo,
    setIsLibraryOpen,
    suggestions,
    swapSubstitution,
    targets,
    updateFoodValue,
    updateMealTitle,
    updateSubstitutionValue,
}) => {
    return (
        activeMealInfo &&
        (() => {
            const currentDay = dietDays.find((d) => d.id === activeMealInfo.dayId);
            const currentMeal = currentDay?.meals.find((m) => m.id === activeMealInfo.mealId);
            if (!currentMeal) return null;

            const currentMealTotals = calculateTotals(currentMeal.items);

            // --- CALCOLO TARGET DEL PASTO CORRENTE ---
            // 1. Recupera la configurazione del giorno
            const dayConfig =
                calcData.matrixMode === 'daily' && calcData.dailyConfigs[currentDay.id]
                    ? calcData.dailyConfigs[currentDay.id]
                    : { macroTargets: calcData.macroTargets, distribution: calcData.distribution };

            // 2. Trova la percentuale assegnata a questo pasto (es. Pranzo = 35%)
            const distMeal = dayConfig.distribution.find((d) => d.name.toLowerCase() === currentMeal.title.toLowerCase());
            const mealPct = distMeal ? distMeal.value / 100 : 0;

            // 3. Calcola i grammi esatti che questo pasto dovrebbe avere
            const dayTdee = currentDay.targets?.kcal || targets.kcal || 0;
            const dayP_pct = currentDay.targets?.p || dayConfig.macroTargets.p || 0;
            const dayC_pct = currentDay.targets?.c || dayConfig.macroTargets.c || 0;
            const dayF_pct = currentDay.targets?.f || dayConfig.macroTargets.f || 0;

            const targetKcal = dayTdee * mealPct;
            const targetP = (dayTdee * (dayP_pct / 100) * mealPct) / 4;
            const targetC = (dayTdee * (dayC_pct / 100) * mealPct) / 4;
            const targetF = (dayTdee * (dayF_pct / 100) * mealPct) / 9;

            return (
                <div className="modal-backdrop">
                    <div className="modal-window">
                        {/* HEADER DEL MODALE (Titolo pasto e riga totali dal vivo) */}
                        <div
                            className="dm-head"
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
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1F8A5B', textTransform: '', }}>
                                    {currentDay.title}
                                </span>
                                {/* Input per rinominare il pasto direttamente dal modale */}
                                <input
                                    type="text"
                                    value={currentMeal.title}
                                    onChange={(e) => updateMealTitle(currentDay.id, currentMeal.id, e.target.value)}
                                    style={{
                                        display: 'block',
                                        fontSize: '28px',
                                        fontWeight: 800,
                                        margin: 0,
                                        color: '#121317',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        padding: 0,
                                    }}
                                />
                            </div>

                            <div className="dm-totals" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#6E6D69', textTransform: '', fontWeight: 700 }}>Kcal</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{currentMealTotals.kcal.toFixed(0)}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#6E6D69', textTransform: '', fontWeight: 700 }}>Carbo</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{currentMealTotals.c.toFixed(1)}g</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#6E6D69', textTransform: '', fontWeight: 700 }}>Pro</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1F8A5B' }}>{currentMealTotals.p.toFixed(1)}g</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#6E6D69', textTransform: '', fontWeight: 700 }}>Grassi</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{currentMealTotals.f.toFixed(1)}g</div>
                                </div>

                                <button
                                    onClick={() => setActiveMealInfo(null)}
                                    aria-label="Chiudi"
                                    className="t-icon-btn dm-x"
                                    style={{ width: '44px', height: '44px', background: '#F6F5F2', border: 'none', marginLeft: '10px' }}
                                >
                                    X
                                </button>
                            </div>
                        </div>

                        {/* NUOVA SEZIONE: BARRE DI PROGRESSO MACRO */}
                        <div
                            className="dm-bars"
                            style={{
                                padding: '15px 40px',
                                background: '#FFFFFF',
                                borderBottom: '1px solid #E6E4DE',
                                display: 'flex',
                                gap: '30px',
                                alignItems: 'center',
                                zIndex: 10,
                                position: 'sticky',
                                top: 0,
                            }}
                        >
                            <MacroProgressBar label="Kcal" current={currentMealTotals.kcal} target={targetKcal} hexColor="#2F54EB" />
                            <MacroProgressBar label="Pro" current={currentMealTotals.p} target={targetP} hexColor="#1F8A5B" />
                            <MacroProgressBar label="Car" current={currentMealTotals.c} target={targetC} hexColor="#121317" />
                            <MacroProgressBar label="Fat" current={currentMealTotals.f} target={targetF} hexColor="#6E6D69" />
                        </div>

                        {/* CORPO DEL MODALE (Tabella di editing degli alimenti) */}
                        <div className="dm-body" style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#FAFAFC' }}>
                            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                {/* Mappatura delle righe degli alimenti */}
                                {/* Mappatura delle righe degli alimenti con relative Sostituzioni */}
                                {currentMeal.items.map((item, i) => (
                                    <MealItemRow
                                        key={item.id}
                                        addSubstitution={addSubstitution}
                                        applyFoodSuggestion={applyFoodSuggestion}
                                        applySubSuggestion={applySubSuggestion}
                                        currentDay={currentDay}
                                        currentMeal={currentMeal}
                                        i={i}
                                        item={item}
                                        removeFoodItem={removeFoodItem}
                                        removeSubstitution={removeSubstitution}
                                        suggestions={suggestions}
                                        swapSubstitution={swapSubstitution}
                                        updateFoodValue={updateFoodValue}
                                        updateSubstitutionValue={updateSubstitutionValue}
                                    />
                                ))}

                                {/* Bottone per aggiungere un nuovo alimento vuoto in fondo al pasto */}
                                <button
                                    className="dm-add"
                                    onClick={() => addFoodItem(currentDay.id, currentMeal.id)}
                                    style={{
                                        width: '100%',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '2px dashed #E6E4DE',
                                        background: '#FFFFFF',
                                        color: '#6E6D69',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: '0.3s',
                                        marginTop: '10px',
                                    }}
                                >
                                    + Aggiungi Nuovo Alimento
                                </button>
                            </div>
                        </div>

                        {/* FOOTER DEL MODALE */}
                        <div
                            className="dm-foot"
                            style={{
                                padding: '20px 40px',
                                borderTop: '1px solid #F0F0F2',
                                background: '#FFFFFF',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            {/* Tasti a sinistra */}
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    title="Salva come modello"
                                    onClick={() => handleSaveClick(currentMeal)}
                                    className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                                >
                                    <SaveIcon />
                                </button>
                                <button
                                    title="Apri storico pasti"
                                    onClick={() => setIsLibraryOpen(true)}
                                    className="t-icon-btn"
                                    style={{ width: '48px', height: '48px', background: '#F6F5F2', color: '#121317' }}
                                >
                                    <HistoryIcon />
                                </button>
                            </div>

                            {/* Tasto conferma a destra */}
                            <button
                                className="dm-done"
                                onClick={() => setActiveMealInfo(null)}
                                style={{
                                    background: '#121317',
                                    color: 'white',
                                    padding: '14px 40px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Conferma e Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()
    );
};
