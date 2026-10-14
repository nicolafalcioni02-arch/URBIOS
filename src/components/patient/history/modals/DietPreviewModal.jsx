import React from 'react';
import ReactDOM from 'react-dom';
import { dayTotals } from '../../diet/guided/guidedLogic';
import { statusById } from '../../shared/planCommon';

const r = (n) => Math.round(Number(n) || 0);

// Anteprima (sola lettura) della dieta legata a una visita dello storico. "Modifica" apre la dieta di quella visita.
export const DietPreviewModal = ({ visit, onClose, onEdit }) => {
    if (!visit) return null;
    const det = visit.dettagli || {};
    const days = Array.isArray(det.diet_plan_data) ? det.diet_plan_data : [];
    const targets = det.diet_targets;
    const supplements = Array.isArray(det.diet_supplements) ? det.diet_supplements : [];
    const advice = Array.isArray(det.diet_notes) ? det.diet_notes : [];
    const name = String(det.diet_meta?.name || '').trim();
    const st = statusById(visit.dietStatus);
    const hasPlan = days.some((d) => (d.meals || []).some((m) => (m.items || []).length > 0));

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 fade-enter flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-start gap-3">
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">{name || 'Piano alimentare'}</h3>
                        <p className="text-xs text-gray-500">Visita del {new Date(visit.data).toLocaleDateString('it-IT', { dateStyle: 'long' })}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                                {st.label}
                            </span>
                            {targets?.isConfigured && (
                                <span className="text-[11px] text-gray-500">
                                    Obiettivo {r(targets.kcal)} kcal · C {r(targets.c)}% · P {r(targets.p)}% · G {r(targets.f)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" title="Chiudi">
                        <i className="ph ph-x text-lg"></i>
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto">
                    {!hasPlan && (
                        <div className="text-center py-10 text-gray-400">
                            <i className="ph ph-fork-knife text-3xl mb-3 block"></i>
                            <p className="text-sm">Nessuna dieta associata a questa visita.</p>
                        </div>
                    )}

                    {hasPlan &&
                        days.map((d) => {
                            const t = dayTotals(d);
                            return (
                                <div key={d.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 bg-gray-50">
                                        <p className="font-bold text-sm text-gray-800">{d.title}</p>
                                        <p className="text-[11px] text-gray-500">
                                            {r(t.kcal)} kcal · C {r(t.c)} g · P {r(t.p)} g · G {r(t.f)} g
                                        </p>
                                    </div>
                                    {(d.meals || [])
                                        .filter((m) => (m.items || []).length > 0)
                                        .map((m) => (
                                            <div key={m.id} className="px-4 py-2.5 border-t border-gray-100">
                                                <p className="text-[11px] font-bold text-gray-400 mb-1">{m.title}</p>
                                                {m.items.map((it) => (
                                                    <div key={it.id} className="flex justify-between gap-3 text-[13px] py-0.5">
                                                        <span className="text-gray-700 min-w-0 truncate">{it.name}</span>
                                                        <span className="text-gray-500 shrink-0">{r(it.weight)} g</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                </div>
                            );
                        })}

                    {supplements.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-1.5">Integratori</p>
                            {supplements.map((s) => (
                                <p key={s.id || s.name} className="text-[13px] text-gray-700">
                                    {s.name}
                                    {s.dose ? ` · ${s.dose}` : ''}
                                    {s.when ? ` · ${s.when}` : ''}
                                </p>
                            ))}
                        </div>
                    )}
                    {advice.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-1.5">Consigli</p>
                            {advice.map((a, i) => (
                                <p key={i} className="text-[13px] text-gray-700">
                                    • {typeof a === 'string' ? a : a.text || ''}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 transition-colors">
                        Chiudi
                    </button>
                    <button onClick={() => onEdit(visit)} className="px-4 py-2 rounded-full text-xs font-bold bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                        <i className="ph-bold ph-pencil-simple"></i> {hasPlan ? 'Modifica la dieta' : 'Crea la dieta'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
