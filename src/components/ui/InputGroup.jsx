import React, { useState, useEffect } from 'react';

export const InputGroup = ({ label, value: valueProp, placeholder, type = 'text', full = false, options = null, unit = null, grow = false, inputClass = '', maxLength, onChange, name }) => {
    const [local, setLocal] = useState(valueProp ?? '');
    const taRef = React.useRef(null);
    // il campo "grow" è una riga che si allunga a capo invece di tagliare il testo
    const fit = () => {
        const el = taRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    };
    useEffect(fit, [local, grow]);

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
            <label className="fld-label">{label}</label>
            <div className="relative flex items-center">
                {options ? (
                    <div className="w-full relative">
                        <select
                            value={local}
                            onChange={(e) => {
                                setLocal(e.target.value);
                                commit(e.target.value);
                            }}
                            className="fld"
                        >
                            {options.map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                        <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                ) : grow ? (
                    <textarea
                        ref={taRef}
                        rows={1}
                        value={local}
                        onChange={(e) => setLocal(e.target.value.replace(/\n/g, ' '))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                commit(local);
                                e.target.blur();
                            }
                        }}
                        onBlur={() => commit(local)}
                        placeholder={placeholder || ' '}
                        className="fld resize-none overflow-hidden"
                        style={{ lineHeight: 1.35 }}
                    ></textarea>
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
                        placeholder={placeholder || ' '}
                        maxLength={maxLength}
                        className={`fld ${inputClass}`}
                        style={unit ? { paddingRight: 40 } : undefined}
                        inputMode={type === 'number' ? 'decimal' : undefined}
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
            {label ? <label className="fld-label">{label}</label> : null}
            <textarea
                value={local}
                name={name}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => commit()}
                rows={rows}
                placeholder={placeholder}
                className="fld resize-none"
                style={{ lineHeight: 1.5 }}
            ></textarea>
        </div>
    );
};

// Riga sinistra / destra: il nome a sinistra e due caselle uguali (le intestazioni Sx / Dx stanno sopra, nella scheda)
export const BilateralInput = ({ label, name, onChange }) => (
    <div className="bil-row">
        <span className="bil-label" title={label}>
            {label}
        </span>
        <input type="text" inputMode="decimal" placeholder="–" aria-label={`${label} sinistro`} onBlur={(e) => onChange && onChange(`${name}_sx`, e.target.value)} className="fld bil-fld" />
        <input type="text" inputMode="decimal" placeholder="–" aria-label={`${label} destro`} onBlur={(e) => onChange && onChange(`${name}_dx`, e.target.value)} className="fld bil-fld" />
    </div>
);
