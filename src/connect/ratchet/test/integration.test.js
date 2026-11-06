// Pairing → seme → ratchet → busta firmata (flusso reale medico→paziente).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../config/load.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { createDoctorPairing } from '../../pairing/doctorSession.js';
import { createPatientPairing } from '../../pairing/patientSession.js';
import { createInitiator, createResponder } from '../session.js';
import { sealEnvelope } from '../../envelope/seal.js';
import { openEnvelope } from '../../envelope/open.js';
import { createReplayState } from '../../envelope/steps/replay.js';
import { createRevocationList } from '../../identity/revocation.js';
import { b64u, equal } from '../../crypto/bytes.js';

test('medico→paziente: pairing, ratchet dentro la busta firmata', async () => {
    const cfg = loadConfig(), T = Date.now();
    const doc = generateDeviceIdentity({ now: T }), pat = generateDeviceIdentity({ now: T });
    const d = createDoctorPairing({ doctorRecord: doc.record, cfg, now: T });
    const p = createPatientPairing({ qr: d.qr, doctorRecord: doc.record, identity: pat, now: T });
    d.receiveResponse(p.response, T + 1);
    const td = d.confirmLocal(true, T + 2), tp = p.confirmLocal(true, T + 2);
    d.receivePeerConfirm(tp, T + 3); p.receivePeerConfirm(td, T + 3);
    const D = d.finish(T + 4), P = p.finish(T + 4);
    assert.ok(equal(D.seed, P.seed) && D.sid === P.sid);

    const rDoc = createInitiator({ seed: D.seed, sid: D.sid, peerKemPk: b64u.dec(D.patientRecord.kemPk), maxSkippedKeys: cfg.maxSkippedKeys });
    const rPat = createResponder({ seed: P.seed, sid: P.sid, identityKem: { publicKey: b64u.dec(pat.record.kemPk), secretKey: pat.secret.kemSk }, maxSkippedKeys: cfg.maxSkippedKeys });

    const inner = await rDoc.encrypt(new TextEncoder().encode('scheda A'));
    const env = await sealEnvelope({ sender: doc, recipientRecord: pat.record, session: D.sid, counter: 0, payload: inner, now: T + 10 });
    const out = await openEnvelope(env, { cfg, self: pat, now: () => T + 11, getSenderRecord: () => doc.record, revocations: createRevocationList(),
        replay: createReplayState(), validate: () => {}, persist: async () => {} });
    assert.equal(out.ok, true, out.reason);
    assert.equal(new TextDecoder().decode(await rPat.decrypt(out.payload)), 'scheda A');
});
