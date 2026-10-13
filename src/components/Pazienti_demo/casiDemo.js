// Scheda di allenamento dimostrativa (stessa struttura delle schede reali: vedi training/logic/trainingModel.js)
const set = (id, reps, rec = "90''", note = '') => ({ id, reps, rec, note });
const sets = (p, reps, rec, n = 3, note = '') => Array.from({ length: n }, (_, i) => set(`${p}-s${i}`, reps, rec, i === n - 1 ? note : ''));
const DEMO_ALLENAMENTO = {
    attiva: 'demo-scheda-1',
    schede: [
        {
            id: 'demo-scheda-1',
            titolo: 'Mesociclo 1 - Ricomposizione',
            cliente: 'Marco Bianchi',
            obiettivo: 'Dimagrimento e tonificazione',
            data: '2024-11-10',
            weeks: [
                {
                    id: 'dw1',
                    title: 'Settimana 1',
                    days: [
                        {
                            id: 'dw1d1',
                            title: 'Petto e tricipiti',
                            collapsed: false,
                            exercises: [
                                {
                                    id: 'e1',
                                    name: 'Panca piana bilanciere',
                                    group: 'Petto',
                                    sets: sets('e1', '10', "90''", 4, 'Ultima serie con 2 ripetizioni di riserva'),
                                },
                                { id: 'e2', name: 'Panca inclinata manubri', group: 'Petto', sets: sets('e2', '12', "90''") },
                                { id: 'e3', name: 'Croci ai cavi', group: 'Petto', sets: sets('e3', '15', "60''") },
                                { id: 'e4', name: 'Pushdown Tricipiti', group: 'Braccia', sets: sets('e4', '12', "60''") },
                            ],
                        },
                        {
                            id: 'dw1d2',
                            title: 'Dorso e bicipiti',
                            collapsed: false,
                            exercises: [
                                { id: 'e5', name: 'Lat Machine', group: 'Dorso', sets: sets('e5', '12', "90''") },
                                { id: 'e6', name: 'Rematore Bilanciere', group: 'Dorso', sets: sets('e6', '10', "90''") },
                                { id: 'e7', name: 'Pulley Basso', group: 'Dorso', sets: sets('e7', '12', "90''") },
                                { id: 'e8', name: 'Curl Bilanciere', group: 'Braccia', sets: sets('e8', '12', "60''") },
                            ],
                        },
                        {
                            id: 'dw1d3',
                            title: 'Gambe e addome',
                            collapsed: false,
                            exercises: [
                                { id: 'e9', name: 'Squat', group: 'Gambe', sets: sets('e9', '8', "150''", 4) },
                                { id: 'e10', name: 'Leg Press', group: 'Gambe', sets: sets('e10', '12', "90''") },
                                { id: 'e11', name: 'Leg Curl', group: 'Gambe', sets: sets('e11', '15', "60''") },
                                { id: 'e12', name: 'Plank', group: 'Addome', sets: sets('e12', "40''", "45''") },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export const CASI_CLINICI_DEMO = [
    {
        id: 'demo-1',
        nome: 'Marco',
        cognome: 'Bianchi',
        sesso: 'M',
        dataNascita: '1985-03-12',
        status: 'Demo',
        allenamento: DEMO_ALLENAMENTO,
        note: 'Paziente maschio 39 anni, sovrappeso, sedentario. Obiettivo: dimagrimento.',
        patologie: ['Ipertensione lieve'],
        allergie: [],
        visite: [
            {
                id: 'v1',
                data: '2024-11-10',
                peso: 92,
                dietStatus: 'delivery',
                note: '',
                dettagli: {
                    altezza: 178,
                    cm_vita_min: 102,
                    cm_fianchi_max: 108,
                    dm_polso: 17,
                    diet_targets: { kcal: 1800, c: 50, p: 25, f: 25, isConfigured: true },
                    diet_plan_data: [
                        {
                            id: 'g1',
                            title: 'Giorno Tipo',
                            meals: [
                                {
                                    id: 'm1',
                                    title: 'Colazione',
                                    items: [
                                        { id: 'i1', name: 'Pane integrale', weight: 60, kcal: 230, p: 8, c: 45, f: 2 },
                                        { id: 'i2', name: 'Yogurt greco 0%', weight: 150, kcal: 86, p: 15, c: 6, f: 0 },
                                    ],
                                },
                                {
                                    id: 'm2',
                                    title: 'Pranzo',
                                    items: [
                                        { id: 'i3', name: 'Petto di Pollo', weight: 150, kcal: 165, p: 31, c: 0, f: 3.6 },
                                        { id: 'i4', name: 'Riso Basmati', weight: 80, kcal: 280, p: 6, c: 62, f: 0.4 },
                                        { id: 'i5', name: 'Olio EVO', weight: 10, kcal: 90, p: 0, c: 0, f: 10 },
                                    ],
                                },
                                {
                                    id: 'm3',
                                    title: 'Cena',
                                    items: [
                                        { id: 'i6', name: 'Salmone', weight: 150, kcal: 208, p: 28, c: 0, f: 11 },
                                        { id: 'i7', name: 'Verdure miste', weight: 200, kcal: 50, p: 2, c: 8, f: 0.5 },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
            {
                id: 'v2',
                data: '2024-09-05',
                peso: 96,
                dietStatus: 'created',
                note: '',
                dettagli: { altezza: 178, cm_vita_min: 105, cm_fianchi_max: 110 },
            },
        ],
    },
    {
        id: 'demo-2',
        nome: 'Giulia',
        cognome: 'Rossi',
        sesso: 'F',
        dataNascita: '1995-07-22',
        status: 'Demo',
        note: 'Paziente donna 29 anni, normopeso, sportiva. Obiettivo: miglioramento performance.',
        patologie: [],
        allergie: ['Lattosio'],
        visite: [
            {
                id: 'v3',
                data: '2024-12-01',
                peso: 58,
                dietStatus: 'delivery',
                note: '',
                dettagli: {
                    altezza: 165,
                    cm_vita_min: 68,
                    cm_fianchi_max: 92,
                    dm_polso: 14,
                    diet_targets: { kcal: 2100, c: 55, p: 20, f: 25, isConfigured: true },
                    diet_plan_data: [
                        {
                            id: 'g2',
                            title: 'Giorno Allenamento',
                            meals: [
                                {
                                    id: 'm4',
                                    title: 'Colazione',
                                    items: [
                                        { id: 'i8', name: 'Avena', weight: 80, kcal: 300, p: 10, c: 54, f: 6 },
                                        { id: 'i9', name: 'Mela', weight: 150, kcal: 78, p: 0.4, c: 21, f: 0.3 },
                                    ],
                                },
                                {
                                    id: 'm5',
                                    title: 'Pranzo',
                                    items: [
                                        { id: 'i10', name: 'Pasta integrale', weight: 90, kcal: 320, p: 12, c: 64, f: 2 },
                                        { id: 'i11', name: 'Tonno al naturale', weight: 120, kcal: 132, p: 28, c: 0, f: 1.2 },
                                    ],
                                },
                                {
                                    id: 'm6',
                                    title: 'Post Workout',
                                    items: [
                                        { id: 'i12', name: 'Petto di Pollo', weight: 200, kcal: 220, p: 41, c: 0, f: 4.8 },
                                        { id: 'i13', name: 'Riso Basmati', weight: 100, kcal: 350, p: 8, c: 78, f: 0.5 },
                                    ],
                                },
                                {
                                    id: 'm7',
                                    title: 'Cena',
                                    items: [
                                        { id: 'i14', name: 'Merluzzo', weight: 180, kcal: 144, p: 32, c: 0, f: 1.2 },
                                        { id: 'i15', name: 'Patate', weight: 150, kcal: 115, p: 3, c: 26, f: 0.1 },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 'demo-3',
        nome: 'Antonio',
        cognome: 'Ferrari',
        sesso: 'M',
        dataNascita: '1952-11-03',
        status: 'Demo',
        note: 'Paziente anziano 72 anni, obesità classe I, diabete tipo 2. Dieta ipocalorica controllata.',
        patologie: ['Diabete Tipo 2', 'Dislipidemia'],
        allergie: ['Glutine'],
        visite: [
            {
                id: 'v4',
                data: '2024-10-15',
                peso: 88,
                dietStatus: 'delivery',
                note: '',
                dettagli: {
                    altezza: 170,
                    cm_vita_min: 108,
                    cm_fianchi_max: 112,
                    dm_polso: 18,
                    diet_targets: { kcal: 1600, c: 45, p: 25, f: 30, isConfigured: true },
                    diet_plan_data: [
                        {
                            id: 'g3',
                            title: 'Giorno Tipo (Low-Carb)',
                            meals: [
                                {
                                    id: 'm8',
                                    title: 'Colazione',
                                    items: [
                                        { id: 'i16', name: 'Uova intere', weight: 120, kcal: 172, p: 14, c: 0.8, f: 12 },
                                        { id: 'i17', name: 'Olio EVO', weight: 10, kcal: 90, p: 0, c: 0, f: 10 },
                                    ],
                                },
                                {
                                    id: 'm9',
                                    title: 'Pranzo',
                                    items: [
                                        { id: 'i18', name: 'Riso Basmati', weight: 60, kcal: 210, p: 4.8, c: 46.8, f: 0.3 },
                                        { id: 'i19', name: 'Petto di Pollo', weight: 180, kcal: 198, p: 37, c: 0, f: 4.3 },
                                    ],
                                },
                                {
                                    id: 'm10',
                                    title: 'Cena',
                                    items: [
                                        { id: 'i20', name: 'Salmone', weight: 160, kcal: 222, p: 30, c: 0, f: 11.7 },
                                        { id: 'i21', name: 'Verdure miste', weight: 250, kcal: 62, p: 2.5, c: 10, f: 0.6 },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
];
