// AES-256-GCM via WebCrypto (SEC-10). Formato: nonce(12) || ciphertext+tag.
// Nonce casuale a 96 bit: sicuro SOLO perché ogni chiave cifra un numero limitato di messaggi
// (le chiavi per messaggio del ratchet sono monouso; le chiavi di lunga durata vanno rinnovate
// ben prima di 2^32 cifrature, vedi MAX_MESSAGES_PER_KEY).
import { randomBytes } from './random.js';

export const NONCE_LEN = 12;
export const MAX_MESSAGES_PER_KEY = 2 ** 32;

const importKey = (raw, usage) => {
    if (!(raw instanceof Uint8Array) || raw.length !== 32) throw new Error('aead: chiave di 32 byte richiesta');
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [usage]);
};

export const seal = async (key, plaintext, aad = new Uint8Array(0)) => {
    const nonce = randomBytes(NONCE_LEN);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, await importKey(key, 'encrypt'), plaintext));
    const out = new Uint8Array(NONCE_LEN + ct.length);
    out.set(nonce); out.set(ct, NONCE_LEN);
    return out;
};

// Fallisce (eccezione generica) se chiave, AAD o dati non coincidono: nessun dettaglio all'esterno.
export const open = async (key, sealed, aad = new Uint8Array(0)) => {
    if (sealed.length < NONCE_LEN + 16) throw new Error('aead: autenticazione fallita');
    try {
        return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: sealed.subarray(0, NONCE_LEN), additionalData: aad, tagLength: 128 }, await importKey(key, 'decrypt'), sealed.subarray(NONCE_LEN)));
    } catch {
        throw new Error('aead: autenticazione fallita');
    }
};
