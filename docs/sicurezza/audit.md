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
