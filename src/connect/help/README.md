# help/ — «Ho bisogno di aiuto»

Il tasto prepara un testo da incollare in un'AI di fiducia, che guida l'utente passo passo.

- `diary.js`: diario ANONIMO in memoria (max 80 voci, mai su disco). Registra azioni e stati (finestra aperta, informativa, pairing, invio, ritiro, errori). Gli URL sono ridotti a schema+host, i token lunghi sostituiti.
- `prompt.js`: `buildHelpPrompt` (regole per l'AI + come funziona + stato + diario) e `buildUpdate` (solo le novità dall'ultima copia).
- UI: `../ui/HelpButton.jsx` (Impostazioni → Connettività e finestra «Invia all'app paziente»).

L'AI NON vede lo schermo: «vede» ciò che l'utente incolla con «Copia aggiornamento». Il testo non contiene nomi, password, chiavi né il QR; resta una condivisione con un servizio esterno, avvisata nella finestra.
Z-index: i modali stanno sopra le Impostazioni (9999): help 10100, wizard 10050.
