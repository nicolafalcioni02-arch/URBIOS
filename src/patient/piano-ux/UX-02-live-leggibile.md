# UX-02 — Live: più chiaro con meno scritte

Prima leggi `REGOLE.md` e `STATO.md`. Richiede UX-00 e UX-01 «fatto»: leggi nel blocco di UX-01 i nomi nuovi introdotti in `Live.jsx`.

## Obiettivo
Togliere le ambiguità dell'allenamento guidato **senza aggiungere testo**: dove possibile si toglie una parola, non se ne mette una. Il bilancio finale delle scritte a schermo deve essere uguale o minore di oggi.

## File che puoi toccare
- `src/patient/ui/Live.jsx`
- `src/patient/patient.css` (solo in fondo)
- chiusura: `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `src/patient/ui/logic.js` (`suggestLoad`, `fmtKg`, `fmtDay`, `ymd`).

## Non toccare
- Il tema scuro di Live, i colori, l'onda bianca, la struttura «parte scura in alto + foglio bianco». **Il proprietario non vuole che Live cambi aspetto.**
- La logica di tempi, schermo acceso e RPE fatta da UX-01.
- La schermata «Allenamento completato!» (la tocca UX-03).
- I pulsanti «Indietro» e «Salta»: restano come sono.

## Cosa fare

### 1. Il riposo su una riga, senza la parola
`Live.jsx:122`: in riposo il numero centrale è `RIPOSO 00:34`, che va su due righe e tocca il bordo dell'onda. Mostra **solo** `mmss(rest)`: il colore viola (classe `is-rest`, già presente) dice che è il riposo, e sotto c'è già il tasto «Salta riposo». Una parola in meno, numero su una riga.
Dopo la modifica controlla che i tre numeri della riga (`.pt-grid`) siano allineati e che niente tocchi l'onda o i tab; in `patient.css` tre regole spostano in verticale i numeri laterali (`.pt-grid > div:not(.pt-big)` con `top: 7px`, `-23px`, `-16px`): se serve, correggi con una regola nuova in fondo. Nessuna etichetta sotto i numeri.

### 2. L'ultima volta sotto gli occhi, il suggerimento solo se serve
Tab «Oggi» (`Live.jsx:156-163`):
- **Riga dell'ultima volta**, in cima, se esiste una seduta passata di quell'esercizio con data diversa da oggi (`rt.log.get().hist[cur.name]`, escludi `ymd()`, prendi la più recente). Una riga sola, **senza etichetta**: la data fa da etichetta. Formato: `05/11 · 3 × 70 kg · RPE 8`. Per raggruppare le serie usa `groupSets`, già in testa al file; se i gruppi sono più di due mostra i primi due e «…». Aspetto: testo semplice, non un riquadro; data in grigio `#6C727F`, il resto in `#0B0C0E`, 15 px, peso 700 per i carichi. Senza storico: niente riga.
- **Riquadro «Suggerito»** (`.pt-sug`): mostralo solo se `sug && sug.kg !== kg`. Oggi compare anche quando il carico è già quello suggerito: un riquadro e un tasto che non fanno niente. Nessun testo aggiunto al riquadro.
- Ordine nella tab: ultima volta → Suggerito (se c'è) → RPE.

### 3. Corpo libero
Selettore del carico (`<div className="pt-step" aria-label="Carico">`, `Live.jsx:181-185`): se il carico prescritto è vuoto (`cur.kg0 === 0`) e `kg === 0`, al posto di «0 kg» scrivi «Corpo libero». I tasti − e + restano attivi.

### 4. Uscire non è «abbandonare»
Finestra di pausa (`Live.jsx:215-223`): «Abbandona sessione» è rosso ma non cancella niente (le serie restano salvate e si riprende). Diventa «Esci», con classe `pt-btn ghost` al posto di `pt-btn danger`. Nessuna frase di spiegazione. Controlla che su fondo scuro il pulsante `ghost` si legga: se no, correggi con una regola `.pt-pause-c .pt-btn.ghost` in fondo al CSS.

## Fatto quando (`?prova`, 375×812)
1. Riposo: al centro `00:34` viola su una riga, senza la parola «RIPOSO»; non tocca l'onda; i tre numeri sono allineati. Fase di lavoro: invariata.
2. Primo esercizio: in cima alla tab «Oggi» una riga con data e carichi, senza etichetta. Il riquadro «Suggerito» c'è solo se il suo valore è diverso dal carico mostrato; toccando «Usa» sparisce; cambiando il carico con + riappare.
3. `?prova&vuoto`: nessuna riga dell'ultima volta, nessun errore.
4. Esercizio «Piegamenti» (giorno «Full body»): il carico dice «Corpo libero»; toccando + diventa «2,5 kg».
5. Pausa: «Riprendi» lime, «Esci» leggibile e non rosso; toccandolo esco e le serie fatte sono ancora segnate nel dettaglio della scheda.
6. `?prova&lungo`: nome esercizio e riga dell'ultima volta non escono dai bordi.
7. Conta le scritte visibili in fase di lavoro, riposo e pausa prima e dopo (annotalo in STATO): non devono essere aumentate.
8. Screenshot di: lavoro, riposo, pausa. Console senza errori.
