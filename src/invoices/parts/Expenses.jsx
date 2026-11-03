import React, { useState } from 'react';
import { ChefPick } from '../../chef/ChefPick';
import { EXPENSE_CATEGORIES } from '../accountingLogic';
import { euro, num } from '../invoiceLogic';

const blank = () => ({ data: new Date().toISOString().slice(0, 10), descrizione: '', categoria: EXPENSE_CATEGORIES[0], importo: '' });

// Spese dell'anno (db.spese): servono per il margine indicativo della panoramica
export const Expenses = ({ expenses, onAdd, onRemove }) => {
    const [f, setF] = useState(blank);
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
    const ok = num(f.importo) > 0 && f.descrizione.trim();
    const add = () => { onAdd({ ...f, id: `sp_${Date.now()}` }); setF(blank()); };
    const byCat = Object.entries(expenses.reduce((a, e) => ({ ...a, [e.categoria]: (a[e.categoria] || 0) + num(e.importo) }), {})).sort((a, b) => b[1] - a[1]);
    return (
        <div className="grid gap-4">
            <div className="panel" style={{ padding: 16 }}>
                <span className="fld-label">Nuova spesa</span>
                <div className="grid gap-2 mt-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                    <input type="date" className="fld" value={f.data} onChange={(e) => set('data', e.target.value)} />
                    <input className="fld" placeholder="Descrizione" value={f.descrizione} onChange={(e) => set('descrizione', e.target.value)} />
                    <ChefPick className="fld-pick" style={{ gridColumn: '1 / -1' }} searchable={false} value={f.categoria} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={(v) => set('categoria', v)} />
                    <input className="fld" inputMode="decimal" placeholder="Importo €" value={f.importo} onChange={(e) => set('importo', e.target.value)} />
                    <button className="vw-next justify-center" disabled={!ok} onClick={add} style={{ height: 44, opacity: ok ? 1 : 0.4 }}><i className="ph-bold ph-plus"></i><span>Aggiungi</span></button>
                </div>
            </div>
            {byCat.length > 0 && (
                <div className="panel" style={{ padding: 16 }}>
                    <span className="fld-label">Per categoria</span>
                    {byCat.map(([c, v]) => <div key={c} className="flex justify-between text-[14px] py-1 text-[color:var(--ink)]"><span>{c}</span><b className="font-medium">{euro(v)}</b></div>)}
                </div>
            )}
            <div className="flex flex-col gap-2">
                {expenses.map((e) => (
                    <div key={e.id} className="patient-row" style={{ cursor: 'default' }}>
                        <span className="min-w-0 flex-1 text-left"><span className="block font-semibold text-[15px] text-[color:var(--ink)] truncate">{e.descrizione}</span><span className="block text-[13px] text-[color:var(--muted)]">{new Date(e.data).toLocaleDateString('it-IT')} · {e.categoria}</span></span>
                        <b className="text-[15px] text-[color:var(--ink)]">{euro(e.importo)}</b>
                        <button className="hs-icon is-danger" title="Elimina" aria-label="Elimina" onClick={() => onRemove(e.id)}><i className="ph ph-trash"></i></button>
                    </div>
                ))}
                {!expenses.length && <p className="text-center text-[14px] text-[color:var(--muted)] py-8">Nessuna spesa registrata in questo anno</p>}
            </div>
        </div>
    );
};
