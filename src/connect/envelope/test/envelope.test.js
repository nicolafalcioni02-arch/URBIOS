import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../../config/load.js';
import { generateDeviceIdentity } from '../../identity/deviceKeys.js';
import { makeRevocation, createRevocationList } from '../../identity/revocation.js';
import { sealEnvelope } from '../seal.js';
import { openEnvelope } from '../open.js';
import { createReplayState } from '../steps/replay.js';
import { utf8 } from '../../crypto/bytes.js';

const cfg = loadConfig();
const setup = () => {
    const doc = generateDeviceIdentity(), pat = generateDeviceIdentity();
    const store = []; let failPersist = false;
    const ctx = {
        cfg, self: pat, now: () => T,
        getSenderRecord: (id) => (id === doc.record.deviceId ? doc.record : null),
        revocations: createRevocationList(), replay: createReplayState(),
        validate: (p) => { if (p.length === 0 || p[0] === 0x21) throw new Error('schema'); },
        persist: async (p) => { if (failPersist) throw new Error('disk'); store.push(p); },
    };
    const send = (payload, o = {}) => sealEnvelope({ sender: doc, recipientRecord: pat.record, session: o.session ?? 's1.' + 'A'.repeat(22), counter: o.ctr ?? 0, payload, now: o.now ?? T });
    return { doc, pat, ctx, store, send, setFail: (v) => { failPersist = v; } };
};
const T = 1_800_000_000_000;
const ok = async (r) => { const x = await r; assert.equal(x.ok, true, x.reason); return x; };
const bad = async (r, reason) => { const x = await r; assert.equal(x.ok, false); if (reason) assert.equal(x.reason, reason); };

test('round trip: il destinatario legge, il contenuto coincide', async () => {
    const s = setup();
    const r = await ok(openEnvelope(await s.send(utf8('scheda A')), s.ctx));
    assert.equal(new TextDecoder().decode(r.payload), 'scheda A');
    assert.equal(s.store.length, 1);
});

test('replay: stessa busta due volte ⇒ rifiutata', async () => {
    const s = setup(), e = await s.send(utf8('x'));
    await ok(openEnvelope(e, s.ctx));
    await bad(openEnvelope(e, s.ctx), 'replay');
    assert.equal(s.store.length, 1);
});

test('riordino: ctr 2 poi 1 ok; ctr troppo vecchio e duplicato ⇒ no', async () => {
    const s = setup();
    await ok(openEnvelope(await s.send(utf8('a'), { ctr: 2 }), s.ctx));
    await ok(openEnvelope(await s.send(utf8('b'), { ctr: 1 }), s.ctx));
    await bad(openEnvelope(await s.send(utf8('c'), { ctr: 2 }), s.ctx), 'replay'); // altro msgId, stesso ctr
    await ok(openEnvelope(await s.send(utf8('d'), { ctr: 200 }), s.ctx));
    await bad(openEnvelope(await s.send(utf8('e'), { ctr: 3 }), s.ctx), 'replay'); // fuori finestra
});

test('manomissione: ciphertext, header, firma, coda, troncamento', async () => {
    const s = setup(), e = await s.send(utf8('x'));
    for (const i of [8, 30, 200, e.length - 5, e.length - 3000]) {
        const t = e.slice(); t[i] ^= 1;
        await bad(openEnvelope(t, s.ctx));
    }
    await bad(openEnvelope(e.subarray(0, e.length - 1), s.ctx), 'malformed');
    await bad(openEnvelope(new Uint8Array([...e, 0]), s.ctx), 'malformed');
    await bad(openEnvelope(new Uint8Array(10), s.ctx), 'malformed');
    assert.equal(s.store.length, 0);
});

test('identità: mittente ignoto, revocato, firma di un altro, destinatario sbagliato', async () => {
    const s = setup(), e = await s.send(utf8('x'));
    await bad(openEnvelope(e, { ...s.ctx, getSenderRecord: () => null }), 'sender');
    await bad(openEnvelope(e, { ...s.ctx, self: generateDeviceIdentity() }), 'recipient');
    const rl = createRevocationList();
    rl.add(makeRevocation({ targetId: s.doc.record.deviceId, signerRecord: s.doc.record, signerSecret: s.doc.secret }));
    await bad(openEnvelope(e, { ...s.ctx, revocations: rl }), 'revoked');
    // un impostore si spaccia per il medico usando il record del medico ma le proprie chiavi
    const evil = generateDeviceIdentity();
    const forged = await sealEnvelope({ sender: { record: s.doc.record, secret: evil.secret }, recipientRecord: s.pat.record, session: 's1.' + 'A'.repeat(22), counter: 0, payload: utf8('x'), now: T });
    await bad(openEnvelope(forged, s.ctx), 'signature');
});

test('freschezza: troppo vecchia o troppo nel futuro ⇒ rifiutata', async () => {
    const s = setup();
    await bad(openEnvelope(await s.send(utf8('x'), { now: T - cfg.freshnessWindowMs - 1 }), s.ctx), 'stale');
    await bad(openEnvelope(await s.send(utf8('x'), { now: T + cfg.clockSkewFutureMs + 1 }), s.ctx), 'stale');
    await ok(openEnvelope(await s.send(utf8('x'), { now: T + cfg.clockSkewFutureMs - 1000 }), s.ctx));
});

test('padding: dimensioni diverse ⇒ stessa lunghezza di busta', async () => {
    const s = setup();
    assert.equal((await s.send(utf8('a'))).length, (await s.send(utf8('a'.repeat(3000)))).length);
});

test('schema invalido o persistenza fallita ⇒ nessun effetto, ritentabile', async () => {
    const s = setup();
    await bad(openEnvelope(await s.send(new Uint8Array([0x21])), s.ctx), 'schema');
    const e = await s.send(utf8('x'), { ctr: 5 });
    s.setFail(true); await bad(openEnvelope(e, s.ctx), 'persist');
    s.setFail(false); await ok(openEnvelope(e, s.ctx)); // il replay non era stato marcato
    assert.equal(s.store.length, 1);
});

test('non collegabilità: due buste della stessa coppia non hanno parti in comune (a parte il magic)', async () => {
    const s = setup(), a = await s.send(utf8('x'), { ctr: 0 }), b = await s.send(utf8('x'), { ctr: 1 });
    const W = 12, seen = new Set();
    const TAIL = 61; // hint ML-DSA-65: ω(55)+k(6) byte strutturali (zeri e contatori), uguali tra firme diverse senza identificare nessuno
    for (let i = 4; i + W <= a.length - TAIL; i++) seen.add(Buffer.from(a.subarray(i, i + W)).toString('hex'));
    for (let i = 4; i + W <= b.length - TAIL; i++) { const k = Buffer.from(b.subarray(i, i + W)).toString('hex'); assert.ok(!seen.has(k) || /^0+$/.test(k)); } // la coda della firma ML-DSA (hint) è zero per struttura, non identifica nessuno
});
