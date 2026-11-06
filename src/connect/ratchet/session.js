// Sessione ratchet a KEM ibrido (X-Wing = X25519 + ML-KEM-768), struttura Double Ratchet (SEC-40..45).
// Ogni "giro" (epoca) il mittente incapsula verso l'ultima chiave pubblica del peer e ne pubblica una nuova ⇒
// forward secrecy e post-compromise security, sia classiche sia post-quantum. Dentro un'epoca: catena di chiavi.
// ATTENZIONE: è l'implementazione NOSTRA di uno schema noto, composta da primitive auditate; NON è un
// protocollo formalmente verificato né una libreria auditata (cfr. SEC-19/27, D-02). Richiede revisione esterna.
// Ruoli: initiator (medico) scrive per primo; responder (paziente) può scrivere solo dopo aver ricevuto.
import { b64u } from '../crypto/bytes.js';
import { keyId } from './header.js';
import { wipe } from './kdf.js';
import { encryptWith, decryptWith } from './message.js';

const KEEP_KEMS = 3;
const blank = (sid, rk, maxSkipped) => ({ sid, rk, cks: null, ckr: null, ns: 0, nr: 0, pn: 0, sendEid: null, recvEid: null,
    pending: null, needSend: false, peerPk: null, kems: new Map(), skipped: new Map(), maxSkipped, garbage: [] });

export const cloneState = (s) => ({ ...s, garbage: [], kems: new Map(s.kems), skipped: new Map(s.skipped), pending: s.pending && { ...s.pending } });

export const createSession = (st) => {
    let state = st;
    let q = Promise.resolve();
    const serial = (fn) => { const r = q.then(fn); q = r.catch(() => {}); return r; };
    // Solo a operazione riuscita: si sostituisce lo stato e si azzerano i segreti superati (best effort in JS).
    const commit = (s) => { const g = s.garbage; s.garbage = []; state = s; wipe(...g); };
    return {
        get sid() { return state.sid; },
        // Atomico: lo stato avanza solo se l'operazione riesce per intero.
        // Operazioni SERIALIZZATE: due chiamate sovrapposte lavorerebbero sullo stesso stato e una perderebbe l'aggiornamento.
        encrypt: (plaintext) => serial(async () => { const s = cloneState(state); const out = await encryptWith(s, plaintext); commit(s); return out; }),
        decrypt: (bytes) => serial(async () => { const s = cloneState(state); const out = await decryptWith(s, bytes); commit(s); return out; }),
        exportState: () => serialize(state),
    };
};

export const createInitiator = ({ seed, sid, peerKemPk, maxSkippedKeys }) => {
    const s = blank(sid, seed, maxSkippedKeys);
    s.peerPk = peerKemPk; s.needSend = true;
    return createSession(s);
};

export const createResponder = ({ seed, sid, identityKem, maxSkippedKeys }) => {
    const s = blank(sid, seed, maxSkippedKeys);
    // COPIA: il ratchet azzera le chiavi usate; senza copia azzererebbe la chiave d'identità del dispositivo.
    s.kems.set(keyId(identityKem.publicKey), { publicKey: identityKem.publicKey.slice(), secretKey: identityKem.secretKey.slice() });
    return createSession(s);
};

const serialize = (s) => JSON.stringify({ ...s, garbage: undefined, rk: b64u.enc(s.rk), cks: s.cks && b64u.enc(s.cks), ckr: s.ckr && b64u.enc(s.ckr),
    peerPk: s.peerPk && b64u.enc(s.peerPk),
    kems: [...s.kems].map(([k, v]) => [k, b64u.enc(v.publicKey), b64u.enc(v.secretKey)]),
    skipped: [...s.skipped].map(([k, v]) => [k, b64u.enc(v)]) });
