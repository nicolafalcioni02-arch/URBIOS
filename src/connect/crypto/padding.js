// Padding a blocchi PRIMA della cifratura AEAD (SEC-17). Layout: len(4, BE) || dati || casuali.
// La lunghezza vera sta dentro il testo cifrato ⇒ autenticata e non visibile.
import { randomBytes } from './random.js';
import { u32be } from './bytes.js';

export const DEFAULT_BLOCK = 4096;
export const MAX_PAYLOAD = 16 * 1024 * 1024;

export const pad = (data, block = DEFAULT_BLOCK) => {
    if (data.length > MAX_PAYLOAD) throw new RangeError('padding: payload troppo grande');
    const total = Math.ceil((data.length + 4) / block) * block;
    const out = new Uint8Array(total);
    out.set(u32be(data.length), 0);
    out.set(data, 4);
    out.set(randomBytes(total - 4 - data.length), 4 + data.length);
    return out;
};

export const unpad = (padded, block = DEFAULT_BLOCK) => {
    if (padded.length < block || padded.length % block !== 0) throw new Error('padding non valido');
    const len = ((padded[0] << 24) | (padded[1] << 16) | (padded[2] << 8) | padded[3]) >>> 0;
    if (len > MAX_PAYLOAD || len > padded.length - 4) throw new Error('padding non valido');
    return padded.slice(4, 4 + len);
};
