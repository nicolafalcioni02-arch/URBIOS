// Smart Report Maker (classi sc-*)
export const smartChartStyles = `
                }

                @keyframes slideInModal {
    from { opacity: 0; transform: scale(0.96) translateY(16px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes fadeInPanel {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInChart {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
 
  .sc-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .sc-modal {
    background: #FFFFFF;
    width: 100%; max-width: 1100px; height: 88vh;
    border-radius: 28px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: slideInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
 
  /* HEADER */
  .sc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 28px;
    border-bottom: 1px solid #F0F0F2;
    flex-shrink: 0;
  }
  .sc-header-title {
    font-size: 17px; font-weight: 700; color: #1D1D1F;
  }
  .sc-header-sub {
    font-size: 11px; font-weight: 500; color: #8E8E93;
    margin-top: 1px;
  }
  .sc-close-btn {
    width: 36px; height: 36px; border-radius: 12px;
    border: 1px solid var(--line); background: #FBFAF8;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #636366;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .sc-close-btn:hover { background: #F2F2F7; color: #1D1D1F; border-color: #D1D1D6; }
 
  /* BODY: due colonne */
  .sc-body {
    display: grid;
    grid-template-columns: 280px 1fr;
    flex: 1;
    overflow: hidden;
  }
 
  /* PANNELLO SINISTRO */
  .sc-panel {
    border-right: 1px solid #F0F0F2;
    background: #FAFAFC;
    padding: 24px 20px;
    display: flex; flex-direction: column; gap: 24px;
    overflow-y: auto;
    animation: fadeInPanel 0.35s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  }
  .sc-panel::-webkit-scrollbar { display: none; }
 
  .sc-section-label {
    font-size: 9px; font-weight: 800; color: #8E8E93;
    margin-bottom: 8px;
  }
 
  /* Toggle scope */
  .sc-scope-toggle {
    display: flex; background: #EFEFEF; border-radius: 10px; padding: 3px; gap: 2px;
  }
  .sc-scope-btn {
    flex: 1; padding: 7px 10px; border-radius: 8px; border: none;
    font-size: 11px; font-weight: 600; cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    background: transparent; color: #636366;
  }
  .sc-scope-btn.active {
    background: #FFFFFF; color: #1D1D1F;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
 
  /* Tipo grafico — pill grid */
  .sc-type-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  }
  .sc-type-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid var(--line); background: #FFFFFF;
    font-size: 11px; font-weight: 600; color: #636366;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.12s;
  }
  .sc-type-btn:hover { border-color: #C7C7CC; color: #1D1D1F; transform: translateY(-1px); }
  .sc-type-btn.active {
    border-color: #1D1D1F; background: #1D1D1F; color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
 
  /* Metrica select */
  .sc-select {
    width: 100%; padding: 10px 12px;
    border-radius: 10px; border: 1.5px solid var(--line);
    background: #FFFFFF; font-size: 12px; font-weight: 600;
    color: #1D1D1F; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
    cursor: pointer;
  }
  .sc-select:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(18,19,23,0.08); }
 
  /* Toggle DRV */
  .sc-drv-toggle {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid var(--line); background: #FFFFFF;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .sc-drv-toggle.active { border-color: var(--ink); background: var(--soft); }
  .sc-drv-toggle-label {
    font-size: 11px; font-weight: 600; color: #636366; flex: 1; line-height: 1.3;
  }
  .sc-drv-toggle.active .sc-drv-toggle-label { color: #2A2B31; }
  .sc-toggle-pill {
    width: 32px; height: 18px; border-radius: 9px;
    background: #D1D1D6; position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .sc-drv-toggle.active .sc-toggle-pill { background: var(--ink); }
  .sc-toggle-dot {
    position: absolute; top: 2px; left: 2px;
    width: 14px; height: 14px; border-radius: 50%; background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sc-drv-toggle.active .sc-toggle-dot { transform: translateX(14px); }
 
  /* Note textarea */
  .sc-notes {
    width: 100%; padding: 10px 12px;
    border-radius: 10px; border: 1.5px solid var(--line);
    background: #FFFFFF; font-size: 11px; font-weight: 500;
    color: #1D1D1F; outline: none; resize: none;
    font-family: inherit; line-height: 1.5;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-height: 72px;
  }
  .sc-notes:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(18,19,23,0.08); }
  .sc-notes::placeholder { color: #C7C7CC; font-weight: 400; }
 
  /* AREA GRAFICO DESTRA */
  .sc-chart-area {
    display: flex; flex-direction: column;
    padding: 24px 28px;
    overflow: hidden;
    animation: fadeInChart 0.35s 0.15s cubic-bezier(0.16,1,0.3,1) both;
  }
  .sc-chart-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .sc-chart-tag {
    font-size: 9px; font-weight: 800; color: var(--ink);
    background: var(--soft); padding: 3px 9px; border-radius: 6px;
    border: 1px solid var(--line);
  }
  .sc-chart-container {
    flex: 1; min-height: 0;
    border-radius: 16px;
    border: 1px solid #F0F0F2;
    background: #FAFAFA;
    overflow: hidden;
    position: relative;
  }
 
  /* FOOTER */
  .sc-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px;
    border-top: 1px solid #F0F0F2;
    flex-shrink: 0;
    background: #FFFFFF;
  }
  .sc-btn-reset {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 9px; border: 1.5px solid var(--line);
    background: transparent; font-size: 11px; font-weight: 600;
    color: #8E8E93; cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .sc-btn-reset:hover { border-color: #C7C7CC; color: #1D1D1F; background: #FBFAF8; }
  .sc-btn-save {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 10px; border: none;
    background: var(--ink); color: #FFFFFF;
    font-size: 12px; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 14px rgba(0,200,83,0.25);
    transition: background 0.15s, box-shadow 0.15s, transform 0.12s;
  }
  .sc-btn-save:hover {
    background: #00B548; box-shadow: 0 6px 18px rgba(0,200,83,0.32);
    transform: translateY(-1px);
  }
  .sc-btn-save:active { transform: translateY(0); }
 
  .sc-divider { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }

`;
