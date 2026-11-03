import { daysTo, fmtDay, stockState } from './labLogic';

// REGISTRO delle sezioni del Laboratorio. Per aggiungere un campo o una sezione si tocca solo qui.
// Tipi di campo: text, area, number, date, select(options), steps (elenco di passaggi), rows(cols: tabella di righe)
// list: cosa mostra la scheda nell'elenco. xlsx: colonne del foglio Excel (tutti i campi + stato).

const join = (a) => (a || []).map((r) => [r.nome, [r.quantita, r.unita].filter(Boolean).join(' ')].filter(Boolean).join(' ')).join(' · ');
const stepsText = (a) => (a || []).map((s, i) => `${i + 1}. ${s.testo}${s.durata ? ` (${s.durata})` : ''}`).join('\n');
const textOf = (r) => JSON.stringify(r).toLowerCase();

export const SECTIONS = [
    {
        key: 'protocolli',
        label: 'Protocolli',
        single: 'protocollo',
        icon: 'ph-list-checks',
        hint: 'Procedure operative standard con passaggi, materiali e versione.',
        prefix: 'prt',
        title: (r) => r.titolo || 'Protocollo senza titolo',
        sub: (r) => [r.codice, r.categoria, r.versione && `v. ${r.versione}`].filter(Boolean).join(' · '),
        badge: (r) => (r.stato ? { label: r.stato, tone: r.stato === 'In vigore' ? 'ok' : r.stato === 'Archiviato' ? 'muted' : 'warn' } : null),
        empty: () => ({ stato: 'Bozza', versione: '1.0', data: new Date().toISOString().slice(0, 10), materiali: [], passaggi: [] }),
        fields: [
            { key: 'titolo', label: 'Titolo', type: 'text', full: true },
            { key: 'codice', label: 'Codice (es. SOP-012)', type: 'text' },
            { key: 'categoria', label: 'Categoria', type: 'text', list: 'categorie' },
            { key: 'versione', label: 'Versione', type: 'text' },
            { key: 'data', label: 'Data revisione', type: 'date' },
            { key: 'stato', label: 'Stato', type: 'select', options: ['Bozza', 'In vigore', 'Archiviato'] },
            { key: 'autore', label: 'Redatto da', type: 'text' },
            { key: 'scopo', label: 'Scopo e campo di applicazione', type: 'area', full: true },
            { key: 'materiali', label: 'Materiali, reagenti e strumenti', type: 'rows', cols: [{ key: 'nome', label: 'Voce', w: 3 }, { key: 'quantita', label: 'Quantità', w: 1 }, { key: 'unita', label: 'Unità', w: 1 }, { key: 'note', label: 'Note', w: 2 }], full: true },
            { key: 'passaggi', label: 'Procedura', type: 'steps', full: true },
            { key: 'sicurezza', label: 'Sicurezza e smaltimento', type: 'area', full: true },
            { key: 'riferimenti', label: 'Riferimenti e bibliografia', type: 'area', full: true },
            { key: 'note', label: 'Note', type: 'area', full: true },
        ],
        search: textOf,
        xlsx: [
            ['codice', 'Codice', 14], ['titolo', 'Titolo', 36], ['categoria', 'Categoria', 18], ['versione', 'Versione', 10], ['data', 'Data revisione', 14], ['stato', 'Stato', 12], ['autore', 'Redatto da', 18],
            ['scopo', 'Scopo', 40], ['materiali', 'Materiali', 40, (r) => join(r.materiali)], ['passaggi', 'Procedura', 60, (r) => stepsText(r.passaggi)], ['sicurezza', 'Sicurezza', 30], ['riferimenti', 'Riferimenti', 30], ['note', 'Note', 30],
        ],
    },
    {
        key: 'reagenti',
        label: 'Ricettario',
        single: 'ricetta',
        icon: 'ph-flask',
        hint: 'Soluzioni, tamponi e terreni con componenti, volume finale e conservazione.',
        prefix: 'rea',
        title: (r) => r.nome || 'Soluzione senza nome',
        sub: (r) => [r.categoria, r.volumeFinale && `${r.volumeFinale} ${r.unitaVolume || 'mL'}`, r.ph && `pH ${r.ph}`].filter(Boolean).join(' · '),
        badge: () => null,
        empty: () => ({ unitaVolume: 'mL', componenti: [], passaggi: [] }),
        fields: [
            { key: 'nome', label: 'Nome', type: 'text', full: true },
            { key: 'categoria', label: 'Categoria (tampone, terreno…)', type: 'text', list: 'categorie' },
            { key: 'solvente', label: 'Solvente', type: 'text' },
            { key: 'volumeFinale', label: 'Volume finale', type: 'number' },
            { key: 'unitaVolume', label: 'Unità', type: 'select', options: ['mL', 'L', 'µL'] },
            { key: 'ph', label: 'pH', type: 'text' },
            { key: 'concentrazione', label: 'Concentrazione finale', type: 'text' },
            { key: 'componenti', label: 'Componenti', type: 'rows', cols: [{ key: 'nome', label: 'Componente', w: 3 }, { key: 'quantita', label: 'Quantità', w: 1 }, { key: 'unita', label: 'Unità', w: 1 }, { key: 'note', label: 'Note (PM, lotto…)', w: 2 }], full: true },
            { key: 'passaggi', label: 'Preparazione', type: 'steps', full: true },
            { key: 'conservazione', label: 'Conservazione', type: 'text' },
            { key: 'validita', label: 'Validità (es. 6 mesi a 4 °C)', type: 'text' },
            { key: 'sicurezza', label: 'Sicurezza', type: 'area', full: true },
            { key: 'note', label: 'Note', type: 'area', full: true },
        ],
        search: textOf,
        xlsx: [
            ['nome', 'Nome', 30], ['categoria', 'Categoria', 18], ['solvente', 'Solvente', 14], ['volumeFinale', 'Volume finale', 12, (r) => (Number(String(r.volumeFinale).replace(',', '.')) || r.volumeFinale || '')], ['unitaVolume', 'Unità', 8], ['ph', 'pH', 8], ['concentrazione', 'Concentrazione', 16],
            ['componenti', 'Componenti', 50, (r) => join(r.componenti)], ['passaggi', 'Preparazione', 60, (r) => stepsText(r.passaggi)], ['conservazione', 'Conservazione', 18], ['validita', 'Validità', 18], ['sicurezza', 'Sicurezza', 30], ['note', 'Note', 30],
        ],
    },
    {
        key: 'magazzino',
        label: 'Magazzino',
        single: 'articolo',
        icon: 'ph-package',
        hint: 'Reagenti e consumabili con lotto, scadenza e scorta minima.',
        prefix: 'mag',
        title: (r) => r.nome || 'Articolo senza nome',
        sub: (r) => [r.quantita !== undefined && r.quantita !== '' && `${r.quantita} ${r.unita || ''}`.trim(), r.lotto && `lotto ${r.lotto}`, r.scadenza && `scad. ${fmtDay(r.scadenza)}`].filter(Boolean).join(' · '),
        badge: (r) => stockState(r),
        empty: () => ({ unita: 'pz' }),
        fields: [
            { key: 'nome', label: 'Nome', type: 'text', full: true },
            { key: 'codice', label: 'Codice catalogo', type: 'text' },
            { key: 'fornitore', label: 'Fornitore', type: 'text' },
            { key: 'categoria', label: 'Categoria', type: 'text', list: 'categorie' },
            { key: 'lotto', label: 'Lotto', type: 'text' },
            { key: 'quantita', label: 'Quantità', type: 'number' },
            { key: 'unita', label: 'Unità', type: 'text' },
            { key: 'sogliaMin', label: 'Scorta minima', type: 'number' },
            { key: 'scadenza', label: 'Scadenza', type: 'date' },
            { key: 'apertura', label: 'Data di apertura', type: 'date' },
            { key: 'posizione', label: 'Posizione (frigo, scaffale…)', type: 'text' },
            { key: 'conservazione', label: 'Conservazione', type: 'text' },
            { key: 'pericolo', label: 'Pericolo / frasi H', type: 'text' },
            { key: 'note', label: 'Note', type: 'area', full: true },
        ],
        search: textOf,
        xlsx: [
            ['nome', 'Nome', 30], ['codice', 'Codice catalogo', 16], ['fornitore', 'Fornitore', 18], ['categoria', 'Categoria', 16], ['lotto', 'Lotto', 14], ['quantita', 'Quantità', 10, (r) => (Number(String(r.quantita).replace(',', '.')) || r.quantita || '')], ['unita', 'Unità', 8],
            ['sogliaMin', 'Scorta minima', 12, (r) => (Number(String(r.sogliaMin).replace(',', '.')) || r.sogliaMin || '')], ['scadenza', 'Scadenza', 12], ['giorni', 'Giorni alla scadenza', 12, (r) => daysTo(r.scadenza) ?? ''], ['apertura', 'Aperto il', 12], ['posizione', 'Posizione', 18], ['conservazione', 'Conservazione', 16], ['pericolo', 'Pericolo', 16],
            ['stato', 'Stato', 14, (r) => stockState(r).label], ['note', 'Note', 30],
        ],
    },
    {
        key: 'campioni',
        label: 'Campioni',
        single: 'campione',
        icon: 'ph-test-tube',
        hint: 'Registro dei campioni con codice, stato, posizione e protocollo applicato.',
        prefix: 'cmp',
        title: (r) => r.codice || 'Campione senza codice',
        sub: (r) => [r.tipo, r.descrizione, r.data && fmtDay(r.data)].filter(Boolean).join(' · '),
        badge: (r) => (r.stato ? { label: r.stato, tone: r.stato === 'Analizzato' ? 'ok' : r.stato === 'In lavorazione' ? 'warn' : 'muted' } : null),
        empty: () => ({ stato: 'Ricevuto', data: new Date().toISOString().slice(0, 10) }),
        fields: [
            { key: 'codice', label: 'Codice campione', type: 'text' },
            { key: 'tipo', label: 'Tipo / matrice (siero, urina…)', type: 'text', list: 'categorie' },
            { key: 'descrizione', label: 'Descrizione', type: 'text', full: true },
            { key: 'data', label: 'Data di ricezione', type: 'date' },
            { key: 'origine', label: 'Origine / richiedente', type: 'text' },
            { key: 'stato', label: 'Stato', type: 'select', options: ['Ricevuto', 'In lavorazione', 'Analizzato', 'Archiviato', 'Smaltito'] },
            { key: 'posizione', label: 'Posizione (freezer, rack…)', type: 'text' },
            { key: 'conservazione', label: 'Conservazione', type: 'text' },
            { key: 'protocolloId', label: 'Protocollo applicato', type: 'ref', from: 'protocolli' },
            { key: 'operatore', label: 'Operatore', type: 'text' },
            { key: 'risultati', label: 'Risultati', type: 'area', full: true },
            { key: 'note', label: 'Note', type: 'area', full: true },
        ],
        search: textOf,
        xlsx: [
            ['codice', 'Codice', 16], ['tipo', 'Tipo', 16], ['descrizione', 'Descrizione', 30], ['data', 'Data ricezione', 14], ['origine', 'Origine', 18], ['stato', 'Stato', 14], ['posizione', 'Posizione', 18], ['conservazione', 'Conservazione', 16],
            ['protocollo', 'Protocollo', 28, (r, lab) => (lab.protocolli.find((p) => p.id === r.protocolloId) || {}).titolo || ''], ['operatore', 'Operatore', 16], ['risultati', 'Risultati', 40], ['note', 'Note', 30],
        ],
    },
];

export const sectionOf = (key) => SECTIONS.find((s) => s.key === key);

// fogli Excel di una o di tutte le sezioni
export const sheetsFor = (lab, keys = SECTIONS.map((s) => s.key)) =>
    keys.map((k) => {
        const s = sectionOf(k);
        return {
            name: s.label,
            columns: s.xlsx.map(([key, label, width]) => ({ key, label, width })),
            rows: lab[k].map((r) => Object.fromEntries(s.xlsx.map(([key, , , fn]) => [key, fn ? fn(r, lab) : r[key] ?? '']))),
        };
    });
