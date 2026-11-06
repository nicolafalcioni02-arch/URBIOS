# envelope/
**Fa:** formato busta versionato (serializzazione canonica), firma sul transcript, pipeline di ricezione in 16 passi (un passo = un file in `steps/`), anti-replay, freschezza, contatore.
**Non fa:** non decide cosa significhi il payload.
Req: SEC-50..55.

## Stato (8 test negativi/positivi)
File: `format.js` (binario stretto "URB1"), `header.js` (campi fissi, forma canonica obbligatoria), `seal.js`, `open.js` (pipeline), `steps/freshness.js`, `steps/replay.js` (finestra contatore 64 + id messaggio).
Garanzie testate: round trip, replay, riordino, fuori finestra, manomissione ovunque, troncamento/coda, mittente ignoto/revocato/impostore, destinatario sbagliato, freschezza, padding uniforme, schema/persist falliti senza effetti.
**Scostamenti dalla spec (voluti):** controlli economici prima della decifratura, stato modificato solo al commit.
**Limiti noti:**
- Nessuna forward secrecy finché non c'è `ratchet/` (chiave KEM del destinatario statica).
- Compressione non implementata (solo limiti di dimensione): SEC-18 aperto.
- Crash tra `persist` e `replay.commit` ⇒ possibile doppia applicazione: chi riceve deve essere idempotente (id messaggio).
- Dopo restore di un backup lo stato anti-replay torna indietro: serve nuova sessione (SEC-45), da imporre in `ratchet/`/`storage/`.
- `replay` è in memoria (`snapshot/restore` pronti): la persistenza cifrata va collegata.

## Aggiornamento: intestazione cifrata (formato URB2)
La busta ora è `MAGIC | kemCt | intestazione CIFRATA | ciphertext | firma`. L'intestazione (mittente, destinatario, id messaggio, sessione, ora, contatore) è sotto AEAD con chiave dal KEM: il relay non può collegare i messaggi di una coppia. Pipeline: decapsula (economico) → apre intestazione (se fallisce: `recipient`) → mittente/revoca → firma → freschezza → replay → corpo. Test di non collegabilità.
