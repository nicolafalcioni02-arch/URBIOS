import React, { useState } from 'react';
import { euro, computeTotals, label } from '../invoiceLogic';
import { daysTo, suggestedDeadlines } from '../accountingLogic';

const when = (iso) => {
    const n = daysTo(iso);
    return n < 0 ? `scaduta da ${-n} g` : n === 0 ? 'oggi' : n === 1 ? 'domani' : n < 60 ? `tra ${n} giorni` : new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
};

// Colonna destra: incassi in scadenza (dalle fatture) e promemoria fiscali (db.scadenze, miei o suggeriti)
export const DeadlinesRail = ({ due, reminders, year, regime, onAdd, onToggle, onRemove }) => {
    const [f, setF] = useState({ data: '', titolo: '' });
    const added = new Set(reminders.map((r) => `${r.data}|${r.titolo}`));
    const [more, setMore] = useState(false);
    const suggestedAll = suggestedDeadlines(year, regime).filter((s) => !added.has(`${s.data}|${s.titolo}`)).sort((a, b) => a.data.localeCompare(b.data));
    const suggested = more ? suggestedAll : suggestedAll.slice(0, 3);
    const open = reminders.filter((r) => !r.fatto).sort((a, b) => a.data.localeCompare(b.data));
    const done = reminders.filter((r) => r.fatto);
    return (
        <div className="grid gap-3 content-start">
            <section className="panel" style={{ padding: 16 }}>
                <span className="fld-label">Incassi in scadenza</span>
                {due.slice(0, 6).map((x) => (
                    <div key={x.inv.id} className="flex justify-between gap-2 py-1.5 text-[13.5px]">
                        <span className="min-w-0"><span className="block truncate text-[color:var(--ink)]">N. {label(x.inv)} · {x.patient.cognome}</span><span className="block text-[12px]" style={{ color: daysTo(x.inv.scadenza) < 0 ? 'var(--warn)' : 'var(--muted)' }}>{when(x.inv.scadenza)}</span></span>
                        <b className="font-medium text-[color:var(--ink)] flex-none">{euro(computeTotals(x.inv).totale)}</b>
                    </div>
                ))}
                {!due.length && <p className="text-[13px] text-[color:var(--muted)] py-1">Nessuna scadenza di pagamento. Si imposta in ogni fattura.</p>}
            </section>

            <section className="panel" style={{ padding: 16 }}>
                <span className="fld-label">Promemoria fiscali</span>
                {open.map((r) => (
                    <div key={r.id} className="flex items-start gap-2 py-1.5">
                        <button className="hs-icon is-sm" aria-label="Fatto" title="Segna come fatto" onClick={() => onToggle(r.id)}><i className="ph ph-circle"></i></button>
                        <span className="min-w-0 flex-1"><span className="block text-[13.5px] text-[color:var(--ink)]">{r.titolo}</span><span className="block text-[12px]" style={{ color: daysTo(r.data) < 0 ? 'var(--warn)' : 'var(--muted)' }}>{when(r.data)}</span></span>
                        <button className="hs-icon is-sm" aria-label="Elimina" title="Elimina" onClick={() => onRemove(r.id)}><i className="ph ph-x"></i></button>
                    </div>
                ))}
                {!open.length && <p className="text-[13px] text-[color:var(--muted)] py-1">Nessun promemoria aperto.</p>}
                {done.length > 0 && <p className="text-[12px] text-[color:var(--muted)] mt-1">{done.length} completati</p>}
                <div className="grid gap-2 mt-3">
                    <input type="date" className="fld" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} aria-label="Data" />
                    <input className="fld" placeholder="Cosa devi fare" value={f.titolo} onChange={(e) => setF({ ...f, titolo: e.target.value })} />
                    <button className="vw-chip justify-center" disabled={!f.data || !f.titolo.trim()} style={{ opacity: f.data && f.titolo.trim() ? 1 : 0.4 }} onClick={() => { onAdd({ ...f, titolo: f.titolo.trim() }); setF({ data: '', titolo: '' }); }}>Aggiungi</button>
                </div>
            </section>

            {suggestedAll.length > 0 && (
                <section className="panel" style={{ padding: 16 }}>
                    <span className="fld-label">Scadenze comuni</span>
                    <p className="text-[12px] text-[color:var(--muted)] mb-1">Date generali per {regime === 'Forfettario' ? 'il forfettario' : 'il regime ordinario'}: verificale col commercialista.</p>
                    {suggested.map((s) => (
                        <div key={s.data + s.titolo} className="flex items-center gap-2 py-1.5">
                            <span className="min-w-0 flex-1"><span className="block text-[13px] text-[color:var(--ink)]">{s.titolo}</span><span className="block text-[12px] text-[color:var(--muted)]">{new Date(s.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span></span>
                            <button className="hs-icon is-sm" aria-label="Aggiungi ai promemoria" title="Aggiungi ai promemoria" onClick={() => onAdd(s)}><i className="ph ph-plus"></i></button>
                        </div>
                    ))}
                    {suggestedAll.length > 3 && <button className="text-[12.5px] text-[color:var(--muted)] underline underline-offset-4 mt-1" onClick={() => setMore((v) => !v)}>{more ? 'Mostra meno' : `Altre ${suggestedAll.length - 3}`}</button>}
                </section>
            )}
        </div>
    );
};
