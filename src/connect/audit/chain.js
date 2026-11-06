// Log append-only a catena di hash (SEC-90/92). Ogni voce include l'hash della precedente:
// modificare/togliere/riordinare una voce intermedia rompe la catena (verify la trova).
// LIMITE NOTO: togliere le ultime voci non si vede da solo ⇒ `head()` va ancorato altrove (firma/checkpoint).
// Niente dati clinici né segreti: `details` accetta solo scalari corti e nomi non sospetti.
import { sha256 } from '@noble/hashes/sha2.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { b64u } from '../crypto/bytes.js';
import { randomBytes } from '../crypto/random.js';
import { EVENT_TYPES } from './events.js';

export const GENESIS = 'genesis';
const FORBIDDEN_KEY = /(key|secret|pass|token|name|nome|diagnos|allerg|dose|note|text)/i;

const cleanDetails = (d = {}) => {
    const out = {};
    for (const [k, v] of Object.entries(d)) {
        if (FORBIDDEN_KEY.test(k)) throw new Error(`audit: campo "${k}" non ammesso nei dettagli`);
        if (typeof v === 'string' && v.length > 64) throw new Error('audit: stringa troppo lunga');
        if (!['string', 'boolean'].includes(typeof v) && !Number.isSafeInteger(v)) throw new Error('audit: solo scalari');
        out[k] = v;
    }
    return out;
};

const hashEntry = (e) => b64u.enc(sha256(canonicalBytes(e)));

// `store`: { last(): entry|null, append(entry): void } (persistenza iniettata, cifrata altrove).
export const createAuditLog = ({ store, deviceId, now = () => Date.now() }) => ({
    record(type, details) {
        if (!EVENT_TYPES.includes(type)) throw new Error('audit: tipo evento non ammesso');
        const prev = store.last();
        const body = {
            seq: prev ? prev.seq + 1 : 0,
            ts: now(),
            type,
            deviceId,
            opId: b64u.enc(randomBytes(12)),
            details: cleanDetails(details),
            prev: prev ? prev.hash : GENESIS,
        };
        const entry = { ...body, hash: hashEntry(body) };
        store.append(entry);
        return entry;
    },
});

export const verifyChain = (entries) => {
    let prev = GENESIS;
    for (let i = 0; i < entries.length; i++) {
        const { hash, ...body } = entries[i];
        if (body.seq !== i || body.prev !== prev || hashEntry(body) !== hash) return { ok: false, brokenAt: i };
        prev = hash;
    }
    return { ok: true, head: prev, length: entries.length };
};
