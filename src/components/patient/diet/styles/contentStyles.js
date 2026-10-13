// Area centrale: dashboard, bottoni, righe alimenti, autocompletamento, tabelle macro
export const contentStyles = `
                /* DASHBOARD E SCHEDE CENTRALI */
                .t-main-content { flex: 1; overflow-y: auto; padding: 40px; scroll-behavior: smooth; }
                .t-container-wrapper { max-width: 950px; margin: 0 auto; padding-bottom: 100px; }

                .t-client-header-card { 
                    background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 25px; border-radius: 20px; 
                    box-shadow: 0 8px 32px rgba(0,0,0,0.04); margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr 150px; 
                    gap: 20px; border: 1px solid rgba(255,255,255,0.8); 
                }
                .t-input-floating label { font-size: 10px; text-transform: uppercase; color: #86868B; font-weight: 700; display: block; margin-bottom: 5px; margin-left: 5px; }
                .t-input-floating input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #E5E5EA; font-size: 14px; outline: none; transition: all 0.3s ease; background: #F9F9FB; }
                .t-input-floating input:focus { border-color: #00C853; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(0,200,83,0.1); }

                /* BOTTONI ICONA */
                .t-icon-btn { 
                    width: 36px; height: 36px; border-radius: 50%; border: 1px solid #E5E5EA; background: white; 
                    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #86868B; 
                    margin-left: 8px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); outline: none; 
                }
                .t-icon-btn:hover { border-color: #00C853; color: #00C853; transform: scale(1.1); }
                .t-icon-btn.danger:hover { border-color: #FF3B30; color: #FF3B30; }

                /* RIGHE DEGLI ALIMENTI (Ex Esercizi) */
                .t-exercise-item { 
                    background: #F9F9FB; border-radius: 16px; padding: 18px; margin-bottom: 12px; position: relative; 
                    border: 1px solid transparent; transition: all 0.3s ease; 
                }
                .t-exercise-item:focus-within { background: #FFFFFF; border-color: #E8F5E9; box-shadow: 0 8px 24px rgba(0,200,83,0.08); transform: scale(1.01); z-index: 2; }
                .t-ex-input { border: none; padding: 10px 12px; border-radius: 8px; font-size: 16px; font-weight: 700; width: 100%; background: transparent; outline: none; transition: background 0.3s; }
                .t-ex-input:focus { background: rgba(0,0,0,0.03); }

                /* AUTOCOMPLETAMENTO */
                .t-suggestions-list { 
                    position: absolute; top: 100%; left: 0; width: 100%; background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); 
                    border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); z-index: 100; max-height: 250px; overflow-y: auto; margin-top: 4px; 
                }
                .t-suggestion-item { padding: 12px 18px; font-size: 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; transition: background 0.2s; }
                .t-suggestion-item:hover { background: #F2FFF7; color: #00C853; padding-left: 22px; }
                .t-suggestion-tag { font-size: 10px; color: #999; text-transform: uppercase; font-weight: 800; margin-top: 4px; }

                /* TABELLE MACRONUTRIENTI */
                .t-sets-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
                .t-sets-table th { text-align: left; color: #86868B; font-size: 11px; text-transform: uppercase; padding: 8px 5px; font-weight: 800; border-bottom: 1px solid transparent; }
                .t-sets-table td { padding: 6px 4px; vertical-align: middle; }
                .t-sets-table input { width: 100%; padding: 8px 10px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; background: transparent; font-family: inherit; outline: none; transition: all 0.2s; font-weight: 700; }
                .t-sets-table input:focus { background: #FFFFFF; border-color: #00C853; box-shadow: 0 0 0 3px rgba(0,200,83,0.1); }
                .t-sets-table input:hover:not(:focus) { background: rgba(0,0,0,0.03); }

                .t-set-badge { background: #E5E5EA; color: #86868B; font-weight: 800; font-size: 12px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }

                /* BOTTONE STAMPA GALLEGGIANTE */
                .t-fab-print { 
                    position: fixed; bottom: 40px; right: 40px; background: linear-gradient(135deg, #1D1D1F 0%, #434345 100%); 
                    color: white; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3); cursor: pointer; z-index: 100; border: none; outline: none; 
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                }
                .t-fab-print:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 20px 40px rgba(0,0,0,0.4); background: linear-gradient(135deg, #00C853 0%, #009624 100%); }

`;
