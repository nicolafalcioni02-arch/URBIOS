# sync/
**Fa:** repliche CRDT locali, log eventi, stato di sync, validazione clinica **separata** dal CRDT (conflitti su dosaggi/diagnosi/allergie = tutte le versioni conservate + risoluzione del professionista).
**Non fa:** non vede chiavi né sessioni.
File previsti: `events/`, `crdt/`, `clinicalRules/`, `conflicts.js`, `outbox.js`. Req: SEC-70..76.

## Stato (v1: consegna documenti medico→paziente, D-06)
File: `message.js` (doc.put / doc.withdraw / ack; validazione stretta, solo interi: i decimali vanno come stringhe), `identifiers.js` (rete contro nomi in titoli/note, SEC-132), `docStore.js` (revisioni, idempotenza, conflitto conservato, mittenti autorizzati, snapshot/restore), `outbox.js` (coda at-least-once, backoff, priorità, ack applicativo).
**Non è un CRDT:** una sola autorità scrive (il medico). Yjs/CRDT arrivano con il multidispositivo del medico (D-07) — installato ma non usato.
**Mancano:** schemi reali di dieta/scheda legati ai dati URBIOS (ora `body` generico con limiti di profondità/dimensione), regole di conflitto cliniche del multidispositivo, persistenza cifrata di store/outbox, risoluzione conflitti da interfaccia.
