import React, { useState } from 'react';
import { STATUSES, fmtLong, isIndependent, makeIndependentVisit, patchVisit, planDateInfo, planLabel, planName, planSummaryOf, setPlanName, setPlanStatus, statusOf, todayIso } from './guidedLogic';

// Piano: collegamento e data. Un piano può essere INDIPENDENTE (con una data a scelta, oppure senza data)
// oppure COLLEGATO a una visita. Da qui si cambia piano, si collega un piano indipendente a una visita,
// si crea una copia indipendente o un nuovo piano vuoto.

export const PlanLinkModal = ({ patient, listaVisite, visitaAttiva, selectedVisitaId, setSelectedVisitaId, calcData, targets, dietDays, savedReports, onUpdateDb, onClose }) => {
    const [attachOpen, setAttachOpen] = useState(false);
    const [attachTo, setAttachTo] = useState(null);
    const [replace, setReplace] = useState(false);
    const [dropOld, setDropOld] = useState(true);
    const [newDate, setNewDate] = useState(todayIso());
    const [newNoDate, setNewNoDate] = useState(false);
    const [msg, setMsg] = useState('');
    const [name, setName] = useState(planName(visitaAttiva));

    const withData = listaVisite.filter((v) => v.dettagli);
    const clinical = withData.filter((v) => !isIndependent(v));
    const others = withData.filter((v) => v.id !== selectedVisitaId).sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const di = planDateInfo(visitaAttiva);
    const independent = isIndependent(visitaAttiva);
    const target = clinical.find((v) => v.id === attachTo);
    const targetHasPlan = !!target && (target.dettagli?.diet_plan_data || []).length > 0;

    const setDate = (patch) => patchVisit(onUpdateDb, patient.id, visitaAttiva.id, (v) => ({ ...v, dettagli: { ...v.dettagli, diet_meta: { ...(v.dettagli.diet_meta || {}), ...patch } } }));

    const attach = () => {
        if (!target) return;
        const src = visitaAttiva;
        onUpdateDb((prev) => ({
            ...prev,
            pazienti: prev.pazienti.map((p) => {
                if (p.id !== patient.id) return p;
                let visite = (p.visite || []).map((v) =>
                    v.id !== target.id
                        ? v
                        : {
                              ...v,
                              dettagli: {
                                  ...v.dettagli,
                                  diet_calc_data: calcData,
                                  diet_targets: targets,
                                  diet_plan_data: dietDays,
                                  diet_saved_reports: savedReports || [],
                                  ...(src.dettagli?.diet_supplements && { diet_supplements: src.dettagli.diet_supplements }),
                                  ...(src.dettagli?.diet_notes && { diet_notes: src.dettagli.diet_notes }),
                              },
                          }
                );
                if (dropOld) visite = visite.filter((v) => v.id !== src.id);
                return { ...p, visite };
            }),
        }));
        setSelectedVisitaId(target.id);
        onClose();
    };

    const copyAsIndependent = () => {
        const v = makeIndependentVisit({ calcData, dateIso: todayIso(), noDate: false, targets, dietDays, savedReports });
        onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: [v, ...(p.visite || [])] } : p)) }));
        setSelectedVisitaId(v.id);
        onClose();
    };

    const createNew = () => {
        const v = makeIndependentVisit({ calcData, dateIso: newDate, noDate: newNoDate, blank: true });
        onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: [v, ...(p.visite || [])] } : p)) }));
        setSelectedVisitaId(v.id);
        onClose();
    };

    return (
        <div className="dg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-link text-lg"></i>
                    </div>
                    <h2 className="flex-1 text-[18px] font-semibold leading-tight">Piano: collegamento e data</h2>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    {/* questo piano */}
                    {visitaAttiva && (
                        <section className="dg-card !mt-0">
                            <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)]">Piano in uso</p>
                            <p className="text-[17px] font-semibold mt-1">{planLabel(visitaAttiva)}</p>
                            <p className="text-[13px] text-[color:var(--muted)]">{independent ? 'Non è legato a nessuna visita.' : 'È collegato a una visita dello storico.'}</p>

                            <label className="fld-label mt-4">Nome del piano <span className="opacity-60">facoltativo</span></label>
                            <div className="flex gap-2">
                                <input
                                    className="fld"
                                    placeholder="Es. Definizione estate, Dieta mamma, Piano vegetariano…"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={(e) => e.target.value.trim() !== planName(visitaAttiva) && setPlanName(onUpdateDb, patient.id, visitaAttiva.id, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                />
                            </div>

                            <label className="fld-label mt-4">Stato</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {STATUSES.filter((x) => x.id !== 'active' || statusOf(visitaAttiva).id === 'active').map((x) => {
                                    const on = statusOf(visitaAttiva).id === x.id;
                                    return (
                                        <button key={x.id} className="dg-mini" style={on ? { background: x.color, color: '#fff', borderColor: x.color } : undefined} onClick={() => setPlanStatus(onUpdateDb, patient.id, visitaAttiva.id, x.id)}>
                                            <i className={`ph ${x.icon}`}></i> {x.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <label className="fld-label mt-4">Data del piano</label>
                            <div className="flex items-center gap-3 flex-wrap">
                                <input type="date" className="fld !w-auto" disabled={di.none} value={di.iso || ''} onChange={(e) => setDate({ noDate: false, date: e.target.value })} />
                                <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4" checked={di.none} onChange={(e) => setDate(e.target.checked ? { noDate: true } : { noDate: false, date: di.iso || todayIso() })} />
                                    Senza data
                                </label>
                            </div>
                            <p className="dg-hint">È la data che compare sul piano stampato. Senza data, sul foglio non viene scritta.</p>

                            <div className="flex gap-2 flex-wrap mt-4">
                                {independent ? (
                                    <button className="dg-chip row" disabled={clinical.length === 0} style={clinical.length === 0 ? { opacity: 0.45 } : undefined} onClick={() => setAttachOpen(!attachOpen)}>
                                        <i className="ph ph-link"></i> Collega a una visita
                                    </button>
                                ) : (
                                    <button className="dg-chip row" onClick={copyAsIndependent}>
                                        <i className="ph ph-copy"></i> Crea una copia indipendente
                                    </button>
                                )}
                            </div>
                            {independent && clinical.length === 0 && <p className="dg-hint">Non ci sono ancora visite a cui collegarlo.</p>}

                            {attachOpen && independent && (
                                <div className="mt-3 dg-in">
                                    {clinical.map((v) => (
                                        <button key={v.id} className={`dg-action !p-3 !mt-1.5 w-full ${attachTo === v.id ? 'primary' : ''}`} onClick={() => setAttachTo(v.id)}>
                                            <i className="ph ph-stethoscope"></i>
                                            <span className="flex-1 text-left">
                                                <b>{planLabel(v)}</b>
                                                <small>{planSummaryOf(v)}</small>
                                            </span>
                                        </button>
                                    ))}
                                    {target && (
                                        <div className="mt-3">
                                            {targetHasPlan && (
                                                <label className="flex items-start gap-2 text-[13.5px] cursor-pointer mb-2">
                                                    <input type="checkbox" className="mt-1 w-4 h-4" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
                                                    Quella visita ha già un piano ({planSummaryOf(target)}): sostituiscilo con questo.
                                                </label>
                                            )}
                                            <label className="flex items-center gap-2 text-[13.5px] cursor-pointer mb-3">
                                                <input type="checkbox" className="w-4 h-4" checked={dropOld} onChange={(e) => setDropOld(e.target.checked)} />
                                                Elimina il piano indipendente dopo il collegamento
                                            </label>
                                            <button className="vw-next" disabled={targetHasPlan && !replace} style={targetHasPlan && !replace ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={attach}>
                                                Collega il piano
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* altri piani */}
                    {others.length > 0 && (
                        <section className="mt-5">
                            <p className="dg-q">Passa a un altro piano</p>
                            {others.map((v) => (
                                <button
                                    key={v.id}
                                    className="dg-action !p-3.5 !mt-2 w-full"
                                    onClick={() => {
                                        setSelectedVisitaId(v.id);
                                        onClose();
                                    }}
                                >
                                    <i className={`ph ${isIndependent(v) ? 'ph-lightning' : 'ph-stethoscope'}`}></i>
                                    <span className="flex-1 text-left">
                                        <b>{planLabel(v)}</b>
                                        <small>
                                            {planSummaryOf(v)} · {statusOf(v).label}
                                        </small>
                                    </span>
                                    <i className="ph ph-caret-right opacity-50"></i>
                                </button>
                            ))}
                        </section>
                    )}

                    {/* nuovo indipendente */}
                    <section className="dg-card">
                        <p className="dg-q">Nuovo piano indipendente</p>
                        <p className="dg-hint !mt-0 mb-3">Un piano vuoto, non legato a nessuna visita.</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <input type="date" className="fld !w-auto" disabled={newNoDate} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                            <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                                <input type="checkbox" className="w-4 h-4" checked={newNoDate} onChange={(e) => setNewNoDate(e.target.checked)} />
                                Senza data
                            </label>
                        </div>
                        <button className="vw-next mt-4" onClick={createNew}>
                            <i className="ph ph-plus"></i> Crea il piano
                        </button>
                    </section>
                    {msg && <p className="dg-warn">{msg}</p>}
                </div>
            </div>
        </div>
    );
};
