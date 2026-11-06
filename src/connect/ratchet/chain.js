// Avanzamento delle catene. I buffer sostituiti vanno in `s.garbage` e si azzerano SOLO al commit
// (se l'operazione fallisce lo stato originale deve restare intatto).
import { b64u } from '../crypto/bytes.js';
import * as kem from '../crypto/kem.js';
import { keyId } from './header.js';
import { kdfRoot, kdfChain } from './kdf.js';

const KEEP_KEMS = 3;

export const startEpoch = (s) => {
    if (!s.peerPk) throw new Error('nessuna chiave del peer: attendere un messaggio');
    const { cipherText, sharedSecret } = kem.encapsulate(s.peerPk);
    const { rk, ck } = kdfRoot(s.rk, sharedSecret);
    s.garbage.push(s.rk, sharedSecret);
    const fresh = kem.generateKeys();
    s.kems.set(keyId(fresh.publicKey), fresh);
    while (s.kems.size > KEEP_KEMS) s.kems.delete(s.kems.keys().next().value);
    s.pn = s.ns; s.ns = 0; s.rk = rk; s.cks = ck; s.needSend = false; s.sendEid = keyId(cipherText);
    s.pending = { tid: keyId(s.peerPk), ct: b64u.enc(cipherText), npk: b64u.enc(fresh.publicKey) };
};

export const nextKey = (s, which) => {
    const r = kdfChain(s[which]);
    s.garbage.push(s[which]);
    s[which] = r.ck;
    return r.mk;
};

export const enterEpoch = (s, h) => {
    const k = s.kems.get(h.tid);
    if (!k) throw new Error('chiave sconosciuta');
    const ss = kem.decapsulate(b64u.dec(h.ct), k.secretKey);
    const { rk, ck } = kdfRoot(s.rk, ss);
    s.garbage.push(s.rk, ss, s.ckr, k.secretKey);
    s.kems.delete(h.tid);                 // la chiave è usata: eliminarla è la forward secrecy
    s.rk = rk; s.ckr = ck; s.nr = 0; s.recvEid = h.eid;
    s.peerPk = b64u.dec(h.npk); s.needSend = true;
};

// Conserva le chiavi dei messaggi saltati (limite rigido anti-esaurimento memoria, SEC-43).
export const skipTo = (s, eid, until) => {
    if (until - s.nr > s.maxSkipped) throw new Error('troppi messaggi saltati');
    while (s.nr < until) {
        s.skipped.set(`${eid}|${s.nr}`, nextKey(s, 'ckr'));
        s.nr++;
        while (s.skipped.size > s.maxSkipped) s.skipped.delete(s.skipped.keys().next().value);
    }
};
export { keyId };
