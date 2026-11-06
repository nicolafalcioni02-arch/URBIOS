import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../config/load.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { createMemoryRelay } from '../../transport/memoryRelay.js';
import { createRelayClient } from '../../transport/relayClient.js';
import { startDoctorPairing, startPatientPairing } from '../flow.js';
import { equal } from '../../crypto/bytes.js';

const cfg = loadConfig();
const rig = () => {
    let clock = Date.now();
    const relay = createMemoryRelay({ now: () => clock });
    const client = createRelayClient({ baseUrl: 'https://relay.example.org', fetchImpl: relay.fetch });
    return { relay, client, now: () => clock, tick: (ms) => { clock += ms; } };
};

test('pairing completo via relay: SAS uguale, doppia conferma, seme uguale', async () => {
    const r = rig(), doc = generateDeviceIdentity({ now: r.now() }), pat = generateDeviceIdentity({ now: r.now() });
    const d = await startDoctorPairing({ relay: r.client, doctor: doc, cfg, now: r.now });
    const p = await startPatientPairing({ relay: r.client, qr: d.qr, identity: pat, now: r.now });
    await p.poll();                      // il paziente riceve il record del medico e risponde
    await d.poll();                      // il medico riceve la risposta
    assert.equal(d.state, 'confirm-sas'); assert.equal(p.state, 'confirm-sas');
    assert.equal(d.sas, p.sas);
    await d.confirmSas(true); await p.confirmSas(true);
    await d.poll(); await p.poll();
    assert.equal(d.state, 'done'); assert.equal(p.state, 'done');
    assert.ok(equal(d.result.seed, p.result.seed));
    assert.equal(d.result.patientRecord.deviceId, pat.record.deviceId);
});

test('SAS non coincide ⇒ fallito, nessun risultato', async () => {
    const r = rig(), d = await startDoctorPairing({ relay: r.client, doctor: generateDeviceIdentity({ now: r.now() }), cfg, now: r.now });
    const p = await startPatientPairing({ relay: r.client, qr: d.qr, identity: generateDeviceIdentity({ now: r.now() }), now: r.now });
    await p.poll(); await d.poll();
    await d.confirmSas(false);
    assert.equal(d.state, 'failed'); assert.equal(d.result, null);
});

test('senza risposta del paziente: scade; spazzatura sulla casella ignorata', async () => {
    const r = rig(), d = await startDoctorPairing({ relay: r.client, doctor: generateDeviceIdentity({ now: r.now() }), cfg, now: r.now });
    await d.poll(); assert.equal(d.state, 'waiting-patient');
    r.tick(cfg.pairingTtlSec * 1000 + 1);
    await d.poll(); assert.equal(d.state, 'failed'); assert.equal(d.error, 'scaduto');
});

test('un QR scaduto non si può nemmeno avviare', async () => {
    const r = rig(), d = await startDoctorPairing({ relay: r.client, doctor: generateDeviceIdentity({ now: r.now() }), cfg, now: r.now });
    r.tick(cfg.pairingTtlSec * 1000 + 1);
    await assert.rejects(startPatientPairing({ relay: r.client, qr: d.qr, identity: generateDeviceIdentity({ now: r.now() }), now: r.now }));
});
