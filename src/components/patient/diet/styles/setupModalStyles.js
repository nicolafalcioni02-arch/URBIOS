// Modale Setup clinico e smart card
export const setupModalStyles = `
                /* --- MODALE SETUP CLINICO: STILI SQUIRCLE --- */

                .modal-backdrop {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 9999;
                }

                .modal-window {
                    background: #FFFFFF; border-radius: 32px; /* Apple Squircle Style */
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    overflow: hidden; border: 1px solid rgba(255,255,255,0.3);
                }

                /* Navigazione a Schede (Segmented Control) */
                .setup-tab-nav {
                    display: flex; gap: 4px; background: #F2F2F7; padding: 4px; 
                    border-radius: 14px; margin-bottom: 25px;
                }

                .setup-tab-btn {
                    flex: 1; padding: 10px; border-radius: 10px; border: none; 
                    font-size: 11px; font-weight: 800; cursor: pointer; 
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
                    background: transparent; color: #8E8E93;
                }

                .setup-tab-btn.active {
                    background: #FFFFFF; color: #1D1D1F; 
                    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
                }

                /* Griglia Antropometria */
                .setup-grid {
                    display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px;
                }

                /* Box dei Risultati (Metriche) */
                .metric-box {
                    background: #FFFFFF; padding: 16px; border-radius: 18px; 
                    border: 1px solid #E5E5EA; text-align: center;
                    display: flex; flex-direction: column; justify-content: center;
                    transition: transform 0.2s;
                }

                .metric-box:hover { transform: scale(1.02); border-color: #00C853; }

                .metric-value {
                    font-size: 22px; font-weight: 900; color: #1D1D1F; display: block;
                    letter-spacing: -0.5px;
                }

                .metric-label {
                    font-size: 9px; font-weight: 800; color: #86868B; 
                    text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;
                }

                /* Input flottanti all'interno del modale */
                .t-input-floating {
                    display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px;
                }

                .t-input-floating label {
                    font-size: 10px; font-weight: 800; color: #86868B; text-transform: uppercase;
                }

                .t-input-floating input, .t-input-floating select {
                    width: 100%; padding: 12px 16px; border-radius: 12px; 
                    border: 1px solid #E5E5EA; background: #FFFFFF; 
                    font-size: 15px; font-weight: 600; outline: none;
                }

                .t-input-floating input:focus { border-color: #00C853; background: #F2FFF7; }

                /* --- STILI PER LE SMART CARD CLINICHE --- */
                .smart-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
                .smart-card { 
                    background: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5EA; 
                    padding: 20px; display: flex; flex-direction: column; position: relative;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .smart-badge { 
                    position: absolute; top: 16px; right: 16px; padding: 4px 10px; 
                    border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase;
                    color: #FFFFFF;
                }
                .smart-title { font-size: 11px; font-weight: 800; color: #86868B; text-transform: uppercase; margin-bottom: 8px; }
                .smart-value { font-size: 26px; font-weight: 900; color: #1D1D1F; line-height: 1; }
                .smart-sub { font-size: 11px; font-weight: 600; color: #86868B; margin-top: 8px; }

                /* Segmented Control Interno (Per scelta peso) */
                .segmented-control { display: flex; background: #F2F2F7; padding: 4px; border-radius: 12px; }
                .segmented-btn { 
                    flex: 1; padding: 8px; border: none; background: transparent; color: #8E8E93; 
                    border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; 
                }
                .segmented-btn.active { background: #FFFFFF; color: #1D1D1F; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

                /* Tabella Matrice Pasti */
                .matrix-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                .matrix-table th { text-align: left; padding: 10px; color: #86868B; border-bottom: 1px solid #E5E5EA; font-weight: 800; }
                .matrix-table td { padding: 10px; border-bottom: 1px solid #F5F5F7; font-weight: 700; color: #1D1D1F; }
                .matrix-input { width: 50px; padding: 6px; border-radius: 8px; border: 1px solid #E5E5EA; text-align: center; font-weight: 800; }

`;
