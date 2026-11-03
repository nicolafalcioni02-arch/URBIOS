import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './ui/icons';
import { FiguresEditor } from './FiguresEditor';

// Editor di un record: i campi vengono dal registro (sections.js). Salva da solo (come le Impostazioni): niente tasto Salva.
// Un record nuovo viene creato appena il primo campo (titolo/codice) è compilato.
// inline = pannello accanto all'elenco (schermi larghi); altrimenti finestra a tutta altezza (telefono, tablet).
const Steps = ({ value, onChange }) => {
    const list = value || [];
    const set = (i, patch) => onChange(list.map((s, k) => (k === i ? { ...s, ...patch } : s)));
    return (
        <div className="lab-rows">
            {list.map((s, i) => (
                <div className="lab-step" key={i}>
                    <span>{i + 1}</span>
                    <textarea className="fld" rows={1} value={s.testo || ''} placeholder="Descrivi il passaggio" onChange={(e) => set(i, { testo: e.target.value })} />
                    <input className="fld" style={{ height: 40 }} value={s.durata || ''} placeholder="Tempo" onChange={(e) => set(i, { durata: e.target.value })} />
                    <button type="button" className="lab-x" aria-label="Togli passaggio" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>
                </div>
            ))}
            <button type="button" className="lab-add" onClick={() => onChange([...list, { testo: '', durata: '' }])}><Icon name="plus" size={15} />Aggiungi passaggio</button>
        </div>
    );
};

const Rows = ({ cols, value, onChange }) => {
    const list = value || [];
    const tpl = `${cols.map((c) => `minmax(0,${c.w}fr)`).join(' ')} 34px`;
    const set = (i, key, v) => onChange(list.map((r, k) => (k === i ? { ...r, [key]: v } : r)));
    return (
        <div className="lab-rows">
            {list.length > 0 && (
                <div className="lab-row" style={{ gridTemplateColumns: tpl }}>
                    {cols.map((c) => <span key={c.key} className="fld-label">{c.label}</span>)}
                    <span />
                </div>
            )}
            {list.map((r, i) => (
                <div className="lab-row" key={i} style={{ gridTemplateColumns: tpl }}>
                    {cols.map((c) => <input key={c.key} className="fld" value={r[c.key] || ''} aria-label={c.label} onChange={(e) => set(i, c.key, e.target.value)} />)}
                    <button type="button" className="lab-x" aria-label="Togli riga" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>
                </div>
            ))}
            <button type="button" className="lab-add" onClick={() => onChange([...list, {}])}><Icon name="plus" size={15} />Aggiungi riga</button>
        </div>
    );
};

export const RecordForm = ({ section, record, lab, isNew, inline, onSave, onDelete, onPrint, onClose }) => {
    const [d, setD] = useState(record);
    const [saved, setSaved] = useState(!isNew);
    const dirty = useRef(false);
    const dead = useRef(false);
    const latest = useRef(d);
    latest.current = d;
    const save = useRef(onSave);
    save.current = onSave;
    const ok = Boolean(String(d[section.fields[0].key] || '').trim());

    const flush = () => {
        if (dirty.current && !dead.current && String(latest.current[section.fields[0].key] || '').trim()) {
            dirty.current = false;
            save.current(latest.current);
            setSaved(true);
        }
    };
    // mentre si scrive il modulo non deve spostarsi: se il browser (Safari) lo fa scorrere da solo, lo si rimette dov'era
    const scroller = useRef(null);
    const hold = useRef({ top: null, until: 0, user: 0 });
    const set = (k, v) => {
        const el = scroller.current;
        if (el) hold.current = { ...hold.current, top: el.scrollTop, until: Date.now() + 2500 };
        dirty.current = true; setSaved(false); setD((x) => ({ ...x, [k]: v }));
    };
    const restore = () => {
        const el = scroller.current;
        const h = hold.current;
        if (el && h.top !== null && Date.now() < h.until && Date.now() - h.user > 400 && Math.abs(el.scrollTop - h.top) > 1) el.scrollTop = h.top;
    };
    useLayoutEffect(restore);
    useEffect(() => {
        const el = scroller.current;
        if (!el) return undefined;
        const mark = () => { hold.current = { ...hold.current, top: null, user: Date.now() }; };
        el.addEventListener('scroll', restore);
        ['wheel', 'touchstart', 'pointerdown'].forEach((ev) => el.addEventListener(ev, mark, { passive: true }));
        return () => { el.removeEventListener('scroll', restore); ['wheel', 'touchstart', 'pointerdown'].forEach((ev) => el.removeEventListener(ev, mark)); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!dirty.current) return undefined;
        const t = setTimeout(flush, 500);
        return () => clearTimeout(t);
    }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => { if (dirty.current && !dead.current && String(latest.current[section.fields[0].key] || '').trim()) save.current(latest.current); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const suggestions = (f) => [...new Set(lab[section.key].map((r) => String(r[f.key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));

    const input = (f) => {
        if (f.type === 'area') return <textarea className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />;
        if (f.type === 'select') return <select className="fld" value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
        if (f.type === 'ref') return <select className="fld" value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}><option value="">—</option>{lab[f.from].map((r) => <option key={r.id} value={r.id}>{[r.codice, r.titolo].filter(Boolean).join(' · ')}</option>)}</select>;
        if (f.type === 'steps') return <Steps value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'figures') return <FiguresEditor value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'rows') return <Rows cols={f.cols} value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        const listId = f.list ? `lab-dl-${section.key}-${f.key}` : undefined;
        return (
            <>
                <input className="fld" type={f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} list={listId} value={d[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                {listId && <datalist id={listId}>{suggestions(f).map((s) => <option key={s} value={s} />)}</datalist>}
            </>
        );
    };

    const body = (
        <>
            <div className="lab-pane-head">
                <div className="min-w-0">
                    <h2 className="lab-title lab-pane-title">{section.title(d)}</h2>
                </div>
                <div className="lab-pane-actions">
                    <span className="lab-saved" aria-live="polite">{!ok ? '' : saved ? 'Salvato' : 'Salvataggio…'}</span>
                    {ok && onPrint && <button className="lab-btn is-secondary" onClick={() => { flush(); onPrint(d); }} aria-label="Stampa"><Icon name="printer" size={16} /><span className="lab-hide-s">Stampa</span></button>}
                    {ok && <button className="lab-btn is-danger" aria-label="Elimina" onClick={() => { if (window.confirm(`Eliminare questo ${section.single}?`)) { dead.current = true; onDelete(); } }}><Icon name="trash" size={16} /><span className="lab-hide-s">Elimina</span></button>}
                    {!inline && <button className="lab-btn is-primary" onClick={() => { flush(); onClose(); }}>Fatto</button>}
                </div>
            </div>
            <div className="lab-form">
                {section.fields.map((f) => (
                    <div key={f.key} className={f.full ? 'full' : ''}>
                        <label className="fld-label">{f.label}</label>
                        {input(f)}
                    </div>
                ))}
            </div>
        </>
    );

    if (inline) return <div className="lab-pane" ref={scroller}>{body}</div>;
    return (
        <div className="sheet-back" onClick={() => { flush(); onClose(); }}>
            <div className="lab-modal" ref={scroller} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={isNew ? `Nuovo ${section.single}` : `Modifica ${section.single}`}>{body}</div>
        </div>
    );
};
