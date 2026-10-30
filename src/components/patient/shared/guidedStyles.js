// Stili della Dieta guidata (iniettati, con prefisso dg- per non toccare il resto).
// Le classi uai-* servono al pannello di verifica dell'AI (DietReview) quando compare qui dentro.
export const guidedCss = `
.dg-root { box-sizing: border-box; width: 100%; max-width: 64rem; margin: 0 auto; padding: 14px 16px 90px; color: var(--ink); text-align: left; overflow-x: clip; }
@media (min-width: 768px) { .dg-root { padding: 22px 32px 100px; } }
/* i contenitori storici (.d-root / .t-root) non devono più fare da scatola */
.d-root.dg-page, .t-root.dg-page { display: block; height: auto; min-height: 0; overflow: visible; margin: 0; width: 100%; background: transparent; }

/* testata */
.dg-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; animation: rise .5s var(--ease) backwards; }
.dg-orb { position: relative; flex: none; width: 52px; height: 52px; }
.dg-orb > div { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; background: #fff; box-shadow: 0 6px 18px rgba(18,19,23,.10); transition: transform .8s var(--ease); }
.dg-headmain { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.dg-kicker { font-size: 13px; color: var(--muted); line-height: 1.2; }
.dg-planbtn { display: inline-flex; align-items: center; gap: 9px; max-width: 100%; min-height: 42px; padding: 0 16px; border-radius: 16px; border: 1px solid var(--line); background: #fff; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: all .2s; text-align: left; }
.dg-planbtn:hover { border-color: var(--ink); }
.dg-planbtn > i:first-child { font-size: 19px; flex: none; }
.dg-planbtn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.dg-planbtn .dg-edit { color: var(--muted); font-size: 15px; flex: none; }
.dg-tools { display: flex; gap: 8px; flex-wrap: wrap; }
.dg-tool { display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; white-space: nowrap; }
.dg-tool:hover { border-color: var(--ink); }
.dg-tool i { font-size: 18px; }
.dg-tool.ai { background: var(--ink); color: #fff; border-color: var(--ink); }
/* i tre passi */
.dg-stepbar { position: sticky; top: 0; z-index: 30; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0 -16px; padding: 8px 16px 14px; background: color-mix(in srgb, var(--paper) 86%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); animation: rise .55s var(--ease) .05s backwards; }
@media (min-width: 768px) { .dg-stepbar { margin: 0 -32px; padding: 8px 32px 14px; } }
.dg-prog { grid-column: 1 / -1; height: 3px; border-radius: 99px; background: var(--soft); overflow: hidden; }
.dg-prog > i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--ink), #5b5f6b, var(--ok)); background-size: 200% 100%; animation: dgShim 3s linear infinite; transition: width .8s var(--ease); }
@keyframes dgShim { to { background-position: -200% 0; } }
.dg-step { display: flex; align-items: center; gap: 11px; min-width: 0; padding: 9px 14px; border-radius: 18px; border: 1px solid var(--line); background: #fff; text-align: left; cursor: pointer; transition: all .25s var(--ease, ease); }
.dg-step:hover { border-color: var(--ink); transform: translateY(-1px); }
.dg-step b { display: block; font-size: 14.5px; line-height: 1.2; }
.dg-step small { display: block; font-size: 12px; font-weight: 500; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dg-step.on { background: var(--ink); color: #fff; border-color: var(--ink); box-shadow: 0 10px 26px rgba(18,19,23,.22); }
.dg-step.on small { color: rgba(255,255,255,.7); }
.dg-step.locked { opacity: .55; }
.dg-dot { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; background: var(--soft); flex: none; }
.dg-step.on .dg-dot { background: #fff; color: var(--ink); }
.dg-step .dg-dot i { color: var(--ok); animation: pop .45s var(--ease) backwards; }
/* strumenti del passo */
.dg-toolbar { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.dg-sm { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 13px; border-radius: 999px; border: 1px solid transparent; background: var(--soft); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
.dg-sm:hover { border-color: var(--ink); }
.dg-body { padding: 8px 0 24px; }
.dg-stat { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; white-space: nowrap; flex: none; }
.dg-in, .uai-in { animation: dgIn .4s var(--ease, ease) both; }
@keyframes dgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.dg-h { font-size: 28px; font-weight: 600; line-height: 1.15; letter-spacing: -.01em; }
.dg-sub { font-size: 15px; color: var(--muted); margin-top: 6px; }
.dg-card { background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 20px; margin-top: 16px; }
.dg-q { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.dg-hint { font-size: 12.5px; color: var(--muted); margin-top: 10px; }
.dg-warn { font-size: 13px; margin-top: 10px; padding: 10px 14px; border-radius: 14px; background: #FFF6E5; color: #8A5300; }
.dg-chip, .uai-chip { display: inline-flex; flex-direction: column; justify-content: center; align-items: flex-start; min-height: 42px; padding: 6px 16px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface, #fff); font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; text-align: left; }
.dg-chip.row { flex-direction: row; align-items: center; gap: 6px; white-space: nowrap; flex: none; }
.dg-chip small { font-size: 11.5px; font-weight: 500; opacity: .65; margin-top: 1px; }
.dg-chip:hover, .uai-chip:hover { border-color: var(--ink); }
.dg-chip.on, .uai-chip.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.uai-chip { flex-direction: row; align-items: center; height: 40px; min-height: 0; padding: 0 16px; border-radius: 999px; font-weight: 500; }
.dg-result { margin-top: 20px; padding: 22px; border-radius: 24px; background: var(--ink); color: #fff; }
.dg-bar, .uai-bar { height: 6px; border-radius: 99px; background: var(--soft); overflow: hidden; }
.dg-bar > i, .uai-bar > i { display: block; height: 100%; border-radius: 99px; background: var(--ink); transition: width .4s var(--ease, ease); }
.dg-sticky { position: sticky; top: var(--dg-sticky-top, 82px); z-index: 5; margin-top: 12px; padding: 16px 18px; border-radius: 22px; background: color-mix(in srgb, #fff 94%, transparent); backdrop-filter: blur(10px); border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(18,19,23,.06); }
.dg-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.dg-row:last-child { border-bottom: 0; }
.dg-stepper { display: inline-flex; align-items: center; gap: 4px; background: var(--soft); border-radius: 999px; padding: 3px; flex: none; }
.dg-stepper button { width: 32px; height: 32px; border-radius: 50%; border: 0; background: #fff; display: grid; place-items: center; cursor: pointer; }
.dg-stepper button:hover { background: var(--ink); color: #fff; }
.dg-stepper input { width: 52px; text-align: center; border: 0; background: transparent; font-size: 15px; font-weight: 600; outline: none; }
.dg-stepper span { font-size: 12px; color: var(--muted); margin-right: 4px; }
.dg-ghost { width: 36px; height: 36px; border-radius: 50%; border: 0; background: transparent; color: var(--muted); display: grid; place-items: center; cursor: pointer; flex: none; }
.dg-ghost:hover { background: var(--soft); color: var(--ink); }
.dg-add { display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; height: 42px; padding: 0 16px; border-radius: 999px; border: 1.5px dashed #CFCCC3; background: transparent; font-size: 14px; font-weight: 600; cursor: pointer; flex: 1; min-width: 0; width: 100%; justify-content: center; transition: all .2s; }
.dg-add:hover { border-color: var(--ink); background: #fff; }
.dg-link { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; padding: 0; font-size: 13.5px; font-weight: 600; color: var(--ink); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.dg-ghost { position: relative; }
.dg-ghost.has { color: var(--ink); }
.dg-ghost em { position: absolute; top: 2px; right: 0; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 99px; background: var(--ink); color: #fff; font-size: 10px; font-style: normal; font-weight: 700; display: grid; place-items: center; }
.dg-subs { margin: 2px 0 8px; padding: 14px; border-radius: 18px; background: #FBFAF8; border: 1px solid var(--line); }
.dg-subrow { padding: 10px 0; border-bottom: 1px solid var(--line); }
.dg-subrow:last-of-type { border-bottom: 0; }
.dg-mini { display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .2s; }
.dg-mini:hover { border-color: var(--ink); }
.dg-mini.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.dg-adv summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 600; }
.dg-adv summary::-webkit-details-marker { display: none; }
.dg-adv summary small { font-size: 12px; font-weight: 500; color: var(--muted); margin-left: 6px; }
.dg-adv[open] summary > i:last-child { transform: rotate(180deg); }
.dg-stat2 { background: #fff; border: 1px solid #EDEDF0; border-radius: 14px; padding: 8px 12px; min-width: 88px; flex: 1 1 88px; }
.dg-stat2 small { display: block; font-size: 11.5px; font-weight: 500; color: var(--muted); }
.dg-stat2 b { display: block; font-size: 16px; margin-top: 1px; }
.dg-badge { font-style: normal; font-size: 10.5px; font-weight: 700; margin-left: 6px; padding: 1px 7px; border-radius: 99px; background: #FFF1D6; color: #9A5B00; }
.dg-chip.on .dg-badge { background: rgba(255,255,255,.2); color: #fff; }
.dg-search { margin-top: 10px; }
.dg-action { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 20px; border: 1px solid var(--line); background: #fff; cursor: pointer; transition: all .2s; }
.dg-action:hover { border-color: var(--ink); }
.dg-action > i:first-child { font-size: 26px; }
.dg-action b { display: block; font-size: 15px; }
.dg-action small { display: block; font-size: 12.5px; color: var(--muted); margin-top: 2px; }
.dg-action.primary { background: var(--ink); color: #fff; border-color: var(--ink); }
.dg-action.primary small { color: rgba(255,255,255,.7); }
.dg-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; justify-content: center; background: rgba(18,19,23,.45); backdrop-filter: blur(6px); }
.dg-modal { width: 100%; max-width: 48rem; height: 100dvh; display: flex; flex-direction: column; background: var(--paper); overflow: hidden; }
@media (min-width: 640px) { .dg-overlay { align-items: center; padding: 24px; } .dg-modal { height: 88vh; border-radius: 28px; box-shadow: 0 30px 80px rgba(0,0,0,.3); } }
@media (max-width: 899px) { .dg-body { padding-top: 4px; } }
@media (max-width: 560px) { .dg-tool { padding: 0 13px; height: 40px; font-size: 13px; } .dg-planbtn { width: 100%; } .dg-tools { width: 100%; } .dg-tools .dg-tool { flex: 1; justify-content: center; } .dg-step { padding: 8px 9px; gap: 7px; } .dg-step b { font-size: 13px; } .dg-step small { font-size: 11px; } .dg-dot { width: 24px; height: 24px; font-size: 12px; } .dg-h { font-size: 24px; }  }

@media (max-width: 560px) { .dg-root { --dg-sticky-top: 72px; } }
/* titolo del passo (stesso stile di "Nuova visita") */
.dg-title { font-weight: 600; font-size: 28px; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); margin: 4px 0 0; }
@media (min-width: 640px) { .dg-title { font-size: 38px; } }
.dg-hint2 { font-size: 14px; color: var(--muted); margin: 6px 0 18px; max-width: 36rem; }
.dg-fwd { animation: dgFwd .5s var(--ease) backwards; }
.dg-back { animation: dgBack .5s var(--ease) backwards; }
@keyframes dgFwd { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes dgBack { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
/* le carte salgono una dopo l'altra */
.dg-body .dg-card, .dg-body .dg-result, .dg-body .dg-sticky { animation: rise .6s var(--ease) backwards; }
.dg-body .dg-card:nth-of-type(2) { animation-delay: .05s; }
.dg-body .dg-card:nth-of-type(3) { animation-delay: .1s; }
.dg-body .dg-card:nth-of-type(4) { animation-delay: .15s; }
.dg-body .dg-card:nth-of-type(5) { animation-delay: .2s; }
.dg-body .dg-card:nth-of-type(n+6) { animation-delay: .25s; }
.dg-chip.on, .dg-mini.on { animation: pop .38s var(--ease); }
.dg-card { transition: box-shadow .35s var(--ease), transform .35s var(--ease); }
.dg-card:hover { box-shadow: 0 14px 34px rgba(18,19,23,.07); }
.dg-action:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(18,19,23,.10); }
.dg-action { transition: all .3s var(--ease); }
.dg-result { position: relative; overflow: hidden; }
.dg-result::after { content: ''; position: absolute; inset: -40% -20% auto auto; width: 70%; height: 140%; background: radial-gradient(closest-side, rgba(255,255,255,.16), transparent); pointer-events: none; animation: dgGlow 7s ease-in-out infinite; }
@keyframes dgGlow { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-12%, 8%); } }
/* barra Indietro / Avanti sempre sotto il pollice, come in "Nuova visita" */
.dg-foot { position: sticky; bottom: 0; z-index: 25; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 28px -16px 0; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
@media (min-width: 768px) { .dg-foot { margin: 28px -32px 0; padding: 12px 32px; } }
.dg-foot .vw-next { margin-left: auto; }
/* ---- telefono: prima ciò che serve con una mano, il resto dietro un tocco (Dieta e Training) ---- */
@media (max-width: 639px) {
  .dg-root { padding-top: 6px; }
  .dg-head { flex-wrap: nowrap; align-items: center; gap: 8px; margin-bottom: 8px; }
  .dg-orb, .dg-kicker { display: none; }
  .dg-headmain { min-width: 0; }
  .dg-planbtn { width: 100%; min-height: 44px; padding: 0 12px; gap: 7px; }
  .dg-planbtn .dg-edit { display: none; }
  .dg-planbtn span { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.2; font-size: 14.5px; }
  .dg-planbtn { min-height: 48px; padding-top: 4px; padding-bottom: 4px; }
  .dg-planbtn .dg-stat { font-size: 11px; padding: 2px 8px; }
  .dg-tools { display: flex; gap: 6px; flex: none; width: auto; }
  .dg-tools .dg-tool { width: 44px; height: 44px; padding: 0; justify-content: center; border-radius: 14px; flex: none; }
  .dg-tool-l { display: none; }
  .dg-tools .dg-tool i { font-size: 20px; }
  .dg-step .dg-dot, .dg-step small { display: none; }
  .dg-step { padding: 8px 10px; border-radius: 14px; justify-content: center; min-height: 44px; }
  .dg-step b { font-size: 15px; text-align: center; }
  .dg-body[data-step="menu"] .dg-title, .dg-body[data-step="menu"] .dg-hint2 { display: none; }
  .dg-title { font-size: 26px; }
  .dg-hint2 { display: none; }
  .dg-title { margin-bottom: 12px; }
  .dg-chip.row { min-height: 46px; padding: 0 18px; font-size: 15px; }
  .dg-add { height: 48px; }
  /* scelte a due righe (obiettivo, livello...): una sotto l'altra, tutte della stessa larghezza */
  .dg-chip:has(small):not(.row) { flex: 1 1 100%; width: 100%; }
  /* righe che scorrono di lato: si tagliano al bordo dello schermo, non a 16 px */
  .t-fade { -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); }
  .dg-chip.row { max-width: 62vw; overflow: hidden; text-overflow: ellipsis; }
  .t-bleed { margin-left: -16px; margin-right: -16px; padding-left: 16px; padding-right: 16px; }
  .dg-more { width: 46px; height: 46px; border-radius: 14px; background: #fff; border: 1px solid var(--line); color: var(--ink); }
  /* barra in fondo allo schermo, sempre */
  .dg-foot { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; gap: 8px; padding: 10px 16px max(12px, env(safe-area-inset-bottom)); }
  .dg-body { padding-bottom: 96px; }
  .dg-in { animation-fill-mode: backwards; }
  .dg-foot .vw-back { width: 46px; height: 52px; padding: 0; flex: none; border-radius: 16px; }
  .dg-foot .vw-back span { display: none; }
  .dg-foot .vw-next { flex: 1; min-width: 0; height: 52px; border-radius: 16px; font-size: 16px; }
  /* riepilogo dei macro: tre colonne compatte */
  .dg-sticky { padding: 12px 14px; border-radius: 18px; }
  .dg-sticky .gap-4 { gap: 10px !important; flex-wrap: nowrap; }
  .dg-sticky .gap-4 > div { min-width: 0 !important; flex: 1 1 0; }
  .dg-sticky .gap-4 > div > div:first-child { flex-direction: column; gap: 0; }
  /* alimento: nome in alto, sotto grammi e azioni */
  .dg-row { flex-wrap: wrap; row-gap: 6px; }
  .dg-row > div:first-child { flex: 1 1 100%; }
  .dg-row .dg-stepper { margin-right: auto; padding: 4px; }
  .dg-row .dg-stepper button { width: 40px; height: 40px; }
  .dg-row .dg-stepper input { width: 56px; font-size: 17px; }
  .dg-row .dg-ghost { width: 44px; height: 44px; }
  .dg-card .dg-ghost { width: 40px !important; height: 40px !important; }
}

/* pannelli dal basso (nome, aggiungi pasto...) condivisi da Dieta e Training */
.t-cellsheet { max-width: 520px; padding: 14px 14px calc(16px + env(safe-area-inset-bottom)); max-height: 88dvh; overflow-y: auto; }
.t-cell-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 2px 4px 12px; }
.t-cell-head p { font-size: 17px; font-weight: 700; line-height: 1.2; }
.t-cell-head span { font-size: 13px; color: var(--muted); }
.t-cell-done { width: 100%; height: 52px; border-radius: 16px; }
.t-cell-done:disabled { opacity: .4; }
.t-addmeal-list { display: flex; flex-direction: column; gap: 8px; max-height: 42dvh; overflow-y: auto; padding-bottom: 4px; }
.t-addmeal-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; padding: 12px 14px; min-height: 56px; border-radius: 16px; background: #fff; border: 1px solid var(--line); }
.t-addmeal-row b { display: block; font-size: 15px; font-weight: 600; }
.t-addmeal-row small { display: block; font-size: 12.5px; color: var(--muted); }
.t-addmeal-row i { color: var(--muted); font-size: 18px; flex: none; }
.t-addmeal-row:active { background: var(--soft); }

/* anteprima di un pasto salvato */
.t-prevsheet { display: flex; flex-direction: column; max-height: 92dvh; padding-bottom: 0; }
.t-prev { display: flex; flex-direction: column; min-height: 0; }
.t-prev-body { overflow-y: auto; padding: 0 4px 12px; min-height: 0; }
.t-prev-kcal { font-size: 34px; line-height: 1; padding: 2px 0 12px; }
.t-prev-kcal b { font-weight: 700; }
.t-prev-kcal span { font-size: 15px; color: var(--muted); font-weight: 500; }
.t-prev-stack { display: flex; height: 12px; border-radius: 99px; overflow: hidden; background: var(--soft); gap: 2px; }
.t-prev-stack i { display: block; height: 100%; }
.t-prev-legend { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; font-size: 14px; }
.t-prev-legend span { display: flex; align-items: center; gap: 8px; color: var(--muted); }
.t-prev-legend b { color: var(--ink); font-weight: 600; margin-left: auto; }
.t-prev-legend span > i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.t-prev-h { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 20px 0 8px; }
.t-prev-items { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 2px 14px; }
.t-prev-items > div { display: flex; align-items: baseline; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 14.5px; }
.t-prev-items > div:last-child { border-bottom: 0; }
.t-prev-items > div > span { flex: 1; }
.t-prev-items small { color: var(--muted); font-size: 13px; }
.t-prev-items b { font-weight: 600; min-width: 62px; text-align: right; }
.t-delta { margin-bottom: 12px; }
.t-delta-top { display: flex; justify-content: space-between; align-items: baseline; font-size: 13.5px; margin-bottom: 5px; color: var(--muted); }
.t-delta-top b { color: var(--ink); font-weight: 600; }
.t-delta-top em { font-style: normal; font-weight: 400; color: var(--muted); }
.t-delta-bar { position: relative; height: 10px; border-radius: 99px; background: var(--soft); }
.t-delta-bar i { position: absolute; top: 0; left: 0; height: 100%; background: var(--ink); border-radius: 99px 0 0 99px; }
.t-delta-bar i.add { border-radius: 0 99px 99px 0; }
.t-delta-bar u { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--ink); opacity: .55; border-radius: 2px; }
.t-prev-key { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 12px; color: var(--muted); margin: 2px 0 10px; }
.t-prev-key i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; background: var(--ink); }
.t-prev-key i.add { background: var(--accent); margin-left: 6px; }
.t-prev-key u { display: inline-block; width: 2px; height: 12px; background: var(--ink); opacity: .55; margin-left: 6px; }
.t-prev-verdict { font-size: 14px; font-weight: 600; padding: 10px 14px; border-radius: 14px; }
.t-prev-verdict.ok { background: #E7F2EC; color: #1F6B49; }
.t-prev-verdict.bad { background: #FDECEA; color: #A8362F; }
.t-prev-foot { display: flex; gap: 8px; padding: 10px 0 calc(14px + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: var(--paper); }

/* tipo di giornata */
.t-daytypes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.t-daytypes button { display: flex; align-items: center; gap: 8px; min-height: 52px; padding: 8px 12px; border-radius: 14px; background: #fff; border: 1px solid var(--line); text-align: left; font-size: 14.5px; font-weight: 600; line-height: 1.2; }
.t-daytypes button i { font-size: 20px; flex: none; }
.t-daytypes button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.t-dt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.t-dt-grid label { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.t-dt-grid small { font-size: 12px; font-weight: 500; color: var(--muted); }
.t-dt-grid input { height: 48px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); background: #fff; font-size: 18px; font-weight: 600; text-align: center; width: 100%; }
.t-dt-grid input:disabled { background: var(--soft); color: var(--muted); }
.t-dt-grid em { font-style: normal; font-size: 12.5px; color: var(--muted); text-align: center; }
.t-dt-mac { grid-template-columns: repeat(3, 1fr); margin-top: 0; }
.t-dt-note { font-size: 13px; color: var(--muted); margin-top: 8px; }
.dg-badge-type { display: inline-block; margin-left: 6px; padding: 1px 7px; border-radius: 99px; font-size: 10.5px; font-weight: 700; background: var(--soft); color: var(--ink); }
.dg-chip.on .dg-badge-type { background: rgba(255,255,255,.22); color: #fff; }

/* obiettivi: giornate e matrice dei pasti */
.dg-seg { display: flex; gap: 2px; padding: 3px; border-radius: 999px; background: var(--soft); }
.dg-seg button { flex: 1; height: 42px; border-radius: 999px; font-size: 14.5px; font-weight: 600; color: var(--muted); }
.dg-seg button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(18,19,23,.12); }
.gm-sum { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 15px; }
.gm-types { margin-top: 16px; padding: 4px 12px; border-radius: 16px; background: var(--paper); border: 1px solid var(--line); }
.gm-types-h, .gm-type { display: grid; grid-template-columns: minmax(0, 1fr) 72px 64px 40px; gap: 8px; align-items: center; }
.gm-types-h { font-size: 11.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); padding: 8px 0 2px; }
.gm-types-h span:nth-child(n+2) { text-align: center; }
.gm-type { padding: 8px 0; border-top: 1px solid var(--line); min-height: 56px; }
.gm-tn { display: flex; align-items: center; gap: 8px; font-size: 14.5px; font-weight: 600; line-height: 1.2; }
.gm-tn i { font-size: 18px; flex: none; }
.gm-laf { height: 44px; width: 100%; border-radius: 12px; border: 1px solid var(--line); background: #fff; text-align: center; font-weight: 600; font-size: 16px; display: grid; place-items: center; }
.gm-laf.ro { background: var(--soft); color: var(--muted); }
.gm-k { text-align: center; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.gm-calc { width: 40px; height: 40px; border-radius: 12px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; }
.gm-check { display: flex; align-items: flex-start; gap: 12px; margin-top: 14px; padding: 12px 14px; border-radius: 16px; background: var(--paper); border: 1px solid var(--line); cursor: pointer; }
.gm-check input { width: 22px; height: 22px; margin-top: 2px; flex: none; }
.gm-check b { display: block; font-size: 14.5px; font-weight: 600; }
.gm-check small { display: block; font-size: 12.5px; color: var(--muted); }
.gm-wrap { margin: 14px -4px 0; overflow-x: auto; }
.gm-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.gm-table th, .gm-table td { padding: 6px 4px; text-align: center; vertical-align: middle; }
.gm-table thead th { font-size: 11.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }
.gm-table tbody th, .gm-table thead th:first-child, .gm-table tfoot th { width: 34%; text-align: left; font-size: 14.5px; font-weight: 600; line-height: 1.2; }
.gm-table thead th:first-child { font-size: 11.5px; }
.gm-table tbody tr { border-top: 1px solid var(--line); }
.gm-table input { width: 100%; max-width: 72px; height: 44px; border-radius: 12px; border: 1px solid var(--line); background: #fff; text-align: center; font-weight: 600; font-size: 16px; }
.gm-table em { display: block; font-style: normal; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.gm-table tfoot tr { border-top: 2px solid var(--line); }
.gm-table tfoot th { text-align: left; font-size: 14px; }
.gm-table tfoot td { font-weight: 700; font-size: 15px; }
.gm-table tfoot td.ok { color: var(--ok); }
.gm-table tfoot td.no { color: var(--bad); }
.gm-res { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.gm-res p { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0 12px; align-items: baseline; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.18); }
.gm-res b { font-size: 14.5px; font-weight: 600; }
.gm-res span { font-size: 17px; font-weight: 700; }
.gm-res small { grid-column: 1 / -1; font-size: 12.5px; opacity: .75; }

/* coriandoli della consegna */
.dg-confetti { position: fixed; z-index: 99999; width: 8px; height: 8px; border-radius: 2px; pointer-events: none; animation: dgConf .95s cubic-bezier(.2,.8,.3,1) forwards; }
@keyframes dgConf { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(var(--x), var(--y)) rotate(var(--r)); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .dg-root *, .dg-confetti { animation: none !important; transition: none !important; } }
`;
