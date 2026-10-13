// Dispendio energetico. Valori MET dal "Compendium of Physical Activities" (Ainsworth et al., 2011).
// Sono STIME medie: variano con peso, efficienza, ambiente. 1 MET ≈ 3,5 ml O2/kg/min ≈ 1 kcal/kg/h.
export const MET_ACTIVITIES = [
    { id: 'rt_light', group: 'Pesi', label: 'Allenamento con i sovraccarichi, sforzo leggero/moderato', met: 3.5 },
    { id: 'rt_vigorous', group: 'Pesi', label: 'Allenamento con i sovraccarichi, sforzo intenso', met: 6.0 },
    { id: 'circuit_mod', group: 'Circuito', label: 'Circuit training, sforzo moderato', met: 4.3 },
    { id: 'circuit_vig', group: 'Circuito', label: 'Circuit training, intenso', met: 8.0 },
    { id: 'calis_light', group: 'Corpo libero', label: 'Callistenia, sforzo leggero/moderato', met: 3.8 },
    { id: 'calis_vig', group: 'Corpo libero', label: 'Callistenia, intenso', met: 8.0 },
    { id: 'walk_32', group: 'Camminata', label: 'Camminata 3,2 km/h (2 mph)', met: 2.8 },
    { id: 'walk_48', group: 'Camminata', label: 'Camminata 4,8 km/h (3 mph)', met: 3.5 },
    { id: 'walk_56', group: 'Camminata', label: 'Camminata 5,6 km/h (3,5 mph)', met: 4.3 },
    { id: 'walk_64', group: 'Camminata', label: 'Camminata veloce 6,4 km/h (4 mph)', met: 5.0 },
    { id: 'walk_72', group: 'Camminata', label: 'Camminata molto veloce 7,2 km/h (4,5 mph)', met: 7.0 },
    { id: 'run_64', group: 'Corsa', label: 'Corsa 6,4 km/h (4 mph)', met: 6.0 },
    { id: 'run_80', group: 'Corsa', label: 'Corsa 8,0 km/h (5 mph)', met: 8.3 },
    { id: 'run_97', group: 'Corsa', label: 'Corsa 9,7 km/h (6 mph)', met: 9.8 },
    { id: 'run_113', group: 'Corsa', label: 'Corsa 11,3 km/h (7 mph)', met: 11.0 },
    { id: 'run_129', group: 'Corsa', label: 'Corsa 12,9 km/h (8 mph)', met: 11.8 },
    { id: 'run_145', group: 'Corsa', label: 'Corsa 14,5 km/h (9 mph)', met: 12.8 },
    { id: 'run_161', group: 'Corsa', label: 'Corsa 16,1 km/h (10 mph)', met: 14.5 },
    { id: 'bike_leis', group: 'Bici', label: 'Bici su strada, ritmo turistico (<16 km/h)', met: 4.0 },
    { id: 'bike_mod', group: 'Bici', label: 'Bici su strada, ritmo moderato (19-22 km/h)', met: 8.0 },
    { id: 'bike_vig', group: 'Bici', label: 'Bici su strada, sostenuta (22-25 km/h)', met: 10.0 },
    { id: 'bike_fast', group: 'Bici', label: 'Bici su strada, molto veloce (26-30 km/h)', met: 12.0 },
    { id: 'cyc_50', group: 'Cyclette', label: 'Cyclette leggera (50-89 W)', met: 4.8 },
    { id: 'cyc_100', group: 'Cyclette', label: 'Cyclette moderata (90-100 W)', met: 6.8 },
    { id: 'cyc_150', group: 'Cyclette', label: 'Cyclette intensa (101-160 W)', met: 8.8 },
    { id: 'cyc_200', group: 'Cyclette', label: 'Cyclette molto intensa (161-200 W)', met: 11.0 },
    { id: 'row_50', group: 'Vogatore', label: 'Vogatore leggero (50 W)', met: 4.8 },
    { id: 'row_100', group: 'Vogatore', label: 'Vogatore moderato (100 W)', met: 7.0 },
    { id: 'row_150', group: 'Vogatore', label: 'Vogatore intenso (150 W)', met: 8.5 },
    { id: 'row_200', group: 'Vogatore', label: 'Vogatore molto intenso (200 W)', met: 12.0 },
    { id: 'ellip', group: 'Altro cardio', label: 'Ellittica, sforzo generale', met: 5.0 },
    { id: 'stair', group: 'Altro cardio', label: 'Stair climber (scale), generale', met: 9.0 },
    { id: 'rope_slow', group: 'Altro cardio', label: 'Salto con la corda lento', met: 8.8 },
    { id: 'rope_mod', group: 'Altro cardio', label: 'Salto con la corda moderato', met: 11.8 },
    { id: 'rope_fast', group: 'Altro cardio', label: 'Salto con la corda veloce', met: 12.3 },
    { id: 'swim_mod', group: 'Nuoto', label: 'Nuoto stile libero, leggero/moderato', met: 5.8 },
    { id: 'swim_vig', group: 'Nuoto', label: 'Nuoto stile libero, intenso', met: 9.8 },
    { id: 'yoga', group: 'Mobilità', label: 'Stretching / hatha yoga', met: 2.3 },
    { id: 'pilates', group: 'Mobilità', label: 'Pilates', met: 3.0 },
];
export const metById = (id) => (MET_ACTIVITIES.find((a) => a.id === id) || {}).met;

// kcal = MET × kg × ore. "Netto" toglie il metabolismo a riposo (1 MET).
export const kcalFromMet = (met, weightKg, minutes, { net = false } = {}) => {
    const m = Number(met),
        w = Number(weightKg),
        t = Number(minutes);
    if (!(m > 0) || !(w > 0) || !(t > 0)) return 0;
    return (net ? m - 1 : m) * w * (t / 60);
};

// MET medio di una seduta di pesi dalla intensità (RPE medio): 3,5 (leggero) → 6,0 (intenso)
export const resistanceMet = (avgRpe) => {
    const r = Number(avgRpe);
    if (!Number.isFinite(r) || r <= 0) return 5.0;
    if (r <= 6) return 3.5;
    if (r >= 9) return 6.0;
    return 3.5 + ((r - 6) / 3) * 2.5;
};

// Equazioni metaboliche ACSM (tapis roulant e bici). VO2 in ml/kg/min.
export const acsmWalkingVo2 = (speedKmh, gradePct = 0) => {
    const s = (Number(speedKmh) * 1000) / 60,
        g = Number(gradePct) / 100;
    return 0.1 * s + 1.8 * s * g + 3.5;
};
export const acsmRunningVo2 = (speedKmh, gradePct = 0) => {
    const s = (Number(speedKmh) * 1000) / 60,
        g = Number(gradePct) / 100;
    return 0.2 * s + 0.9 * s * g + 3.5;
};
export const acsmCyclingVo2 = (watts, weightKg) => {
    const w = Number(watts),
        kg = Number(weightKg);
    return kg > 0 ? (1.8 * (w * 6.12)) / kg + 7 : NaN;
};
export const kcalFromVo2 = (vo2, weightKg, minutes) => {
    const v = Number(vo2),
        kg = Number(weightKg),
        t = Number(minutes);
    return v > 0 && kg > 0 && t > 0 ? ((v * kg) / 1000) * 5.0 * t : 0; // ~5 kcal per litro di O2
};
export const metFromVo2 = (vo2) => Number(vo2) / 3.5;
