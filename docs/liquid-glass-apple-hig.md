# Liquid Glass — appunti dalle Human Interface Guidelines di Apple

Riassunto in italiano (parafrasato) delle pagine ufficiali HIG, letto il 27/10/2026.
Il testo originale e aggiornato è sempre su developer.apple.com: vedi i link in fondo.

---

## 1. Cos'è
- Materiale dinamico e traslucido che unifica il design di tutte le piattaforme Apple (iOS/iPadOS/macOS/watchOS/tvOS 26, visionOS).
- Forma un **livello funzionale** separato per controlli e navigazione (tab bar, toolbar, sidebar) che **galleggia sopra il contenuto**.
- Il contenuto scorre sotto e si intravede: dà profondità senza coprire ciò che c'è dietro.

## 2. Dove usarlo (e dove no)
- **Sì:** nel livello di navigazione e controlli.
- **No nel livello del contenuto** (sfondi, card, liste): lì si usano i materiali standard (blur, vibrancy).
  - Eccezione: controlli transitori come slider e toggle possono diventare "glass" mentre li si usa.
- **No vetro su vetro:** non sovrapporre elementi glass; il sistema converte quelli annidati in un riempimento "vibrant".
- **Con parsimonia:** i componenti di sistema lo adottano da soli; nei componenti custom applicarlo solo agli elementi più importanti.

## 3. Le due varianti
| Variante | Comportamento | Quando usarla |
|---|---|---|
| **Regular** (default) | Sfoca e regola la luminosità dello sfondo per tenere leggibile il testo | Quasi sempre; componenti con molto testo (alert, sidebar, popover) |
| **Clear** | Molto trasparente, non si adatta | Solo sopra media ricchi (foto, video) con contenuto in primo piano chiaro e deciso |

- Con **Clear** su sfondi luminosi aggiungere un **velo scuro al 35% di opacità**. Non serve se lo sfondo è già scuro o se si usano i controlli video di AVKit.
- L'aspetto cambia con le impostazioni dell'utente (stile Liquid Glass preferito, Riduci trasparenza, Aumenta contrasto, Riduci movimento).

## 4. Colore e tinta
- Il vetro **non ha colore proprio**: prende quello del contenuto dietro.
- Si può "tingere" (effetto vetro colorato) per enfatizzare **un'azione primaria**: è ciò che fa lo stile *prominent* dei bottoni.
- Toolbar e tab bar piccole passano da chiaro a scuro in base al contenuto sotto; simboli e testo sono **monocromatici** di default.
- Elementi grandi (sidebar) sono più opachi per restare leggibili.
- Regole:
  - Colore **con moderazione**, solo per stati o azioni primarie.
  - Per enfatizzare, colorare lo **sfondo del controllo**, non simboli/testo.
  - **Non tingere più controlli insieme.**
  - Su contenuti colorati: toolbar/tab bar monocromatiche oppure un accento ben distinto; mai etichette di colore simile al contenuto.
  - Lo stato di riposo (es. cima della pagina) deve essere leggibile anche se poi scorre contenuto colorato sotto.
- Colori custom: fornire variante **chiara, scura e ad alto contrasto** per ciascuna, anche se l'app usa un solo tema.
- Accessibilità: mai affidarsi solo al colore; abbinare testo o forme diverse.

## 5. Bottoni
- Stile **prominent** (sfondo col colore d'accento) per l'azione più probabile; massimo **1–2 per vista**.
- Per indicare la scelta preferita usare lo stile più prominente, non una dimensione maggiore.
- Ruolo primario = colore d'accento; ruolo distruttivo = rosso di sistema; mai ruolo primario su un'azione distruttiva.
- Non creare bottoni custom con sfondo bianco e testo nero: è l'aspetto riservato allo stato "attivato".
- Area di tocco minima **44×44 pt** (visionOS 60×60 pt).
- visionOS: icona sola → cerchio; testo → capsula o rettangolo arrotondato; icona+testo → capsula.

## 6. Toolbar
- Al massimo ~**3 gruppi** di elementi: leading (navigazione), centro (controlli comuni/titolo), trailing (azioni essenziali, ricerca, menu "Altro", azione primaria).
- Preferire **simboli** semplici (SF Symbols senza bordi); testo solo se il simbolo non basta (es. "Modifica").
- Usare i simboli standard Indietro/Chiudi, non le parole.
- Separare con spazio fisso bottoni testuali vicini e azioni testuali da azioni con simbolo.
- **Ridurre sfondi custom e controlli tinti**: interferiscono con gli effetti del sistema.
- Una sola azione *prominent* (es. Fine/Salva) sul lato trailing.
- Al posto di sfondi o divisori usare lo **scroll edge effect** (sfocatura morbida dove i controlli incontrano il contenuto).
- iOS: solo l'essenziale, il resto in un menu "Altro". macOS: ogni elemento della toolbar deve esistere anche nella barra dei menu.

## 7. Tab bar
- **iOS:** galleggia in basso su Liquid Glass; può avere un **tab di ricerca** sul lato trailing.
- Può avere un **accessorio** (es. MiniPlayer di Musica): scorrendo in giù la tab bar si **minimizza** e l'accessorio si mette in linea; torna piena toccando un tab o tornando in cima.
- **iPadOS:** in alto, può trasformarsi in sidebar. **visionOS:** verticale sul lato leading.
- Etichette di una parola + SF Symbols (preferibilmente pieni); non nascondere o disattivare tab; tenere la tab bar visibile durante la navigazione.
- Colori: monocromatica o accento ben contrastato, mai simile al contenuto.

## 8. Materiali standard (nel livello del contenuto)
- iOS/iPadOS dal più sottile al più spesso: ultra-thin, thin, regular, thick.
- Scegliere il materiale per **significato/uso**, non per il colore che dà.
- Sopra i materiali usare **colori vibrant** (label, secondaryLabel, tertiaryLabel, fill…); evitare grigi non-vibrant come systemGray3. Evitare quaternaryLabel su thin/ultra-thin.
- Materiale più spesso = più contrasto; più sottile = più contesto visibile.

## 9. Icone delle app
- Struttura a **livelli**: sfondo + uno o più livelli in primo piano; il sistema aggiunge riflessi, rifrazione e trasparenza.
- Si compongono con **Icon Composer** (incluso in Xcode).
- Livelli quadrati 1024×1024 px (watchOS 1088×1088, tvOS 800×480); **non pre-mascherare** gli angoli.
- Aspetti: default, scuro, clear (chiaro/scuro), tinto (chiaro/scuro); quelli non forniti li genera il sistema.
- Design semplice, un solo concetto, bordi netti, niente ombre/riflessi/bevel finti (li fa il sistema), testo il meno possibile, vettoriale (SVG/PDF).

## 10. API di riferimento (SwiftUI)
- `.glassEffect(.regular)` / `.glassEffect(.clear)` — materiale su viste custom
- `.buttonStyle(.glass)` / `.buttonStyle(.glassProminent)`
- `ScrollEdgeEffectStyle`, `TabBarMinimizeBehavior`, `TabViewBottomAccessoryPlacement`
- UIKit: `UIVisualEffectView`, `UITabBarController.MinimizeBehavior`; AppKit: `NSVisualEffectView`

---

## Pagine ufficiali
- [Materials (pagina principale su Liquid Glass)](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Color → Liquid Glass color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)
- [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [What's new in Design](https://developer.apple.com/design/whats-new/)
- Video WWDC25: [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) · [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)
- Kit Figma/Sketch ufficiali: [Apple Design Resources](https://developer.apple.com/design/resources/)
