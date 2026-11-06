// Revoca di un dispositivo (SEC-23/24): messaggio firmato; revocare uno non tocca gli altri.
// CHI può revocare (es. altro dispositivo dello stesso medico) lo decide enrollment/, non questo file.
import * as sig from '../crypto/sign.js';
import { b64u } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { isOpaqueId } from './opaqueId.js';

const CTX = 'revocation';

export const makeRevocation = ({ targetId, signerRecord, signerSecret, now = Date.now(), reason = 'compromised' }) => {
    if (!isOpaqueId(targetId, 'd')) throw new Error('revoca: id non valido');
    const body = { v: 1, targetId, signerId: signerRecord.deviceId, at: now, reason };
    return { ...body, sig: b64u.enc(sig.sign(CTX, canonicalBytes(body), signerSecret.sig)) };
};

export const verifyRevocation = (rev, signerRecord) => {
    try {
        const { sig: s, ...body } = rev;
        if (body.v !== 1 || body.signerId !== signerRecord.deviceId || !isOpaqueId(body.targetId, 'd')) return false;
        const pk = { ed: b64u.dec(signerRecord.sigPk.ed), pq: b64u.dec(signerRecord.sigPk.pq) };
        return sig.verify(CTX, canonicalBytes(body), b64u.dec(s), pk);
    } catch {
        return false;
    }
};

export const createRevocationList = () => {
    const revoked = new Set();
    return { add: (rev) => revoked.add(rev.targetId), isRevoked: (id) => revoked.has(id) };
};
