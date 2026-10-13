// CSS di stampa A4 del fascicolo nutrizionale
export const printCss = `
                body { overflow: hidden; }

                /* Anteprima su schermo stretto: i fogli A4 si rimpiccioliscono in proporzione (solo a video, la stampa resta a misura reale) */
                @media screen and (max-width: 900px) { #editor-toolbar { flex-wrap: wrap; gap: 8px; padding: 10px 12px !important; } #a4-sheets-container { padding-bottom: 24px; } }
                @media screen and (max-width: 860px) { #a4-sheets-container { zoom: 0.96; } }
                @media screen and (max-width: 820px) { #a4-sheets-container { zoom: 0.92; } }
                @media screen and (max-width: 780px) { #a4-sheets-container { zoom: 0.88; } }
                @media screen and (max-width: 740px) { #a4-sheets-container { zoom: 0.83; } }
                @media screen and (max-width: 700px) { #a4-sheets-container { zoom: 0.78; } }
                @media screen and (max-width: 650px) { #a4-sheets-container { zoom: 0.72; } }
                @media screen and (max-width: 600px) { #a4-sheets-container { zoom: 0.67; } }
                @media screen and (max-width: 550px) { #a4-sheets-container { zoom: 0.61; } }
                @media screen and (max-width: 500px) { #a4-sheets-container { zoom: 0.56; } }
                @media screen and (max-width: 450px) { #a4-sheets-container { zoom: 0.5; } }
                @media screen and (max-width: 410px) { #a4-sheets-container { zoom: 0.46; } }
                @media screen and (max-width: 380px) { #a4-sheets-container { zoom: 0.43; } }
                @media screen and (max-width: 350px) { #a4-sheets-container { zoom: 0.39; } }

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
