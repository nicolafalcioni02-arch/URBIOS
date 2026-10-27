import React, { useMemo, useState } from 'react';
import { column, labelOf } from '../logic/dataset';
import { pearson, spearman } from '../logic/stats/tests';
import { linearRegression } from '../logic/stats/regression';
import { fmt, stars } from '../logic/report';
import { VarSelect } from '../ui/VarSelect';
import { ResultCard } from '../ui/ResultCard';
import { Scatter } from '../ui/charts';

// Correlazione tra due variabili + matrice di correlazione su più variabili
export const CorrelationPanel = ({ ds }) => {
    const nums = ds.vars.filter((v) => v.type === 'num');
    const [x, setX] = useState(nums.find((v) => v.key === 'cm_vita_min')?.key || nums[0]?.key || '');
    const [y, setY] = useState(nums.find((v) => v.key === 'peso')?.key || nums[1]?.key || '');
    const [method, setMethod] = useState('pearson');
    const [matrix, setMatrix] = useState([]);

    const xs = column(ds, x);
    const ys = column(ds, y);
    const fn = method === 'pearson' ? pearson : spearman;
    const res = x && y ? fn(xs, ys) : null;
    const fit = useMemo(() => {
        const r = x && y ? linearRegression(ys, { [x]: xs }) : null;
        return r && !r.error ? { a: r.coefs[0].b, b: r.coefs[1].b } : null;
    }, [x, y, ds]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = (k) => setMatrix((m) => (m.includes(k) ? m.filter((q) => q !== k) : [...m, k]));

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <div className="rs-grid">
                    <VarSelect label="Variabile X" vars={nums} value={x} onChange={setX} />
                    <VarSelect label="Variabile Y" vars={nums} value={y} onChange={setY} exclude={[x]} />
                </div>
                <div className="seg">
                    {[
                        ['pearson', 'Pearson'],
                        ['spearman', 'Spearman (ranghi)'],
                    ].map(([id, l]) => (
                        <button key={id} className={method === id ? 'on' : ''} onClick={() => setMethod(id)} style={{ padding: '6px 14px', fontSize: 13 }}>
                            {l}
                        </button>
                    ))}
                </div>
                <p className="rs-muted">Pearson per relazioni lineari tra variabili circa normali; Spearman se i dati sono asimmetrici, ordinali o con valori anomali.</p>
            </div>
            {res && (
                <ResultCard result={res} outcome={`${labelOf(x)} e ${labelOf(y)}`} title={`${res.test}: ${labelOf(x)} × ${labelOf(y)}`}>
                    <Scatter xs={xs} ys={ys} line={method === 'pearson' ? fit : null} />
                </ResultCard>
            )}

            <div className="panel rs-stack">
                <p className="rs-h">Matrice di correlazione ({method === 'pearson' ? 'r di Pearson' : 'ρ di Spearman'})</p>
                <div className="rs-pick">
                    {nums.map((v) => (
                        <label key={v.key} className={matrix.includes(v.key) ? 'on' : ''}>
                            <input type="checkbox" className="sr-only" checked={matrix.includes(v.key)} onChange={() => toggle(v.key)} />
                            {v.label}
                        </label>
                    ))}
                </div>
                {matrix.length >= 2 && (
                    <div className="rs-scroll">
                        <table className="rs-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {matrix.map((k, j) => (
                                        <th key={k} className="n" title={labelOf(k)}>
                                            {j + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((a, i) => (
                                    <tr key={a}>
                                        <td>
                                            {i + 1}. {labelOf(a)}
                                        </td>
                                        {matrix.map((b, j) => {
                                            if (j >= i) return <td key={b} className="n">{j === i ? '—' : ''}</td>;
                                            const r = fn(column(ds, a), column(ds, b));
                                            return (
                                                <td key={b} className="n" title={r.error || `n = ${r.n}`}>
                                                    {r.error ? '·' : `${fmt(r.stat.value)}${stars(r.p) === 'n.s.' ? '' : stars(r.p)}`}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="rs-muted mt-2">* p &lt; ,05; ** p &lt; ,01; *** p &lt; ,001. Coppie con dati mancanti escluse caso per caso.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
