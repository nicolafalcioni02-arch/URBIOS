// Dati di riferimento per il calcolatore LAF.
// Fonti: FAO/WHO/UNU 2001 (Human energy requirements, 2004): Tabella 5.1/5.3 e Annex 5 (PAR = multiplo del metabolismo basale);
// LARN SINU 2014 (FET = MB × LAF); EFSA 2013 (Dietary Reference Values for energy, PAL 1,4-1,6-1,8-2,0).

export const LAF_LEVELS = [
    {
        source: 'LARN 2014 (SINU)',
        note: 'Italia · fabbisogno = metabolismo basale × LAF',
        link: 'https://sinu.it/2019/07/09/fabbisogno-energetico-medio-ar-in-eta-adulta/',
        rows: [
            { v: '1,45', t: 'Attività fisica minima (ipocinetico)', d: 'Quasi sempre seduto, pochissimo movimento' },
            { v: '1,60', t: 'Prevalentemente sedentario', d: 'Lavoro d’ufficio, qualche spostamento' },
            { v: '1,75', t: 'Moderatamente attivo', d: 'Lavoro in piedi o movimento regolare' },
            { v: '2,10', t: 'Impegno fisico elevato', d: 'Attività fisiche impegnative, anche lavorative' },
        ],
    },
    {
        source: 'FAO/WHO/UNU 2001',
        note: 'Internazionale · intervalli di PAL',
        link: 'https://www.fao.org/4/y5686e/y5686e07.htm',
        rows: [
            { v: '1,40 – 1,69', t: 'Sedentario o poco attivo', d: 'Lavoro poco faticoso, uso frequente dei mezzi, poco esercizio (es. impiegato). Esempio di giornata: PAL 1,53' },
            { v: '1,70 – 1,99', t: 'Attivo o moderatamente attivo', d: 'Lavoro non pesante ma con più dispendio, oppure sedentario con circa 1 ora di esercizio moderato-intenso al giorno. Esempio: PAL 1,76' },
            { v: '2,00 – 2,40', t: 'Molto attivo', d: 'Lavoro o svago faticoso per diverse ore. Esempio: PAL 2,25. Oltre 2,40 è difficile da mantenere a lungo' },
        ],
    },
    {
        source: 'EFSA 2013',
        note: 'Europa · valori di riferimento per l’energia',
        link: 'https://efsa.europa.eu/en/efsajournal/pub/3005',
        rows: [
            { v: '1,4', t: 'Sedentario' },
            { v: '1,6', t: 'Poco attivo' },
            { v: '1,8', t: 'Attivo' },
            { v: '2,0', t: 'Molto attivo' },
        ],
    },
];

// Coefficienti per attività (PAR, multipli del metabolismo basale) - FAO/WHO/UNU 2001, Annex 5. m = uomini, f = donne.
export const LAF_ACTIVITIES = [
    {
        group: 'Giornata',
        rows: [
            { n: 'Sonno', m: 1.0, f: 1.0 },
            { n: 'Sdraiato da svegli', m: 1.2, f: 1.2 },
            { n: 'Seduto fermo', m: 1.2, f: 1.2 },
            { n: 'In piedi fermo', m: 1.4, f: 1.5 },
            { n: 'Vestirsi', m: 2.4, f: 3.3 },
            { n: 'Lavarsi (mani, viso, capelli)', m: 2.3 },
            { n: 'Mangiare e bere', m: 1.4, f: 1.6 },
        ],
    },
    {
        group: 'Spostamenti',
        rows: [
            { n: 'Passeggiata tranquilla', m: 2.1, f: 2.5 },
            { n: 'Camminata lenta', m: 2.8, f: 3.0 },
            { n: 'Camminata veloce', m: 3.8 },
            { n: 'Salita a piedi (pendio)', m: 7.1, f: 5.4 },
            { n: 'Discesa a piedi', m: 3.5, f: 3.2 },
            { n: 'Salire le scale', m: 5.0 },
            { n: 'Bicicletta', m: 5.6, f: 3.6 },
            { n: 'Guidare auto o camion', m: 2.0 },
            { n: 'Guidare una moto', m: 2.7 },
            { n: 'Seduto su bus o treno', m: 1.2 },
        ],
    },
    {
        group: 'Casa',
        rows: [
            { n: 'Faccende domestiche (generiche)', f: 2.8 },
            { n: 'Cucinare e sbucciare verdure', m: 1.9, f: 1.5 },
            { n: 'Lavare i piatti', f: 1.7 },
            { n: 'Spazzare', f: 2.3 },
            { n: 'Passare l’aspirapolvere', f: 3.9 },
            { n: 'Lavare i pavimenti', f: 4.4 },
            { n: 'Rifare il letto (clima freddo)', f: 4.9 },
            { n: 'Pulire i vetri', m: 3.0 },
            { n: 'Stirare', m: 3.5, f: 1.7 },
            { n: 'Cucire o lavorare a maglia', m: 1.6, f: 1.5 },
            { n: 'Prendersi cura dei bambini', f: 2.5 },
            { n: 'Fare la spesa', f: 4.6 },
            { n: 'Giardinaggio: diserbare', m: 3.3, f: 2.9 },
            { n: 'Spalare la neve', m: 7.9 },
        ],
    },
    {
        group: 'Lavoro',
        rows: [
            { n: 'Ufficio: seduto alla scrivania', m: 1.3 },
            { n: 'Ufficio: leggere o archiviare', m: 1.3, f: 1.5 },
            { n: 'Ufficio: scrivere', m: 1.4, f: 1.4 },
            { n: 'Ufficio: digitare al computer', m: 1.8, f: 1.8 },
            { n: 'Ufficio: in piedi o in movimento', m: 1.6 },
            { n: 'Assistente di volo', m: 3.0, f: 3.1 },
            { n: 'Calzolaio', m: 2.6, f: 2.2 },
            { n: 'Sarto', m: 2.5 },
            { n: 'Operaio tessile (media)', m: 3.1, f: 2.2 },
            { n: 'Muratore: verniciare', m: 3.6 },
            { n: 'Muratore: segare legno tenero', m: 5.3 },
            { n: 'Muratore: impastare cemento', m: 5.3 },
            { n: 'Falegname: piallare legno tenero', m: 5.7 },
            { n: 'Forestale: abbattere alberi', m: 6.9 },
            { n: 'Minatore: spalare', m: 4.6 },
            { n: 'Pompiere: trascinare la manichetta', m: 9.8 },
            { n: 'Militare: marcia lenta', m: 3.18 },
            { n: 'Militare: percorso a ostacoli', m: 5.7 },
        ],
    },
    {
        group: 'Sport',
        rows: [
            { n: 'Corsa, lunga distanza', m: 6.34, f: 6.55 },
            { n: 'Corsa, sprint', m: 8.21, f: 8.28 },
            { n: 'Nuoto', m: 9.0 },
            { n: 'Calcio', m: 8.0 },
            { n: 'Basket', m: 6.95, f: 7.74 },
            { n: 'Pallavolo', m: 6.06, f: 6.06 },
            { n: 'Tennis', m: 5.8, f: 5.92 },
            { n: 'Canottaggio', m: 6.7, f: 5.34 },
            { n: 'Circuit training', m: 6.96, f: 6.29 },
            { n: 'Ginnastica a corpo libero', m: 5.44 },
            { n: 'Aerobica, bassa intensità', m: 3.51, f: 4.24 },
            { n: 'Aerobica, alta intensità', m: 7.93, f: 8.31 },
            { n: 'Golf', m: 4.38 },
            { n: 'Bowling', m: 4.21 },
            { n: 'Vela', m: 1.42, f: 1.54 },
        ],
    },
    {
        group: 'Tempo libero',
        rows: [
            { n: 'Guardare la TV', m: 1.64, f: 1.72 },
            { n: 'Leggere', m: 1.22, f: 1.25 },
            { n: 'Ascoltare musica o radio', m: 1.57, f: 1.43 },
            { n: 'Giochi di carte o da tavolo', m: 1.5, f: 1.75 },
            { n: 'Dipingere', m: 1.25, f: 1.27 },
            { n: 'Ballare', m: 5.0, f: 5.09 },
            { n: 'Suonare il pianoforte', m: 2.25 },
            { n: 'Suonare la batteria', m: 3.71 },
        ],
    },
];
