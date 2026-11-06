# Requisiti SEC-xx (spec integrale spezzata)
Stato: ☐ da fare · ◐ in corso · ☑ fatto+testato. Sezioni = numeri della specifica originale.

| ID | Requisito (sintesi) | Sez. | Modulo | Stato |
|---|---|---|---|---|
| SEC-01 | Local-first, offline-first, nessun server che veda chiaro | 1 | tutti | ☐ |
| SEC-02 | Ruolo ≠ autenticazione: permessi da prove crittografiche, minimo privilegio | 1 | identity | ☐ |
| SEC-03 | Niente endpoint/chiavi/credenziali hardcoded | 1,26 | config | ◐ |
| SEC-10 | AES-256-GCM, nonce 96 bit mai riusati (anche dopo restore/sync) | 3,15 | crypto | ◐ |
| SEC-11 | KDF passphrase: Argon2id, fallback PBKDF2 ≥600k (**già in `storage/cryptoVault.js`**) | 3 | crypto/storage | ◐ |
| SEC-12 | HKDF-SHA256, contesti distinti per ogni scopo | 3,8 | crypto | ☑ |
| SEC-13 | DEK casuale, mai in chiaro su disco (**già in cryptoVault**) | 3 | storage | ◐ |
| SEC-14 | Combiner ibrido X25519 + ML-KEM-768 (non semplice concat+hash) | 8 | crypto | ◐ |
| SEC-15 | Firme duali Ed25519 + ML-DSA, entrambe verificate | 8 | crypto | ☑ |
| SEC-16 | Suite esplicite, negoziazione autenticata, anti-downgrade | 8,26 | crypto | ◐ |
| SEC-17 | Padding a blocchi (CSPRNG) prima di AEAD, lunghezza autenticata | 13,14 | crypto | ☑ |
| SEC-18 | Compressione solo se sicura; limiti anti decompression-bomb | 14 | envelope | ☐ |
| SEC-19 | Solo librerie auditate; vettori di test standard | 27 | crypto | ◐ |
| SEC-20 | Chiavi dispositivo generate localmente, firma ≠ accordo | 5 | identity | ☑ |
| SEC-21 | Chiavi pubbliche legate a id, algoritmo, versione, validità, revoca | 5 | identity | ◐ |
| SEC-22 | Id paziente opaco casuale, non correlabile tra contesti | 6 | identity | ☑ |
| SEC-23 | Rotazione / revoca / recupero identità | 5,23 | identity | ◐ |
| SEC-24 | Revoca di un dispositivo non invalida gli altri | 23 | identity | ☑ |
| SEC-25 | Recupero senza backdoor né chiavi universali | 23 | identity | ☐ |
| SEC-30 | Pairing fuori banda: QR mostrato dal medico in studio, scansionato dal paziente, monouso, a scadenza (D-10) | 7 | pairing | ◐ |
| SEC-31 | QR senza dati clinici/personali | 7 | pairing | ☑ |
| SEC-32 | SAS dal transcript completo, visibile su entrambi | 7 | pairing | ◐ |
| SEC-33 | Conferma esplicita di entrambi, limite tentativi, timeout | 7 | pairing | ◐ |
| SEC-34 | Resistenza a riuso/sostituzione/duplicazione QR | 7 | pairing | ◐ |
| SEC-40 | Ratchet continuo: Double (X25519) + sparse PQ (ML-KEM) | 9 | ratchet | ◐ |
| SEC-41 | Chiave per messaggio da catena unidirezionale, poi eliminata | 9 | ratchet | ☑ |
| SEC-42 | Forward secrecy + PCS (anche PQ) | 9 | ratchet | ◐ |
| SEC-43 | Persi/duplicati/fuori ordine; max chiavi saltate (anti-DoS) | 9 | ratchet | ◐ |
| SEC-44 | Offline lungo: resync senza ripristinare chiavi vecchie | 9 | ratchet | ◐ |
| SEC-45 | Stato ratchet perso ⇒ nuova sessione autenticata | 9 | ratchet | ◐ |
| SEC-46 | Verifica maturità Triple Ratchet/ML-KEM Braid prima dell'adozione | 9,27 | ratchet | ◐ |
| SEC-50 | Busta binaria versionata, serializzazione canonica, limiti dimensione | 15 | envelope | ☑ |
| SEC-51 | Firma sull'intero transcript; chiavi mittente da fonte già autenticata | 15 | envelope | ☑ |
| SEC-52 | AAD con tutti i metadati da proteggere | 15 | envelope | ☑ |
| SEC-53 | Pipeline di ricezione in 15 passi, ordine fisso | 16 | envelope | ◐ |
| SEC-54 | Freschezza (deriva max 5 min futuro) e contatore monotono tollerante | 16 | envelope | ☑ |
| SEC-55 | Anti-replay anche dopo restore di backup | 16 | envelope | ☑ |
| SEC-60 | Config centralizzata validata, ambienti separati | 26 | config | ☑ |
| SEC-61 | Segreti fuori dal bundle pubblico | 26 | config | ◐ |
| SEC-62 | Migrazione protocollo/dati/algoritmi senza indebolire | 26 | config | ☐ |
| SEC-70 | CRDT locale (Automerge da valutare), un solo motore per struttura | 10 | sync | ☐ |
| SEC-71 | Ogni modifica = evento firmato con id, autore, dipendenze, sessione | 10,11 | sync | ◐ |
| SEC-72 | Persistenza locale prima dell'invio; sync idempotente | 10 | sync | ◐ |
| SEC-73 | Validazione clinica separata dal CRDT | 10 | sync | ◐ |
| SEC-74 | Dati clinici concorrenti: conserva tutte le versioni, risolve il professionista | 10 | sync | ◐ |
| SEC-75 | Sync incrementale per unità logiche; autorizzazione prima di ogni op | 11 | sync | ◐ |
| SEC-76 | Multi-device: enrollment esplicito, token monouso ≤120 s, chiavi per dispositivo/direzione | 17 | sync/identity | ☐ |
| SEC-80 | WebRTC preferito + MQTT/WSS fallback, stessa busta E2EE | 12 | transport | ◐ |
| SEC-81 | Signaling non fidato, non può cambiare identità/parametri | 12 | transport | ◐ |
| SEC-82 | STUN/TURN/broker non fidati; opzioni per ridurre esposizione IP | 12 | transport | ◐ |
| SEC-83 | Topic MQTT = HMAC con rotazione oraria + overlap; permessi per dispositivo | 13 | transport | ◐ |
| SEC-84 | TTL (default 72 h), conferme applicative, at-least-once + dedup | 13,18 | transport | ◐ |
| SEC-85 | Macchina a stati del messaggio (8 stati), conferme autenticate | 18 | transport/sync | ◐ |
| SEC-86 | Backoff, code persistenti, priorità, anti-flooding | 25 | transport | ◐ |
| SEC-90 | Log append-only a catena di hash, senza segreti/dati clinici | 20 | audit | ◐ |
| SEC-91 | Eventi obbligatori (auth, device, sync, export, backup, delete…) | 20 | audit | ◐ |
| SEC-92 | Retention limitata (GDPR) e continuità dopo restore | 20 | audit | ☐ |
| SEC-95 | Consensi distinti, versionati, verificabili | 2 | consent | ◐ |
| SEC-96 | Revoca semplice quanto il consenso | 2 | consent | ◐ |
| SEC-97 | DPIA, ruoli titolare/responsabile, retention, breach (non codice: documento) | 2 | docs | ☐ |
| SEC-100 | Blocco automatico a inattività (5 min), chiavi invalidate | 4 | storage/app | ◐ |
| SEC-101 | Backup cifrato con chiave dedicata, anti-rollback | 21 | storage | ◐ |
| SEC-102 | Export solo con auth recente + conferma | 21 | dataExchange | ☐ |
| SEC-103 | Cancellazione/cryptographic erasure con ricevuta tecnica | 22 | storage | ☐ |
| SEC-110 | Web: no innerHTML, CSP, SRI, dipendenze minime, service worker sicuro | 19 | app/build | ◐ |
| SEC-120 | Interruttore Impostazioni: Offline (default) / Online (app paziente + multidispositivo); spento ⇒ nessuna connessione né uscita dati | D-01 | config/settings | ◐ |
| SEC-121 | Cambio modalità richiede auth locale recente e finisce in audit; la disattivazione chiude sessioni e code | D-01 | connect/audit | ◐ |
| SEC-122 | App paziente = build/HTML separato che riusa `src/connect/`; shell in cache, dati clinici mai in cache in chiaro | D-01 | build | ◐ |
| SEC-130 | Costo zero: solo GitHub Pages + servizi gratuiti non fidati, nessun segreto lato server | D-08 | transport/build | ◐ |
| SEC-131 | Contenuti verso il paziente senza nome: solo id opaco + piano cifrato | D-09 | sync/identity | ◐ |
| SEC-132 | App paziente senza dati identificativi: nessun nome, solo id opaco; controllo di invio contro nomi in titoli/note | D-11 | sync/consent | ◐ |
