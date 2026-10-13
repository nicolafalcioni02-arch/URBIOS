// Stili della Dieta guidata (iniettati, con prefisso dg- per non toccare il resto).
// Le classi uai-* servono al pannello di verifica dell'AI (DietReview) quando compare qui dentro.
export const guidedCss = `
.dg-root { box-sizing: border-box; padding: 16px 16px 0; flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; background: var(--paper); color: var(--ink); text-align: left; overflow: hidden; }

/* testata */
.dg-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 14px 20px 10px; }
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
.dg-stepbar { flex: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; box-sizing: border-box; padding: 4px 20px 14px; border-bottom: 1px solid var(--line); }
.dg-step { display: flex; align-items: center; gap: 11px; min-width: 0; padding: 9px 14px; border-radius: 18px; border: 1px solid var(--line); background: #fff; text-align: left; cursor: pointer; transition: all .25s var(--ease, ease); }
.dg-step:hover { border-color: var(--ink); }
.dg-step b { display: block; font-size: 14.5px; line-height: 1.2; }
.dg-step small { display: block; font-size: 12px; font-weight: 500; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dg-step.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.dg-step.on small { color: rgba(255,255,255,.7); }
.dg-step.locked { opacity: .55; }
.dg-dot { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; background: var(--soft); flex: none; }
.dg-step.on .dg-dot { background: #fff; color: var(--ink); }
.dg-step .dg-dot i { color: var(--ok); }
/* strumenti del passo */
.dg-toolbar { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.dg-sm { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 13px; border-radius: 999px; border: 1px solid transparent; background: var(--soft); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
.dg-sm:hover { border-color: var(--ink); }
.dg-body { flex: 1; overflow-y: auto; padding: 24px 20px 48px; }
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
.dg-sticky { position: sticky; top: -24px; z-index: 5; margin-top: 12px; padding: 16px 18px; border-radius: 22px; background: color-mix(in srgb, #fff 94%, transparent); backdrop-filter: blur(10px); border: 1px solid var(--line); box-shadow: 0 8px 24px rgba(18,19,23,.06); }
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
.dg-sub { padding: 10px 0; border-bottom: 1px solid var(--line); }
.dg-sub:last-of-type { border-bottom: 0; }
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
@media (max-width: 899px) { .dg-root { padding: 0; height: auto; min-height: 70vh; overflow: visible; } .dg-body { overflow: visible; padding: 18px 14px 40px; } .dg-head { padding: 12px 14px 8px; } .dg-stepbar { padding: 4px 14px 12px; } }
@media (max-width: 560px) { .dg-tool { padding: 0 13px; height: 40px; font-size: 13px; } .dg-planbtn { width: 100%; } .dg-tools { width: 100%; } .dg-tools .dg-tool { flex: 1; justify-content: center; } .dg-step { padding: 8px 9px; gap: 7px; } .dg-step b { font-size: 13px; } .dg-step small { font-size: 11px; } .dg-dot { width: 24px; height: 24px; font-size: 12px; } .dg-h { font-size: 24px; } .dg-sticky { top: 0; } }
`;
