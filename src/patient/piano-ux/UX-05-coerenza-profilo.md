# UX-05 — Coerenza grafica e Profilo

Prima leggi `REGOLE.md` e `STATO.md`. Richiede UX-00…UX-04 «fatto».

## Obiettivo
Un solo sistema di colori nelle schermate chiare (lilla, bianco, viola, lime), un solo elemento lime pieno per schermata, pagina Profilo in ordine. Nessuna funzione nuova. **Cambi piccoli e misurati:** il proprietario preferisce poco a troppo.

## File che puoi toccare
- `src/patient/ui/TrainDetail.jsx`
- `src/patient/ui/Schede.jsx`
- `src/patient/ui/Nutrition.jsx`
- `src/patient/ui/Settings.jsx`
- `src/patient/ui/bits.jsx` (solo l'icona `scale`)
- `src/patient/patient.css` (solo in fondo)
- chiusura: `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `src/patient/ui/summaryPdf.js` righe 225-241, `src/patient/ui/MealSheet.jsx`.

## Non toccare
Live e le schermate di accesso (restano scure). La Home (anelli, disposizione). La struttura «parte colorata in alto + foglio bianco» di Dieta e Schede. I colori dei grafici (toni di lime e nero). Nessun cambio di disposizione o di dimensioni oltre a quelli scritti qui.

## Cosa fare

### 1. Via i colori pastello dagli esercizi
- `TrainDetail.jsx:6`: `TONES` (viola, rosa, turchese, giallo, verde) colora il numero dell'esercizio (`:73`) e i pallini delle serie fatte (`:81`). Elimina `TONES` e la variabile `tone`: il numero ha fondo `#DCD2FF` e testo `#0B0C0E`; i pallini fatti hanno fondo `#B4E600`. Stesso colore per tutti gli esercizi.
- `Schede.jsx:11`: la costante `TONES` non è usata: cancella la riga.

### 2. Via i grigio-azzurri
- `Schede.jsx:10` (`OLD.bg`) e `Nutrition.jsx:71` (`background: '#DADDE5'`): diventano `#DCD2FF`. Controlla che il cerchietto interno (`.pt-sc-i`) si distingua ancora dal fondo; se no, fallo bianco con una regola in fondo al CSS.
- Riquadri dentro il foglio bianco: oggi `#F4F5F8` e `#F1F2F5`. Con **una sola** regola in fondo a `patient.css`, sotto `/* UX-05: riquadri nel tema lilla */` e con prefisso `body:has(.pt-main)` (così Live resta com'è), porta a `#F3EEFF` il fondo di: `.pt-cd`, `.pt-gr`, `.pt-ml`, `.pt-seg3`, `.pt-xt`, `.pt-lst-r`, `.pg-lt .pg-card`, `.pt-td-sc .pt-xc`, `.pt-td-sc .pt-xc.is-open`, `.pt-td-sc .pt-wk` (non quello `.is-on`, che resta lime), `.pt-td-sc .pt-dsw`. Usa `!important` solo dove la regola vecchia lo usa o non riesci a vincerla.
- Bordi e barre `#DADDE5` nei grafici chiari (`.pg-lt .pg-bar u`, `.pg-lt .pg-grid i`, `.pg-lt .pg-ex-l button`, `.pg-lt .pg-caps i`): `#DCD2FF`, senza toccare le varianti lime (`.is-today`, `.is-on`) né `.is-over`.
- Prima di scrivere la regola cerca con grep ogni selettore per sapere cosa stai sovrascrivendo. Dopo, guarda ogni schermata dell'elenco «Fatto quando»: un elemento selezionato o un testo non devono diventare illeggibili. Se un selettore dell'elenco non esiste più, saltalo e annotalo.

### 3. Un solo lime per schermata
- **Profilo** (`Settings.jsx`): resta lime solo «Invia il riassunto». «Aggiorna piani» (`:29`) prende la classe `pt-btn ghost` come «Esci». Il blocco URBIOS in fondo (`.pt-about`, `:36-40`) diventa un riquadro bianco come gli altri: fondo `#fff`, testo `#0B0C0E`, raggio 32 px, logo a 28 px (`size={28}`), scritta 16 px; con regole in fondo al CSS. Deve restare almeno 24 px di aria tra il blocco e il menu in basso quando si scorre fino in fondo: se serve, aumenta lo spazio in fondo alla pagina con `.pt-main:has(.pt-about)`.
- **Registro pasto** (`MealSheet.jsx`, non modificarlo): i pulsanti «Sostituisci» e «Togli» sono lime su ogni riga. Trova con grep la regola `.pt-food-a button` e in fondo al CSS dagli fondo `#DCD2FF` e testo `#0B0C0E`. «Conferma e salva nel diario» resta l'unico lime.

### 4. Profilo in ordine
- `Settings.jsx:18`: `<Head title="Impostazioni" onBack={onBack} />` diventa `<Head title="Profilo" />` (il tab si chiama Profilo e la freccia indietro in un tab non serve). La prop `onBack` del componente resta nella firma, inutilizzata.
- `Settings.jsx:27`: testo del pulsante «Invia il riassunto» (una riga a 375 px). Mentre lavora: «Creo il PDF…».
- Conferma che resta: l'esito non sostituisce più il testo del pulsante e non sparisce dopo 3 secondi. Compare come riga di testo sotto il pulsante (`<p className="pt-muted">`), e resta finché si rimane nella pagina: «PDF salvato nei file», oppure «Riassunto inviato» con `'shared'`, oppure «Non sono riuscito a creare il PDF» in caso di errore. Con `'cancel'` (condivisione annullata) non mostrare nulla. I tre valori restituiti da `shareSummary` sono `'saved'`, `'shared'`, `'cancel'` (`summaryPdf.js:231-241`).

### 5. Testo grigio leggibile sul lilla
Solo in Home, solo colore: `.hm2-s` («4 esercizi, circa 18 min») e `.hm2-day span` (giorno della settimana negli anelli) passano da `#6C727F` a `#3A3F4B` (già usato per `.hm2-k`). Regola in fondo al CSS. Nient'altro in Home.

### 6. Icona Peso distinta da Controllo
`bits.jsx:9`: l'icona `scale` è un quadrato arrotondato come `calendar`. Sostituisci il suo contenuto con una bilancia tonda:
`<><circle cx="12" cy="12" r="8.5" /><path d="M8.5 10.5a4.5 4.5 0 0 1 7 0M12 12.5l2-2.5" /></>`
Controlla in Home che a 22 px si legga e che sia centrata nel cerchio come le altre. Se il disegno non convince, ritocca solo le coordinate restando su cerchio + arco + lancetta, tratto 1.6.

## Fatto quando (`?prova`, 375×812; per ogni punto guarda anche `?prova&lungo`)
1. Dettaglio scheda (Home → «Inizia»): tutti i numeri degli esercizi hanno lo stesso fondo lilla; nessun rosa, turchese, giallo. Completo una serie in Live, esco: il pallino fatto è lime.
2. Tab Schede: «Le tue vecchie schede» lilla, non grigio; le quattro viste (Sedute, Serie, Muscoli, Forza) hanno riquadri `#F3EEFF` e testi leggibili; il selettore attivo si distingue.
3. Tab Dieta: «Fuori piano», pasti, selettore giorni, «Storico e modifica dei giorni», «Alcune info sulla tua alimentazione» senza grigio-azzurro; aperti i due riquadri a comparsa (storico e info): idem.
4. Controllo a campione con `getComputedStyle` su `.pt-ml`, `.pt-cd`, `.pt-gr`: fondo `rgb(243, 238, 255)`.
5. Entro in Live: le voci di «Storico» e «Note» hanno ancora il fondo di prima (`#F4F5F8`): Live non è cambiato.
6. Registro pasto (Home → «Pasti»): un solo elemento lime (il tasto di conferma).
7. Profilo: titolo «Profilo» senza freccia; un solo lime («Invia il riassunto», su una riga); blocco URBIOS bianco e staccato dal menu anche scorrendo in fondo; tocco «Invia il riassunto» → sotto compare una riga che dopo 5 secondi è ancora lì.
8. Home: «Peso» e «Controllo» si distinguono a colpo d'occhio; il testo sotto il titolo dell'allenamento è più scuro di prima.
9. Screenshot di: dettaglio scheda, tab Schede, tab Dieta, registro pasto, Profilo, Home. Console senza errori.

## Lasciato fuori di proposito (non farlo)
- L'arancione `#F2B84B` delle barre kcal sopra l'obiettivo: è un avviso, resta.
- Etichette di testo sotto le icone del menu in basso.
- Anelli della Home con dati veri.
