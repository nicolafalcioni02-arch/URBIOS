import { createReportHelpers } from './builders/createReportHelpers';
import { buildPanelsHtml } from './builders/buildPanelsHtml';

export const getInitialContent = ({ patient, professionalData, visitDraft }) => {
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const prof = professionalData || {};
    const d = visitDraft;

    const { val, txt, bi, vr, renderPanel } = createReportHelpers({ d, patient });

    const { allPanelsHTML } = buildPanelsHtml({ bi, d, renderPanel, val, vr });

    // --- 3. ESTRAZIONE DATI COMPOSIZIONE CORPOREA ---
    const rA = d.risultati_metodo_A || {};
    const rB = d.risultati_metodo_B || {};

    const fm_p = rA.fm_percent || '-';
    const fm_kg = rA.fm_kg || '-';
    const ffm_kg = rA.ffm_kg || '-';

    const peso = parseFloat(d.peso) || 0;
    const altezza = parseFloat(d.altezza) || 0;
    const bmi = peso && altezza ? (peso / ((altezza / 100) * (altezza / 100))).toFixed(1) : '-';
    const pha = d.biva_rz && d.biva_xc ? (Math.atan2(parseFloat(d.biva_xc), parseFloat(d.biva_rz)) * (180 / Math.PI)).toFixed(1) : '-';

    // --- 4. RITORNO HTML COMPLETO (PULITO) ---
    return `
            
            
            <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; line-height: 1.5;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 20px; border-bottom: 1px solid #000; margin-bottom: 40px;">
                    <div style="width: 60%;">
                        ${prof.logo_url ? `<img src="${prof.logo_url}" style="height: 45px; margin-bottom: 15px; display: block; filter: grayscale(100%);" />` : ''}
                        <div style="font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1;">
                            ${prof.nome || 'Dottore'} ${prof.cognome || ''}
                        </div>
                        <div style="font-size: 9pt; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; color: #666;">
                            ${prof.titolo_professionale || 'Biologo Nutrizionista'}
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 8pt; color: #444; line-height: 1.6;">
                        <div>${prof.indirizzo_studio || ''}</div>
                        <div>${prof.citta_studio || ''}</div>
                        <div>${prof.ordine_appartenenza || ''} n. ${prof.numero_albo || ''}</div>
                        <div>P.IVA ${prof.p_iva || ''}</div>
                    </div>
                </div>

                <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 40px;">
                    <div>
                        <h1 style="font-family: 'Playfair Display', serif; font-size: 28pt; margin: 0; font-weight: 400; font-style: italic;">
                            Report Visita
                        </h1>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #999;">Data Rilevazione</div>
                        <div style="font-size: 11pt; font-weight: 600;">${today}</div>
                    </div>
                </div>

                <div style="margin-bottom: 40px;">
                    <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">
                        Profilo Paziente
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 40px;">
                        <div style="flex: 1; min-width: 200px;">
                            <div style="font-size: 14pt; font-family: 'Playfair Display', serif; font-weight: 700; margin-bottom: 5px;">
                                ${patient.nome} ${patient.cognome}
                            </div>
                            <div style="font-size: 9pt; color: #555;">
                                Nato/a il ${patient.dataNascita || '-'} (${patient.sesso || '-'})<br>
                                CF: ${patient.cf || '-'}
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 7pt; text-transform: uppercase; color: #999; margin-bottom: 2px;">Contatti</div>
                            <div style="font-size: 9pt;">${patient.cellulare || '-'}</div>
                            <div style="font-size: 9pt;">${patient.email || '-'}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 7pt; text-transform: uppercase; color: #999; margin-bottom: 2px;">Professione</div>
                            <div style="font-size: 9pt;">${patient.professione || '-'}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 7pt; text-transform: uppercase; color: #999; margin-bottom: 2px;">Residenza</div>
                            <div style="font-size: 9pt;">${patient.citta || '-'}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 40px; background-color: #ffffff; border: 0; padding: 0;">
                    <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000; margin-bottom: 15px;">
                        Anamnesi & Obiettivi
                    </div>

                    <div style="font-size: 9pt; padding: 6px 0; color: #000;">
                        <span style="font-weight: 700;">Obiettivo:</span>
                        <span style="margin-left: 10px; font-weight: 500;">${txt(patient.obiettivo)}</span>
                    </div>
                    <div style="font-size: 9pt; padding: 6px 0; color: #000; border-top: 1px solid #f0f0f0;">
                        <span style="font-weight: 700;">Patologie:</span>
                        <span style="margin-left: 10px;">${txt(patient.patologie)}</span>
                    </div>
                    <div style="font-size: 9pt; padding: 6px 0; color: #000; border-top: 1px solid #f0f0f0;">
                        <span style="font-weight: 700;">Farmaci:</span>
                        <span style="margin-left: 10px;">${txt(patient.farmaci)}</span>
                    </div>
                    <div style="font-size: 9pt; padding: 6px 0; color: #000; border-top: 1px solid #f0f0f0;">
                        <span style="font-weight: 700;">Allergie:</span>
                        <span style="margin-left: 10px;">${txt(patient.allergie)}</span>
                    </div>
                </div>

                <div style="margin-bottom: 50px;">
                    <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 20px;">
                        Parametri Chiave
                    </div>
                    <div style="display: flex; justify-content: space-between; text-align: left;">
                        <div style="padding-right: 30px; border-right: 1px solid #eee;">
                            <div style="font-size: 32pt; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1;">${val(d.peso)}</div>
                            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; color: #666;">Peso (kg)</div>
                        </div>
                        <div style="padding-right: 30px; border-right: 1px solid #eee;">
                            <div style="font-size: 32pt; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1;">${bmi}</div>
                            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; color: #666;">BMI (kg/m²)</div>
                        </div>
                        <div style="padding-right: 30px; border-right: 1px solid #eee;">
                            <div style="font-size: 32pt; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1;">${val(fm_p)}<span style="font-size:16pt; font-family:'Inter'; font-weight:400">%</span></div>
                            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; color: #666;">Massa Grassa</div>
                        </div>
                        <div>
                            <div style="font-size: 32pt; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1;">${pha}<span style="font-size:16pt; font-family:'Inter'; font-weight:400">°</span></div>
                            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; color: #666;">Angolo di Fase</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 40px; page-break-inside: avoid;">
                    <div style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 20px; color: #000;">
                        Scheda Tecnica Completa
                    </div>

                    

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; align-items: start;">
        ${allPanelsHTML}
    </div>
    
    ${
        d.Note_Metabolismo_Cardio || d.Note_Benessere_Psico_Fisico || d.Note_Funzioni_Organiche || d.Note_Rilevanti
            ? `
    <div style="margin-top: 30px; background-color: #fcfcfc; border: 1px dashed #ccc; padding: 15px; border-radius: 6px;">
        <div style="font-size: 8pt; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 8px;">Note Specifiche</div>
        <div style="font-size: 8pt; color: #444; line-height: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            ${d.Note_Metabolismo_Cardio ? `<div><strong>Cardio:</strong> ${d.Note_Metabolismo_Cardio}</div>` : ''}
            ${d.Note_Benessere_Psico_Fisico ? `<div><strong>Benessere:</strong> ${d.Note_Benessere_Psico_Fisico}</div>` : ''}
            ${d.Note_Funzioni_Organiche ? `<div><strong>Funzioni:</strong> ${d.Note_Funzioni_Organiche}</div>` : ''}
            ${d.Note_Rilevanti ? `<div><strong>Generali:</strong> ${d.Note_Rilevanti}</div>` : ''}
        </div>
    </div>
    `
            : ''
    }
</div>
                    
                

                <div style="margin-bottom: 60px;">
                    <div style="font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 20px;">
                        Conclusioni & Note Professionali
                    </div>
                    <div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; text-align: justify; min-height: 150px;">
                        ${txt(visitDraft.valutazione_report)}
                    </div>
                </div>

                <div style="margin-top: 80px; page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        <div style="font-size: 6pt; color: #888; text-align: left; width: 60%; line-height: 1.3;">
                            <strong>DISCLAIMER:</strong> ${prof.disclaimer_report || 'Il presente documento riporta misurazioni e valutazioni dello stato nutrizionale. Non costituisce diagnosi medica né sostituisce il parere del medico curante.'}
                            <br>
                            ${prof.footer || ''}
                        </div>
                        <div style="text-align: right; width: 35%;">
                            <div style="height: 40px;"></div> 
                            <div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
                            <div style="font-size: 7pt; text-transform: uppercase; font-weight: bold;">Firma del Professionista</div>
                        </div>
                    </div>
                    <div style="text-align: center; padding-top: 10px; color: #ccc;">
                        <div style="font-size: 7pt; font-weight: 600; letter-spacing: 1px; color: #aaa;">© URBIOS SOFTWARE</div>
                        <div style="font-size: 6pt;">All rights reserved • Confidential Document</div>
                    </div>
                </div>
            </div>
        `;
};
