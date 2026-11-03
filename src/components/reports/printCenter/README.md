# Centro stampa

Un solo posto per stampare, salvare in PDF e inviare tutti i documenti del paziente.
Si apre dal tasto stampante nella barra in alto della scheda paziente (e dai vecchi pulsanti "Stampa", che ora portano qui già sul documento giusto).

```
printCenter/
├── PrintCenterProvider.jsx   contesto: usePrintCenter().open(...) e usePrintDraft (visita in corso)
├── PrintCenter.jsx           contenitore: documenti, stile, impaginazione, stampa/PDF/invio
├── catalog.jsx               cosa si può stampare (tipi, disponibilità, opzioni, pacchetti pronti)
├── docs/                     grafica dei documenti (report visita, progressi, piano alimentare)
├── logic/paginate.js         motore di impaginazione A4 (spezza blocchi, tabelle, paragrafi; ricuce le modifiche)
├── logic/theme.js            elenco dei layout, colori, margini (salvati in db.stampa.tema)
├── layoutStyles.js           grafica dei 10 layout (Elegante, Giocoso, Planner, Energia, Geometrico, Naturale, Editoriale, Istituzionale, Pastello, Fresco)
├── logic/visits.js           visite e indici nel formato dei documenti
├── parts/                    foglio A4 e copertina, barra laterale, barra di scrittura
└── printCenterStyles.js      CSS (interfaccia, foglio, documenti, layout, stampa)
```

Come funziona l'impaginazione: ogni documento "flow" è HTML. Viene misurato in un foglio nascosto identico a quelli
visibili e diviso in pagine vere; ogni pezzo ricorda il suo elemento d'origine (`data-pc-id`), così dopo una modifica
a mano le pagine si ricuciono (`mergeFragments`) e si reimpaginano. Le pagine dei grafici sono "fixed": già composte,
si riducono da sole per stare nel foglio. In `db.stampa` restano solo stile, ultimo pacchetto e pacchetti salvati.
Le modifiche a mano si salvano alla chiusura (se confermi) in `paziente.stampaModifiche`, per documento+opzioni (`editKey`), e si ripristinano all apertura.

`PrintCenterProvider scope="lab"` (Laboratorio, `src/lab/`): il Centro stampa mostra solo i documenti passati a `open()`, senza gruppi (`PresetPicker`) né «Aggiungi un documento» (`AddMenu`), e non salva l'ultimo gruppo usato.

Kind `notebook` (tipo `quaderno`, solo Laboratorio): pagine già composte a tutto foglio (`Sheet bare noBrand`), elenco da `notebookPagesOf` in `catalog.jsx`; grafica in `src/lab/print/`.
