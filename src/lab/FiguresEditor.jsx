import React, { useRef } from 'react';
import { Icon } from './ui/icons';
import { CHART_TYPES, chartSvg, emptyChart, hasChart, readImage } from './figures';

// Figure di un esperimento: didascalia + immagine caricata oppure grafico (istogramma, linee, torta) con tabella dati come in Excel.
const Chart = ({ chart, onChange }) => {
    const c = chart;
    const set = (patch) => onChange({ ...c, ...patch });
    const setCat = (i, v) => set({ cats: c.cats.map((x, k) => (k === i ? v : x)) });
    const setVal = (si, i, v) => set({ series: c.series.map((s, k) => (k === si ? { ...s, vals: s.vals.map((x, j) => (j === i ? v : x)) } : s)) });
    const addRow = () => set({ cats: [...c.cats, ''], series: c.series.map((s) => ({ ...s, vals: [...s.vals, ''] })) });
    const delRow = (i) => set({ cats: c.cats.filter((_, k) => k !== i), series: c.series.map((s) => ({ ...s, vals: s.vals.filter((_, k) => k !== i) })) });
    const addSeries = () => set({ series: [...c.series, { name: `Serie ${c.series.length + 1}`, vals: c.cats.map(() => '') }] });
    const pie = c.type === 'pie';
    const cols = pie ? 1 : c.series.length;
    const tpl = `minmax(40px,1.2fr) ${Array(cols).fill('minmax(52px,1fr)').join(' ')} 26px`;
    return (
        <div className="lab-chart">
            <div className="lab-chart-top">
                {CHART_TYPES.map(([k, l]) => <button type="button" key={k} className={`lab-chip${c.type === k ? ' on' : ''}`} onClick={() => set({ type: k })}>{l}</button>)}
            </div>
            <div className="lab-chart-meta">
                <input className="fld" placeholder="Titolo del grafico" value={c.title} onChange={(e) => set({ title: e.target.value })} />
                {!pie && <input className="fld" placeholder="Asse X (es. Tempo, h)" value={c.xLabel} onChange={(e) => set({ xLabel: e.target.value })} />}
                {!pie && <input className="fld" placeholder="Asse Y (es. Assorbanza)" value={c.yLabel} onChange={(e) => set({ yLabel: e.target.value })} />}
            </div>
            <p className="lab-chart-hint">Scrivi nelle caselle: a sinistra le etichette, nelle colonne a destra i valori numerici (una colonna per ogni serie).</p>
            <div className="lab-grid" style={{ '--tpl': tpl }}>
                <div className="lab-grid-row head">
                    <span className="lab-grid-h">{pie ? 'Etichetta' : 'Asse X'}</span>
                    {c.series.slice(0, cols).map((s, si) => (
                        <input key={si} className="fld lab-grid-name" placeholder="Nome serie" value={s.name} aria-label="Nome serie" onChange={(e) => set({ series: c.series.map((x, k) => (k === si ? { ...x, name: e.target.value } : x)) })} />
                    ))}
                    <span />
                </div>
                {c.cats.map((k, i) => (
                    <div className="lab-grid-row" key={i}>
                        <input className="fld" placeholder="es. 0 h" value={k} aria-label="Categoria" onChange={(e) => setCat(i, e.target.value)} />
                        {c.series.slice(0, cols).map((s, si) => <input key={si} className="fld" placeholder="valore" inputMode="decimal" value={s.vals[i] ?? ''} aria-label={s.name} onChange={(e) => setVal(si, i, e.target.value)} />)}
                        <button type="button" className="lab-x" aria-label="Togli riga" onClick={() => delRow(i)}><Icon name="x" size={16} /></button>
                    </div>
                ))}
            </div>
            <div className="lab-chart-top">
                <button type="button" className="lab-add" onClick={addRow}><Icon name="plus" size={15} />Riga</button>
                {!pie && <button type="button" className="lab-add" onClick={addSeries}><Icon name="plus" size={15} />Serie</button>}
                {!pie && c.series.length > 1 && <button type="button" className="lab-add" onClick={() => set({ series: c.series.slice(0, -1) })}>Togli ultima serie</button>}
            </div>
            <div className="lab-chart-view">{hasChart(c) ? <div dangerouslySetInnerHTML={{ __html: chartSvg(c) }} /> : <span>Il grafico comparirà qui appena scrivi i valori.</span>}</div>
        </div>
    );
};

export const FiguresEditor = ({ value, onChange }) => {
    const list = value || [];
    const file = useRef(null);
    const target = useRef(0);
    const set = (i, patch) => onChange(list.map((f, k) => (k === i ? { ...f, ...patch } : f)));
    const listRef = useRef(list);
    listRef.current = list;
    const pick = async (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try { const img = await readImage(f); onChange(listRef.current.map((x, k) => (k === target.current ? { ...x, img, chart: undefined } : x))); } catch (err) { window.alert('Immagine non leggibile.'); }
    };
    return (
        <div className="lab-rows">
            <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
            {list.map((f, i) => (
                <div className="lab-fig" key={i}>
                    <div className="lab-fig-head">
                        <input className="fld" value={f.nome || ''} placeholder="Didascalia" onChange={(e) => set(i, { nome: e.target.value })} />
                        <button type="button" className="lab-x" aria-label="Togli figura" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>
                    </div>
                    {f.img && (
                        <div className="lab-fig-img">
                            <img src={f.img} alt="" />
                            <button type="button" className="lab-add" onClick={() => set(i, { img: undefined })}>Togli immagine</button>
                        </div>
                    )}
                    {f.chart && <Chart chart={f.chart} onChange={(c) => set(i, { chart: c })} />}
                    {!f.img && !f.chart && (
                        <div className="lab-chart-top">
                            <button type="button" className="lab-add" onClick={() => { target.current = i; file.current.click(); }}><Icon name="plus" size={15} />Carica immagine</button>
                            <button type="button" className="lab-add" onClick={() => set(i, { chart: emptyChart() })}><Icon name="plus" size={15} />Crea grafico</button>
                        </div>
                    )}
                    {f.chart && <button type="button" className="lab-add" onClick={() => set(i, { chart: undefined })}>Togli grafico</button>}
                </div>
            ))}
            <div className="lab-chart-top">
                <button type="button" className="lab-add" onClick={() => { target.current = list.length; onChange([...list, { nome: '' }]); setTimeout(() => file.current.click(), 0); }}><Icon name="plus" size={15} />Aggiungi immagine</button>
                <button type="button" className="lab-add" onClick={() => onChange([...list, { nome: '', chart: emptyChart() }])}><Icon name="plus" size={15} />Aggiungi grafico</button>
            </div>
        </div>
    );
};
