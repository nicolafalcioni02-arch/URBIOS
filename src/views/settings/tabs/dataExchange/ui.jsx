import React from 'react';

export const Section = ({ title, hint, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">{title}</h4>
        {hint && <p className="text-xs text-gray-500 mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
    </div>
);

export const Check = ({ label, hint, checked, onChange, disabled }) => (
    <label className={`flex items-start gap-3 py-1.5 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
        <input type="checkbox" className="mt-1 w-4 h-4 shrink-0" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-sm text-gray-800">
            {label}
            {hint && <span className="block text-xs text-gray-500">{hint}</span>}
        </span>
    </label>
);

export const Radio = ({ name, value, current, onChange, label, hint }) => (
    <label className="flex items-start gap-3 py-1.5 cursor-pointer">
        <input type="radio" name={name} className="mt-1 w-4 h-4 shrink-0" checked={current === value} onChange={() => onChange(value)} />
        <span className="text-sm text-gray-800">
            {label}
            {hint && <span className="block text-xs text-gray-500">{hint}</span>}
        </span>
    </label>
);

export const Btn = ({ children, variant = 'dark', ...props }) => (
    <button
        {...props}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all ${
            variant === 'dark' ? 'bg-black text-white hover:bg-gray-900' : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);

export const Select = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-md border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-black"
    >
        {options.map((o) => (
            <option key={o.value} value={o.value}>
                {o.label}
            </option>
        ))}
    </select>
);
