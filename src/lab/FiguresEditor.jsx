import React, { useRef, useState } from 'react';
import { GelStudio } from './GelStudio';
import { Icon } from './ui/icons';
import { CHART_TYPES, NORMS, chartSvg, emptyChart, emptyGel, gelSvg, hasChart, readImage, regressions, statText, unknownResults } from './figures';

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
    const sc = c.type === 'scatter';
    const unk = c.unknowns || [];
    const setUnk = (i, patch) => set({ unknowns: unk.map((u, k) => (k === i ? { ...u, ...patch } : u)) });
    const gs = sc ? regressions(c) : [];
    const res = sc ? unknownResults(c) : [];
    const fmtN = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '–');
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
            {!pie && (
                <div className="lab-chart-meta">
                    <select className="fld" value={c.norm || ''} aria-label="Normalizzazione" onChange={(e) => set({ norm: e.target.value })}>
                        {NORMS.map(([k, l]) => <option key={k} value={k}>{k ? `Normalizza: ${l}` : 'Nessuna normalizzazione'}</option>)}
                    </select>
                    {sc && <input className="fld" placeholder="Unità della concentrazione (es. mg/mL)" value={c.unit || ''} onChange={(e) => set({ unit: e.target.value })} />}
                </div>
            )}
            <p className="lab-chart-hint">{sc ? 'Colonna sinistra: concentrazione (numero) degli standard, a destra il segnale misurato (es. assorbanza). Regressione lineare e r di Pearson sono calcolate da sole.' : 'Scrivi nelle caselle: a sinistra le etichette, nelle colonne a destra i valori numerici (una colonna per ogni serie).'}</p>
            <div className="lab-grid" style={{ '--tpl': tpl }}>
                <div className="lab-grid-row head">
                    <span className="lab-grid-h">{pie ? 'Etichetta' : sc ? 'Concentrazione' : 'Asse X'}</span>
                    {c.series.slice(0, cols).map((s, si) => (
                        <input key={si} className="fld lab-grid-name" placeholder="Nome serie" value={s.name} aria-label="Nome serie" onChange={(e) => set({ series: c.series.map((x, k) => (k === si ? { ...x, name: e.target.value } : x)) })} />
                    ))}
                    <span />
                </div>
                {c.cats.map((k, i) => (
                    <div className="lab-grid-row" key={i}>
                        <input className="fld" placeholder={sc ? 'es. 0,5' : 'es. 0 h'} value={k} aria-label="Categoria" onChange={(e) => setCat(i, e.target.value)} />
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
            {sc && (
                <div className="lab-chart-calc">
                    {gs.map((g, i) => <p key={i} className="lab-chart-hint">{c.series[i].name || `Serie ${i + 1}`}: {g ? statText(g) : 'servono almeno due punti con valori diversi'}</p>)}
                    <p className="lab-chart-hint">Concentrazione dei campioni: scrivi il segnale misurato (e l'eventuale fattore di diluizione); si usa la curva della prima serie.</p>
                    {unk.map((u, i) => (
                        <div className="lab-grid-row" key={i} style={{ '--tpl': 'minmax(40px,1.2fr) minmax(52px,1fr) minmax(52px,0.8fr) minmax(70px,1fr) 26px' }}>
                            <input className="fld" placeholder="Campione" value={u.nome || ''} onChange={(e) => setUnk(i, { nome: e.target.value })} />
                            <input className="fld" placeholder="Segnale" inputMode="decimal" value={u.y ?? ''} onChange={(e) => setUnk(i, { y: e.target.value })} />
                            <input className="fld" placeholder="Diluiz. ×" inputMode="decimal" value={u.dil ?? ''} onChange={(e) => setUnk(i, { dil: e.target.value })} />
                            <span className="lab-chart-hint">{fmtN(res[i].x)} {c.unit || ''}{res[i].fuori ? ' *' : ''}</span>
                            <button type="button" className="lab-x" aria-label="Togli campione" onClick={() => set({ unknowns: unk.filter((_, k) => k !== i) })}><Icon name="x" size={16} /></button>
                        </div>
                    ))}
                    <button type="button" className="lab-add" onClick={() => set({ unknowns: [...unk, { nome: '', y: '', dil: '' }] })}><Icon name="plus" size={15} />Campione da calcolare</button>
                    {res.some((r) => r.fuori) && <p className="lab-chart-hint">* fuori dall'intervallo della curva: stima per estrapolazione.</p>}
                </div>
            )}
            <div className="lab-chart-view">{hasChart(c) ? <div dangerouslySetInnerHTML={{ __html: chartSvg(c) }} /> : <span>Il grafico comparirà qui appena scrivi i valori.</span>}</div>
        </div>
    );
};

const imgSize = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.width, im.height]); im.onerror = () => res([4, 3]); im.src = src; });

// Gel: anteprima + apertura del box di lavoro (GelStudio)
const Gel = ({ gel, onChange, onPick }) => {
    const [open, setOpen] = useState(!gel.img);
    return (
        <div className="lab-chart">
            {gel.img && <div className="lab-gel-view" dangerouslySetInnerHTML={{ __html: gelSvg(gel) }} />}
            <div className="lab-chart-top">
                <button type="button" className="lab-add" onClick={() => setOpen(true)}>{gel.img ? 'Apri il box di lavoro del gel' : 'Lavora il gel'}</button>
            </div>
            {open && <GelStudio gel={gel} onChange={onChange} onPickPhoto={onPick} onClose={() => setOpen(false)} />}
        </div>
    );
};

export const FiguresEditor = ({ value, onChange }) => {
    const list = value || [];
    const file = useRef(null);
    const target = useRef(0);
    const gelMode = useRef(false);
    const openFile = (i, gel) => { target.current = i; gelMode.current = gel; file.current.click(); };
    const set = (i, patch) => onChange(list.map((f, k) => (k === i ? { ...f, ...patch } : f)));
    const listRef = useRef(list);
    listRef.current = list;
    const pick = async (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try {
            const img = await readImage(f);
            if (gelMode.current) {
                const [w, h] = await imgSize(img);
                onChange(listRef.current.map((x, k) => (k === target.current ? { ...x, gel: { ...(x.gel || emptyGel()), src: img, img, w, h } } : x)));
            } else onChange(listRef.current.map((x, k) => (k === target.current ? { ...x, img, chart: undefined } : x)));
        } catch (err) { window.alert('Immagine non leggibile.'); }
    };
    return (
        <div className="lab-rows">
            <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
            {list.map((f, i) => (
                <div className="lab-fig" key={i}>
                    <div className="lab-fig-head">
                        <input className="fld" value={f.nome || ''} placeholder="Didascalia" onChange={(e) => set(i, { nome: e.target.value })} />
                        <button type="button" className="lab-x lab-x-bad" aria-label="Togli figura" title="Togli figura" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="trash" size={16} /></button>
                    </div>
                    {f.img && (
                        <div className="lab-fig-img">
                            <img src={f.img} alt="" />
                            <button type="button" className="lab-add" onClick={() => set(i, { img: undefined })}>Togli immagine</button>
                        </div>
                    )}
                    {f.gel && <Gel gel={f.gel} onChange={(g) => set(i, { gel: g })} onPick={() => openFile(i, true)} />}
                    {f.chart && <Chart chart={f.chart} onChange={(c) => set(i, { chart: c })} />}
                    {!f.img && !f.chart && !f.gel && (
                        <div className="lab-chart-top">
                            <button type="button" className="lab-add" onClick={() => openFile(i, false)}><Icon name="plus" size={15} />Carica immagine</button>
                            <button type="button" className="lab-add" onClick={() => { set(i, { gel: emptyGel() }); openFile(i, true); }}><Icon name="plus" size={15} />Gel</button>
                            <button type="button" className="lab-add" onClick={() => set(i, { chart: emptyChart() })}><Icon name="plus" size={15} />Crea grafico</button>
                        </div>
                    )}
                </div>
            ))}
            <div className="lab-chart-top">
                <button type="button" className="lab-add" onClick={() => { onChange([...list, { nome: '' }]); setTimeout(() => openFile(list.length, false), 0); }}><Icon name="plus" size={15} />Aggiungi immagine</button>
                <button type="button" className="lab-add" onClick={() => onChange([...list, { nome: '', chart: emptyChart() }])}><Icon name="plus" size={15} />Aggiungi grafico</button>
                <button type="button" className="lab-add" onClick={() => { onChange([...list, { nome: '', gel: emptyGel() }]); setTimeout(() => openFile(list.length, true), 0); }}><Icon name="plus" size={15} />Aggiungi gel</button>
            </div>
        </div>
    );
};
