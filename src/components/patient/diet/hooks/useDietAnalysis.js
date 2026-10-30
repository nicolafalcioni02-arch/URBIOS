import { useEffect } from 'react';
import { legacyTargets } from '../analysis/drvEngine';

// Target EFSA del paziente, report salvati, analisi bioprofilo/DRV
export const useDietAnalysis = ({
    activeDay,
    dietDays,
    drvDB,
    emptyFoodTemplate,
    foodDB,
    genId,
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

    // --- GESTIONE SALVATAGGIO REPORT ---
    const saveSmartReport = () => {
        const day = dietDays.find((d) => d.id === smartConfig.dayId) || activeDay;
        const newReport = {
            id: genId(),
            date: new Date().toLocaleDateString('it-IT'),
            dayId: day ? day.id : null,
            dayTitle: smartConfig.scope === 'activeDay' ? day?.title || 'Giorno' : 'Panoramica Settimanale',
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

    return { getPatientTargets, saveSmartReport, deleteReport, analyzeCompleteBioProfile };
};
