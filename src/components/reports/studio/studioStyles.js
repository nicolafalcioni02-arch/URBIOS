import { trainingDocCss } from '../../patient/training/print/printStyles';

// CSS di Report Studio: finestra, foglio A4, layout e stampa
export const studioCss = `
.rs-overlay { position: fixed; inset: 0; z-index: 99999; background: #2b2d31; display: flex; flex-direction: column; color: #f2f2f3;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.rs-overlay button { font-family: inherit; }
.rs-top { background: #1D1D1F; padding: 8px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; border-bottom: 1px solid #000; }
.rs-title { font-weight: 700; font-size: 14px; margin-right: 10px; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.rs-grp { display: inline-flex; align-items: center; gap: 2px; padding-right: 8px; margin-right: 4px; border-right: 1px solid #3a3a3d; }
.rs-tb { background: transparent; border: 1px solid transparent; color: #e5e5e7; height: 32px; min-width: 32px; padding: 0 8px; border-radius: 8px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; }
.rs-tb i { font-size: 17px; }
.rs-tb:hover { background: #3a3a3d; }
.rs-tb.on { background: #0A84FF; color: #fff; }
.rs-select, .rs-top input[type=color] { background: #2c2c2e; color: #fff; border: 1px solid #4a4a4d; border-radius: 8px; height: 32px; padding: 0 8px; font-size: 13px; }
.rs-top input[type=color] { width: 34px; padding: 2px; cursor: pointer; }
.rs-spacer { flex: 1; }
.rs-main-btn { background: #0A84FF; color: #fff; border: none; border-radius: 10px; height: 34px; padding: 0 16px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.rs-alt-btn { background: #fff; color: #111; border: none; border-radius: 10px; height: 34px; padding: 0 14px; font-weight: 700; font-size: 13px; cursor: pointer; }
.rs-body-row { flex: 1; display: flex; min-height: 0; }
.rs-side { width: 300px; flex-shrink: 0; background: #232326; border-right: 1px solid #000; overflow-y: auto; padding: 14px; }
.rs-side h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #9a9a9f; margin: 4px 0 8px; font-weight: 700; }
.rs-layouts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.rs-lay { background: #2c2c2e; border: 2px solid transparent; border-radius: 10px; padding: 8px; text-align: left; cursor: pointer; color: #eee; }
.rs-lay.on { border-color: #0A84FF; }
.rs-lay .sw { height: 34px; border-radius: 5px; background: #fff; margin-bottom: 6px; position: relative; overflow: hidden; }
.rs-lay .sw::before { content: ''; position: absolute; left: 6px; right: 6px; top: 7px; height: 4px; border-radius: 2px; background: var(--c); }
.rs-lay .sw::after { content: ''; position: absolute; left: 6px; right: 18px; top: 16px; height: 10px; background: repeating-linear-gradient(#cfcfd4 0 2px, transparent 2px 5px); }
.rs-lay b { display: block; font-size: 12.5px; } .rs-lay span { font-size: 10.5px; color: #9a9a9f; }
.rs-accents { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; margin-bottom: 16px; }
.rs-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #2b2d31; box-shadow: 0 0 0 1px #5a5a5e; cursor: pointer; padding: 0; }
.rs-dot.on { box-shadow: 0 0 0 2px #fff; }
.rs-sec { background: #2c2c2e; border-radius: 10px; padding: 9px 10px; margin-bottom: 8px; }
.rs-sec-head { display: flex; align-items: center; gap: 4px; }
.rs-sec-head .name { flex: 1; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 7px; min-width: 0; }
.rs-sec-head .name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rs-mini { background: transparent; border: none; color: #c9c9cd; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.rs-mini:hover { background: #3f3f43; } .rs-mini:disabled { opacity: .3; cursor: default; } .rs-mini i { font-size: 15px; }
.rs-opts { margin-top: 8px; padding-top: 8px; border-top: 1px solid #3a3a3d; font-size: 12px; display: grid; gap: 6px; }
.rs-opts label { display: flex; align-items: center; gap: 7px; cursor: pointer; }
.rs-opts .rs-select { width: 100%; height: 30px; font-size: 12px; }
.rs-opts .rs-apply { background: #0A84FF; color: #fff; border: none; border-radius: 8px; padding: 7px; font-weight: 700; font-size: 12px; cursor: pointer; }
.rs-add { display: flex; width: 100%; align-items: center; gap: 8px; background: transparent; border: 1px dashed #5a5a5e; color: #e5e5e7; border-radius: 10px; padding: 8px 10px; font-size: 12.5px; cursor: pointer; margin-bottom: 6px; text-align: left; }
.rs-add:hover:not(:disabled) { border-color: #0A84FF; color: #fff; } .rs-add:disabled { opacity: .45; cursor: default; }
.rs-add small { display: block; font-size: 10.5px; color: #9a9a9f; }
.rs-hint { font-size: 11.5px; color: #9a9a9f; line-height: 1.45; margin-top: 12px; }
.rs-scroll { flex: 1; overflow: auto; padding: 28px 16px 80px; }
.rs-side-toggle { display: none; }

/* il foglio */
.rs-page { --accent: #111; --rs-size: 10.5pt; width: 210mm; max-width: 100%; margin: 0 auto; background: #fff; color: #1a1a1a; padding: 16mm 16mm 18mm; box-sizing: border-box;
  box-shadow: 0 14px 44px rgba(0,0,0,.5); min-height: 297mm; position: relative; line-height: 1.5; overflow-wrap: break-word; }
.rs-page * { box-sizing: border-box; }
.rs-body { outline: none; }
.rs-body + .rs-body, .rs-sep { }
.rs-sep { border-top: 2px dashed #c8c8cc; margin: 12mm 0 8mm; position: relative; height: 0; }
.rs-sep span { position: absolute; right: 0; top: -9px; background: #fff; padding-left: 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 1.4px; color: #a0a0a6; font-family: system-ui, sans-serif; }
.rs-body table { border-collapse: collapse; } .rs-body img { max-width: 100%; }
.rs-body td, .rs-body th { vertical-align: top; }
.rs-pb { height: 0; border-top: 2px dashed #b9b9bf; margin: 8mm 0; position: relative; break-after: page; page-break-after: always; }
.rs-pb::after { content: 'nuova pagina'; position: absolute; right: 0; top: -9px; background: #fff; padding-left: 8px; font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; color: #a0a0a6; font-family: system-ui, sans-serif; }
.rs-userblock table.rs-t { width: 100%; margin: 8px 0; } .rs-t td, .rs-t th { border: 1px solid #cfcfd4; padding: 6px 8px; min-width: 40px; }
.rs-page .tp-table { table-layout: auto !important; width: 100% !important; }
.tp-embed { font-size: 10pt; line-height: 1.35; color: #111; } .tp-embed * { box-sizing: border-box; }

/* layout: il colore guida sostituisce il nero dei bordi e delle intestazioni */
.rs-page [style*="solid #000"], .rs-page [style*="solid #111"] { border-color: var(--accent) !important; }
.rs-page .tp-table th, .rs-page .tp-ss, .rs-page .tp-daynote { background-color: var(--accent); }
.rs-page .tp-daynote { background-color: #f4f4f6; border-left-color: var(--accent); }
.rs-page .tp-head, .rs-page .tp-week-title { border-color: var(--accent); }
.rs-page .tp-deload { background: #FF9F0A; }
.rs-page h1[style], .rs-page h2[style] { }

.rs-layout-moderno .rs-body *, .rs-layout-clinico .rs-body *, .rs-layout-minimale .rs-body * { font-family: 'Inter', system-ui, sans-serif !important; }
.rs-layout-elegante .rs-body * { font-family: Georgia, 'Times New Roman', serif !important; }
.rs-layout-elegante .rs-body h1, .rs-layout-elegante .rs-body h2, .rs-layout-elegante .rs-body [style*="Playfair"], .rs-layout-elegante .rs-body .tp-doc-title, .rs-layout-elegante .rs-body .tp-week-title, .rs-layout-elegante .rs-body .tp-studio-name { font-family: 'Playfair Display', Georgia, serif !important; }
.rs-layout-moderno .rs-body [style*="Playfair"], .rs-layout-clinico .rs-body [style*="Playfair"], .rs-layout-minimale .rs-body [style*="Playfair"] { font-style: normal !important; font-weight: 800 !important; letter-spacing: -.02em !important; }
.rs-layout-moderno .rs-body [style*="Playfair"], .rs-layout-moderno .rs-body h1, .rs-layout-moderno .rs-body h2 { color: var(--accent); }
.rs-layout-moderno .rs-body [style*="font-size: 32pt"], .rs-layout-clinico .rs-body [style*="font-size: 32pt"], .rs-layout-elegante .rs-body [style*="font-size: 32pt"] { color: var(--accent) !important; }
.rs-layout-moderno::before, .rs-layout-clinico::before { content: ''; display: block; height: 7px; background: var(--accent); margin: -16mm -16mm 12mm; }
.rs-layout-clinico .rs-body [style*="background: #f4f4f4"], .rs-layout-clinico .rs-body [style*="background:#f4f4f5"], .rs-layout-clinico .rs-body [style*="background: #fafafa"], .rs-layout-clinico .rs-body [style*="background:#fafafa"] { background: color-mix(in srgb, var(--accent) 9%, #fff) !important; }
.rs-layout-minimale .rs-body [style*="solid #000"], .rs-layout-minimale .rs-body [style*="solid #111"] { border-color: #bdbdc2 !important; }
.rs-layout-minimale .rs-body [style*="border-bottom: 2px"], .rs-layout-minimale .rs-body [style*="border-bottom:2px"] { border-bottom-width: 1px !important; }
.rs-layout-minimale .tp-table th { background: #eee !important; color: #333 !important; }
.rs-layout-elegante .rs-body [style*="solid #000"], .rs-layout-elegante .rs-body [style*="solid #111"] { border-color: var(--accent) !important; }
.rs-layout-elegante::before { content: ''; display: block; height: 0; border-top: 3px double var(--accent); margin: 0 0 10mm; }

/* Compatto: caratteri e spazi ridotti, nessuna pagina nuova forzata, per usare meno fogli possibile */
.rs-layout-compatto .rs-body * { font-family: 'Inter', system-ui, sans-serif !important; line-height: 1.25 !important; }
.rs-layout-compatto .rs-body { zoom: .78; }
.rs-layout-compatto .rs-body [style*="break-before"], .rs-layout-compatto .rs-body [style*="page-break-before"] { break-before: auto !important; page-break-before: auto !important; }
.rs-layout-compatto .rs-body [style*="margin-bottom"] { margin-bottom: 8px !important; }
.rs-layout-compatto .rs-body [style*="margin-top"] { margin-top: 8px !important; }
.rs-layout-compatto .rs-body [style*="padding"] { padding-top: 3px !important; padding-bottom: 3px !important; }
.rs-layout-compatto .rs-body [style*="min-height"] { min-height: 0 !important; height: auto !important; }
.rs-layout-compatto .rs-body h1, .rs-layout-compatto .rs-body h2, .rs-layout-compatto .rs-body [style*="Playfair"] { font-size: 15pt !important; margin: 0 0 6px !important; font-style: normal !important; }
.rs-layout-compatto .rs-body [style*="font-size: 32pt"], .rs-layout-compatto .rs-body [style*="font-size:46pt"], .rs-layout-compatto .rs-body [style*="font-size:26pt"] { font-size: 16pt !important; }
.rs-layout-compatto .tp-img img { width: 11mm !important; margin: 0 .5mm 0 0 !important; }
.rs-layout-compatto .tp-day, .rs-layout-compatto .tp-newpage { margin-top: 3mm; padding-top: 0; }
.rs-layout-compatto .rs-newpage, .rs-layout-compatto .tp-newpage { break-before: auto !important; page-break-before: auto !important; }
.rs-layout-compatto .rs-sep { margin: 4mm 0; }
.rs-layout-compatto { padding: 10mm 10mm 12mm; }

/* Decorato: cornice doppia, angoli e ornamenti colorati */
.rs-layout-decorato { padding: 12mm; }
.rs-layout-decorato .rs-body { border: 3px double var(--accent); border-radius: 14px; padding: 9mm 9mm 10mm; position: relative; margin-bottom: 4mm;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  background: radial-gradient(circle at 0 0, color-mix(in srgb, var(--accent) 16%, #fff) 0 14mm, transparent 14.5mm), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--accent) 16%, #fff) 0 14mm, transparent 14.5mm), #fff; }
.rs-layout-decorato .rs-body::before { content: ''; display: block; height: 22px; margin: -3mm 0 5mm;
  background: var(--accent); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 22'><g fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'><path d='M10 11h82M148 11h82'/><path d='M92 11c8-9 16-9 20 0 4-9 12-9 20 0-8 9-16 9-20 0-4 9-12 9-20 0z'/></g><circle cx='120' cy='11' r='3' fill='%23000'/></svg>") center / 220px 22px no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 22'><g fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round'><path d='M10 11h82M148 11h82'/><path d='M92 11c8-9 16-9 20 0 4-9 12-9 20 0-8 9-16 9-20 0-4 9-12 9-20 0z'/></g><circle cx='120' cy='11' r='3' fill='%23000'/></svg>") center / 220px 22px no-repeat; }
.rs-layout-decorato .rs-body * { font-family: Georgia, 'Times New Roman', serif !important; }
.rs-layout-decorato .rs-body h1, .rs-layout-decorato .rs-body h2, .rs-layout-decorato .rs-body [style*="Playfair"], .rs-layout-decorato .rs-body .tp-doc-title, .rs-layout-decorato .rs-body .tp-week-title, .rs-layout-decorato .rs-body .tp-studio-name { font-family: 'Playfair Display', Georgia, serif !important; color: var(--accent); }
.rs-layout-decorato .rs-body [style*="border-bottom: 2px"], .rs-layout-decorato .rs-body [style*="border-bottom:2px"] { border-bottom-style: double !important; border-bottom-width: 4px !important; }
.rs-layout-decorato .rs-body [style*="border-radius"], .rs-layout-decorato .tp-client { border-radius: 14px !important; border-color: var(--accent) !important; }
.rs-layout-decorato .tp-table th { background: var(--accent) !important; }
.rs-layout-decorato .tp-week-title::after, .rs-layout-decorato .tp-day-title::after { content: '❦'; color: var(--accent); margin-left: 8px; font-weight: 400; }
.rs-layout-decorato .rs-sep { display: none; }
.rs-layout-decorato .rs-newpage { margin-top: 0; }

${trainingDocCss}

@media screen and (max-width: 1000px) {
  .rs-side { position: absolute; z-index: 5; top: 0; bottom: 0; left: 0; transform: translateX(-102%); transition: transform .25s; width: min(300px, 86vw); box-shadow: 8px 0 30px rgba(0,0,0,.5); }
  .rs-body-row { position: relative; }
  .rs-side.open { transform: none; }
  .rs-side-toggle { display: inline-flex; }
  .rs-scroll { padding: 16px 0 70px; }
}
@media screen and (max-width: 900px) { .rs-page { zoom: .92; } }
@media screen and (max-width: 800px) { .rs-page { zoom: .8; } }
@media screen and (max-width: 700px) { .rs-page { zoom: .7; } }
@media screen and (max-width: 600px) { .rs-page { zoom: .6; } }
@media screen and (max-width: 500px) { .rs-page { zoom: .5; } }
@media screen and (max-width: 420px) { .rs-page { zoom: .44; } }
@media screen and (max-width: 370px) { .rs-page { zoom: .38; } }

@media print {
  @page { size: A4 portrait; margin: 14mm 14mm 16mm; }
  html, body { background: #fff !important; overflow: visible !important; height: auto !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(.rs-overlay), body > #root { display: none !important; height: 0 !important; overflow: hidden !important; }
  .rs-overlay, .rs-overlay * { visibility: visible !important; }
  .rs-overlay { position: static !important; display: block !important; background: #fff !important; overflow: visible !important; color: #000; }
  .rs-top, .rs-side, .rs-sep, .rs-pb::after { display: none !important; }
  .rs-body-row, .rs-scroll { display: block !important; overflow: visible !important; padding: 0 !important; }
  .rs-page { width: auto !important; max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; min-height: 0 !important; zoom: 1 !important; }
  .rs-layout-moderno::before, .rs-layout-clinico::before { margin: 0 0 8mm; }
  .rs-layout-compatto, .rs-layout-decorato { padding: 0 !important; }
  .rs-pb { border-top: none; margin: 0; }
  .rs-newpage { break-before: page; page-break-before: always; }
  .tp-newpage { break-before: page; page-break-before: always; border-top: none; padding-top: 0; margin-top: 0; }
  .tp-newpage::before { display: none; }
  .tp-day.tp-flow { break-inside: auto; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;
