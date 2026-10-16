import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { dayTotals, mealKcal } from '../../diet/guided/guidedLogic';
import { statusById } from '../../shared/planCommon';

const r = (n) => Math.round(Number(n) || 0);
const nf = (n) => r(n).toLocaleString('it-IT');

// a che punto è il piano: bozza → pronto → consegnato
const STEP = { todo: 0, draft: 1, edit: 1, pending: 2, delivery: 3, active: 3, created: 3 };
const STEP_LABEL = { todo: 'Non ancora iniziato', draft: 'In bozza', edit: 'Da correggere', pending: 'Pronto, da inviare', delivery: 'Consegnato', active: 'In corso', created: 'In corso' };

const MACROS = [
    { key: 'c', label: 'Carboidrati', perG: 4, tone: '#2F54EB' },
    { key: 'p', label: 'Proteine', perG: 4, tone: '#1F8A5B' },
    { key: 'f', label: 'Grassi', perG: 9, tone: '#B7791F' },
];

// Anteprima (sola lettura) della dieta legata a una visita dello storico. "Modifica" apre la dieta di quella visita.
export const DietPreviewModal = ({ visit, onClose, onEdit, onBack, onPrint, swap }) => {
    const [dayIdx, setDayIdx] = useState(0);
    useEffect(() => setDayIdx(0), [visit?.id]);
    useEffect(() => {
        if (!visit) return undefined;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [visit, onClose]);

    if (!visit) return null;
    const det = visit.dettagli || {};
    const days = Array.isArray(det.diet_plan_data) ? det.diet_plan_data : [];
    const targets = det.diet_targets?.isConfigured ? det.diet_targets : null;
    const supplements = Array.isArray(det.diet_supplements) ? det.diet_supplements : [];
    const advice = Array.isArray(det.diet_notes) ? det.diet_notes : [];
    const name = String(det.diet_meta?.name || '').trim();
    const st = statusById(visit.dietStatus);
    const step = STEP[st.id] ?? 0;
    const hasPlan = days.some((d) => (d.meals || []).some((m) => (m.items || []).length > 0));
    const day = days[Math.min(dayIdx, days.length - 1)];
    const totals = day ? dayTotals(day) : null;
    const kcalGoal = targets ? Number(targets.kcal) || 0 : 0;
    const when = new Date(visit.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    return ReactDOM.createPortal(
        <div className={`vd-back ${swap ? 'is-swap' : ''}`} onClick={onClose}>
            <div className={`vd-sheet ${swap ? `is-swap-${swap}` : ''}`} role="dialog" aria-modal="true" aria-label="Piano alimentare" onClick={(e) => e.stopPropagation()}>
                <header className="vd-head">
                    <button onClick={onBack || onClose} className="hs-icon vd-back-btn" aria-label="Indietro">
                        <i className="ph ph-arrow-left"></i>
                    </button>
                    <div className="min-w-0 flex-1">
                        <h3 className="vd-title truncate">{name || 'Piano alimentare'}</h3>
                        <p className="vd-sub">Visita del {when}</p>
                    </div>
                    <button onClick={onClose} className="hs-icon" aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </header>

                <div className="vd-actions">
                    <button onClick={() => onEdit(visit)} className="vd-btn is-primary">
                        <i className="ph-bold ph-pencil-simple"></i>
                        {hasPlan ? 'Modifica la dieta' : 'Crea la dieta'}
                    </button>
                    {hasPlan && onPrint && (
                        <button onClick={() => onPrint(visit)} className="vd-btn">
                            <i className="ph ph-printer"></i>
                            Stampa
                        </button>
                    )}
                </div>

                <div className="vd-scroll">
                    <div className="vd-body stagger">
                        {!hasPlan && (
                            <div className="text-center py-12">
                                <p className="text-[17px] font-semibold text-[color:var(--ink)]">Nessuna dieta in questa visita</p>
                                <p className="text-[14px] text-[color:var(--muted)] mt-1">Puoi crearla dal pulsante qui sopra.</p>
                            </div>
                        )}

                        {hasPlan && (
                            <div className="dp-hero">
                                <div className="vd-weight">
                                    <p className="vd-weight-label">Obiettivo giornaliero</p>
                                    <p className="vd-weight-fig">
                                        {targets ? nf(kcalGoal) : totals ? nf(totals.kcal) : '–'}
                                        <span>kcal</span>
                                    </p>
                                    <div className="dp-status" style={{ '--tone': st.color }}>
                                        <span className="dp-status-bars" aria-hidden="true">
                                            {[1, 2, 3].map((n) => (
                                                <i key={n} className={n <= step ? 'on' : ''}></i>
                                            ))}
                                        </span>
                                        {STEP_LABEL[visit.dietStatus] || STEP_LABEL[st.id]}
                                    </div>
                                </div>

                                {targets && (
                                    <div className="vd-tile dp-macros">
                                        <p className="vd-tile-label">Ripartizione dei macronutrienti</p>
                                        <div className="dp-bar" aria-hidden="true">
                                            {MACROS.map((m) => (
                                                <span key={m.key} style={{ width: `${Number(targets[m.key]) || 0}%`, background: m.tone }}></span>
                                            ))}
                                        </div>
                                        <div className="dp-legend">
                                            {MACROS.map((m) => (
                                                <div key={m.key}>
                                                    <p>
                                                        <span className="vd-dot" style={{ '--tone': m.tone }}></span>
                                                        {m.label}
                                                    </p>
                                                    <b>{r(targets[m.key])}%</b>
                                                    <small>{nf((kcalGoal * (Number(targets[m.key]) || 0)) / 100 / m.perG)} g</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasPlan && (
                            <section className="vd-sec">
                                {days.length > 1 && (
                                    <div className="dp-days" role="tablist">
                                        {days.map((d, i) => (
                                            <button key={d.id} role="tab" aria-selected={i === dayIdx} className={i === dayIdx ? 'is-on' : ''} onClick={() => setDayIdx(i)}>
                                                {d.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {day && (
                                    <div key={day.id} className="dp-day stagger">
                                        <div className="dp-totals">
                                            <div>
                                                <p className="vd-tile-label">{days.length > 1 ? day.title : 'Totale del giorno'}</p>
                                                <p className="dp-kcal">
                                                    {nf(totals.kcal)}
                                                    <small>kcal</small>
                                                </p>
                                            </div>
                                            <div className="dp-chips">
                                                <span>
                                                    C <b>{r(totals.c)}</b> g
                                                </span>
                                                <span>
                                                    P <b>{r(totals.p)}</b> g
                                                </span>
                                                <span>
                                                    G <b>{r(totals.f)}</b> g
                                                </span>
                                            </div>
                                        </div>

                                        {(day.meals || [])
                                            .filter((m) => (m.items || []).length > 0)
                                            .map((m) => (
                                                <div key={m.id} className="dp-meal">
                                                    <div className="dp-meal-head">
                                                        <h5>{m.title}</h5>
                                                        <span>{nf(mealKcal(m))} kcal</span>
                                                    </div>
                                                    {m.items.map((it) => (
                                                        <div key={it.id} className="dp-item">
                                                            <span className="truncate" title={it.name}>
                                                                {it.name}
                                                            </span>
                                                            <span className="dp-g">{r(it.weight)} g</span>
                                                            <span className="dp-k">{nf(((parseFloat(it.kcal) || 0) * (parseFloat(it.weight) || 0)) / 100)} kcal</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {supplements.length > 0 && (
                            <section className="vd-sec">
                                <h4 className="vd-h">
                                    <span className="vd-h-ico">
                                        <i className="ph ph-pill"></i>
                                    </span>
                                    Integratori
                                    <span className="vd-h-count">{supplements.length}</span>
                                </h4>
                                <dl className="vd-rows is-wide">
                                    {supplements.map((s) => (
                                        <div key={s.id || s.name}>
                                            <dt className="!text-[color:var(--ink)] font-semibold">{s.name}</dt>
                                            <dd className="!font-normal !text-[color:var(--muted)]">{[s.dose, s.when].filter(Boolean).join(' · ')}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        {advice.length > 0 && (
                            <section className="vd-sec">
                                <h4 className="vd-h">
                                    <span className="vd-h-ico">
                                        <i className="ph ph-lightbulb"></i>
                                    </span>
                                    Consigli
                                </h4>
                                <ul className="dp-advice">
                                    {advice.map((a, i) => (
                                        <li key={i}>
                                            <i className="ph-bold ph-check"></i>
                                            {typeof a === 'string' ? a : a.text || ''}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
