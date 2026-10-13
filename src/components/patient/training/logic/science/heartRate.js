// Frequenza cardiaca, zone, carico interno (TRIMP) e stime del VO2max.
export const HRMAX_FORMULAS = [
    { id: 'tanaka', label: 'Tanaka (208 − 0,7 × età) — consigliata', f: (age) => 208 - 0.7 * age },
    { id: 'gellish', label: 'Gellish (207 − 0,7 × età)', f: (age) => 207 - 0.7 * age },
    { id: 'nes', label: 'Nes (211 − 0,64 × età)', f: (age) => 211 - 0.64 * age },
    { id: 'fox', label: 'Fox (220 − età)', f: (age) => 220 - age },
];
export const hrMax = (age, formula = 'tanaka') => {
    const a = Number(age);
    if (!(a > 0)) return null;
    return Math.round(HRMAX_FORMULAS.find((x) => x.id === formula).f(a));
};

export const ZONES = [
    { z: 1, name: 'Z1 Recupero attivo', from: 0.5, to: 0.6, use: 'riscaldamento, defaticamento, recupero' },
    { z: 2, name: 'Z2 Base aerobica', from: 0.6, to: 0.7, use: 'fondo lento, massima ossidazione dei grassi, volume' },
    { z: 3, name: 'Z3 Aerobico / medio', from: 0.7, to: 0.8, use: 'allenamento aerobico a ritmo sostenuto (tempo)' },
    { z: 4, name: 'Z4 Soglia', from: 0.8, to: 0.9, use: 'lavori a soglia, intervalli lunghi' },
    { z: 5, name: 'Z5 VO2max', from: 0.9, to: 1.0, use: 'intervalli brevi ad alta intensità (HIIT)' },
];

// Karvonen (riserva cardiaca): FC = FCriposo + % × (FCmax − FCriposo)
export const karvonenZones = (hrmax, hrRest) => {
    const M = Number(hrmax),
        R = Number(hrRest);
    if (!(M > 0) || !(R > 0) || R >= M) return null;
    return ZONES.map((z) => ({ ...z, bpmFrom: Math.round(R + z.from * (M - R)), bpmTo: Math.round(R + z.to * (M - R)) }));
};
export const percentMaxZones = (hrmax) => {
    const M = Number(hrmax);
    return M > 0 ? ZONES.map((z) => ({ ...z, bpmFrom: Math.round(z.from * M), bpmTo: Math.round(z.to * M) })) : null;
};

// TRIMP di Banister (carico interno da frequenza cardiaca media)
export const trimp = ({ minutes, hrAvg, hrRest, hrMax: M, sex = 'M' }) => {
    const d = Number(minutes),
        a = Number(hrAvg),
        r = Number(hrRest),
        m = Number(M);
    if (!(d > 0) || !(a > 0) || !(r > 0) || !(m > r)) return null;
    const x = Math.min(1, Math.max(0, (a - r) / (m - r)));
    const k = String(sex).toUpperCase() === 'F' ? 0.86 * Math.exp(1.67 * x) : 0.64 * Math.exp(1.92 * x);
    return d * x * k;
};

// VO2max (ml/kg/min)
export const cooperVo2 = (distanceMeters) => {
    const d = Number(distanceMeters);
    return d > 0 ? (d - 504.9) / 44.73 : null; // test di Cooper 12 minuti
};
export const rockportVo2 = ({ weightKg, age, sex = 'M', minutes, hr }) => {
    const w = Number(weightKg),
        a = Number(age),
        t = Number(minutes),
        h = Number(hr);
    if (!(w > 0) || !(a > 0) || !(t > 0) || !(h > 0)) return null;
    return 132.853 - 0.0769 * (w * 2.20462) - 0.3877 * a + 6.315 * (String(sex).toUpperCase() === 'M' ? 1 : 0) - 3.2649 * t - 0.1565 * h; // 1 miglio in cammino
};
export const vo2Class = (vo2) => (vo2 === null ? '' : vo2 < 25 ? 'molto basso' : vo2 < 35 ? 'basso' : vo2 < 45 ? 'medio' : vo2 < 55 ? 'buono' : 'ottimo'); // indicativo, varia con età e sesso

// Indice di Hooper (4 voci da 1 a 7): più è alto, peggio sta l'atleta
export const hooper = ({ sonno, stress, fatica, dolori }) => {
    const v = [sonno, stress, fatica, dolori].map(Number);
    if (v.some((x) => !(x >= 1 && x <= 7))) return null;
    const total = v.reduce((a, b) => a + b, 0);
    return { total, level: total <= 12 ? 'buono' : total <= 19 ? 'attenzione' : 'elevato' };
};
