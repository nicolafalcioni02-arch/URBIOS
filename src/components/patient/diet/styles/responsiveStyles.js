// Adattamento a tablet e telefono. Va per ULTIMO nell'elenco di dietStyles.js (sovrascrive le regole sopra).
// Soglie: 1100px = tablet/finestra stretta, 900px = indice a cassetto, 560px = telefono.
export const responsiveStyles = `
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
`;
