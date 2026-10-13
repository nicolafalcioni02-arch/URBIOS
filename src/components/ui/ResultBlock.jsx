import React from 'react';
import { calculateEquation } from '../../logic/calculations';

export const ResultBlock = ({ title, config, setConfig, formuleDensita, formuleConversione, calculationContext, accent }) => {
    // Configurazione colori per modalità chiara (Light Mode)
    const highlightText = 'text-[color:var(--muted)]';
    const labelColor = 'text-gray-500';
    const valueColor = 'text-gray-900'; // Colore scuro (quasi nero) per i numeri
    const borderColor = 'border-gray-100'; // Separatori molto leggeri

    // Calcoli (Invariati)
    const formulaDensita = formuleDensita.find((f) => f.id === Number(config.densId));
    // senza pliche inserite le formule darebbero valori privi di senso (es. massa grassa negativa): non si calcola nulla
    const hasPliche = (parseFloat(calculationContext.sommaPliche) || 0) > 0;
    const dc = formulaDensita && hasPliche ? calculateEquation(formulaDensita.equazione, calculationContext) : null;
    const convContext = { ...calculationContext, dc: dc };

    const formulaConv = formuleConversione.find((f) => f.id === Number(config.convId));
    const fmPercent = dc && formulaConv ? calculateEquation(formulaConv.equazione, convContext) : null;

    const peso = parseFloat(calculationContext.peso) || 0;
    const fmKg = fmPercent && peso > 0 ? ((peso * fmPercent) / 100).toFixed(1) : '--';
    const ffmKg = fmPercent && peso > 0 ? (peso - (peso * fmPercent) / 100).toFixed(1) : '--';
    const ffmPercent = fmPercent ? (100 - fmPercent).toFixed(1) : '--';
    const fmPercentDisplay = fmPercent ? fmPercent.toFixed(2) : '--';
    const dcDisplay = dc ? dc.toFixed(4) : '--';

    return (
        <div className="panel">
            <h5 className="font-semibold text-[15px] text-[color:var(--ink)] mb-4">{title}</h5>

            <div className="space-y-3 mb-6">
                {/* SELECT DENSITÀ */}
                <div>
                    <label className="fld-label">Equazione di densità</label>
                    <select
                        value={config.densId || ''}
                        onChange={(e) => setConfig({ ...config, densId: Number(e.target.value) })}
                        className="fld !text-[13px]"
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
                    <label className="fld-label">Conversione in % massa grassa</label>
                    <select
                        value={config.convId || ''}
                        onChange={(e) => setConfig({ ...config, convId: Number(e.target.value) })}
                        className="fld !text-[13px]"
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
                        <p className={`text-xs font-medium ${labelColor}`}>Massa grassa</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-bold tracking-tight ${valueColor}`}>{fmPercentDisplay}</span>
                            <span className={`text-sm font-bold ${highlightText}`}>%</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-xs font-medium ${labelColor}`}>FM kg</p>
                        <span className={`text-2xl font-bold ${valueColor}`}>
                            {fmKg} <small className="text-[10px] text-gray-400">kg</small>
                        </span>
                    </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${borderColor}`}>
                    <div>
                        <p className={`text-xs font-medium ${labelColor}`}>Massa magra</p>
                        <p className={`text-lg font-bold ${valueColor}`}>{ffmPercent}%</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-xs font-medium ${labelColor}`}>FFM kg</p>
                        <p className={`text-lg font-bold ${valueColor}`}>
                            {ffmKg} <small className="text-[10px] text-gray-400">kg</small>
                        </p>
                    </div>
                </div>

                <div className={`mt-4 pt-3 border-t ${borderColor} flex justify-between`}>
                    <span className={`text-xs font-medium ${labelColor}`}>Densità corporea</span>
                    <span className={`text-[10px] font-mono ${highlightText}`}>{dcDisplay} g/cm³</span>
                </div>
            </div>
        </div>
    );
};
