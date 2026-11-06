import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from '../../crypto/random.js';
import * as kem from '../../crypto/kem.js';
import { utf8 } from '../../crypto/bytes.js';
import { newOpaqueId } from '../../identity/opaqueId.js';
import { createInitiator, createResponder } from '../session.js';

const dec = (b) => new TextDecoder().decode(b);
const pair = (max = 100) => {
    const seed = randomBytes(32), sid = newOpaqueId('s'), id = kem.generateKeys();
    return {
        doc: createInitiator({ seed, sid, peerKemPk: id.publicKey, maxSkippedKeys: max }),
        pat: createResponder({ seed: seed.slice(), sid, identityKem: id, maxSkippedKeys: max }),
    };
};

test('conversazione in entrambe le direzioni su più epoche', async () => {
    const { doc, pat } = pair();
    for (let r = 0; r < 4; r++) {
        for (const t of ['a', 'b', 'c']) assert.equal(dec(await pat.decrypt(await doc.encrypt(utf8(`d${r}${t}`)))), `d${r}${t}`);
        for (const t of ['x', 'y']) assert.equal(dec(await doc.decrypt(await pat.encrypt(utf8(`p${r}${t}`)))), `p${r}${t}`);
    }
});

test('il responder non scrive prima di aver ricevuto', async () => {
    const { pat } = pair();
    await assert.rejects(pat.encrypt(utf8('x')));
});

test('riordino dentro la stessa epoca; duplicato rifiutato', async () => {
    const { doc, pat } = pair();
    const m = []; for (let i = 0; i < 5; i++) m.push(await doc.encrypt(utf8(`m${i}`)));
    await pat.decrypt(m[0]);
    assert.equal(dec(await pat.decrypt(m[3])), 'm3');
    assert.equal(dec(await pat.decrypt(m[1])), 'm1');
    assert.equal(dec(await pat.decrypt(m[2])), 'm2');
    await assert.rejects(pat.decrypt(m[1]));
    await assert.rejects(pat.decrypt(m[0]));
});

test('messaggi dell\'epoca vecchia arrivano dopo il cambio epoca', async () => {
    const { doc, pat } = pair();
    const a0 = await doc.encrypt(utf8('a0')), a1 = await doc.encrypt(utf8('a1')), a2 = await doc.encrypt(utf8('a2'));
    await pat.decrypt(a0);
    const r = await pat.encrypt(utf8('risposta'));
    await doc.decrypt(r);
    const b0 = await doc.encrypt(utf8('b0'));
    assert.equal(dec(await pat.decrypt(b0)), 'b0');   // salta a1, a2 dell'epoca precedente
    assert.equal(dec(await pat.decrypt(a2)), 'a2');
    assert.equal(dec(await pat.decrypt(a1)), 'a1');
});

test('manomissione: nessun avanzamento di stato, il messaggio buono passa ancora', async () => {
    const { doc, pat } = pair();
    const m = await doc.encrypt(utf8('vero'));
    for (const i of [6, 40, m.length - 3, m.length - 20]) { const t = m.slice(); t[i] ^= 1; await assert.rejects(pat.decrypt(t)); }
    await assert.rejects(pat.decrypt(m.subarray(0, 30)));
    assert.equal(dec(await pat.decrypt(m)), 'vero');
});

test('limite di messaggi saltati (anti-DoS)', async () => {
    const { doc, pat } = pair(5);
    const m = []; for (let i = 0; i < 12; i++) m.push(await doc.encrypt(utf8('x')));
    await assert.rejects(pat.decrypt(m[11]));
    assert.equal(dec(await pat.decrypt(m[0])), 'x');
    await pat.decrypt(m[5]); // salto di 4 ≤ 5
});

test('forward secrecy: lo stato rubato DOPO non decifra i messaggi passati', async () => {
    const { doc, pat } = pair();
    const m0 = await doc.encrypt(utf8('segreto')), m1 = await doc.encrypt(utf8('k'));
    await pat.decrypt(m0); await pat.decrypt(m1);
    await doc.decrypt(await pat.encrypt(utf8('r')));
    // il ladro copia lo stato del paziente ORA
    const thief = (await import('../session.js')).createSession(hydrate(pat.exportState()));
    await assert.rejects(thief.decrypt(m0));
    await assert.rejects(thief.decrypt(m1));
});

test('post-compromise security: dopo due giri l\'attaccante è fuori (anche PQ: la KEM è ibrida)', async () => {
    const { doc, pat } = pair();
    await pat.decrypt(await doc.encrypt(utf8('1')));
    const thief = createFrom(pat);                           // copia completa dello stato del paziente
    await doc.decrypt(await pat.encrypt(utf8('2')));         // giro 1: cifrato verso chiave del medico (non rubata)
    const heal = await doc.encrypt(utf8('3'));               // giro 2: verso la chiave NUOVA del paziente
    assert.equal(dec(await pat.decrypt(heal)), '3');
    await assert.rejects(thief.decrypt(heal));
    const later = await doc.encrypt(utf8('4'));
    await assert.rejects(thief.decrypt(later));
});

test('sessione diversa o epoca sconosciuta ⇒ rifiuto', async () => {
    const a = pair(), b = pair(), c = pair();
    await assert.rejects(b.pat.decrypt(await c.doc.encrypt(utf8('x'))));
    const m0 = await a.doc.encrypt(utf8('0')), m1 = await a.doc.encrypt(utf8('1'));
    await assert.rejects(a.pat.decrypt(m1)); // epoca non ancora iniziata (manca m0 con la KEM)
    assert.equal(dec(await a.pat.decrypt(m0)), '0');
    assert.equal(dec(await a.pat.decrypt(m1)), '1');
});

import { createSession } from '../session.js';
import { b64u } from '../../crypto/bytes.js';
function hydrate(json) {
    const j = JSON.parse(json), d = b64u.dec;
    return { ...j, rk: d(j.rk), cks: j.cks && d(j.cks), ckr: j.ckr && d(j.ckr), peerPk: j.peerPk && d(j.peerPk), garbage: [],
        kems: new Map(j.kems.map(([k, p, s]) => [k, { publicKey: d(p), secretKey: d(s) }])),
        skipped: new Map(j.skipped.map(([k, v]) => [k, d(v)])) };
}
const createFrom = (s) => createSession(hydrate(s.exportState()));

test('il ratchet non azzera la chiave d\'identità del chiamante (nessun aliasing)', async () => {
    const seed = randomBytes(32), sid = newOpaqueId('s'), id = kem.generateKeys(), before = id.secretKey.slice();
    const doc = createInitiator({ seed, sid, peerKemPk: id.publicKey, maxSkippedKeys: 100 });
    const pat = createResponder({ seed: seed.slice(), sid, identityKem: id, maxSkippedKeys: 100 });
    await pat.decrypt(await doc.encrypt(utf8('x')));
    assert.deepEqual(id.secretKey, before);
});
