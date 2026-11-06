// Cifratura/decifratura di un messaggio ratchet sullo stato `s` (già clonato dal chiamante).
import { seal, open } from '../crypto/aead.js';
import { concat, u32be } from '../crypto/bytes.js';
import { headerBytes, parseHeader } from './header.js';
import { startEpoch, nextKey, enterEpoch, skipTo } from './chain.js';

export const encryptWith = async (s, plaintext) => {
    if (s.needSend) startEpoch(s);
    if (!s.cks) throw new Error('sessione non pronta');
    const mk = nextKey(s, 'cks');
    const first = s.ns === 0;
    const hb = headerBytes({ v: 1, sid: s.sid, eid: s.sendEid, n: s.ns, pn: s.pn, ...(first ? s.pending : {}) });
    if (first) s.pending = null;
    s.ns++;
    const sealed = await seal(mk, plaintext, hb);
    s.garbage.push(mk);
    return concat(u32be(hb.length), hb, sealed);
};

export const decryptWith = async (s, bytes) => {
    if (bytes.length < 4 + 16) throw new Error('messaggio non valido');
    const hl = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    if (hl === 0 || hl > 4096 || 4 + hl > bytes.length) throw new Error('messaggio non valido');
    const hb = bytes.subarray(4, 4 + hl), body = bytes.subarray(4 + hl);
    const h = parseHeader(hb);
    if (h.sid !== s.sid) throw new Error('sessione diversa');
    let mk;
    const sk = `${h.eid}|${h.n}`;
    if (s.skipped.has(sk)) {
        mk = s.skipped.get(sk); s.skipped.delete(sk);
    } else {
        if (h.ct) {
            if (h.eid === s.recvEid) throw new Error('replay');
            if (s.ckr) skipTo(s, s.recvEid, h.pn);
            enterEpoch(s, h);
        } else if (h.eid !== s.recvEid) throw new Error('epoca sconosciuta');
        if (h.n < s.nr) throw new Error('replay');
        skipTo(s, h.eid, h.n);
        mk = nextKey(s, 'ckr'); s.nr = h.n + 1;
    }
    const pt = await open(mk, body, hb);
    s.garbage.push(mk);
    return pt;
};
