import React from 'react';
import { TextAreaGroup } from '../../ui/InputGroup';
import { daysSince, fmtDate, oggi } from './documentsLogic';

const STALE_DAYS = 180;

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
        </div>
    );
};
