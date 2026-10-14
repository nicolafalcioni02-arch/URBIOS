// URBIOS AI — registro dei campi che l'AI può compilare.
// È l'UNICA fonte di verità: genera la descrizione nel prompt, valida la risposta e dice dove scrivere.
// Per aggiungere un campo basta una riga qui. Per aggiungere una sezione (dieta, training) si aggiunge un blocco in SECTIONS.
//
// type: text | number | date | enum
// min/max: soglie di plausibilità (fuori soglia = avviso, il valore non viene applicato di default)

export const PATIENT_FIELDS = [
    { key: 'professione', label: 'Professione', type: 'text', group: 'Dati personali' },
    { key: 'anamnesi_familiare', label: 'Anamnesi familiare', type: 'text', group: 'Salute', hint: 'patologie nei familiari' },
    { key: 'patologie', label: 'Patologie', type: 'text', group: 'Salute', hint: 'patologie e disturbi del paziente' },
    { key: 'farmaci', label: 'Farmaci e integratori', type: 'text', group: 'Salute' },
    { key: 'allergie', label: 'Allergie e intolleranze', type: 'text', group: 'Salute' },
    { key: 'obiettivo', label: 'Obiettivo del paziente', type: 'text', group: 'Obiettivo' },
];

// Privacy: anagrafica e contatti (nome, residenza, telefono, email, data/luogo di nascita, stato civile)
// NON fanno parte dei campi AI: non escono mai nel prompt (minimizzazione GDPR).
// Nome, cognome, sesso e numero paziente NON si toccano mai: identificano la persona.
export const PROTECTED_PATIENT_KEYS = ['id', 'nome', 'cognome', 'sesso', 'cf'];

const VISIT_BASE = [
    { key: 'peso', label: 'Peso', type: 'number', unit: 'kg', min: 20, max: 400, group: 'Misure' },
    { key: 'altezza', label: 'Altezza', type: 'number', unit: 'cm', min: 80, max: 250, group: 'Misure' },
    { key: 'cm_collo', label: 'Circonferenza collo', type: 'number', unit: 'cm', min: 20, max: 70, group: 'Misure' },
    { key: 'cm_torace', label: 'Circonferenza torace', type: 'number', unit: 'cm', min: 50, max: 220, group: 'Misure' },
    { key: 'cm_vita_min', label: 'Vita (minima)', type: 'number', unit: 'cm', min: 40, max: 220, group: 'Misure' },
    { key: 'cm_fianchi_max', label: 'Fianchi (massima)', type: 'number', unit: 'cm', min: 50, max: 220, group: 'Misure' },

    { key: 'pa_max', label: 'Pressione massima', type: 'number', unit: 'mmHg', min: 60, max: 260, group: 'Stato generale' },
    { key: 'pa_min', label: 'Pressione minima', type: 'number', unit: 'mmHg', min: 30, max: 160, group: 'Stato generale' },
    { key: 'hr', label: 'Frequenza cardiaca', type: 'number', unit: 'bpm', min: 25, max: 220, group: 'Stato generale' },
    { key: 'spo2', label: 'Saturazione SpO2', type: 'number', unit: '%', min: 50, max: 100, group: 'Stato generale' },
    { key: 'ore_sonno', label: 'Ore di sonno', type: 'number', unit: 'h', min: 0, max: 24, group: 'Stato generale' },
    { key: 'stress', label: 'Livello di stress', type: 'enum', options: ['Basso', 'Medio', 'Alto'], group: 'Stato generale' },
    { key: 'alvo', label: 'Alvo', type: 'text', group: 'Stato generale', hint: 'regolarità intestinale, es. "regolare, 1 volta al giorno"' },
    { key: 'diuresi', label: 'Diuresi', type: 'text', group: 'Stato generale' },
    { key: 'Attivita_Fisica', label: 'Attività fisica', type: 'text', group: 'Stato generale', hint: 'tipo, frequenza e durata' },

    { key: 'Anamnesi', label: 'Anamnesi', type: 'text', group: 'Note cliniche', hint: 'storia clinica sintetica' },
    { key: 'Note_Rilevanti', label: 'Note rilevanti', type: 'text', group: 'Note cliniche' },
    { key: 'Note_Benessere_Psico_Fisico', label: 'Benessere psico-fisico', type: 'text', group: 'Note cliniche', hint: 'umore, ansia, rapporto col cibo, motivazione' },
    { key: 'Note_Funzioni_Organiche', label: 'Funzioni organiche', type: 'text', group: 'Note cliniche' },
    { key: 'Note_Metabolismo_Cardio', label: 'Metabolismo e cuore', type: 'text', group: 'Note cliniche' },
    { key: 'valutazione_report', label: 'Conclusioni per il report', type: 'text', group: 'Note cliniche', hint: 'valutazione finale che finisce nel report' },
];

// Gli esami del sangue seguono i range configurati dal professionista (db.rangeEmato).
export const getVisitFields = (rangeEmato) => {
    const blood = Object.entries(rangeEmato || {}).map(([key, r]) => ({
        key,
        label: r.label || key,
        type: 'number',
        unit: r.unit || '',
        group: 'Esami del sangue',
    }));
    return [...VISIT_BASE, ...blood];
};

// Sezioni disponibili. `ready:false` = mostrata come "in arrivo", non entra nel prompt.
export const SECTIONS = [
    { id: 'anagrafica', title: 'Anagrafica e salute', icon: 'ph-user', ready: true },
    { id: 'visita', title: 'Visita (misure, stato generale, esami)', icon: 'ph-stethoscope', ready: true },
    { id: 'dieta', title: 'Piano alimentare', icon: 'ph-carrot', ready: true },
    { id: 'training', title: 'Piano di allenamento', icon: 'ph-barbell', ready: true },
];

export const GROUP_ICON = {
    'Dati personali': 'ph-identification-card',
    Contatti: 'ph-address-book',
    Salute: 'ph-first-aid-kit',
    Obiettivo: 'ph-target',
    Misure: 'ph-ruler',
    'Stato generale': 'ph-heartbeat',
    'Note cliniche': 'ph-note-pencil',
    'Esami del sangue': 'ph-drop',
};

export const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
