import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../load.js';

test('default: offline, valido, immutabile', () => {
    const c = loadConfig();
    assert.equal(c.mode, 'offline');
    assert.throws(() => { 'use strict'; c.mode = 'online'; });
});
test('online senza endpoint ⇒ errore', () => assert.throws(() => loadConfig({ mode: 'online' })));
test('online con endpoint sicuri ⇒ ok; http/ws in prod ⇒ errore', () => {
    assert.ok(loadConfig({ mode: 'online', brokerUrl: 'wss://b.example.org/mqtt', relayUrl: 'https://r.example.org' }));
    assert.throws(() => loadConfig({ mode: 'online', brokerUrl: 'ws://b.example.org', relayUrl: 'https://r.example.org' }));
});
test('campi ignoti, segreti e limiti fuori scala ⇒ errore', () => {
    assert.throws(() => loadConfig({ foo: 1 }));
    assert.throws(() => loadConfig({ apiKey: 'x' }));
    assert.throws(() => loadConfig({ messageTtlHours: 100 }));
    assert.throws(() => loadConfig({ enrollmentTtlSec: 600 }));
    assert.throws(() => loadConfig({ mode: 'ibrido' }));
});
