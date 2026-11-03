import React, { useEffect, useMemo, useState } from 'react';
import { useCompact } from '../hooks/useCompact';
import { PrintCenterProvider, usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';
import { professionalFor } from '../storage/example/example';
import { InvoiceModal } from './InvoiceModal';
import { daysTo, expensesOf, rowsOf, unbilledMenus, unbilledVisits } from './accountingLogic';
import { allInvoices, computeTotals, label, nextNumber, stateOf } from './invoiceLogic';
import { Overview } from './parts/Overview';
import { InvoiceList } from './parts/InvoiceList';
import { Expenses } from './parts/Expenses';
import { TodoRail } from './parts/TodoRail';
import { DeadlinesRail } from './parts/DeadlinesRail';
import { PatientPicker } from './parts/PatientPicker';

const OpenOnMount = ({ id }) => {
    const pc = usePrintCenter();
    useEffect(() => { pc.open([{ type: 'fattura', invoiceId: id }]); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};

const download = (name, head, lines) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + [head.join(';'), ...lines].join('\n')], { type: 'text/csv' }));
    a.download = name;
    a.click();
};
const cell = (v) => `"${String(typeof v === 'number' ? v.toFixed(2).replace('.', ',') : v ?? '').replace(/"/g, '""')}"`;

// Contabilità: panoramica dell'anno, registro delle fatture (emesse dallo storico di ogni paziente) e spese. Mappa: README.md
export const InvoicesView = ({ db, onUpdateDb, onBack, onOpenPatient }) => {
    const all = useMemo(() => allInvoices(db), [db]);
    const thisYear = new Date().getFullYear();
    const years = [...new Set([thisYear, ...all.map((x) => x.inv.anno), ...(db.spese || []).map((s) => Number(String(s.data).slice(0, 4)))])].filter(Boolean).sort((a, b) => b - a);
    const [year, setYear] = useState(thisYear);
    const [tab, setTab] = useState('panoramica');
    const [edit, setEdit] = useState(null); // { patient, invoice }
    const [picking, setPicking] = useState(false); // scelta del paziente per una nuova fattura
    const [print, setPrint] = useState(null); // { patient, id, n }
    const prof = db.utente || {};
    const compact = useCompact(639); // telefono: una sola colonna, i pannelli laterali diventano schede
    // pannelli laterali: tutto calcolato dai dati (su tutti gli anni, non solo quello scelto)
    const visitsToBill = useMemo(() => unbilledVisits(db), [db]);
    const menusToBill = useMemo(() => unbilledMenus(db), [db]);
    const openAll = all.filter((x) => x.inv.stato === 'da_incassare').sort((a, b) => String(a.inv.scadenza || a.inv.data).localeCompare(String(b.inv.scadenza || b.inv.data)));
    const due = openAll.filter((x) => x.inv.scadenza && daysTo(x.inv.scadenza) <= 45);
    const missingCf = [...new Map(all.filter((x) => !String(x.patient.cf || '').trim()).map((x) => [x.patient.id, x.patient])).values()];
    const reminders = db.scadenze || [];
    const setReminders = (f) => onUpdateDb((prev) => ({ ...prev, scadenze: f(prev.scadenze || []) }));

    const rows = rowsOf(db, year);
    const registry = allInvoices(db).filter((x) => x.inv.anno === year);
    const expenses = expensesOf(db, year);
    const freshPatient = (p) => db.pazienti.find((x) => x.id === p.id) || p;

    const markPaid = ({ inv, patient }) =>
        onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id !== patient.id ? p : { ...p, fatture: p.fatture.map((x) => (x.id === inv.id ? { ...x, stato: 'pagata', dataPag: new Date().toISOString().slice(0, 10) } : x)) })) }));

    const kindOf = (inv) => (inv.menuId ? 'Servizio menù' : inv.visitaId ? 'Visita' : 'Altra prestazione');
    const exportInvoices = () =>
        download(`fatture-${year}.csv`, ['Numero', 'Data', 'Scadenza', 'Paziente', 'Codice fiscale', 'Indirizzo', 'Tipo', 'Prestazioni', 'Imponibile', 'Rivalsa %', 'Rivalsa', 'IVA %', 'IVA', 'Bollo', 'Totale', 'Nota in fattura', 'Stato', 'Metodo', 'Incassata il'],
            registry.map(({ inv, patient }) => { const t = computeTotals(inv); const c = inv.cliente || {}; return [label(inv), inv.data, inv.scadenza || '', c.nome || `${patient.nome} ${patient.cognome}`, c.cf ?? patient.cf ?? '', c.indirizzo || '', kindOf(inv), (inv.righe || []).filter((r) => String(r.desc).trim()).map((r) => `${r.desc}${Number(r.qta) > 1 ? ` x${r.qta}` : ''}`).join(' + '), t.imponibile, inv.rivalsaPerc || 0, t.rivalsa, inv.ivaPerc || 0, t.iva, t.bollo, t.totale, inv.note || '', stateOf(inv).label, inv.metodo || '', inv.dataPag || ''].map(cell).join(';'); }));
    const exportExpenses = () => download(`spese-${year}.csv`, ['Data', 'Descrizione', 'Categoria', 'Importo'], expenses.map((e) => [e.data, e.descrizione, e.categoria, Number(String(e.importo).replace(',', '.')) || 0].map(cell).join(';')));

    const todo = <TodoRail visits={visitsToBill} menus={menusToBill} open={openAll} missingCf={missingCf}
        onBillVisit={({ patient, visit, service }) => setEdit({ patient, invoice: null, visit, service })}
        onBillMenu={({ patient, menu }) => setEdit({ patient, invoice: null, menu })}
        onPaid={markPaid} onEditPatientFix={(p) => onOpenPatient && onOpenPatient(p.id)} />;
    const deadlines = <DeadlinesRail due={due} reminders={reminders} year={thisYear} regime={prof.regime_fiscale}
        onAdd={(r) => setReminders((l) => [...l, { ...r, id: `sc_${Date.now()}_${l.length}`, fatto: false }])}
        onToggle={(id) => setReminders((l) => l.map((r) => (r.id === id ? { ...r, fatto: !r.fatto } : r)))}
        onRemove={(id) => window.confirm('Eliminare questa scadenza?') && setReminders((l) => l.filter((r) => r.id !== id))} />;

    const badge = (n) => (n ? ` ${n}` : '');
    const tabs = compact
        ? [['panoramica', 'Panoramica'], ['dafare', `Da fare${badge(visitsToBill.length + menusToBill.length)}`], ['fatture', `Fatture${badge(registry.length)}`], ['spese', `Spese${badge(expenses.length)}`], ['scadenze', 'Scadenze']]
        : [['panoramica', 'Panoramica'], ['fatture', `Fatture ${registry.length}`], ['spese', `Spese ${expenses.length}`]];
    const exporter = tab === 'spese' ? exportExpenses : exportInvoices;
    const exportLabel = tab === 'panoramica' ? `Esporta fatture ${year}` : 'Esporta CSV';
    const showExport = ['panoramica', 'fatture', 'spese'].includes(tab);

    return (
        <div className="h-full w-full bg-[var(--paper)] overflow-y-auto xl:overflow-hidden font-sans">
            <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 xl:h-full xl:flex xl:flex-col" style={{ paddingTop: compact ? 'calc(12px + env(safe-area-inset-top))' : 28, paddingBottom: compact ? 'calc(28px + env(safe-area-inset-bottom))' : 20 }}>
                {compact ? (
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={onBack} className="hs-icon" aria-label="Indietro" style={{ width: 40, height: 40 }}><i className="ph ph-arrow-left"></i></button>
                        <h1 className="display text-[24px] text-[color:var(--ink)] flex-1 min-w-0 truncate">Contabilità</h1>
                        <select className="fld" style={{ flex: '0 0 84px', width: 84, height: 40, paddingLeft: 10, paddingRight: 6 }} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Anno">{years.map((y) => <option key={y}>{y}</option>)}</select>
                        <button className="vw-next" style={{ flex: '0 0 40px', width: 40, minWidth: 40, height: 40, padding: 0, justifyContent: 'center' }} onClick={() => setPicking(true)} disabled={!db.pazienti.length} aria-label="Nuova fattura"><i className="ph-bold ph-plus"></i></button>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <button onClick={onBack} className="home-quiet"><i className="ph ph-arrow-left"></i><span>Indietro</span></button>
                            <h1 className="display text-[32px] text-[color:var(--ink)]">Contabilità</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="fld" style={{ width: 100 }} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Anno">{years.map((y) => <option key={y}>{y}</option>)}</select>
                            <button className="vw-next" style={{ height: 44, whiteSpace: 'nowrap' }} onClick={() => setPicking(true)} disabled={!db.pazienti.length}><i className="ph-bold ph-plus"></i><span>Nuova fattura</span></button>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_260px] items-start xl:items-stretch xl:flex-1 xl:min-h-0">
                    {!compact && <div className="order-2 xl:order-1 xl:min-h-0 xl:overflow-y-auto xl:pr-1" style={{ scrollbarWidth: 'thin' }}>{todo}</div>}
                    <div className="order-1 xl:order-2 min-w-0 flex flex-col xl:min-h-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
                            <div className="seg" style={compact ? { overflowX: 'auto', maxWidth: '100%', flexWrap: 'nowrap', scrollbarWidth: 'none' } : undefined}>{tabs.map(([id, l]) => <button key={id} className={tab === id ? 'on' : ''} style={compact ? { whiteSpace: 'nowrap', minHeight: 40 } : undefined} onClick={() => setTab(id)}>{l}</button>)}</div>
                            {showExport && !compact && <button className="vw-chip" onClick={exporter}><i className="ph ph-download-simple"></i><span>{exportLabel}</span></button>}
                        </div>
                        <div className="xl:flex-1 xl:min-h-0 xl:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {tab === 'panoramica' && <Overview rows={rows} prevRows={rowsOf(db, year - 1)} expenses={expenses} year={year} prof={prof} nextNumber={nextNumber(db, year)} compact={compact} />}
                            {tab === 'fatture' && <InvoiceList rows={registry} onPaid={markPaid} onEdit={({ inv, patient }) => setEdit({ patient: freshPatient(patient), invoice: inv })} onPrint={({ inv, patient }) => setPrint({ patient: freshPatient(patient), id: inv.id, n: Date.now() })} />}
                            {tab === 'spese' && <Expenses expenses={expenses} onAdd={(e) => onUpdateDb((prev) => ({ ...prev, spese: [...(prev.spese || []), e] }))} onRemove={(id) => window.confirm('Eliminare questa spesa?') && onUpdateDb((prev) => ({ ...prev, spese: (prev.spese || []).filter((s) => s.id !== id) }))} />}
                            {tab === 'dafare' && todo}
                            {tab === 'scadenze' && deadlines}
                            {compact && showExport && <button className="vw-chip justify-center w-full mt-4" style={{ height: 44 }} onClick={exporter}><i className="ph ph-download-simple"></i><span>{exportLabel}</span></button>}
                        </div>
                    </div>
                    {!compact && <div className="order-3 xl:min-h-0 xl:overflow-y-auto xl:pr-1" style={{ scrollbarWidth: 'thin' }}>{deadlines}</div>}
                </div>
            </div>

            {picking && (
                <div className="sheet-back" onClick={() => setPicking(false)}>
                    <div className="sheet" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[19px] font-semibold text-[color:var(--ink)] mb-1">Nuova fattura</h3>
                        <p className="text-[13px] text-[color:var(--muted)] mb-4">Per quale paziente? Per fatturare una visita o un menù usa lo storico del paziente.</p>
                        <PatientPicker patients={db.pazienti} onPick={(p) => { setPicking(false); setEdit({ patient: p, invoice: null }); }} />
                        <button className="vw-chip justify-center w-full" style={{ height: 44 }} onClick={() => setPicking(false)}>Annulla</button>
                    </div>
                </div>
            )}
            {edit && <InvoiceModal patient={edit.patient} prof={professionalFor(edit.patient, db)} invoice={edit.invoice} visit={edit.visit} menu={edit.menu} service={edit.service} onUpdateDb={onUpdateDb} onPrint={(id) => setPrint({ patient: edit.patient, id, n: Date.now() })} onClose={() => setEdit(null)} />}
            {print && (
                <PrintCenterProvider key={print.n} patient={freshPatient(print.patient)} db={db} onUpdateDb={onUpdateDb}>
                    <OpenOnMount id={print.id} />
                </PrintCenterProvider>
            )}
        </div>
    );
};
