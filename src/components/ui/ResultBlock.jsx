import React from 'react';
import { calculateEquation } from '../../logic/calculations';

export const ResultBlock = ({ title, config, setConfig, formuleDensita, formuleConversione, calculationContext, accent }) => {
    // Configurazione colori per modalità chiara (Light Mode)
    const highlightText = accent === 'blue' ? 'text-blue-600' : 'text-emerald-600';
    const labelColor = 'text-gray-500';
    const valueColor = 'text-gray-900'; // Colore scuro (quasi nero) per i numeri
    const borderColor = 'border-gray-100'; // Separatori molto leggeri

    // Calcoli (Invariati)
    const formulaDensita = formuleDensita.find((f) => f.id === Number(config.densId));
    const dc = formulaDensita ? calculateEquation(formulaDensita.equazione, calculationContext) : null;
    const convContext = { ...calculationContext, dc: dc };

    const formulaConv = formuleConversione.find((f) => f.id === Number(config.convId));
    const fmPercent = dc && formulaConv ? calculateEquation(formulaConv.equazione, convContext) : null;

    const peso = parseFloat(calculationContext.peso) || 0;
    const fmKg = fmPercent ? ((peso * fmPercent) / 100).toFixed(1) : '--';
    const ffmKg = fmPercent ? (peso - (peso * fmPercent) / 100).toFixed(1) : '--';
    const ffmPercent = fmPercent ? (100 - fmPercent).toFixed(1) : '--';
    const fmPercentDisplay = fmPercent ? fmPercent.toFixed(2) : '--';
    const dcDisplay = dc ? dc.toFixed(4) : '--';

    return (
        <div className={`p-6 rounded-2xl bg-white border ${borderColor} shadow-sm`}>
            <h5 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${highlightText}`}>{title}</h5>

            <div className="space-y-3 mb-6">
                {/* SELECT DENSITÀ */}
                <div>
                    <label className="text-[8px] uppercase font-bold text-gray-400 ml-1">Equazione Densità</label>
                    <select
                        value={config.densId || ''}
                        onChange={(e) => setConfig({ ...config, densId: Number(e.target.value) })}
                        className="w-full text-[11px] font-bold p-2.5 rounded-lg outline-none mt-1 bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                        {formuleDensita.length > 0 ? (
                            formuleDensita.map((f) => (
                                <option key={f.id} value={f.id} className="text-gray-900">
                                    {f.titolo}
                                </option>
                            ))
                        ) : (
                            <option className="text-gray-500">Nessuna formula disponibile</option>
                        )}
                    </select>
                </div>

                {/* SELECT CONVERSIONE */}
                <div>
                    <label className="text-[8px] uppercase font-bold text-gray-400 ml-1">Conversione % FM</label>
                    <select
                        value={config.convId || ''}
                        onChange={(e) => setConfig({ ...config, convId: Number(e.target.value) })}
                        className="w-full text-[11px] font-bold p-2.5 rounded-lg outline-none mt-1 bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                        {formuleConversione.length > 0 ? (
                            formuleConversione.map((f) => (
                                <option key={f.id} value={f.id} className="text-gray-900">
                                    {f.titolo}
                                </option>
                            ))
                        ) : (
                            <option className="text-gray-500">Nessuna formula disponibile</option>
                        )}
                    </select>
                </div>
            </div>

            {/* SEZIONE RISULTATI */}
            <div className={`pt-4 border-t ${borderColor}`}>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className={`text-[9px] font-bold uppercase ${labelColor}`}>Massa Grassa (FM)</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-bold ${valueColor}`}>{fmPercentDisplay}</span>
                            <span className={`text-sm font-bold ${highlightText}`}>%</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-[9px] font-bold uppercase ${labelColor}`}>FM kg</p>
                        <span className={`text-2xl font-bold ${valueColor}`}>
                            {fmKg} <small className="text-[10px] text-gray-400">kg</small>
                        </span>
                    </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${borderColor}`}>
                    <div>
                        <p className={`text-[9px] font-bold uppercase ${labelColor}`}>Massa Magra (FFM)</p>
                        <p className={`text-lg font-bold ${valueColor}`}>{ffmPercent}%</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-[9px] font-bold uppercase ${labelColor}`}>FFM kg</p>
                        <p className={`text-lg font-bold ${valueColor}`}>
                            {ffmKg} <small className="text-[10px] text-gray-400">kg</small>
                        </p>
                    </div>
                </div>

                <div className={`mt-4 pt-3 border-t ${borderColor} flex justify-between`}>
                    <span className={`text-[9px] font-bold uppercase ${labelColor}`}>Densità Corporea:</span>
                    <span className={`text-[10px] font-mono ${highlightText}`}>{dcDisplay} g/cm³</span>
                </div>
            </div>
        </div>
    );
};
