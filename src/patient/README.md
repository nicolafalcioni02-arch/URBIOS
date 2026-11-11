# App paziente (src/patient/)

App **separata** dal programma del medico: `patient.html` + `vite.patient.config.js` → `dist-patient/` (file multipli, da pubblicare su GitHub Pages).
Il medico invia diete e schede cifrate; il paziente le legge. **Non esiste il nome del paziente**: solo codici anonimi.

## Comandi (li lancia l'utente; non eseguiti in sessione)
```bash
npm run dev:patient     # prova in locale (CSP tolta in sviluppo)
npm run build:patient   # produce dist-patient/
npm run test:connect    # include i test di src/patient/test
```

## File
| File | Ruolo |
|---|---|
| `runtime.js` | logica senza UI: cassaforte (passphrase), consenso, collegamento da QR, sync, documenti. Testata in Node |
| `App.jsx` | macchina a stati: consenso → passphrase → (collega) → home; blocco per inattività 5 min |
| `ui/Welcome.jsx` `bits.jsx` (AuthShell) | prima schermata con logo, cornice comune di Informativa / Passphrase («Accedi») / Collegamento, con i 3 passi |
| `ui/Shell.jsx` | dopo il collegamento: 4 tab (Home, Dieta, Schede, Profilo) con dock a capsula; `Home.jsx` (riquadro del giorno + elenco), `TrainDetail.jsx` (esercizi), `Live.jsx` (allenamento guidato: tempi calcolati dall'orologio, schermo acceso con wake lock, bip/vibrazione; un solo cronometro sul foglio, tempo come `TempoBar` con cursore, «Fatta»/riposo con livello viola che scende e ±15 s, RPE solo dopo la serie (in riposo, o a fine seduta per l'ultima), «ultima volta» apre il foglio «Storico», note in un foglio, «Suggerito» solo se diverso dal carico, «Corpo libero» se il carico è 0, pausa con «Esci»), `Nutrition.jsx` + `MealSheet.jsx` (dieta e registro pasto; il foglio peso usa `Ruler.jsx`, righello a passo 0,1), `Tools.jsx` (fogli controllo, spesa con riordino ritardato, appunti), `logic.js` (lettura «4x10», «90s», chiavi del diario) |
| `ui/Consent.jsx` `Passphrase.jsx` `Pair.jsx` `Home.jsx` `DocView.jsx` `Settings.jsx` `bits.jsx` | schermate (classi `pt-*` in `patient.css`) |
| `scan.js` | lettura QR con fotocamera (jsQR, tutto sul dispositivo) |
| `barcode.js` `foodlookup.js` | codice a barre dei prodotti (BarcodeDetector o ZXing) e ricerca su Open Food Facts: **l'unica chiamata verso un servizio esterno**, solo il codice a barre, usata nella Spesa; prezzo e negozio li scrive il cliente (`tools.buys` nel diario, con il registro degli acquisti) e la Spesa ne ricava la stima |

Riusa `src/connect/` (stessi moduli del medico, `role: 'patient'`) e `storage/cryptoVault.js` (PBKDF2 600k + AES-GCM).

## Come funziona
1. **Primo avvio:** informativa + 3 consensi distinti (dati salute, condizioni, scambio) → passphrase ≥ 12 caratteri → cassaforte. Il consenso (versione, data) si salva cifrato.
2. **Collegamento:** il medico mostra il QR; il paziente lo inquadra (o incolla il testo). L'indirizzo del relay è **nel QR** (nessun endpoint nel codice). Codice di verifica uguale sui due schermi → conferme → collegato.
3. **Uso:** ogni 30 s (e col tasto Aggiorna) controlla la casella, riceve documenti, manda la conferma di ricezione. Tutto resta cifrato sul telefono (IndexedDB, chiave dalla passphrase).
4. **Blocco:** 5 minuti senza azioni dell'utente (o al ritorno da sfondo) ⇒ chiave dalla memoria, serve la passphrase. «Elimina tutto» = revoca + cancellazione locale.

## Sicurezza: cosa c'è e cosa NO
- CSP via `<meta>` (`script-src 'self'`, niente inline); `connect-src https:` perché il relay arriva dal QR. **`frame-ancestors` non è applicabile da `<meta>`** (GitHub Pages non permette header): clickjacking non mitigato dalla CSP.
- Nessun `innerHTML` nel codice dell'app (solo nodi React). Nessun font/script esterno.
- **Service worker (`sw.js`, scritto dalla build con versione ed elenco file):** in cache solo i file statici della build (HTML, `assets/`, manifest, icone), messi all'installazione. Senza rete l'app si apre e funziona; la rete serve solo a ricevere i piani.
  Una versione nuova subentra solo alla chiusura e riapertura dell'app (niente `skipWaiting`/`claim`); pagine prima dalla rete, il resto prima dalla cache.
  Mai in cache: risposte del relay, altre origini, dati clinici (restano in IndexedDB cifrato). Non esiste in sviluppo (solo `import.meta.env.PROD`).
- **Testo dell'informativa e consensi da far revisionare** a un consulente privacy/DPO (SEC-97: DPIA, titolare/responsabile, conservazione).
- Passphrase persa = dati persi (il medico può rinviare). Nessun recupero per scelta.
- Documenti: dieta (giorni → pasti → voci) e scheda (settimane → giorni → esercizi) hanno una vista dedicata con schede a tab; qualunque altra forma ricade nella vista generica.
- **Non provata** su dispositivo reale né nel browser (fotocamera, IndexedDB, iOS Safari): solo logica in Node e compilazione con esbuild. Da provare: scansione, riavvio, blocco, installazione come app.
- Ereditati: ratchet scritto da noi (D-13), Worker del relay mai distribuito, nessuna revisione crittografica esterna.

## Interfaccia (tema chiaro viola/lime)
- Sfondo lilla `#EFEAFF` con gradiente animato, riquadri bianchi, foglio `#F3EEFF`, accento viola `#6B3DFF`, **lime `#D8FD38` = colore principale (azioni e grafici)**, testo `#0B0C0E`, grigio `#6C727F`. Forme a 28–32 px, dock a capsula. Il tema chiaro sta in fondo a `patient.css` (blocchi `body:has(.pt-main)`): le nuove regole si aggiungono in fondo. Un solo lime pieno per schermata (Profilo: solo «Invia il riassunto»; registro pasto: solo la conferma); esercizi e riquadri usano lilla `#DCD2FF`/`#F3EEFF`, niente pastelli. Il Profilo mostra l'esito del riassunto come riga sotto il pulsante. Restano scuri solo l'allenamento guidato (viola scuro + foglio bianco) e le schermate di accesso.
- **Mattoni condivisi (`ui/bits.jsx`, UX-06.1):** `Sheet` (foglio dal basso con maniglia, si chiude trascinando giù dall'intestazione), `Lst` (stesso per i fogli a lista), `Step` + `useHold` (stepper «±»: tenuto premuto ripete, il numero si tocca e si scrive), `Count`, icone nuove (`clock`, `trash`, `qr`, …). `ui/Tempo.jsx`: `parseTempo` e `TempoBar` (non ancora usata). Variabili `--u-*` (sistema colori UX-06) su `:root`; i fogli non hanno più «Annulla»/«Chiudi» in fondo.
- **Testi lunghi:** `ui/Clamp.jsx` taglia su N righe e mostra «Leggi tutto» solo se il testo è davvero tagliato; il riquadro si apre sul `body` con sfondo sfocato.
- **Installabile:** `public/` (manifest, icone) e tag per iPhone in `patient.html`; il service worker (`sw.js`) tiene in cache la shell.
- **Pubblicazione:** il sito sta nel ramo `gh-pages` (`paziente/` = build di `dist-patient`), il codice su `main`.
- **Diario locale** (`rt.log`: serie fatte, carichi, pasti, fuori piano): salvato cifrato sul telefono PRIMA di tutto, anche senza rete. **Non viene mai inviato** al professionista (il canale è a senso unico: scrive solo il medico).
- **Non presenti perché i dati non esistono** nei documenti inviati: foto/nome del paziente (anonimato), video e immagini degli esercizi, calorie bruciate, orari dei pasti, sostituzioni consentite, notifiche. Il tracker mostra serie fatte e tempo; lo sfondo è un gradiente.
- Non provata su telefono vero (vibrazione e audio dipendono dal dispositivo; iOS richiede un tocco per attivare l'audio).

## Modalità prova (solo sviluppo)
In `npm run dev:patient` le prime schermate hanno in basso **«Salta (solo prova)»**: apre l'app con dati finti (`demo.js`: 2 schede, 1 dieta con 2 giorni), senza cassaforte né collegamento; nulla viene salvato. Il tasto dipende da `import.meta.env.DEV`: nella versione pubblicata (`build:patient`) non compare. «Blocca ora» dalle Impostazioni esce dalla prova.

- **Sfondo «acqua»** (`bits.jsx: Backdrop`): riflessi di luce che si muovono come sul fondo di una piscina, disegnati in piccolo su un canvas (90×160 punti, 20 fps); fermo se la pagina è nascosta o con «riduci animazioni».
- **Stato degli allenamenti** (`logic.js: dayStatus, currentWeek`): ogni giorno è *fatto* (tutte le serie, con data), *in corso* o *da fare*; si vede su Home (spunta, «Fatto il …», «X di Y fatti»), tessere settimana (pallini) e selettore giorni. Il riquadro in alto mostra il PROSSIMO allenamento da fare. La **home è minimale**: data, prossimo allenamento, «Cosa mangiamo?» / «Alleniamoci!», «Registra il peso» e «Fuori piano»; un allenamento iniziato si può riprendere per 2 giorni (`logic.js: sessionDate`), la Home avvisa quando sta per scadere e «Riprendi» apre direttamente l'allenamento guidato; dopo il blocco per inattività si rientra in Live (puntatore solo in memoria, `App.jsx: resume`, max 30 min). Gli elenchi stanno nelle tab Schede e Dieta, «Controlla nuovi piani» nel Profilo.
- **Giorno di dieta di oggi** (`logic.js: dietDayToday`): i giorni non hanno il giorno della settimana, quindi vale la scelta del paziente (tocco nella tab Dieta, salvata in `log.tools.dietDay = {date, docId, d}` per quella data), poi il giorno con più pasti già registrati oggi, poi il nome del giorno nel titolo, poi (se i giorni sono 7) lunedì…domenica, altrimenti il primo. Lo usano `nextMeal`, `Rings` e la tab Dieta; il totale «Oggi» è la somma di tutti i pasti della data (`dayKcal`), non del solo giorno selezionato.
- **Tab Schede** (`Schede.jsx`): parte alta FISSA (logo lime + una voce per scheda/visita, che si rimpiccioliscono se sono tante) sullo sfondo d'acqua con gli angoli in basso arrotondati; parte bassa bianca che scorre: riepilogo (allenamenti, serie, muscoli), **omino** davanti/dietro con i muscoli colorati (`BodyMap.jsx`), serie per settimana, serie per muscolo, **forza** (variazione media del carico massimo e volume in kg rispetto al periodo precedente, per esercizio; le ripetizioni non si registrano), archivio delle schede finite. Toccando una voce si aprono settimane e giorni. Tutto calcolato dal diario locale (`log.hist`, `log.weights`); i muscoli vengono dal NOME dell'esercizio (`muscles.js`, regole per parole in italiano/inglese: un esercizio con nome insolito non colora nulla). Le schede ritirate dal professionista non compaiono.
