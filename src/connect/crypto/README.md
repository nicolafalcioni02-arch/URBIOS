# crypto/
**Fa:** wrapper sottili su librerie auditate: `aead.js` (AES-256-GCM, nonce 96 bit mai riusati), `kdf.js` (HKDF-SHA256 + domain separation), `kem.js` (X25519+ML-KEM-768 ibrido), `sign.js` (Ed25519+ML-DSA, entrambe richieste), `padding.js`, `random.js`, `suites.js` (elenco algoritmi ammessi, anti-downgrade).
**Non fa:** non implementa algoritmi; non importa altri moduli; non salva chiavi.
Test: vettori standard obbligatori. Req: SEC-10..19.

## Stato (11 test, `npm run test:connect`)
Fatti: `random`, `bytes` (confronto a tempo costante), `kdf`, `aead` (AES-256-GCM, nonce casuale: vedi limite in file), `kem` (**X-Wing** = X25519+ML-KEM-768, combiner analizzato della libreria), `sign` (Ed25519+ML-DSA-65, entrambe), `padding`, `suites`.
Vettori: RFC 5869, 7748, 8032, NIST AES-GCM; ML-KEM interoperabile con `mlkem` (implementazione indipendente).
**Mancano:** vettori ACVP completi FIPS 203/204 (da scaricare dal NIST), Argon2id, rotazione/contatore chiavi AEAD a lunga durata, fuzz.
Rischio noto: `@noble/post-quantum` è 0.x e la sua `hybrid.js` si dichiara in evoluzione ⇒ versione fissata esatta; rivalutare a ogni aggiornamento.
`canonical.js`: serializzazione canonica per firme/hash.
