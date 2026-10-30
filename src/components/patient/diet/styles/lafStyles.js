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
`;
