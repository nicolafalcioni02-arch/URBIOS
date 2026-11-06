# Connettività e sicurezza (src/connect/)

Scambio dati tra app (professionista ⇄ paziente, più dispositivi del professionista): E2EE, local-first, il trasporto non è mai fidato.
Specifica e requisiti: `docs/sicurezza/` (parti da `docs/sicurezza/README.md`). **Nessun file qui dentro fa UI.**

## Trasporto
`transport/index.js` sceglie tra cassetta HTTP (`https://`) e broker MQTT pubblico (`wss://`, vedi `transport/mqtt/README.md`).

## Livelli (si importa solo verso l'alto della tabella = verso il basso della pila)
```
 consent  sync        ← applicazione (sync è cieco alle chiavi)
 channel              ← unico punto che compone ratchet+envelope con i payload di sync: regole cliniche, CRDT, consenso
 transport            ← vede solo byte opachi (busta già cifrata)
 envelope             ← formato busta + pipeline di ricezione (16 passi)
 ratchet  pairing     ← sessioni, chiavi per messaggio, associazione
 identity             ← chiavi del dispositivo, id opachi, revoca
 crypto               ← primitive (AEAD, KDF, KEM ibrido, firme, padding). Non importa nulla
 config  audit        ← trasversali: config validata, log a catena di hash
```
## Regole ferree (violarne una = bug di sicurezza)
1. **Un file = una responsabilità, < 150 righe.** Una funzione sensibile = un file con un test.
2. `crypto/` è l'**unico** punto che tocca `crypto.subtle` e le librerie crittografiche. Nessuno scrive crittografia altrove.
3. `sync/` non importa mai chiavi né primitive (`identity/`, `ratchet/`, `envelope/`, `crypto/` tranne le utilità pure `canonical.js`/`bytes.js`); il collegamento sta in `channel/`; `transport/` vede solo `Uint8Array` cifrati.
4. Nessun segreto, endpoint o chiave nel codice: tutto da `config/` (validata, per ambiente).
5. Mai `innerHTML`/`eval`; mai `console.log` di chiavi o dati clinici; ogni evento sensibile passa da `audit/`.
6. Niente crittografia inventata: solo librerie auditate e vettori di test standard (FIPS 203/204, RFC 7748/8032/5869).
7. Ogni modulo ha il suo `README.md` con: cosa fa, cosa NON fa, requisiti coperti (ID `SEC-xx`), test.

## Moduli
| Cartella | Responsabilità | Req. |
|---|---|---|
| `config/` | parametri validati per ambiente, nessun hardcode | SEC-60..62 |
| `crypto/` | primitive e combiner ibrido, padding, nonce | SEC-10..19 |
| `identity/` | chiavi dispositivo, id opachi, rotazione/revoca | SEC-20..25 |
| `pairing/` | QR monouso, SAS, conferma a due lati | SEC-30..34 |
| `ratchet/` | Triple Ratchet, chiavi saltate, recupero | SEC-40..46 |
| `envelope/` | busta, firme, validazione, replay | SEC-50..55 |
| `sync/` | CRDT, eventi, regole di conflitto cliniche | SEC-70..76 |
| `channel/` | tubo sicuro tra due dispositivi: ratchet dentro, busta fuori | SEC-40..55 |
| `transport/` | WebRTC, MQTT, scelta canale, dedup | SEC-80..86 |
| `audit/` | log append-only a catena di hash | SEC-90..92 |
| `consent/` | consenso GDPR versionato, revoca | SEC-95..97 |

**Modalità:** URBIOS parte *offline*; `connect/` si attiva solo se l'interruttore in Impostazioni è su *online* (SEC-120). L'app paziente è un altro build che importa gli stessi moduli (SEC-122).

Stato: **solo scheletro** (README per modulo). Vedi `docs/sicurezza/requisiti.md` per l'avanzamento.

## Collegamento all'app (fatto)
- `manager.js` (leggero, importato dall'app) → `runtime.js` (import dinamico, solo Online): chiave dati dall'archivio, identità del dispositivo (cifrata), audit a catena, persistenza. 3 test.
- Impostazioni → **Connettività** (`src/views/settings/tabs/connect/`): interruttore, relay https, conferma con password. `db.connect = { mode, relayUrl }`.
- `ArchiveProvider`: sottochiave HKDF dalla master; Blocca/Esci/archivio non cifrato ⇒ stop.
- **Non verificato nel browser/Vite** (niente build per regola del progetto): sintassi controllata con esbuild, logica con i test Node. Da provare a mano: attivazione, riavvio, Blocca, IndexedDB (`idbKv`).
- **Manca:** gestione dei pazienti (un ratchet + mailbox + outbox per paziente), UI di pairing (QR da mostrare/leggere), invio documenti, app paziente, cancellazione dei dati di connessione.
- Nel file HTML unico il codice di `connect/` è incluso ma **inerte** in Offline (nessun fetch/timer/chiave).

## Aggiornamento: pazienti e pairing (fatto lato medico)
`peers/` (registro dei collegamenti), `pairing/flow.js` (pairing su relay), `runtime.js` espone `pairing.start()`, `peers.sendDocument/list/unlink`, `pumpAll()` (giro ogni 20 s solo Online). Impostazioni → Connettività: «Collega un paziente» (QR, codice di verifica, conferma), elenco collegati, «Scollega».
**Non c'è ancora:** l'app paziente (HTML a parte), la mappatura di dieta/scheda reali in `doc.put` e il bottone «Invia al paziente» nelle loro schermate, la risoluzione conflitti da UI, il multidispositivo (D-07).

## Invio dall'interfaccia: «Invia all'app paziente» (`ui/`)
Riquadro nel passo Consegna di Dieta e Training (`SendToPatient.jsx`). **Compare solo con la connettività Online** (si attiva dalle Impostazioni → Connettività, dove c'è l'informativa con il suo consenso). Paziente non collegato ⇒ «Paziente non collegato», il clic apre la configurazione con il QR. Collegato ⇒ «Invia all'app paziente»: finestra `AppWizard.jsx` con informativa (**da rileggere, spuntare e riaccettare ogni volta**, non si salva) → invio (`SendAction.jsx`: «Invia all'app» / «Invia aggiornamento all'app» / ritiro). Testo in `ui/disclosureText.js` (con versione).

## Aiuto guidato
Vedi `help/README.md` (tasto «Ho bisogno di aiuto», diario anonimo, prompt per un'AI).
