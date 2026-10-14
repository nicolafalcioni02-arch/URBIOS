import React from 'react';
import { InputGroup, TextAreaGroup } from '../../ui/InputGroup';
import { daysSince, fmtDate, oggi } from './documentsLogic';

const STALE_DAYS = 180;

const SI_NO = ['', 'No', 'Sì'];

// Salute femminile: compare solo per le pazienti. I campi stanno sulla scheda del paziente (prefisso f_).
const WomenHealth = ({ patient, updatePatientInfo }) => {
    const f = (k) => patient[k];
    const u = updatePatientInfo;
    const incinta = ['Sì', 'Cerco una gravidanza'].includes(f('f_gravidanza_attuale'));
    return (
        <div className="mt-5 pt-5 border-t border-[color:var(--line)]">
            <div className="flex items-center gap-2.5 mb-4">
                <i className="ph ph-flower-lotus text-[17px] text-[color:var(--muted)]"></i>
                <h4 className="font-semibold text-[15px] text-[color:var(--ink)]">Salute femminile</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputGroup label="Menarca (età)" type="number" unit="anni" name="f_menarca" value={f('f_menarca')} onChange={u} />
                <InputGroup label="Stato del ciclo" options={['', 'Regolare', 'Irregolare', 'Oligomenorrea', 'Amenorrea', 'Menopausa', 'Perimenopausa']} name="f_stato_ciclo" value={f('f_stato_ciclo')} onChange={u} />
                <InputGroup label="Durata del ciclo" type="number" unit="giorni" name="f_ciclo_durata" value={f('f_ciclo_durata')} onChange={u} />
                <InputGroup label="Ultima mestruazione" type="date" name="f_ultima_mestruazione" value={f('f_ultima_mestruazione')} onChange={u} />
                <InputGroup label="Flusso" options={['', 'Scarso', 'Normale', 'Abbondante']} name="f_flusso" value={f('f_flusso')} onChange={u} />
                <InputGroup label="Dismenorrea (dolore)" options={['', 'No', 'Lieve', 'Moderata', 'Severa']} name="f_dismenorrea" value={f('f_dismenorrea')} onChange={u} />
                <InputGroup label="Sindrome premestruale" options={SI_NO} name="f_spm" value={f('f_spm')} onChange={u} />
                <InputGroup label="Menopausa (età)" type="number" unit="anni" name="f_menopausa_eta" value={f('f_menopausa_eta')} onChange={u} />
                <InputGroup label="Gravidanze / parti" placeholder="es. G2 P1" name="f_gravidanze" value={f('f_gravidanze')} onChange={u} />
                <InputGroup label="Gravidanza attuale" options={['', 'No', 'Sì', 'Cerco una gravidanza']} name="f_gravidanza_attuale" value={f('f_gravidanza_attuale')} onChange={u} />
                {incinta && <InputGroup label="Settimana gestazionale" type="number" unit="sett." name="f_settimana_gestazionale" value={f('f_settimana_gestazionale')} onChange={u} />}
                <InputGroup label="Allattamento" options={['', 'No', 'Sì, esclusivo', 'Sì, misto']} name="f_allattamento" value={f('f_allattamento')} onChange={u} />
                <InputGroup label="Contraccezione" options={['', 'Nessuna', 'Pillola estroprogestinica', 'Pillola solo progestinica', 'Spirale ormonale', 'Spirale in rame', 'Anello / cerotto', 'Impianto sottocutaneo', 'Metodi di barriera']} name="f_contraccettivo" value={f('f_contraccettivo')} onChange={u} />
                <InputGroup label="Terapia ormonale sostitutiva" options={SI_NO} name="f_tos" value={f('f_tos')} onChange={u} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <TextAreaGroup label="Amenorrea / irregolarità" placeholder="Da quando, durata, possibili cause (peso, sport, stress, disturbi alimentari)..." rows={2} name="f_amenorrea_note" value={f('f_amenorrea_note')} onChange={u} />
                <TextAreaGroup label="Patologie ginecologiche" placeholder="PCOS, endometriosi, fibromi, ovaio policistico, isterectomia..." rows={2} name="f_patologie_gin" value={f('f_patologie_gin')} onChange={u} />
                <TextAreaGroup label="Ormoni e tiroide" placeholder="Estradiolo, progesterone, FSH/LH, prolattina, TSH, androgeni, insulino-resistenza..." rows={2} name="f_ormoni" value={f('f_ormoni')} onChange={u} />
                <TextAreaGroup label="Gravidanze passate e post-partum" placeholder="Diabete gestazionale, preeclampsia, aumento di peso, parto cesareo, aborti..." rows={2} name="f_gravidanze_note" value={f('f_gravidanze_note')} onChange={u} />
                <TextAreaGroup label="Sintomi correlati al ciclo" placeholder="Fame nervosa, gonfiore, ritenzione, sbalzi d'umore, mal di testa, stanchezza, caduta capelli, acne..." rows={2} name="f_sintomi" value={f('f_sintomi')} onChange={u} />
                <TextAreaGroup label="Controlli e screening" placeholder="Ultimo Pap test, ecografia, mammografia, densitometria ossea (MOC)..." rows={2} name="f_controlli" value={f('f_controlli')} onChange={u} />
            </div>
        </div>
    );
};

// Anamnesi clinica: la parte che cambia nel tempo. Tiene la data dell'ultima revisione.
export const ClinicalAnamnesis = ({ patient, updatePatientInfo }) => {
    const days = daysSince(patient.anamnesi_verificata);
    const stale = days === null || days > STALE_DAYS;
    const filled = ['anamnesi_familiare', 'patologie', 'farmaci', 'allergie'].filter((k) => String(patient[k] || '').trim()).length;

    let status;
    if (days === null) status = filled ? 'Mai confermata' : 'Da compilare';
    else if (days === 0) status = 'Confermata oggi';
    else status = `Rivista il ${fmtDate(patient.anamnesi_verificata)}${days > STALE_DAYS ? ` (${Math.round(days / 30)} mesi fa)` : ''}`;

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <i className="ph ph-heartbeat text-[17px] text-[color:var(--muted)]"></i>
                    <h4 className="font-semibold text-[15px] text-[color:var(--ink)]">Anamnesi clinica</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: stale && filled ? 'var(--warn)' : 'var(--muted)' }}>
                        {status}
                    </span>
                    {days !== 0 && (
                        <button onClick={() => updatePatientInfo('anamnesi_verificata', oggi())} className="vw-chip !h-8 text-[12.5px]">
                            <i className="ph ph-check"></i> Confermata invariata
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextAreaGroup label="Patologie e interventi" placeholder="Patologie diagnosticate, interventi..." name="patologie" value={patient.patologie} onChange={updatePatientInfo} />
                <TextAreaGroup label="Terapie farmacologiche" placeholder="Farmaci assunti regolarmente..." name="farmaci" value={patient.farmaci} onChange={updatePatientInfo} />
                <TextAreaGroup label="Allergie e intolleranze" placeholder="Nichel, glutine, lattosio..." name="allergie" value={patient.allergie} onChange={updatePatientInfo} />
                <TextAreaGroup label="Anamnesi familiare" placeholder="Diabete, ipertensione, obesità in famiglia..." name="anamnesi_familiare" value={patient.anamnesi_familiare} onChange={updatePatientInfo} />
            </div>
            <div className="mt-4">
                <TextAreaGroup label="Obiettivo del paziente" placeholder="Perdita peso, performance, ricomposizione..." rows={2} name="obiettivo" value={patient.obiettivo} onChange={updatePatientInfo} />
            </div>
            {patient.sesso === 'F' && <WomenHealth patient={patient} updatePatientInfo={updatePatientInfo} />}
        </div>
    );
};
