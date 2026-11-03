import React, { useState } from 'react';
import { buildRecipe, dishNutrition, formFrom, menuTotals, normalizeMenu } from './chefLogic';
import { MenuGuide } from './MenuGuide';
import { MenuBox } from './MenuBox';
import { RecipeEditor } from './RecipeEditor';
import { Tilt } from './ChefCharts';
import { usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');

// Menù: elenco di schede come le ricette; ognuna si apre in un box (MenuBox) dove si compone la carta in portate (db.chef_menus).
export const MenuBoard = ({ user, patients, menus: raw, recipes, foods, openId, onOpen: setOpenId, onChange, onSaveRecipe }) => {
    const [editId, setEditId] = useState(null); // ricetta aperta nel box di modifica rapida
    const [qty, setQty] = useState(null); // { sectionId, index }: il piatto di cui si stanno cambiando le quantità
    const [guide, setGuide] = useState(false); // percorso guidato aperto per il menù aperto
    const printCenter = usePrintCenter();
    const menus = raw.map(normalizeMenu);
    const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
    const pName = (m) => { const p = (patients || []).find((x) => x.id === m.patientId); return p ? `${p.nome || ''} ${p.cognome || ''}`.trim() : ''; };
    const open = menus.find((m) => m.id === openId);
    const patch = (id, p) => onChange(menus.map((m) => (m.id === id ? { ...m, ...p } : m)));
    const remove = () => {
        if (!window.confirm(`Eliminare il menù «${open.title}»?`)) return;
        onChange(menus.filter((x) => x.id !== open.id));
        setOpenId(null);
    };

    return (
        <>
            {menus.length === 0 ? (
                <div className="ch-empty">
                    <h3 className="ch-serif">Nessun menù</h3>
                    <p>Premi «Nuovo menù» in alto: componi una carta in portate (antipasto, primo, secondo, dolce…) scegliendo i piatti dal tuo ricettario.</p>
                </div>
            ) : (
                <div className="ch-grid stagger">
                    {menus.map((m) => {
                        const dishes = m.sections.reduce((n, s) => n + s.dishes.filter((d) => d.rid).length, 0);
                        const kcal = menuTotals(m, byId).kcal;
                        return (
                            <Tilt key={m.id} onClick={() => setOpenId(m.id)}>
                                <div className="ch-body">
                                    <span className="ch-cat ch-cat-in">{m.event?.name || 'Menù'}</span>
                                    {pName(m) && <span className="ch-mb-pat"><i className="ph ph-user"></i>{pName(m)}</span>}
                                    <h3 className="ch-serif">{m.title}</h3>
                                    {m.subtitle && <p className="ch-menu-card-sub">{m.subtitle}</p>}
                                    <div className="ch-meta">
                                        <span><i className="ph ph-list-bullets"></i>{m.sections.length} {m.sections.length === 1 ? 'portata' : 'portate'}</span>
                                        <span><i className="ph ph-fork-knife"></i>{dishes}</span>
                                        {kcal > 0 && <span><i className="ph ph-fire"></i>{r0(kcal)} kcal</span>}
                                    </div>
                                </div>
                            </Tilt>
                        );
                    })}
                </div>
            )}
            {open && (
                <MenuBox
                    menu={open} patients={patients} recipes={recipes} byId={byId}
                    onPatch={(p) => patch(open.id, p)}
                    onQty={(sectionId, index) => setQty({ sectionId, index })}
                    onGuide={() => setGuide(true)}
                    onPrint={(withMenu) => printCenter.open(withMenu ? [{ type: 'menu', menuId: open.id }, { type: 'cucina', menuId: open.id }] : [{ type: 'cucina', menuId: open.id }])}
                    onEditRecipe={setEditId}
                    onDelete={remove}
                    onClose={() => setOpenId(null)}
                />
            )}
            {open && editId && byId[editId] && (
                <div className="dg-overlay" style={{ zIndex: 200 }} onMouseDown={(e) => e.target === e.currentTarget && setEditId(null)}>
                    <div className="dg-modal ch-qe" style={{ maxWidth: 780 }}>
                        <div className="ch-qe-note"><i className="ph ph-warning-circle"></i><span>Stai modificando la ricetta <b>«{byId[editId].title}»</b>: il cambiamento è permanente e vale anche nel Ricettario, in tutti i menù e nella Dieta.</span></div>
                        <div className="ch-qe-body">
                            <RecipeEditor
                                initial={formFrom(byId[editId])} foods={foods} onCancel={() => setEditId(null)}
                                onSave={(r) => {
                                    if (!window.confirm(`Salvare le modifiche a «${r.title}»?\n\nLa ricetta cambia in modo permanente: anche nel Ricettario, in tutti i menù che la usano e nella Dieta.`)) return;
                                    onSaveRecipe(r);
                                    setEditId(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {open && guide && <MenuGuide user={user} menu={open} menus={menus} recipes={recipes} onApply={(nm) => onChange(menus.map((x) => (x.id === nm.id ? nm : x)))} onClose={() => setGuide(false)} />}
            {open && qty && (() => {
                const sec = open.sections.find((x) => x.id === qty.sectionId);
                const dish = sec?.dishes[qty.index];
                const recipe = dish && byId[dish.rid];
                if (!recipe) return null;
                const setW = (w) => patch(open.id, { sections: open.sections.map((s) => (s.id === sec.id ? { ...s, dishes: s.dishes.map((x, j) => (j === qty.index ? { ...x, w } : x)) } : s)) });
                return <QtyBox recipe={recipe} dish={dish} menuTitle={open.title} onChange={setW} onClose={() => setQty(null)} />;
            })()}
        </>
    );
};

// Box delle quantità: i grammi di ogni ingrediente in UNA porzione di questo piatto, solo per questo menù (la ricetta non cambia)
const QtyBox = ({ recipe, dish, menuTitle, onChange, onClose }) => {
    const sv = Math.max(1, Number(recipe.servings) || 1);
    const nut = dishNutrition(recipe, dish);
    const base = dishNutrition(recipe, null);
    const set = (id, v) => {
        const w = { ...dish.w };
        if (v === '') delete w[id];
        else w[id] = v;
        onChange(w);
    };
    // la porzione intera si scala in blocco (tutti gli ingredienti) partendo da quella della ricetta
    const scale = (f) => {
        const w = {};
        recipe.items.forEach((i) => { w[i.id] = Math.round(((Number(i.weight) || 0) / sv) * f * 10) / 10; });
        onChange(w);
    };
    const f = base.grams ? nut.grams / base.grams : 1;
    return (
        <div className="dg-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal ch-qtybox" style={{ maxWidth: '34rem' }}>
                <div className="ch-qty-head">
                    <div><h3 className="ch-serif">{recipe.title}</h3><p>Quantità di una porzione nel menù «{menuTitle}»</p></div>
                    <button className="ch-x" onClick={onClose} aria-label="Chiudi"><i className="ph ph-x"></i></button>
                </div>
                <div className="ch-qty-body">
                    <div className="ch-qty-scale">
                        <span>Porzione</span>
                        {[0.5, 0.75, 1, 1.25, 1.5].map((x) => (
                            <button key={x} className={Math.abs(f - x) < 0.005 ? 'on' : ''} onClick={() => (x === 1 ? onChange({}) : scale(x))}>{x === 1 ? 'Standard' : `${Math.round(x * 100)}%`}</button>
                        ))}
                    </div>
                    <div className="ch-qty-rows">
                        {recipe.items.map((i) => (
                            <label key={i.id} className="ch-qty-row">
                                <span>{i.name}</span>
                                <input className="fld" inputMode="decimal" value={dish.w[i.id] ?? ''} placeholder={String(Math.round(((Number(i.weight) || 0) / sv) * 10) / 10)} onChange={(e) => set(i.id, e.target.value.replace(',', '.'))} />
                                <em>g</em>
                            </label>
                        ))}
                    </div>
                    <div className="ch-qty-sum"><b>{r0(nut.kcal)} kcal</b><span>{r0(nut.grams)} g · P {r0(nut.p)} · C {r0(nut.c)} · G {r0(nut.f)}</span></div>
                </div>
                <div className="ch-qty-foot">
                    {nut.custom && <button className="vw-chip" onClick={() => onChange({})}>Ripristina</button>}
                    <button className="vw-next" onClick={onClose}><span>Fatto</span></button>
                </div>
            </div>
        </div>
    );
};
