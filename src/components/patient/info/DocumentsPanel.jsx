import React, { useState } from 'react';
import { ReportStudio } from '../../reports/studio/ReportStudio';
import { DOCS, STATI, docOf, docsSummary, fmtDate, missingForLetter, oggi } from './documentsLogic';

const TONE = { da_consegnare: 'var(--warn)', consegnato: 'var(--accent)', firmato: 'var(--ok)' };

// Contrattualistica: genera la lettera e tiene traccia di cosa e' stato consegnato e firmato
export const DocumentsPanel = ({ patient, professionalData, updatePatientInfo }) => {
    const [showLettera, setShowLettera] = useState(false);
    const { firmati, totale, completo } = docsSummary(patient);
    const missing = missingForLetter(patient);

    const save = (id, next) => updatePatientInfo('documenti', { ...(patient.documenti || {}), [id]: next });

    const setStato = (id, stato) => {
        const cur = docOf(patient, id);
        const next = { ...cur, stato };
        if (stato === 'da_consegnare') {
            delete next.dataConsegna;
            delete next.dataFirma;
        } else if (stato === 'consegnato') {
            next.dataConsegna = cur.dataConsegna || oggi();
            delete next.dataFirma;
        } else {
            next.dataConsegna = cur.dataConsegna || oggi();
            next.dataFirma = cur.dataFirma || oggi();
        }
        save(id, next);
    };

    const setDate = (id, field, v) => save(id, { ...docOf(patient, id), [field]: v });

    // stampando la lettera i documenti ancora "da consegnare" passano a "consegnato"
    const onPrinted = () => {
        const all = { ...(patient.documenti || {}) };
        DOCS.forEach((d) => {
            if (docOf(patient, d.id).stato === 'da_consegnare') all[d.id] = { stato: 'consegnato', dataConsegna: oggi() };
        });
        updatePatientInfo('documenti', all);
    };

    const markAllSigned = () => {
        const all = { ...(patient.documenti || {}) };
        DOCS.forEach((d) => {
            const cur = docOf(patient, d.id);
            all[d.id] = { ...cur, stato: 'firmato', dataConsegna: cur.dataConsegna || oggi(), dataFirma: cur.dataFirma || oggi() };
        });
        updatePatientInfo('documenti', all);
    };

    return (
        <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <i className="ph ph-file-signature text-[17px] text-[color:var(--muted)]"></i>
                    <h4 className="font-semibold text-[15px] text-[color:var(--ink)]">Contrattualistica</h4>
                    <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: completo ? 'rgba(31,138,91,.12)' : 'rgba(183,121,31,.12)', color: completo ? 'var(--ok)' : 'var(--warn)' }}
                    >
                        {completo ? 'Tutto firmato' : `${firmati}/${totale} firmati`}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!completo && (
                        <button onClick={markAllSigned} className="vw-chip !h-9 text-[13px]">
                            <i className="ph ph-check-circle"></i> Segna tutto firmato
                        </button>
                    )}
                    <button
                        onClick={() => setShowLettera(true)}
                        className="vw-chip !h-9 text-[13px]"
                        style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}
                    >
                        <i className="ph ph-printer"></i> Genera e stampa
                    </button>
                </div>
            </div>

            {missing.length > 0 && (
                <p className="text-[12.5px] mb-3 flex items-start gap-1.5" style={{ color: 'var(--warn)' }}>
                    <i className="ph ph-warning mt-0.5"></i>
                    <span>Nella lettera resteranno righe vuote: mancano {missing.join(', ')}.</span>
                </p>
            )}

            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {DOCS.map((d) => {
                    const doc = docOf(patient, d.id);
                    return (
                        <div key={d.id} className="py-3 flex flex-col lg:flex-row lg:items-center gap-3 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3 min-w-0 lg:w-[38%]">
                                <span className="w-2 h-2 rounded-full flex-none" style={{ background: TONE[doc.stato] }}></span>
                                <div className="min-w-0">
                                    <div className="text-[14px] font-semibold text-[color:var(--ink)] truncate">{d.label}</div>
                                    <div className="text-[12px] text-[color:var(--muted)] truncate">
                                        {doc.stato === 'firmato' && `Firmato il ${fmtDate(doc.dataFirma)}`}
                                        {doc.stato === 'consegnato' && `Consegnato il ${fmtDate(doc.dataConsegna)}, in attesa di firma`}
                                        {doc.stato === 'da_consegnare' && d.hint}
                                    </div>
                                </div>
                            </div>
                            <div className="seg flex-none self-start lg:self-auto">
                                {STATI.map((s) => (
                                    <button key={s.id} className={doc.stato === s.id ? 'on' : ''} style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setStato(d.id, s.id)}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                            {doc.stato !== 'da_consegnare' && (
                                <div className="flex items-center gap-2 text-[12px] text-[color:var(--muted)] lg:ml-auto">
                                    <label className="flex items-center gap-1.5">
                                        consegna
                                        <input type="date" className="fld !py-1.5 !px-2 !w-auto text-[12px]" value={doc.dataConsegna || ''} onChange={(e) => setDate(d.id, 'dataConsegna', e.target.value)} />
                                    </label>
                                    {doc.stato === 'firmato' && (
                                        <label className="flex items-center gap-1.5">
                                            firma
                                            <input type="date" className="fld !py-1.5 !px-2 !w-auto text-[12px]" value={doc.dataFirma || ''} onChange={(e) => setDate(d.id, 'dataFirma', e.target.value)} />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showLettera && <ReportStudio initial={['lettera']} patient={patient} db={{ utente: professionalData || {} }} onPrint={onPrinted} onClose={() => setShowLettera(false)} />}
        </div>
    );
};
