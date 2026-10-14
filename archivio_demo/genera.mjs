// Genera archivio_demo/URBIOS_demo.json: un archivio con un paziente completo, da aprire con "Apri archivio".
// Uso: node archivio_demo/genera.mjs   (rilancialo se cambi qualcosa qui)
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;
const foods = JSON.parse(fs.readFileSync(root + 'src/components/patient/diet/data/foodDB.json', 'utf8'));
const food = (q, w) => {
    const f = foods.find((x) => x.name.toLowerCase().startsWith(q.toLowerCase()));
    if (!f) throw new Error('alimento non trovato: ' + q);
    return { name: f.name, weight: w, kcal: f.energy_kcal, p: f.proteins, c: f.available_carbohydrates, f: f.lipids };
};
let n = 0;
const id = (p = 'd') => `${p}-${(++n).toString(36)}`;
const item = (q, w) => ({ id: id('i'), ...food(q, w) });
const meal = (title, items) => ({ id: id('m'), title, items: items.map(([q, w]) => item(q, w)) });

// ---------- visite (dalla più recente) ----------
const visit = (vid, data, peso, d, extra = {}) => ({ id: vid, data, peso, dietStatus: 'created', note: '', dettagli: { ...d, ...extra } });
const base = { altezza: 180, dm_polso: 17.5, dm_biacrom: 40, dm_biiliaco: 29, dm_femore: 9.4, dm_omero: 7, cm_collo: 40 };
const V = [
    ['2026-10-06', 84.6, { cm_vita_min: 93, cm_fianchi_max: 102, cm_torace: 103, circ_braccio: 33.5, circ_coscia: 58, circ_polpaccio: 38,
        pl_tricipite: 11, pl_bicipite: 5, pl_sottoscap: 14, pl_sovrailiaca: 15, pl_addome: 20, pl_coscia: 14, pl_pettorale: 8, biva_rz: 505, biva_xc: 62,
        bg_glicemia: 91, bg_insulina: 7.2, bg_hba1c: 5.3, bg_homair: 1.6, bl_col_tot: 178, bl_hdl: 52, bl_ldl: 106, bl_trig: 98, br_ast: 24, br_alt: 28, br_gamma_gt: 22, br_crea: 0.95, br_urico: 5.4, br_vitamina_d25oh: 34,
        pa_max: 122, pa_min: 78, hr: 64, spo2: 98, ore_sonno: 7.5, stress: 'Medio', alvo: 'Regolare, 1 volta al giorno', diuresi: 'Regolare', Attivita_Fisica: 'Palestra 3 volte a settimana (pesi) + 2 camminate da 40 minuti.',
        valutazione_report: 'Ottimo andamento: -9,9 kg in 8 mesi con riduzione della circonferenza vita di 11 cm. Glicemia e profilo lipidico rientrati nei range. Si passa alla ricomposizione corporea con deficit lieve, più carboidrati nei giorni di allenamento.' }],
    ['2026-07-07', 87.8, { cm_vita_min: 97, cm_fianchi_max: 104, cm_torace: 105, circ_braccio: 33, circ_coscia: 59, circ_polpaccio: 38.5,
        pl_tricipite: 15, pl_bicipite: 7, pl_sottoscap: 18, pl_sovrailiaca: 20, pl_addome: 26, pl_coscia: 18, pl_pettorale: 11, biva_rz: 490, biva_xc: 59,
        bg_glicemia: 96, bg_insulina: 9.8, bg_hba1c: 5.5, bg_homair: 2.3, bl_col_tot: 195, bl_hdl: 48, bl_ldl: 122, bl_trig: 128, br_ast: 27, br_alt: 34, br_gamma_gt: 27, br_crea: 0.96, br_urico: 6.0, br_vitamina_d25oh: 26,
        pa_max: 126, pa_min: 82, hr: 68, ore_sonno: 7, stress: 'Medio', alvo: 'Regolare', diuresi: 'Regolare', Attivita_Fisica: 'Palestra 3 volte a settimana.',
        valutazione_report: 'Calo costante di peso e vita. Glicemia in miglioramento, HOMA-IR ancora lievemente alto. Si prosegue con deficit moderato e si introduce vitamina D.' }],
    ['2026-04-14', 91.2, { cm_vita_min: 101, cm_fianchi_max: 107, cm_torace: 108, circ_braccio: 33, circ_coscia: 61, circ_polpaccio: 39,
        pl_tricipite: 19, pl_bicipite: 9, pl_sottoscap: 22, pl_sovrailiaca: 25, pl_addome: 31, pl_coscia: 22, pl_pettorale: 14, biva_rz: 470, biva_xc: 56,
        bg_glicemia: 103, bg_insulina: 12.4, bg_hba1c: 5.7, bg_homair: 3.2, bl_col_tot: 214, bl_hdl: 44, bl_ldl: 138, bl_trig: 162, br_ast: 31, br_alt: 44, br_gamma_gt: 38, br_crea: 0.97, br_urico: 6.6, br_vitamina_d25oh: 21,
        pa_max: 132, pa_min: 86, hr: 72, ore_sonno: 6.5, stress: 'Alto', alvo: 'Irregolare', diuresi: 'Regolare', Attivita_Fisica: 'Palestra 2 volte a settimana, poco costante.',
        valutazione_report: 'Prime 9 settimane: -3,3 kg. Indici glicemici ancora al limite, trigliceridi alti. Si aumenta l\'attività fisica e si riducono zuccheri semplici e alcol.' }],
    ['2026-02-10', 94.5, { cm_vita_min: 104, cm_fianchi_max: 109, cm_torace: 110, circ_braccio: 34, circ_coscia: 62, circ_polpaccio: 39.5,
        pl_tricipite: 22, pl_bicipite: 11, pl_sottoscap: 26, pl_sovrailiaca: 29, pl_addome: 36, pl_coscia: 25, pl_pettorale: 17, biva_rz: 455, biva_xc: 53,
        bg_glicemia: 108, bg_insulina: 14.6, bg_hba1c: 5.8, bg_homair: 3.9, bl_col_tot: 228, bl_hdl: 41, bl_ldl: 148, bl_trig: 185, br_ast: 33, br_alt: 52, br_gamma_gt: 45, br_crea: 0.98, br_urico: 7.1, br_vitamina_d25oh: 17,
        pa_max: 138, pa_min: 90, hr: 76, spo2: 97, ore_sonno: 6, stress: 'Alto', alvo: 'Irregolare', diuresi: 'Regolare', Attivita_Fisica: 'Sedentario: lavoro da scrivania, nessuno sport da 2 anni.',
        Anamnesi: 'Aumento di peso progressivo negli ultimi 4 anni, stanchezza post-prandiale, glicemia a digiuno al limite.',
        Note_Rilevanti: 'Prima visita. Sovrappeso con adiposità addominale, alterazione glicemica e dislipidemia lieve.',
        valutazione_report: 'Sovrappeso (BMI 29,2) con adiposità viscerale, glicemia a digiuno alterata e dislipidemia. Obiettivo: -10 kg in 8 mesi, riduzione vita e normalizzazione degli esami.' }],
];

// ---------- dieta (visita più recente) ----------
const dietDays = [
    { id: id('g'), title: 'Giorno allenamento', meals: [
        meal('Colazione', [['Latte di vacca, pastorizzato, parzialmente scremato', 200], ["Fiocchi d'avena", 50], ['Mirtilli, freschi', 80]]),
        meal('Spuntino Mattina', [['Mandorle dolci, secche', 20], ['Mele, fresche, con buccia', 150]]),
        meal('Pranzo', [['Pasta di semola', 90], ['Pollo, petto, crudo', 150], ['Zucchine, crude', 200], ['Olio di oliva extra vergine', 10]]),
        meal('Spuntino Pomeriggio', [['Yogurt greco, 0% lipidi', 170], ['Banane, fresche', 100]]),
        meal('Cena', [['Salmone, fresco', 150], ['Patate, crude', 200], ['Lattuga, fresca', 100], ['Olio di oliva extra vergine', 10]]),
    ] },
    { id: id('g'), title: 'Giorno riposo', meals: [
        meal('Colazione', [['Latte di vacca, pastorizzato, parzialmente scremato', 200], ['Pane di tipo integrale', 50], ['Marmellata', 15]]),
        meal('Spuntino Mattina', [['Mele, fresche, con buccia', 150]]),
        meal('Pranzo', [['Riso, brillato', 70], ['Merluzzo o nasello', 180], ['Spinaci, crudi', 200], ['Olio di oliva extra vergine', 10]]),
        meal('Spuntino Pomeriggio', [['Noci', 20]]),
        meal('Cena', [['Uova di gallina, intero', 120], ['Pane di tipo integrale', 60], ['Carote, crude', 200], ['Olio di oliva extra vergine', 8]]),
    ] },
];
const calcData = {
    sex: 'M', age: 38, weight: 84.6, height: 180, waist: 93, hip: 102, wrist: 17.5, fatPct: 17.5, weightTarget: 'actual', formula: 'mifflin', laf: 1.55, kcalAdjustPct: -15,
    macroTargets: { c: 48, p: 22, f: 30 },
    distribution: [{ id: 1, name: 'Colazione', value: 20 }, { id: 2, name: 'Spuntino Mattina', value: 10 }, { id: 3, name: 'Pranzo', value: 35 }, { id: 4, name: 'Spuntino Pomeriggio', value: 10 }, { id: 5, name: 'Cena', value: 25 }],
    matrixMode: 'global', activeMatrixDayId: null, dailyConfigs: {},
};
V[0][2].diet_calc_data = calcData;
V[0][2].diet_targets = { kcal: 1800, c: 48, p: 22, f: 30, isConfigured: true };
V[0][2].diet_plan_data = dietDays;
V[0][2].diet_meta = { name: 'Ricomposizione - deficit lieve', date: '2026-10-06' };
V[0][2].diet_supplements = [{ id: id('s'), name: 'Vitamina D3', dose: '2000 UI', when: 'A colazione' }, { id: id('s'), name: 'Omega 3', dose: '1 g', when: 'A cena' }];
V[0][2].diet_notes = ['Bere almeno 2 litri di acqua al giorno.', 'Limitare l\'alcol a 1-2 bicchieri a settimana.', 'Pesarsi 1 volta a settimana, sempre al mattino.'];
const visite = V.map(([data, peso, d], i) => visit(100 + (V.length - i), data, peso, { ...base, ...d }, {}));
visite[0].dietStatus = 'delivery';
// diete delle visite precedenti (più restrittive), così lo Storico ha piani diversi da confrontare
const oldPlan = (title, kcal, items, w) => ({
    diet_calc_data: { ...calcData, weight: w, kcalAdjustPct: -20 },
    diet_targets: { kcal, c: 50, p: 22, f: 28, isConfigured: true },
    diet_plan_data: [{ id: id('g'), title, meals: items.map(([t, list]) => meal(t, list)) }],
    diet_meta: { name: title, date: '' },
});
Object.assign(visite[1].dettagli, oldPlan('Deficit moderato', 1700, [
    ['Colazione', [['Yogurt greco, 0% lipidi', 170], ["Fiocchi d'avena", 40], ['Mirtilli, freschi', 80]]],
    ['Pranzo', [['Pasta di semola', 80], ['Pollo, petto, crudo', 150], ['Zucchine, crude', 200], ['Olio di oliva extra vergine', 10]]],
    ['Cena', [['Merluzzo o nasello', 200], ['Patate, crude', 200], ['Spinaci, crudi', 150], ['Olio di oliva extra vergine', 10]]],
], 87.8));
Object.assign(visite[2].dettagli, oldPlan('Deficit di avvio', 1800, [
    ['Colazione', [['Pane di tipo integrale', 60], ['Uova di gallina, intero', 60]]],
    ['Pranzo', [['Riso, brillato', 80], ['Salmone, fresco', 130], ['Carote, crude', 150], ['Olio di oliva extra vergine', 10]]],
    ['Cena', [['Pollo, petto, crudo', 180], ['Lattuga, fresca', 100], ['Pane di tipo integrale', 50], ['Olio di oliva extra vergine', 10]]],
], 91.2));
visite[1].dettagli.diet_meta.date = visite[1].data;
visite[2].dettagli.diet_meta.date = visite[2].data;
visite[0].note = 'Controllo a 8 mesi: obiettivo raggiunto.';
visite[3].note = 'Prima visita.';

// ---------- training ----------
const set = (p, reps, load, rpe, rec = "90''", tipo = '') => ({ id: id('s'), reps, load, pct: '', rpe, tempo: '', rec, note: '', tipo });
const ex = (name, group, reps, load, rpe, nsets = 3, rec) => ({ id: id('e'), name, group, ss: '', note: '', sets: Array.from({ length: nsets }, () => set(0, reps, load, rpe, rec)) });
const day = (title, exercises, minutes = 60) => ({ id: id('dd'), title, collapsed: false, minutes, sessionRpe: 7, note: '', exercises });
const week = (title, k, loadAdj, kind = '') => ({ id: id('w'), title, kind, note: kind ? 'Settimana di scarico' : '', days: [
    day('Spinta (petto, spalle, tricipiti)', [ex('Panca piana bilanciere', 'Petto', '8-10', 70 + loadAdj, 8, 4), ex('Military Press', 'Spalle', '10', 40 + loadAdj / 2, 7), ex('Croci ai cavi', 'Petto', '12-15', 12, 7), ex('Pushdown Tricipiti', 'Braccia', '12', 30, 7)]),
    day('Tirata (dorso, bicipiti)', [ex('Lat Machine', 'Dorso', '10', 65 + loadAdj / 2, 8, 4), ex('Rematore Bilanciere', 'Dorso', '8-10', 60 + loadAdj / 2, 8), ex('Pulley Basso', 'Dorso', '12', 55, 7), ex('Curl Bilanciere', 'Braccia', '10-12', 30, 7)]),
    day('Gambe e core', [ex('Squat', 'Gambe', '6-8', 90 + loadAdj, 8, 4, "150''"), ex('Leg Press', 'Gambe', '12', 160, 7), ex('Stacco rumeno', 'Gambe', '10', 70 + loadAdj / 2, 7), ex('Plank', 'Addome', "45''", '', 7)]),
] });
const allenamento = {
    attiva: 'sch-2',
    massimali: { 'panca piana bilanciere': { name: 'Panca piana bilanciere', kg: 95, date: '2026-09-20', method: 'Epley' }, squat: { name: 'Squat', kg: 120, date: '2026-09-20', method: 'Epley' }, 'stacco da terra': { name: 'Stacco da terra', kg: 140, date: '2026-09-20', method: 'Epley' } },
    schede: [
        { id: 'sch-2', titolo: 'Mesociclo 2 - Forza e ricomposizione', cliente: 'Luca Moretti', obiettivo: 'Ricomposizione corporea', tipo: 'Palestra', livello: 'Intermedio', extraMin: 10, data: '2026-10-06',
          weeks: [week('Settimana 1', 1, 0), week('Settimana 2', 2, 2.5), week('Settimana 3', 3, 5), week('Settimana 4 (scarico)', 4, 0, 'deload')] },
        { id: 'sch-1', titolo: 'Mesociclo 1 - Ripresa', cliente: 'Luca Moretti', obiettivo: 'Dimagrimento e ripresa dell\'attività', tipo: 'Palestra', livello: 'Principiante', extraMin: 10, data: '2026-04-14',
          weeks: [week('Settimana 1', 1, -15), week('Settimana 2', 2, -12.5)] },
    ],
};

const paziente = {
    id: '482913', nome: 'Luca', cognome: 'Moretti', sesso: 'M', dataNascita: '1988-05-17', status: 'Attivo', luogoNascita: 'Milano', cf: 'MRTLCU88E17F205X',
    professione: 'Impiegato (lavoro da scrivania)', telefono: '+39 333 1234567', email: 'luca.moretti@example.com', indirizzo_residenza: 'Via Garibaldi 12, 20121 Milano',
    stato_civile: 'Coniugato', obiettivo: 'Perdere 10 kg, ridurre la circonferenza vita e normalizzare glicemia e colesterolo. Tornare ad allenarsi con costanza.',
    patologie: 'Prediabete (glicemia a digiuno alterata), dislipidemia lieve, steatosi epatica lieve.',
    farmaci: 'Nessun farmaco. Integratori: vitamina D3 2000 UI, omega 3.',
    allergie: 'Intolleranza al lattosio lieve (tollera yogurt e formaggi stagionati).',
    anamnesi_familiare: 'Padre: diabete tipo 2 e ipertensione. Madre: ipercolesterolemia.',
    note: 'Paziente motivato e costante. Preferisce pasti semplici da portare in ufficio. Mangia fuori 2 volte a settimana.',
    visite, allenamento,
};

// ---------- seconda paziente: donna, con la parte di salute femminile ----------
const baseF = { altezza: 167, dm_polso: 14.5, cm_collo: 31 };
const visiteF = [
    visit(202, '2026-10-01', 51.5, { ...baseF, cm_vita_min: 66, cm_fianchi_max: 90, cm_torace: 84, circ_braccio: 25, circ_coscia: 49, pl_tricipite: 10, pl_bicipite: 5, pl_sottoscap: 9, pl_sovrailiaca: 8, pl_addome: 11, pl_coscia: 14,
        biva_rz: 590, biva_xc: 58, bg_glicemia: 82, bg_insulina: 4.1, bl_col_tot: 205, bl_hdl: 72, bl_ldl: 118, bl_trig: 62, br_ferritina: 22, br_sideremia_ferro: 71, br_vitamina_d25oh: 24,
        br_estradiolo_e2: 22, br_lh_luteinizzante: 2.1, br_fsh_follicolo: 3.0, br_prolattina: 11, br_ft3: 2.3, br_ft4: 0.9, br_testosterone_tot: 22,
        pa_max: 98, pa_min: 62, hr: 52, spo2: 99, ore_sonno: 7, stress: 'Alto', alvo: 'Regolare', diuresi: 'Regolare', Attivita_Fisica: 'Corsa 5 volte a settimana (circa 50 km) + 2 sedute di pesi.',
        Anamnesi: 'Assenza di ciclo da 7 mesi, dopo calo di peso e aumento dei km di corsa.',
        valutazione_report: 'Sospetta amenorrea ipotalamica funzionale da bassa disponibilità energetica (RED-S): BMI 18,5, estradiolo, LH e FSH bassi, FT3 ai limiti inferiori. Si imposta aumento graduale dell\'apporto calorico (+300-400 kcal), riduzione del volume di corsa e rivalutazione ormonale e MOC con il ginecologo.' }),
    visit(201, '2026-08-20', 52.8, { ...baseF, cm_vita_min: 67, cm_fianchi_max: 91, cm_torace: 85, circ_braccio: 25.5, circ_coscia: 50, pl_tricipite: 11, pl_bicipite: 5, pl_sottoscap: 10, pl_sovrailiaca: 9, pl_addome: 12, pl_coscia: 15,
        biva_rz: 575, biva_xc: 60, bg_glicemia: 84, bl_col_tot: 198, br_ferritina: 28, br_vitamina_d25oh: 29, pa_max: 100, pa_min: 64, hr: 55, ore_sonno: 7, stress: 'Medio', Attivita_Fisica: 'Corsa 4-5 volte a settimana.',
        Note_Rilevanti: 'Prima visita. Ciclo diventato irregolare, poi assente da fine marzo.', valutazione_report: 'Prima valutazione: peso in calo, apporto energetico basso rispetto al dispendio. Richiesti esami ormonali.' }),
];
visiteF[0].dettagli.diet_targets = { kcal: 2300, c: 55, p: 18, f: 27, isConfigured: true };
visiteF[0].dettagli.diet_plan_data = [{ id: id('g'), title: 'Giorno tipo', meals: [
    meal('Colazione', [['Latte di vacca, pastorizzato, intero', 200], ["Fiocchi d'avena", 70], ['Banane, fresche', 100], ['Noci', 15]]),
    meal('Spuntino Mattina', [['Pane di tipo integrale', 60], ['Marmellata', 20]]),
    meal('Pranzo', [['Riso, brillato', 100], ['Pollo, petto, crudo', 150], ['Zucchine, crude', 200], ['Olio di oliva extra vergine', 15]]),
    meal('Spuntino Pomeriggio', [['Yogurt, da latte intero', 170], ['Mandorle dolci, secche', 25]]),
    meal('Cena', [['Salmone, fresco', 150], ['Patate, crude', 250], ['Carote, crude', 150], ['Olio di oliva extra vergine', 12]]),
] }];
visiteF[0].dettagli.diet_meta = { name: 'Recupero energetico', date: '2026-10-01' };
visiteF[0].dietStatus = 'delivery';
const pazienteF = {
    id: '731045', nome: 'Giulia', cognome: 'Conti', sesso: 'F', dataNascita: '1997-03-09', status: 'Attivo', luogoNascita: 'Bologna', cf: 'CNTGLI97C49A944K',
    professione: 'Insegnante, podista amatoriale', telefono: '+39 347 7654321', email: 'giulia.conti@example.com', indirizzo_residenza: 'Via Indipendenza 8, 40121 Bologna',
    stato_civile: 'Nubile', obiettivo: 'Ritrovare il ciclo mestruale, recuperare energia e continuare a correre senza infortuni.',
    patologie: 'Fratture da stress al metatarso (2025). Nessuna patologia cronica.', farmaci: 'Nessun farmaco. Integratori: ferro e vitamina D.',
    allergie: 'Nessuna', anamnesi_familiare: 'Madre: ipotiroidismo. Nonna: osteoporosi.',
    f_menarca: '13', f_stato_ciclo: 'Amenorrea', f_ciclo_durata: '', f_ultima_mestruazione: '2026-03-18', f_flusso: 'Scarso', f_dismenorrea: 'Lieve', f_spm: 'Sì',
    f_gravidanze: 'G0 P0', f_gravidanza_attuale: 'No', f_allattamento: 'No', f_contraccettivo: 'Nessuna', f_tos: 'No',
    f_amenorrea_note: 'Assente da 7 mesi (ultima mestruazione 18 marzo 2026). Test di gravidanza negativo. Contemporaneo a perdita di 5 kg e aumento dei km di corsa.',
    f_patologie_gin: 'Nessuna diagnosi. Ecografia pelvica di giugno: ovaie normali, endometrio sottile.',
    f_ormoni: 'Estradiolo, LH e FSH bassi; prolattina e TSH nella norma; FT3 ai limiti inferiori. Androgeni nella norma (esclusa PCOS).',
    f_gravidanze_note: 'Nessuna gravidanza.',
    f_sintomi: 'Freddolosa, stanchezza, capelli più fragili, calo della libido, crampi muscolari.',
    f_controlli: 'Pap test regolare (2025). Densitometria ossea (MOC) richiesta: da fare.',
    note: 'Molto disciplinata sull\'allenamento e attenta a cosa mangia: monitorare il rapporto con il cibo e valutare supporto psicologico.',
    visite: visiteF, allenamento: { attiva: '', massimali: {}, schede: [] },
};
const A = (start, dur, titolo, tipo, stato, note = '') => ({ id: id('a'), start, dur, pid: paziente.id, titolo, tipo, luogo: 'Studio', note, stato });
const agenda = [
    A('2026-02-10T09:00', 60, 'Luca Moretti - Prima visita', 'prima', 'completato'),
    A('2026-04-14T09:30', 40, 'Luca Moretti - Controllo', 'controllo', 'completato'),
    A('2026-07-07T09:30', 40, 'Luca Moretti - Controllo', 'controllo', 'completato'),
    A('2026-10-06T09:30', 40, 'Luca Moretti - Controllo', 'controllo', 'completato'),
    A('2026-10-16T10:00', 30, 'Luca Moretti - Controllo peso', 'controllo', 'confermato', 'Verifica aderenza al nuovo piano'),
    A('2026-11-10T09:30', 40, 'Luca Moretti - Controllo trimestrale', 'controllo', 'confermato'),
    { id: id('a'), start: '2026-10-22T11:00', dur: 40, pid: pazienteF.id, titolo: 'Giulia Conti - Controllo', tipo: 'controllo', luogo: 'Studio', note: 'Rivalutazione ciclo ed esami ormonali', stato: 'confermato' },
    { id: id('a'), start: '2026-10-01T11:00', dur: 40, pid: pazienteF.id, titolo: 'Giulia Conti - Controllo', tipo: 'controllo', luogo: 'Studio', note: '', stato: 'completato' },
    { id: id('a'), start: '2026-10-15T15:00', dur: 30, pid: '', titolo: 'Riunione con il laboratorio analisi', tipo: 'altro', luogo: 'Studio', note: '', stato: 'confermato' },
];

const db = {
    schemaVersion: 1,
    utente: { nome: 'Nicola', cognome: 'Falcioni', titolo_professionale: 'Biologo Nutrizionista', orari_studio: 'Lun-Ven: 9:00 - 18:00', durata_prima_visita: '60', durata_controllo: '40', indirizzo_studio: 'Via Roma 1, Milano' },
    pazienti: [paziente, pazienteF],
    agenda,
};
const file = { format: 'URBIOS', formatVersion: 1, encrypted: false, savedAt: new Date().toISOString(), data: db };
fs.writeFileSync(root + 'archivio_demo/URBIOS_demo.json', JSON.stringify(file, null, 2));
console.log('ok', visite.length, 'visite;', JSON.stringify(file).length, 'byte');
