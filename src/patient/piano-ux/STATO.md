# Stato dei compiti UX

Ogni agente aggiunge il proprio blocco in fondo, a lavoro finito. Non modificare i blocchi degli altri.

| Compito | Stato |
|---|---|
| UX-00 Base: l'app funziona senza rete | fatto (runtime da provare, vedi blocco) |
| UX-01 Live: tempi veri, schermo acceso, RPE dopo la serie | fatto (wake lock/audio da provare, vedi blocco) |
| UX-02 Live: schermata leggibile | da fare |
| UX-03 Continuità: ripresa per 2 giorni, rientro dopo il blocco, riassunto | da fare |
| UX-04 Dieta: il giorno di oggi | da fare |
| UX-05 Coerenza grafica e Profilo | da fare |

A lavoro finito cambia la tua riga in «fatto» e aggiungi sotto un blocco così:

```
## UX-0N — fatto il GG/MM/AAAA
- File toccati: …
- Cosa vede di diverso il paziente: … (2-4 righe)
- Verificato in browser: … (elenco dei «Fatto quando» controllati)
- Da provare su iPhone: … (ciò che il browser non può dimostrare)
- Scelte fatte: … (dubbi risolti da solo e perché)
- Attenzione per chi viene dopo: … (nomi nuovi di funzioni, classi, campi del diario)
```

## UX-00 — fatto il 11/11/2026
- File toccati: `vite.patient.config.js`, `src/patient/main.jsx`, `src/patient/sw.js` (nuovo), `src/patient/ui/Home.jsx`, `src/patient/README.md`, `docs/sicurezza/{audit,requisiti,decisioni}.md`, questo file.
- Cosa vede di diverso il paziente: l'app, una volta caricata, si apre anche senza rete (shell in cache). Senza rete non compare più l'avviso giallo «Non riesco a collegarmi…».
- Verificato: la build in cartella temporanea scrive `sw.js` con versione ed elenco compilati (patient.html, demo.html, manifest, icone, tutti gli `assets/` incluso il prontuario; senza sw.js); sintassi valida; nessun segnaposto rimasto; `npm run test:connect` 102/102; `git status` solo file in lista. Corretto un bug mio: il segnaposto veniva sostituito prima nel commento.
- NON verificato (il browser integrato rifiuta ogni registrazione di service worker, anche senza CSP; Chrome non era collegato): «Fatto quando» 2, 3, 4, 5, 6, 7. Il resto del giro offline va provato a mano.
- Da provare su iPhone: app installata dalla Home in modalità aereo (si apre, sblocca, mostra i piani); primo avvio richiede rete una volta; iPhone può cancellare cache di siti non installati dopo settimane; dopo una nuova pubblicazione la versione nuova arriva alla riapertura successiva.
- Scelte fatte: la cache include anche `demo.html`/`manifest-demo` perché la build li produce; l'elenco è nel formato `./percorso`.
- Attenzione per chi viene dopo: `sw.js` ha due segnaposto (`'__VERSION__'`, `'__FILES__'`) sostituiti dal plugin `patient-sw`; non scrivere quelle stringhe altrove nel file. In sviluppo il service worker non esiste.

## UX-01 — fatto il 11/11/2026
- File toccati: `src/patient/ui/Live.jsx`, `src/patient/demo.js`, `src/patient/README.md`, questo file. (`MIGLIORIE.md`: nessuna voce da togliere; `patient.css` non toccato.)
- Cosa vede di diverso il paziente: il timer non perde secondi se il telefono si blocca; lo schermo resta acceso durante l'allenamento; l'RPE si può dare (o cambiare) durante il riposo e vale per la serie appena fatta; lo schermo intero di fine riposo compare solo negli ultimi 10 s.
- Verificato in browser (375×812, `?prova`): «Fatto quando» 1-9 e 11 (riposo da 35 che scende, +20 s e +60 s simulati con `Date.now`, pausa che non conta, RPE 8 scritto su sessione e storico e tolto al secondo tocco, RPE 9 sull'esercizio 1 dopo il cambio, selettore vuoto a fine riposo, overlay solo sotto i 10 s, storico con date). Punto 10: con `wakeLock` presente e dopo `delete Navigator.prototype.wakeLock` nessun errore (restano solo avvisi del browser su `vibrate` causati dai click da script).
- Da provare su iPhone: schermo davvero acceso (anche da app installata); riposo corretto dopo blocco e sblocco; bip a fine riposo con e senza tasto silenzioso.
- Scelte fatte: `rpe` non azzerato in `complete()` ma a fine riposo (stesso effetto visibile); `test:connect` non lanciato (logic.js e runtime.js non toccati).
- Attenzione per chi viene dopo: in `Live.jsx` i tempi stanno nel ref `T` (`run`, `runAt`, `setAt`, `restEnd`, `lastBeep`, `pausedAt`); nuovi `lastRpe`, `lastSet`, `pickRpe`. In `demo.js` costante `SQ` col nome dell'esercizio.
