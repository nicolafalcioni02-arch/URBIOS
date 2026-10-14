import { trainingDocCss } from '../../patient/training/print/printStyles';
import { chartsCss } from '../../../views/analisi/ChartsReport';

// CSS del Centro stampa: interfaccia, foglio A4, grafica dei documenti, layout e stampa
const uiCss = `
.pc-overlay { position: fixed; inset: 0; z-index: 100000; display: flex; flex-direction: column; background: #E7E5E0; color: var(--ink, #121317);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
.pc-overlay button { font-family: inherit; color: inherit; }
.pc-top { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--surface, #fff); border-bottom: 1px solid var(--line, #E6E4DE); flex: none; min-width: 0; }
.pc-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.pc-brand h1 { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 600; font-size: 22px; line-height: 1; margin: 0; white-space: nowrap; }
.pc-brand small { display: block; font-size: 12px; color: var(--muted, #6E6D69); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-ic { width: 38px; height: 38px; flex: none; border-radius: 999px; border: 1px solid var(--line, #E6E4DE); background: var(--surface, #fff); display: inline-grid; place-items: center; cursor: pointer; transition: border-color .2s, transform .15s; }
.pc-ic:hover { border-color: var(--ink, #121317); } .pc-ic:active { transform: scale(.94); } .pc-ic i { font-size: 18px; }
.pc-ic.on { background: var(--ink, #121317); color: #fff; border-color: var(--ink, #121317); }
.pc-spacer { flex: 1; }
.pc-zoom { display: inline-flex; align-items: center; gap: 2px; background: var(--soft, #EFEEEA); border-radius: 999px; padding: 3px; }
.pc-zoom button { width: 30px; height: 30px; border: 0; border-radius: 999px; background: transparent; cursor: pointer; display: grid; place-items: center; }
.pc-zoom button:hover { background: #fff; } .pc-zoom span { font-size: 12px; font-weight: 600; min-width: 42px; text-align: center; font-variant-numeric: tabular-nums; cursor: pointer; }
.pc-count { font-size: 12.5px; color: var(--muted, #6E6D69); white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
.pc-busy { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #cfcdc7; border-top-color: var(--ink, #121317); animation: pc-spin .7s linear infinite; }
@keyframes pc-spin { to { transform: rotate(360deg); } }
.pc-btn { height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line, #E6E4DE); background: var(--surface, #fff); font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; white-space: nowrap; transition: transform .15s, border-color .2s, opacity .2s; }
.pc-btn:hover { border-color: var(--ink, #121317); } .pc-btn:active { transform: scale(.97); } .pc-btn i { font-size: 17px; }
.pc-btn.primary { background: var(--ink, #121317); border-color: var(--ink, #121317); color: #fff; }
.pc-btn:disabled { opacity: .45; pointer-events: none; }
.pc-menu { position: absolute; right: 0; top: calc(100% + 8px); width: 300px; background: #fff; border: 1px solid var(--line, #E6E4DE); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,.16); padding: 6px; z-index: 10; }
.pc-menu button { width: 100%; display: flex; gap: 12px; align-items: flex-start; text-align: left; padding: 10px 12px; border: 0; background: none; border-radius: 11px; cursor: pointer; }
.pc-menu button:hover { background: var(--soft, #EFEEEA); } .pc-menu i { font-size: 20px; margin-top: 1px; }
.pc-menu b { display: block; font-size: 14px; } .pc-menu small { display: block; font-size: 12px; color: var(--muted, #6E6D69); line-height: 1.35; margin-top: 2px; }

/* barra di scrittura */
.pc-tools { display: flex; align-items: center; gap: 4px; padding: 6px 14px; background: var(--paper, #F6F5F2); border-bottom: 1px solid var(--line, #E6E4DE); overflow-x: auto; flex: none; scrollbar-width: none; }
.pc-tools::-webkit-scrollbar { display: none; }
.pc-tools .sep { width: 1px; height: 22px; background: var(--line, #E6E4DE); margin: 0 6px; flex: none; }
.pc-tb { height: 32px; min-width: 32px; padding: 0 7px; border-radius: 8px; border: 0; background: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 5px; font-size: 12.5px; font-weight: 600; cursor: pointer; flex: none; }
.pc-tb:hover { background: #fff; } .pc-tb i { font-size: 17px; }
.pc-tb:disabled { opacity: .35; pointer-events: none; }
.pc-tools select { width: 128px; height: 32px; border-radius: 8px; border: 1px solid var(--line, #E6E4DE); background: #fff; font-size: 12.5px; padding: 0 6px; flex: none; }
.pc-swatch { width: 22px; height: 22px; border-radius: 6px; border: 1px solid rgba(0,0,0,.12); cursor: pointer; padding: 0; flex: none; }
.pc-tools-hint { font-size: 12px; color: var(--muted, #6E6D69); white-space: nowrap; margin-left: 8px; display: inline-flex; align-items: center; gap: 6px; }
.pc-tools-hint i { font-size: 15px; }

.pc-main { flex: 1; display: flex; min-height: 0; position: relative; }

/* barra laterale */
.pc-side { width: 330px; flex: none; background: var(--paper, #F6F5F2); border-right: 1px solid var(--line, #E6E4DE); display: flex; flex-direction: column; min-height: 0; }
.pc-tabs { display: flex; gap: 4px; padding: 10px 12px 0; }
.pc-tabs button { flex: 1; height: 36px; border-radius: 999px; border: 0; background: transparent; font-weight: 600; font-size: 13px; color: var(--muted, #6E6D69); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.pc-tabs button.on { background: var(--ink, #121317); color: #fff; }
.pc-side-scroll { flex: 1; overflow-y: auto; padding: 12px 12px 30px; }
.pc-h { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted, #6E6D69); margin: 14px 4px 8px; display: flex; align-items: center; justify-content: space-between; }
.pc-h:first-child { margin-top: 4px; }
.pc-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.pc-chip { height: 32px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--line, #E6E4DE); background: #fff; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: border-color .2s, background .2s; }
.pc-chip:hover { border-color: var(--ink, #121317); } .pc-chip.on { background: var(--ink, #121317); border-color: var(--ink, #121317); color: #fff; } .pc-chip i { font-size: 15px; }
.pc-chip .x { margin-left: 2px; opacity: .5; } .pc-chip .x:hover { opacity: 1; }
.pc-item { background: #fff; border: 1px solid var(--line, #E6E4DE); border-radius: 14px; margin-bottom: 6px; transition: box-shadow .2s, border-color .2s, opacity .2s; }
.pc-item.off { opacity: .55; } .pc-item.drag { box-shadow: 0 10px 30px rgba(0,0,0,.12); border-color: var(--ink, #121317); }
.pc-item.over { border-color: var(--accent, #2F54EB); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent, #2F54EB) 30%, transparent); }
.pc-item-row { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 6px; }
.pc-grip { cursor: grab; color: #b5b3ae; padding: 4px 0 4px 2px; display: grid; place-items: center; } .pc-grip:active { cursor: grabbing; }
.pc-check { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid #c9c7c1; display: grid; place-items: center; flex: none; cursor: pointer; background: #fff; padding: 0; }
.pc-check.on { background: var(--ink, #121317); border-color: var(--ink, #121317); color: #fff; } .pc-check i { font-size: 12px; }
.pc-item-ic { width: 32px; height: 32px; border-radius: 10px; background: var(--soft, #EFEEEA); display: grid; place-items: center; flex: none; } .pc-item-ic i { font-size: 17px; }
.pc-item-txt { flex: 1; min-width: 0; cursor: pointer; }
.pc-item-txt b { display: block; font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-item-txt small { display: block; font-size: 11.5px; color: var(--muted, #6E6D69); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-item-txt .pg { color: var(--ink, #121317); font-weight: 600; }
.pc-item-txt .ed { color: var(--warn, #B7791F); font-weight: 600; }
.pc-mini { width: 28px; height: 28px; border: 0; background: transparent; border-radius: 8px; display: grid; place-items: center; cursor: pointer; color: var(--muted, #6E6D69); flex: none; }
.pc-mini:hover { background: var(--soft, #EFEEEA); color: var(--ink, #121317); } .pc-mini i { font-size: 16px; } .pc-mini.on { color: var(--ink, #121317); background: var(--soft, #EFEEEA); }
.pc-opts { padding: 4px 12px 12px; display: grid; gap: 8px; font-size: 13px; border-top: 1px solid var(--line, #E6E4DE); padding-top: 10px; }
.pc-opts label.ck { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.pc-opts input[type=checkbox] { width: 16px; height: 16px; accent-color: var(--ink, #121317); }
.pc-field { display: grid; gap: 4px; } .pc-field > span { font-size: 11.5px; color: var(--muted, #6E6D69); font-weight: 600; }
.pc-input { height: 36px; border-radius: 10px; border: 1px solid var(--line, #E6E4DE); background: #fff; padding: 0 10px; font-size: 13px; width: 100%; font-family: inherit; }
.pc-input:focus { outline: none; border-color: var(--ink, #121317); }
.pc-link { border: 0; background: none; padding: 0; font-size: 12.5px; font-weight: 600; color: var(--muted, #6E6D69); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; justify-self: start; }
.pc-link:hover { color: var(--ink, #121317); }
.pc-add { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.pc-add button { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; padding: 10px; border-radius: 12px; border: 1px dashed #cfcdc7; background: transparent; cursor: pointer; min-height: 74px; transition: border-color .2s, background .2s; }
.pc-add button:hover:not(:disabled) { border-style: solid; border-color: var(--ink, #121317); background: #fff; }
.pc-add button:disabled { opacity: .45; cursor: default; }
.pc-add i { font-size: 18px; } .pc-add b { font-size: 12.5px; line-height: 1.2; } .pc-add small { font-size: 11px; color: var(--muted, #6E6D69); line-height: 1.25; }
.pc-empty { text-align: center; padding: 18px 10px; border: 1px dashed #cfcdc7; border-radius: 14px; font-size: 13px; color: var(--muted, #6E6D69); }
.pc-note { font-size: 12px; color: var(--muted, #6E6D69); line-height: 1.5; margin: 14px 4px 0; display: flex; gap: 8px; } .pc-note i { font-size: 16px; flex: none; margin-top: 1px; }
.pc-layouts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pc-lay { border: 1.5px solid var(--line, #E6E4DE); background: #fff; border-radius: 14px; padding: 8px; cursor: pointer; text-align: left; transition: border-color .2s; }
.pc-lay:hover { border-color: #b5b3ae; } .pc-lay.on { border-color: var(--ink, #121317); box-shadow: 0 0 0 1px var(--ink, #121317); }
.pc-lay b { display: block; font-size: 12.5px; margin-top: 6px; } .pc-lay small { display: block; font-size: 11px; color: var(--muted, #6E6D69); line-height: 1.25; }
.pc-lay-prev { height: 64px; border-radius: 8px; background: #F3F2EF; position: relative; overflow: hidden; }
.pc-lay-prev .pg { position: absolute; left: 50%; top: 7px; transform: translateX(-50%); width: 40px; height: 57px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.1); border-radius: 2px; overflow: hidden; }
.pc-lay-prev .t { position: absolute; left: 5px; top: 8px; width: 20px; height: 4px; border-radius: 2px; background: var(--c); }
.pc-lay-prev .l { position: absolute; left: 5px; right: 5px; height: 2px; background: #dedcd7; border-radius: 1px; }
.pc-lay-prev .band { position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--c); }
.pc-lay-prev .frame { position: absolute; inset: 2px; border: 1px double var(--c); border-width: 3px; border-style: double; }
.pc-accents { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pc-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px #d6d4ce; cursor: pointer; padding: 0; }
.pc-dot.on { box-shadow: 0 0 0 2px var(--ink, #121317); }
.pc-seg { display: flex; background: var(--soft, #EFEEEA); border-radius: 999px; padding: 3px; }
.pc-seg button { flex: 1; height: 30px; border: 0; background: transparent; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--muted, #6E6D69); cursor: pointer; }
.pc-seg button.on { background: #fff; color: var(--ink, #121317); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.pc-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; padding: 7px 4px; }
.pc-switch { width: 38px; height: 22px; border-radius: 999px; background: #d6d4ce; border: 0; position: relative; cursor: pointer; flex: none; transition: background .2s; padding: 0; }
.pc-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s var(--ease, ease); box-shadow: 0 1px 2px rgba(0,0,0,.2); }
.pc-switch.on { background: var(--ink, #121317); } .pc-switch.on::after { transform: translateX(16px); }

/* tavolo con i fogli */
.pc-desk { flex: 1; overflow: auto; position: relative; }
.pc-pages { padding: 28px 20px 120px; display: flex; flex-direction: column; align-items: center; gap: 0; }
.pc-pagewrap { position: relative; margin-bottom: 26px; }
.pc-pages.grid { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 70px 44px; padding: 80px 40px 200px; }
.pc-pages.grid .pc-pagewrap { margin: 0; cursor: zoom-in; }
.pc-pages.grid .pc-pagelabel { font-size: 30px; top: -46px; }
.pc-pages.grid .pc-flow { pointer-events: none; }
.pc-pagelabel { position: absolute; left: 0; right: 0; top: -19px; display: flex; justify-content: space-between; font-size: 11px; color: #8d8b85; font-weight: 600; letter-spacing: .02em; pointer-events: none; }
.pc-sheet { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 12px 34px rgba(30,25,15,.13); }
.pc-pagewrap.flash .pc-sheet { animation: pc-flash 1.2s var(--ease, ease); }
@keyframes pc-flash { 0%, 40% { box-shadow: 0 0 0 4px var(--accent-ui, #2F54EB), 0 12px 34px rgba(30,25,15,.13); } 100% { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 12px 34px rgba(30,25,15,.13); } }
.pc-flow[contenteditable=true] { outline: none; cursor: text; }
.pc-flow[contenteditable=true]:hover { box-shadow: 0 0 0 1px rgba(47,84,235,.18); border-radius: 2px; }
.pc-flow[contenteditable=true]:focus { box-shadow: 0 0 0 1.5px rgba(47,84,235,.45); border-radius: 2px; }
.pc-sheet.overflow::after { content: 'Il testo continua: si reimpagina quando esci dalla modifica'; position: absolute; left: 50%; bottom: 3mm; transform: translateX(-50%); background: var(--warn, #B7791F); color: #fff; font: 600 11px Inter, sans-serif; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.pc-skeleton { position: absolute; inset: 0; display: grid; place-items: center; color: #b5b3ae; font: 500 13px Inter, sans-serif; }
.pc-desk-empty { text-align: center; margin-top: 12vh; color: var(--muted, #6E6D69); }
.pc-desk-empty i { font-size: 44px; color: #b5b3ae; } .pc-desk-empty h3 { font-family: 'Playfair Display', serif; font-style: italic; font-size: 26px; color: var(--ink, #121317); margin: 10px 0 4px; }
.pc-toast { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); background: var(--ink, #121317); color: #fff; padding: 11px 16px; border-radius: 14px; font-size: 13px; box-shadow: 0 14px 40px rgba(0,0,0,.25); display: flex; align-items: center; gap: 10px; z-index: 6; max-width: calc(100% - 32px); animation: rise .35s var(--ease, ease) backwards; }
.pc-toast i { font-size: 18px; }
.pc-measure { position: absolute !important; left: -20000px !important; top: 0 !important; visibility: hidden !important; pointer-events: none; contain: layout style; }
.pc-side-toggle { display: none !important; }
.pc-scrim { display: none; }

@media screen and (max-width: 1000px) {
  .pc-side { position: absolute; z-index: 5; top: 0; bottom: 0; left: 0; transform: translateX(-102%); transition: transform .3s var(--ease, ease); width: min(340px, 90vw); box-shadow: 10px 0 40px rgba(0,0,0,.18); }
  .pc-side.open { transform: none; }
  .pc-scrim { display: block; position: absolute; inset: 0; background: rgba(0,0,0,.25); z-index: 4; opacity: 0; pointer-events: none; transition: opacity .3s; }
  .pc-scrim.open { opacity: 1; pointer-events: auto; }
  .pc-side-toggle { display: inline-grid !important; }
  .pc-count, .pc-zoom { display: none; }
  .pc-pages { padding: 24px 8px 100px; }
}
@media screen and (max-width: 640px) {
  .pc-brand h1 { font-size: 19px; } .pc-brand small { display: none; }
  .pc-btn .lbl { display: none; } .pc-btn { padding: 0 12px; }
}
`;

// il foglio: misure in mm, uguali a schermo e in stampa
const sheetCss = `
.pc-sheet { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden; color: #1b1b1f; box-sizing: border-box; }
.pc-sheet *, .pc-measure * { box-sizing: border-box; }
.pc-body { position: absolute; display: flow-root; }
.pc-measure .pc-body { position: static; }
.pc-flow { zoom: var(--pc-scale, 1); font-family: 'Inter', system-ui, sans-serif; font-size: 10pt; line-height: 1.45; overflow-wrap: break-word; }
.pc-flow img { max-width: 100%; }
.pc-flow table { border-collapse: collapse; }
.pc-flow p { margin: 0 0 2.2mm; }
/* Tailwind azzera elenchi e titoli: nei documenti servono */
.pc-flow ul { list-style: disc; padding-left: 6mm; margin: 0 0 2.5mm; } .pc-flow ol { list-style: decimal; padding-left: 6mm; margin: 0 0 2.5mm; }
.pc-flow li { margin-bottom: 1mm; }
.pc-flow h1:not([class]) { font-family: 'Playfair Display', Georgia, serif; font-size: 22pt; font-weight: 600; line-height: 1.15; margin: 4mm 0 3mm; }
.pc-flow h2:not([class]) { font-size: 14pt; font-weight: 700; line-height: 1.2; margin: 4mm 0 2mm; color: var(--accent); }
.pc-flow h3:not([class]) { font-size: 11.5pt; font-weight: 700; margin: 3mm 0 1.5mm; }
.pc-flow b, .pc-flow strong { font-weight: 700; }
.pc-head, .pc-foot { position: absolute; display: flex; align-items: center; justify-content: space-between; gap: 6mm; font-size: 7.5pt; color: #8a8a90; letter-spacing: .02em; font-family: 'Inter', system-ui, sans-serif; }
.pc-head { height: 7mm; border-bottom: .3mm solid #e4e4e7; }
.pc-head b { color: #1b1b1f; font-weight: 600; }
.pc-head .acc { color: var(--accent); font-weight: 700; letter-spacing: .14em; text-transform: uppercase; font-size: 6.5pt; }
.pc-foot { height: 6mm; border-top: .3mm solid #e4e4e7; }
.pc-foot .num { font-variant-numeric: tabular-nums; color: #1b1b1f; font-weight: 600; }
.pc-deco { position: absolute; inset: 0; pointer-events: none; }
.pc-fit { transform-origin: top left; }

/* ---- grafica dei documenti (report visita, progressi, pagina libera) ---- */
.d-doc { color: #1b1b1f; }
.d-mast { display: flex; justify-content: space-between; align-items: flex-end; gap: 8mm; padding-bottom: 4mm; margin-bottom: 7mm; border-bottom: .4mm solid #1b1b1f; }
.d-mast-l { display: flex; align-items: center; gap: 4mm; }
.d-logo { height: 13mm; width: auto; display: block; }
.d-studio { font-family: 'Playfair Display', Georgia, serif; font-size: 17pt; font-weight: 600; line-height: 1.05; letter-spacing: -.01em; }
.d-role { font-size: 7.5pt; letter-spacing: .18em; text-transform: uppercase; color: #6b6b72; margin-top: 1.2mm; }
.d-mast-r { text-align: right; font-size: 7.5pt; line-height: 1.55; color: #55555c; }
.d-titlebar { display: flex; justify-content: space-between; align-items: flex-end; gap: 8mm; margin-bottom: 6mm; }
.d-kicker { font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); margin-bottom: 1.5mm; }
.d-title { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 600; font-size: 26pt; line-height: 1.05; margin: 0; letter-spacing: -.01em; }
.d-title-solo { margin-bottom: 6mm; }
.d-sub { font-size: 9pt; color: #6b6b72; margin-top: 1.8mm; }
.d-date { text-align: right; flex: none; } .d-date span { display: block; font-size: 7pt; letter-spacing: .16em; text-transform: uppercase; color: #8a8a90; } .d-date b { font-size: 10.5pt; font-weight: 600; }
.d-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; margin-bottom: 6mm; }
.d-kpi { border: .3mm solid #e4e4e7; border-radius: 3mm; padding: 3mm 3.5mm; background: #fafafa; break-inside: avoid; }
.d-kpi span { display: block; font-size: 7pt; letter-spacing: .14em; text-transform: uppercase; color: #6b6b72; font-weight: 600; }
.d-kpi b { display: block; font-family: 'Playfair Display', Georgia, serif; font-size: 20pt; font-weight: 600; line-height: 1.1; margin-top: 1mm; color: var(--accent); }
.d-kpi b small { font-family: 'Inter', sans-serif; font-size: 9pt; font-weight: 500; color: #6b6b72; margin-left: .5mm; }
.d-kpi em { display: block; font-style: normal; font-size: 7.5pt; color: #6b6b72; margin-top: .5mm; }
.d-h { font-size: 8pt; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1b1b1f; margin: 6mm 0 3mm; padding-bottom: 1.6mm; border-bottom: .3mm solid #1b1b1f; display: flex; align-items: center; gap: 2mm; }
.d-h::before { content: ''; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: var(--accent); flex: none; }
.d-kv { width: 100%; font-size: 9pt; } .d-kv th { text-align: left; font-weight: 600; width: 34%; padding: 1.6mm 3mm 1.6mm 0; vertical-align: top; color: #44444b; }
.d-kv td { padding: 1.6mm 0; vertical-align: top; } .d-kv tr + tr th, .d-kv tr + tr td { border-top: .25mm solid #eeeef0; }
.d-table { width: 100%; font-size: 8.5pt; } .d-table th { text-align: left; font-size: 7pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6b6b72; padding: 1.8mm 2mm; border-bottom: .35mm solid #1b1b1f; }
.d-table td { padding: 1.8mm 2mm; border-bottom: .25mm solid #eeeef0; } .d-table-num td:not(:first-child), .d-table-num th:not(:first-child) { text-align: right; font-variant-numeric: tabular-nums; }
.d-table small { color: #8a8a90; }
.d-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; align-items: start; }
.d-panel { border: .3mm solid #e4e4e7; border-radius: 2.5mm; overflow: hidden; break-inside: avoid; }
.d-panel-h { font-size: 6.8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 1.6mm 2.5mm; background: #f4f4f5; color: #33333a; border-bottom: .3mm solid #e4e4e7; }
.d-panel table { width: 100%; font-size: 7.8pt; } .d-panel td { padding: 1mm 2.5mm; border-bottom: .2mm solid #f1f1f3; } .d-panel td:last-child { text-align: right; white-space: nowrap; }
.d-panel tr:last-child td { border-bottom: 0; }
.d-notes p { font-size: 9pt; margin: 0 0 2mm; } .d-notes b { font-weight: 600; }
.d-prose { font-family: Georgia, 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.6; text-align: justify; min-height: 22mm; }
.d-placeholder { color: #a1a1a8; font-style: italic; }
.d-sign { display: flex; justify-content: space-between; align-items: flex-end; gap: 10mm; margin-top: 10mm; padding-top: 4mm; border-top: .25mm solid #e4e4e7; break-inside: avoid; }
.d-disclaimer { font-size: 6.5pt; color: #8a8a90; line-height: 1.4; max-width: 60%; }
.d-firma { width: 60mm; text-align: center; } .d-firma-line { height: 14mm; border-bottom: .3mm solid #1b1b1f; margin-bottom: 1.5mm; } .d-firma span { font-size: 7pt; text-transform: uppercase; letter-spacing: .12em; font-weight: 600; }
.d-charts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
.d-chart { border: .3mm solid #e4e4e7; border-radius: 3mm; padding: 2.5mm 3mm 1.5mm; break-inside: avoid; }
.d-chart-h { font-size: 8pt; font-weight: 600; margin-bottom: 1mm; } .d-chart-h small { color: #8a8a90; font-weight: 500; }
.d-foot-note { font-size: 7.5pt; color: #8a8a90; margin-top: 4mm; }
.pc-pb { height: 0; border: 0; margin: 0; }
.pc-break { break-before: page; }
.d-kpis-4 { grid-template-columns: repeat(4, 1fr); }
.d-list { margin: 0; padding-left: 5mm; font-size: 9.5pt; } .d-list li { margin: 0 0 1.4mm; } .d-list li::marker { color: var(--accent); }
.d-day-h { display: flex; justify-content: space-between; align-items: flex-end; gap: 6mm; border-bottom: .4mm solid #1b1b1f; padding-bottom: 2.5mm; margin-bottom: 4mm; }
.d-day-title { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 600; font-size: 21pt; line-height: 1.05; margin: 0; }
.d-day[data-pc-cont]::before { content: attr(data-title) ' · continua'; display: block; font-size: 7.5pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); padding-bottom: 2mm; margin-bottom: 3mm; border-bottom: .25mm solid #e4e4e7; }
.d-day-tot { font-size: 8pt; color: #6b6b72; text-align: right; }
.d-meal { margin-bottom: 4mm; break-inside: avoid; }
.d-meal-h { display: flex; justify-content: space-between; align-items: baseline; padding: 1.8mm 3mm; background: color-mix(in srgb, var(--accent) 8%, #fff); border-left: 1.2mm solid var(--accent); border-radius: 0 1.5mm 1.5mm 0; }
.d-meal-h span { font-size: 9pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; } .d-meal-h em { font-style: normal; font-size: 8pt; color: #6b6b72; }
.d-foods { width: 100%; font-size: 9.5pt; } .d-foods td { padding: 1.8mm 3mm; border-bottom: .25mm solid #eeeef0; vertical-align: top; }
.d-foods td:last-child { text-align: right; white-space: nowrap; font-weight: 700; width: 22mm; font-variant-numeric: tabular-nums; }
.d-foods b { font-weight: 600; } .d-foods small { display: block; font-size: 7pt; color: #8a8a90; margin-top: .4mm; }
.d-foods .d-sub td { color: #55555c; padding-left: 8mm; font-size: 9pt; } .d-foods .d-sub td:last-child { font-weight: 600; }
.d-or { font-size: 6.8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-right: 1.5mm; }
.d-shop { columns: 2; column-gap: 8mm; font-size: 9.5pt; }
.d-shop > div { display: flex; align-items: center; gap: 2.5mm; padding: 1.5mm 0; border-bottom: .25mm solid #eeeef0; break-inside: avoid; }
.d-shop > div span:nth-child(2) { flex: 1; } .d-shop b { font-variant-numeric: tabular-nums; font-weight: 600; }
.d-box { width: 3.6mm; height: 3.6mm; border: .35mm solid #9a9aa0; border-radius: .8mm; flex: none; }
.d-diary { margin-bottom: 5mm; } .d-diary b { display: block; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1mm; }
.d-diary i { display: block; height: 8mm; border-bottom: .25mm solid #cfcfd4; }
.d-check td { height: 11mm; border: .25mm solid #e4e4e7; } .d-check th { border-bottom-width: .35mm; }
.pc-l-moderno .d-day-title, .pc-l-clinico .d-day-title, .pc-l-minimale .d-day-title, .pc-l-compatto .d-day-title { font-family: 'Inter', sans-serif !important; font-style: normal; font-weight: 800; letter-spacing: -.02em; }
.pc-l-moderno .d-day-title { color: var(--accent); } .pc-l-moderno .d-day-h { border-bottom-color: var(--accent); }
.pc-l-classico .d-meal-h, .pc-l-minimale .d-meal-h { background: #f4f4f5; border-left-color: #1b1b1f; }
.pc-l-compatto .d-meal { margin-bottom: 2mm; } .pc-l-compatto .d-foods td { padding: 1mm 2mm; } .pc-l-compatto .d-day-title { font-size: 15pt; }
.pc-overlay .pc-flow .pc-pb { height: 0; border-top: 1.5px dashed #c8c6c0; margin: 3mm 0; position: relative; }
.d-letter { font-size: 10.5pt; }
.dt-embed .a4-sheet { padding: 0 !important; min-height: 0 !important; height: auto !important; width: auto !important; box-shadow: none !important; margin: 0 !important; }
.tp-embed { font-size: 10pt; line-height: 1.35; color: #111; }
.pc-theme .tp-newpage { border-top: none; padding-top: 0; margin-top: 0; } .pc-theme .tp-newpage::before { display: none; }
.pc-theme .tp-table { table-layout: auto !important; width: 100% !important; }

/* nei fogli le interruzioni le decide l'impaginatore: quelle scritte nel documento non devono creare pagine in più */
.pc-sheet .pc-flow, .pc-sheet .pc-flow * { break-before: auto !important; break-after: auto !important; page-break-before: auto !important; page-break-after: auto !important; break-inside: auto !important; page-break-inside: auto !important; }

/* copertina */
.pc-cover { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 22mm 20mm 18mm; font-family: 'Inter', system-ui, sans-serif; }
.pc-cover-top { display: flex; justify-content: space-between; align-items: center; font-size: 8pt; letter-spacing: .2em; text-transform: uppercase; color: #6b6b72; }
.pc-cover-top img { height: 14mm; }
.pc-cover-mid { margin-top: 48mm; }
.pc-cover-kicker { font-size: 9pt; font-weight: 700; letter-spacing: .26em; text-transform: uppercase; color: var(--accent); }
.pc-cover-title { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 600; font-size: 46pt; line-height: 1; margin: 4mm 0 0; letter-spacing: -.02em; color: #1b1b1f; }
.pc-cover-rule { width: 22mm; height: 1.2mm; background: var(--accent); margin: 9mm 0 7mm; border-radius: 1mm; }
.pc-cover-name { font-size: 17pt; font-weight: 600; }
.pc-cover-date { font-size: 10pt; color: #6b6b72; margin-top: 1.5mm; }
.pc-cover-index { margin-top: auto; margin-bottom: 14mm; }
.pc-cover-index h4 { font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #6b6b72; margin: 0 0 3mm; }
.pc-cover-index div { display: flex; align-items: baseline; gap: 3mm; font-size: 10.5pt; padding: 1.6mm 0; }
.pc-cover-index div i { flex: 1; border-bottom: .3mm dotted #b9b9bf; transform: translateY(-1mm); }
.pc-cover-index div b { font-weight: 500; } .pc-cover-index div span { font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 600; }
.pc-cover-foot { border-top: .3mm solid #1b1b1f; padding-top: 4mm; display: flex; justify-content: space-between; gap: 8mm; font-size: 8pt; line-height: 1.55; color: #55555c; }
.pc-cover-foot strong { display: block; color: #1b1b1f; font-size: 10pt; font-family: 'Playfair Display', Georgia, serif; }
`;

// layout: cambiano caratteri, colore e cornici, il contenuto resta lo stesso
const layoutCss = `
/* i documenti esistenti (dieta, allenamento, lettera) seguono il colore guida */
.pc-theme .pc-flow [style*="solid #000"], .pc-theme .pc-flow [style*="solid #111"] { border-color: var(--accent) !important; }
.pc-theme .tp-table th, .pc-theme .tp-ss { background-color: var(--accent); }
.pc-theme .tp-daynote { background-color: #f4f4f6; border-left-color: var(--accent); }
.pc-theme .tp-head, .pc-theme .tp-week-title { border-color: var(--accent); }

.pc-l-classico { --accent-head: #1b1b1f; }
.pc-l-classico .d-kpi b { color: #1b1b1f; }

.pc-l-moderno .pc-flow *, .pc-l-clinico .pc-flow *, .pc-l-minimale .pc-flow *, .pc-l-compatto .pc-flow * { font-family: 'Inter', system-ui, sans-serif !important; }
.pc-l-moderno .d-title, .pc-l-moderno .d-studio, .pc-l-moderno .d-kpi b, .pc-l-clinico .d-title, .pc-l-clinico .d-studio, .pc-l-clinico .d-kpi b,
.pc-l-minimale .d-title, .pc-l-minimale .d-studio, .pc-l-minimale .d-kpi b, .pc-l-compatto .d-title, .pc-l-compatto .d-kpi b { font-style: normal !important; font-weight: 800 !important; letter-spacing: -.025em !important; }
.pc-l-moderno .pc-flow [style*="Playfair"], .pc-l-clinico .pc-flow [style*="Playfair"], .pc-l-minimale .pc-flow [style*="Playfair"] { font-style: normal !important; font-weight: 800 !important; letter-spacing: -.02em !important; }
.pc-l-moderno .d-title, .pc-l-moderno .d-mast { color: var(--accent); }
.pc-l-moderno .d-mast { border-bottom-color: var(--accent); }
.pc-l-moderno .d-kpi { background: color-mix(in srgb, var(--accent) 7%, #fff); border-color: color-mix(in srgb, var(--accent) 22%, #fff); }
.pc-l-moderno .d-h { border-bottom-color: var(--accent); color: var(--accent); }
.pc-l-moderno .pc-deco::before, .pc-l-clinico .pc-deco::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3.2mm; background: var(--accent); }
.pc-l-moderno .pc-head .acc { color: var(--accent); }

.pc-l-clinico .d-kpi { background: color-mix(in srgb, var(--accent) 8%, #fff); border: 0; border-left: 1.2mm solid var(--accent); border-radius: 1mm; }
.pc-l-clinico .d-h { background: color-mix(in srgb, var(--accent) 9%, #fff); border: 0; padding: 1.8mm 3mm; border-radius: 1mm; color: color-mix(in srgb, var(--accent) 80%, #000); }
.pc-l-clinico .d-h::before { display: none; }
.pc-l-clinico .d-panel-h, .pc-l-clinico .pc-flow [style*="background: #f4f4f4"], .pc-l-clinico .pc-flow [style*="background:#f4f4f5"], .pc-l-clinico .pc-flow [style*="background: #fafafa"] { background: color-mix(in srgb, var(--accent) 9%, #fff) !important; }
.pc-l-clinico .d-table th { border-bottom-color: var(--accent); }

.pc-l-elegante .pc-flow * { font-family: Georgia, 'Times New Roman', serif !important; }
.pc-l-elegante .d-title, .pc-l-elegante .d-studio, .pc-l-elegante .d-kpi b, .pc-l-elegante .pc-flow h1, .pc-l-elegante .pc-flow h2, .pc-l-elegante .pc-flow [style*="Playfair"], .pc-l-elegante .tp-doc-title, .pc-l-elegante .tp-week-title, .pc-l-elegante .tp-studio-name { font-family: 'Playfair Display', Georgia, serif !important; }
.pc-l-elegante .d-mast { border-bottom: 1mm double var(--accent); }
.pc-l-elegante .d-h { border-bottom: .9mm double var(--accent); letter-spacing: .24em; }
.pc-l-elegante .d-h::before { content: '◆'; width: auto; height: auto; background: none; color: var(--accent); font-size: 6pt; }
.pc-l-elegante .d-kpi { background: #fff; border-color: color-mix(in srgb, var(--accent) 35%, #fff); }
.pc-l-elegante .pc-head { border-bottom: .8mm double color-mix(in srgb, var(--accent) 55%, #fff); font-family: Georgia, serif; font-style: italic; }
.pc-l-elegante .pc-foot { font-family: Georgia, serif; font-style: italic; }

.pc-l-minimale .d-mast, .pc-l-minimale .d-h, .pc-l-minimale .d-table th { border-color: #d4d4d8 !important; border-width: .25mm; }
.pc-l-minimale .d-h::before { display: none; }
.pc-l-minimale .d-kpi { background: #fff; border: 0; border-top: .25mm solid #d4d4d8; border-radius: 0; padding-left: 0; }
.pc-l-minimale .d-kpi b { color: #1b1b1f; }
.pc-l-minimale .pc-flow [style*="solid #000"], .pc-l-minimale .pc-flow [style*="solid #111"] { border-color: #c4c4c8 !important; }
.pc-l-minimale .tp-table th { background: #eee !important; color: #333 !important; }
.pc-l-minimale .pc-head, .pc-l-minimale .pc-foot { border-color: transparent; }

.pc-l-compatto .pc-flow * { line-height: 1.28 !important; }
.pc-l-compatto .d-mast { margin-bottom: 4mm; padding-bottom: 2.5mm; } .pc-l-compatto .d-titlebar { margin-bottom: 3.5mm; }
.pc-l-compatto .d-title { font-size: 18pt; } .pc-l-compatto .d-kpis { grid-template-columns: repeat(6, 1fr); gap: 1.5mm; margin-bottom: 3mm; }
.pc-l-compatto .d-kpi { padding: 1.8mm 2mm; } .pc-l-compatto .d-kpi b { font-size: 13pt; } .pc-l-compatto .d-kpi em { display: none; }
.pc-l-compatto .d-h { margin: 3.5mm 0 2mm; } .pc-l-compatto .d-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5mm; }
.pc-l-compatto .tp-img img { width: 11mm !important; margin: 0 .5mm 0 0 !important; }
.pc-l-compatto .pc-flow [style*="margin-bottom: 40px"], .pc-l-compatto .pc-flow [style*="margin-bottom: 50px"], .pc-l-compatto .pc-flow [style*="margin-bottom: 60px"] { margin-bottom: 12px !important; }

.pc-l-decorato .pc-flow * { font-family: Georgia, 'Times New Roman', serif !important; }
.pc-l-decorato .d-title, .pc-l-decorato .d-studio, .pc-l-decorato .d-kpi b, .pc-l-decorato .pc-flow h1, .pc-l-decorato .pc-flow h2, .pc-l-decorato .pc-flow [style*="Playfair"], .pc-l-decorato .tp-doc-title, .pc-l-decorato .tp-week-title, .pc-l-decorato .tp-studio-name { font-family: 'Playfair Display', Georgia, serif !important; color: var(--accent); }
.pc-l-decorato .pc-deco::before { content: ''; position: absolute; inset: 6mm; border: 1.1mm double var(--accent); border-radius: 2mm; }
.pc-l-decorato .pc-deco::after { content: '❦'; position: absolute; left: 50%; bottom: 3.6mm; transform: translateX(-50%); background: #fff; padding: 0 3mm; color: var(--accent); font-size: 12pt; line-height: 1; }
.pc-l-decorato .d-h { border-bottom: .9mm double var(--accent); justify-content: center; }
.pc-l-decorato .d-h::before { content: '❦'; width: auto; height: auto; background: none; color: var(--accent); font-size: 9pt; }
.pc-l-decorato .d-kpi, .pc-l-decorato .d-panel, .pc-l-decorato .d-chart { border-color: color-mix(in srgb, var(--accent) 40%, #fff); border-radius: 4mm; }
.pc-l-decorato .tp-table th { background: var(--accent) !important; }
.pc-l-decorato .pc-head, .pc-l-decorato .pc-foot { border-color: transparent; font-family: Georgia, serif; font-style: italic; }
.pc-l-decorato .pc-cover { padding: 26mm 24mm 22mm; }
`;

const printCss = `
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { background: #fff !important; overflow: visible !important; height: auto !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(.pc-overlay), body > #root { display: none !important; height: 0 !important; overflow: hidden !important; }
  .pc-overlay, .pc-overlay * { visibility: visible !important; }
  .pc-overlay { position: static !important; display: block !important; background: #fff !important; overflow: visible !important; }
  .pc-top, .pc-tools, .pc-side, .pc-scrim, .pc-toast, .pc-pagelabel, .pc-measure, .pc-overlay .pc-flow .pc-pb { display: none !important; }
  .pc-main, .pc-desk { display: block !important; overflow: visible !important; position: static !important; }
  .pc-pages { padding: 0 !important; display: block !important; zoom: 1 !important; }
  .pc-pagewrap { margin: 0 !important; break-after: page; page-break-after: always; }
  .pc-pagewrap:last-child { break-after: auto; page-break-after: auto; }
  .pc-sheet { box-shadow: none !important; height: 296.6mm; }
  .pc-sheet.overflow::after { display: none !important; }
  .pc-flow[contenteditable] { box-shadow: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;

export const printCenterCss = uiCss + sheetCss + chartsCss + trainingDocCss + layoutCss + printCss;
