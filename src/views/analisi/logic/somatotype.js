// Somatotipo di Heath-Carter dai dati della visita (pliche, diametri, circonferenze, altezza e peso).
export const computeSomatotype = (visitData) => {
    const getVal = (k) => parseFloat(String(visitData[k] || '0').replace(',', '.')) || 0;

    // Recupero dati
    const peso = getVal('peso');
    const altezza = getVal('altezza');
    const tricipite = getVal('pl_tricipite');
    const sottoscap = getVal('pl_sottoscap');
    const sovrailiaca = getVal('pl_sovrailiaca');
    const polpaccioPl = getVal('pl_polpaccio');
    const omero = getVal('dm_omero') / 10;
    const femore = getVal('dm_femore') / 10;
    const braccio = getVal('circ_braccio_flesso') || getVal('circ_braccio') || getVal('circ_braccio_dx') || getVal('circ_braccio_sx');
    const polpaccio = getVal('circ_polpaccio') || getVal('circ_polpaccio_dx') || getVal('circ_polpaccio_sx');

    const sommaPliche = tricipite + sottoscap + sovrailiaca;
    let endo = 0,
        meso = 0,
        ecto = 0;

    if (altezza > 0 && sommaPliche > 0) {
        const X = sommaPliche * (170.18 / altezza);
        endo = -0.7182 + 0.1451 * X - 0.00068 * Math.pow(X, 2) + 0.0000014 * Math.pow(X, 3);
    }
    if (altezza > 0) {
        const braccioCorr = braccio - tricipite / 10;
        const polpaccioCorr = polpaccio - polpaccioPl / 10;
        meso = 0.858 * omero + 0.601 * femore + 0.188 * braccioCorr + 0.161 * polpaccioCorr - 0.131 * altezza + 4.5;
    }
    if (peso > 0 && altezza > 0) {
        const hwr = altezza / Math.pow(peso, 0.3333);
        if (hwr >= 40.75) ecto = 0.732 * hwr - 28.58;
        else if (hwr > 38.25) ecto = 0.463 * hwr - 17.63;
        else ecto = 0.1;
    }

    const calculatedValues = {
        endo: Math.max(0.1, endo),
        meso: Math.max(0.1, meso),
        ecto: Math.max(0.1, ecto),
    };
    return calculatedValues;
};
