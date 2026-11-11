# UX-03 — Continuità: ripresa per 2 giorni, rientro dopo il blocco, riassunto a fine seduta

Prima leggi `REGOLE.md` e `STATO.md`. Richiede UX-00, UX-01 e UX-02 «fatto»: leggi nei loro blocchi di STATO i nomi nuovi introdotti in `Live.jsx`.

## Obiettivo
Tre strappi nel percorso «mi alleno → ho finito»: la Home promette una ripresa che oggi non esiste; dopo il blocco per inattività si perde il posto; il riassunto per il professionista è nascosto nel Profilo.

## File che puoi toccare
- `src/patient/ui/logic.js` (solo quanto scritto ai punti 1.1 e 1.4)
- `src/patient/ui/TrainDetail.jsx` (solo la riga della chiave, punto 1.3)
- `src/patient/ui/Live.jsx` (solo: la chiave della seduta, punto 1.2; la schermata di fine allenamento, punti 1.4 e 4)
- `src/patient/ui/Home.jsx`
- `src/patient/ui/Shell.jsx`
- `src/patient/App.jsx` (solo quanto scritto al punto 3)
- `src/patient/patient.css` (solo in fondo)
- chiusura: `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `src/patient/ui/summaryPdf.js` righe 231-241, `src/patient/ui/Settings.jsx` riga 14, `docs/sicurezza/requisiti.md` riga di SEC-100.

## Non toccare
`IDLE_MS`, `useIdleLock`, la funzione `lock` e tutto ciò che riguarda cassaforte e chiavi in `App.jsx`. In `Live.jsx`: tempi, schermo acceso, RPE, etichette (UX-01 e UX-02). In `logic.js`: `dayStatus` resta identica, compresa la finestra di 2 giorni.

## Cosa fare

### 1. Un allenamento iniziato si riprende davvero per 2 giorni
**Com'è.** Ogni seduta sta in `log.sessions` sotto la chiave `docId|settimana|giorno|data` (`logic.js:25`). `dayStatus` (`logic.js:59-72`) dice «iniziato» (`state: 'part'`, con `date` = data di quella seduta) se c'è una seduta incompleta di oggi, ieri o l'altro ieri. Ma chi legge e scrive le serie usa sempre la data di **oggi**: `Live.jsx:37` (`const key = sessionKey(id, w, d)`) e `TrainDetail.jsx:40`. Risultato verificato: con una seduta lasciata a metà ieri la Home dice «Allenamento iniziato / Riprendi», il dettaglio dice «0/14 · Inizia» e Live riparte da capo.

**Regola nuova.** Se `dayStatus` dice `part`, la seduta da usare è quella con la data `st.date`; altrimenti quella di oggi. I soli tre punti che usano la chiave sono `Live.jsx:37`, `Live.jsx:106` e `TrainDetail.jsx:40`.

1.1 **`logic.js`**: aggiungi una funzione pura, con un commento di due righe:
`export const sessionDate = (log, docId, w, d, day) => { const st = dayStatus(log, docId, w, d, day); return st.state === 'part' ? st.date : ymd(); };`
Mettila dopo `dayStatus` (che deve essere già definita).

1.2 **`Live.jsx`**: la data della seduta si calcola **una volta sola** all'apertura e non cambia più finché Live resta aperto (dopo l'ultima serie lo stato diventa «fatto» e `sessionDate` restituirebbe oggi: la chiave non deve saltare a metà). Per esempio `const sDate = useRef(sessionDate(rt.log.get(), id, w, d, day)).current;` e `const key = sessionKey(id, w, d, sDate);`. Attenzione all'ordine: `day` è definito prima di `list` e `key`; gli hook restano prima del `return` anticipato (`if (!list.length) return null`).
- Le voci dello **storico per esercizio** (`l.hist[nome]`, dentro `complete()`) continuano a usare la data di **oggi** (`ymd()`): è il giorno in cui la serie è stata fatta davvero. Lo stesso vale per il riferimento all'ultima serie introdotto da UX-01 per l'RPE: sessione sotto `key`, storico sotto la data di oggi. Controlla che sia così e non cambiarlo.
- La logica `start` (riprende da `pos` e dalle serie già fatte) funziona da sola con la chiave giusta.

1.3 **`TrainDetail.jsx:40`**: `key = sessionKey(id, w, d)` diventa `key = sessionKey(id, w, d, sessionDate(log, id, w, d, day))` (aggiungi `sessionDate` all'import). Qui si ricalcola a ogni disegno: va bene. Così il conteggio «5/14», i pallini delle serie e il tasto «Riprendi allenamento» riflettono la seduta di ieri.

1.4 **Riepilogo di fine allenamento** (`logic.js:84-95` `workoutSummary` e `Live.jsx:106`): oggi cerca la seduta alla data di oggi, quindi dopo una ripresa darebbe 0 kg.
- In `Live.jsx:106` passa la data della seduta come sesto argomento: `workoutSummary(rt.log.get(), id, w, d, list, sDate)`.
- In `workoutSummary` il calcolo dei **record** confronta «oggi» con il passato usando `date`. Dopo una ripresa le serie di questa seduta stanno nello storico in due giorni (quello d'inizio e oggi). Correggi: le serie «di questa seduta» sono quelle delle voci di storico con data `date` **oppure** `ymd()`; il «passato» sono tutte le altre. Il resto della funzione (`vol`, `prevVol`, `sets`) funziona già con `date`.

1.5 **La Home dice quanto tempo resta** (`Home.jsx:51`). Quando `hero.st.state === 'part'` e `hero.st.date` non è oggi, la riga grigia sotto il titolo (`<span className="hm2-s">`), al posto di «4 esercizi, circa 18 min», dice:
- seduta di ieri: «Iniziato ieri · scade domani»
- seduta dell'altro ieri: «Iniziato l'altro ieri · scade oggi»
Per i giorni di distanza usa `daysTo` (già importata in Home da `./Tools.jsx`: restituisce −1 per ieri, −2 per l'altro ieri). Una riga sola, che **sostituisce** quella esistente (nessuna riga in più). Negli altri casi la riga resta com'è. La Home non deve scorrere.

**Limiti accettati (scrivili in STATO, non correggerli):** una seduta ripresa e finita risulta «fatta» alla data in cui era stata iniziata; il riquadro «Costanza» conta il giorno d'inizio, non quello della ripresa.

### 2. «Riprendi» porta dritto all'esercizio
`Home.jsx:52`: il pulsante chiama sempre `onNav({ name: 'train', … })` (dettaglio scheda, poi un secondo tocco).
- Se `hero.st.state === 'part'` → `onNav({ name: 'live', id: hero.meta.docId, w: hero.w, d: hero.di })`.
- Negli altri casi resta com'è (da «Inizia» si passa dal dettaglio: il paziente vuole vedere gli esercizi prima di partire).
`Shell.jsx` gestisce già `sub.name === 'live'`: verifica solo che l'uscita da Live riporti alla Home.

### 3. Dopo il blocco si rientra nell'esercizio
Com'è: dopo 5 minuti senza tocchi `App.jsx` smonta `Shell` e chiede la passphrase; al rientro `Shell` riparte da Home (`Shell.jsx:17`).

Cosa fare, senza cambiare nulla del blocco:
- In `App.jsx`: `const resume = useRef(null);`. Passa a `Shell` (solo nel ramo `stage === 'main'`, riga 68) due prop: `initial={resume.current}` e `onWhere={(x) => { resume.current = x; }}`.
- In `Shell.jsx`: lo stato `sub` parte da `initial` se: esiste, ha `name === 'live'`, è stato scritto da meno di 30 minuti, e `rt.docs.get(initial.id)` esiste. Altrimenti `null`.
- In `Shell.jsx`: un `useEffect` su `sub` chiama `onWhere` con `{ name: 'live', id, w, d, at: Date.now() }` quando `sub` è Live, con `null` in tutti gli altri casi. **Mettilo prima** del `return` anticipato di riga 20 (`if (sub && sub.name === 'live') return <Live … />`), altrimenti l'ordine degli hook cambia. Nessuna funzione di pulizia nell'effetto: quando il blocco smonta `Shell`, il puntatore deve restare.
- In `App.jsx` azzera `resume.current = null` in `onForget` (riga 68) e in «Cancella e ricomincia» (riga 65).
- Il puntatore contiene solo l'identificativo del documento e due indici, vive solo in memoria (un `useRef`), non va mai salvato da nessuna parte. Scrivilo in un commento di una riga.
- Live, rimontato, riprende da solo dall'esercizio giusto (legge `pos` e `secs` dal diario).

Questo punto **non si può provare con `?prova`** (la modalità prova non ha passphrase). Controlla per lettura del codice che: in modalità prova (`stage === 'demo'`, riga 57) `Shell` funzioni senza le due prop; `onWhere` assente non dia errore. Dichiaralo «da provare» in STATO.

### 4. Riassunto a fine allenamento
Schermata «Allenamento completato!» (`Live.jsx`, blocco `if (fin)`): sotto «Torna alla dashboard» aggiungi un pulsante **secondario** «Invia il riassunto».
- Chiama `shareSummary(rt)` (import da `./summaryPdf.js`) con la stessa gestione di `Settings.jsx:14`: mentre lavora il testo è «Creo il PDF…» e il pulsante è disabilitato. `shareSummary` restituisce `'saved'`, `'shared'` o `'cancel'`: con `'saved'` il testo diventa «PDF salvato nei file», con `'shared'` «Riassunto inviato», con `'cancel'` torna al testo iniziale; in caso di errore «Non sono riuscito a creare il PDF». Qui il messaggio **resta** finché non si lascia la schermata (niente `setTimeout` che lo cancella).
- Serve stato React: dichiara gli `useState` in alto con gli altri (mai dentro `if (fin)`).
- Aspetto: solo testo, senza fondo, bianco al 70% di opacità, 15 px peso 700, area di tocco alta almeno 44 px, a 12 px dal pulsante lime. Non deve competere con «Torna alla dashboard».
- Se con l'aggiunta la schermata supera l'altezza di 812 px, riduci gli spazi verticali esistenti con una regola in fondo al CSS: non deve comparire scorrimento e niente va tagliato.

## Fatto quando (`?prova`, 375×812)
Per preparare una seduta lasciata a metà `N` giorni fa (2 serie del primo esercizio), in console:
`const mk = (n) => { const t = new Date(Date.now() - n * 86400000), y = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); __demoLog.sessions['t1|0|0|' + y] = { sets: { 0: [{ kg: 70 }, { kg: 70 }] }, started: Date.now(), pos: { ex: 0 }, secs: 300 }; __demoChange(); return y; };`

1. `mk(1)`: la Home dice «Allenamento iniziato», sotto «Iniziato ieri · scade domani», pulsante «Riprendi». Niente scorre.
2. Tocco «Riprendi»: sono **subito** in Live, primo esercizio, **terza** serie (2 pallini pieni), totale che parte da 05:00.
3. Completo una serie: in `__demoLog.sessions` la chiave con la data di **ieri** ha 3 serie nell'esercizio 0 e **non** esiste una chiave `t1|0|0|<oggi>`; in `__demoLog.hist[<nome esercizio>]` la voce di **oggi** ha 1 serie.
4. Pausa → «Esci» → tab Schede → «La tua scheda»: il giorno «Lower body» mostra «3/14» e il tasto «Riprendi allenamento».
5. Ricarico, `mk(1)`, «Riprendi», porto a termine tutto l'allenamento (completa tutte le serie; per fare prima usa «Salta riposo»): la schermata finale mostra kg sollevati **maggiori di 0** e il numero di serie giusto (14); tornato in Home l'allenamento risulta fatto e il prossimo è «Upper body».
6. Ricarico, `mk(2)`: «Iniziato l'altro ieri · scade oggi». Ricarico, `mk(3)`: la Home dice «Prossimo allenamento / Inizia» e il dettaglio «0/14».
7. Ricarico, nessuna preparazione: Home → «Inizia» → dettaglio → «Inizia allenamento guidato» funziona come prima; completo 2 serie, esco: Home «Allenamento iniziato» con la riga normale («4 esercizi, circa 18 min») e «Riprendi».
8. Uscendo da Live aperto dalla Home torno alla Home, non al dettaglio.
9. Schermata finale: vedo il pulsante secondario; toccandolo passa da «Creo il PDF…» a un messaggio che resta; nessun errore in console (in browser desktop la condivisione può non esistere: va bene il salvataggio del file). Sta in 812 px senza scorrere; con `?prova&lungo` nessun testo fuori dai bordi.
10. `npm run test:connect` passa.
11. Screenshot: Home con la riga «Iniziato ieri…», dettaglio con «3/14», schermata finale.

## Da dichiarare «da provare» in STATO.md
Rientro in Live dopo blocco e passphrase (serve un collegamento vero); foglio di condivisione di iPhone dalla schermata finale; allenamento a cavallo della mezzanotte.

## Nota per il README
Nel paragrafo «Stato degli allenamenti» aggiungi: un allenamento iniziato si può riprendere per 2 giorni (`logic.js: sessionDate`), la Home avvisa quando sta per scadere, «Riprendi» apre direttamente l'allenamento guidato.
