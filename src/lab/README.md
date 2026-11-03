# Laboratorio

Workstation a sé dentro URBIOS (non una sottopagina): quaderno (esperimenti), protocolli, ricettario di reagenti, magazzino, registro campioni, articoli scientifici (bibliografia).
Non è legata ai pazienti. Dati in `db.lab = { quaderno, protocolli, reagenti, magazzino, campioni, articoli }` (stesso archivio, stesso salvataggio e cifratura).

```
lab/
  Lab.jsx           guscio: stato (vista, record aperto), Centro stampa (PrintCenterProvider con uno "studio" vuoto, come Chef), Excel
  parts/
    Sidebar.jsx     barra laterale come le Impostazioni (≥900px): ricerca su tutto, aree in gruppi (GROUPS), Excel completo, «Cambia area»
    Home.jsx        Panoramica essenziale: riepilogo, «Da fare» (scadenze, scorte, esperimenti in corso, campioni aperti), ultime pagine del quaderno, tasti «Crea»
    NotebookPreview.jsx  Quaderno unico a destra del modulo (solo Quaderno, ≥900px): il Centro stampa incorporato (`PrintCenter embedded`), fisso a destra, sempre visibile (niente Centro stampa a finestra per il Quaderno). Dentro c'è tutto il laboratorio: copertina, indice, indice figure/tabelle, esperimenti, protocolli, ricettario, magazzino, campioni, bibliografia (`notebookParts` in `printCenter/docs/lab.js`). Aspetto fisso bianco e nero; barra: zoom, carattere e dimensione del testo, Word (.doc), Stampa/PDF. Interruttore «Tutto / Solo questa pagina»
    SectionView.jsx elenco (ricerca, filtri a pastiglia da section.group, selezione per stampare) + editor accanto. Nel Quaderno: tasto tondo calendario (`ExperimentCalendar`, sola lettura: giorni con esperimenti segnati, tocco = titoli). Tasto Excel verde (`.lab-btn.is-ok`)
  sections.js       REGISTRO: campi, titoli, badge, group (filtri), sort e colonne Excel di ogni sezione. Per aggiungere un campo o una sezione si tocca solo qui
  RecordForm.jsx    editor generico (tipi: text, area, number, date, select, ref, steps, rows). SALVA DA SOLO dopo 500 ms (niente tasto Salva);
                    i campi sono in schede sempre aperte (`groups` in sections.js: titolo, keys); campo con `ph` (segnaposto); i `select` fino a 5 opzioni sono tasti. Un record nuovo nasce appena il primo campo è compilato. `inline` = pannello a destra, altrimenti finestra («Fatto»)
  FiguresEditor.jsx  figure del quaderno: carica immagine (ridotta a 1200 px) o crea grafico (istogramma, linee, torta) da una tabella dati, o «Aggiungi gel»: foto del gel con etichette delle corsie, marcatori di peso e bande indicate
  GelStudio.jsx     box del gel a tutto schermo, bianco/grigi neutri (niente beige). Lavora su una copia locale: il quaderno si aggiorna solo con «Salva» (Annulla/Esc chiede conferma). Schermi ≥1500px: 7 colonne per tipo (WIDE_COLS: Istogramma | Immagine+Zone | Ritaglio+Parti | Corsie | Marcatori | Bande | Aspetto+Esporta); sotto, due gruppi dalla barra a destra. Regolatori a pillola `Rng`; istogramma con curva, nero/bianco, Ombre/Mezzi/Luci e punti a numero.
  figures.js        pura: readImage, chartSvg (SVG del grafico), gelSvg (gel annotato), processGel (foto lavorata a pixel: ritaglio, rotazione, luminosità/contrasto, contrasto locale, fondo piatto, riduzione rumore), gelPng (esporta PNG), figureVisual (HTML per anteprima/stampa)
  Calc.jsx          Calcoli: diluizione C1·V1=C2·V2 e massa per soluzione molare
  labLogic.js       funzioni pure: salva/elimina, stato scorte, overview() per la Panoramica, searchAll(), scala ricette, calcoli
  xlsx.js           scrittura .xlsx senza librerie (usa dataExchange/zip.js); sheetsFor() in sections.js compone i fogli
  labStyles.js      CSS lab-*: stesso linguaggio delle Impostazioni (set-side, .panel, bottoni come st-btn), solo token di index.css
  ui/icons.jsx      <Icon name="..."/>: SVG a tratto 1.6, 24x24 (niente Phosphor nel Laboratorio). Nuova icona = voce in PATHS
  print/            stampa del quaderno: notebookPages.js (pura: testo a capo con misure vere, una riga per quadretto, pagine con «Dalla/Alla pagina»), NotebookPage.jsx (A4 a quadretti da 5 mm, intestazione, firme)
  LabIcon.jsx       icona SVG (beuta)
```

- Layout: sotto i 900px niente barra laterale: intestazione con schede scorrevoli ed editor a finestra (`useCompact(899)` in `Lab.jsx`).
- Stampa: Centro stampa in modalità `scope="lab"` (prop di `PrintCenterProvider`): solo documenti di laboratorio, niente gruppi di documenti, niente «Aggiungi un documento», nessun dato del paziente. Tipo `lab` (`printCenter/docs/lab.js`). Non è in `TYPE_ORDER`, quindi nella scheda paziente non compare.
  Opzioni: `kind` (quaderno | protocolli | reagenti | magazzino | campioni | articoli), `ids`, `volume` (scala le quantità del ricettario sul volume finale voluto).
- Excel: una sezione alla volta (tasto «Excel» sopra l'elenco) o tutto in un file con un foglio per sezione. Testi lunghi (passaggi, componenti) in una sola cella.
- Entrata: scelta area dopo il login (`views/ModeSelect.jsx`, gestita in `App.jsx`); «Cambia area» torna alla scelta.
- Possibili passi successivi: collegare i componenti delle ricette agli articoli di magazzino (scarico automatico), figure sulla pagina a quadretti stampata, import da Excel.
- Quaderno stampato: tipo `quaderno` (kind `notebook`) nel Centro stampa, pagine intere senza intestazione/piè del Centro stampa. Viste: «Con gli esperimenti» o «Pagine vuote» (numerate, da compilare a mano; tasto «Pagine vuote» sopra l'elenco). Opzioni: N. quaderno, numero della prima pagina, quante pagine.
