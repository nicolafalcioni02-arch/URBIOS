// Alimenti dentro un pasto
export const useDietFoodItems = ({ foodDB, genId, setDietDays, setSuggestions }) => {
    // --- GESTIONE ALIMENTI ---
    const addFoodItem = (dayId, mealId) => {
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) =>
                              m.id === mealId
                                  ? {
                                        ...m,
                                        items: [...m.items, { id: genId(), name: '', weight: 100, kcal: 0, p: 0, c: 0, f: 0 }],
                                    }
                                  : m
                          ),
                      }
                    : d
            )
        );
    };

    const removeFoodItem = (dayId, mealId, itemId) =>
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) => (m.id === mealId ? { ...m, items: m.items.filter((item) => item.id !== itemId) } : m)),
                      }
                    : d
            )
        );

    const updateFoodValue = (dayId, mealId, itemId, field, value) => {
        setDietDays((prev) =>
            prev.map((d) =>
                d.id === dayId
                    ? {
                          ...d,
                          meals: d.meals.map((m) =>
                              m.id === mealId
                                  ? {
                                        ...m,
                                        items: m.items.map((item) => {
                                            if (item.id === itemId) {
                                                const updatedItem = { ...item, [field]: value };
                                                if (field === 'name') {
                                                    const val = value.toLowerCase();
                                                    if (val.length >= 2) {
                                                        const matches = foodDB.filter((db) => db.name.toLowerCase().includes(val)).slice(0, 6);
                                                        setSuggestions((prevS) => ({ ...prevS, [itemId]: matches }));
                                                    } else {
                                                        setSuggestions((prevS) => {
                                                            const n = { ...prevS };
                                                            delete n[itemId];
                                                            return n;
                                                        });
                                                    }
                                                }
                                                return updatedItem;
                                            }
                                            return item;
                                        }),
                                    }
                                  : m
                          ),
                      }
                    : d
            )
        );
    };

    return { addFoodItem, removeFoodItem, updateFoodValue };
};
