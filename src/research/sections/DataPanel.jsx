import React from 'react';
import { toCsv } from '../../dataExchange/csv';
import { downloadBlob } from '../../storage/fileIO';
import { todayStamp } from '../../dataExchange/util';
import { LEVELS } from '../logic/dataset';
import { fmt } from '../logic/report';

// Anteprima del dataset anonimo + esportazione CSV (per R, SPSS, jamovi, Excel)
export const DataPanel = ({ ds }) => {
    const cols = ['_code', ...ds.vars.map((v) => v.key)];
    const exportCsv = () => {
        const rows = ds.rows.map((r) => ({ ...r, _code: r._code }));
        const csv = toCsv(cols, rows);
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `URBIOS_ricerca_${ds.level}_${todayStamp()}.csv`);
    };
    const exportDict = () => {
        const rows = [{ key: '_code', label: 'Codice paziente anonimo', type: 'testo', n: ds.rows.length }, ...ds.vars.map((v) => ({ ...v, type: v.type === 'num' ? 'numerica' : 'categorica' }))];
        downloadBlob(new Blob([toCsv(['key', 'label', 'type', 'n'], rows)], { type: 'text/csv;charset=utf-8' }), `URBIOS_ricerca_dizionario_${todayStamp()}.csv`);
    };
    const level = LEVELS.find((l) => l.id === ds.level);
    const preview = ds.rows.slice(0, 50);
    const shown = ds.vars.slice(0, 12);

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <p className="rs-h">Dataset anonimo</p>
                <p className="rs-muted">
                    {level?.hint}. {ds.rows.length} righe, {ds.vars.length} variabili. I pazienti sono indicati solo con un codice (P001…): nomi, contatti, luoghi, date esatte e testi liberi non entrano mai nel dataset.
                </p>
                <div className="flex flex-wrap gap-2">
                    <button className="vw-chip" onClick={exportCsv} disabled={!ds.rows.length}>
                        <i className="ph ph-download-simple"></i>Scarica CSV
                    </button>
                    <button className="vw-chip" onClick={exportDict} disabled={!ds.vars.length}>
                        <i className="ph ph-book-open"></i>Dizionario delle variabili
                    </button>
                </div>
                <p className="rs-muted">Il CSV usa ; e la virgola decimale (Excel italiano). In R: read.csv2(); in SPSS/jamovi: separatore punto e virgola.</p>
            </div>
            {preview.length > 0 && (
                <div className="panel rs-scroll">
                    <table className="rs-table">
                        <thead>
                            <tr>
                                <th>Codice</th>
                                {shown.map((v) => (
                                    <th key={v.key} title={v.label}>
                                        {v.label.length > 18 ? v.label.slice(0, 17) + '…' : v.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((r, i) => (
                                <tr key={i}>
                                    <td>{r._code}</td>
                                    {shown.map((v) => (
                                        <td key={v.key} className={v.type === 'num' ? 'n' : ''}>
                                            {v.type === 'num' ? (Number.isFinite(r[v.key]) ? fmt(r[v.key], 1) : '') : r[v.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="rs-muted mt-2">Anteprima: prime {preview.length} righe e {shown.length} colonne. Il CSV contiene tutto.</p>
                </div>
            )}
        </div>
    );
};
