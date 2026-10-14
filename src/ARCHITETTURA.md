# Architettura di URBIOS (src/)

Regola d'oro: **un file = una responsabilità**. Se un file supera ~250 righe di sola UI, si spezza.
Il codice non "sa" dove si trova: ogni cartella segue lo stesso schema, sempre.

## Mappa
```
src/
├── main.jsx / App.jsx / index.css     avvio, routing, stato globale (db), stili globali
├── views/                             SCHERMATE intere (una per "pagina")
├── components/                        pezzi riusabili o per area funzionale
│   ├── ui/                            mattoncini generici (Button, Card, InputGroup...)
│   ├── charts/                        grafici (BIVA, Somatocarta, SmartPlot)
│   ├── reports/                       stampe: printCenter/ = Centro stampa (unico motore: compone, impagina in A4, modifica, stampa/PDF)
│   ├── visuals/                       effetti grafici (shader)
│   └── patient/                       moduli della scheda paziente (Storico, Training, Dieta...)
├── dataExchange/                      IMPORT/EXPORT: CSV, documenti, ZIP, anonimizzazione, unione dati (vedi dataExchange/README.md)
├── storage/                           ARCHIVIO: cifratura, file, copia di lavoro, login/logout (vedi storage/README.md)
└── logic/                             funzioni pure condivise e dati di default (niente React)
```

## Schema di ogni modulo "grosso" (stessa forma per Dieta, Training, Storico, Nuova visita...)
```
<modulo>/
├── <Modulo>.jsx        contenitore: stato + composizione. Poca UI, niente CSS lungo
├── views/ | sections/  blocchi fissi della schermata
├── modals/             una finestra = un file (si apre con un flag `isXxxOpen`)
├── tabs/ | parts/      sotto-pezzi di una sezione/modale
├── ui/                 piccoli componenti usati solo dal modulo
├── hooks/              logica con stato (useXxx): handler e effetti raggruppati per tema
├── logic/              funzioni pure del modulo (calcoli, costruzione HTML, impaginazione)
├── data/               costanti, database di default, cataloghi
├── styles/ + *Styles.js  CSS del modulo (stringhe iniettate via <style>, NON globali)
└── README.md           (opzionale) note del modulo
```

## Dove metto...?
| Voglio aggiungere...                    | Lo metto in                                  |
|-----------------------------------------|----------------------------------------------|
| una nuova finestra (pop-up)             | `<modulo>/modals/NomeModal.jsx` + flag di stato nel contenitore |
| una nuova sezione di un form            | `<modulo>/sections/` (o `tabs/`)             |
| una formula / calcolo                   | `<modulo>/logic/` (o `src/logic/` se serve a più moduli) |
| un valore costante / DB di default      | `<modulo>/data/`                             |
| un handler che modifica lo stato        | `<modulo>/hooks/useXxx.js`                   |
| un pulsante/campo generico              | `components/ui/`                             |

## Convenzioni
- **Props esplicite**: i componenti estratti ricevono tutto via props. Se compare `X is not defined`
  dentro un componente, manca una prop da passare dal contenitore.
- **Stato nel contenitore**, non nei modali: così i valori sopravvivono a apertura/chiusura (come prima del riordino).
- **Dati utente solo nel `db`** (mai `localStorage`): così finiscono nel file archivio e spariscono con "Esci".
- **Import relativi** sempre (mai percorsi assoluti `/Users/...`).
- **Bug trovati mentre si lavora → `BUGS.md`** (in radice progetto), non si correggono "di passaggio".
- Cartelle in `camelCase` per i sotto-moduli (`nutritionSetup/`), componenti in `PascalCase.jsx`, hook `useXxx.js`.

## Controlli rapidi
```bash
npm run build      # il build deve passare
```
