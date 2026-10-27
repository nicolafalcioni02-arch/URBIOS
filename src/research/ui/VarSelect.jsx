import React from 'react';

// Menu a tendina di una variabile del dataset. `vars` è già filtrato dal chiamante (numeriche, di gruppo...).
export const VarSelect = ({ label, vars, value, onChange, allowEmpty = false, exclude = [] }) => (
    <div>
        <label className="fld-label">{label}</label>
        <select className="fld rs-sel" value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {(allowEmpty || !value) && <option value="">{allowEmpty ? '— nessuna —' : 'Scegli…'}</option>}
            {vars
                .filter((v) => !exclude.includes(v.key))
                .map((v) => (
                    <option key={v.key} value={v.key}>
                        {v.label} · n={v.n}
                    </option>
                ))}
        </select>
    </div>
);
