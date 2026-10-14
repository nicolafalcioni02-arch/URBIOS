import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Body3D } from '../../analisi/sections/Body3D';
import { CIRC_SITES, PLI_SITES } from '../../analisi/sections/measureSites';

const num = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;

// Misure guidate sul corpo 3D: si clicca l'anello o il punto della plica, si legge come prenderla e si inserisce il valore.
export const Measure3DModal = ({ layer: initialLayer = 'circ', sesso = 'M', visitDraft, updateDraft, onClose }) => {
    const [layer, setLayer] = useState(initialLayer);
    const sites = layer === 'circ' ? CIRC_SITES : PLI_SITES;
    const [activeId, setActiveId] = useState(sites[0].id);
    const inputRefs = useRef({});

    const model = useMemo(() => {
        const pl = {};
        PLI_SITES.forEach((s) => (pl[s.key] = num(visitDraft[s.key])));
        const bil = (k) => num(visitDraft[`${k}_dx`]) || num(visitDraft[`${k}_sx`]) || num(visitDraft[k]);
        return {
            sesso,
            altezza: num(visitDraft.altezza),
            peso: num(visitDraft.peso),
            fm: 0,
            collo: num(visitDraft.cm_collo),
            torace: num(visitDraft.cm_torace),
            vita: num(visitDraft.cm_vita_min),
            fianchi: num(visitDraft.cm_fianchi_max),
            braccio: bil('circ_braccio'),
            coscia: bil('circ_coscia'),
            polpaccio: bil('circ_polpaccio'),
            pl,
        };
    }, [visitDraft, sesso]);

    const active = [...CIRC_SITES, ...PLI_SITES].find((s) => s.id === activeId);

    const select = (id) => {
        const inCirc = CIRC_SITES.some((s) => s.id === id);
        setLayer(inCirc ? 'circ' : 'pliche');
        setActiveId(id);
    };
    useEffect(() => {
        const el = inputRefs.current[activeId];
        if (el) el.focus({ preventScroll: false });
    }, [activeId, layer]);

    const switchLayer = (l) => {
        setLayer(l);
        setActiveId((l === 'circ' ? CIRC_SITES : PLI_SITES)[0].id);
    };
    const next = (i) => {
        const n = sites[i + 1];
        if (n) setActiveId(n.id);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-[1100px] h-full sm:h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-gray-900">Misure guidate 3D</h2>
                        <p className="text-xs text-gray-400">Tocca un anello o un punto sul corpo per vedere dove misurare</p>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 active:scale-95">
                        Fatto
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                    <div className="flex-1 min-h-[300px] bg-gradient-to-b from-gray-50 to-white relative">
                        <Body3D model={model} showRings={layer === 'circ'} showPliche={layer === 'pliche'} interactive activeId={activeId} onPick={select} />
                        {!model.altezza && (
                            <div className="absolute top-3 left-3 right-3 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5">
                                Inserisci altezza e peso per un modello più fedele al paziente.
                            </div>
                        )}
                    </div>

                    <div className="md:w-[340px] flex-none border-t md:border-t-0 md:border-l border-gray-100 flex flex-col min-h-0 max-h-[45vh] md:max-h-none">
                        <div className="p-3 flex gap-1">
                            {[['circ', 'Circonferenze'], ['pliche', 'Pliche']].map(([id, name]) => (
                                <button
                                    key={id}
                                    onClick={() => switchLayer(id)}
                                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${layer === id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>

                        {active && (
                            <div className="mx-3 mb-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <p className="text-sm font-bold text-indigo-900">{active.label}</p>
                                <p className="text-xs text-indigo-800/80 leading-snug mt-1">{active.how}</p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                            {sites.map((s, i) => {
                                const val = visitDraft[s.key] ?? '';
                                const on = s.id === activeId;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => setActiveId(s.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${on ? 'border-black bg-gray-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full flex-none ${String(val).trim() ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                        <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{s.label}</span>
                                        <input
                                            ref={(el) => (inputRefs.current[s.id] = el)}
                                            type="text"
                                            inputMode="decimal"
                                            value={val}
                                            onChange={(e) => updateDraft(s.key, e.target.value)}
                                            onFocus={() => setActiveId(s.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    next(i);
                                                }
                                            }}
                                            className="fld text-right"
                                            style={{ padding: '6px 8px', width: 84, flex: 'none' }}
                                        />
                                        <span className="text-[11px] text-gray-400 w-6">{s.unit}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
