# Importa & Esporta (src/dataExchange/)

Interfaccia: Impostazioni → **Importa & Esporta** (`views/settings/tabs/dataExchange/`).
Tutto è locale: i file vengono generati nel browser e scaricati, nulla viene inviato in rete.

```
dataExchange/
├── util.js, csv.js, zip.js      mattoncini senza librerie (CSV per Excel italiano, ZIP con nomi UTF-8)
├── anonymize.js                 anonimizzazione con checklist per campo + controllo di sicurezza sui testi
├── export/
│   ├── tables.js                db → tabelle (pazienti, visite, dieta, allenamento, archivi)
│   ├── documents.js             db → documenti .txt / .doc (blocchi neutri + due renderer)
│   └── bundle.js                scelta pazienti, anonimizzazione, assemblaggio, ZIP, LEGGIMI.txt
└── import/
    ├── analyze.js               riconosce il file (archivio, esportazione, CSV, liste JSON, archivi cifrati)
    ├── csvImport.js             CSV → pazienti / visite / alimenti / esercizi / formule + modelli scaricabili
    └── merge.js                 unione PURA nel db attuale con rapporto (serve all'anteprima e all'import)
```

## Regole importanti
- **Nuovo campo** nel paziente o nella visita? Viene esportato da solo (le colonne si ricavano dai dati). Per dargli un nome/ordine
  nelle tabelle aggiungilo in `first` di `tables.js`; per renderlo "sensibile" aggiungilo a `PATIENT_FIELDS` in `anonymize.js`.
- **Testi liberi**: una chiave è considerata testo libero se corrisponde a `FREE_TEXT_KEY_RE` (note, anamnesi, valutazione, commento...).
  Se aggiungi un campo di testo con un altro nome, aggiornala, altrimenti non verrà tolto dagli export anonimi.
- **Tabella di corrispondenza** (codice anonimo ↔ paziente): si scarica a parte e non finisce MAI nello ZIP.
- Gli ID delle visite sono timestamp: nell'export anonimo vengono sempre rinumerati (V01, V02...), perché rivelerebbero data e ora.
- L'allenamento si esporta da `paziente.allenamento.weeks` (oggi le schede non vengono salvate: vedi `BUGS.md`).
