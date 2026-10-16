// Adattamento a tablet e telefono. Va per ULTIMO nell'elenco di dietStyles.js (sovrascrive le regole sopra).
// Soglie: 1100px = tablet/finestra stretta, 900px = indice a cassetto, 560px = telefono.
export const responsiveStyles = `
                /* campi di inserimento: stessa scala del Training (12/15px) */
                .t-input-floating label { font-size: 12px; font-weight: 500; margin: 0 0 6px 2px; color: #6E6D69; }
                .t-input-floating input, .t-input-floating select { padding: 11px 13px; border-radius: 12px; font-size: 15px; font-weight: 500; background: #fff; border: 1px solid #E6E4DE; }
                .d-root { display: flex; height: 88vh; width: 100%; overflow: hidden; background-color: var(--paper); color: #1D1D1F; margin: -16px; text-align: left;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif; }
                .d-mobile-bar, .d-nav-backdrop { display: none; }
                .t-main-content { min-width: 0; }
                .reports-grid { grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); }
                .d-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

                @media (max-width: 1100px) {
                    .t-main-content { padding: 28px 24px; }
                    .t-client-header-card { grid-template-columns: 1fr 1fr; }
                    .setup-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 900px) {
                    .d-root { flex-direction: column; height: auto; min-height: 0; overflow: visible; margin: 0; }
                    .d-mobile-bar { display: flex; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 40; padding: 10px 14px;
                        background: rgba(255,255,255,0.92); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(0,0,0,0.06); }
                    .d-mobile-bar button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: #fff; border-radius: 12px;
                        padding: 9px 14px; font-weight: 700; font-size: 13px; color: #1D1D1F; cursor: pointer; }
                    .t-sidebar { position: fixed; top: 0; left: 0; bottom: 0; height: 100dvh; width: min(86vw, 320px); z-index: 10001;
                        transform: translateX(-105%); transition: transform .3s cubic-bezier(.16,1,.3,1); background: rgba(255,255,255,0.98);
                        box-shadow: 8px 0 40px rgba(0,0,0,0.18); padding-top: max(20px, env(safe-area-inset-top)); padding-bottom: 56px !important; }
                    .t-sidebar.open { transform: translateX(0); }
                    .d-nav-backdrop.open { display: block; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.35); }
                    .hover-actions { opacity: 1; transform: none; }
                    .premium-item:hover { transform: none; }
                    .t-main-content { overflow: visible; padding: 20px 14px 110px; }
                    .t-container-wrapper { padding-bottom: 60px; }
                    .fab-container { right: 16px; bottom: max(16px, env(safe-area-inset-bottom)); gap: 10px; }
                    .fab-container .t-fab-print { width: 52px; height: 52px; }
                    .modal-backdrop { padding: 0 !important; height: 100dvh; }
                    .modal-window { height: 100dvh !important; max-width: none !important; width: 100% !important; border-radius: 0 !important; }
                    .sc-body { grid-template-columns: 1fr; overflow-y: auto; }
                    .sc-panel { border-right: none; border-bottom: 1px solid #F0F0F2; overflow: visible; }
                    .day-title-input { width: 100%; }
                    .day-summary-header { flex-wrap: wrap; gap: 10px; }
                }
                @media (max-width: 560px) {
                    .t-client-header-card { grid-template-columns: 1fr; padding: 18px; }
                    .day-summary-card { padding: 16px; border-radius: 16px; }
                    .t-exercise-item { padding: 14px; }
                    .reports-grid { gap: 16px; }
                    .dashboard-grid { grid-template-columns: 1fr; }
                }

                /* ===== VISTA COMPATTA DELLA DIETA (telefono e tablet) ===== */
                .d-c-root { min-height: 80vh; background: var(--paper); color: var(--ink); }
                .d-c-days { position: sticky; top: 0; z-index: 30; display: flex; gap: 8px; overflow-x: auto; padding: 12px 14px; background: color-mix(in srgb, var(--paper) 90%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
                .d-c-chip { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 14px; font-weight: 600; color: var(--muted); max-width: 12rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background-color .3s var(--ease), color .3s, transform .2s var(--ease); }
                .d-c-chip.on { background: var(--ink); border-color: var(--ink); color: #fff; }
                .d-c-chip.add { width: 40px; padding: 0; }
                .d-c-chip:active { transform: scale(.94); }
                .d-c-body { padding: 14px 14px 120px; }
                .d-c-sum { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 16px; margin-bottom: 12px; }
                .d-c-day-title { width: 100%; border: none; background: transparent; outline: none; font-size: 17px; font-weight: 600; color: var(--ink); padding: 0 0 4px; }
                .d-c-day-title::placeholder { color: #B5B3AE; font-weight: 400; }
                .d-c-kcal { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 14px; }
                .d-c-kcal-n { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
                .d-c-kcal-of { font-size: 14px; color: var(--muted); }
                .d-c-bars { display: flex; gap: 12px; }
                .d-c-meals { display: flex; flex-direction: column; gap: 10px; }
                .d-c-meal { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 76px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; text-align: left; transition: background-color .2s, transform .2s var(--ease); }
                .d-c-meal:active { background: var(--soft); transform: scale(.985); }
                .d-c-meal-num { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--soft); font-weight: 700; font-size: 14px; }
                .d-c-meal-title { display: block; font-size: 16px; font-weight: 600; line-height: 1.25; }
                .d-c-meal-meta { display: block; font-size: 13px; color: var(--muted); margin-top: 2px; }
                .d-c-meal-names { display: block; font-size: 13px; color: #9A9892; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .d-c-meal-kcal { flex: none; text-align: right; line-height: 1.1; }
                .d-c-meal-kcal b { display: block; font-size: 20px; font-weight: 700; color: var(--ok); }
                .d-c-meal-kcal small { font-size: 12px; color: var(--muted); }
                .d-c-day-tools { display: flex; gap: 8px; margin-top: 8px; }
                .d-c-day-tools button { display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 14px; border-radius: 12px; font-size: 13px; font-weight: 600; color: var(--muted); }
                .d-c-day-tools button:active { background: var(--soft); }
                .d-c-day-tools .del { color: var(--bad); }
                .d-c-fold { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 54px; padding: 0 16px; margin-top: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; font-size: 15px; font-weight: 600; }
                .d-c-fold i { color: var(--muted); transition: transform .35s var(--ease); }
                .d-c-fold i.open { transform: rotate(180deg); }
                .d-c-charts { margin-top: 10px; }
                .d-c-lock { margin: 24px 4px; padding: 28px 22px; background: var(--surface); border: 1px solid var(--line); border-radius: 22px; text-align: center; }
                .d-c-lock h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; letter-spacing: -.02em; }
                .d-c-lock p { font-size: 14px; line-height: 1.5; color: var(--muted); margin-bottom: 20px; }
                .d-c-primary { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 52px; border-radius: 999px; background: var(--ink); color: #fff; font-size: 15px; font-weight: 600; box-shadow: 0 10px 24px rgba(18, 19, 23, .2); }
                .d-c-primary:active { transform: scale(.97); }
                .d-c-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000; display: grid; grid-template-columns: repeat(5, 1fr); padding: 6px 6px max(8px, env(safe-area-inset-bottom)); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid var(--line); }
                .d-c-bar button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 54px; border-radius: 14px; font-size: 11px; font-weight: 600; color: var(--muted); transition: background-color .2s, color .2s, transform .2s var(--ease), opacity .2s; }
                .d-c-bar button i { font-size: 22px; color: var(--ink); }
                .d-c-bar button:active:not(:disabled) { background: var(--soft); transform: scale(.94); }
                .d-c-bar button:disabled { opacity: .35; }
                .d-c-mode { font-size: 13px; color: var(--muted); margin: 2px 4px 14px; }
                body:has(.d-c-bar) .archive-chip { display: none; }

                /* ===== EDITOR DEL PASTO: a una mano su schermo piccolo ===== */
                @media (max-width: 900px) {
                    .dm-head { position: relative; flex-wrap: wrap; gap: 10px !important; padding: 14px 16px !important; align-items: flex-start !important; }
                    .dm-head input { font-size: 22px !important; max-width: 62vw; }
                    .dm-totals { width: 100%; justify-content: space-between; gap: 8px !important; }
                    .dm-x { margin-left: 0 !important; width: 40px !important; height: 40px !important; position: absolute; top: 12px; right: 12px; }
                    .dm-bars { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px 16px !important; padding: 10px 16px !important; }
                    .dm-body { padding: 12px !important; }
                    .dm-foot { padding: 10px 12px max(12px, env(safe-area-inset-bottom)) !important; gap: 10px; }
                    .dm-foot > div { gap: 10px !important; }
                    .dm-done { flex: 1; height: 52px; padding: 0 16px !important; font-size: 15px !important; border-radius: 14px !important; }
                    .dm-add { padding: 16px !important; margin-top: 4px !important; }
                    /* alimento: nome su tutta la riga, poi grammi, macro e azioni */
                    .dm-item { display: grid !important; grid-template-columns: 30px 1fr 42px 42px; gap: 8px 10px !important; align-items: center; padding: 12px !important; }
                    .dm-item .dm-name { grid-column: 2; grid-row: 1; flex: none !important; position: static !important; min-width: 0; }
                    .dm-sub .dm-sname { position: static !important; flex: 1 1 130px !important; min-width: 0; }
                    .dm-item .t-suggestions-list, .dm-sub .t-suggestions-list { left: 0; right: 0; width: auto !important; }
                    .dm-item .dm-badge { grid-column: 1; grid-row: 1; }
                    .dm-item .dm-btn { width: 42px !important; height: 42px !important; margin: 0 !important; }
                    .dm-item .dm-btn:nth-of-type(1) { grid-column: 3; grid-row: 1; }
                    .dm-item .dm-btn:nth-of-type(2) { grid-column: 4; grid-row: 1; }
                    .dm-item .dm-weight { grid-column: 2; grid-row: 2; width: auto !important; max-width: 150px; }
                    .dm-item .dm-weight input { font-size: 18px !important; padding: 12px 0 !important; }
                    .dm-item .dm-macros { grid-column: 3 / 5; grid-row: 2; width: auto !important; }
                    /* sostituzioni */
                    .dm-sub { flex-wrap: wrap !important; margin-left: 12px !important; padding: 12px !important; gap: 8px !important; }
                    .dm-sub .dm-modes { order: 5; flex: 1 1 100%; overflow-x: auto; }
                    .dm-sub .dm-sweight { order: 6; width: 110px !important; }
                    .dm-sub .dm-smacros { order: 7; flex: 1; width: auto !important; }
                    .dm-sub .dm-sbtn { width: 40px !important; height: 40px !important; }
                    .dm-sub .t-ex-input { font-size: 16px !important; }
                    .t-suggestions-list { max-height: 40vh; }
                }

                /* ===== SMART REPORT MAKER su schermo piccolo ===== */
                @media (max-width: 900px) {
                    .sc-modal-overlay { padding: 0 !important; }
                    .sc-modal { height: 100dvh !important; max-width: none !important; border-radius: 0 !important; }
                    .sc-header { padding: 14px 16px !important; }
                    .sc-body { display: block !important; overflow-y: auto !important; }
                    .sc-panel { padding: 16px !important; gap: 18px !important; }
                    .sc-chart-area { padding: 16px !important; overflow: visible !important; }
                    .sc-chart-container { min-height: 340px; }
                    .sc-type-btn, .sc-scope-btn { min-height: 44px; font-size: 13px !important; }
                    .sc-select { min-height: 46px; }
                    .sc-section-label { font-size: 12px !important; }
                    .sc-footer { padding: 10px 14px max(12px, env(safe-area-inset-bottom)) !important; gap: 10px; }
                    .sc-footer > div { flex: 1; }
                    .sc-footer > div > span { display: none; }
                    .sc-btn-save { flex: 1; justify-content: center; height: 48px; font-size: 14px !important; border-radius: 14px !important; }
                    .sc-btn-reset { height: 48px; padding: 0 16px !important; font-size: 13px !important; border-radius: 14px !important; }
                    .sc-close-btn { width: 40px !important; height: 40px !important; }
                }

                /* ===== SETUP OBIETTIVI su schermo piccolo ===== */
                @media (max-width: 900px) {
                    .ns-head { padding: 14px 16px !important; }
                    .ns-head h3 { font-size: 19px !important; }
                    .ns-nav { padding: 12px 12px 0 !important; }
                    .setup-tab-btn { padding: 10px 6px !important; font-size: 12px !important; line-height: 1.2; }
                    .ns-body { padding: 14px 12px 24px !important; }
                    .ns-foot { padding: 10px 14px max(12px, env(safe-area-inset-bottom)) !important; }
                    .ns-apply { flex: 1; height: 52px; padding: 0 16px !important; font-size: 15px !important; font-weight: 700 !important; border-radius: 14px !important; }
                    .ns-2col { grid-template-columns: 1fr !important; }
                    .smart-card { padding: 16px !important; }
                    .segmented-control { flex-wrap: wrap; }
                    .segmented-btn { min-height: 44px; }
                    /* matrice dei pasti: ogni riga diventa una scheda */
                    .matrix-table, .matrix-table tbody { display: block; width: 100%; }
                    .matrix-table thead { display: none; }
                    .matrix-table tr.laf-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px 4px; padding: 12px; margin-bottom: 8px; background: #fff; border: 1px solid var(--line); border-radius: 16px; }
                    .matrix-table td { display: block; padding: 0 !important; border: none !important; text-align: center; font-size: 15px; }
                    .matrix-table td:first-child { grid-column: 1 / 5; text-align: left; }
                    .matrix-table td:first-child input { font-size: 16px !important; font-weight: 700; width: 100%; padding: 6px 4px !important; }
                    .matrix-table td.mx-act { grid-column: 5; grid-row: 1; }
                    .matrix-table td[data-label]::before { content: attr(data-label); display: block; font-size: 11px; font-weight: 500; color: var(--muted); margin-bottom: 2px; }
                    .matrix-table td[data-label] .matrix-input { width: 100%; max-width: 64px; }
                    .matrix-table td[data-label] > span { display: none; }
                    .matrix-table .mx-act button { min-width: 38px; min-height: 38px; font-size: 16px !important; }
                    .analysis-nav { padding-bottom: 6px; }
                }

                /* ===== DATABASE ALIMENTI: righe come schede ===== */
                @media (max-width: 760px) {
                    .fd-table, .fd-table tbody { display: block; width: 100%; }
                    .fd-table thead { display: none; }
                    .fd-table tr.fd-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 2px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
                    .fd-table td { display: block; padding: 0 !important; border: none; text-align: center; }
                    .fd-table td:first-child { grid-column: 1 / 4; text-align: left; }
                    .fd-table td.fd-cat { grid-column: 1 / 4; text-align: left; font-size: 12px !important; font-weight: 500 !important; color: var(--muted); grid-row: 2; }
                    .fd-table td.fd-act > div { opacity: 1 !important; }
                    .fd-table td.fd-act { grid-column: 4; grid-row: 1 / 3; align-self: center; }
                    .fd-table td[data-label] { grid-row: 3; font-size: 16px !important; }
                    .fd-table td[data-label]::before { content: attr(data-label); display: block; font-size: 11px; font-weight: 500; color: var(--muted); margin-bottom: 1px; }
                }

                /* finestre brevi (cambio visita): pannello dal basso invece di schermo intero */
                @media (max-width: 900px) {
                    .modal-backdrop:has(.cv-win) { align-items: flex-end; }
                    .modal-window.cv-win { height: auto !important; max-height: 88dvh; border-radius: 24px 24px 0 0 !important; padding: 22px 18px max(22px, env(safe-area-inset-bottom)) !important; }
                }
`;
