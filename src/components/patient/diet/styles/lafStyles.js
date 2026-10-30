// Tabella LAF 24h
export const lafStyles = `
                /* --- STILI SPECIFICI PER TABELLA LAF 24H --- */
                .laf-input {
                    width: 100%; 
                    border: 1px solid transparent; 
                    background: transparent; 
                    font-weight: 700; 
                    outline: none; 
                    padding: 8px; 
                    border-radius: 8px; 
                    transition: all 0.2s ease;
                    color: #1D1D1F;
                }

                .laf-input:focus, .laf-input:hover {
                    background: #F2F2F7;
                    border-color: var(--line);
                }

                .laf-input.number {
                    text-align: center;
                    font-weight: 900;
                    font-size: 14px;
                    background: #FBFAF8;
                    border: 1px solid var(--line);
                }

                .laf-input.number:focus {
                    border-color: var(--ink);
                    background: var(--soft);
                    color: var(--ink);
                }

                .laf-row {
                    transition: background 0.2s ease;
                }

                .laf-row:hover {
                    background: #FAFAFC;
                }
                    .preview-badge {
                    background: #F2F2F7;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #1D1D1F;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .save-modal-icon {
                    width: 50px;
                    height: 50px;
                    background: var(--soft);
                    color: var(--ink);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }

/* --- Calcolatore LAF (finestra) --- */
.lafm-back { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: flex-end; justify-content: center; background: rgba(18,19,23,.45); backdrop-filter: blur(6px); }
.lafm { width: 100%; max-width: 640px; height: 100dvh; display: flex; flex-direction: column; background: var(--paper); color: var(--ink); animation: sheet-up .35s var(--ease) both; }
@media (min-width: 640px) { .lafm-back { align-items: center; padding: 24px; } .lafm { height: 88vh; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.3); } }
.lafm-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: max(16px, env(safe-area-inset-top)) 18px 10px; }
.lafm-head h3 { font-size: 22px; font-weight: 700; line-height: 1.15; }
.lafm-head span { font-size: 13px; color: var(--muted); }
.lafm-x { width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; flex: none; }
.lafm-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 4px 18px 16px; }
.lafm-lab { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 14px 0 8px; }
.lafm-tpl { display: flex; gap: 8px; }
.lafm-tpl button { flex: 1; height: 46px; border-radius: 14px; background: #fff; border: 1px solid var(--line); font-weight: 600; font-size: 15px; }
.lafm-tpl button:active { background: var(--soft); }
.lafm-day { display: flex; gap: 2px; height: 14px; margin-top: 18px; border-radius: 99px; overflow: hidden; background: var(--soft); }
.lafm-day i { display: block; height: 100%; min-width: 0; }
.lafm-scale { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--muted); margin-top: 4px; }
.lafm-list { display: flex; flex-direction: column; gap: 10px; }
.lafm-card { padding: 12px; border-radius: 18px; background: #fff; border: 1px solid var(--line); }
.lafm-top { display: flex; align-items: center; gap: 8px; }
.lafm-dot { width: 12px; height: 12px; border-radius: 4px; flex: none; border: 1px solid rgba(18,19,23,.15); }
.lafm-name { flex: 1; min-width: 0; height: 44px; padding: 0 6px; border: 1px solid transparent; border-radius: 12px; background: transparent; font-weight: 600; font-size: 16px; }
.lafm-name:focus { border-color: var(--ink); background: var(--paper); outline: 0; }
.lafm-del { width: 44px; height: 44px; display: grid; place-items: center; color: #C2413A; border-radius: 12px; flex: none; }
.lafm-row { display: flex; gap: 10px; margin-top: 8px; align-items: flex-end; }
.lafm-pal, .lafm-step { display: flex; flex-direction: column; gap: 4px; }
.lafm-pal { flex: 1; min-width: 0; }
.lafm-pal small, .lafm-step small { font-size: 11.5px; font-weight: 500; color: var(--muted); }
.lafm-pal input { height: 46px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); text-align: center; font-weight: 600; font-size: 17px; width: 100%; }
.lafm-step > div { display: flex; align-items: center; gap: 4px; padding: 3px; border-radius: 999px; background: var(--soft); }
.lafm-step button { width: 40px; height: 40px; border-radius: 50%; background: #fff; display: grid; place-items: center; flex: none; }
.lafm-step input { width: 52px; text-align: center; border: 0; background: transparent; font-weight: 600; font-size: 17px; }
.lafm-add { display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; border-radius: 999px; border: 1.5px dashed #CFCCC3; font-weight: 600; font-size: 14.5px; }
.lafm-hint { font-size: 12.5px; color: var(--muted); margin-top: 10px; line-height: 1.4; }
.lafm-foot { padding: 10px 18px max(14px, env(safe-area-inset-bottom)); background: var(--paper); border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 10px; }
.lafm-res { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; }
.lafm-res.ok { background: #E7F2EC; }
.lafm-res.no { background: #FDECEA; }
.lafm-res small { display: block; font-size: 12px; font-weight: 600; color: var(--muted); }
.lafm-res.ok small:first-child, .lafm-res.ok > div:first-child small { color: #1F6B49; }
.lafm-res.no > div:first-child small { color: #A8362F; }
.lafm-res b { font-size: 20px; font-weight: 700; }
.lafm-res > div:last-child { text-align: right; }
.lafm-res b.big { font-size: 28px; }
.lafm-go { height: 52px; border-radius: 16px; background: var(--ink); color: #fff; font-weight: 600; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.lafm-go:disabled { background: var(--soft); color: var(--muted); }

.lafm-modes { display: flex; gap: 2px; margin: 4px 18px 0; padding: 3px; border-radius: 999px; background: var(--soft); }
.lafm-modes button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; height: 40px; border-radius: 999px; font-size: 14.5px; font-weight: 600; color: var(--muted); }
.lafm-modes button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(18,19,23,.12); }
.lafm-clock { display: flex; gap: 1px; height: 22px; margin-top: 16px; border-radius: 8px; overflow: hidden; background: var(--soft); }
.lafm-clock i { flex: 1; height: 100%; min-width: 0; }
.lafm-clock i.gap { background: repeating-linear-gradient(45deg, #E6E4DE, #E6E4DE 3px, #F6F5F2 3px, #F6F5F2 6px); }
.lafm-clock i.over { background: #C2413A; }
.lafm-scale4 span { width: 0; display: flex; justify-content: center; }
.lafm-scale4 span:first-child { justify-content: flex-start; } .lafm-scale4 span:last-child { justify-content: flex-end; }
select.lafm-name { appearance: none; -webkit-appearance: none; background: var(--paper); border: 1px solid var(--line); padding: 0 12px; }
.lafm-pal input[type="time"] { padding: 0 8px; min-width: 0; }
.lafm-dur { display: flex; flex-direction: column; gap: 4px; min-width: 64px; text-align: center; }
.lafm-dur small { font-size: 11.5px; font-weight: 500; color: var(--muted); }
.lafm-dur b { font-size: 17px; font-weight: 700; height: 46px; display: grid; place-items: center; }
.lafm-palnote { font-size: 12px; color: var(--muted); margin-top: 6px; }

.lafm-palrow { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.lafm-palrow small { font-size: 12px; font-weight: 500; color: var(--muted); flex: none; }
.lafm-palrow input { width: 84px; height: 40px; padding: 0 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); text-align: center; font-weight: 600; font-size: 16px; }
.lafm-reset { font-size: 12.5px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; color: var(--muted); margin-left: auto; }

.lafm-btns { display: flex; gap: 8px; flex: none; }
.lafi { position: fixed; inset: 0; z-index: 10001; display: flex; flex-direction: column; background: var(--paper); color: var(--ink); animation: sheet-up .3s var(--ease) both; max-width: 640px; margin: 0 auto; }
@media (min-width: 640px) { .lafi { inset: 24px auto 24px 50%; width: 640px; margin-left: -320px; height: auto; border-radius: 28px; box-shadow: 0 30px 80px rgba(0,0,0,.35); overflow: hidden; } }
.lafi-how { padding: 12px 14px; border-radius: 16px; background: #fff; border: 1px solid var(--line); font-size: 14px; line-height: 1.45; margin-top: 8px; }
.lafi-how p { color: var(--muted); margin-top: 2px; }
.lafi-how p b { color: var(--ink); }
.lafi-card { margin-top: 12px; padding: 4px 14px 6px; border-radius: 18px; background: #fff; border: 1px solid var(--line); }
.lafi-src { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 0 8px; border-bottom: 1px solid var(--line); }
.lafi-src b { display: block; font-size: 15px; }
.lafi-src small { display: block; font-size: 12.5px; color: var(--muted); }
.lafi-src a { font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; flex: none; }
.lafi-lvl { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--line); }
.lafi-lvl:last-child { border-bottom: 0; }
.lafi-v { flex: none; min-width: 78px; padding: 4px 8px; border-radius: 10px; background: var(--ink); color: #fff; font-weight: 700; font-size: 14px; text-align: center; }
.lafi-lvl b { display: block; font-size: 14.5px; font-weight: 600; }
.lafi-lvl small { display: block; font-size: 12.5px; color: var(--muted); line-height: 1.35; margin-top: 1px; }
.lafi-search { display: flex; align-items: center; gap: 8px; height: 46px; padding: 0 14px; margin-top: 8px; border-radius: 14px; background: #fff; border: 1px solid var(--line); }
.lafi-search i { color: var(--muted); }
.lafi-search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; }
.lafi-groups { display: flex; gap: 6px; overflow-x: auto; margin: 10px -18px 0; padding: 0 18px; }
.lafi-groups button { flex: none; height: 38px; padding: 0 14px; border-radius: 999px; background: #fff; border: 1px solid var(--line); font-size: 14px; font-weight: 600; }
.lafi-groups button.on { background: var(--ink); color: #fff; border-color: var(--ink); }
.lafi-cols, .lafi-row { display: grid; grid-template-columns: minmax(0, 1fr) 46px 46px 44px; gap: 6px; align-items: center; }
.lafi-cols { font-size: 11.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); margin: 14px 14px 0; }
.lafi-cols span:nth-child(2), .lafi-cols span:nth-child(3) { text-align: center; }
.lafi-gh { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding: 12px 0 4px; }
.lafi-row { padding: 6px 0; border-bottom: 1px solid var(--line); min-height: 48px; }
.lafi-row:last-child { border-bottom: 0; }
.lafi-n { font-size: 14.5px; line-height: 1.25; }
.lafi-row b { text-align: center; font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.lafi-row button { width: 40px; height: 40px; border-radius: 50%; background: var(--soft); display: grid; place-items: center; justify-self: end; }
.lafi-row button:disabled { background: transparent; color: var(--ok); }

.lafi-sexnote { font-size: 13px; color: var(--muted); margin-top: 10px; line-height: 1.4; }
.lafi-sexnote b { color: var(--ink); }
.lafi-cols .me { color: var(--ink); }
.lafi-row b.me { background: var(--soft); border-radius: 8px; padding: 4px 0; }
.lafi-only { display: block; font-size: 11.5px; font-weight: 500; color: var(--muted); margin-top: 1px; }
.lafm-warn { display: flex; gap: 6px; align-items: flex-start; font-size: 12.5px; color: var(--muted); background: var(--soft); border-radius: 10px; padding: 6px 10px; margin-top: 8px; line-height: 1.3; }
.lafm-warn i { margin-top: 1px; flex: none; }
`;
