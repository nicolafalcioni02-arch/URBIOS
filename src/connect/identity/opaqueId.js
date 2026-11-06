// Identificativi pubblici opachi (SEC-22): 128 bit casuali, nessuna derivazione da dati reali.
// Formato: "<tipo>1.<22 car. base64url>"  (tipo: d = dispositivo, p = paziente, s = sessione)
import { randomBytes } from '../crypto/random.js';
import { b64u } from '../crypto/bytes.js';

const KINDS = ['d', 'p', 's', 'c'];
const RE = /^([dpsc])1\.[A-Za-z0-9_-]{22}$/;

export const newOpaqueId = (kind) => {
    if (!KINDS.includes(kind)) throw new Error('id: tipo non valido');
    return `${kind}1.${b64u.enc(randomBytes(16))}`;
};

export const isOpaqueId = (v, kind) => typeof v === 'string' && v.length === 25 && RE.test(v) && (!kind || v[0] === kind);
