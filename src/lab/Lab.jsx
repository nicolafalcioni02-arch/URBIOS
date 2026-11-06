import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCompact } from '../hooks/useCompact';
import { useArchive } from '../storage/ArchiveProvider';
import { PrintCenterProvider, usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';
import { SECTIONS, sectionOf, sheetsFor } from './sections';
import { labOf, newId, overview, removeRecord, saveRecord } from './labLogic';
import { downloadXlsx } from './xlsx';
import { StockImport } from './parts/StockImport';
import { labIsEmpty, loadExample } from './exampleData';
import { Sidebar } from './parts/Sidebar';
import { labStyles } from './labStyles';
import { SettingsModal } from '../views/settings/SettingsModal';
import { mobileStyles } from './mobileStyles';
import { Mobile } from './parts/Mobile';
import { Workspace } from './parts/Workspace';
import { WidgetDock } from '../components/widgets/WidgetDock';

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
    const { dirty, ephemeral, saveFile } = useArchive();
    // «Salva giornata di lavoro»: scrive l'archivio su file (in demo non si salva nulla)
    const [note, setNote] = useState(''); // risposta breve sul tasto: 'saved' | 'demo'
    const saveDay = async () => {
        const flash = (n) => { setNote(n); setTimeout(() => setNote(''), 2500); };
        if (ephemeral) return flash('demo');
        try { const res = await saveFile(); if (res && res.ok) flash('saved'); else if (res && !res.cancelled) alert('Salvataggio non riuscito'); } catch (e) { alert('Salvataggio non riuscito: ' + (e.message || e)); }
    };
    const phone = useCompact(639); // iPhone: schermate a un tasto per volta (parts/Mobile.jsx)
    const desk = !useCompact(1099); // da 1100px: barra laterale + due colonne; sotto: barra in basso (iPad)
    const lab = useMemo(() => labOf(db), [db]);
    const ov = useMemo(() => overview(lab), [lab]);
    // TEMPORANEO (da togliere prima della pubblicazione): i dati di esempio (exampleData.js + exampleExtra.js) ci sono sempre, senza premere nulla.
    // Si inseriscono una volta per apertura se il laboratorio è vuoto.
    const seeded = useRef(false);
    useEffect(() => { if (!seeded.current && labIsEmpty(lab)) { seeded.current = true; loadExample(onUpdateDb); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const alerts = ov.scaduti.length + ov.scorta.length + ov.scadenza.length;
    const [view, setView] = useState('home');
    const [sel, setSel] = useState(null); // { record, isNew }
    const [vol, setVol] = useState('');
    const section = sectionOf(view);

    // postazione (iPad e PC): schede delle voci aperte, una attiva e al massimo una affiancata
    const split = !phone;
    const [tabs, setTabs] = useState([]);
    const [active, setActive] = useState(null);
    const [second, setSecond] = useState(null);
    const openTab = (key, rec, isNew = false, kind = 'rec') => {
        const id = `${kind}:${key}:${rec.id}`;
        setTabs((t) => (t.some((x) => x.id === id) ? t : [...t, { id, kind, key, recId: rec.id, rec, isNew }]));
        if (kind === 'print') setSecond(id); else { setActive(id); setSecond((b) => (b === id ? null : b)); }
    };
    const closeTab = (id) => {
        setTabs((t) => t.filter((x) => x.id !== id));
        if (second === id) setSecond(null);
        if (active === id) { const rest = tabs.filter((x) => x.id !== id && x.id !== second); setActive(rest.length ? rest[rest.length - 1].id : second); if (rest.length === 0) setSecond(null); }
    };
    // trascinando le schede: i due pannelli si scambiano, oppure una scheda prende il posto di un pannello
    const syncView = (id) => { const t = tabs.find((x) => x.id === id); if (t) { setView(t.key); setSel(t.kind === 'rec' ? { record: t.rec, isNew: false } : null); } };
    const swapPanes = () => { if (!second) return; setActive(second); setSecond(active); syncView(second); };
    const placePane = (slot, id) => {
        if (slot === 'a') { if (id === second) { swapPanes(); return; } setActive(id); syncView(id); } else { if (id === active) { swapPanes(); return; } setSecond(id); }
    };
    const show = (key, rec, isNew = false) => { setView(key); setSel({ record: rec, isNew }); if (split) openTab(key, rec, isNew); };
    // su iPad e PC la calcolatrice è una finestra della scrivania: si va alla Panoramica e la si apre lì
    const [calcN, setCalcN] = useState(0);
    const go = (key) => { if (split && (key === 'calcoli' || key === 'calcolatrice')) { setView('home'); setSel(null); setCalcN((n) => n + 1); return; } setView(key); setSel(null); };
    const open = (key, id) => { const r = id ? lab[key].find((x) => x.id === id) : null; if (r) show(key, r); else { setView(key); setSel(null); } };
    const create = (key) => { const s = sectionOf(key); show(key, { id: newId(s.prefix), ...s.empty(lab) }, true); };
    // tutto esce come documento di laboratorio (il vecchio quaderno a quadretti è archiviato in print/, fuori dal flusso)
    const printIds = (ids, extra) => printCenter.open([{ type: 'lab', kind: view, ids, volume: view === 'reagenti' ? vol : '', ...extra }]);
    // nuovo esperimento da un protocollo registrato: titolo, stanza, posizioni, materiali e passaggi si copiano (poi si lavora in sola lettura)
    const startFrom = (proto, stay) => {
        const sec = sectionOf('quaderno');
        const rec = { id: newId(sec.prefix), ...sec.empty(lab), titolo: proto.titolo, protocolloId: proto.id, stanza: proto.stanza || '', posizioni: proto.posizioni || '', passaggi: (proto.passaggi || []).map((x) => ({ ...x, fatto: false })), materiali: (proto.materiali || []).map((m) => ({ ...m })) };
        saveRecord(onUpdateDb, 'quaderno', rec);
        if (!stay) show('quaderno', rec);
        return rec;
    };
    // pagina libera (appunti, importata da Word o vuota)
    const startPage = (init = {}, stay) => {
        const sec = sectionOf('quaderno');
        const rec = { id: newId(sec.prefix), ...sec.empty(lab), tipo: 'pagina', titolo: init.titolo || '', blocchi: init.blocchi || [{ t: 'testo', html: '' }] };
        saveRecord(onUpdateDb, 'quaderno', rec);
        if (!stay) show('quaderno', rec);
        return rec;
    };
    // rifà un esperimento: stessa impostazione, nuova data, spunte e risultati azzerati
    const repeat = (r) => {
        const sec = sectionOf('quaderno');
        const rec = { ...r, id: newId(sec.prefix), data: stamp(), codice: '', osservazioni: '', risultati: '', conclusioni: '', prossimi: '', verificatoDa: '', dataVerifica: '', figure: [], passaggi: (r.passaggi || []).map((x) => ({ ...x, fatto: false })), materiali: (r.materiali || []).map(({ preso, ...m }) => m) };
        delete rec.scaricato;
        saveRecord(onUpdateDb, 'quaderno', rec);
        show('quaderno', rec);
    };
    // «Salva» dal lavoro: l'esperimento di oggi diventa un nuovo protocollo (versione successiva); l'originale resta com'è
    const protoVersion = (r) => { const o = lab.protocolli.find((p) => p.id === r.protocolloId); if (!o) return '1.0'; const m = String(o.versione || '1.0').match(/^(\d+)(?:\.(\d+))?/); return m ? `${m[1]}.${(+m[2] || 0) + 1}` : `${o.versione}.1`; };
    const saveAsProtocol = (r) => {
        const sec = sectionOf('protocolli'); const o = lab.protocolli.find((p) => p.id === r.protocolloId) || {};
        const rec = { ...sec.empty(lab), ...o, id: newId(sec.prefix), origineId: o.id ? (o.origineId || o.id) : undefined, titolo: o.titolo || r.titolo, versione: protoVersion(r), data: stamp(), stanza: r.stanza || '', posizioni: r.posizioni || '', passaggi: (r.passaggi || []).map(({ fatto, ...x }) => x), materiali: (r.materiali || []).map(({ preso, scaricato, ...m }) => m) };
        saveRecord(onUpdateDb, 'protocolli', rec);
        saveRecord(onUpdateDb, 'quaderno', { ...r, protocolloId: rec.id });
    };
    const saveIn = (key, r, tabId) => { saveRecord(onUpdateDb, key, r); if (tabId) setTabs((t) => t.map((x) => (x.id === tabId && x.isNew ? { ...x, isNew: false, rec: r } : x))); };
    const deleteIn = (key, id, tabId) => { removeRecord(onUpdateDb, key, id); closeTab(tabId); setSel(null); };
    const [importing, setImporting] = useState(false);
    const [settings, setSettings] = useState(false);
    const [wdEdit, setWdEdit] = useState(false);
    // i widget del calendario segnano i giorni degli esperimenti (al posto delle visite)
    const widgetDb = useMemo(() => ({ ...db, labOv: ov, agenda: lab.quaderno.filter((r) => r.data).map((r) => ({ id: r.id, start: String(r.data).slice(0, 10), titolo: r.titolo })) }), [db, lab.quaderno, ov]);
    const excelAll = () => downloadXlsx(`laboratorio-${stamp()}.xlsx`, sheetsFor(lab));

    const rec = sel && sel.record ? { ...sel, record: (lab[view] || []).find((r) => r.id === sel.record.id) || sel.record } : null;
    const tools = !split ? undefined : [
        view !== 'home' && view !== 'calcoli' && view !== 'calcolatrice' && { icon: 'table', green: true, label: 'Excel', onClick: () => downloadXlsx(`${view}-${stamp()}.xlsx`, sheetsFor(lab, [view])) },
        view === 'magazzino' && { icon: 'upload', green: true, label: 'Importa da Excel', onClick: () => setImporting(true) },
        view === 'quaderno' && { icon: 'notebook', label: 'Quaderno completo', onClick: () => openTab('quaderno', { id: '__book' }, false, 'book') },
    ].filter(Boolean);
    const shell = (
        <Mobile
            dock={desk ? <WidgetDock reserve={330} mode="lab" db={widgetDb} onUpdateDb={onUpdateDb} editing={wdEdit} onEditingChange={setWdEdit} onOpenAgenda={() => {}} /> : null}
            lab={lab} ov={ov} alerts={alerts} empty={labIsEmpty(lab)} view={view === 'calcoli' || view === 'calcolatrice' ? (split ? 'home' : 'calcolatrice') : view} sel={rec} section={section}
            split={split} embed={desk} tools={tools} onRemove={(k, id) => deleteIn(k, id, `rec:${k}:${id}`)} onRestore={(k, r) => saveRecord(onUpdateDb, k, r)} onSaveIn={(k, r) => saveIn(k, r)} calcReq={calcN}
            onExample={() => loadExample(onUpdateDb)} onGo={go} onOpen={open} onNew={create}
            onSelect={(r) => { if (r && r.id) show(view, r); else setSel(null); }}
            right={split ? (
                <Workspace lab={lab} db={db} desk={desk} dock={desk ? <WidgetDock mode="lab" db={widgetDb} onUpdateDb={onUpdateDb} editing={wdEdit} onEditingChange={setWdEdit} onOpenAgenda={() => {}} /> : null} tabs={tabs} active={active} second={second}
                    onActive={(id) => { setActive(id); setSecond((b) => (b === id ? null : b)); const t = tabs.find((x) => x.id === id); if (t) { setView(t.key); setSel(t.kind === 'rec' ? { record: t.rec, isNew: false } : null); } }}
                    onSecond={setSecond} onSwap={swapPanes} onPlace={placePane} onClose={closeTab} onOpenPrint={(t) => openTab(t.key, { id: t.recId }, false, 'print')}
                    onSave={saveIn} onDelete={deleteIn} onPrint={printIds} onNewFrom={startFrom} onSaveStock={(r) => saveRecord(onUpdateDb, 'magazzino', r)} protoVersion={protoVersion} onSaveProto={saveAsProtocol} />
            ) : undefined}
            onSave={(r) => saveRecord(onUpdateDb, view, r)}
            onDelete={() => { removeRecord(onUpdateDb, view, sel.record.id); setSel(null); }}
            onNewFrom={startFrom} onNewPage={startPage} protoVersion={protoVersion} onSaveProto={saveAsProtocol} onSaveStock={(r) => saveRecord(onUpdateDb, 'magazzino', r)} onPrint={printIds} onSettings={() => setSettings(true)} onBack={onBack}
        />
    );
    const common = (
        <>
            <style>{labStyles}</style>
            <style>{mobileStyles}</style>
            {importing && <StockImport lab={lab} onClose={() => setImporting(false)} onApply={(recs) => recs.forEach((r) => saveRecord(onUpdateDb, 'magazzino', r))} />}
            {settings && <SettingsModal scope="lab" db={db} onUpdateDb={onUpdateDb} onClose={() => setSettings(false)} />}
        </>
    );

    // iPhone e iPad: schermata intera con la barra in basso (iPad a due colonne)
    if (!desk) return <div className={`lab-ws phone${split ? ' is-split' : ''}`}>{common}{shell}</div>;

    // PC: barra laterale delle aree + la stessa interfaccia a due colonne
    return (
        <div className="lab-ws">
            {common}
            <Sidebar lab={lab} view={view === 'calcolatrice' ? 'calcoli' : view} alerts={alerts} onView={go} onOpen={open} onExcel={excelAll} onSaveDay={saveDay} saveState={note || (!ephemeral && dirty ? 'dirty' : 'clean')} onBack={onBack} onSettings={() => setSettings(true)} />
            <main className="lab-main"><div className="phone embed is-split">{shell}</div></main>
        </div>
    );
};
