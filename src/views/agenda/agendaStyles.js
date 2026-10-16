export const agendaStyles = `
.ag-wrap { height: 100%; overflow-y: auto; background: var(--paper); }
.ag-top { display: flex; align-items: center; gap: 12px; padding: 18px 24px 8px; max-width: 1400px; margin: 0 auto; flex-wrap: wrap; }
.ag-title { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 600; font-size: 38px; line-height: 1; color: var(--ink); }
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

/* mini calendario */
.ag-mini-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-weight: 600; text-transform: capitalize; }
.ag-mini { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 12.5px; }
.ag-mini b { font-size: 10.5px; color: var(--muted); padding-bottom: 4px; }
.ag-mini button { position: relative; height: 34px; border-radius: 12px; transition: background-color .15s; } .ag-mini button:hover { background: var(--soft); }
.ag-mini button.out { color: #B5B3AE; } .ag-mini button.today { font-weight: 700; color: var(--accent); }
.ag-mini button.sel { background: var(--ink); color: #fff; } .ag-mini button.sel.today { color: #fff; }
.ag-mini button i { position: absolute; bottom: 4px; left: 50%; width: 5px; height: 5px; border-radius: 99px; background: var(--accent); transform: translateX(-50%); } .ag-mini button.sel i { background: #fff; }

/* prossimi */
.ag-next { display: flex; flex-direction: column; gap: 2px; }
.ag-next button { display: flex; align-items: center; gap: 10px; text-align: left; padding: 8px 6px; border-radius: 12px; } .ag-next button:hover { background: var(--soft); }
.ag-next .dot { width: 8px; height: 8px; border-radius: 99px; flex: none; background: var(--c); }
.ag-next .when { flex: none; width: 66px; font-size: 11.5px; color: var(--muted); line-height: 1.2; } .ag-next .when b { display: block; color: var(--ink); font-size: 12.5px; }
.ag-next .what { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ag-empty { font-size: 13px; color: var(--muted); }
.ag-set p { font-size: 12.5px; color: var(--muted); line-height: 1.45; margin-bottom: 6px; } .ag-set b { color: var(--ink); font-weight: 600; }
.ag-link { font-size: 12.5px; font-weight: 600; color: var(--accent); }

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
.ag-appt { position: absolute; z-index: 3; overflow: hidden; text-align: left; padding: 4px 8px; border-radius: 10px; border-left: 4px solid var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--ink); display: flex; flex-direction: column; gap: 1px; cursor: pointer; transition: transform .15s var(--ease), box-shadow .15s; }
.ag-appt:hover { transform: scale(1.02); box-shadow: 0 6px 16px -6px rgba(0,0,0,.3); z-index: 5; }
.ag-appt b { font-size: 12.5px; font-weight: 600; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ag-appt span { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-appt i { position: absolute; top: 4px; right: 5px; color: var(--ok); font-size: 14px; }
.ag-appt.st-completato { opacity: .75; } .ag-appt.st-assente { border-left-color: #E5675F; background: #FBECEA; } .ag-appt.ghost { opacity: .45; background: repeating-linear-gradient(135deg, #eee 0 6px, #f6f6f6 6px 12px); border-left-color: #B5B3AE; } .ag-appt.ghost b { text-decoration: line-through; }

/* mese */
.ag-month { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.ag-mh { padding: 6px; font-size: 11px; text-align: center; color: var(--muted); border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--soft); }
.ag-cell { min-height: 104px; padding: 4px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); cursor: pointer; display: flex; flex-direction: column; gap: 2px; min-width: 0; transition: background-color .15s; } .ag-cell:hover { background: #FAF9F6; }
.ag-cell.out { background: var(--soft); opacity: .6; } .ag-cell.sel { box-shadow: inset 0 0 0 2px var(--ink); }
.ag-num { font-size: 12.5px; font-weight: 600; display: flex; justify-content: space-between; padding: 2px 4px; } .ag-cell.today .ag-num { color: var(--accent); } .ag-num em { font-style: normal; }
.ag-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 5px; border-radius: 7px; background: color-mix(in srgb, var(--c) 13%, #fff); text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ag-chip i { width: 6px; height: 6px; border-radius: 99px; background: var(--c); flex: none; } .ag-chip span { font-weight: 600; flex: none; }
.ag-more { font-size: 10.5px; color: var(--muted); padding-left: 4px; }
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
.agm-month { display: flex; align-items: baseline; gap: 8px; padding: 6px 20px 2px; font-family: 'Playfair Display', serif; font-style: italic; font-weight: 600; font-size: 34px; line-height: 1.1; color: var(--ink); }
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
.agm-seg { flex: none; }
.agm-seg button { padding: 0 12px; height: 30px; min-height: 0; font-size: 16px; display: grid; place-items: center; }
.agm-list { display: flex; flex-direction: column; gap: 8px; padding: 0 16px; }
.agm-appt, .agm-free { display: flex; align-items: stretch; gap: 12px; width: 100%; text-align: left; }
.agm-time { flex: none; width: 46px; padding-top: 12px; font-size: 14px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.agm-time small { display: block; font-size: 12px; font-weight: 500; color: var(--muted); }
.agm-card { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 11px 14px 12px 16px; background: var(--surface); border-radius: 16px; overflow: hidden; transition: transform .15s var(--ease); }
.agm-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--c); }
.agm-appt:active .agm-card { transform: scale(.98); }
.agm-who { font-size: 16px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agm-what { font-size: 13px; color: var(--c); font-weight: 600; }
.agm-where { display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 12.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agm-appt.off .agm-who { text-decoration: line-through; color: var(--muted); }
.agm-appt.off .agm-card::before, .agm-appt.done .agm-card::before { opacity: .35; }
.agm-free .agm-time { padding-top: 9px; color: var(--muted); font-weight: 500; }
.agm-free-body { flex: 1; display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border: 1px dashed #D6D3CC; border-radius: 14px; font-size: 13.5px; font-weight: 500; color: var(--muted); transition: background-color .15s, color .15s; }
.agm-free:active .agm-free-body { background: var(--surface); color: var(--ink); }
.agm-empty { margin: 8px 16px; padding: 30px 16px; text-align: center; background: var(--surface); border-radius: 20px; }
.agm-empty i { font-size: 30px; color: var(--muted); }
.agm-empty p { margin: 6px 0 14px; font-size: 15px; font-weight: 600; color: var(--ink); }
.agm-empty .vw-chip { display: inline-flex; }
.agm-hours { margin: 0 12px; padding: 8px; background: var(--surface); border-radius: 20px; }
`;
