# transport/mqtt/ — cassetta postale su broker MQTT pubblico (gratis)
**Fa:** stessa interfaccia del relay HTTP (`put(topic, bytes)` / `fetchNew(topic, after)`), ma su un broker MQTT pubblico via WebSocket sicuro (`wss://`). Nessun account, nessun server nostro.
Esempi di indirizzo da scrivere in Impostazioni → Connettività: `wss://broker.hivemq.com:8884/mqtt` · `wss://broker.emqx.io:8084/mqtt` (verificare che siano ancora attivi).
| File | Ruolo |
|---|---|
| `packets.js` | MQTT 3.1.1 minimo: CONNECT, PUBLISH, SUBSCRIBE, PUBACK, lettore a flusso con tetti sulle lunghezze (il broker è ostile) |
| `mqttRelay.js` | `put`: PUBLISH *retained* QoS1 su `urbios/v1/<topic>/<id>`. `fetchNew`: si iscrive a `…/<topic>/+`, aspetta il segnale di fine dei conservati, legge, poi **cancella** i messaggi dal broker (retained vuoto) |
| `test/fakeBroker.js` | broker finto in memoria (frame spezzati, perdita dei conservati, rifiuto) per i test |
**Scelta del trasporto:** `transport/index.js` guarda l'indirizzo: `https://` ⇒ cassetta HTTP, `wss://` ⇒ questo. Il QR porta già l'indirizzo, quindi l'app paziente non cambia.
**Cosa NON garantisce (accettato, D-17):** il broker può perdere o ritardare i messaggi, o rifiutare quelli grandi (tetto 96 KB per messaggio). Se non arriva l'ack, la dieta resta «in uscita» nel programma del medico e si rimanda. Chiunque conosca il topic può pubblicarvi: il topic è opaco e ogni messaggio è comunque cifrato e firmato (scartato se non valido), ma un estraneo potrebbe occupare spazio.
**Privacy:** il broker vede indirizzo IP, orari e dimensioni dei messaggi, mai il contenuto né i nomi. Una connessione per operazione: più lenta (circa un secondo) ma senza stato.
**Provato dal vivo (2026-11-06, da Node):** HiveMQ ed EMQX consegnano e cancellano i conservati. Tempi osservati: da 1 a 8 secondi per operazione (rete variabile). **EMQX perde in silenzio i messaggi da ~128 KB** (conferma ma non consegna) ⇒ tetto 96 KB per messaggio e 80 KB per documento (+ busta). Non provato dal browser.
