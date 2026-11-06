// Serializzazione canonica (JSON a chiavi ordinate, senza spazi) per firme e hash.
// Rifiuta valori ambigui: undefined, NaN, funzioni, numeri non interi/non sicuri.
import { utf8 } from './bytes.js';

const walk = (v) => {
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
    if (typeof v === 'number') {
        if (!Number.isSafeInteger(v)) throw new Error('canonical: solo interi sicuri');
        return v;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
        const o = {};
        for (const k of Object.keys(v).sort()) o[k] = walk(v[k]);
        return o;
    }
    throw new Error('canonical: tipo non ammesso');
};

export const canonicalBytes = (value) => utf8(JSON.stringify(walk(value)));
