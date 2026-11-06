// Key establishment ibrido X25519 + ML-KEM-768 (SEC-14). Usa il preset X-Wing della libreria
// (combiner con analisi formale pubblicata), NON un combiner scritto da noi.
import { ml_kem768_x25519 as xwing } from '@noble/post-quantum/hybrid.js';

export const LENGTHS = xwing.lengths;

export const generateKeys = () => xwing.keygen();

// Mittente: ottiene (cipherText da inviare, sharedSecret da usare con HKDF).
export const encapsulate = (publicKey) => xwing.encapsulate(publicKey);

// Destinatario. Con ciphertext alterato produce un segreto diverso (rifiuto implicito): l'errore
// emerge alla prima verifica AEAD, non qui.
export const decapsulate = (cipherText, secretKey) => xwing.decapsulate(cipherText, secretKey);
