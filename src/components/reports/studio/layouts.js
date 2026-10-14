// Layout predefiniti di Report Studio: cambiano caratteri, colore guida e dettagli, non il contenuto
export const LAYOUTS = [
    { id: 'classico', label: 'Classico', desc: 'Sobrio, in bianco e nero', accent: '#111111', body: null, head: null },
    { id: 'moderno', label: 'Moderno', desc: 'Pulito, con colore guida', accent: '#0A84FF', body: "'Inter', system-ui, sans-serif", head: "'Inter', system-ui, sans-serif" },
    { id: 'elegante', label: 'Elegante', desc: 'Serif raffinato', accent: '#8A5A2B', body: "Georgia, 'Times New Roman', serif", head: "'Playfair Display', Georgia, serif" },
    { id: 'clinico', label: 'Clinico', desc: 'Chiaro e professionale', accent: '#0F766E', body: "'Inter', system-ui, sans-serif", head: "'Inter', system-ui, sans-serif" },
    { id: 'minimale', label: 'Minimale', desc: 'Essenziale, linee sottili', accent: '#6B7280', body: "'Inter', system-ui, sans-serif", head: "'Inter', system-ui, sans-serif" },
    { id: 'compatto', label: 'Compatto', desc: 'Tutto stretto, meno fogli', accent: '#374151', body: "'Inter', system-ui, sans-serif", head: "'Inter', system-ui, sans-serif" },
    { id: 'decorato', label: 'Decorato', desc: 'Cornici e ornamenti', accent: '#B4536A', body: "Georgia, 'Times New Roman', serif", head: "'Playfair Display', Georgia, serif" },
];

export const ACCENTS = ['#111111', '#0A84FF', '#0F766E', '#1F8A5B', '#8A5A2B', '#B42318', '#6D28D9', '#C2410C'];

export const layoutById = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
