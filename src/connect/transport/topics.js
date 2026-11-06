// Topic/caselle opache (SEC-83): topic = HMAC-SHA256(chiave_topic, sid || epoca). La chiave deriva dal seme
// della sessione (HKDF) ⇒ chi non conosce il seme non può ricavare né collegare i topic; cambiano ogni ora.
// L'OPACITÀ NON È AUTORIZZAZIONE: chiunque indovini/abbia un topic può scriverci; la sicurezza vera è nella busta firmata.
import { hkdfSha256 } from '../crypto/kdf.js';
import { hmacSha256 } from '../crypto/mac.js';
import { b64u, concat, utf8, u32be } from '../crypto/bytes.js';

export const EPOCH_MS = 3600 * 1000;
export const TOPIC_RE = /^[A-Za-z0-9_-]{43}$/;
export const DIRECTIONS = ['d2p', 'p2d'];   // medico→paziente, paziente→medico

export const deriveTopicKey = (seed, direction) => {
    if (!DIRECTIONS.includes(direction)) throw new Error('direzione non valida');
    return hkdfSha256(seed, { purpose: `transport/topic-key/${direction}` });
};

export const epochOf = (now) => Math.floor(now / EPOCH_MS);

export const topicFor = (topicKey, sid, epoch) =>
    b64u.enc(hmacSha256(topicKey, concat(utf8(sid), new Uint8Array([0]), u32be(epoch >>> 0))));

// Topic su cui scrivere ora.
export const sendTopic = (topicKey, sid, now) => topicFor(topicKey, sid, epochOf(now));

// Topic da ascoltare: epoca precedente (messaggi in volo), corrente e successiva (orologi sfasati).
export const listenTopics = (topicKey, sid, now) => {
    const e = epochOf(now);
    return [e - 1, e, e + 1].map((x) => topicFor(topicKey, sid, x));
};

// Caselle del pairing (breve durata, NON ruotano): derivate dal segreto monouso del QR e dall'id di pairing.
// Chi non ha visto il QR non le conosce. Scadono comunque (TTL del relay) e il pairing ha la sua scadenza.
export const pairingTopic = (ps, pid, direction) => {
    if (!['d2p', 'p2d'].includes(direction)) throw new Error('direzione non valida');
    const key = hkdfSha256(ps, { purpose: `transport/pairing-topic/${direction}` });
    return b64u.enc(hmacSha256(key, utf8(pid)));
};
