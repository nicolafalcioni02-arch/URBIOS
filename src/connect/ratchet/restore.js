// Ripristino di una sessione da `exportState()` (SEC-45). Validazione STRETTA: stato corrotto o strano ⇒ errore,
// mai una sessione "quasi giusta". Il testo contiene segreti: va letto solo dopo aver aperto il blob cifrato (persist/).
import { b64u } from '../crypto/bytes.js';
import * as kem from '../crypto/kem.js';
import { createSession } from './session.js';

const bytes = (v, len) => {
    if (typeof v !== 'string') throw new Error('stato non valido');
    const b = b64u.dec(v);
    if (len !== undefined && b.length !== len) throw new Error('stato non valido');
    return b;
};
const nn = (v) => v === null ? null : v;
const int = (v) => { if (!Number.isSafeInteger(v) || v < 0) throw new Error('stato non valido'); return v; };

export const restoreSession = (json) => {
    let j;
    try { j = JSON.parse(json); } catch { throw new Error('stato non valido'); }
    if (!j || typeof j !== 'object') throw new Error('stato non valido');
    const s = {
        sid: j.sid, rk: bytes(j.rk, 32),
        cks: j.cks === null ? null : bytes(j.cks, 32), ckr: j.ckr === null ? null : bytes(j.ckr, 32),
        ns: int(j.ns), nr: int(j.nr), pn: int(j.pn), sendEid: nn(j.sendEid), recvEid: nn(j.recvEid),
        pending: j.pending === null ? null : { tid: String(j.pending.tid), ct: String(j.pending.ct), npk: String(j.pending.npk) },
        needSend: j.needSend === true, peerPk: j.peerPk === null ? null : bytes(j.peerPk, kem.LENGTHS.publicKey),
        maxSkipped: int(j.maxSkipped), garbage: [],
        kems: new Map(j.kems.map(([k, p, sk]) => [String(k), { publicKey: bytes(p, kem.LENGTHS.publicKey), secretKey: bytes(sk, kem.LENGTHS.secretKey) }])),
        skipped: new Map(j.skipped.map(([k, v]) => [String(k), bytes(v, 32)])),
    };
    if (typeof s.sid !== 'string' || s.kems.size > 8 || s.skipped.size > s.maxSkipped) throw new Error('stato non valido');
    return createSession(s);
};
