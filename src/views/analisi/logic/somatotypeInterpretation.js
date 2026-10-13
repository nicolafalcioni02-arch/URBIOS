// =================================================================================
// ALGORITMO DI REFERTAZIONE CLINICA AVANZATA (HEATH-CARTER EXPERT SYSTEM)
// =================================================================================
export const generateAdvancedInterpretation = (endo, meso, ecto) => {
    const E = parseFloat(endo);
    const M = parseFloat(meso);
    const Ec = parseFloat(ecto);

    // 1. CALCOLO COORDINATE SOMATOCARTA
    const X = (Ec - E).toFixed(1);
    const Y = (2 * M - (E + Ec)).toFixed(1);

    // 2. DETERMINAZIONE CATEGORIA TASSONOMICA (13 TIPI DI HEATH-CARTER)
    let category = 'Indeterminato';
    const diff_EM = M - E;
    const diff_MEc = M - Ec;
    const diff_EEc = E - Ec;

    // Logica vettoriale per le 13 categorie
    if (E >= 3 && M >= 3 && Ec >= 3 && Math.abs(diff_EM) < 1 && Math.abs(diff_MEc) < 1 && Math.abs(diff_EEc) < 1) {
        category = 'Centrale (Medio)';
    } else if (M > E && M > Ec) {
        // Dominanza Mesomorfica
        if (E > Ec && E - Ec > 0.5) category = 'Mesomorfo Endomorfico';
        else if (Ec > E && Ec - E > 0.5) category = 'Mesomorfo Ectomorfico';
        else category = 'Mesomorfo Bilanciato';
    } else if (E > M && E > Ec) {
        // Dominanza Endomorfica
        if (M > Ec && M - Ec > 0.5) category = 'Endomorfo Mesomorfico';
        else if (Ec > M && Ec - M > 0.5) category = 'Endomorfo Ectomorfico';
        else category = 'Endomorfo Bilanciato';
    } else if (Ec > E && Ec > M) {
        // Dominanza Ectomorfica
        if (M > E && M - E > 0.5) category = 'Ectomorfo Mesomorfico';
        else if (E > M && E - M > 0.5) category = 'Ectomorfo Endomorfico';
        else category = 'Ectomorfo Bilanciato';
    } else if (M === E && M > Ec) {
        category = 'Mesomorfo-Endomorfo (Transizione)';
    } else if (M === Ec && M > E) {
        category = 'Mesomorfo-Ectomorfo (Transizione)';
    } else if (E === Ec && E > M) {
        category = 'Endomorfo-Ectomorfo (Raro)';
    }

    // 3. ANALISI QUALITATIVA DELLE COMPONENTI
    let analysis_endo = '';
    if (E < 2.5) analysis_endo = 'Bassa adiposità relativa, definizione muscolare facilitata.';
    else if (E >= 2.5 && E < 5) analysis_endo = 'Adiposità nella media, gestione ponderale standard.';
    else if (E >= 5 && E < 7) analysis_endo = "Elevata componente adiposa, tendenza all'accumulo sottocutaneo.";
    else analysis_endo = 'Estrema endomorfia, rischio metabolico aumentato, priorità alla gestione della composizione corporea.';

    let analysis_meso = '';
    if (M < 2.5) analysis_meso = 'Scarso sviluppo muscolo-scheletrico, struttura gracile.';
    else if (M >= 2.5 && M < 5) analysis_meso = 'Sviluppo muscolare nella norma.';
    else if (M >= 5 && M < 7) analysis_meso = "Notevole sviluppo muscolo-scheletrico, elevata predisposizione all'ipertrofia e alla forza.";
    else analysis_meso = 'Eccezionale sviluppo mesomorfico, potenziale atletico di alto livello.';

    let analysis_ecto = '';
    if (Ec < 2.5) analysis_ecto = 'Struttura compatta, segmenti corporei brevi, volume corporeo elevato rispetto alla superficie.';
    else if (Ec >= 2.5 && Ec < 5) analysis_ecto = 'Linearità corporea media.';
    else analysis_ecto = "Elevata linearità, segmenti lunghi, difficoltà nell'aumento di peso ponderale (Hardgainer).";

    // 4. STRATEGIA DI INTERVENTO SUGGERITA
    let strategy = '';

    if (category.includes('Endo') && !category.includes('Ecto')) {
        strategy =
            '• Nutrizione: Necessario controllo glucidico e deficit calorico ciclico.\n• Allenamento: Focus su alto volume metabolico e frequenza cardiaca media.';
    } else if (category.includes('Meso') && category.includes('Endo')) {
        strategy =
            '• Nutrizione: Carb-cycling per ottimizzare la sensibilità insulinica.\n• Allenamento: Combinazione forza/ipertrofia con conditioning finale.';
    } else if (category.includes('Meso') && !category.includes('Endo') && !category.includes('Ecto')) {
        strategy = '• Nutrizione: Bilanciata isocalorica o lieve surplus.\n• Allenamento: Risposta ottimale a stimoli di forza e ipertrofia standard.';
    } else if (category.includes('Ecto')) {
        strategy =
            '• Nutrizione: Surplus calorico costante, focus su densità nutrizionale.\n• Allenamento: Focus su intensità (carichi alti), volume moderato, recuperi completi.';
    } else {
        strategy = '• Nutrizione: Dieta bilanciata (zona o mediterranea).\n• Allenamento: Periodizzazione ondulata per stimolare diverse qualità fisiche.';
    }

    // 5. COSTRUZIONE REFERTO FINALE
    return `REFERTO ANALISI SOMATOTIPO (Metodo Heath-Carter)
--------------------------------------------------
DATI BIOMETRICI
• Punteggio: ${E.toFixed(1)} (Endo) - ${M.toFixed(1)} (Meso) - ${Ec.toFixed(1)} (Ecto)
• Coordinate Somatocarta: X= ${X}, Y= ${Y}

CLASSIFICAZIONE MORFOLOGICA
Il soggetto rientra nella categoria: **${category.toUpperCase()}**.

ANALISI COMPONENTI
1. Endomorfia (${E.toFixed(1)}): ${analysis_endo}
2. Mesomorfia (${M.toFixed(1)}): ${analysis_meso}
3. Ectomorfia (${Ec.toFixed(1)}): ${analysis_ecto}

INDICAZIONI OPERATIVE
${strategy}

NOTE CLINICHE
La collocazione nel somatocarta indica una struttura corporea con caratteristiche ${category.toLowerCase()}. Il monitoraggio nel tempo permetterà di valutare le migrazioni del punto somatografico in risposta al piano nutrizionale e motorio.`;
};
