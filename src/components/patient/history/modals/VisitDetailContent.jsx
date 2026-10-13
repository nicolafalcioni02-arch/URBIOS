import React from 'react';
import { DEFAULT_RANGE_EMATO } from '../../../../logic/db_defaults';

export const VisitDetailContent = ({ selectedVisit }) => {
    if (!selectedVisit) return null;
    const dettagli = selectedVisit.dettagli || {};
    const ematoKeys = DEFAULT_RANGE_EMATO ? Object.keys(DEFAULT_RANGE_EMATO) : [];
    const esamiCompilati = ematoKeys.filter((key) => dettagli[key] && dettagli[key] !== '');
    const genericEntries = Object.entries(dettagli).filter(([key, val]) => {
        if (ematoKeys.includes(key)) return false;
        if (key === 'note') return false;
        if (key.includes('risultati_metodo')) return false;
        if (typeof val === 'object' && val !== null) return false;
        if (!val) return false;
        return true;
    });

    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Peso</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {selectedVisit.peso} <span className="text-sm font-normal text-gray-500">kg</span>
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400">BMI</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {dettagli.peso && dettagli.altezza ? (dettagli.peso / (dettagli.altezza / 100) ** 2).toFixed(1) : '-'}
                    </p>
                </div>
            </div>

            {esamiCompilati.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                            <i className="ph ph-drop text-lg"></i>
                        </div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-gray-700">Profilo Ematochimico</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {esamiCompilati.map((key) => {
                            const config = DEFAULT_RANGE_EMATO[key];
                            const val = dettagli[key];
                            return (
                                <div key={key} className="bg-gray-50/50 border border-gray-100 p-3 rounded-lg">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate" title={config.label}>
                                        {config.label}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-gray-800">{val}</span>
                                        <span className="text-[10px] text-gray-500">{config.unit}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {dettagli.risultati_metodo_A && (
                <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-blue-600">Analisi Metodo A</h4>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col gap-1">
                        {Object.entries(dettagli.risultati_metodo_A).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center text-xs border-b border-blue-200/50 last:border-0 pb-1 last:pb-0">
                                <span className="text-blue-800/70 font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                                <span className="font-bold text-blue-900">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {genericEntries.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-6">
                        <i className="ph ph-ruler text-gray-400 text-lg"></i>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-gray-700">Altre Misure</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        {genericEntries.map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-gray-50 py-2">
                                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="font-bold text-gray-800">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedVisit.note && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 mt-4">
                    <p className="text-[10px] uppercase font-bold text-amber-600 mb-1 opacity-70">Note</p>
                    <p className="text-sm italic">"{selectedVisit.note}"</p>
                </div>
            )}
        </div>
    );
};
