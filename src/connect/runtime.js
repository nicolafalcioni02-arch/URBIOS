// Avvio/arresto di connect/ quando l'interruttore è su Online (SEC-120/121). Caricato SOLO con import dinamico
// da manager.js: in modalità Offline questo file non viene eseguito. (Nel file HTML unico il codice è presente
// ma inerte: nessun fetch, nessun timer, nessuna chiave derivata.)
// Qui: chiave dei dati (derivata dall'archivio), identità del dispositivo, log di audit, persistenza, registro parti.
// NON ancora: gestione dei pazienti (un ratchet/mailbox per paziente) — passo successivo, si registra con `register()`.
import { loadConfig } from './config/load.js';
import { b64u } from './crypto/bytes.js';
import { randomBytes } from './crypto/random.js';
import { createPersistence } from './persist/persistence.js';
import { idbKv } from './persist/kv.js';
import { loadIdentity } from './identity/store.js';
import { createAuditLog, verifyChain } from './audit/chain.js';
import { createTransport } from './transport/index.js';
import { createPeerRegistry } from './peers/registry.js';
import { startDoctorPairing } from './pairing/flow.js';

export const startRuntime = async ({ settings, deriveKey, kv = idbKv(), now = () => Date.now(), fetchImpl = globalThis.fetch && globalThis.fetch.bind(globalThis), WebSocketImpl, pumpEveryMs = 20000 }) => {
    const relayUrl0 = settings && settings.relayUrl;
    // broker pubblici: provato dal vivo, EMQX perde in silenzio i messaggi da ~128 KB ⇒ tetto 80 KB (la busta aggiunge ~7 KB)
    const cfg = loadConfig({ mode: 'online', relayUrl: relayUrl0, ...(typeof relayUrl0 === 'string' && relayUrl0.startsWith('wss://') ? { maxPayloadBytes: 80 * 1024 } : {}) });   // valida https, ecc.
    const dek = await deriveKey('connect/dek-v1');
    if (!dek) throw new Error('archivio non cifrato o bloccato');
    try {
        const identity = await loadIdentity(kv, dek);
        const entries = [];
        const parts = {
            audit: { sessionBound: false, snapshot: () => entries.slice(), restore: (e) => { entries.length = 0; entries.push(...e); }, reset: () => { entries.length = 0; } },
        };
        const relay = createTransport({ url: cfg.relayUrl, fetchImpl, WebSocketImpl, now });
        const registry = createPeerRegistry({ cfg, getSelf: () => identity, relay, now });
        parts.peers = registry.part;                       // prima di load(): lo stato dei collegamenti si ripristina qui
        const persistence = createPersistence({ kv, parts, getDek: () => dek });
        const loaded = await persistence.load();
        const auditOk = verifyChain(entries).ok;
        const audit = createAuditLog({ store: { last: () => entries[entries.length - 1] || null, append: (e) => entries.push(e) }, deviceId: identity.record.deviceId, now });
        audit.record('mode.change', { to: 'online' });
        await persistence.save();
        // Operazioni in corso (giri di rete, salvataggi): stop() le aspetta e dopo lo stop non si salva più, altrimenti un
        // salvataggio in ritardo userebbe la chiave già azzerata e scriverebbe dati illeggibili (errore «aead» al riavvio).
        let stopped = false;
        const inflight = new Set();
        const track = (p) => { inflight.add(p); const done = () => inflight.delete(p); p.then(done, done); return p; };
        const save = () => (stopped ? Promise.resolve() : track(persistence.save()));
        // Un solo giro alla volta; salva se qualcosa è cambiato (il ratchet avanza anche ricevendo).
        let pumping = false;
        const pumpAll = () => (stopped ? Promise.resolve({ skipped: true }) : track(pumpAllInner()));
        const pumpAllInner = async () => {
            if (pumping) return { skipped: true };
            pumping = true;
            try {
                const out = {};
                for (const p of registry.all()) {
                    const r = await p.pump();
                    out[p.pid] = r;
                    if (r.received || r.rejected) audit.record(r.rejected ? 'sync.reject' : 'sync.receive', { n: r.received + r.rejected });
                    if (r.sent) audit.record('sync.send', { n: r.sent });
                }
                await save();
                return out;
            } finally { pumping = false; }
        };
        const timer = pumpEveryMs > 0 ? setInterval(() => { pumpAll().catch(() => {}); }, pumpEveryMs) : null;
        let pairingActive = null;
        const api = {
            pumpAll,
            peers: {
                list: () => registry.list(),
                // DOCUMENTO: salva PRIMA di consegnare al trasporto (ratchet e coda su disco), poi il giro di rete.
                async sendDocument(pid, msg) {
                    const p = registry.get(pid); if (!p) throw new Error('paziente non collegato');
                    await p.sendMessage(msg); await save(); pumpAll().catch(() => {});
                },
                // Avvisa il paziente (best effort: se il relay non risponde il paziente resta collegato fino al prossimo contatto
                // oppure lo scollega lui) e poi chiude il collegamento. Ritorna { notified }.
                async unlink(pid) {
                    const p = registry.get(pid); let notified = false;
                    if (p) {
                        try {
                            await p.sendMessage({ v: 1, t: 'peer.unlink', ref: b64u.enc(randomBytes(16)) });
                            await save();                                   // prima si salva, poi si consegna
                            const r = await p.pump(); notified = r.sent > 0 && r.errors.length === 0;
                        } catch { notified = false; }
                    }
                    registry.remove(pid); audit.record('device.revoke', { n: 1 }); await save();
                    return { notified };
                },
            },
            pairing: {
                // Avvia il collegamento di un paziente: ritorna uno stato interrogabile con poll() (anche dal componente UI).
                async start() {
                    if (pairingActive) pairingActive.cancel();
                    const c = await startDoctorPairing({ relay, doctor: identity, cfg, now });
                    let registered = false;
                    pairingActive = c;
                    return {
                        qr: c.qr, patientId: c.patientId, expiresAt: c.expiresAt,
                        get state() { return c.state; }, get sas() { return c.sas; }, get error() { return c.error; },
                        async poll() {
                            const st = await c.poll();
                            if (st === 'done' && !registered) {
                                registered = true;
                                registry.add({ pid: c.result.patientId, peerRecord: c.result.patientRecord, sid: c.result.sid, seed: c.result.seed });
                                audit.record('device.pair', { n: 1 });
                                await save();
                            }
                            return st;
                        },
                        confirmSas: (m) => c.confirmSas(m),
                        cancel: () => c.cancel(),
                    };
                },
            },
        };
        return Object.assign(api, {
            cfg, identity: identity.record, persistStatus: loaded.status, auditOk,
            audit, register: (name, part) => { parts[name] = part; },
            save,
            async stop() {
                stopped = true;                                   // niente nuovi giri né salvataggi
                if (timer) clearInterval(timer);
                if (pairingActive) pairingActive.cancel();
                while (inflight.size) await Promise.allSettled([...inflight]);
                audit.record('mode.change', { to: 'offline' });
                await persistence.save();
                dek.fill(0);                        // la chiave dei dati esce dalla memoria (best effort)
            },
        });
    } catch (e) {
        dek.fill(0);
        // Dati salvati cifrati con un'altra chiave (altro archivio, password cambiata, demo riavviata): mai sostituirli di nascosto.
        if (e && /aead|autenticazione/i.test(String(e.message))) { const k = new Error('I dati di connessione salvati su questo computer non si aprono con la chiave di questo archivio (archivio o password diversi da quando sono stati creati).'); k.code = 'KEY_MISMATCH'; throw k; }
        throw e;
    }
};
