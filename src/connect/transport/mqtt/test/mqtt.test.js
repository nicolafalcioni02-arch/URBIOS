import test from 'node:test';
import assert from 'node:assert/strict';
import { createMqttRelay } from '../mqttRelay.js';
import { createReader, encode } from '../packets.js';
import { createFakeBroker } from './fakeBroker.js';
import { createMailbox } from '../../mailbox.js';
import { deriveTopicKey } from '../../topics.js';
import { randomBytes } from '../../../crypto/random.js';
import { b64u } from '../../../crypto/bytes.js';

const URL_ = 'wss://broker.example.org:8884/mqtt';
const topic = () => b64u.enc(randomBytes(32));
const mk = (b, o = {}) => createMqttRelay({ url: URL_, WebSocketImpl: b.WebSocket, fallbackMs: 50, graceMs: 5, timeoutMs: 1500, ...o });

test('lettore: pacchetti spezzati e accorpati, lunghezze assurde rifiutate', () => {
    const a = encode.publish({ topic: 't/x', payload: new Uint8Array(300).fill(7), qos: 1, id: 9, retain: true });
    const r = createReader(), out = [];
    for (let i = 0; i < a.length; i += 5) out.push(...r.push(a.slice(i, i + 5)));
    assert.equal(out.length, 1); assert.equal(out[0].payload.length, 300); assert.equal(out[0].retain, true); assert.equal(out[0].id, 9);
    assert.equal(createReader().push(cat2(a, a)).length, 2);
    assert.throws(() => createReader().push(Uint8Array.from([0x30, 0xff, 0xff, 0xff, 0xff, 0x7f])));
    assert.throws(() => createReader().push(Uint8Array.from([0x30, 0x80, 0x80, 0x80, 0x80, 0x01])));
    assert.throws(() => createReader().push(Uint8Array.from([0x36, 0x02, 0x00, 0x01])));   // qos 3
});
const cat2 = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };

test('put → fetchNew: consegna, ordine, poi il broker non conserva più nulla', async () => {
    const b = createFakeBroker(), r = mk(b), t = topic();
    const i1 = await r.put(t, Uint8Array.from([1, 2, 3])), i2 = await r.put(t, Uint8Array.from([4]));
    assert.ok(i1 < i2 || i1.slice(0, 15) <= i2.slice(0, 15));
    assert.equal(b.retained.size, 2);
    const got = await r.fetchNew(t, '');
    assert.deepEqual(got.map((x) => Array.from(x.data)).sort(), [[1, 2, 3], [4]]);
    assert.equal(b.retained.size, 0);                              // cancellati dal broker
    assert.deepEqual(await r.fetchNew(t, ''), []);
});

test('topic diversi non si mescolano; broker con frame minuscoli funziona', async () => {
    const b = createFakeBroker({ chunk: 3 }), r = mk(b), t1 = topic(), t2 = topic();
    await r.put(t1, new Uint8Array(5000).fill(1)); await r.put(t2, Uint8Array.from([9]));
    assert.equal((await r.fetchNew(t1, '')).length, 1);
    assert.deepEqual(Array.from((await r.fetchNew(t2, ''))[0].data), [9]);
});

test('errori: broker rifiuta, indirizzo non wss, messaggio vuoto/enorme, topic non valido, broker muto', async () => {
    await assert.rejects(mk(createFakeBroker({ rejectConnect: true })).put(topic(), Uint8Array.from([1])), /rifiutato/);
    assert.throws(() => createMqttRelay({ url: 'ws://x', WebSocketImpl: createFakeBroker().WebSocket }));
    const r = mk(createFakeBroker());
    await assert.rejects(r.put(topic(), new Uint8Array(0)));
    await assert.rejects(r.put(topic(), new Uint8Array(100 * 1024)));
    await assert.rejects(r.put('corto', Uint8Array.from([1])));
    class Mute { constructor() { this.readyState = 1; setTimeout(() => this.onopen(), 0); } send() {} close() {} }
    await assert.rejects(createMqttRelay({ url: URL_, WebSocketImpl: Mute, timeoutMs: 100 }).put(topic(), Uint8Array.from([1])), /non risponde/);
});

test('messaggi estranei nel prefisso (id malformato, payload vuoto) ignorati', async () => {
    const b = createFakeBroker(), r = mk(b), t = topic();
    b.retained.set(`urbios/v1/${t}/non-un-id`, Uint8Array.from([1]));
    b.retained.set(`urbios/v1/${t}/${'1'.repeat(15)}-ok`, Uint8Array.from([2]));
    const got = await r.fetchNew(t, '');
    assert.equal(got.length, 1); assert.deepEqual(Array.from(got[0].data), [2]);
});

test('con la casella (mailbox): invio e lettura tra due lati, nessun duplicato', async () => {
    const b = createFakeBroker(), seed = randomBytes(32), sid = 's1.' + 'B'.repeat(22);
    const kd = deriveTopicKey(seed, 'd2p'), kp = deriveTopicKey(seed, 'p2d');
    const doc = createMailbox({ relay: mk(b), outTopicKey: kd, inTopicKey: kp, sid }), pat = createMailbox({ relay: mk(b), outTopicKey: kp, inTopicKey: kd, sid });
    await doc.send(Uint8Array.from([1, 1, 1]));
    const p1 = await pat.poll(); assert.deepEqual(p1.messages.map((m) => Array.from(m)), [[1, 1, 1]]);
    assert.equal((await pat.poll()).messages.length, 0);
    await pat.send(Uint8Array.from([2]));
    assert.deepEqual((await doc.poll()).messages.map((m) => Array.from(m)), [[2]]);
});
