// Messaggi di sincronizzazione medico⇄paziente (v1: consegna di documenti, D-06). PURI: nessuna chiave qui.
// Tipi: doc.put (nuova revisione), doc.withdraw (ritira), peer.unlink (il medico chiude il collegamento), ack (conferma applicativa, SEC-85).
// Il documento NON è un CRDT: una sola autorità scrive (il medico), le revisioni sono numerate.
import { canonicalBytes } from '../crypto/canonical.js';

export const DOC_ID = /^c1\.[A-Za-z0-9_-]{22}$/;
const REF = /^[A-Za-z0-9_-]{22}$/;
export const KINDS = ['diet', 'training'];
const LIMITS = { depth: 8, str: 2000, nodes: 5000 };

const checkBody = (v, depth = 0, n = { c: 0 }) => {
    if (++n.c > LIMITS.nodes || depth > LIMITS.depth) throw new Error('documento troppo complesso');
    if (v === null || typeof v === 'boolean') return;
    if (typeof v === 'string') { if (v.length > LIMITS.str) throw new Error('testo troppo lungo'); return; }
    if (typeof v === 'number') { if (!Number.isSafeInteger(v)) throw new Error('solo interi: i decimali vanno come stringhe'); return; }
    if (Array.isArray(v)) { v.forEach((x) => checkBody(x, depth + 1, n)); return; }
    if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
        for (const k of Object.keys(v)) { if (k === '__proto__') throw new Error('chiave non valida'); checkBody(v[k], depth + 1, n); }
        return;
    }
    throw new Error('tipo non ammesso');
};

// Numeri: la serializzazione canonica ammette solo interi ⇒ i decimali viaggiano come stringhe o interi scalati.
const TYPES = {
    'doc.put': (m) => {
        if (!KINDS.includes(m.kind) || !DOC_ID.test(m.docId) || !REF.test(m.ref)) throw new Error('doc.put non valido');
        if (!Number.isSafeInteger(m.rev) || m.rev < 1 || !(m.parentRev === null || (Number.isSafeInteger(m.parentRev) && m.parentRev >= 0 && m.parentRev < m.rev))) throw new Error('revisione non valida');
        if (typeof m.title !== 'string' || m.title.length > 120 || !Number.isSafeInteger(m.at)) throw new Error('doc.put non valido');
        checkBody(m.body);
    },
    'doc.withdraw': (m) => {
        if (!DOC_ID.test(m.docId) || !REF.test(m.ref) || !Number.isSafeInteger(m.rev) || m.rev < 1) throw new Error('doc.withdraw non valido');
    },
    'peer.unlink': (m) => { if (!REF.test(m.ref)) throw new Error('peer.unlink non valido'); },
    ack: (m) => { if (!REF.test(m.of)) throw new Error('ack non valido'); },
};

export const validateMessage = (m) => {
    if (!m || typeof m !== 'object' || m.v !== 1 || !Object.hasOwn(TYPES, m.t)) throw new Error('messaggio non valido');
    TYPES[m.t](m);
    return m;
};

export const encodeMessage = (m, maxBytes) => {
    const b = canonicalBytes(validateMessage(m));
    if (b.length > maxBytes) throw new Error('messaggio troppo grande');
    return b;
};

export const decodeMessage = (bytes, maxBytes) => {
    if (bytes.length > maxBytes) throw new Error('messaggio troppo grande');
    let m;
    try { m = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new Error('messaggio non valido'); }
    return validateMessage(m);
};
