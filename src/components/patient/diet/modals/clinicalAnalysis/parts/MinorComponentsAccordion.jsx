import React from 'react';

export const MinorComponentsAccordion = ({ groupedMicros, multiplier, otherMicros }) => {
    return (
        Object.keys(groupedMicros).length > 0 && (
            <details className="mt-12 text-center group/exp pb-10">
                <summary className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 cursor-pointer list-none transition-all hover:shadow-lg hover:-translate-y-1 outline-none relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50/50 translate-y-full group-hover/exp:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                    <i className="ph-bold ph-caret-down text-lg group-open/exp:rotate-180 transition-transform duration-500 z-10 relative"></i>
                    <span className="z-10 relative">Esplora altri {otherMicros.length} Componenti Minori</span>
                </summary>

                <div className="mt-10 text-left animate-fade-in-up space-y-8">
                    {Object.entries(groupedMicros).map(([catName, catData]) => (
                        <div key={catName} className="bg-white/50 p-6 rounded-[32px] border border-gray-200/50 shadow-sm">
                            <h5 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${catData.color}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100`}>
                                    <i className={`ph-fill ${catData.icon} text-lg`}></i>
                                </div>
                                {catName}
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {catData.items.map((item) => (
                                    <div
                                        key={item.key}
                                        className="bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group/mini"
                                    >
                                        {/* EFFETTO FLUIDO MINI-CARD */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 via-blue-50/10 to-transparent opacity-0 group-hover/mini:opacity-100 scale-150 group-hover/mini:scale-100 transition-all duration-700 ease-out z-0"></div>

                                        <span
                                            className="text-[9px] font-black text-gray-400 uppercase tracking-wider truncate transition-colors duration-300 group-hover/mini:text-gray-800 relative z-10"
                                            title={item.key.replace(/_/g, ' ')}
                                        >
                                            {item.key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm font-black text-gray-800 mt-1 relative z-10 group-hover/mini:text-blue-600 transition-colors duration-300">
                                            {(item.val * multiplier).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        )
    );
};
