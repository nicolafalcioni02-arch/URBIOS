# persist/
**Fa:** salva/ripristina lo stato di `connect/` (ratchet, anti-replay, coda in uscita, documenti, cursori) **solo cifrato** con la DEK (AES-256-GCM; AAD = nome + generazione). Rileva ripristini di backup vecchi (SEC-45/55).
**Non fa:** non gestisce la passphrase né la DEK (arrivano da `storage/`); non decide la UI.
File: `stateBox.js` (blob cifrato con generazione), `persistence.js` (`save`/`load`/`wipe`, anti-rollback), `parts.js` (adattatori dei componenti), `kv.js` (`memoryKv` per i test, `idbKv` per il browser).
Ratchet: `ratchet/restore.js` (`restoreSession`, validazione stretta).

## Anti-rollback
Due posti: blob (`state`) e àncora (`anchor`) con la generazione. `blob < àncora` ⇒ **rollback**; àncora assente ⇒ **fresh**. In entrambi i casi le parti `sessionBound` (ratchet, replay, coda in uscita) si **azzerano** → serve **nuova sessione** (nuovo QR in studio). Documenti e identità non si azzerano. Scrittura: prima blob, poi àncora (crash in mezzo = nessun falso allarme).

## Testato (7)
Riavvio con conversazione che continua e replay ancora respinto; nessun segreto in chiaro; DEK sbagliata/blob manomesso ⇒ errore; scambio di blob tra nomi / generazione ritoccata ⇒ rifiuto; rollback e dispositivo nuovo; crash tra blob e àncora; wipe; stato ratchet corrotto.

## Limiti onesti
- **`idbKv` (IndexedDB) non provato**: i test girano in Node con `memoryKv`; va verificato nel browser.
- Se un attaccante ripristina **sia** il blob **sia** l'àncora, il rollback non si vede. L'àncora è locale al dispositivo, non un contatore hardware.
- Non è ancora collegata a `storage/` (DEK dall'archivio) né a un salvataggio automatico (quando chiamare `save()`: dopo ogni messaggio inviato/ricevuto, con debounce); l'archivio `.json` esportato non contiene questo stato di sessione per scelta (una sessione non va clonata su un altro dispositivo).
- Se l'app si chiude tra l'invio di una busta e il `save()`, il ratchet torna indietro di un passo: il ricevente rifiuta come replay → serve nuova sessione. Per ridurre il rischio: `save()` PRIMA di consegnare la busta al trasporto.
- Azzeramento memoria best effort.
