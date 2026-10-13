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
                    background: #E0F0FF !important;
                    border: 1px dashed #007AFF !important;
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
                .mini-action:hover { color: #007AFF; transform: scale(1.1); }
                .mini-action.del:hover { color: #FF3B30; }
                    
                .t-btn-new { background: #1D1D1F; color: white; }
                .t-btn-new:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(29, 29, 31, 0.2); }
                .t-btn-settings { background: transparent; color: #86868B; border: 1px dashed #E5E5EA; }
                .t-btn-settings:hover { background: #F5F5F7; color: #1D1D1F; transform: translateY(-2px); }
                .t-btn-archive { background: linear-gradient(135deg, #E0F0FF 0%, #F5FAFF 100%); color: #007AFF; }
                .t-btn-archive:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0, 122, 255, 0.15); }

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
                    border-color: #E0F0FF;
                    color: #007AFF; 
                }
                
                .premium-subitem {
                    margin-left: 15px; border-left: 2px solid #E5E5EA; padding-left: 10px;
                    transition: border-color 0.3s ease;
                }
                .premium-subitem:hover { border-color: #007AFF; }

                /* --- MAIN CONTENT E SCHEDE --- */
                .t-main-content { flex: 1; overflow-y: auto; padding: 40px; scroll-behavior: smooth; }
                .t-container-wrapper { max-width: 950px; margin: 0 auto; padding-bottom: 100px; }

                .t-client-header-card { 
                    background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 25px; border-radius: 20px; 
                    box-shadow: 0 8px 32px rgba(0,0,0,0.04); margin-bottom: 40px; display: grid; grid-template-columns: 1.3fr 1.3fr 1.5fr 150px; 
                    gap: 20px; border: 1px solid rgba(255,255,255,0.8); 
                }
                .t-input-floating label { font-size: 10px; text-transform: uppercase; color: #86868B; font-weight: 700; display: block; margin-bottom: 5px; margin-left: 5px; }
                .t-input-floating select { width: 100%; padding: 12px 12px; border-radius: 12px; border: 1px solid #E5E5EA; font-size: 14px; outline: none; background: #F9F9FB; }
                .t-input-floating input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #E5E5EA; font-size: 14px; outline: none; transition: all 0.3s ease; background: #F9F9FB; }
                .t-input-floating input:focus { border-color: #007AFF; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(0,122,255,0.1); }

                /* --- CARDS E ANIMAZIONI --- */
                .t-week-wrapper { margin-bottom: 60px; scroll-margin-top: 20px; position: relative; }
                .t-week-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-left: 15px; border-left: 4px solid #007AFF; }
                .t-week-title-input { font-size: 28px; font-weight: 800; border: none; background: transparent; width: 400px; outline: none; color: #1D1D1F; transition: color 0.3s; }
                .t-week-title-input:focus { color: #007AFF; }

                .t-day-card { 
                    background: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); padding: 25px; 
                    margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.8); position: relative; transition: all 0.4s ease; 
                }
                .t-day-card:hover { box-shadow: 0 15px 40px rgba(0,0,0,0.06); transform: translateY(-2px); }
                .t-day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .t-day-input { font-size: 20px; font-weight: 800; border: none; width: 100%; color: #007AFF; background: transparent; outline: none; }

                .t-icon-btn { 
                    width: 36px; height: 36px; border-radius: 50%; border: 1px solid #E5E5EA; background: white; 
                    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #86868B; 
                    margin-left: 8px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); outline: none; 
                }
                .t-icon-btn:hover { border-color: #007AFF; color: #007AFF; transform: scale(1.1) rotate(5deg); }
                .t-icon-btn.danger:hover { border-color: #FF3B30; color: #FF3B30; transform: scale(1.1) rotate(-5deg); }

                /* --- ESERCIZI --- */
                .t-exercise-item { 
                    background: #F9F9FB; border-radius: 16px; padding: 18px; margin-bottom: 12px; position: relative; 
                    border: 1px solid transparent; transition: all 0.3s ease; 
                }
                .t-exercise-item:focus-within { background: #FFFFFF; border-color: #E0F0FF; box-shadow: 0 8px 24px rgba(0,122,255,0.08); transform: scale(1.01); z-index: 2; }
                .t-ex-header-row { display: flex; gap: 12px; margin-bottom: 10px; position: relative; }
                .t-ex-input { border: none; padding: 10px 12px; border-radius: 8px; font-size: 16px; font-weight: 700; width: 100%; background: transparent; outline: none; transition: background 0.3s; }
                .t-ex-input:focus { background: rgba(0,0,0,0.03); }

                /* Autocompletamento Premium */
                .t-suggestions-list { 
                    position: absolute; top: 100%; left: 0; width: 80%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); 
                    border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); z-index: 100; max-height: 250px; overflow-y: auto; 
                }
                .t-suggestion-item { padding: 12px 18px; font-size: 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; transition: background 0.2s; }
                .t-suggestion-item:hover { background: #F5FAFF; color: #007AFF; padding-left: 22px; }
                .t-suggestion-tag { font-size: 10px; color: #999; text-transform: uppercase; font-weight: 800; margin-top: 4px; letter-spacing: 0.5px; }

                /* --- TABELLE --- */
                .t-sets-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
                .t-sets-table th { text-align: left; color: #86868B; font-size: 11px; text-transform: uppercase; padding: 8px 5px; font-weight: 800; letter-spacing: 0.5px; border-bottom: 1px solid transparent; }
                .t-sets-table td { padding: 6px 4px; vertical-align: middle; }
                .t-sets-table input { width: 100%; padding: 8px 10px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; background: transparent; font-family: inherit; outline: none; transition: all 0.2s; font-weight: 500; }
                .t-sets-table input:focus { background: #FFFFFF; border-color: #007AFF; box-shadow: 0 0 0 3px rgba(0,122,255,0.1); }
                .t-sets-table input:hover:not(:focus) { background: rgba(0,0,0,0.03); }

                .t-set-badge { background: #E5E5EA; color: #86868B; font-weight: 800; font-size: 12px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }

                /* --- BOTTONE STAMPA (Galleggiante e Lussuoso) --- */
                .t-fab-print { 
                    position: fixed; bottom: 40px; right: 40px; background: linear-gradient(135deg, #1D1D1F 0%, #434345 100%); 
                    color: white; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3); cursor: pointer; z-index: 100; border: none; outline: none; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                }
                .t-fab-print:hover { transform: scale(1.1) rotate(15deg); box-shadow: 0 20px 40px rgba(0,0,0,0.4); background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%); }

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
                    .t-client-header-card { padding: 15px; margin-bottom: 20px; box-shadow: none; border: 1px solid #E5E5EA; background: white; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-radius: 12px; }
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
                    .t-exercise-item { background-color: #FFFFFF !important; border: 1px solid #E5E5EA !important; border-radius: 8px !important; padding: 8px 12px !important; margin-bottom: 8px !important; box-shadow: none !important; transform: none !important; }
                    .t-ex-input { background: transparent; box-shadow: none; padding: 0; font-size: 12pt; color: black; font-weight: 700; }
                    .t-sets-table { margin-top: 2px; }
                    .t-sets-table th { color: #888; padding-bottom: 2px; border-bottom: 1px solid #E5E5EA; }
                    .t-sets-table td { border-bottom: 1px solid #F5F5F7; padding: 2px 4px; }
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
            `;
