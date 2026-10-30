// Report grafico (classi sr-*)
export const smartChartStyles = `
.sr-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(18,19,23,.45); display: flex; align-items: center; justify-content: center; padding: 24px; }
.sr-modal { background: var(--surface); width: 100%; max-width: 1080px; height: 86vh; border-radius: 20px; border: 1px solid var(--line); display: flex; flex-direction: column; overflow: hidden; animation: rise .35s var(--ease) both; }
.sr-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
.sr-title { font-size: 17px; font-weight: 700; color: var(--ink); }
.sr-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.sr-close { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.sr-close:hover { background: var(--soft); color: var(--ink); }
.sr-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 300px 1fr; }
.sr-panel { padding: 20px; border-right: 1px solid var(--line); background: var(--paper); display: flex; flex-direction: column; gap: 18px; overflow-y: auto; }
.sr-label { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.sr-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 3px; background: var(--soft); border-radius: 10px; }
.sr-seg button { border: 0; background: transparent; padding: 8px 6px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; }
.sr-seg button.on { background: var(--surface); color: var(--ink); box-shadow: 0 0 0 1px var(--line); }
.sr-select { width: 100%; padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--ink); font-size: 13px; }
.sr-types { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.sr-types button { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--muted); font-size: 12px; font-weight: 600; cursor: pointer; }
.sr-types button.on { border-color: var(--accent); color: var(--accent); }
.sr-types button:disabled { opacity: .4; cursor: not-allowed; }
.sr-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink); cursor: pointer; }
.sr-check.off { color: var(--muted); cursor: not-allowed; }
.sr-check input { accent-color: var(--accent); }
.sr-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
.sr-notes-wrap { flex: 1; display: flex; flex-direction: column; min-height: 110px; }
.sr-notes { flex: 1; resize: none; padding: 10px; border: 1px solid var(--line); border-radius: 10px; font-size: 13px; font-family: inherit; color: var(--ink); background: var(--surface); }
.sr-chart-area { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding: 18px 24px; gap: 10px; }
.sr-meta { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--muted); }
.sr-tag { padding: 3px 10px; border-radius: 999px; background: var(--soft); color: var(--ink); font-size: 12px; }
.sr-chart { flex: 1; min-height: 0; position: relative; }
.sr-plot { position: absolute; inset: 0; }
.sr-empty { height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; color: var(--muted); font-size: 14px; line-height: 1.5; border: 1px dashed var(--line); border-radius: 14px; }
.sr-notes-list { font-size: 12px; color: var(--warn); line-height: 1.5; }
.sr-foot { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid var(--line); flex-shrink: 0; }
.sr-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 13px; font-weight: 600; cursor: pointer; }
.sr-btn:hover { background: var(--soft); }
.sr-btn.primary { background: var(--ink); border-color: var(--ink); color: #fff; }
.sr-btn.primary:hover { background: var(--ink); opacity: .9; }
.sr-btn:disabled { opacity: .4; cursor: not-allowed; }
@media (max-width: 760px) {
  .sr-overlay { padding: 0; }
  .sr-modal { height: 100%; max-width: none; border-radius: 0; border: 0; }
  .sr-body { grid-template-columns: 1fr; grid-template-rows: auto minmax(320px, 1fr); overflow-y: auto; }
  .sr-panel { border-right: 0; border-bottom: 1px solid var(--line); overflow: visible; }
  .sr-chart-area { padding: 14px 16px; min-height: 340px; }
}
`;
