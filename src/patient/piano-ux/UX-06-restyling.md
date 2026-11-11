# UX-06 — Restyling: colore, movimento, identità, meno testo

Brief per un agente di codice (Sonnet) che lavora da solo. Nasce dalla revisione da direttore artistico delle 49 schermate in `screens-paziente/NN.jpg` (radice del repo): quelle immagini sono il «prima». Questo file dice **cosa** cambiare e **come**, tappa per tappa. Non contiene il codice finito: scrivilo tu, nello stile dei file che tocchi.

Richiede UX-00…UX-05 «fatto» in `STATO.md`.

---

## 0. Come lavorare

### 0.1 Ordine di lettura
1. `piano-ux/REGOLE.md` (valgono tutte, **tranne le deroghe del punto 0.3**).
2. `piano-ux/STATO.md`.
3. Questo file: sezioni 0, 1, 2 per intero; poi **solo la tappa che stai eseguendo**.
4. `src/patient/README.md`.
5. I file elencati nella tappa.

### 0.2 Tappe e commit
Il lavoro è diviso in 9 tappe (sezione 3). **Una tappa = una sessione = un commit** `UX-06.N: <cosa cambia per il paziente>`. Esegui le tappe in ordine: la 1 crea i mattoni che le altre usano. Dopo ogni tappa fai la chiusura di `REGOLE.md` §8 (README, MIGLIORIE, blocco in `STATO.md` intitolato `## UX-06.N`).

`git status` all'inizio: sono ammessi, e **non vanno mai aggiunti al commit**, `CLAUDE.md` modificato, `docs/design/`, `screens-paziente/`. Qualsiasi altra modifica pendente: fermati.

### 0.3 Deroghe a `REGOLE.md` (decise dal proprietario l'11/11/2026)
Il proprietario ora vuole un'app **più colorata, più dinamica, con identità propria** (non un clone di Apple Fitness), sempre con **meno testo possibile** e tono serio. Quindi, solo per UX-06:

| Regola vecchia | Regola nuova |
|---|---|
| §4b «Colori ammessi, e solo questi» | Vale la palette della sezione 1.1 (aggiunge corallo, notte, rosso; cambia i ruoli). |
| §4b «Un solo elemento lime pieno per schermata» | «Un solo **pulsante** lime pieno per schermata». Il lime può comparire anche come segno di «fatto» (spunte, pallini, celle). |
| §4 «Niente animazioni decorative nuove» | Ammesse **solo** quelle descritte qui (sezione 1.4 e tappe). Niente altro. |
| §4 «Gli anelli della Home sono decorativi: non toccarli» | Gli anelli vengono **sostituiti** dal segno del logo (tappa 3). Resta decorativo: nessun dato, nessuna legenda. |
| §5 «Non modificare né cancellare regole CSS esistenti» | Invariata: si aggiunge in fondo a `patient.css`. **Eccezione:** puoi cancellare una regola solo se la classe non esiste più in nessun `.jsx` (verifica con grep) e lo annoti in `STATO.md`. |
| §3 «Nessun refactor» | Ammessi solo i componenti condivisi della sezione 2. |

Restano **intoccabili**: niente feste, coriandoli, premi, frasi motivazionali nuove; niente emoji; icone solo SVG a tratto; tutto offline; nessuna dipendenza; nessun dato fuori da `rt.log`; nessun `innerHTML`; niente `src/connect/`, `storage/`, blocco per inattività, CSP.

### 0.4 Regola del testo (vale per ogni riga che scrivi)
- Non aggiungere **nessuna** parola che questo file non riporta tra «virgolette».
- Quando togli un'etichetta visibile da un controllo, **lascia sempre** un `aria-label` con il testo vecchio.
- Numeri italiani: virgola decimale (`fmtKg` o `.replace('.', ',')`), mai il punto.
- Pulsanti: minuscolo con iniziale maiuscola («Inizia», non «INIZIA»).

### 0.5 Verifica (in più rispetto a `REGOLE.md` §6)
- Per ogni tappa: `?prova`, `?prova&lungo`, `?prova&vuoto` a 375×812 **e** a 360×640 (telefono piccolo): niente testo tagliato, niente sovrapposizioni, nessuno scorrimento dove la tappa dice «senza scorrere».
- Prova con «riduci animazioni» attivo (emulazione del browser, o temporaneamente da console `matchMedia`): l'app deve funzionare identica, solo ferma.
- Contrasto: testo normale ≥ 4,5:1, testo ≥ 18 px bold e icone ≥ 3:1. Le coppie della sezione 1.1 sono già verificate: non inventarne altre.
- Bersagli di tocco ≥ 44×44 px (anche le nuove icone-pulsante: se il disegno è 36 px, allarga l'area con padding).

---

## 1. Il sistema (riferimento per tutte le tappe)

### 1.1 Colori e ruoli
Definisci le variabili **una volta** (tappa 1) su `:root`, con nomi nuovi che non toccano quelle esistenti:

| Variabile | Valore | Ruolo | Testo sopra |
|---|---|---|---|
| `--u-lime` | `#D8FD38` | **Fai / fatto**: l'unico pulsante principale, spunte, serie completate | `#0B0C0E` |
| `--u-lime-ink` | `#B4E600` | Lime per segni piccoli su bianco (pallini, celle, linee) | — |
| `--u-viola` | `#6B3DFF` | **Allenamento, selezione, tempo**: segmenti attivi, tessere attive, riposo, sezione Schede | `#FFFFFF` (5,6:1) |
| `--u-viola-d` | `#4E28D9` | Viola premuto | `#FFFFFF` |
| `--u-corallo` | `#FF7A59` | **Calorie / alimentazione**: anello e card kcal, barre kcal, grassi, sezione Dieta | `#0B0C0E` (7,6:1). **Mai testo bianco.** |
| `--u-corallo-l` | `#FFD9CF` | Unica tinta chiara del corallo (binario delle barre) | `#0B0C0E` |
| `--u-corallo-ink` | `#C8452A` | Corallo per **testo** su bianco/lilla (4,8:1) | — |
| `--u-notte` | `#160C33` | Superfici scure: accesso, Live, card «giorno», dock Home/Profilo | `#FFFFFF` |
| `--u-notte-2` | `#241552` | Riquadro rialzato su notte | `#FFFFFF` |
| `--u-lilla` | `#EFEAFF` | Sfondo chiaro | `#0B0C0E` |
| `--u-lilla-2` | `#DCD2FF` | Riempimento spento, binari, disattivato su chiaro | `#0B0C0E` |
| `--u-foglio` | `#F3EEFF` | Fogli e riquadri | `#0B0C0E` |
| `--u-ink` | `#0B0C0E` | Testo | — |
| `--u-grigio` | `#6C727F` | Testo secondario (solo ≥ 13 px) | — |
| `--u-grigio-d` | `#3A3F4B` | Testo secondario su lilla | — |
| `--u-rosso` | `#D92D20` | **Solo** «Elimina» ed errori su chiaro | — |

Regole d'uso:
1. **Lime = fai/fatto.** Un solo pulsante lime pieno per schermata. Mai lime per «selezionato».
2. **Viola = selezionato / allenamento.** Ogni stato «attivo» di segmenti, tessere, chip è viola con testo bianco.
3. **Corallo = calorie.** Compare solo dove c'è un numero di kcal o i grassi nelle macro.
4. **Niente altri verdi.** Spariscono `#7FA800`, `#3F5400`, `#8FB800`, `#5E8A00`, `#D5E98A`, `#F1F7C9`, `#E4F99A`, `#D6F46A`, `#6C7A00`. Dove servono più toni in un grafico: lime-ink, viola, corallo, ink, lilla-2 (in quest'ordine).
5. Il lime non si sfuma mai. Il corallo ha una sola tinta chiara (`--u-corallo-l`).
6. Pulsante **disattivato**: mai un colore sbiadito con `opacity`. Su chiaro: fondo `--u-lilla-2`, testo `--u-grigio`. Su scuro: fondo `rgba(255,255,255,.08)`, testo `rgba(255,255,255,.4)`.

### 1.2 Forme
- Raggi invariati (22–32 px, pillole). Pulsante principale: alto 56 px (64 px in Live), largo tutta la riga.
- **Onda**: il bordo ondulato di `TrainDetail` (`.pt-td-wave`) e di Live (`.pt-sw`) è la firma dell'app. Si estende a Dieta e Schede (tappa 2).
- **Segno del logo** (`UrbiosLogo`): usato grande come decorazione in Home (tappa 3) e come animazione d'ingresso nel Benvenuto (tappa 9). Non usarlo altrove come ornamento: via il logo dalle intestazioni di Dieta, Schede, dettaglio scheda.

### 1.3 Tipografia
- Nessuna sillabazione: `hyphens: none` ovunque (oggi una regola mette `hyphens: auto` su titoli e ingredienti e produce «olim-pico», «Mir-tilli»).
- Numeri che cambiano: `font-variant-numeric: tabular-nums`.
- Scala: titolo schermata 28/800 · titolo card 20/800 · testo 16/600 · secondario 13/600 · numero-eroe 56–88/800.

### 1.4 Movimento (elenco chiuso)
Curva standard `cubic-bezier(.2,.8,.2,1)`. Tutto dentro `@media (prefers-reduced-motion: no-preference)` oppure annullato in un unico blocco finale `@media (prefers-reduced-motion: reduce)`.

| Nome | Dove | Cosa | Valori |
|---|---|---|---|
| Pressione | ogni `button` | si rimpicciolisce mentre è premuto | `scale: .97` (proprietà `scale`, **non** `transform`, così non annulla i transform esistenti), transizione 90 ms |
| Capsula del dock | dock | il fondo attivo scorre da una tab all'altra e cambia colore | 280 ms, curva standard |
| Conteggio | kcal, statistiche | il numero sale da 0 al valore | 500 ms, ease-out cubico (come `Count` in `Schede.jsx`) |
| Riempimento | anelli, barre | da 0 al valore al primo disegno | 600 ms `cubic-bezier(.3,1,.4,1)` |
| Foglio | tutti i fogli dal basso | entra dal basso; si trascina giù per chiudere | ingresso 260 ms; rilascio 220 ms |
| Segno Home | Home | il segno del logo ruota lentissimo; al tocco fa uno scatto | 1 giro / 90 s lineare; scatto +45° in 600 ms |
| Metronomo | Live, barra tempo | un cursore scorre sui 4 segmenti al ritmo prescritto | durata = somma dei secondi, lineare, infinito |
| Livello | Live, riposo | il viola scende come acqua mentre il riposo passa; l'onda oscilla | altezza: transizione 1 s lineare; onda 6 s |
| Colpo | Live, serie fatta | il pallino della serie scatta, velo lime sull'intestazione | pallino 250 ms; velo 0→.18→0 in 220 ms |
| Ingresso logo | Benvenuto | il logo entra ruotando e si ferma | 700 ms, una volta |
| Scossa | Passphrase errata | il campo oscilla | 300 ms, ±6 px, 3 oscillazioni |

Trappole note (`REGOLE.md` §5): `animation-fill-mode: both` rompe `position: fixed` nei figli; un'animazione su `transform` annulla il `transform` dichiarato → usa `scale`/`rotate`/`translate` come proprietà separate per le animazioni nuove.

---

## 2. Mattoni condivisi (li crea la tappa 1, li usano le altre)

Tutti in `ui/bits.jsx`, salvo diversa indicazione. Stile del file: funzioni freccia, righe dense, commento breve in italiano.

### 2.1 Icone nuove (aggiungi a `PATHS`, stesso tratto 1.6)
| Nome | Contenuto |
|---|---|
| `clock` | `<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>` |
| `archive` | `<><rect x="4" y="5" width="16" height="4" rx="1.5" /><path d="M6 9v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9M10 13h4" /></>` |
| `trash` | `<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />` |
| `send` | `<path d="M12 19V5M6 11l6-6 6 6" />` |
| `share` | `<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6" />` |
| `link` | `<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />` |
| `eye` | `<><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.6" /></>` |
| `eyeoff` | `<path d="M4 4l16 16M10 6.2A8.6 8.6 0 0 1 12 6c5 0 8 6 8 6a13 13 0 0 1-2.4 3M6.5 8.5A13 13 0 0 0 4 12s3 6 8 6c1 0 2-.2 2.8-.6M10 10a3 3 0 0 0 4 4" />` |
| `phone` | `<><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></>` |
| `warn` | `<path d="M12 4 3 19h18zM12 10v4M12 16.5h.01" />` |
| `qr` | `<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6h-4M14 20h.01" /></>` |
| `down` | `<path d="M12 5v14M6 13l6 6 6-6" />` (freccia giù; per la freccia su riusa `send`) |
| `chev` | `<path d="m9 5 7 7-7 7" />` (freccia a destra: sostituisce i `back` ruotati **solo** nel codice nuovo) |

Guarda ogni icona nuova a 20 e 22 px nel browser: se un disegno è sbilanciato, ritocca le coordinate restando sullo stesso soggetto.

### 2.2 `useDragClose(onClose)` + `Sheet`
- **`useDragClose(onClose)`** restituisce `{ ref, grab }`: `ref` va sull'elemento-foglio, `grab` (oggetto di gestori `onPointerDown/Move/Up/Cancel`) va **sull'intestazione del foglio**, non sul corpo che scorre.
  - `pointerdown`: memorizza `y` e tempo, `setPointerCapture`.
  - `pointermove`: `dy = max(0, y − y0)`; scrivi direttamente `el.style.translate = '0 ' + dy + 'px'` e `el.style.transition = 'none'` (niente stato React: deve essere fluido).
  - `pointerup`: se `dy > 90` **oppure** velocità > 0,5 px/ms → `transition: translate 180ms ease-in`, `translate: 0 100%`, poi `onClose()` a fine transizione (con timeout di sicurezza 220 ms). Altrimenti torna a `0 0` in 220 ms con la curva standard.
  - Se il tocco parte su un `button` dentro l'intestazione (la X), non iniziare il trascinamento.
- **`Sheet`**: `({ title, extra, label, onClose, children })` → rende **lo stesso markup di oggi** (`div.pt-ov[role=dialog][aria-modal][aria-label={label || title}]` > `div.pt-ov-back` + `section.pt-dsheet` > `header` con `<i className="pt-grab" />`, `<b>{title}</b>`, `{extra}`, pulsante `.pt-round` «Chiudi»). Così il CSS esistente continua a valere.
  - `.pt-grab`: 36×4 px, raggio 2, `--u-lilla-2`, centrato, 8 px sopra il titolo.
- Sostituisci con `Sheet` le quattro copie dello stesso markup: `Shell` in `Tools.jsx`, `MealSheet`, `ExtraSheet`, `WeightSheet` in `MealSheet.jsx`, e il portale di `Clamp.jsx`. Comportamento identico a prima, più maniglia e trascinamento.
- Fogli «a lista» (`.pt-lst-ov` > `.pt-lst` in `Nutrition.jsx`, `Schede.jsx`, `Live.jsx`): non cambiare markup; applica `useDragClose` (`ref` su `.pt-lst`, `grab` su `.pt-lst-h`) e aggiungi `<i className="pt-grab" />` in testa a `.pt-lst-h`.

### 2.3 `useHold(fn)` + `Step`
- **`useHold(fn)`** restituisce i gestori per un pulsante «±»: al `pointerdown` chiama `fn(1)` subito; dopo 400 ms ripete ogni 90 ms; dopo 20 ripetizioni chiama `fn(5)` (passo ×5); si ferma a `pointerup/leave/cancel`. Tieni anche `onClick` **solo** per la tastiera (`e.detail === 0`), così un tocco non conta doppio.
- **`Step`**: `({ value, onChange, step, min, max, fmt, unit, text, dark, label })` → rende il markup esistente `div.pt-step(.dark)` > `button[aria-label="Meno"]` + `b` + `button[aria-label="Più"]`.
  - I due pulsanti usano `useHold`: `onChange(clamp(round(value ± step × k)))`. Arrotonda a 1 decimale.
  - Il valore centrale è un `button` (aspetto invariato, `aria-label={label}`): al tocco diventa `<input type="text" inputMode="decimal">` con il numero selezionato; a `blur` o Invio: sostituisci la virgola col punto, `parseFloat`, limita a `min…max`, `onChange`. Valore non valido → resta quello di prima.
  - `fmt` formatta il numero (default `String`), `unit` è il suffisso («g», «kg»), `text` se presente sostituisce numero+unità (serve a Live per «Corpo libero»).
- Usa `Step` in: righe di `MealSheet` (passo 5, 0–2000, «g»), `FoodForm` (passo 10, 10–2000, «g»), Live carico (passo 2,5, min 0, `fmt={fmtKg}`, «kg»), `ShopSheet` (passo 1). In `WeightSheet` il markup è diverso (`.pt-wt`): lì usa solo `useHold` sui due pulsanti.

### 2.4 `Count`
Sposta `Count` da `Schede.jsx` a `bits.jsx` (export), durata 500 ms, con `toLocaleString('it-IT')` opzionale (`sep` booleano). In `Schede.jsx` importalo. Con «riduci animazioni» mostra subito il valore finale.

### 2.5 `ui/Tempo.jsx` (file nuovo)
- Sposta qui `parseTempo` da `Live.jsx` (export) e toglilo da lì.
- **`TempoBar`**: `({ tempo, run, dark })` dove `tempo` è l'array di 4 valori di `parseTempo`.
  - Quattro segmenti affiancati, `flex-grow` = secondi (valore `X` → 0,5; `0` → 0,3 per restare visibile), alti 10 px, raggio 5, distanza 4 px.
  - Colori su scuro (`dark`): giù `#BDB2FF`, fermo `rgba(255,255,255,.22)`, su `--u-lime`, fermo `rgba(255,255,255,.22)`. Su chiaro: giù `--u-viola`, fermo `--u-lilla-2`, su `--u-lime-ink`, fermo `--u-lilla-2`.
  - Sotto ogni segmento, centrati: per giù l'icona `down` 12 px + numero; per su l'icona `send` 12 px + numero; per i fermi solo il numero. Numero 12/700 tabular. **Nessuna parola.** `aria-label` del gruppo: «Tempi: giù N, fermo N, su N, fermo N secondi».
  - Se `run` è vero: un cursore (tondo 14 px, bianco su scuro / ink su chiaro, ombra leggera) scorre da sinistra a destra sopra i segmenti con un'animazione CSS lineare infinita di durata = somma dei secondi (i segmenti sono proporzionali al tempo, quindi il moto lineare è già a tempo). Passa la durata con una variabile CSS in `style`.
  - `animation-play-state: paused` quando il contenitore ha la classe `is-paused`.

### 2.6 `ui/Ruler.jsx` (file nuovo, lo crea la tappa 7)
Descritto nella tappa 7.

---

## 3. Le tappe

### Tappa 1 — Fondamenta (colori, bug di leggibilità, tocco, fogli)
**Schermate:** tutte. **Prima:** 12, 22 (testo bianco su chiaro), 46, 49 (pulsanti oliva), 18, 19, 21, 36 (dock sopra il foglio).

**File:** `ui/bits.jsx`, `ui/Tempo.jsx` (nuovo), `ui/Tools.jsx`, `ui/MealSheet.jsx`, `ui/Clamp.jsx`, `ui/Nutrition.jsx`, `ui/Schede.jsx`, `ui/Live.jsx` (solo: import di `parseTempo`, `useDragClose` sul foglio «Esercizi»), `patient.css` (in fondo, sotto `/* UX-06.1 */`).

**Cosa fare**
1. **Variabili**: `:root { --u-… }` della sezione 1.1.
2. **Mattoni** della sezione 2.1–2.5 (non 2.6). In questa tappa `Step` e `TempoBar` vengono creati ma `TempoBar` non è ancora usato; `Step` sostituisce subito gli stepper esistenti (stesso aspetto).
3. **Bug: testo bianco sul tema chiaro.** Queste regole hanno `color: #fff` e fondo `rgba(255,255,255,…)` pensati per il tema scuro e nessuna correzione chiara: `.pt-food-h`, `.pt-when-t`, `.pt-when button`. Con prefisso `body:has(.pt-main)`:
   - `.pt-food-h`: fondo `#fff`, testo `--u-ink`, altezza minima 48 px, raggio 16, 6 px tra una voce e l'altra; `:active` fondo `--u-lilla-2`.
   - `.pt-when button`: fondo `#fff`, testo `--u-ink`; `.is-on`: fondo `--u-viola`, testo `#fff`.
   - `.pt-when-t`: `--u-ink` (verrà tolto nella tappa 4).
   - Poi **cerca tu gli altri**: dentro `.pt-dsheet` e `.pt-lst`, in `?prova`, apri ogni foglio (registro pasto con «Sostituisci» e ricerca «pane», «Fuori piano», peso, controllo, spesa, appunti, storico, macro, vecchie schede) e con `getComputedStyle` controlla ogni elemento di testo: nessuno deve avere colore con luminosità > 0,8 su fondo chiaro. Correggi quelli che trovi (`.pt-food-no`, `.pt-food-sel` sono sospetti) ed elencali in `STATO.md`.
4. **Disattivato** (sezione 1.1, regola 6): `.pt-cta:disabled`, `.pt-btn:disabled`, `.pt-done:disabled` → `opacity: 1` più i colori giusti, con variante chiara (`body:has(.pt-main)`) e scura (default: accesso e Live).
5. **Sillabazione**: `hyphens: none` sullo stesso elenco di selettori che oggi ha `hyphens: auto` (trovalo con grep `hyphens: auto`). Lascia `overflow-wrap: anywhere`.
6. **Pressione**: `button { transition: scale 90ms; } button:active:not(:disabled) { scale: .97; }` limitato a `.pt-main`, `.pt-dock`, `.pt-dsheet`, `.pt-lst`, `.pt-live`, `.pt-auth`, `.pt-ab`. Le regole esistenti che usano `transform: scale(…)` su `:active` restano (si sommano: controlla che `.hm2-q button` non «sprofondi» troppo; se sì, per quei selettori metti `scale: 1`).
7. **Dock sotto i fogli a lista**: `body:has(.pt-sp .pt-lst-ov) .pt-dock { translate: 0 140%; }` con `transition: translate 220ms`; e `.pt-sp .pt-lst { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }` (oggi è 118 px per far posto al dock).
8. **Un solo modo di chiudere i fogli**: togli i pulsanti `.pt-link` di chiusura in fondo ai fogli: «Annulla» in `MealSheet` e `WeightSheet`, «Annulla» (ramo `!cur`) in `VisitSheet`, «Chiudi» in `NotesSheet` e `ShopSheet`. Restano la X, il tocco sul fondo scuro e il trascinamento.
9. **«Salta (solo prova)»** (`.pt-skip`, solo sviluppo): spostalo in alto (`bottom: auto; top: calc(8px + env(safe-area-inset-top))`) perché oggi copre i pulsanti delle schermate di accesso.
10. Blocco finale `@media (prefers-reduced-motion: reduce)` che azzera transizioni e animazioni introdotte da UX-06: lo estendi a ogni tappa.

**Fatto quando**
1. Registro pasto → «Sostituisci» → scrivo «pane»: i risultati si leggono (testo scuro su bianco).
2. «Fuori piano»: tutti i chip si leggono; quello scelto è viola con testo bianco.
3. Accesso (`patient.html` senza `?prova`, schermata passphrase): «Continua» disattivato è grigio traslucido, non oliva.
4. Tengo premuto «+» in un pasto: i grammi salgono da soli, poi più in fretta. Tocco il numero: posso scriverlo; «abc» non cambia nulla; «130,5» diventa 130,5.
5. Ogni foglio ha la maniglia; trascinando giù dall'intestazione oltre ~90 px si chiude, meno torna su. Scorrere il contenuto non lo chiude.
6. Storico, macro e vecchie schede: il dock scompare sotto il foglio e torna alla chiusura.
7. Nessun «Annulla»/«Chiudi» in fondo ai fogli.
8. Nessuna parola spezzata con trattino in Home, dettaglio scheda, Live, Dieta (`?lungo`).
9. `npm run test:connect` passa (non hai toccato `logic.js`, ma hai spostato codice).

---

### Tappa 2 — Colore per sezione e dock che scorre
**Prima:** 08, 17, 21, 24, 26, 39, 40, 43.

**File:** `ui/Shell.jsx`, `ui/Nutrition.jsx` (solo colori inline e `SH`), `ui/Schede.jsx` (solo colori inline, `SHADES`, `sign`), `ui/TrainDetail.jsx` (solo colori inline e `Ring`), `ui/Progress.jsx` (nessuna logica: solo se un colore è inline), `patient.css` (in fondo, `/* UX-06.2 */`).

**Cosa fare**
1. **Dock** (`Shell.jsx`):
   - Aggiungi `data-tab={tab}` al `<nav className="pt-dock">` e un elemento `<i className="pt-dock-t" />` come primo figlio: è la capsula attiva. Posizionala come fa `DaySwitch` in `TrainDetail.jsx` (ref sui pulsanti, `offsetLeft`/`offsetWidth` in `useLayoutEffect`, dipendenze: `tab` e numero di tab visibili). Capsula 48×48 px tonda, centrata sul pulsante attivo, `transition: translate 280ms` curva standard + `background 280ms`.
   - CSS: i pulsanti `.is-on` perdono il fondo proprio (`background: transparent`) e il `transform: scale(1.08)`; stanno sopra la capsula (`position: relative; z-index: 1`).
   - Colore della capsula e dell'icona attiva per `data-tab`: `home` e `me` → `--u-notte` / icona `#fff`; `diet` → `--u-corallo` / icona `--u-ink`; `train` → `--u-viola` / icona `#fff`. Icone non attive `#9CA3AF` come ora.
2. **Selezione = viola** (CSS, tema chiaro): `.pt-seg3 button.is-on`, `.pt-tiles.is-sel button.is-on` (anche `span` e `b` interni bianchi), `.pt-td-sc .pt-wk.is-on` (testo e pallini bianchi: i pallini usano `currentColor`), `.pt-dsw-t` (il pollice di `DaySwitch`: fondo viola; il pulsante `.is-on` sopra: testo bianco) → fondo `--u-viola`, testo `#fff`. In Live: `.pt-rpe button.is-on` → viola/bianco; `.pt-lst-r.is-cur` → contorno 2 px viola e numero (`.pt-lst-n`) viola/bianco al posto del lime.
3. **Dieta = corallo**: la card kcal in `Nutrition.jsx` (`style={{ background: '#D8FD38' … }}` e la regola `body:has(.pt-main) .pt-sc.is-static { background: #D8FD38 !important }`) → `--u-corallo`, testo e anello `--u-ink`.
4. **Schede = viola**: in `Schede.jsx` `ACTIVE = { bg: '#6B3DFF', ink: '#fff' }`. A `Ring` aggiungi la prop opzionale `fg` (colore dell'arco di avanzamento, default `ink`) e passa `fg="#D8FD38"`: binario bianco al 20%, arco lime.
5. **Card del giorno** (`.pt-dh` in `TrainDetail`): fondo `--u-notte`, testo `#fff`; il cerchio decorativo `::after` con bordo `rgba(255,255,255,.12)` e alone `rgba(255,255,255,.05)`; `Ring` locale: binario `rgba(255,255,255,.18)`, arco `--u-lime`; `.pt-dh-n` bianco; `.pt-hero-d` `rgba(255,255,255,.7)`.
6. **Macro** (`Nutrition.jsx`): `SH = ['#B4E600', '#6B3DFF', '#FF7A59']` (carboidrati, proteine, grassi).
7. **Barre kcal**: `.pt-mb i` (binario) `--u-lilla-2`; `.pt-mb u` (previsto) `--u-corallo-l`; `.pt-mb s` (registrato) `--u-corallo`. `KcalWeek` nel tema chiaro (`.pg-lt .pg-bar u`): `--u-corallo-l`, oggi (`.is-today u`) `--u-corallo`, sopra l'obiettivo (`.is-over`) `--u-ink` (non più arancione: si confonderebbe col corallo). Linea obiettivo (`.pg-goal`) `--u-ink` tratteggiata.
8. **Torta muscoli** (`Schede.jsx`): `SHADES = ['#6B3DFF', '#B4E600', '#FF7A59', '#0B0C0E', '#DCD2FF', '#C9CDD4']`. Barre settimana: `LIME_L` → `#DCD2FF`, la corrente `#6B3DFF`.
9. **Altri verdi/pastelli fuori sistema** (CSS): `.pt-td-sc .pt-xc-past b` → `--u-viola`; `.pg-cap em` → `--u-viola`; `body:has(.pt-main) .pt-shop small` → nessun fondo, testo `--u-ink` 16/800 (spuntato: `--u-grigio`, barrato); `body:has(.pt-main) .pt-ab-team > div i` → fondo `--u-lilla-2`.
10. **Peso**: nel foglio (`.pt-dsheet .pg-line`) linea `--u-viola` 2,5 px; `.pt-dsheet .pg-dot.is-on` riempimento `--u-lime`, contorno `--u-ink` 1,5 px.
11. **Decimali**: in `Schede.jsx` la funzione `sign` restituisce «7.3»: aggiungi `.replace('.', ',')` → «+7,3%».
12. **Onda sotto Dieta e Schede**: in `Nutrition.jsx` e `Schede.jsx`, dentro `.pt-sp-bot` come primo figlio, lo stesso `<svg className="pt-td-wave" …>` di `TrainDetail.jsx`. Leggi con grep le regole di `.pt-td-wave` e `.pt-td-bot` e replica per `.pt-sp-bot` generico solo ciò che serve a far «mordere» l'onda nella parte alta. **Se a `?lungo` o a 360×640 l'onda copre contenuto o crea uno spazio vuoto, rinuncia**: lascia gli angoli arrotondati di oggi e annotalo.

**Fatto quando**
1. Cambio tab: la capsula scorre e cambia colore (notte → corallo → viola → notte). Icona attiva sempre leggibile.
2. Tab Dieta: un solo lime visibile al massimo (le spunte dei pasti registrati). Card kcal corallo, segmento del giorno viola.
3. Tab Schede: card scheda viola con anello lime; tessera selezionata viola; «+7,3%» con la virgola.
4. Dettaglio scheda: settimana selezionata viola, card del giorno notte con anello lime, **unico** lime pieno il pulsante in basso.
5. Macro: tre colori distinti (lime, viola, corallo); nessun verde oliva in tutta l'app (grep dei valori della regola 4 di 1.1 su `ui/*.jsx`: zero risultati; in `patient.css` restano solo in regole sovrascritte).
6. Live: RPE scelto viola; in «Esercizi» il corrente ha contorno viola.
7. `getComputedStyle` sulla capsula del dock nelle 4 tab: i quattro colori attesi.

---

### Tappa 3 — Home
**Prima:** 07, 08.

**File:** `ui/Home.jsx`, `ui/bits.jsx` (nessuna icona nuova: le ha già), `patient.css` (in fondo, `/* UX-06.3 */`). **Non** toccare `Progress.jsx`: `Rings` resta esportato, semplicemente la Home non lo usa più in versione `big`.

**Disposizione finale (dall'alto, 375×812, senza scorrere)**
```
[logo 22 px + URBIOS]                         [MER 11]
                                   ╭──────────────
                                  ╱   segno del logo
                                 │    viola, enorme,
                                  ╲   tagliato a destra
                                   ╰──────────────
(icona) Lower body                      ← titolo 40/800, max 2 righe
[manubrio 4] [orologio 18′]             ← due pillole
[ ▶ Inizia ───────────────────────── ]  ← lime, 56 px, tutta la riga
   ◯      ◯      ◯      ◯      ◯        ← strumenti
  0/4   72,4   13 gg    9      2
[            dock            ]
```

**Cosa fare**
1. **Segno** al posto degli anelli: sostituisci `<Rings rt={rt} big />` con un componente locale `Mark`:
   - `div.hm2-mark[aria-hidden]` > `div.hm2-mark-k` > `<UrbiosLogo size={440} />`.
   - Posizione assoluta: `top: 56px; right: -170px` (si deve vedere circa il 60% sinistro del cerchio); colore `--u-viola`; nessuna ombra.
   - `.hm2-mark` ruota di continuo: `rotate` 0→360° in 90 s, lineare, infinito.
   - `.hm2-mark-k` ruota di `kick × 45deg` con `transition: rotate 600ms cubic-bezier(.2,.9,.3,1.2)`; `kick` è uno stato che aumenta di 1 a ogni `onPointerDown` sul segno.
   - Il segno sta **dietro** al testo (`z-index: 0`; `.hm2-next` e `.hm2-q` a `z-index: 1`). Il titolo non deve mai sovrapporsi al viola pieno in modo illeggibile: il blocco titolo parte sotto il bordo inferiore del segno (vedi punto 3).
   - A 360×640: `size` resta 440 ma `top: 40px; right: -210px` (media query `max-height: 700px`).
2. **Data**: `span.hm2-date` in alto a destra, sulla riga del marchio: giorno della settimana abbreviato maiuscolo + numero, es. «MER 11» (`toLocaleDateString('it-IT', { weekday: 'short' })` senza punto, maiuscolo). 13/700, `--u-grigio-d`, spaziatura lettere .08em.
3. **Blocco allenamento** (`.hm2-next`): ancorato in basso (`margin-top: auto` nel contenitore a colonna), 24 px sopra gli strumenti. Togli gli spostamenti negativi accumulati su `.hm2-q` (`top: -14px` ecc.): riporta `top: 0` e gestisci gli spazi con `gap`/`margin` (aggiungi regole in fondo che vincono le vecchie; cerca tutte le regole `.hm2-q` e `.hm2-next` prima).
   - **Via l'etichetta** `.hm2-k` («Prossimo allenamento» / «Allenamento iniziato» / «Ultimo allenamento» / «Prossimo pasto» / «Pasti di oggi»): non renderla. Al suo posto, **prima del titolo sulla stessa riga**, un'icona 20 px in un tondo 32 px: `dumbbell` su `--u-viola`/bianco se da fare o iniziato; `check` su `--u-lime`/ink se `done`; `fork` su `--u-corallo`/ink per il ramo dieta. L'`aria-label` del blocco contiene il testo vecchio.
   - **Riga sotto il titolo** (`.hm2-s`): nel caso normale, al posto di «4 esercizi, circa 18 min», due pillole (`span.hm2-pill`, fondo `#fff`, 32 px alte, 13/700): icona `dumbbell` 14 px + numero esercizi; icona `clock` 14 px + minuti seguiti da `′` (es. «18′»). Il caso «Iniziato ieri · scade domani» / «Iniziato l'altro ieri · scade oggi» **resta testo** com'è (è un avviso che serve).
   - **Pulsante** `.hm2-go`: largo tutta la riga, alto 56 px, lime, contenuto centrato: icona `play` 18 px **prima** del testo («Inizia» / «Riprendi»; nel ramo dieta «Registra» / «Apri la dieta» con icona `chev` dopo). Togli l'icona `arrow` (freccia diagonale = «link esterno»). Ombra `0 8px 22px rgba(107,61,255,.25)` come ora.
4. **Strumenti** (`.hm2-q`): sotto ogni icona, **il dato al posto della parola quando il dato esiste** (13/700 tabular, `--u-ink`); altrimenti la parola di oggi (`x.q`, 12/600, `--u-grigio-d`). Ogni pulsante ha `aria-label` = parola + dato.
   | Tessera | Dato | Se manca |
   |---|---|---|
   | `eat` | pasti registrati oggi / pasti del giorno, es. «0/4» (calcolo identico a `Rings` in `Progress.jsx`: `dietDayToday` + `mealKey`) | «Pasti» |
   | `weight` | `fmtKg(w.kg)`, es. «72,4» | «Peso» |
   | `visit` | `dv > 1` → «13 gg»; `dv === 1` → «1 g»; `dv === 0` → «Oggi»; `dv < 0` o `null` → manca | «Controllo» |
   | `shop` | numero di voci non spuntate (`shopItems` di `Tools.jsx` con `cfg.days`/`cfg.people`, meno quelle in `tools.shop`); 0 → icona `check` 14 px | «Spesa» |
   | `notes` | numero di appunti se > 0 | «Appunti» |
   - Togli i pallini (`<u>{x.bd}</u>`): il numero è già sotto.
   - I campi `t` e `s` delle tessere non sono usati nel render: lasciali o toglili, senza altri effetti.
5. **Ingresso sfalsato** (oggi la Home è `.is-fit` ed è esclusa da `.pt-enter > *`): segno a 0 ms (opacità 0→1 e `scale` .92→1 in 500 ms), blocco allenamento a 80 ms, strumenti a 160 ms (opacità + `translate` 0 12px → 0, 340 ms). Solo `animation-fill-mode: backwards`.

**Fatto quando**
1. A 375×812 e 360×640, `?prova`: tutto visibile senza scorrere; almeno 16 px tra strumenti e dock; nessuno spazio vuoto > 40 px tra «Inizia» e gli strumenti.
2. Nessun anello. Il segno viola ruota lentamente; toccandolo fa uno scatto. Con «riduci animazioni» è fermo.
3. `?prova&lungo`: titolo su 2 righe con «Leggi tutto», pillole e pulsante ancora visibili, niente sopra il dock.
4. `?prova&vuoto`: le tessere senza dato mostrano la parola; nessun «undefined», «NaN», «0/0».
5. `?prova&solo=dieta`: icona forchetta corallo, pulsante «Registra» con freccia a destra; niente tessera sbagliata.
6. Allenamento lasciato a metà (preparalo da `window.__demoLog` come in UX-03): riga «Iniziato ieri · scade domani» presente, pulsante «Riprendi».
7. Lettore di schermo (albero di accessibilità): ogni tessera ha un nome con la parola («Peso 72,4»).

---

### Tappa 4 — Dieta e registro pasto
**Prima:** 10–13, 15–22.

**File:** `ui/Nutrition.jsx`, `ui/MealSheet.jsx`, `ui/Progress.jsx` (solo `MealsWeek`, `KcalWeek`), `patient.css` (in fondo, `/* UX-06.4 */`).

**A. Tab Dieta (`Nutrition.jsx`)**
1. **Via il marchio**: togli `div.pt-sp-brand` (logo + «URBIOS»).
2. **Intestazione = una sola card corallo** (68 px), tre zone:
   - a sinistra, un `button` (aria-label «La tua alimentazione») con `Ring` + numero: `<b><Count n={eaten} /> / {target}</b> <small>kcal</small>`; **via «Oggi»**. Apre il foglio macro (`setInfo(true)`) se `o` esiste; se non esiste è un `div` non toccabile.
   - a destra due tondi bianchi 44 px: icona `calendar` (aria-label «Storico», `setHist(true)`) e icona `plus` (aria-label «Fuori piano», `onExtra(…)` com'è oggi).
   - Via il pulsante lilla «Fuori piano» e, in fondo alla pagina, le due righe `.pt-gr` «Storico e modifica dei giorni» e «Alcune info sulla tua alimentazione».
3. **Selettore giorni** (`.pt-seg3` dei giorni): mostra `x.titolo` senza il prefisso «Giorno » (`replace(/^giorno\s+/i, '')`, iniziale maiuscola; se resta vuoto usa il titolo intero). Solo visualizzazione: il dato non cambia.
4. **Card pasto** (`.pt-ml`):
   - seconda riga: **solo i nomi** degli alimenti separati da virgola, senza grammi, **una riga** con puntini (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`).
   - kcal (`.pt-ml-k`): niente pillola (via fondo e bordo): numero 15/700 + «kcal» 12/600 grigio.
   - se registrato (`rec`): classe `is-done` sulla card → opacità .6 su titolo e riga; la spunta resta lime piena.
5. **Spazio in fondo**: l'ultimo elemento della lista deve stare interamente sopra il dock con 24 px d'aria (aumenta il `padding-bottom` del contenitore che scorre; misura nel browser).
6. **`Extras`** (elenco «Fuori piano» del giorno): resta com'è.

**B. `MealsWeek` e `KcalWeek` (`Progress.jsx`)**
- `MealsWeek`: via `span.pg-k` («Pasti registrati») e il `small` «questa settimana». Riga grande: icona `fork` 18 px + `<b>{done}</b>` + `<small>/ {total * 7}</small>`. Lettera di oggi in `--u-ink` 800. Riempimento capsule: `--u-lime-ink`.
- `KcalWeek`: `span.pg-k` «Kcal della settimana» → via; `small` «media» resta (una parola, serve). Colori già sistemati nella tappa 2.

**C. Storico (`Nutrition.jsx`)**
- `Cal`: via la legenda (`span.pt-cal-l`). Passa a `Cal` anche `docId={cur}` e `total={meals.length}`. Per ogni giorno calcola `n` = pasti registrati (chiavi di `log.meals` che iniziano con `docId + '|'` e finiscono con `'|' + dt`):
  - `n >= total` → cerchio lime pieno (come oggi `.has`);
  - `0 < n < total`, oppure solo «fuori piano» → **anello** lime-ink da 3 px proporzionale a `n/total` (minimo 15%): `background: conic-gradient(var(--u-lime-ink) calc(var(--p) * 360deg), var(--u-lilla-2) 0)` con maschera radiale che lascia solo il bordo; `--p` passato in `style`;
  - nessuna registrazione → niente.
- Dettaglio giorno: `'Da registrare'` → stringa vuota (resta il «+»).

**D. Foglio macro (`Nutrition.jsx`)**
- Titolo «La tua alimentazione» → «Macro».
- Le tre tessere diventano anche la legenda: in ognuna un pallino 10 px del colore (`SH[i]`) prima dell'etichetta e, a destra del numero di grammi, la percentuale (13/700 grigio). In `MacroDonut` togli l'elenco `<ul>` (resta solo la ciambella, centrata, 150 px).
- `MealBars`: a destra del nome del pasto, le kcal previste (`r.plan`, 13/700). Se `r.eaten > 0`: «{eaten} / {plan}».

**E. Registro pasto (`MealSheet`)**
1. **Titolo con totale vivo**: `title` = `meal.nome`; `extra` (accanto, 15/700 `--u-corallo-ink`) = somma `kc(e)` della lista + « kcal», aggiornata a ogni tocco.
2. **Riga alimento su una riga sola** (≈ 60 px): `[azione 40 px] [nome, max 2 righe] ……… [Step compatto]`.
   - Azione: alimento prescritto o sostituito → pulsante tondo 40 px con icona `swap` (aria-label «Sostituisci»), fondo `--u-lilla-2`. Alimento aggiunto dal paziente (`v.p === null && !v.was`) → pulsante tondo con icona `close` (aria-label «Togli»), stessa azione di oggi. Niente più parole «Sostituisci»/«Togli».
   - Sotto il nome, **solo se c'è una differenza dal piano**: se `v.was` → il nome vecchio barrato (`<s>`), 12/600 grigio; se `v.p && v.g !== v.p` → «{v.p} g» barrato e il numero dello `Step` in `--u-corallo-ink`. Se è uguale al prescritto: niente seconda riga (via «Prescritti 120 g»). Via «Aggiunto da te».
   - `Step` compatto: pulsanti 36 px, valore 17/800, larghezza totale ≈ 144 px.
3. **Aggiungi**: al posto di «Aggiungi un alimento», una riga tratteggiata alta 52 px (bordo 1,5 px tratteggiato `--u-lilla-2`, raggio 20) con la sola icona `plus` al centro, `aria-label="Aggiungi un alimento"`.
4. **Pulsante**: «Conferma e salva nel diario» → «Salva».
5. **`FoodForm`** (ricerca alimento), nuova prop `instant`:
   - Via il titolo `<b>{title}</b>`; resta il campo con segnaposto «Cerca alimento» e `aria-label={title}`. Dentro il campo, a destra, una X (36 px, aria-label «Annulla») che chiama `onCancel`; non renderla se `onCancel` non è passato.
   - Via la coppia «Annulla» / «Conferma» **finché non c'è un alimento scelto**.
   - Con `instant` (lo passa `MealSheet`): toccare un risultato chiama subito `onDone` con i grammi calcolati come fa `pick` (stesse kcal se è una sostituzione, 100 g se è un'aggiunta). La quantità si corregge poi nella riga. Niente passo «grammi», niente «Conferma».
   - Senza `instant` (lo usa `ExtraSheet`): dopo la scelta resta il passo grammi con `Step`; via le scritte «Quanti grammi» / «Quantità con le stesse calorie di prima: puoi cambiarla»; sotto, **un** pulsante lime `.pt-cta` «Salva» (al posto di «Conferma») e il nome scelto con «Cambia» com'è oggi.
   - «Non lo trovo: scegli il più simile» resta (serve), in `--u-grigio-d`.
6. **`ExtraSheet`**: via «Quando l'hai mangiato» e «Che cosa hai mangiato» (restano come `aria-label` del gruppo di chip e del campo). I chip restano, già preselezionati sull'ora.

**Fatto quando**
1. Tab Dieta a 375×812: sotto l'intestazione si vedono **tutti e quattro** i pasti del demo senza scorrere.
2. Tocco l'anello kcal → foglio «Macro»; tocco il calendario → storico; tocco «+» → fuori piano.
3. Registro la Colazione senza toccare nulla: **2 tocchi** (card, «Salva»). La card diventa attenuata con spunta lime; il numero kcal dell'intestazione sale contando.
4. Cambio i Mirtilli da 80 a 100: «80 g» barrato compare, «100 g» è corallo, il totale nel titolo cambia.
5. Sostituisco le Noci: icona scambio → scrivo «mand» → tocco un risultato → la riga è sostituita **senza altri tocchi**, col nome vecchio barrato.
6. Aggiungo un alimento con la riga «+»; lo tolgo con la X.
7. Storico: un giorno con 2 pasti su 4 ha mezzo anello; uno completo è pieno; nessuna legenda.
8. `?lungo`: nomi lunghi su 2 righe nel foglio, niente che esca; `?vuoto`: niente grafico settimanale, nessun errore.
9. Parole visibili nel registro pasto, contate: prima ≈ 16 («Prescritti» ×3, «Sostituisci» ×3, «Aggiungi un alimento», «Conferma e salva nel diario», «Annulla») → dopo: nome pasto, nomi alimenti, «kcal», «Salva».

---

### Tappa 5 — Schede e dettaglio scheda
**Prima:** 24, 26, 28, 36.

**File:** `ui/Schede.jsx`, `ui/TrainDetail.jsx`, `ui/Progress.jsx` (solo `Streak`), `patient.css` (in fondo, `/* UX-06.5 */`).

**A. Tab Schede**
1. Via `div.pt-sp-brand`.
2. **Intestazione su una riga**: card viola (flex 1, 68 px) con `Ring` + **titolo vero della scheda** (`active[0].meta.title || 'Scheda'`, una riga con puntini) + icona `chev`; accanto, un tondo 56 px `--u-lilla-2` con icona `archive` (aria-label «Vecchie schede», apre `setSheet('old')`), **non reso** se `archive.length === 0`. Via le scritte «La tua scheda» e «Le tue vecchie schede» (la seconda resta titolo del foglio, accorciata in «Vecchie schede»).
3. **Periodo** (`.pt-rng`): «Ultimi **7 giorni** ⇄» → solo «7 giorni» / «30 giorni» + icona `swap`; aspetto da chip (fondo `#fff`, 36 px). `aria-label` invariato.
4. **Didascalia** (`p.pg-cap`): non renderla per le tab `a`, `s`, `f` (ripete la tessera). Resta solo per `m` («Petto è il muscolo più lavorato»).
5. **`Streak`** (`Progress.jsx`): via `span.pg-k` «Costanza» e il `small` «allenamenti in 4 settimane»; resta il numero grande con icona `dumbbell` 18 px davanti. Sopra la griglia una riga di 7 lettere (L M M G V S D, 11/700 grigio, allineate alle colonne). «N settimane di fila» resta.
   - Celle: vuota = fondo `--u-lilla`, senza bordo; futura (`.is-fut`) = bordo tratteggiato 1,5 px `--u-lilla-2`, senza fondo; oggi = contorno 2 px `--u-ink`; fatta = `--u-lime`.
6. Foglio vecchie schede: resta com'è (solo il titolo più corto).

**B. Dettaglio scheda (`TrainDetail.jsx`)**
1. Via `<UrbiosLogo … className="pt-sp-logo" />` dall'intestazione (riduci il `padding` alto di conseguenza: titolo allineato in verticale al pulsante indietro).
2. Tessere settimana: pallini 8 px (oggi più piccoli).
3. **Card del giorno** (`.pt-dh`): se `days.length > 1` **non ripetere il titolo** (c'è già nel selettore sopra): mostra solo due pillole come in Home (`dumbbell` + n esercizi, `clock` + minuti con `′`; fondo `rgba(255,255,255,.12)`, testo bianco) e, se fatto, una terza con `check` + data (`fmtDay(st.date)`). Se c'è un solo giorno, il titolo resta sopra le pillole. Via la riga «4 esercizi · ~18 min · fatto il …».
4. **Pillole esercizio** (`.pt-chp`): serie con «×» vero e spazi («4x10» → «4 × 10»: `replace(/\s*[xX]\s*/, ' × ')`); recupero: icona `clock` 12 px + «35″» (via la parola «riposo»).
5. **Dettaglio aperto**: «Tempo 3-1-2-1» → se `parseTempo(e.tempo)` riesce, `TempoBar` statica (chiara, senza cursore) larga tutta la riga sotto le altre voci; se non riesce, resta il testo com'è. Le altre voci (RPE, % 1RM, Suggerito) invariate.
6. **Pulsante in basso**: «INIZIA ALLENAMENTO GUIDATO» → «Inizia»; «RIPRENDI ALLENAMENTO» → «Riprendi»; «RIFAI L'ALLENAMENTO» → «Rifai». Icona `play` 18 px prima del testo.

**Fatto quando**
1. Tab Schede: nell'intestazione si legge il nome della scheda del demo; il tondo archivio compare solo se ci sono schede vecchie (`?prova` sì; verifica il caso senza da console).
2. Sotto la griglia non c'è più la riga «6 sedute negli ultimi 7 giorni»; con la tab Muscoli la didascalia c'è.
3. La griglia ha le lettere dei giorni; le celle future sono tratteggiate.
4. Dettaglio: «Lower body» compare **una volta** (nel selettore); card del giorno con due pillole; pulsante «Inizia» con triangolo.
5. Esercizio aperto con tempo «3-1-2-1»: quattro segmenti larghi 3:1:2:1 con i numeri sotto; con tempo non riconosciuto (provalo cambiando il dato da console) resta il testo.
6. `?lungo`: nome scheda con puntini nell'intestazione; nomi esercizi su più righe senza trattini.

---

### Tappa 6 — Allenamento guidato (Live)
**Prima:** 29, 31–34. È la tappa più delicata: **non toccare** la logica dei tempi (`T`, `tick`, wake lock, `beep`), il salvataggio in `complete`, `sessionDate`, la ripresa (`start`).

**File:** `ui/Live.jsx`, `ui/Tempo.jsx`, `patient.css` (in fondo, `/* UX-06.6 */`).

**Disposizione — fase LAVORO**
```
▬▬▬ ─── ─── ───            12:40   [note•] [≡] [❚❚]   ← barra alta
Squat bulgaro con bilanciere olimpico…                 ← titolo (Clamp 3 righe)
▓▓▓▓▓▓ ░░ ▓▓▓▓ ░░    ← TempoBar con cursore (solo se c'è il tempo)
 ↓3    1   ↑2   1
● ○ ○ ○                                                ← serie
~~~~~~~~~~~~~~~~~~~~ onda ~~~~~~~~~~~~~~~~~~~~~~~
                   00:41                               ← tempo della serie
   10 ×      [ −      100 kg      + ]                  ← ripetizioni + carico
05/11 · 100 kg                                  ›      ← ultima volta (apre lo storico)
(Suggerito 102,5 kg  [Usa])                            ← solo se diverso
 (‹)   [ ✓ Fatta ─────────────────── ]   (›)           ← lime 64 px
```
**Disposizione — fase RIPOSO**
```
▬▬▬ ─── ─── ───            12:55   [note•] [≡] [❚❚]
Squat bulgaro…  (piccolo, 60%)
                 00:34                                 ← 88 px, bianco
● ● ○ ○
≈≈≈≈≈≈≈≈≈≈≈ livello viola che scende ≈≈≈≈≈≈≈≈≈≈≈
~~~~~~~~~~~~~~~~~~~~ onda ~~~~~~~~~~~~~~~~~~~~~~~
RPE   [6] [7] [8] [9] [10]                             ← della serie appena fatta
             [ −      100 kg      + ]                  ← carico della prossima
(−15)  [ Salta ───────────────────── ]  (+15)          ← notte, non lime
```

**Cosa fare**
1. **Barra alta** (`.pt-live-top`): dopo i segmenti di avanzamento, il **tempo totale** `mmss(elapsed)` (13/700, bianco al 60%, tabular). Poi tre tondi: **note** (icona `note`, con pallino lime 8 px se `pro.length`, aria-label «Note»), elenco esercizi (com'è), pausa (com'è).
2. **Via le tre colonne** (`.pt-grid`: totale · centrale · «1/4»): resta **un solo numero** sul foglio in lavoro, il tempo della serie `mmss(setSecs)`, 40/800 centrato. «1/4» sparisce (lo dicono i pallini). In riposo questo numero non c'è (il conto alla rovescia è in alto).
3. **Via la pillola** «4 serie × 10 ripetizioni» (`.pt-live-chips`). I pallini (`.pt-live-dots`) diventano 12 px, distanza 8: fatto = lime pieno; corrente = anello bianco 2 px; da fare = bianco al 25%.
4. **Tempo**: al posto delle quattro tessere `.pt-tp`, `<TempoBar tempo={tempo} dark run={phase === 'work' && !paused} />`, con `key={ex + '-' + setNo}` così riparte a ogni serie. Via la costante `TEMPO`.
5. **Ripetizioni + carico**: una riga. A sinistra `cur.reps` 56/800 seguito da «×» 28/600 grigio (se `cur.reps` è più lungo di 3 caratteri, es. «8-10», 36 px; se manca, non rendere il blocco e lo `Step` occupa tutta la riga). A destra lo `Step` del carico (com'è: passo 2,5; «Corpo libero» tramite `text`). Lo `Step` è **sempre** visibile (oggi solo nella tab «Oggi»).
6. **Via le tab** «Oggi / Storico / Note» (`.pt-seg` e lo stato `tab`). Al loro posto lo stato `panel`: `null | 'storia' | 'note'`.
   - **Ultima volta** (`.pt-lastrow`): diventa un `button` a tutta riga: data `gg/mm` grigia + « · » + **carico massimo** di quella seduta (`Math.max` dei `kg`) + « kg» + icona `chev` a destra. Apre `panel = 'storia'`. Se non c'è storico, niente riga.
   - **Storico** e **Note** si aprono come foglio a lista (stesso markup del foglio «Esercizi»: `.pt-lst-ov` > `.pt-lst`, con maniglia e `useDragClose`), titoli «Storico» e «Note», con il contenuto che oggi sta nelle tab (`past.map…` e blocco note con area di testo). La nota scritta resta nello stato `note` e viene salvata con la serie successiva, come oggi.
   - Date nei due fogli (`.pt-past-d`): oggi sono una fascia nera che in 32.jpg finisce tagliata sotto il pulsante. Diventano testo semplice: senza fondo, 12/700 `--u-grigio`, allineate a sinistra sopra il contenuto (le regole vecchie hanno `!important`: vincile con selettore più specifico `.pt-live .pt-lst .pt-past-d`).
7. **RPE solo dopo la serie**:
   - In lavoro la riga RPE non c'è. In riposo c'è (etichetta «RPE» + cinque pulsanti 48 px), e scrive sulla serie appena fatta come fa già `pickRpe`.
   - Togli lo stato `rpe` (RPE «anticipato»): `complete` non mette più `rpe` in `rec`; `shownRpe` è sempre `lastRpe`. In `pickRpe` togli la condizione `phase !== 'rest'`: resta solo «se non c'è `lastSet.current`, esci».
   - **Ultima serie dell'allenamento** (dopo non c'è riposo): nella schermata finale (`fin`), sopra il pulsante, la stessa riga RPE che agisce su `lastSet.current`. Così nessun RPE va perso.
8. **Pulsanti in basso**: una riga sola `[‹ 56 px] [principale] [› 56 px]`; via `.pt-nav2`.
   - Lavoro: `‹` = `prev` (icona `back`, aria-label «Esercizio precedente», disattivato se `ex === 0`), principale lime 64 px «Fatta» con icona `check` 20 px prima del testo, `›` = `skipEx` (icona `chev`, aria-label «Salta esercizio»). I due tondi: fondo `--u-foglio`, icona `--u-ink`.
   - Riposo: `−15` e `+15` (testo 15/800 nei tondi, aria-label «Quindici secondi in meno / in più») e principale «Salta» su fondo `--u-notte` con testo bianco (non lime, non grigio: oggi il grigio sembra disattivato).
   - `±15`: modifica `T.current.restEnd` di ∓15000 ms; col meno non scendere sotto `Date.now() + 1000`; aggiorna subito `rest` e il totale del punto 9.
9. **Riposo protagonista** (sostituisce la schermata intera `.pt-rf` degli ultimi 10 s: toglila dal render):
   - In `complete` salva in `T.current.restTot` la durata prevista (`cur.rest`, letta **prima** di passare all'esercizio successivo). Col `+15` aumenta anche `restTot`.
   - Nell'intestazione, in riposo: titolo esercizio 15/700 bianco al 60% su una riga; sotto, `mmss(rest)` **88/800** bianco, tabular, centrato (`role="timer"`).
   - **Livello**: `div.pt-rest-w` assoluto dentro `.pt-live-bg`, in fondo, largo tutto, alto `rest / restTot × 100%` (con `transition: height 1s linear`), fondo `--u-viola`; in cima un `svg` onda (stessa forma di `.pt-td-wave`, colore viola) largo 200% che scorre in orizzontale (`translate` 0 → -50%, 6 s, lineare, infinito). Il testo sta sopra (`z-index`).
   - **Ultimi 3 secondi**: il numero diventa lime e a ogni secondo fa un impulso (`key={rest}` + animazione `scale` 1 → 1.08 → 1 in 300 ms). I bip ci sono già.
   - **«Dopo»** (`nextCard`): mostrala **solo se il prossimo esercizio è diverso** da quello appena fatto (`nx.name !== lastSet.current.name`); senza la parola «Dopo» (resta in `aria-label`), solo icona `chev` + nome + «1/3». Se è lo stesso esercizio bastano i pallini.
10. **Colpo alla serie fatta**: in `complete` incrementa uno stato `hit`; `.pt-live` riceve `key`/classe che fa partire il velo lime sull'intestazione (pseudo-elemento, opacità 0 → .18 → 0 in 220 ms) e lo scatto del pallino appena completato (`scale` 1 → 1.5 → 1, 250 ms).
11. **Pausa**: «Esci» con testo bianco pieno e bordo `rgba(255,255,255,.35)` 1,5 px (oggi quasi invisibile). `.pt-live.is-paused` (aggiungi la classe quando `paused`) ferma metronomo e onda.
12. **Sfondo**: `.pt-live` e `.pt-live-bg` → `radial-gradient(120% 80% at 70% 10%, #3A2F7A 0%, #241552 45%, #160C33 100%)`; `theme-color` in Live `#160C33`.
13. **Altezze**: dopo aver tolto tab e griglia, il foglio bianco è più basso. Obiettivo a 375×812: intestazione ≈ 320 px in lavoro, foglio il resto; pulsante principale con il bordo inferiore a `24px + env(safe-area-inset-bottom)` dal fondo; **nessuno scorrimento** e nessun buco vuoto > 32 px tra le righe del foglio. A 360×640 il titolo scende a 2 righe e il numero del riposo a 64 px. Le vecchie regole `.has-tempo …` e `.pt-sheet.is-tall` hanno altezze fisse con `!important`: sovrascrivile in fondo.

**Fatto quando**
1. Lavoro: sul foglio c'è **un solo** cronometro; il totale è piccolo in alto. Niente «1/4», niente pillola serie×ripetizioni, niente tab.
2. «10 ×» e «100 kg» sono i due elementi più grandi del foglio. Esercizio a corpo libero: «Corpo libero» nello stepper.
3. Con tempo «3-1-2-1»: il cursore percorre la barra in 7 s e ricomincia; in pausa si ferma.
4. «Fatta»: vibrazione/bip come prima, velo lime, pallino che scatta, parte il riposo: numero da 88 px, viola che scende, a −3 s lime e pulsante. A fine riposo torna il lavoro da solo. `+15` allunga e il livello risale; `−15` accorcia; «Salta» chiude il riposo.
5. In riposo scelgo RPE 8: è scritto nella sessione e nello storico (controlla `window.__demoLog` come in UX-01). Secondo tocco: tolto.
6. Ultima serie dell'ultimo esercizio: nella schermata finale posso dare l'RPE e viene scritto.
7. Tocco «05/11 · 100 kg»: foglio «Storico». Tocco l'icona note: foglio «Note»; scrivo una nota, chiudo, faccio la serie: la nota è salvata con la serie.
8. `‹` e `›` cambiano esercizio; l'elenco «Esercizi» funziona come prima.
9. Simula telefono bloccato come in UX-01 (`Date.now` +60 s): i tempi restano giusti.
10. `?lungo` e 360×640: niente tagli, pulsante sempre visibile. Console: zero errori (ammesso l'avviso `vibrate` da clic sintetici).
11. `npm run test:connect` passa.

**Da annotare in «Da provare su iPhone»:** fluidità dell'onda durante il riposo con schermo sempre acceso; se scatta, l'onda diventa ferma (solo il livello scende) — decisione da riportare al proprietario.

---

### Tappa 7 — Strumenti: peso, controllo, spesa, appunti
**Prima:** 40, 42, 43, 44.

**File:** `ui/Tools.jsx`, `ui/MealSheet.jsx` (solo `WeightSheet`), `ui/Progress.jsx` (solo `WeightTrend`), `ui/Ruler.jsx` (nuovo), `patient.css` (in fondo, `/* UX-06.7 */`).

**A. Peso**
1. `WeightTrend` riceve `bare` (lo passa solo `WeightSheet`): con `bare` non rende `span.pg-k` («Peso»), né il numero grande, né le due frasi vuote («Registra il primo peso dalla Home.», «Con tre pesi compare la linea.»): rende solo la variazione («−0,3 / sett.», in alto a destra, 13/700) e la linea. Con meno di 3 pesi e `bare`: non rende nulla.
2. Il numero unico è quello dello stepper (`.pt-wt b`): 56/800.
3. **Righello** (`Ruler.jsx`): `({ value, onChange, min, max })`, passo fisso 0,1.
   - Intervallo mostrato: `value iniziale ± 15 kg`, limitato a 20–300 (300 tacche ≈ 2400 px a 8 px per tacca).
   - Un contenitore con `overflow-x: auto`, barre di scorrimento nascoste, `padding-inline: 50%`; dentro, **un solo** elemento largo `(numero tacche × 8)px`, senza figli, con le tacche disegnate da due `repeating-linear-gradient` (tacca corta ogni 8 px: 1,5 px `--u-lilla-2`, alta 14 px; tacca lunga ogni 80 px = 1 kg: `--u-ink`, alta 26 px).
   - **Niente `scroll-snap` CSS** (non ci sono figli a cui agganciarsi): l'aggancio lo fai tu. A fine scorrimento (evento `scrollend` se esiste, altrimenti 120 ms senza eventi `scroll`) allinea alla tacca più vicina con `scrollTo({ left: tacca × 8, behavior: 'smooth' })`.
   - Al centro, fisso, un indice verticale `--u-viola` 3×34 px con punta tonda.
   - `onScroll` (una volta per fotogramma con `requestAnimationFrame`): `valore = min + round(scrollLeft / 8) / 10`; se cambia: `onChange` e `navigator.vibrate(5)` dentro `try`.
   - Posizione iniziale in `useLayoutEffect`. Se `value` cambia dall'esterno (pulsanti ±), riallinea lo scorrimento senza animazione.
   - Accessibilità: `role="slider"`, `aria-valuenow/min/max`, `aria-label="Peso"`, frecce ← → = ∓0,1.
4. Ordine nel foglio: grafico (se c'è) → `[−] 72,4 kg [+]` (i due tondi con `useHold`) → righello → «Salva» (lime).

**B. Prossimo controllo** (`VisitSheet`)
1. Via il paragrafo «Quando devi rivedere il professionista? Ti ricordo quanti giorni mancano.».
2. Se c'è già una data: in testa il numero dei giorni mancanti grande (`daysTo(cur)`): 56/800 + «giorni» 15/600 grigio («giorno» se 1; «Oggi» se 0; niente se passata).
3. Preset su **una riga** di quattro chip: «2 sett», «1 mese», «2 mesi», «3 mesi» (via «Tra»). Salvano e chiudono al tocco, come già fanno.
4. Campo data: via l'etichetta «Oppure scegli la data» (→ `aria-label="Data"`). Accanto al campo, se `cur`, un tondo 44 px con icona `trash` (aria-label «Togli la data») al posto del pulsante largo «Togli la data».
5. «Salva» compare **solo** se `d` è valorizzato e diverso da `cur`.

**C. Lista della spesa** (`ShopSheet`)
1. Titolo «Lista della spesa» → «Spesa»; `extra` = contatore «{presi}/{totale}» (15/700; quando sono tutti presi diventa una pillola lime con `check`).
2. I due regolatori su **una riga**, senza etichette: `[calendar 18 px] [− 7 +]` e `[user 18 px] [− 1 +]` (`Step` compatto, valore senza unità; `aria-label` «Per quanti giorni» / «Per quante persone»).
3. Righe: tutta la riga è il bersaglio (già così). Quantità a destra come testo (tappa 2). Spuntata: nome barrato, opacità .45, e **scende in fondo alla lista** (ordina: prima le non spuntate, poi le spuntate, ordine alfabetico dentro i gruppi). Per non far «saltare» la riga sotto il dito: applica il riordino 250 ms dopo il tocco (stato locale di transizione), con dissolvenza.
4. Via tutto il blocco `.pt-miss` («Ti manca ancora N cose» + chip, «Hai preso tutto»): ripete la lista.
5. Lo stato vuoto («Quando riceverai la dieta, qui troverai gli alimenti da comprare.») resta.

**D. Appunti** (`NotesSheet`)
1. Titolo «Da dire al professionista» → «Appunti» (uguale all'icona in Home).
2. Via il paragrafo di spiegazione.
3. «Togli» → tondo 36 px con icona `close` (aria-label «Togli»).
4. Campo + invio in un solo riquadro: area di testo (2 righe, segnaposto «Per la prossima visita…») e, dentro in basso a destra, un tondo 40 px lime con icona `send` (aria-label «Aggiungi»); disattivato (lilla-2) se il testo è vuoto. Via il pulsante largo «Aggiungi».

**Fatto quando**
1. Peso: «72,4» compare una volta sola. Trascino il righello: il numero cambia a scatti di 0,1 e si ferma su una tacca; ± lo sposta di 0,1 e il righello segue; tenendo premuto ± scorre. «Salva» registra il valore mostrato (controlla `__demoLog.weights`).
2. `?vuoto` → peso: niente grafico né frasi, righello centrato su 70,0.
3. Controllo: tocco «1 mese» → salvato e chiuso; riapro: «30 giorni» grande, cestino accanto alla data; cambio la data → compare «Salva».
4. Spesa: regolatori su una riga; spunto una voce → dopo un attimo scende in fondo barrata, contatore «1/N»; nessun blocco «Ti manca…».
5. Appunti: scrivo, tocco la freccia → l'appunto compare sopra, il campo si svuota; X lo toglie.
6. In Home le tessere (tappa 3) riflettono i nuovi valori dopo la chiusura dei fogli.

---

### Tappa 8 — Profilo e pagina URBIOS
**Prima:** 37, 39.

**File:** `ui/Settings.jsx`, `ui/About.jsx`, `patient.css` (in fondo, `/* UX-06.8 */`).

**Cosa fare (`Settings.jsx`)**
1. Al posto delle quattro card, **una card bianca a righe** (`div.pt-set`, raggio 32, righe alte 56 px separate da 1 px `--u-lilla`), ogni riga: icona 22 px `--u-viola` · testo 16/700 · elemento a destra.
   | Riga | Icona | Testo | A destra | Azione |
   |---|---|---|---|---|
   | 1 | `link` | «Collegato» / «Non collegato» | pallino 10 px: `--u-lime-ink` / `--u-rosso` | nessuna (è un `div`) |
   | 2 | `doc` | «Riassunto PDF» | icona `share` | `send` (com'è). Mentre lavora: l'icona a destra ruota (`rotate` 1 s lineare infinito), riga non toccabile |
   | 3 | `refresh` | «Aggiorna» | — | `onRefresh`; al tocco l'icona fa un giro (600 ms). Riga non resa se `onRefresh` manca |
   | 4 | `lock` | «Blocca» | — | `onLock` (oggi il pulsante dice «Esci», che è ambiguo) |
   | 5 | `UrbiosLogo` 22 px | «URBIOS» | `chev` | apre `About` |
2. Sotto la card, righe di testo piccolo (13/600 `--u-grigio-d`, 8 px di margine): l'esito del riassunto (`msg`: stesse tre frasi di oggi) e la riga del consenso («Consenso dato il … (informativa …)») che resta **identica** (è un'informazione dovuta).
3. Via i titoli e le spiegazioni: «Collegamento», «Collegato al tuo professionista.», «Il tuo riassunto», «Un PDF con tutto il tuo percorso, da inviare al professionista.», «Revoca ed elimina», «Elimina da questo telefono documenti, chiavi e collegamento.».
4. **Elimina**: staccata di 32 px dalla card, una riga a sé (fondo trasparente): icona `trash` + «Elimina tutto» in `--u-rosso`. Al tocco, **com'è oggi**, compare la conferma (`Note tone="bad"` «Operazione definitiva. Confermi?» + «Sì, elimina tutto» / «Annulla»): non cambiarne la logica. «Sì, elimina tutto»: fondo `--u-rosso`, testo bianco.
5. Titolo «Profilo»: 16 px + area sicura in alto (`env(safe-area-inset-top)`).
6. Nessun lime pieno in questa schermata: è giusto così.

**Cosa fare (`About.jsx`)**
1. Via `<b>URBIOS</b>` dall'intestazione (resta il pulsante indietro) e via la frase «La piattaforma per professionisti della salute» (parla al medico, non al paziente).
2. Iniziali su `--u-lilla-2` (già nella tappa 2): verifica.

**Fatto quando**
1. Profilo: una card con cinque righe, tutte ≥ 56 px; nessuna spiegazione; «Elimina tutto» rosso, lontano dalle altre.
2. «Riassunto PDF»: l'icona gira, poi sotto la card compare «PDF salvato nei file» e resta.
3. «Blocca» in `?prova` esce dalla prova (come faceva «Esci»).
4. «Elimina tutto» chiede ancora conferma; «Annulla» torna indietro.
5. Scorrendo in fondo restano ≥ 24 px tra l'ultima riga e il dock.
6. Parole visibili in Profilo: prima ≈ 45 → dopo ≤ 12 (più la riga del consenso).

---

### Tappa 9 — Accesso (Benvenuto, Informativa, Passphrase, Collegamento)
**Prima:** 02, 03–06, 46–49. Si prova **senza** `?prova` (`patient.html`), con la cassaforte vuota del browser di anteprima. **Non** cambiare logica di consenso, passphrase, collegamento: solo presentazione.

**File:** `ui/Welcome.jsx`, `ui/Consent.jsx`, `ui/Passphrase.jsx`, `ui/Pair.jsx`, `ui/bits.jsx` (`AuthShell`, `Backdrop`), `patient.css` (in fondo, `/* UX-06.9 */`).

**Cosa fare**
1. **`AuthShell`**: non rendere `<h1>` se `title` è vuoto.
2. **Benvenuto**:
   - via il sottotitolo («Piano alimentare e scheda di allenamento.»).
   - `ul.pt-feat`: da tre riquadri che sembrano campi da compilare a **tre colonne senza contenitore** (via fondo e bordo dei `li`): icona 24 px lime in alto (`eyeoff`, `lock`, `phone`) e sotto la parola («Anonima», «Cifrata», «Tua») 13/700 bianco. Distanza tra le colonne uniforme, blocco centrato.
   - Logo: entra ruotando da −200° e `scale` .8 → 1, opacità 0 → 1, 700 ms curva standard, una volta.
3. **Informativa**:
   - Testo: `p` in `rgba(255,255,255,.72)`, `b` (titoli dei punti) bianco pieno; 20 px tra un punto e l'altro. **Non cambiare una parola del testo legale.**
   - **Barra di lettura**: stato `prog` (0–1) aggiornato in `onScroll` (`scrollTop / (scrollHeight − clientHeight)`); un `<i className="pt-waiver-p">` in cima al riquadro, 3 px, lime, `scale: var(--p) 1` con origine a sinistra.
   - **Freccia «continua a leggere»**: finché `!read`, un tondo 40 px in basso a destra dentro il riquadro (icona `down`, aria-label «Scorri»), che al tocco scorre dell'80% dell'altezza visibile (`scrollBy` morbido) e pulsa piano (opacità .6 ↔ 1, 1,6 s). Sparisce quando `read`.
   - Caselle: via il bordo lime della riga quando è spuntata (`.pt-auth .pt-check:has(input:checked)` → bordo come le altre); basta il tondo pieno. Quando `read` diventa vero i due tondi fanno un impulso (`scale` 1 → 1.15 → 1, 300 ms).
   - Pulsante: sempre «Continua» (via «Leggi fino in fondo per continuare»; la barra e la freccia lo dicono già).
4. **Passphrase — creazione**:
   - Etichetta «Passphrase (almeno 12 caratteri)» → «Passphrase». Sotto il primo campo, **12 tacche** (`div.pt-pwm` con 12 `<i>`, 4 px alte, raggio 2, distanza 4): accese lime le prime `min(p1.length, 12)`, le altre `rgba(255,255,255,.16)`; `aria-label="{n} di 12 caratteri"`.
   - **Occhio**: in ogni campo, a destra dentro il campo, un pulsante 44 px con icona `eye`/`eyeoff` (aria-label «Mostra» / «Nascondi»); un solo stato per entrambi i campi; cambia `type` tra `password` e `text`.
   - Sottotitolo «Se la perdi non si può recuperare.»: bianco pieno, 15/600, con icona `warn` 18 px in `var(--warn)` davanti.
   - I messaggi d'errore restano identici.
5. **Passphrase — sblocco** (49.jpg): `title` vuoto (via «Ciao»); via l'etichetta visibile «Passphrase» → segnaposto «Passphrase» + `aria-label`; occhio come sopra. Con errore «Passphrase non corretta.»: il campo fa la scossa e prende bordo `var(--bad)` (la nota d'errore resta).
6. **Collegamento**:
   - via il sottotitolo «Inquadra il QR mostrato dal professionista.».
   - Pulsante: «Inquadra il codice» → icona `qr` 20 px + «Inquadra il QR».
   - L'alternativa è chiusa: un `pt-link` «Incolla il codice»; al tocco compaiono l'area di testo (con `aria-label="Codice"`, via l'etichetta «Oppure incolla il codice») e «Collega». Se c'è un errore di fotocamera, apri l'alternativa da solo.
   - Le fasi successive (scansione, codice di verifica, attese, errori) restano identiche.
7. **Sfondo notte** (`Backdrop` in `bits.jsx`): nelle tre righe che scrivono il pixel, le basi `8`, `13`, `22` diventano `22`, `12`, `51` (notte `#160C33`); il resto della formula invariato. In CSS, per le sole schermate scure (in fondo, **senza** prefisso `body:has(.pt-main)`): `.pt-bg { background: #160C33; }` e la vignetta `.pt-bg-v` con `rgba(22,12,51,0)` → `rgba(22,12,51,.55)` al posto di `rgba(8,13,22,…)`. Nelle schermate chiare il canvas è già nascosto (`body:has(.pt-main) .pt-bg canvas { display: none }`) e il fondo è forzato a lilla: verifica che Home, Dieta, Schede e Profilo siano identiche a prima.

**Fatto quando**
1. Benvenuto: tre icone con una parola ciascuna, niente che sembri un campo; logo che entra ruotando una volta.
2. Informativa: scorrendo la barra lime avanza; la freccia fa scorrere; a fine testo le caselle si accendono; «Continua» si attiva solo con entrambe le caselle (logica invariata).
3. Passphrase: scrivendo, le tacche si accendono fino a 12; l'occhio mostra il testo in entrambi i campi; «Continua» disattivato è grigio traslucido; frase corta (< 12) → stesso errore di prima.
4. Sblocco con passphrase sbagliata: scossa + bordo rosso + nota.
5. Collegamento: un solo pulsante evidente; «Incolla il codice» apre l'area di testo.
6. Tutto a 375×812 e 360×640 senza scorrere (tranne il testo legale nel suo riquadro).

---

## 4. Fuori ambito (non farlo, anche se sembra utile)
- Foto, video o immagini degli esercizi; notifiche; calorie bruciate; orari dei pasti: i dati non esistono.
- Schermata di fine allenamento (`fin` in `Live.jsx`): solo la riga RPE della tappa 6. Titolo, frase, numeri e pulsante restano com'è (decisione rimandata al proprietario).
- Etichette di testo sotto le icone del dock.
- Conferma «tieni premuto» per eliminare: resta la conferma a due passi.
- Carosello a scorrimento dei giorni nel dettaglio scheda: resta il selettore.
- Categorie nella lista della spesa.
- Qualsiasi cambio a `logic.js`, `runtime.js`, `App.jsx`, `demo.js`, `summaryPdf.js`. Se una tappa sembra richiederlo: fermati e scrivilo.
- Tema scuro per le schermate chiare, o chiaro per Live/accesso.

## 5. Punti in cui decidere con sobrietà (annota la scelta in `STATO.md`)
- Se un'animazione scatta o distrae nell'anteprima: toglila, non «aggiustarla» con altra animazione.
- Se un numero senza etichetta risulta ambiguo in una schermata reale (non nel demo), rimetti l'etichetta **più corta possibile** e annotalo.
- Se un colore di sezione rende illeggibile un elemento che questo file non ha previsto: usa `--u-ink` su `--u-lilla-2`.
