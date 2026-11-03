import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { RecordForm } from '../RecordForm';
import { NotebookPreview } from './NotebookPreview';

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const pad = (n) => String(n).padStart(2, '0');

// Calendario in sola lettura: i giorni con almeno un esperimento sono segnati; toccando un giorno compaiono i titoli.
const ExperimentCalendar = ({ items, onClose }) => {
    const today = new Date();
    const [y, setY] = useState(today.getFullYear());
    const [m, setM] = useState(today.getMonth());
    const [day, setDay] = useState('');
    const byDay = useMemo(() => {
        const o = {};
        items.forEach((r) => { if (r.data) (o[r.data.slice(0, 10)] ||= []).push(r); });
        return o;
    }, [items]);
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    const n = new Date(y, m + 1, 0).getDate();
    const go = (d) => { const t = new Date(y, m + d, 1); setY(t.getFullYear()); setM(t.getMonth()); setDay(''); };
    const key = (d) => `${y}-${pad(m + 1)}-${pad(d)}`;
    const shown = day ? byDay[day] || [] : [];
    return (
        <>
            <div className="lab-pop-back" onClick={onClose} />
            <div className="lab-pop lab-cal" role="dialog" aria-label="Calendario esperimenti">
                <div className="lab-cal-head">
                    <button type="button" onClick={() => go(-1)} aria-label="Mese precedente"><Icon name="chevron-left" size={16} /></button>
                    <b>{MESI[m]} {y}</b>
                    <button type="button" onClick={() => go(1)} aria-label="Mese successivo"><Icon name="chevron-right" size={16} /></button>
                </div>
                <div className="lab-cal-grid">
                    {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}
                    {Array.from({ length: lead }, (_, i) => <i key={`e${i}`} />)}
                    {Array.from({ length: n }, (_, i) => {
                        const k = key(i + 1);
                        const has = !!byDay[k];
                        return <button type="button" key={k} className={`lab-cal-d${has ? ' has' : ''}${day === k ? ' sel' : ''}`} onClick={() => has && setDay(day === k ? '' : k)} aria-label={has ? `${i + 1} ${MESI[m]}: ${byDay[k].length} esperimenti` : undefined}>{i + 1}</button>;
                    })}
                </div>
                {shown.length > 0 && <div className="lab-cal-list">{shown.map((r) => <p key={r.id}>{r.titolo || 'Esperimento senza titolo'}{r.codice && <small> · {r.codice}</small>}</p>)}</div>}
            </div>
        </>
    );
};

// Una sezione: elenco (ricerca, filtri, selezione per stampare) e, accanto, l'editor (schermi larghi) o a finestra (telefono/tablet).
// Il record aperto è `sel = { record, isNew }`.
export const SectionView = ({ section, lab, wide, sel, onSelect, onNew, onSave, onDelete, onPrint, onBlank, onExcel, db, vol, setVol }) => {
    const [q, setQ] = useState('');
    const [group, setGroup] = useState('');
    const [fopen, setFopen] = useState(false);
    const [calOpen, setCalOpen] = useState(false);
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
                        <div className="lab-head-btns">
                            {section.key === 'quaderno' && (
                                <div className="lab-filterwrap">
                                    <button type="button" className="lab-btn is-secondary is-sm is-ico" aria-expanded={calOpen} aria-label="Calendario esperimenti" title="Calendario esperimenti" onClick={() => setCalOpen((o) => !o)}><Icon name="calendar" size={17} /></button>
                                    {calOpen && <ExperimentCalendar items={all} onClose={() => setCalOpen(false)} />}
                                </div>
                            )}
                            <button className="lab-btn is-ok is-sm is-ico" disabled={!list.length} onClick={onExcel} aria-label="Esporta in Excel" title="Esporta in Excel"><Icon name="table" size={17} /></button>
                            <button className="lab-btn is-primary is-sm is-ico" onClick={onNew} aria-label={`Nuovo ${section.single}`} title={`Nuovo ${section.single}`}><Icon name="plus" size={17} /></button>
                        </div>
                    </header>
                    <div className="lab-searchrow">
                        <input className="fld" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cerca in ${section.label.toLowerCase()}`} aria-label="Cerca" />
                        {groups.length > 1 && (
                            <div className="lab-filterwrap">
                                <button type="button" className={`lab-btn is-secondary is-sm is-ico lab-filterbtn${group ? ' on' : ''}`} aria-expanded={fopen} aria-label="Filtro" title={group ? `Filtro: ${group}` : 'Filtro'} onClick={() => setFopen((o) => !o)}><Icon name="filter" size={17} />{group && <i className="lab-filter-dot" />}</button>
                                {fopen && (
                                    <>
                                        <div className="lab-pop-back" onClick={() => setFopen(false)} />
                                        <div className="lab-pop" role="menu">
                                            <button role="menuitem" className={!group ? 'on' : ''} onClick={() => { setGroup(''); setFopen(false); }}>Tutti<em>{all.length}</em></button>
                                            {groups.map(([g, n]) => <button role="menuitem" key={g} className={group === g ? 'on' : ''} onClick={() => { setGroup(g); setFopen(false); }}>{g}<em>{n}</em></button>)}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="lab-listtools">
                        {section.key === 'reagenti' && <input className="fld" style={{ height: 38, flex: '1 1 130px' }} value={vol} onChange={(e) => setVol(e.target.value)} placeholder="Volume da preparare" aria-label="Volume da preparare in stampa" title="Se compilato, le quantità in stampa si scalano su questo volume finale" />}
                        {!page && <button className="lab-btn is-secondary is-sm is-ico" disabled={!list.length} onClick={() => onPrint(ids)} aria-label="Stampa" title={picked.length ? `Stampa ${picked.length} selezionate` : 'Stampa'}><Icon name="printer" size={17} />{picked.length > 0 && picked.length}</button>}
                        {onBlank && !page && <button className="lab-btn is-secondary is-sm is-ico" onClick={onBlank} aria-label="Pagine vuote" title="Pagine vuote: a quadretti, numerate, da compilare a mano"><Icon name="notebook" size={17} /></button>}
                        {picked.length > 0 && <button className="lab-btn is-ghost is-sm is-ico" onClick={() => setPicked([])} aria-label="Deseleziona" title="Deseleziona"><Icon name="x" size={17} /></button>}
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
                                            <span className="lab-item-top"><b>{section.title(r)}</b>{b && <span className={`lab-pill ${b.tone}`} title={b.label}>{b.label}</span>}</span>
                                            {section.sub(r) && <small>{section.sub(r)}</small>}
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
