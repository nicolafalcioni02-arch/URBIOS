// Calcola Z per il grafico 3D (Probability Density)
export function getBivariateZ(x, y, mx, my, sx, sy, r) {
    let z_exp = Math.pow((x - mx) / sx, 2) + Math.pow((y - my) / sy, 2) - 2 * r * ((x - mx) / sx) * ((y - my) / sy);
    return Math.exp(-z_exp / (2 * (1 - r * r)));
}

// Calcola i punti per disegnare le ellissi (50%, 75%, 95%)
export function getEllipsePoints(mx, my, sx, sy, r, confidence) {
    const chi_sq = confidence === 0.5 ? 1.386 : confidence === 0.75 ? 2.773 : 5.991;
    const cov_xx = sx * sx;
    const cov_yy = sy * sy;
    const cov_xy = r * sx * sy;

    const T = cov_xx + cov_yy;
    const D = cov_xx * cov_yy - cov_xy * cov_xy;

    const L1 = T / 2 + Math.sqrt((T * T) / 4 - D);
    const L2 = T / 2 - Math.sqrt((T * T) / 4 - D);

    const theta = 0.5 * Math.atan2(2 * cov_xy, cov_xx - cov_yy);
    const a = Math.sqrt(L1 * chi_sq);
    const b = Math.sqrt(L2 * chi_sq);

    let x = [],
        y = [],
        z_floor = [];
    for (let i = 0; i <= 100; i++) {
        let t = (2 * Math.PI * i) / 100;
        x.push(mx + a * Math.cos(t) * Math.cos(theta) - b * Math.sin(t) * Math.sin(theta));
        y.push(my + a * Math.cos(t) * Math.sin(theta) + b * Math.sin(t) * Math.cos(theta));
        z_floor.push(0);
    }
    return { x, y, z_floor };
}

// Esegue le formule personalizzate salvate nel DB
export const calculateEquation = (code, data) => {
    try {
        if (!code || code.trim() === '') return null;

        // 1. Prepara i nomi delle variabili
        const keys = Object.keys(data);
        // 2. Prepara i valori
        const values = Object.values(data);

        // 3. Crea la funzione dinamica
        // Passiamo "util" come Math per retrocompatibilità se usavi util.log10, altrimenti Math standard
        // "data" e' l'intero contesto: le formule predefinite lo usano (es. data.logSomma), quelle scritte a mano possono usare i nomi diretti
        const func = new Function('data', ...keys, 'util', 'Math', `return ${code};`);

        // 4. Esegue
        const result = func(data, ...values, Math, Math);

        if (isNaN(result) || !isFinite(result)) return null;

        return result;
    } catch (e) {
        console.error('Errore nella formula:', code, e);
        return null;
    }
};
