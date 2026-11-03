import { ECG, GIOCOSO_PLATES, PASTELLO_CIRCLES, highlight, tri } from './logic/printArt';

// Grafica dei layout del Centro stampa. Il contenuto dei documenti è sempre lo stesso HTML (classi d-*, tp-*):
// ogni layout cambia caratteri, colori, blocchi e decorazioni del foglio (.pc-deco con ::before, ::after e due <i>).
// Margini extra e caratteri da caricare sono in logic/theme.js.

// le decorazioni sono immagini SVG a tinta piena (vedi logic/printArt.js): Safari in PDF rovina maschere e sfumature trasparenti
const bg = (img, size = '100% 100%', repeat = 'no-repeat') => `background: ${img} ${repeat} 0 0 / ${size};`;

const scope = (id, sels) =>
    sels
        .split(',')
        .map((s) => `.pc-l-${id} ${s.trim()}`)
        .join(', ');
// testi da titolo: si prendono il carattere "di carattere" del layout
const DISPLAY = '.d-title, .d-studio, .d-kpi b, .d-day-title, .pc-flow h1, .pc-flow [style*="Playfair"], .tp-doc-title, .tp-week-title, .tp-studio-name, .pc-cover-title, .pc-cover-foot strong';
const fonts = (id, body, display) => `
${scope(id, '.pc-flow *, .pc-cover, .pc-cover *, .pc-head, .pc-head *, .pc-foot, .pc-foot *')} { font-family: ${body} !important; }
${scope(id, DISPLAY)} { font-family: ${display} !important; }`;

const base = `
/* i documenti esistenti (dieta, allenamento, lettera) seguono il colore guida */
.pc-theme .pc-flow [style*="solid #000"], .pc-theme .pc-flow [style*="solid #111"] { border-color: var(--accent) !important; }
.pc-theme .tp-table th, .pc-theme .tp-ss { background-color: var(--accent); }
.pc-theme .tp-daynote { background-color: #f4f4f6; border-left-color: var(--accent); }
.pc-theme .tp-head, .pc-theme .tp-week-title { border-color: var(--accent); }
.pc-deco > i { position: absolute; display: none; }
.pc-deco::before, .pc-deco::after, .pc-deco > i::before { content: none; position: absolute; }
.pc-cover > * { position: relative; z-index: 1; }
.pc-cover::before, .pc-cover::after { position: absolute; z-index: 0; pointer-events: none; }
`;

// ---------- Elegante: serif, doppi filetti, rombi ----------
const elegante = `
.pc-l-elegante .pc-flow * { font-family: Georgia, 'Times New Roman', serif !important; }
.pc-l-elegante .d-title, .pc-l-elegante .d-studio, .pc-l-elegante .d-kpi b, .pc-l-elegante .pc-flow h1, .pc-l-elegante .pc-flow h2, .pc-l-elegante .pc-flow [style*="Playfair"], .pc-l-elegante .tp-doc-title, .pc-l-elegante .tp-week-title, .pc-l-elegante .tp-studio-name { font-family: 'Playfair Display', Georgia, serif !important; }
.pc-l-elegante .d-mast { border-bottom: 1mm double var(--accent); }
.pc-l-elegante .d-h { border-bottom: .9mm double var(--accent); letter-spacing: .24em; }
.pc-l-elegante .d-h::before { content: '◆'; width: auto; height: auto; background: none; color: var(--accent); font-size: 6pt; }
.pc-l-elegante .d-kpi { background: #fff; border-color: color-mix(in srgb, var(--accent) 35%, #fff); }
.pc-l-elegante .pc-head { border-bottom: .8mm double color-mix(in srgb, var(--accent) 55%, #fff); font-family: Georgia, serif; font-style: italic; }
.pc-l-elegante .pc-foot { font-family: Georgia, serif; font-style: italic; }
`;

// ---------- Giocoso: blocchi arancio e verde dai bordi morbidi, scritto a mano, piatti che spuntano dai lati ----------
const WOB = 'border-radius: 6mm 3.5mm 7mm 3mm / 4mm 6mm 3mm 6.5mm;';
const giocoso = `
.pc-l-giocoso { --a2: #6E9A2C; }
.pc-sheet.pc-l-giocoso { background: #FFFCF6; }
${fonts('giocoso', "'Nunito', system-ui, sans-serif", "'Gaegu', 'Comic Sans MS', cursive")}
.pc-l-giocoso .pc-deco::before { content: ''; inset: 0; ${bg(GIOCOSO_PLATES)} }
.pc-l-giocoso .pc-deco::after { content: ''; right: -14mm; bottom: -16mm; width: 46mm; height: 38mm; background: color-mix(in srgb, var(--a2) 30%, #fff); border-radius: 58% 42% 55% 45% / 50% 60% 40% 50%; }
.pc-l-giocoso .pc-deco > i:first-child { display: block; left: -12mm; top: -10mm; width: 38mm; height: 30mm; background: color-mix(in srgb, var(--accent) 22%, #fff); border-radius: 45% 55% 60% 40% / 55% 45% 55% 45%; }
.pc-l-giocoso .d-mast { background: var(--accent); color: #fff; padding: 4mm 5.5mm; border: 0; ${WOB} }
.pc-l-giocoso .d-mast .d-role, .pc-l-giocoso .d-mast-r { color: rgba(255,255,255,.88); }
.pc-l-giocoso .d-studio { font-size: 22pt; font-weight: 700; }
.pc-l-giocoso .d-title, .pc-l-giocoso .d-day-title { font-size: 34pt; font-style: normal; font-weight: 700; color: var(--accent); letter-spacing: 0; line-height: .95; }
.pc-l-giocoso .d-kicker { color: var(--a2); font-weight: 800; }
.pc-l-giocoso .d-kpi { border: 0; background: var(--accent); color: #fff; ${WOB} }
.pc-l-giocoso .d-kpi:nth-child(even) { background: var(--a2); }
.pc-l-giocoso .d-kpi span, .pc-l-giocoso .d-kpi em, .pc-l-giocoso .d-kpi b small { color: rgba(255,255,255,.9); }
.pc-l-giocoso .d-kpi b { color: #fff; font-size: 24pt; font-weight: 700; }
.pc-l-giocoso .d-h { width: fit-content; background: var(--a2); color: #fff; border: 0; padding: 1mm 5mm 1.2mm 4mm; font-family: 'Gaegu', cursive !important; font-size: 17pt; font-weight: 700; letter-spacing: 0; text-transform: none; ${WOB} }
.pc-l-giocoso .d-h:nth-of-type(even) { background: var(--accent); }
.pc-l-giocoso .d-h::before { background: #fff; }
.pc-l-giocoso .d-panel { border: .6mm solid color-mix(in srgb, var(--accent) 40%, #fff); ${WOB} }
.pc-l-giocoso .d-panel-h { background: color-mix(in srgb, var(--accent) 14%, #fff); border: 0; color: color-mix(in srgb, var(--accent) 70%, #000); }
.pc-l-giocoso .d-table th { background: var(--a2); color: #fff; border: 0; } .pc-l-giocoso .d-table th:first-child { border-radius: 3mm 0 0 3mm; } .pc-l-giocoso .d-table th:last-child { border-radius: 0 3mm 3mm 0; }
.pc-l-giocoso .d-table td, .pc-l-giocoso .d-kv td, .pc-l-giocoso .d-kv th, .pc-l-giocoso .d-foods td { border-color: color-mix(in srgb, var(--accent) 22%, #fff) !important; border-style: dashed !important; }
.pc-l-giocoso .d-day-h { border-bottom: .8mm dashed var(--a2); }
.pc-l-giocoso .d-meal-h { background: var(--accent); border: 0; padding: 1.6mm 4.5mm; ${WOB} }
.pc-l-giocoso .d-meal:nth-child(odd) .d-meal-h { background: var(--a2); }
.pc-l-giocoso .d-meal-h span { color: #fff; font-family: 'Gaegu', cursive !important; font-size: 15pt; letter-spacing: 0; text-transform: none; }
.pc-l-giocoso .d-meal-h em { color: rgba(255,255,255,.92); }
.pc-l-giocoso .d-chart { border: .6mm dashed color-mix(in srgb, var(--a2) 50%, #fff); ${WOB} }
.pc-l-giocoso .d-sign, .pc-l-giocoso .pc-head, .pc-l-giocoso .pc-foot { border-style: dashed; border-color: color-mix(in srgb, var(--accent) 45%, #fff); }
.pc-l-giocoso .pc-head .acc { font-family: 'Gaegu', cursive !important; font-size: 11pt; letter-spacing: 0; text-transform: none; }
.pc-l-giocoso .pc-cover-mid { background: var(--accent); color: #fff; padding: 11mm 10mm 12mm; margin-top: 30mm; ${WOB} }
.pc-l-giocoso .pc-cover-kicker, .pc-l-giocoso .pc-cover-date { color: rgba(255,255,255,.9); }
.pc-l-giocoso .pc-cover-title { color: #fff; font-size: 58pt; font-style: normal; font-weight: 700; }
.pc-l-giocoso .pc-cover-rule { background: var(--a2); height: 2mm; width: 34mm; }
.pc-l-giocoso .pc-cover-index div i { border-bottom-style: dashed; }
.pc-l-giocoso .pc-cover-foot { border-top: .6mm dashed var(--a2); }
`;

// ---------- Planner: foglio bianco su fondo salvia con disegni a tratto, righe a griglia, titoli a mano ----------
const planner = `
.pc-l-planner { --line: color-mix(in srgb, var(--accent) 38%, #fff); --ink-a: color-mix(in srgb, var(--accent) 70%, #000); }
.pc-sheet.pc-l-planner { background: color-mix(in srgb, var(--accent) 24%, #F2F5F0); }
${fonts('planner', "'Karla', system-ui, sans-serif", "'Caveat', cursive")}
.pc-l-planner .pc-deco::before { content: ''; inset: 0; ${bg('var(--art-planner-doodles)', '30mm 30mm', 'repeat')} }
.pc-l-planner .pc-deco::after { content: ''; inset: 8mm; background: #fff; border-radius: 6mm; box-shadow: 0 .5mm 2.5mm rgba(0,0,0,.08); }
.pc-l-planner .d-mast { border-bottom: .35mm solid var(--line); }
.pc-l-planner .d-studio { font-size: 24pt; font-weight: 600; color: var(--ink-a); }
.pc-l-planner .d-title, .pc-l-planner .d-day-title { font-size: 36pt; font-style: normal; font-weight: 600; color: var(--ink-a); letter-spacing: 0; line-height: .95; }
.pc-l-planner .d-kicker { color: var(--accent); }
.pc-l-planner .d-h { font-family: 'Caveat', cursive !important; font-size: 21pt; font-weight: 600; text-transform: none; letter-spacing: 0; color: var(--ink-a); border: 0; padding-bottom: 2.4mm;
  background: var(--art-planner-dot) bottom left / 2mm 1mm repeat-x; }
.pc-l-planner .d-h::before { content: none; }
.pc-l-planner .d-kpi { background: #fff; border: .35mm solid var(--line); border-radius: 2mm; }
.pc-l-planner .d-kpi b { font-family: 'Karla', sans-serif !important; font-weight: 700; color: var(--ink-a); }
.pc-l-planner .d-table, .pc-l-planner .d-kv, .pc-l-planner .d-foods { border: .35mm solid var(--line); }
.pc-l-planner .d-table th, .pc-l-planner .d-table td, .pc-l-planner .d-kv th, .pc-l-planner .d-kv td, .pc-l-planner .d-foods td { border: .3mm solid var(--line) !important; padding-left: 2.5mm; padding-right: 2.5mm; }
.pc-l-planner .d-table th { color: var(--ink-a); text-transform: none; letter-spacing: 0; font-size: 8.5pt; text-align: center; }
.pc-l-planner .d-panel { border: .35mm solid var(--line); border-radius: 1.5mm; }
.pc-l-planner .d-panel-h { background: color-mix(in srgb, var(--accent) 10%, #fff); color: var(--ink-a); border-color: var(--line); }
.pc-l-planner .d-day-h { border-bottom: .35mm solid var(--line); }
.pc-l-planner .d-meal-h { background: color-mix(in srgb, var(--accent) 9%, #fff); border: .3mm solid var(--line); border-bottom: 0; border-radius: 1.5mm 1.5mm 0 0; }
.pc-l-planner .d-meal-h span { font-family: 'Caveat', cursive !important; font-size: 17pt; font-weight: 600; text-transform: none; letter-spacing: 0; color: var(--ink-a); }
.pc-l-planner .d-diary i { border-bottom: 0; background: var(--art-planner-dot-s) bottom left / 2mm 1mm repeat-x; }
.pc-l-planner .d-box { border-color: var(--accent); border-radius: 50%; }
.pc-l-planner .d-chart { border-color: var(--line); border-radius: 2mm; }
.pc-l-planner .pc-head, .pc-l-planner .pc-foot { border-color: var(--line); }
.pc-l-planner .pc-head .acc { color: var(--ink-a); }
.pc-l-planner .pc-cover { padding: 30mm 28mm 26mm; }
.pc-l-planner .pc-cover-title { font-size: 66pt; font-style: normal; font-weight: 600; color: var(--ink-a); letter-spacing: 0; }
.pc-l-planner .pc-cover-rule { height: .5mm; width: 100%; background: var(--art-planner-dot-l) left / 2mm 1mm repeat-x; }
.pc-l-planner .pc-cover-index { border: .35mm solid var(--line); border-radius: 3mm; padding: 5mm 6mm; }
.pc-l-planner .pc-cover-foot { border-top-color: var(--line); }
`;

// ---------- Energia: sfumatura rosa-arancio, curve, maiuscole pesanti, pillole ----------
const energia = `
.pc-l-energia { --a2: #FFB23E; --grad: linear-gradient(115deg, var(--accent), var(--a2)); }
${fonts('energia', "'Montserrat', system-ui, sans-serif", "'Montserrat', system-ui, sans-serif")}
.pc-l-energia .pc-deco::before { content: ''; left: -20%; right: -20%; top: -6mm; height: calc(var(--m-t) + 1mm); background: var(--grad); border-radius: 0 0 50% 50% / 0 0 100% 100%; }
.pc-l-energia .pc-deco::after { content: ''; left: -3mm; top: 38%; width: 7mm; height: 64mm; border-radius: 4mm; background: linear-gradient(180deg, var(--accent), var(--a2)); }
.pc-l-energia .pc-deco > i:first-child { display: block; right: -22mm; bottom: -22mm; width: 52mm; height: 52mm; border-radius: 50%; border: 5mm solid color-mix(in srgb, var(--a2) 55%, #fff); }
.pc-l-energia .d-title, .pc-l-energia .d-studio, .pc-l-energia .d-day-title, .pc-l-energia .pc-cover-title { font-style: normal; font-weight: 900; text-transform: uppercase; letter-spacing: -.02em; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pc-l-energia .d-title { font-size: 28pt; line-height: 1; }
.pc-l-energia .d-mast { border-bottom: .6mm solid; border-image: var(--grad) 1; }
.pc-l-energia .d-kicker { color: #1b1b1f; font-weight: 800; }
.pc-l-energia .d-kpi { background: var(--grad); border: 0; border-radius: 5mm; color: #fff; }
.pc-l-energia .d-kpi span, .pc-l-energia .d-kpi em, .pc-l-energia .d-kpi b small { color: rgba(255,255,255,.92); }
.pc-l-energia .d-kpi b { color: #fff; font-weight: 900; }
.pc-l-energia .d-h { width: fit-content; background: var(--grad); color: #fff; border: 0; border-radius: 10mm; padding: 1.4mm 5mm 1.4mm 1.6mm; font-weight: 800; }
.pc-l-energia .d-h::before { width: 4.2mm; height: 4.2mm; background: #fff; }
.pc-l-energia .d-panel { border: .5mm solid transparent; border-radius: 4mm; background: linear-gradient(#fff, #fff) padding-box, var(--grad) border-box; }
.pc-l-energia .d-panel-h { background: none; color: var(--accent); border-bottom: .3mm solid color-mix(in srgb, var(--accent) 22%, #fff); }
.pc-l-energia .d-table th { color: var(--accent); border-bottom: .6mm solid; border-image: var(--grad) 1; }
.pc-l-energia .d-chart { border-radius: 5mm; border-color: color-mix(in srgb, var(--accent) 25%, #fff); }
.pc-l-energia .d-day-h { border-bottom: .6mm solid; border-image: var(--grad) 1; }
.pc-l-energia .d-day-title { font-size: 24pt; }
.pc-l-energia .d-meal-h { background: var(--grad); border: 0; border-radius: 10mm; padding: 1.8mm 5mm; }
.pc-l-energia .d-meal-h span, .pc-l-energia .d-meal-h em { color: #fff; }
.pc-l-energia .d-or { color: var(--accent); }
.pc-l-energia .pc-head { border-bottom: 0; } .pc-l-energia .pc-head .acc { color: var(--accent); font-weight: 800; }
.pc-l-energia .pc-foot { border-top: .4mm solid; border-image: var(--grad) 1; }
.pc-l-energia .pc-cover::before { content: ''; left: -25%; right: -25%; bottom: -2mm; height: 47%; background: var(--grad); border-radius: 50% 50% 0 0 / 22% 22% 0 0; }
.pc-l-energia .pc-cover-title { font-size: 52pt; line-height: .95; }
.pc-l-energia .pc-cover-rule { background: var(--grad); width: 40mm; height: 2mm; }
.pc-l-energia .pc-cover-index, .pc-l-energia .pc-cover-index *, .pc-l-energia .pc-cover-foot, .pc-l-energia .pc-cover-foot * { color: #fff !important; }
.pc-l-energia .pc-cover-index div i { border-bottom-color: rgba(255,255,255,.6); }
.pc-l-energia .pc-cover-foot { border-top-color: rgba(255,255,255,.7); }
`;

// ---------- Geometrico: carta avorio, triangoli e blocchi in tre tinte piatte, corsivo nerissimo ----------
const CUT = 'clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3.5mm), calc(100% - 3.5mm) 100%, 0 100%);';
const geometrico = `
.pc-l-geometrico { --a2: #E5407A; --a3: #F2B632; --ink-g: #1d1a24; }
.pc-sheet.pc-l-geometrico { background: #FBF7F0; }
${fonts('geometrico', "'Archivo', system-ui, sans-serif", "'Archivo', system-ui, sans-serif")}
.pc-l-geometrico .pc-deco::before { content: ''; inset: 0; background:
    ${tri('#F2B632', 'tr')} top right / 40mm 21mm no-repeat,
    ${tri('#E5407A', 'tr')} top right / 17mm 40mm no-repeat,
    var(--art-geo-tri) bottom left / 50mm 15mm no-repeat,
    ${tri('#F2B632', 'bl')} bottom left / 15mm 34mm no-repeat; }
.pc-l-geometrico .pc-deco::after { content: ''; right: 0; top: 46%; width: 4mm; height: 40mm; background: var(--a2); }
.pc-l-geometrico .pc-deco > i:first-child { display: block; right: 0; top: calc(46% + 40mm); width: 4mm; height: 22mm; background: var(--accent); }
.pc-l-geometrico .d-title, .pc-l-geometrico .d-studio, .pc-l-geometrico .d-day-title, .pc-l-geometrico .pc-cover-title, .pc-l-geometrico .d-kpi b { font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -.01em; }
.pc-l-geometrico .d-title { color: var(--a2); font-size: 30pt; line-height: .98; text-shadow: .8mm .8mm 0 var(--a3); }
.pc-l-geometrico .d-studio { color: var(--accent); }
.pc-l-geometrico .d-mast { border-bottom: 1.6mm solid var(--a3); }
.pc-l-geometrico .d-kicker { color: var(--accent); font-weight: 800; font-style: italic; }
.pc-l-geometrico .d-kpi { border: 0; border-radius: 0; background: var(--accent); color: #fff; ${CUT} }
.pc-l-geometrico .d-kpi:nth-child(3n+2) { background: var(--a2); } .pc-l-geometrico .d-kpi:nth-child(3n) { background: var(--a3); color: var(--ink-g); }
.pc-l-geometrico .d-kpi span, .pc-l-geometrico .d-kpi em, .pc-l-geometrico .d-kpi b small, .pc-l-geometrico .d-kpi b { color: inherit; }
.pc-l-geometrico .d-h { width: fit-content; background: var(--accent); color: #fff; border: 0; padding: 1.5mm 7mm 1.5mm 3.5mm; font-style: italic; font-weight: 900; font-size: 9.5pt; clip-path: polygon(0 0, 100% 0, calc(100% - 3.5mm) 100%, 0 100%); }
.pc-l-geometrico .d-h:nth-of-type(3n+2) { background: var(--a2); } .pc-l-geometrico .d-h:nth-of-type(3n) { background: var(--a3); color: var(--ink-g); }
.pc-l-geometrico .d-h::before { content: none; }
.pc-l-geometrico .d-panel { border: 0; border-top: 1.6mm solid var(--accent); border-radius: 0; background: #fff; }
.pc-l-geometrico .d-panel:nth-child(3n+2) { border-top-color: var(--a2); } .pc-l-geometrico .d-panel:nth-child(3n) { border-top-color: var(--a3); }
.pc-l-geometrico .d-panel-h { background: none; font-style: italic; font-weight: 800; border-bottom-color: #eee7dc; }
.pc-l-geometrico .d-table th { background: var(--ink-g); color: #fff; border: 0; font-style: italic; }
.pc-l-geometrico .d-table td, .pc-l-geometrico .d-kv td, .pc-l-geometrico .d-kv th, .pc-l-geometrico .d-foods td { border-color: #ece5d8 !important; }
.pc-l-geometrico .d-chart { border-radius: 0; border: 0; border-left: 1.6mm solid var(--a3); background: #fff; }
.pc-l-geometrico .d-day-h { border-bottom: 1.6mm solid var(--a3); }
.pc-l-geometrico .d-day-title { color: var(--a2); font-size: 24pt; text-shadow: .7mm .7mm 0 var(--a3); }
.pc-l-geometrico .d-meal-h { background: var(--accent); border: 0; border-radius: 0; clip-path: polygon(0 0, 100% 0, calc(100% - 4mm) 100%, 0 100%); padding-right: 8mm; }
.pc-l-geometrico .d-meal:nth-child(3n+2) .d-meal-h { background: var(--a2); }
.pc-l-geometrico .d-meal-h span, .pc-l-geometrico .d-meal-h em { color: #fff; font-style: italic; }
.pc-l-geometrico .d-or { color: var(--a2); }
.pc-l-geometrico .pc-head { border-bottom: .5mm solid var(--ink-g); } .pc-l-geometrico .pc-head .acc { color: var(--a2); font-style: italic; font-weight: 900; }
.pc-l-geometrico .pc-foot { border-top: .5mm solid var(--ink-g); }
.pc-l-geometrico .pc-cover::before { content: ''; inset: 0; background:
    ${tri('#F2B632', 'tr')} top right / 120mm 86mm no-repeat,
    ${tri('#E5407A', 'tr')} top right / 54mm 150mm no-repeat,
    var(--art-geo-tri) bottom left / 170mm 80mm no-repeat; }
.pc-l-geometrico .pc-cover-title { font-size: 50pt; color: var(--ink-g); text-shadow: 1mm 1mm 0 var(--a3); }
.pc-l-geometrico .pc-cover-rule { background: var(--a2); height: 2.4mm; border-radius: 0; }
.pc-l-geometrico .pc-cover-index { background: #FBF7F0; padding: 5mm 6mm; border-left: 2mm solid var(--a2); }
.pc-l-geometrico .pc-cover-foot { background: var(--ink-g); color: #fff; border: 0; padding: 4mm 6mm; } .pc-l-geometrico .pc-cover-foot strong { color: var(--a3); }
`;

// ---------- Naturale: onde verdi in alto e in basso, rametti, titoli stretti maiuscoli ----------
const naturale = `
.pc-l-naturale { --soft: color-mix(in srgb, var(--accent) 13%, #fff); --mid: color-mix(in srgb, var(--accent) 42%, #fff); --deep: color-mix(in srgb, var(--accent) 75%, #0d1a05); }
${fonts('naturale', "'Inter', system-ui, sans-serif", "'Oswald', 'Arial Narrow', sans-serif")}
.pc-l-naturale .pc-deco::before { content: ''; left: 0; right: 0; top: 0; height: calc(var(--m-t) - 2mm); ${bg('var(--art-wave-a)')} }
.pc-l-naturale .pc-deco::after { content: ''; left: 0; right: 0; top: 0; height: calc(var(--m-t) - 7mm); ${bg('var(--art-wave-b)')} }
.pc-l-naturale .pc-deco > i { display: block; left: 0; right: 0; bottom: 0; transform: scale(-1, -1); }
.pc-l-naturale .pc-deco > i:first-child { height: calc(var(--m-b) - 2mm); ${bg('var(--art-wave-a)')} }
.pc-l-naturale .pc-deco > i:last-child { height: calc(var(--m-b) - 7mm); ${bg('var(--art-wave-b)')} }
.pc-l-naturale .d-title, .pc-l-naturale .d-studio, .pc-l-naturale .d-day-title, .pc-l-naturale .pc-cover-title { font-style: normal; font-weight: 700; text-transform: uppercase; letter-spacing: .01em; color: var(--deep); }
.pc-l-naturale .d-title { font-size: 32pt; line-height: 1; color: var(--accent); }
.pc-l-naturale .d-mast { border-bottom: .3mm solid var(--mid); }
.pc-l-naturale .d-kicker { font-family: 'Oswald', sans-serif !important; font-weight: 500; font-size: 9pt; letter-spacing: .14em; color: var(--deep); }
.pc-l-naturale .d-h { font-family: 'Oswald', sans-serif !important; font-size: 15pt; font-weight: 600; letter-spacing: .02em; color: var(--accent); border: 0; padding: 0; gap: 2.5mm; }
.pc-l-naturale .d-h::before { width: 5mm; height: 5mm; border-radius: 0; ${bg('var(--art-leaf)')} }
.pc-l-naturale .d-kpi { background: var(--soft); border: 0; border-radius: 8mm 1.5mm 8mm 1.5mm; }
.pc-l-naturale .d-kpi b { font-weight: 600; color: var(--deep); }
.pc-l-naturale .d-kpi span { color: var(--deep); }
.pc-l-naturale .d-panel { border: 0; background: var(--soft); border-radius: 4mm; }
.pc-l-naturale .d-panel-h { background: none; border-bottom: .3mm solid var(--mid); font-family: 'Oswald', sans-serif !important; font-weight: 500; font-size: 8.5pt; color: var(--deep); }
.pc-l-naturale .d-panel td { border-color: color-mix(in srgb, var(--accent) 18%, #fff); }
.pc-l-naturale .d-table th { font-family: 'Oswald', sans-serif !important; font-weight: 500; font-size: 8.5pt; color: var(--deep); border-bottom: .6mm solid var(--accent); }
.pc-l-naturale .d-chart { border: 0; background: var(--soft); border-radius: 4mm; }
.pc-l-naturale .d-day-h { border-bottom: .5mm solid var(--mid); }
.pc-l-naturale .d-day-title { font-size: 24pt; color: var(--accent); }
.pc-l-naturale .d-meal-h { background: var(--soft); border: 0; border-radius: 8mm 1.5mm 8mm 1.5mm; padding: 2mm 5mm; }
.pc-l-naturale .d-meal-h span { font-family: 'Oswald', sans-serif !important; font-weight: 600; font-size: 11pt; letter-spacing: .06em; color: var(--deep); }
.pc-l-naturale .pc-head, .pc-l-naturale .pc-foot { border-color: var(--mid); }
.pc-l-naturale .pc-head .acc { font-family: 'Oswald', sans-serif !important; font-size: 8pt; color: var(--deep); }
.pc-l-naturale .pc-cover::before { content: ''; right: -10mm; top: 116mm; width: 66mm; height: 66mm; ${bg('var(--art-sprig-mid)')} }
.pc-l-naturale .pc-cover::after { content: ''; left: -8mm; bottom: 42mm; width: 40mm; height: 40mm; transform: rotate(180deg); ${bg('var(--art-sprig-soft)')} }
.pc-l-naturale .pc-cover-title { font-size: 60pt; line-height: .95; color: var(--accent); }
.pc-l-naturale .pc-cover-kicker { font-family: 'Oswald', sans-serif !important; font-weight: 500; letter-spacing: .2em; }
.pc-l-naturale .pc-cover-rule { width: 9mm; height: 9mm; border-radius: 0; ${bg('var(--art-leaf)')} }
.pc-l-naturale .pc-cover-foot { border-top-color: var(--mid); }
`;

// ---------- Editoriale: fondo tinto, bodoni sottile e grande, minuscolo, cerchi sottili, schede bianche ----------
const editoriale = `
.pc-l-editoriale { --ink-e: color-mix(in srgb, var(--accent) 35%, #12141a); --hair: color-mix(in srgb, var(--ink-e) 22%, transparent); }
.pc-sheet.pc-l-editoriale { background: color-mix(in srgb, var(--accent) 17%, #F6F4EF); color: var(--ink-e); }
${fonts('editoriale', "'Jost', system-ui, sans-serif", "'Bodoni Moda', 'Didot', serif")}
.pc-l-editoriale .pc-flow, .pc-l-editoriale .d-doc { color: var(--ink-e); }
.pc-l-editoriale .pc-deco::before { content: ''; right: -26mm; bottom: -30mm; width: 92mm; height: 92mm; border-radius: 50%; border: .3mm solid var(--hair); }
.pc-l-editoriale .pc-deco::after { content: ''; right: -12mm; bottom: -16mm; width: 64mm; height: 64mm; border-radius: 50%; border: .3mm solid var(--hair); }
.pc-l-editoriale .pc-deco > i:first-child { display: block; left: 6mm; top: 50%; width: 6mm; height: 6mm; border-radius: 50%; border: .45mm solid var(--ink-e); border-left-color: transparent; transform: rotate(30deg); opacity: .55; }
.pc-l-editoriale .d-title, .pc-l-editoriale .d-day-title, .pc-l-editoriale .pc-cover-title { font-style: normal; font-weight: 400; text-transform: lowercase; letter-spacing: -.02em; line-height: .92; color: var(--ink-e); }
.pc-l-editoriale .d-title { font-size: 40pt; }
.pc-l-editoriale .d-studio { font-weight: 400; font-size: 19pt; color: var(--ink-e); }
.pc-l-editoriale .d-mast { border-bottom: .25mm solid var(--ink-e); }
.pc-l-editoriale .d-kicker, .pc-l-editoriale .d-role { color: var(--ink-e); font-weight: 600; letter-spacing: .34em; }
.pc-l-editoriale .d-sub, .pc-l-editoriale .d-mast-r, .pc-l-editoriale .d-kpi span, .pc-l-editoriale .d-kpi em { color: color-mix(in srgb, var(--ink-e) 70%, transparent); }
.pc-l-editoriale .d-h { font-family: 'Bodoni Moda', serif !important; font-style: italic; font-weight: 400; font-size: 17pt; text-transform: none; letter-spacing: 0; color: var(--ink-e); border: 0; gap: 4mm; }
.pc-l-editoriale .d-h::before { content: none; }
.pc-l-editoriale .d-h::after { content: ''; flex: 1; height: .25mm; background: var(--hair); }
.pc-l-editoriale .d-kpi { background: #fff; border: 0; border-radius: 3mm; }
.pc-l-editoriale .d-kpi b { font-weight: 400; font-size: 25pt; color: var(--ink-e); }
.pc-l-editoriale .d-panel, .pc-l-editoriale .d-chart { background: #fff; border: 0; border-radius: 3mm; }
.pc-l-editoriale .d-panel-h { background: none; border-bottom: .25mm solid var(--hair); letter-spacing: .26em; font-weight: 500; color: var(--ink-e); }
.pc-l-editoriale .d-table th { color: var(--ink-e); border-bottom: .25mm solid var(--ink-e); letter-spacing: .2em; font-weight: 500; }
.pc-l-editoriale .d-table td, .pc-l-editoriale .d-kv td, .pc-l-editoriale .d-kv th, .pc-l-editoriale .d-foods td, .pc-l-editoriale .d-shop > div { border-color: var(--hair) !important; color: var(--ink-e); }
.pc-l-editoriale .d-day-h { border-bottom: .25mm solid var(--ink-e); }
.pc-l-editoriale .d-day-title { font-size: 30pt; }
.pc-l-editoriale .d-meal-h { background: #fff; border: 0; border-radius: 20mm; padding: 2mm 5mm; }
.pc-l-editoriale .d-meal-h span { font-weight: 600; letter-spacing: .3em; font-size: 8pt; }
.pc-l-editoriale .d-or { color: var(--ink-e); }
.pc-l-editoriale .d-sign { border-top-color: var(--hair); }
.pc-l-editoriale .pc-head, .pc-l-editoriale .pc-foot { border-color: var(--hair); color: color-mix(in srgb, var(--ink-e) 65%, transparent); }
.pc-l-editoriale .pc-head .acc { color: var(--ink-e); letter-spacing: .32em; font-weight: 500; }
.pc-l-editoriale .pc-head b { color: var(--ink-e); }
.pc-l-editoriale .pc-foot .num { font-family: 'Bodoni Moda', serif !important; font-style: italic; font-weight: 400; font-size: 9pt; color: var(--ink-e); }
.pc-l-editoriale .pc-cover { text-align: center; }
.pc-l-editoriale .pc-cover::before { content: ''; left: 50%; top: 58mm; width: 138mm; height: 138mm; transform: translateX(-50%); border-radius: 50%; border: .3mm solid var(--hair); }
.pc-l-editoriale .pc-cover::after { content: ''; left: 50%; top: 66mm; width: 122mm; height: 122mm; transform: translateX(-50%); border-radius: 50%; background: #fff; opacity: .55; }
.pc-l-editoriale .pc-cover-mid { margin-top: 76mm; }
.pc-l-editoriale .pc-cover-title { font-size: 66pt; }
.pc-l-editoriale .pc-cover-kicker { color: var(--ink-e); letter-spacing: .4em; font-weight: 500; }
.pc-l-editoriale .pc-cover-rule { margin: 8mm auto 6mm; width: 30mm; height: .3mm; background: var(--ink-e); }
.pc-l-editoriale .pc-cover-index { text-align: left; } .pc-l-editoriale .pc-cover-index div span { color: var(--ink-e); font-family: 'Bodoni Moda', serif !important; font-style: italic; }
.pc-l-editoriale .pc-cover-foot { text-align: left; border-top-color: var(--ink-e); }
`;

// ---------- Istituzionale: fascia laterale piena, testata a blocco, quadrati, tabelle a fondo pieno ----------
const istituzionale = `
.pc-l-istituzionale { --tint: color-mix(in srgb, var(--accent) 8%, #fff); }
${fonts('istituzionale', "'IBM Plex Sans', system-ui, sans-serif", "'IBM Plex Sans', system-ui, sans-serif")}
.pc-l-istituzionale .pc-deco::before { content: ''; left: 0; top: 0; bottom: 0; width: 10mm; background: var(--accent); }
.pc-l-istituzionale .pc-deco::after { content: ''; left: 10mm; top: 0; width: 2.2mm; bottom: 0; background: color-mix(in srgb, var(--accent) 35%, #fff); }
.pc-l-istituzionale .pc-deco > i:first-child { display: block; right: 0; top: 0; width: 42mm; height: 3mm; background: var(--accent); }
.pc-l-istituzionale .d-title, .pc-l-istituzionale .d-day-title, .pc-l-istituzionale .pc-cover-title, .pc-l-istituzionale .d-studio { font-style: normal; font-weight: 700; letter-spacing: -.01em; }
.pc-l-istituzionale .d-title { font-size: 25pt; color: var(--accent); }
.pc-l-istituzionale .d-mast { background: var(--accent); color: #fff; padding: 6mm 6mm 5mm; border: 0; margin-bottom: 7mm; }
.pc-l-istituzionale .d-mast .d-role, .pc-l-istituzionale .d-mast-r { color: rgba(255,255,255,.85); }
.pc-l-istituzionale .d-titlebar { border-left: 1.6mm solid var(--accent); padding-left: 4mm; }
.pc-l-istituzionale .d-kicker { color: #4b4b52; }
.pc-l-istituzionale .d-h { color: var(--accent); border-bottom: .35mm solid var(--accent); font-size: 9pt; letter-spacing: .12em; }
.pc-l-istituzionale .d-h::before { border-radius: 0; width: 3mm; height: 3mm; }
.pc-l-istituzionale .d-kpi { border: 0; border-top: 1.6mm solid var(--accent); border-radius: 0; background: var(--tint); }
.pc-l-istituzionale .d-kpi b { color: #1b1b1f; font-weight: 700; }
.pc-l-istituzionale .d-panel { border-radius: 0; border-color: color-mix(in srgb, var(--accent) 30%, #fff); }
.pc-l-istituzionale .d-panel-h { background: var(--accent); color: #fff; border: 0; }
.pc-l-istituzionale .d-table th { background: var(--accent); color: #fff; border: 0; }
.pc-l-istituzionale .d-table tbody tr:nth-child(even) td { background: var(--tint); }
.pc-l-istituzionale .d-chart { border-radius: 0; border-color: color-mix(in srgb, var(--accent) 30%, #fff); }
.pc-l-istituzionale .d-day-h { border-bottom: 1.2mm solid var(--accent); }
.pc-l-istituzionale .d-day-title { font-size: 20pt; color: var(--accent); }
.pc-l-istituzionale .d-meal-h { background: var(--accent); border: 0; border-radius: 0; }
.pc-l-istituzionale .d-meal-h span, .pc-l-istituzionale .d-meal-h em { color: #fff; }
.pc-l-istituzionale .d-sign { border-top: .5mm solid #1b1b1f; }
.pc-l-istituzionale .pc-head { border-bottom: .35mm solid var(--accent); }
.pc-l-istituzionale .pc-foot { border-top: .5mm solid #1b1b1f; color: #55555c; }
.pc-l-istituzionale .pc-cover::before { content: ''; left: 0; right: 0; top: 0; height: 168mm; background: var(--accent); }
.pc-l-istituzionale .pc-cover { padding-left: 26mm; }
.pc-l-istituzionale .pc-cover-top, .pc-l-istituzionale .pc-cover-kicker, .pc-l-istituzionale .pc-cover-title, .pc-l-istituzionale .pc-cover-name, .pc-l-istituzionale .pc-cover-date { color: #fff; }
.pc-l-istituzionale .pc-cover-title { font-size: 44pt; }
.pc-l-istituzionale .pc-cover-rule { background: #fff; border-radius: 0; width: 100%; height: .4mm; }
.pc-l-istituzionale .pc-cover-index div span { color: var(--accent); }
`;

// ---------- Pastello: tinte tenue a rotazione, disegni a tratto negli angoli, evidenziatore ----------
const pastello = `
.pc-l-pastello { --p1: #FFE6A6; --p2: #C4E8CE; --p3: #FAC9C3; --p4: #CADFF7; --p5: color-mix(in srgb, var(--accent) 28%, #fff); --ink-p: #2b2838; }
${fonts('pastello', "'Quicksand', system-ui, sans-serif", "'Quicksand', system-ui, sans-serif")}
.pc-l-pastello .pc-flow, .pc-l-pastello .pc-flow b { font-weight: 600; }
.pc-l-pastello .pc-deco::before { content: ''; right: 0; top: 0; width: 70mm; height: calc(var(--m-t) - 1.5mm); ${bg('var(--art-pastello-doodles)', '24mm 24mm', 'repeat')} }
.pc-l-pastello .pc-deco::after { content: ''; left: 0; bottom: 0; width: 70mm; height: calc(var(--m-b) - 1.5mm); ${bg('var(--art-pastello-doodles)', '24mm 24mm', 'repeat')} }
.pc-l-pastello .pc-deco > i:first-child { display: block; left: -14mm; top: -14mm; width: 30mm; height: 30mm; border-radius: 50%; background: var(--p1); }
.pc-l-pastello .pc-deco > i:last-child { display: block; right: -9mm; bottom: -9mm; width: 24mm; height: 24mm; border-radius: 5mm; background: var(--p3); transform: rotate(18deg); }
.pc-l-pastello .d-title, .pc-l-pastello .d-day-title, .pc-l-pastello .pc-cover-title, .pc-l-pastello .d-studio { font-style: normal; font-weight: 700; letter-spacing: -.01em; color: var(--ink-p); }
.pc-l-pastello .d-title { display: inline; font-size: 30pt; line-height: 1.15; ${bg(highlight('#FAC9C3', 58, 92))} -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.pc-l-pastello .d-mast { border-bottom: .5mm solid var(--ink-p); }
.pc-l-pastello .d-kicker { color: var(--accent); font-weight: 700; }
.pc-l-pastello .d-kpi { border: 0; border-radius: 5mm; background: var(--p1); }
.pc-l-pastello .d-kpi:nth-child(5n+2) { background: var(--p2); } .pc-l-pastello .d-kpi:nth-child(5n+3) { background: var(--p3); } .pc-l-pastello .d-kpi:nth-child(5n+4) { background: var(--p4); } .pc-l-pastello .d-kpi:nth-child(5n) { background: var(--p5); }
.pc-l-pastello .d-kpi b { color: var(--ink-p); font-weight: 700; } .pc-l-pastello .d-kpi span, .pc-l-pastello .d-kpi em { color: #4d4a5c; }
.pc-l-pastello .d-h { width: fit-content; border: 0; border-radius: 3mm; padding: 1.5mm 4.5mm; background: var(--p4); color: var(--ink-p); text-transform: none; letter-spacing: 0; font-size: 12.5pt; }
.pc-l-pastello .d-h:nth-of-type(4n+2) { background: var(--p2); } .pc-l-pastello .d-h:nth-of-type(4n+3) { background: var(--p1); } .pc-l-pastello .d-h:nth-of-type(4n) { background: var(--p3); }
.pc-l-pastello .d-h::before { background: var(--accent); }
.pc-l-pastello .d-panel { border: .4mm solid var(--ink-p); border-radius: 4mm; }
.pc-l-pastello .d-panel-h { background: var(--p2); border-bottom: .4mm solid var(--ink-p); color: var(--ink-p); }
.pc-l-pastello .d-panel:nth-child(4n+2) .d-panel-h { background: var(--p3); } .pc-l-pastello .d-panel:nth-child(4n+3) .d-panel-h { background: var(--p4); } .pc-l-pastello .d-panel:nth-child(4n) .d-panel-h { background: var(--p1); }
.pc-l-pastello .d-table th { color: var(--ink-p); border-bottom: .5mm solid var(--ink-p); }
.pc-l-pastello .d-table td { border-bottom: 0; }
.pc-l-pastello .d-table tbody tr:nth-child(4n+1) td { background: color-mix(in srgb, var(--p1) 55%, #fff); } .pc-l-pastello .d-table tbody tr:nth-child(4n+2) td { background: color-mix(in srgb, var(--p2) 55%, #fff); }
.pc-l-pastello .d-table tbody tr:nth-child(4n+3) td { background: color-mix(in srgb, var(--p3) 55%, #fff); } .pc-l-pastello .d-table tbody tr:nth-child(4n) td { background: color-mix(in srgb, var(--p4) 55%, #fff); }
.pc-l-pastello .d-chart { border: .4mm solid var(--ink-p); border-radius: 4mm; }
.pc-l-pastello .d-day-h { border-bottom: .5mm solid var(--ink-p); }
.pc-l-pastello .d-day-title { font-size: 24pt; ${bg(highlight('#FFE6A6', 55, 92))} }
.pc-l-pastello .d-meal-h { background: var(--p2); border: 0; border-radius: 4mm; }
.pc-l-pastello .d-meal:nth-child(4n+3) .d-meal-h { background: var(--p3); } .pc-l-pastello .d-meal:nth-child(4n) .d-meal-h { background: var(--p4); } .pc-l-pastello .d-meal:nth-child(4n+1) .d-meal-h { background: var(--p1); }
.pc-l-pastello .d-meal-h span { text-transform: none; letter-spacing: 0; font-size: 11pt; color: var(--ink-p); }
.pc-l-pastello .d-box { border-radius: 50%; border-color: var(--ink-p); }
.pc-l-pastello .pc-head, .pc-l-pastello .pc-foot { border-color: transparent; }
.pc-l-pastello .pc-head .acc { color: var(--ink-p); background: var(--p1); padding: .6mm 2mm; border-radius: 2mm; }
.pc-l-pastello .pc-cover::before { content: ''; inset: 0; ${bg(PASTELLO_CIRCLES)} }
.pc-l-pastello .pc-cover::after { content: ''; left: 0; right: 0; bottom: 0; height: 30mm; ${bg('var(--art-pastello-doodles-cover)', '26mm 26mm', 'repeat')} }
.pc-l-pastello .pc-cover-title { font-size: 50pt; }
.pc-l-pastello .pc-cover-rule { background: var(--accent); height: 2mm; }
.pc-l-pastello .pc-cover-index { background: rgba(255,255,255,.85); border-radius: 4mm; padding: 4mm 5mm; }
.pc-l-pastello .pc-cover-foot { margin-bottom: 14mm; background: #fff; border: .4mm solid var(--ink-p); border-radius: 4mm; padding: 4mm 5mm; }
`;

// ---------- Fresco: aloni di luce sfocati, nero sottile, timbro tondo, tracciato del battito ----------
const fresco = `
.pc-l-fresco { --glow: color-mix(in srgb, var(--accent) 60%, transparent); --glow2: color-mix(in srgb, var(--accent) 35%, transparent); }
${fonts('fresco', "'Manrope', system-ui, sans-serif", "'Manrope', system-ui, sans-serif")}
.pc-l-fresco .pc-deco::before { content: ''; inset: -10mm; filter: blur(7mm); background:
    radial-gradient(ellipse 34mm 26mm at 66% 7%, var(--glow), transparent),
    radial-gradient(ellipse 46mm 30mm at 14% 97%, var(--glow2), transparent),
    radial-gradient(ellipse 22mm 40mm at 104% 64%, var(--glow2), transparent); }
.pc-l-fresco .pc-deco::after { content: ''; right: 0; top: calc(var(--m-t) - 10mm); width: 62mm; height: 9mm; ${bg(ECG)} }
.pc-l-fresco .d-title, .pc-l-fresco .d-day-title, .pc-l-fresco .pc-cover-title, .pc-l-fresco .d-studio, .pc-l-fresco .d-kpi b { font-style: normal; font-weight: 800; letter-spacing: -.03em; }
.pc-l-fresco .d-title { font-size: 30pt; }
.pc-l-fresco .d-mast { border-bottom: 0; }
.pc-l-fresco .d-kicker { color: color-mix(in srgb, var(--accent) 70%, #000); letter-spacing: .1em; }
.pc-l-fresco .d-date { width: 28mm; height: 28mm; padding: 3mm; border: .3mm solid #1b1b1f; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; }
.pc-l-fresco .d-date span { letter-spacing: .06em; font-size: 5.8pt; line-height: 1.25; margin-bottom: .6mm; }
.pc-l-fresco .d-date::after { content: ''; position: absolute; inset: -1.2mm .4mm -.4mm -1.2mm; border: .3mm solid #1b1b1f; border-radius: 50%; transform: rotate(-8deg); }
.pc-l-fresco .d-h { text-transform: none; letter-spacing: -.01em; font-size: 11.5pt; font-weight: 800; border-bottom: .35mm solid #1b1b1f; }
.pc-l-fresco .d-h::before { content: '+'; width: auto; height: auto; background: none; border-radius: 0; color: var(--accent); font-size: 15pt; font-weight: 400; line-height: .8; }
.pc-l-fresco .d-kpi { background: rgba(255,255,255,.75); border: .3mm solid #1b1b1f; border-radius: 4mm; }
.pc-l-fresco .d-kpi b { color: #1b1b1f; } .pc-l-fresco .d-kpi b small { color: var(--accent); font-weight: 700; }
.pc-l-fresco .d-panel { border-color: #d8d8dc; border-radius: 3mm; background: rgba(255,255,255,.8); }
.pc-l-fresco .d-panel-h { background: none; border-bottom: .3mm solid #1b1b1f; text-transform: none; letter-spacing: 0; font-size: 8pt; font-weight: 800; color: #1b1b1f; }
.pc-l-fresco .d-table th { text-transform: none; letter-spacing: 0; font-size: 8.5pt; font-weight: 800; color: #1b1b1f; border-bottom: .35mm solid #1b1b1f; }
.pc-l-fresco .d-chart { border-color: #d8d8dc; border-radius: 4mm; background: rgba(255,255,255,.8); }
.pc-l-fresco .d-day-h { border-bottom: .35mm solid #1b1b1f; }
.pc-l-fresco .d-day-title { font-size: 24pt; }
.pc-l-fresco .d-meal-h { background: none; border: 0; border-bottom: .35mm solid #1b1b1f; border-radius: 0; padding-left: 0; }
.pc-l-fresco .d-meal-h span { text-transform: none; letter-spacing: -.01em; font-size: 10.5pt; font-weight: 800; }
.pc-l-fresco .d-meal-h span::before { content: '+ '; color: var(--accent); }
.pc-l-fresco .d-or { color: color-mix(in srgb, var(--accent) 75%, #000); }
.pc-l-fresco .pc-head { border-bottom: 0; } .pc-l-fresco .pc-head .acc { color: #1b1b1f; font-weight: 800; letter-spacing: .04em; text-transform: none; font-size: 8pt; }
.pc-l-fresco .pc-foot { border-top: 0; }
.pc-l-fresco .pc-cover::after { content: ''; left: 0; right: 0; top: 150mm; height: 26mm; ${bg(ECG)} }
.pc-l-fresco .pc-cover-title { font-size: 56pt; line-height: .95; }
.pc-l-fresco .pc-cover-rule { background: #1b1b1f; height: .35mm; width: 60mm; }
.pc-l-fresco .pc-cover-foot { border-top: 0; }
`;

// anteprime nel pannello Stile (foglio di 40x57px)
const previews = `
.pc-lay-prev .pg > i { position: absolute; display: block; }
.pv-elegante .t { border-radius: 0; height: 3px; } .pv-elegante .pg { box-shadow: 0 2px 6px rgba(0,0,0,.1), inset 0 0 0 2px #fff, inset 0 0 0 3px color-mix(in srgb, var(--c) 40%, #fff); }
.pv-giocoso .pg { background: #FFFCF6; } .pv-giocoso .t { height: 9px; width: 30px; border-radius: 4px 2px 5px 2px; } .pv-giocoso .d1 { left: -6px; top: 26px; width: 13px; height: 13px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 1px #d9e3ee; } .pv-giocoso .d2 { left: 5px; top: 22px; width: 18px; height: 5px; border-radius: 3px; background: #6E9A2C; }
.pv-planner .pg { background: color-mix(in srgb, var(--c) 30%, #F2F5F0); } .pv-planner .d1 { inset: 4px; background: #fff; border-radius: 3px; } .pv-planner .t { background: none; height: 6px; border-bottom: 1px dotted var(--c); border-radius: 0; z-index: 1; left: 8px; } .pv-planner .l { z-index: 1; left: 8px; right: 8px !important; background: color-mix(in srgb, var(--c) 30%, #fff); }
.pv-energia .d1 { left: -10px; right: -10px; top: -4px; height: 10px; border-radius: 0 0 50% 50%; background: linear-gradient(115deg, var(--c), #FFB23E); } .pv-energia .t { top: 12px; background: linear-gradient(115deg, var(--c), #FFB23E); height: 5px; border-radius: 3px; } .pv-energia .d2 { right: -8px; bottom: -8px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #FFD596; }
.pv-geometrico .pg { background: #FBF7F0; } .pv-geometrico .d1 { right: 0; top: 0; width: 18px; height: 12px; background: linear-gradient(to bottom left, #F2B632 50%, transparent 51%); } .pv-geometrico .d2 { left: 0; bottom: 0; width: 22px; height: 9px; background: linear-gradient(to top right, var(--c) 50%, transparent 51%); } .pv-geometrico .t { background: #E5407A; border-radius: 0; transform: skewX(-12deg); }
.pv-naturale .d1 { left: 0; right: 0; top: 0; height: 7px; background: var(--c); border-radius: 0 0 60% 40% / 0 0 100% 70%; } .pv-naturale .d2 { left: 0; right: 0; bottom: 0; height: 6px; background: color-mix(in srgb, var(--c) 45%, #fff); border-radius: 50% 60% 0 0 / 100% 80% 0 0; } .pv-naturale .t { top: 11px; width: 16px; }
.pv-editoriale .pg { background: color-mix(in srgb, var(--c) 20%, #F6F4EF); } .pv-editoriale .t { background: none; height: 9px; width: 28px; border-radius: 0; border-bottom: 1px solid color-mix(in srgb, var(--c) 40%, #12141a); } .pv-editoriale .d1 { right: -12px; bottom: -12px; width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(0,0,0,.18); }
.pv-istituzionale .d1 { left: 0; top: 0; bottom: 0; width: 4px; background: var(--c); } .pv-istituzionale .d2 { left: 7px; right: 4px; top: 5px; height: 9px; background: var(--c); } .pv-istituzionale .t { opacity: 0; } .pv-istituzionale .l { left: 8px; }
.pv-pastello .d1 { left: -7px; top: -7px; width: 16px; height: 16px; border-radius: 50%; background: #FFE6A6; } .pv-pastello .d2 { right: -4px; bottom: -4px; width: 11px; height: 11px; border-radius: 3px; background: #FAC9C3; transform: rotate(18deg); } .pv-pastello .t { background: #C4E8CE; height: 6px; } .pv-pastello .l:nth-of-type(odd) { background: #CADFF7; }
.pv-fresco .d1 { left: 14px; top: -6px; width: 22px; height: 16px; border-radius: 50%; background: var(--c); filter: blur(4px); opacity: .6; } .pv-fresco .d2 { left: -6px; bottom: -4px; width: 22px; height: 14px; border-radius: 50%; background: var(--c); filter: blur(4px); opacity: .45; } .pv-fresco .t { background: #1b1b1f; }
`;

// ---------- Rigore: quaderno di laboratorio incorporato (solo Laboratorio). Bianco e nero, un solo carattere, nessuna decorazione ----------
const rigore = `
.pc-l-rigore.pc-l-rigore, .pc-l-rigore.pc-l-rigore *:not(i) { font-family: var(--pc-font, 'Inter', system-ui, sans-serif) !important; font-style: normal !important; }
.pc-sheet.pc-l-rigore { background: #fff; color: #000; }
.pc-l-rigore .pc-flow { font-size: 10.5pt; line-height: 1.5; color: #000; }
.pc-l-rigore .d-rb-recipe { margin: 0 0 7mm; }
.pc-l-rigore .d-rb-head { display: block; padding: 0 0 2.5mm; margin-bottom: 4mm; border-radius: 0; background: none; border-bottom: .45mm solid #000; }
.pc-l-rigore .d-kicker { color: #000; font-size: 8pt; font-weight: 700; letter-spacing: .12em; margin-bottom: 1.5mm; }
.pc-theme.pc-l-rigore .d-rb .d-rb-title, .pc-l-rigore .d-rb-title { font-size: 18pt; font-weight: 700; letter-spacing: -.005em; line-height: 1.2; }
.pc-l-rigore .d-rb-meta { border-top: .25mm solid #000; border-bottom: .25mm solid #000; margin-bottom: 4mm; }
.pc-l-rigore .d-rb-meta > div + div { border-left: .2mm solid #000; }
.pc-l-rigore .d-rb-meta span { color: #000; font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; }
.pc-l-rigore .d-rb-meta b { font-size: 10.5pt; font-weight: 600; }
.pc-l-rigore .d-rb-h { color: #000; font-size: 9pt; font-weight: 700; letter-spacing: .1em; margin: 5mm 0 2mm; padding-bottom: 1mm; border-bottom: .2mm solid #000; }
.pc-l-rigore .d-prose p { text-align: justify; hyphens: auto; margin: 0 0 2mm; }
.pc-l-rigore .d-table { font-size: 9.5pt; border-top: .35mm solid #000; border-bottom: .35mm solid #000; }
.pc-l-rigore .d-table th { color: #000; font-size: 8pt; font-weight: 700; letter-spacing: .06em; border-bottom: .25mm solid #000; background: none; }
.pc-l-rigore .d-table td { border-bottom: .15mm solid #9a9a9a; }
.pc-l-rigore .d-table small, .pc-l-rigore small { color: #444; }
.pc-l-rigore .d-rb-steps li::marker { color: #000; font-weight: 700; font-size: 9pt; }
.pc-l-rigore .d-placeholder { color: #333; font-size: 9.5pt; }
.pc-l-rigore .nb-cover { padding-top: 62mm; }
.pc-l-rigore .nb-cover .d-rb-head { border-bottom: .8mm solid #000; padding-bottom: 5mm; margin-bottom: 8mm; }
.pc-l-rigore .nb-cover .d-rb-title { font-size: 30pt; font-weight: 700; }
.pc-l-rigore .nb-cover .d-rb-meta { border-top: 0; }
.pc-l-rigore .pc-foot, .pc-l-rigore .pc-foot * , .pc-l-rigore .pc-bm, .pc-l-rigore .pc-bm * { color: #000 !important; }
`;

export const layoutCss = base + elegante + giocoso + planner + energia + geometrico + naturale + editoriale + istituzionale + pastello + fresco + rigore + previews;
