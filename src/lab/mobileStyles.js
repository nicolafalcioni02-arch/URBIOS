// Stili del Laboratorio per iPhone (classi m-*): solo token di index.css, tasti da almeno 44px, zona del pollice in basso.
export const mobileStyles = `
.m-swipe{position:relative;height:100%;touch-action:pan-y pinch-zoom}
.lab-ws.phone{display:block;height:100%;background:radial-gradient(52vmax 44vmax at 92% -8%,rgba(225,234,76,.85),transparent 64%),radial-gradient(46vmax 42vmax at -10% 30%,rgba(226,222,248,.8),transparent 62%),radial-gradient(50vmax 40vmax at 72% 110%,rgba(252,234,222,.9),transparent 62%),radial-gradient(32vmax 28vmax at 16% 100%,rgba(225,234,76,.35),transparent 62%),linear-gradient(160deg,#F7F4EC 0%,#F1EEE8 55%,#F7F2EC 100%) fixed}
.phone .m-screen{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background:transparent;color:var(--ink)}
.m-bar,.m-home-head{display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;background:transparent;border-bottom:1px solid var(--line)}
.m-bar h1,.m-home-head h1{flex:1;min-width:0;margin:0;font-size:20px;font-weight:600;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m-home-head{border-bottom:0;padding-left:18px}
.m-bar-r{min-width:44px;display:flex;justify-content:flex-end}
.m-gpill{flex:none;height:40px;padding:0 16px;font-size:14.5px;font-weight:600;white-space:nowrap}
.m-gbtn{width:44px;height:44px;flex:none}.m-dark .m-gbtn{--lg-glass:rgba(255,255,255,.16);--lg-glass-active:rgba(255,255,255,.28);--lg-foreground:#fff;color:#fff}.m-gbtn.on{--lg-glass:rgba(118,118,128,.28)}.m-dock .m-gbtn{width:52px;height:52px}.m-ib{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:999px;color:var(--ink)}
.m-ib:active{background:var(--soft)}.m-ib:disabled{opacity:.3}
.m-scroll{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px calc(104px + env(safe-area-inset-bottom))}
.m-search{position:relative;display:block;margin-bottom:12px}
.m-search .lab-svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.m-search input{width:100%;height:48px;padding:0 14px 0 42px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);font-size:16px;color:var(--ink);outline:none}
.m-search input:focus{border-color:var(--ink)}
.m-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.m-tile{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:6px;min-height:118px;padding:16px;border-radius:18px;background:var(--surface);border:1px solid var(--line);text-align:left;color:var(--ink);transition:transform .12s}
.m-tile:active{transform:scale(.97);background:var(--soft)}
.m-tile b{font-size:16px;font-weight:600;margin-top:auto}
.m-tile small{font-size:13px;color:var(--muted);margin-top:-4px}
.m-alert{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:12px 14px;margin-bottom:12px;border-radius:16px;background:var(--surface);border:1px solid var(--warn);text-align:left;color:var(--ink)}
.m-alert span:nth-child(2){flex:1}.m-alert b{display:block;font-size:15px;font-weight:600}.m-alert small{font-size:12.5px;color:var(--muted)}
.m-dot{width:10px;height:10px;border-radius:50%;background:var(--warn);flex:none}
.m-link{display:block;margin:18px auto 0;min-height:44px;padding:0 12px;font-size:14px;color:var(--muted);text-decoration:underline}
.m-list{display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:var(--surface);border:1px solid var(--line)}
.m-row{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:10px 14px;text-align:left;color:var(--ink);border-bottom:1px solid var(--line)}
.m-row:last-child{border-bottom:0}.m-row:active{background:var(--soft)}
.m-row>.lab-svg{color:var(--muted);flex:none}
.m-row-t{flex:1;min-width:0}.m-row-t b{display:block;font-size:15.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m-row-t small{display:block;margin-top:2px;font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m-ico{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:12px;background:var(--soft)}
.m-pill{flex:none;max-width:40%;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;background:var(--soft);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m-pill.ok{color:var(--ok)}.m-pill.warn{color:var(--warn)}.m-pill.bad{color:var(--bad)}
.m-chips{display:flex;gap:8px;overflow-x:auto;margin:0 -16px 12px;padding:0 16px;scrollbar-width:none}.m-chips::-webkit-scrollbar{display:none}
.m-chips button{flex:none;height:40px;padding:0 16px;border-radius:999px;background:var(--surface);border:1px solid var(--line);font-size:14px;font-weight:500;color:var(--muted)}
.m-chips button.on{background:var(--ink);border-color:var(--ink);color:#fff}
.m-none{margin:28px 8px;text-align:center;font-size:14px;color:var(--muted)}
.m-fab{position:absolute;right:18px;bottom:calc(20px + env(safe-area-inset-bottom));width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;box-shadow:0 8px 22px rgba(18,19,23,.28)}
.m-fab:active{transform:scale(.94)}
.m-screen .calc,.m-screen .lab-page{padding:0}
/* scheda a tutto schermo: titolo e tasti compatti, campi grandi (16px evita lo zoom di Safari) */
.m-edit .lab-pane{flex:1;height:auto;min-height:0;padding:0 14px calc(40px + env(safe-area-inset-bottom));max-width:none}
.m-edit .lab-pane-head{position:static;padding:12px 0;margin-bottom:12px;border-bottom:0;flex-wrap:nowrap}
.m-edit .lab-pane-head>div:first-child{display:none}
.m-edit .lab-pane-actions{width:100%;justify-content:flex-end}
.m-edit .lab-saved{margin-right:auto;font-size:13px}
.m-edit .lab-pane-actions .lab-btn{width:44px;height:44px;padding:0}
.m-edit .lab-form{grid-template-columns:1fr}
.m-edit .fld,.m-edit input,.m-edit select,.m-edit textarea{font-size:16px}
.m-edit .fld{min-height:46px}
.m-edit .lab-chip,.m-edit .lab-opts .lab-chip{height:44px}
.m-edit .lab-add{height:44px}.m-edit .lab-x{width:44px;height:44px}.m-edit .lab-ib{min-width:44px;height:44px}
.m-edit .lab-card{padding:14px;border-radius:16px}
/* home a icone + dock in basso */
.m-home{padding-top:calc(18px + env(safe-area-inset-top));padding-bottom:calc(110px + env(safe-area-inset-bottom))}
.m-hello{margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:-.03em}
.m-sum{display:flex;gap:10px;margin-bottom:22px}
.m-sum button{flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:64px;padding:12px 14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);text-align:left;color:var(--ink)}
.m-sum b{font-size:24px;font-weight:700;line-height:1}.m-sum span{font-size:12.5px;color:var(--muted)}
.m-apps{display:grid;grid-template-columns:repeat(3,1fr);gap:22px 8px}
.m-app{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink);min-height:44px}
.m-app-i{position:relative;width:76px;height:76px;border-radius:22px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);box-shadow:0 2px 6px rgba(18,19,23,.07);transition:transform .12s}
.m-app:active .m-app-i{transform:scale(.92);background:var(--soft)}
.m-app-i i{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--warn);color:#fff;font-size:12px;font-weight:600;line-height:22px;font-style:normal;text-align:center}
.m-app-l{font-size:13px;font-weight:500}
.m-dock{position:absolute;left:14px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-between;gap:6px;padding:8px 10px;border-radius:32px;background:rgba(255,255,255,.55);-webkit-backdrop-filter:saturate(1.6) blur(22px);backdrop-filter:saturate(1.6) blur(22px);border:1px solid rgba(255,255,255,.7);box-shadow:0 10px 30px rgba(18,19,23,.16)}
.m-dock button{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;color:var(--ink)}
.m-dock button:active,.m-dock button.on{background:var(--soft)}
.m-dock .m-dock-main{background:var(--ink);color:#fff}.m-dock .m-dock-main:active{background:var(--ink);transform:scale(.94)}
/* scheda: comandi in basso, vicino al pollice */
.m-done{position:fixed;left:14px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:6;height:56px;padding:0 28px;border-radius:28px;background:var(--ink);color:#fff;font-size:16px;font-weight:600;box-shadow:0 10px 30px rgba(18,19,23,.25)}
.m-edit .lab-pane-head{position:fixed;left:120px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:6;width:auto;margin:0;padding:0;background:transparent;pointer-events:none}
.m-edit .lab-pane-actions{pointer-events:auto;justify-content:flex-end;gap:8px}
.m-edit .lab-saved{position:fixed;top:calc(20px + env(safe-area-inset-top));right:16px;margin:0}
.m-edit .lab-pane-actions .lab-btn{width:56px;height:56px;border-radius:50%;box-shadow:0 6px 18px rgba(18,19,23,.16)}
.m-edit .lab-pane{padding-top:12px;padding-bottom:calc(100px + env(safe-area-inset-bottom))}

.phone .m-screen{animation:m-in .22s cubic-bezier(.2,.8,.2,1)}
@keyframes m-in{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.phone .m-screen{animation:none}}
.m-dot.bad{background:var(--bad)}.m-dot.warn{background:var(--warn)}
.m-todo{margin-bottom:24px}.m-todo .m-row{min-height:60px}
.m-dock button:disabled{opacity:.3}
.m-chips{margin-top:-6px}
.lab-acc-h{width:100%;min-height:52px;margin:0!important;text-align:left;color:var(--ink)}
.lab-acc-t{flex:1;font-weight:600}.lab-acc-h small{color:var(--muted);font-size:12.5px;font-weight:500}.lab-acc-h .lab-svg{color:var(--muted)}
.lab-card.acc{padding:4px 14px}.lab-card.acc:not(.shut){padding-bottom:16px}.lab-card.acc:not(.shut) .lab-acc-h{margin-bottom:6px!important}

/* compilazione: un campo per riga, grandi, con aria */
.m-edit .lab-form{gap:20px}
.m-edit .fld-label{font-size:13.5px;margin-bottom:8px}
.m-edit .fld{min-height:52px;border-radius:14px;padding-left:14px;padding-right:14px}
.m-edit textarea.fld{min-height:112px!important;line-height:1.45;padding-top:13px!important}
.m-edit select.fld{background-position:right 14px center}
.m-edit .lab-opts{gap:8px}.m-edit .lab-opts .lab-chip{flex:1 1 auto;height:48px;font-size:15px}
.m-edit .lab-card.acc{padding:2px 14px}.m-edit .lab-acc-h{min-height:60px}
.lab-next{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;margin-top:20px;border-radius:14px;background:var(--soft);color:var(--ink);font-size:15px;font-weight:600}
.lab-next:active{background:var(--line)}
/* tabelle (materiali…): ogni riga è una piccola scheda, quantità e unità affiancate */
.m-edit .lab-rows .lab-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px;padding-top:16px;position:relative;border-radius:14px}
.m-edit .lab-row .lab-cell{grid-column:1/-1}
.m-edit .lab-row .lab-cell:nth-child(2),.m-edit .lab-row .lab-cell:nth-child(3){grid-column:auto}
.m-edit .lab-row .lab-cell:first-child{padding-right:40px}
.m-edit .lab-row .fld{height:52px}
.m-edit .lab-row>.lab-x{position:absolute;top:6px;right:6px;width:44px;height:44px}
.m-edit .lab-add{width:100%;justify-content:center;height:52px;border-radius:14px;font-size:15px}
/* passaggi: numero, testo, tempo sotto */
.m-edit .lab-step{grid-template-columns:30px minmax(0,1fr) 44px;gap:8px 6px;padding:12px 8px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
.m-edit .lab-step>span{padding-top:14px}
.m-edit .lab-step textarea{grid-column:2;min-height:84px!important}
.m-edit .lab-step>input{grid-column:2;height:48px!important}
.m-edit .lab-step>.lab-x{grid-column:3;grid-row:1;width:44px;height:44px}
.m-edit .lab-qty .lab-ib{width:56px;height:52px;font-size:22px}
/* tastiera aperta: via i tasti fissi */

/* ricerca: sale dal basso sopra il dock */
.m-search-up{position:absolute;left:14px;right:14px;bottom:calc(92px + env(safe-area-inset-bottom));margin:0;z-index:5;animation:m-up .26s cubic-bezier(.2,.9,.25,1.05)}
.m-search-up input{background:rgba(255,255,255,.7);-webkit-backdrop-filter:saturate(1.6) blur(22px);backdrop-filter:saturate(1.6) blur(22px);height:54px;border-radius:27px;box-shadow:0 10px 30px rgba(18,19,23,.16);border-color:var(--ink)}
@keyframes m-up{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}
.m-dock{animation:none}
.m-dock .m-dock-wide{flex:1;width:auto;border-radius:28px;gap:8px;background:var(--ink);color:#fff;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center}
/* scheda: barra fissa a pillola, sempre visibile */
.m-edit::after{content:'';position:absolute;left:14px;right:14px;bottom:calc(12px + env(safe-area-inset-bottom));height:72px;border-radius:36px;background:rgba(255,255,255,.55);-webkit-backdrop-filter:saturate(1.6) blur(22px);backdrop-filter:saturate(1.6) blur(22px);border:1px solid rgba(255,255,255,.7);box-shadow:0 10px 30px rgba(18,19,23,.16);z-index:5;pointer-events:none}
.m-edit .m-done{left:22px;bottom:calc(20px + env(safe-area-inset-bottom));height:56px;z-index:7;box-shadow:none}
.m-edit .lab-pane-head{left:130px;right:22px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:7}
.m-edit .lab-pane-actions .lab-btn{box-shadow:none;background:var(--soft);border:0}
.m-edit .lab-pane{padding-bottom:calc(120px + env(safe-area-inset-bottom))}
.m-edit .m-scroll{padding-bottom:calc(120px + env(safe-area-inset-bottom))}
/* campi ben visibili */
.m-edit .lab-card{background:var(--surface)}
.m-edit .lab-pane .fld,.m-edit .fld{background:#F2F2F5;border:1.5px solid #8C8C96;box-shadow:none;color:var(--ink)}
.m-edit .lab-pane .fld:focus,.m-edit .fld:focus{background:#fff;border-color:var(--ink);box-shadow:0 0 0 3px rgba(18,19,23,.12)}
.m-edit .lab-opts .lab-chip{background:#F2F2F5;border:1.5px solid #8C8C96}.m-edit .lab-opts .lab-chip.on{background:var(--ink);border-color:var(--ink)}
.m-edit .lab-row{background:#FBFBFC}.m-edit .lab-cell-l{font-size:12.5px;color:var(--ink);font-weight:600}
/* ricetta (sola lettura) */
.m-recipe h2{margin:6px 0 4px;font-size:26px;font-weight:700;letter-spacing:-.02em}
.m-recipe h3{margin:22px 4px 8px;font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.m-sub{margin:0 0 16px;font-size:14px;color:var(--muted)}
.m-vol{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);font-size:14px;font-weight:600}
.m-vol div{display:flex;align-items:center;gap:8px}.m-vol input{width:96px;height:48px;text-align:center;border-radius:12px;border:1.5px solid #8C8C96;background:#F2F2F5;font-size:20px;font-weight:700;color:var(--ink)}
.m-check{align-items:flex-start;padding-top:14px;padding-bottom:14px}.m-wrap b{white-space:normal;font-weight:500;line-height:1.4}
.m-box{min-height:0;position:relative;width:28px;height:28px;flex:none;align-self:center;display:grid;place-items:center;border-radius:50%;border:1.5px solid #8C8C96;font-size:13px;font-weight:600;color:var(--muted)}.m-box em{font-style:normal}.m-box::after,.m-cond-i::after,.wk-color::after,.lab-mic::after{content:'';position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%)}
.m-check.on{background:var(--soft)}.m-check.on .m-box{background:var(--ink);border-color:var(--ink);color:#fff}.m-check.on .m-row-t b{text-decoration:line-through;color:var(--muted)}
.m-qty{flex:none;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums}
.m-note{margin-top:16px;padding:12px 14px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}.m-note small{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}.m-note p{margin:4px 0 0;font-size:15px;line-height:1.45;white-space:pre-wrap}

/* calcolatrice */
.phone .m-calc{background:var(--ink);color:#fff}
.m-calc .m-bar{background:transparent;border-bottom:0}.m-calc .m-ib{color:#fff}.m-calc .m-ib:active{background:rgba(255,255,255,.14)}
.m-calc-out{flex:1;min-height:0;display:flex;align-items:flex-end;justify-content:flex-end;padding:0 24px 14px;font-size:84px;font-weight:300;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden}
.m-calc-out.s{font-size:64px}.m-calc-out.xs{font-size:46px}
.m-calc-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 16px calc(100px + env(safe-area-inset-bottom))}
.m-ck{height:calc((100vw - 76px) / 4);max-height:76px;border-radius:999px;background:#3A3A40;color:#fff;font-size:32px;font-weight:400;display:grid;place-items:center;transition:filter .1s}
.m-ck:active{filter:brightness(1.5)}
.m-ck.fn{background:#B9B9C0;color:var(--ink)}
.m-ck.op{background:var(--accent);color:#fff;font-size:38px}.m-ck.op.on{background:#fff;color:var(--accent)}
.m-ck.zero{grid-column:span 2;border-radius:999px;justify-content:start;padding-left:34px;width:100%;display:flex;align-items:center}

.m-hello-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.m-hello-row .m-hello{margin:0}
.m-calc-expr{padding:0 24px;min-height:28px;text-align:right;font-size:20px;color:rgba(255,255,255,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:rtl}
.m-calc .m-calc-out{flex:0 0 auto;padding-bottom:18px}.m-calc .m-bar{margin-bottom:auto}
.m-calc .m-ib.on{background:rgba(255,255,255,.18)}
.m-hist{flex:1;min-height:0;overflow-y:auto;padding:8px 20px 20px;display:flex;flex-direction:column}
.m-hist p{margin:40px 0;text-align:center;color:rgba(255,255,255,.55)}
.m-hist button{display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-height:64px;padding:10px 4px;border-bottom:1px solid rgba(255,255,255,.12);color:#fff;text-align:right}
.m-hist small{font-size:15px;color:rgba(255,255,255,.55)}.m-hist b{font-size:30px;font-weight:400;font-variant-numeric:tabular-nums}
.m-hist .m-hist-clear{align-items:center;justify-content:center;border:0;margin-top:12px;color:rgba(255,255,255,.7);font-size:15px}

/* barra fissa in basso: indietro · URBIOS · impostazioni */
.m-dock{z-index:20;justify-content:space-between}
.m-dock-brand{flex:1;display:grid;place-items:center;color:var(--ink);pointer-events:none}
.m-dark .m-dock{background:rgba(40,40,46,.55);border-color:rgba(255,255,255,.14)}.m-dark .m-dock button,.m-dark .m-dock-brand{color:#fff}
.m-bar{padding-left:18px}
.m-hello-btns{display:flex;gap:4px}
.m-ib.on{background:var(--soft)}.m-ib-fill{background:var(--ink);color:#fff}.m-ib-fill:active{background:var(--ink);transform:scale(.94)}
.m-pillbtn{height:40px;padding:0 18px;border-radius:20px;background:var(--ink);color:#fff;font-size:14.5px;font-weight:600}
.m-search-up{z-index:19}
.m-scroll,.m-edit .lab-pane{padding-bottom:calc(112px + env(safe-area-inset-bottom))!important}
.m-home{padding-bottom:calc(112px + env(safe-area-inset-bottom))!important}
/* scheda: stampa ed elimina in alto a destra (il salvataggio è automatico, indietro = fatto) */
.m-edit::after{display:none}
.m-edit .lab-pane-head{top:calc(8px + env(safe-area-inset-top));bottom:auto;left:auto;right:10px;z-index:8}
.m-edit .lab-pane-actions .lab-btn{width:44px;height:44px;background:var(--soft)}
.m-edit .lab-saved{top:calc(22px + env(safe-area-inset-top));right:160px;font-size:12px}
.m-calc .m-bar{justify-content:flex-end}

/* calcolatrice con strumenti: Calcola · Converti · Diluizione · Molare */
.m-calc .m-bar{justify-content:space-between;gap:8px;padding-right:10px}
.m-modes{flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.m-modes::-webkit-scrollbar{display:none}
.m-modes button{flex:none;height:40px;padding:0 14px;border-radius:20px;color:rgba(255,255,255,.65);font-size:14.5px;font-weight:500;background:rgba(255,255,255,.08)}
.m-modes button.on{background:#fff;color:var(--ink)}
.m-tools{flex:1;min-height:0;overflow-y:auto;padding:12px 16px calc(112px + env(safe-area-inset-bottom))}
.m-calc .lab-calc{display:block}
.m-calc .lab-calc section,.m-calc .lab-calc-sec,.m-tools section{background:#26262B;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px;margin-bottom:12px;color:#fff}
.m-tools h3{color:#fff;font-size:17px}.m-tools p,.m-tools .fld-label,.m-tools small{color:rgba(255,255,255,.65)}
.lab-ws .m-tools .fld,.lab-ws .m-tools .fld:not(:placeholder-shown):not(:focus){background:#3A3A40;border:1.5px solid #5A5A62;color:#fff;min-height:50px;font-size:16px}.lab-ws .m-tools .fld:focus{border-color:#fff;background:#44444b;box-shadow:none}
.m-tools .fld::placeholder{color:rgba(255,255,255,.4)}.m-tools select.fld option,.m-tools select.fld optgroup{color:#000}
.m-tools .out{background:#3A3A40;color:#fff}
.m-tools .lab-conv-rows div{background:#3A3A40;color:#fff}.m-tools .lab-conv-rows span{color:rgba(255,255,255,.6)}.m-tools .lab-conv-rows .is-in{background:#fff;color:var(--ink)}.m-tools .lab-conv-rows .is-in span{color:rgba(0,0,0,.55)}
.m-tools .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.m-tools .out{border-radius:12px;padding:12px 14px;margin-top:12px;font-size:15px;line-height:1.5}.m-tools .out span,.m-tools .out div{color:rgba(255,255,255,.75)!important}.m-tools .out b{color:#fff;font-size:20px}

/* Grammi: strumento diretto */
.gr-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;border-radius:16px;background:rgba(255,255,255,.08);margin-bottom:12px}
.gr-seg button{min-height:48px;padding:6px 8px;border-radius:12px;color:rgba(255,255,255,.7);font-size:14px;font-weight:600;line-height:1.2}.gr-seg button.on{background:#fff;color:var(--ink)}
.gr-box{display:flex;flex-direction:column;gap:14px;padding:16px;border-radius:20px;background:#26262B;border:1px solid rgba(255,255,255,.12);margin-bottom:12px}.gr-box>b{font-size:15px;color:#fff}
.gr-f{display:block}.gr-f>span{display:block;margin-bottom:6px;font-size:13px;color:rgba(255,255,255,.65)}
.gr-f>div{display:flex;gap:8px}.gr-f .fld{flex:1;min-width:0}.gr-f select.fld{flex:0 0 96px}
.gr-res{padding:20px;border-radius:20px;background:#fff;color:var(--ink);text-align:center}.gr-res small{display:block;font-size:13px;color:var(--muted)}.gr-res strong{display:block;margin:4px 0 14px;font-size:44px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}.gr-res>p{margin:0;font-size:14px;color:var(--muted)}
.gr-res h4{margin:14px 0 6px;text-align:left;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.gr-all{display:grid;grid-template-columns:1fr 1fr;gap:6px}.gr-all div{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:12px;background:var(--soft);text-align:left}.gr-all b{font-size:15px;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis}.gr-all span{font-size:12.5px;color:var(--muted);white-space:nowrap}

/* tasto «i» e scheda unità */
.gr-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px;font-size:17px;font-weight:600;color:#fff}
.lab-conv-h{display:flex;align-items:center;justify-content:space-between}
.ui-i{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:inherit;background:rgba(127,127,135,.18);flex:none}.ui-i:active{background:rgba(127,127,135,.35)}
.ui-back{position:fixed;inset:0;z-index:9000;background:rgba(18,19,23,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;align-items:flex-end;animation:ui-fade .2s}
.ui-sheet{width:100%;max-height:82vh;display:flex;flex-direction:column;border-radius:24px 24px 0 0;background:#fff;color:#121317;animation:ui-up .28s cubic-bezier(.2,.9,.25,1)}
.ui-sheet header{display:flex;align-items:center;justify-content:space-between;padding:14px 12px 6px 20px}.ui-sheet h3{margin:0;font-size:19px;font-weight:700;color:#121317}
.ui-sheet header button{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;background:#EDEDF0;color:#121317}
.ui-body{overflow-y:auto;padding:0 20px calc(28px + env(safe-area-inset-bottom))}
.ui-body h4{margin:18px 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5C5C64}
.ui-base{margin:0 0 4px;font-size:15px;color:#121317}
.ui-row{display:flex;flex-direction:column;gap:2px;padding:10px 0;border-top:1px solid #E4E4E9;font-size:15px;color:#121317}.ui-row small{font-size:14px;color:#5C5C64}
@keyframes ui-up{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}@keyframes ui-fade{from{opacity:0}to{opacity:1}}
.m-tools .ui-sheet section,.m-calc .ui-sheet section{background:transparent;border:0;border-radius:0;padding:0;margin:0;color:#121317}
.m-tools .ui-sheet p,.m-tools .ui-sheet b{color:#121317}.m-tools .ui-sheet small{color:#5C5C64}.m-tools .ui-sheet h3,.m-tools .ui-sheet h4{color:inherit}.m-tools .ui-sheet h4{color:#5C5C64}

/* funzioni scientifiche (radice, potenza, logaritmi, esponenziale) */
.m-fx{font-size:16px;font-weight:600;letter-spacing:-.02em}.m-calc .m-bar .m-fx{color:#fff}.m-calc .m-bar .m-fx.on{background:rgba(255,255,255,.18)}
.m-calc-sci{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px 10px}
.m-ck.sci{height:46px;border-radius:14px;background:#2C2C31;font-size:18px;font-weight:500}.m-ck.sci.on{background:#fff;color:var(--accent)}
.m-calc-keys.sm .m-ck{max-height:60px;height:60px;font-size:28px}.m-calc-keys.sm{gap:9px;padding-bottom:calc(98px + env(safe-area-inset-bottom))}
.m-calc-keys.sm .m-ck.op{font-size:32px}

/* quaderno da telefono: meno digitazione */
.m-edit .lab-stockpick{height:52px;border-style:dashed;font-weight:600}
.lab-more{grid-column:1/-1;height:44px;border-radius:12px;background:var(--soft);color:var(--ink);font-size:14px;font-weight:600}
.m-edit textarea.fld{overflow:hidden;resize:none}

/* sotto-box (righe, passaggi): un grigio ben distinto dal bianco della scheda; campi bianchi dentro */
.m-edit .lab-rows .lab-row,.m-edit .lab-step{background:#E3E3E9;border:1.5px solid #B4B4BE}
.lab-ws .m-edit .lab-row .fld,.lab-ws .m-edit .lab-step .fld,.lab-ws .m-edit .lab-row .fld:not(:placeholder-shown):not(:focus),.lab-ws .m-edit .lab-step .fld:not(:placeholder-shown):not(:focus){background:#fff;border-color:#7C7C86}
.m-edit .lab-more{background:#fff;border:1.5px solid #B4B4BE}
.m-edit .lab-stockpick{background:#fff!important;border-style:dashed;border-color:#5C5C64!important}
.m-edit .lab-row .lab-cell-l{color:#3A3A42}
.m-edit .lab-next{background:var(--ink);color:#fff}.m-edit .lab-next:active{background:#3A3A42}
.m-edit .lab-add{background:transparent;border:1.5px dashed #5C5C64}

/* swipe per eliminare, dettatura, passaggi spuntabili, timer */
.sw{position:relative;overflow:hidden;border-radius:14px}
.sw-act{position:absolute;right:0;top:0;bottom:0;width:96px;background:var(--bad);color:#fff;font-size:15px;font-weight:600}
.sw-in{position:relative;transition:transform .22s cubic-bezier(.2,.9,.25,1)}.sw-in.drag{transition:none}
.m-edit .lab-step>.lab-x,.m-edit .lab-row>.lab-x{display:none}
.lab-swhint{display:block;margin:2px 4px 0;font-size:12.5px;color:var(--muted)}
.lab-dict{position:relative;min-width:0}.lab-dict .fld{width:100%}.lab-dict textarea.fld{padding-right:54px!important}
.lab-mic{min-height:0;position:absolute;right:8px;bottom:16px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff}.lab-mic.on{background:var(--bad);animation:lab-pulse 1.2s infinite}
@keyframes lab-pulse{0%{box-shadow:0 0 0 0 rgba(200,50,50,.5)}100%{box-shadow:0 0 0 14px rgba(200,50,50,0)}}
.m-edit .lab-step{grid-template-columns:36px minmax(0,1fr)}
.m-edit .lab-step>.lab-dict,.m-edit .lab-step>input,.m-edit .lab-step>.lab-timer{grid-column:2}
.lab-tick{width:34px;height:34px;margin-top:8px;border-radius:50%;border:2px solid #7C7C86;background:#fff;color:var(--muted);font-size:13px;font-weight:700;display:grid;place-items:center}.lab-tick.on{background:var(--ink);border-color:var(--ink);color:#fff}
.m-edit .lab-step.is-done textarea{text-decoration:line-through;color:var(--muted)}
.lab-timer{height:48px;border-radius:12px;background:#fff;border:1.5px solid #7C7C86;color:var(--ink);font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}.lab-timer.on{background:var(--ink);border-color:var(--ink);color:#fff}
.lab-shoot{background:var(--ink)!important;color:#fff!important;border-style:solid!important}

/* esperimento al lavoro */
.m-pillbtn.light{background:#fff;color:var(--ink);border:1.5px solid #B4B4BE}
.m-prog{display:flex;align-items:center;gap:12px;margin:4px 0 6px}.m-prog>div{flex:1;height:8px;border-radius:4px;background:#C6C6CE;overflow:hidden}.m-prog i{display:block;height:100%;background:var(--ink);border-radius:4px;transition:width .25s}.m-prog span{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.m-where{display:flex;flex-direction:column;border-radius:16px;overflow:hidden;background:var(--surface);border:1px solid var(--line)}
.m-where>div{padding:12px 14px;border-bottom:1px solid var(--line)}.m-where>div:last-child{border-bottom:0}
.m-where small{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.m-where b{font-size:20px;font-weight:700}.m-where p{margin:2px 0 0;font-size:16px;line-height:1.45;white-space:pre-wrap}
.m-stepw .m-box{background:transparent;padding:0}.m-stepw .m-row-t b{font-size:16px;line-height:1.4}
.m-stepw .lab-timer{width:100%;margin-top:10px}
.m-obs textarea.fld{min-height:110px;padding-top:13px;background:#fff;border:1.5px solid #7C7C86;font-size:16px}
.m-again{display:block;width:100%;height:52px;margin:26px 0 8px;border-radius:14px;background:#121317;border:0;color:#fff;font-size:16px;font-weight:600}
.m-pick{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;min-height:64px;padding:12px 4px;border-top:1px solid #E4E4E9;text-align:left;color:#121317}.m-pick b{font-size:16px}.m-pick small{font-size:13.5px;color:#5C5C64}.m-pick-empty{margin-top:10px;border-top:2px solid #E4E4E9}

/* tasto «dov'è» */
.m-where-btn{width:48px;height:44px;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:14px;background:#fff;border:1.5px solid #7C7C86;color:var(--ink);font-size:13.5px;font-weight:600;margin:-4px -4px -4px 0}.m-where-btn:active{background:var(--soft)}
.m-stepw .m-row-t small{white-space:normal}
.wh-main{padding:6px 0 12px}.wh-main small{display:block;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5C5C64}.wh-main b{display:block;margin-top:2px;font-size:26px;line-height:1.2;color:#121317}.wh-main p{margin:6px 0 0;font-size:15px;color:#5C5C64}
.wh-state{display:inline-block;margin:0 0 8px;padding:4px 12px;border-radius:999px;background:#EDEDF0;font-size:13px;font-weight:600}.wh-state.warn{color:var(--warn)}.wh-state.bad{color:var(--bad)}
.ui-row span{font-size:16px;color:#121317}.ui-row small{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5C5C64}

.m-qty-big{font-size:22px;font-weight:700;letter-spacing:-.01em;white-space:nowrap;margin-left:auto;padding-left:8px}
.m-stepw .m-pill{align-self:center}
.m-check .m-qty{font-size:22px;font-weight:700;letter-spacing:-.01em;white-space:nowrap;margin-left:auto;padding-left:8px}

/* scheda dov'è con compilazione del magazzino */
.wh-none{margin:8px 0 0;font-size:20px;font-weight:600;color:#121317}
.wh-note{margin:0 0 10px;font-size:14.5px;color:#5C5C64}
.wh-f{display:block;margin-top:14px}.wh-f>span{display:block;margin-bottom:6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5C5C64}
.wh-f input{width:100%;height:52px;padding:0 14px;border-radius:14px;border:1.5px solid #7C7C86;background:#F2F2F5;font-size:16px;color:#121317}.wh-f input:focus{outline:none;border-color:#121317;background:#fff}
.wh-big input{height:60px;font-size:20px;font-weight:600}
.wh-qty{display:flex;gap:8px}.wh-qty input{flex:1;text-align:center;font-size:20px;font-weight:700}.wh-qty button{width:60px;height:52px;border-radius:14px;background:#121317;color:#fff;font-size:26px;font-weight:500}
.wh-add{display:block;width:100%;height:56px;margin-top:20px;border-radius:16px;background:#121317;color:#fff;font-size:16px;font-weight:600}
.wh-saved{margin:16px 0 0;text-align:center;font-size:13px;color:#5C5C64}

/* modifica sul posto nel lavoro: stessa schermata, sotto la riga si apre il box */
.is-edit{cursor:pointer}.is-chg{box-shadow:inset 4px 0 0 #121317}
.is-edit{position:relative}
.we-ed{padding:0}
.we-f{display:block;margin-top:10px}.we-f>span{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5C5C64}
.we-f input,.we-f textarea{width:100%;padding:0 14px;height:50px;border-radius:14px;border:1.5px solid #7C7C86;background:#fff;font-size:16px;color:#121317;font-family:inherit}
.we-f textarea{height:auto;min-height:80px;padding:12px 14px;resize:none;line-height:1.45}.we-f input:focus,.we-f textarea:focus{outline:none;border-color:#121317;box-shadow:0 0 0 3px rgba(18,19,23,.12)}
.we-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.we-x{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:46px;margin-top:12px;border-radius:12px;font-size:14px;font-weight:600;color:var(--bad)}
.we-add{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;margin-top:10px;border-radius:14px;background:#fff;border:1.5px dashed #5C5C64;font-size:15px;font-weight:600;color:#121317}
/* misure nel lavoro */
.ms-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.ms-chips button{height:40px;padding:0 14px;border-radius:20px;background:#fff;border:1.5px solid #7C7C86;font-size:14px;font-weight:600;color:#121317}.ms-chips button.on{background:#121317;border-color:#121317;color:#fff}
.ms-ratio{margin:8px 4px 0;font-size:14px;color:#5C5C64}
.ms-del{display:block;width:100%;height:52px;margin-top:8px;font-size:15px;font-weight:600;color:var(--bad)}
.wh-add:disabled{opacity:.35}
.m-stepnote{display:block;margin-top:4px;font-style:italic;white-space:pre-wrap}

/* mise en place */
.mep .ui-body h4{margin:20px 2px 4px;font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5C5C64}
.mep-block{margin-top:10px;padding:12px 14px;border-radius:16px;background:#F2F2F5;border:1.5px solid #B4B4BE}.mep-block small,.mep-group small{display:block;font-size:12px;font-weight:700;color:#5C5C64;margin-bottom:4px}.mep-block b{display:block;font-size:17px}.mep-block p{margin:2px 0 0;font-size:15px;line-height:1.4}
.mep-warn{border-color:#121317}
.mep-group{margin-top:14px}.mep-group small{margin-left:2px}
.mep-item{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:8px 12px;margin-top:6px;border-radius:14px;background:#fff;border:1.5px solid #B4B4BE;text-align:left;color:#121317}.mep-item .mep-n{flex:1;font-size:16px;font-weight:600}.mep-item b{font-size:18px}.mep-item.on{background:#F2F2F5}.mep-item.on .mep-n{text-decoration:line-through;color:#5C5C64}

/* condizioni dei materiali: ghiaccio (blu), pericolo (giallo) */
.m-row.cond-ice,.mep-item.cond-ice{background:#CFE2FF!important;border-color:#8FB3EA}
.m-row.cond-hazard,.mep-item.cond-hazard{background:#FFE27A!important;border-color:#D9B81F}
.m-cond{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.7);color:#121317}
.mep-room h5{margin:20px 2px 0;font-size:15px;font-weight:700}.mep-legend{margin:14px 2px 0;font-size:13px;color:#5C5C64}
.m-cond-i{min-height:0;position:relative;align-self:center;flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff;border:1.5px solid #5C5C64;color:#121317;margin-left:-6px}
.ci-head{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 12px;border-radius:14px;font-size:17px;font-weight:700}.ci-head.cond-ice{background:#CFE2FF}.ci-head.cond-hazard{background:#FFE27A}
.ci-row{margin-top:12px}.ci-row small{display:block;font-size:12px;font-weight:700;color:#5C5C64}.ci-row b{display:block;font-size:17px;margin-top:2px}
.ci-long{font-size:15px!important;font-weight:500!important;white-space:pre-wrap;line-height:1.45}

/* articolo di magazzino */
.ar-qty{display:flex;align-items:center;gap:10px;margin-top:14px;padding:12px;border-radius:20px;background:#fff;border:1.5px solid #B4B4BE}
.ar-qty>button{flex:none;width:64px;height:64px;border-radius:18px;background:#121317;color:#fff;font-size:30px;font-weight:500}
.ar-qty>div{flex:1;text-align:center}.ar-qty b{display:block;font-size:44px;line-height:1.05;letter-spacing:-.02em}.ar-qty small{font-size:15px;color:#5C5C64;font-weight:600}
.ar-badges{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}
.ar-cond{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 4px 0 12px;border-radius:18px;font-size:14px;font-weight:600}.ar-cond.cond-ice{background:#CFE2FF}.ar-cond.cond-hazard{background:#FFE27A}.ar-cond .m-cond-i{margin-left:0;width:30px;height:30px}
.ar-list{margin-top:14px}.ar-row{display:block;min-height:0;padding:12px 14px}.ar-row small{display:block;font-size:12px;font-weight:700;color:#5C5C64}.ar-row b{display:block;margin-top:2px;font-size:17px}

/* quaderno: carta a quadretti */
.qd{padding:4px 0 8px}
.qd-month{margin:18px 4px 8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5C5C64}
.qd-page{display:flex;align-items:stretch;width:100%;margin-bottom:10px;border-radius:14px;overflow:hidden;text-align:left;color:#121317;border:1.5px solid #B4B4BE;background-color:#fff;background-image:linear-gradient(rgba(60,90,160,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(60,90,160,.14) 1px,transparent 1px);background-size:14px 14px;box-shadow:0 1px 0 rgba(18,19,23,.04)}
.qd-page:active{background-color:#F2F2F5}
.qd-date{flex:none;width:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px solid #121317;background:rgba(255,255,255,.86)}
.qd-date b{font-size:26px;line-height:1;letter-spacing:-.02em}.qd-date small{margin-top:3px;font-size:12px;font-weight:700;text-transform:uppercase;color:#5C5C64}
.qd-body{flex:1;min-width:0;padding:12px 14px;display:flex;flex-direction:column;justify-content:center;gap:3px;background:rgba(255,255,255,.6)}
.qd-body b{font-size:16.5px;line-height:1.25}.qd-body small{font-size:13px;color:#5C5C64}
.qd-sheet{background-image:linear-gradient(rgba(60,90,160,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(60,90,160,.10) 1px,transparent 1px);background-size:14px 14px;background-attachment:local}
.wk-title{display:flex;align-items:center;justify-content:space-between;gap:12px}.wk-title h2{flex:1;min-width:0}
.wk-color{min-height:0;position:relative;align-self:center;flex:none;width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid #121317}
.pal{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:6px}.pal button{height:60px;border-radius:16px;border:1.5px solid #7C7C86;background:#fff;display:grid;place-items:center;color:#121317}.pal button.on{border:3px solid #121317}

/* a mano */
.sk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.sk-thumb{aspect-ratio:3/4;border-radius:14px;overflow:hidden;border:1.5px solid #B4B4BE;background:#fff}.sk-thumb img{width:100%;height:100%;object-fit:contain;display:block}
.sk-new{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:14px;background:#fff;border:1.5px dashed #5C5C64;font-size:15px;font-weight:600;color:#121317}.sk-thumb+.sk-new,.sk-thumb~.sk-new{grid-column:auto;aspect-ratio:3/4;height:auto;flex-direction:column}
.sk{position:fixed;inset:0;z-index:9500;display:flex;flex-direction:column;background:#EDEDF1;touch-action:none}
.sk-top{display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px}.sk-top b{flex:1;text-align:center;font-size:16px}
.sk-ib{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#121317}
.sk-save{height:44px;padding:0 20px;border-radius:22px;background:#121317;color:#fff;font-size:15px;font-weight:600}.sk-save:disabled{opacity:.35}
.sk-area{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:0 10px}
.sk-cv{display:block;border-radius:12px;border:1.5px solid #B4B4BE;background-color:#fff;background-image:linear-gradient(rgba(60,90,160,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(60,90,160,.14) 1px,transparent 1px);background-size:20px 20px;touch-action:none}
.sk-tools{padding:10px 12px calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px}
.sk-row{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.sk-t{height:44px;padding:0 14px;border-radius:22px;background:#fff;border:1.5px solid #7C7C86;font-size:14px;font-weight:600;color:#121317}.sk-t.on{background:#121317;color:#fff;border-color:#121317}.sk-t:disabled{opacity:.35}.sk-bad{color:var(--bad)}
.sk-c{width:44px;height:44px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1.5px #7C7C86}.sk-c.on{box-shadow:0 0 0 3px #121317}
.sk-sep{width:1.5px;height:28px;background:#B4B4BE;margin:0 4px}
.sk-s{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;border:1.5px solid #7C7C86}.sk-s.on{border:3px solid #121317}.sk-s i{display:block;border-radius:50%;background:#121317}

/* pagina libera */
.lab-ws .pg-title,.pg-title{flex:1;min-width:0;width:100%;height:48px;border:0;background:transparent;font-size:26px!important;font-weight:700;letter-spacing:-.02em;color:#121317;font-family:inherit;padding:0;box-shadow:none!important}.pg-title:focus{outline:none}.pg-title::placeholder{color:#8C8C96}
.pg-fmt{position:sticky;top:0;z-index:5;display:flex;gap:8px;padding:8px 0;margin:6px 0 8px;background:linear-gradient(#F4F4F6,rgba(244,244,246,.92))}
.pg-f{flex:1;height:44px;border-radius:12px;background:#fff;border:1.5px solid #7C7C86;font-size:16px;font-weight:700;color:#121317}.pg-f-i{font-style:italic;font-family:Georgia,serif}.pg-f:active{background:#121317;color:#fff}
.pg-block{position:relative;margin-bottom:10px}
.pg-rich{min-height:84px;padding:12px 14px;border-radius:14px;background:#fff;border:1.5px solid #B4B4BE;font-size:16.5px;line-height:1.5;color:#121317;outline:none;-webkit-user-select:text;user-select:text}.pg-rich:focus{border-color:#121317;box-shadow:0 0 0 3px rgba(18,19,23,.12)}
.pg-rich:empty:before{content:attr(data-ph);color:#8C8C96}.pg-rich h2{margin:6px 0;font-size:21px;line-height:1.25}.pg-rich ul,.pg-rich ol{margin:6px 0;padding-left:24px}.pg-rich p,.pg-rich div{margin:0 0 6px}
.pg-img{display:block;width:100%;border-radius:14px;overflow:hidden;border:1.5px solid #B4B4BE;background:#fff}.pg-img img{display:block;width:100%;height:auto}
.pg-x{position:absolute;top:6px;right:6px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.92);border:1.5px solid #7C7C86;color:#121317}
.pg-add{display:flex;gap:8px;margin-top:6px}.pg-add button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:52px;border-radius:14px;background:#fff;border:1.5px dashed #5C5C64;font-size:14.5px;font-weight:600;color:#121317}
.sk-colors{display:flex;gap:10px;overflow-x:auto;padding:4px 2px;-webkit-overflow-scrolling:touch}.sk-colors .sk-c{flex:none}
.sk-custom{position:relative;display:block;overflow:hidden;background:conic-gradient(#D4281F,#F2C200,#1E8E3E,#1F4FD8,#7B3FD1,#D4281F)}.sk-custom input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.pg-dl{right:52px}
.pg-draw{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;background:rgba(255,255,255,.94);border:1.5px solid #7C7C86;font-size:13px;font-weight:600;color:#121317}.pg-img{position:relative}
.sk-toolrow .sk-t{flex:none}.sk-hint{font-size:14px;color:#5C5C64;padding:12px 4px}
.sk-ib:disabled{opacity:.35}
.sk-colors,.sk-toolrow{scrollbar-width:none}.sk-colors::-webkit-scrollbar,.sk-toolrow::-webkit-scrollbar{display:none}
.m-pillbtn.m-word{display:inline-flex;align-items:center;gap:6px;background:#2B579A;color:#fff}
.pg-rich ul{list-style:disc outside!important}.pg-rich ol{list-style:decimal outside!important}.pg-rich li{display:list-item!important}
.pg-f.on{background:#121317;color:#fff;border-color:#121317}
.sk-arrow{flex:none}

/* iPad e PC: elenco a sinistra, pagina a destra */
.m-split{display:grid;grid-template-columns:minmax(320px,400px) minmax(0,1fr);height:100%;min-height:0}
.m-pane-l{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--line);background:rgba(255,255,255,.4)}
.m-pane-r{min-width:0;min-height:0;display:flex;flex-direction:column}
.m-pane-l>.m-screen,.m-pane-r>.m-screen{height:100%}
.m-empty{flex:1;display:grid;place-items:center;padding:24px;text-align:center;color:var(--muted);font-size:15px}
.is-split .m-grid{grid-template-columns:repeat(3,1fr)}
.is-split .m-pane-r .m-scroll>*{max-width:780px;margin-left:auto;margin-right:auto}
.is-split .m-pane-r .m-bar{padding-left:22px;padding-right:18px}
.is-split .ui-back{align-items:center;justify-content:center}
.is-split .ui-sheet{max-width:560px;max-height:86vh;border-radius:24px}
.is-split .m-dock{left:50%;right:auto;width:min(520px,calc(100% - 28px));transform:translateX(-50%)}
.is-split .m-row.on,.is-split .qd-page.on{box-shadow:inset 0 0 0 2.5px #121317}
.phone.embed{height:100%;background:radial-gradient(52vmax 44vmax at 92% -8%,rgba(225,234,76,.85),transparent 64%),radial-gradient(46vmax 42vmax at -10% 30%,rgba(226,222,248,.8),transparent 62%),radial-gradient(50vmax 40vmax at 72% 110%,rgba(252,234,222,.9),transparent 62%),radial-gradient(32vmax 28vmax at 16% 100%,rgba(225,234,76,.35),transparent 62%),linear-gradient(160deg,#F7F4EC 0%,#F1EEE8 55%,#F7F2EC 100%) fixed}
.phone.embed .m-scroll,.phone.embed.is-split .m-scroll{padding-bottom:28px!important}
.is-split .m-pane-l .m-scroll{padding-left:12px;padding-right:12px}
.is-split .m-pane-r .m-edit .lab-pane-head{left:auto;right:18px}
@media (max-width:900px){.m-split{grid-template-columns:minmax(260px,330px) minmax(0,1fr)}.is-split .m-grid{grid-template-columns:repeat(2,1fr)}}
.is-split .m-calc>*{max-width:520px;margin-left:auto;margin-right:auto;width:100%}
.phone.embed .m-split{grid-template-columns:330px minmax(0,1fr)}
.ws{display:flex;flex-direction:column;height:100%;min-height:0}
.ws-w{background:rgba(255,255,255,.72);border:1px solid var(--line);border-radius:16px;padding:8px 12px;min-width:0;overflow:hidden}
.ws-clock{display:flex;flex-direction:column;justify-content:center}.ws-clock b{font-size:34px;letter-spacing:-.02em;color:var(--ink);line-height:1}.ws-clock span{font-size:12px;color:var(--muted);margin-top:6px;text-transform:capitalize}
.ws-cal-h{font-size:11px;font-weight:700;text-transform:capitalize;color:var(--ink);margin-bottom:3px}
.ws-cal-g{display:grid;grid-template-columns:repeat(7,1fr);gap:0;font-size:9.5px;text-align:center;color:var(--ink)}
.ws-cal-g i{font-style:normal;line-height:12px;position:relative}.ws-cal-g i.h{color:var(--muted)}
.ws-cal-g i.today{background:var(--ink);color:#fff;border-radius:6px}.ws-cal-g i.dot::after{content:"";position:absolute;left:50%;bottom:-1px;width:3px;height:3px;margin-left:-1.5px;border-radius:50%;background:var(--ink)}
.ws-notes{padding:0}.ws-notes textarea{width:100%;height:100%;border:0;background:transparent;resize:none;padding:10px 12px;font:inherit;font-size:13px;color:var(--ink);outline:none}
.ws-tabs{display:flex;gap:6px;padding:10px 14px 0;overflow-x:auto;flex:none;scrollbar-width:none}
.ws-tab{display:flex;align-items:center;background:rgba(255,255,255,.55);border:1px solid var(--line);border-radius:12px;flex:none;max-width:240px}
.ws-tab.on{background:#fff;border-color:var(--ink)}.ws-tab.cur{box-shadow:inset 0 -2.5px 0 var(--ink)}
.ws-tab button{background:none;border:0;cursor:pointer;color:var(--ink);font:inherit;display:flex;align-items:center;gap:6px}
.ws-tab-b{padding:8px 6px 8px 11px;font-size:12.5px;font-weight:600;min-width:0}.ws-tab-b span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ws-tab-s,.ws-tab-x{padding:6px;color:var(--muted)!important;border-radius:8px}.ws-tab-s.on{color:var(--ink)!important;background:var(--soft)}.ws-tab-x{margin-right:4px}
.ws-panes{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);gap:10px;padding:10px 14px 14px}
.ws-panes.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.ws-pane{min-width:0;min-height:0;display:flex;flex-direction:column;position:relative;background:rgba(255,255,255,.55);border:1px solid var(--line);border-radius:18px;overflow:hidden}
.ws-pane>.m-screen{flex:1;min-height:0;height:auto}
.ws-pane .m-scroll>*{max-width:none!important}
.ws-prev{position:absolute;right:14px;bottom:14px;z-index:3;display:flex;align-items:center;gap:6px;background:var(--ink);color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 12.5px inherit;cursor:pointer}
.ws-sheet{padding:12px}.ws-sheet iframe{display:block;width:100%;min-height:600px;border:0;background:#fff;border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 8px 24px rgba(30,25,15,.1)}
.ws .m-empty{flex:1}
.dk{height:100%;display:flex;flex-direction:column}
.dk-bar{display:flex;align-items:center;gap:14px;padding:10px 22px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.5);flex:none}
.dk-bar>b{font-size:15px;font-weight:700}.dk-time{margin-left:auto;font-size:13px;color:var(--muted);text-transform:capitalize}
.dk-find{display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:0 12px;height:32px;color:var(--muted);width:240px}.dk-find input{border:0;background:none;outline:none;font-size:13px;flex:1;min-width:0;color:var(--ink)}
.dk-calc{display:flex;align-items:center;gap:6px;background:none;border:0;font:600 13px inherit;color:var(--ink);cursor:pointer}
.dk-field{flex:1;min-height:0;overflow:auto;padding:26px 30px}
.dk-h{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:30px 0 8px}
.dk-grid{display:grid;grid-template-columns:repeat(auto-fill,112px);gap:10px 8px}
.dk-item{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;padding:8px 4px;border-radius:12px;cursor:default;color:var(--ink);font:inherit}
.dk-item.on{background:rgba(18,19,23,.1)}.dk-item:focus-visible{outline:2px solid var(--ink)}
.dk-l{font-size:12.5px;font-weight:600;text-align:center;line-height:1.25;max-width:104px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dk-s{font-size:11px;color:var(--muted)}
.dk-folder,.dk-file{position:relative;display:block;line-height:0}
.dk-folder svg{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}.dk-file svg{fill:#fff;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
.dk-folder i,.dk-file i{position:absolute;left:0;right:0;display:flex;justify-content:center;font-style:normal}.dk-folder i{top:20px}.dk-file i{top:26px}
.dk-folder b{position:absolute;right:-4px;top:-4px;min-width:20px;height:20px;border-radius:10px;background:var(--ink);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;padding:0 5px}
.dk-win-back{position:absolute;inset:0;background:rgba(18,19,23,.28);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:20}
.dk-win{width:min(720px,90%);max-height:80%;background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden}
.dk-win header{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--line)}.dk-win header b{flex:1;font-size:14px}
.dk-win .dk-grid{padding:16px;overflow:auto}
.dk-dots{display:flex;gap:6px}.dk-dots i{width:11px;height:11px;border-radius:50%;background:var(--line)}
.m-ib.xl{background:var(--ok);color:#fff;width:36px;height:36px;margin:4px 4px}
.xl-dot{width:26px;height:26px;border-radius:50%;background:var(--ok);color:#fff;display:inline-grid;place-items:center;flex:none}
.dk-field{position:relative;padding:0;overflow:auto}
.dk-item.abs{position:absolute;width:104px;touch-action:none;user-select:none}.dk-item.drag{z-index:10;opacity:.85;cursor:grabbing}
.dk-hits{padding:26px 30px}.dk-ex{position:absolute;left:18px;bottom:16px}
.dk-trash{position:absolute;right:22px;bottom:18px;width:84px;padding:10px 0;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--muted);font-size:12px;font-weight:600;transition:background .15s,color .15s}
.dk-trash.over{background:var(--ink);color:#fff}
.dk-ask{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px;max-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.25)}.dk-ask h3{margin:0 0 6px;font-size:17px}.dk-ask p{margin:0 0 16px;color:var(--muted);font-size:14px}.dk-ask div{display:flex;gap:8px;justify-content:flex-end}
.dk{padding:0}
.dk-screen{position:relative;flex:1;min-height:0;margin:10px 14px 14px;border:1px solid var(--line);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;background:rgba(255,255,255,.55)}
.dk-bar{position:relative;display:flex;align-items:center;gap:4px;padding:0 10px;height:30px;flex:none;background:rgba(255,255,255,.7);border-bottom:1px solid var(--line);font-size:12.5px}
.dk-bar>button{background:none;border:0;font:inherit;color:var(--ink);padding:3px 8px;border-radius:6px;cursor:default}.dk-bar>button:hover{background:rgba(18,19,23,.08)}
.dk-bar>b{padding:0 8px;font-weight:700}.dk-logo{display:grid;place-items:center}
.dk-bar .dk-find{margin-left:auto;height:22px;width:170px;padding:0 8px}.dk-bar .dk-time{margin-left:12px;margin-right:4px;font-size:12.5px;color:var(--ink)}
.dk-menu{position:absolute;left:8px;top:30px;z-index:30;min-width:170px;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.18);padding:4px;display:flex;flex-direction:column}
.dk-menu button{background:none;border:0;text-align:left;font:inherit;font-size:13px;padding:7px 10px;border-radius:6px;cursor:default;color:var(--ink)}.dk-menu button:hover{background:var(--ink);color:#fff}
.dk-wall{position:absolute;left:50%;top:50%;transform:translate(-50%,-56%);color:var(--ink);opacity:.06;pointer-events:none}
.dk-dock{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:22px;background:rgba(255,255,255,.7);backdrop-filter:blur(14px);border:1px solid var(--line);box-shadow:0 8px 28px rgba(0,0,0,.12);z-index:5}
.dk-app{width:48px;height:48px;border-radius:13px;background:var(--surface);border:1px solid var(--line);color:var(--ink);display:grid;place-items:center;cursor:default;transition:transform .12s}.dk-app:hover{transform:translateY(-4px)}
.dk-sep{width:1px;height:34px;background:var(--line)}
.dk-dock .dk-trash{position:relative;width:48px;padding:0;display:grid;border-radius:13px;font-size:inherit;gap:0}.dk-dock .dk-trash.over{background:var(--ink);color:#fff}
.dk-win-back{z-index:40}
.dk-gear{display:grid;place-items:center;margin-left:auto}.dk-bar .dk-find{margin-left:8px}
.dk-bgset{left:auto;right:8px;width:230px;padding:12px;gap:10px}.dk-bgset h4{margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.dk-chips{display:flex;flex-wrap:wrap;gap:6px}.dk-bgset .dk-chips button{border:1px solid var(--line);border-radius:999px;padding:5px 11px;background:var(--surface);color:var(--ink)}.dk-bgset .dk-chips button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.dk-chk,.dk-rng{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--ink)}.dk-chk{flex-direction:row;align-items:center}
.dk-screen.is-dark .dk-item{color:#fff}.dk-screen.is-dark .dk-s{color:rgba(255,255,255,.6)}.dk-screen.is-dark .dk-folder svg,.dk-screen.is-dark .dk-file svg{stroke:#fff}.dk-screen.is-dark .dk-folder svg{fill:#2A2B30}.dk-screen.is-dark .dk-file svg{fill:#2A2B30}.dk-screen.is-dark .dk-folder i,.dk-screen.is-dark .dk-file i{color:#fff}.dk-screen.is-dark .dk-wall{color:#fff}.dk-screen.is-dark .dk-ex{color:#fff}
.dk-menu{background:#fff!important;backdrop-filter:none!important}.dk-screen.is-dark .dk-menu{background:#2A2B30!important;color:#fff}.dk-screen.is-dark .dk-menu h4{color:rgba(255,255,255,.6)}.dk-screen.is-dark .dk-menu button{color:#fff}.dk-screen.is-dark .dk-bgset .dk-chips button{background:#3A3B41;border-color:#55565C}.dk-screen.is-dark .dk-bgset .dk-chips button.on{background:#fff;color:#121317;border-color:#fff}.dk-screen.is-dark .dk-chk,.dk-screen.is-dark .dk-rng{color:#fff}
.dk-app{position:relative}.dk-app[data-tip]::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 12px);transform:translateX(-50%);background:#121317;color:#fff;font:600 12px/1 Inter,system-ui,sans-serif;padding:7px 10px;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s}.dk-app[data-tip]:hover::after,.dk-app[data-tip]:focus-visible::after{opacity:1}
.dk-trash{position:relative}.dk-trash b{position:absolute;right:-5px;top:-5px;min-width:18px;height:18px;border-radius:9px;background:var(--ink);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;padding:0 4px}.dk-trash.full{background:var(--soft)}
.dk-toast{position:absolute;left:50%;top:44px;transform:translateX(-50%);z-index:60;background:var(--ink);color:#fff;font-size:13px;padding:9px 12px;border-radius:10px;display:flex;gap:10px;align-items:center}.dk-toast button{background:none;border:0;color:#fff;display:grid}
.dk-win header .m-pillbtn:disabled{opacity:.4}
.dk-dock .dk-trash{right:auto;bottom:auto;top:auto;left:auto}.dk-dock .dk-app{background:#fff;border-color:rgba(23,24,27,.14);color:var(--ink)}.dk-dock .dk-trash.full{background:#fff}.dk-dock .dk-trash.over{background:var(--ink);color:#fff}.dk-dock{background:rgba(255,255,255,.88)}
.dk-win,.dk-ask{background:#fff!important}
.lab-ws.phone.calc-app{position:fixed;inset:0;z-index:300;background:#121317;display:flex;align-items:center;justify-content:center;height:auto;width:auto;max-width:none}
.calc-x{position:absolute;top:18px;right:20px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);border:0;color:#fff;display:grid;place-items:center;cursor:pointer;z-index:2}.calc-x:hover{background:rgba(255,255,255,.24)}
.calc-win{width:min(540px,100%);height:min(780px,100%);display:flex;flex-direction:column}.calc-win>.m-screen{height:100%}
.dk-doc{position:absolute;left:50%;top:46px;bottom:86px;width:min(760px,calc(100% - 48px));transform:translateX(-50%);z-index:25;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.dk-doc>header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);flex:none}.dk-doc>header b{flex:1;font-size:14px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dk-doc-body{flex:1;min-height:0;display:flex;flex-direction:column}.dk-doc-body>.m-screen{height:100%;flex:1;min-height:0}.dk-doc-body .m-scroll>*{max-width:none!important}
.dk-w{position:absolute;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.dk-w>header{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-bottom:1px solid var(--line);flex:none;cursor:grab;user-select:none;touch-action:none}.dk-w>header b{flex:1;font-size:13.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dk-w-body{flex:1;min-height:0;display:flex;flex-direction:column}.dk-w-body>.m-screen{height:100%;flex:1;min-height:0}.dk-w-body .m-scroll>*{max-width:none!important}
.dk-w.dark{background:#17181B;border-color:#2c2d33}.dk-w.dark>header{border-color:#2c2d33;color:#fff}.dk-w.dark .m-ib{color:#fff}
.dk-w-grid{padding:16px;overflow:auto;flex:1;align-content:start}.dk-w .m-calc-keys{padding-bottom:16px;gap:9px}.dk-w .m-calc-out{font-size:64px}
.dk-dock{z-index:100}.dk-toast{z-index:110}
.dk-bar{z-index:100;position:relative}
.dk-w .m-tools{padding:10px 14px 16px}.dk-w .m-tools section{padding:14px;margin-bottom:10px}.dk-w .m-calc .m-bar{padding-top:10px;padding-bottom:6px}.dk-w .m-calc{height:100%}
.ws-sugg{flex:none;display:flex;align-items:center;gap:6px;background:none;border:1px solid var(--line);border-radius:12px;padding:8px 12px;font:600 12.5px inherit;color:var(--muted);cursor:pointer}.ws-sugg:hover{color:var(--ink);border-color:var(--ink)}
.ws-tab{cursor:grab}.ws-tab.dragging{opacity:.4}.ws-pane.drop{outline:2.5px solid var(--ink);outline-offset:-2.5px}
.ws-panes:not(.two) .ws-pane{position:relative}
.dk-item.target{background:rgba(18,19,23,.14);box-shadow:inset 0 0 0 2px var(--ink)}
.mini{display:flex;flex-direction:column;height:100%;min-height:0}.mini>.m-screen{flex:1;min-height:0;height:auto}.mini-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);flex:none}.mini-bar b{font-size:13.5px}
.mini>.m-screen .m-bar,.mini .m-scroll{padding-bottom:12px!important}
.dk-name{width:100%;box-sizing:border-box;height:42px;border:1.5px solid #cfd0d5;border-radius:10px;background:#fff;padding:0 12px;font-size:15px;color:var(--ink);margin:0 0 14px;outline:none}.dk-name:focus{border-color:var(--ink)}

.dk-ghost{position:fixed;z-index:300;pointer-events:none;transform:translate(-50%,-50%);opacity:.85}

.mini-bar{padding:6px 12px}.mini-bar .m-pillbtn{padding:6px 12px;font-size:12.5px}.mini .m-bar{padding-top:10px}

.mini-bar .m-pillbtn{display:inline-flex;flex-direction:row;align-items:center;gap:6px;white-space:nowrap;width:auto;height:auto}

.mini .m-hello{font-size:24px}.mini .m-home{padding-top:8px}

.dk-w{contain:layout}.dk-w .m-edit .lab-pane-head,.dk-w .m-done,.dk-w .m-edit .lab-saved{z-index:6}

.dk-w .m-edit .lab-pane-head{position:sticky;top:0;left:auto;right:auto;bottom:auto;width:auto;margin:0;padding:8px 14px;background:#fff;border-bottom:1px solid var(--line);justify-content:flex-end;pointer-events:auto;flex-wrap:nowrap;z-index:6}
.dk-w .m-edit .lab-pane-head>div:first-child{display:none}
.dk-w .m-edit .lab-pane-actions{display:flex;gap:8px;flex-wrap:nowrap}
.dk-w .m-edit .lab-saved{position:static;margin:0 auto 0 0}
.dk-w .m-edit .m-done{position:sticky;left:auto;bottom:14px;margin:14px auto 14px 14px;height:46px;padding:0 24px;font-size:15px}

/* scala dei caratteri dei mini programmi = quella del simulatore (12.5 / 11) */
.dk-w:not(.dark) .m-screen,.dk-w:not(.dark) .m-screen *{font-size:12.5px}
.dk-w:not(.dark) .m-hello{font-size:18px;margin-bottom:10px;letter-spacing:-.01em}
.dk-w:not(.dark) h1,.dk-w:not(.dark) h2{font-size:15px!important;letter-spacing:0}
.dk-w:not(.dark) h3{font-size:12.5px!important}
.dk-w:not(.dark) small,.dk-w:not(.dark) .lab-hint,.dk-w:not(.dark) label>span:first-child,.dk-w:not(.dark) .m-row-t small{font-size:11px!important}
.dk-w:not(.dark) .m-row{min-height:44px;padding:6px 12px;gap:10px}
.dk-w:not(.dark) .m-row-t b{font-size:12.5px}
.dk-w:not(.dark) .m-chips button{height:28px;padding:0 12px;font-size:12px}
.dk-w:not(.dark) input,.dk-w:not(.dark) select,.dk-w:not(.dark) textarea{font-size:12.5px!important}
.dk-w:not(.dark) input:not([type=checkbox]):not([type=radio]),.dk-w:not(.dark) select{min-height:32px;height:32px;padding:0 10px}
.dk-w:not(.dark) .lab-btn,.dk-w:not(.dark) .m-pillbtn{height:30px;min-height:30px;padding:0 12px}
.dk-w:not(.dark) .m-ib{width:30px;height:30px}.dk-w:not(.dark) .m-ib.xl,.dk-w:not(.dark) .m-add{width:30px;height:30px}
.dk-w .m-edit .m-done{height:34px;padding:0 18px}

/* finestre da PC */
.dk-w{border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.14);border-color:rgba(23,24,27,.16)}
.dk-w.front{box-shadow:0 26px 64px rgba(0,0,0,.34);border-color:rgba(23,24,27,.3)}
.dk-w>header{background:var(--soft);padding:0 12px;height:34px;gap:12px;position:relative;justify-content:flex-start}
.dk-w>header b{position:absolute;left:96px;right:96px;text-align:center;pointer-events:none;color:var(--muted);font-size:12.5px}.dk-w.front>header b{color:var(--ink)}
.dk-w>header>.m-pillbtn{margin-left:auto;position:relative;z-index:1}
.dk-tl{display:flex;gap:7px;position:relative;z-index:1}
.dk-tl-b{width:14px;height:14px;border-radius:50%;background:rgba(23,24,27,.2);border:0;padding:0;display:grid;place-items:center;color:transparent;cursor:default}
.dk-tl:hover .dk-tl-b{background:rgba(23,24,27,.42);color:#fff}.dk-w.front .dk-tl-b{background:rgba(23,24,27,.34)}
.dk-w.dark>header{background:#222328}.dk-w.dark>header b{color:#c9cad1}.dk-w.dark.front>header b{color:#fff}
.dk-rs{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;z-index:8;touch-action:none;background:linear-gradient(135deg,transparent 55%,rgba(23,24,27,.28) 55%,rgba(23,24,27,.28) 62%,transparent 62%,transparent 72%,rgba(23,24,27,.28) 72%,rgba(23,24,27,.28) 79%,transparent 79%)}
.dk-w.max{box-shadow:none}
.dk-dock .dk-app.run::before{content:'';position:absolute;left:50%;bottom:-6px;width:4px;height:4px;border-radius:50%;background:var(--ink);transform:translateX(-50%)}
.dk-dock .dk-app.mini{opacity:.55}

.dk-w>header>.m-pillbtn{display:inline-flex;flex-direction:row;align-items:center;gap:6px;white-space:nowrap;height:24px!important;min-height:24px!important;padding:0 10px!important;margin-left:auto;background:#fff;border:1px solid var(--line)}

.dk-w>header>.m-pillbtn{color:var(--ink)!important}

/* barra del sistema scura: stacca dall'area di lavoro */
.dk-bar{background:#17181B!important;color:#fff;border-bottom:0!important}
.dk-bar>button,.dk-bar>b,.dk-bar .dk-time,.dk-bar .dk-gear{color:#fff!important}
.dk-bar>button:hover{background:rgba(255,255,255,.16)!important}
.dk-bar .dk-find{background:rgba(255,255,255,.12)!important;border:0!important;color:#fff!important}.dk-bar .dk-find input{color:#fff!important}.dk-bar .dk-find input::placeholder{color:rgba(255,255,255,.6)}.dk-bar .dk-find svg{color:rgba(255,255,255,.7)}
.dk-bar .dk-time{opacity:.9}
.dk-screen{border-color:rgba(23,24,27,.35)}
.dk-w:not(.dark)>header{background:#F6F6F8;border-bottom:1px solid rgba(23,24,27,.14)}

/* file tuoi: documenti e immagini */
.uf{display:flex;flex-direction:column;height:100%;min-height:0;background:#fff}
.uf-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);flex:none}
.uf-name{flex:1;min-width:0;height:30px;border:0;background:transparent;font:600 14px/1 inherit;color:var(--ink);outline:0}
.uf-bar .m-pillbtn{display:inline-flex;flex-direction:row;align-items:center;gap:6px;white-space:nowrap;height:28px;padding:0 12px;text-decoration:none;font-size:12.5px;color:var(--ink);background:#fff;border:1px solid var(--line)}
.uf-body{flex:1;min-height:120px;resize:none;border:0;outline:0;padding:16px 20px;font:14px/1.6 inherit;color:var(--ink);background:#fff}
.uf-imgs{display:flex;gap:10px;flex-wrap:wrap;padding:10px 16px;border-top:1px solid var(--line);max-height:36%;overflow:auto;flex:none}
.uf-imgs figure{position:relative;margin:0}.uf-imgs img{height:96px;border-radius:8px;border:1px solid var(--line);display:block}
.uf-imgs .m-ib{position:absolute;top:4px;right:4px;width:22px;height:22px;background:#fff;border:1px solid var(--line)}
.uf-foot{display:flex;justify-content:space-between;padding:6px 14px;border-top:1px solid var(--line);font-size:11px;color:var(--muted);flex:none;background:#F6F6F8}
.uf-view{flex:1;min-height:0;overflow:auto;display:grid;place-items:center;background:#EDEDF0;padding:12px}.uf-view img{display:block;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,.18)}.uf-view.fit img{max-width:100%;max-height:100%;object-fit:contain}
.dk-w:not(.dark) .uf-name{font-size:14px!important}.dk-w:not(.dark) .uf-body{font-size:14px!important}

/* Appunti (stile Word) */
.ap{--ap:#217346;display:flex;flex-direction:column;height:100%;min-height:0;background:#fff}
.ap-title-bar{display:flex;align-items:center;gap:2px;padding:0 8px;height:34px;background:var(--ap);color:#fff;flex:none}
.ap-title-bar button{height:26px;padding:0 12px;border:0;border-radius:6px 6px 0 0;background:none;color:rgba(255,255,255,.75);font-size:12.5px}.ap-title-bar button:hover{color:#fff}
.ap-filebtn{border:1px solid rgba(255,255,255,.35)!important;border-radius:6px!important;margin-right:6px;color:#fff!important}.ap-filebtn.on{background:#fff!important;color:var(--ap)!important}
.ap-tab.on{background:#F6F6F8!important;color:var(--ap)!important;margin-top:8px;height:26px}
.ap-doc{margin-left:auto;font-size:12px;color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%}
.ap-ribbon{display:flex;align-items:stretch;gap:0;min-height:74px;padding:6px 8px;background:#F6F6F8;border-bottom:1px solid var(--line);flex:none}
.ap-grp{display:flex;flex-direction:column;justify-content:space-between;gap:4px;padding:0 12px;border-right:1px solid var(--line)}.ap-grp:first-child{padding-left:4px}
.ap-row-tools{display:flex;align-items:center;gap:3px}
.ap-gl{font-size:10.5px;color:var(--muted);text-align:center;margin-top:auto}
.ap-r{min-width:28px;height:28px;padding:0 6px;display:inline-grid;place-items:center;border:1px solid transparent;border-radius:5px;background:none;color:var(--ink);font-size:13.5px}.ap-r:hover{background:rgba(23,24,27,.08)}.ap-r.on{background:#D9DADF;border-color:#B8BAC2}
.ap-sel{height:26px;border:1px solid var(--line);border-radius:5px;background:#fff;color:var(--ink);font:inherit;font-size:12.5px;padding:0 4px}
.ap-big{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:64px;padding:4px 10px;border:0;border-radius:6px;background:none;color:var(--ink);font-size:12px}.ap-big:hover:not(:disabled){background:rgba(23,24,27,.08)}.ap-big:disabled{opacity:.35}
.ap-row textarea.h4{background:#E8F3EC;border-radius:6px;padding:6px 10px}.ap-chip{height:26px;padding:0 12px;border:1px solid var(--line);border-radius:5px;background:#fff;color:var(--ink);font-size:12.5px}.ap-chip.on{background:var(--ap);border-color:var(--ap);color:#fff}.ap-chip:disabled{opacity:.4}.ap-row textarea.h3{color:var(--muted);border-left:3px solid var(--ap);padding-left:10px}
.ap-tabw{margin:8px 0}.ap-tab-t{width:100%;border-collapse:collapse;table-layout:fixed}.ap-tab-t td{border:1px solid #9A9CA4;padding:3px 6px;vertical-align:top}.ap-tab-t textarea{width:100%;border:0;outline:0;resize:none;background:none;font:14px/1.5 inherit;color:var(--ink);padding:0;overflow:hidden}.ap-tabtools{display:flex;gap:4px;margin-top:4px;opacity:0;transition:opacity .15s}.ap-tabw:hover .ap-tabtools,.ap-tabw:focus-within .ap-tabtools{opacity:1}.ap-tabtools button{border:1px solid var(--line);background:#fff;border-radius:5px;font-size:11px;padding:2px 7px;color:var(--ink)}.ap-tabtools button:disabled{opacity:.35}
.ap-hr{border:0;border-top:1.5px solid var(--ap);margin:10px 0}.ap-num{flex:none;min-width:22px;font-size:14px;line-height:1.55;color:var(--ink)}.ap-fi{width:120px;padding:0 8px}.ap-hits{font-size:11px;color:var(--muted);min-width:14px}button.ap-sel:disabled{opacity:.4}label.ap-big.dis{opacity:.35}label.ap-big{cursor:pointer}
.ap-backstage{gap:6px;min-height:150px;align-items:flex-start}.ap-open{margin-left:auto;width:240px;display:flex;flex-direction:column;gap:6px}.ap-ol{display:flex;flex-direction:column;max-height:110px;overflow:auto}.ap-ol button{display:flex;justify-content:space-between;gap:8px;text-align:left;padding:5px 8px;border:0;border-radius:6px;background:none;color:var(--ink);font-size:12.5px}.ap-ol button:hover{background:rgba(23,24,27,.08)}.ap-ol button.on{background:var(--ap);color:#fff}.ap-ol small{color:var(--muted);font-size:11px}.ap-ol button.on small{color:rgba(255,255,255,.7)}
.ap-body{flex:1;display:flex;min-height:0}
.ap-side{width:200px;flex:none;border-right:1px solid var(--line);background:#F6F6F8;display:flex;flex-direction:column;min-height:0}
.ap-top{display:flex;gap:6px;padding:10px;border-bottom:1px solid var(--line)}
.ap-find{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:30px;padding:0 8px;border-radius:8px;background:#fff;border:1px solid var(--line);color:var(--muted)}.ap-find input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;font-size:12.5px;color:var(--ink)}
.ap-new{width:30px;height:30px;border-radius:8px;background:var(--ap);color:#fff;border:0;display:grid;place-items:center;flex:none}
.ap-list{flex:1;overflow:auto;padding:6px}
.ap-item{display:flex;flex-direction:column;gap:2px;width:100%;text-align:left;padding:8px 10px;border-radius:8px;background:none;border:0;color:var(--ink)}.ap-item b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-item span{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-item:hover{background:rgba(23,24,27,.06)}.ap-item.on{background:var(--ap);color:#fff}.ap-item.on span{color:rgba(255,255,255,.7)}
.ap-none{padding:14px 10px;font-size:12px;color:var(--muted)}
.ap-main{flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;position:relative}
.ap-canvas{flex:1;overflow:auto;background:#D4D5DA;padding:22px 16px 40px}
.ap-page{width:100%;max-width:640px;min-height:820px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25),0 6px 18px rgba(0,0,0,.12);padding:48px 56px 64px}
.ap-title{width:100%;border:0;outline:0;background:none;font:700 24px/1.3 inherit;color:var(--ink);margin-bottom:12px}
.ap-row{display:flex;align-items:flex-start;gap:10px;padding:2px 0}
.ap-row textarea{flex:1;min-width:0;border:0;outline:0;resize:none;background:none;font:14px/1.55 inherit;color:var(--ink);padding:0;overflow:hidden}
.ap-row textarea::placeholder{color:var(--ap);opacity:.45}.ap-row textarea:focus::placeholder{opacity:0}
.ap-row textarea.h1{font-size:22px;font-weight:700;line-height:1.35}.ap-row textarea.h2{font-size:17px;font-weight:700;line-height:1.4}
.ap-row.done textarea{color:var(--muted);text-decoration:line-through}
.ap-box{flex:none;width:18px;height:18px;margin-top:3px;border-radius:5px;border:1.5px solid rgba(23,24,27,.5);background:#fff;display:grid;place-items:center;padding:0;color:#fff}.ap-box.on{background:var(--ap);border-color:var(--ap)}
.ap-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--ap);margin:10px 6px 0 6px}
.ap-status{display:flex;align-items:center;gap:16px;height:26px;padding:0 12px;background:var(--ap);color:rgba(255,255,255,.8);font-size:11.5px;flex:none}
.ap-stbtn{border:0;background:none;color:inherit;font:inherit;padding:0}.ap-stbtn:hover{color:#fff}
.ap-zoom{margin-left:auto;display:flex;align-items:center;gap:6px}.ap-zoom button{border:0;background:none;color:#fff;font-size:15px;line-height:1;padding:0 2px}.ap-zoom input{width:90px;accent-color:#fff}.ap-zoom em{font-style:normal;min-width:34px;text-align:right}
.ap-empty{flex:1;display:grid;place-content:center;justify-items:center;gap:12px;color:var(--muted);font-size:13px;background:#D4D5DA}.ap-empty .m-pillbtn{display:inline-flex;flex-direction:row;gap:6px;align-items:center}
.ap-err{position:absolute;left:12px;right:12px;bottom:10px;margin:0;padding:8px 12px;border-radius:8px;background:var(--ap);color:#fff;font-size:12px}

.ap-mano{position:relative;margin:8px 0;max-width:100%}.ap-rz{position:absolute;right:-6px;bottom:-6px;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid var(--ap);cursor:nwse-resize;touch-action:none;opacity:0}.ap-mano:hover .ap-rz,.ap-rz:active{opacity:1}.ap-mano img{display:block;width:100%;height:auto;border-radius:8px;border:1px solid var(--line);cursor:pointer;background:#fff}
.ap-mano .m-ib{position:absolute;top:6px;right:6px;width:24px;height:24px;background:#fff;border:1px solid var(--line)}
.ap-sa-back{position:absolute;inset:0;z-index:20;background:rgba(23,24,27,.35);display:grid;place-items:center}
.dk-w .sk{z-index:30}

/* Esporta */
.ex{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);height:100%;min-height:0;background:#fff}
.ex section{display:flex;flex-direction:column;min-height:0;min-width:0}.ex-left{border-right:1px solid var(--line);background:#F6F6F8}
.ex header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--line);font-size:12.5px}.ex header span{color:var(--muted)}
.ex-drop{flex:1;min-height:0;overflow:auto;margin:10px;border:1.5px solid var(--line);border-radius:10px;background:#fff;padding:6px;display:flex;flex-direction:column;gap:4px}.ex-drop.hot{border-color:var(--ink);background:var(--soft)}
.ex-hint{margin:auto;text-align:center;font-size:12.5px;color:var(--muted);line-height:1.5}
.ex-item{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;background:#F6F6F8}.ex-item span{flex:1;min-width:0;display:flex;flex-direction:column}.ex-item b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ex-item small{font-size:11px;color:var(--muted)}.ex-item .m-ib{width:24px;height:24px}
.ex-left footer{display:flex;gap:6px;flex-wrap:wrap;padding:0 10px 10px}
.ex-left footer .m-pillbtn,.ex-go .m-pillbtn{display:inline-flex;flex-direction:row;align-items:center;gap:6px;white-space:nowrap;height:30px;padding:0 12px;font-size:12.5px}
.ex-pick{flex:1;min-height:0;overflow:auto;margin:10px;border:1.5px solid var(--line);border-radius:10px;background:#fff;padding:4px 10px 8px}.ex-pick h4{margin:10px 0 2px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.ex-chk{display:flex;align-items:center;gap:8px;padding:3px 0;font-size:12.5px}.ex-chk span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ex-right{padding-bottom:12px}.ex-fmts{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 14px 0}
.ex-fmt{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:9px 12px;border-radius:10px;background:#fff;border:1.5px solid var(--line);color:var(--ink);text-align:left}.ex-fmt b{font-size:13px}.ex-fmt small{font-size:11px;color:var(--muted)}.ex-fmt.on{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
.ex-note{margin:10px 14px 0;font-size:12px;color:var(--muted)}.ex-one{margin:8px 14px 0}
.ex-go{margin-top:auto;padding:0 14px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}.ex-msg{margin:0;font-size:12px;color:var(--muted)}

/* barra del sistema con l'accento */
.dk-bar{background:var(--accent)!important}
.dk-bar>button:hover{background:rgba(255,255,255,.2)!important}
.dk-bar .dk-find{background:rgba(255,255,255,.18)!important}
.dk-screen{border-color:color-mix(in srgb,var(--accent) 45%,transparent)}
.dk-dock .dk-app.run::before{background:var(--accent)}
.dk-w.front{border-color:color-mix(in srgb,var(--accent) 50%,transparent)}
.dk-tl:hover .dk-tl-b{background:var(--accent)}

/* barra del sistema a vetro */
.dk-bar{background:rgba(255,255,255,.5)!important;-webkit-backdrop-filter:blur(20px) saturate(1.7);backdrop-filter:blur(20px) saturate(1.7);color:var(--ink)!important;border-bottom:1px solid rgba(23,24,27,.1)!important;box-shadow:0 1px 0 rgba(255,255,255,.6) inset}
.dk-bar>button,.dk-bar>b,.dk-bar .dk-time,.dk-bar .dk-gear{color:var(--ink)!important}
.dk-bar>button:hover{background:rgba(23,24,27,.08)!important}
.dk-bar .dk-find{background:rgba(255,255,255,.6)!important;border:1px solid rgba(23,24,27,.08)!important}.dk-bar .dk-find input{color:var(--ink)!important}.dk-bar .dk-find input::placeholder{color:var(--muted)}.dk-bar .dk-find svg{color:var(--muted)}
.dk-screen{border-color:rgba(23,24,27,.18)}
.dk-dock .dk-app.run::before{background:var(--ink)}
.dk-w.front{border-color:rgba(23,24,27,.3)}
.dk-tl:hover .dk-tl-b{background:rgba(23,24,27,.45)}

.dk-bar{background:rgba(255,255,255,.62)!important;box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 8px 20px rgba(23,24,27,.1)!important;z-index:100}

/* dock a vetro, dinamico: --k va da 0 (lontano, piccolo) a 1 (vicino, a dimensione normale) */
.dk-dock{--k:1;--s:calc(30px + 18px * var(--k));gap:calc(3px + 5px * var(--k));padding:calc(4px + 4px * var(--k)) calc(8px + 4px * var(--k));border-radius:calc(14px + 8px * var(--k));background:rgba(255,255,255,.42)!important;-webkit-backdrop-filter:blur(22px) saturate(1.8);backdrop-filter:blur(22px) saturate(1.8);border:1px solid rgba(255,255,255,.75);box-shadow:0 10px 30px rgba(23,24,27,.16),inset 0 1px 0 rgba(255,255,255,.8);transition:gap .14s,padding .14s,border-radius .14s}
.dk-dock .dk-app{width:var(--s);height:var(--s);border-radius:calc(var(--s) * .27);background:rgba(255,255,255,.55)!important;border:1px solid rgba(255,255,255,.8);box-shadow:0 1px 2px rgba(23,24,27,.08);transition:width .14s,height .14s,transform .12s}
.dk-dock .dk-app svg{width:calc(var(--s) * .7);height:calc(var(--s) * .7)}
.dk-dock .dk-trash svg{width:calc(var(--s) * .5);height:calc(var(--s) * .5)}
.dk-dock .dk-trash.full{background:rgba(255,255,255,.55)!important}.dk-dock .dk-trash.over{background:var(--ink)!important}
.dk-dock .dk-sep{height:calc(20px + 14px * var(--k));transition:height .14s}

.dk-w-body{position:relative}

/* Gel in finestra: immagine a sinistra, comandi in una colonna a destra */
.lab-gel-emb .lab-gel-body{grid-template-columns:minmax(0,1fr) 300px!important;grid-template-rows:auto minmax(0,1fr)!important;gap:8px 10px}
.lab-gel-emb .lab-gel-body>.gs-steps,.lab-gel-emb .lab-gel-body>.gs-rail{grid-column:1/-1;grid-row:1}
.lab-gel-emb .lab-gel-main{grid-column:1;grid-row:2;order:initial;min-height:0}
.lab-gel-emb .gs-side{grid-column:2;grid-row:2;order:initial;display:block!important;column-width:auto!important;columns:auto!important;overflow-x:hidden!important;overflow-y:auto!important;padding:4px 12px 12px!important}
.lab-gel-emb .gs-sidecol{display:block}
.lab-gel-emb .gs-help{display:block}

.lab-gel-emb .gs-num{width:48px!important}

/* maniglie di ridimensionamento (sopra anche al contenuto, che può avere z-index alti) */
.dk-rs{position:absolute;z-index:10001;touch-action:none;background:none}
.dk-rs-r{top:34px;right:0;width:8px;bottom:14px;cursor:ew-resize}.dk-rs-l{top:34px;left:0;width:8px;bottom:14px;cursor:ew-resize}
.dk-rs-b{left:14px;right:14px;bottom:0;height:8px;cursor:ns-resize}
.dk-rs-br{right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;background:linear-gradient(135deg,transparent 55%,rgba(23,24,27,.28) 55%,rgba(23,24,27,.28) 62%,transparent 62%,transparent 72%,rgba(23,24,27,.28) 72%,rgba(23,24,27,.28) 79%,transparent 79%)}
.dk-rs-bl{left:0;bottom:0;width:18px;height:18px;cursor:nesw-resize}

.dk-rs-r,.dk-rs-l{height:auto!important}.dk-rs-b{width:auto!important}

/* Gel in finestra: fondo grigio, così caselle e tasti bianchi si vedono */
.lab-gel-emb .lab-gel-back,.lab-gel-emb .lab-gel-win{--paper:#E9EAEE;--soft:#DEE0E6;--line:#C6C9D1;--surface:#fff;background:#E9EAEE!important}
.lab-gel-emb .gs-side{background:#F4F4F7!important;border:1px solid #C6C9D1!important}
.lab-gel-emb .fld,.lab-gel-emb input:not([type=range]):not([type=checkbox]):not([type=color]),.lab-gel-emb select{background:#fff!important;border:1px solid #AEB2BD!important}
.lab-gel-emb .lab-ib,.lab-gel-emb .gs-tool,.lab-gel-emb .lab-chip,.lab-gel-emb .gs-mini{background:#fff;border:1px solid #AEB2BD}
.lab-gel-emb .lab-ib.done,.lab-gel-emb .gs-tool.on,.lab-gel-emb .lab-chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.lab-gel-emb .gs-step{background:#fff;border:1px solid #C6C9D1}

/* finestre delle voci: fondo grigio, caselle e tasti bianchi con bordo */
.dk-w:not(.dark) .m-screen,.dk-w:not(.dark) .m-scroll{background:#EDEEF2!important}
.dk-w:not(.dark) .m-screen input:not([type=checkbox]):not([type=range]):not([type=radio]),.dk-w:not(.dark) .m-screen select,.dk-w:not(.dark) .m-screen textarea{background:#fff!important;border:1px solid #AEB2BD!important}
.dk-w:not(.dark) .m-row,.dk-w:not(.dark) .m-chips button{background:#fff}
.dk-w:not(.dark) .m-edit .lab-pane-head,.dk-w .m-edit .lab-pane-head{background:#EDEEF2!important}

.dk-w:not(.dark) .m-chips button.on{background:var(--ink);color:#fff;border-color:var(--ink)}

/* finestre colorate: lavanda, pesca e lime come lo sfondo dell'app, caselle bianche */
.dk-w:not(.dark) .m-screen,.dk-w:not(.dark) .m-scroll,.dk-w:not(.dark) .m-edit .lab-pane-head,.dk-w .m-edit .lab-pane-head{background:transparent!important}
.dk-w:not(.dark) .dk-w-body{background:radial-gradient(70% 60% at 100% 0%,rgba(225,234,76,.55),transparent 62%),radial-gradient(70% 70% at 0% 30%,rgba(196,186,246,.85),transparent 64%),radial-gradient(80% 60% at 70% 110%,rgba(252,205,180,.8),transparent 64%),#E6E1F7}
.dk-w:not(.dark)>header{background:#D9D2F4!important;border-bottom-color:rgba(23,24,27,.18)}
.dk-w:not(.dark) .m-edit section,.dk-w:not(.dark) .m-edit .lab-card,.dk-w:not(.dark) .m-scroll section{background:rgba(255,255,255,.62)}
.lab-gel-emb .lab-gel-back,.lab-gel-emb .lab-gel-win{background:radial-gradient(70% 60% at 100% 0%,rgba(225,234,76,.55),transparent 62%),radial-gradient(70% 70% at 0% 30%,rgba(196,186,246,.85),transparent 64%),radial-gradient(80% 60% at 70% 110%,rgba(252,205,180,.8),transparent 64%),#E6E1F7!important}
.lab-gel-emb .gs-side{background:rgba(255,255,255,.62)!important;border-color:rgba(23,24,27,.16)!important}
.ap-side,.ex-left{background:#E4DFF8}.uf-foot{background:#E4DFF8}

.dk-w .m-edit .lab-pane-head{flex-wrap:wrap!important;max-width:100%}.dk-w .m-edit .lab-pane-actions{flex-wrap:wrap!important;justify-content:flex-end;max-width:100%}

/* finestre, menu e avvisi della scrivania: vetro come nel resto di URBIOS (materiale spesso, bordo chiaro, ombra morbida) */
html[data-look='vetro'] .dk-w:not(.dark),html[data-look='vetro'] .dk-win,html[data-look='vetro'] .dk-doc,html[data-look='vetro'] .dk-ask{background:var(--v-material-thick)!important;-webkit-backdrop-filter:var(--v-blur);backdrop-filter:var(--v-blur);border:1px solid var(--v-edge);border-radius:24px;box-shadow:var(--v-shadow-hi)}
html[data-look='vetro'] .dk-w:not(.dark).front{border-color:#fff;box-shadow:0 30px 70px -20px rgba(70,60,30,.38)}
html[data-look='vetro'] .dk-w:not(.dark)>header,html[data-look='vetro'] .dk-win header,html[data-look='vetro'] .dk-doc>header{background:rgba(255,255,255,.45)!important;border-bottom:1px solid rgba(23,24,27,.07)}
html[data-look='vetro'] .dk-w:not(.dark) .m-edit .lab-pane-head{background:rgba(255,255,255,.6)}
html[data-look='vetro'] .dk-win-back{background:rgba(23,24,27,.22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-menu{background:var(--v-material-thick)!important;-webkit-backdrop-filter:var(--v-blur)!important;backdrop-filter:var(--v-blur)!important;border:1px solid var(--v-edge);border-radius:16px;box-shadow:var(--v-shadow-hi);padding:6px}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-menu button{border-radius:10px}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-menu button:hover{background:rgba(23,24,27,.07);color:var(--ink)}
html[data-look='vetro'] .dk-toast{background:rgba(23,24,27,.82);-webkit-backdrop-filter:var(--v-blur);backdrop-filter:var(--v-blur);border-radius:999px;padding:9px 16px}
html[data-look='vetro'] .dk-screen:not(.is-dark){border-radius:28px;border:1px solid var(--v-edge);box-shadow:var(--v-shadow)}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-item.on{background:rgba(255,255,255,.55);box-shadow:0 0 0 1px var(--v-edge)}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-file svg{fill:rgba(255,255,255,.85)}
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-folder svg{fill:rgba(255,255,255,.6)}
html[data-look='vetro'] .dk-chips button{background:rgba(255,255,255,.6)}
html[data-look='vetro'] .ap-side,html[data-look='vetro'] .ex-left,html[data-look='vetro'] .uf-foot{background:rgba(201,195,242,.35)}
html[data-look='vetro'] .dk-w:not(.dark) :is(.m-screen,.m-shell,.m-scroll),html[data-look='vetro'] .dk-doc :is(.m-screen,.m-scroll),html[data-look='vetro'] .dk-win .dk-grid{background:transparent!important}
html[data-look='vetro'] .dk-w:not(.dark) .dk-w-body,html[data-look='vetro'] .dk-doc-body{background:transparent!important}

/* sottomenu e tasti della scrivania a vetro */
html[data-look='vetro'] .dk-screen:not(.is-dark) .dk-menu{background:rgba(255,255,255,.96)!important}
html[data-look='vetro'] .dk-bgset .dk-chips button{height:32px;padding:0 14px;font-weight:600;transition:border-color .2s,background-color .2s}
html[data-look='vetro'] .dk-bgset .dk-chips button:hover:not(.on){border-color:var(--ink)}
html[data-look='vetro'] .dk-w:not(.dark){--ap:var(--ink)}
html[data-look='vetro'] .ap-title-bar{background:rgba(255,255,255,.5);color:var(--ink);border-bottom:1px solid rgba(23,24,27,.07)}
html[data-look='vetro'] .ap-title-bar button{color:var(--muted)}html[data-look='vetro'] .ap-title-bar button:hover{color:var(--ink)}
html[data-look='vetro'] .ap-filebtn{border:1px solid rgba(23,24,27,.18)!important;color:var(--ink)!important;border-radius:999px!important}html[data-look='vetro'] .ap-filebtn.on{background:var(--ink)!important;color:#fff!important}
html[data-look='vetro'] .ap-tab.on{background:rgba(255,255,255,.85)!important;color:var(--ink)!important;border-radius:999px!important;margin-top:0;height:26px;box-shadow:0 0 0 1px var(--v-edge)}
html[data-look='vetro'] .ap-doc{color:var(--muted)}
html[data-look='vetro'] .ap-ribbon{background:rgba(255,255,255,.4);border-bottom:1px solid rgba(23,24,27,.07)}
html[data-look='vetro'] .ap-grp{border-right-color:rgba(23,24,27,.08)}
html[data-look='vetro'] .ap-r,html[data-look='vetro'] .ap-big,html[data-look='vetro'] .ap-sel,html[data-look='vetro'] .ap-chip,html[data-look='vetro'] .ap-find{border-radius:10px}
html[data-look='vetro'] .ap-sel,html[data-look='vetro'] .ap-chip,html[data-look='vetro'] .ap-find{background:rgba(255,255,255,.7);border:1px solid rgba(23,24,27,.1)}
html[data-look='vetro'] .ap-r.on{background:rgba(255,255,255,.9);border-color:rgba(23,24,27,.2)}
html[data-look='vetro'] .ap-chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
html[data-look='vetro'] .ap-side{background:rgba(255,255,255,.4)}
html[data-look='vetro'] .ap-new{background:var(--ink);border-radius:50%}
html[data-look='vetro'] .ap-canvas,html[data-look='vetro'] .ap-empty{background:rgba(23,24,27,.05)}
html[data-look='vetro'] .ap-page{border-radius:6px;box-shadow:var(--v-shadow)}
html[data-look='vetro'] .ap-status{background:rgba(255,255,255,.5);color:var(--muted);border-top:1px solid rgba(23,24,27,.07)}
html[data-look='vetro'] .ap-stbtn:hover,html[data-look='vetro'] .ap-zoom button{color:var(--ink)}html[data-look='vetro'] .ap-zoom input{accent-color:var(--ink)}
html[data-look='vetro'] .ap-row textarea.h4{background:rgba(23,24,27,.05)}
html[data-look='vetro'] .m-pillbtn{border-radius:999px;height:40px}
html[data-look='vetro'] .m-pillbtn.m-word{background:var(--ink)}
html[data-look='vetro'] .m-pillbtn.light{background:rgba(255,255,255,.7);border:1px solid var(--v-edge);box-shadow:0 1px 3px rgba(23,24,27,.08);-webkit-backdrop-filter:var(--v-blur);backdrop-filter:var(--v-blur)}
html[data-look='vetro'] .m-ib:hover:not(:disabled){background:rgba(23,24,27,.06)}
html[data-look='vetro'] .dk-w:not(.dark) .m-ib:active{background:rgba(23,24,27,.1)}

/* Gel in finestra: regolatori, tasti e campi a vetro */
html[data-look='vetro'] .lab-gel-emb .lab-gel-back,html[data-look='vetro'] .lab-gel-emb .lab-gel-win{--paper:transparent;--soft:rgba(255,255,255,.5);--line:rgba(23,24,27,.1);--surface:rgba(255,255,255,.7);background:transparent!important}
html[data-look='vetro'] .lab-gel-emb .gs-side{background:rgba(255,255,255,.5)!important;border:1px solid var(--v-edge)!important;border-radius:20px;box-shadow:var(--v-shadow)}
html[data-look='vetro'] .lab-gel-emb .gs-prop,html[data-look='vetro'] .lab-gel-emb .gs-sidecol>.gs-prop{border-color:rgba(23,24,27,.08)}
html[data-look='vetro'] .lab-gel-emb .fld,html[data-look='vetro'] .lab-gel-emb input:not([type=range]):not([type=checkbox]):not([type=color]),html[data-look='vetro'] .lab-gel-emb select{background:rgba(255,255,255,.72)!important;border:1px solid rgba(23,24,27,.1)!important;border-radius:10px}
html[data-look='vetro'] .lab-gel-emb .fld:focus,html[data-look='vetro'] .lab-gel-emb input:not([type=range]):focus{border-color:var(--ink)!important;box-shadow:0 0 0 4px rgba(23,24,27,.07)}
html[data-look='vetro'] .lab-gel-emb .lab-ib,html[data-look='vetro'] .lab-gel-emb .gs-tool,html[data-look='vetro'] .lab-gel-emb .lab-chip,html[data-look='vetro'] .lab-gel-emb .gs-mini,html[data-look='vetro'] .lab-gel-emb .gs-step{background:rgba(255,255,255,.7);border:1px solid rgba(23,24,27,.1);color:var(--ink);transition:border-color .2s,background-color .2s}
html[data-look='vetro'] .lab-gel-emb .lab-ib,html[data-look='vetro'] .lab-gel-emb .lab-chip,html[data-look='vetro'] .lab-gel-emb .gs-step{border-radius:999px}
html[data-look='vetro'] .lab-gel-emb .lab-ib:hover:not(:disabled),html[data-look='vetro'] .lab-gel-emb .gs-tool:hover,html[data-look='vetro'] .lab-gel-emb .lab-chip:hover,html[data-look='vetro'] .lab-gel-emb .gs-mini:hover:not(:disabled),html[data-look='vetro'] .lab-gel-emb .gs-step:hover{background:rgba(255,255,255,.9);border-color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .lab-ib.on,html[data-look='vetro'] .lab-gel-emb .lab-ib.done,html[data-look='vetro'] .lab-gel-emb .gs-tool.on,html[data-look='vetro'] .lab-gel-emb .lab-chip.on,html[data-look='vetro'] .lab-gel-emb .gs-step.on{background:var(--ink);color:#fff;border-color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .lab-ib:disabled{opacity:.4}
html[data-look='vetro'] .lab-gel-emb .gs-pill{background:rgba(255,255,255,.6);border:1px solid rgba(23,24,27,.1);border-radius:999px}
html[data-look='vetro'] .lab-gel-emb .gs-circ{background:rgba(255,255,255,.9);border:1px solid rgba(23,24,27,.12);color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-circ:hover{border-color:var(--ink);color:var(--ink)}html[data-look='vetro'] .lab-gel-emb .gs-circ:active{background:var(--ink);border-color:var(--ink);color:#fff}
html[data-look='vetro'] .lab-gel-emb .gs-pill .gs-num{background:transparent!important;border:0!important;box-shadow:none!important}
html[data-look='vetro'] .lab-gel-emb .gs-pill .gs-num:focus{background:#fff!important;box-shadow:0 0 0 1.5px var(--ink)!important}
html[data-look='vetro'] .lab-gel-emb .gs-hist-box{background:rgba(255,255,255,.55);border-color:rgba(23,24,27,.1);border-radius:12px}
html[data-look='vetro'] .lab-gel-emb .gs-curve{stroke:var(--ink)}html[data-look='vetro'] .lab-gel-emb .gs-cp{border-color:var(--ink)}html[data-look='vetro'] .lab-gel-emb .gs-cp.on{background:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-prop.on>h4{color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-rng input[type=range]::-webkit-slider-runnable-track{background:linear-gradient(90deg,var(--ink) var(--p),rgba(23,24,27,.12) var(--p))}
html[data-look='vetro'] .lab-gel-emb .gs-rng input[type=range]::-webkit-slider-thumb{border-color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-lbl,html[data-look='vetro'] .lab-gel-emb .gs-help,html[data-look='vetro'] .lab-gel-emb .gs-gh{color:var(--muted)}

.dk-dock{transition:gap .22s ease,padding .22s ease,border-radius .22s ease}.dk-dock .dk-app{transition:width .22s ease,height .22s ease,transform .12s}.dk-dock .dk-sep{transition:height .22s ease}

/* Gel in finestra: ordine e gerarchia. Tutto visibile, niente fisarmoniche: gruppi con titolo, tasti in griglia, regolatori incolonnati */
.lab-gel-emb .lab-gel-body{grid-template-columns:minmax(0,1fr) 340px!important}
html[data-look='vetro'] .lab-gel-emb .gs-side{background:rgba(23,24,27,.035)!important;padding:0 14px 16px!important}
html[data-look='vetro'] .lab-gel-emb .gs-sidecol{display:block}
html[data-look='vetro'] .lab-gel-emb .gs-prop{display:grid;gap:14px!important;padding:40px 0 36px!important;border-bottom:1px solid rgba(23,24,27,.2)!important;container-type:normal}
html[data-look='vetro'] .lab-gel-emb .gs-prop:last-child{border-bottom:0}
html[data-look='vetro'] .lab-gel-emb .gs-prop>h4{margin:0;font:700 11.5px/1.2 inherit;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);display:flex;align-items:center;gap:8px}
html[data-look='vetro'] .lab-gel-emb .gs-prop>h4::after{content:'';flex:1;height:1px;background:rgba(23,24,27,.1)}
html[data-look='vetro'] .lab-gel-emb .gs-help{display:block;margin:0;font-size:12px;line-height:1.4;color:var(--muted)}
html[data-look='vetro'] .lab-gel-emb .gs-lbl{font-size:12px;font-weight:600;color:var(--ink);margin:2px 0 0}
/* tasti: griglia a due colonne, stessa altezza, testo leggibile */
html[data-look='vetro'] .lab-gel-emb .gs-btns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:stretch}
html[data-look='vetro'] .lab-gel-emb .gs-btns.four{grid-template-columns:repeat(2,minmax(0,1fr))}
html[data-look='vetro'] .lab-gel-emb .gs-btns>.lab-ib:only-child{grid-column:1/-1}
html[data-look='vetro'] .lab-gel-emb .lab-ib{height:36px;min-width:0;padding:0 12px;justify-content:center;font:600 13px inherit;background:#fff;border:1px solid rgba(23,24,27,.26);color:var(--ink);box-shadow:0 1px 2px rgba(23,24,27,.06)}
html[data-look='vetro'] .lab-gel-emb .lab-ib:hover:not(:disabled){background:#fff;border-color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .lab-ib:disabled{opacity:1;background:rgba(23,24,27,.05);border-color:rgba(23,24,27,.12);color:rgba(23,24,27,.4);box-shadow:none}
html[data-look='vetro'] .lab-gel-emb .lab-ib.on{background:var(--ink);color:#fff;border-color:var(--ink);box-shadow:none}
html[data-look='vetro'] .lab-gel-emb .gs-btns.four .lab-ib{padding:0 8px;font-size:12.5px}
/* regolatori: etichetta | pillola di larghezza fissa | ripristina, tutti sulle stesse colonne */
html[data-look='vetro'] .lab-gel-emb .gs-rng{display:grid;grid-template-columns:minmax(0,1fr) 116px 26px;grid-template-areas:'l p r';align-items:center;gap:8px;min-height:36px}
html[data-look='vetro'] .lab-gel-emb .gs-rng-l{grid-area:l;font-size:13px;font-weight:500;color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-pill{grid-area:p;height:36px;padding:0 3px;gap:0;justify-content:space-between;background:#fff;border:1px solid rgba(23,24,27,.26);border-radius:999px;box-shadow:0 1px 2px rgba(23,24,27,.06)}
html[data-look='vetro'] .lab-gel-emb .gs-rng .gs-mini{grid-area:r;width:26px;height:26px;border-radius:50%;background:#fff}
html[data-look='vetro'] .lab-gel-emb .gs-circ{width:28px;height:28px;background:rgba(23,24,27,.07);border:0;font-size:17px}
html[data-look='vetro'] .lab-gel-emb .gs-pill .gs-num{flex:1;min-width:0;width:auto!important;height:28px;text-align:center;font:600 13px inherit;padding:0}
html[data-look='vetro'] .lab-gel-emb .gs-mini:disabled{opacity:.3}
html[data-look='vetro'] .lab-gel-emb .gs-hist canvas{height:150px!important}
html[data-look='vetro'] .lab-gel-emb .gs-hist-info{font-size:11.5px}
html[data-look='vetro'] .lab-gel-emb .lab-sws{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}html[data-look='vetro'] .lab-gel-emb .lab-sw{justify-content:space-between;font-size:12.5px;font-weight:500;color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-nav{border-top:1px solid rgba(23,24,27,.1)}

/* contatore (− numero +): resta in riga, non nella griglia dei tasti */
html[data-look='vetro'] .lab-gel-emb .gs-btns:has(>.lab-num){grid-template-columns:44px minmax(0,1fr) 44px;align-items:center}
html[data-look='vetro'] .lab-gel-emb .gs-btns>.lab-num{text-align:center;font-size:18px;font-weight:700;color:var(--ink)}
html[data-look='vetro'] .lab-gel-emb .gs-btns:has(>.lab-num)>.lab-ib{padding:0;width:44px}

/* pallini dei colori: cerchi perfetti */
.lab-gel-emb .lab-dot,html[data-look='vetro'] .lab-gel-emb .lab-dot{width:24px;height:24px;min-width:24px;min-height:24px;max-width:24px;max-height:24px;aspect-ratio:1;padding:0;border-radius:50%}
html[data-look='vetro'] .lab-gel-emb .gs-tint{gap:10px}

/* maniglie sul gel: colore inverso a quello dell'immagine sotto, così si vedono su gel chiari e scuri */
.lab-gel-emb .lab-lane-h:not(.cut),.lab-gel-win .lab-lane-h:not(.cut){background:#fff;border:2px solid #fff;mix-blend-mode:difference;box-shadow:none}

.ga-bar{display:flex;gap:8px;padding:8px 12px 0;flex:none}.ga-bar .m-pillbtn{height:34px;padding:0 14px;font-size:13px;display:inline-flex;align-items:center;gap:6px}

.ga-bar{position:relative;z-index:1000}
.ga-pick-back{position:absolute;inset:0;z-index:10000}
.ga-pick{position:absolute;left:12px;top:4px;z-index:10001;width:min(320px,calc(100% - 24px));max-height:260px;overflow-y:auto;background:rgba(255,255,255,.96);border:1px solid var(--v-edge,rgba(23,24,27,.12));border-radius:16px;box-shadow:0 18px 40px -14px rgba(70,60,30,.35);padding:8px;display:flex;flex-direction:column;gap:2px}
.ga-pick b{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px;color:var(--muted)}
.ga-pick p{margin:0;padding:8px;font-size:13px;color:var(--muted)}
.ga-pick button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 10px;border-radius:10px;font-size:13.5px;color:var(--ink)}
.ga-pick button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ga-pick button em{font-style:normal;font-size:11.5px;color:var(--muted)}
.ga-pick button:hover{background:rgba(23,24,27,.07)}
.dk-boot{position:absolute;inset:0;z-index:20000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#0F1012;color:#fff;transition:opacity .9s ease,filter .9s ease;cursor:default}
.dk-boot.out{opacity:0;filter:blur(30px);pointer-events:none}
.dk-boot span{font-size:13px;font-weight:500;letter-spacing:.45em;margin-right:-.45em;opacity:.85}
.dk-boot i{width:150px;height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:14px}
.dk-boot i b{display:block;height:100%;width:100%;background:#fff;border-radius:3px;transform-origin:left;animation:dk-boot-bar 1.7s cubic-bezier(.4,.1,.3,1) both}
@keyframes dk-boot-bar{from{transform:scaleX(.58)}to{transform:scaleX(1)}}
.m-screen.dk{animation:none!important}
.dk-marq{position:absolute;z-index:5;pointer-events:none;border:1px solid rgba(23,24,27,.5);background:rgba(23,24,27,.07);border-radius:4px}.dk-screen.is-dark .dk-marq{border-color:rgba(255,255,255,.7);background:rgba(255,255,255,.12)}
.dk-field{user-select:none}
.dk-screen,.dk-screen *{-webkit-user-select:none;user-select:none}.dk-screen input,.dk-screen textarea,.dk-screen .dk-w [contenteditable],.dk-screen .dk-w .dk-doc,.dk-screen .dk-w .dk-doc *{-webkit-user-select:text;user-select:text}
`;
