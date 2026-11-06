// Identità crittografica del dispositivo (SEC-20/21): chiavi di accordo (X-Wing) e di firma
// (Ed25519+ML-DSA) INDIPENDENTI. Il record pubblico è auto-firmato (lega chiavi, id, validità).
import * as kem from '../crypto/kem.js';
import * as sig from '../crypto/sign.js';
import { b64u } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { DEFAULT_SUITE, requireSuite } from '../crypto/suites.js';
import { newOpaqueId, isOpaqueId } from './opaqueId.js';

const CTX = 'identity-record';
const DAY = 24 * 3600 * 1000;

export const generateDeviceIdentity = ({ now = Date.now(), validityDays = 365 } = {}) => {
    const k = kem.generateKeys();
    const s = sig.generateKeys();
    const deviceId = newOpaqueId('d');
    const body = {
        v: 1, suite: DEFAULT_SUITE, deviceId,
        kemPk: b64u.enc(k.publicKey),
        sigPk: { ed: b64u.enc(s.publicKey.ed), pq: b64u.enc(s.publicKey.pq) },
        notBefore: now, notAfter: now + validityDays * DAY,
    };
    const record = { ...body, selfSig: b64u.enc(sig.sign(CTX, canonicalBytes(body), s.secretKey)) };
    return { record, secret: { kemSk: k.secretKey, sig: s.secretKey } };
};

// Verifica un record pubblico ricevuto: struttura, suite, id, validità, auto-firma.
export const verifyDeviceRecord = (record, now = Date.now()) => {
    try {
        const { selfSig, ...body } = record;
        requireSuite(body.suite);
        if (body.v !== 1 || !isOpaqueId(body.deviceId, 'd')) return false;
        if (!(body.notBefore <= now && now <= body.notAfter)) return false;
        const pk = { ed: b64u.dec(body.sigPk.ed), pq: b64u.dec(body.sigPk.pq) };
        return sig.verify(CTX, canonicalBytes(body), b64u.dec(selfSig), pk);
    } catch {
        return false;
    }
};
