import { calculateTotals } from '../../logic/dietTotals';

// Salvataggio e caricamento dalla libreria pasti
export const useMealLibrary = ({ activeMealInfo, mealToSave, setDietDays, setIsLibraryOpen, setIsSaveModalOpen, setMealLibrary, setMealToSave }) => {
    const handleSaveClick = (meal) => {
        // Sostituito anche l'alert di errore con un check silenzioso (o puoi mettere un toast se preferisci)
        if (!meal || !meal.items || meal.items.length === 0) return;

        setMealToSave({
            ...JSON.parse(JSON.stringify(meal)),
            customName: meal.title,
            note: '',
        });
        setIsSaveModalOpen(true);
    };

    const confirmSaveToLibrary = () => {
        const finalMeal = {
            id: 'lib-' + Date.now(),
            title: mealToSave.customName,
            items: mealToSave.items,
            totals: calculateTotals(mealToSave.items),
            savedAt: new Date().toLocaleDateString('it-IT'),
            note: mealToSave.note,
        };
        setMealLibrary((prev) => [finalMeal, ...prev]);
        setIsSaveModalOpen(false);
        setMealToSave(null);
    };

    // Carica un pasto dalla libreria nel giorno/pasto attivo
    const loadFromLibrary = (libMeal) => {
        if (!activeMealInfo) return;

        setDietDays((prev) =>
            prev.map((d) =>
                d.id === activeMealInfo.dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) =>
                              m.id === activeMealInfo.mealId
                                  ? {
                                        ...m,
                                        items: [...m.items, ...JSON.parse(JSON.stringify(libMeal.items))], // Appende gli alimenti
                                    }
                                  : m
                          ),
                      }
                    : d
            )
        );

        setIsLibraryOpen(false);
    };

    return { handleSaveClick, confirmSaveToLibrary, loadFromLibrary };
};
