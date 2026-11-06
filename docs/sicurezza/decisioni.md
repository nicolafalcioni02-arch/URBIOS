# Decisioni e rischi

## Chiuse
- **D-01 (2026-11-06) App paziente = app separata, altro HTML/build.** Il professionista resta URBIOS offline-first; l'app paziente è online (PWA ospitata, con header CSP reali). In URBIOS, **Impostazioni → Connettività** ha un interruttore: *Offline* (default, nessuna rete, nessun modulo `connect/` attivo) / *Online* (app paziente + multidispositivo). Spento = nessuna connessione aperta, nessun dato esce; le chiavi restano nell'archivio.
  Conseguenze: due build (`src/connect/` condiviso via import, niente duplicazione di crypto); il codice di rete non deve nemmeno essere eseguito a interruttore spento; ogni attivazione/disattivazione va in `audit/`; la disattivazione chiude sessioni e svuota le code in uscita; l'app paziente non è offline-first (cache solo di shell, mai dati clinici in chiaro, SEC-110).

- **D-06 (2026-11-06) Canale medico→paziente = consegna di documenti** (diete, schede). Ipotesi di lavoro: unidirezionale, il paziente legge. Resta **dato sanitario (art. 9 GDPR)** perché riferito a persona identificabile: E2EE e consenso restano, ma si semplifica: niente CRDT né conflitti su questo canale, documento versionato firmato + cifrato per il paziente, revisioni sostitutive. Il ratchet può essere rimandato (basta KEM ibrido per messaggio + firma). Se in futuro il paziente scrive (misure, diari) si riapre.
- **Il vero problema è il multidispositivo del medico (SEC-76)**: stesso archivio completo su più dispositivi, modifiche concorrenti offline, dati clinici. Qui servono CRDT, enrollment, conflitti. Va progettato per primo, a parte.

- **D-08 (2026-11-06) Strumento gratuito su GitHub: costo zero per tutti.** Nessun server a pagamento né gestito da noi. L'app paziente è statica su **GitHub Pages** (HTTPS gratis; niente header personalizzati ⇒ CSP solo via `<meta>`, niente `frame-ancestors`: rischio accettato e annotato). Il trasporto usa servizi pubblici/gratuiti trattati come ostili (vedi D-04).
- **D-09 (2026-11-06) Canale medico→paziente anonimo.** Si trasmettono solo piani di allenamento (e dieta) **cifrati, senza nome, solo id opaco**. Il collegamento id↔persona esiste solo nell'archivio del medico. Resta la cifratura E2EE (D-06): riduce molto il rischio, non lo azzera (chi ha il telefono del paziente vede comunque il piano).
- **D-10 (2026-11-06) Configurazione via QR in studio.** Alla visita il **medico mostra** il QR, il paziente lo inquadra e l'app si configura da sola (id opaco, chiave pubblica del medico, seme dei topic). Il QR non contiene nome né dati clinici. La presenza fisica è il canale fuori banda: SAS ridotta a un breve codice di verifica su entrambi gli schermi (SEC-32 resta, ma non serve il carico del confronto a distanza). Aggiorna SEC-30: il QR lo genera il medico, non il paziente.

- **D-11 (2026-11-06) Nell'app paziente il nome non esiste.** Nessun campo, schermata o file contiene nome/cognome/data di nascita: l'app conosce solo l'id opaco e i piani. Il legame id↔persona vive solo nell'archivio del medico. È pseudonimizzazione, non anonimizzazione (il medico può risalire): per il paziente resta un dato personale, ma chi sottrae il telefono o intercetta il canale non ha un'identità da collegare. Attenzione ai dati indiretti: titoli dei piani, note libere e nomi file non devono contenere nomi (il medico li compila: aggiungere un avviso/controllo in fase di invio).

- **D-12 (2026-11-06) Si punta alla specifica completa** (ibrido PQ, ratchet, CRDT, topic opachi, padding), purché a costo zero. Nessun taglio di requisiti, ma si costruisce **a strati con ordine fisso** (README di `docs/sicurezza`): ogni strato deve avere test e passare l'audit prima di quello sopra. Condizione sul ratchet PQ sparso e su ML-KEM Braid: solo se esiste un'implementazione JS auditata (D-02), altrimenti resta l'handshake ibrido + Double Ratchet e il resto è tracciato come rischio, non reinventato.

## Verifica librerie (npm, 2026-11-06) — tutte gratuite
| Libreria | Versione | Licenza | Peso (unpacked) | Note |
|---|---|---|---|---|
| `@noble/post-quantum` | 0.7.1 | MIT | 0.7 MB | ML-KEM/ML-DSA, JS puro. **Versione 0.x**: da verificare stato audit e vettori FIPS prima di fidarsi |
| `@noble/curves` | 2.4.0 | MIT | 1.6 MB | X25519, Ed25519 |
| `@noble/hashes` | 2.4.0 | MIT | 0.7 MB | SHA-2/3, HKDF, Argon2id (JS, lento ma senza WASM) |
| `@noble/ciphers` | 2.4.0 | MIT | 0.5 MB | AEAD (in alternativa AES-GCM di WebCrypto) |
| `yjs` | 13.6.33 | MIT | 2.3 MB | CRDT JS puro, leggero |
| `@automerge/automerge` | 3.5.0 | MIT | **47 MB** (WASM) | cronologia nativa, ma pesante per un singolo HTML |
| `mlkem` | 2.7.0 | MIT | 0.4 MB | alternativa/controprova indipendente per ML-KEM |
| `@signalapp/libsignal-client` | 0.106 | **AGPL-3.0**, nativa | 135 MB | **scartata**: licenza e binari nativi non adatti a un HTML |
Esito provvisorio D-03: famiglia `noble` per le primitive (pure JS, un solo mantenitore ⇒ una sola superficie di supply chain, da fissare a versione esatta + hash), `mlkem` come controprova nei test (stessi vettori ⇒ stesso risultato). CRDT: **Yjs di default** per peso; Automerge solo se serve la sua cronologia e si accetta il peso. Argon2id da `@noble/hashes` senza WASM (D-05 risolvibile, da misurare il tempo su mobile).
Da verificare ancora: report di audit pubblici delle librerie noble, esistenza di un'implementazione auditata di SCKA/ML-KEM Braid (probabile: no ⇒ D-02 resta con Double Ratchet + handshake ibrido).

- **D-13 (2026-11-06) Ratchet = KEM-ratchet ibrido nostro, NON Triple Ratchet/SPQR.** Nessuna implementazione JS auditata di SCKA/ML-KEM Braid trovata (libsignal è AGPL+nativa). Implementato in `ratchet/`: struttura Double Ratchet in cui ogni giro fa un'encapsulazione X-Wing (X25519+ML-KEM-768): FS e PCS classiche *e* post-quantum, al costo di ~2,3 KB ogni cambio di giro (non per messaggio). **Rischio:** è schema noto ma codice nostro ⇒ in tensione con SEC-19/27 («niente protocolli di ratcheting proprietari»): serve revisione crittografica esterna prima dell'uso con pazienti veri; non va presentato come «Signal Triple Ratchet». Se esce una libreria auditata, si sostituisce dietro la stessa interfaccia (`createInitiator/Responder`, `encrypt/decrypt`).

- **D-14 (2026-11-06) App paziente realizzata** (`src/patient/`, build separata `dist-patient/`, file multipli per poter avere CSP senza inline). Il relay arriva dal QR del medico (nessun endpoint nel codice); cassaforte con passphrase ≥12 caratteri; consenso versionato. **Rischi accettati:** CSP solo da `<meta>` (niente `frame-ancestors`), nessun service worker/offline, informativa da revisionare legalmente.

- **D-15 (2026-11-06) Cosa parte verso il paziente:** solo alimenti/grammi/kcal/obiettivo giornaliero (dieta) ed esercizi/serie/carichi/recuperi/note (scheda). Mai anagrafica, misure, diagnosi, nome. Titolo della scheda = quello scritto dal medico, controllato contro nome/cognome del paziente prima dell'invio.

- **D-16 (2026-11-06) Scollegamento:** il medico avvisa il paziente con un messaggio firmato (`peer.unlink`); il paziente tiene i piani già ricevuti (sono suoi) ma non riceve più aggiornamenti. Se l'avviso non parte il medico chiude comunque e viene informato. Nessuna revoca crittografica forte: le chiavi di sessione restano valide ma il medico non le usa più (revoca firmata del dispositivo = lavoro futuro).

- **D-17 (2026-11-06) Trasporto su broker MQTT pubblico, scelto dall'utente:** «va bene un broker, se non vengono conservati si rimandano i dati». Implementato `transport/mqtt/` (client minimo, nessuna dipendenza). Messaggi *retained* su topic opachi, cancellati dal ricevente dopo la lettura. Si sceglie con l'indirizzo (`wss://` ⇒ broker, `https://` ⇒ cassetta HTTP). Rischi accettati: perdita/ritardo dei messaggi, tetto di dimensione del broker, topic scrivibile da chiunque lo conosca, metadati (IP, orari) visibili al broker.

## Aperte (da decidere prima di scrivere codice)
- **D-02 Triple Ratchet / ML-KEM Braid**: la spec stessa dice di verificarne la maturità. Proposta: partire con **Double Ratchet X25519 + KEM ibrido per l'handshake**, ratchet PQ sparso solo se esiste un'implementazione JS auditata. Interfaccia `ratchet/` astratta per poterlo aggiungere.
- **D-03 Librerie**: WebCrypto non ha ML-KEM/ML-DSA. Candidate: `@noble/post-quantum`, `@noble/curves`, `@noble/hashes` (pure JS, minimali, auditate in parte); CRDT: `@automerge/automerge`. Da fissare a versione esatta + hash.
- **D-04 Trasporto gratuito** (vincolo D-08): il paziente *riceve soltanto* ⇒ WebRTC e TURN non servono. Basta una cassetta postale cifrata a TTL. Opzioni a costo zero: (a) broker MQTT pubblico (HiveMQ/EMQX public): zero affidabilità e nessuna garanzia di conservazione, ma regge con E2EE + topic opachi; (b) piccolo servizio gratuito (es. Cloudflare Workers + KV, free tier): più affidabile, account da tenere; (c) file cifrati in un repo GitHub: **sconsigliato**, la cronologia git non si cancella (GDPR, TTL impossibile). Consiglio (b), con (a) come ripiego. Il medico multidispositivo (D-07) può scambiare via lo stesso canale o direttamente.
- **D-07 Come si fa il multidispositivo del medico** (da decidere, scelta di fondo):
  A) *Archivio a eventi + CRDT* (spec attuale): massima flessibilità, massima complessità.
  B) *Un dispositivo "principale" + secondari*: il principale è fonte di verità, i secondari propongono modifiche che il principale accetta/rifiuta. Molto più semplice, niente merge automatico di dati clinici.
  C) *Un solo scrittore alla volta* (lock/passaggio di testimone): i secondari sono in sola lettura finché non si prende il controllo.
  Consiglio B o C per la prima versione, con il log eventi già pronto per passare ad A.
- **D-05 Argon2id** richiede WASM: valutare vs PBKDF2 600k già in uso (SEC-11).

## Rischi/incoerenze nella spec (da non ignorare)
1. **CSP via header HTTP** è impossibile con un file locale/singlefile: restano `<meta http-equiv>` (senza `frame-ancestors`). Serve hosting con header per la PWA.
2. **"Impenetrabile" non esiste**: la sicurezza reale dipende dal dispositivo (JS nella stessa origine vede tutto). Va dichiarato nei documenti.
3. **Compressione + cifratura** (CRIME/BREACH): comprimere solo dati non influenzabili da un attaccante, o non comprimere.
4. **SAS a 6 cifre** insufficiente se non incluso in un commit-reveal: usare SAS lunga o confronto con commitment.
5. **Spec enorme**: costruire a strati e testare ogni strato; consegnare "prima la versione sicura minima" (pairing + busta + sync unidirezionale).
6. **Revoca/cancellazione** E2EE: impossibile cancellare ciò che un dispositivo ha già decifrato; dirlo nell'informativa.

## D-18 — Aiuto guidato da AI esterna
Tasto «Ho bisogno di aiuto»: genera un prompt + diario anonimo delle azioni, che l'utente incolla a un'AI di sua scelta. Nessuna chiamata di rete da URBIOS; nessun nome, password, chiave o QR nel testo; l'utente lo vede prima di condividerlo. Vedi `src/connect/help/README.md`.
