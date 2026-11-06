// Compilazione dei protocolli con un'AI esterna (stesso schema di URBIOS AI): si copia il prompt, lo si incolla
// nell'AI scelta (ChatGPT, Claude, Gemini…), si incolla qui la risposta JSON. Funzioni pure.
export const FORMAT = 'URBIOS-LAB-PROTOCOLLO';
export const FORMAT_ART = 'URBIOS-LAB-ARTICOLO';
const CONDS = ['ice', 'hazard', 'none'];

// Scheda tecnica di un articolo di magazzino (reagente, kit, materiale): pericolo, conservazione, condizione nel lavoro, scheda
const buildArticlePrompt = (text, current = {}) => {
    const lab = { nome: 'Nome', codice: 'Codice catalogo', marca: 'Produttore', cas: 'N. CAS', categoria: 'Categoria', lotto: 'Lotto', conservazione: 'Conservazione', pericolo: 'Pericolo' };
    const known = Object.entries(lab).filter(([k]) => String(current[k] || '').trim()).map(([k, l]) => `${l}: ${current[k]}`).join('\n');
    const template = {
        format: FORMAT_ART,
        marca: '<produttore, solo se noto>',
        cas: '<numero CAS, solo se certo>',
        categoria: '<es. enzima, tampone, solvente, kit>',
        conservazione: '<temperatura e condizioni, es. -20 °C, al buio>',
        pericolo: '<frasi H e pittogrammi noti, es. H301, H350; vuoto se non pericoloso>',
        cond: '<ice se si tiene in ghiaccio durante l’uso | hazard se pericoloso | none; ometti se nessuna delle due>',
        scheda: '<scheda tecnica sintetica: Descrizione, Uso tipico, Stabilità e conservazione, Precauzioni e DPI, Smaltimento>',
        avvisi: ['<dati incerti da verificare sulla scheda di sicurezza del produttore>'],
    };
    return `Sei un assistente di laboratorio. Compila la scheda tecnica dell'articolo qui sotto, da importare nel software URBIOS (magazzino).

REGOLE:
1. Rispondi con UN SOLO blocco di codice JSON (\`\`\`json ... \`\`\`), senza testo prima o dopo e senza commenti nel JSON.
2. Usa SOLO le chiavi del formato qui sotto. Ometti ciò che non sai: NON inventare numeri CAS, frasi H o dati del produttore.
3. Scrivi in italiano, sintetico e tecnico. "scheda" è testo a righe con le voci indicate.
4. "cond": "hazard" se la sostanza è tossica, cancerogena, corrosiva, infiammabile o comunque pericolosa; "ice" se di norma si tiene in ghiaccio durante l'uso (enzimi, anticorpi, campioni); "none" se nessuna delle due. Se è pericolosa E va in ghiaccio, scegli "hazard".
5. Quello che è nella scheda del produttore (SDS) prevale su di te: segnala in "avvisi" di verificarla, soprattutto per pericolo e smaltimento.
${known ? `\nDATI GIÀ SCRITTI:\n${known}\n` : ''}
${String(text || '').trim() ? `ISTRUZIONI AGGIUNTIVE:\n${String(text).trim()}` : ''}

FORMATO DELLA RISPOSTA:
\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`
`;
};

export const buildPrompt = (text, current = {}, draft = false, kind = 'protocollo') => {
    if (kind === 'articolo') return buildArticlePrompt(text, current);
    const lab = { titolo: 'Titolo', categoria: 'Categoria', scopo: 'Scopo', sicurezza: 'Sicurezza', riferimenti: 'Riferimenti', note: 'Note' };
    const lines = Object.entries(lab).filter(([k]) => String(current[k] || '').trim()).map(([k, l]) => `${l}: ${current[k]}`);
    const mat = (current.materiali || []).filter((m) => m.nome).map((m) => `- ${[m.nome, [m.quantita, m.unita].filter(Boolean).join(' '), m.note, m.cond && `cond: ${m.cond}`, m.pericolo && `pericolo: ${m.pericolo}`].filter(Boolean).join(' | ')}`);
    const steps = (current.passaggi || []).filter((p) => p.testo).map((p, i) => `${i + 1}. ${p.testo}${p.durata ? ` (${p.durata})` : ''}`);
    const known = [...lines, mat.length && `Materiali:\n${mat.join('\n')}`, steps.length && `Procedura:\n${steps.join('\n')}`].filter(Boolean).join('\n');
    const template = {
        format: FORMAT,
        titolo: '<titolo breve del protocollo>',
        categoria: '<es. biologia molecolare, colture cellulari>',
        scopo: '<scopo e campo di applicazione, 1-3 frasi>',
        stanza: '<stanza o banco, solo se indicato>',
        posizioni: '<dove mettere campioni, ghiaccio, rifiuti, solo se indicato>',
        materiali: [{ nome: '<reagente, materiale o strumento>', quantita: '<numero>', unita: '<mL, g, µL…>', note: '<concentrazione, lotto, dettagli>', cond: '<ice | hazard | none, vedi regola 8>', pericolo: '<frasi H note, solo se hazard>', stanza: '<solo se in una stanza diversa>' }],
        passaggi: [{ testo: "<un’azione chiara per passaggio>", durata: '<es. 10 min, overnight>', note: '<avvertenza o dettaglio del passaggio>', stanza: '<solo se in una stanza diversa>' }],
        sicurezza: '<DPI, rischi, smaltimento>',
        riferimenti: '<fonti e bibliografia>',
        note: '<altro>',
        avvisi: ['<dubbi o dati mancanti da verificare>'],
    };
    return `Sei un assistente di laboratorio. Trasforma il testo qui sotto in un protocollo operativo standard (SOP) strutturato da importare nel software URBIOS.

REGOLE:
1. Rispondi con UN SOLO blocco di codice JSON (\`\`\`json ... \`\`\`), senza testo prima o dopo e senza commenti nel JSON.
2. Usa SOLO le chiavi del formato qui sotto. Ometti le chiavi di cui non hai informazioni: NON inventare quantità, tempi, temperature o riferimenti.
3. Scrivi in italiano, in forma sintetica e tecnica. Un'azione per passaggio, in ordine, con temperature e velocità dove indicate.
4. "quantita" è un numero puro (punto decimale) o una stringa vuota; l'unità va in "unita".
5. Dubbi, valori non chiari o parti mancanti vanno in "avvisi".
8. Per ogni materiale: "cond" = "ice" se va tenuto in ghiaccio durante l'uso (enzimi come la proteinasi K, anticorpi, campioni), "hazard" se è tossico, cancerogeno, corrosivo o infiammabile (es. acrilammide), con in "pericolo" le frasi H solo se le conosci con certezza; altrimenti ometti "cond". Se sono previste più stanze, indica "stanza" sui materiali e sui passaggi. Segnala in "avvisi" di verificare la scheda di sicurezza.${draft ? `
7. ECCEZIONE alla regola 2: il professionista chiede una BOZZA. Dove la procedura, i passaggi o i materiali mancano, proponi una sequenza standard e prudente per questa metodica, con valori tipici di letteratura. Elenca in "avvisi" ogni passaggio o valore che hai ipotizzato e che va verificato.` : ''}
6. Se ci sono "DATI GIÀ SCRITTI" dal professionista: tienili, correggi errori o refusi, completa ciò che manca e restituisci il protocollo COMPLETO (anche le parti già corrette, così com'erano o migliorate). Non togliere passaggi o materiali scritti dal professionista.
${known ? `\nDATI GIÀ SCRITTI DAL PROFESSIONISTA:\n${known}\n` : ''}
${String(text || '').trim() ? `TESTO / ISTRUZIONI AGGIUNTIVE:\n${String(text).trim()}` : known ? '(Nessun testo aggiuntivo: completa e sistema i dati già scritti.)' : '(nessun testo fornito)'}

FORMATO DELLA RISPOSTA:
\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`
`;
};

const extractJson = (raw) => {
    const t = String(raw || '').replace(/[“”„‟]/g, '"').replace(/[‘’]/g, "'").replace(/^﻿/, '');
    const start = t.indexOf('{');
    if (start < 0) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < t.length; i++) {
        const c = t[i];
        if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
        else if (c === '"') inStr = true;
        else if (c === '{') depth++;
        else if (c === '}' && --depth === 0) return t.slice(start, i + 1);
    }
    return t.slice(start);
};

const parseLoose = (s) => { try { return JSON.parse(s); } catch { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); } };
const str = (v) => (Array.isArray(v) ? v.join('\n') : v === null || v === undefined ? '' : String(v)).trim();
const has = (v) => (Array.isArray(v) ? v.some((x) => Object.values(x || {}).some((y) => String(y || '').trim())) : String(v || '').trim() !== '');

const TEXT = [['titolo', 'Titolo'], ['categoria', 'Categoria'], ['scopo', 'Scopo'], ['stanza', 'Stanza'], ['posizioni', 'Dove metto le cose'], ['sicurezza', 'Sicurezza'], ['riferimenti', 'Riferimenti'], ['note', 'Note']];
const TEXT_ART = [['marca', 'Produttore'], ['cas', 'N. CAS'], ['categoria', 'Categoria'], ['conservazione', 'Conservazione'], ['pericolo', 'Pericolo'], ['scheda', 'Scheda tecnica']];
const COND_LABEL = { ice: 'Ghiaccio', hazard: 'Pericolo', none: 'Nessuna' };
const normC = (v) => { const x = String(v || '').trim().toLowerCase(); return /^(ice|ghiacc)/.test(x) ? 'ice' : /^(hazard|pericol|tossic)/.test(x) ? 'hazard' : /^(none|nessun)/.test(x) ? 'none' : ''; };

// → { ok, fatal, changes: [{ key, label, value, old, kind: 'new'|'update', count? }], notes }
export const parseFill = (raw, current = {}, kind = 'protocollo') => {
    const art = kind === 'articolo';
    const res = { ok: false, fatal: null, changes: [], notes: [] };
    const j = extractJson(raw);
    if (!j) { res.fatal = 'Non trovo nessun JSON nel testo incollato. Copia la risposta intera dell’AI.'; return res; }
    let o;
    try { o = parseLoose(j); } catch { res.fatal = 'Il JSON è incompleto o malformato (spesso la risposta è stata tagliata). Chiedi all’AI di ripeterla per intero.'; return res; }
    if (!o || typeof o !== 'object' || Array.isArray(o) || o.format !== (art ? FORMAT_ART : FORMAT)) { res.fatal = `La risposta non è nel formato ${art ? FORMAT_ART : FORMAT}. Rigenera con il prompt di URBIOS.`; return res; }

    const push = (key, label, value, extra = {}) => {
        const old = current[key];
        res.changes.push({ key, label, value, old: has(old) ? old : null, kind: has(old) ? 'update' : 'new', ...extra });
    };
    for (const [k, label] of (art ? TEXT_ART : TEXT)) { const v = str(o[k]); if (v) push(k, label, v); }
    if (art) {
        const c = normC(o.cond);
        if (c) push('cond', 'Condizione nel lavoro', COND_LABEL[c]);
        if (!res.changes.length) { res.fatal = 'La risposta non contiene nessun dato utilizzabile.'; return res; }
        res.notes = (Array.isArray(o.avvisi) ? o.avvisi : o.avvisi ? [o.avvisi] : []).filter((x) => typeof x === 'string' && x.trim());
        res.ok = true;
        return res;
    }
    if (Array.isArray(o.materiali)) {
        const rows = o.materiali.map((m) => typeof m === 'string' ? { nome: m.trim(), quantita: '', unita: '', note: '' } : ({ nome: str(m?.nome ?? m?.voce ?? m?.materiale), quantita: str(m?.quantita), unita: str(m?.unita), note: str(m?.note), ...(CONDS.includes(normC(m?.cond)) ? { cond: normC(m?.cond) } : {}), ...(str(m?.pericolo) ? { pericolo: str(m?.pericolo) } : {}), ...(str(m?.stanza) ? { stanza: str(m?.stanza) } : {}) })).filter((m) => m.nome);
        if (rows.length) push('materiali', 'Materiali', rows, { count: rows.length });
    }
    const rawSteps = [o.passaggi, o.procedura, o.steps, o.passi].find((x) => Array.isArray(x) ? x.length : typeof x === 'string' && x.trim());
    const list = Array.isArray(rawSteps) ? rawSteps : typeof rawSteps === 'string' ? rawSteps.split(/\n+/).map((x) => x.replace(/^\s*(\d+[.)]|[-•*])\s*/, '')) : [];
    const steps = list.map((s) => {
        if (typeof s === 'string') return { testo: s.trim(), durata: '' };
        const t = s?.testo ?? s?.descrizione ?? s?.azione ?? s?.step ?? s?.passaggio ?? s?.istruzione;
        return { testo: str(t), durata: str(s?.durata ?? s?.tempo ?? s?.tempi), ...(str(s?.note) ? { note: str(s?.note) } : {}), ...(str(s?.stanza) ? { stanza: str(s?.stanza) } : {}) };
    }).filter((s) => s.testo);
    if (steps.length) push('passaggi', 'Procedura', steps, { count: steps.length });
    else if (rawSteps) res.notes.push('La procedura è nella risposta ma in un formato che non riconosco: non è stata importata.');
    if (!res.changes.length) { res.fatal = 'La risposta non contiene nessun dato utilizzabile.'; return res; }
    const av = Array.isArray(o.avvisi) ? o.avvisi : o.avvisi ? [o.avvisi] : [];
    res.notes = av.filter((x) => typeof x === 'string' && x.trim());
    res.ok = true;
    return res;
};
