import test from 'node:test';
import assert from 'node:assert/strict';
import { MlKem768 } from 'mlkem';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { seal, open } from '../aead.js';
import { pad, unpad } from '../padding.js';
import { hkdfSha256 } from '../kdf.js';
import { equal } from '../bytes.js';
import * as kem from '../kem.js';
import * as sig from '../sign.js';
import { requireSuite, DEFAULT_SUITE } from '../suites.js';
import { randomBytes } from '../random.js';

test('ML-KEM-768: interoperabilità con implementazione indipendente (mlkem)', async () => {
    // noble cifra, mlkem decifra
    const a = ml_kem768.keygen();
    const ours = ml_kem768.encapsulate(a.publicKey);
    const other = new MlKem768();
    assert.ok(equal(ours.sharedSecret, await other.decap(ours.cipherText, a.secretKey)));
    // mlkem cifra, noble decifra
    const [pk, sk] = await other.generateKeyPair();
    const [ct, ss] = await other.encap(pk);
    assert.ok(equal(ss, ml_kem768.decapsulate(ct, sk)));
});

test('KEM ibrido X-Wing: round trip e rifiuto implicito se alterato', () => {
    const k = kem.generateKeys();
    const { cipherText, sharedSecret } = kem.encapsulate(k.publicKey);
    assert.ok(equal(sharedSecret, kem.decapsulate(cipherText, k.secretKey)));
    const bad = cipherText.slice(); bad[10] ^= 1;
    assert.ok(!equal(sharedSecret, kem.decapsulate(bad, k.secretKey)));
});

test('AEAD: round trip, AAD, manomissione', async () => {
    const key = randomBytes(32), aad = new Uint8Array([1, 2, 3]), msg = new Uint8Array([9, 8, 7]);
    const s = await seal(key, msg, aad);
    assert.deepEqual(await open(key, s, aad), msg);
    await assert.rejects(open(key, s, new Uint8Array([1, 2, 4])));
    const t = s.slice(); t[t.length - 1] ^= 1;
    await assert.rejects(open(key, t, aad));
    await assert.rejects(open(randomBytes(32), s, aad));
    assert.notDeepEqual((await seal(key, msg)).subarray(0, 12), (await seal(key, msg)).subarray(0, 12)); // nonce diversi
});

test('KDF: scopi diversi ⇒ chiavi diverse; scopo obbligatorio', () => {
    const ikm = randomBytes(32);
    assert.ok(!equal(hkdfSha256(ikm, { purpose: 'a' }), hkdfSha256(ikm, { purpose: 'b' })));
    assert.throws(() => hkdfSha256(ikm, {}));
});

test('Padding: blocchi fissi, round trip, rifiuto non valido', () => {
    for (const n of [0, 1, 4091, 4092, 5000]) {
        const d = randomBytes(n), p = pad(d);
        assert.equal(p.length % 4096, 0);
        assert.deepEqual(unpad(p), d);
    }
    assert.throws(() => unpad(new Uint8Array(100)));
    const p = pad(randomBytes(10)); p[0] = 0xff;
    assert.throws(() => unpad(p));
});

test('Firma duale: valida solo con ENTRAMBE le firme', () => {
    const k = sig.generateKeys(), msg = randomBytes(64);
    const s = sig.sign('test', msg, k.secretKey);
    assert.ok(sig.verify('test', msg, s, k.publicKey));
    assert.ok(!sig.verify('altro', msg, s, k.publicKey)); // dominio diverso
    const e = s.slice(); e[0] ^= 1; assert.ok(!sig.verify('test', msg, e, k.publicKey)); // rotta Ed25519
    const q = s.slice(); q[100] ^= 1; assert.ok(!sig.verify('test', msg, q, k.publicKey)); // rotta ML-DSA
    assert.ok(!sig.verify('test', msg, s.subarray(1), k.publicKey));
});

test('Suite: solo quelle in elenco', () => {
    assert.ok(requireSuite(DEFAULT_SUITE));
    for (const bad of [0, 2, '1', null, 1.5, '__proto__']) assert.throws(() => requireSuite(bad));
});
