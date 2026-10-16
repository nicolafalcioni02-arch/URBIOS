import React, { useState } from 'react';
import { usePrintCenter } from '../../reports/printCenter/PrintCenterProvider';
import { DOCS, STATI, docOf, docsSummary, fmtDate, missingForLetter, oggi } from './documentsLogic';

const TONE = { da_consegnare: 'var(--warn)', consegnato: 'var(--accent)', firmato: 'var(--ok)' };

// Contrattualistica: genera la lettera e tiene traccia di cosa e' stato consegnato e firmato
export const DocumentsPanel = ({ patient, professionalData, updatePatientInfo }) => {
    const printCenter = usePrintCenter();
    const [editing, setEditing] = useState({}); // documenti di cui si stanno modificando le date
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

    // stampando la lettera (dal Centro stampa) i documenti ancora "da consegnare" passano a "consegnato"

    const markAllSigned = () => {
        const all = { ...(patient.documenti || {}) };
        DOCS.forEach((d) => {
            const cur = docOf(patient, d.id);
            all[d.id] = { ...cur, stato: 'firmato', dataConsegna: cur.dataConsegna || oggi(), dataFirma: cur.dataFirma || oggi() };
        });
        updatePatientInfo('documenti', all);
    };

    return (
        <section className="panel an-docs">
            <div className="an-docs-head">
                <h4 className="vd-h">
                    <span className="vd-h-ico">
                        <i className="ph ph-file-text"></i>
                    </span>
                    Documenti
                    <span className="vd-h-count" style={{ color: completo ? 'var(--ok)' : 'var(--warn)', fontWeight: 600 }}>
                        {firmati}/{totale}
                    </span>
                </h4>
                <div className="an-actions">
                    <button onClick={() => printCenter && printCenter.open(['lettera'])} className="vd-btn is-primary is-sm">
                        <i className="ph ph-printer"></i> Genera e stampa
                    </button>
                    {!completo && (
                        <button onClick={markAllSigned} className="vd-btn is-sm" title="Segna tutto firmato">
                            <i className="ph ph-checks"></i> Tutti firmati
                        </button>
                    )}
                </div>
            </div>

            {missing.length > 0 && (
                <p className="an-warn is-line" title="Nella lettera resteranno righe vuote">
                    <i className="ph ph-warning"></i>
                    <span>Alla lettera mancano: {missing.join(', ')}.</span>
                </p>
            )}

            <div className="an-docs-list">
                {DOCS.map((d) => {
                    const doc = docOf(patient, d.id);
                    const dates = doc.stato !== 'da_consegnare';
                    return (
                        <div key={d.id} className="an-doc" style={{ '--tone': TONE[doc.stato] }}>
                            <div className="an-doc-top">
                                <span className="an-doc-dot"></span>
                                <p className="an-doc-title">{d.label}</p>
                                {dates && (
                                    <button className="an-doc-date" onClick={() => setEditing((e) => ({ ...e, [d.id]: !e[d.id] }))} aria-expanded={!!editing[d.id]}>
                                        {doc.stato === 'firmato' ? `Firmato ${fmtDate(doc.dataFirma)}` : `Consegnato ${fmtDate(doc.dataConsegna)}`}
                                        <i className="ph ph-pencil-simple-line"></i>
                                    </button>
                                )}
                            </div>

                            <div className="an-seg" role="group" aria-label={d.label}>
                                {STATI.map((x) => (
                                    <button key={x.id} className={doc.stato === x.id ? 'on' : ''} aria-pressed={doc.stato === x.id} onClick={() => setStato(d.id, x.id)}>
                                        {x.label}
                                    </button>
                                ))}
                            </div>

                            {dates && editing[d.id] && (
                                <div className="an-dates">
                                    <label>
                                        <span>Consegna</span>
                                        <input type="date" className="fld" value={doc.dataConsegna || ''} onChange={(e) => setDate(d.id, 'dataConsegna', e.target.value)} />
                                    </label>
                                    {doc.stato === 'firmato' && (
                                        <label>
                                            <span>Firma</span>
                                            <input type="date" className="fld" value={doc.dataFirma || ''} onChange={(e) => setDate(d.id, 'dataFirma', e.target.value)} />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
