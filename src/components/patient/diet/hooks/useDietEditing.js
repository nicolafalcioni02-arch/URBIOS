import { useDietDays } from './editing/useDietDays';
import { useDietMeals } from './editing/useDietMeals';
import { useDietFoodItems } from './editing/useDietFoodItems';
import { useDietSubstitutions } from './editing/useDietSubstitutions';
import { useMealLibrary } from './editing/useMealLibrary';

// Giorni, pasti, alimenti, sostituzioni e libreria pasti: tutte le modifiche al piano
export const useDietEditing = ({
    activeMealInfo,
    calcData,
    foodDB,
    mealToSave,
    setDietDays,
    setIsLibraryOpen,
    setIsSaveModalOpen,
    setMealLibrary,
    setMealToSave,
    setSuggestions,
}) => {
    const { genId, addNewDay, duplicateDay, removeDay, updateDayTitle } = useDietDays({ calcData, setDietDays });

    // --- GESTIONE PASTI (Equivalente alla gestione Giorni nel TrainingPlan) ---

    const { updateMealTitle } = useDietMeals({ genId, setDietDays });

    const { addFoodItem, removeFoodItem, updateFoodValue } = useDietFoodItems({ foodDB, genId, setDietDays, setSuggestions });

    const { addSubstitution, removeSubstitution, updateSubstitutionValue, applySubSuggestion, swapSubstitution } = useDietSubstitutions({
        foodDB,
        genId,
        setDietDays,
        setSuggestions,
    });

    const { handleSaveClick, confirmSaveToLibrary, loadFromLibrary } = useMealLibrary({
        activeMealInfo,
        mealToSave,
        setDietDays,
        setIsLibraryOpen,
        setIsSaveModalOpen,
        setMealLibrary,
        setMealToSave,
    });

    const applyFoodSuggestion = (dayId, mealId, itemId, dbItem) => {
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) =>
                              m.id === mealId
                                  ? {
                                        ...m,
                                        items: m.items.map((item) =>
                                            item.id === itemId
                                                ? {
                                                      ...item,
                                                      name: dbItem.name,
                                                      // Mappa i campi del nuovo JSON avanzato nei campi usati per i calcoli
                                                      kcal: dbItem.energy_kcal || dbItem.kcal || 0,
                                                      p: dbItem.proteins || dbItem.p || 0,
                                                      c: dbItem.available_carbohydrates || dbItem.c || 0,
                                                      f: dbItem.lipids || dbItem.f || 0,
                                                  }
                                                : item
                                        ),
                                    }
                                  : m
                          ),
                      }
                    : d
            )
        );
        setSuggestions((prev) => {
            const n = { ...prev };
            delete n[itemId];
            return n;
        });
    };

    return {
        genId,
        addNewDay,
        duplicateDay,
        removeDay,
        updateDayTitle,
        updateMealTitle,
        addFoodItem,
        removeFoodItem,
        updateFoodValue,
        addSubstitution,
        removeSubstitution,
        updateSubstitutionValue,
        applySubSuggestion,
        swapSubstitution,
        handleSaveClick,
        confirmSaveToLibrary,
        loadFromLibrary,
        applyFoodSuggestion,
    };
};
