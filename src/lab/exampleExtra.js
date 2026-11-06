// Altri file inventati per il Laboratorio (24 voci), uniti a quelli di exampleData.js.
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const m = (nome, quantita, unita, note = '') => ({ nome, quantita, unita, note });
const p = (testo, durata = '') => ({ testo, durata });

const prt = (n, titolo, codice, categoria, versione, d, stato, autore, scopo, materiali, passaggi, sicurezza = '') => ({
    id: `ex_prt_${n}`, titolo, codice, categoria, versione, data: day(d), stato, autore, scopo, materiali, passaggi, sicurezza, riferimenti: '', note: '',
});

const qdl = (n, titolo, d, progetto, stato, operatore, obiettivo, osservazioni = '', risultati = '', prossimi = '') => ({
    id: `ex_qdl_${n}`, titolo, codice: `QL-2026-${String(13 + n).padStart(3, '0')}`, data: day(d), progetto, stato, operatore, protocolloId: '',
    obiettivo, materiali: [], figure: [], procedura: '', osservazioni, risultati, conclusioni: '', prossimi, verificatoDa: '', dataVerifica: '',
});

const rea = (n, nome, categoria, solvente, vol, uv, ph, conc, componenti, conservazione, validita, note = '') => ({
    id: `ex_rea_${n}`, nome, categoria, solvente, volumeFinale: vol, unitaVolume: uv, ph, concentrazione: conc, componenti,
    passaggi: [p('Pesare i componenti, sciogliere in circa 80% del volume e portare a volume.')], conservazione, validita, sicurezza: '', note,
});

const mag = (n, nome, marca, cas, codice, categoria, quantita, unita, soglia, scad, pos, cons, pericolo = '') => ({
    id: `ex_mag_${n}`, numero: String(n), marca, cas, dataArrivo: day(-30 - n * 17), ordine: `DDT-22${String(n).padStart(2, '0')}`, prezzo: String(20 + n * 13),
    nome, codice, fornitore: marca, categoria, lotto: `L${2200 + n}`, quantita, unita, sogliaMin: soglia, scadenza: day(scad), apertura: '', posizione: pos, conservazione: cons, pericolo, note: '',
});

const cmp = (n, tipo, descrizione, d, origine, stato, posizione, conservazione, operatore) => ({
    id: `ex_cmp_${n}`, codice: `CMP-0${141 + n}`, tipo, descrizione, data: day(d), origine, stato, posizione, conservazione, protocolloId: '', operatore, risultati: '', note: '',
});

const art = (n, titolo, autori, rivista, anno, lettura, tag, riassunto = '') => ({
    id: `ex_art_${n}`, titolo, autori, rivista, anno, doi: '', pmid: '', url: '', lettura, tag, protocolloId: '', riassunto, appunti: '',
});

export const extraLab = () => ({
    protocolli: [
        prt(3, 'PCR end-point con Taq polimerasi', 'SOP-021', 'Biologia molecolare', '1.2', -30, 'In vigore', 'M. Rossi', 'Amplificazione di un frammento di 500 bp da DNA genomico.', [m('DNA stampo', '2', 'µL'), m('Taq polimerasi', '0,25', 'µL'), m('Primer F/R 10 µM', '1', 'µL', 'ciascuno')], [p('Preparare la mix su ghiaccio.'), p('Denaturazione iniziale a 95 °C.', '3 min'), p('30 cicli: 95 °C, 58 °C, 72 °C.', '1 h 30 min')]),
        prt(4, 'Elettroforesi su gel di agarosio', 'SOP-022', 'Elettroforesi', '1.0', -28, 'In vigore', 'L. Bianchi', 'Separazione di frammenti di DNA su gel all’1,5%.', [m('Agarosio', '1,5', 'g'), m('TAE 1×', '100', 'mL'), m('Colorante per DNA', '5', 'µL')], [p('Sciogliere l’agarosio nel TAE al microonde.', '2 min'), p('Colare il gel e attendere la solidificazione.', '30 min'), p('Caricare i campioni e correre a 100 V.', '40 min')], 'Il colorante del DNA è mutageno: guanti sempre.'),
        prt(5, 'Trasformazione di E. coli per shock termico', 'SOP-025', 'Colture batteriche', '2.0', -20, 'In vigore', 'M. Rossi', 'Introduzione di plasmide in cellule competenti DH5α.', [m('Cellule competenti', '50', 'µL'), m('Plasmide', '1', 'µL'), m('Terreno SOC', '950', 'µL')], [p('Scongelare le cellule su ghiaccio.', '10 min'), p('Shock termico a 42 °C.', '45 s'), p('Recupero a 37 °C in SOC.', '1 h')]),
        prt(6, 'Quantificazione proteica con Bradford', 'SOP-030', 'Proteine', '1.1', -12, 'Revisione', 'L. Bianchi', 'Misura della concentrazione proteica a 595 nm.', [m('Reattivo di Bradford', '1', 'mL'), m('BSA standard', '10', 'µL')], [p('Preparare la curva standard con BSA.'), p('Aggiungere il reattivo e incubare.', '5 min'), p('Leggere l’assorbanza a 595 nm.')]),
    ],
    quaderno: [
        qdl(4, 'Titolazione dell’anticorpo primario', -9, 'Western blot', 'Concluso', 'L. Bianchi', 'Trovare la diluizione ottimale tra 1:500 e 1:5000.', 'Miglior segnale a 1:2000.', 'Diluizione scelta 1:2000.'),
        qdl(5, 'PCR gradiente di annealing', -8, 'Genotipizzazione', 'Concluso', 'M. Rossi', 'Individuare la temperatura di annealing con una sola banda.', 'Una sola banda a 60 °C.', 'Annealing a 60 °C.'),
        qdl(6, 'Preparazione di cellule competenti', -7, 'Colture batteriche', 'Concluso', 'M. Rossi', 'Produrre 40 aliquote da 50 µL con il metodo del CaCl2.', 'Cellule a OD600 0,45 al momento della raccolta.'),
        qdl(7, 'Sequenziamento del plasmide pUC-A', -5, 'Clonaggio', 'In corso', 'L. Bianchi', 'Confermare l’inserto con sequenziamento Sanger.', 'Campioni inviati.', '', 'Analizzare i cromatogrammi.'),
        qdl(8, 'Test di stabilità della Taq a 4 °C', -4, 'Controllo qualità', 'In corso', 'M. Rossi', 'Verificare l’attività dopo 7 giorni a 4 °C.', '', '', 'Ripetere il test a 14 giorni.'),
        qdl(9, 'Digestione con EcoRI e BamHI', -2, 'Clonaggio', 'Da ripetere', 'L. Bianchi', 'Digerire 1 µg di plasmide e verificare su gel.', 'Digestione incompleta.', '', 'Prolungare l’incubazione a 2 h.'),
    ],
    reagenti: [
        rea(3, 'PBS 10×', 'Tamponi', 'Acqua deionizzata', '1', 'L', '7,4', '10×', [m('NaCl', '80', 'g'), m('KCl', '2', 'g'), m('Na2HPO4', '14,4', 'g'), m('KH2PO4', '2,4', 'g')], 'Temperatura ambiente', '12 mesi', 'Diluire 1:10.'),
        rea(4, 'Tampone di caricamento 6×', 'Elettroforesi', 'Acqua deionizzata', '10', 'mL', '', '6×', [m('Glicerolo', '3', 'mL'), m('Blu di bromofenolo', '25', 'mg'), m('EDTA 0,5 M', '0,2', 'mL')], '4 °C', '6 mesi'),
        rea(5, 'Ampicillina 100 mg/mL', 'Antibiotici', 'Acqua sterile', '10', 'mL', '', '100 mg/mL', [m('Ampicillina sale sodico', '1', 'g')], '-20 °C', '3 mesi', 'Filtrare a 0,22 µm.'),
        rea(6, 'Tampone di lisi RIPA', 'Tamponi', 'Acqua deionizzata', '100', 'mL', '8,0', '1×', [m('Tris-HCl 1 M', '5', 'mL'), m('NaCl', '0,88', 'g'), m('Triton X-100', '1', 'mL')], '4 °C', '2 mesi', 'Aggiungere gli inibitori di proteasi al momento.'),
    ],
    magazzino: [
        mag(5, 'Tris base', 'Sigma-Aldrich', '77-86-1', 'T1503', 'Chimica di base', '500', 'g', '100', 600, 'Scaffale A', 'Temperatura ambiente'),
        mag(6, 'Acido acetico glaciale', 'Carlo Erba', '64-19-7', 'A0010', 'Acidi', '2', 'L', '1', 300, 'Armadio acidi', 'Temperatura ambiente', 'H226, H314'),
        mag(7, 'EDTA disodico', 'Sigma-Aldrich', '6381-92-6', 'E5134', 'Chimica di base', '250', 'g', '50', 700, 'Scaffale A', 'Temperatura ambiente'),
        mag(8, 'Ampicillina sale sodico', 'Sigma-Aldrich', '69-52-3', 'A9518', 'Antibiotici', '5', 'g', '2', 25, 'Freezer -20 °C, ripiano 3', '-20 °C', 'H317, H334'),
        mag(9, 'Marcatore di peso 1 kb', 'NEB', '', 'N3232', 'Elettroforesi', '250', 'µL', '100', 365, 'Frigo 4 °C', '4 °C'),
        mag(10, 'Puntali con filtro 200 µL', 'Gilson', '', 'F171503', 'Plastica', '4', 'rack', '2', 900, 'Armadio plastica', 'Temperatura ambiente'),
    ],
    campioni: [
        cmp(4, 'Plasma', 'Citrato, centrifugato', -5, 'Reparto di Ematologia', 'Analizzato', 'Freezer -80 °C, rack 1', '-80 °C', 'M. Rossi'),
        cmp(5, 'Coltura cellulare', 'HEK293, passaggio 12', -1, 'Linea interna', 'In lavorazione', 'Incubatore 37 °C', '37 °C', 'L. Bianchi'),
    ],
    articoli: [
        art(3, 'Molecular cloning: a laboratory manual', 'Green MR, Sambrook J', 'Cold Spring Harbor Laboratory Press', '2012', 'Letto', 'clonaggio, manuale', 'Riferimento per le procedure di biologia molecolare.'),
        art(4, 'Rapid and sensitive protein quantitation using the principle of protein-dye binding', 'Bradford MM', 'Analytical Biochemistry', '1976', 'Da leggere', 'proteine, Bradford'),
    ],
});
