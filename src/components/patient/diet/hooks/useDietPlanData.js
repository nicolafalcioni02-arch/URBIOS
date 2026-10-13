import { useState, useEffect } from 'react';
import { defaultFoodDB } from '../data/defaultFoodDB';

// Dati del piano: paziente/visita attiva, calcData, targets, giorni, report, database; autosave sul DB centrale
export const useDietPlanData = ({ db, onUpdateDb, patient }) => {
    // Recupera l'istanza aggiornata del paziente dal DB centrale
    const currentPatient = db?.pazienti?.find((p) => p.id === patient?.id) || patient;
    const listaVisite = currentPatient?.visite || [];

    // NUOVO: Stato per decidere su quale visita stiamo modificando/visualizzando la dieta
    // Di default prende la più recente (indice 0), ma l'utente potrà cambiarla
    const [selectedVisitaId, setSelectedVisitaId] = useState(() => {
        return listaVisite[0]?.id || null;
    });

    // Trova l'oggetto visita attivo su cui lavorare
    const visitaAttiva = listaVisite.find((v) => v.id === selectedVisitaId) || listaVisite[0] || null;

    // --- Inizializzazione Stati integrati con la visita attiva ---
    // --- Inizializzazione Stati integrati con la visita attiva ---
    // --- Inizializzazione Stati integrati con la visita attiva ---
    const [calcData, setCalcData] = useState(() => {
        // Se la visita selezionata ha già i suoi dati salvati, usa quelli
        if (visitaAttiva?.dettagli?.diet_calc_data) return visitaAttiva.dettagli.diet_calc_data;

        // Cerca nello storico l'ultima visita reale che contenga almeno un'antropometria
        const ultimaVisitaReale = listaVisite.find((v) => v.dettagli && (v.dettagli.altezza || v.dettagli.cm_vita_min || v.dettagli.peso));

        // Calcolo dell'età reale basata sulla data di nascita (se presente)
        let etaCalcolata = '';
        if (currentPatient?.dataNascita) {
            const oggi = new Date();
            const nascita = new Date(currentPatient.dataNascita);
            etaCalcolata = oggi.getFullYear() - nascita.getFullYear();
            if (oggi.getMonth() < nascita.getMonth() || (oggi.getMonth() === nascita.getMonth() && oggi.getDate() < nascita.getDate())) {
                etaCalcolata--;
            }
        }

        // Estrazione REALE dei dati: se non esistono nel DB, rimangono vuoti ('') o 0
        const sessoReale = currentPatient?.sesso || 'M';
        const pesoReale = parseFloat(visitaAttiva?.peso) || parseFloat(ultimaVisitaReale?.peso) || '';
        const altezzaReale = parseFloat(ultimaVisitaReale?.dettagli?.altezza) || '';
        const vitaReale = parseFloat(ultimaVisitaReale?.dettagli?.cm_vita_min) || '';
        const fianchiReale = parseFloat(ultimaVisitaReale?.dettagli?.cm_fianchi_max) || '';
        const polsoReale = parseFloat(ultimaVisitaReale?.dettagli?.dm_polso) || '';

        return {
            sex: sessoReale,
            age: etaCalcolata,
            weight: pesoReale,
            height: altezzaReale,
            waist: vitaReale,
            hip: fianchiReale,
            wrist: polsoReale,
            fatPct: '', // Vuoto, inseribile a mano o calcolato
            weightTarget: 'actual',
            formula: 'mifflin',
            laf: 1.2, // Coefficiente basale di partenza
            macroTargets: { c: 55, p: 15, f: 30 }, // Azzerati per richiedere impostazione esplicita
            distribution: [
                { id: 1, name: 'Colazione', value: 20 },
                { id: 2, name: 'Spuntino Mattina', value: 10 },
                { id: 3, name: 'Pranzo', value: 35 },
                { id: 4, name: 'Spuntino Pomeriggio', value: 10 },
                { id: 5, name: 'Cena', value: 25 },
            ],
            matrixMode: 'global',
            activeMatrixDayId: null,
            dailyConfigs: {},
        };
    });

    const [targets, setTargets] = useState(() => {
        return visitaAttiva?.dettagli?.diet_targets || { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false };
    });

    const [dietDays, setDietDays] = useState(() => {
        return visitaAttiva?.dettagli?.diet_plan_data || [];
    });

    const [savedReports, setSavedReports] = useState(() => {
        return visitaAttiva?.dettagli?.diet_saved_reports || [];
    });

    // Ricarica i dati se l'utente cambia la visita attiva dal menù storico
    useEffect(() => {
        if (!visitaAttiva) return;
        if (visitaAttiva.dettagli?.diet_calc_data) setCalcData(visitaAttiva.dettagli.diet_calc_data);
        setTargets(visitaAttiva.dettagli?.diet_targets || { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false });
        setDietDays(visitaAttiva.dettagli?.diet_plan_data || []);
        setSavedReports(visitaAttiva.dettagli?.diet_saved_reports || []);
    }, [selectedVisitaId]);

    // --- Inizializzazione Strutture Globali (Condivise fra tutti i pazienti) ---
    const [foodDB, setFoodDB] = useState(() => (db?.diet_food_db?.length ? db.diet_food_db : defaultFoodDB));
    const [mealLibrary, setMealLibrary] = useState(() => db?.diet_meal_library || []);
    const [drvDB, setDrvDB] = useState(() => db?.diet_drv_db || []);

    const patientProfile = {
        name: currentPatient ? `${currentPatient.nome} ${currentPatient.cognome}` : 'Paziente Demo',
        gender: calcData.sex === 'M' ? 'Male' : 'Female',
        age: calcData.age || 30,
        weight: calcData.weight || 70,
        pathologies: currentPatient?.patologie || [], // Agganciato al tuo DB reale se presente
        allergies: currentPatient?.allergie || [], // Agganciato al tuo DB reale se presente
        notes: currentPatient?.note || '',
    };

    // --- Autosave Reattivo sul Database Centrale ---
    useEffect(() => {
        if (!currentPatient?.id || !selectedVisitaId) return;
        onUpdateDb((prevDb) => {
            const updatedPazienti = prevDb.pazienti.map((p) => {
                if (p.id !== currentPatient.id) return p;
                const nuoveVisite = (p.visite || []).map((v) => {
                    if (v.id !== selectedVisitaId) return v;
                    return {
                        ...v,
                        dietStatus: status,
                        dettagli: {
                            ...v.dettagli,
                            diet_calc_data: calcData,
                            diet_targets: targets,
                            diet_plan_data: dietDays,
                            diet_saved_reports: savedReports,
                        },
                    };
                });
                return { ...p, visite: nuoveVisite };
            });
            return { ...prevDb, pazienti: updatedPazienti };
        });
    }, [calcData, targets, dietDays, savedReports, selectedVisitaId]);

    useEffect(() => {
        // Scrive nell'archivio solo ciò che è davvero cambiato (aprire la scheda non deve segnare "modifiche non salvate")
        onUpdateDb((prevDb) => {
            const next = { ...prevDb };
            let changed = false;
            const sync = (key, value, isDefault) => {
                if (prevDb[key] === value) return;
                if (prevDb[key] === undefined && isDefault) return;
                next[key] = value;
                changed = true;
            };
            sync('diet_food_db', foodDB, foodDB === defaultFoodDB);
            sync('diet_meal_library', mealLibrary, mealLibrary.length === 0);
            sync('diet_drv_db', drvDB, drvDB.length === 0);
            return changed ? next : prevDb;
        });
    }, [foodDB, mealLibrary, drvDB]);

    return {
        currentPatient,
        listaVisite,
        selectedVisitaId,
        setSelectedVisitaId,
        visitaAttiva,
        calcData,
        setCalcData,
        targets,
        setTargets,
        dietDays,
        setDietDays,
        savedReports,
        setSavedReports,
        foodDB,
        setFoodDB,
        mealLibrary,
        setMealLibrary,
        drvDB,
        setDrvDB,
        patientProfile,
    };
};
