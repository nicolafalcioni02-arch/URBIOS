import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../config/load.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { createDoctorPairing } from '../doctorSession.js';
import { createPatientPairing } from '../patientSession.js';
import { decodeOffer } from '../qrPayload.js';

const cfg = loadConfig(), T = 1_800_000_000_000;
const rig = () => {
    const doc = generateDeviceIdentity({ now: T }), pat = generateDeviceIdentity({ now: T });
    const d = createDoctorPairing({ doctorRecord: doc.record, cfg, now: T });
    const p = createPatientPairing({ qr: d.qr, doctorRecord: doc.record, identity: pat, now: T });
    return { doc, pat, d, p };
};

test('QR piccolo, senza nome né dati clinici', () => {
    const { d } = rig();
    assert.ok(d.qr.length < 400, `QR ${d.qr.length} byte`);
    assert.ok(!/nome|name/i.test(new TextDecoder().decode(d.qr)));
});

test('flusso completo: SAS uguale, doppia conferma, record scambiati', () => {
    const { doc, pat, d, p } = rig();
    const sasD = d.receiveResponse(p.response, T + 1000);
    assert.equal(sasD, p.sas);
    assert.match(sasD, /^\d{4}-\d{4}-\d{4}$/);
    const td = d.confirmLocal(true, T + 2000), tp = p.confirmLocal(true, T + 2000);
    d.receivePeerConfirm(tp, T + 3000); p.receivePeerConfirm(td, T + 3000);
    assert.equal(d.finish(T + 4000).patientRecord.deviceId, pat.record.deviceId);
    assert.equal(p.finish(T + 4000).doctorRecord.deviceId, doc.record.deviceId);
});

test('nessuna attivazione senza doppia conferma', () => {
    const { d, p } = rig();
    d.receiveResponse(p.response, T + 1);
    assert.throws(() => d.finish(T + 2));
    const tp = p.confirmLocal(true, T + 2);
    d.receivePeerConfirm(tp, T + 3);
    assert.throws(() => d.finish(T + 4)); // manca la conferma locale del medico
});

test('SAS diversa (MITM) ⇒ rifiuto e sessione distrutta', () => {
    const { d, p, doc } = rig();
    const evil = generateDeviceIdentity({ now: T });
    const p2 = createPatientPairing({ qr: d.qr, doctorRecord: doc.record, identity: evil, now: T }); // chi ha visto il QR
    const sas = d.receiveResponse(p2.response, T + 1);
    assert.notEqual(sas, p.sas);
    assert.throws(() => d.confirmLocal(false, T + 2));
    assert.equal(d.state, 'dead');
    assert.throws(() => d.receiveResponse(p2.response, T + 3));
});

test('prova errata: tentativi limitati poi sessione morta', () => {
    const { d, p } = rig();
    const bad = { ...p.response, proof: p.response.proof.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')) };
    for (let i = 0; i < cfg.pairingMaxAttempts; i++) assert.throws(() => d.receiveResponse(bad, T + 1));
    assert.equal(d.state, 'dead');
    assert.throws(() => d.receiveResponse(p.response, T + 2));
});

test('scadenza e monouso', () => {
    const { d, p, doc } = rig();
    assert.throws(() => decodeOffer(d.qr, T + cfg.pairingTtlSec * 1000 + 1));
    assert.throws(() => d.receiveResponse(p.response, T + cfg.pairingTtlSec * 1000 + 1));
    const r = rig();
    r.d.receiveResponse(r.p.response, T + 1);
    assert.throws(() => r.d.receiveResponse(r.p.response, T + 2)); // seconda risposta
});

test('record del medico sostituito ⇒ il paziente rifiuta', () => {
    const { d, doc } = rig(), other = generateDeviceIdentity({ now: T });
    assert.throws(() => createPatientPairing({ qr: d.qr, doctorRecord: other.record, identity: generateDeviceIdentity({ now: T }), now: T }));
});

test('QR alterato o non canonico ⇒ rifiutato', () => {
    const { d, doc } = rig();
    // un QR modificato ma ancora ben formato (ps cambiato) è un altro QR: la prova non torna al medico
    const txt = new TextDecoder().decode(d.qr), i = txt.indexOf('"ps":"') + 6;
    const alt = new TextEncoder().encode(txt.slice(0, i) + (txt[i] === 'A' ? 'B' : 'A') + txt.slice(i + 1));
    const p = createPatientPairing({ qr: alt, doctorRecord: doc.record, identity: generateDeviceIdentity({ now: T }), now: T });
    assert.throws(() => d.receiveResponse(p.response, T + 1));
    assert.throws(() => decodeOffer(d.qr.slice(0, 50), T));
    assert.throws(() => decodeOffer(new Uint8Array([...d.qr, 32]), T));
});

test('il QR porta il relay (https) ed è parte del transcript; relay http o assente ⇒ rifiutato', () => {
    const { d, doc } = rig();
    const o = decodeOffer(d.qr, T);
    assert.equal(o.rl, cfg.relayUrl);
    for (const rl of ['http://relay.example.org', 'ftp://x', 'https://', 'https://a b', 'javascript:alert(1)', 5, undefined]) {
        const bad = new TextEncoder().encode(JSON.stringify({ ...o, rl }));
        assert.throws(() => decodeOffer(bad, T));
    }
    const other = createDoctorPairing({ doctorRecord: doc.record, cfg, now: T, relayUrl: 'https://altro.example.org' });
    assert.notEqual(new TextDecoder().decode(other.qr), new TextDecoder().decode(d.qr));
});
