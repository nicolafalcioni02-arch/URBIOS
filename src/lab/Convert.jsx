import React, { useState } from 'react';
import { UnitInfo } from './UnitInfo';
import { DIMS, convertAll, dimOf, fmtSci } from './unitConv';

// Convertitore: valore + unità → tutte le unità della stessa grandezza e, con il PM, anche moli↔grammi e molarità↔g/L.
export const Convert = () => {
    const [v, setV] = useState('');
    const [u, setU] = useState('mol');
    const [pm, setPm] = useState('');
    const res = convertAll(v, u, pm);
    return (
        <section className="lab-conv">
            <h3 className="lab-conv-h">Convertitore <UnitInfo /></h3>
            <p>Moli, grammi, litri, molarità: scrivi un valore e scegli l’unità. Con il PM passi anche da moli a grammi e da molarità a g/L.</p>
            <div className="lab-conv-in">
                <input className="fld" inputMode="decimal" value={v} placeholder="Valore" aria-label="Valore" onChange={(e) => setV(e.target.value)} />
                <select className="fld" value={u} aria-label="Unità" onChange={(e) => setU(e.target.value)}>
                    {Object.entries(DIMS).map(([k, d]) => <optgroup key={k} label={d.label}>{Object.keys(d.units).map((x) => <option key={x} value={x}>{x}</option>)}</optgroup>)}
                </select>
            </div>
            <input className="fld lab-conv-pm" inputMode="decimal" value={pm} placeholder="PM (g/mol), per moli ↔ grammi" aria-label="PM in g/mol" onChange={(e) => setPm(e.target.value)} />
            {res.map((g) => (
                <div key={g.dim} className="lab-conv-g">
                    <small>{g.label}</small>
                    {g.needsPm ? <p>Inserisci il PM per vedere {DIMS[g.dim].label.toLowerCase()}.</p> : (
                        <div className="lab-conv-rows">
                            {g.rows.map((r) => <div key={r.unit} className={r.unit === u ? 'is-in' : ''}><b>{fmtSci(r.value)}</b><span>{r.unit}</span></div>)}
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
};
