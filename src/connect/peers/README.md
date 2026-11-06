# peers/
**Fa:** un `peer` per collegamento (paziente lato medico; medico lato paziente): ratchet + anti-replay + coda in uscita + casella + canale, con snapshot/restore. `registry.js` li raccoglie ed è una parte di persistenza `sessionBound` (rollback ⇒ si svuota ⇒ nuovo pairing).
**API peer:** `sendMessage(msg)` (doc.put/withdraw), `sendAck(of)`, `pump()` (invia ciò che è in scadenza + legge la casella), `info()`, `snapshot()`.
**Regole apprese dai test:**
- Le operazioni sul ratchet sono **serializzate** (`ratchet/session.js`): due cifrature/decifrature sovrapposte perdevano un aggiornamento di stato.
- `sendMessage` e `pump` hanno **code separate**: il gestore dei messaggi in arrivo (dentro `pump`) mette in coda gli ack; con una coda sola `pump` aspettava sé stesso (deadlock).
- Dopo `sendMessage` il chiamante deve **salvare prima** di consegnare al trasporto (lo fa `runtime.peers.sendDocument`).
**Test (`test/e2e.test.js`, 3):** pairing → documento → ack → riavvio del medico → secondo documento; SAS rifiutata / unlink / destinatario sconosciuto; rollback con relay che non mostra nulla di leggibile.
**Scollegamento:** `runtime.peers.unlink(pid)` invia `peer.unlink` (firmato, come ogni messaggio), poi chiude. Ritorna `{notified}`: se il relay non risponde il paziente non viene avvisato e resta collegato finché non elimina lui il collegamento. Il paziente, avvisato, perde il collegamento ma **tiene i piani già ricevuti** e può ricollegarsi con un nuovo QR.
**Limiti:** il lato paziente esiste solo come simulazione nei test (stesso `registry` con `role:'patient'`): l'app paziente è in `src/patient/`. La mappatura di dieta/scheda reali sta in `documents/`. Un solo dispositivo medico per paziente (D-07 aperto).
