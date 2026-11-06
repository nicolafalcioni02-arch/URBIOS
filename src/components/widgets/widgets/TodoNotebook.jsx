import React, { useState } from 'react';

// Lista delle cose da fare.
export const TodoNotebook = ({ data, setData, db }) => {
    const items = data.items || [];
    const [draft, setDraft] = useState('');
    const add = (e) => {
        e.preventDefault();
        const t = draft.trim();
        if (!t) return;
        setData({ items: [...items, { id: Math.random().toString(36).slice(2, 8), t, d: false }] });
        setDraft('');
    };
    const toggle = (id) => setData({ items: items.map((x) => (x.id === id ? { ...x, d: !x.d } : x)) });
    const del = (id) => setData({ items: items.filter((x) => x.id !== id) });
    const left = items.filter((x) => !x.d).length;
    return (
        <div className={`wd-card wd-todo${db && db.labOv ? ' lab' : ''}`}>
            <p className="wd-title">
                Da fare
                {items.length > 0 && <small>{left === 0 ? 'tutto fatto ✓' : `${left} da completare`}</small>}
            </p>
            <ul>
                {items.map((x) => (
                    <li key={x.id} className={x.d ? 'done' : ''}>
                        <button className="wd-check" onClick={() => toggle(x.id)} aria-label={x.d ? 'Riapri' : 'Fatto'}>
                            {x.d && <i className="ph-bold ph-check" />}
                        </button>
                        <span>{x.t}</span>
                        <button className="wd-x" onClick={() => del(x.id)} aria-label="Elimina">
                            <i className="ph ph-x" />
                        </button>
                    </li>
                ))}
            </ul>
            <form onSubmit={add}>
                <i className="ph ph-plus" />
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Aggiungi…" aria-label="Nuova voce" />
            </form>
        </div>
    );
};
