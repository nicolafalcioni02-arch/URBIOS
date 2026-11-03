import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { RecordForm } from '../RecordForm';
import { NotebookPreview } from './NotebookPreview';

// Una sezione: elenco (ricerca, filtri, selezione per stampare) e, accanto, l'editor (schermi larghi) o a finestra (telefono/tablet).
// Il record aperto è `sel = { record, isNew }`.
export const SectionView = ({ section, lab, wide, sel, onSelect, onNew, onSave, onDelete, onPrint, onBlank, onExcel, db, vol, setVol }) => {
    const [q, setQ] = useState('');
    const [group, setGroup] = useState('');
    const [picked, setPicked] = useState([]);
    const all = lab[section.key];

    const groups = useMemo(() => {
        const m = new Map();
        all.forEach((r) => { const g = section.group(r); if (g) m.set(g, (m.get(g) || 0) + 1); });
        return [...m.entries()];
    }, [all, section]);

    const list = useMemo(() => {
        const s = q.trim().toLowerCase();
        const found = all.filter((r) => (!s || section.search(r).includes(s)) && (!group || section.group(r) === group));
        return section.sort ? [...found].sort(section.sort) : found;
    }, [all, q, group, section]);

    const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    const ids = picked.length ? picked : list.map((r) => r.id);
    const activeId = sel?.record.id;
    const page = wide; // il quaderno impaginato, fisso a destra del modulo, per ogni sezione

    return (
        <div className={`lab-split${page ? ' with-page' : ''}`}>
            <div className="lab-listcol">
                <div className="lab-listhead">
                    <header className="lab-page-head" style={{ marginBottom: 0, alignItems: 'center' }}>
                        <div>
                            <h1 className="lab-title">{section.label}</h1>
                        </div>
                        <button className="lab-btn is-primary is-sm" onClick={onNew}><Icon name="plus" size={14} />Nuovo</button>
                    </header>
                    <input className="fld" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cerca in ${section.label.toLowerCase()}`} aria-label="Cerca" />
                    {groups.length > 1 && (
                        <div className="seg lab-seg" role="group" aria-label="Filtra">
                            <button className={!group ? 'on' : ''} onClick={() => setGroup('')}>Tutti</button>
                            {groups.map(([g, n]) => <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(group === g ? '' : g)}>{g} {n}</button>)}
                        </div>
                    )}
                    <div className="lab-tools">
                        {section.key === 'reagenti' && <input className="fld" style={{ height: 38, flex: '1 1 130px' }} value={vol} onChange={(e) => setVol(e.target.value)} placeholder="Volume da preparare" aria-label="Volume da preparare in stampa" title="Se compilato, le quantità in stampa si scalano su questo volume finale" />}
                        <button className="lab-btn is-secondary is-sm" disabled={!list.length} onClick={onExcel}><Icon name="table" size={16} />Excel</button>
                        {!page && <button className="lab-btn is-secondary is-sm" disabled={!list.length} onClick={() => onPrint(ids)}><Icon name="printer" size={16} />{picked.length ? `Stampa ${picked.length}` : 'Stampa'}</button>}
                        {onBlank && !page && <button className="lab-btn is-secondary is-sm" onClick={onBlank} title="Pagine a quadretti numerate, da compilare a mano"><Icon name="notebook" size={16} />Pagine vuote</button>}
                        {picked.length > 0 && <button className="lab-btn is-ghost is-sm" onClick={() => setPicked([])}>Deseleziona</button>}
                    </div>
                </div>
                <div className="lab-listscroll">
                    {list.length === 0 ? (
                        <div className="lab-empty">{all.length ? 'Nessun risultato.' : `Non c’è ancora nessun ${section.single}.`}{!all.length && <button className="lab-btn is-secondary is-sm" style={{ margin: '12px auto 0' }} onClick={onNew}><Icon name="plus" size={16} />Crea il primo</button>}</div>
                    ) : (
                        <div className="panel lab-list">
                            {list.map((r) => {
                                const b = section.badge(r);
                                const on = picked.includes(r.id);
                                return (
                                    <div key={r.id} className={`lab-item${activeId === r.id ? ' sel' : ''}`}>
                                        <button type="button" className="lab-item-main" onClick={() => onSelect(r)} aria-current={activeId === r.id ? 'true' : undefined}>
                                            <b>{section.title(r)}</b>
                                            {section.sub(r) && <small>{section.sub(r)}</small>}
                                            {b && <span className={`lab-pill ${b.tone}`}>{b.label}</span>}
                                        </button>
                                        <button type="button" className={`lab-check${on ? ' on' : ''}`} aria-label={on ? 'Togli dalla selezione' : 'Seleziona per stampare'} aria-pressed={on} onClick={() => toggle(r.id)}>{on && <Icon name="check" size={13} stroke={2.4} />}</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {wide && (
                <div className="lab-detail">
                    {sel ? <RecordForm key={sel.record.id} inline section={section} record={sel.record} isNew={sel.isNew} lab={lab} onSave={onSave} onDelete={onDelete} onPrint={onPrint && !page && ((rec) => onPrint([rec.id]))} onClose={() => onSelect(null)} /> : (
                        <div className="lab-detail-empty"><Icon name={section.icon} size={30} /><p>Seleziona una voce dall’elenco o creane una nuova.</p></div>
                    )}
                </div>
            )}
            {page && <NotebookPreview db={db} activeId={activeId} kind={section.key} vol={section.key === 'reagenti' ? vol : ''} />}
        </div>
    );
};
