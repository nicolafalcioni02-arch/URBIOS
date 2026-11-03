import React, { useState } from 'react';
import { MacroDonut, IngredientBars } from './ChefCharts';
import { CookMode } from './CookMode';
import { ChefMore } from './ChefMore';
import { usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');

export const RecipeView = ({ recipe, onEdit, onDelete, onBack, onServings, onWeight }) => {
    const [cook, setCook] = useState(false);
    const printCenter = usePrintCenter();
    const { totals, servings } = recipe;
    const sv = servings || 1;
    const k = 1;
    const maxM = Math.max(1, ...(recipe.items || []).flatMap((i) => ['p', 'c', 'f'].map((m) => ((i[m] || 0) * (i.weight || 0) * k) / 100)));
    const items = recipe.items || [];
    const per = { kcal: totals.kcal / sv, p: totals.p / sv, c: totals.c / sv, f: totals.f / sv };
    return (
        <div className="rise">
            <div className="ch-top ch-noprint">
                <button className="vw-chip !px-0 w-9 !h-9 justify-center" onClick={onBack} aria-label="Indietro">
                    <i className="ph ph-arrow-left"></i>
                </button>
                <span className="flex-1"></span>
                <button className="vw-chip" onClick={() => setCook(true)} style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>
                    <i className="ph ph-cooking-pot"></i>Cucina
                </button>
                <button className="vw-chip" onClick={onEdit} aria-label="Modifica">
                    <i className="ph ph-pencil-simple"></i><span className="ch-top-lbl">Modifica</span>
                </button>
                <ChefMore items={[
                    { label: 'Stampa', icon: 'printer', onClick: () => printCenter.open([{ type: 'ricettario', ids: [recipe.id] }]) },
                    { label: 'Elimina ricetta', icon: 'trash', danger: true, onClick: onDelete },
                ]} />
            </div>
            <div className="ch-recipe">
                <aside className="ch-rside">
                    <div className="ch-facts">
                        <div><b>{recipe.minutes ? `${recipe.minutes}′` : '—'}</b><small>Tempo</small></div>
                        <div className="ch-port">
                            <b>
                                <button onClick={() => onServings(Math.max(1, sv - 1))} aria-label="Meno porzioni" disabled={sv <= 1}><i className="ph ph-minus"></i></button>
                                {sv}
                                <button onClick={() => onServings(Math.min(99, sv + 1))} aria-label="Più porzioni"><i className="ph ph-plus"></i></button>
                            </b>
                            <small>Porzioni</small>
                        </div>
                        <div><b>{recipe.difficulty || '—'}</b><small>Livello</small></div>
                    </div>
                    <MacroDonut kcal={per.kcal} p={per.p} c={per.c} f={per.f} />
                </aside>
                <article>
                    {recipe.category && <p className="ch-h">{recipe.category}</p>}
                    <h1 className="ch-title ch-serif mb-9">{recipe.title}</h1>
                    <p className="ch-h">Ingredienti</p>
                    <ul className="ch-ings">
                        {items.map((i) => (
                            <li key={i.id}>
                                <div className="ch-ing-top"><span>{i.name}</span><span className="ch-ing-g"><input inputMode="decimal" key={`${i.id}-${i.weight}`} defaultValue={Math.round((Number(i.weight) || 0) * 10) / 10} aria-label={`Grammi di ${i.name}`} onFocus={(e) => e.target.select()} onBlur={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); if (Number.isFinite(v) && v >= 0 && v !== Number(i.weight)) onWeight(i.id, v); }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} /> g</span></div>
                                <div className="ch-mbars">
                                    {[['P', 'p', 1], ['C', 'c', 0.5], ['G', 'f', 0.22]].map(([l, key, o]) => {
                                        const g = ((i[key] || 0) * i.weight) / 100;
                                        return (
                                            <span key={l} title={`${g.toFixed(1)} g`}>
                                                <em>{l}</em>
                                                <div><i style={{ width: `${(g / maxM) * 100}%`, background: o === 1 ? 'var(--accent)' : 'var(--ink)', opacity: o }}></i></div>
                                                <b>{g >= 10 ? Math.round(g) : g.toFixed(1).replace('.', ',')} g</b>
                                            </span>
                                        );
                                    })}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="ch-h">Peso sulle calorie</p>
                    <IngredientBars items={items} />
                    {recipe.steps?.length > 0 && (
                        <>
                            <p className="ch-h">Preparazione</p>
                            <ol className="ch-steps">
                                {recipe.steps.map((s, k) => <li key={k}>{s}</li>)}
                            </ol>
                        </>
                    )}
                    {recipe.note && <div className="ch-note">{recipe.note}</div>}
                </article>
            </div>
            {cook && <CookMode recipe={recipe} onClose={() => setCook(false)} />}
        </div>
    );
};
