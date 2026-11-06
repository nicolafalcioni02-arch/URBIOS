# transport/
**Fa:** WebRTC DataChannel preferito, MQTT/WSS come relay, scelta canale, retry/backoff, dedup per id messaggio, topic HMAC con rotazione oraria.
**Non fa:** trasporta solo byte già cifrati; broker/STUN/TURN non sono fidati e non autorizzano nulla.
Req: SEC-80..86.

## Stato (6 test + e2e di rete in `channel/test`)
File: `topics.js` (HMAC-SHA256 da seme via HKDF, direzioni d2p/p2d, rotazione oraria, si ascolta epoca −1/0/+1), `relayClient.js` (fetch, https, timeout, tetti, validazione di ogni campo), `memoryRelay.js` (relay di riferimento per i test), `mailbox.js` (invio, poll, cursori, dedup). Relay reale: `extra/relay/worker.js` (Cloudflare Worker + KV, piano gratuito).
**Decisione:** solo cassetta postale HTTP. WebRTC/TURN/MQTT **non implementati**: con il paziente che riceve soltanto (D-06) non servono; SEC-80 resta parziale (nessun failover P2P).
**Bug trovati dai test e corretti:**
- ordine degli id nello stesso millisecondo ⇒ messaggi saltati: il cursore riparte dal ms precedente e i duplicati si scartano.
- **metadati in chiaro:** l'intestazione della busta (id mittente/destinatario) era leggibile dal relay e collegava tutti i messaggi di una coppia, vanificando la rotazione dei topic. Ora l'intestazione è **cifrata** (formato `URB2`, costo: una decapsulazione prima di verificare la firma). Test di non collegabilità.
**Limiti noti (residui onesti):**
- Chi conosce un topic può riempirlo di spazzatura (opacità ≠ autorizzazione): il relay limita dimensione/quota, la busta firmata scarta tutto il resto, ma il DoS sulla casella resta possibile.
- Il relay vede: IP dei client (non protetti), orari, dimensioni (padded), quale topic. Nessuna protezione dall'analisi del traffico oltre al padding.
- `extra/relay/worker.js` non è stato provato su Cloudflare; KV è eventualmente consistente e ha limiti giornalieri gratuiti da verificare (SEC-130 aperto finché non c'è un deploy reale).
- Cancellazione solo per TTL (72 h), nessun endpoint di cancellazione.
- Nessuna persistenza dei cursori, nessun failover tra relay diversi.
