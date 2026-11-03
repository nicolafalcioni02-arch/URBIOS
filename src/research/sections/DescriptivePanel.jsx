import React, { useMemo, useState } from 'react';
import { column, groupingVars, splitBy } from '../logic/dataset';
import { describe, frequencies } from '../logic/stats/descriptive';
import { shapiroWilk } from '../logic/stats/tests';
import { fmt, fmtP } from '../logic/report';
import { VarSelect } from '../ui/VarSelect';
import { Histogram } from '../ui/charts';

const COLS = [
    ['n', 'n', (d) => d.n],
    ['mancanti', 'Mancanti', (d) => d.missing],
    ['media', 'Media', (d) => fmt(d.mean)],
    ['ds', 'DS', (d) => fmt(d.sd)],
    ['ic', 'IC 95%', (d) => (d.n > 1 ? `${fmt(d.ci95[0])}; ${fmt(d.ci95[1])}` : '—')],
    ['mediana', 'Mediana', (d) => fmt(d.median)],
    ['iqr', 'Q1–Q3', (d) => `${fmt(d.q1)}–${fmt(d.q3)}`],
    ['min', 'Min', (d) => fmt(d.min)],
    ['max', 'Max', (d) => fmt(d.max)],
    ['sw', 'Shapiro p', (d) => d.sw],
];

// copia la tabella come testo separato da tabulazioni (si incolla in Word/Excel come tabella)
const copyTsv = (head, rows) => navigator.clipboard?.writeText([head, ...rows].map((r) => r.join('\t')).join('\n')).catch(() => {});

export const DescriptivePanel = ({ ds }) => {
    const nums = ds.vars.filter((v) => v.type === 'num');
    const cats = ds.vars.filter((v) => v.type === 'cat');
    const [picked, setPicked] = useState(() => nums.filter((v) => ['peso', 'bmi_calcolato', 'eta_alla_visita'].includes(v.key)).map((v) => v.key));
    const [group, setGroup] = useState('');
    const [hist, setHist] = useState('');

    const toggle = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

    const rows = useMemo(() => {
        const out = [];
        picked.forEach((k) => {
            const v = ds.vars.find((x) => x.key === k);
            if (!v) return;
            const parts = group ? splitBy(ds, k, group) : [{ name: 'Tutti', values: column(ds, k) }];
            parts.forEach((g) => {
                const d = describe(g.values);
                const sw = d.n >= 3 ? shapiroWilk(g.values) : null;
                d.sw = sw && !sw.error ? fmtP(sw.p) : '—';
                out.push({ key: k + g.name, label: v.label, group: g.name, d });
            });
        });
        return out;
    }, [ds, picked, group]);

    const head = ['Variabile', ...(group ? ['Gruppo'] : []), ...COLS.map((c) => c[1])];
    const body = rows.map((r) => [r.label, ...(group ? [r.group] : []), ...COLS.map((c) => String(c[2](r.d)))]);
    const histKey = hist || picked[0];

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <p className="rs-h">Variabili numeriche</p>
                <div className="rs-pick">
                    {nums.map((v) => (
                        <label key={v.key} className={picked.includes(v.key) ? 'on' : ''}>
                            <input type="checkbox" className="sr-only" checked={picked.includes(v.key)} onChange={() => toggle(v.key)} />
                            {v.label}
                        </label>
                    ))}
                </div>
                <div className="rs-grid">
                    <VarSelect label="Dividi per gruppo (facoltativo)" vars={groupingVars(ds)} value={group} onChange={setGroup} allowEmpty />
                </div>
            </div>

            {rows.length > 0 && (
                <div className="panel rs-stack">
                    <div className="flex items-center justify-between">
                        <p className="rs-h !mb-0">Statistiche descrittive</p>
                        <button className="vw-chip" onClick={() => copyTsv(head, body)}>
                            <i className="ph ph-table"></i>Copia tabella
                        </button>
                    </div>
                    <div className="rs-scroll">
                        <table className="rs-table">
                            <thead>
                                <tr>
                                    {head.map((h, i) => (
                                        <th key={h} className={i > (group ? 1 : 0) ? 'n' : ''}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {body.map((r, i) => (
                                    <tr key={rows[i].key}>
                                        {r.map((c, j) => (
                                            <td key={j} className={j > (group ? 1 : 0) ? 'n' : ''}>
                                                {c}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="rs-muted">DS = deviazione standard; IC 95% della media (t di Student); Shapiro p &lt; ,05 indica una distribuzione non normale.</p>
                </div>
            )}

            {picked.length > 0 && (
                <div className="panel rs-stack">
                    <div className="rs-grid">
                        <VarSelect label="Istogramma di" vars={nums.filter((v) => picked.includes(v.key))} value={histKey} onChange={setHist} />
                    </div>
                    <Histogram values={column(ds, histKey)} />
                </div>
            )}

            {cats.length > 0 && (
                <div className="panel rs-stack">
                    <p className="rs-h">Variabili categoriche</p>
                    <div className="rs-grid">
                        {cats.map((v) => {
                            const f = frequencies(column(ds, v.key));
                            return (
                                <div key={v.key}>
                                    <p className="text-[13px] font-semibold mb-1">{v.label}</p>
                                    <table className="rs-table rs-cat">
                                        <tbody>
                                            {f.rows.map((r) => (
                                                <tr key={r.value}>
                                                    <td>{r.value}</td>
                                                    <td className="n">{r.count}</td>
                                                    <td className="n">{fmt(r.pct, 1)}%</td>
                                                </tr>
                                            ))}
                                            {f.missing > 0 && (
                                                <tr>
                                                    <td className="rs-muted">mancanti</td>
                                                    <td className="n">{f.missing}</td>
                                                    <td></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
