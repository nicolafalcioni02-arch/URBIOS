// Relay IN MEMORIA con la stessa semantica del relay reale (usato nei test e come riferimento del contratto):
//   POST /m/<topic>              corpo = byte opachi → {id}
//   GET  /m/<topic>?after=<id>   → { items:[{id,data(b64url)}] }  (ordine crescente per id)
// Limiti lato server: dimensione, elementi per topic, TTL. Nessuna cancellazione su richiesta: solo TTL (SEC-13).
import { b64u } from '../crypto/bytes.js';
import { randomBytes } from '../crypto/random.js';
import { TOPIC_RE } from './topics.js';

export const createMemoryRelay = ({ maxBytes = 512 * 1024, maxPerTopic = 200, ttlMs = 72 * 3600 * 1000, now = () => Date.now() } = {}) => {
    const boxes = new Map();
    const json = (status, obj) => ({ ok: status < 300, status, text: async () => JSON.stringify(obj) });
    const fetch = async (url, init = {}) => {
        const u = new URL(url), m = /^\/m\/([^/]+)$/.exec(u.pathname);
        if (!m || !TOPIC_RE.test(m[1])) return json(404, {});
        const topic = m[1], t = now();
        const box = (boxes.get(topic) || []).filter((i) => i.exp > t);
        if (init.method === 'POST') {
            const body = init.body;
            if (!(body instanceof Uint8Array) || body.length === 0 || body.length > maxBytes) return json(413, {});
            if (box.length >= maxPerTopic) return json(429, {});
            const id = `${String(t).padStart(15, '0')}-${b64u.enc(randomBytes(6))}`;
            box.push({ id, data: body.slice(), exp: t + ttlMs });
            boxes.set(topic, box);
            return json(200, { id });
        }
        if (init.method === 'GET' || !init.method) {
            const after = u.searchParams.get('after') || '';
            return json(200, { items: box.filter((i) => i.id > after).slice(0, 50).map((i) => ({ id: i.id, data: b64u.enc(i.data) })) });
        }
        return json(405, {});
    };
    return { fetch, size: () => [...boxes.values()].reduce((n, b) => n + b.length, 0), boxes };
};
