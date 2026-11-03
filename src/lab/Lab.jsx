import React, { useMemo, useState } from 'react';
import { useCompact } from '../hooks/useCompact';
import { PrintCenterProvider, usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';
import { SECTIONS, sectionOf, sheetsFor } from './sections';
import { labOf, newId, removeRecord, saveRecord, stockState } from './labLogic';
import { downloadXlsx } from './xlsx';
import { RecordForm } from './RecordForm';
import { Calc } from './Calc';
import { labStyles } from './labStyles';

// Laboratorio: protocolli, ricettario reagenti, magazzino, campioni. Dati in db.lab. Mappa: README.md
// Il Centro stampa lavora su un "paziente": per il laboratorio basta uno studio vuoto (come in Chef)
const STUDIO = { id: '__lab', nome: '', cognome: '', visite: [] };

export const Lab = (props) => (
    <PrintCenterProvider patient={STUDIO} db={props.db} onUpdateDb={props.onUpdateDb}>
        <LabInner {...props} />
    </PrintCenterProvider>
);

const LabInner = ({ db, onUpdateDb, onBack }) => {
    const printCenter = usePrintCenter();
    const compact = useCompact(639);
    const lab = useMemo(() => labOf(db), [db]);
    const [tab, setTab] = useState('protocolli');
    const [q, setQ] = useState('');
    const [edit, setEdit] = useState(null); // { record, isNew }
    const [picked, setPicked] = useState([]);
    const [vol, setVol] = useState('');
    const section = sectionOf(tab);

    const list = useMemo(() => {
        if (!section) return [];
        const s = q.trim().toLowerCase();
        return lab[tab].filter((r) => !s || section.search(r).includes(s));
    }, [lab, tab, q, section]);

    const switchTab = (k) => { setTab(k); setQ(''); setPicked([]); };
    const togglePick = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    const printIds = (ids) => printCenter.open([{ type: 'lab', kind: tab, ids, volume: tab === 'reagenti' ? vol : '' }]);
    const stats = tab === 'magazzino' ? ['scaduto', 'scorta', 'scadenza'].map((id) => [id, lab.magazzino.filter((r) => stockState(r).id === id).length]) : [];
    const statLabel = { scaduto: 'Scaduti', scorta: 'Sotto scorta', scadenza: 'In scadenza (30 g)' };

    return (
        <div className="h-full w-full bg-[var(--paper)] overflow-y-auto font-sans">
            <style>{labStyles}</style>
            <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6" style={{ paddingTop: compact ? 'calc(12px + env(safe-area-inset-top))' : 28, paddingBottom: compact ? 'calc(28px + env(safe-area-inset-bottom))' : 40 }}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={onBack} className={compact ? 'hs-icon' : 'home-quiet'} aria-label="Indietro" style={compact ? { width: 40, height: 40 } : undefined}><i className="ph ph-arrow-left"></i>{!compact && <span>Indietro</span>}</button>
                        <h1 className="display text-[26px] sm:text-[32px] text-[color:var(--ink)]">Laboratorio</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="vw-chip" style={{ height: 44 }} onClick={() => downloadXlsx(`laboratorio-${new Date().toISOString().slice(0, 10)}.xlsx`, sheetsFor(lab))}><i className="ph ph-microsoft-excel-logo"></i><span>{compact ? 'Excel' : 'Esporta tutto in Excel'}</span></button>
                    </div>
                </div>

                <div className="lab-tabs mb-4" role="tablist">
                    {SECTIONS.map((s) => (
                        <button key={s.key} role="tab" aria-selected={tab === s.key} className={tab === s.key ? 'on' : ''} onClick={() => switchTab(s.key)}>
                            <i className={`ph ${s.icon}`}></i>{s.label}<b>{lab[s.key].length}</b>
                        </button>
                    ))}
                    <button role="tab" aria-selected={tab === 'calcoli'} className={tab === 'calcoli' ? 'on' : ''} onClick={() => switchTab('calcoli')}><i className="ph ph-calculator"></i>Calcoli</button>
                </div>

                {tab === 'calcoli' ? <Calc /> : (
                    <>
                        <p className="text-[13.5px] text-[color:var(--muted)] mb-3">{section.hint}</p>
                        <div className="lab-bar mb-3">
                            <input className="fld" style={{ flex: '1 1 220px', maxWidth: 360, height: 44 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cerca in ${section.label.toLowerCase()}`} aria-label="Cerca" />
                            {tab === 'reagenti' && <input className="fld" style={{ width: 150, height: 44 }} value={vol} onChange={(e) => setVol(e.target.value)} placeholder="Volume da preparare" aria-label="Volume da preparare in stampa" title="Se compilato, le quantità in stampa si scalano su questo volume finale" />}
                            <span className="flex-1" />
                            <button className="vw-chip" style={{ height: 44 }} disabled={!list.length} onClick={() => downloadXlsx(`${section.key}-${new Date().toISOString().slice(0, 10)}.xlsx`, sheetsFor(lab, [tab]))}><i className="ph ph-microsoft-excel-logo"></i><span>Excel</span></button>
                            <button className="vw-chip" style={{ height: 44 }} disabled={!list.length} onClick={() => printIds(picked.length ? picked : list.map((r) => r.id))}><i className="ph ph-printer"></i><span>{picked.length ? `Stampa ${picked.length}` : 'Stampa'}</span></button>
                            <button className="vw-next" style={{ height: 44 }} onClick={() => setEdit({ record: { id: newId(section.prefix), ...section.empty() }, isNew: true })}><i className="ph-bold ph-plus"></i><span>Nuovo</span></button>
                        </div>
                        {stats.length > 0 && (
                            <div className="lab-stats">{stats.map(([id, n]) => <div className="lab-stat" key={id}><b style={{ color: n && id === 'scaduto' ? 'var(--bad)' : n ? 'var(--warn)' : undefined }}>{n}</b>{statLabel[id]}</div>)}</div>
                        )}
                        {list.length === 0 ? (
                            <div className="lab-empty">{lab[tab].length ? 'Nessun risultato per questa ricerca.' : `Non c’è ancora nessun ${section.single}. Premi «Nuovo» per aggiungerne uno.`}</div>
                        ) : (
                            <div className="lab-grid">
                                {list.map((r) => {
                                    const b = section.badge(r);
                                    const sel = picked.includes(r.id);
                                    return (
                                        <div key={r.id} className={`lab-card${sel ? ' sel' : ''}`} role="button" tabIndex={0} onClick={() => setEdit({ record: r, isNew: false })} onKeyDown={(e) => e.key === 'Enter' && setEdit({ record: r, isNew: false })}>
                                            <div className="lab-card-top">
                                                <h3>{section.title(r)}</h3>
                                                <button type="button" className={`lab-check${sel ? ' on' : ''}`} aria-label={sel ? 'Togli dalla selezione' : 'Seleziona per stampare'} aria-pressed={sel} onClick={(e) => { e.stopPropagation(); togglePick(r.id); }}>{sel && <i className="ph-bold ph-check"></i>}</button>
                                            </div>
                                            {section.sub(r) && <p>{section.sub(r)}</p>}
                                            {b && <span className={`lab-pill ${b.tone}`}>{b.label}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
            {edit && (
                <RecordForm
                    key={edit.record.id}
                    section={section}
                    record={edit.record}
                    isNew={edit.isNew}
                    lab={lab}
                    onClose={() => setEdit(null)}
                    onSave={(rec) => { saveRecord(onUpdateDb, tab, rec); setEdit(null); }}
                    onDelete={() => { removeRecord(onUpdateDb, tab, edit.record.id); setEdit(null); }}
                    onPrint={(rec) => { saveRecord(onUpdateDb, tab, rec); setEdit(null); printCenter.open([{ type: 'lab', kind: tab, ids: [rec.id], volume: tab === 'reagenti' ? vol : '' }]); }}
                />
            )}
        </div>
    );
};
