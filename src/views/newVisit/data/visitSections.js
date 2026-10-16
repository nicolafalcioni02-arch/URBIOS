import { DEFAULT_RANGE_EMATO } from '../../../logic/db_defaults';

// I passi di Nuova Visita, nell'ordine in cui si compilano.
// `match` dice quali campi della bozza appartengono al passo: serve a contare cosa e' gia' compilato.
const ematoKeys = new Set(Object.keys(DEFAULT_RANGE_EMATO));
const generalKeys = new Set([
    'ore_sonno', 'stress', 'alvo', 'diuresi', 'pa_max', 'pa_min', 'hr', 'spo2',
    'Attivita_Fisica', 'Anamnesi', 'Note_Rilevanti', 'Note_Benessere_Psico_Fisico', 'Note_Funzioni_Organiche', 'Note_Metabolismo_Cardio',
]);

export const SECTIONS = [
    {
        id: 'anamnesi',
        short: 'Anamnesi',
        title: 'Anamnesi clinica',
        hint: 'Controlla che sia ancora valida e aggiorna solo cio\' che e\' cambiato.',
        icon: 'ph-heartbeat',
        match: () => false,
        // l'anamnesi vive nella scheda del paziente, non nella bozza della visita
        countPatient: (p) => ['patologie', 'farmaci', 'allergie', 'anamnesi_familiare', 'obiettivo'].filter((k) => String(p[k] || '').trim()).length,
    },
    {
        id: 'antropometria',
        short: 'Misure',
        title: 'Misure del corpo',
        hint: 'Peso e altezza bastano per iniziare. Il resto lo aggiungi se serve.',
        icon: 'ph-ruler',
        match: (k) => /^(peso|altezza|cm_|dm_|len_|circ_|misure_extra)/.test(k),
    },
    {
        id: 'plicometria',
        short: 'Pliche',
        title: 'Pliche cutanee',
        hint: 'Inserisci gli spessori in mm. Densità e massa grassa si calcolano da sole.',
        icon: 'ph-person-simple',
        match: (k) => /^(pl_|pliche_extra)/.test(k),
    },
    {
        id: 'bioimpedenza',
        short: 'BIVA',
        title: 'Bioimpedenza',
        hint: 'Resistenza e reattanza: l’angolo di fase compare subito.',
        icon: 'ph-lightning',
        match: (k) => /^biva_/.test(k) || k === 'note_biva',
    },
    {
        id: 'ematochimico',
        short: 'Esami',
        title: 'Esami del sangue',
        hint: 'Tocca un valore per inserirlo. Il colore dice se è dentro il range.',
        icon: 'ph-drop',
        match: (k) => ematoKeys.has(k),
    },
    {
        id: 'generale',
        short: 'Generale',
        title: 'Stato generale',
        hint: 'Sonno, stress, pressione, attività fisica.',
        icon: 'ph-list-checks',
        match: (k) => generalKeys.has(k),
    },
    {
        id: 'conclusioni',
        short: 'Fine',
        title: 'Conclusioni',
        hint: 'Il testo che scrivi qui finisce nel report finale.',
        icon: 'ph-signature',
        match: (k) => k === 'valutazione_report',
    },
];

const RILIEVI_ALL = ['anamnesi', 'antropometria', 'plicometria', 'bioimpedenza', 'ematochimico', 'generale', 'conclusioni'];

// Cosa si fa oggi: ogni voce decide i passi (rilievi + piani) del percorso.
export const VISIT_MODES = [
    { id: 'completa', title: 'Prima visita completa', desc: 'Anamnesi, misure, esami e poi piano alimentare e scheda.', icon: 'ph-clipboard-text', rilievi: RILIEVI_ALL, plans: ['dieta', 'training'] },
    { id: 'controllo', title: 'Visita di controllo', desc: 'Nuove misure e conclusioni, poi aggiorni la dieta.', icon: 'ph-arrows-clockwise', rilievi: ['antropometria', 'plicometria', 'bioimpedenza', 'ematochimico', 'generale', 'conclusioni'], plans: ['dieta'], needsVisit: true },
    { id: 'dieta', title: 'Solo piano alimentare', desc: 'Lavori sulla dieta, agganciata all\'ultima visita.', icon: 'ph-fork-knife', rilievi: [], plans: ['dieta'], needsVisit: true },
    { id: 'training', title: 'Solo scheda di allenamento', desc: 'Lavori sul training, agganciato all\'ultima visita.', icon: 'ph-barbell', rilievi: [], plans: ['training'], needsVisit: true },
];

// I passi dei rilievi di un percorso, nell'ordine
export const buildSections = (rilievi) => SECTIONS.filter((s) => rilievi.includes(s.id));

// Quanti campi del passo sono stati compilati
export const countFilled = (section, draft, patient = {}) =>
    section.countPatient ? section.countPatient(patient) : Object.keys(draft).reduce((n, k) => (section.match(k) && String(draft[k] ?? '').trim() !== '' ? n + 1 : n), 0);

// Dati che non cambiano da una visita all'altra: nel controllo si riportano gia' compilati
export const carryOver = (dettagli = {}) =>
    Object.keys(dettagli || {}).reduce((acc, k) => {
        if (/^(altezza|dm_|len_)/.test(k) && String(dettagli[k] ?? '').trim() !== '') acc[k] = dettagli[k];
        return acc;
    }, {});
