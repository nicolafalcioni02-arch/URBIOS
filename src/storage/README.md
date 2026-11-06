# Archivio e sicurezza (src/storage/)

Obiettivo: **tutto resta in locale** (nessun server, nessun account) ma i dati non devono sparire se si aggiorna il browser,
e non devono restare su un computer che non è più il proprio.

## Come funziona
```
 file archivio (.json)  ──apri──▶  memoria dell'app (db)  ──▶  copia di lavoro nel browser (IndexedDB)
        ▲                                   │                         (cifrata se l'archivio è cifrato)
        └────────────── salva ──────────────┘
                         "Esci" ──▶ salva il file + CANCELLA la copia nel browser
```
- Il **file** è la fonte di verità. Va salvato a ogni sessione (Chrome/Edge da PC: sovrascrive lo stesso file; altrove scarica una copia).
- La **copia nel browser** serve solo a non perdere il lavoro se si aggiorna la pagina; si cancella con "Esci".
- **Cifratura (opzionale)**: AES-256-GCM, chiave master casuale chiusa due volte (password + codice di recupero), PBKDF2-SHA256 600k.
  Senza password *e* senza codice i dati non sono recuperabili (scelta voluta: niente server).
- **Blocco alla chiusura**: con modifiche non salvate il browser mostra il suo avviso standard (`beforeunload`).
  Un sito web non può forzare un download in quel momento: per questo c'è anche la pastiglia rossa "Non salvato · Salva ora".

## File
| File | Ruolo |
|---|---|
| `schema.js` | schema unico del db, `SCHEMA_VERSION`, `normalizeDb` (migrazioni; conserva le chiavi sconosciute) |
| `cryptoVault.js` | cifratura, chiavi, codice di recupero (solo WebCrypto) |
| `archiveFile.js` | formato del file (chiaro / cifrato / vecchio JSON) |
| `workingCopy.js` | copia di lavoro nel browser (IndexedDB) |
| `fileIO.js` | salvataggio su file / download, lettura file |
| `legacy.js` | recupero dei dati lasciati in `localStorage` dalle versioni precedenti |
| `ArchiveProvider.jsx` | stato dell'archivio: crea, apri, salva, blocca, esci, sicurezza (`useArchive()`) |

## Regole
- **Mai** usare `localStorage` / `sessionStorage` per dati dell'utente: tutto va dentro il `db` (finisce nel file).
- Nuova chiave nel db? Va bene, viene conservata. Cambio di struttura? Alza `SCHEMA_VERSION` e gestiscilo in `normalizeDb`.
- "Entra (Demo)" esiste solo in sviluppo (`npm run dev`) o con `npm run build:demo`; `npm run build` è la versione ufficiale.

## Paziente di esempio

`example/` contiene il paziente di esempio (Pino Citosi) e le ricette di esempio, generati da `node archivio_demo/genera.mjs`.
`ArchiveProvider` li aggiunge alla vista del database (`db` del contesto) in ogni archivio, ma il database salvato
(copia di lavoro e file) contiene solo i dati veri: ogni modifica passa da `splitExample`, che tiene in memoria la parte
di esempio. Così l'esempio non crea "modifiche non salvate", non si esporta e torna com'era a ogni apertura.

## Connettività (src/connect)
`ArchiveProvider` espone `verifyPassword(pwd)` e avvia/ferma `connectManager` in base a `db.connect.mode` (default offline). La chiave dei dati di `connect/` è una **sottochiave HKDF** della chiave master (`urbios/v1/connect/dek-v1`): con archivio non cifrato o bloccato `connect/` non parte. Blocca/Esci fermano tutto e azzerano la chiave. Vedi `docs/sicurezza/` e `src/connect/README.md`.
