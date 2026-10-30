import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { MODELS, generateWeeks } from '../logic/periodization';
import { analyzeScheda } from '../logic/analysis';
import { Card, Field, Pick, Btn, Table, n1 } from '../tools/ui';

// Genera automaticamente le settimane successive a partire da una settimana "base" ben costruita.
export const ProgressionModal = ({ weeks, header, massimali, profile, onApply, onClose }) => {
    const [baseId, setBaseId] = useState(() => { const w = weeks.find((x) => x.kind !== 'deload') || weeks[0]; return w ? w.id : ''; });
    const [model, setModel] = useState('lineare');
    const [total, setTotal] = useState('4');
    const [inc, setInc] = useState('2.5');
    const [unit, setUnit] = useState('kg');
    const [deload, setDeload] = useState(true);
    const [baseRpe, setBaseRpe] = useState('7');
    const [confirming, setConfirming] = useState(false);
    const [mode, setMode] = useState('after'); // after: dalla settimana di partenza in poi | append: in mezzo, le altre restano | replace: tutta la scheda

    const base = weeks.find((w) => w.id === baseId) || weeks[0];
    const idx = weeks.indexOf(base);
    const N = Math.min(16, Math.max(2, parseInt(total, 10) || 4));
    const generated = useMemo(
        () =>
            base
                ? generateWeeks(base, {
                      model,
                      total: N,
                      increment: parseFloat(String(inc).replace(',', '.')) || 0,
                      unit,
                      deload,
                      massimali,
                      baseRpe: parseFloat(String(baseRpe).replace(',', '.')) || 7,
                      startNumber: mode === 'replace' ? 1 : weeks.length - (weeks.length - 1 - idx),
                  })
                : [],
        [base, model, N, inc, unit, deload, massimali, baseRpe, mode, weeks, idx]
    );
    const result = mode === 'replace' ? generated : mode === 'after' ? [...weeks.slice(0, idx), ...generated] : [...weeks.slice(0, idx), ...generated, ...weeks.slice(idx + 1)];
    const dropped = mode === 'after' ? weeks.length - 1 - idx : 0;
    const A = useMemo(() => analyzeScheda({ weeks: generated, header, massimali, profile }), [generated, header, massimali, profile]);
    const m = MODELS.find((x) => x.id === model);

    return ReactDOM.createPortal(
        <div className="t-modal-overlay" style={{ display: 'flex', zIndex: 25000 }} onClick={onClose}>
            <div
                className="t-modal-card"
                style={{ width: 900, maxWidth: '96vw', height: '88vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 8px' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Genera progressione</h2>
                    <button onClick={onClose} className="t-icon-btn" style={{ width: 40, height: 40, background: '#F6F5F2', border: 'none' }}>
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 28px 20px' }}>
                    <Card hint="Costruisci bene UNA settimana (esercizi, serie, ripetizioni, carichi o %): qui scegli come farla evolvere nelle settimane successive. Vedrai l'anteprima prima di applicare.">
                        <Pick
                            label="Settimana di partenza"
                            value={baseId}
                            onChange={setBaseId}
                            options={weeks.map((w, i) => ({ value: w.id, label: w.title || `Settimana ${i + 1}` }))}
                            width={200}
                        />
                        <Field label="Numero di settimane totali" value={total} onChange={setTotal} width={70} />
                        <div style={{ marginBottom: 6 }}>
                            {MODELS.map((x) => (
                                <label key={x.id} style={{ display: 'block', padding: '6px 0', cursor: 'pointer', fontSize: 14 }}>
                                    <input type="radio" name="model" checked={model === x.id} onChange={() => setModel(x.id)} /> <b>{x.label}</b>
                                    <div style={{ fontSize: 12, color: '#6E6D69', marginLeft: 22 }}>{x.desc}</div>
                                </label>
                            ))}
                        </div>
                        {model !== 'rpe' && model !== 'onda531' && (
                            <>
                                <Field label="Incremento del carico" value={inc} onChange={setInc} width={70} />
                                <Pick
                                    label="Unità"
                                    value={unit}
                                    onChange={setUnit}
                                    options={[
                                        { value: 'kg', label: 'kg a settimana' },
                                        { value: 'pct', label: '% a settimana' },
                                    ]}
                                    width={150}
                                />
                            </>
                        )}
                        {model === 'onda531' && <Field label="Incremento sugli altri esercizi" value={inc} onChange={setInc} unit="kg" width={70} />}
                        {model === 'rpe' && <Field label="RPE di partenza" value={baseRpe} onChange={setBaseRpe} width={70} />}
                        {model !== 'onda531' && (
                            <label style={{ fontSize: 13, marginLeft: 8 }}>
                                <input type="checkbox" checked={deload} onChange={(e) => setDeload(e.target.checked)} /> Ultima settimana di scarico (≈ -40%
                                serie, -10% carico)
                            </label>
                        )}
                    </Card>

                    <Card title="Anteprima" hint={m.label}>
                        <Table
                            small
                            head={['Settimana', 'Serie', 'Volume', 'Intens.', 'RPE', 'Carico (sRPE)', 'ACWR']}
                            rows={A.weeks.map((w) => [
                                w.title,
                                w.workSets,
                                w.volumeLoad ? `${Math.round(w.volumeLoad)} kg` : '-',
                                w.avgPct !== null ? `${Math.round(w.avgPct)}%` : '-',
                                w.avgRpe !== null ? n1(w.avgRpe) : '-',
                                Math.round(w.weekLoad),
                                w.acwr !== null ? n1(w.acwr, 2) : '-',
                            ])}
                        />
                        {generated[1] && (
                            <div style={{ fontSize: 12, color: '#555', marginTop: 10 }}>
                                Esempio, primo esercizio del primo giorno:&nbsp;
                                {generated.map((w, i) => {
                                    const e = w.days[0] && w.days[0].exercises[0];
                                    if (!e) return null;
                                    const work = e.sets.filter((x) => x.tipo !== 'riscaldamento');
                                    const s = work[0] || e.sets[0];
                                    return (
                                        <span key={i} style={{ marginRight: 10 }}>
                                            S{i + 1}: {work.length}×{s.reps || '?'}
                                            {s.load ? ` @${s.load}kg` : ''}
                                            {s.pct ? ` @${s.pct}%` : ''}
                                            {s.rpe ? ` RPE${s.rpe}` : ''}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                    <Card>
                        <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
                            <input type="radio" name="mode" checked={mode === 'after'} onChange={() => setMode('after')} /> <b>Costruisci le settimane successive</b>{' '}
                            alla settimana di partenza (quelle dopo vengono sostituite{dropped > 0 ? `: ${dropped}` : ''})
                        </label>
                        <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
                            <input type="radio" name="mode" checked={mode === 'append'} onChange={() => setMode('append')} /> <b>Inserisci le nuove settimane</b>{' '}
                            dopo la settimana di partenza (le altre restano, in coda)
                        </label>
                        <label style={{ display: 'block', fontSize: 14 }}>
                            <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} />{' '}
                            <b>Sostituisci tutta la scheda</b> con la progressione (le settimane attuali vengono cancellate)
                        </label>
                    </Card>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 28px', borderTop: '1px solid #EEE' }}>
                    <Btn dark={false} onClick={onClose}>
                        Annulla
                    </Btn>
                    <Btn
                        disabled={!base || generated.length < 2}
                        onClick={() => setConfirming(true)}
                    >
                        Applica ({generated.length} settimane)
                    </Btn>
                </div>
            </div>
        {confirming && (
                <div className="sheet-back" style={{ zIndex: 26000 }} onClick={(e) => { e.stopPropagation(); setConfirming(false); }}>
                    <div className="sheet" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Applicare la progressione?</h3>
                        <p style={{ fontSize: 14, color: '#6E6D69', margin: '0 0 14px' }}>{m.label}</p>
                        <div style={{ background: '#fff', border: '1px solid #E6E4DE', borderRadius: 16, padding: '12px 14px', fontSize: 14, lineHeight: 1.5 }}>
                            <div>Partenza: <b>{(base && base.title) || `Settimana ${idx + 1}`}</b></div>
                            <div>Settimane generate: <b>{generated.length}</b>{deload && model !== 'onda531' ? ' (l’ultima di scarico)' : ''}</div>
                            <div>
                                {mode === 'replace' && <>Tutta la scheda verrà <b>sostituita</b>: le {weeks.length} settimane attuali vengono cancellate.</>}
                                {mode === 'after' && (dropped > 0 ? <>Le <b>{dropped}</b> settimane dopo la partenza verranno <b>sostituite</b>.</> : <>Le nuove settimane si aggiungono dopo la partenza.</>)}
                                {mode === 'append' && <>Le altre settimane restano dove sono.</>}
                            </div>
                            <div>La scheda avrà <b>{result.length}</b> settimane.</div>
                        </div>
                        {(mode === 'replace' || dropped > 0) && <p style={{ fontSize: 13, color: '#C2413A', margin: '10px 2px 0' }}>Questa azione non si può annullare.</p>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button style={{ flex: 1, height: 50, borderRadius: 14, background: '#fff', border: '1px solid #E6E4DE', fontWeight: 600, fontSize: 15 }} onClick={() => setConfirming(false)}>
                                Indietro
                            </button>
                            <button
                                style={{ flex: 1.4, height: 50, borderRadius: 14, background: '#121317', color: '#fff', fontWeight: 600, fontSize: 15 }}
                                onClick={() => {
                                    onApply(result);
                                    setConfirming(false);
                                    onClose();
                                }}
                            >
                                Conferma e applica
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};
