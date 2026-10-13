import { blankDay, blankExercise, blankSet, blankWeek, genId as newId } from '../logic/trainingModel';
import { warmupSets } from '../logic/science/oneRm';

// Settimane, giorni, esercizi e serie: tutte le modifiche alla scheda
export const useTrainingEditing = ({ exerciseDB, setSuggestions, setWeeks }) => {
    // --- FUNZIONI CORE ---
    const genId = () => 'id-' + Math.random().toString(36).substr(2, 9);

    const addNewWeek = () => {
        setWeeks((prev) => [...prev, blankWeek(prev.length + 1)]);
    };

    // campi di giorno e settimana (durata, RPE della seduta, note, scarico...)
    const updateDayField = (weekId, dayId, field, value) =>
        setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, [field]: value } : d)) } : w)));
    const updateWeekField = (weekId, field, value) => setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, [field]: value } : w)));

    // inserisce all'inizio dell'esercizio la piramide di riscaldamento fino al carico della prima serie di lavoro
    const addWarmup = (weekId, dayId, exId) =>
        setWeeks((prev) =>
            prev.map((w) =>
                w.id !== weekId
                    ? w
                    : {
                          ...w,
                          days: w.days.map((d) =>
                              d.id !== dayId
                                  ? d
                                  : {
                                        ...d,
                                        exercises: d.exercises.map((e) => {
                                            if (e.id !== exId) return e;
                                            const first = e.sets.find((s) => s.tipo !== 'riscaldamento' && parseFloat(String(s.load).replace(',', '.')) > 0);
                                            if (!first) return e;
                                            const wu = warmupSets(parseFloat(String(first.load).replace(',', '.')), parseFloat(first.reps) || 8);
                                            const rows = wu.map((x) => ({
                                                ...blankSet(),
                                                id: newId(),
                                                tipo: 'riscaldamento',
                                                reps: String(x.reps),
                                                load: String(x.load),
                                                rec: "60''",
                                            }));
                                            return { ...e, sets: [...rows, ...e.sets.filter((s) => s.tipo !== 'riscaldamento')] };
                                        }),
                                    }
                          ),
                      }
            )
        );

    const duplicateWeek = (weekId) => {
        setWeeks((prev) => {
            const weekToCopy = prev.find((w) => w.id === weekId);
            if (!weekToCopy) return prev;
            const newWeek = JSON.parse(JSON.stringify(weekToCopy)); // Deep copy
            newWeek.id = genId();
            newWeek.title = `${newWeek.title} (Copia)`;
            newWeek.days.forEach((d) => {
                d.id = genId();
                d.exercises.forEach((ex) => {
                    ex.id = genId();
                    ex.sets.forEach((s) => (s.id = genId()));
                });
            });
            return [...prev, newWeek];
        });
    };

    const removeWeek = (id) => setWeeks((prev) => prev.filter((w) => w.id !== id));

    const updateWeekTitle = (id, title) => setWeeks((prev) => prev.map((w) => (w.id === id ? { ...w, title } : w)));

    // --- GIORNI ---
    const addDay = (weekId) => setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, days: [...w.days, blankDay()] } : w)));

    const duplicateDay = (weekId, dayId) => {
        setWeeks((prev) =>
            prev.map((w) => {
                if (w.id !== weekId) return w;
                const dayToCopy = w.days.find((d) => d.id === dayId);
                if (!dayToCopy) return w;
                const newDay = JSON.parse(JSON.stringify(dayToCopy));
                newDay.id = genId();
                newDay.title = `${newDay.title} (Copia)`;
                newDay.exercises.forEach((ex) => {
                    ex.id = genId();
                    ex.sets.forEach((s) => (s.id = genId()));
                });
                return { ...w, days: [...w.days, newDay] };
            })
        );
    };

    const removeDay = (weekId, dayId) => setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, days: w.days.filter((d) => d.id !== dayId) } : w)));
    const toggleDay = (weekId, dayId) =>
        setWeeks((prev) =>
            prev.map((w) => (w.id === weekId ? { ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, collapsed: !d.collapsed } : d)) } : w))
        );
    const updateDayTitle = (weekId, dayId, title) =>
        setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, title } : d)) } : w)));

    // --- ESERCIZI ---
    const addExercise = (weekId, dayId) => {
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? {
                                        ...d,
                                        exercises: [...d.exercises, { ...blankExercise(), id: genId() }],
                                    }
                                  : d
                          ),
                      }
                    : w
            )
        );
    };

    const removeExercise = (weekId, dayId, exId) =>
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId ? { ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d)) } : w
            )
        );

    const updateExValue = (weekId, dayId, exId, field, value) => {
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? {
                                        ...d,
                                        exercises: d.exercises.map((e) => (e.id === exId ? { ...e, [field]: value } : e)),
                                    }
                                  : d
                          ),
                      }
                    : w
            )
        );

        // Autocompletamento
        if (field === 'name') {
            const val = value.toLowerCase();
            if (val.length >= 2) {
                const matches = exerciseDB.filter((e) => e.name.toLowerCase().includes(val)).slice(0, 8);
                setSuggestions((prev) => ({ ...prev, [exId]: matches }));
            } else {
                setSuggestions((prev) => {
                    const next = { ...prev };
                    delete next[exId];
                    return next;
                });
            }
        }
    };

    const applySuggestion = (weekId, dayId, exId, item) => {
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? {
                                        ...d,
                                        exercises: d.exercises.map((e) => (e.id === exId ? { ...e, name: item.name, group: item.group } : e)),
                                    }
                                  : d
                          ),
                      }
                    : w
            )
        );
        setSuggestions((prev) => {
            const next = { ...prev };
            delete next[exId];
            return next;
        });
    };

    // --- SETS ---
    const addSet = (weekId, dayId, exId) =>
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? {
                                        ...d,
                                        exercises: d.exercises.map((e) => (e.id === exId ? { ...e, sets: [...e.sets, blankSet()] } : e)),
                                    }
                                  : d
                          ),
                      }
                    : w
            )
        );
    const removeSet = (weekId, dayId, exId, setId) =>
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e)) }
                                  : d
                          ),
                      }
                    : w
            )
        );

    return {
        addNewWeek,
        addDay,
        duplicateWeek,
        removeWeek,
        duplicateDay,
        removeDay,
        updateDayTitle,
        addExercise,
        removeExercise,
        updateExValue,
        applySuggestion,
        addSet,
        removeSet,
        updateDayField,
        updateWeekField,
        addWarmup,
    };
};
