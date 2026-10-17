// Stile del documento: layout, colore guida, margini, intestazione e piè di pagina. Salvato in db.stampa.tema.

// Ogni layout ha la sua grafica in layoutStyles.js (classe pc-l-<id>).
// inset: millimetri in più sui margini, per lasciare spazio a cornici e decorazioni del layout
// fonts: caratteri da caricare prima di impaginare (le misure dipendono da loro)
export const LAYOUTS = [
    { id: 'elegante', label: 'Elegante', desc: 'Serif e doppi filetti', accent: '#8A5A2B', fonts: ['600 1em "Playfair Display"'] },
    { id: 'giocoso', label: 'Giocoso', desc: 'Blocchi colorati, scritto a mano', accent: '#E8902E', inset: { t: 2, s: 3, b: 2 }, fonts: ['700 1em Gaegu', '400 1em Nunito', '700 1em Nunito'] },
    { id: 'planner', label: 'Planner', desc: 'Foglio su fondo illustrato', accent: '#3E6B55', inset: { t: 9, s: 9, b: 9 }, fonts: ['600 1em Caveat', '400 1em Karla', '700 1em Karla'] },
    { id: 'energia', label: 'Energia', desc: 'Sfumature e curve, molto deciso', accent: '#EC3F6B', inset: { t: 6 }, fonts: ['900 1em Montserrat', '500 1em Montserrat', '700 1em Montserrat'] },
    { id: 'geometrico', label: 'Geometrico', desc: 'Triangoli e tinte piatte', accent: '#13A89E', inset: { t: 3, b: 3 }, fonts: ['italic 900 1em Archivo', '400 1em Archivo', '700 1em Archivo'] },
    { id: 'naturale', label: 'Naturale', desc: 'Onde verdi, titoli stretti', accent: '#6E9A35', inset: { t: 8, b: 8 }, fonts: ['600 1em Oswald', '400 1em Oswald'] },
    { id: 'editoriale', label: 'Editoriale', desc: 'Fondo tinto, stile rivista', accent: '#5E7FA8', inset: { s: 3 }, fonts: ['400 1em "Bodoni Moda"', 'italic 400 1em "Bodoni Moda"', '400 1em Jost', '600 1em Jost'] },
    { id: 'istituzionale', label: 'Istituzionale', desc: 'Fascia laterale, sezioni numerate', accent: '#7A8C1E', inset: { s: 5 }, fonts: ['400 1em "IBM Plex Sans"', '600 1em "IBM Plex Sans"', '700 1em "IBM Plex Sans"'] },
    { id: 'pastello', label: 'Pastello', desc: 'Colori tenui e disegni a tratto', accent: '#8A6FD1', inset: { t: 3, s: 2, b: 3 }, fonts: ['500 1em Quicksand', '700 1em Quicksand'] },
    { id: 'fresco', label: 'Fresco', desc: 'Aloni di luce, linee pulite', accent: '#59B82C', fonts: ['400 1em Manrope', '700 1em Manrope', '800 1em Manrope'] },
];
export const ACCENTS = ['#1B1B1F', '#2F54EB', '#0F766E', '#1F8A5B', '#8A5A2B', '#B4536A', '#6D28D9', '#C2410C'];
export const layoutById = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];

export const DEFAULT_THEME = { layout: 'elegante', accent: '#8A5A2B', margins: 'normali', scale: 1, header: 'auto', footer: true, numbers: true };

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
    const base = MARGINS[theme.margins] || MARGINS.normali;
    const x = layoutById(theme.layout).inset || {};
    const m = { t: base.t + (x.t || 0), s: base.s + (x.s || 0), b: base.b + (x.b || 0) };
    const contentW = 210 - 2 * m.s;
    const foot = theme.footer ? FOOT : 0;
    // altezza utile (mm) di una pagina, con o senza intestazione
    const heightMm = (withHead) => 297 - m.t - m.b - foot - (withHead ? HEAD : 0);
    return { m, contentW, foot, head: HEAD, heightMm };
};

// carica i caratteri del layout prima di misurare (altrimenti le pagine si spezzano con il carattere sbagliato)
export const loadLayoutFonts = async (layout) => {
    if (typeof document === 'undefined' || !document.fonts) return;
    await Promise.all((layout.fonts || []).map((f) => document.fonts.load(f).catch(() => null)));
};

export const themeKey = (t) => [t.layout, t.margins, t.scale, t.footer ? 1 : 0].join('|');
