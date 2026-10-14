# BUG & DA SISTEMARE

File di segnalazione: durante il riordino NON si correggono i comportamenti, si annotano qui.
Formato: `[ ]` aperto · `[x]` risolto. Ogni voce: dove, cosa succede, fix proposto.

## Aperti

- [ ] **Autosave Dieta azzera lo stato del piano** — `src/components/patient/diet/hooks/useDietPlanData.js` (useEffect "Autosave Reattivo", `dietStatus: status`).
  `status` non è definita in quello scope: nel browser risolve a `window.status` (stringa vuota) e sovrascrive lo stato scelto in "Salva e Gestisci" al primo autosave successivo.
  Fix proposto: `dietStatus: v.dietStatus`.
- [ ] **File duplicati vuoti** — `src/components/charts/ReportPreviewModal.jsx` e `src/components/charts/LetteraIncaricoModal.jsx` (0 righe). Gli originali sono in `components/reports/`. Eliminare.
- [x] **`prompt()` per creare un paziente** (risolto: ora c'è un pannello con nome, cognome e sesso) — `src/views/ProfessionalSuite.jsx` (`handleAddPatient`). Non funziona in webview/browser embedded e non è testabile; sostituire con un modale.
- [ ] **`status` non definita nell'autosave** → vedi primo punto (stessa voce, non duplicata).
- [ ] **Navigazione "Scarica Database" (sito web) non fa nulla** — solo sito, fuori da questo progetto: `sito web.html`, `confirmLegal()` gestisce `dl_software` e `URBIOS.html` ma non `dl_db`. Il logo nav usa `gsap.to(window,{scrollTo:0})` ma il plugin ScrollTo non è caricato (non scrolla). Il tag `<h1 className=...>` nel mockup step 2 è sintassi React dentro HTML (`class`).

- [x] **`console.error "Errore nella formula:"` in "Nuova Visita"** (risolto: le formule predefinite usano `data.logSomma` ma `calculateEquation` non passava `data`, quindi densità e massa grassa dalle pliche restavano a zero; ora `data` è disponibile). Nota originale: — compare (anche nell'originale) quando nel paziente esiste già una visita "Solo Dieta". `src/logic/calculations.js` (`calculateEquation`): le formule vengono valutate con un `draft` privo di alcune variabili e finiscono nel catch. Verificare quali formule/chiavi mancano.
- [ ] **Storico: variazione peso tra visite dello stesso giorno** — `history/HistoryView.jsx` (`getWeightDelta`): se due visite hanno la stessa data l'ordinamento è instabile e il delta può risultare di segno opposto (visto: 80 kg "+10 kg" rispetto a una visita "Solo Dieta" con peso di default 70). Da verificare con dati reali.

- [x] **Unità "PROVA" nei range ematici** (risolto: ora mg/dL) — `src/logic/db_defaults.js` (`DEFAULT_RANGE_EMATO.bg_glicemia.unit: 'PROVA'`): resto di un test, compare come unità della glicemia (anche negli export `range_ematici.csv`). Dovrebbe essere `mg/dL`.
- [ ] **Dati demo incoerenti** — `src/components/Pazienti_demo/casiDemo.js`: i valori nutrizionali degli alimenti sono per 100 g nell'app, ma alcuni sono per porzione (es. "Olio EVO" 10 g con kcal 90 invece di ~899): i totali del piano demo risultano sbagliati.
- [ ] **Import archivio: il conteggio "formule" include quelle di default** — `import/analyze.js`: `normalizeDb` aggiunge le formule di default anche se il file non le contiene, e l'anteprima le conta come "4 formule" (non vengono comunque duplicate).
- [ ] **Icona `ph-file-signature` inesistente** — `components/patient/info/DocumentsPanel.jsx` e `documentsLogic.js` usano `ph-file-signature`, che in @phosphor-icons/web 2.0.3 non c'è: l'icona resta vuota. Fix proposto: `ph-signature` (già usata nel Centro stampa).

## Training: idee e limiti noti
- [ ] **Foto e dimensione dell'archivio** — le foto del professionista sono incorporate nel file (~35 KB l'una, max 4 per esercizio). Con centinaia di foto il file archivio diventa pesante (e la cifratura/salvataggio più lenti). Valutare un avviso sulla dimensione o un limite complessivo.
- [ ] **Catalogo esercizi** — 86 voci: servono più esercizi (mobilità, core, funzionale, kettlebell) e i nomi in inglese/alias più usati nelle palestre italiane.
- [ ] **Soglie degli avvisi** da far validare a un professionista (`training/logic/science/guidelines.js`): sono indicazioni di letteratura, non prescrizioni.
- [ ] **Muscoli dei cardio** — gli esercizi cardio hanno i muscoli "principali" del database inglese (es. quadricipiti per la corsa) ma sono esclusi dal volume per muscolo; le serie su macchine/forme non catalogate usano solo il campo "Gruppo".

## Idee / limiti noti dell'archivio (da decidere)
- [ ] **Blocco automatico dopo inattività** (es. 10 min) per gli archivi cifrati: oggi c'è solo "Blocca ora" nelle Impostazioni.
- [ ] **Safari/Firefox/telefono**: il browser non permette di sovrascrivere il file, a ogni "Salva" viene scaricata una nuova copia (`URBIOS_data_cifrato.json`). Valutare nome file con ora o promemoria "elimina le vecchie copie".
- [ ] **Promemoria di salvataggio periodico** (es. ogni 15 minuti se ci sono modifiche) oltre alla pastiglia rossa e all'avviso del browser.
- [x] **"Nuovo Paziente" usa `prompt()`**: risolto, vedi sopra.

## Codice morto (dichiarato ma mai usato) — da eliminare con calma
Rilevato con analisi automatica dei riferimenti. Non rimosso nel riordino per non cambiare nulla.

- [ ] `components/patient/diet/DietPlan.jsx`: `handleSalvaNuovaVisitaSoloDieta` (la logica è duplicata inline in `views/DietMenuView.jsx`: tenerne una sola), `activeDayTotals`, `targetGrams`, `renderProgressBar`, `selectedMealForAnalysis`/`setSelectedMealForAnalysis`, import `METRIC_CATALOG`.
- [ ] `diet/hooks/editing/useDietMeals.js`: `addMeal`, `duplicateMeal`, `removeMeal` (la UI non le chiama: non si possono aggiungere/duplicare/eliminare pasti singoli?  verificare se è una funzione mancante o solo codice vecchio).
- [ ] `diet/hooks/useDietAnalysis.js`: `categorizeNutrient`, `buildMetricData`; `diet/hooks/analysis/useSmartChartPlot.js`: `fieldKeys`.
- [ ] `diet/hooks/useDietDragDrop.js`: `handleDragLeave`. `diet/hooks/useFoodDatabase.js`: `addFoodToDB`, `updateDbFood`, `resetDatabase`.
- [ ] `training/hooks/useTrainingEditing.js`: `updateWeekTitle`, `addDay`, `toggleDay` (non c'è un pulsante "aggiungi giorno"? verificare). `training/hooks/useTrainingDragDrop.js`: `clipboard`/`setClipboard`, `handleDragLeave`.
- [ ] `reports/reportPreview/logic/buildReportHtml.js`: variabili `rB`, `fm_kg`, `ffm_kg`.
- [ ] `components/charts/BivaChart.jsx`: `chartRef`; `components/charts/SmartPlotModal.jsx`: import `useRef`, `useEffect` inutilizzati; `history/modals/VisitDetailModal.jsx`: import `DEFAULT_RANGE_EMATO`; `views/PatientDetail.jsx`: `setStatus`; `views/analisi/Analisi.jsx`: `handleChange`.

## Risolti

- [x] **Le schede di allenamento non venivano salvate** — ora vivono in `paziente.allenamento.schede` (più schede per paziente), si salvano in automatico e finiscono nell'archivio e negli export. Il pulsante "Schede Salvate" è attivo (apri, duplica, elimina, nuova).
- [x] **Training: "Settimana 2" in più in sviluppo** — la scheda ora parte da una settimana creata nello stato iniziale (niente `useEffect` che la aggiungeva due volte con `StrictMode`).
- [x] **Intestazione Training non memorizzata** — Cliente/Obiettivo/Data erano campi non controllati e si perdevano; ora fanno parte della scheda (con "Titolo scheda").

- [x] **Dati sanitari persistiti in `localStorage`** — risolto con `src/storage/` (archivio su file, cifratura opzionale, copia di lavoro cancellata con "Esci"). `localStorage` non è più usato per dati utente (`diet_saved_reports`/`diet_drv_db` non venivano mai riletti; `trainer_db` ora vive in `db.training_exercise_db`). Il file `.json` dell'archivio e il codice di recupero restano responsabilità dell'utente.
- [x] **Importare un JSON perdeva `diet_food_db`, `diet_meal_library`, `diet_drv_db`** — il vecchio `safeImport` ricostruiva il db con 4 sole chiavi: database alimenti/DRV/libreria pasti personalizzati sparivano al ricaricamento. `normalizeDb` ora conserva tutte le chiavi.

- [x] **Import con percorso assoluto della macchina** — `components/reports/ReportPreviewModal.jsx` importava `'/Users/nicolafalcioni/URBIOS/src/logic/db_defaults.js'`: su qualsiasi altro computer il build si rompeva. Ora è relativo (`reportPreview/logic/buildReportHtml.js`).
