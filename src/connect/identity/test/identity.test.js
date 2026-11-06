import test from 'node:test';
import assert from 'node:assert/strict';
import { newOpaqueId, isOpaqueId } from '../opaqueId.js';
import { generateDeviceIdentity, verifyDeviceRecord } from '../deviceKeys.js';
import { sealIdentitySecret, openIdentitySecret } from '../keyStore.js';
import { makeRevocation, verifyRevocation, createRevocationList } from '../revocation.js';
import { randomBytes } from '../../crypto/random.js';
import { equal } from '../../crypto/bytes.js';

test('id opachi: formato, tipo, unicità', () => {
    const a = newOpaqueId('p'), b = newOpaqueId('p');
    assert.ok(isOpaqueId(a, 'p') && !isOpaqueId(a, 'd') && a !== b);
    for (const bad of ['', 'p1.corto', 'x1.' + 'A'.repeat(22), 'p1.' + '!'.repeat(22), null, 5]) assert.ok(!isOpaqueId(bad));
    assert.throws(() => newOpaqueId('z'));
});

test('record dispositivo: verifica, alterazione, scadenza', () => {
    const { record } = generateDeviceIdentity();
    assert.ok(verifyDeviceRecord(record));
    assert.ok(!verifyDeviceRecord({ ...record, deviceId: newOpaqueId('d') }));
    assert.ok(!verifyDeviceRecord({ ...record, suite: 2 }));
    assert.ok(!verifyDeviceRecord(record, record.notAfter + 1));
    assert.ok(!verifyDeviceRecord(record, record.notBefore - 1));
    assert.ok(!verifyDeviceRecord({}));
});

test('chiavi segrete: solo cifrate, round trip, DEK sbagliata fallisce', async () => {
    const { secret } = generateDeviceIdentity(), dek = randomBytes(32);
    const sealed = await sealIdentitySecret(secret, dek);
    const back = await openIdentitySecret(sealed, dek);
    assert.ok(equal(back.kemSk, secret.kemSk) && equal(back.sig.ed, secret.sig.ed));
    await assert.rejects(openIdentitySecret(sealed, randomBytes(32)));
});

test('revoca: firmata, non falsificabile, non tocca gli altri', () => {
    const A = generateDeviceIdentity(), B = generateDeviceIdentity(), C = generateDeviceIdentity();
    const rev = makeRevocation({ targetId: B.record.deviceId, signerRecord: A.record, signerSecret: A.secret });
    assert.ok(verifyRevocation(rev, A.record));
    assert.ok(!verifyRevocation(rev, C.record));
    assert.ok(!verifyRevocation({ ...rev, targetId: C.record.deviceId }, A.record));
    const list = createRevocationList(); list.add(rev);
    assert.ok(list.isRevoked(B.record.deviceId) && !list.isRevoked(C.record.deviceId));
});
