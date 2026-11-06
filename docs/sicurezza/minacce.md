# Modello di minaccia (STRIDE) — da completare modulo per modulo
**Asset:** dati clinici · chiavi dispositivo · DEK · stato ratchet · rubrica/associazioni · log audit · config.
**Confini di fiducia:** [dispositivo] | [rete] | [signaling/STUN/TURN] | [broker MQTT] | [altro dispositivo].
**Attori:** broker compromesso · MITM di rete · malware sul dispositivo · dispositivo rubato · supply chain (npm) · professionista/paziente malevolo · replay da backup.

| STRIDE | Scenario | Mitigazione (req.) | Residuo |
|---|---|---|---|
| Spoofing | falso dispositivo/QR | pairing+SAS, firme duali (SEC-30..33, 15) | utente ignora SAS |
| Tampering | busta/CRDT alterati | AEAD, firma, validazione (SEC-52,53,71) | — |
| Repudiation | negare un'azione | audit a catena firmata (SEC-90) | log locale cancellabile |
| Info disclosure | broker/TURN leggono | E2EE, padding, topic HMAC (SEC-17,83) | traffic analysis |
| DoS | flooding, chiavi saltate, decompression bomb | limiti (SEC-18,43,86) | broker down |
| Elevation | ruolo dichiarato falso | permessi da prove crittografiche (SEC-02) | — |
| Downgrade | forzare suite debole | suite esplicite, transcript firmato (SEC-16) | — |
| Rollback | restore vecchio stato | contatori+anti-rollback (SEC-55,101) | — |
