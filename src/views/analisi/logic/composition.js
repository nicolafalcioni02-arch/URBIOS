// Composizione corporea di una visita: usa i risultati salvati (Metodo A, poi B); se mancano ma ci sono le pliche
// la stima con Jackson-Pollock (7 o 3 pliche) o Durnin-Womersley (4 pliche) e Siri, dichiarando da dove viene.

const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};

const siri = (bd) => (bd > 0 ? 495 / bd - 450 : 0);

// Durnin & Womersley 1974: coefficienti per fascia d'età
const DW = {
    M: [[19, 1.162, 0.063], [29, 1.1631, 0.0632], [39, 1.1422, 0.0544], [49, 1.162, 0.07], [200, 1.1715, 0.0779]],
    F: [[19, 1.1549, 0.0678], [29, 1.1599, 0.0717], [39, 1.1423, 0.0632], [49, 1.1333, 0.0612], [200, 1.1339, 0.0645]],
};

export const estimateFromSkinfolds = (d, sesso, eta) => {
    const F = sesso === 'F';
    const age = eta > 0 ? eta : 30;
    const p = (k) => num(d[k]);
    const has = (keys) => keys.every((k) => p(k) > 0);
    const sum = (keys) => keys.reduce((a, k) => a + p(k), 0);
    const jp7 = ['pl_pettorale', 'pl_ascellare', 'pl_tricipite', 'pl_sottoscap', 'pl_addome', 'pl_sovrailiaca', 'pl_coscia'];
    if (has(jp7)) {
        const S = sum(jp7);
        const bd = F ? 1.097 - 0.00046971 * S + 0.00000056 * S * S - 0.00012828 * age : 1.112 - 0.00043499 * S + 0.00000055 * S * S - 0.00028826 * age;
        return { fm: siri(bd), method: 'Jackson-Pollock 7 pliche' };
    }
    const jp3 = F ? ['pl_tricipite', 'pl_sovrailiaca', 'pl_coscia'] : ['pl_pettorale', 'pl_addome', 'pl_coscia'];
    if (has(jp3)) {
        const S = sum(jp3);
        const bd = F ? 1.0994921 - 0.0009929 * S + 0.0000023 * S * S - 0.0001392 * age : 1.10938 - 0.0008267 * S + 0.0000016 * S * S - 0.0002574 * age;
        return { fm: siri(bd), method: 'Jackson-Pollock 3 pliche' };
    }
    const dw = ['pl_bicipite', 'pl_tricipite', 'pl_sottoscap', 'pl_sovrailiaca'];
    if (has(dw)) {
        const [, c, m] = DW[F ? 'F' : 'M'].find(([max]) => age <= max);
        return { fm: siri(c - m * Math.log10(sum(dw))), method: 'Durnin-Womersley 4 pliche' };
    }
    return null;
};

// { fm %, fmKg, ffmKg, source: 'A' | 'B' | 'stima' | null, method }
export const getComposition = (visitData = {}, report = {}, sesso = 'M', eta = 30) => {
    const peso = num(visitData.peso);
    const pick = (r) => {
        const fm = num(r?.fm_percent);
        if (!(fm > 0 && fm < 70)) return null;
        const fmKg = num(r.fm_kg) || (peso ? (peso * fm) / 100 : 0);
        return { fm, fmKg, ffmKg: num(r.ffm_kg) || (peso ? peso - fmKg : 0), method: [r.formula_densita, r.formula_conv].filter((x) => x && x !== 'N/A').join(' · ') };
    };
    const A = pick(report?.risultati_metodo_A);
    const B = pick(report?.risultati_metodo_B);
    if (A) return { ...A, source: 'A', A, B };
    if (B) return { ...B, source: 'B', A, B };
    const est = estimateFromSkinfolds(visitData, sesso, eta);
    if (est && est.fm > 2 && est.fm < 70) {
        const fmKg = peso ? (peso * est.fm) / 100 : 0;
        return { fm: est.fm, fmKg, ffmKg: peso ? peso - fmKg : 0, source: 'stima', method: est.method, A, B };
    }
    return { fm: 0, fmKg: 0, ffmKg: 0, source: null, method: '', A, B };
};

// tutti gli indici che servono a grafici e report
export const bodyIndices = (visitData = {}, report = {}, sesso = 'M', eta = 30) => {
    const peso = num(visitData.peso);
    const alt = num(visitData.altezza);
    const h = alt / 100;
    const comp = getComposition(visitData, report, sesso, eta);
    const vita = num(visitData.cm_vita_min);
    const fianchi = num(visitData.cm_fianchi_max);
    const rz = num(visitData.biva_rz);
    const xc = num(visitData.biva_xc);
    return {
        peso,
        altezza: alt,
        comp,
        bmi: h > 0 && peso > 0 ? peso / (h * h) : 0,
        fmi: comp.fmKg > 0 && h > 0 ? comp.fmKg / (h * h) : 0,
        ffmi: comp.ffmKg > 0 && h > 0 ? comp.ffmKg / (h * h) : 0,
        vita,
        fianchi,
        whtr: vita > 0 && alt > 0 ? vita / alt : 0,
        whr: vita > 0 && fianchi > 0 ? vita / fianchi : 0,
        rz,
        xc,
        pha: rz > 0 && xc > 0 ? (Math.atan2(xc, rz) * 180) / Math.PI : 0,
        rzH: rz > 0 && h > 0 ? rz / h : 0,
        xcH: xc > 0 && h > 0 ? xc / h : 0,
    };
};
