// Genera i dati di esempio di URBIOS:
//  - src/storage/example/esempio.json: il paziente di esempio (Pino Citosi) e le ricette di esempio, che l'app mostra
//    in ogni archivio senza mai salvarli nel file (vedi src/storage/example/example.js)
//  - archivio_demo/URBIOS_demo.json: un archivio completo (profilo, pazienti, agenda) da aprire con "Apri archivio" o in demo
// Uso: node archivio_demo/genera.mjs   (rilancialo se cambi qualcosa qui)
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;
const foods = JSON.parse(fs.readFileSync(root + 'src/components/patient/diet/data/foodDB.json', 'utf8'));
const food = (q, w) => {
    const f = foods.find((x) => x.name.toLowerCase() === q.toLowerCase()) || foods.find((x) => x.name.toLowerCase().startsWith(q.toLowerCase()));
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
    ['2026-06-16', 87.8, { cm_vita_min: 97, cm_fianchi_max: 104, cm_torace: 105, circ_braccio: 33, circ_coscia: 59, circ_polpaccio: 38.5,
        pl_tricipite: 15, pl_bicipite: 7, pl_sottoscap: 18, pl_sovrailiaca: 20, pl_addome: 26, pl_coscia: 18, pl_pettorale: 11, biva_rz: 490, biva_xc: 59,
        bg_glicemia: 96, bg_insulina: 9.8, bg_hba1c: 5.5, bg_homair: 2.3, bl_col_tot: 195, bl_hdl: 48, bl_ldl: 122, bl_trig: 128, br_ast: 27, br_alt: 34, br_gamma_gt: 27, br_crea: 0.96, br_urico: 6.0, br_vitamina_d25oh: 26,
        pa_max: 126, pa_min: 82, hr: 68, ore_sonno: 7, stress: 'Medio', alvo: 'Regolare', diuresi: 'Regolare', Attivita_Fisica: 'Palestra 3 volte a settimana.',
        valutazione_report: 'Controllo a 4 mesi: -6,7 kg e -7 cm di vita. Glicemia in miglioramento, HOMA-IR ancora lievemente alto. Si prosegue con lo stesso piano e si introduce la vitamina D.' }],
    ['2026-02-10', 94.5, { cm_vita_min: 104, cm_fianchi_max: 109, cm_torace: 110, circ_braccio: 34, circ_coscia: 62, circ_polpaccio: 39.5,
        pl_tricipite: 22, pl_bicipite: 11, pl_sottoscap: 26, pl_sovrailiaca: 29, pl_addome: 36, pl_coscia: 25, pl_pettorale: 17, biva_rz: 455, biva_xc: 53,
        bg_glicemia: 108, bg_insulina: 14.6, bg_hba1c: 5.8, bg_homair: 3.9, bl_col_tot: 228, bl_hdl: 41, bl_ldl: 148, bl_trig: 185, br_ast: 33, br_alt: 52, br_gamma_gt: 45, br_crea: 0.98, br_urico: 7.1, br_vitamina_d25oh: 17,
        pa_max: 138, pa_min: 90, hr: 76, spo2: 97, ore_sonno: 6, stress: 'Alto', alvo: 'Irregolare', diuresi: 'Regolare', Attivita_Fisica: 'Sedentario: lavoro da scrivania, nessuno sport da 2 anni.',
        Anamnesi: 'Aumento di peso progressivo negli ultimi 4 anni, stanchezza post-prandiale, glicemia a digiuno al limite.',
        Note_Rilevanti: 'Prima visita. Sovrappeso con adiposità addominale, alterazione glicemica e dislipidemia lieve.',
        valutazione_report: 'Sovrappeso (BMI 29,2) con adiposità viscerale, glicemia a digiuno alterata e dislipidemia. Obiettivo: -10 kg in 8 mesi, riduzione vita e normalizzazione degli esami.' }],
];

// ---------- ricette di esempio (libreria ricette: kind 'ricetta') ----------
// Sintetizzate in cucina, non sui ribosomi: tutti gli ingredienti esistono davvero nel database alimenti.
const r1 = (x) => Math.round(x * 10) / 10;
const CAT = {"es-porridge": "Colazione", "es-pancake": "Colazione", "es-yogurt": "Colazione", "es-pasta-ceci": "Primi", "es-farro": "Primi", "es-lenticchie": "Primi", "es-riso-pollo": "Primi", "es-salmone": "Secondi", "es-merluzzo": "Secondi", "es-frittata": "Secondi", "es-polpette": "Secondi", "es-hummus": "Antipasti", "ev-caprese": "Antipasti", "ev-risotto": "Primi", "ev-paccheri": "Primi", "ev-spigola": "Secondi", "ev-vitello": "Secondi", "ev-pasticceria": "Dolci", "ev-frutta": "Dolci", "ev-bevande": "Bevande", "ev-bimbi-pasta": "Primi", "ev-bimbi-pollo": "Secondi"}; // categoria di Chef per id (Antipasti, Primi, Secondi…)
const recipe = (rid, title, servings, ings, steps, note = '', finalWeight = null) => {
    const items = ings.map(([q, w]) => ({ id: id('ri'), ...food(q, w) }));
    const t = items.reduce((a, i) => ({ kcal: a.kcal + (i.kcal * i.weight) / 100, p: a.p + ((Number(i.p) || 0) * i.weight) / 100, c: a.c + ((Number(i.c) || 0) * i.weight) / 100, f: a.f + ((Number(i.f) || 0) * i.weight) / 100, g: a.g + i.weight }), { kcal: 0, p: 0, c: 0, f: 0, g: 0 });
    const weight = finalWeight || t.g;
    return {
        id: rid, kind: 'ricetta', esempio: true, category: CAT[rid] || '', title, servings, finalWeight, items,
        totals: { kcal: r1(t.kcal), p: r1(t.p), c: r1(t.c), f: r1(t.f) },
        per100: { kcal: r1((t.kcal / weight) * 100), p: r1((t.p / weight) * 100), c: r1((t.c / weight) * 100), f: r1((t.f / weight) * 100) },
        portionGrams: Math.round(weight / servings), steps, note, savedAt: '01/10/2026',
    };
};
const ricette = [
    recipe('es-porridge', 'Porridge cremoso ai mirtilli', 2, [["Fiocchi d'avena", 80], ['Latte di vacca, pastorizzato, parzialmente scremato', 300], ['Mirtilli, freschi', 120], ['Miele', 10]],
        ["Metti i fiocchi d'avena e il latte in un pentolino e porta a leggero bollore.", 'Cuoci 5 minuti a fuoco basso mescolando spesso, finché diventa cremoso.', 'Versa nelle ciotole e completa con i mirtilli e un filo di miele.'],
        'Preparalo la sera prima in un barattolo con il latte freddo: al mattino è già pronto.'),
    recipe('es-pancake', 'Pancake di avena e banana', 2, [["Fiocchi d'avena", 60], ['Banane, fresche', 120], ['Uova di gallina, intero', 100], ['Yogurt greco, 0% lipidi', 100], ['Fragole, fresche', 150]],
        ["Frulla avena, banana e uova fino a ottenere una pastella liscia.", 'Scalda una padella antiaderente e cuoci un mestolino di pastella per volta, 2 minuti per lato.', 'Servi con yogurt greco e fragole a pezzetti.'],
        'Senza zucchero aggiunto: la dolcezza arriva tutta dalla banana matura.'),
    recipe('es-yogurt', 'Bowl di yogurt, frutta e mandorle', 1, [['Yogurt greco, 0% lipidi', 170], ['Lamponi, freschi', 80], ['Mandorle dolci, secche', 15], ['Miele', 5]],
        ['Versa lo yogurt in una ciotola.', 'Aggiungi i lamponi e le mandorle tritate grossolanamente.', 'Completa con il miele.'],
        'Ottima anche come spuntino dopo l’allenamento.'),
    recipe('es-pasta-ceci', 'Pasta integrale ceci e rosmarino', 4, [['Pasta di semola, integrale', 320], ['Ceci, in scatola, scolati', 400], ['Pomodori, da insalata', 200], ['Olio di oliva extra vergine', 30], ['Rosmarino, fresco', 5], ['Aglio', 5]],
        ["Rosola l'aglio con l'olio e il rosmarino, poi aggiungi i ceci e i pomodori a pezzetti.", 'Frulla metà dei ceci con un mestolo di acqua di cottura: è la crema del condimento.', 'Cuoci la pasta al dente, scolala e saltala in padella con i ceci e la crema.', 'Servi con una macinata di pepe.'],
        'Piatto unico completo: carboidrati, proteine vegetali e fibre. Il giorno dopo è ottimo anche freddo.', 1300),
    recipe('es-farro', 'Insalata di farro, pomodorini e feta', 4, [['Farro perlato, crudo', 280], ['Pomodori, da insalata', 300], ['Feta', 120], ['Rughetta o rucola', 60], ['Olio di oliva extra vergine', 30], ['Basilico, fresco', 5]],
        ['Lessa il farro in acqua salata per 25 minuti, scolalo e lascialo raffreddare.', 'Taglia i pomodorini, sbriciola la feta e spezzetta la rucola.', 'Unisci tutto, condisci con olio e basilico e lascia riposare 10 minuti.'],
        'Perfetta da portare in ufficio: si conserva in frigo fino a 2 giorni.', 1250),
    recipe('es-lenticchie', 'Pasta e lenticchie', 4, [['Pasta di semola', 240], ['Lenticchie, secche', 200], ['Carote, crude', 100], ['Sedano, crudo', 80], ['Cipolle, crude', 80], ['Olio di oliva extra vergine', 25]],
        ['Trita carota, sedano e cipolla e falli appassire con l’olio.', 'Aggiungi le lenticchie, copri con acqua e cuoci 30 minuti.', 'Aggiungi la pasta e cuocila direttamente nel brodo, aggiungendo acqua se serve.'],
        'Lenticchie e pasta insieme danno proteine complete: un classico della cucina di casa.', 1600),
    recipe('es-riso-pollo', 'Riso integrale con pollo e verdure', 2, [['Riso, integrale', 140], ['Pollo, petto, crudo', 250], ['Zucchine, crude', 200], ['Peperoni, crudi', 150], ['Olio di oliva extra vergine', 15]],
        ['Cuoci il riso integrale in acqua salata per 35–40 minuti.', 'Taglia il pollo a cubetti e rosolalo in padella con l’olio.', 'Aggiungi zucchine e peperoni a listarelle e cuoci 8 minuti.', 'Unisci il riso e salta tutto insieme.'],
        '', 900),
    recipe('es-salmone', 'Salmone in crosta di pistacchi', 2, [['Salmone, fresco', 300], ['Pistacchi', 25], ['Limoni, freschi', 40], ['Lattuga, fresca', 150]],
        ['Accendi il forno a 200 °C.', 'Trita i pistacchi e premili sulla superficie del salmone.', 'Cuoci 12–15 minuti e servi con l’insalata e il succo di limone.'],
        'Ricco di omega 3: portalo in tavola almeno una volta a settimana.'),
    recipe('es-merluzzo', 'Merluzzo al cartoccio con patate', 2, [['Merluzzo o nasello', 360], ['Patate, crude', 400], ['Pomodori, da insalata', 150], ['Olio di oliva extra vergine', 15], ['Limoni, freschi', 30]],
        ['Taglia le patate a fette sottili e cuocile in forno a 200 °C per 15 minuti.', 'Metti il merluzzo su un foglio di carta forno con pomodorini, olio e limone e chiudi il cartoccio.', 'Inforna il cartoccio insieme alle patate per altri 15 minuti.'],
        'Il cartoccio tiene il pesce morbido senza bisogno di altri grassi.'),
    recipe('es-frittata', 'Frittata di zucchine al forno', 2, [['Uova di gallina, intero', 240], ['Zucchine, crude', 300], ['Parmigiano Reggiano DOP', 20], ['Olio di oliva extra vergine', 8]],
        ['Taglia le zucchine a rondelle e saltale 5 minuti in padella con l’olio.', 'Sbatti le uova con il parmigiano e unisci le zucchine.', 'Versa in una teglia con carta forno e cuoci a 180 °C per 20 minuti.'],
        'Si taglia a quadrotti: comoda anche da portare via.'),
    recipe('es-polpette', 'Polpette di tacchino al pomodoro', 4, [['Tacchino, fesa, crudo', 500], ['Pane di tipo integrale', 60], ['Uova di gallina, intero', 50], ['Parmigiano Reggiano DOP', 20], ['Pomodori, maturi', 400], ['Olio di oliva extra vergine', 15]],
        ['Ammolla il pane in acqua, strizzalo e impastalo con il tacchino tritato, l’uovo e il parmigiano.', 'Forma delle polpette grandi come una noce.', 'Prepara un sugo con i pomodori e l’olio, aggiungi le polpette e cuoci coperto 20 minuti.'],
        'Piacciono anche ai bambini: se ne avanzano si congelano già cotte.', 1000),
    recipe('es-hummus', 'Hummus di ceci con verdure croccanti', 4, [['Ceci, in scatola, scolati', 400], ['Olio di oliva extra vergine', 20], ['Limoni, freschi', 40], ['Carote, crude', 300], ['Sedano, crudo', 200]],
        ['Frulla i ceci con olio, succo di limone e qualche cucchiaio di acqua fino a una crema liscia.', 'Taglia carote e sedano a bastoncini.', 'Servi l’hummus con le verdure da intingere.'],
        'Uno spuntino salato che sazia a lungo.'),
];

// ---------- ricette e menù di prova per Chef: «Matrimonio di Paola e Fausto» (compaiono in ogni archivio, ma non finiscono nel file) ----------
const evRicette = [
    recipe('ev-caprese', 'Caprese di bufala e basilico', 4, [['Mozzarella di bufala', 400], ['Pomodori, maturi', 400], ['Basilico, fresco', 10], ['Olio di oliva extra vergine', 20]],
        ['Taglia pomodori e mozzarella a fette dello stesso spessore.', 'Alterna le fette nel piatto con le foglie di basilico.', 'Condisci con olio a filo e sale al momento di servire.'], 'Servire a 10–12 °C: la mozzarella non deve essere gelida.'),
    recipe('ev-risotto', 'Risotto ai funghi e Parmigiano', 4, [['Riso, brillato', 320], ['Funghi coltivati, prataioli, crudi', 400], ['Cipolle, crude', 60], ['Burro', 40], ['Parmigiano Reggiano DOP', 60], ['Olio di oliva extra vergine', 20]],
        ['Soffriggi la cipolla tritata con l’olio, aggiungi i funghi a lamelle e cuoci 8 minuti.', 'Tosta il riso, poi cuocilo aggiungendo brodo caldo poco alla volta per circa 16 minuti.', 'Manteca fuori dal fuoco con burro e Parmigiano e lascia riposare 2 minuti.'], 'Per il servizio a banchetto: cuocere il riso a 3/4 e finire la cottura in sala.'),
    recipe('ev-paccheri', 'Paccheri al pomodoro fresco e basilico', 4, [['Pasta di semola', 320], ['Pomodori, maturi', 600], ['Aglio', 10], ['Basilico, fresco', 10], ['Olio di oliva extra vergine', 30], ['Parmigiano Reggiano DOP', 40]],
        ['Scalda l’olio con l’aglio, aggiungi i pomodori a cubetti e cuoci 15 minuti.', 'Cuoci la pasta al dente e saltala nel sugo.', 'Completa con basilico fresco e Parmigiano.'], 'Togliere l’aglio prima di servire.'),
    recipe('ev-spigola', 'Filetto di spigola al forno con patate', 4, [['Spigola', 800], ['Patate, crude', 600], ['Limoni, freschi', 60], ['Olio di oliva extra vergine', 30]],
        ['Taglia le patate a fette sottili e cuocile in forno a 200 °C per 15 minuti.', 'Adagia i filetti sulle patate con olio e limone.', 'Inforna per altri 12 minuti a 180 °C.'], 'Temperatura al cuore del pesce: almeno 63 °C.'),
    recipe('ev-vitello', 'Filetto di vitello con verdure arrosto', 4, [['Vitello, filetto, crudo', 720], ['Carote, crude', 300], ['Zucchine, crude', 300], ['Olio di oliva extra vergine', 30]],
        ['Rosola il filetto su tutti i lati in padella molto calda.', 'Cuoci in forno a 180 °C per 15 minuti e fai riposare 5 minuti prima di affettare.', 'Servi con carote e zucchine arrostite con olio.'], 'Temperatura al cuore: 65 °C.'),
    recipe('ev-pasticceria', 'Piccola pasticceria della casa', 4, [['Farina di frumento, tipo 00', 200], ['Burro', 100], ['Zucchero, saccarosio', 80], ['Uova di gallina, intero', 100], ['Mandorle dolci, secche', 60], ['Cioccolato, fondente', 60]],
        ['Impasta farina, burro, zucchero e uova per una frolla morbida.', 'Forma piccoli biscotti e mini tartellette, guarnisci con mandorle e cioccolato.', 'Cuoci a 170 °C per 12–15 minuti.'], 'Preparare il giorno prima.'),
    recipe('ev-frutta', 'Frutta fresca di stagione', 4, [['Mele, fresche, con buccia', 200], ['Arance, fresche', 200], ['Fragole, fresche', 200], ['Kiwi, freschi', 150], ['Uva, fresca', 150]],
        ['Lava la frutta e tagliala a spicchi.', 'Disponi sui piatti da portata alla fine del servizio.'], 'Tagliare il più tardi possibile e tenere a 4 °C.'),
    recipe('ev-bevande', 'Selezione di bevande', 1, [['Bevanda alcolica, Vino da pasto bianco', 150], ['Bevanda alcolica, Vino da pasto rosso', 150], ['Bevanda alcolica, Spumante', 100], ["Caffe' tostato", 7]],
        ['Vino bianco a 8–10 °C, rosso a 16–18 °C, spumante a 6 °C.', 'Acqua naturale e frizzante a volontà, caffè a fine pasto.'], 'Una porzione indicativa a persona. L’acqua non è nel conteggio.'),
    recipe('ev-bimbi-pasta', 'Pasta al burro e Parmigiano', 4, [['Pasta di semola', 240], ['Burro', 40], ['Parmigiano Reggiano DOP', 40]],
        ['Cuoci la pasta al dente.', 'Mantecala con burro e Parmigiano.'], 'Per i bambini: porzione piccola, niente piccante.'),
    recipe('ev-bimbi-pollo', 'Petto di pollo dorato con patate al forno', 4, [['Pollo, petto, crudo', 400], ['Patate, crude', 500], ['Olio di oliva extra vergine', 25]],
        ['Taglia il pollo a listarelle e le patate a bastoncini.', 'Cuoci in forno a 200 °C per 20 minuti, girando a metà.'], 'Pollo ben cotto: 75 °C al cuore.'),
];
const L = [
    'Questo è il menù che abbiamo pensato per Paola e Fausto: un pranzo di nozze di stagione, con piatti riconoscibili e sapori semplici, in cui gli ospiti possano ritrovarsi e stare bene a tavola. Servono 200 invitati, 20 bambini e 10 persone di staff, per un totale di 230 coperti.',
    'Il menù è in sei momenti: antipasto, due primi, due secondi, piccola pasticceria e frutta, con le bevande. Le quantità per porzione sono già calcolate nelle schede; la lista della spesa è per 210 coperti (invitati e staff) più il menù dei bambini. Tutti i piatti vanno impiattati con lo stesso peso, perché le calorie dichiarate in tavola devono corrispondere a quelle servite.',
    'Ci sono ospiti con esigenze alimentari precise: 3 celiaci, 2 celiaci senza lattosio, 1 senza pomodoro e senza nichel, 1 senza aglio e 1 senza frutta secca. Sono nelle pagine Special: ogni menù va preparato a parte, con utensili, pentole e piani di lavoro dedicati, e il piatto va segnalato al servizio con il nome dell’ospite.',
    'HACCP: controllate e registrate le temperature di frigoriferi e abbattitore a inizio servizio; tenete l’etichettatura con data e ora di produzione su ogni preparazione; il personale lavora con mani lavate, guanti cambiati tra crudo e cotto e abiti puliti. Conservate gli alimenti da campionare per 72 ore.',
    'Catena del freddo: le materie prime fresche si ricevono sotto i +4 °C e il pesce sul ghiaccio; i piatti cotti da servire freddi si abbattono da +65 °C a +10 °C in meno di 90 minuti; la conservazione è a +4 °C. Il caldo si mantiene sopra i +65 °C fino al servizio, e le rigenerazioni arrivano a +75 °C al cuore.',
    'Contaminazioni: separate sempre il crudo dal cotto, il pesce dalla carne e i prodotti con glutine, lattosio, frutta a guscio e sedano dagli special, usando taglieri e coltelli di colori diversi. Chi serve gli special consegna il piatto di persona, mai insieme agli altri.',
];
const evMenu = {
    id: 'es-menu-nozze', esempio: true, title: 'Paola e Fausto', subtitle: 'Matrimonio · Villa Falcioni',
    event: { name: 'Paola e Fausto', kind: 'Matrimonio', guests: '210', style: 'Mediterranea di stagione', location: 'Villa Falcioni', needs: [] },
    sections: [
        ['Antipasto', ['ev-caprese']], ['Primi', ['ev-risotto', 'ev-paccheri']], ['Secondi', ['ev-spigola', 'ev-vitello']],
        ['Piccola pasticceria', ['ev-pasticceria']], ['Frutta', ['ev-frutta']], ['Bevande', ['ev-bevande']],
    ].map(([name, ids], i) => ({ id: 'es-sec-' + i, name, dishes: ids.map((rid) => ({ rid, w: {} })) })),
    specials: [
        { id: 'es-sp-1', kind: 'dieta', name: 'Celiaci', who: '3 ospiti', persons: '3', care: 'Nessuna traccia di glutine: pentole, acqua di cottura, taglieri e forno dedicati. Controllare le etichette di tutti i prodotti. Piatto servito per primo, con segnalino.',
            subs: [{ from: 'Pasta di semola', to: 'Pasta di riso o mais, senza glutine' }, { from: 'Farina di frumento', to: 'Farina di riso e amido di mais, senza glutine' }] },
        { id: 'es-sp-2', kind: 'dieta', name: 'Celiaci senza lattosio', who: '2 ospiti', persons: '2', care: 'Doppia attenzione: niente glutine e niente lattosio. Verificare che i prodotti «senza lattosio» siano anche senza glutine. Cucinare con olio, non con burro.',
            subs: [{ from: 'Pasta di semola', to: 'Pasta di riso o mais, senza glutine' }, { from: 'Farina di frumento', to: 'Farina di riso e amido di mais, senza glutine' }, { from: 'Burro', to: 'Olio di oliva extra vergine' }, { from: 'Mozzarella', to: 'Mozzarella senza lattosio' }] },
        { id: 'es-sp-3', kind: 'dieta', name: 'Senza pomodoro e senza nichel', who: '1 ospite', persons: '1', care: 'Nichel: evitare pomodoro, cioccolato, frutta secca e legumi; usare pentole di acciaio non graffiate e senza acidi a lungo in cottura. Acqua di cottura non riutilizzata.',
            subs: [{ from: 'Pomodori', to: 'Zucchine grigliate' }, { from: 'Cioccolato', to: 'Crema alla vaniglia' }, { from: 'Mandorle', to: 'Zucchero a velo' }] },
        { id: 'es-sp-4', kind: 'dieta', name: 'Senza aglio', who: '1 ospite', persons: '1', care: 'Niente aglio né derivati (anche in polvere o nei brodi pronti). Pulire il piano di lavoro prima.',
            subs: [{ from: 'Aglio', to: 'Rosmarino fresco' }] },
        { id: 'es-sp-5', kind: 'dieta', name: 'Senza frutta secca', who: '1 ospite', persons: '1', care: 'Allergia alla frutta a guscio: nessuna traccia, piano di lavoro e utensili dedicati. Controllare le etichette di tutti i prodotti, compresi gli impasti della pasticceria.',
            subs: [{ from: 'Mandorle', to: 'Gocce di cioccolato' }] },
        { id: 'es-sp-6', kind: 'bimbi', name: 'Menù bimbi', who: 'i 20 bambini', persons: '20', care: 'Porzioni piccole e senza piccante. Servire per primi, nello stesso momento degli adulti. Frutta già tagliata.',
            subs: [], dishes: ['ev-bimbi-pasta', 'ev-bimbi-pollo', 'ev-frutta'].map((rid) => ({ rid, w: {} })) },
    ],
    letter: L.join('\n\n'),
};
const R = Object.fromEntries(ricette.map((r) => [r.id, r]));
// una ricetta in un pasto: un solo alimento con i valori per 100 g (come fa l'app)
const recipeItem = (rid, portions = 1) => {
    const r = R[rid];
    return { id: id('i'), name: r.title, weight: Math.round(r.portionGrams * portions), kcal: r.per100.kcal, p: r.per100.p, c: r.per100.c, f: r.per100.f, recipeId: r.id, portions,
        recipeParts: r.items.map((i) => ({ name: i.name, grams: i.weight })), recipeBase: r.finalWeight || r.items.reduce((s, i) => s + i.weight, 0) };
};
// alimento con alternative ("oppure")
const withSubs = (it, subs) => ({ ...it, subs: subs.map(([q, w]) => ({ id: id('sb'), ...food(q, w), mode: 'kcal' })) });

// ---------- dieta della visita più recente: una giornata tipo con alternative e ricette ----------
const dietDays = [
    { id: id('g'), title: 'Giornata tipo', meals: [
        { id: id('m'), title: 'Colazione', items: [recipeItem('es-porridge')] },
        { id: id('m'), title: 'Spuntino Mattina', items: [withSubs(item('Mele, fresche, con buccia', 150), [['Pere, fresche', 150], ['Arance, fresche', 180]]), withSubs(item('Mandorle dolci, secche', 15), [['Noci', 15]])] },
        { id: id('m'), title: 'Pranzo', items: [recipeItem('es-pasta-ceci'), withSubs(item('Zucchine, crude', 200), [['Spinaci, crudi', 200], ['Carote, crude', 150]])] },
        { id: id('m'), title: 'Spuntino Pomeriggio', items: [withSubs(item('Yogurt greco, 0% lipidi', 170), [['Yogurt, da latte intero', 125], ['Ricotta di vacca', 80]]), withSubs(item('Banane, fresche', 100), [['Mirtilli, freschi', 150]])] },
        { id: id('m'), title: 'Cena', items: [recipeItem('es-salmone'), withSubs(item('Pane di tipo integrale', 60), [['Patate, crude', 200], ['Riso, integrale', 50]]), withSubs(item('Olio di oliva extra vergine', 10), [])] },
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
// prima visita (febbraio): primo piano alimentare, consegnato e poi sostituito
const oldPlan = (title, kcal, items, w) => ({
    diet_calc_data: { ...calcData, weight: w, kcalAdjustPct: -20 },
    diet_targets: { kcal, c: 50, p: 22, f: 28, isConfigured: true },
    diet_plan_data: [{ id: id('g'), title, meals: items.map(([t, list]) => meal(t, list)) }],
    diet_meta: { name: title, date: '2026-02-10' },
});
Object.assign(visite[2].dettagli, oldPlan('Piano di avvio', 1700, [
    ['Colazione', [['Yogurt greco, 0% lipidi', 170], ["Fiocchi d'avena", 40], ['Mirtilli, freschi', 80]]],
    ['Spuntino Mattina', [['Mele, fresche, con buccia', 150]]],
    ['Pranzo', [['Pasta di semola', 80], ['Pollo, petto, crudo', 150], ['Zucchine, crude', 200], ['Olio di oliva extra vergine', 10]]],
    ['Spuntino Pomeriggio', [['Noci', 15]]],
    ['Cena', [['Merluzzo o nasello', 200], ['Patate, crude', 200], ['Spinaci, crudi', 150], ['Olio di oliva extra vergine', 10]]],
], 94.5));
visite[2].dietStatus = 'delivery'; // consegnato a febbraio, poi sostituito da quello di ottobre
visite[1].dietStatus = ''; // controllo di giugno: solo misure, si continua con il piano di febbraio
visite[0].dietStatus = 'active'; // ottobre: nuovo piano, in corso
visite[2].note = 'Prima visita: anamnesi, misure, esami, documenti firmati, primo piano alimentare e prima scheda di allenamento.';
visite[1].note = 'Controllo a 4 mesi: si prosegue con lo stesso piano.';
visite[0].note = 'Controllo a 8 mesi: obiettivo di peso raggiunto, rifatti piano alimentare e scheda di allenamento.';

// ---------- training ----------
// Due mesocicli: il primo per riaccendere i mitocondri, il secondo per farli lavorare sul serio.
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
        { id: 'sch-2', titolo: 'Mesociclo 2 - Forza e ricomposizione', cliente: 'Pino Citosi', obiettivo: 'Ricomposizione corporea', tipo: 'Palestra', livello: 'Intermedio', extraMin: 10, data: '2026-10-06',
          weeks: [week('Settimana 1', 1, 0), week('Settimana 2', 2, 2.5), week('Settimana 3', 3, 5), week('Settimana 4 (scarico)', 4, 0, 'deload')] },
        { id: 'sch-1', titolo: 'Mesociclo 1 - Ripresa', cliente: 'Pino Citosi', obiettivo: "Dimagrimento e ripresa dell'attività", tipo: 'Palestra', livello: 'Principiante', extraMin: 10, data: '2026-02-10',
          weeks: [week('Settimana 1', 1, -15), week('Settimana 2', 2, -12.5)] },
    ],
};

// Pino Citosi è il paziente di esempio: l'app lo mostra in ogni archivio (badge "Esempio") e non lo salva mai nel file.
// (Sì, è un nome da biologi: la pinocitosi è la cellula che "beve". Per questo gli chiediamo sempre 2 litri d'acqua al giorno.)
const EX_ID = 'esempio-pino';
const paziente = {
    id: EX_ID, esempio: true, nome: 'Pino', cognome: 'Citosi', sesso: 'M', dataNascita: '1988-05-17', status: 'Attivo', luogoNascita: 'Milano', provinciaNascita: 'MI', cf: 'CTSPNI88E17F205A',
    professione: 'Corriere espresso: trasporto attivo, anche controgradiente', cellulare: '+39 333 1234567', email: 'pino.citosi@example.com', indirizzo: 'Via dei Mitocondri 12', citta: 'Milano', cap: '20121',
    statoCivile: 'Coniugato/a', obiettivo: 'Perdere 10 kg, ridurre la circonferenza vita e normalizzare glicemia e colesterolo. Tornare ad allenarsi con costanza.',
    patologie: 'Prediabete (glicemia a digiuno alterata), dislipidemia lieve, steatosi epatica lieve.',
    farmaci: 'Nessun farmaco. Integratori: vitamina D3 2000 UI, omega 3.',
    allergie: 'Intolleranza al lattosio lieve (tollera yogurt e formaggi stagionati).',
    anamnesi_familiare: 'Padre (Fago Citosi): diabete tipo 2 e ipertensione. Madre (Eso Citosi): ipercolesterolemia. Fratello (Endo): in perfetta salute.',
    anamnesi_verificata: true,
    note: 'Paziente motivato e costante. Tende a inglobare tutto quello che trova nel frigo: va educato a scegliere. Preferisce pasti semplici da portare al lavoro, mangia fuori 2 volte a settimana.',
    documenti: { incarico: { stato: 'firmato', dataConsegna: '2026-02-10', dataFirma: '2026-02-10' }, privacy: { stato: 'firmato', dataConsegna: '2026-02-10', dataFirma: '2026-02-10' } },
    // il professionista dei documenti di Pino: inventato e completo, usato solo per lui (il profilo vero non si tocca).
    // Lisa Soma digerisce tutto, anche le pratiche burocratiche; il commercialista è il cugino Ribo, quello che traduce.
    professionista: {
        nome: 'Lisa', cognome: 'Soma', titolo_professionale: 'Biologa Nutrizionista', specializzazioni: 'Nutrizione clinica e sportiva · Perfezionamento in digestione intracellulare',
        data_nascita: '1987-11-03', luogo_nascita: 'Torino', codice_fiscale: 'SMOLSI87S43L219Q', indirizzo_residenza: 'Via Lagrange 9, 10123 Torino',
        telefono: '+39 011 765 4321', email: 'studio@lisasoma.it', pec_personale: 'lisa.soma@pec.it', firma_digitale: 'Firmato digitalmente da Dott.ssa Lisa Soma',
        ordine_appartenenza: 'Ordine dei Biologi del Piemonte', numero_albo: 'AA_076543', p_iva: '09876543210', codice_ateco: '86.90.29',
        indirizzo_studio: "Via dell'Apparato di Golgi 48", citta_studio: '10123 Torino', sedi_multiple: 'Sede 2: Vicolo del Reticolo Endoplasmatico 3, Milano (il martedì, solo su prenotazione: ruvido ma efficiente)',
        orari_studio: 'Lun-Ven: 9:00 - 19:00, Sab: 9:00 - 13:00', durata_prima_visita: '60', durata_controllo: '40',
        policy_cancellazione: 'Gli appuntamenti si possono spostare o annullare gratuitamente fino a 24 ore prima.',
        regime_fiscale: 'Forfettario', iban: 'IT40S0542811101000000654321', banca: 'Banca del Citoplasma', metodi_pagamento: 'Contanti, POS, Bonifico',
        pec_fatturazione: 'fatture.soma@pec.it', codice_sdi: 'KRRH6B9', note_fattura: 'Prestazione sanitaria esente IVA (art. 10 n. 18 DPR 633/72), detraibile ai fini fiscali.',
        assicurazione_compagnia: 'Mitocondrio Assicurazioni (la centrale energetica della tua tranquillità)', assicurazione_num: 'RC-2026-458712',
        lettera_compenso: 'euro 90,00 (novanta/00) per la prima visita, euro 60,00 (sessanta/00) per i controlli', lettera_luogo: 'Torino',
        privacy_titolare: "Dott.ssa Lisa Soma, con studio in Via dell'Apparato di Golgi 48, Torino", privacy_consulente: 'Studio Commerciale Dott. Ribo Soma (Responsabile Esterno)',
        footer: "Dott.ssa Lisa Soma · Biologa Nutrizionista · Via dell'Apparato di Golgi 48, Torino · studio@lisasoma.it",
        disclaimer_report: 'Il presente documento riporta misurazioni e valutazioni dello stato nutrizionale. Non costituisce diagnosi medica né sostituisce il parere del medico curante.',
    },
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
    provinciaNascita: 'BO', professione: 'Insegnante, podista amatoriale', cellulare: '+39 347 7654321', email: 'giulia.conti@example.com', indirizzo: 'Via Indipendenza 8', citta: 'Bologna', cap: '40121',
    statoCivile: 'Celibe/Nubile', documenti: { incarico: { stato: 'firmato', dataConsegna: '2026-08-20', dataFirma: '2026-08-20' }, privacy: { stato: 'firmato', dataConsegna: '2026-08-20', dataFirma: '2026-08-20' } }, obiettivo: 'Ritrovare il ciclo mestruale, recuperare energia e continuare a correre senza infortuni.',
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
    A('2026-02-10T09:00', 60, 'Pino Citosi - Prima visita', 'prima', 'completato'),
    A('2026-06-16T09:30', 40, 'Pino Citosi - Controllo', 'controllo', 'completato'),
    A('2026-10-06T09:30', 40, 'Pino Citosi - Controllo', 'controllo', 'completato'),
    A('2026-10-16T10:00', 30, 'Pino Citosi - Controllo peso', 'controllo', 'confermato', 'Verifica aderenza al nuovo piano'),
    A('2026-11-10T09:30', 40, 'Pino Citosi - Controllo trimestrale', 'controllo', 'confermato'),
    { id: id('a'), start: '2026-10-22T11:00', dur: 40, pid: pazienteF.id, titolo: 'Giulia Conti - Controllo', tipo: 'controllo', luogo: 'Studio', note: 'Rivalutazione ciclo ed esami ormonali', stato: 'confermato' },
    { id: id('a'), start: '2026-10-01T11:00', dur: 40, pid: pazienteF.id, titolo: 'Giulia Conti - Controllo', tipo: 'controllo', luogo: 'Studio', note: '', stato: 'completato' },
    { id: id('a'), start: '2026-10-15T15:00', dur: 30, pid: '', titolo: 'Riunione con il laboratorio analisi', tipo: 'altro', luogo: 'Studio', note: '', stato: 'confermato' },
];

const utente = { nome: 'Nicola', cognome: 'Falcioni', titolo_professionale: 'Biologo Nutrizionista', orari_studio: 'Lun-Ven: 9:00 - 18:00', durata_prima_visita: '60', durata_controllo: '40', indirizzo_studio: 'Via Roma 1, Milano' };
const db = {
    schemaVersion: 1,
    utente,
    pazienti: [paziente, pazienteF],
    agenda,
    diet_meal_library: ricette,
};
const file = { format: 'URBIOS', formatVersion: 1, encrypted: false, savedAt: new Date().toISOString(), data: db };
fs.writeFileSync(root + 'archivio_demo/URBIOS_demo.json', JSON.stringify(file, null, 2));
// i dati di esempio che l'app aggiunge a ogni archivio (senza salvarli)
fs.mkdirSync(root + 'src/storage/example', { recursive: true });
fs.writeFileSync(root + 'src/storage/example/esempio.json', JSON.stringify({ paziente, ricette: [...ricette, ...evRicette], menus: [evMenu] }));
console.log('ok', visite.length, 'visite;', ricette.length, 'ricette;', JSON.stringify(file).length, 'byte');
