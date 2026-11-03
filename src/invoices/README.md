# Fatture

Gestionale fatture. Ogni fattura è una **fotografia** salvata in `patient.fatture[]` (emittente, cliente, righe, aliquote,
numero e prefisso): cambiare dopo profilo o anagrafica non la altera, e si ristampa sempre identica.

```
invoices/
  invoiceLogic.js    numerazione (progressiva per anno su tutto l'archivio), totali (rivalsa, IVA, bollo), salva/elimina
  InvoiceModal.jsx   emette/modifica una fattura (dallo storico visite o dal gestionale)
  InvoicesView.jsx   guscio della Contabilità: anno, schede Panoramica / Fatture / Spese, nuova fattura, CSV
  accountingLogic.js totali, mesi, per paziente/tipo/metodo, categorie spese (funzioni pure)
  InvoiceIcon.jsx    icona SVG
  parts/             Overview (KPI, grafico, classifiche, soglia forfettario), InvoiceList (registro), Expenses (db.spese)
```

- Documento stampabile: `components/reports/printCenter/docs/invoice.js` (tipo `fattura` nel Centro stampa).
- Entrata: icona ricevuta nello storico visite (`VisitList`) e voce "Fatture" nella barra alta (`ProfessionalSuite`).
- Valori predefiniti: Impostazioni → Fatturazione → Nuove fatture (`db.utente.fatt_tariffa|fatt_prefisso|fatt_iva|fatt_rivalsa`).
- Non è fatturazione elettronica (niente XML/SDI): è la parcella/fattura da stampare e archiviare.
