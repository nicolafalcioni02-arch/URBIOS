import { LAB_KEYS, labOf } from './labLogic';

// Dati di esempio per provare il Laboratorio (aspetto, stampa, Excel). Si caricano dalla Panoramica quando il laboratorio è vuoto.
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const exampleLab = () => {
    const sop = 'ex_prt_1';
    return {
        protocolli: [
            {
                id: sop, titolo: 'Estrazione di DNA da sangue intero', codice: 'SOP-012', categoria: 'Biologia molecolare', versione: '2.1', data: day(-40), stato: 'In vigore', autore: 'M. Rossi',
                scopo: 'Estrazione di DNA genomico da 200 µL di sangue intero in EDTA per PCR e sequenziamento.',
                materiali: [
                    { nome: 'Sangue intero in EDTA', quantita: '200', unita: 'µL', note: '' },
                    { nome: 'Proteinasi K', quantita: '20', unita: 'µL', note: '20 mg/mL' },
                    { nome: 'Tampone di lisi AL', quantita: '200', unita: 'µL', note: '' },
                    { nome: 'Etanolo 96-100%', quantita: '200', unita: 'µL', note: '' },
                ],
                passaggi: [
                    { testo: 'Aggiungere 20 µL di proteinasi K a una provetta da 1,5 mL e 200 µL di campione.', durata: '' },
                    { testo: 'Aggiungere 200 µL di tampone AL, agitare al vortex per 15 s.', durata: '15 s' },
                    { testo: 'Incubare a 56 °C.', durata: '10 min' },
                    { testo: 'Aggiungere 200 µL di etanolo, mescolare, trasferire sulla colonnina.', durata: '' },
                    { testo: 'Centrifugare a 6000 × g, lavare due volte ed eluire in 100 µL di tampone AE.', durata: '5 min' },
                ],
                sicurezza: 'Camice, guanti e occhiali. Campioni biologici come potenzialmente infetti. Smaltire i puntali nei rifiuti a rischio biologico.',
                riferimenti: 'Istruzioni del kit del fornitore, rev. 2023.', note: '',
            },
            {
                id: 'ex_prt_2', titolo: 'Western blot: trasferimento su membrana', codice: 'SOP-018', categoria: 'Proteine', versione: '1.0', data: day(-5), stato: 'Bozza', autore: 'L. Bianchi',
                scopo: 'Trasferimento di proteine da gel SDS-PAGE a membrana PVDF.',
                materiali: [{ nome: 'Membrana PVDF', quantita: '1', unita: 'pz', note: '0,45 µm' }, { nome: 'Tampone di trasferimento', quantita: '1', unita: 'L', note: '' }],
                passaggi: [{ testo: 'Attivare la membrana in metanolo.', durata: '30 s' }, { testo: 'Assemblare il sandwich ed eseguire il trasferimento a 100 V.', durata: '1 h' }],
                sicurezza: 'Il metanolo è tossico e infiammabile: lavorare sotto cappa.', riferimenti: '', note: '',
            },
        ],
        quaderno: [
            {
                id: 'ex_qdl_1', titolo: 'Curva di crescita E. coli DH5α', codice: 'QL-2026-014', data: day(-3), progetto: 'Colture batteriche', stato: 'Concluso', operatore: 'M. Rossi', protocolloId: '',
                obiettivo: 'Determinare la fase esponenziale della crescita in LB a 37 °C per stabilire il momento migliore per la trasformazione.',
                materiali: [
                    { nome: 'Terreno LB', quantita: '50', unita: 'mL', note: 'lotto 240912' },
                    { nome: 'Inoculo overnight', quantita: '500', unita: 'µL', note: '' },
                ],
                figure: [
                    { nome: 'Crescita di E. coli nel tempo (OD600)', note: 'Media di tre repliche.', chart: { type: 'line', title: 'Curva di crescita', xLabel: 'Tempo (h)', yLabel: 'OD600', cats: ['0', '1', '2', '3', '4', '5', '6'], series: [{ name: 'Replica media', vals: ['0.05', '0.08', '0.21', '0.52', '0.98', '1.35', '1.48'] }] } },
                    { nome: 'Confronto tra terreni a 4 h', note: '', chart: { type: 'bar', title: 'OD600 a 4 h', xLabel: 'Terreno', yLabel: 'OD600', cats: ['LB', 'TB', 'SOC'], series: [{ name: 'OD600', vals: ['0.98', '1.42', '1.21'] }] } },
                ],
                procedura: 'Seguita la procedura standard. Letture di OD600 ogni ora. Nessuna deviazione, salvo agitazione a 220 rpm invece di 200.',
                osservazioni: 'Fase di latenza di circa 1 h, poi crescita esponenziale fino a 5 h.',
                risultati: 'Tempo di raddoppio stimato 28 min. Fase esponenziale tra 2 h e 5 h.',
                conclusioni: 'La trasformazione va eseguita con cellule a OD600 0,4-0,6, cioè dopo circa 3 h.',
                prossimi: 'Ripetere con terreno TB e confrontare l’efficienza di trasformazione.', verificatoDa: 'Dott. Verdi', dataVerifica: day(-2),
            },
            {
                id: 'ex_qdl_2', titolo: 'Estrazione DNA da 12 campioni di sangue', codice: 'QL-2026-015', data: day(-1), progetto: 'Genotipizzazione', stato: 'In corso', operatore: 'L. Bianchi', protocolloId: sop,
                obiettivo: 'Ottenere DNA di qualità per PCR (A260/280 tra 1,8 e 2,0).',
                materiali: [{ nome: 'Kit estrazione DNA', quantita: '12', unita: 'prep', note: 'lotto K2209' }, { nome: 'Provette 1,5 mL', quantita: '24', unita: 'pz', note: '' }],
                figure: [{ nome: 'Resa del DNA per campione', note: '', chart: { type: 'pie', title: 'Quota di resa', xLabel: '', yLabel: '', cats: ['Alta', 'Media', 'Bassa'], series: [{ name: 'Campioni', vals: ['7', '4', '1'] }] } }],
                procedura: 'Eseguiti 12 campioni in due sessioni da 6.', osservazioni: 'Il campione 9 presentava emolisi evidente.', risultati: '', conclusioni: '', prossimi: 'Misurare la concentrazione al NanoDrop.', verificatoDa: '', dataVerifica: '',
            },
            {
                id: 'ex_qdl_3', titolo: 'Test di specificità dei primer', codice: 'QL-2026-016', data: day(0), progetto: 'Genotipizzazione', stato: 'Da ripetere', operatore: 'M. Rossi', protocolloId: '',
                obiettivo: 'Verificare l’assenza di bande aspecifiche.', materiali: [], figure: [],
                procedura: '', osservazioni: 'Banda aspecifica a circa 300 bp.', risultati: '', conclusioni: '', prossimi: 'Alzare la temperatura di annealing a 60 °C.', verificatoDa: '', dataVerifica: '',
            },
        ],
        reagenti: [
            {
                id: 'ex_rea_1', nome: 'Tampone TAE 50×', categoria: 'Tamponi', solvente: 'Acqua deionizzata', volumeFinale: '1000', unitaVolume: 'mL', ph: '8,3', concentrazione: '50×',
                componenti: [
                    { nome: 'Tris base', quantita: '242', unita: 'g', note: 'PM 121,14' },
                    { nome: 'Acido acetico glaciale', quantita: '57,1', unita: 'mL', note: '' },
                    { nome: 'EDTA 0,5 M pH 8', quantita: '100', unita: 'mL', note: '' },
                ],
                passaggi: [{ testo: 'Sciogliere il Tris in 700 mL di acqua.', durata: '' }, { testo: 'Aggiungere acido acetico ed EDTA, portare a volume.', durata: '' }],
                conservazione: 'Temperatura ambiente', validita: '6 mesi', sicurezza: 'L’acido acetico è corrosivo: usare i guanti.', note: 'Diluire 1:50 prima dell’uso.',
            },
            {
                id: 'ex_rea_2', nome: 'Terreno LB', categoria: 'Terreni', solvente: 'Acqua deionizzata', volumeFinale: '1', unitaVolume: 'L', ph: '7,0', concentrazione: '',
                componenti: [{ nome: 'Triptone', quantita: '10', unita: 'g', note: '' }, { nome: 'Estratto di lievito', quantita: '5', unita: 'g', note: '' }, { nome: 'NaCl', quantita: '10', unita: 'g', note: '' }],
                passaggi: [{ testo: 'Sciogliere i componenti, portare a volume e sterilizzare in autoclave.', durata: '20 min' }],
                conservazione: '4 °C', validita: '3 mesi', sicurezza: '', note: '',
            },
        ],
        magazzino: [
            { id: 'ex_mag_1', nome: 'Proteinasi K', codice: 'P2308', fornitore: 'Sigma-Aldrich', categoria: 'Enzimi', lotto: 'SLCD1234', quantita: '4', unita: 'mL', sogliaMin: '2', scadenza: day(400), apertura: day(-60), posizione: 'Freezer -20 °C, ripiano 2', conservazione: '-20 °C', pericolo: 'H334', note: '' },
            { id: 'ex_mag_2', nome: 'Etanolo assoluto', codice: 'E7023', fornitore: 'Carlo Erba', categoria: 'Solventi', lotto: 'L2201', quantita: '1', unita: 'L', sogliaMin: '2', scadenza: day(200), apertura: '', posizione: 'Armadio infiammabili', conservazione: 'Temperatura ambiente', pericolo: 'H225, H319', note: '' },
            { id: 'ex_mag_3', nome: 'Taq polimerasi', codice: 'M0273', fornitore: 'NEB', categoria: 'Enzimi', lotto: 'T0821', quantita: '500', unita: 'U', sogliaMin: '100', scadenza: day(18), apertura: day(-90), posizione: 'Freezer -20 °C, ripiano 1', conservazione: '-20 °C', pericolo: '', note: '' },
            { id: 'ex_mag_4', nome: 'Agarosio', codice: 'A9539', fornitore: 'Sigma-Aldrich', categoria: 'Elettroforesi', lotto: 'SLBX9981', quantita: '250', unita: 'g', sogliaMin: '50', scadenza: day(-12), apertura: day(-400), posizione: 'Scaffale B', conservazione: 'Temperatura ambiente', pericolo: '', note: 'Da smaltire.' },
        ],
        campioni: [
            { id: 'ex_cmp_1', codice: 'CMP-0142', tipo: 'Siero', descrizione: 'Paziente di controllo, prelievo a digiuno', data: day(-6), origine: 'Reparto di Medicina', stato: 'Analizzato', posizione: 'Freezer -80 °C, rack 3', conservazione: '-80 °C', protocolloId: sop, operatore: 'L. Bianchi', risultati: 'DNA 48 ng/µL, A260/280 1,87.', note: '' },
            { id: 'ex_cmp_2', codice: 'CMP-0143', tipo: 'Sangue intero', descrizione: 'Emolisi visibile', data: day(-2), origine: 'Reparto di Medicina', stato: 'In lavorazione', posizione: 'Frigo 4 °C', conservazione: '4 °C', protocolloId: sop, operatore: 'M. Rossi', risultati: '', note: '' },
            { id: 'ex_cmp_3', codice: 'CMP-0144', tipo: 'Urina', descrizione: '', data: day(0), origine: 'Ambulatorio', stato: 'Ricevuto', posizione: '', conservazione: '', protocolloId: '', operatore: '', risultati: '', note: '' },
        ],
        articoli: [
            { id: 'ex_art_1', titolo: 'A simple salting out procedure for extracting DNA from human nucleated cells', autori: 'Miller SA, Dykes DD, Polesky HF', rivista: 'Nucleic Acids Research', anno: '1988', doi: '10.1093/nar/16.3.1215', pmid: '3344216', url: '', lettura: 'Letto', tag: 'DNA, estrazione', protocolloId: sop, riassunto: 'Metodo rapido e senza solventi organici per estrarre DNA dai leucociti.', appunti: 'Alla base della nostra procedura.' },
            { id: 'ex_art_2', titolo: 'Optimizing primer annealing temperature in PCR', autori: 'Rychlik W, Spencer WJ, Rhoads RE', rivista: 'Nucleic Acids Research', anno: '1990', doi: '', pmid: '', url: '', lettura: 'Da leggere', tag: 'PCR, primer', protocolloId: '', riassunto: '', appunti: '' },
        ],
    };
};

export const labIsEmpty = (lab) => LAB_KEYS.every((k) => !lab[k].length);

export const loadExample = (onUpdateDb) => onUpdateDb((prev) => ({ ...prev, lab: { ...(prev.lab || {}), ...exampleLab() } }));
