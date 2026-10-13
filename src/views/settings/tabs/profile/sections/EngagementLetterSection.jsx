import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const EngagementLetterSection = ({ localUser, updateUser }) => {
    return (
        <Card title="7. Generatore Lettera & Privacy" icon="ph-file-signature">
            <div className="space-y-6">
                {/* SEZIONE A: VARIABILI DINAMICHE */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-black">A. Dati Variabili del Documento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup
                            label="Compenso (Testo per punto 7)"
                            placeholder="Es. euro 100,00 (cento/00)"
                            value={localUser.lettera_compenso}
                            name="lettera_compenso"
                            onChange={updateUser}
                        />
                        <InputGroup
                            label="Luogo Firma (Città)"
                            placeholder="Es. Roma"
                            value={localUser.lettera_luogo}
                            name="lettera_luogo"
                            onChange={updateUser}
                        />
                        <div className="col-span-full">
                            <InputGroup
                                label="Nominativo Consulente Fiscale (per Privacy pt. 4)"
                                placeholder="Es. Studio Commerciale Dott. Bianchi (Responsabile Esterno)"
                                value={localUser.privacy_consulente}
                                name="privacy_consulente"
                                onChange={updateUser}
                            />
                            <p className="text-[9px] text-gray-400 mt-1">
                                Verrà inserito nella frase: "...comunicati al professionista esterno [NOME] che cura la contabilità..."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                {/* SEZIONE B: CORPO DEL CONTRATTO */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">B. Testo "Lettera di Incarico" (Punti 1-8)</label>
                        <button
                            onClick={() =>
                                updateUser(
                                    'testo_incarico',
                                    `Con la sottoscrizione della presente scrittura, il/la Paziente DICHIARA:

1. CONFERIMENTO INCARICO: Di voler affidare al Professionista l’incarico professionale per la valutazione del mio stato nutrizionale, del mio fabbisogno nutritivo ed energetico (ai sensi delle normative vigenti) e l’elaborazione di un profilo nutrizionale personalizzato. L'incarico decorre dalla firma del presente documento.

2. CONSAPEVOLEZZA E LIMITI (OBBLIGAZIONE DI MEZZI):
a) Di aver compreso che il piano nutrizionale non è una terapia medica e non sostituisce eventuali cure farmacologiche in atto.
b) Di essere consapevole che il Professionista potrà consigliare l'uso di integratori alimentari, specificandone utilità e limiti, che non hanno finalità curativa.
c) Di aver compreso che il risultato dipende dalla risposta biologica individuale e dalla rigorosa adesione al piano. Pertanto, trattandosi di un'obbligazione di mezzi e non di risultato, il Professionista non può garantire a priori il raggiungimento di specifici obiettivi (es. calo ponderale esatto) in tempi prefissati.
d) Di essere consapevole che il mancato rispetto delle indicazioni o dei controlli periodici può compromettere il risultato finale.

3. ANAMNESI E VERIDICITÀ:
a) Di aver riferito correttamente e senza omissioni la propria anamnesi, incluse patologie pregresse o attuali, interventi chirurgici, allergie/intolleranze e terapie farmacologiche in corso.
b) Di impegnarsi a comunicare tempestivamente al Professionista qualsiasi variazione dello stato di salute o l'inizio di nuove terapie mediche durante il percorso.

4. ESONERO RESPONSABILITÀ:
Esonera il Professionista da ogni responsabilità civile o penale derivante da omesse dichiarazioni sul proprio stato di salute, falsità nelle dichiarazioni o dalla mancata comunicazione di variazioni cliniche intervenute successivamente alla data odierna.

5. COLLABORAZIONE MEDICA:
Dichiara di essere stato informato della necessità di sottoporre il piano nutrizionale alla visione del proprio Medico Curante, unico titolato a valutarne la compatibilità con eventuali patologie in atto.

6. CONTROINDICAZIONI SPECIFICHE:
Dichiara di essere stato informato che regimi specifici (es. Chetogenica/VLCKD) hanno controindicazioni assolute in caso di: gravidanza/allattamento, insufficienza renale o epatica, diabete tipo I, infarto recente, disturbi psichiatrici. Dichiara di non rientrare in tali condizioni o di averlo comunicato.

7. COMPENSO E DISDETTA:
Accetta che il compenso per la prestazione è quello pattuito e indicato nel presente modulo. È consapevole che la disdetta degli appuntamenti deve avvenire con un preavviso di almeno 24 ore; in caso contrario potrà essere richiesto il pagamento della seduta.

8. COPERTURA ASSICURATIVA:
Prende atto che il Professionista è regolarmente assicurato per la responsabilità civile professionale (RC Professionale) con la polizza indicata negli appositi spazi di questo documento.`
                                )
                            }
                            className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                        >
                            <i className="ph-fill ph-magic-wand"></i> Carica Template Standard
                        </button>
                    </div>
                    <textarea
                        rows={10}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono leading-relaxed focus:border-black outline-none resize-y text-justify"
                        value={localUser.testo_incarico || ''}
                        name="testo_incarico"
                        onChange={(e) => updateUser('testo_incarico', e.target.value)}
                    ></textarea>
                </div>

                {/* SEZIONE C: PRIVACY */}
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">C. Testo "Informativa Privacy" (GDPR)</label>
                        <button
                            onClick={() =>
                                updateUser(
                                    'testo_privacy',
                                    `Gentile Signore/a, ai sensi dell’art. 13 del Regolamento UE 679/2016 (GDPR), in relazione ai dati personali e sensibili (particolari) che La riguardano, La informiamo di quanto segue:

1. FINALITÀ DEL TRATTAMENTO
I dati forniti, inclusi quelli idonei a rivelare lo stato di salute (dati sensibili/particolari), verranno trattati secondo i principi di liceità e correttezza esclusivamente per:
a) Finalità di diagnosi nutrizionale, elaborazione di piani alimentari e consulenza professionale;
b) Adempimenti fiscali, amministrativi e contabili obbligatori per legge.

2. MODALITÀ DI TRATTAMENTO
Il trattamento sarà effettuato sia manualmente (archivi cartacei) che avvalendosi di strumenti elettronici e software gestionali, adottando misure di sicurezza idonee a garantire la riservatezza e ad evitare l'accesso indebito a soggetti non autorizzati.

3. NATURA DEL CONFERIMENTO
Il conferimento dei dati è obbligatorio per l'espletamento dell'incarico professionale. L'eventuale rifiuto a fornire tali dati comporta l’impossibilità di erogare la prestazione sanitaria richiesta.

4. COMUNICAZIONE E DIFFUSIONE
I Suoi dati NON saranno oggetto di diffusione indiscriminata. Potranno essere comunicati esclusivamente a:
a) Soggetti autorizzati interni allo studio;
b) Al professionista esterno (Commercialista/Consulente del Lavoro) indicato in questo modulo che, in qualità di Responsabile del Trattamento o Titolare autonomo, cura la contabilità dello Studio per i soli adempimenti fiscali necessari;
c) Autorità competenti, qualora obbligatorio per legge.

5. INVIO DOCUMENTAZIONE
Le fatture, i report e i piani nutrizionali potranno essere inviati tramite strumenti elettronici (e-mail, messaggistica istantanea) all'indirizzo da Lei fornito, consapevole dei rischi connessi a tali mezzi di trasmissione.

6. CONSERVAZIONE
I dati verranno conservati per il tempo strettamente necessario al raggiungimento delle finalità di cui al punto 1 e, successivamente, per il tempo stabilito dalle vigenti normative fiscali e sanitarie (solitamente 10 anni).

7. DIRITTI DELL'INTERESSATO
In ogni momento potrà esercitare i Suoi diritti nei confronti del Titolare del trattamento ai sensi degli artt. 15-22 del Regolamento UE 679/2016, ovvero: diritto di accesso, rettifica, cancellazione (diritto all'oblio), limitazione, portabilità dei dati e opposizione al trattamento. Potrà inoltre proporre reclamo all’Autorità Garante per la Protezione dei dati personali.

8. TITOLARE DEL TRATTAMENTO
Il Titolare del trattamento è il Professionista identificato nell'intestazione e nella calce del presente documento.

9. CONSENSO
Il sottoscritto, letta la presente informativa, presta il consenso al trattamento dei propri dati personali e sensibili per le finalità sanitarie e amministrative sopra indicate.`
                                )
                            }
                            className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-100"
                        >
                            <i className="ph-fill ph-shield-check"></i> Carica Template GDPR
                        </button>
                    </div>
                    <textarea
                        rows={10}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono leading-relaxed focus:border-black outline-none resize-y text-justify"
                        value={localUser.testo_privacy || ''}
                        name="testo_privacy"
                        onChange={(e) => updateUser('testo_privacy', e.target.value)}
                    ></textarea>
                </div>

                {/* Dati Titolare (Punto 6 Privacy) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                        <InputGroup
                            label="Estremi Titolare del Trattamento (Nominativo e Indirizzo Studio)"
                            placeholder="Es. Dott. Mario Rossi, con studio in Via Roma 1, Milano"
                            value={localUser.privacy_titolare}
                            name="privacy_titolare"
                            onChange={updateUser}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
