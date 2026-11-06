# ratchet/
**Fa:** sessione con Double Ratchet X25519 + ratchet PQ sparso (ML-KEM), chiave per messaggio, finestra chiavi saltate limitata, ripristino sessione.
**Non fa:** non inventa il protocollo: usa implementazione/spec esistente (vedi decisione D-02 in `docs/sicurezza/decisioni.md`).
Req: SEC-40..46.

## Stato (9 test + 1 integrazione pairing→ratchet→busta)
File: `kdf.js`, `header.js` (canonico, campi epoca solo nel primo messaggio), `chain.js` (epoche, catene, salti con limite), `message.js`, `session.js` (stato atomico: avanza solo se l'operazione riesce; segreti superati azzerati *dopo* il commit).
**Schema:** ogni giro il mittente incapsula (X-Wing) verso l'ultima chiave pubblica del peer e ne pubblica una nuova; dentro il giro catena di chiavi monouso. Seme iniziale dal pairing (segreto QR + transcript). Il ratchet viaggia **dentro** la busta firmata (`envelope/`): firma/replay fuori, FS/PCS dentro.
**Testato:** conversazione bidirezionale su più epoche, riordino, duplicati, messaggi di epoca vecchia dopo cambio epoca, manomissione senza avanzamento di stato, limite chiavi saltate, **forward secrecy** (stato rubato dopo non apre il passato), **PCS** (dopo due giri l'attaccante è fuori), sessione diversa/epoca sconosciuta.
**Limiti noti:**
- È codice nostro di uno schema noto: **serve revisione esterna** (D-13). Non verificato formalmente.
- Il responder (paziente) non può scrivere prima di aver ricevuto.
- Un messaggio che arriva *prima* del primo messaggio della sua epoca viene rifiutato: serve ritrasmissione dall'outbox (`sync/`/`transport/`).
- `exportState()` restituisce i segreti in chiaro: chi lo chiama DEVE cifrarlo con la DEK (`identity/keyStore`) prima di salvarlo; **manca** `importState`, la persistenza, e la regola «stato perso/ripristinato ⇒ nuova sessione» (SEC-45).
- Azzeramento memoria solo best effort (JS).
- Nessuna rotazione adattiva ancora (SEC-44 resync dopo offline lungo: coperto solo dal limite chiavi saltate).
