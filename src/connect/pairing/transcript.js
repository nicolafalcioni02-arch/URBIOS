// Transcript del pairing e SAS (SEC-32). Il transcript lega: QR (id, scadenza, hash del record del medico),
// record del paziente, suite. Tutto ciò che un attaccante dovrebbe falsificare.
// SAS = 12 cifre (~40 bit) derivate con HKDF dal transcript E dal segreto del QR.
// Perché basta senza commit-reveal: il lato "medico" è fissato dal QR, quindi l'attaccante deve
// trovare una chiave paziente che dia una SAS UGUALE a una data (seconda preimmagine, ~2^40 generazioni di chiavi
// ML-DSA/ML-KEM entro la scadenza), non una collisione (birthday).
import { sha256 } from '@noble/hashes/sha2.js';
import { hmac } from '@noble/hashes/hmac.js';
import { b64u, utf8 } from '../crypto/bytes.js';
import { canonicalBytes } from '../crypto/canonical.js';
import { hkdfSha256 } from '../crypto/kdf.js';
import { DEFAULT_SUITE } from '../crypto/suites.js';

export const recordHash = (record) => b64u.enc(sha256(canonicalBytes(record)));

export const transcriptBytes = (offer, patientRecord) =>
    canonicalBytes({ suite: DEFAULT_SUITE, offer, ph: recordHash(patientRecord) });

export const sasDigits = (offer, patientRecord) => {
    const t = transcriptBytes(offer, patientRecord);
    const b = hkdfSha256(b64u.dec(offer.ps), { salt: sha256(t), purpose: 'pairing/sas', length: 8 });
    let n = 0n; for (const x of b) n = (n << 8n) | BigInt(x);
    const d = (n % 10n ** 12n).toString().padStart(12, '0');
    return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
};

const macKey = (offer, patientRecord, purpose) =>
    hkdfSha256(b64u.dec(offer.ps), { salt: sha256(transcriptBytes(offer, patientRecord)), purpose });

// Prova di aver scansionato il QR (risposta del paziente) e conferme dei due lati.
export const mac = (offer, patientRecord, purpose, extra = '') =>
    b64u.enc(hmac(sha256, macKey(offer, patientRecord, purpose), utf8(extra)));

// Seme della sessione ratchet: dipende dal segreto del QR e dal transcript (SEC-40). Non è la chiave dei messaggi.
export const sessionSeed = (offer, patientRecord) => macKey(offer, patientRecord, 'ratchet/seed');
