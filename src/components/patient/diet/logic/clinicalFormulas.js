// --- MOTORE CLINICO: FORMULE METABOLICHE E ANTROPOMETRIA ---
// --- MOTORE CLINICO: FORMULE METABOLICHE E ANTROPOMETRIA ---
// --- MOTORE CLINICO: FORMULE METABOLICHE (CORRETTO) ---
export const calculateRMR = (data) => {
    // Ora estraiamo anche weightTarget dallo stato
    const { sex, age, weight, height, fatPct, formula, weightTarget } = data;

    const actualW = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    const f = parseFloat(fatPct) || 0;

    if (actualW <= 0 || h <= 0) return 0;

    // 1. Calcolo in background dei pesi clinici
    const idealW = sex === 'M' ? h - 100 - (h - 150) / 4 : h - 100 - (h - 150) / 2;
    const adjustedW = idealW + 0.25 * (actualW - idealW);

    // 2. SELEZIONE SMART DEL PESO (Il cuore della tua richiesta)
    let w = actualW;
    if (weightTarget === 'ideal') w = idealW;
    if (weightTarget === 'adjusted') w = adjustedW;

    // 3. Le formule ora usano la 'w' corretta (Attuale, Ideale o Aggiustata)
    switch (formula) {
        case 'mifflin':
            return 10 * w + 6.25 * h - 5 * a + (sex === 'M' ? 5 : -161);
        case 'harris':
            return sex === 'M' ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
        case 'katch':
            return 370 + 21.6 * (w * (1 - f / 100));
        case 'fao_0_12_formula':
            return w * 95;
        case 'fao_0_12_breast':
            return w * 85;
        case 'schofield_0_3':
            return sex === 'M' ? 60.9 * w - 54 : 61.0 * w - 51;
        case 'schofield_3_9':
            return sex === 'M' ? 22.7 * w + 495 : 22.5 * w + 499;
        case 'schofield_10_17':
            return sex === 'M' ? 17.5 * w + 651 : 12.2 * w + 746;
        case 'schofield_18_29':
            return sex === 'M' ? 15.3 * w + 679 : 14.7 * w + 496;
        case 'schofield_30_59':
            return sex === 'M' ? 11.6 * w + 879 : 8.7 * w + 829;
        case 'schofield_60':
            return sex === 'M' ? 13.5 * w + 487 : 10.5 * w + 596;
        case 'schofield_wh_18_29':
            return sex === 'M' ? 15.057 * w + 1.004 * h + 705.8 : 13.623 * w + 2.83 * h + 98.2;
        case 'schofield_wh_30_59':
            return sex === 'M' ? 11.472 * w + 1.673 * h + 584.4 : 8.126 * w + 0.846 * h + 845.6;
        default:
            return 0;
    }
};

export const getAdjustedWeight = (actual, ideal) => ideal + 0.25 * (actual - ideal);

export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Sottopeso', color: '#FF9500' };
    if (bmi < 25) return { label: 'Normopeso', color: '#00C853' };
    if (bmi < 30) return { label: 'Sovrappeso', color: '#FF9500' };
    if (bmi < 35) return { label: 'Obesità I', color: '#FF3B30' };
    return { label: 'Obesità II-III', color: '#FF3B30' };
};

export const getWHRCategory = (whr, sex) => {
    const highRisk = sex === 'M' ? 0.9 : 0.85;
    const modRisk = sex === 'M' ? 0.85 : 0.8;
    if (whr >= highRisk) return { label: 'Rischio Alto', color: '#FF3B30' };
    if (whr >= modRisk) return { label: 'Rischio Medio', color: '#FF9500' };
    return { label: 'Rischio Basso', color: '#00C853' };
};

export const getMorfotipo = (grant, sex) => {
    if (sex === 'M') {
        if (grant > 10.4) return 'Longilineo';
        if (grant > 9.6) return 'Normolineo';
        return 'Brevilineo';
    } else {
        if (grant > 10.9) return 'Longilineo';
        if (grant > 9.9) return 'Normolineo';
        return 'Brevilineo';
    }
};

export const calculateIdealWeight = (sex, h) => {
    if (!h) return 0;
    return sex === 'M' ? h - 100 - (h - 150) / 4 : h - 100 - (h - 150) / 2;
};
