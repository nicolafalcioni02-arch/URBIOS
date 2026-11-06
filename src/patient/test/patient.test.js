// App paziente (logica) contro il vero runtime del medico, via relay in memoria.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPatientVault, unlockPatientVault, startPatient, hasVault } from '../runtime.js';
import { startRuntime } from '../../connect/runtime.js';
import { memoryKv } from '../../connect/persist/kv.js';
import { createMemoryRelay } from '../../connect/transport/memoryRelay.js';
import { newOpaqueId } from '../../connect/identity/opaqueId.js';
import { randomBytes } from '../../connect/crypto/random.js';
import { b64u } from '../../connect/crypto/bytes.js';

const consent = { health: true, terms: true, sync: true };
const docMaster = randomBytes(32), deriveKey = async () => docMaster.slice();
const settings = { relayUrl: 'https://relay.example.org' };
const put = (docId, rev, title, body) => ({ v: 1, t: 'doc.put', ref: b64u.enc(randomBytes(16)), docId, kind: 'diet', rev, parentRev: rev > 1 ? rev - 1 : null, title, body, at: 1 });
const PASS = 'una frase lunga e solida 2026';

test('cassaforte: passphrase corta, consenso mancante, sbagliata, giusta', async () => {
    const kv = memoryKv();
    assert.equal(await hasVault(kv), false);
    await assert.rejects(createPatientVault(kv, 'corta', consent), /PASSPHRASE/);
    await assert.rejects(createPatientVault(kv, PASS, { health: true }), /CONSENSO/);
    const { consent: c } = await createPatientVault(kv, PASS, consent);
    assert.equal(c.version, '2026-11-v1');
    assert.equal(await hasVault(kv), true);
    await assert.rejects(unlockPatientVault(kv, 'sbagliata sbagliata'), /WRONG_SECRET/);
    assert.equal((await unlockPatientVault(kv, PASS)).length, 32);
});

test('flusso reale: QR del medico → collegamento → dieta → ack → riavvio paziente', async () => {
    const relayMem = createMemoryRelay(), docKv = memoryKv(), patKv = memoryKv();
    const doctor = await startRuntime({ settings, deriveKey, kv: docKv, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    const { master, consent: c } = await createPatientVault(patKv, PASS, consent);
    const p = await startPatient({ master, kv: patKv, consent: c, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    assert.equal(p.status().linked, false);

    const d = await doctor.pairing.start();
    const pc = await p.beginPairing(new TextDecoder().decode(d.qr));          // il paziente "inquadra" il QR
    await pc.poll(); await d.poll();
    assert.equal(d.sas, pc.sas);
    await d.confirmSas(true); await pc.confirmSas(true);
    await d.poll(); await pc.poll();
    assert.equal(pc.state, 'done'); assert.equal(p.status().linked, true);
    assert.equal(p.status().relayUrl, settings.relayUrl);                     // il relay arriva dal QR

    const docId = newOpaqueId('c');
    await doctor.peers.sendDocument(d.patientId, put(docId, 1, 'Piano 1', { kcal: 1800, pasti: ['colazione'] }));
    await doctor.pumpAll();
    await p.sync();                                                            // riceve e mette in coda l'ack
    await p.sync();                                                            // invia l'ack
    await doctor.pumpAll();
    assert.equal(p.docs.list().length, 1);
    assert.equal(p.docs.get(docId).body.kcal, 1800);
    assert.equal(doctor.peers.list()[0].queued, 0);

    // il paziente chiude e riapre l'app: passphrase, stesso collegamento, nuovo documento
    p.stop();
    const master2 = await unlockPatientVault(patKv, PASS);
    const p2 = await startPatient({ master: master2, kv: patKv, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    assert.equal(p2.persistStatus, 'ok'); assert.equal(p2.status().linked, true);
    assert.equal(p2.status().consent.version, '2026-11-v1');
    assert.equal(p2.docs.list().length, 1);
    await doctor.peers.sendDocument(d.patientId, put(docId, 2, 'Piano 1', { kcal: 1700 }));
    await doctor.pumpAll(); await p2.sync();
    assert.equal(p2.docs.get(docId).rev, 2);
    // nessun nome: l'app non conosce altro che codici anonimi
    assert.match(p2.deviceId, /^d1\./);
    await p2.forgetAll();
    assert.equal(patKv._m.size, 0);
    await doctor.stop();
});

test('QR non valido / relay http / scaduto ⇒ errore; documento da sconosciuto ignorato', async () => {
    const relayMem = createMemoryRelay(), kv = memoryKv();
    const { master } = await createPatientVault(kv, PASS, consent);
    const p = await startPatient({ master, kv, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    await assert.rejects(p.beginPairing('non è un qr'));
    await assert.rejects(p.beginPairing('{"v":1}'));
    p.stop();
});

const linkUp = async () => {
    const relayMem = createMemoryRelay(), patKv = memoryKv();
    const doctor = await startRuntime({ settings, deriveKey, kv: memoryKv(), fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    const { master, consent: c } = await createPatientVault(patKv, PASS, consent);
    const p = await startPatient({ master, kv: patKv, consent: c, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    const d = await doctor.pairing.start(), pc = await p.beginPairing(new TextDecoder().decode(d.qr));
    await pc.poll(); await d.poll(); await d.confirmSas(true); await pc.confirmSas(true); await d.poll(); await pc.poll();
    return { relayMem, patKv, doctor, p, d, master };
};

test('ritiro: il documento ritirato sparisce dalla lista del paziente; una nuova revisione lo riporta', async () => {
    const { doctor, p, d } = await linkUp();
    const docId = newOpaqueId('c');
    await doctor.peers.sendDocument(d.patientId, put(docId, 1, 'Piano', { a: 1 }));
    await doctor.pumpAll(); await p.sync();
    assert.equal(p.docs.list().length, 1);
    await doctor.peers.sendDocument(d.patientId, { v: 1, t: 'doc.withdraw', ref: b64u.enc(randomBytes(16)), docId, rev: 1 });
    await doctor.pumpAll(); await p.sync();
    assert.equal(p.docs.list().length, 0); assert.equal(p.docs.get(docId), null);
    await doctor.peers.sendDocument(d.patientId, put(docId, 2, 'Piano', { a: 2 }));
    await doctor.pumpAll(); await p.sync();
    assert.equal(p.docs.get(docId).rev, 2);
    await doctor.stop(); p.stop();
});

test('scollega: il paziente viene avvisato, perde il collegamento ma tiene i piani; si può ricollegare', async () => {
    const { relayMem, patKv, doctor, p, d, master } = await linkUp();
    const docId = newOpaqueId('c');
    await doctor.peers.sendDocument(d.patientId, put(docId, 1, 'Piano', { a: 1 }));
    await doctor.pumpAll(); await p.sync();
    const r = await doctor.peers.unlink(d.patientId);
    assert.equal(r.notified, true);
    assert.equal(doctor.peers.list().length, 0);
    await p.sync();
    assert.equal(p.status().linked, false); assert.ok(p.status().unlinkedAt);
    assert.equal(p.docs.list().length, 1);                       // i piani già ricevuti restano
    p.stop();
    const p2 = await startPatient({ master, kv: patKv, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });   // anche dopo il riavvio
    assert.equal(p2.status().linked, false); assert.equal(p2.docs.list().length, 1);
    // un documento di un ex collegamento non viene accettato
    await assert.rejects(doctor.peers.sendDocument(d.patientId, put(docId, 2, 'x', {})));
    const d2 = await doctor.pairing.start(), pc = await p2.beginPairing(new TextDecoder().decode(d2.qr));
    await pc.poll(); await d2.poll(); await d2.confirmSas(true); await pc.confirmSas(true); await d2.poll(); await pc.poll();
    assert.equal(p2.status().linked, true); assert.equal(p2.status().unlinkedAt, null);
    await doctor.stop(); p2.stop();
});

test('scollega con relay giù: nessun avviso consegnato (notified=false), il medico chiude comunque', async () => {
    const relayMem = createMemoryRelay(); let down = false;
    const fetchImpl = (...a) => (down ? Promise.reject(new Error('rete assente')) : relayMem.fetch(...a));
    const patKv = memoryKv();
    const doctor = await startRuntime({ settings, deriveKey, kv: memoryKv(), fetchImpl, pumpEveryMs: 0 });
    const { master, consent: c } = await createPatientVault(patKv, PASS, consent);
    const p = await startPatient({ master, kv: patKv, consent: c, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    const d = await doctor.pairing.start(), pc = await p.beginPairing(new TextDecoder().decode(d.qr));
    await pc.poll(); await d.poll(); await d.confirmSas(true); await pc.confirmSas(true); await d.poll(); await pc.poll();
    down = true;
    const r = await doctor.peers.unlink(d.patientId);
    assert.equal(r.notified, false);
    assert.equal(doctor.peers.list().length, 0);
    await p.sync(); assert.equal(p.status().linked, true);        // il paziente non sa nulla finché non lo scollega lui
    await doctor.stop(); p.stop();
});

test('flusso completo su BROKER MQTT (wss): collegamento, dieta, ack, scollega', async () => {
    const { createFakeBroker } = await import('../../connect/transport/mqtt/test/fakeBroker.js');
    const broker = createFakeBroker({ chunk: 7 });
    const wss = { relayUrl: 'wss://broker.example.org:8884/mqtt' };
    const patKv = memoryKv();
    const doctor = await startRuntime({ settings: wss, deriveKey, kv: memoryKv(), WebSocketImpl: broker.WebSocket, pumpEveryMs: 0 });
    const { master, consent: c } = await createPatientVault(patKv, PASS, consent);
    const p = await startPatient({ master, kv: patKv, consent: c, WebSocketImpl: broker.WebSocket, pumpEveryMs: 0 });
    const d = await doctor.pairing.start();
    assert.match(new TextDecoder().decode(d.qr), /wss:\/\/broker/);
    const pc = await p.beginPairing(new TextDecoder().decode(d.qr));
    await pc.poll(); await d.poll();
    assert.equal(d.sas, pc.sas);
    await d.confirmSas(true); await pc.confirmSas(true); await d.poll(); await pc.poll();
    assert.equal(p.status().linked, true);
    const docId = newOpaqueId('c');
    await doctor.peers.sendDocument(d.patientId, put(docId, 1, 'Piano', { kcal: 1800 }));
    await doctor.pumpAll(); await p.sync(); await p.sync(); await doctor.pumpAll();
    assert.equal(p.docs.get(docId).body.kcal, 1800);
    assert.equal(doctor.peers.list()[0].queued, 0);
    // il broker non conserva niente di leggibile e alla fine non conserva niente
    const all = [...broker.retained.values()].map((v) => new TextDecoder('latin1').decode(v)).join('');
    assert.ok(!all.includes('kcal') && !all.includes('Piano'));
    assert.equal((await doctor.peers.unlink(d.patientId)).notified, true);
    await p.sync(); assert.equal(p.status().linked, false);
    assert.equal(broker.retained.size, 0);
    await doctor.stop(); p.stop();
});

test('dati persi dal broker: il medico rimanda e il paziente riceve', async () => {
    const { createFakeBroker } = await import('../../connect/transport/mqtt/test/fakeBroker.js');
    const broker = createFakeBroker();
    const wss = { relayUrl: 'wss://broker.example.org:8884/mqtt' };
    const patKv = memoryKv();
    const doctor = await startRuntime({ settings: wss, deriveKey, kv: memoryKv(), WebSocketImpl: broker.WebSocket, pumpEveryMs: 0 });
    const { master, consent: c } = await createPatientVault(patKv, PASS, consent);
    const p = await startPatient({ master, kv: patKv, consent: c, WebSocketImpl: broker.WebSocket, pumpEveryMs: 0 });
    const d = await doctor.pairing.start(), pc = await p.beginPairing(new TextDecoder().decode(d.qr));
    await pc.poll(); await d.poll(); await d.confirmSas(true); await pc.confirmSas(true); await d.poll(); await pc.poll();
    const docId = newOpaqueId('c');
    await doctor.peers.sendDocument(d.patientId, put(docId, 1, 'Piano', { a: 1 }));
    await doctor.pumpAll(); await new Promise((r) => setTimeout(r, 150));   // sendDocument avvia anche un giro in sottofondo
    broker.retained.clear();                                       // il broker "dimentica" tutto
    await p.sync(); assert.equal(p.docs.list().length, 0);
    assert.equal(doctor.peers.list()[0].queued, 1);                // senza ack resta in coda
    await doctor.stop(); p.stop();
});

test('stato dell\'invio: in attesa finché il paziente non conferma, poi ricevuto; stesso per il ritiro', async () => {
    const { buildPut, buildWithdraw } = await import('../../connect/documents/outgoing.js');
    const { doctor, p, d } = await linkUp();
    const doc = { kind: 'diet', title: 'Piano', body: { giorni: [] } };
    const { msg, link } = buildPut({ doc, link: null, maxBytes: doctor.cfg.maxPayloadBytes });
    await doctor.peers.sendDocument(d.patientId, msg);
    const info = () => doctor.peers.list().find((x) => x.pid === d.patientId);
    assert.ok(info().pendingRefs.includes(link.ref));              // in attesa
    await doctor.pumpAll(); await p.sync(); await p.sync(); await doctor.pumpAll();
    assert.ok(!info().pendingRefs.includes(link.ref));              // confermata dal paziente
    const w = buildWithdraw({ link, maxBytes: doctor.cfg.maxPayloadBytes });
    await doctor.peers.sendDocument(d.patientId, w);
    assert.ok(info().pendingRefs.includes(w.ref));
    await doctor.pumpAll(); await p.sync(); await p.sync(); await doctor.pumpAll();
    assert.ok(!info().pendingRefs.includes(w.ref)); assert.equal(p.docs.list().length, 0);
    await doctor.stop(); p.stop();
});
