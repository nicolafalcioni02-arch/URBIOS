// CSS della stampa della scheda di allenamento (A4). Il browser fa l'impaginazione: le righe non si spezzano,
// l'intestazione della tabella si ripete su ogni pagina, ogni giorno può iniziare su una pagina nuova.
export const trainingPrintCss = `
.tp-overlay { position: fixed; inset: 0; z-index: 30000; background: #323639; display: flex; flex-direction: column;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.tp-toolbar { background: #1D1D1F; color: #fff; padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; font-size: 13px; }
.tp-toolbar label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.tp-toolbar select { background: #2c2c2e; color: #fff; border: 1px solid #555; border-radius: 8px; padding: 6px 8px; font-size: 13px; }
.tp-toolbar .tp-btn { border: none; border-radius: 10px; padding: 9px 16px; font-weight: 700; font-size: 13px; cursor: pointer; }
.tp-btn.main { background: #0A84FF; color: #fff; } .tp-btn.alt { background: #fff; color: #111; }
.tp-scroll { flex: 1; overflow: auto; padding: 24px 12px 60px; }
.tp-doc { width: 210mm; max-width: 100%; margin: 0 auto; background: #fff; color: #111; padding: 12mm; box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(0,0,0,.45); font-size: 10pt; line-height: 1.35; }
.tp-doc * { box-sizing: border-box; }
.tp-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12mm; padding-bottom: 5mm; border-bottom: 2px solid #111; margin-bottom: 6mm; }
.tp-studio-name { font-size: 17pt; font-weight: 800; text-transform: uppercase; letter-spacing: -.3px; line-height: 1.05; }
.tp-studio-sub { font-size: 8pt; text-transform: uppercase; letter-spacing: 1.6px; color: #666; margin-top: 1.5mm; }
.tp-studio-right { text-align: right; font-size: 8pt; color: #444; line-height: 1.55; }
.tp-doc-title { font-size: 22pt; font-weight: 800; letter-spacing: -.5px; line-height: 1.05; margin: 0 0 1mm; }
.tp-doc-sub { font-size: 10pt; color: #555; margin: 0 0 5mm; }
.tp-client { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; border: 1px solid #ccc; border-radius: 3mm; padding: 4mm 5mm; margin-bottom: 7mm; }
.tp-client small { display: block; font-size: 7pt; text-transform: uppercase; letter-spacing: 1.2px; color: #777; margin-bottom: .5mm; }
.tp-client b { font-size: 11pt; }
.tp-week-title { font-size: 15pt; font-weight: 800; margin: 0 0 4mm; padding-bottom: 1.5mm; border-bottom: 1px solid #111; break-after: avoid; page-break-after: avoid; }
.tp-day { margin-top: 7mm; }
.tp-day-title { font-size: 11.5pt; font-weight: 800; margin: 0 0 2.5mm; display: flex; align-items: baseline; gap: 3mm; break-after: avoid; page-break-after: avoid; }
.tp-day-title span { font-size: 8pt; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; }
.tp-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; table-layout: fixed; }
.tp-table thead { display: table-header-group; }
.tp-table th { background: #111; color: #fff; font-size: 7pt; text-transform: uppercase; letter-spacing: .08em; padding: 2mm 2.4mm; text-align: left; font-weight: 700; }
.tp-table td { padding: 2.2mm 2.4mm; border-bottom: 1px solid #d8d8d8; vertical-align: middle; }
.tp-row { break-inside: avoid; page-break-inside: avoid; }
.tp-img { font-size: 0; white-space: normal; }
.tp-img img { display: inline-block; width: calc(50% - 0.8mm); height: auto; border-radius: 1mm; margin: 0 0.8mm 0.8mm 0; vertical-align: top; }
.tp-img.n1 img { width: 62%; } .tp-img.n3 img { width: calc(33.3% - 0.8mm); }
.tp-name b { display: block; font-size: 10.5pt; }
.tp-name span { font-size: 7.5pt; color: #777; text-transform: uppercase; letter-spacing: .8px; }
.tp-serie { font-weight: 700; overflow-wrap: anywhere; }
.tp-rec { overflow-wrap: anywhere; }
.tp-note { font-size: 8.5pt; color: #333; overflow-wrap: anywhere; }
.tp-name b { overflow-wrap: anywhere; }
.tp-ss { display: inline-block; background: #111; color: #fff; border-radius: 1mm; font-size: 7pt; font-weight: 800; padding: 0 1.4mm; margin-right: 1.5mm; vertical-align: 1px; }
.tp-exnote { display: block; font-size: 8pt; color: #555; font-style: italic; margin-top: .6mm; }
.tp-load b { display: block; } .tp-load small { color: #666; font-size: 8pt; }
.tp-sum { font-size: 8pt; color: #555; margin: -1mm 0 2.5mm; }
.tp-daynote { font-size: 8.5pt; color: #333; margin-top: 2mm; padding: 1.5mm 2.5mm; background: #f4f4f6; border-left: 1mm solid #111; break-inside: avoid; }
.tp-deload { display: inline-block; margin-left: 3mm; background: #FF9F0A; color: #fff; font-size: 7.5pt; font-weight: 800; padding: .4mm 2mm; border-radius: 1mm; vertical-align: 2px; letter-spacing: .06em; }
.tp-weeknote { font-size: 9pt; color: #555; margin: -2mm 0 3mm; }
.tp-legend { margin-top: 7mm; padding-top: 2.5mm; border-top: 1px solid #ccc; font-size: 7.5pt; color: #666; line-height: 1.5; break-inside: avoid; }
.tp-empty { color: #aaa; }
.tp-newpage { border-top: 2px dashed #b9b9b9; padding-top: 6mm; margin-top: 10mm; }
.tp-newpage::before { content: 'nuova pagina'; display: block; font-size: 7pt; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; margin: -9mm 0 4mm; text-align: right; }
body.tp-open { overflow: hidden; }

@media print {
  @page { size: A4 portrait; margin: 12mm 12mm 16mm; }
  html, body { background: #fff !important; overflow: visible !important; height: auto !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(.tp-overlay), body > #root { display: none !important; height: 0 !important; overflow: hidden !important; }
  /* index.css nasconde tutto (body * { visibility: hidden }) per la stampa dei report: qui va ripristinato */
  .tp-overlay, .tp-overlay * { visibility: visible !important; }
  .tp-overlay { position: static !important; display: block !important; background: #fff !important; overflow: visible !important; }
  .tp-toolbar { display: none !important; }
  .tp-scroll { overflow: visible !important; padding: 0 !important; }
  .tp-doc { width: auto !important; max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
  .tp-newpage { break-before: page; page-break-before: always; border-top: none; padding-top: 0; margin-top: 0; }
  .tp-newpage::before { display: none; }
  .tp-day.tp-flow { break-inside: auto; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;
