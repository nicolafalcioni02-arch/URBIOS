// Medico (runtime) ⇄ paziente (simulato come farà l'app paziente): pairing, documento, ack, riavvio, rollback.
import test from 'node:test';
import assert from 'node:assert/strict';
import { startRuntime } from '../../runtime.js';
import { memoryKv } from '../../persist/kv.js';
import { createMemoryRelay } from '../../transport/memoryRelay.js';
import { createRelayClient } from '../../transport/relayClient.js';
import { startPatientPairing } from '../../pairing/flow.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { createPeerRegistry } from '../registry.js';
import { createDocStore } from '../../sync/docStore.js';
import { loadConfig } from '../../config/load.js';
import { newOpaqueId } from '../../identity/opaqueId.js';
import { randomBytes } from '../../crypto/random.js';
import { b64u } from '../../crypto/bytes.js';

const master = randomBytes(32), deriveKey = async () => master.slice();
const settings = { relayUrl: 'https://relay.example.org' };
const ref = () => b64u.enc(randomBytes(16));

const world = async () => {
    const relayMem = createMemoryRelay(), kv = memoryKv();
    const doctor = await startRuntime({ settings, deriveKey, kv, fetchImpl: relayMem.fetch, pumpEveryMs: 0 });
    const rc = createRelayClient({ baseUrl: settings.relayUrl, fetchImpl: relayMem.fetch });
    const pat = generateDeviceIdentity();
    const store = createDocStore({ allowedSenders: new Set([doctor.identity.deviceId]) });
    const patientReg = createPeerRegistry({ cfg: loadConfig(), getSelf: () => pat, relay: rc, role: 'patient',
        onMessage: async (m, from, peer) => { store.apply(m, from); if (m.ref) await peer.sendAck(m.ref); } });
    return { relayMem, kv, doctor, rc, pat, store, patientReg };
};
const pair = async (w) => {
    const d = await w.doctor.pairing.start();
    const p = await startPatientPairing({ relay: w.rc, qr: d.qr, identity: w.pat });
    await p.poll(); await d.poll();
    assert.equal(d.sas, p.sas);
    await d.confirmSas(true); await p.confirmSas(true);
    await d.poll(); await p.poll();
    assert.equal(d.state, 'done'); assert.equal(p.state, 'done');
    w.patientReg.add({ pid: p.result.doctorRecord.deviceId, peerRecord: p.result.doctorRecord, sid: p.result.sid, seed: p.result.seed });
    return { pid: d.patientId, docPeerId: p.result.doctorRecord.deviceId };
};
const put = (docId, rev, kcal) => ({ v: 1, t: 'doc.put', ref: ref(), docId, kind: 'diet', rev, parentRev: rev > 1 ? rev - 1 : null, title: 'Piano', body: { kcal }, at: 1 });

test('pairing + documento + ack + riavvio del medico + secondo documento', async () => {
    const w = await world();
    const { pid, docPeerId } = await pair(w);
    assert.equal(w.doctor.peers.list().length, 1);
    const docId = newOpaqueId('c');
    const patient = w.patientReg.get(docPeerId);

    await w.doctor.peers.sendDocument(pid, put(docId, 1, 1800));
    await w.doctor.pumpAll();                              // medico → relay
    assert.equal((await patient.pump()).received, 1);      // paziente riceve (e mette in coda l'ack)
    await patient.pump();                                  // paziente → ack sul relay
    await w.doctor.pumpAll();                              // medico riceve l'ack
    assert.equal(w.store.current(docId).body.kcal, 1800);
    assert.equal(w.doctor.peers.list()[0].queued, 0);      // coda svuotata dall'ack

    // riavvio del medico: stessa identità, stesso collegamento, il ratchet continua
    await w.doctor.stop();
    const again = await startRuntime({ settings, deriveKey, kv: w.kv, fetchImpl: w.relayMem.fetch, pumpEveryMs: 0 });
    assert.equal(again.persistStatus, 'ok');
    assert.equal(again.peers.list().length, 1);
    await again.peers.sendDocument(pid, put(docId, 2, 1700));
    await again.pumpAll();
    assert.equal((await patient.pump()).received, 1);
    assert.equal(w.store.current(docId).rev, 2);
    await again.stop();
});

test('niente collegamento senza conferma della SAS; unlink; sendDocument a sconosciuto', async () => {
    const w = await world();
    const d = await w.doctor.pairing.start();
    const p = await startPatientPairing({ relay: w.rc, qr: d.qr, identity: w.pat });
    await p.poll(); await d.poll();
    await d.confirmSas(false);
    await d.poll();
    assert.equal(d.state, 'failed');
    assert.equal(w.doctor.peers.list().length, 0);
    await assert.rejects(w.doctor.peers.sendDocument('p1.' + 'A'.repeat(22), put(newOpaqueId('c'), 1, 1)));
    const { pid } = await pair(w);
    await w.doctor.peers.unlink(pid);
    assert.equal(w.doctor.peers.list().length, 0);
});

test('rollback del medico ⇒ collegamenti azzeratti (serve nuovo pairing); il relay non vede nulla di leggibile', async () => {
    const w = await world();
    const { pid } = await pair(w);
    const old = w.kv._m.get('state').slice();
    await w.doctor.peers.sendDocument(pid, put(newOpaqueId('c'), 1, 1500));
    await w.doctor.stop();                                 // salva: gen più alta
    w.kv._m.set('state', old);                             // ripristino di un backup vecchio
    const r = await startRuntime({ settings, deriveKey, kv: w.kv, fetchImpl: w.relayMem.fetch, pumpEveryMs: 0 });
    assert.equal(r.persistStatus, 'rollback');
    assert.equal(r.peers.list().length, 0);
    const raw = [...w.relayMem.boxes.values()].flat().map((i) => new TextDecoder('latin1').decode(i.data)).join('');
    assert.ok(!raw.includes('kcal') && !raw.includes('Piano'));
});

test('stop subito dopo un invio: nessun salvataggio con la chiave azzerata, il riavvio apre i dati (ripetuto)', async () => {
    for (let i = 0; i < 15; i++) {
        const w = await world();
        const { pid } = await pair(w);
        await w.doctor.peers.sendDocument(pid, put(newOpaqueId('c'), 1, 1500));   // avvia un giro in sottofondo
        await w.doctor.stop();                                                    // senza aspettare
        const r = await startRuntime({ settings, deriveKey, kv: w.kv, fetchImpl: w.relayMem.fetch, pumpEveryMs: 0 });
        assert.equal(r.persistStatus, 'ok');
        assert.equal(r.peers.list().length, 1);
        await r.stop();
    }
});
