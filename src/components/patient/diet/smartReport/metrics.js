// Catalogo delle metriche del Report grafico.
// Una metrica è: un valore singolo (`keys` = campi del database alimenti, oppure `item` = campo già presente sulla riga del piano)
// oppure un pannello (`panel` = elenco di altre metriche da confrontare).
// `percent: true` → il pannello è espresso come % del fabbisogno giornaliero (unità diverse non si possono mettere sullo stesso asse).
// Gli id sono gli stessi dei report già salvati.

const SAT_CHAIN = [
    'C4:0_butyric_acid', 'C6:0_capronic_acid', 'C8:0_caprylic_acid', 'C10:0_caprinic_acid', 'C12:0_lauric_acid', 'C14:0_myristic_acid',
    'C15:0_pentadecanoic_acid', 'C16:0_palmitic_acid', 'C17:0_heptadecanoic_acid', 'C18:0_stearic_acid', 'C20:0_arachidic_acid',
    'C22:0_behenic_acid', 'C24:0_lignoceric_acid',
];

const m = (label, unit, group, def) => ({ label, unit, group, ...def });

export const METRICS = {
    // ── Macro ─────────────────────────────────────────────
    kcal: m('Calorie', 'kcal', 'Macro', { item: 'kcal', target: 'kcal' }),
    macro: m('Macro: carboidrati, proteine, grassi', 'g', 'Macro', { panel: ['c', 'p', 'f'] }),
    p: m('Proteine', 'g', 'Macro', { item: 'p' }),
    c: m('Carboidrati', 'g', 'Macro', { item: 'c' }),
    f: m('Grassi', 'g', 'Macro', { item: 'f' }),
    fiber: m('Fibre', 'g', 'Macro', { keys: ['total_fiber'], drvKey: 'total_fiber' }),

    // ── Grassi ────────────────────────────────────────────
    lipid_panel: m('Acidi grassi: SFA, MUFA, PUFA, EPA, DHA', 'g', 'Grassi', { panel: ['sfa', 'mufa', 'pufa', 'epa', 'dha'] }),
    sfa: m('Saturi (SFA)', 'g', 'Grassi', { keys: ['Saturated_fatty_acids'], fallback: SAT_CHAIN }),
    mufa: m('Monoinsaturi (MUFA)', 'g', 'Grassi', { keys: ['monounsaturated_fatty_acids'] }),
    pufa: m('Polinsaturi (PUFA)', 'g', 'Grassi', { keys: ['polyunsaturated_fatty_acids'] }),
    epa: m('EPA (ω-3)', 'g', 'Grassi', { keys: ['C20:5_eicosapentaenoic_acid_EPA'] }),
    dha: m('DHA (ω-3)', 'g', 'Grassi', { keys: ['C22:6_docosahexaenoic_acid_DHA'] }),
    la: m('Acido linoleico (ω-6)', 'g', 'Grassi', { keys: ['C18:2_linoleic_acid'] }),
    ala: m('Acido α-linolenico (ω-3)', 'g', 'Grassi', { keys: ['C18:3_linolenic_acid'] }),
    oleic: m('Acido oleico', 'g', 'Grassi', { keys: ['C18:1_oleic_acid'] }),
    palmit: m('Acido palmitico', 'g', 'Grassi', { keys: ['C16:0_palmitic_acid'] }),
    steari: m('Acido stearico', 'g', 'Grassi', { keys: ['C18:0_stearic_acid'] }),
    chol: m('Colesterolo', 'mg', 'Grassi', { keys: ['cholesterol'] }),

    // ── Aminoacidi ────────────────────────────────────────
    amino_panel: m('Aminoacidi essenziali', 'g', 'Aminoacidi', { panel: ['leu', 'ile', 'val', 'lys', 'met', 'phe', 'thr', 'trp', 'his'] }),
    leu: m('Leucina', 'g', 'Aminoacidi', { keys: ['leucine'] }),
    ile: m('Isoleucina', 'g', 'Aminoacidi', { keys: ['isoleucine'] }),
    val: m('Valina', 'g', 'Aminoacidi', { keys: ['valine'] }),
    lys: m('Lisina', 'g', 'Aminoacidi', { keys: ['lysine'] }),
    met: m('Metionina', 'g', 'Aminoacidi', { keys: ['methionine'] }),
    phe: m('Fenilalanina', 'g', 'Aminoacidi', { keys: ['phenylalanine'] }),
    thr: m('Treonina', 'g', 'Aminoacidi', { keys: ['threonine'] }),
    trp: m('Triptofano', 'g', 'Aminoacidi', { keys: ['tryptophan'] }),
    his: m('Istidina', 'g', 'Aminoacidi', { keys: ['histidine'] }),

    // ── Minerali (con riferimento EFSA) ───────────────────
    micro_panel: m('Minerali: % del fabbisogno', '%', 'Minerali', { panel: ['ca', 'fe', 'mg', 'zn', 'k', 'se', 'cu', 'iod'], percent: true }),
    ca: m('Calcio', 'mg', 'Minerali', { keys: ['calcium'], drvKey: 'calcium' }),
    fe: m('Ferro', 'mg', 'Minerali', { keys: ['iron'], drvKey: 'iron' }),
    mg: m('Magnesio', 'mg', 'Minerali', { keys: ['magnesium'], drvKey: 'magnesium' }),
    zn: m('Zinco', 'mg', 'Minerali', { keys: ['zinc'], drvKey: 'zinc' }),
    k: m('Potassio', 'mg', 'Minerali', { keys: ['potassium'], drvKey: 'potassium' }),
    na: m('Sodio', 'mg', 'Minerali', { keys: ['sodium'], drvKey: 'sodium' }),
    se: m('Selenio', 'μg', 'Minerali', { keys: ['selenium'], drvKey: 'selenium' }),
    cu: m('Rame', 'mg', 'Minerali', { keys: ['copper'], drvKey: 'copper' }),
    iod: m('Iodio', 'μg', 'Minerali', { keys: ['iodine'], drvKey: 'iodine' }),

    // ── Vitamine (con riferimento EFSA) ───────────────────
    vita_panel: m('Vitamine: % del fabbisogno', '%', 'Vitamine', { panel: ['vitA', 'thia', 'ribo', 'niac', 'vitB6', 'fol', 'vitB12', 'vitC', 'vitD', 'vitE', 'vitK'], percent: true }),
    vitA: m('Vitamina A', 'μg', 'Vitamine', { keys: ['vitamin_a_retinol_equivalent'], drvKey: 'vitamin_a_retinol_equivalent' }),
    thia: m('Vitamina B1', 'mg', 'Vitamine', { keys: ['thiamine'], drvKey: 'thiamine' }),
    ribo: m('Vitamina B2', 'mg', 'Vitamine', { keys: ['riboflavin'], drvKey: 'riboflavin' }),
    niac: m('Vitamina B3', 'mg', 'Vitamine', { keys: ['niacin'], drvKey: 'niacin' }),
    vitB6: m('Vitamina B6', 'mg', 'Vitamine', { keys: ['vitamin_b6'], drvKey: 'vitamin_b6' }),
    fol: m('Folati (B9)', 'μg', 'Vitamine', { keys: ['folate'], drvKey: 'folate' }),
    vitB12: m('Vitamina B12', 'μg', 'Vitamine', { keys: ['vitamin_b12'], drvKey: 'vitamin_b12' }),
    vitC: m('Vitamina C', 'mg', 'Vitamine', { keys: ['vitamin_c'], drvKey: 'vitamin_c' }),
    vitD: m('Vitamina D', 'μg', 'Vitamine', { keys: ['vitamin_d'], drvKey: 'vitamin_d' }),
    vitE: m('Vitamina E', 'mg', 'Vitamine', { keys: ['vitamin_e'], drvKey: 'vitamin_e' }),
    vitK: m('Vitamina K', 'μg', 'Vitamine', { keys: ['vitamin_k'], drvKey: 'vitamin_k' }),

    // ── Bioattivi ─────────────────────────────────────────
    polyphen: m('Polifenoli', 'mg', 'Bioattivi', { keys: ['polyphenols'] }),
    lyco: m('Licopene', 'mg', 'Bioattivi', { keys: ['lycopene'] }),
    lut: m('Luteina + zeaxantina', 'mg', 'Bioattivi', { keys: ['lutein', 'zeaxanthin'] }),
    betacar: m('β-carotene', 'mg', 'Bioattivi', { keys: ['beta_carotene'] }),
    quer: m('Quercetina', 'mg', 'Bioattivi', { keys: ['quercetin'] }),
    phytos: m('Fitosteroli', 'mg', 'Bioattivi', { keys: ['phytosterols'] }),
    bio_panel: m('Bioattivi a confronto', 'mg', 'Bioattivi', { panel: ['polyphen', 'lyco', 'lut', 'betacar', 'quer', 'phytos'] }),

    // ── Copertura del fabbisogno (tutti i nutrienti con riferimento) ──
    drv_radar: m('Copertura del fabbisogno (tutti)', '%', 'Copertura', { panel: 'ALL_DRV', percent: true }),
};

export const METRIC_GROUPS = ['Macro', 'Grassi', 'Aminoacidi', 'Minerali', 'Vitamine', 'Bioattivi', 'Copertura'];

export const CHART_TYPES = [
    { id: 'bar', label: 'Istogramma' },
    { id: 'line', label: 'Linea' },
    { id: 'pie', label: 'Torta' },
    { id: 'radar', label: 'Radar' },
];

// Tipi sensati per una metrica: la torta non ha senso su percentuali del fabbisogno
export const typesFor = (metricId) => (METRICS[metricId]?.percent ? ['bar', 'line', 'radar'] : CHART_TYPES.map((t) => t.id));

export const resolveType = (metricId, type) => {
    const ok = typesFor(metricId);
    return ok.includes(type) ? type : 'bar'; // 'mixed' e '3d' dei vecchi report diventano istogramma
};
