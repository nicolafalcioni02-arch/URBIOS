export const METRIC_CATALOG = {
    // ── MACRO BASE ────────────────────────────────────────────────────────────
    kcal: { label: 'Calorie Totali', unit: 'kcal', group: 'Macro Base', keys: null, aggregation: 'kcal' },
    macro: { label: 'Macro P/C/F (confronto)', unit: 'g', group: 'Macro Base', keys: null, aggregation: 'macro' },
    p: { label: 'Proteine', unit: 'g', group: 'Macro Base', keys: ['proteins', 'p'] },
    c: { label: 'Carboidrati Totali', unit: 'g', group: 'Macro Base', keys: ['available_carbohydrates', 'c'] },
    f: { label: 'Grassi Totali', unit: 'g', group: 'Macro Base', keys: ['lipids', 'f'] },
    fiber: { label: 'Fibre Totali', unit: 'g', group: 'Macro Base', keys: ['total_fiber'] },

    // ── PROFILO LIPIDICO ──────────────────────────────────────────────────────
    sfa: { label: 'Acidi Grassi Saturi (SFA)', unit: 'g', group: 'Profilo Lipidico', keys: ['Saturated_fatty_acids'] },
    mufa: { label: 'Monoinsaturi (MUFA)', unit: 'g', group: 'Profilo Lipidico', keys: ['monounsaturated_fatty_acids'] },
    pufa: { label: 'Polinsaturi (PUFA)', unit: 'g', group: 'Profilo Lipidico', keys: ['polyunsaturated_fatty_acids'] },
    epa: { label: 'EPA (C20:5 ω-3)', unit: 'g', group: 'Profilo Lipidico', keys: ['C20:5_eicosapentaenoic_acid_EPA'] },
    dha: { label: 'DHA (C22:6 ω-3)', unit: 'g', group: 'Profilo Lipidico', keys: ['C22:6_docosahexaenoic_acid_DHA'] },
    la: { label: 'Acido Linoleico (LA)', unit: 'g', group: 'Profilo Lipidico', keys: ['C18:2_linoleic_acid'] },
    ala: { label: 'Acido α-Linolenico (ALA)', unit: 'g', group: 'Profilo Lipidico', keys: ['C18:3_linolenic_acid'] },
    palmit: { label: 'Acido Palmitico (C16:0)', unit: 'g', group: 'Profilo Lipidico', keys: ['C16:0_palmitic_acid'] },
    steari: { label: 'Acido Stearico (C18:0)', unit: 'g', group: 'Profilo Lipidico', keys: ['C18:0_stearic_acid'] },
    oleic: { label: 'Acido Oleico (C18:1)', unit: 'g', group: 'Profilo Lipidico', keys: ['C18:1_oleic_acid'] },
    chol: { label: 'Colesterolo', unit: 'mg', group: 'Profilo Lipidico', keys: ['cholesterol'] },
    lipid_panel: { label: 'Pannello Lipidico Completo', unit: 'g', group: 'Profilo Lipidico', aggregation: 'lipid_panel' },

    // ── AMINOACIDI ────────────────────────────────────────────────────────────
    amino_panel: { label: 'Pool Amminoacidico Completo', unit: 'g', group: 'Aminoacidi', aggregation: 'amino_panel' },
    leu: { label: 'Leucina (BCAA)', unit: 'g', group: 'Aminoacidi', keys: ['leucine'] },
    ile: { label: 'Isoleucina (BCAA)', unit: 'g', group: 'Aminoacidi', keys: ['isoleucine'] },
    val: { label: 'Valina (BCAA)', unit: 'g', group: 'Aminoacidi', keys: ['valine'] },
    lys: { label: 'Lisina', unit: 'g', group: 'Aminoacidi', keys: ['lysine'] },
    trp: { label: 'Triptofano', unit: 'g', group: 'Aminoacidi', keys: ['tryptophan'] },
    met: { label: 'Metionina', unit: 'g', group: 'Aminoacidi', keys: ['methionine'] },
    phe: { label: 'Fenilalanina', unit: 'g', group: 'Aminoacidi', keys: ['phenylalanine'] },
    his: { label: 'Istidina', unit: 'g', group: 'Aminoacidi', keys: ['histidine'] },
    thr: { label: 'Treonina', unit: 'g', group: 'Aminoacidi', keys: ['threonine'] },

    // ── MICRONUTRIENTI (DRV) ──────────────────────────────────────────────────
    ca: { label: 'Calcio', unit: 'mg', group: 'Micronutrienti', keys: ['calcium'], drvKey: 'calcium' },
    fe: { label: 'Ferro', unit: 'mg', group: 'Micronutrienti', keys: ['iron'], drvKey: 'iron' },
    mg: { label: 'Magnesio', unit: 'mg', group: 'Micronutrienti', keys: ['magnesium'], drvKey: 'magnesium' },
    zn: { label: 'Zinco', unit: 'mg', group: 'Micronutrienti', keys: ['zinc'], drvKey: 'zinc' },
    k: { label: 'Potassio', unit: 'mg', group: 'Micronutrienti', keys: ['potassium'], drvKey: 'potassium' },
    na: { label: 'Sodio', unit: 'mg', group: 'Micronutrienti', keys: ['sodium'], drvKey: 'sodium' },
    se: { label: 'Selenio', unit: 'μg', group: 'Micronutrienti', keys: ['selenium'], drvKey: 'selenium' },
    cu: { label: 'Rame', unit: 'mg', group: 'Micronutrienti', keys: ['copper'], drvKey: 'copper' },
    iod: { label: 'Iodio', unit: 'μg', group: 'Micronutrienti', keys: ['iodine'], drvKey: 'iodine' },
    micro_panel: { label: 'Pannello Minerali Completo', unit: 'mg', group: 'Micronutrienti', aggregation: 'micro_panel' },

    // ── VITAMINE ──────────────────────────────────────────────────────────────
    vitA: { label: 'Vitamina A (RE)', unit: 'μg', group: 'Vitamine', keys: ['vitamin_a_retinol_equivalent'], drvKey: 'vitamin_a_retinol_equivalent' },
    vitC: { label: 'Vitamina C', unit: 'mg', group: 'Vitamine', keys: ['vitamin_c'], drvKey: 'vitamin_c' },
    vitD: { label: 'Vitamina D', unit: 'μg', group: 'Vitamine', keys: ['vitamin_d'], drvKey: 'vitamin_d' },
    vitE: { label: 'Vitamina E', unit: 'mg', group: 'Vitamine', keys: ['vitamin_e'], drvKey: 'vitamin_e' },
    vitK: { label: 'Vitamina K', unit: 'μg', group: 'Vitamine', keys: ['vitamin_k'], drvKey: 'vitamin_k' },
    vitB6: { label: 'Vitamina B6', unit: 'mg', group: 'Vitamine', keys: ['vitamin_b6'], drvKey: 'vitamin_b6' },
    vitB12: { label: 'Vitamina B12', unit: 'μg', group: 'Vitamine', keys: ['vitamin_b12'], drvKey: 'vitamin_b12' },
    fol: { label: 'Folato', unit: 'μg', group: 'Vitamine', keys: ['folate'], drvKey: 'folate' },
    niac: { label: 'Niacina', unit: 'mg', group: 'Vitamine', keys: ['niacin'], drvKey: 'niacin' },
    thia: { label: 'Tiamina (B1)', unit: 'mg', group: 'Vitamine', keys: ['thiamine'], drvKey: 'thiamine' },
    ribo: { label: 'Riboflavina (B2)', unit: 'mg', group: 'Vitamine', keys: ['riboflavin'], drvKey: 'riboflavin' },
    vita_panel: { label: 'Pannello Vitamine Completo', unit: 'varie', group: 'Vitamine', aggregation: 'vita_panel' },

    // ── BIOATTIVI & FITOCOMPOSTI ───────────────────────────────────────────────
    polyphen: { label: 'Polifenoli Totali', unit: 'mg', group: 'Bioattivi', keys: ['polyphenols'] },
    lyco: { label: 'Licopene', unit: 'mg', group: 'Bioattivi', keys: ['lycopene'] },
    lut: { label: 'Luteina + Zeaxantina', unit: 'mg', group: 'Bioattivi', keys: ['lutein', 'zeaxanthin'] },
    betacar: { label: 'β-Carotene', unit: 'mg', group: 'Bioattivi', keys: ['beta_carotene'] },
    quer: { label: 'Quercetina', unit: 'mg', group: 'Bioattivi', keys: ['quercetin'] },
    phytos: { label: 'Fitosteroli', unit: 'mg', group: 'Bioattivi', keys: ['phytosterols'] },
    bio_panel: { label: 'Pannello Bioattivi', unit: 'mg', group: 'Bioattivi', aggregation: 'bio_panel' },

    // ── ANALISI DRV ──────────────────────────────────────────────────────────
    drv_radar: { label: 'Radar Copertura DRV (%)', unit: '%', group: 'Analisi DRV', aggregation: 'drv_radar' },
};
