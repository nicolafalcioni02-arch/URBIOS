import React, { useMemo, useState } from 'react';
import { useCompact } from '../hooks/useCompact';
import { PrintCenterProvider, usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';
import { SECTIONS, sectionOf, sheetsFor } from './sections';
import { labOf, newId, overview, removeRecord, saveRecord } from './labLogic';
import { downloadXlsx } from './xlsx';
import { RecordForm } from './RecordForm';
import { Calc } from './Calc';
import { Icon } from './ui/icons';
import { Home } from './parts/Home';
import { Sidebar, NAV } from './parts/Sidebar';
import { SectionView } from './parts/SectionView';
import { labStyles } from './labStyles';

// Laboratorio: una workstation a sé (non una sottopagina). Barra laterale + Panoramica + elenco/editor per ogni area.
// Dati in db.lab. Mappa: README.md
// Il Centro stampa lavora su un "paziente": per il laboratorio basta uno studio vuoto (come in Chef)
const STUDIO = { id: '__lab', nome: '', cognome: '', visite: [] };

export const Lab = (props) => (
    <PrintCenterProvider patient={STUDIO} db={props.db} onUpdateDb={props.onUpdateDb} scope="lab">
        <LabInner {...props} />
    </PrintCenterProvider>
);

const stamp = () => new Date().toISOString().slice(0, 10);

const LabInner = ({ db, onUpdateDb, onBack }) => {
    const printCenter = usePrintCenter();
    const wide = !useCompact(899); // sotto i 900px: schede in alto ed editor a finestra
    const lab = useMemo(() => labOf(db), [db]);
    const ov = useMemo(() => overview(lab), [lab]);
    const alerts = ov.scaduti.length + ov.scorta.length + ov.scadenza.length;
    const [view, setView] = useState('home');
    const [sel, setSel] = useState(null); // { record, isNew }
    const [vol, setVol] = useState('');
    const section = sectionOf(view);

    const go = (key) => { setView(key); setSel(null); };
    const open = (key, id) => { setView(key); setSel(id ? { record: lab[key].find((r) => r.id === id) || null, isNew: false } : null); };
    const create = (key) => { const s = sectionOf(key); setView(key); setSel({ record: { id: newId(s.prefix), ...s.empty() }, isNew: true }); };
    // il quaderno ha le sue pagine a quadretti (il quaderno completo con indici esce come documento di laboratorio); le altre sezioni escono come documenti di laboratorio
    const printIds = (ids, extra) => printCenter.open([view === 'quaderno' && !extra ? { type: 'quaderno', ids } : { type: 'lab', kind: view, ids, volume: view === 'reagenti' ? vol : '', ...extra }]);
    const printBlank = () => printCenter.open([{ type: 'quaderno', view: 'vuote' }]);
    const excelAll = () => downloadXlsx(`laboratorio-${stamp()}.xlsx`, sheetsFor(lab));

    let main;
    if (view === 'home') main = <Home ov={ov} onOpen={open} onNew={create} />;
    else if (view === 'calcoli') main = <div className="lab-page"><header className="lab-page-head"><div><h1 className="lab-title">Calcoli</h1></div></header><Calc /></div>;
    else main = (
        <SectionView
            key={view}
            section={section}
            lab={lab}
            db={db}
            wide={wide}
            sel={sel && sel.record ? sel : null}
            onSelect={(r) => setSel(r ? { record: r, isNew: false } : null)}
            onNew={() => create(view)}
            onSave={(rec) => saveRecord(onUpdateDb, view, rec)}
            onDelete={() => { removeRecord(onUpdateDb, view, sel.record.id); setSel(null); }}
            onPrint={printIds}
            onBlank={view === 'quaderno' ? printBlank : null}
            onExcel={() => downloadXlsx(`${view}-${stamp()}.xlsx`, sheetsFor(lab, [view]))}
            vol={vol}
            setVol={setVol}
        />
    );

    return (
        <div className={`lab-ws${wide ? '' : ' narrow'}`}>
            <style>{labStyles}</style>
            {wide ? (
                <Sidebar lab={lab} view={view} alerts={alerts} onView={go} onOpen={open} onExcel={excelAll} onBack={onBack} />
            ) : (
                <header className="lab-top">
                    <div className="lab-top-row">
                        <button onClick={onBack} className="lab-iconbtn" aria-label="Cambia area"><Icon name="back" size={20} /></button>
                        <h1 className="lab-top-title">Laboratorio</h1>
                        <button className="lab-btn is-secondary is-sm" onClick={excelAll} aria-label="Esporta tutto in Excel"><Icon name="table" size={16} />Excel</button>
                    </div>
                    <div className="lab-tabs" role="tablist">
                        {NAV.map((n) => (
                            <button key={n.key} role="tab" aria-selected={view === n.key} className={view === n.key ? 'on' : ''} onClick={() => go(n.key)}>
                                <Icon name={n.icon} size={16} />{n.label}{n.key === 'home' ? (alerts ? <b>{alerts}</b> : null) : lab[n.key] ? <b>{lab[n.key].length}</b> : null}
                            </button>
                        ))}
                    </div>
                </header>
            )}
            <main className="lab-main">{main}</main>
            {!wide && sel && sel.record && section && (
                <RecordForm key={sel.record.id} section={section} record={sel.record} isNew={sel.isNew} lab={lab} onClose={() => setSel(null)} onSave={(rec) => saveRecord(onUpdateDb, view, rec)} onDelete={() => { removeRecord(onUpdateDb, view, sel.record.id); setSel(null); }} onPrint={(rec) => printIds([rec.id])} />
            )}
        </div>
    );
};
