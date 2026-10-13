import React from 'react';
import { calculateIdealWeight, calculateRMR, getAdjustedWeight, getBMICategory, getWHRCategory } from '../../logic/clinicalFormulas';
import { AnthropometryTab } from './tabs/AnthropometryTab';
import { MatrixPartitionTab } from './tabs/matrixPartition/MatrixPartitionTab';
import { MetabolismTab } from './tabs/MetabolismTab';

export const NutritionSetupModal = ({
    addMatrixMeal,
    calcData,
    dietDays,
    duplicateMatrixMeal,
    genId,
    handleMatrixDrop,
    isSetupOpen,
    matrixDragOverId,
    removeDay,
    removeMatrixMeal,
    setCalcData,
    setDietDays,
    setIsLafModalOpen,
    setIsSetupOpen,
    setMatrixDragId,
    setMatrixDragOverId,
    setSetupTab,
    setTargets,
    setupTab,
    updateDayTitle,
    updateMatrixMacro,
    updateMatrixMeal,
}) => {
    return (
        isSetupOpen &&
        (() => {
            // Calcoli in tempo reale per le Smart Card
            const bmi = calcData.weight / Math.pow(calcData.height / 100, 2);
            const bmiStatus = getBMICategory(bmi);
            const idealW = calculateIdealWeight(calcData.sex, calcData.height);
            const adjustedW = getAdjustedWeight(calcData.weight, idealW);
            const whr = calcData.waist / calcData.hip;
            const whrStatus = getWHRCategory(whr, calcData.sex);
            const grant = calcData.height / calcData.wrist;

            const rmr = calculateRMR(calcData);
            const tdee = Math.round(rmr * calcData.laf);

            // LOGICA PRO: Globale o Giorno per Giorno
            const isDailyMode = calcData.matrixMode === 'daily';
            const activeDayConfig =
                isDailyMode && calcData.activeMatrixDayId && calcData.dailyConfigs[calcData.activeMatrixDayId]
                    ? calcData.dailyConfigs[calcData.activeMatrixDayId]
                    : calcData;

            const currentMacroTargets = activeDayConfig.macroTargets;
            const currentDistribution = activeDayConfig.distribution;

            const totalC_kcal = tdee * (currentMacroTargets.c / 100);
            const totalP_kcal = tdee * (currentMacroTargets.p / 100);
            const totalF_kcal = tdee * (currentMacroTargets.f / 100);
            const totalC_g = totalC_kcal / 4;
            const totalP_g = totalP_kcal / 4;
            const totalF_g = totalF_kcal / 9;

            const totalDist = currentDistribution.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
            const totalMacros = currentMacroTargets.c + currentMacroTargets.p + currentMacroTargets.f;
            const distDiff = Math.abs(100 - totalDist);
            const errorOpacity = setupTab === 'partizione matriciale' ? Math.min(distDiff * 0.015, 0.2) : 0;
            const isViewValid = totalDist === 100 && totalMacros === 100; // Questo controlla solo la schermata attuale

            let isAllValid = true;

            if (calcData.matrixMode === 'global') {
                // In modalità globale controlla solo il target principale
                isAllValid = totalMacros === 100 && totalDist === 100;
            } else {
                // In modalità PRO, controlla ogni singolo giorno nel piano
                isAllValid = dietDays.every((day) => {
                    const dayConfig = calcData.dailyConfigs[day.id] || {
                        macroTargets: calcData.macroTargets,
                        distribution: calcData.distribution,
                    };
                    const mSum = dayConfig.macroTargets.c + dayConfig.macroTargets.p + dayConfig.macroTargets.f;
                    const dSum = dayConfig.distribution.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    return mSum === 100 && dSum === 100;
                });
            }

            const bgDynamicColor = isViewValid && setupTab === 'partizione matriciale' ? '#F1F8F4' : `rgba(255, 59, 48, ${errorOpacity})`;

            return (
                <div className="modal-backdrop">
                    {/* FINESTRA PRINCIPALE SQUIRCLE */}
                    <div className="modal-window" style={{ width: '900px', maxWidth: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* HEADER (Bianco fisso) */}
                        <div
                            style={{
                                padding: '20px 40px',
                                borderBottom: '1px solid #F0F0F2',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#FFFFFF',
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>Clinical Setup Suite</h3>
                                <span style={{ fontSize: '12px', color: '#6E6D69', fontWeight: 700 }}>Pannello Analitico Avanzato</span>
                            </div>
                            <button
                                onClick={() => setIsSetupOpen(false)}
                                style={{
                                    border: 'none',
                                    background: '#F2F2F7',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '18px',
                                    cursor: 'pointer',
                                    fontWeight: 900,
                                    color: '#121317',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* NAV SCHEDE (Bianco/Grigio fisso) */}
                        <div style={{ padding: '20px 40px 0 40px', background: '#FAFAFC' }}>
                            <div className="setup-tab-nav">
                                {['antropometria', 'metabolismo & energia', 'partizione matriciale'].map((t) => (
                                    <button key={t} className={`setup-tab-btn ${setupTab === t ? 'active' : ''}`} onClick={() => setSetupTab(t)}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CORPO SCHEDE (Sfondo dinamico che cambia colore in base agli errori) */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '20px 40px 40px 40px',
                                background: bgDynamicColor,
                                transition: 'background 0.4s ease',
                            }}
                        >
                            {/* TAB 1: ANTROPOMETRIA */}
                            {
                                <AnthropometryTab
                                    adjustedW={adjustedW}
                                    bmi={bmi}
                                    bmiStatus={bmiStatus}
                                    calcData={calcData}
                                    grant={grant}
                                    idealW={idealW}
                                    setCalcData={setCalcData}
                                    setupTab={setupTab}
                                    whr={whr}
                                    whrStatus={whrStatus}
                                />
                            }

                            {/* TAB 2: METABOLISMO ED ENERGIA */}
                            {
                                <MetabolismTab
                                    adjustedW={adjustedW}
                                    calcData={calcData}
                                    idealW={idealW}
                                    rmr={rmr}
                                    setCalcData={setCalcData}
                                    setIsLafModalOpen={setIsLafModalOpen}
                                    setupTab={setupTab}
                                    tdee={tdee}
                                />
                            }

                            {/* TAB 3: PARTIZIONE MATRICIALE (PRO) */}
                            {
                                <MatrixPartitionTab
                                    addMatrixMeal={addMatrixMeal}
                                    calcData={calcData}
                                    currentDistribution={currentDistribution}
                                    currentMacroTargets={currentMacroTargets}
                                    dietDays={dietDays}
                                    duplicateMatrixMeal={duplicateMatrixMeal}
                                    handleMatrixDrop={handleMatrixDrop}
                                    isDailyMode={isDailyMode}
                                    matrixDragOverId={matrixDragOverId}
                                    removeDay={removeDay}
                                    removeMatrixMeal={removeMatrixMeal}
                                    setCalcData={setCalcData}
                                    setDietDays={setDietDays}
                                    setMatrixDragId={setMatrixDragId}
                                    setMatrixDragOverId={setMatrixDragOverId}
                                    setupTab={setupTab}
                                    tdee={tdee}
                                    totalC_g={totalC_g}
                                    totalDist={totalDist}
                                    totalF_g={totalF_g}
                                    totalP_g={totalP_g}
                                    updateDayTitle={updateDayTitle}
                                    updateMatrixMacro={updateMatrixMacro}
                                    updateMatrixMeal={updateMatrixMeal}
                                />
                            }
                        </div>

                        {/* FOOTER INTELLIGENTE */}
                        <div
                            style={{
                                padding: '20px 40px',
                                borderTop: '1px solid #F0F0F2',
                                background: '#FFFFFF',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                            }}
                        >
                            <button
                                disabled={!isAllValid}
                                onClick={() => {
                                    setTargets({
                                        kcal: tdee,
                                        c: calcData.macroTargets.c,
                                        p: calcData.macroTargets.p,
                                        f: calcData.macroTargets.f,
                                        isConfigured: true,
                                    });

                                    setDietDays((prevDays) =>
                                        prevDays.map((day) => {
                                            // 1. Identifica la configurazione corretta (Daily o Global)
                                            const dayConfig =
                                                calcData.matrixMode === 'daily' && calcData.dailyConfigs[day.id]
                                                    ? calcData.dailyConfigs[day.id]
                                                    : { macroTargets: calcData.macroTargets, distribution: calcData.distribution };

                                            // 2. Sincronizza i pasti:
                                            // Crea la nuova lista basandoti ESATTAMENTE sulla distribuzione definita nel setup
                                            const syncedMeals = dayConfig.distribution.map((distMeal) => {
                                                // Cerca se esiste già un pasto con lo stesso ID o Nome per non perdere gli alimenti già inseriti
                                                const existingMeal = day.meals?.find((m) => m.title.toLowerCase() === distMeal.name.toLowerCase());

                                                return {
                                                    id: existingMeal ? existingMeal.id : genId(), // Mantieni ID se esiste, altrimenti nuovo
                                                    title: distMeal.name,
                                                    items: existingMeal ? existingMeal.items : [], // Mantieni gli alimenti se il pasto esisteva
                                                };
                                            });

                                            // 3. Ritorna il giorno aggiornato con la nuova struttura pasti e i nuovi target
                                            return {
                                                ...day,
                                                meals: syncedMeals,
                                                targets: { kcal: tdee, ...dayConfig.macroTargets },
                                            };
                                        })
                                    );
                                    setIsSetupOpen(false);
                                }}
                                style={{
                                    background: totalDist === 100 ? '#1F8A5B' : '#E6E4DE',
                                    color: totalDist === 100 ? 'white' : '#6E6D69',
                                    padding: '15px 45px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    fontWeight: 900,
                                    cursor: totalDist === 100 ? 'pointer' : 'not-allowed',
                                    boxShadow: totalDist === 100 ? '0 8px 20px rgba(0,200,83,0.3)' : 'none',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Applica
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()
    );
};
