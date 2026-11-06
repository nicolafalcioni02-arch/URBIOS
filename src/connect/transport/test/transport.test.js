import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from '../../crypto/random.js';
import { deriveTopicKey, topicFor, sendTopic, listenTopics, epochOf, EPOCH_MS, TOPIC_RE } from '../topics.js';
import { createMemoryRelay } from '../memoryRelay.js';
import { createRelayClient } from '../relayClient.js';
import { createMailbox } from '../mailbox.js';

const seed = randomBytes(32), sid = 's1.' + 'A'.repeat(22);
const T = 1_800_000_000_000;

test('topic: formato, direzioni diverse, epoche diverse, seme diverso, rotazione con overlap', () => {
    const kd = deriveTopicKey(seed, 'd2p'), kp = deriveTopicKey(seed, 'p2d');
    const t = sendTopic(kd, sid, T);
    assert.match(t, TOPIC_RE);
    assert.notEqual(t, sendTopic(kp, sid, T));
    assert.notEqual(t, sendTopic(kd, sid, T + EPOCH_MS));
    assert.notEqual(t, sendTopic(deriveTopicKey(randomBytes(32), 'd2p'), sid, T));
    assert.equal(t, sendTopic(kd, sid, T + 1000 > Math.ceil(T / EPOCH_MS) * EPOCH_MS ? T : T + 1));
    // chi ascolta a cavallo dell'ora vede ancora i messaggi dell'epoca precedente
    assert.ok(listenTopics(kd, sid, T + EPOCH_MS).includes(t));
    assert.throws(() => deriveTopicKey(seed, 'x2y'));
});

const rig = (relayOpts = {}) => {
    let clock = T;
    const relay = createMemoryRelay({ now: () => clock, ...relayOpts });
    const client = createRelayClient({ baseUrl: 'https://relay.example.org', fetchImpl: relay.fetch });
    const kd = deriveTopicKey(seed, 'd2p'), kp = deriveTopicKey(seed, 'p2d');
    const doc = createMailbox({ relay: client, outTopicKey: kd, inTopicKey: kp, sid, now: () => clock });
    const pat = createMailbox({ relay: client, outTopicKey: kp, inTopicKey: kd, sid, now: () => clock });
    return { relay, client, doc, pat, tick: (ms) => { clock += ms; } };
};

test('invio e ricezione; nessun duplicato al secondo poll; ordine', async () => {
    const r = rig();
    await r.doc.send(new Uint8Array([1])); await r.doc.send(new Uint8Array([2]));
    const a = await r.pat.poll();
    assert.deepEqual(a.messages.map((m) => m[0]), [1, 2]);
    assert.deepEqual((await r.pat.poll()).messages, []);
    await r.doc.send(new Uint8Array([3]));
    assert.deepEqual((await r.pat.poll()).messages.map((m) => m[0]), [3]);
});

test('cambio ora: il messaggio inviato prima del cambio si riceve dopo (overlap)', async () => {
    const r = rig();
    await r.doc.send(new Uint8Array([7]));
    r.tick(EPOCH_MS);
    assert.deepEqual((await r.pat.poll()).messages.map((m) => m[0]), [7]);
});

test('TTL: messaggi scaduti spariscono; limiti server (dimensione, quota)', async () => {
    const r = rig({ ttlMs: 1000, maxPerTopic: 2 });
    await r.doc.send(new Uint8Array([1])); await r.doc.send(new Uint8Array([2]));
    await assert.rejects(r.doc.send(new Uint8Array([3])), /429/);
    r.tick(2000);
    assert.deepEqual((await r.pat.poll()).messages, []);
    await assert.rejects(createRelayClient({ baseUrl: 'https://x', fetchImpl: r.relay.fetch, maxMessageBytes: 10 }).put('A'.repeat(43), new Uint8Array(11)));
});

test('relay ostile: JSON/campi malformati, risposta enorme, errore di rete ⇒ errore gestito, mai crash', async () => {
    const topic = 'A'.repeat(43);
    const mk = (text, ok = true) => createRelayClient({ baseUrl: 'https://x', fetchImpl: async () => ({ ok, status: ok ? 200 : 500, text: async () => text }) });
    await assert.rejects(mk('non json').fetchNew(topic));
    await assert.rejects(mk('{"items":[{"id":"../x","data":"AA"}]}').fetchNew(topic));
    await assert.rejects(mk('{"items":[{"id":"000000000000001-a","data":"!!"}]}').fetchNew(topic));
    await assert.rejects(mk('{"items":' + JSON.stringify(Array(51).fill({ id: '000000000000001-a', data: 'AA' })) + '}').fetchNew(topic));
    await assert.rejects(mk('x'.repeat(5 * 1024 * 1024)).fetchNew(topic));
    await assert.rejects(mk('{}', false).fetchNew(topic));
    await assert.rejects(mk('{"id":"../etc"}').put(topic, new Uint8Array([1])));
    await assert.rejects(mk('{}').fetchNew('troppo-corto'));
    const down = createMailbox({ relay: createRelayClient({ baseUrl: 'https://x', fetchImpl: async () => { throw new Error('rete'); } }),
        outTopicKey: deriveTopicKey(seed, 'd2p'), inTopicKey: deriveTopicKey(seed, 'p2d'), sid, now: () => T });
    const res = await down.poll();
    assert.deepEqual(res.messages, []); assert.equal(res.errors.length, 3);
});

test('timeout: richiesta che non risponde viene interrotta', async () => {
    const c = createRelayClient({ baseUrl: 'https://x', timeoutMs: 20, fetchImpl: (u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('abort')))) });
    await assert.rejects(c.fetchNew('A'.repeat(43)), /abort/);
});
