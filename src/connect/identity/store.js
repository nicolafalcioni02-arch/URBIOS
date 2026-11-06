// Identità del dispositivo salvata in un kv: record pubblico in chiaro, chiavi segrete SOLO cifrate con la DEK.
// DEK sbagliata ⇒ errore (mai una nuova identità al posto di quella vera).
import { generateDeviceIdentity } from './deviceKeys.js';
import { sealIdentitySecret, openIdentitySecret } from './keyStore.js';
import { b64u, utf8 } from '../crypto/bytes.js';

export const loadIdentity = async (kv, dek) => {
    const raw = await kv.get('identity');
    if (raw) {
        const j = JSON.parse(new TextDecoder().decode(raw));
        return { record: j.record, secret: await openIdentitySecret(b64u.dec(j.sealed), dek) }; // DEK sbagliata ⇒ errore
    }
    const id = generateDeviceIdentity();
    await kv.put('identity', utf8(JSON.stringify({ record: id.record, sealed: b64u.enc(await sealIdentitySecret(id.secret, dek)) })));
    return id;
};
