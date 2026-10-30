# Modulo Dieta

Punto d'ingresso: `DietPlan.jsx` (usato da `views/PatientDetail.jsx`).
Contiene lo **stato** e il montaggio dei pezzi; la logica sta negli `hooks/`, la UI in `views/` e `modals/`.
Schema generale: vedi `src/ARCHITETTURA.md`.

```
diet/
├── DietPlan.jsx              contenitore (stato + composizione)
├── dietStyles.js + styles/   CSS (8 file per tema, ordine = cascata, NON riordinare)
├── hooks/
│   ├── useDietEditing.js     compone: editing/ (giorni, pasti, alimenti, sostituzioni, libreria)
│   ├── useDietDragDrop.js    drag & drop sidebar
│   ├── useMatrixMeals.js     partizione matriciale (setup PRO)
│   ├── useFoodDatabase.js    database alimenti (import/export)
│   ├── useLafCalculator.js   calcolatore LAF 24h
│   ├── useDietPlanData.js    dati del piano (paziente/visita, calcData, targets, giorni, report, DB) + autosave
│   ├── useDietAnalysis.js    target EFSA del paziente, report salvati, analisi bioprofilo/DRV
├── views/                    DietMenuView, DietSidebar, FloatingActions, dietMain/ (dashboard centrale + parts/)
├── smartReport/              Report grafico: metrics (catalogo), reportModel (dati → serie, dato mancante ≠ zero), figure (Plotly), ReportChart, SmartReportModal
├── modals/                   MealEditor, MealLibrary, SaveMealToLibrary, SaveStatus, ChangeVisit,
│                             nutritionSetup/ (3 tab), LafCalculator, FoodDatabase,
│                             clinicalAnalysis/, DrvEditor
├── printReport/              dietDocument (DietDocBody) + sheets/ (copertina, impostazioni, giorni, spesa, finale) + logic/printLayout
├── ui/                       icons, MacroProgressBar, MiniReportChart
├── logic/                    clinicalFormulas (RMR, BMI, WHR...), dietTotals
└── data/                     defaultFoodDB, nutrientMapping
```
