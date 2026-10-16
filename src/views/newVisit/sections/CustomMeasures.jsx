import React, { useState } from 'react';

const UNITS = ['cm', 'mm', 'kg', '%', 'kcal', 'bpm', 'ml'];

const newRow = (unita) => ({ id: `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, nome: '', valore: '', unita });

// "Advanced": misure personali che non stanno nei campi fissi (nome, valore, unità). Si salvano nella visita come lista.
export const CustomMeasures = ({ value, onChange, subtitle = 'Misure personalizzate', defaultUnit = 'cm', placeholder = 'Es. Circonferenza spalle', emptyText = 'Aggiungi una misura che non trovi sopra, per esempio una circonferenza o un valore che usi solo tu.' }) => {
    const saved = Array.isArray(value) ? value : [];
    const [rows, setRows] = useState(saved);
    const [open, setOpen] = useState(saved.length > 0);

    // si salvano solo le righe con qualcosa dentro
    const commit = (next) => onChange(next.filter((r) => String(r.nome).trim() || String(r.valore).trim()));
    const edit = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const add = () => {
        setRows((rs) => [...rs, newRow(defaultUnit)]);
        setOpen(true);
    };
    const remove = (id) => {
        const next = rows.filter((r) => r.id !== id);
        setRows(next);
        commit(next);
    };

    return (
        <div className="panel cm-box col-span-full !p-0 overflow-hidden">
            <button type="button" className="cm-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                <span className="ct-ico">
                    <i className="ph ph-sliders-horizontal"></i>
                </span>
                <span className="min-w-0 flex-1 text-left">
                    <b>Advanced</b>
                    <small>{subtitle}{rows.length > 0 ? ` · ${rows.length}` : ''}</small>
                </span>
                <i className={`ph ph-caret-down cm-caret ${open ? 'is-open' : ''}`}></i>
            </button>

            <div className="cm-body" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                    <div className="cm-inner">
                        {rows.length === 0 && <p className="cm-empty">{emptyText}</p>}

                        {rows.length > 0 && (
                            <div className="cm-rows">
                                <div className="cm-cols" aria-hidden="true">
                                    <span>Nome</span>
                                    <span>Valore</span>
                                    <span>Unità</span>
                                    <span></span>
                                </div>
                                {rows.map((r) => (
                                    <div key={r.id} className="cm-row">
                                        <input className="fld" placeholder={placeholder} value={r.nome} onChange={(e) => edit(r.id, { nome: e.target.value })} onBlur={() => commit(rows)} aria-label="Nome della misura" />
                                        <input className="fld cm-val" placeholder="0" inputMode="decimal" value={r.valore} onChange={(e) => edit(r.id, { valore: e.target.value })} onBlur={() => commit(rows)} aria-label="Valore" />
                                        <input className="fld cm-unit" list="cm-units" value={r.unita} onChange={(e) => edit(r.id, { unita: e.target.value })} onBlur={() => commit(rows)} aria-label="Unità di misura" />
                                        <button type="button" className="hs-icon is-danger" onClick={() => remove(r.id)} aria-label="Togli la misura">
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <datalist id="cm-units">
                            {UNITS.map((u) => (
                                <option key={u} value={u} />
                            ))}
                        </datalist>

                        <button type="button" onClick={add} className="vw-chip">
                            <i className="ph ph-plus"></i> Aggiungi misura
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
