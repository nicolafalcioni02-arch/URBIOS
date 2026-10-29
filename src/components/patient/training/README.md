# Modulo Training (Allenamento)

Punto d'ingresso: `TrainingPlan.jsx` (usato da `views/patientDetail/parts/PatientTabContent.jsx`).
Strumenti per il chinesiologo: serie complete (kg, %1RM, RPE, tempo), massimali, superserie, riscaldamento, analisi di volume e carico,
progressioni automatiche, calcolatori, foto dell'esecuzione, stampa A4.

```
training/
├── TrainingPlan.jsx          contenitore: stato + composizione
├── trainingStyles.js         CSS (iniettato, non globale)
├── hooks/
│   ├── useTrainingPersistence.js   scheda aperta ↔ archivio (paziente.allenamento), schede multiple, massimali (1RM)
│   ├── useTrainingEditing.js       settimane, giorni, esercizi, serie, riscaldamento automatico
│   ├── useExerciseDatabase.js      database esercizi (+ catalogo, foto del professionista)
│   └── useTrainingDragDrop.js
├── logic/                    PURE (niente React): si collaudano da sole
│   ├── trainingModel.js      struttura dati, factory, riassunto serie, massimali, profilo cliente
│   ├── analysis.js           volume per muscolo, tonnellaggio, durata, kcal, sRPE, monotonia/strain, ACWR, AVVISI
│   ├── periodization.js      generatore di progressioni (lineare, doppia, 5/3/1, RPE) con scarico
│   ├── printPlan.js          scheda → struttura di stampa (colonne dinamiche)
│   ├── exerciseMedia.js      nome esercizio → figure (catalogo + foto del professionista)
│   └── science/
│       ├── oneRm.js          1RM (7 formule), ripetizioni↔%, tabella RPE, riscaldamento
│       ├── heartRate.js      FCmax, Karvonen, TRIMP, Cooper, Rockport, Hooper
│       ├── energy.js         MET (Compendium 2011), kcal, equazioni ACSM tapis/bici
│       ├── guidelines.js     parametri per obiettivo/livello, fasce di serie settimanali
│       └── parse.js          lettura di "8-12", "45''", "1'30", "3-1-1-0"...
├── views/                    sidebar, area centrale, dayEditor/ (DayEditorModal, ExerciseCard, SetRow)
├── modals/                   database esercizi, schede salvate, foto dell'esercizio
├── tools/                    calcolatori (massimali, cardio, energia, recupero, linee guida)
├── analysis/                 AnalysisModal (cruscotto), ProgressionModal (genera progressione)
├── print/                    anteprima e stampa A4
└── data/                     catalogo (86 esercizi con muscoli), figure incorporate, database di partenza
```

## Dati
```
paziente.allenamento = {
  attiva,
  massimali: { [nome normalizzato]: { name, kg, date, method } },
  schede: [ { id, titolo, cliente, obiettivo, tipo, livello, extraMin, data,
              weeks: [ { id, title, kind: ''|'deload', note,
                days: [ { id, title, minutes, sessionRpe, note,
                  exercises: [ { id, name, group, ss (superserie), note, met (cardio),
                    sets: [ { id, reps, load, pct, rpe, tempo, rec, note, tipo: ''|'riscaldamento'|'drop' } ] } ] } ] } ] } ]
}
```
Tutti i campi nuovi sono facoltativi: le schede vecchie si aprono senza modifiche.

## Come si calcola (e dove)
- **Serie dirette** = serie di lavoro sul muscolo principale dell'esercizio; **ponderate** = dirette + 50% dei muscoli secondari. Il riscaldamento non conta. Cardio escluso.
- **Durata** = tempo sotto tensione (tempo di esecuzione o 4 s/rip.) + recuperi + 45 s di cambio attrezzo (15 s tra esercizi in superserie) + minuti extra (riscaldamento/defaticamento).
- **sRPE** (Foster) = RPE della seduta × minuti. **Monotonia** = media/deviazione standard sui 7 giorni. **Strain** = carico × monotonia. **ACWR** = carico / media delle 4 settimane precedenti.
- **Energia**: pesi = MET 3,5-6 (da RPE medio) × peso × ore; cardio = MET dell'esercizio (modificabile) × peso × ore.
- Sono **stime di supporto**, non misure. Le soglie degli avvisi sono in `science/guidelines.js` e `analysis.js`.

## Figure degli esercizi
Fonte: **free-exercise-db**, dataset di **pubblico dominio (Unlicense)**: uso libero, nessun obbligo di attribuzione (citato in Impostazioni → Info).
Incorporate nell'app (offline). L'abbinamento è per **nome esatto** (o alias): meglio nessuna figura che una sbagliata.
- **Foto del professionista**: fino a 4 per esercizio (bottone fotocamera sulla scheda-esercizio o in Gestione Esercizi). Ridotte a 480 px e salvate in
  `db.training_exercise_db[].photos` (~35 KB l'una): si riusano in tutte le schede e nella stampa. Hanno la precedenza sulle figure del catalogo
  (che si possono mostrare in aggiunta). Attenzione: molte foto = archivio più pesante.
- Aggiungere esercizi al catalogo: voce in `exerciseCatalog.js` (`fdb` = id free-exercise-db, `muscles`, `aliases`) e immagini in `exerciseImages.js`.

## Stampa
Anteprima con opzioni: tutta la scheda o una settimana, figure, un giorno per pagina, note, riepilogo seduta (durata/volume/kcal), legenda, intestazione studio.
Le colonne Carico/RPE/Tempo compaiono solo se compilate. L'impaginazione la fa il browser (`break-inside: avoid`, intestazione ripetuta). Verificata con PDF A4 da Chrome.

## Telefono (< 640 px)
Gerarchia a una mano: in vista subito settimane/sedute, riepilogo (3 numeri), esercizi con Reps · Kg · RPE; dietro un tocco "Dettagli" (%1RM, tempo, rec., note, dati seduta), la chiave inglese in basso (strumenti) e "…" (rinomina, scarico, sposta). Stili in `trainingStyles.js` (blocco "iPhone"), logica `compact` in `guided/ProgramStep.jsx`, `guided/DayEditor.jsx`, `views/dayEditor/ExerciseCard.jsx`.
