import React, { useState } from 'react';
import { STATUSES, fmtLong, statusById } from '../../shared/planCommon';
import { getSchede } from '../logic/trainingModel';
import { schedaSummary, schedaTitle } from './trainingGuidedLogic';

// La scheda in uso: nome, data, stato; le altre schede del paziente (più schede: mesocicli, fasi…); nuova, copia, elimina.

export const PlanPanel = ({ patient, schedaId, header, setHeader, weeks, onOpen, onNew, onDuplicate, onDelete, onClose }) => {
    const [confirmDel, setConfirmDel] = useState(false);
    const [name, setName] = useState(header.titolo || '');
    const st = statusById(header.stato);
    const others = getSchede(patient).filter((s) => s.id !== schedaId);

    return (
        <div className="dg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-clipboard-text text-lg"></i>
                    </div>
                    <h2 className="flex-1 text-[18px] font-semibold leading-tight">Scheda: nome, data e stato</h2>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    <section className="dg-card !mt-0">
                        <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)]">Scheda in uso</p>
                        <p className="text-[13px] text-[color:var(--muted)] mt-1">{schedaSummary({ weeks })}</p>

                        <label className="fld-label mt-4">Nome della scheda</label>
                        <input
                            className="fld"
                            placeholder="Es. Mesociclo 1, Ipertrofia estate…"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={(e) => e.target.value !== header.titolo && setHeader({ ...header, titolo: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        />

                        <label className="fld-label mt-4">Data della scheda</label>
                        <input type="date" className="fld !w-auto" value={header.data || ''} onChange={(e) => setHeader({ ...header, data: e.target.value })} />
                        <p className="dg-hint">È la data che compare sulla scheda stampata.</p>

                        <label className="fld-label mt-4">Stato</label>
                        <div className="flex gap-1.5 flex-wrap">
                            {STATUSES.filter((x) => x.id !== 'active' || st.id === 'active').map((x) => (
                                <button key={x.id} className="dg-mini" style={st.id === x.id ? { background: x.color, color: '#fff', borderColor: x.color } : undefined} onClick={() => setHeader({ ...header, stato: x.id })}>
                                    <i className={`ph ${x.icon}`}></i> {x.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 flex-wrap mt-5">
                            <button className="dg-chip row" onClick={() => { onDuplicate(schedaId); onClose(); }}>
                                <i className="ph ph-copy"></i> Duplica la scheda
                            </button>
                            {confirmDel ? (
                                <>
                                    <button className="dg-chip row" style={{ color: '#C2413A' }} onClick={() => { onDelete(schedaId); onClose(); }}>
                                        Sì, elimina
                                    </button>
                                    <button className="dg-chip row" onClick={() => setConfirmDel(false)}>
                                        Annulla
                                    </button>
                                </>
                            ) : (
                                <button className="dg-chip row" onClick={() => setConfirmDel(true)}>
                                    <i className="ph ph-trash"></i> Elimina
                                </button>
                            )}
                        </div>
                    </section>

                    {others.length > 0 && (
                        <section className="mt-5">
                            <p className="dg-q">Passa a un’altra scheda</p>
                            {others.map((s) => (
                                <button key={s.id} className="dg-action !p-3.5 !mt-2 w-full" onClick={() => { onOpen(s.id); onClose(); }}>
                                    <i className="ph ph-clipboard-text"></i>
                                    <span className="flex-1 text-left">
                                        <b>{schedaTitle(s)}</b>
                                        <small>
                                            {schedaSummary(s)} · {statusById(s.stato).label}
                                            {s.data ? ` · ${fmtLong(s.data)}` : ''}
                                        </small>
                                    </span>
                                    <i className="ph ph-caret-right opacity-50"></i>
                                </button>
                            ))}
                        </section>
                    )}

                    <section className="dg-card">
                        <p className="dg-q">Nuova scheda</p>
                        <p className="dg-hint !mt-0 mb-3">Una scheda vuota per {patient.nome}: per esempio il mesociclo successivo. Questa resta salvata.</p>
                        <button className="vw-next" onClick={() => { onNew(); onClose(); }}>
                            <i className="ph ph-plus"></i> Crea una nuova scheda
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};
