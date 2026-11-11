# Regole comuni per chi esegue un compito UX-0N

Sei un agente di codice che lavora da solo sull'app paziente di URBIOS (`src/patient/`). Il proprietario non è lì a rispondere: devi arrivare in fondo senza domande. Parla e scrivi in italiano.

## 1. Cosa leggere, in quest'ordine
1. Questo file.
2. `src/patient/piano-ux/STATO.md` (cosa hanno fatto gli agenti prima di te).
3. Il tuo brief `UX-0N-*.md`. **Solo il tuo:** non aprire gli altri brief né `00-AUDIT-E-PIANO.md` né `PROMPT_UX.md`.
4. `src/patient/README.md` (mappa dei file).
5. I file elencati nel brief sotto «File che puoi toccare». Nient'altro, salvo i «File da leggere soltanto» del brief.

`patient.css` pesa 131 KB: **non leggerlo intero.** Cerca la classe che ti serve con grep e leggi solo quelle righe.

## 2. Prima di iniziare
- `git status` deve essere pulito e in `STATO.md` tutti i compiti con numero più basso del tuo devono essere «fatto». Se non è così, fermati e scrivilo al proprietario: non partire.
- I numeri di riga dei brief valgono per il commit `ff92428`. Dopo i compiti precedenti saranno spostati: trova il punto dal **testo citato**, non dal numero.
- Se il codice non combacia con ciò che il brief descrive, segui l'intento del brief e annota la differenza in `STATO.md`.

## 3. Divieti assoluti
- Mai `npm run build` né `npm run build:patient`. Mai `git push`, mai creare o cambiare ramo, mai toccare `gh-pages`.
- Mai modificare file fuori dalla lista «File che puoi toccare» del tuo brief. Se ti sembra indispensabile: fermati, non farlo, scrivilo nel messaggio finale.
- Mai toccare `src/connect/`, `storage/`, la cassaforte, il blocco per inattività (`IDLE_MS`, `useIdleLock` in `App.jsx`), la CSP di `patient.html`.
- Nessuna nuova dipendenza. Nessun font, script, immagine o servizio esterno. Nessun `innerHTML`, nessun tag `<style>` o `<script>` nuovo.
- Nessun dato nuovo salvato fuori dal diario cifrato (`rt.log`): niente `localStorage`, `sessionStorage`, cookie.
- Niente emoji, niente icone che non siano SVG a tratto come quelle di `ui/bits.jsx`.
- Nessun refactor, nessuna «pulizia» non chiesta, nessuna funzione in più. Se finisci presto, hai finito.

## 4. Principi del prodotto (vengono prima di tutto il resto)
- **Meno scritte possibili.** Non aggiungere etichette, spiegazioni, titoli, saluti o messaggi che il brief non chiede parola per parola. Se un'informazione si può dare con posizione, forma o colore, non usare una parola. Se un testo del brief ti sembra accorciabile senza perdere senso, accorcialo e annotalo.
- **Tutto deve funzionare senza rete.** La rete serve solo a ricevere i piani dal professionista. Non introdurre nulla che la richieda.
- **Gli anelli della Home sono decorativi:** non collegarli a dati, non aggiungere legende.
- **Tono serio e professionale** (riferimento: l'app Fitness di Apple). Niente feste, coriandoli, premi, frasi d'incoraggiamento nuove, animazioni decorative nuove.

## 4b. Stile visivo
- Colori ammessi, e solo questi: sfondo `#EFEAFF`, bianco `#fff`, foglio `#F3EEFF`, riempimento `#DCD2FF`, viola `#6B3DFF`, lime `#D8FD38` (su bianco, per grafici e segni piccoli, `#B4E600`), testo `#0B0C0E`, grigio `#6C727F`, grigio scuro `#3A3F4B`. Live resta scuro com'è.
- Il lime non si sfuma mai (le sfumature si fanno col bianco). **Un solo elemento lime pieno per schermata** (l'azione principale).
- Forme tonde (raggi 22–32 px, pulsanti a pillola), margini generosi: mai due riquadri attaccati (almeno 12 px).
- Il testo non deve mai uscire dai bordi né essere tagliato senza via d'uscita: per i testi lunghi usa `ui/Clamp.jsx` come fa il resto dell'app.
- Bersagli di tocco almeno 44×44 px.
- In dubbio tra due soluzioni, scegli la più sobria. «Meglio poco che troppo».

## 5. Stile del codice
- Scrivi come il file che stai toccando: funzioni freccia, righe dense, commenti brevi in italiano che spiegano il perché.
- CSS: **aggiungi regole in fondo a `patient.css`**, sotto un commento `/* UX-0N: … */`. Non modificare né cancellare regole esistenti. Per le schermate chiare usa il prefisso `body:has(.pt-main)` solo se serve a vincere una regola esistente; Live non ha `.pt-main`.
- Trappole già incontrate: `animation-fill-mode: both` rompe `position: fixed` nei figli; un'animazione su `transform` annulla il `transform` dichiarato; `min-width: 0` globale schiaccia le tessere.

## 6. Come verificare
- Avvia il server con lo strumento di anteprima, configurazione **`patient`** (non usare Bash per i server). La porta prevista è 5175 ma può cambiare: usa quella che lo strumento restituisce.
- Pagina: `http://localhost:PORTA/patient.html?prova` (dati finti in memoria: ricaricando si azzera tutto). Varianti: `?prova&lungo` (testi lunghissimi), `?prova&vuoto` (diario vuoto), `?prova&solo=dieta`, `?prova&solo=scheda`.
- Finestra a **375×812**. A fine lavoro riportala a desktop.
- Nel browser, in modalità prova, `window.__demoLog` è il diario e `window.__demoChange()` ridisegna: usali per controllare cosa hai salvato o per preparare uno stato.
- Clicca gli elementi per riferimento (trova il pulsante dal testo), non per coordinate.
- Dopo ogni modifica: ricarica, guarda la console (zero errori), controlla il caso normale, poi `?lungo` e `?vuoto` sulle schermate che hai toccato.
- Se hai toccato `ui/logic.js` o `runtime.js`: esegui `npm run test:connect` (deve passare tutto).
- Ogni «Fatto quando» del brief va controllato davvero, uno per uno. Se uno non è verificabile in browser (iPhone, audio, schermo acceso, blocco con passphrase), **non dire che funziona**: scrivilo in `STATO.md` sotto «Da provare su iPhone».
- Fai uno screenshot finale di ogni schermata cambiata e mostralo nel messaggio di chiusura.

## 7. Se ti blocchi
- Errore o strumento che fallisce: diagnostica e riprova; non fermarti al primo ostacolo.
- Dubbio di gusto: scegli l'opzione più sobria e annotala in `STATO.md` sotto «Scelte fatte».
- Ti fermi solo se: `git status` sporco all'inizio, un compito precedente non è «fatto», serve un file fuori lista, o un «Fatto quando» è impossibile senza violare un divieto. In quel caso lascia il codice funzionante (annulla il mezzo lavoro) e spiega in 5 righe.

## 8. Chiusura (obbligatoria, in quest'ordine)
1. Aggiorna `src/patient/README.md`: solo le frasi che il tuo lavoro ha reso false o incomplete.
2. Aggiorna `src/patient/MIGLIORIE.md`: togli le voci che hai risolto.
3. Aggiungi il tuo blocco in fondo a `src/patient/piano-ux/STATO.md` con il modello che trovi lì.
4. Un solo commit locale su `main`: `git add` dei soli file che hai toccato, messaggio `UX-0N: <cosa cambia per il paziente>`. Niente push.
5. Messaggio finale al proprietario, al massimo 10 righe: cosa vede di diverso il paziente, screenshot, cosa resta da provare su iPhone, scelte fatte.
