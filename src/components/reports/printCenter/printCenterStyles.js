import { trainingDocCss } from '../../patient/training/print/printStyles';
import { chartsCss } from '../../../views/analisi/ChartsReport';
import { layoutCss } from './layoutStyles';

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
.pc-tabs { display: flex; gap: 4px; padding: 10px 12px 0; align-items: center; }
.pc-tabs button { flex: 1; height: 36px; border-radius: 999px; border: 0; background: transparent; font-weight: 600; font-size: 13px; color: var(--muted, #6E6D69); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.pc-tabs button.on { background: var(--ink, #121317); color: #fff; }
.pc-side-scroll { flex: 1; overflow-y: auto; padding: 12px 12px 30px; }
.pc-h { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted, #6E6D69); margin: 14px 4px 8px; display: flex; align-items: center; justify-content: space-between; }
.pc-h:first-child { margin-top: 4px; }
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
.pc-add { display: grid; gap: 4px; }
.pc-add button { display: flex; align-items: center; gap: 10px; text-align: left; padding: 8px 10px; border-radius: 12px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: border-color .2s, background .2s; }
.pc-add button:hover:not(:disabled) { border-color: var(--line, #E6E4DE); background: #fff; }
.pc-add button:disabled { opacity: .45; cursor: default; }
.pc-add button > i:first-child { font-size: 18px; flex: none; width: 22px; text-align: center; } .pc-add span { flex: 1; min-width: 0; }
.pc-add b { display: block; font-size: 13px; line-height: 1.25; } .pc-add small { display: block; font-size: 11px; color: var(--muted, #6E6D69); line-height: 1.3; }
.pc-add-plus { font-size: 16px; color: var(--muted, #6E6D69); } .pc-add button:hover .pc-add-plus { color: var(--ink, #121317); }
.pc-h-n { letter-spacing: 0; text-transform: none; font-weight: 600; }
.pc-sub { font-size: 12px; font-weight: 600; margin: 12px 2px 6px; } .pc-sub:first-child { margin-top: 2px; }
.pc-preset { margin-top: 12px; border: 1px solid var(--line, #E6E4DE); background: #fff; border-radius: 14px; overflow: hidden; }
.pc-preset-cur { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: 0; background: transparent; cursor: pointer; text-align: left; }
.pc-preset-txt { flex: 1; min-width: 0; } .pc-preset-txt small { display: block; font-size: 11px; color: var(--muted, #6E6D69); } .pc-preset-txt b { display: block; font-size: 14px; }
.pc-preset-caret { font-size: 16px; color: var(--muted, #6E6D69); transition: transform .2s; } .pc-preset.open .pc-preset-caret { transform: rotate(180deg); }
.pc-preset-list { border-top: 1px solid var(--line, #E6E4DE); padding: 6px; display: grid; gap: 2px; }
.pc-preset-opt { display: flex; align-items: center; gap: 4px; border-radius: 10px; } .pc-preset-opt:hover { background: var(--soft, #EFEEEA); } .pc-preset-opt.on { background: var(--soft, #EFEEEA); }
.pc-preset-opt > button:first-child { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 8px; border: 0; background: transparent; cursor: pointer; text-align: left; }
.pc-preset-opt > button:first-child > i:first-child { font-size: 17px; flex: none; } .pc-preset-opt span { flex: 1; min-width: 0; }
.pc-preset-opt b { display: block; font-size: 13px; } .pc-preset-opt small { display: block; font-size: 11px; color: var(--muted, #6E6D69); line-height: 1.3; }
.pc-preset-ok { font-size: 14px; flex: none; }
.pc-preset-save { margin: 6px 8px 4px; } .pc-preset-form { display: flex; gap: 6px; padding: 6px 4px 2px; }
.pc-fold { margin-top: 16px; border: 1px solid var(--line, #E6E4DE); border-radius: 14px; background: #fff; }
.pc-fold-h { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 12px; border: 0; background: transparent; cursor: pointer; text-align: left; }
.pc-fold-h span { flex: 1; } .pc-fold-h b { display: block; font-size: 13px; } .pc-fold-h small { display: block; font-size: 11px; color: var(--muted, #6E6D69); }
.pc-fold-h i { font-size: 16px; color: var(--muted, #6E6D69); transition: transform .2s; } .pc-fold.open .pc-fold-h i { transform: rotate(180deg); }
.pc-fold-b { padding: 0 12px 12px; }
.pc-views { display: flex; background: var(--soft, #EFEEEA); border-radius: 12px; padding: 3px; gap: 2px; }
.pc-view { flex: 1; min-width: 0; border: 0; background: transparent; border-radius: 9px; padding: 6px 2px 5px; cursor: pointer; display: grid; justify-items: center; gap: 2px; color: var(--muted, #6E6D69); }
.pc-view i { font-size: 17px; } .pc-view span { font-size: 10px; font-weight: 600; line-height: 1.15; text-align: center; }
.pc-view:hover { color: var(--ink, #121317); } .pc-view.on { background: #fff; color: var(--ink, #121317); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.pc-viewset-d { display: block; font-size: 11px; color: var(--muted, #6E6D69); margin: 5px 2px 0; }
.pc-layouts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pc-lay { border: 1.5px solid var(--line, #E6E4DE); background: #fff; border-radius: 12px; padding: 5px 5px 6px; cursor: pointer; text-align: center; transition: border-color .2s; }
.pc-lay b { display: block; font-size: 11px; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-lay-prev { height: 58px; border-radius: 8px; background: #F3F2EF; position: relative; overflow: hidden; }
.pc-lay-desc { font-size: 11.5px; color: var(--muted, #6E6D69); margin: 6px 2px 0; }
.pc-preset-info { margin: 2px 6px 6px; font-size: 11.5px; line-height: 1.4; color: var(--muted, #6E6D69); } .pc-preset-info b { color: var(--ink, #121317); }
.pc-faq { margin: 0; font-size: 12px; line-height: 1.45; } .pc-faq dt { font-weight: 700; margin-top: 10px; } .pc-faq dt:first-child { margin-top: 0; }
.pc-faq dd { margin: 2px 0 0; color: var(--muted, #6E6D69); } .pc-faq b { color: var(--ink, #121317); font-weight: 600; }
.pc-step { width: 18px; height: 18px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 10.5px; font-weight: 700; background: var(--soft, #EFEEEA); color: var(--muted, #6E6D69); }
.pc-tabs button.on .pc-step { background: rgba(255,255,255,.18); color: #fff; }
.pc-tabs .pc-helpbtn { flex: none; width: 36px; padding: 0; font-size: 18px; } .pc-tabs .pc-helpbtn:hover { color: var(--ink, #121317); }
.pc-tabs .pc-helpbtn.on { background: var(--soft, #EFEEEA); color: var(--ink, #121317); }
.pc-list { margin-top: 12px; }
.pc-item-row { padding: 6px 6px 6px 4px; gap: 6px; }
.pc-grip { opacity: 0; transition: opacity .15s; } .pc-item:hover .pc-grip { opacity: 1; }
.pc-item-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 9px; border: 0; background: transparent; padding: 4px 2px; cursor: pointer; text-align: left; color: inherit; font: inherit; border-radius: 10px; }
.pc-item-i { font-size: 18px; flex: none; color: var(--muted, #6E6D69); } .pc-item.open .pc-item-i { color: var(--ink, #121317); }
.pc-item-txt .ed { font-style: normal; font-weight: 600; color: var(--warn, #B7791F); font-size: 11px; }
.pc-item-caret { font-size: 14px; color: var(--muted, #6E6D69); transition: transform .2s; flex: none; } .pc-item.open .pc-item-caret { transform: rotate(180deg); }
.pc-item.open { border-color: var(--ink, #121317); box-shadow: 0 6px 20px rgba(0,0,0,.06); }
.pc-panel { padding: 2px 12px 10px; border-top: 1px solid var(--line, #E6E4DE); }
.pc-panel-sec { margin-top: 10px; }
.pc-panel-h { font-size: 11px; font-weight: 700; color: var(--muted, #6E6D69); margin: 0 2px 6px; }
.pc-panel .pc-fold { margin-top: 10px; border-radius: 10px; background: transparent; } .pc-panel .pc-fold-h { padding: 8px 10px; } .pc-panel .pc-fold-b { padding: 0 10px 10px; }
.pc-panel .pc-opts { border: 0; padding: 0; }
.pc-panel-foot { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.pc-panel-tools { margin-left: auto; display: flex; gap: 2px; }
.pc-mini:disabled { opacity: .35; cursor: default; } .pc-mini:disabled:hover { background: transparent; }
.pc-pick { position: relative; display: block; }
.pc-pick select { width: 100%; height: 34px; appearance: none; -webkit-appearance: none; border: 1px solid var(--line, #E6E4DE); border-radius: 10px; background: #fff; font: inherit; font-size: 13px; font-weight: 600; color: var(--ink, #121317); padding: 0 30px 0 11px; cursor: pointer; outline: none; }
.pc-pick select:hover, .pc-pick select:focus { border-color: var(--ink, #121317); }
.pc-pick > i { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--muted, #6E6D69); pointer-events: none; }
.pc-addbtn { width: 100%; margin-top: 4px; height: 42px; border-radius: 14px; border: 1.5px dashed #c9c7c1; background: transparent; font: inherit; font-size: 13px; font-weight: 600; color: var(--ink, #121317); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; }
.pc-addbtn:hover { border-style: solid; border-color: var(--ink, #121317); background: #fff; } .pc-addbtn i { font-size: 16px; }
.pc-addmenu, .pc-help { margin-top: 4px; background: #fff; border: 1px solid var(--ink, #121317); border-radius: 14px; padding: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
.pc-help { margin: 0 0 12px; }
.pc-addmenu-h { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 6px 6px; font-size: 13px; }
.pc-add-no { font-size: 11px; color: var(--muted, #6E6D69); line-height: 1.4; margin: 6px 6px 2px; }
.pc-help .pc-faq { padding: 0 6px 4px; }
.pc-preset-ic { font-size: 18px; flex: none; width: 22px; text-align: center; }
.pc-lay-desc b { color: var(--ink, #121317); font-weight: 600; }
.pc-dot-any { position: relative; display: grid; place-items: center; background: #fff; overflow: hidden; } .pc-dot-any i { font-size: 12px; color: var(--muted, #6E6D69); pointer-events: none; }
.pc-dot-any input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.pc-weekdays { display: grid; gap: 4px; margin-top: 6px; padding: 8px 10px; border-radius: 10px; background: var(--soft, #EFEEEA); }
.pc-weekdays > span { font-size: 11.5px; font-weight: 600; color: var(--muted, #6E6D69); } .pc-weekdays .pc-row { font-size: 12.5px; }
.pc-stepper { display: inline-flex; align-items: center; gap: 6px; } .pc-stepper b { min-width: 14px; text-align: center; font-variant-numeric: tabular-nums; }
.pc-stepper button { width: 24px; height: 24px; border-radius: 7px; border: 1px solid var(--line, #E6E4DE); background: #fff; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }
.pc-stepper button:disabled { opacity: .4; cursor: default; } .pc-warn { color: var(--warn, #B7791F); font-size: 11px; font-weight: 600; }
.pc-empty { text-align: center; padding: 18px 10px; border: 1px dashed #cfcdc7; border-radius: 14px; font-size: 13px; color: var(--muted, #6E6D69); }
.pc-note { font-size: 12px; color: var(--muted, #6E6D69); line-height: 1.5; margin: 14px 4px 0; display: flex; gap: 8px; } .pc-note i { font-size: 16px; flex: none; margin-top: 1px; }
.pc-lay:hover { border-color: #b5b3ae; } .pc-lay.on { border-color: var(--ink, #121317); box-shadow: 0 0 0 1px var(--ink, #121317); }
.pc-lay-prev .pg { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); width: 40px; height: 57px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.1); border-radius: 2px; overflow: hidden; }
.pc-lay-prev .t { position: absolute; left: 5px; top: 8px; width: 20px; height: 4px; border-radius: 2px; background: var(--c); }
.pc-lay-prev .l { position: absolute; left: 5px; right: 5px; height: 2px; background: #dedcd7; border-radius: 1px; }
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
.pc-foot { height: 6mm; border-top: .3mm solid #e4e4e7; display: grid; grid-template-columns: 1fr auto 1fr; }
.pc-foot > .num { justify-self: end; }
.pc-foot .num { font-variant-numeric: tabular-nums; color: #1b1b1f; font-weight: 600; }
.pc-sheet.pc-theme .pc-bm, .pc-sheet.pc-theme .pc-bm * { font-family: 'Inter', system-ui, sans-serif !important; font-style: normal !important; }
.pc-bm { display: inline-flex; align-items: center; gap: 1.3mm; font-size: 6.5pt; color: #8a8a90; white-space: nowrap; line-height: 1; z-index: 2; }
.pc-bm b { font-size: 6.5pt; font-weight: 600; letter-spacing: .3em; color: #1b1b1f; margin-right: -.3em; }
.pc-sheet > .pc-bm { background: rgba(255,255,255,.88); padding: 1mm 2.4mm; border-radius: 3mm; }
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
.d-aisle { margin-bottom: 3.5mm; } .d-aisle-h { font-size: 8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin: 0 0 1mm; }
.d-diary { margin-bottom: 5mm; } .d-diary b { display: block; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1mm; }
.d-diary i { display: block; height: 8mm; border-bottom: .25mm solid #cfcfd4; }
.d-check td { height: 11mm; border: .25mm solid #e4e4e7; } .d-check th { border-bottom-width: .35mm; }
/* ---- modi di mostrare i dati ("Come mostrarlo") ---- */
.d-week { font-size: 7.6pt; table-layout: fixed; } .d-week th, .d-week td { vertical-align: top; padding: 1.6mm 1.6mm; }
.d-week tbody td, .d-week tbody th { border-bottom: .25mm solid #e4e4e7; } .d-week tbody td + td, .d-week tbody th + td { border-left: .25mm solid #eeeef0; }
.d-week thead th:first-child, .d-week .d-wk-day { width: 24mm; } .d-week .d-wk-day { letter-spacing: 0; text-transform: none; hyphens: none; }
.d-wk-day { text-align: left; font-size: 8.5pt; font-weight: 700; color: var(--accent); } .d-wk-day small { display: block; font-size: 6.5pt; font-weight: 500; color: inherit; opacity: .75; margin-top: .6mm; }
.pc-theme .d-week tbody th { border-radius: 0 !important; }
.d-wk-f { margin-bottom: 1mm; line-height: 1.3; } .d-wk-f:last-child { margin-bottom: 0; }
.d-alt { color: #8a8a90; font-style: italic; }
.d-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.d-card { border: .3mm solid #e4e4e7; border-radius: 3mm; padding: 3mm 3.5mm; break-inside: avoid; }
.d-card-h { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.8mm; margin-bottom: 2mm; border-bottom: .5mm solid var(--accent); }
.d-card-h b { font-size: 12pt; font-weight: 700; color: var(--accent); } .d-card-h em { font-style: normal; font-size: 7.5pt; color: #8a8a90; }
.d-card-m { margin-bottom: 1.8mm; } .d-card-m > span { display: block; font-size: 6.8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6b6b72; }
.d-card-m p { margin: .4mm 0 0; font-size: 8.5pt; line-height: 1.38; }
.d-ls { margin-bottom: 4mm; break-inside: avoid; } .d-ls-day { font-size: 11pt; font-weight: 700; color: var(--accent); margin: 0 0 1.2mm; }
.d-ls p { margin: 0 0 1mm; font-size: 9.5pt; line-height: 1.45; } .d-ls p b { display: inline-block; min-width: 22mm; font-weight: 700; }
.d-tw .d-wk-day { width: 7mm !important; text-align: center; } .d-tw thead th:first-child { width: 7mm; } .d-tw-p { font-size: 7pt; color: #6b6b72; line-height: 1.3; }
.d-tc { display: flex; align-items: center; gap: 3mm; padding: 1.6mm 0; border-bottom: .25mm solid #eeeef0; } .d-tc:last-of-type { border-bottom: 0; }
.d-tc-n { flex: 1; min-width: 0; } .d-tc-n b { display: block; font-size: 9pt; font-weight: 700; } .d-tc-n small { display: block; font-size: 7pt; color: #6b6b72; margin-top: .3mm; }
.d-tc-b { display: flex; flex-wrap: wrap; gap: 1mm; justify-content: flex-end; max-width: 26mm; } .d-tc-b .d-box { width: 4mm; height: 4mm; }
.d-tc-note { margin: 1.5mm 0 0; font-size: 7.5pt; color: #6b6b72; font-style: italic; }
.d-log { font-size: 8pt; table-layout: fixed; } .d-log th:first-child, .d-log td:first-child { width: 52mm; }
.d-log th small { display: block; font-size: 6pt; font-weight: 500; letter-spacing: 0; text-transform: none; opacity: .75; margin-top: .4mm; }
.d-log td { height: 11mm; vertical-align: top; border: .25mm solid #e4e4e7; } .d-log td small { display: block; font-size: 6.8pt; color: #6b6b72; margin-top: .4mm; line-height: 1.3; }
.d-gal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.d-gal-i { border: .3mm solid #e4e4e7; border-radius: 3mm; padding: 2mm; break-inside: avoid; background: #fff; }
.d-gal-img { display: flex; gap: 1mm; aspect-ratio: 16 / 9; border-radius: 2mm; overflow: hidden; background: #f4f4f5; }
.d-gal-img img { flex: 1; min-width: 0; height: 100%; object-fit: cover; display: block; } .d-gal-none { flex: 1; }
.d-gal-t { display: flex; align-items: baseline; gap: 1.5mm; margin-top: 2mm; } .d-gal-t b { font-size: 9pt; font-weight: 700; line-height: 1.25; }
.d-gal-n { flex: none; width: 4.6mm; height: 4.6mm; border-radius: 50%; background: var(--accent); color: #fff; font-size: 7pt; font-weight: 700; display: inline-grid; place-items: center; transform: translateY(-.3mm); }
.d-gal-i small { display: block; font-size: 7.5pt; color: #6b6b72; margin-top: .6mm; padding-left: 6.1mm; }
.d-log-p { display: block; font-size: 6.4pt !important; color: #9a9aa0 !important; margin: 0 !important; line-height: 1.25; }
.d-howto { border: .35mm solid color-mix(in srgb, var(--accent) 45%, #fff); background: color-mix(in srgb, var(--accent) 6%, #fff); border-radius: 3mm; padding: 3mm 4mm; margin: 0 0 5mm; font-size: 8.8pt; break-inside: avoid; }
.d-howto > b { display: block; font-size: 7.5pt; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-bottom: 1.5mm; }
.d-howto ol { margin: 0; padding-left: 5mm; } .d-howto li { margin: 0 0 1mm; line-height: 1.4; } .d-howto li::marker { color: var(--accent); font-weight: 700; } .d-howto strong { font-weight: 700; }
.d-onepage { font-size: 7.8pt; table-layout: fixed; } .d-onepage td, .d-onepage th { padding: 1mm 1.6mm; vertical-align: top; line-height: 1.3; } .d-onepage td:first-child, .d-onepage thead th:first-child { width: 46mm; }
.d-onepage td:not(:first-child) { color: #44444b; } .d-onepage .d-all-g th { text-align: left; padding: 1.6mm 1.6mm 1.1mm; } .d-onepage th small { display: block; font-size: 6pt; font-weight: 500; text-transform: none; letter-spacing: 0; opacity: .8; }
.d-all { font-size: 8.4pt; } .d-all td { padding: .9mm 2mm; vertical-align: top; line-height: 1.3; } .d-all td.l { color: #55555c; width: 22%; } .d-all td:not(.l) { width: 28%; }
.d-all .d-all-g th { text-align: left; padding: 1.4mm 2mm 1mm; }
.d-all tr:first-child.d-all-g th, .d-all tr + .d-all-g th { padding-top: 2mm; }
.d-all small { color: #8a8a90; }
.d-dash { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-bottom: 4mm; }
.d-dash-n { text-align: center; padding: 4mm 2mm; border-radius: 3mm; background: color-mix(in srgb, var(--accent) 8%, #fff); }
.d-dash-n span { display: block; font-size: 7pt; letter-spacing: .16em; text-transform: uppercase; color: #6b6b72; font-weight: 600; }
.d-dash-n b { font-size: 30pt; font-weight: 700; line-height: 1.1; color: var(--accent); } .d-dash-n small { font-size: 10pt; color: #6b6b72; margin-left: 1mm; }
.d-gauges { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm 8mm; }
.d-gauge { break-inside: avoid; } .d-gauge-h { display: flex; align-items: baseline; gap: 2mm; margin-bottom: 2mm; }
.d-gauge-h span { font-size: 8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; flex: 1; } .d-gauge-h b { font-size: 15pt; font-weight: 700; } .d-gauge-h b small { font-size: 8pt; color: #6b6b72; }
.d-gauge-h em { font-style: normal; font-size: 7.5pt; font-weight: 600; color: var(--accent); }
.d-gauge-bar { position: relative; display: flex; height: 3mm; border-radius: 2mm; overflow: visible; }
.d-gauge-bar i { height: 100%; background: color-mix(in srgb, var(--accent) 14%, #eee); } .d-gauge-bar i.ok { background: color-mix(in srgb, var(--accent) 55%, #fff); }
.d-gauge-bar i:first-child { border-radius: 2mm 0 0 2mm; } .d-gauge-bar i:nth-last-child(2) { border-radius: 0 2mm 2mm 0; }
.d-gauge-bar i + i { margin-left: .4mm; }
.d-gauge-bar u { position: absolute; top: -1.2mm; width: 2.4mm; height: 5.4mm; margin-left: -1.2mm; border-radius: 1.2mm; background: #1b1b1f; border: .5mm solid #fff; }
.d-gauge-sc { position: relative; height: 4mm; font-size: 6.5pt; color: #8a8a90; } .d-gauge-sc span { position: absolute; top: 1mm; transform: translateX(-50%); }
.d-grid-4 { grid-template-columns: repeat(4, 1fr); }
.d-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(26mm, 1fr)); border-top: .5mm solid var(--accent); border-bottom: .3mm solid #e4e4e7; margin: 2mm 0 5mm; }
.d-strip > div { padding: 3mm 2.5mm; } .d-strip > div + div { border-left: .25mm solid #e4e4e7; }
.d-strip span { display: block; font-size: 6.6pt; letter-spacing: .12em; text-transform: uppercase; color: #6b6b72; font-weight: 600; }
.d-strip b { display: block; font-size: 16pt; font-weight: 700; margin-top: 1mm; color: var(--accent); } .d-strip b small { font-size: 8pt; color: #6b6b72; margin-left: .5mm; } .d-strip em { font-style: normal; font-size: 7pt; color: #6b6b72; }
.d-goal { font-size: 10pt; padding: 3mm 4mm; border-left: 1mm solid var(--accent); background: color-mix(in srgb, var(--accent) 6%, #fff); }
.d-goal span { font-size: 7pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-right: 2mm; }
.d-brief .d-prose { font-size: 11pt; min-height: 60mm; }
.d-prog { font-size: 8.4pt; } .d-prog th small { font-weight: 500; text-transform: none; letter-spacing: 0; }
.d-prog .d-prog-tot td { font-weight: 700; border-top: .45mm solid var(--accent); border-bottom: 0; color: var(--accent); }
.d-cmp { display: grid; gap: 2.5mm; }
.d-cmp-r { display: grid; grid-template-columns: 38mm 1fr 8mm 1fr 30mm; align-items: center; gap: 2mm; padding: 3mm 4mm; border-radius: 3mm; background: color-mix(in srgb, var(--accent) 6%, #fff); break-inside: avoid; }
.d-cmp-l { font-size: 9.5pt; font-weight: 700; }
.d-cmp-v span { display: block; font-size: 6.8pt; letter-spacing: .1em; text-transform: uppercase; color: #8a8a90; } .d-cmp-v b { font-size: 15pt; font-weight: 600; color: #8a8a90; } .d-cmp-v b small { font-size: 8pt; }
.d-cmp-v.now b { color: #1b1b1f; font-weight: 700; }
.d-cmp-arrow { font-size: 14pt; color: var(--accent); text-align: center; }
.d-cmp-d { justify-self: end; font-size: 11pt; font-weight: 700; color: #fff; background: var(--accent); border-radius: 10mm; padding: 1.2mm 3.5mm; white-space: nowrap; }
/* ---- ricettario: un piccolo libro di cucina ---- */
/* il frontespizio riempie la pagina (altezza utile del foglio, divisa per la dimensione del testo) */
.d-rb-front { min-height: calc(var(--pc-body-h, 226mm) / var(--pc-scale, 1) - 3mm); display: flex; }
.d-rb-frame, .d-rb-end { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4mm; }
.d-rb-frame { border: .9mm double color-mix(in srgb, var(--accent) 60%, #fff); border-radius: 2mm; padding: 12mm 10mm; }
.d-rb-mono { width: 24mm; height: 24mm; border-radius: 50%; border: .4mm solid var(--accent); display: grid; place-items: center; margin-bottom: 4mm; box-shadow: 0 0 0 1.4mm #fff, 0 0 0 1.7mm color-mix(in srgb, var(--accent) 45%, #fff); }
.d-rb-mono span { font-size: 15pt; font-weight: 700; letter-spacing: .08em; color: var(--accent); }
.d-rb-end { min-height: 200mm; }
.d-rb-orn { display: flex; align-items: center; gap: 3mm; width: 64mm; color: var(--accent); } .d-rb-orn span { flex: 1; height: .3mm; background: currentColor; opacity: .55; } .d-rb-orn i { font-style: normal; font-size: 10pt; line-height: 1; }
.pc-theme .d-rb .d-rb-booktitle { font-size: 50pt; line-height: 1; margin: 1mm 0; text-align: center; } .pc-theme .d-rb .d-rb-booktitle.small { font-size: 36pt; }
.d-rb-for { font-size: 11pt; color: #55555c; margin: 0; max-width: 120mm; } .d-rb-for b { color: #1b1b1f; }
.d-rb-by { display: grid; gap: .8mm; margin-top: 8mm; } .d-rb-by small { font-size: 7pt; letter-spacing: .3em; text-transform: uppercase; color: #8a8a90; } .d-rb-by b { font-size: 14pt; font-weight: 700; } .d-rb-by span { font-size: 8.5pt; color: #6b6b72; }
.pc-theme .pc-flow .d-sig, .pc-measure .pc-flow .d-sig { font-family: 'Caveat', cursive !important; font-size: 28pt; font-weight: 600; color: var(--accent); line-height: 1; transform: rotate(-4deg); margin: 2mm 0; font-style: normal !important; letter-spacing: 0 !important; text-transform: none !important; }
.pc-theme .pc-flow .d-rb-intro .d-sig, .pc-measure .pc-flow .d-rb-intro .d-sig { text-align: right; margin: 10mm 8mm 10mm 0; }
.d-rb-ed { font-size: 7.5pt; letter-spacing: .24em; text-transform: uppercase; color: #8a8a90; margin-top: 6mm; }
.d-rb-contacts { display: flex; flex-wrap: wrap; justify-content: center; gap: 1mm 4mm; font-size: 8.5pt; color: #55555c; margin-top: 4mm; }
.d-rb-legend { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; padding-top: 4mm; border-top: .3mm solid #e4e4e7; font-size: 8pt; color: #6b6b72; }
.d-rb-legend b { display: block; font-size: 11pt; color: var(--accent); margin-bottom: .8mm; } .d-rb-legend i { display: inline-block; width: 6mm; height: 2.4mm; border-radius: 1mm; margin: 0 1mm 1.2mm 0; }
.d-rb-index .d-rb-idx-g { margin-bottom: 5mm; break-inside: avoid; }
.d-rb-idx-r { display: flex; align-items: baseline; gap: 3mm; padding: 1.6mm 0; font-size: 10.5pt; }
.d-rb-idx-n { font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; width: 8mm; } .d-rb-idx-r i { flex: 1; border-bottom: .3mm dotted #b9b9bf; transform: translateY(-1mm); } .d-rb-idx-r small { color: #8a8a90; font-size: 8pt; }
.d-rb-recipe { margin-bottom: 6mm; }
.d-rb-recipe.compact { break-inside: avoid; } /* compatto: ogni ricetta resta intera, se non entra va alla pagina dopo */
.d-rb-recipe.compact { margin-bottom: 9mm; }
.d-rb-head { display: flex; align-items: center; gap: 6mm; padding: 6mm 7mm; margin-bottom: 4mm; border-radius: 4mm; background: color-mix(in srgb, var(--accent) 9%, #fff); }
.d-rb-head .d-kicker { display: block; margin: 0 0 1mm; }
.d-rb-num { flex: none; font-size: 46pt; font-weight: 800; line-height: .9; color: transparent; -webkit-text-stroke: .4mm var(--accent); letter-spacing: -.03em; font-variant-numeric: tabular-nums; }

.pc-theme .d-rb .d-rb-title { font-size: 25pt; line-height: 1.05; margin: 0; display: block; }
.pc-theme .d-rb .compact .d-rb-title { font-size: 18pt; } .d-rb-recipe.compact .d-rb-num { font-size: 30pt; } .d-rb-recipe.compact .d-rb-head { padding: 4mm 5mm; }
.d-rb-meta { display: grid; grid-template-columns: repeat(3, 1fr); border-top: .45mm solid var(--accent); border-bottom: .25mm solid #e4e4e7; margin-bottom: 3mm; }
.d-rb-meta > div { padding: 2.4mm 2mm; } .d-rb-meta > div + div { border-left: .25mm solid #e4e4e7; }
.d-rb-meta span { display: block; font-size: 6.8pt; letter-spacing: .14em; text-transform: uppercase; color: #6b6b72; font-weight: 600; } .d-rb-meta b { font-size: 13pt; font-weight: 700; }
.d-rb-macro { margin-bottom: 5mm; } .d-rb-bar { display: flex; height: 2.4mm; border-radius: 2mm; overflow: hidden; gap: .4mm; }
.d-rb-bar .c, .d-rb-leg .c, .d-rb-legend .c { background: var(--accent); } .d-rb-bar .p, .d-rb-leg .p, .d-rb-legend .p { background: color-mix(in srgb, var(--accent) 55%, #fff); } .d-rb-bar .f, .d-rb-leg .f, .d-rb-legend .f { background: color-mix(in srgb, var(--accent) 25%, #fff); }
.d-rb-leg { display: flex; gap: 5mm; margin-top: 1.6mm; font-size: 7.5pt; color: #6b6b72; } .d-rb-leg i { display: inline-block; width: 2.4mm; height: 2.4mm; border-radius: 50%; margin-right: 1.2mm; vertical-align: -.3mm; } .d-rb-leg b { color: #1b1b1f; }
.d-rb-cols { display: grid; grid-template-columns: .92fr 1.08fr; gap: 8mm; align-items: start; }
.d-rb-h { font-size: 8pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); margin: 0 0 2.5mm; } .d-rb-h small { letter-spacing: 0; text-transform: none; color: #8a8a90; font-weight: 500; margin-left: 1mm; }
.pc-flow .d-rb-ings ul { list-style: none; padding: 0; margin: 0; }
.d-rb-ings li { display: flex; align-items: baseline; gap: 2mm; padding: 1.3mm 0; font-size: 9.5pt; margin: 0; } .d-rb-ings li i { flex: 1; border-bottom: .3mm dotted #c4c4c8; transform: translateY(-1mm); min-width: 4mm; } .d-rb-ings li b { font-variant-numeric: tabular-nums; white-space: nowrap; }
.pc-flow .d-rb-steps { padding-left: 6mm; margin: 0; } .d-rb-steps li { font-size: 9.8pt; line-height: 1.5; margin: 0 0 2.4mm; padding-left: 1mm; } .d-rb-steps li::marker { color: var(--accent); font-weight: 800; font-size: 11pt; }
.d-rb-tip { margin-top: 5mm; padding: 3mm 4mm; border-left: 1.2mm solid var(--accent); background: color-mix(in srgb, var(--accent) 7%, #fff); border-radius: 0 2.5mm 2.5mm 0; break-inside: avoid; }
.d-rb-tip b { display: block; font-size: 7.5pt; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); margin-bottom: 1mm; } .d-rb-tip p { margin: 0; font-size: 9.5pt; font-style: italic; line-height: 1.5; }
.d-rb-notes { margin-top: 6mm; break-inside: avoid; } .d-rb-notes b { display: block; font-size: 7.5pt; letter-spacing: .16em; text-transform: uppercase; color: #8a8a90; margin-bottom: 1mm; } .d-rb-notes i { display: block; height: 8mm; border-bottom: .25mm solid #cfcfd4; }
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
