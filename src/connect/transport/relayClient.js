// Client HTTP del relay (fetch standard, nessuna dipendenza). Il relay è NON FIDATO: qui si limita solo il danno
// (https obbligatorio in prod, timeout, tetto sulla dimensione delle risposte, validazione di ogni campo).
import { b64u } from '../crypto/bytes.js';
import { TOPIC_RE } from './topics.js';

const MAX_RESPONSE_CHARS = 4 * 1024 * 1024;
// id del relay: "<15 cifre ms>-<suffisso>". L'ordine entro lo STESSO millisecondo non è garantito ⇒ il cursore
// (vedi mailbox.js) riparte dal millisecondo precedente e i duplicati si scartano lato client.
const ID_RE = /^\d{15}-[0-9A-Za-z_-]{1,32}$/;

export const createRelayClient = ({ baseUrl, fetchImpl = globalThis.fetch, timeoutMs = 15000, maxMessageBytes = 512 * 1024 }) => {
    const url = (topic, q = '') => {
        if (!TOPIC_RE.test(topic)) throw new Error('topic non valido');
        return `${baseUrl.replace(/\/$/, '')}/m/${topic}${q}`;
    };
    const call = async (u, init) => {
        const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
        try { return await fetchImpl(u, { ...init, signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer' }); } finally { clearTimeout(timer); }
    };
    return {
        async put(topic, bytes) {
            if (bytes.length === 0 || bytes.length > maxMessageBytes) throw new Error('messaggio fuori limiti');
            const r = await call(url(topic), { method: 'POST', body: bytes, headers: { 'content-type': 'application/octet-stream' } });
            if (!r.ok) throw new Error(`relay ${r.status}`);
            const j = JSON.parse((await r.text()).slice(0, 1024));
            if (!j || !ID_RE.test(j.id)) throw new Error('risposta relay non valida');
            return j.id;
        },
        async fetchNew(topic, after = '') {
            const r = await call(url(topic, after ? `?after=${encodeURIComponent(after)}` : ''), { method: 'GET' });
            if (!r.ok) throw new Error(`relay ${r.status}`);
            const text = await r.text();
            if (text.length > MAX_RESPONSE_CHARS) throw new Error('risposta relay troppo grande');
            const j = JSON.parse(text);
            if (!j || !Array.isArray(j.items) || j.items.length > 50) throw new Error('risposta relay non valida');
            return j.items.map((i) => {
                if (!ID_RE.test(i.id) || typeof i.data !== 'string') throw new Error('risposta relay non valida');
                const data = b64u.dec(i.data);
                if (data.length > maxMessageBytes) throw new Error('risposta relay non valida');
                return { id: i.id, data };
            });
        },
    };
};
