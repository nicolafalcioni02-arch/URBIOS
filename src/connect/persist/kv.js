// Archivio chiave→byte. `memoryKv` per i test; `idbKv` per il browser (IndexedDB, un solo object store).
// Nota: IndexedDB NON è un'enclave (SEC-03): protegge solo grazie alla cifratura applicativa con la DEK.
export const memoryKv = () => {
    const m = new Map();
    return { get: async (k) => (m.has(k) ? m.get(k).slice() : null), put: async (k, v) => { m.set(k, v.slice()); }, delete: async (k) => { m.delete(k); }, _m: m };
};

// NON provato in questo ambiente (nessun browser nei test Node): da verificare nell'app.
export const idbKv = (dbName = 'urbios-connect', store = 'kv') => {
    const open = () => new Promise((res, rej) => {
        const r = indexedDB.open(dbName, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(store);
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const tx = async (mode, fn) => {
        const db = await open();
        return new Promise((res, rej) => {
            const t = db.transaction(store, mode), req = fn(t.objectStore(store));
            t.oncomplete = () => { db.close(); res(req.result); }; t.onerror = t.onabort = () => { db.close(); rej(t.error); };
        });
    };
    return {
        get: async (k) => { const v = await tx('readonly', (s) => s.get(k)); return v ? new Uint8Array(v) : null; },
        put: (k, v) => tx('readwrite', (s) => s.put(v, k)),
        delete: (k) => tx('readwrite', (s) => s.delete(k)),
    };
};
