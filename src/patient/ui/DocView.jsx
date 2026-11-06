import React, { useState } from 'react';
import { Head } from './bits.jsx';

const KIND = { diet: 'Piano alimentare', training: 'Scheda di allenamento' };
export const kindLabel = (k) => KIND[k] || 'Documento';
// `at` arriva in secondi (invio del medico); accetta anche i millisecondi
export const fmtDate = (t) => { if (!Number.isSafeInteger(t) || t < 1e9) return null; return new Date(t < 1e11 ? t * 1000 : t).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }); };

// Rendering generico (la struttura dei piani è libera): testi, elenchi e sezioni. Mai HTML: solo nodi React.
const Value = ({ v }) => {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return <ul className="pt-list">{v.map((x, i) => <li key={i}><Value v={x} /></li>)}</ul>;
    if (typeof v === 'object') return <dl className="pt-dl">{Object.entries(v).map(([k, x]) => <React.Fragment key={k}><dt>{k.replace(/_/g, ' ')}</dt><dd><Value v={x} /></dd></React.Fragment>)}</dl>;
    return <>{String(v)}</>;
};

const arr = (x) => (Array.isArray(x) ? x : []);
const Tabs = ({ items, cur, set }) => items.length > 1 ? <div className="pt-tabs" role="tablist">{items.map((t, i) => <button key={i} type="button" role="tab" aria-selected={i === cur} className={i === cur ? 'is-on' : ''} onClick={() => set(i)}>{t}</button>)}</div> : null;

const Diet = ({ body }) => {
    const days = arr(body.giorni), [i, setI] = useState(0), d = days[Math.min(i, days.length - 1)];
    const o = body.obiettivo;
    if (!d) return <Fallback body={body} />;
    return (<>
        {o && <p className="pt-muted">Obiettivo giornaliero: {o.kcal} kcal · proteine {o.p} g · carboidrati {o.c} g · grassi {o.f} g</p>}
        <Tabs items={days.map((x) => x.titolo)} cur={i} set={setI} />
        {arr(d.pasti).map((m, k) => (
            <div className="pt-card" key={k}>
                <h3 className="pt-h3">{m.nome}</h3>
                <ul className="pt-rows">{arr(m.voci).map((v, j) => <li key={j}><span>{v.n}</span><span className="pt-muted">{v.g} g · {v.kcal} kcal</span></li>)}</ul>
            </div>
        ))}
    </>);
};

const Training = ({ body }) => {
    const weeks = arr(body.settimane), [w, setW] = useState(0), wk = weeks[Math.min(w, weeks.length - 1)];
    const [di, setD] = useState(0);
    if (!wk) return <Fallback body={body} />;
    const days = arr(wk.giorni), day = days[Math.min(di, days.length - 1)];
    return (<>
        <Tabs items={weeks.map((x) => x.titolo + (x.scarico ? ' · scarico' : ''))} cur={w} set={(n) => { setW(n); setD(0); }} />
        {wk.nota && <p className="pt-muted">{wk.nota}</p>}
        <Tabs items={days.map((x) => x.titolo)} cur={di} set={setD} />
        {day && day.nota && <p className="pt-muted">{day.nota}</p>}
        {day && arr(day.esercizi).map((e, k) => (
            <div className="pt-card" key={k}>
                <h3 className="pt-h3">{e.ss ? e.ss + ' · ' : ''}{e.nome}</h3>
                <p className="pt-ex">{[e.serie, e.carico && e.carico + ' kg', e.pct && e.pct + ' % 1RM', e.rpe && 'RPE ' + e.rpe, e.tempo && 'tempo ' + e.tempo, e.rec && 'recupero ' + e.rec].filter(Boolean).join(' · ')}</p>
                {e.note && <p className="pt-muted">{e.note}</p>}
            </div>
        ))}
    </>);
};

const Fallback = ({ body }) => <div className="pt-card"><Value v={body} /></div>;
const valid = (kind, b) => b && typeof b === 'object' && (kind === 'diet' ? Array.isArray(b.giorni) : kind === 'training' ? Array.isArray(b.settimane) : false);

export const DocView = ({ doc, onBack }) => (
    <>
        <Head title={doc.title || kindLabel(doc.kind)} onBack={onBack} />
        <p className="pt-muted">{kindLabel(doc.kind)} · versione {doc.rev}{fmtDate(doc.at) ? ` · ${fmtDate(doc.at)}` : ''}</p>
        {valid(doc.kind, doc.body) ? (doc.kind === 'diet' ? <Diet body={doc.body} /> : <Training body={doc.body} />) : <Fallback body={doc.body} />}
    </>
);
