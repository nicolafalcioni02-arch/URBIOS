// Sidebar, footer, lista giorni/pasti, azioni a scomparsa
export const sidebarStyles = `
                /* SIDEBAR FISSA E LUSSUOSA */
                .t-sidebar { 
                    width: 300px; 
                    background: rgba(255, 255, 255, 0.85); 
                    backdrop-filter: blur(20px); 
                    border-right: 2px solid rgba(0,0,0,0.05); 
                    display: flex; flex-direction: column; 
                    padding: 20px 15px; flex-shrink: 0; 
                    z-index: 50; position: sticky; top: 0; height: 85vh; 
                    box-shadow: 4px 0 24px rgba(0,0,0,0.02);
                }
                .t-nav-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; scrollbar-width: none; padding-right: 5px; }
                .t-nav-list::-webkit-scrollbar { display: none; }
                
                /* FOOTER DELLA SIDEBAR */
                .t-sidebar-footer { 
                    margin-top: auto; position: sticky; bottom: 0; 
                    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); 
                    padding: 20px 0; border-top: 1px solid rgba(0,0,0,0.05); 
                    z-index: 100; display: flex; flex-direction: column; gap: 10px;
                }
                
                /* PULSANTI E AZIONI */
                .t-btn-sidebar-action { 
                    width: 80%; 
                    margin-left: auto; 
                    margin-right: auto; 
                    padding: 12px; 
                    border-radius: 12px; 
                    border: none; 
                    font-weight: 600; 
                    font-size: 13px; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    gap: 28px; 
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }       
                .t-btn-new { background: var(--ink); color: white; }
                .t-btn-new:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(18, 19, 23, 0.16); }
                .t-btn-settings { background: transparent; color: #86868B; border: 1px dashed var(--line); }
                .t-btn-settings:hover { background: var(--paper); color: #1D1D1F; transform: translateY(-2px); }

                /* LISTA GIORNI E PASTI (Effetti hover e attivi) */
                .premium-item {
                    padding: 10px 15px; border-radius: 12px; cursor: grab; margin-bottom: 5px; 
                    font-weight: 600; font-size: 14px; color: #86868B; display: flex; justify-content: space-between;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent; align-items: center;
                }
                .premium-item:active { cursor: grabbing; transform: scale(0.96); opacity: 0.8; }
                .premium-item:hover { 
                    background: var(--soft); box-shadow: 0 4px 15px rgba(0,0,0,0.04); 
                    transform: translateX(4px); border-color: var(--soft); color: var(--ink); 
                }
                .premium-item.active-meal {
                    background: var(--soft); color: var(--ink); border-color: var(--line);
                }
                
                .premium-subitem { margin-left: 15px; border-left: 2px solid var(--line); padding-left: 10px; transition: border-color 0.3s ease; }
                .premium-subitem:hover { border-color: var(--ink); }

                /* AZIONI A SCOMPARSA (Copia, Elimina) */
                .hover-actions { display: flex; gap: 8px; opacity: 0; transform: translateX(10px); transition: all 0.2s ease; margin-left: auto; }
                .premium-item:hover .hover-actions { opacity: 1; transform: translateX(0); }
                .mini-action { color: #86868B; transition: 0.2s; cursor: pointer; font-size: 13px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.05); }
                .mini-action:hover { color: var(--ink); background: var(--soft); transform: scale(1.05); }
                .mini-action.del:hover { color: #FF3B30; background: #FFF0F0; }
                .drag-over-active { background: var(--soft) !important; border: 1px dashed var(--ink) !important; transform: scale(1.02); }

`;
