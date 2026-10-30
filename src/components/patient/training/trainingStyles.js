// CSS del modulo Training (iniettato via <style>, volutamente non globale)
export const trainingCss = `
                /* --- SIDEBAR FISSA E LUSSUOSA --- */
                .t-sidebar { 
                    width: 280px; 
                    background: rgba(255, 255, 255, 0.85); 
                    backdrop-filter: blur(20px); 
                    border-right: 2px solid rgba(0,0,0,0.05); 
                    display: flex; 
                    flex-direction: column; 
                    padding: 20px 15px; 
                    flex-shrink: 0; 
                    z-index: 50; 
                    position: sticky; 
                    top: 0; 
                    height: 85vh; /* Sidebar a tutta altezza */
                    box-shadow: 4px 0 24px rgba(0,0,0,0.02);
                }
                .t-logo-area { font-size: 20px; font-weight: 800; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; color: #1D1D1F; }
                
                .t-nav-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; scrollbar-width: none; padding-right: 5px; }
                .t-nav-list::-webkit-scrollbar { display: none; }
                
                /* FOOTER FISSO SOPRA LA LISTA (Effetto Vetro) */
                .t-sidebar-footer { 
                    margin-top: auto; 
                    position: sticky; 
                    bottom: 0; 
                    background: rgba(255, 255, 255, 0.95); /* Leggera trasparenza */
                    backdrop-filter: blur(12px); /* Effetto vetro iOS */
                    padding: 30px 0; /* Più compatto */
                    border-top: 1px solid rgba(0,0,0,0.05); 
                    border-left: 15px solid rgba(255, 255, 255, 0.95); /* Leggera trasparenza */; 
                    z-index: 100; /* Layer superiore */
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                /* BOTTONI SIDEBAR (Con Animazioni) */
                .t-btn-sidebar-action { 
                    width: 100%; padding: 12px; border-radius: 12px; border: none; font-weight: 600; font-size: 13px; 
                    cursor: pointer; display: flex; align-items: center; gap: 8px; justify-content: center;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                }
                
                /* DRAG OVER FEEDBACK */
                .drag-over-active {
                    background: var(--soft) !important;
                    border: 1px dashed var(--ink) !important;
                    transform: scale(1.02);
                }
                /* SHORTCUT A COMPARSA SULLA DESTRA */
                .hover-actions {
                    display: flex;
                    gap: 8px;
                    opacity: 0;
                    transform: translateX(10px); /* Arriva da destra invece che da sinistra */
                    transition: all 0.2s ease;
                    margin-left: auto; /* Spinge le icone tutto a destra */
                }
                .premium-item:hover .hover-actions {
                    opacity: 1;
                    transform: translateX(0);
                }
                .mini-action {
                    color: #86868B;
                    transition: 0.2s;
                    cursor: pointer;
                    font-size: 14px;
                }
                .mini-action:hover { color: var(--ink); transform: scale(1.1); }
                .mini-action.del:hover { color: #FF3B30; }
                    
                .t-btn-new { background: #1D1D1F; color: white; }
                .t-btn-new:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(29, 29, 31, 0.2); }
                .t-btn-settings { background: transparent; color: #86868B; border: 1px dashed var(--line); }
                .t-btn-settings:hover { background: var(--paper); color: #1D1D1F; transform: translateY(-2px); }
                .t-btn-archive { background: linear-gradient(135deg, var(--soft) 0%, var(--soft) 100%); color: var(--ink); }
                .t-btn-archive:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(18, 19, 23, 0.10); }

                /* --- INDICE ANIMATO (Premium Item) --- */
                .premium-item {
                    padding: 10px 15px; border-radius: 12px; cursor: grab; margin-bottom: 5px; 
                    font-weight: 600; font-size: 14px; color: #86868B; display: flex; justify-content: space-between;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center left;
                    border: 1px solid transparent;
                }
                .premium-item:active { cursor: grabbing; transform: scale(0.96); opacity: 0.8; }
                .premium-item:hover { 
                    background: linear-gradient(145deg, #ffffff, #f8f9fa); 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.04); 
                    transform: translateX(4px) rotateX(2deg); /* Effetto 3D al passaggio del mouse */
                    border-color: var(--soft);
                    color: var(--ink); 
                }
                
                .premium-subitem {
                    margin-left: 15px; border-left: 2px solid var(--line); padding-left: 10px;
                    transition: border-color 0.3s ease;
                }
                .premium-subitem:hover { border-color: var(--ink); }

                /* --- MAIN CONTENT E SCHEDE --- */
                .t-main-content { flex: 1; overflow-y: auto; padding: 40px; scroll-behavior: smooth; }
                .t-main { flex: 1; min-width: 0; position: relative; overflow-y: auto; padding: 40px; background: var(--paper); }
                .t-root { display: flex; height: 100%; min-height: 80vh; margin: -16px; text-align: left; background-color: var(--paper); color: #1D1D1F;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif; }
                .t-mobile-bar, .t-nav-backdrop { display: none; }
                .t-table-scroll { scrollbar-width: none; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -4px; padding: 0 4px; }
                .t-table-scroll::-webkit-scrollbar { display: none; }
                .t-table-scroll .t-sets-table { min-width: 520px; }
                .t-container-wrapper { max-width: 950px; margin: 0 auto; padding-bottom: 100px; }

                .t-client-header-card { 
                    background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 25px; border-radius: 20px; 
                    box-shadow: 0 8px 32px rgba(0,0,0,0.04); margin-bottom: 40px; display: grid; grid-template-columns: 1.3fr 1.3fr 1.5fr 150px; 
                    gap: 20px; border: 1px solid rgba(255,255,255,0.8); 
                }
                .t-input-floating label { font-size: 12px; color: #6E6D69; font-weight: 500; display: block; margin: 0 0 6px 2px; }
                .t-input-floating select { width: 100%; padding: 11px 13px; border-radius: 12px; border: 1px solid #E6E4DE; font-size: 15px; font-weight: 500; outline: none; background: #fff; }
                .t-input-floating input { width: 100%; padding: 11px 13px; border-radius: 12px; border: 1px solid #E6E4DE; font-size: 15px; font-weight: 500; outline: none; transition: all 0.3s ease; background: #fff; }
                .t-input-floating input:focus { border-color: var(--ink); background: #FFFFFF; box-shadow: 0 0 0 4px rgba(18,19,23,0.08); }

                /* --- CARDS E ANIMAZIONI --- */
                .t-week-wrapper { margin-bottom: 60px; scroll-margin-top: 20px; position: relative; }
                .t-week-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .t-week-title-input { font-size: 28px; font-weight: 800; border: none; background: transparent; width: 400px; max-width: 100%; outline: none; color: #1D1D1F; transition: color 0.3s; }
                .t-week-title-input:focus { color: var(--ink); }

                .t-day-card { 
                    background: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); padding: 25px; 
                    margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.8); position: relative; transition: all 0.4s ease; 
                }
                .t-day-card:hover { box-shadow: 0 15px 40px rgba(0,0,0,0.06); transform: translateY(-2px); }
                .t-day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .t-day-input { font-size: 20px; font-weight: 800; border: none; width: 100%; color: var(--ink); background: transparent; outline: none; }

                .t-icon-btn { 
                    width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--line); background: white; 
                    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #86868B; 
                    margin-left: 8px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); outline: none; 
                }
                .t-icon-btn:hover { border-color: var(--ink); color: var(--ink); transform: scale(1.1) rotate(5deg); }
                .t-icon-btn.danger:hover { border-color: #FF3B30; color: #FF3B30; transform: scale(1.1) rotate(-5deg); }

                /* --- ESERCIZI --- */
                .t-exercise-item { 
                    background: #FBFAF8; border-radius: 16px; padding: 18px; margin-bottom: 12px; position: relative; 
                    border: 1px solid transparent; transition: all 0.3s ease; 
                }
                .t-exercise-item:focus-within { background: #FFFFFF; border-color: var(--soft); box-shadow: 0 8px 24px rgba(18,19,23,0.06); transform: scale(1.01); z-index: 2; }
                .t-ex-header-row { display: flex; gap: 12px; margin-bottom: 10px; position: relative; }
                .t-ex-input { border: none; padding: 9px 10px; border-radius: 10px; font-size: 16px; font-weight: 700; width: 100%; background: transparent; outline: none; transition: background 0.3s; }
                .t-ex-input:focus { background: rgba(0,0,0,0.03); }

                /* Autocompletamento Premium */
                .t-suggestions-list { 
                    position: absolute; top: 100%; left: 0; width: 80%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); 
                    border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); z-index: 100; max-height: 250px; overflow-y: auto; 
                }
                .t-suggestion-item { padding: 12px 18px; font-size: 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; transition: background 0.2s; }
                .t-suggestion-item:hover { background: var(--soft); color: var(--ink); padding-left: 22px; }
                .t-suggestion-tag { font-size: 10px; color: #999; font-weight: 800; margin-top: 4px; }

                /* --- TABELLE --- */
                .t-sets-table { width: 100%; border-collapse: collapse; font-size: 15px; margin-top: 4px; }
                .t-sets-table th { text-align: center; color: #6E6D69; font-size: 12px; font-weight: 600; padding: 8px 5px; border-bottom: 1px solid transparent; white-space: nowrap; }
                .t-sets-table td { padding: 4px 3px; vertical-align: middle; }
                .t-sets-table input { width: 100%; min-width: 0; padding: 9px 8px; border: 1px solid transparent; border-radius: 10px; font-size: 15px; background: transparent; font-family: inherit; outline: none; transition: all 0.2s; font-weight: 600; text-align: center; color: var(--ink); }
                .t-sets-table input::placeholder { color: #B5B3AE; font-weight: 400; }
                .t-sets-table input:focus { background: #FFFFFF; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(18,19,23,0.08); }
                .t-sets-table input:hover:not(:focus) { background: rgba(0,0,0,0.03); }

                .t-set-badge { background: #E6E4DE; color: #6E6D69; font-weight: 700; font-size: 13px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin: 0 auto; }

                /* --- BOTTONE STAMPA (Galleggiante e Lussuoso) --- */
                .t-fab-print { 
                    position: fixed; bottom: 40px; right: 40px; background: linear-gradient(135deg, #1D1D1F 0%, #434345 100%); 
                    color: white; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3); cursor: pointer; z-index: 100; border: none; outline: none; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                }
                .t-fab-print:hover { transform: scale(1.1) rotate(15deg); box-shadow: 0 20px 40px rgba(0,0,0,0.4); background: linear-gradient(135deg, var(--ink) 0%, #2A2B31 100%); }

                /* --- MODALE --- */
                .t-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .t-modal-card { background: white; width: 800px; height: 80vh; padding: 40px; border-radius: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; transform: scale(0.95); animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @keyframes modalIn { to { transform: scale(1); opacity: 1; } }

                /* ==================== THE MAGIC PRINT ==================== */
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 10pt; height: auto; overflow: visible; display: block; }
                    .t-sidebar, .t-fab-print, .t-icon-btn, .t-add-set-btn, .t-btn-sidebar-action, .t-suggestions-list, .t-modal-overlay, .t-btn-del-row { display: none !important; }
                    .t-main-content { padding: 0; margin: 0; width: 100%; overflow: visible; }
                    .t-container-wrapper { max-width: 100%; margin: 0; padding: 0; }
                    .t-client-header-card { padding: 15px; margin-bottom: 20px; box-shadow: none; border: 1px solid var(--line); background: white; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-radius: 12px; }
                    .t-client-header-card input { border: none; padding: 0; font-weight: bold; font-size: 11pt; color: black; background: transparent; }
                    .t-input-floating label { margin-bottom: 0; }
                    .t-week-wrapper { page-break-after: always; break-after: page; margin-bottom: 0; padding-top: 10px; border: none; }
                    .t-week-wrapper:last-child { page-break-after: auto; }
                    .t-week-title-input { font-size: 18pt; color: black; margin-bottom: 5px; padding: 0; width: 100%; }
                    .t-week-header-bar { border: none; padding: 0; margin-bottom: 10px; display: block; }
                    .t-day-card { background-color: #F0F0F2 !important; border-radius: 18px !important; border: none !important; padding: 15px !important; margin-bottom: 15px !important; page-break-inside: avoid; box-shadow: none !important; transform: none !important; }
                    .t-day-body { display: block !important; }
                    .t-day-input { color: black; font-size: 14pt; margin-bottom: 5px; font-weight: 800; padding: 0; }
                    .t-day-header { margin-bottom: 10px; }
                    .t-exercise-item { background-color: #FFFFFF !important; border: 1px solid var(--line) !important; border-radius: 8px !important; padding: 8px 12px !important; margin-bottom: 8px !important; box-shadow: none !important; transform: none !important; }
                    .t-ex-input { background: transparent; box-shadow: none; padding: 0; font-size: 12pt; color: black; font-weight: 700; }
                    .t-sets-table { margin-top: 2px; }
                    .t-sets-table th { color: #888; padding-bottom: 2px; border-bottom: 1px solid var(--line); }
                    .t-sets-table td { border-bottom: 1px solid var(--paper); padding: 2px 4px; }
                    .t-sets-table tr:last-child td { border-bottom: none; }
                    .t-sets-table input { border: none !important; background: transparent !important; color: #000; font-weight: 500; padding: 0; }
                    .t-set-badge { background: #000 !important; color: #fff !important; width: 18px; height: 18px; font-size: 9px; box-shadow: none; }
                    .t-print-kg-cell { display: table-cell !important; width: 60px; text-align: center; }
                    .t-print-kg-box { border: 1.5px solid #C7C7CC; height: 22px; width: 100%; border-radius: 6px; background: white; }
                }

                /* OVERLAY CHE COPRE TUTTO E SFOCA */
                    .modal-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        height: 100dvh;
                        background: rgba(0, 0, 0, 0.3); /* Scurisce lo sfondo */
                        backdrop-filter: blur(10px);    /* Sfoca tutto quello che sta sotto */
                        z-index: 9999;                  /* Sopra ogni cosa */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                        animation: fadeIn 0.3s ease;
                    }

                    /* LA FINESTRA CHE APPARE (POP-UP) */
                    .modal-window {
                        background: #FFFFFF;
                        width: 100%;
                        max-width: 1200px;
                        height: 90vh;
                        border-radius: 32px;
                        box-shadow: 0 30px 90px rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.3);
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        transform-origin: center;
                        animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { 
                        from { opacity: 0; transform: scale(0.9) translateY(20px); } 
                        to { opacity: 1; transform: scale(1) translateY(0); } 
                    }


                .t-cellsheet { max-width: 520px; padding: 14px 14px calc(16px + env(safe-area-inset-bottom)); max-height: 88dvh; }
                .t-cell-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 2px 4px 12px; }
                .t-cell-head p { font-size: 17px; font-weight: 700; line-height: 1.2; }
                .t-cell-head span { font-size: 13px; color: var(--muted); }
                .t-cellsheet .t-exercise-item { margin-bottom: 12px !important; }
                .t-cell-weeks { display: flex; gap: 6px; overflow-x: auto; padding: 0 4px 10px; }
                .t-cell-weeks .dg-chip.row { min-height: 40px; padding: 0 14px; }
                .t-cell-body { padding: 0 !important; max-height: 52dvh; overflow-y: auto; }
                .t-cell-actions { display: flex; gap: 8px; margin: 12px 0 14px; }
                .t-cell-empty { padding: 18px 4px 22px; color: var(--muted); font-size: 14.5px; }
                .t-cell-empty .dg-sm { margin-top: 12px; }
                .t-grid-sig { display: inline-block; margin-right: 6px; padding: 1px 6px; border-radius: 6px; background: #E8730C; color: #fff; font-size: 11.5px; }
                .t-chip-add { border-style: dashed; color: var(--muted); }
                .t-grid-actions { display: flex; gap: 8px; margin-top: 14px; }
                .t-grid-actions .dg-sm { flex: 1; justify-content: center; height: 46px; border-radius: 14px; background: #fff; border-color: var(--line); }
                .t-grid-actions .dg-sm.t-on { background: var(--ink); color: #fff; border-color: var(--ink); }
                .t-grid-tools2 { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 0; }
                .t-grid-tools2 .dg-sm { flex: 1 1 calc(50% - 6px); justify-content: center; height: 42px; }
                .t-grid tbody th.pickable { cursor: pointer; }
                .t-grid-check { display: inline-grid; place-items: center; width: 20px; height: 20px; margin-right: 8px; vertical-align: -4px; border-radius: 50%; border: 1.5px solid #B5B3AE; background: #fff; color: #fff; font-size: 11px; font-style: normal; }
                .t-grid-check.on { background: var(--ink); border-color: var(--ink); }
                .t-grid-bar { position: sticky; bottom: 84px; z-index: 6; display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px; border-radius: 18px; background: #fff; border: 1px solid var(--line); box-shadow: 0 10px 28px rgba(18,19,23,.16); }
                .t-grid-bar p { flex: 1; font-size: 13.5px; color: var(--muted); padding: 0 8px; }
                .t-grid-bar-go { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; border-radius: 14px; background: var(--ink); color: #fff; font-size: 15px; font-weight: 600; }
                .t-grid-bar-sep { height: 48px; padding: 0 16px; border-radius: 14px; background: var(--soft); font-size: 14px; font-weight: 600; }
                .t-grid-add { display: inline-flex; align-items: center; gap: 4px; height: 34px; min-height: 0; padding: 0 12px; border-radius: 999px; border: 1.5px dashed #CFCCC3; font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; }
                .t-grid-new { display: flex; gap: 8px; align-items: center; margin-top: 14px; }
                .t-grid-new .fld { flex: 1; min-width: 0; }
                .t-grid-new .dg-sm { height: 46px; flex: none; }
                .t-cell-done { width: 100%; height: 52px; border-radius: 16px; }
                /* ---- vista a griglia: settimane in colonne ---- */
                .t-mode { display: inline-flex; gap: 2px; padding: 3px; border-radius: 999px; background: var(--soft); margin: 0 0 12px; }
                .t-mode button { display: inline-flex; align-items: center; gap: 6px; height: 36px; min-height: 0; padding: 0 16px; border-radius: 999px; font-size: 14px; font-weight: 600; color: var(--muted); }
                .t-mode button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(18,19,23,.12); }
                .t-grid-wrap { margin: 12px -16px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0 0 6px; }
                .t-grid { border-collapse: separate; border-spacing: 0; min-width: 100%; font-size: 14px; }
                .t-grid th, .t-grid td { padding: 0; border-bottom: 1px solid var(--line); vertical-align: middle; }
                .t-grid thead th { font-size: 12.5px; font-weight: 600; color: var(--muted); text-align: center; padding: 8px 10px; white-space: nowrap; }
                .t-grid thead th em { display: block; font-style: normal; font-size: 11px; color: var(--warn); }
                .t-grid tbody th { position: sticky; left: 0; z-index: 2; background: var(--paper); text-align: left; font-weight: 600; padding: 10px 10px 10px 16px; min-width: 112px; max-width: 126px; box-shadow: 6px 0 8px -6px rgba(18,19,23,.14); font-size: 13.5px; line-height: 1.25; }
                .t-grid thead th:first-child { position: sticky; left: 0; z-index: 3; background: var(--paper); text-align: left; padding-left: 16px; box-shadow: 6px 0 8px -6px rgba(18,19,23,.14); }
                .t-grid tr > :last-child { padding-right: 16px; }
                .t-grid thead th button.t-grid-wk { display: flex; flex-direction: column; align-items: center; gap: 1px; width: 100%; min-height: 44px; padding: 4px 6px; border-radius: 10px; font-size: 12.5px; font-weight: 600; color: var(--muted); white-space: nowrap; }
                .t-grid thead th button.t-grid-wk:active { background: var(--soft); }
                .t-grid thead th button.t-grid-wk i { font-size: 12px; opacity: .7; }
                /* superserie: le schede collegate sono una catena (accento), con un nodo sul punto di unione */
                .t-ss-link { display: flex; width: max-content; max-width: 100%; align-items: center; justify-content: center; gap: 6px; margin: -6px auto 10px; min-height: 38px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--muted); border: 1.5px dashed #CFCCC3; background: transparent; }
                .t-ss-link:active { transform: scale(.96); }
                /* superserie: un box arancione attorno al blocco, stessa sporgenza (12px) su tutti i lati; dentro, le schede restano normali */
                .t-ss-box { --ss: #E8730C; padding: 12px; margin: 0 0 16px; border-radius: 26px; background: var(--ss); border: 0; }
                .t-ss-box .t-exercise-item, .t-root .t-ss-box .t-exercise-item { margin-bottom: 0 !important; }
                .t-ss-box .t-ss-link { margin: 10px auto; color: #fff; background: var(--ink); border: 0; animation: ssPop .4s var(--ease) both; }
                .t-ss-box .t-ss-link i { font-size: 17px; }
                @keyframes ssPop { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .t-hint { font-size: 12.5px; color: var(--muted); margin: 8px 2px 0; line-height: 1.35; }
                .t-wk-field { margin-bottom: 12px; }
                .t-wk-switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; min-height: 56px; border-radius: 16px; background: #fff; border: 1px solid var(--line); cursor: pointer; }
                .t-wk-switch b { display: block; font-size: 15px; font-weight: 600; }
                .t-wk-switch small { display: block; font-size: 12.5px; color: var(--muted); }
                .t-wk-switch input { width: 22px; height: 22px; flex: none; }
                .t-wk-actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
                .t-wk-actions .dg-sm { height: 42px; }
                .t-wk-actions .dg-sm:disabled { opacity: .35; }
                .t-wk-delbtn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 48px; border-radius: 14px; color: #C2413A; font-weight: 600; font-size: 15px; margin-bottom: 10px; }
                .t-wk-del { padding: 12px 14px; border-radius: 16px; background: #FDF1F0; margin-bottom: 10px; }
                .t-wk-del p { font-size: 14px; color: #8A2B25; margin-bottom: 10px; }
                .t-wk-del div { display: flex; gap: 8px; }
                .t-wk-del .dg-sm { height: 42px; flex: 1; justify-content: center; }
                .t-danger { background: #C2413A; color: #fff; }
                .t-grid td button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; width: 100%; min-width: 76px; min-height: 64px; padding: 6px 4px; text-align: center; }
                .t-grid td button:active { background: var(--soft); }
                .t-grid td b { font-size: 14px; white-space: nowrap; font-weight: 600; color: var(--ink); }
                .t-grid td span { font-size: 13.5px; white-space: nowrap; color: var(--ink); }
                .t-grid td small { font-size: 12px; color: var(--muted); }
                .t-grid td button.empty { color: var(--muted); }


                /* ---- database esercizi su telefono: schermata intera a schede ---- */
                .t-dbm { position: fixed; inset: 0; z-index: 10002; display: flex; flex-direction: column; background: var(--paper); color: var(--ink); animation: sheet-up .35s var(--ease) both; }
                .t-dbm-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: max(14px, env(safe-area-inset-top)) 16px 10px; }
                .t-dbm-head h3 { font-size: 22px; font-weight: 700; line-height: 1.15; }
                .t-dbm-head span { font-size: 13px; color: var(--muted); }
                .t-dbm-x { width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; flex: none; }
                .t-dbm-tools { padding: 0 16px 10px; display: flex; flex-direction: column; gap: 8px; }
                .t-dbm-search { display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 14px; border-radius: 14px; background: #fff; border: 1px solid var(--line); }
                .t-dbm-search i { color: var(--muted); font-size: 18px; }
                .t-dbm-search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; }
                .t-dbm-new { display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; border-radius: 14px; background: var(--ink); color: #fff; font-weight: 600; font-size: 15px; }
                .t-dbm-form { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: 16px; background: #fff; border: 1px solid var(--line); }
                .t-dbm-form div { display: flex; gap: 8px; }
                .t-dbm-form input { flex: 1; min-width: 0; height: 46px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); }
                .t-dbm-form button { height: 46px; border-radius: 12px; background: var(--soft); font-weight: 600; }
                .t-dbm-form button:disabled { opacity: .4; }
                .t-dbm-list { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0 16px 12px; display: flex; flex-direction: column; gap: 8px; }
                .t-dbm-empty { text-align: center; color: var(--muted); padding: 30px 0; }
                .t-dbm-card { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 16px; background: #fff; border: 1px solid var(--line); }
                .t-dbm-thumb { flex: none; width: 56px; height: 56px; border-radius: 12px; overflow: hidden; background: var(--soft); display: grid; place-items: center; color: var(--muted); font-size: 20px; }
                .t-dbm-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .t-dbm-fields { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
                .t-dbm-fields div { display: flex; gap: 6px; }
                .t-dbm-fields input { flex: 1; min-width: 0; height: 36px; padding: 0 8px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--ink); }
                .t-dbm-fields input:focus { border-color: var(--ink); background: var(--paper); outline: 0; }
                .t-dbm-fields input.n { font-weight: 600; height: 40px; }
                .t-dbm-fields div input { color: var(--muted); font-size: 14px; }
                .t-dbm-del { flex: none; width: 44px; height: 44px; display: grid; place-items: center; color: #C2413A; border-radius: 12px; }
                .t-dbm-foot { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 16px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: var(--paper); }
                .t-dbm-foot button { flex: 1 1 28%; display: flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 12px; background: #fff; border: 1px solid var(--line); font-size: 14px; font-weight: 600; }
                .t-dbm-foot button.reset { flex-basis: 100%; height: 36px; border: 0; background: transparent; color: #C2413A; font-weight: 500; font-size: 13px; }

                /* ==================== ADATTAMENTO A TABLET E TELEFONO ==================== */
                @media (max-width: 1100px) {
                    .t-client-header-card { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .t-main { padding: 28px 24px; }
                }
                @media (max-width: 900px) {
                    .t-root { flex-direction: column; height: auto; min-height: 0; margin: 0; }
                    .t-mobile-bar { display: flex; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 40; padding: 10px 14px;
                        background: rgba(255,255,255,0.92); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(0,0,0,0.06); }
                    .t-mobile-bar button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: #fff; border-radius: 12px;
                        padding: 9px 14px; font-weight: 700; font-size: 13px; color: #1D1D1F; cursor: pointer; }
                    .t-mobile-bar .t-mobile-where { font-size: 12px; color: #86868B; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    /* l'indice diventa un cassetto che scorre da sinistra */
                    .t-sidebar { position: fixed; top: 0; left: 0; bottom: 0; height: 100dvh; width: min(86vw, 320px); z-index: 10001;
                        transform: translateX(-105%); transition: transform .3s cubic-bezier(.16,1,.3,1); background: rgba(255,255,255,0.98);
                        box-shadow: 8px 0 40px rgba(0,0,0,0.18); padding-top: max(20px, env(safe-area-inset-top)); padding-bottom: 56px !important; /* lascia libera la pastiglia di stato in basso */ }
                    .t-sidebar.open { transform: translateX(0); }
                    .t-nav-backdrop.open { display: block; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.35); }
                    .hover-actions { opacity: 1; transform: none; } /* niente hover sul touch: le azioni restano visibili */
                    .premium-item:hover { transform: none; }
                    .t-main { padding: 20px 14px 90px; overflow: visible; }
                    .t-container-wrapper { height: auto !important; padding-bottom: 60px; }
                    .t-week-title-input { font-size: 22px; }
                    .modal-backdrop { padding: 0; }
                    .modal-window { height: 100dvh; max-width: none; border-radius: 0; }
                    .modal-window .t-modal-pad { padding: 16px !important; }
                }
                @media (max-width: 560px) {
                    .t-client-header-card { grid-template-columns: minmax(0, 1fr); padding: 18px; gap: 14px; margin-bottom: 24px; }
                    .t-day-card { padding: 16px; border-radius: 18px; }
                    .t-exercise-item { padding: 14px; }
                    .t-fab-print { width: 52px; height: 52px; right: 16px; bottom: max(16px, env(safe-area-inset-bottom)); }
                    .t-modal-card { width: 100%; height: 100dvh; border-radius: 0; padding: 20px; }
                }

                /* ==================== VISTA COMPATTA (telefono e tablet) ==================== */
                .t-c-root { min-height: 80vh; background: var(--paper); color: var(--ink); }
                .t-c-weeks { position: sticky; top: 0; z-index: 30; display: flex; gap: 8px; overflow-x: auto; padding: 12px 14px; background: color-mix(in srgb, var(--paper) 90%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
                .t-c-chip { flex: none; display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 14px; font-weight: 600; color: var(--muted); transition: background-color .3s var(--ease), color .3s, transform .2s var(--ease); }
                .t-c-chip.on { background: var(--ink); border-color: var(--ink); color: #fff; }
                .t-c-chip.add { width: 40px; padding: 0; justify-content: center; }
                .t-c-chip:active { transform: scale(.94); }
                .t-c-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--warn); }
                .t-c-body { padding: 14px 14px 120px; }
                .t-c-details { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 12px 16px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); text-align: left; margin-bottom: 12px; min-height: 56px; }
                .t-c-details-title { display: block; font-weight: 600; font-size: 15px; line-height: 1.25; }
                .t-c-details-sub { display: block; font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .t-c-details i { color: var(--muted); transition: transform .35s var(--ease); }
                .t-c-details i.open { transform: rotate(180deg); }
                .t-c-collapse { display: grid; transition: grid-template-rows .5s var(--ease); }
                .t-c-collapse .t-client-header-card { margin: 0 0 12px; }
                .t-c-days { display: flex; flex-direction: column; gap: 10px; }
                .t-c-day { display: flex; align-items: stretch; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; animation: rise .45s var(--ease) backwards; }
                .t-c-day-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 14px; padding: 16px; text-align: left; transition: background-color .2s; }
                .t-c-day-main:active { background: var(--soft); }
                .t-c-day-num { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--soft); font-weight: 700; font-size: 14px; }
                .t-c-day-title { display: block; font-size: 16px; font-weight: 600; line-height: 1.25; }
                .t-c-day-meta { display: block; font-size: 13px; color: var(--muted); margin-top: 2px; }
                .t-c-day-names { display: block; font-size: 13px; color: #9A9892; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .t-c-day-main > i { color: var(--muted); flex: none; }
                .t-c-day-tools { display: flex; flex-direction: column; border-left: 1px solid var(--line); }
                .t-c-day-tools button { flex: 1; width: 52px; display: grid; place-items: center; color: var(--muted); font-size: 18px; transition: background-color .2s, color .2s; }
                .t-c-day-tools button + button { border-top: 1px solid var(--line); }
                .t-c-day-tools button:active { background: var(--soft); }
                .t-c-day-tools .del:active { color: var(--bad); }
                .t-c-add-day { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 58px; border-radius: 18px; border: 1.5px dashed #CFCBC2; color: var(--ink); font-weight: 600; font-size: 15px; transition: background-color .2s, transform .2s var(--ease); }
                .t-c-add-day:active { background: var(--soft); transform: scale(.985); }
                .t-c-week-tools { display: flex; gap: 8px; margin-top: 6px; }
                .t-c-week-tools button { display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 14px; border-radius: 12px; font-size: 13px; font-weight: 600; color: var(--muted); }
                .t-c-week-tools button:active { background: var(--soft); }
                .t-c-week-tools .del { color: var(--bad); }
                .t-c-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000; display: grid; grid-template-columns: repeat(5, 1fr); padding: 6px 6px max(8px, env(safe-area-inset-bottom)); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid var(--line); }
                .t-c-bar button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 54px; border-radius: 14px; font-size: 11px; font-weight: 600; color: var(--muted); transition: background-color .2s, color .2s, transform .2s var(--ease); }
                .t-c-bar button i { font-size: 22px; color: var(--ink); }
                .t-c-bar button:active { background: var(--soft); transform: scale(.94); }
                .t-c-more { display: flex; flex-direction: column; gap: 8px; }
                .t-c-more button { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); text-align: left; font-weight: 600; font-size: 16px; min-height: 64px; }
                .t-c-more button i { font-size: 24px; }
                .t-c-more small { display: block; font-weight: 400; font-size: 13px; color: var(--muted); }
                .t-dayedit-bar { display: none; }
                @media (max-width: 900px) { .t-add-inline { display: none !important; } }
                @media (max-width: 900px) {
                    .t-dayedit-bar { display: flex; gap: 10px; padding: 10px 14px max(12px, env(safe-area-inset-bottom)); background: var(--surface); border-top: 1px solid var(--line); flex: none; }
                    .t-dayedit-bar button { flex: 1; height: 52px; border-radius: 14px; font-weight: 700; font-size: 15px; }
                    .t-dayedit-bar .ghost { background: var(--soft); color: var(--ink); }
                    .t-dayedit-bar .main { background: var(--ink); color: #fff; }
                }
                body:has(.t-c-bar) .archive-chip { display: none; }

                /* ==================== TELEFONO (< 640px): in linea con Nuova visita, Agenda e Home ==================== */
                /* serie in formato a righe (solo telefono, vedi SetRowCompact) */
                .t-setc-list { display: flex; flex-direction: column; }
                .t-setc-row { display: grid; grid-template-columns: 32px repeat(3, minmax(0, 1fr)) 36px; gap: 5px; align-items: center; }
                .t-setc-row.cardio { grid-template-columns: 32px repeat(2, minmax(0, 1fr)) 36px; }
                .t-setc-head span { font-size: 11.5px; font-weight: 600; color: var(--muted); text-align: center; }
                .t-setc { padding: 6px 0 8px; border-bottom: 1px solid #EFEDE8; }
                .t-setc:last-child { border-bottom: 0; }
                .t-setc.warm { background: #FFFBF2; border-radius: 12px; }
                .t-setc.drop { background: #F7F2FF; border-radius: 12px; }
                .t-setc-row input { width: 100%; min-width: 0; height: 46px; padding: 0 4px; border: 1px solid #E6E4DE; border-radius: 12px; background: #fff; text-align: center; font-weight: 600; font-size: 17px; color: var(--ink); outline: none; }
                .t-setc-row input::placeholder { color: #B5B3AE; font-weight: 400; }
                .t-setc input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(18,19,23,.08); }
                .t-setc .t-set-badge { width: 28px !important; height: 28px !important; min-width: 0; min-height: 0; padding: 0; margin: 0 auto; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 700; }
                .t-setc-del { width: 36px; height: 46px; display: grid; place-items: center; color: #C2413A; border-radius: 10px; }
                .t-setc-del:active { background: var(--soft); }
                .t-setc-more { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; margin: 5px 41px 0 37px; }
                .t-setc-f { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 0; height: 54px; padding: 0 12px; border-radius: 12px; background: #fff; border: 1px solid #E6E4DE; }
                .t-setc-f.wide { flex: 1 1 0; }
                .t-setc-f.rec { flex: 1 1 0; }
                .t-setc-f span { flex: none; font-size: 10.5px; font-weight: 600; color: var(--muted); }
                .t-setc-f input { flex: none; width: 100%; min-width: 0; height: 26px; border: 0; background: transparent; outline: none; font-weight: 500; color: var(--ink); padding: 0; }
                .t-setc-f:focus-within { border-color: var(--ink); }

                @media (max-width: 639px) {
                    /* testata: il piano a tutta larghezza, gli strumenti su una riga, niente sfera (come Nuova visita) */
                    .t-root .dg-head { gap: 8px; margin-bottom: 8px; }
                    .t-root .dg-orb, .t-root .dg-kicker { display: none; }
                    .t-root .dg-tools { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
                    .t-root .dg-tools .dg-tool { min-width: 0; padding: 0 6px; gap: 5px; height: 40px; overflow: hidden; }
                    .t-root .dg-title { font-size: 26px; }
                    .t-root .dg-hint2 { display: none; }

                    /* strumenti del passo: una sola riga che scorre */
                    .t-root .t-toolrow { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 0 16px 2px; }
                    .t-root .t-toolrow .dg-sm { flex: none; height: 36px; }
                    .t-root .t-more { width: 40px; height: 40px; background: #fff; border: 1px solid var(--line); color: var(--ink); }

                    /* la seduta non sta in una scatola dentro la scatola: tutta la larghezza va agli esercizi */
                    .t-root .t-day-sec { margin-top: 12px; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none !important; }
                    .t-root .t-day-stats { position: static; padding: 6px 0 0; background: transparent !important; border: 0 !important; border-radius: 18px; backdrop-filter: none; -webkit-backdrop-filter: none; background: #fff; box-shadow: none; }
                    .t-root .t-stats { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px !important; }
                    .t-root .t-stats .dg-stat2 { min-width: 0; padding: 6px 9px; border-radius: 12px; background: #FBFAF8; border-color: #F0EEE9; }
                    .t-root .t-stats .dg-stat2 small { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .t-root .t-stats .dg-stat2 b { font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                    /* esercizio: nome in alto, poi gruppo · superserie · elimina, poi le foto */
                    .t-root .t-exercise-item { padding: 14px !important; margin-bottom: 12px !important; border-radius: 18px !important; background: #fff !important; }
                    .t-root .t-ex-head { gap: 8px !important; margin-bottom: 12px !important; }
                    .t-root .t-ex-name { order: 0; flex: 1 1 100% !important; }
                    .t-root .t-ex-meta { order: 1; flex: 1 1 100% !important; }
                    .t-root .t-ex-photos { order: 2; }
                    .t-root .t-ex-photos img { width: 44px !important; }
                    .t-root .t-ex-meta select { max-width: 42%; }


                    /* ---- iPhone: prima ciò che serve con una mano, il resto dietro un tocco ---- */
                    .t-root.dg-page { padding-top: 6px; }
                    .t-root .dg-head { flex-wrap: nowrap; align-items: center; }
                    .t-root .dg-headmain { min-width: 0; }
                    .t-root .dg-planbtn { width: 100%; min-height: 44px; padding: 0 12px; gap: 7px; }
                    .t-root .dg-planbtn .dg-edit { display: none; }
                    .t-root .dg-planbtn .dg-stat { font-size: 11px; padding: 2px 8px; }
                    .t-root .dg-tools { display: flex; gap: 6px; flex: none; width: auto; }
                    .t-root .dg-tools .dg-tool { width: 44px; height: 44px; padding: 0; justify-content: center; border-radius: 14px; }
                    .t-root .dg-tools .dg-tool-l { display: none; }
                    .t-root .dg-tools .dg-tool i { font-size: 20px; }
                    .t-root .dg-step .dg-dot { display: none; }
                    .t-root .dg-step small { display: none; }
                    .t-root .dg-step { justify-content: center; min-height: 44px; }
                    .t-root .dg-step b { font-size: 15px; text-align: center; }
                    /* settimane = livello secondario (piccole, chiare); sedute = livello principale (grandi) */
                    .t-root .t-tier-week .dg-chip.row { min-height: 34px; padding: 0 14px; font-size: 13.5px; background: transparent; border-color: transparent; color: var(--muted); }
                    .t-root .t-tier-week .dg-chip.row.on { background: var(--soft); color: var(--ink); border-color: transparent; }
                    .t-root .t-tier-week .t-more { width: 34px; height: 34px; min-height: 0; border: 0; background: transparent; }
                    .t-root .t-tier-day { margin-top: 4px; }
                    .t-weekpill { display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0; font-size: 15px; font-weight: 600; color: var(--ink); }
                    .t-weekpill small { color: var(--muted); font-weight: 500; font-size: 13px; }
                    .t-weekpill i { color: var(--muted); }
                    .t-sumline { font-size: 14px; color: var(--muted); padding: 2px 4px; }
                    .t-sumline b { color: var(--ink); font-weight: 600; }
                    .t-root .dg-step { padding: 8px 10px; border-radius: 14px; }
                    .t-root .dg-body[data-step="program"] .dg-title, .t-root .dg-body[data-step="program"] .dg-hint2 { display: none; }
                    .t-root .t-lab { display: none; }
                    .t-root .dg-chip.row { min-height: 46px; padding: 0 18px; font-size: 15px; }
                    .t-root .t-more { width: 46px; height: 46px; border-radius: 14px; }
                    .t-root .t-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                    .t-root .t-stats .dg-stat2:nth-child(n+4) { display: none; }
                    .t-det { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; margin-top: 10px; padding: 10px 14px; min-height: 52px; border-radius: 16px; background: #fff; border: 1px solid var(--line); text-align: left; }
                    .t-det b { display: block; font-size: 14.5px; font-weight: 600; }
                    .t-det small { display: block; font-size: 12.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 62vw; }
                    .t-det i { color: var(--muted); transition: transform .3s var(--ease); }
                    .t-det i.open { transform: rotate(180deg); }
                    .t-root .t-exercise-item .t-ex-input { font-size: 18px; min-height: 44px; padding-left: 0; padding-right: 0; }
                    /* il tasto Consegna resta sempre in fondo allo schermo, anche con poco contenuto */
                    .t-root .dg-foot { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; gap: 8px; padding: 10px 16px max(12px, env(safe-area-inset-bottom)); }
                    .t-root .dg-body { padding-bottom: 96px; }
                    .t-root .dg-in { animation-fill-mode: backwards; } /* a fine animazione niente transform: altrimenti il fixed resta intrappolato */
                    .t-root .dg-foot .vw-back { height: 52px; border-radius: 16px; }
                    .t-root .dg-foot .vw-next { height: 52px; border-radius: 16px; font-size: 16px; }

                    /* barra Indietro / Avanti: come in Nuova visita, indietro solo freccia e avanti a tutta larghezza */
                    .t-root .dg-foot .vw-back { width: 46px; padding: 0; flex: none; }
                    .t-root .dg-foot .vw-back span { display: none; }
                    .t-root .dg-foot .vw-next { flex: 1; min-width: 0; }
                }
            `;
