// Formato binario della busta (SEC-50): "URB1" | u32 lenH | header | u32 lenC | ciphertext | u32 lenS | firma
// Parsing STRETTO: lunghezze controllate prima di leggere, nessun byte residuo, limiti dall'esterno.
import { concat, u32be } from '../crypto/bytes.js';

export const MAGIC = new Uint8Array([0x55, 0x52, 0x42, 0x32]); // "URB2"
export const MAX_HEADER = 4096 + 28;   // intestazione cifrata (nonce+tag inclusi)
export const MAX_SIG = 4096;

// Layout: MAGIC | u32 lenK | kemCt | u32 lenH | intestazione CIFRATA | u32 lenC | ciphertext | u32 lenS | firma
// L'intestazione (mittente, destinatario, id, contatore, ora) è cifrata: il relay vede solo byte casuali
// e dimensioni uniformi ⇒ non può collegare i messaggi di una coppia (altrimenti la rotazione dei topic non servirebbe).
export const encodeEnvelope = ({ kemCt, sealedHeader, ciphertext, signature }) =>
    concat(MAGIC, u32be(kemCt.length), kemCt, u32be(sealedHeader.length), sealedHeader, u32be(ciphertext.length), ciphertext, u32be(signature.length), signature);

export const signedBytes = (kemCt, sealedHeader, ciphertext) =>
    concat(MAGIC, u32be(kemCt.length), kemCt, u32be(sealedHeader.length), sealedHeader, ciphertext);

export const decodeEnvelope = (buf, { maxCiphertext, kemLen }) => {
    let o = 0;
    const need = (n) => { if (n < 0 || o + n > buf.length) throw new Error('busta malformata'); };
    const u32 = () => { need(4); const v = ((buf[o] << 24) | (buf[o + 1] << 16) | (buf[o + 2] << 8) | buf[o + 3]) >>> 0; o += 4; return v; };
    const take = (n) => { need(n); const s = buf.subarray(o, o + n); o += n; return s; };
    need(4);
    for (let i = 0; i < 4; i++) if (buf[i] !== MAGIC[i]) throw new Error('busta malformata');
    o = 4;
    if (u32() !== kemLen) throw new Error('busta malformata');
    const kemCt = take(kemLen);
    const hl = u32(); if (hl < 29 || hl > MAX_HEADER) throw new Error('busta malformata');
    const sealedHeader = take(hl);
    const cl = u32(); if (cl === 0 || cl > maxCiphertext) throw new Error('busta malformata');
    const ciphertext = take(cl);
    const sl = u32(); if (sl === 0 || sl > MAX_SIG) throw new Error('busta malformata');
    const signature = take(sl);
    if (o !== buf.length) throw new Error('busta malformata');
    return { kemCt, sealedHeader, ciphertext, signature };
};
