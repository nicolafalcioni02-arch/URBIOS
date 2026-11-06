// Lato medico (in studio). Monouso, scadenza, massimo tentativi, attivazione solo con doppia conferma (SEC-30..34).
import { b64u, equal } from '../crypto/bytes.js';
import { randomBytes } from '../crypto/random.js';
import { newOpaqueId } from '../identity/opaqueId.js';
import { verifyDeviceRecord } from '../identity/deviceKeys.js';
import { encodeOffer } from './qrPayload.js';
import { recordHash, sasDigits, mac, sessionSeed } from './transcript.js';

export const createDoctorPairing = ({ doctorRecord, cfg, now = Date.now(), relayUrl = cfg.relayUrl }) => {
    const offer = {
        v: 1, pid: newOpaqueId('s'), exp: now + cfg.pairingTtlSec * 1000,
        patient: newOpaqueId('p'), doc: doctorRecord.deviceId, dh: recordHash(doctorRecord), ps: b64u.enc(randomBytes(32)), rl: relayUrl,
    };
    let state = 'offered', attempts = 0, patientRecord = null, localOk = false, peerOk = false;
    const alive = (t) => { if (state === 'dead') return false; if (t > offer.exp) { state = 'dead'; return false; } return true; };
    const kill = () => { state = 'dead'; patientRecord = null; };

    return {
        qr: encodeOffer(offer), patientId: offer.patient,
        get state() { return state; },
        // `resp`: { pid, patientRecord, proof } arrivato dal trasporto. Ritorna la SAS da mostrare.
        receiveResponse(resp, t = Date.now()) {
            if (state !== 'offered' || !alive(t)) throw new Error('pairing non disponibile');
            let ok = false;
            try {
                ok = resp.pid === offer.pid && verifyDeviceRecord(resp.patientRecord, t)
                    && equal(b64u.dec(resp.proof), b64u.dec(mac(offer, resp.patientRecord, 'pairing/resp')));
            } catch { ok = false; }
            if (!ok) { if (++attempts >= cfg.pairingMaxAttempts) kill(); throw new Error('pairing non valido'); }
            patientRecord = resp.patientRecord; state = 'sas';
            return sasDigits(offer, patientRecord);
        },
        // L'utente ha confrontato la SAS: true = coincide. false o scadenza ⇒ sessione distrutta.
        confirmLocal(matches, t = Date.now()) {
            if (state !== 'sas' || !alive(t)) throw new Error('pairing non disponibile');
            if (!matches) { kill(); throw new Error('sas non coincide'); }
            localOk = true;
            return mac(offer, patientRecord, 'pairing/confirm', 'doctor');
        },
        receivePeerConfirm(token, t = Date.now()) {
            if (state !== 'sas' || !alive(t)) throw new Error('pairing non disponibile');
            if (!equal(b64u.dec(token), b64u.dec(mac(offer, patientRecord, 'pairing/confirm', 'patient')))) { kill(); throw new Error('conferma non valida'); }
            peerOk = true;
        },
        // Solo con ENTRAMBE le conferme. Dopo il completamento l'offerta è bruciata.
        finish(t = Date.now()) {
            if (state !== 'sas' || !localOk || !peerOk || !alive(t)) throw new Error('pairing non completo');
            const out = { patientRecord, patientId: offer.patient, sid: offer.pid, seed: sessionSeed(offer, patientRecord) };
            state = 'dead';
            return out;
        },
    };
};
