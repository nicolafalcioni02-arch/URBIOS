import React, { useState, useEffect } from 'react';

export const InputGroup = ({ label, value: valueProp, placeholder, type = 'text', full = false, options = null, unit = null, onChange, name }) => {
    const [local, setLocal] = useState(valueProp ?? '');

    useEffect(() => {
        setLocal(valueProp ?? '');
    }, [valueProp]);

    const commit = (val) => {
        if (val !== valueProp) {
            onChange && onChange(name, val);
        }
    };

    return (
        <div className={`space-y-1.5 ${full ? 'col-span-full' : ''}`}>
            <label className="font-[Helvetica] text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">{label}</label>
            <div className="relative flex items-center">
                {options ? (
                    <div className="w-full relative">
                        <select
                            value={local}
                            onChange={(e) => {
                                setLocal(e.target.value);
                                commit(e.target.value);
                            }}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-medium appearance-none focus:ring-1 focus:ring-black transition-all text-gray-700 cursor-pointer"
                        >
                            {options.map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                        <i className="ph ph-caret-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
                    </div>
                ) : (
                    <input
                        type={type}
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                commit(local);
                                e.target.blur();
                            }
                        }}
                        onBlur={() => commit(local)}
                        placeholder={placeholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 text-gray-700"
                    />
                )}
                {unit && <span className="absolute right-3 text-xs text-gray-400 font-medium pointer-events-none">{unit}</span>}
            </div>
        </div>
    );
};

// Aggiungiamo qui anche il componente TextAreaGroup per comodità
export const TextAreaGroup = ({ label, value: valueProp, placeholder, rows = 3, name, onChange }) => {
    const [local, setLocal] = useState(valueProp ?? '');
    useEffect(() => {
        setLocal(valueProp ?? '');
    }, [valueProp]);
    const commit = () => {
        onChange && onChange(name, local);
    };

    return (
        <div className="space-y-1.5 col-span-full">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">{label}</label>
            <textarea
                value={local}
                name={name}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => commit()}
                rows={rows}
                placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 text-gray-700 resize-none"
            ></textarea>
        </div>
    );
};

// Aggiungiamo anche il BilateralInput
export const BilateralInput = ({ label, name, onChange }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded transition-colors">
        <span className="text-sm font-medium text-gray-600 w-1/3">{label}</span>
        <div className="flex gap-2 w-2/3">
            <div className="relative w-full">
                <input
                    type="number"
                    placeholder="SX"
                    onBlur={(e) => onChange && onChange(`${name}_sx`, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm text-center focus:border-black outline-none"
                />
                <span className="absolute right-1 top-1.5 text-[8px] text-gray-300">L</span>
            </div>
            <div className="relative w-full">
                <input
                    type="number"
                    placeholder="DX"
                    onBlur={(e) => onChange && onChange(`${name}_dx`, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm text-center focus:border-black outline-none"
                />
                <span className="absolute right-1 top-1.5 text-[8px] text-gray-300">R</span>
            </div>
        </div>
    </div>
);
