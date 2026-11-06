import React, { useState } from 'react';
import { Convert } from './Convert.jsx';
import { dilution, fmtNum, massForMolar } from './labLogic';
import { DIMS, fmtSci } from './unitConv';

// Calcoli di banco: diluizione (C1·V1 = C2·V2, si lascia vuoto il valore da trovare) e massa per una soluzione molare.
const F = ({ label, value, onChange, hint }) => (
    <div>
        <label className="fld-label">{label}</label>
        <input className="fld" inputMode="decimal" value={value} placeholder={hint} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const NAMES = { c1: 'Concentrazione iniziale C₁', v1: 'Volume da prelevare V₁', c2: 'Concentrazione finale C₂', v2: 'Volume finale V₂' };
const CUNITS = ['M', 'mM', 'µM', 'nM', 'pM', 'mg/mL', 'µg/mL', 'ng/µL', 'g/L', '%', '×'];
const VUNITS = ['mL', 'L', 'µL'];

const Pair = ({ label, value, onChange, unit, onUnit, units }) => (
    <label className="gr-f">
        <span>{label}</span>
        <div>
            <input className="fld" inputMode="decimal" value={value} placeholder="0" onChange={(e) => onChange(e.target.value)} />
            <select className="fld" value={unit} onChange={(e) => onUnit(e.target.value)} aria-label={`Unità ${label}`}>{units.map((u) => <option key={u}>{u}</option>)}</select>
        </div>
    </label>
);
const allUnits = (value, unit, dim) => Object.entries(DIMS[dim].units).map(([u, f]) => ({ unit: u, value: (value * DIMS[dim].units[unit]) / f }));

export const Dilution = () => {
    const [d, setD] = useState({ c1: '', v1: '', c2: '', v2: '' });
    const [cu, setCu] = useState('mM');
    const [vu, setVu] = useState('mL');
    const dil = dilution(d);
    const isV = dil && dil.field[0] === 'v';
    const unit = dil ? (isV ? vu : cu) : '';
    const v2n = Number(String(d.v2).replace(',', '.'));
    const diluent = dil && dil.field === 'v1' && v2n ? v2n - dil.value : null;
    const cell = (x) => <div key={x.unit}><b>{fmtSci(x.value)}</b><span>{x.unit}</span></div>;
    return (
        <section className="lab-calc-sec gr">
            <h3>Diluizione</h3>
            <p>Compila tre valori e lascia vuoto quello da trovare.</p>
            <div className="gr-box">
                <Pair label="C₁ concentrazione iniziale" value={d.c1} onChange={(v) => setD({ ...d, c1: v })} unit={cu} onUnit={setCu} units={CUNITS} />
                <Pair label="V₁ volume da prelevare" value={d.v1} onChange={(v) => setD({ ...d, v1: v })} unit={vu} onUnit={setVu} units={VUNITS} />
                <Pair label="C₂ concentrazione finale" value={d.c2} onChange={(v) => setD({ ...d, c2: v })} unit={cu} onUnit={setCu} units={CUNITS} />
                <Pair label="V₂ volume finale" value={d.v2} onChange={(v) => setD({ ...d, v2: v })} unit={vu} onUnit={setVu} units={VUNITS} />
            </div>
            <div className="gr-res">
                {dil ? (
                    <>
                        <small>{NAMES[dil.field]}</small>
                        <strong>{fmtSci(dil.value)} {unit}</strong>
                        {isV && <><h4>Volume</h4><div className="gr-all">{allUnits(dil.value, vu, 'L').map(cell)}</div></>}
                        {!isV && DIMS.M.units[cu] && <><h4>Concentrazione</h4><div className="gr-all">{allUnits(dil.value, cu, 'M').map(cell)}</div></>}
                        {diluent !== null && <><h4>Diluente da aggiungere</h4><div className="gr-all">{allUnits(diluent, vu, 'L').map(cell)}</div></>}
                    </>
                ) : <p>Compila tre valori e lascia vuoto quello da trovare: il risultato compare qui.</p>}
            </div>
        </section>
    );
};

export const Molar = () => {
    const [m, setM] = useState({ molarita: '', volume: '', pm: '' });
    const mass = massForMolar(m);
    return (
        <section className="lab-calc-sec">
                <h3>Soluzione molare</h3>
                <div className="grid grid-cols-3 gap-3">
                    <F label="Molarità (mol/L)" value={m.molarita} onChange={(v) => setM({ ...m, molarita: v })} />
                    <F label="Volume (L)" value={m.volume} onChange={(v) => setM({ ...m, volume: v })} />
                    <F label="PM (g/mol)" value={m.pm} onChange={(v) => setM({ ...m, pm: v })} />
                </div>
                <div className="out">{mass !== null ? <>Da pesare: <b>{fmtNum(mass)} g</b></> : <span className="text-[color:var(--muted)]">Inserisci i tre valori.</span>}</div>
        </section>
    );
};

export const Calc = () => (
    <div className="lab-calc">
        <Convert />
        <Dilution />
        <Molar />
    </div>
);
