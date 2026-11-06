// Stile del Laboratorio: stesso linguaggio delle Impostazioni (barra laterale set-side, pannelli .panel, bottoni st-btn).
// Solo token di index.css, così anche l'aspetto Vetro funziona. Classi lab-*.
export const labStyles = `
.lab-svg{flex:none}
/* campi: quelli di Sport e Nutrizione (.fld di index.css); qui solo la freccia dei menu a tendina */
.lab-ws select.fld,.lab-modal select.fld{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E6D69' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 12px center!important}
.lab-ws textarea.fld{line-height:1.4}
.lab-ws{display:grid;grid-template-columns:240px minmax(0,1fr);height:100%;width:100%;background:var(--surface);color:var(--ink);overflow:hidden}
.lab-ws.narrow{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);background:var(--paper)}
.lab-main{min-width:0;min-height:0;height:100%;overflow:auto;background:var(--paper)}
.lab-main.has-wd{display:flex;flex-direction:column;overflow:hidden}.lab-main.has-wd>.phone{flex:1;min-height:0;min-width:0}
.narrow .lab-main{background:var(--paper)}

/* barra laterale: come Impostazioni */
.lab-side{display:flex;flex-direction:column;justify-content:space-between;gap:16px;padding:16px 16px 22px;background:var(--lab-side-bg,var(--paper)) fixed;border-right:1px solid var(--line);overflow-y:auto;min-height:0}
.lab-side-title{font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--ink);margin:0 0 14px;padding:4px 10px 0}
.lab-side-group{margin-top:18px}
.lab-side-group:first-child{margin-top:12px}
html[data-look='vetro'] .lab-side{--lab-side-bg:radial-gradient(52vmax 44vmax at 92% -8%,rgba(225,234,76,.85),transparent 64%),radial-gradient(46vmax 42vmax at -10% 30%,rgba(226,222,248,.8),transparent 62%),radial-gradient(50vmax 40vmax at 72% 110%,rgba(252,234,222,.9),transparent 62%),radial-gradient(32vmax 28vmax at 16% 100%,rgba(225,234,76,.35),transparent 62%),linear-gradient(160deg,#F7F4EC 0%,#F1EEE8 55%,#F7F2EC 100%)}
.lab-side .set-side{color:var(--ink)}
.lab-side-label{padding:0 10px 6px;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.lab-side .set-side{padding:8px 10px;gap:11px;text-align:left}
.lab-side .set-side .lab-svg{color:var(--muted);transition:color .2s}
.lab-side .set-side.on .lab-svg,.lab-side .set-side:hover .lab-svg{color:var(--ink)}
.lab-dirty{margin-left:auto;width:8px;height:8px;border-radius:50%;background:var(--bad)}.lab-side .lab-foot-btn:disabled{opacity:.5;cursor:default}
.lab-side-text{font-size:14.5px;font-weight:500;line-height:1.2}
.lab-side .set-side.on .lab-side-text{font-weight:600}
.lab-side em{margin-left:auto;font-style:normal;font-size:12.5px;font-weight:600;color:var(--muted)}
.lab-side em.is-alert{color:#fff;background:var(--warn);border-radius:999px;padding:1px 8px;font-weight:600}
.lab-foot-btn{color:var(--muted)}
.lab-search{position:relative}
.lab-search>.lab-svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;z-index:1}
.lab-search .fld{height:40px;padding-left:34px;font-size:14px}
.lab-hits{position:absolute;z-index:20;left:0;right:0;top:46px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px;box-shadow:0 12px 32px rgba(18,19,23,.12);max-height:340px;overflow-y:auto}
.lab-hits p{margin:0;padding:12px;font-size:13px;color:var(--muted)}
.lab-hits button{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:8px 10px;border-radius:10px;font-size:13px}
.lab-hits button:hover{background:var(--soft)}
.lab-hits b{display:block;font-weight:600;}.lab-hits small{color:var(--muted);font-size:11.5px}

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
.lab-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;padding:0 18px;border-radius:999px;font-size:14px;font-weight:600;white-space:nowrap;transition:background-color .15s,border-color .15s,transform .12s var(--ease)}
.lab-btn:active:not(:disabled){transform:scale(.97)}
.lab-btn:disabled{opacity:.45;cursor:not-allowed}
.lab-btn.is-sm{height:38px;padding:0 14px;font-size:13px;border-radius:999px}
.lab-btn.is-primary{background:var(--ink);color:#fff}
.lab-btn.is-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 20px rgba(18,19,23,.18)}
.lab-btn.is-secondary{background:var(--surface);color:var(--ink);border:1px solid var(--line)}
.lab-btn.is-secondary:hover:not(:disabled){border-color:var(--ink)}
.lab-btn.is-ok{background:var(--ok);color:#fff;border:1px solid var(--ok)}.lab-btn.is-ok:hover:not(:disabled){filter:brightness(.92)}
.lab-cal{width:264px;padding:12px}.lab-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.lab-cal-head b{font-size:13.5px;text-transform:capitalize}
.lab-cal-head button{width:28px;height:28px;padding:0;justify-content:center}
.lab-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}.lab-cal-grid span{font-size:11px;color:var(--muted);padding:2px 0}
.lab-cal-grid .lab-cal-d{display:flex;flex-direction:column;align-items:center;justify-content:center;height:32px;padding:0;border-radius:8px;font-size:12.5px;color:var(--ink);cursor:default}
.lab-cal-d.has{font-weight:700;background:var(--soft);cursor:pointer}.lab-cal-d.sel{background:var(--ink);color:var(--surface)}.lab-cal-d.has::after{content:'';width:4px;height:4px;border-radius:50%;background:var(--ok);margin-top:1px}.lab-cal-d.sel::after{background:var(--surface)}
.lab-cal-list{margin-top:10px;border-top:1px solid var(--line);padding-top:8px;font-size:12.5px}.lab-cal-list p{margin:3px 0;color:var(--ink)}.lab-cal-list small{color:var(--muted)}
.lab-btn.is-ghost{color:var(--muted);padding:0 10px}
.lab-btn.is-ghost:hover:not(:disabled){background:var(--soft);color:var(--ink)}
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
.lab-row-i b{display:block;font-size:14px;font-weight:500;}
.lab-row-i small{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}
.lab-dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px;background:var(--line)}
.lab-dot.warn{background:var(--warn)}.lab-dot.bad{background:var(--bad)}.lab-dot.ok{background:var(--ok)}
.lab-quick{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}

/* elenco + editor */
.lab-split{display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);height:100%;min-height:0}
.lab-split.with-page{grid-template-columns:minmax(240px,290px) minmax(340px,1fr) clamp(420px,40vw,704px)}
.with-page .lab-pane{max-width:none;padding-right:16px}
.with-page .lab-listhead{padding:22px 16px 10px;gap:10px}
.with-page .lab-listhead .lab-intro{display:none}
.with-page .lab-listscroll{padding:0 16px 24px}
.with-page .lab-listtools{display:flex;flex-wrap:wrap;gap:6px}
.with-page .lab-listtools .lab-btn{justify-content:center;white-space:nowrap}
.with-page .lab-listtools .lab-btn.is-ghost{grid-column:1/-1}
.lab-pagescol{min-width:0;min-height:0;height:100%;display:flex;flex-direction:column;border-left:1px solid var(--line)}
.lab-pagesbody{flex:1;min-height:0}
.lab-pagescol{position:relative}
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
.lab-listhead{padding:24px 16px 10px;display:flex;flex-direction:column;gap:10px}
.narrow .lab-listhead{padding:18px 16px 12px}
.lab-seg{align-self:flex-start;max-width:100%;overflow-x:auto;scrollbar-width:none}
.lab-seg button{padding:6px 12px;font-size:13px;white-space:nowrap}
.lab-listtools{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.lab-listscroll{flex:1;min-height:0;overflow-y:auto;padding:0 12px 24px}
.narrow .lab-listscroll{padding:0 16px 28px}
.lab-btn.is-ico{width:38px;height:38px;padding:0;flex:none;position:relative;border-radius:50%}
.lab-head-btns{display:flex;gap:8px;flex:none;align-items:center}
.lab-filter-dot{position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--ink);border:2px solid var(--surface)}
.lab-searchrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.lab-searchrow>.fld{width:100%;min-width:0;height:36px;border-radius:999px;padding:0 14px}
.lab-filterwrap{position:relative;flex:none}
.lab-filterbtn.on{border-color:var(--ink)}
.lab-pop-back{position:fixed;inset:0;z-index:30}
.lab-pop{position:absolute;right:0;top:40px;z-index:31;min-width:190px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:4px;box-shadow:0 12px 32px rgba(18,19,23,.14)}
.lab-pop button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:8px 10px;border-radius:8px;font-size:13.5px}
.lab-pop button:hover{background:var(--soft)}.lab-pop button.on{font-weight:600;background:var(--soft)}
.lab-pop em{font-style:normal;font-size:12px;color:var(--muted)}
.lab-list{padding:6px;border-radius:16px;display:flex;flex-direction:column;gap:6px}
.lab-item{display:flex;align-items:center;gap:4px;border-radius:10px;padding-right:10px;border:1px solid var(--line);background:var(--surface)}
.lab-item:hover{background:var(--soft)}
.lab-item.sel{background-color:var(--soft);border-color:var(--ink)}
.lab-item.tone-ok{background-image:radial-gradient(ellipse 60% 140% at 0% 0%,color-mix(in srgb,var(--ok) 20%,transparent),transparent 75%)}.lab-item.tone-warn{background-image:radial-gradient(ellipse 60% 140% at 0% 0%,color-mix(in srgb,var(--warn) 24%,transparent),transparent 75%)}.lab-item.tone-bad{background-image:radial-gradient(ellipse 60% 140% at 0% 0%,color-mix(in srgb,var(--bad) 24%,transparent),transparent 75%)}
.lab-item-main{flex:1;min-width:0;text-align:left;display:flex;flex-direction:column;gap:3px;padding:10px 4px 10px 12px}
.lab-item-top{display:flex;align-items:center;gap:8px;min-width:0}
.lab-item-top b{flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lab-item-main small{font-size:12px;color:var(--muted);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lab-item .lab-check{opacity:.45}.lab-item:hover .lab-check,.lab-item .lab-check.on{opacity:1}
.lab-filters{display:flex;flex-wrap:wrap;gap:5px}
.lab-filters .lab-chip{height:30px;padding:0 12px;font-size:12.5px}
.lab-item-main .lab-pill{align-self:flex-start}
.lab-pill{flex:none;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;white-space:nowrap;color:var(--muted)}
.lab-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--line)}
.lab-pill.ok{color:var(--ok)}.lab-pill.ok::before{background:var(--ok)}
.lab-pill.warn{color:var(--warn)}.lab-pill.warn::before{background:var(--warn)}
.lab-pill.bad{color:var(--bad)}.lab-pill.bad::before{background:var(--bad)}
.lab-check{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);background:var(--surface);flex:0 0 20px;display:grid;place-items:center;color:#fff}
.lab-check{position:relative;height:20px;min-height:0;min-width:0;padding:0}.lab-check::after{content:'';position:absolute;inset:-10px}
.lab-check.on{background:var(--ink);border-color:var(--ink)}
.lab-empty{padding:32px 16px;text-align:center;color:var(--muted);font-size:14px;display:flex;flex-direction:column}
.lab-detail{min-width:0;min-height:0;height:100%;overflow:hidden;container-type:inline-size}.lab-detail-empty{height:100%;display:grid;place-content:center;justify-items:center;gap:10px;color:var(--muted);font-size:14px;text-align:center;padding:24px}
.lab-detail-empty p{margin:0}

/* editor */
.lab-pane{height:100%;overflow-y:auto;padding:0 32px 56px;max-width:820px}
.lab-pane-head{position:sticky;top:0;z-index:3;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:28px 0 14px;margin-bottom:20px;background:var(--paper);border-bottom:1px solid var(--line)}
.lab-kicker{display:block;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.lab-pane-title{margin-top:4px;}
.lab-pane-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.lab-saved{font-size:12px;color:var(--muted);margin-right:4px}
.lab-ai-back{background:rgba(18,19,23,.62)!important;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}.lab-modal.lab-ai{background:#fff;box-shadow:0 24px 70px rgba(18,19,23,.35);border:1px solid var(--line)}.lab-ai .lab-imp-tbl th{background:#fff}.lab-imp.lab-ai .lab-pane-head{position:sticky;top:0;z-index:3;background:#fff;margin:0 -16px;padding:16px 16px 12px}.lab-ai .lab-imp-foot{position:sticky;bottom:0;z-index:3;background:#fff;margin:0 -16px -22px;padding:12px 16px 18px;border-top:1px solid var(--line)}.lab-ai .lab-aicheck{display:flex;align-items:center;gap:8px;font-size:13.5px;margin-top:10px;cursor:pointer}
.lab-modal{background:var(--paper);color:var(--ink);width:min(760px,100%);max-height:94vh;overflow-y:auto;border-radius:20px;padding:0 16px 22px}
.lab-modal .lab-pane-head{padding-top:20px}
.lab-card{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:20px;margin-bottom:14px}
.lab-card-h{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:15px;font-weight:600}
.lab-card-n{width:24px;height:24px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;font-size:12px;font-weight:600}
.lab-opts{display:flex;flex-wrap:wrap;gap:6px}
.lab-opts .lab-chip{height:42px;padding:0 16px;border-radius:16px;font-size:14px}
.lab-opts .lab-chip:hover{border-color:var(--ink)}
.lab-opts .lab-chip.on{background:var(--ink)}
.lab-req{color:var(--bad)}
.lab-fhint{margin:-2px 0 8px;font-size:12.5px;line-height:1.4;color:var(--muted)}
.lab-form{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}
.lab-form .full{grid-column:1/-1}
@media (max-width:639px){.lab-form{grid-template-columns:1fr}.lab-hide-s{display:none}.lab-pane{padding:0 16px 40px}.lab-page-head{align-items:flex-start;flex-wrap:wrap}}
.lab-rows{display:grid;gap:6px}
.lab-rows .lab-row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;padding:12px;border:1px solid var(--line);border-radius:16px;background:#FBFAF8}.lab-cell{flex:1 1 120px;min-width:0;display:block}.lab-cell-l{display:block;font-size:12px;font-weight:500;color:var(--muted);margin:0 0 4px}.lab-rows .lab-row .lab-x{flex:none;margin-left:auto}
.lab-row .fld{height:44px;min-width:0}
.lab-step{display:grid;grid-template-columns:26px minmax(0,1fr) 92px 34px;gap:6px;align-items:start}
.lab-step>span{font-size:12px;font-weight:600;color:var(--muted);padding-top:11px;text-align:center}
.lab-step textarea{min-height:40px;resize:vertical}
.lab-fig{display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:16px;background:#FBFAF8}
.lab-fig-head{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:6px}
.lab-fig-img{display:grid;gap:6px;justify-items:start}.lab-fig-img img{max-width:100%;max-height:260px;border-radius:8px;border:1px solid var(--line)}
.lab-chart{display:grid;gap:8px}.lab-chart-top{display:flex;gap:6px;flex-wrap:wrap}
.lab-chart-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px}
.lab-chip{height:34px;padding:0 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font-size:13px;font-weight:600;color:var(--ink);transition:all .2s}.lab-chip:hover{border-color:var(--ink)}
.lab-chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.lab-chart-hint{font-size:12.5px;color:var(--muted);margin:0}
.lab-grid{display:grid;gap:6px;padding:10px;background:#FBFAF8;border:1px solid var(--line);border-radius:16px}
.lab-grid-row{display:grid;grid-template-columns:var(--tpl);gap:6px;align-items:center}
.lab-grid-h{font-size:12px;font-weight:600;color:var(--muted);padding-left:2px}
.lab-pane .lab-grid .fld{height:38px;border-radius:10px;padding:0 10px;min-width:0}
.lab-pane .lab-grid .fld:focus{border-color:var(--accent)}
.lab-pane .lab-grid .lab-grid-name{font-weight:600;text-align:center}
.lab-grid .lab-x{width:26px;height:36px}
.lab-gel-view{border:1px solid var(--line);border-radius:12px;background:#fff;padding:8px}
.lab-chart-view{aspect-ratio:520/300;display:grid;place-items:center;border:1px solid var(--line);border-radius:12px;background:#fff;padding:8px;overflow:hidden}
.lab-chart-view>div{width:100%}.lab-chart-view>span{font-size:13px;color:var(--muted);text-align:center}
.lab-pane,.lab-modal{overflow-anchor:none}
.lab-x{width:34px;height:40px;display:grid;place-items:center;color:var(--muted);border-radius:10px}
.lab-x:hover{color:var(--bad)}
.lab-x-bad{color:var(--bad)}.lab-x-bad:hover{background:var(--soft)}
.lab-add{align-self:flex-start;font-size:14px;font-weight:600;color:var(--ink);display:inline-flex;gap:8px;align-items:center;justify-content:center;height:42px;padding:0 18px;border:1.5px dashed #CFCCC3;border-radius:999px;transition:all .2s}
.lab-add:hover{border-color:var(--ink);background:var(--surface)}

/* calcoli */
.lab-calc{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.lab-calc section{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:20px}
.lab-calc .grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
.lab-calc .fld-label{margin-left:0}
.lab-calc h3{margin:0 0 4px;font-size:15px;font-weight:600}
.lab-calc p{margin:0 0 12px;font-size:13px;color:var(--muted)}
.lab-calc .out{margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--soft);font-size:14px}
.lab-calc .out b{font-size:18px}
.lab-gel-back{padding:0!important;align-items:stretch;background:#000!important;overscroll-behavior:contain;overflow:hidden;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
.lab-gel-win{background:#fff;color:var(--ink);width:100%;height:100vh;height:100dvh;border-radius:0!important;display:flex;flex-direction:column;overflow:hidden;border-radius:20px;padding:16px!important;box-shadow:0 8px 30px rgba(0,0,0,.18)}
.lab-gel-win .fld{height:40px;padding:0 12px;min-width:0;font-size:14px}
.gs-head{display:flex;gap:8px;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--line)}.gs-head .fld{flex:1;font-size:16px;font-weight:600;border-color:transparent;padding:0 4px}.gs-head .fld:hover{border-color:var(--line)}
.lab-ib{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:36px;height:36px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font:600 13px inherit;cursor:pointer;white-space:nowrap}
.lab-ib:hover{background:var(--soft)}.lab-ib.on{background:var(--ink);border-color:var(--ink);color:#fff}.lab-ib:disabled{opacity:.35;cursor:default}.lab-ib.txt{min-width:52px}
.lab-ib.done{background:var(--ink);border-color:var(--ink);color:#fff;padding:0 16px}
.gs-steps{display:flex;gap:4px;overflow-x:auto;padding:8px 0;margin:0 0 4px;border-bottom:1px solid var(--line)}
.gs-step{display:flex;align-items:center;gap:8px;flex:none;height:36px;padding:0 12px 0 6px;border:0;border-radius:18px;background:none;color:var(--muted);font:600 13px inherit;cursor:pointer}
.gs-step i{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line);font:600 12px inherit;font-style:normal}
.gs-step:hover{background:var(--soft)}.gs-step.past i{background:var(--soft);color:var(--ink)}
.gs-step.on{background:var(--ink);color:#fff}.gs-step.on i{background:#fff;color:var(--ink);border-color:#fff}
.lab-gel-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(320px,1fr) clamp(840px,66vw,1000px);gap:14px;padding-top:8px}
.lab-gel-main{display:flex;flex-direction:column;gap:8px;min-height:0}
.gs-bar{display:flex;gap:4px;align-items:center}.gs-sp{flex:1}
.lab-gel-stage{flex:1;min-height:0;overflow:auto;background:#000;border-radius:14px;padding:16px;display:grid;place-items:start center}
.lab-gel-empty{display:flex;flex-direction:column;align-items:center;gap:6px;align-self:center;padding:40px 48px;margin-top:10vh;border:2px dashed #B9B9C0;border-radius:18px;background:#fff;color:var(--muted);cursor:pointer;font:inherit;text-align:center}
.lab-gel-empty:hover{border-color:var(--ink);color:var(--ink)}.lab-gel-empty b{font-size:15px;color:var(--ink)}.lab-gel-empty span{font-size:12px}
.lab-gel-side{display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--line);padding-left:18px}
.lab-gel-side h3{margin:0 0 4px;font-size:18px;font-weight:700}.gs-help{margin:0 0 8px;font-size:13px;line-height:1.45;color:var(--muted)}
.gs-ctl{flex:1;min-height:0;overflow-y:auto;display:grid;gap:5px;align-content:start;padding-bottom:10px}
.gs-lbl{font-size:12px;font-weight:600;color:var(--muted);margin-top:4px}
.gs-btns{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.gs-nav{display:flex;justify-content:space-between;gap:8px;padding-top:8px;border-top:1px solid var(--line)}
.lab-wrap-dummy{}
.gs-rng{display:grid;gap:2px}.gs-rng-h{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--ink)}
.gs-rng-v{display:flex;align-items:center;gap:3px}
.gs-mini{display:grid;place-items:center;width:24px;height:24px;padding:0;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink);font:600 14px inherit;cursor:pointer}
.gs-mini:hover{background:var(--soft)}.gs-mini:disabled{opacity:.3;cursor:default}
.gs-num{width:46px;height:24px;padding:0 4px;border:1px solid #B9B9C0;border-radius:7px;text-align:right;font:600 13px inherit;color:var(--ink);background:#fff;font-variant-numeric:tabular-nums}
.gs-num:focus{outline:none;border-color:var(--ink)}.gs-unit{width:10px;font-size:12px;color:var(--muted)}
.gs-rng input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:18px;margin:0;background:none;cursor:pointer}
.gs-rng input::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:linear-gradient(90deg,var(--ink) var(--p),#D9D9DE var(--p))}
.gs-rng input::-moz-range-track{height:4px;border-radius:2px;background:#D9D9DE}.gs-rng input::-moz-range-progress{height:4px;border-radius:2px;background:var(--ink)}
.gs-rng input::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7px;border-radius:50%;background:#fff;border:2px solid var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.25)}
.gs-rng input::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid var(--ink)}
.gs-btns.four .lab-ib{flex:1 1 auto;padding:0 8px;font-size:12px;min-width:auto}.gs-tint{gap:8px}.gs-tint .gs-lbl{margin:0 6px 0 0}
.gs-hist{padding:0}.gs-hist-box{position:relative;touch-action:none;user-select:none;cursor:crosshair;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:visible}
.gs-hist-box svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.gs-diag{stroke:#B9B9C0;stroke-width:1;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}
.gs-curve{fill:none;stroke:var(--ink);stroke-width:2;vector-effect:non-scaling-stroke}
.gs-cp{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;border:2px solid var(--ink);cursor:grab}.gs-cp.on{background:var(--ink)}
.gs-lvstrip{position:relative;height:14px;margin-top:2px}
.gs-lv{position:absolute;top:0;width:14px;height:14px;margin-left:-7px;cursor:ew-resize}
.gs-lv::after{content:'';position:absolute;left:1px;top:1px;width:10px;height:10px;background:var(--ink);clip-path:polygon(50% 0,100% 100%,0 100%)}
.gs-lv.hi::after{background:#fff;box-shadow:none;outline:0;border:0;clip-path:polygon(50% 0,100% 100%,0 100%);filter:drop-shadow(0 0 1px var(--ink)) drop-shadow(0 0 1px var(--ink))}
.gs-hist-info{display:flex;justify-content:space-between;gap:6px;font-size:11px;color:var(--muted);margin:2px 0 6px}
.gs-hist canvas{width:100%;height:92px;display:block}
.gs-hist div{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px}
.gs-svgbg{background:#fff;line-height:0}.gs-zin{position:absolute}.lab-gel-wrap{background:#fff}
.gs-photo{display:block;max-width:none;height:auto;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.gs-zonewrap{position:relative;line-height:0}
.gs-zsvg{position:absolute;inset:0;width:100%;height:100%;touch-action:none}.gs-zsvg.draw{cursor:crosshair}
.gs-zs{fill:rgba(255,255,255,.06);stroke:#fff;stroke-width:1.5;stroke-dasharray:5 4;vector-effect:non-scaling-stroke;cursor:move;filter:drop-shadow(0 0 1px #000)}
.gs-zs.on{stroke-width:2.5;stroke-dasharray:none}
.gs-zh{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;border:2px solid var(--ink);cursor:crosshair;touch-action:none}
.gs-ztag{position:absolute;display:grid;place-items:center;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:var(--ink);color:#fff;font:600 11px/1 inherit;pointer-events:none}
.lab-gel-body.solo{grid-template-columns:minmax(0,1fr)}
.gs-cards{min-height:0;overflow-x:hidden;overflow-y:auto}
.gs-cards-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px;align-content:start;transform-origin:0 0}
.gs-col{display:flex;flex-direction:column;gap:10px;min-width:0}
.gs-card{padding:8px 12px 10px;border:1px solid var(--line);border-radius:14px;background:#fff}
.gs-card.on{border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}
.gs-card h4{display:flex;align-items:center;gap:7px;margin:0 0 5px;font:700 13px inherit}
.gs-card-b{display:grid;gap:4px;align-content:start}
.gs-zoom{display:flex;gap:2px;align-items:center}
.lab-gel-stage{display:flex!important;place-items:unset!important}.lab-gel-stage>*{margin:auto}
.lab-gel-hint{margin:0;font-size:12px;color:var(--muted)}
.lab-gel-wrap{position:relative}
.lab-lane-h{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:var(--ink);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:ew-resize;touch-action:none}
.lab-lane-h.sq{border-radius:4px;cursor:move}.lab-lane-h.cut{background:var(--bad);border-radius:4px;cursor:move}
.lab-crop{position:relative;width:100%;user-select:none;touch-action:none;overflow:hidden;line-height:0}.lab-crop img{width:100%;display:block}
.lab-crop-box{position:absolute;outline:2px solid #fff;box-shadow:0 0 0 9999px rgba(18,19,23,.55);cursor:move}
.lab-crop-h{position:absolute;width:14px;height:14px;background:#fff;border:2px solid var(--ink);border-radius:3px;margin:-7px 0 0 -7px}
.lab-crop-h.nw{left:0;top:0;cursor:nwse-resize}.lab-crop-h.n{left:50%;top:0;cursor:ns-resize}.lab-crop-h.ne{left:100%;top:0;cursor:nesw-resize}.lab-crop-h.e{left:100%;top:50%;cursor:ew-resize}
.lab-crop-h.se{left:100%;top:100%;cursor:nwse-resize}.lab-crop-h.s{left:50%;top:100%;cursor:ns-resize}.lab-crop-h.sw{left:0;top:100%;cursor:nesw-resize}.lab-crop-h.w{left:0;top:50%;cursor:ew-resize}
.lab-row{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.lab-num{min-width:22px;text-align:center}.lab-note{font-size:12px;color:var(--muted)}
.lab-rng{display:grid;grid-template-columns:18px minmax(0,1fr) 42px;gap:6px;align-items:center;color:var(--muted)}.lab-rng input{width:100%;accent-color:var(--accent)}.lab-rng b{font-size:12px;color:var(--ink);text-align:right;font-weight:600}
.lab-item{display:flex;gap:4px;align-items:center}.lab-item .fld{flex:1}
.lab-dot{flex:none;box-sizing:border-box;aspect-ratio:1;width:24px;height:24px;min-width:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--line);cursor:pointer;padding:0}.lab-dot.on{box-shadow:0 0 0 2px var(--ink)}.lab-dot.none{background:linear-gradient(135deg,#fff 46%,var(--bad) 46% 54%,#fff 54%)}
.lab-sws{display:grid;grid-template-columns:1fr 1fr;gap:6px}.lab-sw{display:flex;align-items:center;gap:6px;font-size:12px}.lab-sw input,.lab-sw-i{width:30px;height:28px;padding:0;border:1px solid var(--line);border-radius:6px;background:#fff;cursor:pointer;flex:none}

@media(max-width:860px){
.gs-docks{border-top:1px solid var(--line);padding:6px 0 0}.gs-dock{width:auto;border-left:0;padding-left:0}
.lab-gel-back{padding:0!important;align-items:stretch}
.lab-gel-win{width:100%;height:100dvh;border-radius:0;padding:10px!important}
.lab-gel-body{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,46%);gap:8px}
.lab-gel-side{border-left:0;border-top:1px solid var(--line);padding:10px 0 0}
.lab-gel-side h3{font-size:16px}.gs-help{margin-bottom:8px}
}

/* --- box del gel v3: regole di URBIOS (carta, inchiostro, un solo accento), niente card, niente zoom dei pannelli --- */
.lab-gel-back{background:var(--paper)!important}
.lab-gel-win{background:var(--paper);padding:14px!important;box-shadow:none}
.gs-head{padding-bottom:12px;border-bottom:1px solid var(--line)}
.gs-head .fld{font-size:17px;font-weight:600;letter-spacing:-.01em}
.lab-ib{border-radius:999px;height:38px;font-size:13px}
.lab-ib.on{background:var(--accent);border-color:var(--accent);color:#fff}
.lab-ib.done{background:var(--ink);border-color:var(--ink);color:#fff}
.lab-gel-body{grid-template-columns:76px minmax(0,1fr) 380px;gap:14px;padding-top:12px}
.gs-rail{display:flex;flex-direction:column;gap:4px;overflow-y:auto;min-height:0}
.gs-tool{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:62px;border:0;border-radius:14px;background:none;color:var(--muted);font:500 11.5px inherit;cursor:pointer}
.gs-tool:hover{background:var(--soft);color:var(--ink)}.gs-tool.on{background:var(--accent);color:#fff}
.lab-gel-stage{background:#000;border-radius:16px}
.gs-side{display:flex;flex-direction:column;gap:0;min-height:0;overflow-y:auto;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:6px 16px 14px}
.gs-prop{padding:12px 0;border-bottom:1px solid var(--line)}.gs-prop:last-child{border-bottom:0}
.gs-prop h4{margin:0 0 4px;font:600 15px inherit;letter-spacing:-.01em}
.gs-help{margin:0 0 10px;font-size:12.5px;line-height:1.45;color:var(--muted)}
.gs-prop{display:grid;gap:8px;align-content:start}.gs-prop>h4,.gs-prop>.gs-help{margin:0}
.gs-hist canvas{height:200px!important}
.gs-hist-box{border-radius:10px;background:var(--soft);border-color:var(--line)}
.gs-curve{stroke:var(--accent);stroke-width:2.5}
.gs-cp{width:16px;height:16px;margin:-8px 0 0 -8px;border-color:var(--accent)}.gs-cp.on{background:var(--accent)}
.gs-lv::after{background:var(--ink)}
.gs-rng input[type=range]::-webkit-slider-runnable-track{background:linear-gradient(90deg,var(--accent) var(--p),var(--line) var(--p))}
.gs-rng input::-moz-range-progress{background:var(--accent)}
.gs-rng input::-webkit-slider-thumb{border-color:var(--accent)}.gs-rng input::-moz-range-thumb{border-color:var(--accent)}
.gs-rng-h{font-size:13px}.gs-num{border-color:var(--line)}.gs-num:focus{border-color:var(--accent)}
.gs-lbl{font-size:12px;font-weight:500;color:var(--muted)}
.lab-lane-h{background:var(--accent)}
@media(max-width:1000px){.lab-gel-body{grid-template-columns:64px minmax(0,1fr) 320px}}
@media(max-width:860px){
.lab-gel-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) minmax(0,46%)}
.gs-rail{flex-direction:row;overflow-x:auto;overflow-y:hidden}.gs-tool{width:64px;height:54px}
}

.lab-gel-body{grid-template-columns:76px minmax(0,1fr) minmax(600px,46vw)}
.gs-side{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:0 18px;align-content:start;overflow-y:auto}
.gs-side>.gs-prop{border-bottom:0}
.gs-side>.gs-prop:first-child{border-right:1px solid var(--line);padding-right:18px}
.gs-hist canvas{height:300px!important}
.gs-help{display:none}
@media(max-width:1000px){.lab-gel-body{grid-template-columns:64px minmax(0,1fr) 560px}}
@media(max-width:860px){.gs-side{grid-template-columns:minmax(0,1fr)}.gs-side>.gs-prop:first-child{border-right:0;padding-right:0}.gs-hist canvas{height:160px!important}}

/* strumenti a destra */
.lab-gel-body{grid-template-columns:minmax(0,1fr) minmax(600px,46vw) 76px}
.gs-rail{order:3}
@media(max-width:1000px){.lab-gel-body{grid-template-columns:minmax(0,1fr) 560px 64px}}
@media(max-width:860px){.lab-gel-body{grid-template-columns:minmax(0,1fr)}.gs-rail{order:0}}

/* due gruppi: Immagine e Annotazioni */
.gs-tool{height:84px;font-size:12px}
.gs-side{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 18px;padding:6px 16px 10px}
.gs-sidecol{display:flex;flex-direction:column;min-width:0}
.gs-sidecol+.gs-sidecol{border-left:1px solid var(--line);padding-left:18px}
.gs-side>.gs-prop:first-child{border-right:0;padding-right:0}
.gs-sidecol>.gs-prop{border-bottom:1px solid var(--line)}.gs-sidecol>.gs-prop:last-child{border-bottom:0}
.gs-prop.on>h4{color:var(--accent)}
.gs-hist canvas{height:210px!important}
@media(max-width:860px){.gs-side{grid-template-columns:minmax(0,1fr)}.gs-sidecol+.gs-sidecol{border-left:0;padding-left:0}.gs-hist canvas{height:150px!important}}

/* regolatori a pillola */
.gs-rng{display:grid;grid-template-columns:minmax(0,1fr) auto 26px;align-items:center;gap:8px;min-height:40px}
.gs-rng-l{font-size:13px;color:var(--ink);line-height:1.2}
.gs-pill{display:flex;align-items:center;gap:2px;height:40px;padding:0 5px;background:var(--soft);border:1px solid var(--line);border-radius:12px}
.gs-circ{display:grid;place-items:center;flex:none;width:30px;height:30px;padding:0;border:1px solid var(--line);border-radius:50%;background:var(--surface);color:var(--ink);font:500 18px/1 inherit;cursor:pointer;user-select:none;touch-action:none}
.gs-circ:hover{border-color:var(--accent);color:var(--accent)}.gs-circ:active{background:var(--accent);border-color:var(--accent);color:#fff}
.gs-pill .gs-num{width:54px;height:30px;padding:0;border:0;background:transparent;text-align:center;font:600 14px inherit;color:var(--ink);border-radius:8px}
.gs-pill .gs-num:focus{outline:none;background:var(--surface);box-shadow:0 0 0 1.5px var(--accent)}
.gs-rng .gs-mini{width:26px;height:26px}

/* schermi larghi: tutto insieme, compatto */
.gs-wide .lab-gel-body{grid-template-columns:minmax(0,1fr) clamp(920px,56vw,1180px)}
.gs-wide .gs-side{gap:0 14px;padding:4px 14px 8px}
.gs-wide .gs-sidecol+.gs-sidecol{padding-left:14px}
.gs-wide .gs-prop{padding:9px 0;gap:6px}.gs-wide .gs-prop h4{font-size:14px}
.gs-wide .gs-rng{min-height:34px;gap:6px}.gs-wide .gs-pill{height:34px}.gs-wide .gs-circ{width:26px;height:26px}.gs-wide .gs-pill .gs-num{width:48px;height:26px;font-size:13px}
.gs-wide .gs-hist canvas{height:230px!important}
.gs-wide .lab-ib{height:34px}

.gs-gh{font:600 11px inherit;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:8px 0 6px;border-bottom:1px solid var(--line);margin-bottom:2px}
.gs-wide .lab-gel-body{grid-template-columns:minmax(0,1fr) clamp(1080px,70vw,1400px)}
.gs-wide .lab-sws{grid-template-columns:minmax(0,1fr)}.gs-wide .lab-sw{justify-content:space-between}.gs-sidecol{overflow-x:hidden}
.gs-wide .gs-side{gap:0 12px;padding:2px 12px 8px;align-content:start}
.gs-wide .gs-sidecol+.gs-sidecol{padding-left:12px}
.gs-wide .gs-pill{padding:0 3px}.gs-wide .gs-circ{width:24px;height:24px;font-size:16px}.gs-wide .gs-pill .gs-num{width:40px;font-size:13px}
.gs-wide .gs-rng{grid-template-columns:minmax(0,1fr) auto 24px;gap:4px}.gs-wide .gs-rng .gs-mini{width:22px;height:22px}

/* niente beige nel box del gel: bianco e grigi neutri */
.lab-gel-back,.lab-gel-win{--paper:#fff;--surface:#fff;--soft:#F3F3F5;--line:#E3E3E8}
.lab-gel-back{background:#000!important}
.lab-gel-win{background:#fff!important}
.gs-side{background:#fff}

/* regolatori in una riga: etichetta | pillola compatta | ripristino */
.gs-wide .gs-rng{display:grid;grid-template-columns:minmax(0,1fr) 100px 18px;grid-template-areas:"l p r";align-items:center;gap:4px;min-height:32px;padding:1px 0}
.gs-wide .gs-rng-l{grid-area:l;font-size:12px;line-height:1.15;color:var(--ink);white-space:normal;}
.gs-wide .gs-rng .gs-mini{grid-area:r;width:18px;height:18px}
.gs-wide .gs-rng .gs-pill{grid-area:p;height:28px;padding:0 2px;gap:0;justify-content:space-between;border-radius:14px}
.gs-wide .gs-circ{width:22px;height:22px;font-size:15px}
.gs-wide .gs-pill .gs-num{flex:1;min-width:0;width:auto;height:22px;font-size:12.5px}
.gs-wide .gs-btns .lab-ib{flex:1 1 auto;justify-content:center}
.gs-wide .gs-prop{container-type:inline-size}
@container (max-width:200px){.gs-wide .gs-rng{grid-template-columns:minmax(0,1fr) 18px;grid-template-areas:"l r" "p p";row-gap:1px;padding:1px 0}.gs-wide .gs-rng .gs-pill{width:100%}}
.lab-qty{display:flex;gap:6px;align-items:center}.lab-qty .fld{flex:1;min-width:0;text-align:center}.lab-hintline{display:block;margin-top:4px;font-size:12px;color:var(--muted)}
.lab-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:12.5px}.lab-log li{display:flex;gap:12px;color:var(--ink)}.lab-log li span:first-child{flex:none;width:76px;color:var(--muted)}
.lab-imp{width:min(820px,100%)}.lab-imp-sec{padding:14px 4px 4px;border-top:1px solid var(--line)}.lab-imp-sec:first-of-type{border-top:0}.lab-imp-sec h3{margin:0 0 6px;font-size:14px;font-weight:600}.lab-imp-sec p{margin:0 0 8px;font-size:13px;line-height:1.5}
.lab-imp-note{color:var(--muted)}.lab-imp-bad{color:var(--bad);font-weight:600}.lab-imp-file{margin-left:10px;font-size:13px;color:var(--muted)}
.lab-imp-chips,.lab-imp-cols{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.lab-imp-chip,.lab-imp-col{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-size:12.5px}.lab-imp-chip.req{font-weight:600;border-color:var(--ink)}
.lab-imp-chip.ok,.lab-imp-col.ok{background:color-mix(in srgb,var(--ok) 14%,#fff);border-color:var(--ok);color:var(--ink)}.lab-imp-chip.off,.lab-imp-col.off{color:var(--muted);background:var(--soft)}.lab-imp-col i{font-style:normal;color:var(--muted);margin-left:4px}
.lab-imp-sum{font-size:13px;margin-bottom:8px}.lab-imp-tbl{overflow:auto;border:1px solid var(--line);border-radius:10px}.lab-imp-tbl table{border-collapse:collapse;width:100%;font-size:12.5px}.lab-imp-tbl th,.lab-imp-tbl td{padding:6px 10px;text-align:left;white-space:nowrap;border-bottom:1px solid var(--line)}.lab-imp-tbl th{background:var(--soft);font-weight:600}.lab-imp-tbl tr:last-child td{border-bottom:0}
.lab-imp-tbl td.chg{background:color-mix(in srgb,var(--warn) 22%,#fff);font-weight:600}.lab-imp-st{font-weight:600}.lab-imp-st.nuovo{color:var(--ok)}.lab-imp-st.aggiornato{color:var(--warn)}.lab-imp-st.uguale{color:var(--muted)}
.lab-imp-foot{display:flex;justify-content:flex-end;gap:8px;padding-top:16px}
.xl{border:1px solid #C9CCD1;border-radius:6px;background:#fff;overflow:hidden;font-family:Calibri,'Segoe UI',Arial,sans-serif}.xl-scroll{overflow:auto;max-height:340px}
.xl table{border-collapse:separate;border-spacing:0;font-size:12.5px;color:#1f2328}.xl th,.xl td{border-right:1px solid #E1E3E6;border-bottom:1px solid #E1E3E6;padding:3px 8px;white-space:nowrap;text-align:left;height:22px;max-width:190px;overflow:hidden;text-overflow:ellipsis}
.xl .xl-let,.xl .xl-corner,.xl .xl-num{background:#F3F4F6;color:#5B6169;font-weight:500;text-align:center;font-size:11.5px}.xl .xl-let{position:sticky;top:0;z-index:2;min-width:84px}.xl .xl-corner{position:sticky;top:0;left:0;z-index:3;min-width:34px}.xl .xl-num{position:sticky;left:0;z-index:1;min-width:34px;border-left:3px solid transparent}
.xl-head{font-weight:700;background:#fff}.xl-head.ok{background:color-mix(in srgb,var(--ok) 20%,#fff);box-shadow:inset 0 -2px 0 var(--ok)}.xl-head.off{background:#EEEFF1;color:#8A9099;text-decoration:line-through;text-decoration-color:#B5BAC1}.xl-head.req{box-shadow:inset 0 -2px 0 var(--ink)}
.xl td.chg{background:color-mix(in srgb,var(--warn) 26%,#fff);font-weight:600}.xl tr.xl-r-nuovo .xl-num{border-left-color:var(--ok)}.xl tr.xl-r-aggiornato .xl-num{border-left-color:var(--warn)}.xl tr.xl-r-saltata td{color:#9AA0A8;background:#FAFAFA}
.xl-tabs{display:flex;background:#F3F4F6;border-top:1px solid #C9CCD1;padding:0 8px}.xl-tabs span{padding:4px 14px;font-size:12px;font-weight:600;background:#fff;border:1px solid #C9CCD1;border-top:0;margin-bottom:-1px;color:#217346}
.lab-imp-leg{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px;font-size:12px;color:var(--muted)}.lab-imp-leg span{display:inline-flex;align-items:center;gap:6px}.lab-imp-leg i{display:inline-block;width:14px;height:10px;border-radius:2px}.lab-imp-leg i.k.ok{background:color-mix(in srgb,var(--ok) 30%,#fff);box-shadow:inset 0 -2px 0 var(--ok)}.lab-imp-leg i.k.off{background:#EEEFF1}.lab-imp-leg i.k.chg{background:color-mix(in srgb,var(--warn) 30%,#fff)}.lab-imp-leg i.b{width:3px;height:12px;border-radius:0}.lab-imp-leg i.b.nuovo{background:var(--ok)}.lab-imp-leg i.b.aggiornato{background:var(--warn)}
.lab-imp{width:min(1180px,96vw)}.lab-imp .lab-imp-sec p{font-size:14px}.xl-scroll{max-height:420px}.xl table{font-size:14px}.xl th,.xl td{height:32px;padding:4px 12px;max-width:240px}.xl .xl-let{min-width:120px;font-size:12.5px}.xl .xl-num{font-size:12.5px;min-width:42px}.xl-tabs span{font-size:13px;padding:6px 18px}.lab-imp-leg{font-size:13px}
.lab-imp{background:var(--surface);border:1px solid var(--line);box-shadow:0 24px 64px rgba(18,19,23,.28);padding:0 24px 22px}.lab-imp .lab-pane-title{font-size:19px;font-weight:700;letter-spacing:-.01em}
.lab-imp-sec{border-top:0;padding:18px 0 0}.lab-imp-sec h3{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 8px}.lab-imp .lab-imp-sec p{font-size:14px;margin:0 0 12px;line-height:1.45}.lab-imp .lab-imp-note{font-size:12.5px;color:var(--muted);margin:10px 0 0}
.xl{border:1px solid var(--ink);border-radius:8px;box-shadow:0 1px 0 var(--line)}.xl table{font-size:13.5px;color:var(--ink)}.xl th,.xl td{height:30px;padding:3px 10px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.xl .xl-let,.xl .xl-corner,.xl .xl-num{background:var(--soft);color:var(--muted);font-weight:600}.xl .xl-let{min-width:98px}.xl-head{background:var(--soft)}
.xl-tabs{background:var(--soft);border-top:1px solid var(--line)}.xl-tabs span{background:var(--surface);color:var(--ink);border-color:var(--line);box-shadow:inset 0 -2px 0 var(--ok)}
.lab-imp-foot{border-top:1px solid var(--line);margin-top:18px;padding-top:16px}
.xl table{width:100%}.lab-imp .lab-pane-head{background:transparent;border-bottom:1px solid var(--line);padding-bottom:14px}
.xl tr.xl-r-nuovo td{background:color-mix(in srgb,var(--ok) 12%,var(--surface))}.lab-imp-leg i.k.nuovo{background:color-mix(in srgb,var(--ok) 22%,var(--surface))}
.lab-imp .xl+.lab-imp-note,.lab-imp .xl + p{margin-top:16px}

/* barra del quaderno in colonna stretta: scelta «Tutto / Solo questa pagina» su una riga, strumenti sotto */
.lab-pagescol{container-type:inline-size}
@container (max-width:690px){.lab-pagescol .pc-embedded .pc-top .seg{flex:1 1 100%;margin-right:0;display:flex}.lab-pagescol .pc-embedded .pc-top .seg button{flex:1}.lab-pagescol .pc-embedded .pc-top{justify-content:flex-end}}

/* modulo accanto all'elenco e al quaderno: colonna stretta, un campo per riga */
@container (max-width:560px){.lab-form{grid-template-columns:minmax(0,1fr)}.lab-pane{padding:0 16px 40px}.lab-card{padding:14px}}

.lab-conv-in{display:grid;grid-template-columns:1fr 110px;gap:8px;margin-top:10px}.lab-conv-pm{margin-top:8px;width:100%}
.lab-conv-g{margin-top:14px}.lab-conv-g small{display:block;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.lab-conv-rows{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.lab-conv-rows div{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:12px;background:var(--soft);font-size:13px}.lab-conv-rows b{font-size:15px;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis}.lab-conv-rows span{color:var(--muted);white-space:nowrap}
.lab-conv-rows .is-in{background:var(--ink);color:#fff}.lab-conv-rows .is-in span{color:rgba(255,255,255,.7)}
.lab-conv-g p{margin:0;font-size:13px;color:var(--muted)}
@media (max-width:639px){.lab-calc{grid-template-columns:1fr}.lab-conv-in .fld,.lab-conv-pm{font-size:16px;min-height:50px}.lab-conv-rows{grid-template-columns:1fr 1fr}}

/* risultato a riquadro (diluizione): stesso stile della scheda Grammi, in chiaro su desktop */
.lab-calc .gr-box{display:flex;flex-direction:column;gap:12px;margin-top:10px}
.lab-calc .gr-f>span{display:block;margin-bottom:4px;font-size:12.5px;color:var(--muted)}.lab-calc .gr-f>div{display:flex;gap:8px}.lab-calc .gr-f .fld{flex:1;min-width:0}.lab-calc .gr-f select.fld{flex:0 0 92px}
.lab-calc .gr-res{margin-top:14px;padding:18px;border-radius:16px;background:var(--soft);text-align:center}.lab-calc .gr-res small{display:block;font-size:13px;color:var(--muted)}.lab-calc .gr-res strong{display:block;margin:4px 0 12px;font-size:34px;font-weight:700;letter-spacing:-.02em}.lab-calc .gr-res>p{margin:0}
.lab-calc .gr-res h4{margin:12px 0 6px;text-align:left;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.lab-calc .gr-all{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}.lab-calc .gr-all div{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:12px;background:var(--surface);text-align:left}.lab-calc .gr-all b{font-size:14.5px}.lab-calc .gr-all span{font-size:12.5px;color:var(--muted)}
.lab-gel-emb{position:absolute;inset:0;display:flex}.lab-gel-emb .lab-gel-back{position:static;flex:1;display:flex;min-width:0;background:#fff!important}.lab-gel-emb .lab-gel-win{height:100%;box-shadow:none;padding:10px!important}
.lab-gel-emb .lab-gel-body{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr) minmax(0,42%)!important;gap:8px;padding-top:8px}
.lab-gel-emb .gs-rail{order:0;flex-direction:row;overflow-x:auto;overflow-y:hidden;gap:4px}.lab-gel-emb .gs-tool{width:auto;min-width:64px;height:44px;flex:none;flex-direction:row;gap:6px;padding:0 12px}
.lab-gel-emb .lab-gel-main{order:1;min-height:0}.lab-gel-emb .gs-side{order:2;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))!important;gap:0 16px;padding:4px 14px 10px}
.lab-gel-emb .gs-sidecol+.gs-sidecol{border-left:0;padding-left:0}
.lab-gel-emb .gs-head{flex-wrap:wrap;row-gap:6px}.lab-gel-emb .gs-head .fld{flex:1 1 160px}
.lab-gel-emb .lab-gel-body{grid-template-rows:auto minmax(0,1fr) minmax(0,48%)!important;gap:6px}
.lab-gel-emb .lab-ib{height:26px!important;min-width:26px!important;padding:0 9px!important;font-size:12px!important;border-radius:13px!important;gap:5px}.lab-gel-emb .lab-ib svg{width:14px;height:14px}
.lab-gel-emb .lab-ib.done{padding:0 12px!important}
.lab-gel-emb .gs-head .fld,.lab-gel-emb .fld{height:28px!important;font-size:12.5px!important;padding:0 8px!important;border-radius:8px}
.lab-gel-emb .gs-tool{height:30px;min-width:0;padding:0 11px;font-size:12px;border-radius:15px}.lab-gel-emb .gs-tool svg{width:14px;height:14px}
.lab-gel-emb .gs-side{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:0 14px;padding:2px 12px 6px;border-radius:12px}
.lab-gel-emb .gs-prop{padding:7px 0;gap:5px}.lab-gel-emb .gs-prop h4{font-size:12.5px}.lab-gel-emb .gs-help,.lab-gel-emb .gs-lbl,.lab-gel-emb .gs-rng-h,.lab-gel-emb .lab-sw{font-size:11.5px}
.lab-gel-emb .gs-btns{gap:4px}.lab-gel-emb .gs-mini{width:20px!important;height:20px!important;min-width:0!important;padding:0!important;border-radius:6px}.lab-gel-emb .gs-num{width:38px;height:20px!important;font-size:11.5px!important}.lab-gel-emb .gs-rng-v{gap:2px;padding:1px!important}
.lab-gel-emb .gs-rng input[type=range]{height:14px}.lab-gel-emb .gs-rng input::-webkit-slider-thumb{width:13px;height:13px;margin-top:-5px}
.lab-gel-emb .lab-chip{height:24px;padding:0 10px;font-size:11.5px}.lab-gel-emb .lab-sw input,.lab-gel-emb .lab-sw-i{width:22px;height:20px}.lab-gel-emb .lab-dot{width:18px;height:18px}
.lab-gel-emb .lab-gel-win{padding:8px!important}.lab-gel-emb .gs-head{padding-bottom:6px}
.lab-gel-emb .gs-side{display:block!important;column-width:196px;column-gap:12px;column-fill:auto;overflow:hidden!important;padding:4px 10px!important}
.lab-gel-emb .gs-sidecol{display:contents}
.lab-gel-emb .gs-prop{break-inside:avoid;padding:6px 0!important;border-bottom:1px solid var(--line)!important;margin:0}
.lab-gel-emb .gs-prop:last-child{border-bottom:1px solid var(--line)!important}
.lab-gel-emb .gs-rng{gap:0}.lab-gel-emb .gs-rng-h{gap:6px;min-height:24px}.lab-gel-emb .gs-rng-h>span:first-child,.lab-gel-emb .gs-rng-h>label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lab-gel-emb .gs-hist canvas{height:70px!important}
.lab-gel-emb .lab-gel-body{grid-template-rows:auto minmax(0,1fr) minmax(0,50%)!important}
.lab-gel-emb .lab-gel-body{grid-template-rows:auto minmax(0,1fr) minmax(0,58%)!important}
.lab-gel-emb .gs-side{column-width:180px;column-gap:10px}
.lab-gel-emb .gs-prop{padding:4px 0!important;gap:3px!important}.lab-gel-emb .gs-rng-h{min-height:22px}.lab-gel-emb .gs-hist canvas{height:54px!important}
.lab-gel-emb .gs-help{display:none}
`;
