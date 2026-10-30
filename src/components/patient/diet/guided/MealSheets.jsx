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

const R = (x) => Math.round(x);

// barra "oggi → dopo": quanto c'è già (scuro), quanto aggiunge il pasto (accento), rispetto all'obiettivo (tacca)
const DeltaBar = ({ label, cur, add, target, unit }) => {
    const after = cur + add;
    const max = Math.max(target, after, 1) * 1.05;
    const over = target > 0 && after > target * 1.08;
    return (
        <div className="t-delta">
            <div className="t-delta-top">
                <span>{label}</span>
                <b style={over ? { color: '#C2413A' } : undefined}>
                    {R(cur)} → {R(after)}
                    {target > 0 && <em> / {R(target)} {unit}</em>}
                </b>
            </div>
            <div className="t-delta-bar">
                <i style={{ width: `${(cur / max) * 100}%` }}></i>
                <i className="add" style={{ left: `${(cur / max) * 100}%`, width: `${(add / max) * 100}%`, background: over ? '#C2413A' : 'var(--accent)' }}></i>
                {target > 0 && <u style={{ left: `${(target / max) * 100}%` }}></u>}
            </div>
        </div>
    );
};

// Anteprima di un pasto salvato: cos'è, che macro ha, come si integra nel giorno.
const MealPreview = ({ meal, day, tdee, gT, onBack, onConfirm, onClose }) => {
    const t = dayTotals({ meals: [meal] });
    const d = dayTotals(day);
    const kc = { c: t.c * 4, p: t.p * 4, f: t.f * 9 };
    const ksum = kc.c + kc.p + kc.f || 1;
    const share = { c: (kc.c / ksum) * 100, p: (kc.p / ksum) * 100, f: (kc.f / ksum) * 100 };
    const verdict = (() => {
        if (!tdee) return null;
        const after = d.kcal + t.kcal;
        if (after > tdee * 1.08) return { ok: false, text: `Supera l’obiettivo del giorno di ${R(after - tdee)} kcal.` };
        if (after < tdee * 0.92) return { ok: true, text: `Dopo l’aggiunta mancano ancora ${R(tdee - after)} kcal all’obiettivo.` };
        return { ok: true, text: 'Dopo l’aggiunta il giorno resta in linea con l’obiettivo.' };
    })();
    return (
        <div className="t-prev">
            <div className="t-cell-head">
                <button type="button" className="dg-ghost" onClick={onBack} aria-label="Torna all’elenco">
                    <i className="ph-bold ph-arrow-left"></i>
                </button>
                <div className="min-w-0 flex-1">
                    <p>{meal.title || 'Pasto'}</p>
                    <span>{meal.items.length} {meal.items.length === 1 ? 'alimento' : 'alimenti'}{meal.savedAt ? ` · salvato il ${meal.savedAt}` : ''}</span>
                </div>
                <button type="button" className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                    <i className="ph-bold ph-x"></i>
                </button>
            </div>

            <div className="t-prev-body">
                <div className="t-prev-kcal">
                    <b>{R(t.kcal)}</b> <span>kcal</span>
                </div>
                <div className="t-prev-stack" role="img" aria-label="Ripartizione delle kcal tra carboidrati, proteine e grassi">
                    <i style={{ width: `${share.c}%`, background: '#121317' }}></i>
                    <i style={{ width: `${share.p}%`, background: '#1F8A5B' }}></i>
                    <i style={{ width: `${share.f}%`, background: '#8A8780' }}></i>
                </div>
                <div className="t-prev-legend">
                    <span><i style={{ background: '#121317' }}></i>Carboidrati <b>{R(t.c)} g</b> · {R(share.c)}%</span>
                    <span><i style={{ background: '#1F8A5B' }}></i>Proteine <b>{R(t.p)} g</b> · {R(share.p)}%</span>
                    <span><i style={{ background: '#8A8780' }}></i>Grassi <b>{R(t.f)} g</b> · {R(share.f)}%</span>
                </div>

                <p className="t-prev-h">Alimenti</p>
                <div className="t-prev-items">
                    {meal.items.map((it) => {
                        const w = (parseFloat(it.weight) || 0) / 100;
                        return (
                            <div key={it.id || it.name}>
                                <span className="min-w-0">{it.name || 'Alimento'}</span>
                                <small>{R(parseFloat(it.weight) || 0)} g</small>
                                <b>{R((parseFloat(it.kcal) || 0) * w)} kcal</b>
                            </div>
                        );
                    })}
                </div>

                <p className="t-prev-h">Nel giorno “{day.title}”</p>
                <DeltaBar label="Calorie" cur={d.kcal} add={t.kcal} target={tdee} unit="kcal" />
                <DeltaBar label="Carboidrati" cur={d.c} add={t.c} target={gT.c} unit="g" />
                <DeltaBar label="Proteine" cur={d.p} add={t.p} target={gT.p} unit="g" />
                <DeltaBar label="Grassi" cur={d.f} add={t.f} target={gT.f} unit="g" />
                <p className="t-prev-key"><i></i> già nel giorno <i className="add"></i> aggiunto da questo pasto <u></u> obiettivo</p>
                {verdict && <p className={`t-prev-verdict ${verdict.ok ? 'ok' : 'bad'}`}>{verdict.text}</p>}
            </div>

            <div className="t-prev-foot">
                <button type="button" className="vw-back" style={{ height: 52, borderRadius: 16, padding: '0 20px', flex: 'none', width: 'auto', whiteSpace: 'nowrap' }} onClick={onBack}>Indietro</button>
                <button type="button" className="vw-next" style={{ height: 52, borderRadius: 16, flex: 1 }} onClick={onConfirm}>
                    Aggiungi al giorno
                </button>
            </div>
        </div>
    );
};

export const AddMealSheet = ({ library, day, tdee, gT, onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [pick, setPick] = useState(null);
    const [q, setQ] = useState('');
    const saved = (library || []).filter((m) => !isRecipe(m) && (m.items || []).length > 0);
    const shown = saved.filter((m) => !q.trim() || String(m.title).toLowerCase().includes(q.trim().toLowerCase()));
    if (pick)
        return createPortal(
            <div className="sheet-back" onClick={onClose}>
                <div className="sheet t-cellsheet t-prevsheet" onClick={(e) => e.stopPropagation()}>
                    <MealPreview
                        meal={pick}
                        day={day}
                        tdee={tdee}
                        gT={gT}
                        onBack={() => setPick(null)}
                        onClose={onClose}
                        onConfirm={() => {
                            onAdd(pick.title, mealItemsCopy(pick));
                            onClose();
                        }}
                    />
                </div>
            </div>,
            document.body
        );
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
                                        onClick={() => setPick(m)}
                                    >
                                        <span className="min-w-0">
                                            <b>{m.title || 'Pasto'}</b>
                                            <small>{m.items.length} {m.items.length === 1 ? 'alimento' : 'alimenti'} · {Math.round(t.kcal)} kcal</small>
                                        </span>
                                        <i className="ph ph-caret-right"></i>
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

// Integratore: nome, dose, quando e perché (solo il nome è obbligatorio).
export const SupplementSheet = ({ initial, onSubmit, onClose }) => {
    const [f, setF] = useState({ name: initial?.name || '', dose: initial?.dose || '', when: initial?.when || '', why: initial?.why || '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <form
                className="sheet t-cellsheet"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!f.name.trim()) return;
                    onSubmit({ ...f, name: f.name.trim(), dose: f.dose.trim(), when: f.when.trim(), why: f.why.trim() });
                    onClose();
                }}
            >
                <Head title={initial ? 'Modifica integratore' : 'Aggiungi un integratore'} onClose={onClose} />
                <label className="fld-label">Nome</label>
                <input className="fld" autoFocus value={f.name} onChange={set('name')} placeholder="Es. Vitamina D3" />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label className="fld-label">Dose</label>
                        <input className="fld" value={f.dose} onChange={set('dose')} placeholder="Es. 2000 UI" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label className="fld-label">Quando</label>
                        <input className="fld" value={f.when} onChange={set('when')} placeholder="Es. A colazione" />
                    </div>
                </div>
                <label className="fld-label" style={{ marginTop: 10 }}>Perché (facoltativo)</label>
                <input className="fld" value={f.why} onChange={set('why')} placeholder="Es. Carenza documentata" />
                <button type="submit" className="vw-next t-cell-done" style={{ marginTop: 14 }} disabled={!f.name.trim()}>
                    {initial ? 'Salva' : 'Aggiungi'}
                </button>
            </form>
        </div>,
        document.body
    );
};
