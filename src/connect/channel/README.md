# channel/
**Fa:** `createChannel` compone `ratchet` (FS/PCS, dentro) + `envelope` (firma/replay, fuori): `send(payload)→byte`, `receive(byte)→{ok,reason}`. Unico punto che vede chiavi e payload insieme.
**Non fa:** non conosce il significato dei payload (`sync/`) né la rete (`transport/`).
**Test (`test/e2e.test.js`, 7):** pairing→canale→dieta→ack, rev 2, duplicato di rete, conflitto conservato, mittente non autorizzato, schema, controllo nomi, outbox.
**Nota:** la decifratura ratchet avviene nel passo `persist` della busta; se il handler rifiuta dopo, il messaggio è consumato e va reinviato.
**Bug trovato dai test e corretto:** il ratchet azzerava la chiave KEM d'identità passata dal chiamante (aliasing di buffer): ora `createResponder` ne tiene una copia (test dedicato).
