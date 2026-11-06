// Ricezione: pipeline a ordine fisso (SEC-53). Non lancia mai su input ostile: ritorna {ok:false, reason}
// con `reason` da elenco chiuso (per audit; all'esterno non si spiega mai il motivo).
// Scostamento dalla lista della spec (voluto): i controlli economici (firma, freschezza, replay in sola
// lettura) vanno PRIMA della decifratura per limitare il costo di un flood; lo stato cambia solo al commit.
import * as kem from '../crypto/kem.js';
import * as sig from '../crypto/sign.js';
import { open as aeadOpen } from '../crypto/aead.js';
import { unpad } from '../crypto/padding.js';
import { b64u } from '../crypto/bytes.js';
import { verifyDeviceRecord } from '../identity/deviceKeys.js';
import { decodeEnvelope, signedBytes } from './format.js';
import { parseHeader } from './header.js';
import { deriveMessageKey, deriveHeaderKey, headerAad } from './seal.js';
import { checkFresh } from './steps/freshness.js';

const fail = (reason) => ({ ok: false, reason });

// ctx: { cfg, self:{record,secret}, getSenderRecord(id), revocations, replay, now(), validate(payload,header), persist(payload,header) }
export const openEnvelope = async (bytes, ctx) => {
    const { cfg } = ctx, now = ctx.now ? ctx.now() : Date.now();
    let step = 'malformed';
    try {
        const maxCt = cfg.maxPayloadBytes + cfg.padBlockBytes + 64;
        const { kemCt, sealedHeader, ciphertext, signature } = decodeEnvelope(bytes, { maxCiphertext: maxCt, kemLen: kem.LENGTHS.cipherText });
        // Intestazione cifrata: una decapsulazione (economica, < verifica ML-DSA) la rivela solo al destinatario vero.
        step = 'recipient';
        const ss = kem.decapsulate(kemCt, ctx.self.secret.kemSk);
        let headerBytes;
        try { headerBytes = await aeadOpen(deriveHeaderKey(ss, kemCt), sealedHeader, headerAad(kemCt)); } catch { return fail('recipient'); }
        step = 'header'; const h = parseHeader(headerBytes);                                  // 1-2
        if (h.recipient !== ctx.self.record.deviceId) return fail('recipient');            // 4
        step = 'sender';                                                                      // 3
        const rec = ctx.getSenderRecord(h.sender);
        if (!rec || rec.deviceId !== h.sender || !verifyDeviceRecord(rec, now)) return fail('sender');
        if (ctx.revocations.isRevoked(h.sender)) return fail('revoked');
        step = 'signature';                                                                   // 5
        const pk = { ed: b64u.dec(rec.sigPk.ed), pq: b64u.dec(rec.sigPk.pq) };
        if (!sig.verify('envelope', signedBytes(kemCt, sealedHeader, ciphertext), signature, pk)) return fail('signature');
        step = 'stale'; checkFresh(h.ts, now, cfg);                                           // 7
        step = 'replay'; ctx.replay.check(h.sender, h.session, h.ctr, h.msgId);              // 8-10 (sola lettura)
        step = 'auth';                                                                        // 6
        const padded = await aeadOpen(deriveMessageKey(ss, headerBytes), ciphertext, headerBytes);
        step = 'payload'; const payload = unpad(padded, cfg.padBlockBytes);                  // 11-12
        if (payload.length > cfg.maxPayloadBytes) return fail('payload');
        step = 'schema'; ctx.validate(payload, h);                                            // 13
        step = 'persist'; await ctx.persist(payload, h);                                      // 14
        ctx.replay.commit(h.sender, h.session, h.ctr, h.msgId, now);                          // 15
        return { ok: true, header: h, payload };
    } catch (e) {
        return fail(['stale', 'replay'].includes(e.message) ? e.message : step);
    }
};
