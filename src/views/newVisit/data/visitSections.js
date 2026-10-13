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
        id: 'antropometria',
        short: 'Misure',
        title: 'Misure del corpo',
        hint: 'Peso e altezza bastano per iniziare. Il resto lo aggiungi se serve.',
        icon: 'ph-ruler',
        match: (k) => /^(peso|altezza|cm_|dm_|len_|circ_)/.test(k),
    },
    {
        id: 'plicometria',
        short: 'Pliche',
        title: 'Pliche cutanee',
        hint: 'Inserisci gli spessori in mm. Densità e massa grassa si calcolano da sole.',
        icon: 'ph-person-simple',
        match: (k) => /^pl_/.test(k),
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

// Quanti campi del passo sono stati compilati
export const countFilled = (section, draft) =>
    Object.keys(draft).reduce((n, k) => (section.match(k) && String(draft[k] ?? '').trim() !== '' ? n + 1 : n), 0);
