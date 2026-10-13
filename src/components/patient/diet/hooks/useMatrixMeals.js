// Partizione matriciale dei pasti (setup clinico PRO)
export const useMatrixMeals = ({ genId, matrixDragId, setCalcData, setMatrixDragId, setMatrixDragOverId }) => {
    // 1. Aggiorna i macro o il nome di un pasto nella matrice
    const updateMatrixMeal = (mealId, field, value) => {
        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            const targetConfig =
                isDaily && prev.activeMatrixDayId && prev.dailyConfigs[prev.activeMatrixDayId] ? prev.dailyConfigs[prev.activeMatrixDayId] : prev;

            const updatedDistribution = targetConfig.distribution.map((m) => (m.id === mealId ? { ...m, [field]: value } : m));

            if (isDaily && prev.activeMatrixDayId) {
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: {
                            ...targetConfig,
                            distribution: updatedDistribution,
                        },
                    },
                };
            } else {
                return { ...prev, distribution: updatedDistribution };
            }
        });
    };

    // 2. Aggiunge una nuova riga pasto alla matrice
    const addMatrixMeal = () => {
        const nuovoPastoMatrice = { id: genId(), name: 'Nuovo Pasto', value: 0 };
        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            const targetConfig =
                isDaily && prev.activeMatrixDayId && prev.dailyConfigs[prev.activeMatrixDayId] ? prev.dailyConfigs[prev.activeMatrixDayId] : prev;

            const updatedDistribution = [...targetConfig.distribution, nuovoPastoMatrice];

            if (isDaily && prev.activeMatrixDayId) {
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: {
                            ...targetConfig,
                            distribution: updatedDistribution,
                        },
                    },
                };
            } else {
                return { ...prev, distribution: updatedDistribution };
            }
        });
    };

    // 3. Rimuove un pasto dalla matrice
    const removeMatrixMeal = (mealId) => {
        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            const targetConfig =
                isDaily && prev.activeMatrixDayId && prev.dailyConfigs[prev.activeMatrixDayId] ? prev.dailyConfigs[prev.activeMatrixDayId] : prev;

            const updatedDistribution = targetConfig.distribution.filter((m) => m.id !== mealId);

            if (isDaily && prev.activeMatrixDayId) {
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: {
                            ...targetConfig,
                            distribution: updatedDistribution,
                        },
                    },
                };
            } else {
                return { ...prev, distribution: updatedDistribution };
            }
        });
    };

    // 4. Duplica un pasto nella matrice (mantenendo le sue percentuali)
    const duplicateMatrixMeal = (mealId) => {
        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            const targetConfig =
                isDaily && prev.activeMatrixDayId && prev.dailyConfigs[prev.activeMatrixDayId] ? prev.dailyConfigs[prev.activeMatrixDayId] : prev;

            const mealToCopy = targetConfig.distribution.find((m) => m.id === mealId);
            if (!mealToCopy) return prev;

            const nuovoPastoClonato = { ...mealToCopy, id: genId(), name: `${mealToCopy.name} (Copia)` };
            const updatedDistribution = [...targetConfig.distribution, nuovoPastoClonato];

            if (isDaily && prev.activeMatrixDayId) {
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: {
                            ...targetConfig,
                            distribution: updatedDistribution,
                        },
                    },
                };
            } else {
                return { ...prev, distribution: updatedDistribution };
            }
        });
    };

    // 5. Gestisce il riordinamento Drag and Drop dei pasti all'interno della tabella matrice
    const handleMatrixDrop = (e, targetMealId) => {
        e.preventDefault();
        if (!matrixDragId || matrixDragId === targetMealId) return;

        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            const targetConfig =
                isDaily && prev.activeMatrixDayId && prev.dailyConfigs[prev.activeMatrixDayId] ? prev.dailyConfigs[prev.activeMatrixDayId] : prev;

            const newDist = [...targetConfig.distribution];
            const dragIdx = newDist.findIndex((m) => m.id === matrixDragId);
            const dropIdx = newDist.findIndex((m) => m.id === targetMealId);

            if (dragIdx === -1 || dropIdx === -1) return prev;

            const [movedMeal] = newDist.splice(dragIdx, 1);
            newDist.splice(dropIdx, 0, movedMeal);

            if (isDaily && prev.activeMatrixDayId) {
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: { ...targetConfig, distribution: newDist },
                    },
                };
            } else {
                return { ...prev, distribution: newDist };
            }
        });
        setMatrixDragId(null);
        setMatrixDragOverId(null);
    };

    // 6. Aggiorna i macronutrienti (Carbo, Pro, Fat) di base nel setup
    const updateMatrixMacro = (field, value) => {
        const numVal = Math.max(0, parseInt(value) || 0);
        setCalcData((prev) => {
            const isDaily = prev.matrixMode === 'daily';
            if (isDaily && prev.activeMatrixDayId) {
                const currentConfig = prev.dailyConfigs[prev.activeMatrixDayId] || { macroTargets: prev.macroTargets, distribution: prev.distribution };
                return {
                    ...prev,
                    dailyConfigs: {
                        ...prev.dailyConfigs,
                        [prev.activeMatrixDayId]: {
                            ...currentConfig,
                            macroTargets: { ...currentConfig.macroTargets, [field]: numVal },
                        },
                    },
                };
            } else {
                return { ...prev, macroTargets: { ...prev.macroTargets, [field]: numVal } };
            }
        });
    };

    return { updateMatrixMeal, addMatrixMeal, removeMatrixMeal, duplicateMatrixMeal, handleMatrixDrop, updateMatrixMacro };
};
