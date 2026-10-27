import React, { useMemo, useState } from 'react';
import { column, groupingVars, labelOf } from '../logic/dataset';
import { chiSquare, crosstab } from '../logic/stats/tests';
import { fmt } from '../logic/report';
import { VarSelect } from '../ui/VarSelect';
import { ResultCard } from '../ui/ResultCard';

// Tabella di contingenza tra due variabili categoriche + chi quadro (Fisher se 2x2 con attese basse)
export const CrosstabPanel = ({ ds }) => {
    const cats = groupingVars(ds);
    const [a, setA] = useState(cats[0]?.key || '');
    const [b, setB] = useState(cats[1]?.key || '');
    const ct = useMemo(() => (a && b && a !== b ? crosstab(column(ds, a), column(ds, b)) : null), [ds, a, b]);
    const res = ct && ct.n ? chiSquare(ct) : null;

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <div className="rs-grid">
                    <VarSelect label="Righe" vars={cats} value={a} onChange={setA} />
                    <VarSelect label="Colonne" vars={cats} value={b} onChange={setB} exclude={[a]} />
                </div>
                {cats.length < 2 && <p className="rs-muted">Servono almeno due variabili categoriche con più modalità.</p>}
            </div>
            {ct && ct.n > 0 && (
                <div className="panel rs-scroll">
                    <table className="rs-table">
                        <thead>
                            <tr>
                                <th>
                                    {labelOf(a)} \ {labelOf(b)}
                                </th>
                                {ct.cols.map((c) => (
                                    <th key={c} className="n">
                                        {c}
                                    </th>
                                ))}
                                <th className="n">Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ct.rows.map((r, i) => {
                                const tot = ct.table[i].reduce((s, v) => s + v, 0);
                                return (
                                    <tr key={r}>
                                        <td>{r}</td>
                                        {ct.table[i].map((v, j) => (
                                            <td key={j} className="n">
                                                {v} <span className="rs-muted">({fmt(tot ? (v / tot) * 100 : 0, 0)}%)</span>
                                            </td>
                                        ))}
                                        <td className="n">{tot}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <p className="rs-muted mt-2">Percentuali di riga. n = {ct.n}.</p>
                </div>
            )}
            {res && <ResultCard result={res} outcome={`${labelOf(a)} e ${labelOf(b)}`} />}
            {res && res.fisher && <ResultCard result={res.fisher} outcome={`${labelOf(a)} e ${labelOf(b)}`} title="Test esatto di Fisher (consigliato)" />}
        </div>
    );
};
