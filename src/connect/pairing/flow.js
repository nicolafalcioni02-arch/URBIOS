// Pairing su relay (SEC-30..34): il QR porta il segreto; record, risposta e conferme viaggiano su caselle
// derivate da quel segreto. Due controller: medico (genera il QR) e paziente (lo scansiona).
// Macchina a stati: tutto ciò che arriva dal relay è DATO NON FIDATO (validato da pairing/*Session.js).
import { canonicalBytes } from '../crypto/canonical.js';
import { b64u } from '../crypto/bytes.js';
import { pairingTopic } from '../transport/topics.js';
import { decodeOffer } from './qrPayload.js';
import { createDoctorPairing } from './doctorSession.js';
import { createPatientPairing } from './patientSession.js';

const MAX_MSG = 64 * 1024;
const TYPES = ['record', 'response', 'confirm'];
const enc = (o) => canonicalBytes(o);
const dec = (bytes) => {
    if (bytes.length > MAX_MSG) throw new Error('messaggio troppo grande');
    const m = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!m || typeof m !== 'object' || !TYPES.includes(m.t)) throw new Error('messaggio non valido');
    return m;
};

// Legge i nuovi messaggi di una casella ignorando quelli già visti e quelli malformati.
const makeReader = (relay, topic) => {
    const seen = new Set();
    return async () => {
        const out = [];
        for (const i of await relay.fetchNew(topic, '')) {
            if (seen.has(i.id)) continue;
            seen.add(i.id);
            try { out.push(dec(i.data)); } catch { /* spazzatura: ignorata */ }
        }
        return out;
    };
};

export const startDoctorPairing = async ({ relay, doctor, cfg, now = () => Date.now() }) => {
    const p = createDoctorPairing({ doctorRecord: doctor.record, cfg, now: now() });
    const offer = decodeOffer(p.qr, now());
    const ps = b64u.dec(offer.ps), out = pairingTopic(ps, offer.pid, 'd2p'), inn = pairingTopic(ps, offer.pid, 'p2d');
    const read = makeReader(relay, inn);
    await relay.put(out, enc({ t: 'record', record: doctor.record }));
    const c = { state: 'waiting-patient', sas: null, result: null, error: null };
    const fail = (e) => { c.state = 'failed'; c.error = e; };
    return Object.assign(c, {
        qr: p.qr, patientId: p.patientId, expiresAt: offer.exp,
        async poll() {
            if (['done', 'failed'].includes(c.state)) return c.state;
            if (now() > offer.exp) { fail('scaduto'); return c.state; }
            for (const m of await read()) {
                try {
                    if (c.state === 'waiting-patient' && m.t === 'response') { c.sas = p.receiveResponse(m, now()); c.state = 'confirm-sas'; }
                    else if (c.state === 'waiting-peer' && m.t === 'confirm') { p.receivePeerConfirm(m.token, now()); c.result = p.finish(now()); c.state = 'done'; }
                } catch { if (p.state === 'dead') fail('tentativi esauriti'); }
            }
            return c.state;
        },
        // matches: l'utente ha confrontato la SAS con quella del paziente
        async confirmSas(matches) {
            if (c.state !== 'confirm-sas') return;
            try { const token = p.confirmLocal(matches, now()); await relay.put(out, enc({ t: 'confirm', token })); c.state = 'waiting-peer'; }
            catch { fail(matches ? 'errore' : 'codice non coincide'); }
        },
        cancel() { fail('annullato'); },
    });
};

export const startPatientPairing = async ({ relay, qr, identity, now = () => Date.now() }) => {
    const offer = decodeOffer(qr, now());
    const ps = b64u.dec(offer.ps), out = pairingTopic(ps, offer.pid, 'p2d'), inn = pairingTopic(ps, offer.pid, 'd2p');
    const read = makeReader(relay, inn);
    let p = null;
    const c = { state: 'waiting-record', sas: null, result: null, error: null };
    const fail = (e) => { c.state = 'failed'; c.error = e; };
    return Object.assign(c, {
        patientId: offer.patient,
        async poll() {
            if (['done', 'failed'].includes(c.state)) return c.state;
            if (now() > offer.exp) { fail('scaduto'); return c.state; }
            for (const m of await read()) {
                try {
                    if (c.state === 'waiting-record' && m.t === 'record') {
                        p = createPatientPairing({ qr, doctorRecord: m.record, identity, now: now() }); // verifica hash del QR
                        await relay.put(out, enc({ t: 'response', ...p.response }));
                        c.sas = p.sas; c.state = 'confirm-sas';
                    } else if (c.state === 'waiting-peer' && m.t === 'confirm') { p.receivePeerConfirm(m.token, now()); c.result = p.finish(now()); c.state = 'done'; }
                } catch { /* messaggio non valido: si aspetta quello giusto */ }
            }
            return c.state;
        },
        async confirmSas(matches) {
            if (c.state !== 'confirm-sas') return;
            try { const token = p.confirmLocal(matches, now()); await relay.put(out, enc({ t: 'confirm', token })); c.state = 'waiting-peer'; }
            catch { fail(matches ? 'errore' : 'codice non coincide'); }
        },
    });
};
