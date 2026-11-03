// Stile del Laboratorio: solo token di index.css. Classi lab-*.
export const labStyles = `
.lab-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.lab-tabs button{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;height:42px;padding:0 16px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-weight:600;font-size:14px}
.lab-tabs button.on{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.lab-tabs b{font-weight:600;opacity:.65;font-size:12px}
.lab-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.lab-card{display:flex;flex-direction:column;gap:6px;text-align:left;padding:14px 16px;border:1px solid var(--line);border-radius:16px;background:var(--surface);cursor:pointer;min-width:0}
.lab-card:hover{border-color:var(--ink)}
.lab-card.sel{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
.lab-card-top{display:flex;align-items:flex-start;gap:10px;justify-content:space-between}
.lab-card h3{font-size:15px;font-weight:600;color:var(--ink);margin:0;line-height:1.3;overflow-wrap:anywhere}
.lab-card p{font-size:12.5px;color:var(--muted);margin:0;line-height:1.4}
.lab-pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;white-space:nowrap;color:var(--muted)}
.lab-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--line)}
.lab-pill.ok{color:var(--ok)}.lab-pill.ok::before{background:var(--ok)}
.lab-pill.warn{color:var(--warn)}.lab-pill.warn::before{background:var(--warn)}
.lab-pill.bad{color:var(--bad)}.lab-pill.bad::before{background:var(--bad)}
.lab-check{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);background:var(--surface);flex:0 0 20px;display:grid;place-items:center;color:var(--paper);font-size:12px}
.lab-check.on{background:var(--ink);border-color:var(--ink)}
.lab-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.lab-stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.lab-stat{padding:8px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-size:12.5px;color:var(--muted)}
.lab-stat b{display:block;font-size:20px;color:var(--ink);font-weight:600;line-height:1.1}
.lab-empty{padding:40px 20px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:16px;font-size:14px}
.lab-modal{background:var(--paper);color:var(--ink);width:min(760px,100%);max-height:92vh;overflow-y:auto;border-radius:20px;padding:22px 22px 18px;border:1px solid var(--line)}
.lab-modal-foot{position:sticky;bottom:-18px;display:flex;gap:8px;justify-content:space-between;align-items:center;padding:12px 0 6px;margin-top:14px;background:var(--paper)}
.lab-form{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}
.lab-form .full{grid-column:1/-1}
@media (max-width:639px){.lab-form{grid-template-columns:1fr}.lab-modal{padding:18px 16px 14px;border-radius:18px}}
.lab-rows{display:grid;gap:6px}
.lab-row{display:grid;gap:6px;align-items:center}
.lab-row .fld{height:40px;min-width:0}
.lab-step{display:grid;grid-template-columns:26px minmax(0,1fr) 92px 34px;gap:6px;align-items:start}
.lab-step>span{font-size:12px;font-weight:600;color:var(--muted);padding-top:11px;text-align:center}
.lab-step textarea{min-height:40px;resize:vertical}
.lab-x{width:34px;height:40px;display:grid;place-items:center;color:var(--muted);border-radius:10px}
.lab-x:hover{color:var(--bad)}
.lab-add{align-self:flex-start;font-size:13px;font-weight:600;color:var(--ink);display:inline-flex;gap:6px;align-items:center;height:34px;padding:0 12px;border:1px dashed var(--line);border-radius:10px}
.lab-calc{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.lab-calc section{border:1px solid var(--line);border-radius:16px;padding:16px;background:var(--surface)}
.lab-calc h3{margin:0 0 4px;font-size:15px;font-weight:600}
.lab-calc p{margin:0 0 12px;font-size:12.5px;color:var(--muted)}
.lab-calc .out{margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--soft);font-size:14px}
.lab-calc .out b{font-size:18px}
`;
