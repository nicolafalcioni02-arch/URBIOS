// Copia di lavoro nel browser (IndexedDB), per non perdere nulla se si aggiorna la pagina.
// Se l'archivio è cifrato, qui dentro c'è SOLO testo cifrato (la chiave esiste solo in memoria).
// Viene cancellata a "Esci".
const DB_NAME = 'urbios-local';
const STORE = 'kv';
const KEY = 'working';

const open = () =>
    new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
            db.close();
            resolve(req && req.result);
        };
        tx.onerror = () => {
            db.close();
            reject(tx.error);
        };
    });
};

// record: { text, fileHash, savedAt, fileName, encrypted }
export const saveWorking = (record) => run('readwrite', (s) => s.put(record, KEY));
export const loadWorking = () => run('readonly', (s) => s.get(KEY)).then((r) => r || null);
export const clearWorking = () => run('readwrite', (s) => s.delete(KEY));
