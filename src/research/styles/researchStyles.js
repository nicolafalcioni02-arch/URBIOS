// CSS del modulo Ricerca (iniettato da Research.jsx, non globale). Prefisso "rs-".
export const researchStyles = `
.rs-wrap { max-width: 1040px; margin: 0 auto; padding: 24px 16px 96px; }
.rs-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.rs-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin: 16px 0; scrollbar-width: none; }
.rs-tabs button { flex: none; height: 36px; padding: 0 14px; border-radius: 999px; font-size: 13.5px; font-weight: 500; color: var(--muted); background: var(--surface); border: 1px solid var(--line); }
.rs-tabs button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.rs-tabs button i { margin-right: 6px; }
.rs-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.rs-sel { appearance: none; background-image: none; }
.rs-table { width: 100%; border-collapse: collapse; font-size: 13.5px; font-variant-numeric: tabular-nums; }
.rs-table th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12px; padding: 8px 10px; border-bottom: 1px solid var(--line); white-space: nowrap; }
.rs-table td { padding: 8px 10px; border-bottom: 1px solid var(--line); color: var(--ink); }
.rs-table td.n, .rs-table th.n { text-align: right; }
.rs-table tr:last-child td { border-bottom: 0; }
.rs-scroll { overflow-x: auto; }
.rs-h { font-weight: 600; font-size: 15px; color: var(--ink); margin: 0 0 10px; }
.rs-muted { color: var(--muted); font-size: 13px; line-height: 1.5; }
.rs-apa { font-family: ui-serif, Georgia, serif; font-size: 15px; line-height: 1.6; color: var(--ink); background: var(--soft); border-radius: 12px; padding: 12px 14px; }
.rs-badge { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600; background: var(--soft); color: var(--muted); }
.rs-badge.ok { background: color-mix(in srgb, var(--ok) 14%, transparent); color: var(--ok); }
.rs-badge.bad { background: color-mix(in srgb, var(--bad) 12%, transparent); color: var(--bad); }
.rs-list { margin: 0; padding-left: 18px; }
.rs-list li { margin: 3px 0; }
.rs-stack > * + * { margin-top: 12px; }
.rs-chart { width: 100%; height: auto; display: block; }
.rs-chart text { font-size: 11px; fill: var(--muted); font-family: inherit; }
.rs-check { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--ink); cursor: pointer; }
.rs-pick { display: flex; flex-wrap: wrap; gap: 6px; max-height: 180px; overflow-y: auto; }
.rs-pick label { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); font-size: 13px; cursor: pointer; }
.rs-pick label.on { border-color: var(--ink); background: var(--soft); }
`;
