import { DEFAULT_RANGE_EMATO } from '../../../../logic/db_defaults';

// numero da un campo di testo (accetta la virgola); null se non è un numero
export const num = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
};

export const fmt = (v, digits = 1) => {
    const n = num(v);
    return n === null ? String(v ?? '') : n.toLocaleString('it-IT', { maximumFractionDigits: digits });
};

export const bmiOf = (peso, altezza) => {
    const p = num(peso);
    const h = num(altezza);
    return p && h ? p / (h / 100) ** 2 : null;
};

export const bmiBand = (bmi) => {
    if (bmi === null) return null;
    if (bmi < 18.5) return { label: 'Sottopeso', tone: 'var(--warn)' };
    if (bmi < 25) return { label: 'Normopeso', tone: 'var(--ok)' };
    if (bmi < 30) return { label: 'Sovrappeso', tone: 'var(--warn)' };
    return { label: 'Obesità', tone: 'var(--bad)' };
};

// esame confrontato con i valori di riferimento del sesso del paziente
export const rangeOf = (key, value, sesso) => {
    const cfg = DEFAULT_RANGE_EMATO[key];
    const v = num(value);
    if (!cfg || v === null) return null;
    const f = String(sesso || '').toUpperCase() === 'F';
    const min = f ? cfg.minF : cfg.minM;
    const max = f ? cfg.maxF : cfg.maxM;
    if (min === undefined || max === undefined) return null;
    const span = max - min || 1;
    // la barra copre da metà intervallo sotto il minimo a metà sopra il massimo
    const pos = Math.max(0, Math.min(1, (v - (min - span / 2)) / (span * 2)));
    const state = v < min ? 'low' : v > max ? 'high' : 'ok';
    return { min, max, state, pos };
};

const inKeys = (...keys) => (k) => keys.includes(k);
const prefixed = (re) => (k) => re.test(k);

export const BLOOD_GROUPS = [
    { id: 'glu', title: 'Glucidico', test: prefixed(/^bg_/) },
    { id: 'lip', title: 'Lipidico', test: prefixed(/^bl_/) },
    { id: 'epa', title: 'Fegato', test: inKeys('br_ast', 'br_alt', 'br_gamma_gt', 'br_alb', 'br_bilirubina_totale') },
    { id: 'ren', title: 'Reni', test: inKeys('br_crea', 'br_egfr', 'br_urea', 'br_urico', 'br_microalb') },
    { id: 'orm', title: 'Ormoni e tiroide', test: prefixed(/^br_(testosterone|estradiolo|progesterone|prolattina|adh|lh|fsh|ft3|ft4|tsh|omocisteina|cortisolo|dhea|shbg|igf)/) },
    { id: 'vit', title: 'Vitamine, ferro ed elettroliti', test: prefixed(/^br_(vitamina|ferritina|sideremia|cloro|fosforo|magnesio|sodio|potassio|calcio|bicarbonati)/) },
];

export const MEASURE_GROUPS = [
    {
        id: 'dm',
        title: 'Diametri',
        unit: 'cm',
        items: [['dm_polso', 'Polso'], ['dm_biacrom', 'Biacromiale'], ['dm_biiliaco', 'Biiliaco'], ['dm_femore', 'Femore'], ['dm_omero', 'Omero']],
    },
    {
        id: 'circ',
        title: 'Circonferenze',
        unit: 'cm',
        items: [['cm_collo', 'Collo'], ['cm_torace', 'Torace'], ['cm_vita_min', 'Vita'], ['cm_fianchi_max', 'Fianchi'], ['circ_braccio', 'Braccio'], ['circ_coscia', 'Coscia'], ['circ_polpaccio', 'Polpaccio']],
    },
    {
        id: 'pl',
        title: 'Pliche cutanee',
        unit: 'mm',
        items: [['pl_tricipite', 'Tricipite'], ['pl_bicipite', 'Bicipite'], ['pl_sottoscap', 'Sottoscapolare'], ['pl_sovrailiaca', 'Sovrailiaca'], ['pl_addome', 'Addome'], ['pl_coscia', 'Coscia'], ['pl_pettorale', 'Pettorale']],
    },
    {
        id: 'biva',
        title: 'Bioimpedenza',
        unit: 'Ω',
        items: [['biva_rz', 'Resistenza'], ['biva_xc', 'Reattanza']],
    },
];

export const LIFESTYLE = [
    ['ore_sonno', 'Sonno', 'ore'],
    ['stress', 'Stress', ''],
    ['alvo', 'Alvo', ''],
    ['diuresi', 'Diuresi', ''],
    ['Attivita_Fisica', 'Attività fisica', ''],
];

export const TEXT_BLOCKS = [
    ['valutazione_report', 'Valutazione'],
    ['Anamnesi', 'Anamnesi'],
    ['Note_Rilevanti', 'Note rilevanti'],
];

// chiavi già mostrate in sezioni dedicate o che non sono dati da elencare
export const isHandled = (key) =>
    key === 'altezza' ||
    key === 'note' ||
    key === 'pa_max' ||
    key === 'pa_min' ||
    key === 'hr' ||
    key === 'spo2' ||
    key.startsWith('diet_') ||
    key.includes('risultati_metodo') ||
    key in DEFAULT_RANGE_EMATO ||
    MEASURE_GROUPS.some((g) => g.items.some(([k]) => k === key)) ||
    LIFESTYLE.some(([k]) => k === key) ||
    TEXT_BLOCKS.some(([k]) => k === key);

export const prettyKey = (key) => {
    const s = key.replace(/_/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
};
