// HTML della lettera di incarico + informativa privacy (usato dal Centro stampa)
export const buildLetterHtml = ({ patient, professional }) => {
    const val = (v) => v || '____________________';
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    professional = professional || {};
    patient = patient || {};
    return `
                    <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.4;">
                        
                        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #000; padding-bottom: 15px;">
                            <h1 style="font-size: 16pt; margin: 0; text-transform: uppercase;">Lettera di Incarico Professionale</h1>
                            <h2 style="font-size: 12pt; margin: 5px 0 0 0; font-weight: normal;">e Dichiarazione di Consenso Informato / Privacy</h2>
                        </div>

                        <div style="margin-bottom: 30px; font-size: 11pt;">
                            <p style="margin: 5px 0;">Il/La sottoscritto/a <strong>${val(patient.nome)} ${val(patient.cognome)}</strong></p>
                            <p style="margin: 5px 0;">
                                nato/a a <strong>${val(patient.luogoNascita)}</strong> 
                                il <strong>${val(patient.dataNascita)}</strong>
                            </p>
                            <p style="margin: 5px 0;">
                                C.F. <strong>${val(patient.cf)}</strong>
                            </p>
                            <p style="margin: 5px 0;">
                                residente in <strong>${val(patient.citta)}</strong> (${val(patient.cap)}) - <strong>${val(patient.indirizzo)}</strong>
                            </p>
                            <p style="margin: 5px 0;">
                                tel. <strong>${val(patient.cellulare)}</strong> 
                                e-mail <strong>${val(patient.email)}</strong>
                            </p>
                        </div>

                        <div style="font-size: 10pt; text-align: justify; margin-bottom: 20px;">
                            ${(professional.testo_incarico || '').replace(/\n/g, '<br>')}
                        </div>

                        <div style="border: 1px solid #000; padding: 10px; margin-bottom: 30px; font-size: 10pt; background: #fdfdfd;">
                            <p style="margin: 0 0 5px 0; font-weight: bold; text-decoration: underline;">SPECIFICHE CONTRATTUALI:</p>
                            <ul style="margin: 5px 0 0 20px; padding: 0;">
                                <li style="margin-bottom: 5px;">
                                    <strong>Compenso Pattuito:</strong> ${professional.lettera_compenso || 'Come concordato verbalmente'}
                                </li>
                                <li>
                                    <strong>Copertura Assicurativa Professionista:</strong><br>
                                    Polizza n. <strong>${professional.assicurazione_num || '___________'}</strong> 
                                    Compagnia: <strong>${professional.assicurazione_compagnia || '___________'}</strong>
                                </li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; page-break-inside: avoid;">
                            <div style="width: 45%;">
                                <p style="font-size: 10pt; margin-bottom: 40px;">Luogo e Data<br><strong>${professional.lettera_luogo || '________________'}, ${today}</strong></p>
                            </div>
                            <div style="width: 45%; text-align: center;">
                                <p style="font-size: 10pt; margin-bottom: 40px;">Firma Leggibile del Paziente</p>
                                <div style="border-bottom: 1px solid #000; width: 100%;"></div>
                            </div>
                        </div>

                        <div style="page-break-after: always;"></div>

                        <div style="text-align: center; margin-bottom: 30px; margin-top: 30px;">
                            <h1 style="font-size: 14pt; margin: 0; text-transform: uppercase;">Informativa e Consenso Privacy</h1>
                            <h2 style="font-size: 10pt; margin: 5px 0 0 0; font-weight: normal;">(Regolamento UE 679/2016)</h2>
                        </div>

                        <div style="font-size: 9pt; text-align: justify; margin-bottom: 20px;">
                            ${(professional.testo_privacy || '').replace(/\n/g, '<br>')}
                        </div>

                        <div style="border: 1px solid #000; padding: 10px; margin-bottom: 30px; font-size: 9pt; background: #fdfdfd;">
                            <p style="margin: 0 0 5px 0; font-weight: bold; text-decoration: underline;">SPECIFICHE TRATTAMENTO DATI:</p>
                            <ul style="margin: 5px 0 0 20px; padding: 0;">
                                <li style="margin-bottom: 5px;">
                                    <strong>Titolare del Trattamento:</strong><br> ${professional.privacy_titolare || 'Vedi intestazione'}
                                </li>
                                <li>
                                    <strong>Responsabile Esterno / Consulente Fiscale:</strong><br>
                                    ${professional.privacy_consulente || 'Studio Commerciale di fiducia del Titolare'}
                                </li>
                            </ul>
                        </div>

                        <div style="margin-bottom: 20px; font-size: 10pt;">
                            <p>Il sottoscritto, letta l'informativa che precede, <strong>PRESTA IL CONSENSO</strong> al trattamento dei propri dati personali e sensibili per le finalità ivi indicate.</p>
                        </div>

                        <div style="margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid;">
                            <div style="width: 45%;">
                                <p style="font-size: 10pt; margin-bottom: 40px;">Luogo e Data<br><strong>${professional.lettera_luogo || '________________'}, ${today}</strong></p>
                            </div>
                            <div style="width: 45%; text-align: center;">
                                <p style="font-size: 10pt; margin-bottom: 40px;">Firma per Consenso Privacy</p>
                                <div style="border-bottom: 1px solid #000; width: 100%;"></div>
                            </div>
                        </div>

                    </div>
                `;
};
