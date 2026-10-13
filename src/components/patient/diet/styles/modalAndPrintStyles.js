// Overlay/modali generici e media query di stampa
export const modalAndPrintStyles = `
                /* OVERLAY E MODALI (POP-UP) */
                .modal-backdrop {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); z-index: 9999;
                    display: flex; align-items: center; justify-content: center; padding: 40px;
                    animation: fadeIn 0.3s ease;
                }
                .modal-window {
                    background: #FFFFFF; width: 100%; max-width: 1000px; height: 90vh;
                    border-radius: 32px; box-shadow: 0 30px 90px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.3); display: flex; flex-direction: column;
                    overflow: hidden; transform-origin: center; animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

                /* MEDIA QUERY PER LA STAMPA PULITA */
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 10pt; height: auto; overflow: visible; display: block; }
                    .t-sidebar, .t-fab-print, .t-icon-btn, .t-btn-sidebar-action, .t-suggestions-list, .modal-backdrop, .hover-actions { display: none !important; }
                    .t-main-content { padding: 0; margin: 0; width: 100%; overflow: visible; }
                    .t-container-wrapper { max-width: 100%; margin: 0; padding: 0; }
                    .t-client-header-card { padding: 15px; margin-bottom: 20px; box-shadow: none; border: 1px solid #E5E5EA; background: white; grid-template-columns: 1fr 1fr 1fr; gap: 10px; border-radius: 12px; }
                    .t-client-header-card input { border: none; padding: 0; font-weight: bold; font-size: 11pt; color: black; background: transparent; }
                    .t-exercise-item { background-color: #FFFFFF !important; border: 1px solid #E5E5EA !important; border-radius: 8px !important; padding: 8px 12px !important; margin-bottom: 8px !important; box-shadow: none !important; transform: none !important; }
                    .t-ex-input { background: transparent; box-shadow: none; padding: 0; font-size: 11pt; color: black; font-weight: 700; }
                    .t-sets-table th { color: #888; padding-bottom: 2px; border-bottom: 1px solid #E5E5EA; }
                    .t-sets-table td { border-bottom: 1px solid #F5F5F7; padding: 4px; }
                    .t-sets-table input { border: none !important; background: transparent !important; color: #000; font-weight: 500; padding: 0; }
                }

`;
