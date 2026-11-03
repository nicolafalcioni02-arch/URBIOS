# Laboratorio

Gestionale di laboratorio dentro URBIOS: protocolli, ricettario di reagenti, magazzino, registro campioni. Non è legato ai pazienti.
Dati in `db.lab = { protocolli, reagenti, magazzino, campioni }` (stesso archivio, stesso salvataggio e cifratura).

```
lab/
  Lab.jsx         guscio: schede, ricerca, elenco a carte, selezione per stampare, Excel. Avvolto in PrintCenterProvider con uno "studio" vuoto (come Chef)
  sections.js     REGISTRO: campi, titoli, badge e colonne Excel di ogni sezione. Per aggiungere un campo o una sezione si tocca solo qui
  RecordForm.jsx  finestra di modifica generica (tipi: text, area, number, date, select, ref, steps, rows)
  Calc.jsx        scheda Calcoli: diluizione C1·V1=C2·V2 e massa per soluzione molare
  labLogic.js     funzioni pure: salva/elimina, stato scorte (scaduto / sotto scorta / in scadenza 30 g), scala ricette, calcoli
  xlsx.js         scrittura .xlsx senza librerie (usa dataExchange/zip.js); sheetsFor() in sections.js compone i fogli
  labStyles.js    CSS lab-*, solo token di index.css
  LabIcon.jsx     icona SVG (beuta)
```

- Stampa: Centro stampa, tipo `lab` (`printCenter/docs/lab.js`). Non è in `TYPE_ORDER`, quindi nella scheda paziente non compare.
  Opzioni: `kind` (protocolli | reagenti | magazzino | campioni), `ids`, `volume` (scala le quantità del ricettario sul volume finale voluto).
- Excel: una scheda alla volta (tasto «Excel») o tutto in un file con un foglio per sezione. Testi lunghi (passaggi, componenti) in una sola cella.
- Entrata: icona beuta nella barra alta (`ProfessionalSuite`) e voce «Laboratorio» nel menù del telefono.
- Possibili passi successivi: collegare i componenti delle ricette agli articoli di magazzino (scarico automatico), allegati/foto, import da Excel.
