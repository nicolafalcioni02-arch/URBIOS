// Schema stretto della configurazione (SEC-60/61/03). Qualsiasi campo ignoto o non valido ⇒ errore all'avvio.
export const ENVS = ['dev', 'test', 'prod'];
export const MODES = ['offline', 'online'];

const SECRET_NAME = /(secret|password|passphrase|private|token|apikey|api_key|credential)/i;
const isUrl = (v, protos) => { try { return protos.includes(new URL(v).protocol); } catch { return false; } };
const int = (min, max) => (v) => Number.isInteger(v) && v >= min && v <= max;

// campo -> validatore. NESSUN default qui: i default stanno in load.js e sono tutti "chiusi".
export const FIELDS = {
    env: (v) => ENVS.includes(v),
    mode: (v) => MODES.includes(v),
    brokerUrl: (v, c) => (c.env === 'prod' ? isUrl(v, ['wss:']) : isUrl(v, ['wss:', 'ws:'])),
    relayUrl: (v, c) => (c.env === 'prod' ? isUrl(v, ['https:', 'wss:']) : isUrl(v, ['https:', 'http:', 'wss:', 'ws:'])),
    messageTtlHours: int(1, 72),
    padBlockBytes: (v) => [1024, 2048, 4096, 8192].includes(v),
    maxPayloadBytes: int(1024, 16 * 1024 * 1024),
    maxDecompressedBytes: int(1024, 64 * 1024 * 1024),
    maxDecompressionRatio: int(1, 100),
    maxSkippedKeys: int(0, 1000),
    clockSkewFutureMs: int(0, 10 * 60 * 1000),
    freshnessWindowMs: int(60 * 1000, 7 * 24 * 3600 * 1000),
    idleLockMs: int(30 * 1000, 60 * 60 * 1000),
    enrollmentTtlSec: int(10, 120),
    pairingTtlSec: int(30, 600),
    pairingMaxAttempts: int(1, 5),
};

export const validate = (cfg) => {
    if (!cfg || typeof cfg !== 'object') throw new Error('config: oggetto richiesto');
    for (const k of Object.keys(cfg)) {
        if (SECRET_NAME.test(k)) throw new Error(`config: "${k}" sembra un segreto, non va in configurazione`);
        if (!(k in FIELDS)) throw new Error(`config: campo sconosciuto "${k}"`);
    }
    for (const [k, ok] of Object.entries(FIELDS)) {
        if (!ok(cfg[k], cfg)) throw new Error(`config: valore non valido per "${k}"`);
    }
    return cfg;
};
