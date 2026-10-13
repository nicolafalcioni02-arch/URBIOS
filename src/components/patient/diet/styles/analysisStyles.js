// Navigazione analisi, card squircle, legende
export const analysisStyles = `
                /* --- NAVIGAZIONE ANALISI SQUIRCLE --- */
                .analysis-nav {
                    display: flex; gap: 12px; overflow-x: auto; padding: 10px 0;
                    scrollbar-width: none; margin-bottom: 25px; 
                    border-bottom: none; /* Rimossa la riga come richiesto */
                }
                .analysis-nav::-webkit-scrollbar { display: none; }
                
                .analysis-chip {
                    padding: 10px 20px; border-radius: 14px; /* Squircle style */
                    background: #FFFFFF; border: 1px solid var(--line); 
                    color: #86868B; font-size: 12px; font-weight: 800;
                    cursor: pointer; white-space: nowrap; transition: all 0.25s ease;
                }
                .analysis-chip:hover { border-color: var(--ink); color: var(--ink); }
                .analysis-chip.active {
                    background: #1D1D1F; border-color: #1D1D1F; color: #FFFFFF;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }

                /* CARD SQUIRCLE */
                .chart-card { 
                    background: #FFFFFF; border-radius: 24px; padding: 20px; 
                    border: 1px solid var(--line); display: flex; flex-direction: column; 
                }
                
                .bar-label-sigla {
                    font-size: 10px; font-weight: 900; color: #86868B; 
                    margin-top: 6px;
                }

                /* --- LEGENDE E VALORI --- */
                .chart-legend {
                    display: flex; gap: 12px; justify-content: center; 
                    margin-top: 15px; flex-wrap: wrap;
                }
                .legend-item {
                    display: flex; align-items: center; gap: 5px; 
                    font-size: 10px; font-weight: 800; color: #86868B;
                }
                .legend-dot {
                    width: 8px; height: 8px; border-radius: 2px; /* Squircle mini */
                }
                .bar-value-top {
                    font-size: 9px; font-weight: 900; color: #1D1D1F; 
                    margin-bottom: 4px; text-align: center;
                }
                .scope-indicator {
                    font-size: 9px; font-weight: 800; color: var(--ink); 
                    background: var(--soft); padding: 2px 8px; border-radius: 6px;
                    margin-bottom: 10px; display: inline-block; align-self: flex-start;
                }

`;
