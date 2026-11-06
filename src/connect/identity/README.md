# identity/
**Fa:** genera e conserva (cifrate con la DEK) le chiavi del dispositivo, id pubblici opachi casuali, validità, rotazione, revoca.
**Non fa:** non cifra messaggi; gli id non derivano da dati anagrafici.
File previsti: `deviceKeys.js`, `opaqueId.js`, `keyStore.js`, `revocation.js`. Req: SEC-20..25.

## Stato
Fatto: `opaqueId.js` (128 bit casuali), `deviceKeys.js` (X-Wing + firma duale indipendenti, record pubblico auto-firmato con validità), `keyStore.js` (segreti solo cifrati con la DEK), `revocation.js` (revoca firmata). Mancano: rotazione, recupero, regole di *chi* può revocare (arrivano con enrollment), pseudonimi per contesto.
