// Relay su BROKER MQTT PUBBLICO (gratuito, non fidato) con la stessa interfaccia di relayClient: put(topic, bytes) / fetchNew(topic, after).
//  - ogni messaggio è un PUBLISH *retained* su `urbios/v1/<topic>/<id>`: il broker lo tiene finché può (nessuna garanzia: se sparisce,
//    l'outbox del medico lo rimanda). Il topic è opaco (HMAC), il contenuto è già cifrato e firmato.
//  - fetchNew: si connette, si iscrive a `urbios/v1/<topic>/+`, raccoglie i messaggi conservati, poi li CANCELLA dal broker
//    (retained vuoto) così non restano lì e non si rileggono. Una connessione per operazione: semplice e senza stato.
import { b64u } from '../../crypto/bytes.js';
import { randomBytes } from '../../crypto/random.js';
import { TOPIC_RE } from '../topics.js';
import { encode, createReader } from './packets.js';

const ID_RE = /^\d{15}-[0-9A-Za-z_-]{1,32}$/;
const PREFIX = 'urbios/v1/';

export const createMqttRelay = ({ url, WebSocketImpl = globalThis.WebSocket, now = () => Date.now(), timeoutMs = 12000, fallbackMs = 1500, graceMs = 150, maxMessageBytes = 96 * 1024, maxItems = 50 }) => {
    if (!WebSocketImpl) throw new Error('WebSocket non disponibile');
    if (!/^wss:\/\//.test(url)) throw new Error('serve un indirizzo wss://');

    // Esegue `job(session)` su una connessione nuova; chiude sempre. Errore/timeout ⇒ eccezione (non fatale per il chiamante).
    const withConnection = (job) => new Promise((resolve, reject) => {
        let ws, done = false, pid = 0;
        const waiters = [];                                    // { match, resolve }
        const reader = createReader();
        const events = [];
        const finish = (err, val) => {
            if (done) return; done = true; clearTimeout(timer);
            try { ws && ws.readyState === 1 && ws.send(encode.disconnect()); } catch { /* si chiude comunque */ }
            try { ws && ws.close(); } catch { /* idem */ }
            err ? reject(err) : resolve(val);
        };
        const timer = setTimeout(() => finish(new Error('broker non risponde')), timeoutMs);
        const dispatch = (p) => {
            events.push(p);
            for (let i = 0; i < waiters.length; i++) if (waiters[i].match(p)) { const [w] = waiters.splice(i, 1); w.resolve(p); break; }
        };
        const wait = (match) => new Promise((res) => { const hit = events.find(match); if (hit) return res(hit); waiters.push({ match, resolve: res }); });
        const send = (b) => ws.send(b);
        try { ws = new WebSocketImpl(url, 'mqtt'); } catch (e) { clearTimeout(timer); return reject(e); }
        ws.binaryType = 'arraybuffer';
        ws.onerror = () => finish(new Error('connessione al broker fallita'));
        ws.onclose = () => finish(new Error('connessione chiusa'));
        ws.onmessage = (ev) => {
            try { if (typeof ev.data === 'string') throw new Error('dati non validi'); for (const p of reader.push(new Uint8Array(ev.data))) dispatch(p); } catch (e) { finish(e); }
        };
        ws.onopen = async () => {
            try {
                send(encode.connect({ clientId: 'u' + b64u.enc(randomBytes(12)) }));
                const ack = await wait((p) => p.type === 'connack');
                if (ack.rc !== 0) throw new Error('broker ha rifiutato la connessione');
                const val = await job({
                    send, wait, events, nextId: () => (pid = (pid % 65535) + 1),
                    // solo ciò che arriva DOPO la chiamata e rispetta il prefisso
                    drain: () => events.splice(0, events.length),
                });
                finish(null, val);
            } catch (e) { finish(e); }
        };
    });

    const mqttTopic = (topic, id) => `${PREFIX}${topic}/${id}`;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    return {
        async put(topic, bytes) {
            if (!TOPIC_RE.test(topic)) throw new Error('topic non valido');
            if (bytes.length === 0 || bytes.length > maxMessageBytes) throw new Error('messaggio fuori limiti');
            const id = `${String(now()).padStart(15, '0')}-${b64u.enc(randomBytes(6))}`;
            await withConnection(async (s) => {
                const n = s.nextId();
                s.send(encode.publish({ topic: mqttTopic(topic, id), payload: bytes, qos: 1, retain: true, id: n }));
                await s.wait((p) => p.type === 'puback' && p.id === n);
            });
            return id;
        },
        async fetchNew(topic, after = '') {
            if (!TOPIC_RE.test(topic)) throw new Error('topic non valido');
            const base = `${PREFIX}${topic}/`;
            let collected = null;
            const run = withConnection(async (s) => {
                const n = s.nextId();
                s.send(encode.subscribe({ id: n, topic: base + '+' }));
                const sub = await s.wait((p) => p.type === 'suback' && p.id === n);
                if (sub.rc === 0x80) throw new Error('iscrizione rifiutata');
                // il broker consegna per primi i messaggi conservati. Per sapere quando ha finito si pubblica un segnale (non conservato) sul
                // proprio prefisso: il broker lo rimanda a chi è iscritto, e arriva dopo i conservati. Senza eco: si attende al massimo `fallbackMs`.
                const marker = `${base}~${b64u.enc(randomBytes(6))}`;
                s.send(encode.publish({ topic: marker, payload: Uint8Array.of(1), qos: 0 }));
                await Promise.race([s.wait((p) => p.type === 'publish' && p.topic === marker), sleep(fallbackMs)]);
                await sleep(graceMs);
                const found = new Map();
                for (const p of s.drain()) {
                    if (p.type !== 'publish' || !p.topic.startsWith(base) || p.payload.length === 0) continue;
                    const id = p.topic.slice(base.length);
                    if (!ID_RE.test(id) || p.payload.length > maxMessageBytes) continue;
                    if (found.size < maxItems && !found.has(id)) found.set(id, p.payload);
                }
                const items = [...found].filter(([id]) => id > after).sort((a, b) => (a[0] < b[0] ? -1 : 1));
                collected = items;                              // da qui in poi un errore di pulizia NON deve far perdere ciò che è stato letto
                // pulizia dal broker: retained vuoto (QoS 1, con conferma). Se non riesce, il messaggio si rilegge e si scarta (dedup).
                for (const [id] of items) {
                    const k = s.nextId();
                    s.send(encode.publish({ topic: mqttTopic(topic, id), payload: new Uint8Array(0), qos: 1, retain: true, id: k }));
                    await Promise.race([s.wait((p) => p.type === 'puback' && p.id === k), sleep(2500)]);
                }
                return items;
            });
            let got;
            try { got = await run; } catch (e) { if (!collected) throw e; got = collected; }
            return got.map(([id, data]) => ({ id, data }));
        },
    };
};
