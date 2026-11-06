# Impostazioni — mappa

Leggi solo questo file prima di toccare le Impostazioni: dice dove sta ogni cosa.
Aggiornalo quando aggiungi/sposti file (ultima riorganizzazione: 27/10/2026).

## Struttura

```
settings/
  SettingsModal.jsx   guscio: barra laterale (PC/tablet ≥640px) o elenco a righe (telefono). Niente logica delle schede.
  sections.js         REGISTRO: gruppi, voci, icona, componente. Per aggiungere/spostare/rinominare una sezione si tocca solo qui.
  settings.css        tutto lo stile, classi st-*. Solo token di index.css (--ink --muted --line --surface --soft --paper --ok --warn --bad).
  ui/
    icons.jsx         <Icon name="..."/>: SVG a tratto 1.6, 24x24, currentColor. Elenco nomi in PATHS.
    kit.jsx           Page, Group, Label, Btn, IconBtn, Check, Radio, Select, Field, Segmented, Note, Status.
    clipboard.js      copyText(), selectNode()
  tabs/
    profile/          4 schede sullo stesso oggetto db.utente
      useProfile.js     [user, update] — salva subito in db (niente tasto Salva)
      ProfileTab        Dati anagrafici + professionali
      BillingTab        Fatturazione + valori delle nuove fatture (db.utente.fatt_*) + assicurazione
      DocumentsTab      Testi report + lettera di incarico + GDPR
      ScheduleTab       Orari, durate visite, disdette
      sections/*.jsx    i singoli gruppi di campi (props: localUser, updateUser)
      templates.js      testi standard lettera di incarico e privacy
    look/LookTab        Aspetto (Classico/Vetro) → db.aspetto, vedi src/looks/
    formulas/           FormulasTab (db.formule, stato interno) + formulaPrompt.js (testo per l'assistente AI)
    dataExchange/       DataExchangeTab → ExportSection, ImportSection, AnonymizePanel (logica in src/dataExchange/)
    security/           SecurityTab (useArchive da src/storage/ArchiveProvider)
    connect/            ConnectTab: interruttore Offline/Online → db.connect = { mode, relayUrl }; richiede archivio cifrato e password; avvio/arresto in ArchiveProvider (src/connect/manager.js)
    about/              CiteTab (APA/BibTeX), InfoTab (team, manifesto)
```

## Regole

- Ogni scheda riceve `{ db, onUpdateDb, onClose }` e viene montata solo quando è aperta: non serve `if (tab !== ...)`.
- Stile: usa solo i componenti di `ui/kit.jsx` e le classi `st-*`. Niente Tailwind di colore (`gray-*`, `blue-*`, `green-*`…), niente esadecimali, niente icone Phosphor (`ph-*`), niente emoji.
- Colore = solo stato: `Note tone` / `Status tone` (ok, warn, bad). Lo sfondo resta neutro, cambia il filo e il pallino.
- Campi dati: `InputGroup` / `TextAreaGroup` di `src/components/ui/InputGroup.jsx` (classi `fld`, `fld-label`), salvano all'uscita dal campo.
- Etichette in minuscolo dopo la prima lettera (sigle come IVA, PEC restano maiuscole).
- Classi condivise col resto dell'app che il guscio riusa: `set-side`, `panel`, `m-*` (telefono), ritoccate dall'aspetto Vetro in `src/looks/vetro.css`.

## Lavoro in parallelo

Le cartelle in `tabs/` sono indipendenti: chat diverse possono lavorarci insieme. File condivisi da toccare con attenzione (uno alla volta): `sections.js`, `ui/kit.jsx`, `ui/icons.jsx`, `settings.css`.

## Ricette

- **Nuova sezione**: crea `tabs/<cartella>/XTab.jsx` che ritorna `<Page title intro>…</Page>`, poi una riga in `sections.js`.
- **Nuova icona**: una voce in `PATHS` di `ui/icons.jsx` (solo path, tratto, niente riempimenti).
- **Nuovo campo profilo**: aggiungi `<InputGroup name="chiave" …/>` nella sezione giusta di `tabs/profile/sections/`; si salva in `db.utente.chiave`.

## Connettività (tabs/connect/)
`ConnectTab` (interruttore, relay, password), `PairPatient` (QR → codice di verifica → conferma; usa `connectManager.api().pairing`), `QrView` (QR come SVG, libreria `qrcode-generator`, niente innerHTML). Il collegamento si salva in `db.pazienti[i].connessione = { pid, collegatoIl }` (`pid` = codice anonimo, mai il nome).
