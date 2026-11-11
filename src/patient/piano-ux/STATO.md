# Stato dei compiti UX

Ogni agente aggiunge il proprio blocco in fondo, a lavoro finito. Non modificare i blocchi degli altri.

| Compito | Stato |
|---|---|
| UX-00 Base: l'app funziona senza rete | fatto (runtime da provare, vedi blocco) |
| UX-01 Live: tempi veri, schermo acceso, RPE dopo la serie | fatto (wake lock/audio da provare, vedi blocco) |
| UX-02 Live: schermata leggibile | fatto |
| UX-03 Continuità: ripresa per 2 giorni, rientro dopo il blocco, riassunto | fatto (rientro dopo blocco da provare, vedi blocco) |
| UX-04 Dieta: il giorno di oggi | fatto |
| UX-05 Coerenza grafica e Profilo | fatto |
| UX-06 Restyling: colore, movimento, identità, meno testo (9 tappe, un blocco `UX-06.N` per tappa; brief `UX-06-restyling.md`) | in corso: tappe 1-7 fatte |

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

## UX-05 — fatto il 11/11/2026
- File toccati: `ui/TrainDetail.jsx`, `ui/Schede.jsx`, `ui/Nutrition.jsx`, `ui/Settings.jsx`, `ui/bits.jsx` (icona `scale`), `patient.css` (in fondo), `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`
- Cosa vede di diverso il paziente: esercizi tutti con lo stesso numero lilla e pallini lime; niente grigio-azzurro nei riquadri della Dieta e di Schede; un solo lime nel Profilo e nel registro pasto; Profilo con titolo senza freccia, pulsante «Invia il riassunto» su una riga ed esito che resta sotto; blocco URBIOS bianco; icona Peso a bilancia tonda.
- Verificato in browser (375×812, `?prova`, `?lungo`): punti 1, 2, 3, 4, 5, 6, 7 (riga «PDF salvato nei file» ancora presente dopo 5 s; 98 px tra blocco URBIOS e menu in fondo), 8; Live senza `.pt-main`, quindi non toccato. Console senza errori propri (solo `vibrate` bloccato dai clic sintetici). Non eseguito `test:connect`: nessun cambio a `logic.js`/`runtime.js`.
- Da provare su iPhone: foglio di condivisione con esito «Riassunto inviato».
- Scelte fatte: `.pg-lt .pg-card` resta bianco (regola esistente `.pt-sp .pg-lt > *`, scelta di disposizione); `.hm2-day span` era già `#0B0C0E`, non l'ho schiarito; cerchietto `.pt-sc-i` reso bianco sul fondo lilla.
- Attenzione per chi viene dopo: nessun nome nuovo; blocco `/* UX-05 */` in fondo a `patient.css`.

## UX-06.1 — fatto il 11/11/2026
- File toccati: `ui/bits.jsx`, `ui/Tempo.jsx` (nuovo), `ui/Tools.jsx`, `ui/MealSheet.jsx`, `ui/Clamp.jsx`, `ui/Nutrition.jsx`, `ui/Schede.jsx`, `ui/Live.jsx`, `patient.css` (in fondo, `/* UX-06.1 */`), `README.md`, questo file.
- Cosa vede di diverso il paziente: fogli con maniglia e chiusura trascinando giù; testi leggibili in «Sostituisci», «Fuori piano» (chip viola quando scelti) e alimento scelto; pulsanti disattivati grigi, non sbiaditi; «+/−» ripetono se tenuti premuti e il numero si può scrivere; dock nascosto sotto i fogli a lista; niente «Annulla»/«Chiudi» in fondo ai fogli; nessuna sillabazione; leggera pressione sui pulsanti.
- Verificato in browser (375×812, `?prova` e `?prova&lungo`): «pane» leggibile; chip Fuori piano; disattivato in accesso; hold/digita «abc»/«130,5»; maniglia e trascinamento (40 px torna, 120 px chiude); nessun «Annulla»; `test:connect` 102/102. Console senza errori.
- Da provare su iPhone: trascinamento col dito (pointer capture), ripetizione col tocco prolungato, dock che scivola (nel pane la transizione non avanzava: il valore finale `translate: 0 140%` è corretto), 360×640 e «riduci animazioni» non provati.
- Scelte fatte: `Step` mostra la virgola decimale di default. Altri testi chiari su chiaro trovati: solo «Cambia» in `.pt-food-sel` (corretto); i giorni futuri del calendario dello Storico sono disattivati di proposito. `Step` in Live usa icone 16 px (prima 22): da guardare nella tappa 6. `Lst` e `Sheet` sono componenti nuovi che sostituiscono il markup duplicato. Le regole `.pt-food-h` ecc. chiare sono aggiunte, non sostituite.
- Attenzione per chi viene dopo: `TempoBar` (classi `pt-tb*`, `is-paused` ferma il cursore) non è ancora usata; `Count` ora in `bits.jsx` (500 ms); `Step` accetta `text` per sostituire numero+unità.

## UX-06.2 — fatto il 11/11/2026
- File toccati: `ui/Shell.jsx` (componente `Dock`), `ui/Nutrition.jsx`, `ui/Schede.jsx`, `ui/TrainDetail.jsx`, `patient.css` (in fondo, `/* UX-06.2 */`), questo file. `Progress.jsx` non toccato (nessun colore inline).
- Cosa vede di diverso il paziente: dock con capsula che scorre e cambia colore (notte, corallo, viola, notte); selezioni viola con testo bianco (segmenti, tessere, settimane, giorni, RPE, esercizio corrente); card kcal corallo; card scheda viola con anello lime; card del giorno notte con anello lime; macro lime/viola/corallo; barre kcal corallo (sopra obiettivo: nero); torta e barre muscoli senza verdi oliva; «+7,3%» con la virgola; onda sotto Dieta e Schede.
- Verificato in browser (375×812 e 360×640, `?prova`, `?prova&lungo`): colori computati della capsula nelle 4 tab (notte, corallo, viola, notte), macro, barre kcal, onda senza coprire contenuto, zero errori in console, grep dei verdi fuori sistema in `ui/*.jsx`: zero.
- Da provare su iPhone: scorrimento della capsula (nel pane le transizioni non avanzavano, ho letto solo i valori finali), `?vuoto` non provato, «riduci animazioni» non provato.
- Scelte fatte: onda ottenuta aggiungendo `pt-td-bot` a `.pt-sp-bot` (riusa le regole del dettaglio scheda); padding basso dell'intestazione di Dieta/Schede portato a 34 px perché l'onda non toccasse la seconda card. Nel CSS vecchio restano i verdi nelle regole sovrascritte (non cancellate).
- Attenzione per chi viene dopo: `Ring` di `Schede.jsx` ha la prop `fg`; `Dock` in `Shell.jsx` usa `<i className="pt-dock-t">` con `translate` inline; il logo nelle intestazioni di Dieta/Schede/dettaglio resta (lo tolgono le tappe 4 e 5).

## UX-06.3 — fatto il 11/11/2026
- File toccati: `ui/Home.jsx`, `patient.css` (in fondo, `/* UX-06.3 */`), questo file. `Progress.jsx` non toccato (`Rings` non è più usato dalla Home).
- Cosa vede di diverso il paziente: niente anelli; un grande segno del logo viola, tagliato a destra, ruota lentissimo e al tocco scatta di 45°. In alto «MER 11». Titolo dell'allenamento 40 px con icona in un tondo (viola da fare, lime fatto, corallo per il pasto), due pillole (esercizi, minuti), «Inizia» lime a tutta riga con icona play. Sotto gli strumenti il dato (0/4, 72,4, 13 gg, 17, 2) al posto della parola; senza dato resta la parola.
- Verificato in browser (375×812 e 360×640): `?prova`, `?prova&lungo` (titolo su 2 righe con «Leggi tutto», tutto sopra il dock), `?prova&vuoto` (parole, nessun undefined/NaN/0/0), `?prova&solo=dieta` (forchetta corallo, «Registra» con freccia a destra, nessuna tessera Pasti); nomi accessibili tipo «Peso 72,4»; scatto al tocco (rotate 90° dopo due tocchi); zero errori in console.
- Da provare su iPhone: rotazione e scatto con «riduci animazioni» attivo (fermo), caso «Riprendi» con riga «Iniziato ieri · scade domani» (non preparato da `__demoLog`: il ramo è codice invariato, solo spostato), ingresso sfalsato.
- Scelte fatte: a 360×640 il titolo cade sopra l'anello viola (il segno è alto 440 px, il blocco è ancorato in basso): per leggibilità ho dato al titolo un alone lilla. Il padding basso della Home è 134 px per avere ≥16 px tra strumenti e dock. Tolti dall'uso `bd`, `t`, `s` delle tessere (non più nel codice).
- Attenzione per chi viene dopo: classi nuove `hm2-mark`, `hm2-mark-k`, `hm2-date`, `hm2-t`, `hm2-ic`, `hm2-pills`, `hm2-pill`; le vecchie `.hm2-ring/.hm2-k/.hm2-leg` restano nel CSS ma non nel JSX (non cancellate).

## UX-06.4 — fatto il 11/11/2026
- File toccati: `ui/Nutrition.jsx`, `ui/MealSheet.jsx`, `ui/Progress.jsx` (solo `MealsWeek`, `KcalWeek`), `ui/bits.jsx` (prop `hot` di `Step`), `patient.css` (in fondo, `/* UX-06.4 */`), questo file.
- Cosa vede di diverso il paziente: Dieta senza marchio, con una sola card corallo (anello + kcal che contano; calendario e «+» a destra); giorni senza «Giorno »; card pasto con soli nomi degli alimenti su una riga e kcal senza pillola, attenuata se registrata. Storico con anelli per i giorni a metà e senza legenda; foglio «Macro» con tessere-legenda. Registro pasto: totale kcal vivo nel titolo, una riga per alimento (icona scambio o X, nome, stepper), nome/grammi del piano barrati se cambiati, riga «+» tratteggiata, «Salva»; la ricerca sceglie con un tocco.
- Verificato in browser (375×812; 360×640 per `?lungo` e `?vuoto`): 4 pasti visibili senza scorrere; Colazione→Salva (2 tocchi) con card attenuata e kcal che salgono; Mirtilli 80→85 (80 barrato in corallo, totale cambia); sostituzione Noci→Mandorle con un tocco; aggiungi Pane e toglilo con la X; storico: 2 su 4 = anello 0,25–0,75, completo pieno, nessuna legenda; Macro con tre tessere-legenda; `?vuoto` senza grafico settimanale; 24 px d'aria sopra il dock; zero errori in console.
- Da provare su iPhone: trascinamento/chiusura dei fogli col dito; gli screenshot del pane erano fermi, quindi l'aspetto l'ho verificato da DOM e misure, non a occhio; «riduci animazioni»; Count delle kcal.
- Scelte fatte: l'azione «Sostituisci» ha aria-label dell'icona; il prezzo del passo da 5 g resta `set` con limite 0–2000; le righe `.pt-gr` in fondo alla Dieta sono state tolte dal JSX (CSS non cancellato).
- Attenzione per chi viene dopo: `FoodForm` ha la prop `instant`; `Cal` riceve `docId` e `total`; classi nuove `pt-nh*`, `pt-food-x`, `pt-food-n`, `pt-add`, `pt-food-q`, `pt-sh-k`; `Step` ha la prop `hot`.

## UX-06.5 — fatto il 11/11/2026
- File toccati: `ui/Schede.jsx`, `ui/TrainDetail.jsx`, `ui/Progress.jsx` (solo `Streak`), `patient.css` (in fondo, `/* UX-06.5 */`), questo file.
- Cosa vede di diverso il paziente: Schede senza marchio; intestazione su una riga con la card viola col nome vero della scheda e, solo se ci sono schede vecchie, il tondo archivio; periodo «7 giorni» come chip; didascalia solo per Muscoli; «Costanza» col numero grande, lettere dei giorni e celle future tratteggiate. Dettaglio senza logo; card del giorno con sole pillole (esercizi, minuti, data se fatto) e titolo solo se c'è un giorno; pillole esercizio «4 × 10», «35″»; tempo come barra (3:1:2:1); pulsante «Inizia»/«Riprendi»/«Rifai» con play.
- Verificato in browser (375×812, `?prova`, `?prova&solo=scheda&lungo`): nome scheda, tondo archivio, assenza marchio, chip periodo 36 px, didascalia solo in Muscoli, 7 lettere e 4 celle future, «Lower body» una volta nel dettaglio, barra tempo con segmenti 122/41/81/41 px e numeri 3,1,2,1, nome scheda lungo con puntini, nessun trattino, nessuno scorrimento laterale, zero errori in console.
- Da provare: il caso senza schede vecchie (il tondo è condizionato a `archive.length > 0`, non l'ho forzato), tempo non riconosciuto (resta il testo, ramo semplice, non provato), 360×640, aspetto a occhio (screenshot del pane fermi), «riduci animazioni».
- Scelte fatte: l'etichetta del chip periodo `aria-label` invariata; la barra del tempo è statica (senza `run`).
- Attenzione per chi viene dopo: `.pt-sh-row`, `.pt-sh-arc`, `.pt-dh-p`, `.pg-wd` nuove; `Schede.jsx` non importa più `UrbiosLogo`.

## UX-06.6 — fatto il 11/11/2026
- File toccati: `ui/Live.jsx`, `patient.css` (in fondo, `/* UX-06.6 */`), `README.md`, questo file. `ui/Tempo.jsx` invariato (la `TempoBar` della tappa 1 è ora usata).
- Cosa vede di diverso il paziente: in lavoro un solo cronometro (quello della serie, 40 px), il totale piccolo in alto accanto a note/elenco/pausa; barra del tempo con cursore; ripetizioni «10 ×» e carico sulla stessa riga; «ultima volta» (data · carico massimo) apre il foglio Storico; note in un foglio; pulsanti ‹ Fatta ›. In riposo il numero da 88 px su un livello viola che scende (onda che scorre), RPE della serie appena fatta, −15 / Salta / +15, «Dopo» solo se cambia esercizio, ultimi 3 s in lime con impulso. Velo lime e pallino che scatta a ogni serie. Niente più schermata intera degli ultimi 10 s né tab. A fine seduta l'RPE dell'ultima serie si dà nella schermata finale.
- Verificato in browser (375×812 e 360×640 `?lungo`): foglio senza scorrimento e Fatta a 24 px dal fondo; Fatta → riposo con livello 100%; +15 / −15 (minimo 1 s); RPE 8 scritto in sessione, secondo tocco lo toglie (e a fine seduta RPE 9 sull'ultima serie); Salta riposo; Storico e Note con nota salvata sulla serie successiva; ‹ disattivato al primo esercizio, › cambia esercizio; Pausa con «Esci» bianco e bordo; zero errori in console (solo vibrate dei click sintetici); `test:connect` 102/102.
- Da provare su iPhone: fluidità dell'onda del riposo con schermo sempre acceso (se scatta: onda ferma, solo il livello scende, decisione del proprietario); schermo bloccato 60 s (la logica dei tempi non è toccata, solo `restTot` aggiunto a `T`); bip/vibrazione; cursore del metronomo e ultimi 3 s lime (le animazioni non avanzavano nel pane); «riduci animazioni».
- Scelte fatte: il layout è a colonna (testata che riempie, foglio alto quanto il contenuto) invece di altezze fisse: così il livello viola ha l'altezza esatta dell'area visibile; le vecchie regole `.pt-grid`, `.pt-seg`, `.pt-rf`, `.pt-tp`, `.pt-nav2` restano nel CSS ma non nel JSX. Nel foglio Storico la riga di oggi compare come prima.
- Attenzione per chi viene dopo: classi `pt-lv2`, `pt-lb2`, `pt-sh2`, `pt-rest-w`, `pt-veil`, `pt-nx2`, `pt-bt`, `pt-rnd`; stati `panel` e `hit`; tolti `rpe` e `tab`; `T.current.restTot`.

## UX-06.7 — fatto il 11/11/2026
- File toccati: `ui/Ruler.jsx` (nuovo), `ui/Tools.jsx`, `ui/MealSheet.jsx` (solo `WeightSheet`), `ui/Progress.jsx` (solo `WeightTrend`, prop `bare`), `patient.css` (in fondo, `/* UX-06.7 */`), `README.md`, questo file.
- Cosa vede di diverso il paziente: Peso con grafico (solo variazione e linea), numero unico grande tra − e +, righello da trascinare a scatti di 0,1, poi «Salva». Controllo con i giorni mancanti grandi, quattro chip su una riga, data con cestino e «Salva» solo se la data cambia. Spesa con contatore «n/N» (pillola lime a lista completa), giorni e persone su una riga con icona, voci spuntate barrate che scendono in fondo dopo 250 ms, senza il blocco «Ti manca…». Appunti con campo e freccia lime dentro, «Togli» tondo.
- Verificato in browser (375×812 `?prova`, 360×640 `?vuoto`): scorrimento 1243→72,9; ± e frecce spostano di 0,1 e il righello segue; `__demoLog.weights` registra 72,9 e la tessera Home diventa «Peso 72,9»; `?vuoto` senza grafico, righello a 70,0; «1 mese» salva e chiude, riaperto «30 giorni», «Salva» compare solo cambiando data; spesa «1/17», riga in fondo con opacità .45 e barrata, nessun `.pt-miss`; appunto aggiunto, campo vuoto, tolto con la X; tessere Home aggiornate. Console senza errori dell'app (solo l'avviso del browser su `vibrate` senza tocco).
- Da provare su iPhone: trascinamento del righello col dito e aggancio alla tacca (inerzia di Safari, `scrollend` assente nelle versioni vecchie: c'è il ritardo di 120 ms), vibrazione a ogni tacca (iOS Safari non la supporta: è prevista), tenuta di ± sul peso, riordino della spesa, tastiera sopra il campo appunti.
- Scelte fatte: il titolo del foglio peso resta «Registra il peso» (il brief non lo cambia); con `bare` durante la selezione sul grafico compare solo la data; il righello ha ±15 kg intorno al valore iniziale e non si ricentra se si esce dall'intervallo con ±; classe del riquadro appunti `pt-ns` (`pt-note-in` esisteva già).
- Attenzione per chi viene dopo: classi nuove `pt-ruler*`, `pt-vd`, `pt-vdate`, `pt-quick-4`, `pt-shop-r`, `pt-ns`, `pt-note-send`, `pt-todo-x`; le vecchie `.pt-miss`, `.pt-shop-s` restano nel CSS ma non nel JSX.
