import React, { useMemo, useState } from 'react';
import { UrbiosLogo } from '../brand/UrbiosLogo';
import { chefStyles } from './chefStyles';
import { CATEGORIES, buildRecipe, emptyForm, formFrom, newMenu, recipesOf } from './chefLogic';
import { RecipeView } from './RecipeView';
import { RecipeEditor } from './RecipeEditor';
import { MenuBoard } from './MenuBoard';
import { Tilt } from './ChefCharts';
import { guidedCss } from '../components/patient/shared/guidedStyles';
import { AiRecipe } from './AiRecipe';
import { PrintCenterProvider, usePrintCenter } from '../components/reports/printCenter/PrintCenterProvider';
import { defaultFoodDB } from '../components/patient/diet/data/defaultFoodDB';

// Chef URBIOS: il ricettario. Ricette in db.diet_meal_library (le stesse della Dieta), menù in db.chef_menus. Vedi README.md.
// Il Centro stampa lavora su un "paziente": per il ricettario basta uno studio vuoto (nessuna visita, nessun nome)
const STUDIO = { id: '__chef', nome: '', cognome: '', visite: [] };

export const Chef = ({ db, onUpdateDb, onBack, initialMenuId = null }) => (
    <PrintCenterProvider patient={STUDIO} db={db} onUpdateDb={onUpdateDb}>
        <ChefInner db={db} onUpdateDb={onUpdateDb} onBack={onBack} initialMenuId={initialMenuId} />
    </PrintCenterProvider>
);

const ChefInner = ({ db, onUpdateDb, onBack, initialMenuId }) => {
    const printCenter = usePrintCenter();
    const [aiOpen, setAiOpen] = useState(false);
    const [tab, setTab] = useState(initialMenuId ? 'menu' : 'ricette');
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('');
    const [openId, setOpenId] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(initialMenuId);
    const [form, setForm] = useState(null); // null = non si sta modificando
    const recipes = useMemo(() => recipesOf(db), [db]);
    const foods = db.diet_food_db?.length ? db.diet_food_db : defaultFoodDB;
    const open = recipes.find((r) => r.id === openId);

    const list = recipes.filter((r) => (!cat || r.category === cat) && (!q.trim() || r.title.toLowerCase().includes(q.trim().toLowerCase())));

    const save = (r) => {
        onUpdateDb((prev) => {
            const lib = prev.diet_meal_library || [];
            const exists = lib.some((x) => x.id === r.id);
            return { ...prev, diet_meal_library: exists ? lib.map((x) => (x.id === r.id ? r : x)) : [r, ...lib] };
        });
        setForm(null);
        setOpenId(r.id);
    };
    const saveRecipe = (r) => onUpdateDb((prev) => ({ ...prev, diet_meal_library: (prev.diet_meal_library || []).map((x) => (x.id === r.id ? r : x)) }));
    // cambia le porzioni dalla pagina ricetta: le quantità si scalano e la ricetta si salva (le kcal a porzione restano uguali)
    const setServings = (n) => {
        const f = formFrom(open);
        const k = n / (open.servings || 1);
        const r2 = (x) => Math.round(x * 100) / 100;
        const r = buildRecipe({ ...f, servings: n, finalWeight: f.finalWeight ? r2(Number(f.finalWeight) * k) : '', ingredients: f.ingredients.map((i) => ({ ...i, weight: r2((i.weight || 0) * k) })) });
        onUpdateDb((prev) => ({ ...prev, diet_meal_library: (prev.diet_meal_library || []).map((x) => (x.id === r.id ? r : x)) }));
    };
    // cambia i grammi di un ingrediente dalla pagina ricetta (totali e kcal si ricalcolano)
    const setWeight = (id, w) => {
        const f = formFrom(open);
        const r = buildRecipe({ ...f, ingredients: f.ingredients.map((i) => (i.id === id ? { ...i, weight: w } : i)) });
        onUpdateDb((prev) => ({ ...prev, diet_meal_library: (prev.diet_meal_library || []).map((x) => (x.id === r.id ? r : x)) }));
    };
    const newMenuHere = () => {
        const m = newMenu();
        onUpdateDb((prev) => ({ ...prev, chef_menus: [m, ...(prev.chef_menus || [])] }));
        setMenuOpenId(m.id);
    };
    const remove = () => {
        if (!window.confirm(`Eliminare «${open.title}»? Sparisce anche dalla Dieta.`)) return;
        onUpdateDb((prev) => ({ ...prev, diet_meal_library: (prev.diet_meal_library || []).filter((x) => x.id !== openId) }));
        setOpenId(null);
    };

    let body;
    if (form) body = <RecipeEditor initial={form} foods={foods} onSave={save} onCancel={() => setForm(null)} />;
    else if (open) body = <RecipeView recipe={open} onBack={() => setOpenId(null)} onEdit={() => setForm(formFrom(open))} onDelete={remove} onServings={setServings} onWeight={setWeight} />;
    else
        body = (
            <>
                <div className="ch-top">
                    <button className="vw-chip !px-0 w-9 !h-9 justify-center" onClick={onBack} aria-label="Indietro">
                        <i className="ph ph-arrow-left"></i>
                    </button>
                    <span className="ch-mark" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><UrbiosLogo size={18} />URBIOS</span>
                </div>
                <div className="ch-tabs" role="tablist">
                    <button className={tab === 'ricette' ? 'on' : ''} onClick={() => setTab('ricette')}>Ricette</button>
                    <button className={tab === 'menu' ? 'on' : ''} onClick={() => setTab('menu')}>Menù</button>
                </div>
                <header className="ch-hero rise">
                    <div>
                        <h1 className="ch-serif">Chef</h1>
                        <p>{tab === 'menu' ? 'Componi le carte in portate per i tuoi eventi, con piano di lavoro e lettera agli chef.' : 'Il tuo ricettario: ricette, calorie e macro calcolate da sole.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2" style={{ position: 'relative' }}>
                        {tab === 'menu' ? (
                            <button className="vw-next" style={{ height: 48 }} onClick={newMenuHere}><i className="ph-bold ph-plus"></i><span>Nuovo menù</span></button>
                        ) : (
                            <>
                                <button className="vw-chip" style={{ height: 48 }} onClick={() => setAiOpen(true)}><i className="ph ph-magic-wand"></i>URBIOS AI</button>
                                {recipes.length > 0 && <button className="vw-chip" style={{ height: 48, width: 48, padding: 0, justifyContent: 'center' }} onClick={() => printCenter.open([{ type: 'ricettario', ids: list.map((r) => r.id) }])} title="Stampa il ricettario" aria-label="Stampa il ricettario"><i className="ph ph-printer"></i></button>}
                                <button className="vw-next" style={{ height: 48 }} onClick={() => setForm(emptyForm())}><i className="ph-bold ph-plus"></i><span>Nuova ricetta</span></button>
                            </>
                        )}
                    </div>
                </header>
                {tab === 'menu' ? (
                    <MenuBoard user={db.utente} patients={db.pazienti} menus={db.chef_menus || []} recipes={recipes} openId={menuOpenId} onOpen={setMenuOpenId} foods={foods} onSaveRecipe={saveRecipe} onChange={(m) => onUpdateDb((prev) => ({ ...prev, chef_menus: m }))} />
                ) : (
                    <>
                        <div className="ch-tools">
                            <div className="ch-search">
                                <i className="ph ph-magnifying-glass"></i>
                                <input className="fld" style={{ paddingLeft: 40 }} placeholder="Cerca una ricetta" value={q} onChange={(e) => setQ(e.target.value)} />
                            </div>
                            <div className="ch-pills">
                                {['', ...CATEGORIES].map((c) => (
                                    <button key={c} className={`ch-pill ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c || 'Tutte'}</button>
                                ))}
                            </div>
                        </div>
                        {recipes.length === 0 ? (
                            <div className="ch-empty">
                                <h3 className="ch-serif">Il ricettario è vuoto</h3>
                                <p>Scrivi la prima ricetta: scegli gli ingredienti dal database e le calorie si calcolano da sole.</p>
                                <button className="vw-next mx-auto" onClick={() => setForm(emptyForm())}><i className="ph-bold ph-plus"></i><span>Nuova ricetta</span></button>
                            </div>
                        ) : list.length === 0 ? (
                            <p className="text-center text-[14px] text-[color:var(--muted)] py-10">Nessuna ricetta trovata</p>
                        ) : (
                            <div className="ch-grid stagger">
                                {list.map((r) => (
                                    <Tilt key={r.id} onClick={() => setOpenId(r.id)}>
                                        <div className="ch-body">
                                            <span className="ch-cat ch-cat-in">{r.category || 'Ricetta'}</span>
                                            <h3 className="ch-serif">{r.title}</h3>
                                            <div className="ch-meta">
                                                {r.minutes > 0 && <span><i className="ph ph-clock"></i>{r.minutes}′</span>}
                                                <span><i className="ph ph-users"></i>{r.servings}</span>
                                                <span><i className="ph ph-fire"></i>{Math.round(r.totals.kcal / (r.servings || 1))} kcal</span>
                                            </div>
                                        </div>
                                    </Tilt>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </>
        );

    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--paper)]">
            <style>{guidedCss + chefStyles}</style>
            <div className="ch-wrap">{body}</div>
            {aiOpen && <AiRecipe db={db} foods={foods} onClose={() => setAiOpen(false)} onForm={(f) => { setAiOpen(false); setOpenId(null); setForm(f); }} />}
        </div>
    );
};
