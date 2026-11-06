// Intestazione del messaggio ratchet (canonica, campi fissi). I tre campi di epoca (tid, ct, npk)
// compaiono SOLO nel primo messaggio di un'epoca, tutti insieme.
import { sha256 } from '@noble/hashes/sha2.js';
import { b64u } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import * as kem from '../crypto/kem.js';
import { isOpaqueId } from '../identity/opaqueId.js';

export const keyId = (bytes) => b64u.enc(sha256(bytes).slice(0, 16));
const BASE = ['v', 'sid', 'eid', 'n', 'pn'];
const EPOCH = ['tid', 'ct', 'npk'];

export const headerBytes = (h) => canonicalBytes(h);

export const parseHeader = (bytes) => {
    let h;
    try { h = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new Error('header'); }
    if (!h || typeof h !== 'object' || Array.isArray(h)) throw new Error('header');
    const ks = Object.keys(h), hasEpoch = ks.includes('ct');
    const want = hasEpoch ? [...BASE, ...EPOCH] : BASE;
    if (ks.length !== want.length || !want.every((k) => ks.includes(k))) throw new Error('header');
    if (h.v !== 1 || !isOpaqueId(h.sid, 's') || !/^[A-Za-z0-9_-]{22}$/.test(h.eid)) throw new Error('header');
    if (!Number.isSafeInteger(h.n) || h.n < 0 || !Number.isSafeInteger(h.pn) || h.pn < 0) throw new Error('header');
    if (hasEpoch) {
        if (h.n !== 0 || !/^[A-Za-z0-9_-]{22}$/.test(h.tid)) throw new Error('header');
        if (b64u.dec(h.ct).length !== kem.LENGTHS.cipherText || b64u.dec(h.npk).length !== kem.LENGTHS.publicKey) throw new Error('header');
    }
    const again = canonicalBytes(h);
    if (again.length !== bytes.length || again.some((x, i) => x !== bytes[i])) throw new Error('header');
    return h;
};
