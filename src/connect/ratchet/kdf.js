// KDF del ratchet (domini separati, SEC-12/41). Catena unidirezionale: dal ck non si risale al precedente.
import { hkdfSha256 } from '../crypto/kdf.js';

// Nuova radice + nuova catena da (radice, segreto KEM ibrido).
export const kdfRoot = (rk, sharedSecret) => {
    const out = hkdfSha256(sharedSecret, { salt: rk, purpose: 'ratchet/root', length: 64 });
    return { rk: out.slice(0, 32), ck: out.slice(32) };
};

// Chiave del messaggio (monouso) + prossima chiave di catena.
export const kdfChain = (ck) => ({
    mk: hkdfSha256(ck, { purpose: 'ratchet/message-key' }),
    ck: hkdfSha256(ck, { purpose: 'ratchet/chain-key' }),
});

export const wipe = (...bufs) => { for (const b of bufs) if (b instanceof Uint8Array) b.fill(0); }; // best effort (JS)
