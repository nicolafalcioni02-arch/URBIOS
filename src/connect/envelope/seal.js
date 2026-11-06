// Costruzione della busta (mittente). Ordine: pad → KEM ibrido → chiave per messaggio → AEAD(AAD=header) → firma transcript.
// v1: una encapsulazione X-Wing per messaggio verso la chiave di accordo del destinatario.
// LIMITE ONESTO: senza ratchet (strato successivo) la compromissione della chiave KEM del destinatario
// svela i messaggi passati: nessuna forward secrecy finché non arriva `ratchet/`.
import { sha256 } from '@noble/hashes/sha2.js';
import * as kem from '../crypto/kem.js';
import * as sig from '../crypto/sign.js';
import { seal as aeadSeal } from '../crypto/aead.js';
import { concat } from '../crypto/bytes.js';
import { hkdfSha256 } from '../crypto/kdf.js';
import { pad } from '../crypto/padding.js';
import { b64u } from '../crypto/bytes.js';
import { MAGIC } from './format.js';
import { randomBytes } from '../crypto/random.js';
import { DEFAULT_SUITE } from '../crypto/suites.js';
import { newOpaqueId } from '../identity/opaqueId.js';
import { buildHeaderBytes, PROTOCOL_VERSION } from './header.js';
import { encodeEnvelope, signedBytes } from './format.js';

export const deriveMessageKey = (sharedSecret, headerBytes) =>
    hkdfSha256(sharedSecret, { salt: sha256(headerBytes), purpose: 'envelope/msg-key' });
// Chiave dell'intestazione: dipende solo da segreto KEM e ct (il destinatario la ricava prima di conoscere il mittente).
export const deriveHeaderKey = (sharedSecret, kemCt) =>
    hkdfSha256(sharedSecret, { salt: sha256(kemCt), purpose: 'envelope/header-key' });
export const headerAad = (kemCt) => concat(MAGIC, kemCt);

export const sealEnvelope = async ({ sender, recipientRecord, session, counter, payload, now = Date.now(), padBlock = 4096 }) => {
    const { cipherText, sharedSecret } = kem.encapsulate(b64u.dec(recipientRecord.kemPk));
    const headerBytes = buildHeaderBytes({
        v: PROTOCOL_VERSION, suite: DEFAULT_SUITE,
        sender: sender.record.deviceId, recipient: recipientRecord.deviceId,
        msgId: b64u.enc(randomBytes(16)), session: session || newOpaqueId('s'),
        ts: now, ctr: counter,
    });
    const sealedHeader = await aeadSeal(deriveHeaderKey(sharedSecret, cipherText), headerBytes, headerAad(cipherText));
    const ciphertext = await aeadSeal(deriveMessageKey(sharedSecret, headerBytes), pad(payload, padBlock), headerBytes);
    const signature = sig.sign('envelope', signedBytes(cipherText, sealedHeader, ciphertext), sender.secret.sig);
    return encodeEnvelope({ kemCt: cipherText, sealedHeader, ciphertext, signature });
};
