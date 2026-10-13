// Linee guida di programmazione per obiettivo e livello. Sono INDICAZIONI di letteratura (ACSM 2009/2011, Schoenfeld 2016-2017,
// Helms et al. 2016, NSCA) da adattare alla persona: non sono prescrizioni.
export const GOALS = [
    {
        id: 'forza',
        label: 'Forza massimale',
        reps: [1, 5],
        pct: [80, 95],
        rest: [180, 300],
        rpe: [7, 9.5],
        sessionRpe: 7,
        tempo: 'concentrica esplosiva (es. 2-0-X-0)',
        hint: 'Pochi esercizi multiarticolari, carichi alti, recuperi lunghi.',
    },
    {
        id: 'ipertrofia',
        label: 'Ipertrofia (massa muscolare)',
        reps: [6, 12],
        pct: [65, 80],
        rest: [60, 150],
        rpe: [7, 9.5],
        sessionRpe: 7,
        tempo: 'controllato (es. 3-0-1-0)',
        hint: 'Volume elevato, serie vicine al cedimento (0-3 ripetizioni di riserva), ogni muscolo almeno 2 volte a settimana.',
    },
    {
        id: 'resistenza',
        label: 'Resistenza muscolare',
        reps: [12, 25],
        pct: [40, 65],
        rest: [30, 60],
        rpe: [6, 8],
        sessionRpe: 6,
        tempo: 'fluido (es. 2-0-2-0)',
        hint: 'Carichi moderati/leggeri, molte ripetizioni, recuperi brevi.',
    },
    {
        id: 'potenza',
        label: 'Potenza / esplosività',
        reps: [1, 5],
        pct: [30, 60],
        rest: [120, 300],
        rpe: [5, 7],
        sessionRpe: 6,
        tempo: 'massima velocità intenzionale (X-0-X-0)',
        hint: 'Qualità del gesto: serie lontane dal cedimento, recuperi completi.',
    },
    {
        id: 'dimagrimento',
        label: 'Dimagrimento / ricomposizione',
        reps: [8, 15],
        pct: [55, 75],
        rest: [30, 90],
        rpe: [6, 8],
        sessionRpe: 6,
        tempo: 'controllato',
        hint: 'Mantenere la massa magra (pesi) + attività aerobica; il deficit calorico viene dalla dieta.',
    },
    {
        id: 'salute',
        label: 'Salute e fitness generale',
        reps: [8, 15],
        pct: [50, 70],
        rest: [45, 90],
        rpe: [5, 7],
        sessionRpe: 5,
        tempo: 'controllato',
        hint: '2-3 sedute a settimana full body + 150-300 min di attività aerobica moderata (ACSM/OMS).',
    },
];
export const goalById = (id) => GOALS.find((g) => g.id === id) || null;

export const LEVELS = [
    {
        id: 'principiante',
        label: 'Principiante (< 6 mesi)',
        sessions: '2-3 a settimana, full body',
        note: 'Priorità: tecnica e adattamento. Progressione prudente.',
    },
    {
        id: 'intermedio',
        label: 'Intermedio (6 mesi - 2 anni)',
        sessions: '3-4 a settimana (full body / upper-lower)',
        note: 'Progressione settimanale o per mesociclo.',
    },
    {
        id: 'avanzato',
        label: 'Avanzato (> 2 anni)',
        sessions: '4-6 a settimana (split)',
        note: 'Periodizzazione, scarichi programmati, volume individualizzato.',
    },
];

// serie dirette settimanali per gruppo muscolare [min, max]
export const WEEKLY_SETS = {
    ipertrofia: { principiante: [6, 12], intermedio: [10, 16], avanzato: [12, 22] },
    forza: { principiante: [4, 10], intermedio: [6, 14], avanzato: [8, 16] },
    resistenza: { principiante: [6, 12], intermedio: [8, 16], avanzato: [10, 20] },
    potenza: { principiante: [3, 8], intermedio: [4, 10], avanzato: [6, 12] },
    dimagrimento: { principiante: [4, 10], intermedio: [6, 12], avanzato: [8, 14] },
    salute: { principiante: [4, 8], intermedio: [6, 12], avanzato: [8, 14] },
};
export const weeklySetsRange = (goal, level) => (WEEKLY_SETS[goal] && WEEKLY_SETS[goal][level]) || null;

export const MAX_SETS_PER_SESSION = 10; // oltre ~10 serie dirette per muscolo in una seduta il guadagno marginale cala
export const MIN_FREQUENCY = 2;
export const MAX_SESSION_MIN = 120;
export const CARDIO_WEEKLY_MIN = [150, 300]; // minuti/settimana attività aerobica moderata (OMS/ACSM)

// gruppi principali per equilibrio spinta/trazione e controllo delle lacune
export const PUSH = ['Petto', 'Spalle', 'Tricipiti'];
export const PULL = ['Dorso', 'Bicipiti', 'Trapezi'];
export const MAIN_MUSCLES = ['Petto', 'Dorso', 'Spalle', 'Bicipiti', 'Tricipiti', 'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Addome'];
