# documents/
**Fa:** trasforma dieta e scheda di URBIOS nel corpo di un `doc.put` e lo prepara per l'invio. Tutto PURO (nessuna chiave, nessuna rete).
| File | Ruolo |
|---|---|
| `dietDoc.js` | giorni → pasti → voci `{n, g, kcal}` + obiettivo giornaliero. **Non legge `calcData`** (peso, sesso, età, misure) |
| `trainingDoc.js` | settimane → giorni → esercizi con serie/carico/RPE/recupero (riassunti con `summarizeSets`, passata dal chiamante). Scartati `cliente`, `obiettivo`, massimali, foto |
| `outgoing.js` | `buildPut`: controllo nomi (`findIdentifiers` con nome/cognome/soprannome del paziente, solo in locale), revisione = precedente + 1, `docId` casuale stabile per fonte, validazione schema/dimensione. `forbiddenTermsOf(paziente)` |
**Interfaccia:** `ui/SendToPatient.jsx` (barra sopra Dieta e Allenamento in `PatientTabContent.jsx`): visibile solo se il paziente è collegato e la connettività è Online. Lo stato dell'invio sta in `paziente.connessione.documenti[«diet:<idVisita>» | «training:<idScheda>»] = { docId, rev }`.
**Regole:** numeri solo interi (grammi e kcal arrotondati; i decimali di carico restano testo); testi ≤ 2000 caratteri; un solo scrittore (il medico); se compare il nome del paziente l'invio si ferma e dice quali termini.
**Ritiro:** tasto «Ritira» (messaggio `doc.withdraw`): il paziente non vede più il documento (resta nella sua storia locale); un nuovo invio lo riporta. Lo stato è `{docId, rev, ritirato}`.
**Limiti:** il controllo nomi non copre un testo che identifica in altro modo (es. «la signora del terzo piano»). Sostituzioni/alternative degli alimenti non vengono inviate. Provato solo in Node: la barra non è stata aperta nel browser.
