# UX-04 — Dieta: il giorno di oggi

Prima leggi `REGOLE.md` e `STATO.md`. Richiede UX-00…UX-03 «fatto».

## Obiettivo
Una dieta ha più «giorni» (per esempio «Giorno allenamento» e «Giorno riposo»). Oggi l'app usa sempre il primo per Home e totali. Deve sapere qual è il giorno di oggi, ricordarlo, e mostrare un totale kcal che non cambi toccando un altro giorno.

## Il vincolo sui dati
Nei documenti del professionista un giorno di dieta ha solo `titolo` e `pasti`: **non c'è il giorno della settimana**. Quindi il giorno di oggi lo sceglie il paziente (toccando il giorno nella tab Dieta) e l'app lo ricorda per quella data; dove può, lo deduce.

## File che puoi toccare
- `src/patient/ui/logic.js`
- `src/patient/runtime.js` — **solo** la funzione `normLog` (riga 58), come scritto al punto 1
- `src/patient/ui/Nutrition.jsx`
- `src/patient/ui/Progress.jsx` — solo il componente `Rings`, righe 114-119
- chiusura: `README.md`, `MIGLIORIE.md`, `piano-ux/STATO.md`

File da leggere soltanto: `src/patient/ui/Home.jsx`, `src/patient/ui/Shell.jsx` (usano `nextMeal`: devono funzionare senza modifiche), `src/patient/demo.js`.

## Non toccare
`MealSheet.jsx`, `Tools.jsx`, la forma delle chiavi dei pasti (`mealKey`: `docId|giorno|pasto|data`), tutto il resto di `runtime.js`.

## Cosa fare

### 1. Dove si ricorda la scelta
Nuovo campo nel diario: `log.tools.dietDay`, `null` oppure `{ date: 'AAAA-MM-GG', docId, d }` (una sola voce: quella dell'ultima scelta).
- `logic.js:79` `toolsOf`: aggiungi `if (x.dietDay === undefined) x.dietDay = null;`.
- `runtime.js:58` `normLog`: dentro `tools: { … }` aggiungi `dietDay: (x && x.tools && x.tools.dietDay) || null`. **Indispensabile:** `normLog` ricostruisce `tools` con i soli campi che conosce; senza questa aggiunta la scelta sparisce a ogni sblocco. È l'unica modifica ammessa in `runtime.js`.

### 2. La regola (funzione pura in `logic.js`)
`export const dietDayToday = (log, docId, days, date = ymd()) => indice`
Restituisce il primo caso che vale:
1. scelta salvata: `log.tools.dietDay` con stessa `date`, stesso `docId` e `days[d]` esistente → `d`;
2. pasti già registrati oggi: il giorno `i` con più chiavi `log.meals` della forma `${docId}|${i}|…|${date}` (almeno una) → `i`;
3. titolo con il giorno della settimana: il primo giorno il cui `titolo`, in minuscolo e senza accenti, contiene il nome del giorno di `date` (`lunedi`, `martedi`, `mercoledi`, `giovedi`, `venerdi`, `sabato`, `domenica`) → quell'indice;
4. `days.length === 7` → `(new Date(date + 'T00:00:00').getDay() + 6) % 7` (lunedì = 0);
5. altrimenti `0`.
Deve reggere `log.tools` assente e `days` vuoto (restituisce 0). Commento di due righe sopra, in italiano, che spiega perché serve.

### 3. Usarla dappertutto
- `logic.js:35-42` `nextMeal`: al posto del giorno fisso `[0]` e di `d: 0` usa `dietDayToday(log, meta.docId, giorni, date)`. La firma non cambia: `Home.jsx` e `Shell.jsx` continuano a funzionare così come sono.
- `Progress.jsx:116-118` (`Rings`): i tre `0` fissi (`arr(...)[0]`, `mealKey(dt.d.docId, 0, …)`, `eatenKcal(log, today, dt.d.docId, 0, pasti)`) diventano l'indice di `dietDayToday`. Oggi questo ramo non è visibile (la Home usa `big`): serve solo a non lasciare un secondo punto con la regola vecchia.
- `Nutrition.jsx:57`: lo stato `di` parte da `null`; il giorno mostrato è `di ?? dietDayToday(log, cur, days)`. Sostituisci con quel valore **tutti** gli usi di `di` nel componente (elenco pasti, `onMeal`, `MealBars`, `setHdi(di)` nello storico).
- `Nutrition.jsx:78` (selettore dei giorni): al tocco, oltre a `setDi(i)`, salva la scelta: `rt.log.update((l) => { toolsOf(l).dietDay = { date: ymd(), docId: cur, d: i }; })` (importa `toolsOf`).
- `Nutrition.jsx:77` (cambio dieta, quando ce n'è più di una): `setDi(null)` al posto di `setDi(0)`.

### 4. «Oggi» è un totale vero
`Nutrition.jsx:61`: `eaten` oggi è `eatenKcal(log, date, cur, di, meals)`, cioè solo i pasti del giorno selezionato. Sostituisci con `dayKcal(log, date)` (già definita a riga 11: somma tutti i pasti registrati in quella data più i «fuori piano»). `target` resta com'è.

### 5. Nessuna scritta nuova
Il selettore dei giorni resta com'è: il giorno selezionato **è** il giorno di oggi, senza etichette o spiegazioni.

## Fatto quando (`?prova`, 375×812)
1. Tab Dieta: selezionato «Giorno allenamento», nessuna scritta nuova. `__demoLog.tools.dietDay` è `null` o assente.
2. Tocco «Giorno riposo»: `__demoLog.tools.dietDay` = `{ date: <oggi>, docId: 'd1', d: 1 }`. Vado in Home e torno in Dieta: è ancora selezionato «Giorno riposo».
3. Home → «Pasti»: si apre la Colazione del giorno di riposo (Fiocchi d'avena, Latte parzialmente scremato), non i Pancake.
4. La registro: in alto «312 / 2200 kcal». Tocco «Giorno allenamento»: in alto resta **312** (prima tornava a 0).
5. Ricarico (si azzera), non scelgo nessun giorno, registro la Colazione del «Giorno allenamento» dalla tab Dieta, poi in console `__demoLog.tools.dietDay = null; __demoChange();`: la tab Dieta resta su «Giorno allenamento» (regola 2).
6. In console: `const L = await import('/src/patient/ui/logic.js');`
   - `L.dietDayToday({ meals: {}, tools: {} }, 'x', [{ titolo: 'Lunedì' }, { titolo: 'Martedì' }, { titolo: 'Mercoledì' }], '2026-11-11')` → `2` (l'11/11/2026 è mercoledì);
   - con sette giorni senza nomi (`Array.from({ length: 7 }, (_, i) => ({ titolo: 'G' + i }))`) e la stessa data → `2`;
   - con due giorni senza nomi → `0`;
   - con `days` vuoto e `log` senza `tools` → `0`, nessun errore.
7. `?prova&solo=scheda`: nessun errore (non c'è dieta). `?prova&vuoto`: tab Dieta senza errori.
8. Storico («Storico e modifica dei giorni») → tocco un giorno passato: si apre come prima.
9. `npm run test:connect` passa.
10. Screenshot della tab Dieta. Console senza errori.

## Scelte già prese
- Toccare un giorno nella tab Dieta equivale a dire «oggi è questo giorno». Non c'è un modo di «solo guardare» un altro giorno senza cambiare la scelta: accettato.
- La scelta fatta a mano vince sui pasti già registrati (serve a correggere un errore).
