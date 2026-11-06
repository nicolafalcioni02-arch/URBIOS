import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from '../../crypto/random.js';
import * as kemLib from '../../crypto/kem.js';
import { utf8 } from '../../crypto/bytes.js';
import { newOpaqueId } from '../../identity/opaqueId.js';
import { createInitiator, createResponder } from '../../ratchet/session.js';
import { createReplayState } from '../../envelope/steps/replay.js';
import { createOutbox } from '../../sync/outbox.js';
import { createDocStore } from '../../sync/docStore.js';
import { createPersistence } from '../persistence.js';
import { memoryKv } from '../kv.js';
import { ratchetPart, simplePart } from '../parts.js';
import { sealState, openState } from '../stateBox.js';
import { restoreSession } from '../../ratchet/restore.js';

const dec = (b) => new TextDecoder().decode(b);
const dek = randomBytes(32);

// Un "dispositivo paziente" completo; `boot` simula l'avvio dell'app con componenti vuoti.
const boot = (kv, key = dek) => {
    const holder = { session: null }, replay = createReplayState(), outbox = createOutbox(), docs = createDocStore({ allowedSenders: new Set(['d1.' + 'A'.repeat(22)]) });
    const parts = {
        ratchet: ratchetPart(holder),
        replay: simplePart(replay, { sessionBound: true, empty: { lanes: [], ids: [] } }),
        outbox: simplePart(outbox, { sessionBound: true, empty: [] }),
        docs: simplePart(docs, { sessionBound: false, empty: { docs: [] } }),
    };
    return { holder, replay, outbox, docs, p: createPersistence({ kv, parts, getDek: () => key }) };
};
const link = () => {
    const seed = randomBytes(32), sid = newOpaqueId('s'), id = kemLib.generateKeys();
    return { doc: createInitiator({ seed, sid, peerKemPk: id.publicKey, maxSkippedKeys: 100 }), pat: createResponder({ seed: seed.slice(), sid, identityKem: id, maxSkippedKeys: 100 }) };
};

test('riavvio: la conversazione continua, anti-replay e documenti restano', async () => {
    const kv = memoryKv(), { doc, pat } = link(), a = boot(kv);
    a.holder.session = pat;
    const m1 = await doc.encrypt(utf8('uno'));
    assert.equal(dec(await a.holder.session.decrypt(m1)), 'uno');
    a.replay.commit('d1.x', 's1.y', 0, 'id-1', 1000);
    a.docs.apply({ t: 'doc.put', docId: 'c1.' + 'B'.repeat(22), kind: 'diet', rev: 1, parentRev: null, title: 't', body: { k: 1 }, at: 1 }, 'd1.' + 'A'.repeat(22));
    await a.p.save();
    // --- riavvio ---
    const b = boot(kv);
    assert.deepEqual(await b.p.load(), { status: 'ok', resetParts: [] });
    assert.equal(dec(await b.holder.session.decrypt(await doc.encrypt(utf8('due')))), 'due');
    await assert.rejects(b.holder.session.decrypt(m1));                 // replay dello stesso messaggio
    assert.throws(() => b.replay.check('d1.x', 's1.y', 0, 'id-2'));     // contatore già visto
    assert.equal(b.docs.list().length, 1);
    const r = await b.holder.session.encrypt(utf8('risposta'));         // il paziente può rispondere dopo il riavvio
    assert.equal(dec(await doc.decrypt(r)), 'risposta');
});

test('segreti mai in chiaro nel kv; DEK sbagliata o blob manomesso ⇒ errore', async () => {
    const kv = memoryKv(), { pat } = link(), a = boot(kv);
    a.holder.session = pat; await a.p.save();
    for (const v of kv._m.values()) assert.ok(!new TextDecoder('latin1').decode(v).includes('"rk"'));
    await assert.rejects(boot(kv, randomBytes(32)).p.load());
    const blob = kv._m.get('state'); blob[blob.length - 1] ^= 1;
    await assert.rejects(boot(kv).p.load());
});

test('blob scambiati tra nomi o generazione ritoccata ⇒ rifiutati', async () => {
    const b = await sealState(dek, 'state', 5, { x: 1 });
    await assert.rejects(openState(dek, 'anchor', b));
    const t = b.slice(); t[3] = 6;
    await assert.rejects(openState(dek, 'state', t));
    assert.deepEqual((await openState(dek, 'state', b)).obj, { x: 1 });
});

test('ROLLBACK: backup vecchio ripristinato ⇒ sessione azzerata, documenti conservati', async () => {
    const kv = memoryKv(), { doc, pat } = link(), a = boot(kv);
    a.holder.session = pat;
    a.docs.apply({ t: 'doc.put', docId: 'c1.' + 'B'.repeat(22), kind: 'diet', rev: 1, parentRev: null, title: 't', body: {}, at: 1 }, 'd1.' + 'A'.repeat(22));
    await a.p.save();
    const oldState = kv._m.get('state').slice();                   // "backup"
    await pat.decrypt(await doc.encrypt(utf8('x'))); await a.p.save();   // lo stato avanza (gen 2, àncora 2)
    kv._m.set('state', oldState);                                   // l'utente ripristina il blob vecchio (gen 1)
    const b = boot(kv), res = await b.p.load();
    assert.equal(res.status, 'rollback');
    assert.deepEqual(res.resetParts.sort(), ['outbox', 'ratchet', 'replay']);
    assert.equal(b.holder.session, null);                           // serve una nuova sessione (nuovo pairing)
    assert.equal(b.docs.list().length, 1);                          // i documenti non sono legati alla sessione
});

test('dispositivo nuovo (àncora assente) ⇒ "fresh": nuova sessione', async () => {
    const kv = memoryKv(), a = boot(kv), { pat } = link();
    a.holder.session = pat; await a.p.save();
    await kv.delete('anchor');
    const res = await boot(kv).p.load();
    assert.equal(res.status, 'fresh'); assert.ok(res.resetParts.includes('ratchet'));
});

test('crash tra blob e àncora: nessun falso allarme', async () => {
    const kv = memoryKv(), a = boot(kv), { pat } = link();
    a.holder.session = pat; await a.p.save();
    const anchor1 = kv._m.get('anchor').slice();
    await a.p.save();
    kv._m.set('anchor', anchor1);                                   // il crash ha lasciato l'àncora indietro
    const res = await boot(kv).p.load();
    assert.equal(res.status, 'ok');
});

test('stato vuoto; wipe cancella tutto; stato ratchet corrotto ⇒ errore', async () => {
    const kv = memoryKv(), a = boot(kv);
    assert.equal((await a.p.load()).status, 'empty');
    const { pat } = link(); a.holder.session = pat; await a.p.save(); await a.p.wipe();
    assert.equal(kv._m.size, 0);
    for (const bad of ['', '{', '{"sid":1}', JSON.stringify({ ...JSON.parse(pat.exportState()), rk: 'AAAA' })]) assert.throws(() => restoreSession(bad));
});
