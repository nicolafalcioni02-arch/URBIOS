// Stile del documento: layout, colore guida, margini, intestazione e piè di pagina. Salvato in db.stampa.tema.

export const LAYOUTS = [
    { id: 'classico', label: 'Classico', desc: 'Sobrio, nero su bianco', accent: '#1B1B1F', deco: 'plain' },
    { id: 'moderno', label: 'Moderno', desc: 'Banda colorata, pulito', accent: '#2F54EB', deco: 'band' },
    { id: 'elegante', label: 'Elegante', desc: 'Serif e doppi filetti', accent: '#8A5A2B', deco: 'serif' },
    { id: 'clinico', label: 'Clinico', desc: 'Chiaro, a blocchi', accent: '#0F766E', deco: 'band' },
    { id: 'minimale', label: 'Minimale', desc: 'Linee sottilissime', accent: '#6B7280', deco: 'plain' },
    { id: 'compatto', label: 'Compatto', desc: 'Meno fogli possibile', accent: '#374151', deco: 'plain', scale: 0.88, margins: 'strette' },
    { id: 'decorato', label: 'Decorato', desc: 'Cornice e ornamenti', accent: '#B4536A', deco: 'frame' },
];
export const ACCENTS = ['#1B1B1F', '#2F54EB', '#0F766E', '#1F8A5B', '#8A5A2B', '#B4536A', '#6D28D9', '#C2410C'];
export const layoutById = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];

export const DEFAULT_THEME = { layout: 'moderno', accent: '#2F54EB', margins: 'normali', scale: 1, header: 'auto', footer: true, numbers: true };

// margini in mm (alto, lati, basso)
export const MARGINS = {
    strette: { t: 9, s: 11, b: 8, label: 'Stretti' },
    normali: { t: 13, s: 16, b: 11, label: 'Normali' },
    ampie: { t: 18, s: 22, b: 15, label: 'Ampi' },
};
const HEAD = 11; // intestazione 7mm + 4mm di respiro
const FOOT = 9; // piè di pagina 6mm + 3mm
export const MM = 96 / 25.4;

export const geometry = (theme) => {
    const m = MARGINS[theme.margins] || MARGINS.normali;
    const contentW = 210 - 2 * m.s;
    const foot = theme.footer ? FOOT : 0;
    // altezza utile (mm) di una pagina, con o senza intestazione
    const heightMm = (withHead) => 297 - m.t - m.b - foot - (withHead ? HEAD : 0);
    return { m, contentW, foot, head: HEAD, heightMm };
};

export const themeKey = (t) => [t.layout, t.margins, t.scale, t.footer ? 1 : 0].join('|');
