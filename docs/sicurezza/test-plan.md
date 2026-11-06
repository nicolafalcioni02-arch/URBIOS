# Test di sicurezza richiesti (prima della produzione)
Unit: vettori FIPS 203/204, RFC 7748/8032/5869, AES-GCM KAT · downgrade · replay/riordino · scadenza/riuso QR · SAS mismatch.
Proprietà: convergenza CRDT (ordine e duplicati casuali) · conflitti clinici mai persi · nonce mai riusati.
Integrazione: failover WebRTC⇄MQTT senza duplicati · offline lungo · restore da backup · perdita stato ratchet · revoca dispositivo.
Robustezza: fuzz su busta, QR, documenti sincronizzati · decompression bomb · flooding · chiavi saltate al limite.
Esterni: analisi dipendenze (audit/SBOM) · penetration test indipendente · verifica cancellazione/revoca.
