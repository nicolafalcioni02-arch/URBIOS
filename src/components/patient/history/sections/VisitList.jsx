import React from 'react';

export const VisitList = ({ filteredVisits, getDietBadge, getWeightDelta, handleDelete, setSearchTerm, setSelectedVisit, sortedVisits }) => {
    return (
        <div className="space-y-3">
            {/* Column header */}
            <div className="hidden md:grid grid-cols-[140px_1fr_120px_110px_auto] gap-4 px-4 mb-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Data</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Peso · Variazione</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Stato Dieta</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Tipo Visita</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Azioni</span>
            </div>

            {filteredVisits.map((visit, index) => {
                const isIndipendente = visit.note?.includes('Solo Dieta');
                const dietBadge = getDietBadge(visit.dietStatus);
                const delta = getWeightDelta(visit, index, sortedVisits);
                const hasNote = visit.note && !visit.note.includes('Solo Dieta');

                return (
                    <div
                        key={visit.id}
                        className={`
                                grid grid-cols-[140px_1fr_120px_110px_auto] gap-4 items-center
                                px-4 py-3.5 rounded-2xl border transition-all duration-150
                                hover:shadow-md hover:border-gray-300 cursor-default
                                ${isIndipendente ? 'bg-blue-50/60 border-blue-100' : 'bg-white border-gray-100 shadow-sm'}
                            `}
                    >
                        {/* Date */}
                        <div className="flex items-center gap-3">
                            <div className="text-center bg-black text-white px-2.5 py-2 rounded-xl min-w-[40px] shrink-0">
                                <p className="text-[7px] font-black uppercase leading-none opacity-70">
                                    {new Date(visit.data).toLocaleDateString('it-IT', { month: 'short' })}
                                </p>
                                <p className="text-sm font-black leading-tight">{new Date(visit.data).getDate()}</p>
                                <p className="text-[7px] font-bold opacity-50 leading-none">{new Date(visit.data).getFullYear()}</p>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium hidden lg:block">
                                {new Date(visit.data).toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase()}
                            </div>
                        </div>

                        {/* Weight + delta */}
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-gray-800">
                                {visit.peso}
                                <span className="text-xs font-normal text-gray-400 ml-0.5">kg</span>
                            </span>
                            {delta !== null && (
                                <span
                                    className={`
                                        inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full
                                        ${delta < 0 ? 'bg-emerald-50 text-emerald-700' : delta > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500'}
                                    `}
                                >
                                    <i className={`ph-bold ${delta < 0 ? 'ph-trend-down' : delta > 0 ? 'ph-trend-up' : 'ph-minus'} text-xs`}></i>
                                    {delta > 0 ? '+' : ''}
                                    {delta} kg
                                </span>
                            )}
                            {hasNote && (
                                <span title={visit.note} className="text-amber-400 shrink-0">
                                    <i className="ph-fill ph-note text-sm"></i>
                                </span>
                            )}
                        </div>

                        {/* Diet status badge */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full border ${dietBadge.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dietBadge.dot}`}></span>
                                {dietBadge.label.toUpperCase()}
                            </span>
                        </div>

                        {/* Visit type */}
                        <div>
                            {isIndipendente ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase">
                                    <i className="ph-bold ph-carrot text-xs"></i> Solo Piano
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
                                    <i className="ph-bold ph-calendar-check text-xs"></i> Associata
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                            <button
                                title="Piano dieta"
                                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-gray-400 flex items-center justify-center transition-all"
                            >
                                <i className="ph-bold ph-leaf text-sm"></i>
                            </button>
                            <button
                                title="Dettaglio visita"
                                onClick={() => setSelectedVisit(visit)}
                                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-gray-400 flex items-center justify-center transition-all"
                            >
                                <i className="ph-bold ph-stethoscope text-sm"></i>
                            </button>
                            <button
                                title="Elimina visita"
                                onClick={(e) => handleDelete(e, visit.id)}
                                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all"
                            >
                                <i className="ph-bold ph-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                );
            })}

            {filteredVisits.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <i className="ph ph-calendar-x text-3xl mb-3 block"></i>
                    <p className="text-sm">Nessuna visita trovata per questa data.</p>
                    <button onClick={() => setSearchTerm('')} className="mt-3 text-xs font-bold text-black underline underline-offset-2">
                        Rimuovi filtro
                    </button>
                </div>
            )}
        </div>
    );
};
