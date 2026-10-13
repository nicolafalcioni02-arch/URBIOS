// Pasti: crea, duplica, elimina, rinomina
export const useDietMeals = ({ genId, setDietDays }) => {
    // Aggiunge un nuovo Pasto vuoto a un Giorno specifico
    const addMeal = (dayId, title = 'Nuovo Pasto') => {
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: [
                              ...d.meals,
                              {
                                  id: genId(),
                                  title: title,
                                  items: [], // Inizializza l'array degli alimenti vuoto
                              },
                          ],
                      }
                    : d
            )
        );
    };

    // Duplica un Pasto specifico all'interno dello stesso Giorno
    const duplicateMeal = (dayId, mealId) => {
        setDietDays((prev) =>
            prev.map((d) => {
                if (d.id !== dayId) return d;

                const mealToCopy = d.meals.find((m) => m.id === mealId);
                if (!mealToCopy) return d;

                const newMeal = JSON.parse(JSON.stringify(mealToCopy));
                newMeal.id = genId();
                newMeal.title = `${newMeal.title} (Copia)`;

                // Rigenera gli ID univoci per gli alimenti clonati
                newMeal.items.forEach((item) => {
                    item.id = genId();
                });

                return { ...d, meals: [...d.meals, newMeal] };
            })
        );
    };

    // Rimuove un Pasto da un Giorno
    const removeMeal = (dayId, mealId) =>
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.filter((m) => m.id !== mealId),
                      }
                    : d
            )
        );

    // Aggiorna il titolo di un Pasto (es. da "Pasto 1" a "Spuntino")
    const updateMealTitle = (dayId, mealId, title) =>
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) => (m.id === mealId ? { ...m, title } : m)),
                      }
                    : d
            )
        );

    return { updateMealTitle };
};
