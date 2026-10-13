import { useEffect } from 'react';
import { METRIC_CATALOG } from '../data/metricCatalog';
import { legacyTargets } from '../analysis/drvEngine';
import { calculateTotals } from '../logic/dietTotals';
import { useSmartChartPlot } from './analysis/useSmartChartPlot';

// Grafico Smart (Plotly), report salvati, analisi bioprofilo/DRV
export const useDietAnalysis = ({
    activeDay,
    dietDays,
    drvDB,
    emptyFoodTemplate,
    foodDB,
    genId,
    isSmartOpen,
    patientProfile,
    savedReports,
    setIsSmartOpen,
    setSavedReports,
    setSmartConfig,
    smartConfig,
    targets,
}) => {
    // Target EFSA del paziente (per il grafico Smart): scelti per età e sesso dal motore di analisi
    const getPatientTargets = () =>
        legacyTargets(drvDB, {
            age: patientProfile.age,
            sex: patientProfile.gender === 'Female' ? 'F' : 'M',
            weight: patientProfile.weight,
            kcal: targets?.kcal,
        });

    // --- HELPER PER CATEGORIE ---
    const categorizeNutrient = (key) => {
        const aminos = [
            'alanine',
            'arginine',
            'aspartic_acid',
            'cystine',
            'glutamic_acid',
            'glycine',
            'histidine',
            'isoleucine',
            'leucine',
            'lysine',
            'methionine',
            'phenylalanine',
            'proline',
            'serine',
            'threonine',
            'tryptophan',
            'tyrosine',
            'valine',
        ];
        const bio = [
            'caffeic_acid',
            'citric_acid',
            'phytic_acid',
            'malic_acid',
            'apigenin',
            'campferol',
            'phytosterols',
            'polyphenols',
            'quercetin',
            'lutein',
            'zeaxanthin',
            'lycopene',
        ];

        if (aminos.includes(key)) return { label: 'Pool Amminoacidico', icon: 'ph-dna', color: 'text-purple-500' };
        if (key.includes(':') || key.toLowerCase().includes('fatty_acid')) return { label: 'Profilo Lipidico', icon: 'ph-drop', color: 'text-blue-500' };
        if (bio.includes(key)) return { label: 'Bioattivi & Fitocomposti', icon: 'ph-leaf', color: 'text-green-500' };
        return { label: 'Altri Micronutrienti', icon: 'ph-dots-three-circle', color: 'text-gray-400' };
    };

    // --- MOTORE DI CALCOLO MICRONUTRIENTI ---

    // --- GESTIONE SALVATAGGIO REPORT ---
    const saveSmartReport = () => {
        const newReport = {
            id: genId(),
            date: new Date().toLocaleDateString('it-IT'),
            dayId: activeDay ? activeDay.id : null,
            dayTitle: smartConfig.scope === 'activeDay' ? activeDay?.title || 'Giorno' : 'Panoramica Settimanale',
            config: { ...smartConfig },
        };
        setSavedReports((prev) => [newReport, ...prev]); // Aggiunge in cima alla lista
        setIsSmartOpen(false);
        // Resetta il commento per non portarselo dietro al prossimo utilizzo
        setSmartConfig((prev) => ({ ...prev, comment: '' }));
    };

    const deleteReport = (reportId) => {
        if (window.confirm('Vuoi eliminare definitivamente questo report?')) {
            setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
        }
    };

    // Somma TOTALE di ogni singolo componente dei cibi nel piano
    const analyzeCompleteBioProfile = () => {
        const analysis = {};
        // Inizializza tutto a 0 basato sul template del DB alimenti
        Object.keys(emptyFoodTemplate).forEach((k) => (analysis[k] = 0));

        let totalMeals = 0;
        dietDays.forEach((day) => {
            day.meals.forEach((meal) => {
                totalMeals++;
                meal.items.forEach((item) => {
                    const foodData = foodDB.find((f) => f.name === item.name);
                    if (!foodData) return;
                    const factor = (Number(item.weight) || 0) / 100;

                    Object.keys(emptyFoodTemplate).forEach((key) => {
                        const val = Number(foodData[key]) || 0;
                        analysis[key] += val * factor;
                    });
                });
            });
        });

        // Ottiene la media GIORNALIERA
        const dayCount = dietDays.length || 1;
        Object.keys(analysis).forEach((key) => (analysis[key] /= dayCount));

        // Restituisce i valori e un parametro per calcolare il pasto
        return { data: analysis, avgMealsPerDay: totalMeals / dayCount };
    };

    // Funzione helper: somma un campo dal foodDB per una lista di items
    const sumFieldFromDB = (items, fieldKeys) => {
        return items.reduce((acc, item) => {
            const food = foodDB.find((f) => f.name === item.name);
            if (!food) return acc;
            const factor = (Number(item.weight) || 0) / 100;
            const val = fieldKeys.reduce((sum, k) => sum + (Number(food[k]) || 0), 0);
            return acc + val * factor;
        }, 0);
    };

    // Funzione di aggregazione dati per tipo metrica
    const buildMetricData = (items, metricKey) => {
        const m = METRIC_CATALOG[metricKey];
        if (!m) return 0;
        if (m.keys) return sumFieldFromDB(items, m.keys);
        if (m.aggregation === 'kcal') return calculateTotals(items).kcal;
        return 0;
    };

    const { plotRef } = useSmartChartPlot({ activeDay, dietDays, drvDB, getPatientTargets, isSmartOpen, smartConfig, sumFieldFromDB, targets });

    return { plotRef, getPatientTargets, saveSmartReport, deleteReport, analyzeCompleteBioProfile };
};
