# Sicurezza e connettività — mappa (docs/sicurezza/)

Punto d'ingresso per tutto il lavoro su sync, crittografia e trasporto. Codice in `src/connect/` (vedi il suo README).

| File | Contenuto | Quando lo leggi |
|---|---|---|
| `requisiti.md` | requisiti `SEC-xx` (spec spezzata), modulo, stato, test | prima di toccare un modulo |
| `decisioni.md` | decisioni prese/aperte + rischi della spec | prima di scegliere una libreria/protocollo |
| `minacce.md` | modello di minaccia STRIDE (asset, attori, mitigazioni) | design e review |
| `audit.md` | checklist obbligatoria per ogni modifica in `src/connect/` | prima di chiudere un lavoro |
| `test-plan.md` | test di sicurezza richiesti prima della produzione | quando scrivi test |

## Come si lavora (ottimizzato per l'AI e per l'audit)
1. Si lavora **un modulo alla volta**, partendo da `requisiti.md` (IDs) → README del modulo → file.
2. Ogni PR/lavoro cita gli ID `SEC-xx` coperti e aggiorna lo stato in `requisiti.md`.
3. Si passa dalla checklist `audit.md`; se un punto non è verificabile, si scrive come rischio in `decisioni.md`.
4. Ordine di costruzione consigliato: config → crypto → identity → audit → envelope → pairing → ratchet → sync → transport → consent.
