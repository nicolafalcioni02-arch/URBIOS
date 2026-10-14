// Stili dei widget laterali (iniettati dal dock, non globali). Il dock esiste solo su desktop largo.
// Ogni .wd-card prende i colori dalle variabili --wd-* impostate dal tono scelto (vedi tones.js).
export const widgetStyles = `
.wd-dock { display: none; }
@media (min-width: 1360px) and (hover: hover) {
  .wd-dock { display: block; --wd-w: clamp(200px, calc((100vw - 896px) / 2 - 30px), 330px); }
}

/* ---- colonne fisse a griglia: i widget si appoggiano dove vuoi ---- */
.wd-rail { position: fixed; top: var(--wd-top, 6px); bottom: 6px; width: var(--wd-w); z-index: 4; border: 1.5px dashed transparent; border-radius: 28px; transition: border-color .25s var(--ease), background-color .25s var(--ease); }
.wd-left  { left:  calc((100vw - 896px) / 4 - var(--wd-w) / 2); }
@media (min-width: 1360px) and (hover: hover) {
  .wd-dock.patient { --wd-w: clamp(190px, 14.5vw, 270px); }
  .wd-dock.patient .wd-left { left: 6px; } .wd-dock.patient .wd-right { right: 6px; }
}
.wd-right { right: calc((100vw - 896px) / 4 - var(--wd-w) / 2); }
.wd-rail.empty:hover, .wd-rail.armed, .is-editing .wd-rail { border-color: #CFCBC0; background-color: rgba(255,255,255,.35); }
.is-editing .wd-rail, .wd-rail.armed { background-image: radial-gradient(circle, rgba(18,19,23,.16) 1.4px, transparent 1.6px); background-size: var(--wd-pitch) var(--wd-pitch); background-position: calc(var(--wd-padx) + var(--wd-pitch) / 2 - 5px) calc(var(--wd-pady) + var(--wd-pitch) / 2 - 5px); }
body.wd-dragging { user-select: none; -webkit-user-select: none; cursor: grabbing; }
body.wd-resizing { cursor: nwse-resize; }
.wd-item { position: absolute; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; }
.wd-item textarea, .wd-item input { user-select: text; -webkit-user-select: text; }
.wd-item.is-lifted { z-index: 30; cursor: grabbing; }
.wd-item.is-lifted .wd-box { box-shadow: 0 26px 50px -14px rgba(18,19,23,.5); transform: scale(1.04); }
.wd-jig { display: block; width: 100%; height: 100%; }
.wd-box { position: relative; width: 100%; height: 100%; border-radius: 22px; overflow: hidden; background: var(--wd-bg); color: var(--wd-fg); border: 1px solid var(--wd-line);
  box-shadow: 0 1px 2px rgba(18,19,23,.05), 0 12px 24px -16px rgba(18,19,23,.35); transition: transform .35s var(--ease), box-shadow .35s var(--ease), opacity .3s, filter .3s; }
.wd-box .wd-card { background: transparent; border: 0; box-shadow: none; border-radius: 0; }
.wd-fit { position: absolute; inset: 0; overflow: hidden; }
.wd-fit.scroll { overflow-y: auto; scrollbar-width: none; } .wd-fit.scroll::-webkit-scrollbar { display: none; }
.wd-fit-in { position: absolute; transform-origin: 0 0; }
.wd-ghost { position: absolute; z-index: 1; border-radius: 22px; border: 2px dashed var(--accent); background: rgba(47,84,235,.08); pointer-events: none; transition: all .1s var(--ease); }
.wd-ghost.bad { border-color: #E5675F; background: rgba(229,103,95,.1); }

/* maniglie di ridimensionamento, come una figura di Word */
.wd-h { position: absolute; z-index: 6; opacity: 0; transition: opacity .15s; }
.wd-h::after { content: ''; position: absolute; width: 10px; height: 10px; border-radius: 999px; background: #fff; border: 1.5px solid var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,.25); left: 50%; top: 50%; transform: translate(-50%, -50%); }
.wd-item.editing .wd-h { opacity: 1; }
.wd-h-n, .wd-h-s { left: 14px; right: 14px; height: 14px; cursor: ns-resize; } .wd-h-n { top: -7px; } .wd-h-s { bottom: -7px; }
.wd-h-e, .wd-h-w { top: 14px; bottom: 14px; width: 14px; cursor: ew-resize; } .wd-h-e { right: -7px; } .wd-h-w { left: -7px; }
.wd-h-ne, .wd-h-nw, .wd-h-se, .wd-h-sw { width: 16px; height: 16px; }
.wd-h-ne { top: -8px; right: -8px; cursor: nesw-resize; } .wd-h-sw { bottom: -8px; left: -8px; cursor: nesw-resize; }
.wd-h-nw { top: -8px; left: -8px; cursor: nwse-resize; } .wd-h-se { bottom: -8px; right: -8px; cursor: nwse-resize; }
.wd-h-n::after, .wd-h-s::after { width: 22px; height: 6px; } .wd-h-e::after, .wd-h-w::after { width: 6px; height: 22px; }

/* ---- stile comune ---- */
.wd-card { background: var(--wd-bg); color: var(--wd-fg); border: 1px solid var(--wd-line); border-radius: 24px; padding: 14px; overflow: hidden; position: relative;
  box-shadow: 0 1px 2px rgba(18,19,23,.05), 0 12px 24px -16px rgba(18,19,23,.35); font-family: Inter, sans-serif; }
.wd-card button { color: inherit; }
.wd-card input, .wd-card select, .wd-card textarea { color: var(--wd-fg); font-family: inherit; }
.wd-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 600; font-size: 14px; letter-spacing: -.01em; margin-bottom: 8px; }
.wd-title small { font-size: 11px; font-weight: 500; color: var(--wd-mut); }
.wd-empty-msg, .wd-more { font-size: 12.5px; color: var(--wd-mut); }
.wd-round { width: 24px; height: 24px; border-radius: 999px; background: var(--wd-fg); color: var(--wd-bg) !important; display: grid; place-items: center; font-size: 12px; transition: transform .2s var(--ease); }
.wd-round:hover { transform: scale(1.12) rotate(90deg); }
.wd-btn { height: 32px; border-radius: 999px; background: var(--wd-fg); color: var(--wd-bg) !important; font-size: 12.5px; font-weight: 600; }
.wd-x { opacity: 0; color: var(--wd-mut) !important; font-size: 12px; transition: opacity .2s; } li:hover > .wd-x { opacity: 1; } .wd-x:hover { color: #E5675F !important; }

/* ---- attenzione al passaggio del mouse (fuori dalla modifica) ---- */
.wd-dock:not(.is-editing) .wd-item:hover { z-index: 3; }
.wd-dock:not(.is-editing) .wd-item:hover .wd-box { transform: translateY(-6px) scale(1.045);
  box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--wd-acc) 55%, transparent), 0 22px 40px -14px rgba(18,19,23,.45), 0 0 34px -6px color-mix(in srgb, var(--wd-acc) 38%, transparent); }
.wd-dock:not(.is-editing) .wd-rail:hover .wd-item:not(:hover) .wd-box { opacity: .78; filter: saturate(.8); transform: scale(.985); }
.wd-box::after { content: ''; position: absolute; inset: 0; border-radius: 24px; pointer-events: none; opacity: 0;
  background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.28) 50%, transparent 65%); background-size: 250% 100%; background-position: 120% 0; }
.wd-dock:not(.is-editing) .wd-item:hover .wd-box::after { opacity: 1; animation: wd-sheen 1.1s var(--ease); }
@keyframes wd-sheen { from { background-position: 120% 0; } to { background-position: -60% 0; } }

/* ---- modalità modifica: tremolio come iOS ---- */
@keyframes wd-jig-a { 0% { transform: rotate(-1.15deg) translateY(.4px); } 50% { transform: rotate(1.15deg) translateY(-.4px); } 100% { transform: rotate(-1.15deg) translateY(.4px); } }
@keyframes wd-jig-b { 0% { transform: rotate(1.05deg); } 50% { transform: rotate(-1.05deg) translateY(.5px); } 100% { transform: rotate(1.05deg); } }
.wd-item.editing .wd-jig { animation: wd-jig-a .27s ease-in-out infinite; animation-delay: var(--wd-delay); cursor: grab; }
.wd-item.editing:nth-child(even) .wd-jig { animation-name: wd-jig-b; animation-duration: .31s; }
.wd-item.editing:active .wd-jig { animation-play-state: paused; cursor: grabbing; }
.wd-item.editing .wd-fit { pointer-events: none; }
.wd-item.editing .wd-box { box-shadow: 0 14px 26px -12px rgba(18,19,23,.4); }
.wd-remove { position: absolute; top: -8px; left: 2px; z-index: 5; width: 26px; height: 26px; border-radius: 999px; background: #E5675F; color: #fff; display: grid; place-items: center; font-size: 14px;
  border: 2px solid var(--paper); box-shadow: 0 3px 8px rgba(0,0,0,.25); animation: pop .3s var(--ease); }
.wd-remove:hover { transform: scale(1.12); }
.wd-bar { position: absolute; left: 0; right: 0; bottom: -26px; z-index: 5; display: flex; flex-wrap: wrap; gap: 4px 8px; justify-content: center; align-items: center; animation: rise .3s var(--ease); }
.wd-seg, .wd-dots { display: flex; align-items: center; gap: 3px; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.96); border: 1px solid var(--line); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.wd-seg button { width: 24px; height: 22px; border-radius: 999px; font-size: 11px; font-weight: 700; color: var(--muted); } .wd-seg button.on { background: var(--ink); color: #fff; }
.wd-dots { gap: 5px; padding: 5px 7px; }
.wd-dots button { width: 14px; height: 14px; border-radius: 999px; border: 1.5px solid rgba(0,0,0,.18); transition: transform .2s var(--ease); } .wd-dots button:hover { transform: scale(1.25); } .wd-dots button.on { box-shadow: 0 0 0 2px var(--paper), 0 0 0 3.5px var(--ink); }

/* ---- "+": in fondo alla colonna (al centro se è vuota) ---- */
.wd-add { position: absolute; left: 0; right: 0; bottom: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; }
.wd-rail.empty .wd-add { bottom: 0; top: 0; justify-content: center; }
.wd-plus { pointer-events: auto; width: 46px; height: 46px; border-radius: 999px; border: 1.5px solid #CFCBC0; background: #fff; color: var(--muted); display: grid; place-items: center; font-size: 20px; opacity: 0; transform: scale(.7); transition: all .25s var(--ease); }
.wd-rail:hover .wd-plus, .wd-rail.armed .wd-plus, .is-editing .wd-plus { opacity: 1; transform: none; }
.wd-plus:hover { border-color: var(--ink); color: var(--ink); transform: scale(1.1); }
.wd-notice { font-size: 11.5px; color: #B8453D; background: #fff; border: 1px solid #F0C9C5; border-radius: 12px; padding: 6px 10px; max-width: 90%; text-align: center; animation: rise .3s var(--ease); pointer-events: auto; }
.wd-pick-layer { position: fixed; inset: 0; z-index: 60; }
.wd-pick { position: fixed; background: rgba(255,255,255,.97); backdrop-filter: blur(14px); border: 1px solid var(--line); border-radius: 20px; padding: 10px; box-shadow: 0 22px 60px rgba(18,19,23,.26); overflow-y: auto; animation: pop .22s var(--ease); transform-origin: bottom center; }
.wd-pick-title { font-size: 12px; font-weight: 600; color: var(--muted); padding: 2px 6px 8px; }
.wd-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.wd-pick-grid button { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 13px; font-size: 13px; font-weight: 600; color: var(--ink); text-align: left; transition: background-color .15s, transform .15s var(--ease); }
.wd-pick-grid button i { font-size: 20px; color: var(--muted); flex: none; } .wd-pick-grid button:hover { background: var(--soft); transform: translateX(2px); } .wd-pick-grid button:hover i { color: var(--ink); }

/* ---- cassetto strumenti (solo in modifica) ---- */
.wd-tray { position: fixed; bottom: 22px; left: 0; right: 0; margin: 0 auto; width: max-content; max-width: calc(100vw - 32px); z-index: 20; display: flex; align-items: center; gap: 8px; padding: 10px 12px 10px 18px;
  background: rgba(255,255,255,.94); backdrop-filter: blur(12px); border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 18px 50px rgba(18,19,23,.2); animation: rise .35s var(--ease); }
.wd-tray-hint { font-size: 12px; color: var(--muted); max-width: 110px; line-height: 1.25; margin-right: 4px; }
.wd-tile { touch-action: none; user-select: none; -webkit-user-select: none; width: 70px; padding: 9px 2px 7px; border-radius: 14px; border: 1px solid var(--line); background: var(--paper); display: flex; flex-direction: column; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; cursor: grab; transition: transform .2s var(--ease), border-color .2s; user-select: none; text-align: center; }
.wd-tile i { font-size: 22px; } .wd-tile:hover { transform: translateY(-3px); border-color: var(--ink); } .wd-tile:active { cursor: grabbing; }
.wd-done { height: 38px; padding: 0 16px; border-radius: 999px; background: var(--ink); color: #fff; font-size: 13px; font-weight: 600; margin-left: 4px; }

/* ---- orologio ---- */
.wd-clock { padding: 12px 12px 10px; } .wd-clock svg { width: 100%; display: block; }
.wd-clock-date { text-align: center; margin-top: 4px; font-family: 'Playfair Display', serif; font-style: italic; font-size: 13px; color: var(--wd-mut); }

/* ---- foglietto ---- */
.wd-postit { min-height: 150px; padding: 26px 16px 12px; }
.wd-pin { position: absolute; top: 9px; left: 14px; font-size: 16px; color: var(--wd-acc); transform: rotate(18deg); }
.wd-postit textarea { width: 100%; min-height: 112px; resize: none; background: transparent; border: 0; outline: 0; font-family: 'Caveat', 'Bradley Hand', cursive; font-size: 23px; line-height: 1.15; }
.wd-postit textarea::placeholder { color: var(--wd-mut); opacity: .7; }

/* ---- lista ---- */
.wd-todo ul { list-style: none; margin: 0; padding: 0; max-height: 220px; overflow-y: auto; scrollbar-width: none; }
.wd-todo li { display: flex; align-items: center; gap: 9px; padding: 6px 0; border-bottom: 1px solid var(--wd-line); font-size: 13.5px; line-height: 1.25; }
.wd-todo li span { flex: 1; min-width: 0; overflow-wrap: anywhere; } .wd-todo li.done span { text-decoration: line-through; color: var(--wd-mut); }
.wd-check { flex: none; width: 17px; height: 17px; border: 1.5px solid var(--wd-mut); border-radius: 6px; display: grid; place-items: center; font-size: 10px; color: var(--wd-bg) !important; transition: all .2s var(--ease); }
.wd-todo li.done .wd-check { background: var(--wd-acc); border-color: var(--wd-acc); }
.wd-todo form { display: flex; align-items: center; gap: 8px; padding-top: 8px; color: var(--wd-mut); font-size: 13px; }
.wd-todo form input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-size: 13.5px; } .wd-todo form input::placeholder { color: var(--wd-mut); }

/* ---- calendario ---- */
.wd-cal { padding: 12px 12px 12px; }
.wd-cal-head { display: flex; align-items: center; justify-content: space-between; font-family: 'Playfair Display', serif; font-style: italic; font-weight: 600; font-size: 17px; margin-bottom: 6px; }
.wd-cal-head small { font-family: Inter, sans-serif; font-style: normal; font-weight: 500; font-size: 11px; color: var(--wd-mut); }
.wd-cal-head button { width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: 12px; color: var(--wd-mut) !important; } .wd-cal-head button:hover { background: var(--wd-soft); color: var(--wd-fg) !important; }
.wd-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; text-align: center; font-size: 12px; }
.wd-cal-grid b { font-size: 10px; color: var(--wd-mut); padding-bottom: 3px; font-weight: 600; } .wd-cal-grid .sun { color: #E5675F; }
.wd-cal-grid span { line-height: 24px; border-radius: 999px; } .wd-cal-grid .today { background: var(--wd-fg); color: var(--wd-bg); font-weight: 700; }

/* ---- timer ---- */
.wd-timer { text-align: center; padding: 14px 12px 12px; }
.wd-timer-ring { position: relative; width: 70%; margin: 0 auto; } .wd-timer-ring svg { display: block; width: 100%; }
.wd-timer-ring strong { position: absolute; inset: 0; display: grid; place-items: center; font-variant-numeric: tabular-nums; font-size: 22px; font-weight: 600; letter-spacing: -.02em; }
.wd-timer-ring strong.end { color: #E5675F; font-size: 17px; }
.wd-timer-presets { display: flex; gap: 4px; justify-content: center; margin-top: 10px; }
.wd-timer-presets button { padding: 3px 9px; border-radius: 999px; border: 1px solid var(--wd-line); font-size: 12px; font-weight: 600; } .wd-timer-presets button.on { background: var(--wd-fg); color: var(--wd-bg) !important; border-color: var(--wd-fg); } .wd-timer-presets button:disabled { opacity: .4; }
.wd-timer-actions { display: flex; gap: 6px; justify-content: center; margin-top: 10px; }
.wd-timer-actions button { height: 34px; padding: 0 15px; border-radius: 999px; background: var(--wd-fg); color: var(--wd-bg) !important; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.wd-timer-actions button:last-child { width: 34px; padding: 0; justify-content: center; background: var(--wd-soft); color: var(--wd-fg) !important; }

/* ---- luna ---- */
.wd-moon { padding: 14px 14px 12px; text-align: center; } .wd-moon svg { display: block; width: 78%; margin: 0 auto; }
.wd-moon p { display: flex; flex-direction: column; gap: 1px; margin-top: 4px; }
.wd-moon p b { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; } .wd-moon p span { font-size: 11px; color: var(--wd-mut); }

/* ---- pensiero ---- */
.wd-quote { padding: 26px 16px 14px; }
.wd-qmark { position: absolute; top: 0; left: 12px; font-family: 'Playfair Display', serif; font-size: 54px; line-height: 1; color: var(--wd-acc); opacity: .55; }
.wd-quote p { font-family: 'Playfair Display', serif; font-style: italic; font-size: 15.5px; line-height: 1.35; position: relative; }
.wd-quote small { display: block; margin-top: 8px; font-size: 11px; color: var(--wd-mut); }
.wd-quote button { position: absolute; right: 10px; bottom: 8px; color: var(--wd-mut) !important; opacity: 0; transition: opacity .2s; } .wd-quote:hover button { opacity: 1; }

/* ---- acqua ---- */
.wd-water-title { font-size: 12.5px; color: var(--wd-mut); display: flex; justify-content: space-between; } .wd-water-title b { color: var(--wd-acc); font-weight: 700; }
.wd-glasses { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
.wd-glasses button svg { width: 100%; display: block; } .wd-glasses .water { opacity: 0; transform: translateY(8px); transition: all .35s var(--ease); }
.wd-glasses .full .water { opacity: 1; transform: none; } .wd-glasses button { transition: transform .2s var(--ease); } .wd-glasses button:hover { transform: translateY(-3px); }
.wd-water-sub { font-size: 12px; color: var(--wd-mut); text-align: center; margin-top: 8px; }

/* ---- appuntamenti ---- */
.wd-agenda ul, .wd-bday ul { list-style: none; margin: 0; padding: 0; }
.wd-agenda li { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--wd-line); }
.wd-agenda li:last-child { border-bottom: 0; }
.wd-when { flex: none; width: 58px; display: flex; flex-direction: column; font-size: 11.5px; color: var(--wd-mut); line-height: 1.2; } .wd-when b { color: var(--wd-fg); font-size: 12.5px; }
.wd-agenda li.today .wd-when b { color: var(--wd-acc); }
.wd-what { flex: 1; min-width: 0; font-size: 13px; line-height: 1.25; overflow-wrap: anywhere; }
.wd-form { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.wd-form input { width: 100%; height: 32px; border-radius: 10px; border: 1px solid var(--wd-line); background: var(--wd-soft); padding: 0 8px; font-size: 12.5px; outline: none; }
.wd-form input:focus { border-color: var(--wd-fg); }

/* ---- appuntamenti (agenda condivisa) e calendario con puntini ---- */
.wd-sum { font-size: 12px; color: var(--wd-mut); margin: -2px 0 8px; line-height: 1.3; }
.wd-row { width: 100%; display: flex; align-items: center; gap: 9px; text-align: left; } .wd-row:hover .wd-what { text-decoration: underline; }
.wd-dot { flex: none; width: 8px; height: 8px; border-radius: 99px; }
.wd-open { margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--wd-acc) !important; display: inline-flex; gap: 4px; align-items: center; }
.wd-cal-grid button { position: relative; line-height: 24px; border-radius: 999px; font: inherit; transition: background-color .15s; } .wd-cal-grid button:hover { background: var(--wd-soft); }
.wd-cal-grid button.sun { color: #E5675F !important; } .wd-cal-grid button.today { background: var(--wd-fg); color: var(--wd-bg) !important; font-weight: 700; }
.wd-cal-grid button.has::after { content: ''; position: absolute; bottom: 1px; left: 50%; width: 4px; height: 4px; border-radius: 99px; background: var(--wd-acc); transform: translateX(-50%); } .wd-cal-grid button.today.has::after { background: var(--wd-bg); }

/* ---- compleanni ---- */
.wd-bday-now { background: var(--wd-soft); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; }
.wd-bday-now small { font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--wd-acc); }
.wd-bday-now p { display: flex; flex-direction: column; margin-top: 4px; } .wd-bday-now b { font-size: 15px; } .wd-bday-now span { font-size: 12px; color: var(--wd-mut); }
.wd-bday li { display: flex; justify-content: space-between; gap: 8px; padding: 5px 0; font-size: 12.5px; } .wd-bday li em { font-style: normal; color: var(--wd-mut); flex: none; }
.wd-title i { color: var(--wd-acc); }

.wd-fly { position: fixed; z-index: 70; pointer-events: none; transform: translate(-50%, -50%) rotate(-3deg); display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 16px; background: #fff; border: 1px solid var(--line); box-shadow: 0 18px 40px rgba(18,19,23,.3); font-size: 13px; font-weight: 600; }
.wd-fly i { font-size: 20px; }


`;
