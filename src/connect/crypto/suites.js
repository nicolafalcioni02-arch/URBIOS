// Elenco CHIUSO delle combinazioni ammesse (anti-downgrade, SEC-16). Un id fuori elenco = rifiuto.
// Aggiungere una suite = nuova riga + nuovo id; non si modificano mai suite esistenti.
export const SUITES = Object.freeze({
    1: Object.freeze({
        name: 'URBIOS-1',
        kem: 'X-Wing (X25519 + ML-KEM-768)',
        aead: 'AES-256-GCM',
        kdf: 'HKDF-SHA256',
        sig: 'Ed25519 + ML-DSA-65 (entrambe)',
    }),
});
export const DEFAULT_SUITE = 1;

export const requireSuite = (id) => {
    if (!Number.isInteger(id) || !Object.hasOwn(SUITES, id)) throw new Error('suite non ammessa');
    return SUITES[id];
};
