// Punto unico di controllo di connect/ per l'interfaccia. Leggero (nessuna dipendenza crittografica):
// il codice vero si carica con import() solo quando si passa a Online. Offline = nulla è in esecuzione.
let handle = null, starting = false, lastStart = null;
let state = { status: 'off', deviceId: null, persistStatus: null, error: null, code: null };
const listeners = new Set();
import { diary } from './help/diary.js';
const set = (s) => {
    if (s.status && s.status !== state.status) diary.record('stato', `${s.status}${s.code ? ' (' + s.code + ')' : ''}${s.error ? ': ' + s.error : ''}`);
    state = { ...state, ...s }; listeners.forEach((l) => l());
};

export const connectManager = {
    getState: () => state,
    api: () => handle,              // pairing / peers (solo se Online)
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    async start({ settings, deriveKey }) {
        if (handle || starting) return;
        starting = true; lastStart = { settings, deriveKey }; set({ status: 'starting', error: null, code: null });
        try {
            const { startRuntime } = await import('./runtime.js');
            handle = await startRuntime({ settings, deriveKey });
            set({ status: 'on', deviceId: handle.identity.deviceId, persistStatus: handle.persistStatus });
        } catch (e) { set({ status: 'error', error: e && e.message ? e.message : 'errore', code: (e && e.code) || null }); }
        starting = false;
    },
    // Cancella TUTTI i dati di connessione di questo computer (identità, collegamenti, coda) e riparte. I pazienti vanno ricollegati.
    async resetData() {
        await this.stop();
        await new Promise((res, rej) => {
            const r = indexedDB.deleteDatabase('urbios-connect');
            r.onsuccess = () => res(); r.onerror = () => rej(r.error); r.onblocked = () => res();
        });
        set({ status: 'off', error: null, code: null });
        if (lastStart) await this.start(lastStart);
    },
    async stop() {
        const h = handle; handle = null;
        if (h) { try { await h.stop(); } catch { /* si spegne comunque */ } }
        if (state.status !== 'off') set({ status: 'off', deviceId: null, persistStatus: null, error: null });
    },
};
