// CSS di stampa A4 del fascicolo nutrizionale
export const printCss = `
                body { overflow: hidden; }

                @media print {
                    body * { visibility: hidden; }
                    #editor-toolbar { display: none !important; }
                    
                    #interactive-editor-overlay {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        background: transparent !important; overflow: visible !important;
                    }
                    #a4-sheets-container, #a4-sheets-container * { visibility: visible; }
                    #a4-sheets-container { position: absolute; left: 0; top: 0; width: 100%; }

                    .a4-sheet {
                        margin: 0 !important;
                        box-shadow: none !important;
                        page-break-after: always !important; /* Forza un nuovo foglio */
                        page-break-inside: avoid !important; /* Evita rotture a metà foglio */
                    }
                    @page { margin: 0; size: A4 portrait; }
                    body, html { margin: 0 !important; padding: 0 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `;
