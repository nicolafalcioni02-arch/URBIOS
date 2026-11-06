// Canale sicuro tra DUE dispositivi: compone ratchet (FS/PCS, dentro) + envelope (firma/replay, fuori).
// È l'unico punto che conosce insieme chiavi e payload; `sync/` e `transport/` restano ciechi.
//   invio:      payload ─ratchet.encrypt→ ─sealEnvelope→ byte opachi per il trasporto
//   ricezione:  byte ─openEnvelope→ ─ratchet.decrypt→ payload ─handler→ (persist)
// Nota: la decifratura ratchet avviene nel passo "persist" della busta (se fallisce, il replay NON viene marcato).
// Se il handler rifiuta dopo la decifratura ratchet, il messaggio è consumato: l'altro lato deve reinviarne uno nuovo.
import { sealEnvelope } from '../envelope/seal.js';
import { openEnvelope } from '../envelope/open.js';

export const createChannel = ({ cfg, self, peerRecord, session, replay, revocations, now = () => Date.now(), onPayload, counter = 0 }) => {
    let ctr = counter;
    return {
        async send(payload) {
            const inner = await session.encrypt(payload);
            return sealEnvelope({ sender: self, recipientRecord: peerRecord, session: session.sid, counter: ctr++, payload: inner, now: now(), padBlock: cfg.padBlockBytes });
        },
        // Ritorna {ok, reason?}. `reason` da elenco chiuso (solo per audit, mai mostrato all'altro lato).
        async receive(bytes) {
            let decoded = null;
            const r = await openEnvelope(bytes, {
                cfg, self, now, replay, revocations,
                getSenderRecord: (id) => (id === peerRecord.deviceId ? peerRecord : null),
                validate: () => {},
                persist: async (inner, header) => {
                    const payload = await session.decrypt(inner);
                    await onPayload(payload, header.sender);
                    decoded = payload;
                },
            });
            return r.ok ? { ok: true } : { ok: false, reason: r.reason };
        },
        get counter() { return ctr; },
    };
};
