// Le chiavi segrete del dispositivo si salvano SOLO cifrate con la DEK (SEC-13/20). La DEK arriva
// da storage/ (sblocco con passphrase) e non viene mai persistita da qui.
import { seal, open } from '../crypto/aead.js';
import { utf8, b64u } from '../crypto/bytes.js';

const AAD = utf8('urbios/v1/identity-secret');
const enc = (s) => ({ kemSk: b64u.enc(s.kemSk), ed: b64u.enc(s.sig.ed), pq: b64u.enc(s.sig.pq) });

export const sealIdentitySecret = async (secret, dek) =>
    seal(dek, utf8(JSON.stringify(enc(secret))), AAD);

export const openIdentitySecret = async (sealed, dek) => {
    const j = JSON.parse(new TextDecoder().decode(await open(dek, sealed, AAD)));
    return { kemSk: b64u.dec(j.kemSk), sig: { ed: b64u.dec(j.ed), pq: b64u.dec(j.pq) } };
};
