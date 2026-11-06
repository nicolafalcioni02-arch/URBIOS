# config/
**Fa:** carica e valida (schema stretto, fallisce all'avvio) endpoint, TTL, limiti, dimensioni padding, ambiente dev/test/prod.
**Non fa:** non contiene segreti nel bundle; nessun default "comodo" in produzione.
File previsti: `schema.js`, `load.js`, `limits.js`. Req: SEC-60..62.

## Stato
Fatto: `schema.js` (campi chiusi, rifiuta nomi che sembrano segreti, https/wss in prod), `load.js` (default prudenti, `mode` parte `offline`, online richiede endpoint). Test: `test/`. Manca: caricamento per ambiente dal build e UI Impostazioni (SEC-120).
