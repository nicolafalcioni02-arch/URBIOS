# Laboratorio

Workstation a sé dentro URBIOS (non una sottopagina): quaderno (esperimenti), protocolli, ricettario di reagenti, magazzino, registro campioni, articoli scientifici (bibliografia).
Non è legata ai pazienti. Dati in `db.lab = { quaderno, protocolli, reagenti, magazzino, campioni, articoli }` (stesso archivio, stesso salvataggio e cifratura).

```
lab/
  Lab.jsx           guscio: stato (vista, record aperto), Centro stampa (PrintCenterProvider con uno "studio" vuoto, come Chef), Excel
  parts/
    Sidebar.jsx     barra laterale come le Impostazioni (≥900px): ricerca su tutto, aree in gruppi (GROUPS), Excel completo, «Cambia area»
    Home.jsx        Panoramica essenziale: riepilogo, «Da fare» (scadenze, scorte, esperimenti in corso, campioni aperti), ultime pagine del quaderno, tasti «Crea»
    SectionView.jsx elenco (ricerca, filtri a pastiglia da section.group, selezione per stampare) + editor accanto
  sections.js       REGISTRO: campi, titoli, badge, group (filtri), sort e colonne Excel di ogni sezione. Per aggiungere un campo o una sezione si tocca solo qui
  RecordForm.jsx    editor generico (tipi: text, area, number, date, select, ref, steps, rows). SALVA DA SOLO dopo 500 ms (niente tasto Salva);
                    un record nuovo nasce appena il primo campo è compilato. `inline` = pannello a destra, altrimenti finestra («Fatto»)
  Calc.jsx          Calcoli: diluizione C1·V1=C2·V2 e massa per soluzione molare
  labLogic.js       funzioni pure: salva/elimina, stato scorte, overview() per la Panoramica, searchAll(), scala ricette, calcoli
  xlsx.js           scrittura .xlsx senza librerie (usa dataExchange/zip.js); sheetsFor() in sections.js compone i fogli
  labStyles.js      CSS lab-*: stesso linguaggio delle Impostazioni (set-side, .panel, bottoni come st-btn), solo token di index.css
  ui/icons.jsx      <Icon name="..."/>: SVG a tratto 1.6, 24x24 (niente Phosphor nel Laboratorio). Nuova icona = voce in PATHS
  LabIcon.jsx       icona SVG (beuta)
```

- Layout: sotto i 900px niente barra laterale: intestazione con schede scorrevoli ed editor a finestra (`useCompact(899)` in `Lab.jsx`).
- Stampa: Centro stampa in modalità `scope="lab"` (prop di `PrintCenterProvider`): solo documenti di laboratorio, niente gruppi di documenti, niente «Aggiungi un documento», nessun dato del paziente. Tipo `lab` (`printCenter/docs/lab.js`). Non è in `TYPE_ORDER`, quindi nella scheda paziente non compare.
  Opzioni: `kind` (quaderno | protocolli | reagenti | magazzino | campioni | articoli), `ids`, `volume` (scala le quantità del ricettario sul volume finale voluto).
- Excel: una sezione alla volta (tasto «Excel» sopra l'elenco) o tutto in un file con un foglio per sezione. Testi lunghi (passaggi, componenti) in una sola cella.
- Entrata: scelta area dopo il login (`views/ModeSelect.jsx`, gestita in `App.jsx`); «Cambia area» torna alla scelta.
- Possibili passi successivi: collegare i componenti delle ricette agli articoli di magazzino (scarico automatico), allegati/foto, import da Excel.
