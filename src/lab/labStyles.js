// Stile del Laboratorio: stesso linguaggio delle Impostazioni (barra laterale set-side, pannelli .panel, bottoni st-btn).
// Solo token di index.css, così anche l'aspetto Vetro funziona. Classi lab-*.
export const labStyles = `
.lab-svg{flex:none}
.lab-ws{display:grid;grid-template-columns:240px minmax(0,1fr);height:100%;width:100%;background:var(--surface);color:var(--ink);overflow:hidden}
.lab-ws.narrow{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);background:var(--paper)}
.lab-main{min-width:0;min-height:0;height:100%;overflow:hidden;background:var(--surface)}
.narrow .lab-main{background:var(--paper)}

/* barra laterale: come Impostazioni */
.lab-side{display:flex;flex-direction:column;justify-content:space-between;gap:16px;padding:16px 16px 64px;background:var(--paper);border-right:1px solid var(--line);overflow-y:auto;min-height:0}
.lab-side-title{font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--ink);margin:0 0 14px;padding:4px 10px 0}
.lab-side-group{margin-top:18px}
.lab-side-group:first-child{margin-top:12px}
.lab-side-label{padding:0 10px 6px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.lab-side .set-side{padding:8px 10px;gap:11px;text-align:left}
.lab-side .set-side .lab-svg{color:var(--muted);transition:color .2s}
.lab-side .set-side.on .lab-svg,.lab-side .set-side:hover .lab-svg{color:var(--ink)}
.lab-side-text{font-size:14px;font-weight:500;line-height:1.2}
.lab-side .set-side.on .lab-side-text{font-weight:600}
.lab-side em{margin-left:auto;font-style:normal;font-size:12px;font-weight:500;color:var(--muted)}
.lab-side em.is-alert{color:#fff;background:var(--warn);border-radius:999px;padding:1px 8px;font-weight:600}
.lab-foot-btn{color:var(--muted)}
.lab-search{position:relative}
.lab-search>.lab-svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;z-index:1}
.lab-search .fld{height:40px;padding-left:34px;font-size:14px}
.lab-hits{position:absolute;z-index:20;left:0;right:0;top:46px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px;box-shadow:0 12px 32px rgba(18,19,23,.12);max-height:340px;overflow-y:auto}
.lab-hits p{margin:0;padding:12px;font-size:13px;color:var(--muted)}
.lab-hits button{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:8px 10px;border-radius:10px;font-size:13px}
.lab-hits button:hover{background:var(--soft)}
.lab-hits b{display:block;font-weight:600;overflow-wrap:anywhere}.lab-hits small{color:var(--muted);font-size:11.5px}

/* intestazione stretta (telefono, tablet) */
.lab-top{padding:calc(12px + env(safe-area-inset-top)) 16px 10px;border-bottom:1px solid var(--line);background:var(--paper)}
.lab-top-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.lab-top-title{flex:1;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0}
.lab-iconbtn{width:36px;height:36px;display:grid;place-items:center;border-radius:999px;color:var(--ink);background:var(--soft)}
.lab-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.lab-tabs button{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;height:38px;padding:0 14px;border-radius:999px;background:var(--soft);color:var(--muted);font-size:13.5px;font-weight:500}
.lab-tabs button.on{background:var(--ink);color:#fff}
.lab-tabs b{font-weight:500;opacity:.65;font-size:12px}

/* bottoni (come st-btn) */
.lab-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:40px;padding:0 16px;border-radius:12px;font-size:14px;font-weight:500;white-space:nowrap;transition:background-color .15s,border-color .15s,transform .12s var(--ease)}
.lab-btn:active:not(:disabled){transform:scale(.97)}
.lab-btn:disabled{opacity:.45;cursor:not-allowed}
.lab-btn.is-sm{height:34px;padding:0 12px;font-size:13px;border-radius:10px}
.lab-btn.is-primary{background:var(--ink);color:#fff}
.lab-btn.is-primary:hover:not(:disabled){background:#2a2b30}
.lab-btn.is-secondary{background:var(--surface);color:var(--ink);border:1px solid var(--line)}
.lab-btn.is-secondary:hover:not(:disabled){border-color:var(--ink)}
.lab-btn.is-ghost{color:var(--ink);padding:0 10px}
.lab-btn.is-ghost:hover:not(:disabled){background:var(--soft)}
.lab-btn.is-danger{background:var(--surface);color:var(--bad);border:1px solid var(--line)}
.lab-btn.is-danger:hover:not(:disabled){border-color:var(--bad)}

/* pagina */
.lab-page{height:100%;overflow-y:auto;padding:32px 32px 56px;max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.narrow .lab-page{padding:20px 16px 40px}
.lab-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:8px}
.lab-title{font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.15;color:var(--ink);margin:0}
.lab-intro{margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--muted);max-width:60ch}
.lab-block h3{margin:0 0 8px;font-size:15px;font-weight:600;letter-spacing:-.01em}
.lab-none{margin:0;padding:4px 0;font-size:13.5px;color:var(--muted)}
.lab-row-i{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:9px 6px;border-radius:12px}
.lab-row-i:hover{background:var(--soft)}
.lab-ico{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:9px;background:var(--soft);color:var(--ink)}
.lab-row-i b{display:block;font-size:14px;font-weight:500;overflow-wrap:anywhere}
.lab-row-i small{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}
.lab-dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px;background:var(--line)}
.lab-dot.warn{background:var(--warn)}.lab-dot.bad{background:var(--bad)}.lab-dot.ok{background:var(--ok)}
.lab-quick{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}

/* elenco + editor */
.lab-split{display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);height:100%;min-height:0}
.lab-split.with-page{grid-template-columns:minmax(240px,300px) minmax(340px,430px) minmax(0,1fr)}
.lab-pagescol{min-width:0;min-height:0;height:100%;display:flex;flex-direction:column;border-left:1px solid var(--line)}
.lab-pageshead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--surface)}
.lab-pages{flex:1;min-width:0;min-height:0;overflow:auto;background:var(--soft);padding:20px;display:flex;flex-direction:column;align-items:center;gap:18px}
.lab-zoom{position:sticky;top:0;z-index:5;align-self:flex-end;display:flex;border:1px solid var(--line);border-radius:8px;background:var(--surface);overflow:hidden;box-shadow:0 2px 8px rgba(30,25,15,.12)}
.lab-zoom button{border:0;background:none;color:var(--ink);font:inherit;font-size:13px;min-width:34px;height:28px;padding:0 8px;cursor:pointer}
.lab-zoom button:hover{background:var(--soft)}
.lab-zoom button+button{border-left:1px solid var(--line)}
.lab-pages-empty{margin:auto;color:var(--muted);font-size:14px}
.lab-sheet{flex:none;position:relative}
.lab-sheet.on{box-shadow:0 0 0 2px var(--accent),0 12px 34px rgba(30,25,15,.13)}
.narrow .lab-split{grid-template-columns:minmax(0,1fr)}
.lab-listcol{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--line)}
.narrow .lab-listcol{border-right:0}
.lab-listhead{padding:28px 20px 12px;display:flex;flex-direction:column;gap:12px}
.narrow .lab-listhead{padding:18px 16px 12px}
.lab-seg{align-self:flex-start;max-width:100%;overflow-x:auto;scrollbar-width:none}
.lab-seg button{padding:6px 12px;font-size:13px;white-space:nowrap}
.lab-tools{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.lab-listscroll{flex:1;min-height:0;overflow-y:auto;padding:0 20px 28px}
.narrow .lab-listscroll{padding:0 16px 28px}
.lab-list{padding:6px}
.lab-item{display:flex;align-items:flex-start;gap:6px;border-radius:12px;padding-right:8px}
.lab-item:hover{background:var(--soft)}
.lab-item.sel{background:var(--soft);box-shadow:inset 0 0 0 .5px var(--line)}
.lab-item-main{flex:1;min-width:0;text-align:left;display:flex;flex-direction:column;gap:3px;padding:10px 6px 10px 10px}
.lab-item-main b{font-size:14.5px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}
.lab-item-main small{font-size:12.5px;color:var(--muted);line-height:1.35}
.lab-item .lab-check{margin-top:13px}
.lab-pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;white-space:nowrap;color:var(--muted)}
.lab-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--line)}
.lab-pill.ok{color:var(--ok)}.lab-pill.ok::before{background:var(--ok)}
.lab-pill.warn{color:var(--warn)}.lab-pill.warn::before{background:var(--warn)}
.lab-pill.bad{color:var(--bad)}.lab-pill.bad::before{background:var(--bad)}
.lab-check{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);background:var(--surface);flex:0 0 20px;display:grid;place-items:center;color:#fff}
.lab-check.on{background:var(--ink);border-color:var(--ink)}
.lab-empty{padding:32px 16px;text-align:center;color:var(--muted);font-size:14px;display:flex;flex-direction:column}
.lab-detail{min-width:0;min-height:0;height:100%;overflow:hidden}
.lab-detail-empty{height:100%;display:grid;place-content:center;justify-items:center;gap:10px;color:var(--muted);font-size:14px;text-align:center;padding:24px}
.lab-detail-empty p{margin:0}

/* editor */
.lab-pane{height:100%;overflow-y:auto;padding:0 32px 56px;max-width:820px}
.lab-pane-head{position:sticky;top:0;z-index:3;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:28px 0 14px;margin-bottom:20px;background:var(--surface);border-bottom:1px solid var(--line)}
.lab-kicker{display:block;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.lab-pane-title{margin-top:4px;overflow-wrap:anywhere}
.lab-pane-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.lab-saved{font-size:12px;color:var(--muted);margin-right:4px}
.lab-modal{background:var(--surface);color:var(--ink);width:min(760px,100%);max-height:94vh;overflow-y:auto;border-radius:20px;padding:0 20px 22px}
.lab-modal .lab-pane-head{padding-top:20px}
.lab-form{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr))}
.lab-form .full{grid-column:1/-1}
@media (max-width:639px){.lab-form{grid-template-columns:1fr}.lab-hide-s{display:none}.lab-pane{padding:0 16px 40px}.lab-page-head{align-items:flex-start;flex-wrap:wrap}}
.lab-pane .fld,.lab-modal .fld{background:var(--soft);border:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(0,0,0,.03)}
.lab-pane .fld:hover,.lab-modal .fld:hover{border-color:var(--muted)}
.lab-pane .fld:focus,.lab-modal .fld:focus{background:var(--surface);border-color:var(--ink);outline:none}
.lab-rows{display:grid;gap:6px}
.lab-row{display:grid;gap:6px;align-items:center}
.lab-row .fld{height:40px;min-width:0}
.lab-step{display:grid;grid-template-columns:26px minmax(0,1fr) 92px 34px;gap:6px;align-items:start}
.lab-step>span{font-size:12px;font-weight:600;color:var(--muted);padding-top:11px;text-align:center}
.lab-step textarea{min-height:40px;resize:vertical}
.lab-x{width:34px;height:40px;display:grid;place-items:center;color:var(--muted);border-radius:10px}
.lab-x:hover{color:var(--bad)}
.lab-add{align-self:flex-start;font-size:13px;font-weight:500;color:var(--ink);display:inline-flex;gap:6px;align-items:center;height:34px;padding:0 12px;border:1px dashed var(--line);border-radius:10px}
.lab-add:hover{border-color:var(--ink)}

/* calcoli */
.lab-calc{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.lab-calc section{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:18px}
.lab-calc h3{margin:0 0 4px;font-size:15px;font-weight:600}
.lab-calc p{margin:0 0 12px;font-size:13px;color:var(--muted)}
.lab-calc .out{margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--soft);font-size:14px}
.lab-calc .out b{font-size:18px}
`;
