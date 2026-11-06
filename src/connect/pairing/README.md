# pairing/
**Fa:** QR monouso a scadenza breve (solo materiale di bootstrap), SAS dal transcript completo, conferma esplicita di entrambi, limite tentativi.
**Non fa:** nessun dato clinico o personale nel QR.
File previsti: `qrPayload.js`, `transcript.js`, `sas.js`, `pairingSession.js`. Req: SEC-30..34.

## Stato (8 test)
File: `qrPayload.js`, `transcript.js` (hash record, transcript, SAS, HMAC), `doctorSession.js`, `patientSession.js`.
**Protocollo:** medico mostra QR (~200 byte: id, scadenza, hash del suo record, id paziente opaco, segreto monouso). Il record completo (~10 KB, chiavi PQ) viaggia dal trasporto e si accetta solo se l'hash coincide col QR. Il paziente risponde col proprio record + prova HMAC (dimostra di aver scansionato). Entrambi mostrano la **SAS a 12 cifre**; ognuno conferma, si scambiano token di conferma autenticati; `finish()` solo con doppia conferma. Poi la sessione è bruciata.
**Perché 12 cifre senza commit-reveal:** il lato medico è fissato dal QR ⇒ l'attaccante deve ottenere una SAS *uguale a una data* (~2^40 generazioni di chiavi PQ entro la scadenza), non una collisione.
**Testato:** flusso completo, doppia conferma obbligatoria, SAS diversa (MITM) ⇒ sessione distrutta, limite tentativi, scadenza, monouso, record sostituito, QR alterato/non canonico, nessun nome nel QR.
**Limiti:** il trasporto di record/risposta/token non esiste ancora (`transport/`); lo stato è in memoria; il record del paziente non ha ancora il canale di cifratura del ritorno. Chi vede il QR (foto) E intercetta il canale deve comunque indovinare la SAS: il paziente deve davvero confrontarla.

## Aggiornamento: pairing su relay (`flow.js`, 4 test)
`startDoctorPairing` / `startPatientPairing`: record, risposta e conferme viaggiano su **caselle derivate dal segreto del QR** (`transport/topics.pairingTopic`, non ruotano, durata = scadenza del pairing). Macchine a stati interrogabili con `poll()`; tutto ciò che arriva è dato non fidato (validato da `doctorSession/patientSession`). Scaduto o SAS rifiutata ⇒ `failed`, nessun risultato. Il seme di sessione esce solo dopo la doppia conferma.
