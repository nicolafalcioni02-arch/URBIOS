export const agendaStyles = `
.ag-wrap { height: 100%; overflow-y: auto; background: var(--paper); }
.ag-top { display: flex; align-items: center; gap: 12px; padding: 18px 24px 8px; max-width: 1400px; margin: 0 auto; flex-wrap: wrap; }
.ag-title { font-weight: 600; font-size: 34px; line-height: 1; letter-spacing: -.035em; color: var(--ink); }
.ag-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; padding: 8px 24px 40px; max-width: 1400px; margin: 0 auto; align-items: start; }
@media (max-width: 960px) { .ag-layout { grid-template-columns: 1fr; padding: 8px 14px 40px; } .ag-top { padding: 14px; } .ag-title { font-size: 30px; } }
.ag-side { display: flex; flex-direction: column; gap: 14px; }
.ag-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 16px; }
.ag-card h4 { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: .04em; text-transform: uppercase; margin-bottom: 10px; }
.ag-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.ag-bar h2 { font-size: 18px; font-weight: 600; text-transform: capitalize; flex: 1; min-width: 160px; }
.ag-icon { width: 36px; height: 36px; border-radius: 999px; border: 1px solid var(--line); background: #fff; display: grid; place-items: center; font-size: 16px; transition: border-color .2s, transform .2s var(--ease); } .ag-icon:hover { border-color: var(--ink); } .ag-icon:active { transform: scale(.94); }
.ag-views { display: inline-flex; background: var(--soft); border-radius: 999px; padding: 3px; }
.ag-views button { height: 32px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--muted); } .ag-views button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
.ag-main { background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 16px; min-width: 0; }

/* prossimi */
.ag-card h4 { display: flex; align-items: center; gap: 6px; }
.ag-next { display: flex; flex-direction: column; gap: 6px; }
.ag-next button { display: flex; align-items: center; gap: 11px; text-align: left; padding: 7px; border-radius: 16px; transition: background-color .15s, transform .15s var(--ease); } .ag-next button:hover { background: var(--soft); } .ag-next button:active { transform: scale(.98); }
.ag-next .tile { flex: none; width: 44px; height: 46px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 14px; color: var(--ink);
    background: radial-gradient(120% 150% at 100% 0%, color-mix(in srgb, var(--p) 50%, #fff), transparent 75%), #fff; box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 .5px color-mix(in srgb, var(--p) 30%, #e6e4de); }
.ag-next .tile small { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: color-mix(in srgb, var(--p) 80%, #000); line-height: 1; } .ag-next .tile b { font-size: 18px; font-weight: 700; line-height: 1.15; }
.ag-next .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ag-next .what { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ag-next .meta { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ag-empty { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); } .ag-empty i { font-size: 18px; }
.ag-set { display: flex; flex-direction: column; gap: 10px; }
.ag-set h4 { margin-bottom: 0; }
.ag-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ag-stats div { padding: 10px 12px; border-radius: 16px; background: var(--soft); display: flex; flex-direction: column; } .ag-stats b { font-size: 26px; font-weight: 700; line-height: 1.05; color: var(--ink); } .ag-stats span { font-size: 11.5px; color: var(--muted); }
.ag-kv { display: flex; gap: 9px; align-items: flex-start; font-size: 12.5px; color: var(--muted); line-height: 1.4; } .ag-kv i { font-size: 16px; color: var(--ink); margin-top: 1px; flex: none; } .ag-kv b { color: var(--ink); font-weight: 600; }
.ag-sedi { display: flex; flex-direction: column; gap: 6px; }
.ag-sedi span { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 500; color: var(--ink); min-width: 0; }
.ag-sedi em { flex: none; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 8px; font-style: normal; font-size: 9.5px; font-weight: 700; color: #fff; background: linear-gradient(155deg, color-mix(in srgb, var(--p) 80%, #fff), var(--p) 55%, color-mix(in srgb, var(--p) 78%, #000)); box-shadow: inset 0 1px 0 rgba(255,255,255,.5); }
.ag-link { font-size: 12.5px; font-weight: 600; color: var(--accent); text-align: left; }
.ag-title-pick { position: relative; display: inline-flex; align-items: center; gap: 6px; flex: 1; min-width: 160px; cursor: pointer; } .ag-title-pick h2 { flex: none; } .ag-title-pick i { font-size: 13px; color: var(--muted); }
.ag-title-pick input { position: absolute; inset: 0; opacity: 0; width: 100%; cursor: pointer; }
.ag-bar h2 { flex: none !important; min-width: 0 !important; }

/* timeline */
.ag-tl { display: flex; flex-direction: column; min-width: 0; }
.ag-tl-head { display: grid; border-bottom: 1px solid var(--line); }
.ag-colhead { display: flex; flex-direction: column; align-items: center; padding: 6px 0 8px; position: relative; } .ag-colhead small { font-size: 11px; color: var(--muted); text-transform: capitalize; } .ag-colhead b { font-size: 18px; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 99px; }
.ag-colhead.today b { background: var(--ink); color: #fff; } .ag-bday { position: absolute; top: 4px; right: 8px; font-size: 14px; }
.ag-tl-scroll { max-height: 640px; overflow-y: auto; scrollbar-width: thin; }
.ag-tl-body { display: grid; position: relative; }
.ag-hours { position: relative; } .ag-hours span { position: absolute; right: 8px; font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }
.ag-col { position: relative; background: var(--soft); border-left: 1px solid var(--line); cursor: cell; }
.ag-work { position: absolute; left: 0; right: 0; background: #fff; }
.ag-line { position: absolute; left: 0; right: 0; height: 1px; background: var(--line); pointer-events: none; }
.ag-now { position: absolute; left: 0; right: 0; height: 2px; background: #E5675F; z-index: 4; pointer-events: none; } .ag-now::before { content: ''; position: absolute; left: -4px; top: -3px; width: 8px; height: 8px; border-radius: 99px; background: #E5675F; }
/* banner degli appuntamenti: base bianca, sfumatura del colore della sede, riflesso lucido (come su telefono) */
.ag-appt { position: absolute; z-index: 3; overflow: hidden; isolation: isolate; text-align: left; padding: 5px 9px; border-radius: 12px; color: var(--ink); display: flex; flex-direction: column; gap: 1px; cursor: pointer;
    background: radial-gradient(110% 160% at 100% 0%, color-mix(in srgb, var(--p) 62%, #fff) 0%, color-mix(in srgb, var(--p) 26%, #fff) 45%, transparent 85%), radial-gradient(70% 120% at 0% 100%, color-mix(in srgb, var(--p) 14%, #fff), transparent 70%), linear-gradient(160deg, #fff, #fbfaf8);
    box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 .5px color-mix(in srgb, var(--p) 24%, #e6e4de), 0 1px 2px rgba(18,19,23,.06); transition: transform .15s var(--ease), box-shadow .15s; }
.ag-appt::after { content: ''; position: absolute; z-index: -1; left: -10%; right: -10%; top: -1px; height: 45%; border-radius: 0 0 55% 55% / 0 0 40% 40%; background: linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,0)); pointer-events: none; }
.ag-pmark { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 8px; font-style: normal; font-size: 10px; font-weight: 700; color: #fff; letter-spacing: .02em;
    background: radial-gradient(90% 70% at 30% 0%, rgba(255,255,255,.5), transparent 70%), linear-gradient(155deg, color-mix(in srgb, var(--p) 80%, #fff), var(--p) 55%, color-mix(in srgb, var(--p) 78%, #000)); box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 2px 4px -1px rgba(18,19,23,.2); }
.ag-pmark i { position: static; font-size: 13px; color: #fff; }
.ag-appt .ag-done { color: var(--ok); }
.ag-appt.short { flex-direction: row; align-items: center; gap: 8px; padding: 0 9px; } .ag-appt.short b { flex: 0 1 auto; min-width: 0; } .ag-appt.short span { flex: none; }
.ag-appt.short .ag-pmark { position: static; flex: none; width: 20px; height: 20px; border-radius: 7px; margin-left: auto; order: 3; font-size: 9px; }
.ag-appt:hover { transform: scale(1.02); box-shadow: inset 0 1.5px 0 #fff, 0 8px 18px -8px rgba(18,19,23,.35); z-index: 5; }
.ag-appt b { font-size: 12.5px; font-weight: 600; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ag-appt span { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-appt i { position: absolute; top: 4px; right: 5px; color: var(--ok); font-size: 14px; }
.ag-appt.st-completato { opacity: .75; } .ag-appt.st-assente { border-left-color: #E5675F; background: #FBECEA; } .ag-appt.ghost { opacity: .45; background: repeating-linear-gradient(135deg, #eee 0 6px, #f6f6f6 6px 12px); border-left-color: #B5B3AE; } .ag-appt.ghost b { text-decoration: line-through; }

/* mese */
.ag-month { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.ag-mh { padding: 6px; font-size: 11px; text-align: center; color: var(--muted); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--soft); }
.ag-cell { min-height: 104px; padding: 4px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); cursor: pointer; display: flex; flex-direction: column; gap: 2px; min-width: 0; transition: background-color .15s; } .ag-cell:hover { background: #FAF9F6; }
.ag-cell.out { background: var(--soft); opacity: .6; } .ag-cell.sel { box-shadow: inset 0 0 0 2px var(--ink); }
.ag-num { font-size: 12.5px; font-weight: 600; display: flex; justify-content: space-between; padding: 2px 4px; } .ag-cell.today .ag-num { color: var(--accent); } .ag-num em { font-style: normal; }
.ag-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 5px; border-radius: 7px; background: radial-gradient(120% 200% at 100% 0%, color-mix(in srgb, var(--p) 30%, #fff), transparent 70%), #fff; box-shadow: inset 0 0 0 .5px color-mix(in srgb, var(--p) 25%, #e6e4de); text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ag-chip i { width: 6px; height: 6px; border-radius: 99px; background: var(--p); flex: none; } .ag-chip span { font-weight: 600; flex: none; }
.ag-more { font-size: 10.5px; color: var(--muted); padding-left: 4px; }
.ag-places { display: flex; gap: 8px; overflow-x: auto; padding: 0 0 12px; }
.ag-places button { flex: none; display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 13px; border-radius: 999px; background: #fff; border: 1px solid var(--line); font-size: 13px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background-color .2s, color .2s; }
.ag-places button.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.ag-places .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
/* tablet in verticale: il calendario sta in alto, sotto mese, prossimi e studio affiancati */
@media (min-width: 640px) and (max-width: 959px) {
    .ag-layout { padding: 8px 20px 40px; gap: 16px; } .ag-main { order: -1; }
    .ag-side { display: grid; grid-template-columns: 1fr 1fr; align-items: start; } 
    .ag-tl-scroll { max-height: 560px; }
}
@media (max-width: 700px) { .ag-cell { min-height: 70px; } .ag-chip span { display: none; } }

/* scheda appuntamento */
.ag-back { position: fixed; inset: 0; z-index: 80; background: rgba(18,19,23,.34); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 16px; animation: rise .25s var(--ease); }
.ag-sheet { background: #fff; width: 100%; max-width: 480px; max-height: calc(100vh - 32px); overflow-y: auto; border-radius: 24px; padding: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.3); }
.ag-sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; } .ag-sheet-head h3 { font-size: 20px; font-weight: 600; }
.ag-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ag-chips button { height: 34px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-size: 13px; font-weight: 600; } .ag-chips button.on { background: var(--ink); border-color: var(--ink); color: #fff; } .ag-chips button small { opacity: .6; font-weight: 500; }
.ag-dur { width: 76px; height: 34px; border-radius: 999px; border: 1px solid var(--line); padding: 0 10px; font-size: 13px; font-weight: 600; text-align: center; }
.ag-notes { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; } .ag-notes p { font-size: 12.5px; color: var(--muted); display: flex; gap: 6px; line-height: 1.35; } .ag-notes p.warn { color: #9A5B0B; background: #FBF1D9; border-radius: 10px; padding: 7px 10px; }
.ag-hint { font-size: 12px; color: var(--muted); margin-top: 6px; }
.ag-sheet-actions { display: flex; align-items: center; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
.ag-danger, .ag-ghost { height: 44px; padding: 0 14px; border-radius: 999px; font-size: 13.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); } .ag-danger { color: var(--bad); } .ag-danger:hover { border-color: var(--bad); } .ag-ghost:hover { border-color: var(--ink); }

/* ---- telefono (AgendaMobile) ---- */
.agm .m-nav { background: color-mix(in srgb, var(--paper) 80%, transparent); }
.agm-today { background: var(--surface); color: var(--ink); border: .5px solid var(--line); margin-left: 6px; }
.agm-month { display: flex; align-items: baseline; gap: 8px; padding: 6px 20px 2px; font-weight: 600; font-size: 30px; line-height: 1.1; letter-spacing: -.035em; color: var(--ink); }
.agm-month span { font-family: inherit; font-size: 20px; color: var(--muted); }
.agm-month i { align-self: center; font-size: 15px; color: var(--muted); transition: transform .3s var(--ease); font-style: normal; }
.agm-month i.up { transform: rotate(180deg); }
.agm-grid { display: grid; grid-template-columns: repeat(7, 1fr); row-gap: 2px; }
.agm-grid > b { text-align: center; font-size: 11px; font-weight: 600; color: var(--muted); padding-bottom: 4px; }
.agm-week { margin: 10px 10px 4px; overflow: hidden; touch-action: pan-y; }
.agm-week .agm-d { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 4px; border-radius: 16px; transition: background-color .2s; }
.agm-week .agm-d b { font-size: 11px; font-weight: 600; color: var(--muted); }
.agm-week .agm-d span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; font-size: 17px; font-weight: 600; color: var(--ink); transition: background-color .25s, color .25s, transform .25s var(--ease); }
.agm-week .agm-d.today span { color: var(--accent); }
.agm-week .agm-d.sel span { background: var(--ink); color: #fff; }
.agm-week .agm-d.today.sel span { background: var(--accent); }
.agm-week .agm-d:active span { transform: scale(.9); }
.agm-d i { width: 5px; height: 5px; border-radius: 50%; background: var(--ink); opacity: .45; }
.agm-d i.none { opacity: 0; }
.agm-cal { margin: 6px 12px 4px; padding: 6px 6px 10px; background: var(--surface); border-radius: 20px; }
.agm-cal-nav { display: flex; justify-content: flex-end; margin-bottom: 2px; }
.agm-cal .agm-d { position: relative; width: 40px; height: 40px; min-height: 0; margin: 1px auto; display: grid; place-items: center; font-size: 15px; font-weight: 500; color: var(--ink); border-radius: 50%; }
.agm-cal .agm-d.out { color: #C9C6BF; }
.agm-cal .agm-d.today { color: var(--accent); font-weight: 700; }
.agm-cal .agm-d.sel { background: var(--ink); color: #fff; }
.agm-cal .agm-d i { position: absolute; bottom: 5px; left: 50%; margin-left: -2.5px; }
.agm-cal .agm-d.sel i { background: #fff; opacity: .8; }
.agm-places { display: flex; gap: 8px; overflow-x: auto; padding: 8px 16px 2px; }
.agm-places button { flex: none; display: inline-flex; align-items: center; gap: 7px; height: 32px; min-height: 0; padding: 0 13px; border-radius: 999px; background: var(--surface); border: .5px solid var(--line); font-size: 13px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background-color .2s, color .2s; }
.agm-places button.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex: none; display: inline-block; }
.agm-dayhead { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; padding: 18px 20px 10px; }
.agm-dayhead h2 { font-size: 22px; font-weight: 700; letter-spacing: -.01em; color: var(--ink); }
.agm-dayhead p { margin-top: 2px; font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agm-list { display: flex; flex-direction: column; gap: 8px; padding: 0 16px; }
.agm-appt, .agm-free { display: flex; align-items: stretch; gap: 12px; width: 100%; text-align: left; }
.agm-time { flex: none; width: 46px; padding-top: 12px; font-size: 14px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.agm-time small { display: block; font-size: 12px; font-weight: 500; color: var(--muted); }
.agm-card { position: relative; isolation: isolate; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 13px 58px 13px 16px; border-radius: 20px; overflow: hidden; color: var(--ink);
    background:
        radial-gradient(85% 130% at 100% 0%, color-mix(in srgb, var(--p) 46%, #fff) 0%, color-mix(in srgb, var(--p) 14%, #fff) 45%, transparent 75%),
        radial-gradient(60% 90% at 0% 115%, color-mix(in srgb, var(--p) 16%, #fff) 0%, transparent 70%),
        linear-gradient(160deg, #fff 0%, #fbfaf8 100%);
    box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 .5px color-mix(in srgb, var(--p) 22%, #e6e4de), 0 1px 2px rgba(18,19,23,.06);
    transition: transform .2s var(--ease), box-shadow .2s var(--ease); }
/* riflesso lucido in alto, come il vetro di un oggetto 3D */
.agm-card::after { content: ''; position: absolute; z-index: -1; left: -10%; right: -10%; top: -2px; height: 46%; border-radius: 0 0 55% 55% / 0 0 38% 38%; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0)); pointer-events: none; }
.agm-mark { position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 13px; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: .02em; text-shadow: 0 1px 2px rgba(0,0,0,.25);
    background: radial-gradient(90% 70% at 30% 0%, rgba(255,255,255,.5), transparent 70%), linear-gradient(155deg, color-mix(in srgb, var(--p) 80%, #fff), var(--p) 55%, color-mix(in srgb, var(--p) 78%, #000));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 2px rgba(0,0,0,.2), 0 2px 4px -1px rgba(18,19,23,.2); }
.agm-mark i { font-size: 19px; }
.agm-cards { flex: 1; min-width: 0; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 8px; }
.agm-cardbtn { display: flex; min-width: 0; text-align: left; } .agm-cardbtn .agm-card { flex: 1; min-width: 0; }
.agm-cardbtn:active .agm-card { transform: scale(.975); }
.agm-who { font-size: 16.5px; font-weight: 650; letter-spacing: -.005em; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agm-what { font-size: 13px; font-weight: 600; color: color-mix(in srgb, var(--c) 82%, #000); }
.agm-where { display: flex; align-items: center; gap: 5px; margin-top: 5px; width: fit-content; max-width: 100%; height: 22px; padding: 0 9px 0 7px; border-radius: 999px; font-size: 12px; font-weight: 600; color: color-mix(in srgb, var(--p) 80%, #000); background: color-mix(in srgb, var(--p) 13%, #fff); box-shadow: inset 0 0 0 .5px color-mix(in srgb, var(--p) 30%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* annullato: barrato; annullato e completato si spengono */
.agm-cardbtn.off .agm-who { text-decoration: line-through; }
.agm-cardbtn.off .agm-card, .agm-cardbtn.done .agm-card { filter: saturate(.35); opacity: .75; }
.agm-free .agm-time { padding-top: 9px; color: var(--muted); font-weight: 500; }
.agm-free-body { flex: 1; display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border: 1px dashed #D6D3CC; border-radius: 14px; font-size: 13.5px; font-weight: 500; color: var(--muted); transition: background-color .15s, color .15s; }
.agm-free:active .agm-free-body { background: var(--surface); color: var(--ink); }
.agm-empty { margin: 8px 16px; padding: 30px 16px; text-align: center; background: var(--surface); border-radius: 20px; }
.agm-empty i { font-size: 30px; color: var(--muted); }
.agm-empty p { margin: 6px 0 14px; font-size: 15px; font-weight: 600; color: var(--ink); }
.agm-empty .vw-chip { display: inline-flex; }

/* PC e tablet: giornata a elenco (niente griglia a ore) e settimana a colonne */
.ag-daywrap { max-width: 560px; margin: 4px auto 0; padding-bottom: 8px; }
.ag-daywrap .agm-list { padding: 0; }
.ag-board { display: grid; grid-template-columns: repeat(7, minmax(108px, 1fr)); gap: 8px; overflow-x: auto; padding-bottom: 6px; }
.ag-bcol { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 6px; border-radius: 18px; background: var(--soft); }
.ag-bcol.closed { opacity: .55; }
.ag-bcol.today { background: color-mix(in srgb, var(--accent) 9%, var(--soft)); }
.ag-bhead { display: flex; align-items: baseline; gap: 6px; padding: 2px 4px 4px; text-align: left; }
.ag-bhead small { font-size: 11px; font-weight: 600; text-transform: capitalize; color: var(--muted); }
.ag-bhead b { font-size: 19px; font-weight: 700; color: var(--ink); } .ag-bcol.today .ag-bhead b { color: var(--accent); }
.ag-bcol .agm-list { padding: 0; gap: 6px; }
.ag-bcol .agm-appt { flex-direction: column; gap: 3px; } .ag-bcol .agm-cards { grid-auto-flow: row; gap: 6px; }
.ag-bcol .agm-time { width: auto; padding: 0 4px; font-size: 12px; display: flex; gap: 4px; align-items: baseline; } .ag-bcol .agm-time small { display: inline; } .ag-bcol .agm-time small::before { content: '–'; margin-right: 4px; }
.ag-bcol .agm-card { padding: 9px 10px; border-radius: 16px; } .ag-bcol .agm-mark { display: none; }
.ag-bcol .agm-who { font-size: 14px; } .ag-bcol .agm-what:empty { display: none; } .ag-bcol .agm-what { font-size: 12px; } .ag-bcol .agm-where { font-size: 11px; height: 20px; }
.ag-bcol .agm-empty { display: none; }
.ag-badd { height: 30px; border-radius: 12px; border: 1px dashed #CFCBC2; display: grid; place-items: center; color: var(--muted); font-size: 15px; transition: background-color .15s, color .15s; } .ag-badd:hover { background: #fff; color: var(--ink); }

/* box per regolare gli spazi liberi (settimana) */
.ag-slotbox { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; padding: 8px 8px 8px 14px; border-radius: 16px; background: var(--soft); }
.ag-slotsum { display: flex; align-items: baseline; gap: 8px; min-width: 0; } .ag-slotsum b { font-size: 22px; font-weight: 700; color: var(--ink); } .ag-slotsum span { font-size: 12.5px; color: var(--muted); }
.ag-slotctl { display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; background: #fff; } .ag-slotctl small { padding: 0 8px 0 10px; font-size: 11.5px; color: var(--muted); }
.ag-slotctl button { height: 28px; min-width: 38px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background-color .2s, color .2s; } .ag-slotctl button.on { background: var(--ink); color: #fff; }
.ag-bcol .agm-free { gap: 0; }
.ag-bcol .agm-free-body { min-height: 28px; padding: 0 5px; font-size: 10.5px; font-weight: 600; border-radius: 11px; gap: 3px; font-variant-numeric: tabular-nums; width: 100%; white-space: nowrap; letter-spacing: -.01em; overflow: hidden; background: color-mix(in srgb, #B8892B 6%, transparent); border-color: color-mix(in srgb, #B8892B 38%, #D6D3CC); color: color-mix(in srgb, #B8892B 80%, #000); }

/* slot liberi della settimana: griglia compatta di orari */
.agm-slots { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.agm-slot { height: 24px; min-height: 0; border-radius: 9px; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: color-mix(in srgb, #B8892B 80%, #000); background: color-mix(in srgb, #B8892B 6%, transparent);
    border: 1px dashed color-mix(in srgb, #B8892B 40%, #D6D3CC); transition: background-color .15s, transform .15s var(--ease); }
.agm-slot:hover { background: color-mix(in srgb, #B8892B 16%, #fff); } .agm-slot:active { transform: scale(.94); }
.ag-board { align-items: stretch; }
@media (min-width: 640px) { .ag-wrap:has(.ag-board) .ag-main { padding-bottom: 12px; } }

.agm-cards[style*="--n: 2"] .agm-card, .agm-cards[style*="--n: 3"] .agm-card { padding-right: 12px; } .agm-cards[style*="--n: 2"] .agm-mark, .agm-cards[style*="--n: 3"] .agm-mark { top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 10px; font-size: 11px; }
.agm-cards[style*="--n: 2"] .agm-who, .agm-cards[style*="--n: 3"] .agm-who { padding-right: 30px; }
.agm-cards[style*="--n: 3"] { grid-auto-flow: row; }

.agm-slots.wide { grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); margin-left: 58px; }
/* telefono: senza appuntamenti la griglia occupa tutta la riga, e gli orari sono bersagli da pollice */
@media (max-width: 639px) {
    .agm-list > .agm-slots.wide:only-child { margin-left: 0; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .agm-list > .agm-slots.wide .agm-slot { height: 36px; font-size: 13px; border-radius: 12px; }
}
/* giornata su PC/tablet: due colonne (mattina | pomeriggio), cosi' una giornata piena sta in pagina */
@media (min-width: 900px) {
    .ag-daywrap { max-width: none; }
    .ag-daywrap .agm-list { display: block; column-count: 2; column-gap: 32px; }
    .ag-daywrap .agm-list > * { break-inside: avoid; margin-bottom: 8px; }
}

/* riga compatta di un appuntamento nella colonna della settimana */
.agm-chips { display: flex; flex-direction: column; gap: 4px; }
.agm-chip { display: flex; align-items: center; gap: 6px; height: 30px; padding: 0 5px 0 8px; border-radius: 10px; width: 100%; min-width: 0; text-align: left;
    background: radial-gradient(110% 200% at 100% 0%, color-mix(in srgb, var(--p) 40%, #fff), transparent 72%), #fff;
    box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 .5px color-mix(in srgb, var(--p) 26%, #e6e4de), 0 1px 1px rgba(18,19,23,.05); transition: transform .15s var(--ease); }
.agm-chip:active { transform: scale(.96); }
.agm-chip .t { flex: none; font-style: normal; font-size: 10.5px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--muted); }
.agm-chip .ty { flex: 1; min-width: 0; font-size: 12px; font-weight: 650; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agm-chip .pm { flex: none; width: 21px; height: 21px; display: grid; place-items: center; border-radius: 7px; font-style: normal; font-size: 9px; font-weight: 700; color: #fff; letter-spacing: .02em;
    background: linear-gradient(155deg, color-mix(in srgb, var(--p) 80%, #fff), var(--p) 55%, color-mix(in srgb, var(--p) 78%, #000)); box-shadow: inset 0 1px 0 rgba(255,255,255,.5); }
.agm-chip .pm i { font-size: 12px; color: #fff; }
.agm-chip.off .ty { text-decoration: line-through; color: var(--muted); } .agm-chip.off, .agm-chip.done { filter: saturate(.4); opacity: .8; }
.ag-bcol .agm-list { gap: 4px; }

/* settimana: tutta la larghezza al calendario, prossimi e studio sotto affiancati */
.ag-layout:has(.ag-board) { grid-template-columns: minmax(0, 1fr); }
.ag-layout:has(.ag-board) .ag-main { order: -1; }
.ag-layout:has(.ag-board) .ag-side { display: grid; grid-template-columns: 1fr 1fr; align-items: start; }
@media (max-width: 760px) { .ag-layout:has(.ag-board) .ag-side { grid-template-columns: 1fr; } }

/* banner piu' bassi: titolo sopra, tipo e sede sulla stessa riga */
.agm-card { flex-direction: row; flex-wrap: wrap; align-items: center; align-content: center; column-gap: 8px; row-gap: 3px; padding-top: 10px; padding-bottom: 10px; min-height: 58px; }
.agm-card .agm-who { flex: 1 1 100%; min-width: 0; }
.agm-card .agm-what { flex: none; } .agm-card .agm-where { margin-top: 0; min-width: 0; flex: 0 1 auto; }
.agm-cards[style*="--n: 2"] .agm-card .agm-where { flex: 1 1 100%; }

@media (max-width: 639px) {
    .agm-cards[style*="--n: 2"] .agm-where { display: none; }
    .agm-cards[style*="--n: 2"] .agm-who { font-size: 14.5px; }
    .agm-cards[style*="--n: 2"] .agm-card { padding-left: 12px; }
}

/* slot liberi: grigi, discreti */
.agm-slot { color: var(--muted); background: transparent; border: 1px dashed #CFCBC2; }
.agm-slot:hover { background: #fff; color: var(--ink); border-color: #A7A5A0; }
.ag-bcol .agm-free-body, .agm-free-body { color: var(--muted); background: transparent; border-color: #D6D3CC; }
.agm-free:hover .agm-free-body { background: #fff; color: var(--ink); border-color: #A7A5A0; }

/* animazioni dell'agenda */
@keyframes ag-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes ag-slot-in { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: none; } }
.ag-content { animation: ag-in .45s var(--ease) backwards; }
.agm-appt, .agm-chips { animation: ag-in .5s var(--ease) backwards; }
.agm-list > :nth-child(1) { animation-delay: .02s; } .agm-list > :nth-child(2) { animation-delay: .06s; } .agm-list > :nth-child(3) { animation-delay: .10s; } .agm-list > :nth-child(4) { animation-delay: .14s; }
.agm-list > :nth-child(5) { animation-delay: .18s; } .agm-list > :nth-child(6) { animation-delay: .22s; } .agm-list > :nth-child(n+7) { animation-delay: .26s; }
.agm-slot { animation: ag-slot-in .35s var(--ease) backwards; }
.agm-slots > :nth-child(2) { animation-delay: .03s; } .agm-slots > :nth-child(3) { animation-delay: .06s; } .agm-slots > :nth-child(4) { animation-delay: .09s; } .agm-slots > :nth-child(n+5) { animation-delay: .12s; }
.ag-bcol { animation: ag-in .5s var(--ease) backwards; }
.ag-bcol:nth-child(2) { animation-delay: .04s; } .ag-bcol:nth-child(3) { animation-delay: .08s; } .ag-bcol:nth-child(4) { animation-delay: .12s; } .ag-bcol:nth-child(5) { animation-delay: .16s; } .ag-bcol:nth-child(6) { animation-delay: .2s; } .ag-bcol:nth-child(7) { animation-delay: .24s; }
.ag-cell { animation: ag-in .4s var(--ease) backwards; }
.ag-next button { animation: ag-in .45s var(--ease) backwards; } .ag-next button:nth-child(2) { animation-delay: .05s; } .ag-next button:nth-child(3) { animation-delay: .1s; } .ag-next button:nth-child(n+4) { animation-delay: .15s; }
.ag-card { animation: ag-in .5s var(--ease) backwards; } .ag-side .ag-card:nth-child(2) { animation-delay: .08s; }
/* tasti: sollevamento al passaggio, pressione, rimbalzo */
.agm-cardbtn .agm-card, .agm-chip, .agm-slot, .agm-free-body, .ag-bhead, .ag-badd, .ag-places button, .ag-slotctl button, .ag-views button, .ag-icon, .ag-link, .ag-next .tile {
    transition: transform .25s var(--ease), box-shadow .25s var(--ease), background-color .2s, color .2s, border-color .2s; }
@media (hover: hover) {
    .agm-cardbtn:hover .agm-card { transform: translateY(-2px); box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 .5px color-mix(in srgb, var(--p) 30%, #e6e4de), 0 10px 20px -10px rgba(18,19,23,.28); }
    .agm-chip:hover { transform: translateY(-1px) scale(1.02); }
    .agm-slot:hover { transform: translateY(-1px) scale(1.06); }
    .ag-next button:hover .tile { transform: scale(1.08) rotate(-2deg); }
    .ag-bhead:hover { transform: translateX(2px); }
    .ag-places button:hover:not(.on), .ag-slotctl button:hover:not(.on), .ag-views button:hover:not(.on) { transform: translateY(-1px); color: var(--ink); }
    .ag-icon:hover { transform: scale(1.08); }
}
.ag-places button:active, .ag-slotctl button:active, .ag-views button:active, .ag-icon:active, .ag-bhead:active, .ag-badd:active, .agm-free:active .agm-free-body { transform: scale(.92); }
.ag-views button.on, .ag-places button.on, .ag-slotctl button.on { animation: pop .35s var(--ease); }
.ag-badd:hover { transform: scale(1.04); }
@media (prefers-reduced-motion: reduce) { .ag-content, .agm-appt, .agm-chips, .agm-slot, .ag-bcol, .ag-cell, .ag-next button, .ag-card, .ag-views button.on, .ag-places button.on, .ag-slotctl button.on { animation: none !important; } }

/* ghiera dei giorni (telefono) */
.agm-wheel { position: relative; margin: 8px 0 2px; height: 78px; }
.agm-wheel-pick { position: absolute; left: 50%; top: 4px; width: 46px; height: 70px; margin-left: -23px; border-radius: 23px; background: var(--ink); box-shadow: 0 8px 18px -8px rgba(18,19,23,.55), inset 0 1.5px 0 rgba(255,255,255,.18); pointer-events: none; }
.agm-wheel-strip { position: relative; display: flex; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; padding-inline: calc(50% - 26px); -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 22%, #000 78%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 22%, #000 78%, transparent 100%); }
.agm-wd { --k: 3; flex: none; width: 52px; height: 100%; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--ink);
    transform: scale(calc(1.06 - var(--k) * .09)); opacity: calc(1 - var(--k) * .16); transition: color .15s; will-change: transform; }
.agm-wd b { font-size: 11px; font-weight: 600; text-transform: capitalize; color: var(--muted); }
.agm-wd span { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.1; }
.agm-wd i { width: 5px; height: 5px; border-radius: 50%; background: var(--ink); opacity: .4; } .agm-wd i.none { opacity: 0; }
.agm-wd.today span { color: var(--accent); }
.agm-wd.is-c b { color: rgba(255,255,255,.7); } .agm-wd.is-c span, .agm-wd.today.is-c span { color: #fff; } .agm-wd.is-c i { background: #fff; }
`;
