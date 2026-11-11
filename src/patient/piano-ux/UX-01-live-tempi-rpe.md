# UX-01 — Live: tempi veri, schermo acceso, RPE dopo la serie

Prima leggi `REGOLE.md` e `STATO.md`. Richiede UX-00 «fatto».

## Obiettivo
Nell'allenamento guidato (`ui/Live.jsx`) il paziente deve potersi fidare del timer anche se il telefono si blocca, non deve sbloccare lo schermo a ogni serie, e deve poter dare l'RPE **dopo** aver fatto la serie, durante il riposo.

## File che puoi toccare
- `src/patient/ui/Live.jsx`
- `src/patient/demo.js`
- `src/patient/patient.css` (solo in fondo, solo se serve)
- chiusura: `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `src/patient/ui/logic.js`.

## Non toccare
Aspetto, testi, colori e disposizione di Live (li cambia UX-02). La schermata di fine allenamento. `App.jsx`. La forma dei dati salvati, tranne ciò che è scritto al punto 3.

## Com'è oggi
- `Live.jsx:64-77`: un `setInterval` da 1 s fa `elapsed + 1`, `setSecs + 1` o `rest - 1`. Se il browser sospende la pagina (schermo spento, app in secondo piano) i secondi persi non tornano.
- `Live.jsx:57-63`: `beep` crea l'`AudioContext` al primo «Serie completata» (`:87`).
- `Live.jsx:86-101` `complete()`: salva `rec = { kg, rpe?, note? }` in `l.sessions[key].sets[exI]` e in `l.hist[nome]` (voce con la data di oggi), poi `setRpe(null)` (`:96`).
- `Live.jsx:159-160`: il selettore RPE sta nella tab «Oggi» e vale per la serie che si sta per completare.
- `Live.jsx:193`: con `rest <= 30` uno strato a schermo intero (`.pt-rf`) copre tutto.
- `demo.js:36` e `:42`: lo storico finto usa la chiave `'Squat con bilanciere'`, ma l'esercizio in `demo.js:7` e `:12` si chiama `'Squat bulgaro con bilanciere olimpico, presa larga e pausa al fondo'`: non combaciano.

## Cosa fare

### 1. Tempi calcolati dall'orologio
Sostituisci il conteggio a incrementi con valori **derivati da `Date.now()`**. Gli stati `elapsed`, `setSecs`, `rest` restano (il resto del file li usa), ma a ogni tic vengono ricalcolati:
- tieni in un `useRef` i riferimenti di tempo: istante dell'ultima ripartenza e secondi totali accumulati prima di essa (parti da `start.secs || 0`), istante d'inizio della serie in corso, istante di fine del riposo, ultimo secondo per cui hai già suonato il bip;
- tic ogni 250 ms quando `!paused && !fin`, più un ricalcolo immediato su `visibilitychange` quando la pagina torna visibile;
- `elapsed` = accumulati + secondi dall'ultima ripartenza; `setSecs` = secondi dall'inizio della serie; `rest` = `Math.ceil((fineRiposo - adesso) / 1000)`;
- quando `rest` arriva a 0: fase `work`, e la serie successiva parte **dall'istante in cui il riposo è finito** (non da quando la pagina è tornata visibile). Bip e vibrazione finali solo se il riposo è finito da meno di 2 s (niente suoni a sorpresa al rientro);
- bip a 3, 2, 1 secondi: uno solo per secondo (con il tic a 250 ms altrimenti suonerebbe 4 volte);
- `complete()` imposta la fine del riposo a `Date.now() + cur.rest * 1000`; `skipRest()` e `goto()` azzerano il riposo e fanno ripartire la serie da adesso;
- **pausa:** entrando in pausa congela i tre valori; uscendo, sposta i riferimenti in modo che riposo residuo, tempo della serie e totale riprendano da dove erano. Il tempo passato in pausa non conta.
- I valori salvati nel diario (`q.secs = elapsed`, `s.secs = secs`) restano com'erano.

### 2. Schermo sempre acceso
- Mentre Live è aperto e `!paused && !fin`, chiedi `navigator.wakeLock.request('screen')` dentro `try/catch` (se l'API non c'è, non succede nulla e non compare nulla).
- Il sistema rilascia il blocco quando la pagina va in secondo piano: richiedilo di nuovo su `visibilitychange` → visibile.
- Rilascialo in pausa, a fine allenamento e allo smontaggio del componente.
- Nessun elemento a schermo.

### 3. RPE dopo la serie
- In `complete()` non azzerare più l'RPE scelto. Ricorda in un `useRef` l'ultima serie salvata: `{ exI, name, date }`. Dopo `complete()` torna sulla tab «Oggi» (`setTab('oggi')`).
- **Durante il riposo** il selettore RPE riguarda **la serie appena fatta**:
  - l'etichetta sopra resta «RPE» in entrambe le fasi (nessuna scritta nuova);
  - mostra selezionato l'RPE già salvato su quella serie (anche se nel frattempo si è passati all'esercizio successivo: `goto()` azzera `rpe`, tu dopo devi rimetterlo);
  - un tocco scrive subito nel diario con `rt.log.update`: sull'**ultima** voce di `l.sessions[key].sets[exI]` e sull'**ultima** serie della voce di `l.hist[name]` con quella `date`. Imposta `rpe` al valore, oppure toglilo (`delete`) se si tocca di nuovo lo stesso numero. Attenzione: in modalità prova le due voci sono lo stesso oggetto, nell'app vera no: aggiorna entrambe senza presumere che coincidano.
- Quando il riposo finisce (da solo o con «Salta riposo») il selettore torna vuoto e in fase `work` funziona come oggi (vale per la serie che sta per essere completata: serve per l'ultima serie dell'allenamento, che non ha riposo dopo).
- Lo strato a schermo intero `.pt-rf` compare solo negli **ultimi 10 secondi**: in `Live.jsx:193` `rest <= 30` diventa `rest <= 10`.

### 4. Suono più robusto
In `beep`, prima di suonare: se `c.state === 'suspended'` chiama `c.resume()` (dopo un passaggio in secondo piano iOS sospende l'audio). Lascia `buzz` com'è.

### 5. Dati di prova coerenti
In `demo.js` definisci una costante con il nome esatto dell'esercizio (`'Squat bulgaro con bilanciere olimpico, presa larga e pausa al fondo'`) e usala in tutti i punti: i due `ex(...)` di `:7` e `:12`, la chiave in `offs` (`:36`), le chiavi in `hist` e `last` e il `makeHist()[...]` di `:42`. Risultato: il primo esercizio ha storico. Con `?lungo` i nomi vengono allungati e lo storico non combacia più: va bene così.

## Fatto quando (controlla ognuno in browser, `?prova`, 375×812)
Percorso: Home → «Inizia» → «Inizia allenamento guidato».
1. Completo una serie: parte il riposo da 35 e scende di 1 al secondo; il totale in alto a sinistra sale di 1 al secondo.
2. Durante il riposo eseguo in console `const _n = Date.now; Date.now = () => _n() + 20000;`: entro 1 s il riposo cala di circa 20 e il totale sale di circa 20. Poi ricarico la pagina.
3. Stesso trucco con `+ 60000` durante un riposo: si passa alla fase di lavoro senza errori e il tempo della serie mostra circa 25 s (60 − 35), non 0.
4. Pausa durante il riposo a ~25 s, aspetto 5 s, «Riprendi»: il riposo riparte da ~25 e il totale non è salito di quei 5 s.
5. Completo la prima serie senza RPE, durante il riposo tocco 8: `window.__demoLog.sessions[<chiave di oggi>].sets[0][0].rpe === 8` e l'ultima serie della voce di oggi in `__demoLog.hist[<nome esercizio>]` ha `rpe === 8`. Ritocco 8: il campo sparisce da entrambe.
6. Finito il riposo il selettore è vuoto.
7. Completo l'ultima serie dell'esercizio 1 (si passa all'esercizio 2 in riposo), tocco 9: il 9 finisce sull'ultima serie dell'esercizio 1, non sul 2.
8. Con riposo sopra i 10 s vedo foglio, RPE e carico; sotto i 10 s compare lo schermo intero con «Salta riposo».
9. Tab «Storico» del primo esercizio: ci sono date passate (prima era «–»).
10. `navigator.wakeLock` presente: nessun errore in console entrando, mettendo in pausa, uscendo. Senza l'API (prova con `delete Navigator.prototype.wakeLock` in console prima di entrare in Live): nessun errore.
11. Console senza errori per tutto il percorso, fino alla schermata «Allenamento completato!».

## Da dichiarare «da provare su iPhone» in STATO.md
Schermo che resta davvero acceso (anche da app installata); riposo corretto dopo aver bloccato e sbloccato il telefono; bip a fine riposo con e senza tasto silenzioso.
