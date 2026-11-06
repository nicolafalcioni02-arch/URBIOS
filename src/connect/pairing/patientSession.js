// Lato paziente (app): scansiona il QR, verifica il record del medico contro l'hash del QR, risponde con prova.
import { b64u, equal } from '../crypto/bytes.js';
import { verifyDeviceRecord } from '../identity/deviceKeys.js';
import { decodeOffer } from './qrPayload.js';
import { recordHash, sasDigits, mac, sessionSeed } from './transcript.js';

// `identity`: identità del dispositivo del paziente già generata (generateDeviceIdentity).
// `doctorRecord`: record pubblico ricevuto dal trasporto; si accetta SOLO se l'hash coincide col QR.
export const createPatientPairing = ({ qr, doctorRecord, identity, now = Date.now() }) => {
    const offer = decodeOffer(qr, now);
    if (recordHash(doctorRecord) !== offer.dh || doctorRecord.deviceId !== offer.doc || !verifyDeviceRecord(doctorRecord, now)) {
        throw new Error('record del medico non corrisponde al QR');
    }
    let state = 'sas', localOk = false, peerOk = false;
    const alive = (t) => { if (state === 'dead') return false; if (t > offer.exp) { state = 'dead'; return false; } return true; };
    return {
        patientId: offer.patient,
        response: { pid: offer.pid, patientRecord: identity.record, proof: mac(offer, identity.record, 'pairing/resp') },
        sas: sasDigits(offer, identity.record),
        get state() { return state; },
        confirmLocal(matches, t = Date.now()) {
            if (state !== 'sas' || !alive(t)) throw new Error('pairing non disponibile');
            if (!matches) { state = 'dead'; throw new Error('sas non coincide'); }
            localOk = true;
            return mac(offer, identity.record, 'pairing/confirm', 'patient');
        },
        receivePeerConfirm(token, t = Date.now()) {
            if (state !== 'sas' || !alive(t)) throw new Error('pairing non disponibile');
            if (!equal(b64u.dec(token), b64u.dec(mac(offer, identity.record, 'pairing/confirm', 'doctor')))) { state = 'dead'; throw new Error('conferma non valida'); }
            peerOk = true;
        },
        finish(t = Date.now()) {
            if (state !== 'sas' || !localOk || !peerOk || !alive(t)) throw new Error('pairing non completo');
            state = 'dead';
            return { doctorRecord, patientId: offer.patient, sid: offer.pid, seed: sessionSeed(offer, identity.record) };
        },
    };
};
