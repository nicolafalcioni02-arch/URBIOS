// Logica dell'app paziente (senza UI, testabile in Node). Un solo professionista collegato.
// Dati: cassaforte con passphrase (stesso schema di storage/cryptoVault: PBKDF2 600k + AES-GCM) → DEK → tutto lo stato cifrato.
// Il paziente NON ha nome: l'identità è un id opaco di dispositivo. Nessun endpoint nel codice: il relay arriva dal QR.
import { createVault, unlockVault } from '../storage/cryptoVault.js';
import { hkdfSha256 } from '../connect/crypto/kdf.js';
import { utf8 } from '../connect/crypto/bytes.js';
import { loadIdentity } from '../connect/identity/store.js';
import { createPersistence } from '../connect/persist/persistence.js';
import { createTransport } from '../connect/transport/index.js';
import { createPeerRegistry } from '../connect/peers/registry.js';
import { createDocStore } from '../connect/sync/docStore.js';
import { startPatientPairing } from '../connect/pairing/flow.js';
import { loadConfig } from '../connect/config/load.js';
import { decodeOffer } from '../connect/pairing/qrPayload.js';

export const CONSENT_VERSION = '2026-11-v1';
const dec = (b) => JSON.parse(new TextDecoder().decode(b));

export const hasVault = async (kv) => !!(await kv.get('vault'));

// Crea la cassaforte con passphrase e registra il consenso (versione, data, voci). Ritorna la chiave master (solo memoria).
export const createPatientVault = async (kv, passphrase, consent, now = Date.now()) => {
    if (typeof passphrase !== 'string' || passphrase.length < 12) throw new Error('PASSPHRASE_TROPPO_CORTA');
    if (!consent || !consent.terms || !consent.sync) throw new Error('CONSENSO_MANCANTE');
    const { master, keyBlock } = await createVault(passphrase);
    await kv.put('vault', utf8(JSON.stringify({ keyBlock })));
    return { master, consent: { version: CONSENT_VERSION, at: now, terms: true, sync: true } };
};

export const unlockPatientVault = async (kv, passphrase) => {
    const raw = await kv.get('vault');
    if (!raw) throw new Error('NO_VAULT');
    return unlockVault(dec(raw).keyBlock, passphrase, 'pwd'); // lancia WRONG_SECRET
};

export const startPatient = async ({ master, kv, consent, fetchImpl = globalThis.fetch && globalThis.fetch.bind(globalThis), WebSocketImpl, now = () => Date.now(), pumpEveryMs = 30000, onChange = () => {} }) => {
    const dek = hkdfSha256(master, { purpose: 'patient/dek-v1' });
    try {
        const identity = await loadIdentity(kv, dek);
        const cfg = loadConfig({ mode: 'online', relayUrl: 'https://placeholder.example/' });
        let relayUrl = null, rc = null;
        const relay = {   // client creato quando l'indirizzo è noto (dal QR, poi dallo stato salvato)
            put: (...a) => client().put(...a), fetchNew: (...a) => client().fetchNew(...a),
        };
        const client = () => { if (!relayUrl) throw new Error('relay non configurato'); return rc || (rc = createTransport({ url: relayUrl, fetchImpl, WebSocketImpl, now })); };
        const allowed = new Set();
        const docs = createDocStore({ allowedSenders: allowed });
        let unlinkedAt = null, consentRec = consent || null, lastSync = null, lastError = null;
        const registry = createPeerRegistry({ cfg, getSelf: () => identity, relay, now, role: 'patient',
            onMessage: async (m, from, peer) => {
                if (m.t === 'peer.unlink') {   // il medico chiude il collegamento: autentico (firmato) ⇒ si toglie il collegamento, i piani già ricevuti restano
                    if (allowed.has(from)) { unlinkedAt = now(); registry.remove(peer.pid); syncAllowed(); onChange(); }
                    return;
                }
                docs.apply(m, from); if (m.ref) await peer.sendAck(m.ref); onChange();
            } });
        // Diario di allenamenti e pasti: SOLO su questo telefono (cifrato come il resto), non viene mai inviato al professionista.
        const normLog = (x) => ({ sessions: (x && x.sessions) || {}, meals: (x && x.meals) || {}, extras: (x && x.extras) || {}, weights: (x && Array.isArray(x.weights)) ? x.weights : [], hist: (x && x.hist) || {}, last: (x && x.last) || {}, tools: { visit: (x && x.tools && x.tools.visit) || null, notes: (x && x.tools && Array.isArray(x.tools.notes)) ? x.tools.notes : [], shop: (x && x.tools && x.tools.shop) || {}, cfg: (x && x.tools && x.tools.cfg) || { days: 7, people: 1 }, dietDay: (x && x.tools && x.tools.dietDay) || null } });
        let logData = normLog(null);
        const parts = {
            meta: { sessionBound: false, snapshot: () => ({ consent: consentRec, relayUrl, unlinkedAt }), restore: (s) => { consentRec = s.consent || consentRec; relayUrl = s.relayUrl || null; unlinkedAt = s.unlinkedAt || null; rc = null; }, reset: () => {} },
            docs: { sessionBound: false, snapshot: () => docs.snapshot(), restore: (s) => docs.restore(s), reset: () => docs.restore({ docs: [] }) },
            log: { sessionBound: false, snapshot: () => logData, restore: (x) => { logData = normLog(x); }, reset: () => { logData = normLog(null); } },
            peers: registry.part,
        };
        const persistence = createPersistence({ kv, parts, getDek: () => dek });
        const loaded = await persistence.load();
        const syncAllowed = () => { allowed.clear(); registry.all().forEach((p) => allowed.add(p.peerRecord.deviceId)); };
        syncAllowed();
        let stopped = false, current = null;   // dopo stop() niente salvataggi: la chiave è già azzerata
        const save = () => (stopped ? Promise.resolve() : persistence.save());
        await save();

        let pumping = false;
        const sync = () => { if (stopped) return Promise.resolve(); current = syncInner(); return current; };
        const syncInner = async () => {
            if (pumping || !relayUrl) return;
            pumping = true;
            try {
                let changed = false;
                for (const p of registry.all()) { const r = await p.pump(); changed = changed || r.received > 0 || r.rejected > 0 || r.sent > 0; lastError = r.errors[0] || null; }
                lastSync = now();
                if (changed) { await save(); onChange(); }
            } catch (e) { lastError = e.message; } finally { pumping = false; }
        };
        const timer = pumpEveryMs > 0 ? setInterval(sync, pumpEveryMs) : null;

        return {
            persistStatus: loaded.status, deviceId: identity.record.deviceId,
            status: () => ({ linked: registry.all().length > 0, unlinkedAt, relayUrl, lastSync, lastError, consent: consentRec }),
            docs: {
                list: () => docs.list().map((d) => ({ ...d, ...(docs.current(d.docId) || {}), body: undefined })).filter((d) => docs.current(d.docId)),
                get: (id) => docs.current(id),
                conflicts: () => docs.conflicts(),
            },
            // Il diario si salva in locale PRIMA di tutto il resto (anche senza rete).
            log: { get: () => logData, async update(fn) { fn(logData); await save(); onChange(); } },
            sync,
            // QR (testo) → controller di pairing (stati: waiting-record → confirm-sas → waiting-peer → done | failed)
            async beginPairing(qrText) {
                const qr = utf8(qrText);
                const offer = decodeOffer(qr, now());           // valida forma, scadenza, https del relay
                relayUrl = offer.rl; rc = null;
                const c = await startPatientPairing({ relay, qr, identity, now });
                let registered = false;
                return {
                    get state() { return c.state; }, get sas() { return c.sas; }, get error() { return c.error; },
                    async poll() {
                        const st = await c.poll();
                        if (st === 'done' && !registered) {
                            registered = true;
                            unlinkedAt = null;
                            registry.add({ pid: c.result.doctorRecord.deviceId, peerRecord: c.result.doctorRecord, sid: c.result.sid, seed: c.result.seed });
                            syncAllowed(); await save(); onChange();
                        }
                        return st;
                    },
                    confirmSas: (ok) => c.confirmSas(ok),
                };
            },
            async forgetAll() {
                stopped = true; if (timer) clearInterval(timer); try { await current; } catch { /* si ferma comunque */ }
                await persistence.wipe(); await kv.delete('identity'); await kv.delete('vault');
                dek.fill(0);
            },
            async stop() { stopped = true; if (timer) clearInterval(timer); try { await current; } catch { /* si ferma comunque */ } dek.fill(0); },
        };
    } catch (e) { dek.fill(0); throw e; }
};
