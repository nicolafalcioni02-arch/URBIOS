import React, { useMemo, useState } from 'react';
import { CATEGORIES, buildRecipe, foodToIngredient, searchFoods } from './chefLogic';
import { MacroDonut } from './ChefCharts';
import { genId } from '../components/patient/diet/guided/guidedLogic';

const LEVELS = ['Facile', 'Media', 'Impegnativa'];

export const RecipeEditor = ({ initial, foods, onSave, onCancel }) => {
    const [f, setF] = useState(initial);
    const [q, setQ] = useState('');
    const set = (patch) => setF((x) => ({ ...x, ...patch }));
    const hits = useMemo(() => searchFoods(foods, q), [foods, q]);
    const setIng = (id, patch) => set({ ingredients: f.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
    const setStep = (k, v) => set({ steps: f.steps.map((s, j) => (j === k ? v : s)) });
    const live = useMemo(() => buildRecipe(f), [f]);
    const sv = live.servings || 1;
    const valid = f.title.trim() && f.ingredients.some((i) => Number(i.weight) > 0);

    return (
        <div className="rise ch-ed">
            <div className="ch-top">
                <button className="vw-chip !px-0 w-9 !h-9 justify-center" onClick={onCancel} aria-label="Annulla">
                    <i className="ph ph-x"></i>
                </button>
                <h2 className="ch-serif ch-ed-title flex-1">{initial.id ? 'Modifica ricetta' : 'Nuova ricetta'}</h2>
                <button className="vw-next disabled:opacity-40 disabled:pointer-events-none" disabled={!valid} onClick={() => onSave(buildRecipe(f))} style={{ height: 44 }}>
                    <span>Salva</span><i className="ph ph-check"></i>
                </button>
            </div>
            <div className="ch-edit">
            <div className="ch-form">
                <div>
                    <label className="fld-label">Titolo</label>
                    <input autoFocus className="fld ch-serif" style={{ fontSize: 26, height: 60 }} value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Es. Risotto allo zafferano" />
                </div>
                <div className="ch-row">
                    <div>
                        <label className="fld-label">Categoria</label>
                        <select className="fld" value={f.category} onChange={(e) => set({ category: e.target.value })}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="fld-label">Tempo (minuti)</label>
                        <input className="fld" inputMode="numeric" value={f.minutes} onChange={(e) => set({ minutes: e.target.value })} />
                    </div>
                    <div>
                        <label className="fld-label">Livello</label>
                        <select className="fld" value={f.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
                            {LEVELS.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="fld-label">Porzioni</label>
                        <input className="fld" inputMode="numeric" value={f.servings} onChange={(e) => set({ servings: e.target.value })} />
                    </div>
                    <div>
                        <label className="fld-label">Peso finale (g)</label>
                        <input className="fld" inputMode="numeric" placeholder="dopo la cottura" value={f.finalWeight} onChange={(e) => set({ finalWeight: e.target.value })} />
                    </div>
                </div>

                <section>
                    <p className="ch-h">Ingredienti · grammi per l'intera ricetta</p>
                    {f.ingredients.map((i) => (
                        <div className="ch-ing" key={i.id}>
                            <input className="fld" value={i.name} onChange={(e) => setIng(i.id, { name: e.target.value })} />
                            <input className="fld" inputMode="decimal" value={i.weight} onChange={(e) => setIng(i.id, { weight: e.target.value })} aria-label="Grammi" />
                            <button className="ch-x" onClick={() => set({ ingredients: f.ingredients.filter((x) => x.id !== i.id) })} aria-label="Rimuovi"><i className="ph ph-x"></i></button>
                            <small>{Math.round(i.kcal)} kcal / 100 g</small>
                        </div>
                    ))}
                    <div className="relative mt-3">
                        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] pointer-events-none"></i>
                        <input className="fld" style={{ paddingLeft: 40 }} placeholder="Cerca un ingrediente (es. riso, zucchine…)" value={q} onChange={(e) => setQ(e.target.value)} />
                        {hits.length > 0 && (
                            <div className="ch-sugg">
                                {hits.map((h) => (
                                    <button key={h.food_code || h.name} onClick={() => { set({ ingredients: [...f.ingredients, foodToIngredient(h, genId())] }); setQ(''); }}>
                                        <span>{h.name}</span><small>{Math.round(h.energy_kcal || 0)} kcal</small>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <p className="ch-h">Preparazione</p>
                    {f.steps.map((s, k) => (
                        <div className="ch-ing" key={k} style={{ gridTemplateColumns: '1fr 34px' }}>
                            <textarea className="fld" rows={2} style={{ height: 'auto', paddingTop: 10 }} placeholder={`Passaggio ${k + 1}`} value={s} onChange={(e) => setStep(k, e.target.value)} />
                            <button className="ch-x" onClick={() => set({ steps: f.steps.length > 1 ? f.steps.filter((_, j) => j !== k) : [''] })} aria-label="Rimuovi"><i className="ph ph-x"></i></button>
                        </div>
                    ))}
                    <button className="ch-add" onClick={() => set({ steps: [...f.steps, ''] })}><i className="ph ph-plus"></i>Aggiungi passaggio</button>
                </section>

                <div>
                    <label className="fld-label">Nota dello chef</label>
                    <textarea className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={f.note} onChange={(e) => set({ note: e.target.value })} />
                </div>
            </div>
            <aside className="ch-live"><MacroDonut kcal={live.totals.kcal / sv} p={live.totals.p / sv} c={live.totals.c / sv} f={live.totals.f / sv} /></aside>
            </div>
        </div>
    );
};
