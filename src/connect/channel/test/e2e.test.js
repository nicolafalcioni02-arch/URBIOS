// Medico → paziente, di punto in bianco: pairing, canale, documenti, ack, duplicati, non autorizzati.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../config/load.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { newOpaqueId } from '../../identity/opaqueId.js';
import { createRevocationList } from '../../identity/revocation.js';
import { createDoctorPairing } from '../../pairing/doctorSession.js';
import { createPatientPairing } from '../../pairing/patientSession.js';
import { createInitiator, createResponder } from '../../ratchet/session.js';
import { createReplayState } from '../../envelope/steps/replay.js';
import { createChannel } from '../channel.js';
import { encodeMessage, decodeMessage } from '../../sync/message.js';
import { createDocStore } from '../../sync/docStore.js';
import { createOutbox } from '../../sync/outbox.js';
import { findIdentifiers } from '../../sync/identifiers.js';
import { createMemoryRelay } from '../../transport/memoryRelay.js';
import { createRelayClient } from '../../transport/relayClient.js';
import { createMailbox } from '../../transport/mailbox.js';
import { deriveTopicKey } from '../../transport/topics.js';
import { b64u } from '../../crypto/bytes.js';
import { randomBytes } from '../../crypto/random.js';

const cfg = loadConfig(), MAX = cfg.maxPayloadBytes;
const ref = () => b64u.enc(randomBytes(16));

const world = async () => {
    const T = Date.now();
    const doc = generateDeviceIdentity({ now: T }), pat = generateDeviceIdentity({ now: T });
    const d = createDoctorPairing({ doctorRecord: doc.record, cfg, now: T });
    const p = createPatientPairing({ qr: d.qr, doctorRecord: doc.record, identity: pat, now: T });
    d.receiveResponse(p.response, T + 1);
    const a = d.confirmLocal(true, T + 2), b = p.confirmLocal(true, T + 2);
    d.receivePeerConfirm(b, T + 3); p.receivePeerConfirm(a, T + 3);
    const D = d.finish(T + 4), P = p.finish(T + 4);
    const store = createDocStore({ allowedSenders: new Set([doc.record.deviceId]) });
    const outbox = createOutbox();
    const docCh = createChannel({ cfg, self: doc, peerRecord: pat.record, replay: createReplayState(), revocations: createRevocationList(),
        session: createInitiator({ seed: D.seed, sid: D.sid, peerKemPk: b64u.dec(pat.record.kemPk), maxSkippedKeys: cfg.maxSkippedKeys }),
        onPayload: async (bytes) => { const m = decodeMessage(bytes, MAX); if (m.t === 'ack') outbox.ack(m.of); } });
    const patCh = createChannel({ cfg, self: pat, peerRecord: doc.record, replay: createReplayState(), revocations: createRevocationList(),
        session: createResponder({ seed: P.seed, sid: P.sid, identityKem: { publicKey: b64u.dec(pat.record.kemPk), secretKey: pat.secret.kemSk }, maxSkippedKeys: cfg.maxSkippedKeys }),
        onPayload: async (bytes, from) => {
            const m = decodeMessage(bytes, MAX);
            store.apply(m, from);
            if (m.ref) await ackQueue.push(await patCh.send(encodeMessage({ v: 1, t: 'ack', of: m.ref }, MAX)));
        } });
    const ackQueue = [];
    return { doc, pat, docCh, patCh, store, outbox, ackQueue, docId: newOpaqueId('c') };
};
const put = (w, rev, title, body) => ({ v: 1, t: 'doc.put', ref: ref(), docId: w.docId, kind: 'diet', rev, parentRev: rev > 1 ? rev - 1 : null, title, body, at: 1 });

test('consegna di una dieta, aggiornamento, ack, nessun nome', async () => {
    const w = await world();
    const m1 = put(w, 1, 'Piano settimana 1', { kcal: 1800, pasti: [{ nome: 'Colazione', voci: ['yogurt', 'avena'] }] });
    w.outbox.enqueue(m1.ref, await w.docCh.send(encodeMessage(m1, MAX)), { now: 0 });
    for (const i of w.outbox.due(0)) { assert.deepEqual((await w.patCh.receive(i.payload)).ok, true); w.outbox.markSent(i.ref, 0); }
    assert.equal(w.store.current(w.docId).rev, 1);
    assert.equal(w.store.current(w.docId).body.kcal, 1800);
    // l'ack torna al medico e svuota la coda
    assert.equal(w.outbox.size(), 1);
    assert.deepEqual(await w.docCh.receive(w.ackQueue.shift()), { ok: true });
    assert.equal(w.outbox.size(), 0);
    // revisione 2
    const m2 = put(w, 2, 'Piano settimana 1', { kcal: 1700, pasti: [] });
    assert.ok((await w.patCh.receive(await w.docCh.send(encodeMessage(m2, MAX)))).ok);
    assert.equal(w.store.current(w.docId).rev, 2);
});

test('duplicato di rete (stessa busta) rifiutata; stesso contenuto con nuova busta idempotente', async () => {
    const w = await world();
    const m = put(w, 1, 't', { a: 1 });
    const env = await w.docCh.send(encodeMessage(m, MAX));
    assert.ok((await w.patCh.receive(env)).ok);
    assert.deepEqual(await w.patCh.receive(env), { ok: false, reason: 'replay' });
    assert.ok((await w.patCh.receive(await w.docCh.send(encodeMessage(m, MAX)))).ok); // rinvio del medico
    assert.equal(w.store.list().length, 1);
    assert.equal(w.store.conflicts().length, 0);
});

test('stessa revisione con contenuto diverso ⇒ conflitto conservato, non sovrascritto', async () => {
    const w = await world();
    await w.patCh.receive(await w.docCh.send(encodeMessage(put(w, 1, 'A', { x: 1 }), MAX)));
    await w.patCh.receive(await w.docCh.send(encodeMessage(put(w, 1, 'A', { x: 2 }), MAX)));
    assert.equal(w.store.current(w.docId).body.x, 1);
    assert.equal(w.store.conflicts().length, 1);
});

test('mittente non autorizzato ⇒ non applicato', async () => {
    const w = await world();
    const s = createDocStore({ allowedSenders: new Set(['d1.' + 'Z'.repeat(22)]) });
    assert.equal(s.apply(put(w, 1, 't', {}), w.doc.record.deviceId).status, 'unauthorized');
    assert.equal(s.list().length, 0);
});

test('schema: tipi, decimali, profondità, dimensione, proto', () => {
    const w = { docId: newOpaqueId('c') };
    assert.throws(() => encodeMessage(put(w, 1, 't', { kg: 1.5 }), MAX));
    assert.throws(() => encodeMessage({ ...put(w, 1, 't', {}), kind: 'altro' }, MAX));
    assert.throws(() => encodeMessage({ ...put(w, 2, 't', {}), parentRev: 5 }, MAX));
    let deep = {}; let cur = deep; for (let i = 0; i < 12; i++) { cur.a = {}; cur = cur.a; }
    assert.throws(() => encodeMessage(put(w, 1, 't', deep), MAX));
    assert.throws(() => encodeMessage(put(w, 1, 't', { s: 'x'.repeat(3000) }), MAX));
    assert.throws(() => encodeMessage(put(w, 1, 't', { a: 1 }), 20));
    assert.throws(() => decodeMessage(new TextEncoder().encode('{"v":1,"t":"boh"}'), MAX));
});

test('controllo nomi: titoli, note, accenti, chiavi', () => {
    const d = { title: 'Dieta di Mario Rossi', body: { note: 'ok' } };
    assert.deepEqual(findIdentifiers(d, ['Mario', 'Rossi']).length, 2);
    assert.equal(findIdentifiers({ title: 'Piano 1', body: { pasti: ['pane'] } }, ['Mario', 'Rossi']).length, 0);
    assert.ok(findIdentifiers({ title: 'x', body: { 'José': 1 } }, ['jose']).length > 0);
    assert.ok(findIdentifiers({ title: 'x', body: { nota: 'per ROSSI, a digiuno' } }, ['Rossi']).length > 0);
});

test('outbox: backoff, priorità, ack, limiti, snapshot', () => {
    const o = createOutbox({ baseDelayMs: 1000, maxDelayMs: 4000, maxAttempts: 3 });
    o.enqueue('a', new Uint8Array([1]), { priority: 5, now: 0 });
    o.enqueue('b', new Uint8Array([2]), { priority: 1, now: 0 });
    assert.deepEqual(o.due(0).map((i) => i.ref), ['b', 'a']);
    o.markSent('b', 0); assert.deepEqual(o.due(500).map((i) => i.ref), ['a']);
    assert.ok(o.due(1000).some((i) => i.ref === 'b'));
    o.markSent('b', 1000); o.markSent('b', 3000);                  // 3 tentativi
    assert.deepEqual(o.failed(), ['b']);
    assert.equal(o.enqueue('a', new Uint8Array([1]), { now: 0 }), false);
    const o2 = createOutbox(); o2.restore(o.snapshot()); assert.equal(o2.size(), 2);
    assert.ok(o.ack('a') && o.size() === 1);
    assert.throws(() => createOutbox({ maxBytes: 2 }).enqueue('z', new Uint8Array(5), { now: 0 }));
});

test('rete completa: outbox → relay non fidato → paziente → ack → medico; relay vede solo byte opachi', async () => {
    const w = await world();
    const relay = createMemoryRelay(), client = createRelayClient({ baseUrl: 'https://relay.example.org', fetchImpl: relay.fetch });
    const seed = randomBytes(32), sid = w.docCh ? 's1.' + 'B'.repeat(22) : '';
    const kd = deriveTopicKey(seed, 'd2p'), kp = deriveTopicKey(seed, 'p2d');
    const docBox = createMailbox({ relay: client, outTopicKey: kd, inTopicKey: kp, sid }), patBox = createMailbox({ relay: client, outTopicKey: kp, inTopicKey: kd, sid });
    const m = put(w, 1, 'Piano', { kcal: 1800 });
    w.outbox.enqueue(m.ref, await w.docCh.send(encodeMessage(m, MAX)), { now: 0 });
    for (const i of w.outbox.due(0)) { await docBox.send(i.payload); w.outbox.markSent(i.ref, 0); }
    for (const msg of (await patBox.poll()).messages) assert.ok((await w.patCh.receive(msg)).ok);
    for (const a of w.ackQueue.splice(0)) await patBox.send(a);
    for (const msg of (await docBox.poll()).messages) assert.ok((await w.docCh.receive(msg)).ok);
    assert.equal(w.store.current(w.docId).body.kcal, 1800);
    assert.equal(w.outbox.size(), 0);
    // il relay non contiene nulla di leggibile: né testo del piano né id di dispositivo
    const dump = JSON.stringify([...relay.boxes.values()].flat().map((i) => Array.from(i.data)));
    const raw = [...relay.boxes.values()].flat().map((i) => new TextDecoder('latin1').decode(i.data)).join('');
    assert.ok(!raw.includes('kcal') && !raw.includes('Piano') && dump.length > 0);
    assert.ok(!raw.includes(w.doc.record.deviceId) && !raw.includes(w.pat.record.deviceId) && !raw.includes('d1.')); // nemmeno gli id pseudonimi
});
