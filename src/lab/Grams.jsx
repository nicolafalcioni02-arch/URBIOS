import React, { useState } from 'react';
import { UnitInfo } from './UnitInfo';
import { DIMS, fmtMass, fmtSci, gramsFor, sameConc } from './unitConv';

// «Quanti grammi mi servono?»: peso molecolare + concentrazione + volume → massa da pesare.
// Oppure «stessa concentrazione»: quanti grammi di una nuova molecola per avere la concentrazione di un'altra già preparata.
const Num = ({ label, value, onChange, unit, onUnit, units, ph }) => (
    <label className="gr-f">
        <span>{label}</span>
        <div>
            <input className="fld" inputMode="decimal" value={value} placeholder={ph || '0'} onChange={(e) => onChange(e.target.value)} />
            {units && <select className="fld" value={unit} onChange={(e) => onUnit(e.target.value)} aria-label={`Unità ${label}`}>{units.map((u) => <option key={u}>{u}</option>)}</select>}
        </div>
    </label>
);

// Risultato: la massa principale in grande, poi tutti i valori in tutte le unità (massa e moli)
const Result = ({ r, same }) => {
    if (!r) return <div className="gr-res"><p>Compila i campi: i risultati compaiono qui.</p></div>;
    const mass = Object.entries(DIMS.g.units).map(([unit, f]) => ({ unit, value: r.grams / f }));
    const amt = Object.entries(DIMS.mol.units).map(([unit, f]) => ({ unit, value: r.mol / f }));
    const cell = (x) => <div key={x.unit}><b>{fmtSci(x.value)}</b><span>{x.unit}</span></div>;
    return (
        <div className="gr-res">
            <small>Devi pesare</small>
            <strong>{fmtMass(r.grams)}</strong>
            <h4>Massa</h4>
            <div className="gr-all">{mass.map(cell)}</div>
            <h4>Quantità di sostanza</h4>
            <div className="gr-all">{amt.map(cell)}</div>
            {same && r.molar ? <><h4>Concentrazione</h4><div className="gr-all">{Object.entries(DIMS.M.units).map(([unit, f]) => cell({ unit, value: r.molar / f }))}</div></> : null}
        </div>
    );
};

export const Grams = () => {
    const [mode, setMode] = useState('conc');
    const [s, setS] = useState({ pm: '', conc: '', cu: 'mM', vol: '', vu: 'mL', pm0: '', g0: '', v0: '', v0u: 'mL' });
    const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
    const r = mode === 'conc' ? gramsFor(s) : sameConc(s);
    return (
        <section className="gr">
            <div className="gr-head"><span>Quanti grammi servono?</span><UnitInfo /></div>
            <div className="gr-seg" role="tablist">
                <button className={mode === 'conc' ? 'on' : ''} onClick={() => setMode('conc')}>Ho la concentrazione</button>
                <button className={mode === 'same' ? 'on' : ''} onClick={() => setMode('same')}>Stessa di un’altra molecola</button>
            </div>
            {mode === 'same' && (
                <div className="gr-box">
                    <b>Molecola già preparata</b>
                    <Num label="Peso molecolare (g/mol)" value={s.pm0} onChange={set('pm0')} />
                    <Num label="Grammi usati" value={s.g0} onChange={set('g0')} />
                    <Num label="In che volume" value={s.v0} onChange={set('v0')} unit={s.v0u} onUnit={set('v0u')} units={['mL', 'L', 'µL']} />
                </div>
            )}
            <div className="gr-box">
                {mode === 'same' && <b>Nuova molecola</b>}
                <Num label="Peso molecolare (g/mol)" value={s.pm} onChange={set('pm')} />
                {mode === 'conc' && <Num label="Concentrazione che vuoi" value={s.conc} onChange={set('conc')} unit={s.cu} onUnit={set('cu')} units={['M', 'mM', 'µM', 'nM', 'pM']} />}
                <Num label="Volume da preparare" value={s.vol} onChange={set('vol')} unit={s.vu} onUnit={set('vu')} units={['mL', 'L', 'µL']} />
            </div>
            <Result r={r} same={mode === 'same'} />
        </section>
    );
};
