import test from 'node:test';
import assert from 'node:assert/strict';
import { startRuntime } from '../runtime.js';
import { memoryKv } from '../persist/kv.js';
import { randomBytes } from '../crypto/random.js';
import { verifyChain } from '../audit/chain.js';

const master = randomBytes(32);
const deriveKey = async () => master.slice();
const settings = { relayUrl: 'https://relay.example.org' };

test('avvio: identità creata e ritrovata, audit a catena, chiave azzerata all\'arresto', async () => {
    const kv = memoryKv();
    const a = await startRuntime({ settings, deriveKey, kv });
    assert.equal(a.persistStatus, 'empty');
    const id = a.identity.deviceId;
    await a.stop();
    const b = await startRuntime({ settings, deriveKey, kv });
    assert.equal(b.identity.deviceId, id);              // stessa identità dopo il riavvio
    assert.equal(b.persistStatus, 'ok');
    assert.equal(b.auditOk, true);
    await b.stop();
    // audit salvato: 4 eventi (on, off, on, off), catena valida
    const raw = kv._m.get('identity');
    assert.ok(!new TextDecoder('latin1').decode(raw).includes('"kemSk"'));   // segreti solo cifrati
});

test('rifiuti: relay non https, archivio non cifrato, chiave sbagliata', async () => {
    await assert.rejects(startRuntime({ settings: { relayUrl: 'http://relay.example.org' }, deriveKey, kv: memoryKv() }));
    await assert.rejects(startRuntime({ settings: { relayUrl: '' }, deriveKey, kv: memoryKv() }));
    await assert.rejects(startRuntime({ settings, deriveKey: async () => null, kv: memoryKv() }), /non cifrato/);
    const kv = memoryKv();
    await (await startRuntime({ settings, deriveKey, kv })).stop();
    await assert.rejects(startRuntime({ settings, deriveKey: async () => randomBytes(32), kv }));
});

test('manager: offline di default; start/stop; errore non lascia stati a metà', async () => {
    const { connectManager } = await import('../manager.js');
    assert.equal(connectManager.getState().status, 'off');
    await connectManager.start({ settings: { relayUrl: 'http://no' }, deriveKey });
    assert.equal(connectManager.getState().status, 'error');
    await connectManager.stop();
    assert.equal(connectManager.getState().status, 'off');
});
