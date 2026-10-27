import React, { useState } from 'react';
import { apaLine, effectWord, fmt, fmtP, sentence } from '../logic/report';

const copy = async (text, done) => {
    try {
        await navigator.clipboard.writeText(text);
        done(true);
        setTimeout(() => done(false), 1500);
    } catch {
        done(false);
    }
};

// Statistiche dei gruppi (media, DS, mediana)
export const GroupsTable = ({ groups }) =>
    groups && groups.length ? (
        <div className="rs-scroll">
            <table className="rs-table">
                <thead>
                    <tr>
                        <th>Gruppo</th>
                        <th className="n">n</th>
                        <th className="n">Media</th>
                        <th className="n">DS</th>
                        <th className="n">Mediana</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map((g) => (
                        <tr key={g.name}>
                            <td>{g.name}</td>
                            <td className="n">{g.n}</td>
                            <td className="n">{fmt(g.mean)}</td>
                            <td className="n">{fmt(g.sd)}</td>
                            <td className="n">{fmt(g.median)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : null;

// Un risultato di test: esito, frase APA copiabile, gruppi, note
export const ResultCard = ({ result, outcome, title, children }) => {
    const [copied, setCopied] = useState(false);
    if (!result) return null;
    if (result.error)
        return (
            <div className="panel">
                <p className="rs-h">{title || result.test}</p>
                <p className="rs-muted">{result.error}</p>
            </div>
        );
    const sig = result.p < 0.05;
    const text = sentence(result, { outcome });
    const eff = effectWord(result.effect);
    return (
        <div className="panel rs-stack">
            <div className="flex flex-wrap items-center gap-2 justify-between">
                <p className="rs-h !mb-0">{title || result.test}</p>
                <span className="flex gap-1.5">
                    <span className={`rs-badge ${sig ? 'ok' : ''}`}>p {fmtP(result.p)}</span>
                    {eff && <span className="rs-badge">effetto {eff}</span>}
                </span>
            </div>
            <p className="rs-muted">{apaLine(result)}</p>
            <GroupsTable groups={result.groups} />
            {children}
            <div className="rs-apa">{text}</div>
            <div className="flex justify-between items-start gap-3">
                <div className="rs-muted">{result.notes && result.notes.length > 0 && <ul className="rs-list">{result.notes.map((n) => <li key={n}>{n}</li>)}</ul>}</div>
                <button className="vw-chip flex-none" onClick={() => copy(text, setCopied)}>
                    <i className={`ph ${copied ? 'ph-check' : 'ph-copy'}`}></i>
                    {copied ? 'Copiata' : 'Copia frase'}
                </button>
            </div>
        </div>
    );
};

// Controllo delle assunzioni + scelta parametrico / non parametrico
export const AssumptionsCard = ({ checks, force, setForce, parametric }) => (
    <div className="panel rs-stack">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="rs-h !mb-0">Assunzioni</p>
            <div className="seg">
                {[
                    ['auto', 'Automatico'],
                    ['parametric', 'Parametrico'],
                    ['nonparametric', 'Non parametrico'],
                ].map(([id, l]) => (
                    <button key={id} className={force === id ? 'on' : ''} onClick={() => setForce(id)} style={{ padding: '6px 12px', fontSize: 13 }}>
                        {l}
                    </button>
                ))}
            </div>
        </div>
        <ul className="rs-list rs-muted">
            {checks.map((c) => (
                <li key={c}>{c}</li>
            ))}
        </ul>
        {force === 'auto' && <p className="rs-muted">Scelta automatica: test {parametric ? 'parametrico' : 'non parametrico'}. Il test alternativo è riportato sotto per confronto.</p>}
    </div>
);
