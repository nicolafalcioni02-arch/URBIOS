// HKDF-SHA256 con separazione di dominio obbligatoria: ogni chiave ha UNO scopo (SEC-12).
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8 } from './bytes.js';

export const hkdfSha256 = (ikm, { salt, purpose, length = 32 }) => {
    if (!purpose || typeof purpose !== 'string') throw new Error('kdf: scopo obbligatorio');
    return hkdf(sha256, ikm, salt, utf8(`urbios/v1/${purpose}`), length);
};
