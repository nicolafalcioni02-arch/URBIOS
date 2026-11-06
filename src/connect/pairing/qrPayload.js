// Contenuto del QR mostrato dal medico (SEC-30/31/34). PICCOLO per stare in un QR: il record pubblico
// completo (~10 KB, chiavi post-quantum) NON entra: il QR porta solo il suo hash `dh`, il record
// arriva dal trasporto e si verifica contro `dh`. Nessun nome, nessun dato clinico.
import { b64u } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { isOpaqueId } from '../identity/opaqueId.js';

const KEYS = ['v', 'pid', 'exp', 'patient', 'doc', 'dh', 'ps', 'rl'];
export const MAX_QR_BYTES = 640;
// `rl` = indirizzo del relay: così l'app paziente non ha NESSUN endpoint nel codice (SEC-03). Si fida del QR perché
// è mostrato di persona dal medico; il relay vede comunque solo byte cifrati. È dentro la SAS (transcript).

export const encodeOffer = (o) => canonicalBytes(o);

export const decodeOffer = (bytes, now) => {
    if (!(bytes instanceof Uint8Array) || bytes.length > MAX_QR_BYTES) throw new Error('qr non valido');
    let o;
    try { o = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new Error('qr non valido'); }
    const ks = o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o) : [];
    if (ks.length !== KEYS.length || !KEYS.every((k) => ks.includes(k))) throw new Error('qr non valido');
    if (o.v !== 1 || !isOpaqueId(o.pid, 's') || !isOpaqueId(o.patient, 'p') || !isOpaqueId(o.doc, 'd')) throw new Error('qr non valido');
    if (!Number.isSafeInteger(o.exp) || now > o.exp) throw new Error('qr scaduto');
    if (typeof o.rl !== 'string' || o.rl.length > 120 || !/^(https|wss):\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~\/-]*)?$/.test(o.rl)) throw new Error('qr non valido');
    if (typeof o.dh !== 'string' || b64u.dec(o.dh).length !== 32 || typeof o.ps !== 'string' || b64u.dec(o.ps).length !== 32) throw new Error('qr non valido');
    const again = canonicalBytes(o);
    if (again.length !== bytes.length || again.some((x, i) => x !== bytes[i])) throw new Error('qr non canonico');
    return o;
};
