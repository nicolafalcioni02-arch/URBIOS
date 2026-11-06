// Firma duale Ed25519 + ML-DSA-65 (SEC-15): VALIDA solo se entrambe le firme verificano.
// Formato firma: ed25519(64) || ml-dsa-65(3309). Prefisso di dominio contro riuso tra contesti.
import { ed25519 } from '@noble/curves/ed25519.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { concat, utf8 } from './bytes.js';

const ED_SIG = 64;
const frame = (context, msg) => concat(utf8(`urbios/v1/sig/${context}\0`), msg);

export const generateKeys = () => {
    const ed = ed25519.keygen();
    const pq = ml_dsa65.keygen();
    return {
        publicKey: { ed: ed.publicKey, pq: pq.publicKey },
        secretKey: { ed: ed.secretKey, pq: pq.secretKey },
    };
};

export const sign = (context, msg, secretKey) => {
    const m = frame(context, msg);
    return concat(ed25519.sign(m, secretKey.ed), ml_dsa65.sign(m, secretKey.pq));
};

export const verify = (context, msg, signature, publicKey) => {
    if (signature.length !== ED_SIG + ml_dsa65.lengths.signature) return false;
    const m = frame(context, msg);
    let okEd = false, okPq = false;
    try { okEd = ed25519.verify(signature.subarray(0, ED_SIG), m, publicKey.ed, { zip215: false }); } catch { /* falso */ }
    try { okPq = ml_dsa65.verify(signature.subarray(ED_SIG), m, publicKey.pq); } catch { /* falso */ }
    return okEd && okPq; // valutate entrambe sempre, poi AND
};
