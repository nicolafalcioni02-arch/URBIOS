# UX-00 — Base: l'app funziona senza rete

Prima leggi `REGOLE.md` e `STATO.md`. È il primo compito: non ha precedenti.

## Obiettivo
Regola di base del prodotto: **la rete serve solo per ricevere diete e schede dal professionista. Tutto il resto deve funzionare perfettamente senza internet**: aprire l'app (anche dalla schermata Home del telefono), sbloccarla, leggere i piani, allenarsi, registrare pasti e peso, creare il PDF.

Oggi i dati sono già sul telefono (IndexedDB cifrato) e il diario si salva in locale. Manca una cosa sola: **i file dell'app** (HTML, JS, CSS, icone) arrivano ogni volta dalla rete, quindi senza campo l'app non si apre. Serve un service worker che li tenga in cache.

## Confini di sicurezza (non negoziabili)
- In cache vanno **solo i file statici della build**. Mai risposte del relay, mai documenti, mai nulla che venga da un'altra origine. I dati clinici restano solo in IndexedDB cifrato (requisito SEC-122: «shell in cache, dati clinici mai in cache in chiaro»; SEC-110: «service worker sicuro»).
- Il service worker non intercetta le richieste verso altre origini (il relay): le lascia passare senza toccarle.
- Non toccare la CSP di `patient.html` e `demo.html`: `script-src 'self'` copre già un service worker servito dalla stessa origine.
- Leggi `docs/sicurezza/README.md` e segui la sua procedura per registrare il lavoro su SEC-110 e SEC-122 (passa da `docs/sicurezza/audit.md`).

## File che puoi toccare
- `vite.patient.config.js`
- `src/patient/main.jsx`
- `src/patient/sw.js` (nuovo)
- `src/patient/ui/Home.jsx` (solo la riga del punto 4)
- `docs/sicurezza/audit.md`, `docs/sicurezza/requisiti.md` (solo le righe SEC-110 e SEC-122), `docs/sicurezza/decisioni.md` (solo una nota sotto D-01, punto 5)
- chiusura: `src/patient/README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `patient.html`, `demo.html`, `public/manifest.webmanifest`, `docs/sicurezza/README.md`, `docs/sicurezza/decisioni.md` (D-01).

## Non toccare
`patient.html`, `demo.html`, `public/`, `src/connect/`, `runtime.js`, `vite.config.js` (è il programma del medico), `package.json` (nessuna dipendenza nuova: niente plugin PWA).

## Cosa fare

### 1. Il service worker (`src/patient/sw.js`)
File JavaScript semplice (non un modulo, nessun `import`), con due segnaposto che la build sostituisce: `__VERSION__` (stringa) e `__FILES__` (array di percorsi relativi).
- **install:** apre la cache `urbios-paziente-<versione>` e fa `addAll` dell'elenco. **Non** chiamare `skipWaiting()`.
- **activate:** cancella le altre cache che iniziano con `urbios-paziente-`. **Non** chiamare `clients.claim()`.
  Perché niente `skipWaiting`/`claim`: una versione nuova deve subentrare solo quando l'app viene chiusa e riaperta. Se subentrasse a pagina aperta cancellerebbe i file della versione in uso (per esempio il prontuario alimenti caricato a richiesta) nel mezzo di un allenamento.
- **fetch:** rispondi solo se la richiesta è `GET` **e** della stessa origine **e** dentro lo scope. In ogni altro caso `return` senza `respondWith` (la richiesta va in rete normalmente).
  - Navigazione o file `.html`: **prima la rete**, se fallisce la copia in cache (cerca con `ignoreSearch: true`, così `patient.html?prova` trova `patient.html`). Così con la rete si ha sempre la versione più recente.
  - Tutto il resto: **prima la cache**, se manca la rete.
  - **Mai** `cache.put` durante la navigazione: la cache contiene solo ciò che è stato messo all'installazione.
- Commenti brevi in italiano che spiegano queste tre scelte.

### 2. La build scrive `sw.js` con l'elenco dei file (`vite.patient.config.js`)
Aggiungi un piccolo plugin nel file di configurazione, attivo solo in build (`apply: 'build'`), che nel passo `closeBundle`:
- legge ricorsivamente la cartella di uscita (quella effettiva della build, non `dist-patient` scritto a mano: prendila da `configResolved`), così l'elenco comprende HTML, `assets/*`, manifest e icone copiati da `public/`;
- esclude `sw.js` stesso;
- calcola la versione come hash (`node:crypto`, sha256, primi 12 caratteri) di nomi e contenuti dei file;
- legge `src/patient/sw.js`, sostituisce i due segnaposto e scrive `sw.js` nella radice della cartella di uscita.
Solo moduli di Node (`node:fs`, `node:path`, `node:crypto`). I percorsi nell'elenco sono relativi (`./patient.html`, `./assets/…`) perché il sito vive in una sottocartella.

### 3. Registrazione (`src/patient/main.jsx`)
Dopo il `render`, solo nella versione pubblicata:
`if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });`
In sviluppo (`npm run dev:patient`, server `patient`) il service worker non deve esistere.

### 4. Senza rete non si mostra un avviso
`Home.jsx:41`: `{st.lastError && <Note tone="warn">Non riesco a collegarmi per ricevere nuovi piani. Riproverò da solo.</Note>}`. Senza rete questo avviso resterebbe fisso in una Home che non scorre, per una situazione che ora è normale. **Togli la riga.** Il controllo dei piani continua a riprovare da solo ogni 30 secondi; chi vuole forzarlo usa «Aggiorna piani» nel Profilo. Non toccare gli altri due avvisi (collegamento chiuso, versioni in conflitto).

### 5. Documenti
- `src/patient/README.md`: correggi le frasi «Non c'è service worker», «non funziona offline», «service worker no». Scrivi in 3 righe come funziona: cosa va in cache, quando subentra una versione nuova, cosa non va mai in cache.
- `docs/sicurezza/decisioni.md`, sotto D-01, una riga datata: il proprietario ha stabilito che l'app paziente deve funzionare senza rete salvo la ricezione dei piani; resta valido «cache solo di shell, mai dati clinici in chiaro».
- `docs/sicurezza/requisiti.md` e `audit.md`: aggiorna SEC-110 e SEC-122 secondo la procedura del README di quella cartella.

## Come verificare (eccezione alla regola sulla build, valida solo per questo compito)
Il service worker esiste solo nella versione costruita. Sei autorizzato a costruire **in una cartella temporanea fuori dal repository**, senza toccare `dist-patient/` né `dist/`:
1. `npx vite build --config vite.patient.config.js --outDir <cartella temporanea> --emptyOutDir`
2. `npx vite preview --config vite.patient.config.js --outDir <cartella temporanea> --port 5177 --strictPort` (in background; se la porta è occupata usane un'altra)
3. apri `http://localhost:5177/patient.html?prova` nel browser.
Resta vietato `npm run build` e `npm run build:patient`. A fine lavoro ferma il server e cancella la cartella temporanea. `git status` non deve mostrare file di build.

## Fatto quando
1. Nella cartella temporanea esiste `sw.js` con versione ed elenco compilati; l'elenco contiene `./patient.html`, `./demo.html`, `./manifest.webmanifest`, le icone e tutti i file di `assets/` (compreso il pezzo del prontuario alimenti), e non contiene `sw.js`.
2. Apro la pagina: in console `(await navigator.serviceWorker.getRegistration()).active.state` è `'activated'` dopo un ricaricamento; `await caches.keys()` mostra una sola cache `urbios-paziente-…`; nessun errore di CSP in console.
3. **Fermo il server di anteprima** e ricarico la pagina: l'app si apre lo stesso. Faccio un giro completo senza server: Home → allenamento guidato (una serie) → Dieta → registro un pasto → «Sostituisci» e cerco un alimento (il prontuario si carica) → Schede → Profilo → «Invia il riassunto» (il PDF si crea). Nessun errore bloccante; gli unici errori ammessi in console sono le richieste di rete fallite.
4. Sempre senza server: `demo.html` si apre.
5. Riavvio il server, cambio una riga di testo qualsiasi nel codice, ricostruisco nella stessa cartella temporanea, ricarico: `sw.js` ha una versione diversa; la pagina aperta continua a funzionare; dopo aver chiuso e riaperto la scheda del browser c'è la versione nuova e in `caches.keys()` resta una sola cache. Poi **annulla** la riga di prova.
6. In console: `(await (await caches.open((await caches.keys())[0])).keys()).every((r) => new URL(r.url).origin === location.origin)` è `true`.
7. Server di sviluppo (`patient`, `?prova`): `await navigator.serviceWorker.getRegistrations()` è vuoto (se resta una registrazione della prova precedente sulla stessa porta, usa una porta diversa per le due prove).
8. Home: senza rete non compare nessun avviso giallo.
9. `npm run test:connect` passa. `git status`: solo i file della lista.

## Da dichiarare «da provare su iPhone» in STATO.md
- App installata dalla schermata Home, modalità aereo: si apre, si sblocca con la passphrase, mostra i piani già ricevuti.
- Primo avvio in assoluto: serve la rete una volta (per scaricare l'app e per collegarsi al professionista).
- iPhone può cancellare cache e dati di un sito non installato dopo alcune settimane senza uso: l'app va installata dalla schermata Home. Non verificato.
- Dopo una nuova pubblicazione su GitHub Pages: la versione nuova arriva alla riapertura successiva dell'app.
