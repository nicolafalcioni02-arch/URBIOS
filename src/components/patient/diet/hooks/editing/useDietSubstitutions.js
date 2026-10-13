// Alimenti sostitutivi (suggerimenti, scambio con principale)
export const useDietSubstitutions = ({ foodDB, genId, setDietDays, setSuggestions }) => {
    // --- GESTIONE SOSTITUZIONI ALIMENTI ---
    // 1. Aggiunge una riga di sostituzione vuota legata a un alimento specifico
    const addSubstitution = (dayId, mealId, itemId) => {
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
                                                      subs: [
                                                          ...(item.subs || []),
                                                          { id: genId(), name: '', weight: 0, kcal: 0, p: 0, c: 0, f: 0, mode: 'kcal' },
                                                      ],
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
    };

    // 2. Rimuove la sostituzione
    const removeSubstitution = (dayId, mealId, itemId, subId) => {
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
                                                      subs: (item.subs || []).filter((sub) => sub.id !== subId),
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
    };

    // 3. Aggiorna i valori della sostituzione e ricalcola il peso se cambi la modalità (Iso-Kcal, Iso-Pro, ecc.)
    const updateSubstitutionValue = (dayId, mealId, itemId, subId, field, value) => {
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
                                                const newSubs = (item.subs || []).map((sub) => {
                                                    if (sub.id === subId) {
                                                        const updatedSub = { ...sub, [field]: value };

                                                        // Ricalcolo matematico automatico in base alla modalità scelta
                                                        if (field === 'mode' && updatedSub.name) {
                                                            const origTotal = {
                                                                kcal: (item.kcal * item.weight) / 100,
                                                                p: (item.p * item.weight) / 100,
                                                                c: (item.c * item.weight) / 100,
                                                                f: (item.f * item.weight) / 100,
                                                            };
                                                            let newWeight = updatedSub.weight;
                                                            const subMacroValue = updatedSub[value]; // 'kcal', 'p', 'c' o 'f'

                                                            if (subMacroValue > 0) {
                                                                newWeight = (origTotal[value] / subMacroValue) * 100;
                                                            } else {
                                                                newWeight = 0;
                                                            }
                                                            updatedSub.weight = Math.round(newWeight);
                                                        }

                                                        // Autocompletamento per cercare il nuovo alimento sostitutivo
                                                        if (field === 'name') {
                                                            const val = value.toLowerCase();
                                                            if (val.length >= 2) {
                                                                const matches = foodDB.filter((db) => db.name.toLowerCase().includes(val)).slice(0, 6);
                                                                setSuggestions((prevS) => ({ ...prevS, [subId]: matches }));
                                                            } else {
                                                                setSuggestions((prevS) => {
                                                                    const n = { ...prevS };
                                                                    delete n[subId];
                                                                    return n;
                                                                });
                                                            }
                                                        }
                                                        return updatedSub;
                                                    }
                                                    return sub;
                                                });
                                                return { ...item, subs: newSubs };
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

    // 4. Seleziona l'alimento dal menu a tendina e calcola istantaneamente i grammi corretti
    const applySubSuggestion = (dayId, mealId, itemId, subId, dbItem) => {
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
                                                const origTotal = {
                                                    kcal: (item.kcal * item.weight) / 100,
                                                    p: (item.p * item.weight) / 100,
                                                    c: (item.c * item.weight) / 100,
                                                    f: (item.f * item.weight) / 100,
                                                };

                                                const newSubs = (item.subs || []).map((sub) => {
                                                    if (sub.id === subId) {
                                                        const mode = sub.mode || 'kcal';
                                                        const dbKcal = dbItem.energy_kcal || dbItem.kcal || 0;
                                                        const dbP = dbItem.proteins || dbItem.p || 0;
                                                        const dbC = dbItem.available_carbohydrates || dbItem.c || 0;
                                                        const dbF = dbItem.lipids || dbItem.f || 0;

                                                        let calcWeight = 0;
                                                        if (mode === 'kcal' && dbKcal > 0) calcWeight = (origTotal.kcal / dbKcal) * 100;
                                                        else if (mode === 'p' && dbP > 0) calcWeight = (origTotal.p / dbP) * 100;
                                                        else if (mode === 'c' && dbC > 0) calcWeight = (origTotal.c / dbC) * 100;
                                                        else if (mode === 'f' && dbF > 0) calcWeight = (origTotal.f / dbF) * 100;

                                                        return {
                                                            ...sub,
                                                            name: dbItem.name,
                                                            kcal: dbKcal,
                                                            p: dbP,
                                                            c: dbC,
                                                            f: dbF,
                                                            weight: Math.round(calcWeight), // Peso calcolato e arrotondato
                                                        };
                                                    }
                                                    return sub;
                                                });
                                                return { ...item, subs: newSubs };
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
        // Pulisce i suggerimenti a tendina
        setSuggestions((prev) => {
            const n = { ...prev };
            delete n[subId];
            return n;
        });
    };

    // 5. Scambia l'alimento principale con il suo sostituto
    const swapSubstitution = (dayId, mealId, itemId, subId) => {
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
                                                // Troviamo il sostituto specifico che l'utente vuole scambiare
                                                const subToSwap = (item.subs || []).find((s) => s.id === subId);
                                                if (!subToSwap || !subToSwap.name) return item; // Sicurezza: se è vuoto non fa nulla

                                                // Salviamo temporaneamente i dati dell'alimento principale
                                                const oldMainData = {
                                                    name: item.name,
                                                    weight: item.weight,
                                                    kcal: item.kcal,
                                                    p: item.p,
                                                    c: item.c,
                                                    f: item.f,
                                                };

                                                // Aggiorniamo la lista dei sostituti mettendo il vecchio principale al posto di quello scambiato
                                                const updatedSubs = item.subs.map((sub) => (sub.id === subId ? { ...sub, ...oldMainData } : sub));

                                                // Restituiamo l'alimento con i nuovi dati principali e la lista sostituti aggiornata
                                                return {
                                                    ...item,
                                                    name: subToSwap.name,
                                                    weight: subToSwap.weight,
                                                    kcal: subToSwap.kcal,
                                                    p: subToSwap.p,
                                                    c: subToSwap.c,
                                                    f: subToSwap.f,
                                                    subs: updatedSubs,
                                                };
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

    return { addSubstitution, removeSubstitution, updateSubstitutionValue, applySubSuggestion, swapSubstitution };
};
