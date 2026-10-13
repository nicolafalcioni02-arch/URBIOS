// Giorni: crea, duplica, elimina, rinomina
export const useDietDays = ({ calcData, setDietDays }) => {
    // Generatore di ID univoci per drag and drop e chiavi React
    const genId = () => 'id-' + Math.random().toString(36).substr(2, 9);

    // --- GESTIONE GIORNI (Equivalente alla gestione Settimane nel TrainingPlan) ---

    // Aggiunge un nuovo Giorno sincronizzato con la Matrice Pasti del Setup
    const addNewDay = () => {
        setDietDays((prev) => {
            const newDayId = genId();
            return [
                ...prev,
                {
                    id: newDayId,
                    title: `Giorno ${prev.length + 1}`,
                    // Legge dinamicamente dalla Matrice (calcData.distribution)
                    meals: calcData.distribution.map((m) => ({
                        id: genId(),
                        title: m.name,
                        items: [],
                    })),
                },
            ];
        });
    };

    // Duplica un Giorno intero (Deep Copy per evitare conflitti di reference)
    const duplicateDay = (dayId) => {
        setDietDays((prev) => {
            const dayToCopy = prev.find((d) => d.id === dayId);
            if (!dayToCopy) return prev;

            const newDay = JSON.parse(JSON.stringify(dayToCopy));
            newDay.id = genId();
            newDay.title = `${newDay.title} (Copia)`;

            // Rigenera tutti gli ID interni per Pasti e Alimenti
            newDay.meals.forEach((m) => {
                m.id = genId();
                m.items.forEach((it) => (it.id = genId()));
            });

            return [...prev, newDay];
        });
    };

    // Rimuove un Giorno specifico
    const removeDay = (id) => setDietDays((prev) => prev.filter((d) => d.id !== id));

    // Aggiorna il titolo di un Giorno
    const updateDayTitle = (id, title) => setDietDays((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)));

    return { genId, addNewDay, duplicateDay, removeDay, updateDayTitle };
};
