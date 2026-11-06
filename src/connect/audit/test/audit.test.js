import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuditLog, verifyChain } from '../chain.js';

const mem = () => { const a = []; return { a, last: () => a[a.length - 1] || null, append: (e) => a.push(e) }; };
const mk = () => { const store = mem(); return { store, log: createAuditLog({ store, deviceId: 'd1.AAAAAAAAAAAAAAAAAAAAAA' }) }; };

test('catena valida e rilevamento manomissioni', () => {
    const { store, log } = mk();
    log.record('auth.unlock'); log.record('sync.send', { n: 3 }); log.record('data.export');
    assert.deepEqual(verifyChain(store.a).ok, true);
    const mod = structuredClone(store.a); mod[1].details.n = 4;
    assert.equal(verifyChain(mod).brokenAt, 1);
    const del = [store.a[0], store.a[2]];
    assert.equal(verifyChain(del).ok, false);
    const swap = [store.a[1], store.a[0], store.a[2]];
    assert.equal(verifyChain(swap).ok, false);
});
test('tipi chiusi e niente segreti/dati clinici nei dettagli', () => {
    const { log } = mk();
    assert.throws(() => log.record('inventato'));
    assert.throws(() => log.record('sync.send', { patientName: 'x' }));
    assert.throws(() => log.record('sync.send', { privateKey: 'x' }));
    assert.throws(() => log.record('sync.send', { n: { a: 1 } }));
    assert.throws(() => log.record('sync.send', { s: 'x'.repeat(65) }));
});
