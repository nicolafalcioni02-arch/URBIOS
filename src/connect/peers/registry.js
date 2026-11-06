// Registro dei collegamenti (un `peer` per paziente). Parte di persistenza `sessionBound`: se lo stato torna
// indietro (rollback/dispositivo nuovo) il registro si svuota ⇒ si rifà il pairing (SEC-45).
import { b64u } from '../crypto/bytes.js';
import * as kem from '../crypto/kem.js';
import { createInitiator, createResponder } from '../ratchet/session.js';
import { restoreSession } from '../ratchet/restore.js';
import { deriveTopicKey } from '../transport/topics.js';
import { isOpaqueId } from '../identity/opaqueId.js';
import { buildPeer } from './peer.js';

const MAX_PEERS = 500;

export const createPeerRegistry = ({ cfg, getSelf, relay, now = () => Date.now(), onMessage, role = 'doctor' }) => {
    const peers = new Map();
    const deps = () => ({ cfg, self: getSelf(), relay, now, onMessage });
    const keysFor = (seed) => (role === 'doctor'
        ? { out: deriveTopicKey(seed, 'd2p'), in: deriveTopicKey(seed, 'p2d') }
        : { out: deriveTopicKey(seed, 'p2d'), in: deriveTopicKey(seed, 'd2p') });
    return {
        add({ pid, peerRecord, sid, seed }) {
            if (peers.size >= MAX_PEERS) throw new Error('troppi collegamenti');
            if (peers.has(pid) || !isOpaqueId(pid, role === 'doctor' ? 'p' : 'd')) throw new Error('collegamento non valido');
            const self = getSelf();
            const session = role === 'doctor'
                ? createInitiator({ seed, sid, peerKemPk: b64u.dec(peerRecord.kemPk), maxSkippedKeys: cfg.maxSkippedKeys })
                : createResponder({ seed, sid, identityKem: { publicKey: b64u.dec(self.record.kemPk), secretKey: self.secret.kemSk }, maxSkippedKeys: cfg.maxSkippedKeys });
            const peer = buildPeer(deps(), { pid, peerRecord, sid, keys: keysFor(seed), session });
            peers.set(pid, peer);
            return peer;
        },
        get: (pid) => peers.get(pid) || null,
        list: () => [...peers.values()].map((p) => p.info()),
        remove: (pid) => peers.delete(pid),
        all: () => [...peers.values()],
        part: {
            sessionBound: true,
            snapshot: () => [...peers.values()].map((p) => p.snapshot()),
            reset: () => peers.clear(),
            restore(arr) {
                peers.clear();
                for (const s of arr) {
                    const keys = { out: b64u.dec(s.keys.out), in: b64u.dec(s.keys.in) };
                    peers.set(s.pid, buildPeer(deps(), { pid: s.pid, peerRecord: s.record, sid: s.sid, keys, session: restoreSession(s.ratchet), ctr: s.ctr, replay: s.replay, outbox: s.outbox, cursors: s.cursors }));
                }
            },
        },
    };
};
