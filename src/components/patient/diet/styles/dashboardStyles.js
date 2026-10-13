// Grafici CSS-only, archivio report salvati, card giorno/pasto
export const dashboardStyles = `
                /* --- DASHBOARD E GRAFICI CSS-ONLY --- */
                .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .chart-card { background: #FFFFFF; border-radius: 20px; padding: 20px; border: 1px solid #E5E5EA; display: flex; flex-direction: column; }
                .chart-title { font-size: 11px; font-weight: 800; color: #86868B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
                
                /* Grafico a Torta */
                .pie-chart { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; position: relative; }
                .pie-hole { width: 70px; height: 70px; background: #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
                
                /* Istogrammi */
                .bar-container { display: flex; align-items: flex-end; justify-content: space-between; height: 100px; gap: 8px; margin-top: auto; }
                .bar-col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 5px; height: 100%; }
                .bar-fill { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; }
                .bar-label { font-size: 9px; color: #86868B; font-weight: 700; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

                /* Lista Pasti Compatta */
                .compact-meal-list { background: #FFFFFF; border-radius: 16px; border: 1px solid #E5E5EA; overflow: hidden; }
                .compact-meal-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #F5F5F7; cursor: pointer; transition: background 0.2s; }
                .compact-meal-row:hover { background: #F9F9FB; }
                .compact-meal-row:last-child { border-bottom: none; }
                
                /* Contenitore FAB doppio */
                .fab-container { position: fixed; bottom: 40px; right: 40px; display: flex; gap: 15px; z-index: 100; }

                /* --- SEZIONE REPORT SALVATI (ADATTIVA) --- */
                .saved-reports-section { margin-top: 50px; border-top: 2px dashed #E5E5EA; padding-top: 40px; }
                .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
                
                .report-card { background: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5EA; padding: 20px; display: flex; flex-direction: column; position: relative; transition: all 0.3s ease; page-break-inside: avoid; }
                .report-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.05); transform: translateY(-2px); }
                
                /* Layout a doppia larghezza se è presente un commento */
                .report-card.double { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 800px) { .report-card.double { grid-column: span 1; grid-template-columns: 1fr; } }
                
                .report-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .report-card-title { font-size: 15px; font-weight: 800; color: #1D1D1F; margin: 0; }
                .report-card-subtitle { font-size: 11px; color: #86868B; text-transform: uppercase; font-weight: 700; margin-top: 4px; display: block; }
                
                .report-comment-box { background: #F9F9FB; padding: 20px; border-radius: 16px; font-size: 13px; color: #1D1D1F; font-style: italic; border-left: 4px solid #00C853; height: 100%; line-height: 1.6; overflow-y: auto; }
                .btn-delete-report { background: transparent; border: none; color: #FF3B30; font-weight: 800; cursor: pointer; font-size: 16px; padding: 5px; opacity: 0.5; transition: 0.2s; }
                .btn-delete-report:hover { opacity: 1; transform: scale(1.1); }
                /* --- SOTTOBOX GIORNO E CARD RETTANGOLARI PASTI --- */
                .day-summary-card {
                    background: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5EA;
                    padding: 24px; margin-bottom: 30px;
                }
                .day-summary-header {
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #F0F0F2; padding-bottom: 16px; margin-bottom: 20px;
                }
                .day-title-input {
                    font-size: 20px; font-weight: 800; color: #1D1D1F; border: none; background: transparent; outline: none; width: 50%;
                    transition: color 0.2s;
                }
                .day-title-input:focus { color: #00C853; }
                
                .day-macro-summary {
                    display: flex; gap: 15px; font-size: 13px; font-weight: 800;
                    background: #F5F5F7; padding: 10px 16px; border-radius: 12px;
                }
                
                .meal-rect-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;
                }
                .meal-rect-card {
                    background: #F9F9FB; border-radius: 14px; border: 1px solid transparent;
                    padding: 16px; display: flex; flex-direction: column; gap: 12px;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .meal-rect-card:hover {
                    background: #FFFFFF; border-color: #00C853; box-shadow: 0 8px 24px rgba(0,200,83,0.08); transform: translateY(-2px);
                }
                .meal-title-input {
                    font-size: 15px; font-weight: 800; color: #1D1D1F; border: none; background: transparent; outline: none; width: 100%;
                    cursor: text;
                }
                .meal-title-input:focus { color: #00C853; }
                
                .meal-rect-stats {
                    display: flex; justify-content: space-between; align-items: flex-end;
                }
                .meal-macro-col {
                    display: flex; flex-direction: column; gap: 3px; font-size: 11px; font-weight: 700; color: #86868B;
                }

`;
