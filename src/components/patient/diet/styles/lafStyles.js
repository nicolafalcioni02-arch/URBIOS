// Tabella LAF 24h
export const lafStyles = `
                /* --- STILI SPECIFICI PER TABELLA LAF 24H --- */
                .laf-input {
                    width: 100%; 
                    border: 1px solid transparent; 
                    background: transparent; 
                    font-weight: 700; 
                    outline: none; 
                    padding: 8px; 
                    border-radius: 8px; 
                    transition: all 0.2s ease;
                    color: #1D1D1F;
                }

                .laf-input:focus, .laf-input:hover {
                    background: #F2F2F7;
                    border-color: var(--line);
                }

                .laf-input.number {
                    text-align: center;
                    font-weight: 900;
                    font-size: 14px;
                    background: #FBFAF8;
                    border: 1px solid var(--line);
                }

                .laf-input.number:focus {
                    border-color: var(--ink);
                    background: var(--soft);
                    color: var(--ink);
                }

                .laf-row {
                    transition: background 0.2s ease;
                }

                .laf-row:hover {
                    background: #FAFAFC;
                }
                    .preview-badge {
                    background: #F2F2F7;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #1D1D1F;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .save-modal-icon {
                    width: 50px;
                    height: 50px;
                    background: var(--soft);
                    color: var(--ink);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
`;
