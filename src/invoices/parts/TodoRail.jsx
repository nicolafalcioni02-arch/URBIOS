import React, { useState } from 'react';
import { InvoiceIcon } from '../InvoiceIcon';
import { euro, computeTotals, label } from '../invoiceLogic';
import { isOverdue } from '../accountingLogic';

const Block = ({ title, count, children }) => (
    <section className="panel" style={{ padding: 16 }}>
        <div className="flex items-center justify-between mb-2"><span className="fld-label" style={{ margin: 0 }}>{title}</span>{count > 0 && <span className="text-[12px] font-semibold text-[color:var(--ink)]">{count}</span>}</div>
        {children}
    </section>
);
const Row = ({ title, sub, action, onClick, icon, warn }) => (
    <div className="flex items-center gap-2 py-1.5">
        <span className="min-w-0 flex-1"><span className="block text-[13.5px] text-[color:var(--ink)] truncate">{title}</span><span className="block text-[12px] truncate" style={{ color: warn ? 'var(--warn)' : 'var(--muted)' }}>{sub}</span></span>
        <button className="hs-icon" title={action} aria-label={action} onClick={onClick}>{icon ? <i className={`ph ${icon}`}></i> : <InvoiceIcon />}</button>
    </div>
);
const Empty = ({ children }) => <p className="text-[13px] text-[color:var(--muted)] py-1">{children}</p>;

// Colonna sinistra: cosa c'è da fare (calcolato dai dati: visite e menù da fatturare, incassi aperti, dati mancanti)
export const TodoRail = ({ visits, menus, open, missingCf, onBillVisit, onBillMenu, onPaid, onEditPatientFix }) => {
    const [all, setAll] = useState(false);
    const shown = all ? visits : visits.slice(0, 5);
    const date = (d) => new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    return (
        <div className="grid gap-3 content-start">
            <Block title="Visite da fatturare" count={visits.length}>
                {shown.map((x) => <Row key={x.visit.id} title={`${x.patient.nome} ${x.patient.cognome}`} sub={`${date(x.visit.data)} · ${x.service === 'prima' ? 'prima visita' : x.service === 'dieta' ? 'piano alimentare' : 'controllo'}`} action="Emetti fattura" onClick={() => onBillVisit(x)} />)}
                {!visits.length && <Empty>Tutte le visite hanno una fattura.</Empty>}
                {visits.length > 5 && <button className="text-[12.5px] text-[color:var(--muted)] underline underline-offset-4 mt-1" onClick={() => setAll((v) => !v)}>{all ? 'Mostra meno' : `Mostra tutte (${visits.length})`}</button>}
            </Block>
            {menus.length > 0 && (
                <Block title="Menù da fatturare" count={menus.length}>
                    {menus.map((x) => <Row key={x.menu.id} title={x.menu.title || 'Menù'} sub={`${x.patient.nome} ${x.patient.cognome}${x.menu.event?.date ? ` · ${date(x.menu.event.date)}` : ''}`} action="Emetti fattura" onClick={() => onBillMenu(x)} />)}
                </Block>
            )}
            <Block title="Da incassare" count={open.length}>
                {open.slice(0, 6).map((x) => <Row key={x.inv.id} icon="ph-check" title={`N. ${label(x.inv)} · ${x.patient.cognome}`} sub={`${euro(computeTotals(x.inv).totale)}${isOverdue(x.inv) ? ' · scaduta' : ''}`} warn={isOverdue(x.inv)} action="Segna come pagata" onClick={() => onPaid(x)} />)}
                {!open.length && <Empty>Nessun incasso in sospeso.</Empty>}
                {open.length > 6 && <p className="text-[12px] text-[color:var(--muted)] mt-1">e altre {open.length - 6} nella scheda Fatture</p>}
            </Block>
            {missingCf.length > 0 && (
                <Block title="Dati mancanti" count={missingCf.length}>
                    <p className="text-[12.5px] text-[color:var(--muted)] mb-1">Codice fiscale assente: serve per la fattura sanitaria e per il Sistema TS.</p>
                    {missingCf.slice(0, 4).map((p) => <Row key={p.id} icon="ph-user" title={`${p.nome} ${p.cognome}`} sub="senza codice fiscale" action="Apri la scheda" onClick={() => onEditPatientFix(p)} />)}
                </Block>
            )}
        </div>
    );
};
