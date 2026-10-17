import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { fmtKg, fmtDelta } from './historyFormat';

// che cosa è stato fatto in una visita: documenti firmati quel giorno, misure, esami, piano alimentare, scheda di allenamento
const MEASURE_KEYS = /^(peso|altezza|cm_|circ_|pl_|dm_|biva_)/;
const LAB_KEYS = /^(bg_|bl_|br_)/;
const doneIn = (visit, patient, hasDiet) => {
    const d = visit.dettagli || {};
    const day = String(visit.data || '').slice(0, 10);
    const filled = (re) => visit.peso || Object.keys(d).some((k) => re.test(k) && String(d[k] ?? '').trim() !== '');
    const docs = Object.values(patient?.documenti || {}).some((x) => x && [x.dataFirma, x.dataConsegna].some((t) => String(t || '').slice(0, 10) === day));
    const plan = (patient?.allenamento?.schede || []).some((sc) => String(sc.data || '').slice(0, 10) === day);
    return [docs && 'documenti', filled(MEASURE_KEYS) && 'misure', Object.keys(d).some((k) => LAB_KEYS.test(k) && String(d[k] ?? '').trim() !== '') && 'esami', hasDiet && 'dieta', plan && 'scheda'].filter(Boolean);
};

export const VisitList = ({ patient, filteredVisits, getDietBadge, getWeightDelta, handleDelete, onOpenDiet, setSearchTerm, setSelectedVisit, sortedVisits }) => {
    const [noteVisit, setNoteVisit] = useState(null); // visita di cui si legge la nota
    const stop = (fn) => (e) => {
        e.stopPropagation();
        fn(e);
    };
    return (
        <div className="hs-list stagger">
            {filteredVisits.map((visit, index) => {
                const isIndipendente = visit.note?.includes('Solo Dieta');
                // lo stato "attivo" conta solo se la visita ha davvero una dieta con alimenti
                const days = visit.dettagli?.diet_plan_data;
                const hasDiet = Array.isArray(days) && days.some((d) => (d.meals || []).some((m) => (m.items || []).length > 0));
                const dietBadge = hasDiet || visit.dietStatus === 'todo' ? getDietBadge(visit.dietStatus) : { label: 'Nessun piano', step: -1, tone: '#8E8E93', bg: '#EFEEEA', icon: 'ph-minus-circle' };
                const delta = getWeightDelta(visit, index, sortedVisits);
                const hasNote = visit.note && !visit.note.includes('Solo Dieta');
                const date = new Date(visit.data);
                const latest = sortedVisits[0]?.id === visit.id;
                // una voce "solo piano" non è una visita: si apre il piano, non il dettaglio clinico
                const open = () => (isIndipendente ? onOpenDiet && onOpenDiet(visit) : setSelectedVisit(visit));
                // che cosa è stata questa voce, detto per esteso
                // la prima visita è la più vecchia tra le visite vere (le voci "solo piano" non contano)
                const firstVisit = [...sortedVisits].reverse().find((v) => !v.note?.includes('Solo Dieta'));
                const done = doneIn(visit, patient, hasDiet);
                const kind = isIndipendente
                    ? { name: 'Solo piano alimentare', desc: String(visit.dettagli?.diet_meta?.name || '').trim() || 'senza visita', icon: 'ph-carrot' }
                    : firstVisit && firstVisit.id === visit.id
                      ? { name: 'Prima visita', desc: done.join(' · ') || 'anamnesi e misure', icon: 'ph-handshake' }
                      : { name: 'Controllo', desc: done.join(' · ') || 'solo misure', icon: 'ph-stethoscope' };

                return (
                    <div key={visit.id} className={`hs-step ${latest ? 'is-latest' : ''}`}>
                        <div className="hs-tile-date" aria-hidden="true">
                            <b>{date.getDate()}</b>
                            <span>{date.toLocaleDateString('it-IT', { month: 'short' })}</span>
                            <span>{date.getFullYear()}</span>
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            onClick={open}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
                            className={`hs-card ${isIndipendente ? 'is-plan' : ''}`}
                            title={isIndipendente ? 'Apri il piano alimentare' : 'Apri il dettaglio della visita'}
                        >
                            <div className="hs-first">
                                <div className="hs-l1">
                                    <span className="hs-when-type">{kind.name}</span>
                                </div>
                                {isIndipendente ? (
                                    <>
                                        <div className="hs-l2">
                                            <span className="hs-plan-m truncate">{kind.desc}</span>
                                        </div>
                                        <div className="hs-l3"></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="hs-l2">
                                            <span className="hs-kg">
                                                {fmtKg(visit.peso)}
                                                <small>kg</small>
                                            </span>
                                            {hasNote && (
                                                <button type="button" title="Leggi la nota" aria-label="Leggi la nota" onClick={stop(() => setNoteVisit(visit))} className="hs-icon is-sm is-note">
                                                    <i className="ph-fill ph-note"></i>
                                                </button>
                                            )}
                                        </div>
                                        <div className="hs-l3" style={{ color: delta < 0 ? 'var(--ok)' : delta > 0 ? 'var(--bad)' : undefined }}>
                                            {delta === null ? (
                                                'prima visita'
                                            ) : (
                                                <>
                                                    <i className={`ph-bold ${delta < 0 ? 'ph-arrow-down-right' : delta > 0 ? 'ph-arrow-up-right' : 'ph-minus'}`}></i>
                                                    <b>{fmtDelta(delta)} kg</b>
                                                    <span className="text-[color:var(--muted)]">dalla precedente</span>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="hs-status-cell">
                                <div className="hs-diet" style={{ '--tone': dietBadge.tone, '--tone-bg': dietBadge.bg }}>
                                    <span className="hs-diet-ico">
                                        <i className={`ph-bold ${dietBadge.icon}`}></i>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="hs-l1">Piano alimentare</span>
                                        <span className="hs-l2" style={{ color: 'var(--tone)' }}>
                                            <span className="truncate">{dietBadge.label}</span>
                                        </span>
                                        <span className="hs-l3">
                                            {dietBadge.step >= 0 ? (
                                                <span className="hs-diet-steps" title="Bozza → pronto → consegnato">
                                                    {[1, 2, 3].map((n) => (
                                                        <i key={n} className={n <= dietBadge.step ? 'on' : ''}></i>
                                                    ))}
                                                </span>
                                            ) : (
                                                'nessun piano in questa visita'
                                            )}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="hs-type-cell">
                                <div className="hs-diet hs-kind">
                                    <span className="hs-diet-ico">
                                        <i className={`ph-bold ${kind.icon}`}></i>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="hs-l1">Tipo</span>
                                        <span className="hs-l2">
                                            <span className="truncate">{kind.name}</span>
                                        </span>
                                        <span className="hs-l3">
                                            <span className="truncate" title={kind.desc}>{kind.desc}</span>
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="hs-actions">
                                {isIndipendente ? (
                                    <span className="hs-icon-gap" aria-hidden="true"></span>
                                ) : (
                                    <button title="Piano dieta" aria-label="Piano dieta" onClick={stop(() => onOpenDiet && onOpenDiet(visit))} className="hs-icon">
                                        <i className="ph ph-leaf"></i>
                                    </button>
                                )}
                                <button title="Elimina visita" aria-label="Elimina visita" onClick={stop((e) => handleDelete(e, visit))} className="hs-icon is-danger">
                                    <i className="ph ph-trash"></i>
                                </button>
                                <i className="ph ph-caret-right hs-chevron" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                );
            })}

            {filteredVisits.length === 0 && (
                <div className="text-center py-14">
                    <p className="text-[15px] font-semibold text-[color:var(--ink)]">Nessuna visita in questa data</p>
                    <button onClick={() => setSearchTerm('')} className="mt-2 text-[13px] font-medium text-[color:var(--accent)] underline underline-offset-4">
                        Mostra tutte le visite
                    </button>
                </div>
            )}
            {noteVisit &&
                ReactDOM.createPortal(
                    <div className="sheet-back" onClick={() => setNoteVisit(null)}>
                        <div className="sheet" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">Nota della visita</h3>
                                    <p className="text-[13px] text-[color:var(--muted)] mt-0.5">{new Date(noteVisit.data).toLocaleDateString('it-IT', { dateStyle: 'long' })}</p>
                                </div>
                                <button onClick={() => setNoteVisit(null)} className="hs-icon" aria-label="Chiudi">
                                    <i className="ph ph-x"></i>
                                </button>
                            </div>
                            <p className="mt-4 text-[15px] text-[color:var(--ink)] whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">{noteVisit.note}</p>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};
