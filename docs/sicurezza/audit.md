# Checklist audit — per ogni modifica in `src/connect/`
Spuntare nel messaggio di lavoro (sì / n.a. / rischio annotato in `decisioni.md`).
- [ ] Cito gli ID SEC-xx coperti e ho aggiornato `requisiti.md`
- [ ] Layering rispettato (vedi `src/connect/README.md`): nessun import verso l'alto
- [ ] Nessuna crittografia scritta a mano; primitive solo da `crypto/`
- [ ] Nessun nonce/chiave riusabile; nonce da contatore o CSPRNG con garanzia di unicità
- [ ] Input esterni (QR, MQTT, backup, peer) validati: tipo, dimensione, versione, prima di ogni uso
- [ ] Confronti di segreti/MAC a tempo costante
- [ ] Errori: nessun dettaglio utile all'attaccante; fallire chiuso (reject), mai "accetta comunque"
- [ ] Nessun segreto/dato clinico in log, errori, URL, `localStorage`, telemetria
- [ ] Eventi sensibili registrati in `audit/`
- [ ] Anti-downgrade: versioni/suite fuori lista ⇒ rifiuto
- [ ] Test: vettori standard + casi negativi (replay, riordino, busta alterata, duplicato)
- [ ] Nuove dipendenze: versione esatta, licenza, manutenzione, impatto bundle, motivazione
- [ ] Limiti di risorse (memoria, dimensione, tempo) per ogni parser

## Registro lavori
- 2026-11-11 UX-00 — SEC-110, SEC-122 (`src/patient/sw.js`, plugin in `vite.patient.config.js`). Sì: nessun innerHTML, nessuna dipendenza, CSP invariata; la cache contiene solo i file statici della build (mai `cache.put` a runtime); richieste di altre origini/non-GET non intercettate; niente `skipWaiting`/`clients.claim`; nessun dato clinico in cache. Non verificato in browser: registrazione e uso offline (il browser integrato non registra service worker) → da provare, vedi `piano-ux/STATO.md`.
- 2026-11-11 Spesa con codice a barre — `src/patient/barcode.js`, `src/patient/foodlookup.js`, `ui/Tools.jsx`. Decisione del proprietario: la ricerca di un prodotto per codice a barre su Open Food Facts (https) è ammessa perché non riguarda dati sanitari. Esce solo il codice a barre (EAN validato con cifra di controllo, 8-14 cifre): `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, timeout 8 s, nessun dato dell'utente, nessuna risposta in cache (il service worker ignora le altre origini). Risposta trattata come dato: solo nome, marca, peso, kcal, lunghezze limitate, mai HTML. CSP invariata (`connect-src https:` c'era già). Nuova dipendenza: `@zxing/library` 0.21.3 (Apache-2.0), caricata solo se il telefono non ha `BarcodeDetector`; la fotocamera non invia immagini. Prezzi e negozi scritti dal cliente restano nel diario cifrato (`tools.buys`, `tools.stores`), mai nel PDF né sul relay. **Da fare:** far valutare al DPO/consulente se l'informativa (punto 2) deve citare la ricerca dei prodotti; il testo non è stato toccato.
