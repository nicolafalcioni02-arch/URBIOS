import React, { useState } from 'react';
import { Card, Field, Result, Btn, Table, n1, toNum } from './ui';
import { estimate1RM, repTable, rpeTable, RPE_SCALE, warmupSets } from '../logic/science/oneRm';
import { normName } from '../logic/exerciseMedia';

export const MassimaliTool = ({ massimali, exerciseDB, saveMassimale, deleteMassimale, defaultExercise = '' }) => {
    const [name, setName] = useState(defaultExercise);
    const [load, setLoad] = useState('');
    const [reps, setReps] = useState('');
    const [rm, setRm] = useState('');
    const [wl, setWl] = useState('');
    const [wr, setWr] = useState('');
    const est = estimate1RM(toNum(load), toNum(reps));
    const rmN = toNum(rm);
    const list = Object.values(massimali).sort((a, b) => a.name.localeCompare(b.name));
    const wu = warmupSets(toNum(wl), toNum(wr) || 8);

    return (
        <div>
            <Card
                title="Massimali del cliente (1RM)"
                hint="Il massimale serve a trasformare le percentuali in chili e a calcolare l'intensità della scheda. Si salva per questo cliente e vale per tutte le sue schede."
            >
                {list.length === 0 && <div style={{ fontSize: 13, color: '#6E6D69' }}>Nessun massimale salvato.</div>}
                {list.length > 0 && (
                    <Table
                        head={['Esercizio', '1RM', 'Data', 'Come', '']}
                        rows={list.map((m) => [
                            m.name,
                            `${n1(m.kg)} kg`,
                            m.date,
                            m.method,
                            <button
                                key={m.name}
                                onClick={() => deleteMassimale(m.name)}
                                style={{ border: 'none', background: 'none', color: '#C2413A', cursor: 'pointer' }}
                            >
                                Elimina
                            </button>,
                        ])}
                    />
                )}
            </Card>

            <Card
                title="Stima del massimale"
                hint="Inserisci un carico sollevato per un certo numero di ripetizioni portate vicino al cedimento. Più le ripetizioni sono poche (≤ 10), più la stima è affidabile."
            >
                <datalist id="ex-names">
                    {exerciseDB.map((e) => (
                        <option key={e.name} value={e.name} />
                    ))}
                </datalist>
                <Field label="Esercizio" value={name} onChange={setName} width={230} list="ex-names" placeholder="es. Squat" />
                <Field label="Carico" value={load} onChange={setLoad} unit="kg" width={90} />
                <Field label="Ripetizioni" value={reps} onChange={setReps} width={80} />
                {est && (
                    <Result>
                        <b>1RM stimato ≈ {n1(est.average)} kg</b> (media di {Object.keys(est.byFormula).length} formule)
                        {!est.reliable && ' · attenzione: oltre 10 ripetizioni la stima è poco affidabile'}
                        <div style={{ marginTop: 6 }}>
                            <Table small head={Object.keys(est.byFormula)} rows={[Object.values(est.byFormula).map((v) => n1(v))]} />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <Btn disabled={!name.trim()} onClick={() => saveMassimale(name.trim(), Math.round(est.average * 2) / 2, 'stimato')}>
                                Salva come massimale di «{name.trim() || '…'}»
                            </Btn>
                            <Btn dark={false} onClick={() => setRm(String(Math.round(est.average * 2) / 2))}>
                                Usa nelle tabelle sotto
                            </Btn>
                        </div>
                    </Result>
                )}
                <div style={{ marginTop: 10 }}>
                    <Field label="Oppure massimale testato" value={rm} onChange={setRm} unit="kg" width={90} />
                    <Btn dark={false} disabled={!name.trim() || !(rmN > 0)} onClick={() => saveMassimale(name.trim(), rmN, 'testato')}>
                        Salva
                    </Btn>
                </div>
            </Card>

            <Card
                title="Ripetizioni ↔ percentuale del massimale"
                hint="Quante ripetizioni al cedimento si possono fare a una certa % del 1RM (media di 7 formule). Inserisci un 1RM sopra per vedere anche i chili."
            >
                <Table
                    small
                    head={['Rip.', '% 1RM', 'Carico (kg)']}
                    rows={repTable(rmN).map((r) => [r.reps, `${n1(r.pct, 0)}%`, r.load ? n1(Math.round(r.load * 2) / 2) : '-'])}
                />
            </Card>

            <Card title="Tabella RPE" hint="Percentuale del 1RM per ripetizioni e RPE (RPE 10 = al cedimento; ogni punto in meno = 1 ripetizione di riserva).">
                <Table
                    small
                    head={['Rip.', ...[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6].map(String)]}
                    rows={rpeTable(rmN).map((r) => [r.reps, ...r.cells.map((c) => `${n1(c.pct, 0)}%${c.load ? ' · ' + n1(Math.round(c.load * 2) / 2) : ''}`)])}
                />
                <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                    {RPE_SCALE.map(([r, t]) => (
                        <div key={r}>
                            <b>RPE {String(r).replace('.', ',')}</b>: {t}
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Serie di riscaldamento" hint="Piramide fino al carico di lavoro (arrotondata ai dischi da 2,5 kg).">
                <Field label="Carico di lavoro" value={wl} onChange={setWl} unit="kg" width={90} />
                <Field label="Ripetizioni di lavoro" value={wr} onChange={setWr} width={80} />
                {wu.length > 0 && (
                    <Result tone="green">{wu.map((s) => `${s.reps} × ${n1(s.load)} kg (${n1(s.pct, 0)}%)`).join('  →  ')} → serie di lavoro</Result>
                )}
            </Card>
        </div>
    );
};
