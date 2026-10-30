import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { isRecipe, mealItemsCopy } from './recipeLogic';
import { dayTotals } from './guidedLogic';

// Pannelli dal basso per i pasti: chiedere un nome (rinomina) e aggiungere un pasto (vuoto o dai salvati).
const Head = ({ title, subtitle, onClose }) => (
    <div className="t-cell-head">
        <div className="min-w-0">
            <p>{title}</p>
            {subtitle && <span>{subtitle}</span>}
        </div>
        <button type="button" className="dg-ghost" onClick={onClose} aria-label="Chiudi">
            <i className="ph-bold ph-x"></i>
        </button>
    </div>
);

export const NameSheet = ({ title, subtitle, initial = '', placeholder, confirmLabel = 'Salva', onSubmit, onClose }) => {
    const [v, setV] = useState(initial);
    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <form
                className="sheet t-cellsheet"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!v.trim()) return;
                    onSubmit(v.trim());
                    onClose();
                }}
            >
                <Head title={title} subtitle={subtitle} onClose={onClose} />
                <input className="fld" autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label="Nome" />
                <button type="submit" className="vw-next t-cell-done" style={{ marginTop: 12 }} disabled={!v.trim()}>
                    {confirmLabel}
                </button>
            </form>
        </div>,
        document.body
    );
};

export const AddMealSheet = ({ library, onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [q, setQ] = useState('');
    const saved = (library || []).filter((m) => !isRecipe(m) && (m.items || []).length > 0);
    const shown = saved.filter((m) => !q.trim() || String(m.title).toLowerCase().includes(q.trim().toLowerCase()));
    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <div className="sheet t-cellsheet" onClick={(e) => e.stopPropagation()}>
                <Head title="Aggiungi un pasto" subtitle="Vuoto o da quelli che hai salvato" onClose={onClose} />
                <form
                    className="t-dbm-form"
                    style={{ border: 0, padding: 0, background: 'transparent' }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        onAdd(name.trim() || 'Nuovo pasto', []);
                        onClose();
                    }}
                >
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input className="fld" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (es. Spuntino serale)" aria-label="Nome del pasto" />
                        <button type="submit" className="dg-sm" style={{ height: 46, flex: 'none' }}>
                            <i className="ph ph-plus"></i> Vuoto
                        </button>
                    </div>
                </form>

                <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mt-5 mb-2">Dai pasti salvati</p>
                {saved.length === 0 ? (
                    <p className="text-[13.5px] text-[color:var(--muted)] pb-3">Nessun pasto salvato. Dal menù ⋯ di un pasto puoi salvarlo e ritrovarlo qui.</p>
                ) : (
                    <>
                        {saved.length > 5 && <input className="fld mb-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca tra i salvati…" aria-label="Cerca" />}
                        <div className="t-addmeal-list">
                            {shown.map((m) => {
                                const t = dayTotals({ meals: [m] });
                                return (
                                    <button
                                        key={m.id}
                                        className="t-addmeal-row"
                                        onClick={() => {
                                            onAdd(m.title, mealItemsCopy(m));
                                            onClose();
                                        }}
                                    >
                                        <span className="min-w-0">
                                            <b>{m.title || 'Pasto'}</b>
                                            <small>{m.items.length} {m.items.length === 1 ? 'alimento' : 'alimenti'} · {Math.round(t.kcal)} kcal</small>
                                        </span>
                                        <i className="ph ph-plus"></i>
                                    </button>
                                );
                            })}
                            {shown.length === 0 && <p className="text-[13.5px] text-[color:var(--muted)] py-2">Nessun risultato.</p>}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};
