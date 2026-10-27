import React, { useMemo, useState } from 'react';
import { column, labelOf } from '../logic/dataset';
import { linearRegression } from '../logic/stats/regression';
import { fmt, fmtP } from '../logic/report';
import { VarSelect } from '../ui/VarSelect';
import { ResultCard } from '../ui/ResultCard';
import { Scatter } from '../ui/charts';

// Regressione lineare con uno o più predittori numerici (le variabili 0/1 funzionano come dummy)
export const RegressionPanel = ({ ds }) => {
    const nums = ds.vars.filter((v) => v.type === 'num');
    const [y, setY] = useState(nums.find((v) => v.key === 'peso')?.key || '');
    const [xs, setXs] = useState([]);
    const toggle = (k) => setXs((p) => (p.includes(k) ? p.filter((q) => q !== k) : [...p, k]));

    const res = useMemo(() => {
        if (!y || !xs.length) return null;
        const X = {};
        xs.forEach((k) => (X[k] = column(ds, k)));
        return linearRegression(column(ds, y), X);
    }, [ds, y, xs]);

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <div className="rs-grid">
                    <VarSelect label="Variabile dipendente (Y)" vars={nums} value={y} onChange={(v) => (setY(v), setXs((p) => p.filter((k) => k !== v)))} />
                </div>
                <div>
                    <span className="fld-label">Predittori (X)</span>
                    <div className="rs-pick">
                        {nums
                            .filter((v) => v.key !== y)
                            .map((v) => (
                                <label key={v.key} className={xs.includes(v.key) ? 'on' : ''}>
                                    <input type="checkbox" className="sr-only" checked={xs.includes(v.key)} onChange={() => toggle(v.key)} />
                                    {v.label}
                                </label>
                            ))}
                    </div>
                </div>
            </div>
            {res && (
                <ResultCard result={res} outcome={labelOf(y)}>
                    {!res.error && (
                        <>
                            <div className="rs-scroll">
                                <table className="rs-table">
                                    <thead>
                                        <tr>
                                            <th>Predittore</th>
                                            <th className="n">B</th>
                                            <th className="n">ES</th>
                                            <th className="n">t</th>
                                            <th className="n">p</th>
                                            <th className="n">IC 95%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {res.coefs.map((c) => (
                                            <tr key={c.name}>
                                                <td>{c.name === '(Intercetta)' ? c.name : labelOf(c.name)}</td>
                                                <td className="n">{fmt(c.b, 3)}</td>
                                                <td className="n">{fmt(c.se, 3)}</td>
                                                <td className="n">{fmt(c.t)}</td>
                                                <td className="n">{fmtP(c.p)}</td>
                                                <td className="n">
                                                    {fmt(c.ci[0], 3)}; {fmt(c.ci[1], 3)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="rs-muted">
                                n = {res.n}; R² = {fmt(res.r2, 3)}; R² corretto = {fmt(res.adjR2, 3)}; errore standard della stima = {fmt(res.rmse)}.
                            </p>
                            {xs.length === 1 && <Scatter xs={column(ds, xs[0])} ys={column(ds, y)} line={{ a: res.coefs[0].b, b: res.coefs[1].b }} />}
                            <p className="rs-muted">Residui vs valori stimati (controllo di linearità e varianza costante):</p>
                            <Scatter xs={res.fitted} ys={res.resid} />
                        </>
                    )}
                </ResultCard>
            )}
        </div>
    );
};
