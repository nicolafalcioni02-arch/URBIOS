// Un paziente collegato (lato medico) o il medico collegato (lato paziente): ratchet + anti-replay + coda in uscita
// + casella + canale, con snapshot/restore. Tutto ciò che tocca lo stato crittografico è SERIALIZZATO.
import { b64u } from '../crypto/bytes.js';
import { createReplayState } from '../envelope/steps/replay.js';
import { createRevocationList } from '../identity/revocation.js';
import { createChannel } from '../channel/channel.js';
import { createOutbox } from '../sync/outbox.js';
import { encodeMessage, decodeMessage } from '../sync/message.js';
import { createMailbox } from '../transport/mailbox.js';

// d = { pid, peerRecord, sid, keys:{out,in}, session, ctr?, replay?, outbox?, cursors? }
export const buildPeer = ({ cfg, self, relay, now, onMessage }, d) => {
    const replay = createReplayState(), outbox = createOutbox({ maxBytes: Math.max(cfg.maxPayloadBytes * 2, 8 * 1024 * 1024) });
    if (d.replay) replay.restore(d.replay);
    if (d.outbox) outbox.restore(d.outbox);
    const mailbox = createMailbox({ relay, outTopicKey: d.keys.out, inTopicKey: d.keys.in, sid: d.sid, now });
    if (d.cursors) mailbox.restore(d.cursors);
    const peer = { pid: d.pid };
    const channel = createChannel({
        cfg, self, peerRecord: d.peerRecord, session: d.session, replay, revocations: createRevocationList(), now, counter: d.ctr || 0,
        onPayload: async (bytes, from) => {
            const m = decodeMessage(bytes, cfg.maxPayloadBytes);
            if (m.t === 'ack') outbox.ack(m.of);
            else if (onMessage) await onMessage(m, from, peer);
        },
    });
    // DUE code distinte: il gestore dei messaggi in arrivo (dentro pump) mette in coda gli ack; se condividessero la
    // coda, pump aspetterebbe sé stesso (deadlock). Il ratchet serializza comunque encrypt/decrypt.
    const chain = () => { let q = Promise.resolve(); return (fn) => { const r = q.then(fn); q = r.catch(() => {}); return r; }; };
    const serialSend = chain(), serialPump = chain();

    const enqueue = (msg, ref) => serialSend(async () => {
        const env = await channel.send(encodeMessage(msg, cfg.maxPayloadBytes));
        return outbox.enqueue(ref, env, { priority: msg.t === 'ack' ? 1 : 5, now: now() });
    });
    return Object.assign(peer, {
        peerRecord: d.peerRecord, sid: d.sid,
        sendMessage: (msg) => enqueue(msg, msg.ref),                // doc.put / doc.withdraw (chiave coda = ref)
        sendAck: (of) => enqueue({ v: 1, t: 'ack', of }, `a${of}`),
        // Invia ciò che è in scadenza, poi legge la casella. Errori di rete: non fatali, si riprova (backoff).
        pump: () => serialPump(async () => {
            const r = { sent: 0, received: 0, rejected: 0, errors: [] };
            for (const i of outbox.due(now())) {
                try { await mailbox.send(i.payload); outbox.markSent(i.ref, now()); r.sent++; } catch (e) { outbox.markSent(i.ref, now()); r.errors.push(e.message); }
            }
            const { messages, errors } = await mailbox.poll();
            r.errors.push(...errors);
            for (const m of messages) { const x = await channel.receive(m); x.ok ? r.received++ : r.rejected++; }
            return r;
        }),
        info: () => ({ pid: d.pid, peerDeviceId: d.peerRecord.deviceId, queued: outbox.size(), failed: outbox.failed().length, pendingRefs: outbox.refs(), failedRefs: outbox.failed() }),
        snapshot: () => ({ pid: d.pid, record: d.peerRecord, sid: d.sid, keys: { out: b64u.enc(d.keys.out), in: b64u.enc(d.keys.in) },
            ratchet: d.session.exportState(), replay: replay.snapshot(), outbox: outbox.snapshot(), cursors: mailbox.snapshot(), ctr: channel.counter }),
    });
};
