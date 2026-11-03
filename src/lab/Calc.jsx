import React, { useState } from 'react';
import { dilution, fmtNum, massForMolar } from './labLogic';

// Calcoli di banco: diluizione (C1·V1 = C2·V2, si lascia vuoto il valore da trovare) e massa per una soluzione molare.
const F = ({ label, value, onChange, hint }) => (
    <div>
        <label className="fld-label">{label}</label>
        <input className="fld" inputMode="decimal" value={value} placeholder={hint} onChange={(e) => onChange(e.target.value)} />
    </div>
);

export const Calc = () => {
    const [d, setD] = useState({ c1: '', v1: '', c2: '', v2: '' });
    const [m, setM] = useState({ molarita: '', volume: '', pm: '' });
    const dil = dilution(d);
    const mass = massForMolar(m);
    const names = { c1: 'concentrazione iniziale C₁', v1: 'volume da prelevare V₁', c2: 'concentrazione finale C₂', v2: 'volume finale V₂' };
    return (
        <div className="lab-calc">
            <section>
                <h3>Diluizione</h3>
                <div className="grid grid-cols-2 gap-3">
                    <F label="C₁ iniziale" value={d.c1} onChange={(v) => setD({ ...d, c1: v })} />
                    <F label="V₁ da prelevare" value={d.v1} onChange={(v) => setD({ ...d, v1: v })} />
                    <F label="C₂ finale" value={d.c2} onChange={(v) => setD({ ...d, c2: v })} />
                    <F label="V₂ finale" value={d.v2} onChange={(v) => setD({ ...d, v2: v })} />
                </div>
                <div className="out">{dil ? <>Risultato, {names[dil.field]}: <b>{fmtNum(dil.value)}</b>{dil.field === 'v1' && Number(String(d.v2).replace(',', '.')) ? <div className="text-[12.5px] text-[color:var(--muted)] mt-1">Diluente da aggiungere: {fmtNum(Number(String(d.v2).replace(',', '.')) - dil.value)}</div> : null}</> : <span className="text-[color:var(--muted)]">Servono esattamente tre valori numerici.</span>}</div>
            </section>
            <section>
                <h3>Soluzione molare</h3>
                <div className="grid grid-cols-3 gap-3">
                    <F label="Molarità (mol/L)" value={m.molarita} onChange={(v) => setM({ ...m, molarita: v })} />
                    <F label="Volume (L)" value={m.volume} onChange={(v) => setM({ ...m, volume: v })} />
                    <F label="PM (g/mol)" value={m.pm} onChange={(v) => setM({ ...m, pm: v })} />
                </div>
                <div className="out">{mass !== null ? <>Da pesare: <b>{fmtNum(mass)} g</b></> : <span className="text-[color:var(--muted)]">Inserisci i tre valori.</span>}</div>
            </section>
        </div>
    );
};
