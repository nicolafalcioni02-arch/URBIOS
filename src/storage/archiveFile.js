// Formato del file archivio (.json). Due varianti nello stesso contenitore:
//   in chiaro : { format:'URBIOS', formatVersion:1, encrypted:false, savedAt, data:{...db} }
//   cifrato   : { format:'URBIOS', formatVersion:1, encrypted:true,  savedAt, keys:{kdf,pwd,rec}, payload:{iv,ct} }
// I vecchi file (solo il database, senza `format`) vengono ancora letti ("legacy").
import { encryptJson, decryptJson, unlockVault } from './cryptoVault';

export const FORMAT = 'URBIOS';
export const FORMAT_VERSION = 1;

export const buildPlainText = (db, { pretty = false } = {}) =>
    JSON.stringify({ format: FORMAT, formatVersion: FORMAT_VERSION, encrypted: false, savedAt: new Date().toISOString(), data: db }, null, pretty ? 2 : 0);

export const buildEncryptedText = async (db, master, keyBlock) =>
    JSON.stringify({
        format: FORMAT,
        formatVersion: FORMAT_VERSION,
        encrypted: true,
        savedAt: new Date().toISOString(),
        keys: keyBlock,
        payload: await encryptJson(master, db),
    });

// Restituisce { encrypted:false, data } oppure { encrypted:true, keys, payload }. Lancia Error('NOT_URBIOS') se non è un archivio.
export const parseArchiveText = (text) => {
    let obj;
    try {
        obj = JSON.parse(text);
    } catch {
        throw new Error('NOT_URBIOS');
    }
    if (obj && obj.format === FORMAT) {
        if (obj.formatVersion > FORMAT_VERSION) throw new Error('TOO_NEW');
        if (obj.encrypted) {
            if (!obj.keys || !obj.payload) throw new Error('NOT_URBIOS');
            return { encrypted: true, keys: obj.keys, payload: obj.payload, savedAt: obj.savedAt };
        }
        return { encrypted: false, data: obj.data, savedAt: obj.savedAt };
    }
    if (obj && Array.isArray(obj.pazienti)) return { encrypted: false, data: obj, legacy: true }; // vecchio formato
    throw new Error('NOT_URBIOS');
};

// Apre un archivio cifrato. Restituisce { db, master, keyBlock }.
export const openEncrypted = async (parsed, secret, which = 'pwd') => {
    const master = await unlockVault(parsed.keys, secret, which);
    const db = await decryptJson(master, parsed.payload);
    return { db, master, keyBlock: parsed.keys };
};
