// Carica la configurazione: default prudenti + valori forniti, poi validazione. Risultato immutabile.
// `mode` parte SEMPRE offline (SEC-120); endpoint obbligatori solo se mode = online.
import { validate } from './schema.js';

export const DEFAULTS = Object.freeze({
    env: 'prod',
    mode: 'offline',
    brokerUrl: 'wss://offline.invalid/',   // segnaposto: ignorato finché mode = offline
    relayUrl: 'https://offline.invalid/',
    messageTtlHours: 72,
    padBlockBytes: 4096,
    maxPayloadBytes: 1024 * 1024,
    maxDecompressedBytes: 8 * 1024 * 1024,
    maxDecompressionRatio: 20,
    maxSkippedKeys: 100,
    clockSkewFutureMs: 5 * 60 * 1000,
    freshnessWindowMs: 72 * 3600 * 1000,
    idleLockMs: 5 * 60 * 1000,
    enrollmentTtlSec: 120,
    pairingTtlSec: 120,
    pairingMaxAttempts: 3,
});

export const loadConfig = (overrides = {}) => {
    const cfg = { ...DEFAULTS, ...overrides };
    validate(cfg);
    // D-04: il trasporto è la cassetta postale HTTP (relayUrl). Il broker MQTT non è usato.
    if (cfg.mode === 'online' && cfg.relayUrl.includes('.invalid')) {
        throw new Error('config: modalità online senza endpoint configurati');
    }
    return Object.freeze(cfg);
};
