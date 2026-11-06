// Intestazione autenticata (SEC-50/52): campi FISSI, tutti obbligatori, nessun campo extra.
// Viene serializzata in forma canonica e usata come AAD dell'AEAD e dentro il transcript firmato.
import { b64u } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { requireSuite } from '../crypto/suites.js';
import { isOpaqueId } from '../identity/opaqueId.js';

export const PROTOCOL_VERSION = 1;
const KEYS = ['v', 'suite', 'sender', 'recipient', 'msgId', 'session', 'ts', 'ctr'];

export const buildHeaderBytes = (h) => canonicalBytes(h);

// Ritorna l'intestazione validata o lancia. Non si fida di nulla di ciò che arriva.
export const parseHeader = (headerBytes) => {
    let h;
    try { h = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(headerBytes)); } catch { throw new Error('intestazione non valida'); }
    if (!h || typeof h !== 'object' || Array.isArray(h)) throw new Error('intestazione non valida');
    const ks = Object.keys(h);
    if (ks.length !== KEYS.length || !KEYS.every((k) => ks.includes(k))) throw new Error('intestazione non valida');
    if (h.v !== PROTOCOL_VERSION) throw new Error('versione non supportata');
    requireSuite(h.suite);
    if (!isOpaqueId(h.sender, 'd') || !isOpaqueId(h.recipient, 'd') || !isOpaqueId(h.session, 's')) throw new Error('intestazione non valida');
    if (typeof h.msgId !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(h.msgId)) throw new Error('intestazione non valida');
    if (!Number.isSafeInteger(h.ts) || h.ts < 0 || !Number.isSafeInteger(h.ctr) || h.ctr < 0) throw new Error('intestazione non valida');
    // forma canonica obbligatoria: rifiuta rappresentazioni alternative dello stesso contenuto
    const again = canonicalBytes(h);
    if (again.length !== headerBytes.length || again.some((x, i) => x !== headerBytes[i])) throw new Error('intestazione non canonica');
    return h;
};
