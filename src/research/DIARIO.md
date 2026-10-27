# Ricerca — diario dei lavori (leggere PRIMA di toccare `src/research/`)

Unità di lavoro separata per l'**analisi statistica** dei dati dei pazienti (tesi, studi, ricercatori e studenti).
Questo file è il punto di coordinamento tra chat diverse: **chi lavora qui aggiorna il registro in fondo** e sceglie un compito
dall'elenco "Da fare" segnandolo come `[in corso: <data> <breve descrizione chat>]`. Così ogni chat può partire leggendo solo questo file.

## Regole
- **Tutto dentro `src/research/`.** Fuori c'è un solo aggancio: `src/views/ProfessionalSuite.jsx` (stato `research`, pulsante "Ricerca"
  nella barra alta su desktop e voce "Ricerca" nel foglio "Altro" su telefono). Non serve toccare altro.
- **Sola lettura**: il modulo non modifica mai il `db` (niente `onUpdateDb`). Niente `localStorage` (regola di `ARCHITETTURA.md`).
- **Anonimo per costruzione**: il dataset usa codici `P001…`; identificativi, luoghi, date esatte e testi liberi sono esclusi
  (`BLOCKED` + `FREE_TEXT_KEY_RE` in `logic/dataset.js`, presi da `dataExchange/anonymize.js`).
- **Ogni test statistico nuovo va verificato con R** (`Rscript` è installato) e aggiunto a `logic/stats/selfcheck.mjs`.
  Controllo: `node src/research/logic/stats/selfcheck.mjs` → deve dire "Tutto ok".
- I file in `logic/stats/` importano con estensione `.js` (servono a node per il selfcheck). Il resto usa import senza estensione come l'app.
- Non lanciare `npm run build` (lo fa l'utente alla fine). Per provare: `npm run dev` → home → "Ricerca".
- Testi dell'interfaccia in italiano; numeri all'italiana; p-value in stile APA (`fmtP` in `logic/report.js`).

## Mappa
```
src/research/
├── Research.jsx              contenitore: livello del dataset, paziente di esempio sì/no, schede
├── DIARIO.md                 questo file
├── data/labels.js            nomi leggibili delle variabili (ricavati dai cataloghi dell'app + aggiunte)
├── logic/
│   ├── dataset.js            db → { rows, vars } anonimo; LEVELS (prima / ultima visita / tutte le visite),
│   │                         splitBy (gruppi), firstLastPairs (prima vs ultima visita), groupingVars
│   ├── report.js             formattazione (fmt, fmtP), frase APA, grandezza dell'effetto,
│   │                         scelta guidata: compareGroups / comparePaired (controlla normalità e varianze)
│   └── stats/                motore puro, senza React né librerie
│       ├── distributions.js  normale, t, chi², F, beta/gamma incomplete, quantili
│       ├── descriptive.js    media, DS, quantili (tipo 7), asimmetria, curtosi, describe, frequencies, rank
│       ├── tests.js          Shapiro-Wilk (Royston), t indipendente (Welch/Student), t appaiato, t a un campione,
│       │                     Mann-Whitney, Wilcoxon, ANOVA, Levene (Brown-Forsythe), Kruskal-Wallis,
│       │                     crosstab, chi², Fisher 2x2, Pearson, Spearman
│       ├── regression.js     regressione lineare semplice e multipla (OLS)
│       └── selfcheck.mjs     confronto con R (29 controlli)
├── sections/                 una scheda = un file
│   ├── DataPanel.jsx         anteprima + CSV anonimo + dizionario delle variabili
│   ├── DescriptivePanel.jsx  tabella descrittive (anche per gruppo), istogramma, frequenze
│   ├── ComparePanel.jsx      gruppi indipendenti (2 o più) con boxplot
│   ├── PairedPanel.jsx       prima visita vs ultima visita
│   ├── CorrelationPanel.jsx  Pearson/Spearman + matrice di correlazione
│   ├── RegressionPanel.jsx   regressione con tabella coefficienti e residui
│   └── CrosstabPanel.jsx     tabella di contingenza + chi² / Fisher
├── ui/                       ResultCard (+ AssumptionsCard, GroupsTable), VarSelect, charts (SVG puri)
└── styles/researchStyles.js  CSS del modulo (classi `rs-`)
```

## Forma dei dati (contratto tra i file)
- Dataset: `{ level, rows: [{ _code, _pid, _date, <chiave>: number|string }], vars: [{ key, label, type: 'num'|'cat', n, distinct }], nPatients, nVisits }`.
  Numeriche = `number` (NaN se mancante); categoriche = stringa (`''` se mancante).
- Risultato di un test: `{ test, stat: { name, value }, df, p, effect: { name, value }, ci?, groups?, notes: [], error? }`.
  Con questa forma `ResultCard` e `report.sentence` funzionano senza casi speciali.

## Da fare (compiti indipendenti: prendine uno, segnalo, aggiorna il registro)
1. **Filtri del campione**: sesso, fascia d'età, stato del paziente, periodo delle visite; mostrare n prima/dopo il filtro. (solo `Research.jsx` + `logic/dataset.js`)
2. **Post-hoc** dopo ANOVA/Kruskal: Tukey HSD (serve la distribuzione del range studentizzato) e Dunn con correzione di Holm/Bonferroni. (`logic/stats/posthoc.js` + `ComparePanel.jsx`)
3. **Variabili derivate**: variazione % prima→ultima, raggruppare una numerica in classi (es. BMI in categorie OMS), rapporto vita/fianchi, ecc. (`logic/derived.js` + `dataset.js`)
4. **Test esatti per piccoli campioni**: Mann-Whitney e Wilcoxon esatti se n < 50 senza ties (come R). (`tests.js` + selfcheck)
5. **Regressione con predittori categorici** (dummy automatiche) e **logistica** binaria. (`regression.js`)
6. **Calcolo della dimensione del campione / potenza** (t, proporzioni, correlazione) per i progetti di tesi. (nuova scheda)
7. **Esportazione del report** (tabelle + frasi APA + grafici) nel Centro stampa o come .doc. Coordinarsi con chi lavora su `components/reports/printCenter/`.
8. **Sezione "Metodi"** generata: frase con software, test usati, livello α, gestione dei mancanti, da incollare nella tesi.
9. **Analisi longitudinale** su tutte le visite (modelli misti o almeno pendenze individuali) per superare il limite delle visite non indipendenti.
10. **Grafici**: esportare in SVG/PNG, errore standard sulle barre, QQ-plot per la normalità.

## Limiti noti
- Mann-Whitney e Wilcoxon usano l'approssimazione normale (con correzione per continuità e pari merito): con gruppi piccoli il p-value è indicativo (nota mostrata nell'interfaccia).
- Spearman: p-value con l'approssimazione t (R con `exact=FALSE` coincide).
- I codici P001… dipendono dall'ordine dei pazienti nell'archivio: stabili nella sessione, non tra archivi diversi.
- Variabile numerica = almeno l'80% dei valori numerici; categorica = al massimo 15 modalità; il resto è escluso.

## Registro
- **2026-10-27** — Creata l'unità: motore statistico verificato con R (29/29), dataset anonimo, 7 schede (Dati, Descrittive,
  Confronta gruppi, Prima/dopo, Correlazione, Regressione, Tabelle di contingenza), scelta guidata parametrico/non parametrico,
  frase APA copiabile, CSV + dizionario. Aggancio in `ProfessionalSuite.jsx`.
  Attenzione: l'aggancio è finito per sbaglio nel commit 2f9e1b7 di un'altra chat ("Aspetto Vetro"), mentre `src/research/`
  non è ancora in git → finché non si fa il commit di `src/research/`, una copia pulita del repo non compila.
  Provato con 40 pazienti finti (rendering di tutte le schede, nessun nome nei risultati).
