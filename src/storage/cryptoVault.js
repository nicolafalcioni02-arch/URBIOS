// Cifratura dell'archivio (WebCrypto del browser: funziona offline, nessuna libreria).
//
// Schema "due chiavi, una cassaforte":
//   - i dati sono cifrati con una CHIAVE MASTER casuale (AES-256-GCM)
//   - la chiave master è "chiusa" due volte: con la PASSWORD e con un CODICE DI RECUPERO
//   - cambiare password = richiudere la sola chiave master (i dati non si toccano)
// Senza password E senza codice di recupero i dati non sono recuperabili (nessun server, per scelta).

const enc = new TextEncoder();
const dec = new TextDecoder();

export const KDF_ITERATIONS = 600000; // PBKDF2-SHA256 (raccomandazione OWASP 2023)

export const isCryptoAvailable = () => typeof crypto !== 'undefined' && !!crypto.subtle && !!crypto.getRandomValues;

const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

export const b64 = {
    enc: (buf) => {
        const bytes = new Uint8Array(buf);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return btoa(s);
    },
    dec: (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)),
};

// ---- Codice di recupero: 20 caratteri (100 bit), alfabeto senza caratteri ambigui ----
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // 32 simboli (Crockford)

export const generateRecoveryCode = () => {
    const bytes = rand(20);
    let out = '';
    for (let i = 0; i < 20; i++) out += ALPHABET[bytes[i] & 31]; // 256 % 32 == 0: nessun bias
    return out.match(/.{4}/g).join('-');
};

// Tollera minuscole, spazi, trattini e confusioni O/0 I/L/1
export const normalizeRecoveryCode = (code) =>
    String(code || '')
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, '')
        .replace(/O/g, '0')
        .replace(/[IL]/g, '1');

const normalizePassword = (pwd) => String(pwd || '').normalize('NFC');

// ---- Primitive ----
const deriveWrapKey = async (secret, salt, iterations) => {
    const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

const wrap = async (masterRaw, secret, iterations) => {
    const salt = rand(16);
    const iv = rand(12);
    const key = await deriveWrapKey(secret, salt, iterations);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, masterRaw);
    return { salt: b64.enc(salt), iv: b64.enc(iv), wrapped: b64.enc(ct) };
};

const unwrap = async (block, secret, iterations) => {
    const key = await deriveWrapKey(secret, b64.dec(block.salt), iterations);
    try {
        return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(block.iv) }, key, b64.dec(block.wrapped)));
    } catch {
        throw new Error('WRONG_SECRET');
    }
};

const importMaster = (masterRaw) => crypto.subtle.importKey('raw', masterRaw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

// ---- API ----
// Crea una nuova cassaforte. Restituisce la chiave master (solo in memoria), il blocco chiavi da salvare nel file e il codice di recupero.
export const createVault = async (password) => {
    const master = rand(32);
    const recoveryCode = generateRecoveryCode();
    const keyBlock = {
        kdf: { name: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS },
        pwd: await wrap(master, normalizePassword(password), KDF_ITERATIONS),
        rec: await wrap(master, normalizeRecoveryCode(recoveryCode), KDF_ITERATIONS),
    };
    return { master, keyBlock, recoveryCode };
};

// Apre la cassaforte con la password ('pwd') o con il codice di recupero ('rec'). Lancia Error('WRONG_SECRET') se errato.
export const unlockVault = async (keyBlock, secret, which = 'pwd') => {
    const s = which === 'rec' ? normalizeRecoveryCode(secret) : normalizePassword(secret);
    return unwrap(keyBlock[which], s, keyBlock.kdf.iterations);
};

export const rewrapPassword = async (keyBlock, master, newPassword) => ({
    ...keyBlock,
    pwd: await wrap(master, normalizePassword(newPassword), keyBlock.kdf.iterations),
});

export const rewrapRecovery = async (keyBlock, master) => {
    const recoveryCode = generateRecoveryCode();
    return { recoveryCode, keyBlock: { ...keyBlock, rec: await wrap(master, normalizeRecoveryCode(recoveryCode), keyBlock.kdf.iterations) } };
};

export const encryptJson = async (master, obj) => {
    const iv = rand(12);
    const key = await importMaster(master);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: b64.enc(iv), ct: b64.enc(ct) };
};

export const decryptJson = async (master, payload) => {
    const key = await importMaster(master);
    try {
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(payload.iv) }, key, b64.dec(payload.ct));
        return JSON.parse(dec.decode(pt));
    } catch {
        throw new Error('CORRUPTED');
    }
};
