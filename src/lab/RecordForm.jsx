import React, { useState } from 'react';

// Finestra di modifica di un record: i campi vengono dal registro (sections.js), nessun campo è scritto qui.
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
                    <button type="button" className="lab-x" aria-label="Togli passaggio" onClick={() => onChange(list.filter((_, k) => k !== i))}><i className="ph ph-x"></i></button>
                </div>
            ))}
            <button type="button" className="lab-add" onClick={() => onChange([...list, { testo: '', durata: '' }])}><i className="ph ph-plus"></i>Aggiungi passaggio</button>
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
                    <button type="button" className="lab-x" aria-label="Togli riga" onClick={() => onChange(list.filter((_, k) => k !== i))}><i className="ph ph-x"></i></button>
                </div>
            ))}
            <button type="button" className="lab-add" onClick={() => onChange([...list, {}])}><i className="ph ph-plus"></i>Aggiungi riga</button>
        </div>
    );
};

export const RecordForm = ({ section, record, lab, isNew, onSave, onDelete, onPrint, onClose }) => {
    const [d, setD] = useState(record);
    const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
    const suggestions = (f) => [...new Set(lab[section.key].map((r) => String(r[f.key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));
    const ok = Boolean(String(d[section.fields[0].key] || '').trim());

    const input = (f) => {
        if (f.type === 'area') return <textarea className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />;
        if (f.type === 'select') return <select className="fld" value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
        if (f.type === 'ref') return <select className="fld" value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}><option value="">—</option>{lab[f.from].map((r) => <option key={r.id} value={r.id}>{[r.codice, r.titolo].filter(Boolean).join(' · ')}</option>)}</select>;
        if (f.type === 'steps') return <Steps value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'rows') return <Rows cols={f.cols} value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        const listId = f.list ? `lab-dl-${section.key}-${f.key}` : undefined;
        return (
            <>
                <input className="fld" type={f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} list={listId} value={d[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                {listId && <datalist id={listId}>{suggestions(f).map((s) => <option key={s} value={s} />)}</datalist>}
            </>
        );
    };

    return (
        <div className="sheet-back" onClick={onClose}>
            <div className="lab-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={isNew ? `Nuovo ${section.single}` : `Modifica ${section.single}`}>
                <h3 className="display text-[24px] mb-4">{isNew ? `Nuovo ${section.single}` : section.title(d)}</h3>
                <div className="lab-form">
                    {section.fields.map((f) => (
                        <div key={f.key} className={f.full ? 'full' : ''}>
                            <label className="fld-label">{f.label}</label>
                            {input(f)}
                        </div>
                    ))}
                </div>
                <div className="lab-modal-foot">
                    <div className="flex gap-2">
                        {!isNew && <button className="vw-chip" style={{ height: 42, color: 'var(--bad)' }} onClick={() => window.confirm(`Eliminare questo ${section.single}?`) && onDelete()}><i className="ph ph-trash"></i><span>Elimina</span></button>}
                        {!isNew && onPrint && <button className="vw-chip" style={{ height: 42 }} onClick={() => onPrint(d)}><i className="ph ph-printer"></i><span>Stampa</span></button>}
                    </div>
                    <div className="flex gap-2">
                        <button className="vw-chip" style={{ height: 42 }} onClick={onClose}>Annulla</button>
                        <button className="vw-next" style={{ height: 42 }} disabled={!ok} onClick={() => onSave(d)}>Salva</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
