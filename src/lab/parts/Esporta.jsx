import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { sectionOf } from '../sections';
import { FORMATS, runExport } from '../exportLogic';
import { readImage } from './DeskFiles';

// Esporta: mini programma della scrivania. Si trascinano qui le icone dalla scrivania (o si scelgono dall'elenco,
// o si portano file dal computer) e si esportano nel formato voluto. Lo stato dei file scelti (`keys`) sta in Desktop.jsx.
const AREAS = ['quaderno', 'protocolli', 'reagenti', 'magazzino', 'campioni', 'articoli'];
const uid = () => Math.random().toString(36).slice(2, 8);

export const Esporta = ({ lab, uf, keys, onKeys }) => {
    const [ext, setExt] = useState([]); // file portati dal computer: { key, kind, name, body | src }
    const [fmt, setFmt] = useState('docx');
    const [one, setOne] = useState(true);
    const [pick, setPick] = useState(false);
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);
    const [hot, setHot] = useState(false);
    const input = useRef(null);

    const all = useMemo(() => {
        const m = new Map();
        AREAS.forEach((k) => (lab[k] || []).forEach((r) => m.set(`${k}:${r.id}`, { key: `${k}:${r.id}`, kind: 'rec', k, r, name: sectionOf(k).title(r), area: sectionOf(k).label })));
        uf.filter((f) => f.type !== 'gelraw').forEach((f) => m.set(`x:${f.id}`, f.type === 'img' ? { key: `x:${f.id}`, kind: 'img', name: f.name || 'Immagine', src: f.src, area: 'Immagine' } : { key: `x:${f.id}`, kind: 'txt', name: f.name || 'Documento', body: f.body, imgs: f.imgs, area: 'Documento' }));
        ext.forEach((e) => m.set(e.key, { ...e, area: e.kind === 'img' ? 'Immagine' : 'Documento' }));
        return m;
    }, [lab, uf, ext]);
    const items = keys.map((k) => all.get(k)).filter(Boolean);
    const toggle = (k) => onKeys(keys.includes(k) ? keys.filter((x) => x !== k) : [...keys, k]);

    const bring = async (files) => {
        const add = [];
        for (const f of files) {
            try {
                if (/^image\//.test(f.type)) add.push({ key: `e:${uid()}`, kind: 'img', name: f.name.replace(/\.[^.]+$/, ''), src: await readImage(f) });
                else if (/^text\//.test(f.type) || /\.(txt|md|csv|json)$/i.test(f.name)) add.push({ key: `e:${uid()}`, kind: 'txt', name: f.name.replace(/\.[^.]+$/, ''), body: await f.text(), imgs: [] });
                else setMsg(`«${f.name}»: formato non supportato (solo testo e immagini).`);
            } catch (e) { setMsg(`«${f.name}» non si legge.`); }
        }
        if (add.length) { setExt((o) => [...o, ...add]); onKeys([...keys, ...add.map((a) => a.key)]); }
    };
    const go = async () => {
        setBusy(true); setMsg('');
        try { setMsg(await runExport({ items, fmt, one, lab })); } catch (e) { setMsg('Non sono riuscito a esportare.'); }
        setBusy(false);
    };
    const f = FORMATS.find((x) => x.id === fmt);
    const many = items.length > 1 && fmt !== 'xlsx' && fmt !== 'pdf';

    return (
        <div className="ex">
            <section className="ex-left">
                <header><b>File da esportare</b><span>{items.length}</span></header>
                {pick ? (
                    <div className="ex-pick">
                        {AREAS.map((k) => (lab[k] || []).length > 0 && (
                            <div key={k}><h4>{sectionOf(k).label}</h4>
                                {lab[k].map((r) => { const key = `${k}:${r.id}`; return <label key={key} className="ex-chk"><input type="checkbox" checked={keys.includes(key)} onChange={() => toggle(key)} /><span>{sectionOf(k).title(r)}</span></label>; })}
                            </div>
                        ))}
                        {uf.length > 0 && <div><h4>I tuoi file</h4>{uf.map((x) => { const key = `x:${x.id}`; return <label key={key} className="ex-chk"><input type="checkbox" checked={keys.includes(key)} onChange={() => toggle(key)} /><span>{x.name || 'Senza nome'}</span></label>; })}</div>}
                    </div>
                ) : (
                    <div className={`ex-drop${hot ? ' hot' : ''}`} onDragOver={(e) => { e.preventDefault(); setHot(true); }} onDragLeave={() => setHot(false)} onDrop={(e) => { e.preventDefault(); setHot(false); bring([...e.dataTransfer.files]); }}>
                        {items.length ? items.map((it) => (
                            <div key={it.key} className="ex-item"><Icon name={it.kind === 'img' ? 'image' : it.kind === 'txt' ? 'article' : sectionOf(it.k).icon} size={16} /><span><b>{it.name}</b><small>{it.area}</small></span><button className="m-ib" onClick={() => toggle(it.key)} aria-label="Toglie dalla lista"><Icon name="x" size={14} /></button></div>
                        )) : <p className="ex-hint">Trascina qui i file dalla scrivania,<br />oppure scegli dall’elenco.</p>}
                    </div>
                )}
                <footer>
                    <button className="m-pillbtn light" onClick={() => setPick((v) => !v)}>{pick ? 'Fatto' : 'Scegli dall’elenco'}</button>
                    <button className="m-pillbtn light" onClick={() => input.current.click()}>Dal computer</button>
                    <input ref={input} type="file" multiple accept="image/*,.txt,.md,.csv,.json,text/*" hidden onChange={(e) => { bring([...e.target.files]); e.target.value = ''; }} />
                    {items.length > 0 && !pick && <button className="m-pillbtn light" onClick={() => onKeys([])}>Svuota</button>}
                </footer>
            </section>
            <section className="ex-right">
                <header><b>Formato</b></header>
                <div className="ex-fmts" role="radiogroup" aria-label="Formato">
                    {FORMATS.map((x) => <button key={x.id} role="radio" aria-checked={fmt === x.id} className={`ex-fmt${fmt === x.id ? ' on' : ''}`} onClick={() => setFmt(x.id)}><b>{x.label}</b><small>.{x.ext}</small></button>)}
                </div>
                <p className="ex-note">{f.hint}</p>
                {many && <label className="ex-chk ex-one"><input type="checkbox" checked={one} onChange={(e) => setOne(e.target.checked)} /><span>Un solo file con tutto</span></label>}
                <div className="ex-go">
                    {msg && <p className="ex-msg" role="status">{msg}</p>}
                    <button className="m-pillbtn" disabled={!items.length || busy} onClick={go}><Icon name="download" size={15} /> {busy ? 'Esporto…' : `Esporta ${items.length || ''}`.trim()}</button>
                </div>
            </section>
        </div>
    );
};
