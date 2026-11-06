// Da documento → messaggio doc.put pronto per l'invio. PURO (nessuna chiave, nessuna rete).
// `link` = stato dell'invio già fatto per questa fonte: { docId, rev } oppure nullo (prima volta).
import { b64u } from '../crypto/bytes.js';
import { randomBytes } from '../crypto/random.js';
import { encodeMessage } from '../sync/message.js';
import { findIdentifiers } from '../sync/identifiers.js';

// Il titolo non deve mai contenere il nome del paziente; il controllo riguarda anche note e voci.
export const buildPut = ({ doc, link, forbidden = [], maxBytes, now = Date.now() }) => {
    const found = findIdentifiers(doc, forbidden);
    if (found.length) { const e = new Error('Il documento contiene dati che identificano il paziente: ' + found.join(', ')); e.code = 'IDENTIFIERS'; e.found = found; throw e; }
    const rev = (link?.rev || 0) + 1;
    const docId = link?.docId || 'c1.' + b64u.enc(randomBytes(16));
    const msg = { v: 1, t: 'doc.put', ref: b64u.enc(randomBytes(16)), docId, kind: doc.kind, rev, parentRev: rev > 1 ? rev - 1 : null, title: doc.title.slice(0, 120), body: doc.body, at: Math.floor(now / 1000) };
    encodeMessage(msg, maxBytes);                        // valida schema e dimensione prima di accodare
    return { msg, link: { docId, rev, ref: msg.ref } };
};

// Termini da vietare ricavati dal paziente (nome, cognome, soprannome): MAI inviati, solo confrontati in locale.
export const forbiddenTermsOf = (p) => [p?.nome, p?.cognome, p?.soprannome, ...String(p?.nome || '').split(/\s+/), ...String(p?.cognome || '').split(/\s+/)].filter((t) => typeof t === 'string' && t.trim().length >= 2);

// Ritiro della revisione corrente di un documento già inviato: il paziente non lo vede più (resta nella sua storia locale).
export const buildWithdraw = ({ link, maxBytes }) => {
    if (!link || !link.docId || !link.rev) throw new Error('Documento mai inviato.');
    const msg = { v: 1, t: 'doc.withdraw', ref: b64u.enc(randomBytes(16)), docId: link.docId, rev: link.rev };
    encodeMessage(msg, maxBytes);
    return msg;
};
