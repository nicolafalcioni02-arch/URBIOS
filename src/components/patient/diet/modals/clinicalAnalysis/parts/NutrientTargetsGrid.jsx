import React from 'react';

export const NutrientTargetsGrid = ({ currentProfile, multiplier, patientTargets }) => {
    return Object.keys(patientTargets).length === 0 ? (
        <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 font-bold text-sm bg-white">
            <i className="ph-thin ph-flask text-5xl mb-3 text-gray-300"></i>
            <br />
            Nessun target trovato. Configura il Database.
        </div>
    ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Object.entries(patientTargets).map(([key, ref]) => {
                const val = (currentProfile[key] || 0) * multiplier;
                const target = ref.target * multiplier;
                const ul = ref.ul ? ref.ul * multiplier : null;
                const pct = Math.min((val / target) * 100, 100);

                let status = 'ok';
                let glowColor = 'bg-blue-500'; // Default acqua per lo status OK
                let barColor = 'bg-blue-500';
                let borderColor = 'border-transparent';

                if (val < target * 0.75) {
                    status = 'low';
                    glowColor = 'bg-amber-400';
                    barColor = 'bg-amber-400';
                    borderColor = 'border-amber-400';
                }
                if (ul && val > ul) {
                    status = 'high';
                    glowColor = 'bg-red-500';
                    barColor = 'bg-red-500';
                    borderColor = 'border-red-500';
                }

                return (
                    <div
                        key={key}
                        className={`bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 border-b-4 ${status !== 'ok' ? borderColor : 'border-b-transparent'} hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden flex flex-col group`}
                    >
                        {/* EFFETTO FLUIDO/ACQUA: Sfondo animato */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br from-transparent to-${glowColor.replace('bg-', '')}/10 opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-700 ease-out z-0 rounded-3xl scale-110 group-hover:scale-100 blur-xl`}
                        ></div>

                        {/* Intestazione Card */}
                        <div className="flex justify-between items-start mb-2 z-10 relative">
                            <span
                                className="text-xs font-semibold text-gray-400 truncate pr-2 group-hover:text-gray-800 transition-colors duration-300"
                                title={ref.name}
                            >
                                {ref.name}
                            </span>
                            {status !== 'ok' && (
                                <i
                                    className={`ph-fill ${status === 'low' ? 'ph-warning text-amber-500' : 'ph-warning-octagon text-red-500'} animate-pulse drop-shadow-md`}
                                ></i>
                            )}
                        </div>

                        {/* Valore e Unità */}
                        <div className="flex items-baseline gap-1 z-10 relative mb-4">
                            <span
                                className={`text-3xl font-black tracking-tighter transition-colors duration-500 ${status === 'low' ? 'text-amber-500' : status === 'high' ? 'text-red-500' : 'text-gray-900 group-hover:text-blue-600'}`}
                            >
                                {val.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-400/70 transition-colors">{ref.unit}</span>
                        </div>

                        {/* Sezione Target e Grafico a Barra */}
                        <div className="mt-auto z-10 relative">
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1.5 ">
                                <span>
                                    Trgt: {target.toFixed(2)} {ref.unit}
                                </span>
                                <span className={status === 'ok' ? 'text-blue-500' : ''}>{pct.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                                {/* Barra con effetto onda */}
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} group-hover:brightness-110`}
                                    style={{ width: `${pct}%` }}
                                />
                                {ul && (
                                    <div
                                        className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10 shadow-sm"
                                        style={{ left: `${Math.min((ul / target) * 100, 100)}%` }}
                                        title={`Limite: ${ul.toFixed(1)} ${ref.unit}`}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
