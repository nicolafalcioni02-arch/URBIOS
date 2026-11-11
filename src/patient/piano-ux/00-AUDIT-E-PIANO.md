# App paziente: audit UX/UI e piano (11/11/2026)

Documento per il proprietario. Gli agenti di codice NON leggono questo file: leggono `REGOLE.md`, `STATO.md` e il proprio `UX-0N-*.md`.
Riferimenti `file:riga` validi al commit `ff92428`. Provato in browser a 375×812 con `?prova`. Niente è stato provato su iPhone vero.

## A. Problemi, in ordine di gravità

| # | Problema | Dove | Perché pesa | Brief |
|---|---|---|---|---|
| A1 | **«Riprendi» su un allenamento iniziato ieri riparte da zero.** La Home dice «Allenamento iniziato / Riprendi», il dettaglio dice «0/14 · Inizia». Verificato in browser. | `ui/logic.js:62` (stato "iniziato" per 2 giorni) contro `ui/logic.js:25` (la chiave della seduta contiene la data di oggi) | Promessa falsa nella schermata principale: la ripresa non esiste. Va costruita, poi ha senso l'avviso di scadenza. | UX-03 |
| A2 | **L'RPE si chiede prima di fare la serie e si azzera al tocco di «Serie completata».** Chi lo sceglie durante il riposo lo assegna alla serie successiva. In più, sotto i 30 s di riposo uno schermo intero copre RPE, carico e note (con 35 s di recupero restano 5 s). | `ui/Live.jsx:96`, `:160`, `:193` | L'RPE guida il carico suggerito (`ui/logic.js:53`): dato sbagliato o assente = suggerimento sbagliato. | UX-01 |
| A3 | **I tempi contano i "tic", non l'orologio.** Se lo schermo si spegne o l'app va in secondo piano il riposo si ferma. Lo schermo non resta acceso. | `ui/Live.jsx:64-77` | In palestra il telefono si blocca dopo 30 s: il timer di riposo diventa inaffidabile. Comportamento noto dei browser, non provato su iPhone. | UX-01 |
| A4 | **Dieta: vale sempre il primo giorno.** «Prossimo pasto» in Home usa il giorno 0; e le kcal di «Oggi» cambiano se tocco un altro giorno (contano solo i pasti del giorno selezionato). | `ui/logic.js:35-41`, `ui/Nutrition.jsx:57`, `:61` | Nei giorni di riposo la Home propone il pasto sbagliato; il totale di oggi non è un totale. | UX-04 |
| A5 | **Blocco dopo 5 minuti in mezzo all'allenamento:** dopo la passphrase si torna alla Home, non all'esercizio (3 tocchi per rientrare). | `App.jsx:47`, `ui/Shell.jsx:17` | Con lo schermo sempre acceso (A3) capiterà più spesso. Il blocco in sé resta com'è (SEC-100). | UX-03 |
| A6 | **Live poco leggibile:** tre numeri senza etichetta (totale, serie in corso, n. serie); «RIPOSO 00:34» va su due righe e tocca il bordo; «Suggerito 70 kg · Usa» compare anche quando il carico è già 70 e non dice perché; «Salta» non dice che salta l'esercizio; si esce solo da Pausa → «Abbandona sessione» in rosso (ma i dati restano). «0 kg» per gli esercizi a corpo libero. | `ui/Live.jsx:147-151`, `:158`, `:190`, `:220`, `:183` | Mani sudate, un'occhiata: ogni ambiguità costa. | UX-02 |
| A7 | **Colori fuori sistema:** numeri degli esercizi in viola/rosa/turchese/giallo/verde; riquadri grigio-azzurro `#DADDE5`, `#F4F5F8`, `#F1F2F5` dentro il tema lilla. | `ui/TrainDetail.jsx:6`, `ui/Schede.jsx:10-11`, `ui/Nutrition.jsx:71`, `patient.css` (una quindicina di regole) | Contro «niente colori mischiati». | UX-05 |
| A8 | **Troppo lime nella stessa schermata:** Profilo ha 2 pulsanti lime + il blocco URBIOS lime; nel pasto ogni riga ha «Sostituisci» lime più il tasto di conferma. | `ui/Settings.jsx:27-40`, `ui/MealSheet.jsx:54` | Se tutto è primario, niente lo è. | UX-05 |
| A9 | **Profilo:** titolo «Impostazioni» nel tab «Profilo», freccia indietro inutile, pulsante del riassunto su due righe, nessuna conferma che resti dopo l'invio, blocco URBIOS a filo del menu. | `ui/Settings.jsx:18`, `:27`, `:36` | Piccoli, ma è la pagina dove si mandano i dati al professionista. | UX-05 |
| A10 | **Contrasto:** grigio `#6C727F` piccolo su lilla `#EFEAFF` ≈ 4,1:1 (stimato; soglia 4,5). | `.hm2-s`, `.hm2-day span` | Luce variabile in palestra. | UX-05 |
| A11 | **Dati di prova:** lo storico usa «Squat con bilanciere» ma l'esercizio si chiama «Squat bulgaro con bilanciere olimpico…»: il primo esercizio non ha storico. | `demo.js:7`, `:36`, `:42` | Impedisce di provare il confronto con l'ultima volta. | UX-01 |
| A12 | Icone Peso e Controllo quasi uguali (due quadrati arrotondati). | `ui/bits.jsx:9`, `:25` | Basso. | UX-05 |

Non toccati di proposito: anelli della Home (decorativi per tua scelta), tema scuro di Live e accesso, zone «colore in alto + foglio bianco».

## B. Funzioni da aggiungere

| Funzione | Beneficio | Dati esistono? | iPhone web | Sforzo | Dove |
|---|---|---|---|---|---|
| Timer sull'orologio reale | Il riposo resta giusto anche a schermo spento | sì | sì | S | UX-01 |
| Schermo sempre acceso in Live | Non si sblocca il telefono a ogni serie | n/a | Wake Lock: Safari 16.4+; da app installata funziona solo da iOS 18.4 (a memoria, **da provare**) | S | UX-01 |
| RPE dopo la serie, durante il riposo | Dato vero, suggerimenti migliori | sì | sì | S | UX-01 |
| Suono a fine recupero | Si sente senza guardare | n/a | Solo dopo un tocco, solo a schermo acceso; con il tasto silenzioso iOS lo zittisce (**da provare**). Vibrazione: no su iPhone | S | UX-01 (già c'è, lo rendo più robusto) |
| Confronto con l'ultima volta in Live | Data e carichi dell'ultima volta sotto gli occhi, senza etichette | sì (`log.hist`) | sì | S | UX-02 |
| Rientro in Live dopo il blocco | Passphrase e sei di nuovo sull'esercizio | sì | sì | S | UX-03 (**non provabile** con `?prova`) |
| Riassunto PDF a fine allenamento | Il rimando arriva nel momento giusto | sì | Web Share sì | S | UX-03 |
| Giorno della dieta di oggi | Home e totali coerenti | **In parte:** i giorni non hanno un giorno della settimana. Lo sceglie il paziente, l'app lo ricorda; se i titoli sono «Lunedì…» o i giorni sono 7 lo deduce | sì | M | UX-04 |
| Ripetizioni fatte davvero | Volume e PDF veri (oggi si assume la prescrizione) | no (oggi non si salvano) | sì | M | fuori piano: un controllo in più a ogni serie, valuta dopo le 3 tappe |
| **Funziona senza rete** | L'app si apre e funziona ovunque; la rete serve solo per ricevere i piani | n/a | sì (da provare: installata dalla schermata Home) | M | **UX-00, il primo** |
| Ripresa vera per 2 giorni + avviso di scadenza in Home | Si finisce domani l'allenamento interrotto oggi | sì (data della seduta) | sì | M | UX-03 |
| Notifiche | — | no | Solo con un server push = terza parte | — | **Scartata:** viola i vincoli |

Da chiedere al programma del medico (non in questo piano): giorno della settimana per ogni giorno di dieta; esercizi a tempo (oggi «Plank 3x1» con la durata nelle note).

## C. Piano: una base e 3 tappe, 6 compiti

Un compito = una chat. Ordine obbligato: ogni compito parte dal lavoro del precedente.

| Tappa | Compito | Cosa cambia per il paziente | File |
|---|---|---|---|
| 0. Base | **UX-00** | L'app funziona senza rete | `vite.patient.config.js`, `src/patient/main.jsx`, `src/patient/sw.js` (nuovo), `ui/Home.jsx` |
| 1. Live affidabile | **UX-01** | Timer veri, schermo acceso, RPE dopo la serie | `ui/Live.jsx`, `demo.js`, `patient.css` |
| | **UX-02** | Riposo su una riga, ultima volta sotto gli occhi, uscita non rossa: nessuna scritta in più | `ui/Live.jsx`, `patient.css` |
| 2. Continuità | **UX-03** | Ripresa per 2 giorni con avviso, rientro dopo il blocco, riassunto a fine seduta | `ui/logic.js`, `ui/Live.jsx`, `ui/TrainDetail.jsx`, `ui/Home.jsx`, `ui/Shell.jsx`, `App.jsx`, `patient.css` |
| | **UX-04** | Dieta sul giorno di oggi | `ui/logic.js`, `runtime.js` (una riga), `ui/Nutrition.jsx`, `ui/Progress.jsx` |
| 3. Coerenza | **UX-05** | Un solo sistema di colori, Profilo in ordine | `ui/TrainDetail.jsx`, `ui/Schede.jsx`, `ui/Nutrition.jsx`, `ui/Settings.jsx`, `ui/bits.jsx`, `patient.css` |

### Come lanciare ogni chat
Primo messaggio, cambiando solo il numero:

> Leggi `src/patient/piano-ux/REGOLE.md`, poi `src/patient/piano-ux/STATO.md`, poi `src/patient/piano-ux/UX-01-live-tempi-rpe.md`. Esegui quel compito dall'inizio alla fine seguendo le regole.

File dei compiti: `UX-00-offline.md`, `UX-01-live-tempi-rpe.md`, `UX-02-live-leggibile.md`, `UX-03-continuita.md`, `UX-04-dieta-oggi.md`, `UX-05-coerenza-profilo.md`.

### Scelte
1. **Allenamento lasciato a metà (UX-03) — deciso da te:** riprendibile davvero per 2 giorni. Limiti accettati: la seduta ripresa risulta «fatta» alla data d'inizio e «Costanza» conta quel giorno, non quello della ripresa.

Le tre che seguono le ho prese io: cambiale prima di lanciare il compito indicato.
2. **Conto alla rovescia a schermo intero (UX-01):** dagli ultimi 30 s agli ultimi 10 s, per lasciare il tempo di dare l'RPE.
3. **Commit:** ogni agente fa un solo commit locale a fine compito (`UX-0N: …`), mai push. Se preferisci committare tu, togli il punto 8.4 da `REGOLE.md`.
4. **Giorno dieta (UX-04):** toccare un giorno nella tab Dieta = «oggi è questo giorno», senza scritte nuove.
5. **Build di prova (UX-00):** per provare il funzionamento senza rete l'agente costruisce l'app in una cartella temporanea fuori dal repository; `dist-patient/` non viene toccata.
6. **Avviso «Non riesco a collegarmi» (UX-00):** tolto dalla Home, perché senza rete resterebbe fisso.

## D. Principi che valgono per ogni scelta (correzione del proprietario, 11/11/2026)
1. **Meno scritte possibili.** Un'informazione si dà con posizione, forma o colore prima che con una parola. Nessuna etichetta, spiegazione o saluto in più.
2. **Tutto funziona senza rete.** La rete serve solo per ricevere i piani. Nessuna funzione nuova può dipenderne.
3. **Gli anelli della Home sono decorativi e restano così:** renderli veri imporrebbe una legenda.
4. **Tono serio e professionale,** come l'app Fitness di Apple: niente feste, premi, frasi d'incoraggiamento nuove, effetti.
5. Le tappe «semplice per tutti / viva / voce» proposte in precedenza sono **ritirate**: andavano contro i punti 1, 3 e 4.
