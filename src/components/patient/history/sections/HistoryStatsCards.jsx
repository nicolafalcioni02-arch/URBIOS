import React from 'react';

export const HistoryStatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {/* Peso attuale */}
            <div className="col-span-2 bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="ph-fill ph-scales text-7xl"></i>
                </div>
                <p className="text-xs font-bold opacity-50 mb-1">Peso Attuale</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-medium">{stats.currentWeight}</span>
                    <span className="text-lg opacity-50">kg</span>
                </div>
                <p className="text-xs opacity-40 mt-2 ">
                    Ultimo aggiornamento · {new Date(stats.lastDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            </div>

            {/* Delta totale */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-gray-400 ">Andamento Totale</p>
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${Number(stats.deltaPeso) <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {Number(stats.deltaPeso) > 0 ? '+' : ''}
                            {stats.deltaPeso}
                        </span>
                        <span className="text-xs text-gray-400">kg</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">da {stats.startWeight} kg iniziali</p>
                </div>
            </div>

            {/* Visite totali */}
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-xs font-bold text-gray-400 ">Visite Totali</p>
                <div>
                    <span className="text-3xl font-bold text-gray-700">{stats.totalVisits}</span>
                    {stats.avgDelta && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            media {Number(stats.avgDelta) > 0 ? '+' : ''}
                            {stats.avgDelta} kg/visita
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
