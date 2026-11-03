import React, { useState } from 'react';
import { STATES, computeTotals, euro, label, stateOf } from '../invoiceLogic';

// Registro delle fatture dell'anno: filtri per stato e testo, segna come pagata, modifica, ristampa
export const InvoiceList = ({ rows, onPaid, onEdit, onPrint }) => {
    const [state, setState] = useState('tutte');
    const [q, setQ] = useState('');
    const count = (id) => rows.filter((x) => stateOf(x.inv).id === id).length;
    const list = rows.filter(({ inv, patient }) => (state === 'tutte' || stateOf(inv).id === state) && `${patient.nome} ${patient.cognome} ${label(inv)}`.toLowerCase().includes(q.trim().toLowerCase()));
    return (
        <>
            <div className="flex flex-wrap gap-2 items-center mb-4">
                <div className="seg">{[{ id: 'tutte', label: `Tutte ${rows.length}` }, ...STATES.map((s) => ({ id: s.id, label: `${s.label} ${count(s.id)}` }))].map((s) => <button key={s.id} className={state === s.id ? 'on' : ''} onClick={() => setState(s.id)}>{s.label}</button>)}</div>
                <input className="fld" style={{ flex: 1, minWidth: 160 }} placeholder="Cerca paziente o numero" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                {list.map((x) => {
                    const { inv, patient } = x;
                    const st = stateOf(inv);
                    return (
                        <div key={inv.id} className="patient-row" style={{ cursor: 'default' }}>
                            <span className="min-w-0 flex-1 text-left">
                                <span className="block font-semibold text-[16px] text-[color:var(--ink)] truncate">N. {label(inv)} · {patient.nome} {patient.cognome}</span>
                                <span className="block text-[13px] text-[color:var(--muted)] truncate">{new Date(inv.data).toLocaleDateString('it-IT')} · {inv.menuId ? 'servizio menù' : inv.visitaId ? 'visita' : 'prestazione'}{inv.metodo ? ` · ${inv.metodo}` : ''}</span>
                            </span>
                            <b className="text-[15px] text-[color:var(--ink)] flex-none">{euro(computeTotals(inv).totale)}</b>
                            <span className="hidden sm:flex items-center gap-1.5 text-[13px] text-[color:var(--muted)] flex-none" style={{ width: 104 }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--${st.tone})` }}></span>{st.label}
                            </span>
                            {st.id === 'da_incassare' && <button className="hs-icon" title="Segna come pagata" aria-label="Segna come pagata" onClick={() => onPaid(x)}><i className="ph ph-check"></i></button>}
                            <button className="hs-icon" title="Modifica" aria-label="Modifica" onClick={() => onEdit(x)}><i className="ph ph-pencil-simple"></i></button>
                            <button className="hs-icon" title="Stampa" aria-label="Stampa" onClick={() => onPrint(x)}><i className="ph ph-printer"></i></button>
                        </div>
                    );
                })}
                {!list.length && <p className="text-center text-[14px] text-[color:var(--muted)] py-10">{rows.length ? 'Nessuna fattura con questi filtri' : 'Nessuna fattura emessa in questo anno'}</p>}
            </div>
        </>
    );
};
