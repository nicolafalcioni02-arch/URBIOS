// Controllo all'invio (SEC-132/D-11): nessun nome del paziente in titoli, note, chiavi o testi del documento.
// `forbidden` = termini da vietare (nome, cognome, soprannomi…) forniti dall'archivio del medico.
// Confronto senza maiuscole/accenti/punteggiatura. NON è una garanzia (un testo può identificare in altri modi):
// è una rete di sicurezza contro l'errore umano più comune.
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const strings = (v, out = []) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.push(k); strings(x, out); }
    return out;
};

// Ritorna l'elenco dei termini trovati (vuoto = ok).
export const findIdentifiers = (doc, forbidden) => {
    const hay = ` ${strings({ title: doc.title, body: doc.body }).map(norm).join(' | ')} `;
    return forbidden.map(norm).filter((t) => t.length >= 2 && hay.includes(` ${t} `) || (t.length >= 4 && hay.includes(t)));
};
