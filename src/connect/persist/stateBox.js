// Scatola cifrata per lo stato (SEC-03/20): AES-256-GCM con la DEK; AAD = nome + generazione.
// Il nome nell'AAD impedisce di scambiare due blob; la generazione sta DENTRO e nell'AAD (non si può ritoccare).
import { seal, open } from '../crypto/aead.js';
import { utf8, u32be, concat } from '../crypto/bytes.js';

const aad = (name, gen) => concat(utf8(`urbios/v1/state/${name}\0`), u32be(gen));

export const sealState = async (dek, name, gen, obj) => {
    if (!Number.isSafeInteger(gen) || gen < 0 || gen > 0xffffffff) throw new Error('generazione non valida');
    const body = await seal(dek, utf8(JSON.stringify(obj)), aad(name, gen));
    return concat(u32be(gen), body);
};

export const openState = async (dek, name, blob) => {
    if (blob.length < 4 + 28) throw new Error('stato illeggibile');
    const gen = ((blob[0] << 24) | (blob[1] << 16) | (blob[2] << 8) | blob[3]) >>> 0;
    const plain = await open(dek, blob.subarray(4), aad(name, gen));
    try { return { gen, obj: JSON.parse(new TextDecoder().decode(plain)) }; } catch { throw new Error('stato illeggibile'); }
};
