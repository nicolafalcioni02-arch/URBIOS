// CSS di Chef URBIOS (iniettato via <style>, non globale). Solo token di index.css; i titoli usano il font del software.
export const chefStyles = `
.ch-wrap { max-width: 1120px; margin: 0 auto; padding: 24px 20px 96px; }
@media (min-width: 640px) { .ch-wrap { padding: 44px 32px 120px; } }
.ch-serif { font-family: inherit; font-style: normal; font-weight: 500; letter-spacing: -.03em; }
.ch-top { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
@media (max-width: 560px) { .ch-top { gap: 8px; } .ch-top-lbl { display: none; } }
.ch-mark { font-size: 12px; font-weight: 600; letter-spacing: .32em; color: var(--muted); }
.ch-hero { padding: 28px 0 30px; border-bottom: 1px solid var(--line); margin-bottom: 26px; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; }
.ch-hero h1 { font-size: clamp(44px, 8vw, 82px); line-height: .95; color: var(--ink); }
.ch-hero p { color: var(--muted); font-size: 15px; margin-top: 12px; max-width: 440px; line-height: 1.5; }
.ch-tabs { display: flex; gap: 22px; margin-bottom: 22px; border-bottom: 1px solid var(--line); }
.ch-tabs button { padding: 0 0 12px; font-size: 14px; font-weight: 500; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .2s, border-color .2s; }
.ch-tabs button:hover { color: var(--ink); }
.ch-tabs button.on { color: var(--ink); border-color: var(--accent); }
.ch-tools { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px; }
.ch-search { position: relative; flex: 1 1 240px; }
.ch-search i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
.ch-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.ch-pill { height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 13px; color: var(--muted); transition: all .2s var(--ease); }
.ch-pill:hover { border-color: var(--ink); color: var(--ink); }
.ch-pill.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.ch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
.ch-card { text-align: left; background: var(--surface); border: 1px solid var(--line); border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; transition: transform .35s var(--ease), box-shadow .35s var(--ease), border-color .2s; }
.ch-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(18, 19, 23, .10); border-color: var(--ink); }
.ch-cover { position: relative; aspect-ratio: 5 / 3; background: var(--soft); display: grid; place-items: center; overflow: hidden; }
.ch-cover::before { content: ''; position: absolute; inset: 14px; border: 1px solid var(--line); border-radius: 14px; }
.ch-cover .ch-serif { font-size: 92px; line-height: 1; color: var(--ink); transition: transform .5s var(--ease); }
.ch-card:hover .ch-cover .ch-serif { transform: scale(1.08) rotate(-3deg); }
.ch-cat { position: absolute; left: 24px; top: 24px; font-size: 10.5px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.ch-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.ch-body h3 { font-size: 22px; line-height: 1.15; color: var(--ink); }
.ch-meta { display: flex; gap: 14px; font-size: 12.5px; color: var(--muted); margin-top: auto; }
.ch-meta span { display: inline-flex; align-items: center; gap: 5px; }
.ch-empty { text-align: center; padding: 64px 20px; border: 1px dashed var(--line); border-radius: 22px; }
.ch-empty h3 { font-size: 30px; color: var(--ink); }
.ch-empty p { color: var(--muted); font-size: 14px; margin: 8px auto 22px; max-width: 360px; }
/* pagina ricetta */
.ch-recipe { display: grid; gap: 36px; }
@media (min-width: 900px) { .ch-recipe { grid-template-columns: 340px 1fr; gap: 56px; } }
.ch-rside { display: flex; flex-direction: column; gap: 20px; }
.ch-rside .ch-cover { border-radius: 22px; border: 1px solid var(--line); aspect-ratio: 1; }
.ch-rside .ch-cover .ch-serif { font-size: 150px; }
.ch-title { font-size: clamp(38px, 6vw, 62px); line-height: 1; color: var(--ink); }
.ch-facts { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--line); border-radius: 18px; background: var(--surface); }
.ch-facts div { padding: 14px 10px; text-align: center; border-right: 1px solid var(--line); }
.ch-facts div:last-child { border: 0; }
.ch-facts b { display: block; font-size: 20px; font-weight: 600; letter-spacing: -.02em; color: var(--ink); }
.ch-facts small { font-size: 11px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.ch-macro { display: flex; flex-direction: column; gap: 10px; }
.ch-bar { height: 6px; border-radius: 6px; background: var(--soft); overflow: hidden; display: flex; }
.ch-bar i { display: block; height: 100%; background: var(--ink); }
.ch-bar i:nth-child(2) { opacity: .55; }
.ch-bar i:nth-child(3) { opacity: .25; }
.ch-legend { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--muted); }
.ch-legend b { color: var(--ink); font-weight: 600; }
.ch-h { font-size: 11px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); margin: 0 0 14px; }
.ch-ings { list-style: none; padding: 0; margin: 0 0 34px; }
.ch-ings li { padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
.ch-ing-top { display: flex; justify-content: space-between; gap: 12px; }
.ch-ing-g { white-space: nowrap; flex: none; } .ch-ing-g input { width: 64px; text-align: right; border: 0; border-bottom: 1px dashed var(--line); background: transparent; font: inherit; color: var(--ink); padding: 0 2px; font-variant-numeric: tabular-nums; } .ch-ing-g input:focus { outline: none; border-bottom-color: var(--ink); }
.ch-ing-top span:last-child { color: var(--muted); font-variant-numeric: tabular-nums; }
.ch-mbars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 8px; }
.ch-mbars span { display: grid; grid-template-columns: 12px 1fr 38px; align-items: center; gap: 8px; font-size: 11.5px; color: var(--muted); }
.ch-mbars em { font-style: normal; font-weight: 600; letter-spacing: .04em; }
.ch-mbars div { height: 4px; border-radius: 4px; background: var(--soft); overflow: hidden; }
.ch-mbars i { display: block; height: 100%; border-radius: 4px; transform-origin: left; animation: ch-bar .8s var(--ease) backwards; transition: width .35s var(--ease); }
.ch-mbars b { font-weight: 500; text-align: right; font-variant-numeric: tabular-nums; }
.ch-cat-in { position: static; }
.ch-steps { list-style: none; padding: 0; margin: 0 0 30px; counter-reset: s; }
.ch-steps li { counter-increment: s; display: grid; grid-template-columns: 44px 1fr; gap: 6px; padding: 14px 0; font-size: 15.5px; line-height: 1.6; color: var(--ink); }
.ch-steps li::before { content: counter(s); font-family: inherit; font-style: normal; font-weight: 300; font-size: 30px; line-height: 1; color: var(--accent); }
.ch-note { padding: 16px 18px; border-radius: 16px; background: var(--soft); font-size: 14px; line-height: 1.55; color: var(--ink); }
/* editor */
.ch-ed { max-width: 1080px; margin-inline: auto; } .ch-ed-title { font-size: 30px; line-height: 1.1; min-width: 0; }
.ch-ed .ch-top { position: sticky; top: 0; z-index: 6; background: var(--paper); padding: 4px 0 14px; margin-bottom: 18px; border-bottom: 1px solid var(--line); }
.ch-ing small { grid-column: 1 / 2; }
.ch-live { padding: 20px 16px; border: 1px solid var(--line); border-radius: 20px; background: var(--surface); }
.ch-qe .ch-ed .ch-top { position: static; border-bottom: 0; padding-bottom: 0; margin-bottom: 18px; } .ch-qe .ch-ed-title { font-size: 24px; }
@media (max-width: 560px) { .ch-ed-title { font-size: 22px; } .ch-ing { grid-template-columns: 1fr 76px 34px; } }
.ch-form { display: grid; gap: 22px; }
.ch-row { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
.ch-ing { display: grid; grid-template-columns: 1fr 92px 34px; gap: 8px; align-items: center; margin-bottom: 8px; }
.ch-ing small { grid-column: 1 / -1; margin-top: -4px; font-size: 11.5px; color: var(--muted); padding-left: 2px; }
.ch-sugg { position: absolute; z-index: 20; left: 0; right: 0; top: 100%; margin-top: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 18px 40px rgba(18, 19, 23, .14); max-height: 280px; overflow-y: auto; }
.ch-sugg button { width: 100%; text-align: left; padding: 10px 14px; font-size: 14px; display: flex; justify-content: space-between; gap: 10px; }
.ch-sugg button:hover { background: var(--soft); }
.ch-sugg small { color: var(--muted); font-size: 12px; flex: none; }
.ch-x { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: var(--muted); transition: all .2s; }
.ch-x:hover { background: var(--soft); color: var(--bad); }
.ch-add { height: 40px; padding: 0 16px; border: 1px dashed var(--line); border-radius: 12px; font-size: 13.5px; color: var(--muted); display: inline-flex; align-items: center; gap: 7px; transition: all .2s; }
.ch-add:hover { border-color: var(--ink); color: var(--ink); }
/* menu */
.ch-menus { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; align-items: start; }
.ch-menu { background: var(--surface); border: 1px solid var(--line); border-radius: 22px; padding: 26px 24px 22px; text-align: center; position: relative; }
.ch-menu::before { content: ''; position: absolute; inset: 8px; border: 1px solid var(--line); border-radius: 16px; pointer-events: none; }
.ch-menu h3 { font-size: 28px; color: var(--ink); }
.ch-course { margin-top: 18px; }
.ch-course b { display: block; font-size: 10.5px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
.ch-course p { font-size: 16px; color: var(--ink); line-height: 1.4; }
.ch-menu .ch-add { margin-top: 10px; }
.ch-menu-sub { text-align: center; font-size: 13px !important; color: var(--muted); border: 0 !important; background: transparent !important; box-shadow: none !important; }
.ch-course { text-align: left; padding-top: 14px; border-top: 1px solid var(--line); }
.ch-course-h { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.ch-course-name { flex: 1; min-width: 0; font-size: 11px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); background: transparent; border: 0; padding: 4px 0; outline: none; }
.ch-course-name:focus { color: var(--ink); }
.ch-course-tools { display: inline-flex; gap: 2px; opacity: 0; transition: opacity .2s; } .ch-course:hover .ch-course-tools, .ch-course:focus-within .ch-course-tools { opacity: 1; }
.ch-course-tools button { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; color: var(--muted); font-size: 13px; } .ch-course-tools button:hover:not(:disabled) { color: var(--ink); background: var(--soft); } .ch-course-tools button:disabled { opacity: .3; }
.ch-dish { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; } .ch-dish select { flex: 1; min-width: 0; } .ch-dish small { flex: none; color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.ch-qty { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: var(--muted); font-size: 16px; transition: all .2s; } .ch-qty:hover { color: var(--ink); background: var(--soft); } .ch-qty.on { background: var(--ink); color: #fff; }
.ch-qtybox { height: auto !important; max-height: 88vh; }
.ch-qty-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 22px 24px 14px; } .ch-qty-head h3 { font-size: 22px; line-height: 1.15; margin: 0; } .ch-qty-head p { font-size: 13px; color: var(--muted); margin: 4px 0 0; }
.ch-qty-body { padding: 0 24px; overflow-y: auto; flex: 1; }
.ch-qty-scale { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 14px; } .ch-qty-scale span { font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); margin-right: 4px; }
.ch-qty-scale button { height: 32px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 13px; font-weight: 600; } .ch-qty-scale button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.ch-qty-row { display: grid; grid-template-columns: 1fr 88px 16px; align-items: center; gap: 10px; padding: 6px 0; font-size: 14.5px; border-bottom: 1px solid var(--line); } .ch-qty-row span { min-width: 0; overflow: hidden; text-overflow: ellipsis; } .ch-qty-row input { text-align: right; height: 38px; } .ch-qty-row em { font-style: normal; color: var(--muted); font-size: 13px; }
.ch-qty-hint { font-size: 12.5px; color: var(--muted); margin: 12px 0; }
.ch-qty-sum { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 14px 16px; border-radius: 16px; background: var(--soft); margin-bottom: 8px; } .ch-qty-sum b { font-size: 20px; font-weight: 600; } .ch-qty-sum span { font-size: 12.5px; color: var(--muted); }
.ch-qty-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px 22px; }
.ch-menu-tot { margin-top: 18px; font-size: 12.5px; color: var(--muted); } .ch-menu-tot b { color: var(--ink); font-weight: 600; }
.ch-menu-actions { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 18px; position: relative; }
.ch-menu-card-sub { font-size: 13px; color: var(--muted); margin: -4px 0 0; }
.ch-mbox-head { display: flex; align-items: flex-start; gap: 12px; padding: 24px 28px 6px; flex: none; }
.ch-mb-eyebrow { display: block; font-size: 10.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
.ch-mb-title { display: block; width: 100%; font-size: 32px; line-height: 1.1; color: var(--ink); background: transparent; border: 0; padding: 2px 0; outline: none; border-bottom: 1px solid transparent; transition: border-color .2s; }
.ch-mb-sub { display: block; width: 100%; font-size: 14px; color: var(--muted); background: transparent; border: 0; padding: 4px 0; outline: none; border-bottom: 1px solid transparent; transition: border-color .2s; }
.ch-mb-title:hover, .ch-mb-sub:hover { border-color: var(--line); } .ch-mb-title:focus, .ch-mb-sub:focus { border-color: var(--ink); }
.ch-mb-stats { display: flex; align-items: stretch; gap: 10px; padding: 12px 28px 4px; flex: none; }
.ch-mb-stats > div { display: flex; flex-direction: column; justify-content: center; padding: 8px 14px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); min-width: 64px; }
.ch-mb-stats b { font-size: 18px; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; color: var(--ink); }
.ch-mb-stats span { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.ch-mb-stats .ch-mb-macro { flex: 1; min-width: 0; gap: 8px; }
.ch-mb-bar { display: flex; gap: 2px; height: 6px; border-radius: 99px; overflow: hidden; background: var(--line); }
.ch-mb-bar i { display: block; background: var(--ink); } .ch-mb-bar i:nth-child(1) { background: var(--accent); } .ch-mb-bar i:nth-child(3) { opacity: .45; }
.ch-mb-macro span { text-transform: none; letter-spacing: 0; font-size: 11.5px; white-space: nowrap; }
.ch-mb-seg { display: flex; gap: 4px; margin: 14px 28px 0; padding: 4px; border-radius: 14px; background: var(--soft); flex: none; }
.ch-mb-seg button { flex: 1; height: 36px; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: var(--muted); display: inline-flex; align-items: center; justify-content: center; gap: 7px; transition: all .2s; }
.ch-mb-seg button { white-space: nowrap; }
@media (max-width: 640px) { .ch-mb-seg { gap: 2px; } .ch-mb-seg button { font-size: 12.5px; gap: 4px; padding-inline: 4px; min-width: 0; } .ch-mb-seg button:last-child { flex: 1.5; } }
.ch-mb-seg button:hover { color: var(--ink); } .ch-mb-seg button.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.ch-mb-seg em { font-style: normal; font-size: 11px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; background: var(--ink); color: var(--surface); display: grid; place-items: center; }
.ch-mbox-body { flex: 1; overflow-y: auto; padding: 16px 28px 24px; display: flex; flex-direction: column; gap: 12px; }
.ch-mb-course { border: 1px solid var(--line); border-radius: 18px; background: var(--surface); padding: 14px 16px 16px; text-align: left; }
.ch-mb-course .ch-course-h { margin-bottom: 10px; }
.ch-mb-n { flex: none; width: 24px; height: 24px; border-radius: 50%; background: var(--soft); color: var(--muted); font-size: 12px; font-weight: 600; display: grid; place-items: center; }
.ch-mb-dish { padding: 4px 4px 4px 6px; border-radius: 12px; background: var(--soft); margin-bottom: 6px; }
.ch-mb-dish select { background: transparent; border-color: transparent; box-shadow: none; }
.ch-mb-course > .ch-add { width: 100%; justify-content: center; margin-top: 4px; }
.ch-mb-addc { width: 100%; justify-content: center; height: 46px; border-radius: 16px; }
.ch-dish-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14.5px; font-weight: 600; color: var(--ink); }
.ch-mb-f2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ch-mb-f2 .fld-label { display: block; margin-bottom: 4px; }
.ch-mb-f2 .ch-pick { width: 100%; height: 44px; background: var(--surface); border-color: var(--line); padding: 0 13px; font-weight: 500; }
@media (max-width: 480px) { .ch-mb-f2 { grid-template-columns: 1fr; gap: 10px; } .ch-mb-f2 > div:nth-child(n+3):nth-child(-n+6) { min-width: 0; } }
.ch-mb-f3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px; }
.ch-mb-f3 .fld-label { display: block; margin-bottom: 4px; }
.ch-sp { border: 1px solid var(--line); border-radius: 18px; background: var(--surface); padding: 14px 16px 16px; display: grid; gap: 12px; text-align: left; }
.ch-sp-h { display: flex; align-items: center; gap: 10px; }
.ch-sp-g { display: flex; gap: 12px; } .ch-sp-g > div:first-child { flex: 1; min-width: 0; }
.ch-sp .fld-label { display: block; margin-bottom: 5px; }
.ch-sp-b { padding-top: 12px; border-top: 1px solid var(--line); } .ch-sp-b .ch-add { margin-top: 2px; }
.ch-sp .ch-dish { margin-bottom: 8px; }
.ch-mb-pat { display: inline-flex; align-items: center; gap: 5px; margin: 6px 0 0 8px; font-size: 12px; font-weight: 600; color: var(--muted); }
.ch-mb-pat i { font-size: 13px; }
.ch-mb-lab { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); margin: 14px 0 8px; }
.ch-mbox-foot { flex: none; display: flex; align-items: center; gap: 8px; padding: 14px 28px 18px; border-top: 1px solid var(--line); background: var(--paper); }
@media (max-width: 640px) { .ch-mbox-head, .ch-mbox-body, .ch-mbox-foot, .ch-mb-stats { padding-inline: 16px; } .ch-mb-seg { margin-inline: 16px; } .ch-mb-title { font-size: 26px; } .ch-mb-lbl { display: none; } .ch-mb-stats > div { min-width: 0; padding-inline: 10px; } }
.ch-mbw { gap: 18px; }
/* box del menù: stessi colori delle altre finestre (fondo del modale, card vetro); testata e piede si staccano con una linea */
.ch-mbox-head { padding-bottom: 10px; border-bottom: 1px solid var(--line); position: relative; z-index: 2; }
.ch-mbox-foot { background: transparent; position: relative; z-index: 2; }
.ch-mb-seg { margin-top: 12px; }
html[data-look='vetro'] :is(.ch-mb-course, .ch-sp) { background: var(--v-material); -webkit-backdrop-filter: var(--v-blur); backdrop-filter: var(--v-blur); border-color: transparent; box-shadow: 0 1px 2px rgba(70,60,30,.06); border-radius: 22px; }
html[data-look='vetro'] .ch-mb-stats > div { background: rgba(255,255,255,.55); border-color: transparent; box-shadow: none; border-radius: 16px; }
.ch-mb-stats > div { border-color: transparent; }
.ch-mbox-head { border-bottom-color: transparent; }
.ch-mb-seg { box-shadow: none; border: 0; }
/* bordi uguali su tutte le card: sempre 1px, il fondo non passa sotto il bordo e l'angolo non si taglia in cima allo scorrimento */
.ch-mb-course, .ch-sp { border: 1px solid transparent; background-clip: padding-box; box-shadow: 0 0 0 1px var(--line); border-radius: 22px; }
.ch-mb-course.act { border-color: transparent; box-shadow: 0 0 0 1.5px var(--accent); }
html[data-look='vetro'] :is(.ch-mb-course, .ch-sp) { box-shadow: 0 1px 2px rgba(70,60,30,.06); }
html[data-look='vetro'] .ch-mb-course.act { border-color: transparent; box-shadow: 0 0 0 1.5px var(--accent); }
.ch-mbox-body { padding-top: 12px; -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 12px); mask-image: linear-gradient(to bottom, transparent 0, #000 12px); }
/* corpo centrato (la barra di scorrimento non sposta le card), tasti con un solo colore di focus, raggi concentrici */
.ch-mbox-body { scrollbar-gutter: stable both-edges; scrollbar-width: thin; }
@media (max-width: 640px) { .ch-mbox-body { scrollbar-width: none; scrollbar-gutter: auto; } .ch-mbox-body::-webkit-scrollbar { display: none; } }
.ch-add:focus, .ch-add:focus-visible { outline: none; box-shadow: none; border-color: var(--ink); color: var(--ink); }
.ch-mb-seg { border-radius: 18px; } .ch-mb-seg button { border-radius: 14px; }
/* vetro colorato: il box lascia passare i colori dello sfondo invece del beige pieno */
html[data-look='vetro'] .ch-mbw.dg-overlay { background: rgba(255,255,255,.12); -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4); }
html[data-look='vetro'] .ch-mbw .dg-modal { background: rgba(255,255,255,.34); -webkit-backdrop-filter: blur(40px) saturate(1.9); backdrop-filter: blur(40px) saturate(1.9); border-color: rgba(255,255,255,.7); }
html[data-look='vetro'] .ch-mbw :is(.ch-mb-course, .ch-sp) { background: rgba(255,255,255,.5); }
html[data-look='vetro'] .ch-mbw .ch-mb-stats > div { background: rgba(255,255,255,.45); }
html[data-look='vetro'] .ch-mb-seg { background: rgba(23,24,27,.05); border-radius: 18px; }
html[data-look='vetro'] .ch-mb-seg button.on { background: rgba(255,255,255,.9); }
html[data-look='vetro'] .ch-mb-course.act { border-color: transparent; }

.ch-side { display: none; position: absolute; top: 50%; left: calc(50% + 378px); transform: translateY(-50%); width: 276px; flex-direction: column; gap: 12px; max-height: 88vh; min-height: 0; }
@media (min-width: 1340px) { .ch-side { display: flex; } }
.ch-sc { background: color-mix(in srgb, var(--paper) 94%, #fff); backdrop-filter: blur(18px); border: 1px solid var(--line); box-shadow: 0 10px 30px -14px rgba(18, 19, 23, .25); border-radius: 20px; padding: 14px 16px; color: var(--ink); }
.ch-side-l { left: auto; right: calc(50% + 378px); }
.ch-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
.ch-bars li { display: grid; grid-template-columns: 70px 1fr 42px; align-items: center; gap: 8px; font-size: 12.5px; }
.ch-bars li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
.ch-bars li div { height: 6px; border-radius: 99px; background: var(--line); overflow: hidden; } .ch-bars li i { display: block; height: 100%; background: var(--accent); border-radius: 99px; }
.ch-bars li b { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
.ch-macro { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
.ch-macro span { display: grid; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); } .ch-macro b { font-size: 17px; letter-spacing: 0; text-transform: none; color: var(--ink); }
.ch-al li { display: block; } .ch-al li span { white-space: normal; display: grid; gap: 2px; } .ch-al small { font-size: 11.5px; color: var(--muted); font-weight: 400; }
.ch-sc-fill { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.ch-sc-h { font-size: 10.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
.ch-sc-e { font-size: 12.5px; color: var(--muted); line-height: 1.45; } .ch-sc-e b { color: var(--ink); }
.ch-prog { height: 6px; border-radius: 99px; background: var(--line); overflow: hidden; margin-bottom: 12px; } .ch-prog i { display: block; height: 100%; background: var(--accent); border-radius: 99px; transition: width .4s var(--ease); }
.ch-checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ch-checks li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--muted); } .ch-checks li.ok { color: var(--ink); } .ch-checks li.ok i { color: var(--accent); }
.ch-checks small { margin-left: auto; font-size: 11.5px; color: var(--muted); }
.ch-sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 10px; }
.ch-sc-grid b { display: block; font-size: 22px; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; } .ch-sc-grid span { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.ch-sc-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; min-height: 0; }
.ch-sc-list li { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--line); font-size: 13px; } .ch-sc-list li:last-child { border: 0; }
.ch-sc-list li span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ch-sc-list b { font-weight: 600; font-variant-numeric: tabular-nums; flex: none; }
.ch-sc-s { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; border: 1px solid var(--line); border-radius: 12px; color: var(--muted); margin-bottom: 8px; } .ch-sc-s input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 13.5px; color: var(--ink); }
.ch-sc-rec li { align-items: center; padding: 2px 0; gap: 4px; }
.ch-sc-add { flex: 1; min-width: 0; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 8px; border-radius: 10px; text-align: left; font-size: 13px; color: var(--ink); } .ch-sc-add:hover { background: var(--soft); }
.ch-sc-add span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ch-sc-add small { flex: none; font-size: 11px; color: var(--muted); }
.ch-sc-rec .ch-x { width: 30px; height: 30px; flex: none; }
.ch-mb-course.act { border-color: transparent; }
.ch-qe-note { display: flex; gap: 10px; align-items: flex-start; padding: 14px 24px; font-size: 13px; line-height: 1.45; color: var(--ink); background: var(--soft); border-bottom: 1px solid var(--line); flex: none; } .ch-qe-note i { color: var(--warn); font-size: 18px; margin-top: 1px; }
.ch-qe-body { flex: 1; overflow-y: auto; padding: 22px 24px 28px; }
.ch-qe .ch-edit { grid-template-columns: 1fr !important; } .ch-qe .ch-live { display: none; }
/* effetti */
.ch-card { position: relative; transform-style: preserve-3d; will-change: transform; transition: transform .25s var(--ease), box-shadow .35s var(--ease), border-color .2s; }
.ch-hero { position: relative; }
.ch-stats { display: flex; flex-wrap: wrap; align-items: stretch; gap: 14px; margin-bottom: 22px; }
.ch-stats > div:not(.ch-cats) { flex: 1 1 130px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); }
.ch-stats b { display: block; font-size: 32px; font-weight: 600; letter-spacing: -.03em; color: var(--ink); font-variant-numeric: tabular-nums; }
.ch-stats small { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.ch-cats { flex: 2 1 220px; display: flex; align-items: flex-end; gap: 10px; padding: 14px 18px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); min-height: 86px; }
.ch-cats span { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 70px; gap: 4px; }
.ch-cats i { width: 100%; max-width: 26px; border-radius: 6px 6px 3px 3px; background: var(--ink); min-height: 4px; transform-origin: bottom; animation: ch-grow .8s var(--ease) backwards; }
.ch-cats span:first-child i { background: var(--accent); }
.ch-cats small { font-size: 10px; letter-spacing: .06em; text-transform: uppercase; }
@keyframes ch-grow { from { transform: scaleY(0); } }
.ch-donut { position: relative; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--line); border-radius: 22px; background: var(--surface); }
.ch-donut svg { display: block; }
.ch-arc { animation: ch-draw 1.1s var(--ease) backwards; }
@keyframes ch-draw { from { stroke-dasharray: 0 999; } }
.ch-donut-c { position: absolute; top: 18px; left: 0; right: 0; height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.ch-donut-c b { font-size: 38px; font-weight: 600; letter-spacing: -.04em; line-height: 1; color: var(--ink); font-variant-numeric: tabular-nums; }
.ch-donut-c small { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
.ch-legend-col { flex-direction: column; gap: 8px; width: 100%; }
.ch-legend-col span { display: flex; align-items: center; gap: 8px; }
.ch-legend-col i { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.ch-legend-col b { margin-left: auto; }
.ch-legend-col em { font-style: normal; width: 36px; text-align: right; }
.ch-ibars { display: flex; flex-direction: column; gap: 10px; margin-bottom: 34px; }
.ch-ibar { display: grid; grid-template-columns: minmax(80px, 160px) 1fr 40px; gap: 12px; align-items: center; font-size: 13.5px; animation: rise .5s var(--ease) backwards; }
.ch-ibar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ch-ibar div { height: 8px; border-radius: 8px; background: var(--soft); overflow: hidden; }
.ch-ibar i { display: block; height: 100%; border-radius: 8px; background: var(--accent); transform-origin: left; animation: ch-bar 1s var(--ease) backwards; }
@keyframes ch-bar { from { transform: scaleX(0); } }
.ch-ibar em { font-style: normal; text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; }
.ch-cover .ch-ico { font-size: 44px; color: var(--muted); opacity: .55; }
.ch-side .ch-cover .ch-ico { font-size: 72px; }
.ch-port b { display: inline-flex; align-items: center; gap: 8px; }
.ch-port b button { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); display: inline-grid; place-items: center; font-size: 12px; color: var(--ink); transition: border-color .2s, transform .2s; }
.ch-port b button:hover:not(:disabled) { border-color: var(--ink); } .ch-port b button:active { transform: scale(.9); } .ch-port b button:disabled { opacity: .35; }
.ch-port u { cursor: pointer; text-decoration: none; color: var(--accent); }
.ch-edit { display: grid; gap: 28px; align-items: start; }
@media (min-width: 900px) { .ch-edit { grid-template-columns: minmax(0, 1fr) 280px; } }
.ch-live { position: sticky; top: 84px; z-index: 5; }
.ch-cook { position: fixed; inset: 0; z-index: 9999; background: var(--paper); display: flex; flex-direction: column; padding: 18px 20px 26px; animation: fadeIn .3s ease both; }
.ch-cook-top { display: flex; align-items: center; gap: 12px; max-width: 900px; width: 100%; margin: 0 auto; }
.ch-cook-bar { height: 3px; background: var(--line); max-width: 900px; width: 100%; margin: 16px auto 0; border-radius: 3px; overflow: hidden; }
.ch-cook-bar i { display: block; height: 100%; background: var(--accent); transition: width .5s var(--ease); }
.ch-cook-main { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 900px; width: 100%; margin: 0 auto; animation: step-fwd .45s var(--ease) backwards; }
.ch-cook-n { font-size: clamp(90px, 22vw, 220px); line-height: .9; color: var(--accent); opacity: .9; }
.ch-cook-main p { font-size: clamp(22px, 4vw, 40px); line-height: 1.3; letter-spacing: -.02em; color: var(--ink); margin-top: 8px; text-wrap: pretty; }
.ch-cook-foot { display: flex; align-items: center; justify-content: space-between; max-width: 900px; width: 100%; margin: 0 auto; }
@media (prefers-reduced-motion: reduce) { .ch-arc, .ch-ibar i, .ch-cats i, @media print { .ch-noprint { display: none !important; } }
`;
