# audit/
**Fa:** log append-only a catena di hash (firmata), senza dati clinici né segreti; verifica integrità; continuità dopo ripristino.
**Non fa:** non logga contenuti. API unica: `record(evento)` con elenco chiuso di tipi.
Req: SEC-90..92.

## Stato
Fatto: `events.js` (tipi chiusi), `chain.js` (catena di hash, `details` solo scalari, nomi sospetti vietati, `verifyChain`). Persistenza iniettata (`store`). **Limite:** il troncamento in coda non si vede senza ancorare `head` (firma/checkpoint) — da fare. Manca: firma delle voci, continuità dopo restore, retention (SEC-92).
