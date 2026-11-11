# Stato dei compiti UX

Ogni agente aggiunge il proprio blocco in fondo, a lavoro finito. Non modificare i blocchi degli altri.

| Compito | Stato |
|---|---|
| UX-00 Base: l'app funziona senza rete | fatto (runtime da provare, vedi blocco) |
| UX-01 Live: tempi veri, schermo acceso, RPE dopo la serie | fatto (wake lock/audio da provare, vedi blocco) |
| UX-02 Live: schermata leggibile | fatto |
| UX-03 Continuità: ripresa per 2 giorni, rientro dopo il blocco, riassunto | fatto (rientro dopo blocco da provare, vedi blocco) |
| UX-04 Dieta: il giorno di oggi | fatto |
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

## UX-02 — fatto il 11/11/2026
- File toccati: `src/patient/ui/Live.jsx`, `src/patient/patient.css` (solo in fondo), `src/patient/README.md`, questo file. (`MIGLIORIE.md`: nessuna voce da togliere.)
- Cosa vede di diverso il paziente: in riposo il numero centrale è solo `00:34` viola su una riga; in cima a «Oggi» una riga con l'ultima seduta (`05/11 · 1 × 50 kg · RPE 4 …`); «Suggerito» compare solo se diverso dal carico mostrato; senza carico prescritto e a 0 si legge «Corpo libero»; in pausa «Esci» (contorno, non rosso) al posto di «Abbandona sessione».
- Verificato in browser (375×812): 1 (riposo su una riga, sotto l'onda, tre numeri allineati; lavoro invariato), 2 (riga senza etichetta; Suggerito sparisce con «Usa» e riappare con −), 3 (`?vuoto`: nessuna riga né errori), 4 (vedi scelte), 5 (Riprendi lime, Esci bianco su scuro; uscendo la serie resta nel diario), 6 (`?lungo`: nome tagliato da Clamp; la riga ha `overflow-wrap: anywhere`, ma nel demo lungo l'esercizio non ha storico, quindi la riga non è stata vista lì), 7, 8. Console: solo l'avviso del browser su `vibrate` (clic da script).
- Scritte prima → dopo: lavoro invariato salvo «Suggerito/Usa» (3 parole) ora nascoste quando uguale al carico; riposo −1 parola («RIPOSO»); pausa «Abbandona sessione» → «Esci» (−1). La riga dell'ultima volta aggiunge solo data e numeri, nessuna parola.
- Da provare su iPhone: nulla di specifico (solo aspetto).
- Scelte fatte: nel demo «Piegamenti» ha uno storico finto (42,5 kg), quindi parte da lì e non da «Corpo libero»: ho provato il caso svuotando lo storico da console (compare «Corpo libero», + dà «2,5 kg»). Il nome `.pt-last` era già usato (pillola lilla): la nuova classe è `.pt-lastrow`. Gruppi separati da « · », oltre i due gruppi «…».
- Attenzione per chi viene dopo: `lastT`/`lastG` in `Live.jsx` (ultima seduta ≠ oggi); classe `.pt-lastrow`; regole in fondo a `patient.css` sotto `/* UX-02 */`.

## UX-03 — fatto il 11/11/2026
- File toccati: `ui/logic.js`, `ui/TrainDetail.jsx`, `ui/Live.jsx`, `ui/Home.jsx`, `ui/Shell.jsx`, `App.jsx`, `patient.css` (solo in fondo), `README.md`, `MIGLIORIE.md`, questo file.
- Cosa vede di diverso il paziente: un allenamento lasciato a metà ieri o l'altro ieri si riprende davvero (stessa seduta, stesse serie); la Home dice «Iniziato ieri · scade domani» / «Iniziato l'altro ieri · scade oggi» e «Riprendi» apre subito Live; dopo il blocco si rientra in Live; a fine allenamento c'è «Invia il riassunto» (testo, secondario).
- Verificato in browser (375×812, `?prova`): «Fatto quando» 1-10 (riga di scadenza e Home senza scorrimento; Riprendi → Live alla terza serie da 05:00; chiave di ieri con 3 serie, nessuna chiave di oggi, storico di oggi con 1 serie; dettaglio «3/14» e «RIPRENDI ALLENAMENTO»; fine con kg > 0 e 14 serie, poi prossimo «Upper body»; `mk(2)`; `mk(3)` torna «Inizia»; flusso normale con riga «4 esercizi, circa 18 min»; uscita da Live → Home; riassunto «Creo il PDF…» → «PDF salvato nei file», nessun errore, 812 px senza scorrimento, `?lungo` senza overflow; `test:connect` 102/102). Il punto 11 (screenshot): Home, finale e `?lungo` fatti; screenshot del dettaglio non salvato, solo testo («3/14»).
- Da provare su iPhone: rientro in Live dopo blocco e passphrase (in prova non c'è passphrase: verificato solo per lettura che `Shell` funzioni senza `initial`/`onWhere`); foglio di condivisione dalla schermata finale; allenamento a cavallo della mezzanotte.
- Scelte fatte: nessuna deviazione dal brief. Limiti accettati: una seduta ripresa e finita risulta «fatta» alla data d'inizio; «Costanza» conta il giorno d'inizio.
- Attenzione per chi viene dopo: `sessionDate` in `logic.js`; `sDate` in `Live.jsx`; `workoutSummary` 6° argomento = data della seduta; `Shell` prende `initial`/`onWhere`, `App.jsx` ha `resume` (useRef); classe `.pt-win-sum`.

## UX-04 — fatto il 11/11/2026
- File toccati: `ui/logic.js`, `runtime.js` (solo `normLog`), `ui/Nutrition.jsx`, `ui/Progress.jsx` (solo `Rings`), `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`
- Cosa vede di diverso il paziente: la tab Dieta apre il giorno di oggi (scelto da lui, dedotto dai pasti o dal titolo) e lo ricorda per quella data; Home «Pasti» e «Cosa mangiamo?» usano lo stesso giorno. Il totale kcal «Oggi» non cambia toccando un altro giorno. Nessuna scritta nuova.
- Verificato in browser: punti 1-8 e 10 del «Fatto quando» (scelta salvata e ricordata dopo Home, Colazione di riposo con Fiocchi d'avena, 312 resta 312 cambiando giorno, regola 2, i quattro casi di `dietDayToday`, `?solo=scheda`, `?vuoto`, storico); `npm run test:connect` 102/102. Console senza errori.
- Da provare su iPhone: nulla di specifico; con una dieta reale a 7 giorni controllare il giorno dedotto.
- Scelte fatte: nel punto 3 del brief «Home → Pasti» apre la tab Dieta (non la sheet): la Colazione l'ho aperta dalla tab, sul giorno di riposo. Nessun test automatico nuovo.
- Attenzione per chi viene dopo: `dietDayToday(log, docId, days, date)` in `logic.js`; campo diario `log.tools.dietDay` (`null` o `{date, docId, d}`), preservato da `normLog`.
