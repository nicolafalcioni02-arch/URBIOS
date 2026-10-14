import React, { useMemo, useState } from 'react';
import { buildIndex, foodValues } from '../../../../ai/foodMatcher';
import { newRequestId } from '../../../../ai/promptBuilder';
import { parseAiResponse } from '../../../../ai/responseParser';
import { buildRecipePrompt } from '../../../../ai/recipeSection';
import { defaultChoice } from '../../../../ai/dietSection';
import { FoodSearch } from './MenuStep';
import { genId } from './guidedLogic';
import { isRecipe, makeRecipe, mealItemsCopy, recipeStats, recipeToItem } from './recipeLogic';

// Ricette: libreria, editor e creazione con AI. Una ricetta si inserisce nel pasto come UN alimento (es. "Ciambellone", 80 g).

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch {
            return false;
        }
    }
};

const BADGE = {
    ok: { t: 'Riconosciuto', bg: '#DCE9E1', fg: '#1F6B49' },
    check: { t: 'Da verificare', bg: '#FFF1D6', fg: '#9A5B00' },
    none: { t: 'Scegli l’alimento', bg: '#FDECEA', fg: '#8A1F11' },
    ai: { t: 'Valori stimati AI', bg: '#EAF1FB', fg: '#1F4E8A' },
};

const blankDraft = () => ({ id: null, title: '', servings: 8, finalWeight: '', steps: [], note: '', ings: [] });
const fmt = (x) => Math.round(x * 10) / 10;

export const RecipeModal = ({ patient, db, foodDB, mealLibrary, setMealLibrary, onAdd, onClose }) => {
    const index = useMemo(() => buildIndex(foodDB), [foodDB]);
    const [view, setView] = useState('list'); // list | edit | ai | paste
    const [q, setQ] = useState('');
    const [portions, setPortions] = useState({});
    const [draft, setDraft] = useState(blankDraft());
    const [searchRow, setSearchRow] = useState(null); // id riga ingrediente con ricerca aperta ('new' = nuova riga)
    const [confirmDel, setConfirmDel] = useState(null);

    // creazione con AI
    const [ai, setAi] = useState({ title: '', servings: 8, notes: '', includeFoodList: true });
    const [requestId] = useState(newRequestId);
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [err, setErr] = useState('');

    const recipes = mealLibrary.filter(isRecipe);
    const saved = mealLibrary.filter((m) => !isRecipe(m));
    const match = (m) => !q.trim() || String(m.title || '').toLowerCase().includes(q.trim().toLowerCase());

    const stats = useMemo(() => recipeStats({ ingredients: draft.ings, servings: draft.servings, finalWeight: draft.finalWeight }), [draft]);
    const canSave = draft.title.trim() && draft.ings.some((i) => Number(i.weight) > 0 && Number(i.kcal) > 0);
    const unresolved = draft.ings.filter((i) => i.status === 'none' && !(Number(i.kcal) > 0)).length;

    const openNew = () => {
        setDraft(blankDraft());
        setSearchRow(null);
        setView('edit');
    };
    const openEdit = (r) => {
        setDraft({ id: r.id, title: r.title, servings: r.servings, finalWeight: r.finalWeight || '', steps: r.steps || [], note: r.note || '', ings: r.items.map((i) => ({ ...i })) });
        setSearchRow(null);
        setView('edit');
    };

    const setIng = (id, patch) => setDraft((d) => ({ ...d, ings: d.ings.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
    const pickFood = (rowId, f) => {
        const v = foodValues(f);
        if (rowId === 'new') setDraft((d) => ({ ...d, ings: [...d.ings, { id: genId(), name: f.name, weight: Number(f.portion) > 0 ? Number(f.portion) : 100, ...v }] }));
        else setIng(rowId, { name: f.name, ...v, status: 'ok', aiEstimated: false });
        setSearchRow(null);
    };

    const save = (andAdd) => {
        const rec = makeRecipe({ id: draft.id, title: draft.title, servings: draft.servings, finalWeight: draft.finalWeight, ingredients: draft.ings, steps: draft.steps, note: draft.note });
        setMealLibrary((prev) => (draft.id && prev.some((m) => m.id === draft.id) ? prev.map((m) => (m.id === draft.id ? rec : m)) : [rec, ...prev]));
        if (andAdd) {
            onAdd([recipeToItem(rec, 1)]);
            onClose();
        } else setView('list');
    };

    // ---- AI ----
    const prompt = useMemo(() => buildRecipePrompt({ patient, foodDB, requestId, title: ai.title, servings: ai.servings, notes: ai.notes, includeFoodList: ai.includeFoodList }), [patient, foodDB, requestId, ai]);
    const doCopy = async () => {
        const ok = await copyText(prompt);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 4000);
    };
    const readAi = () => {
        const r = parseAiResponse(pasted, { patient, visitDraft: {}, db, requestId, foodDB, exerciseDB: [] });
        if (!r.ok) return setErr(r.fatal);
        if (!r.recipe) return setErr('La risposta non contiene la sezione "ricetta". Rigenera con il prompt di URBIOS.');
        const rc = r.recipe;
        const ings = rc.ingredients.map((it) => {
            const c = defaultChoice(it);
            const base = { id: genId(), weight: it.grams, aiName: it.aiName };
            if (c.type === 'db') {
                const v = foodValues(c.food);
                return { ...base, name: c.food.name, ...v, status: it.match.status === 'ok' ? 'ok' : 'check', alternatives: it.match.alternatives };
            }
            if (c.type === 'ai') return { ...base, name: it.aiName, ...c.values, status: 'ai', aiEstimated: true };
            return { ...base, name: it.aiName, kcal: 0, p: 0, c: 0, f: 0, status: 'none' };
        });
        setDraft({ id: null, title: rc.title, servings: rc.servings, finalWeight: rc.finalWeight || '', steps: rc.steps, note: rc.note, ings });
        setErr('');
        setSearchRow(null);
        setView('edit');
    };

    const title = { list: 'Ricette', edit: draft.id ? 'Modifica ricetta' : 'Nuova ricetta', ai: 'Crea la ricetta con l’AI', paste: 'Incolla la risposta' }[view];

    return (
        <div className="dg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    {view !== 'list' && (
                        <button className="dg-ghost" aria-label="Indietro" onClick={() => setView(view === 'paste' ? 'ai' : 'list')}>
                            <i className="ph ph-arrow-left"></i>
                        </button>
                    )}
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-cooking-pot text-lg"></i>
                    </div>
                    <h2 className="flex-1 text-[18px] font-semibold leading-tight">{title}</h2>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    {/* ---------- ELENCO ---------- */}
                    {view === 'list' && (
                        <div className="dg-in">
                            <div className="grid sm:grid-cols-2 gap-2.5">
                                <button className="dg-action primary" onClick={openNew}>
                                    <i className="ph ph-plus-circle"></i>
                                    <span className="flex-1 text-left">
                                        <b>Nuova ricetta</b>
                                        <small>Scrivi ingredienti e porzioni</small>
                                    </span>
                                </button>
                                <button className="dg-action" onClick={() => setView('ai')}>
                                    <i className="ph ph-sparkle"></i>
                                    <span className="flex-1 text-left">
                                        <b>Creala con l’AI</b>
                                        <small>Es. “ciambellone senza lattosio”</small>
                                    </span>
                                </button>
                            </div>

                            {mealLibrary.length > 0 && <input className="fld mt-5" placeholder="Cerca tra le ricette e i pasti salvati…" value={q} onChange={(e) => setQ(e.target.value)} />}

                            {recipes.filter(match).length > 0 && <p className="dg-q mt-5">Le mie ricette</p>}
                            {recipes.filter(match).map((r) => {
                                const p = portions[r.id] || 1;
                                return (
                                    <div key={r.id} className="dg-card !mt-2 !p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15.5px] font-semibold break-words">{r.title}</p>
                                                <p className="text-[12.5px] text-[color:var(--muted)]">
                                                    {r.servings} porz. · 1 porzione = {r.portionGrams} g, {Math.round(r.totals.kcal / r.servings)} kcal
                                                </p>
                                            </div>
                                            <button className="dg-ghost" aria-label="Modifica" onClick={() => openEdit(r)}>
                                                <i className="ph ph-pencil-simple"></i>
                                            </button>
                                            {confirmDel === r.id ? (
                                                <button className="dg-link" style={{ color: '#C2413A' }} onClick={() => { setMealLibrary((prev) => prev.filter((m) => m.id !== r.id)); setConfirmDel(null); }}>
                                                    Elimina
                                                </button>
                                            ) : (
                                                <button className="dg-ghost" aria-label="Elimina" onClick={() => setConfirmDel(r.id)}>
                                                    <i className="ph ph-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-3 mt-3">
                                            <div className="dg-stepper">
                                                <button aria-label="Meno" onClick={() => setPortions({ ...portions, [r.id]: Math.max(0.5, p - 0.5) })}>
                                                    <i className="ph ph-minus"></i>
                                                </button>
                                                <input value={p} readOnly aria-label="Porzioni" />
                                                <span>porz.</span>
                                                <button aria-label="Più" onClick={() => setPortions({ ...portions, [r.id]: p + 0.5 })}>
                                                    <i className="ph ph-plus"></i>
                                                </button>
                                            </div>
                                            <button className="vw-next !h-10 !min-w-0" onClick={() => { onAdd([recipeToItem(r, p)]); onClose(); }}>
                                                Aggiungi al pasto
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {saved.filter(match).length > 0 && <p className="dg-q mt-6">Pasti salvati</p>}
                            {saved.filter(match).map((m) => (
                                <div key={m.id} className="dg-card !mt-2 !p-4 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-semibold break-words">{m.title}</p>
                                        <p className="text-[12.5px] text-[color:var(--muted)]">{(m.items || []).length} alimenti · {Math.round(m.totals?.kcal || 0)} kcal</p>
                                    </div>
                                    <button className="dg-chip row" onClick={() => { onAdd(mealItemsCopy(m)); onClose(); }}>
                                        Aggiungi
                                    </button>
                                </div>
                            ))}
                            {mealLibrary.length === 0 && <p className="dg-hint text-center mt-8">Non hai ancora ricette. Creane una o falla scrivere all’AI.</p>}
                        </div>
                    )}

                    {/* ---------- EDITOR ---------- */}
                    {view === 'edit' && (
                        <div className="dg-in">
                            {draft.ings.some((i) => i.status) && <p className="dg-hint !mt-0 mb-3">Ricetta proposta dall’AI: controlla gli ingredienti e correggi quelli segnati.</p>}
                            <label className="fld-label">Nome della ricetta</label>
                            <input className="fld" placeholder="Es. Ciambellone allo yogurt" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="fld-label">Porzioni</label>
                                    <input className="fld" inputMode="numeric" value={draft.servings} onChange={(e) => setDraft({ ...draft, servings: e.target.value })} />
                                </div>
                                <div>
                                    <label className="fld-label">Peso finale (g) <span className="opacity-60">facoltativo</span></label>
                                    <input className="fld" inputMode="numeric" placeholder={`${Math.round(stats.total.grams)} (somma ingredienti)`} value={draft.finalWeight} onChange={(e) => setDraft({ ...draft, finalWeight: e.target.value })} />
                                </div>
                            </div>

                            <p className="dg-q mt-6">Ingredienti <span className="font-normal text-[color:var(--muted)]">(per l’intera ricetta)</span></p>
                            <div className="rounded-2xl border border-[color:var(--line)] bg-white overflow-hidden">
                                {draft.ings.length === 0 && <p className="p-4 text-[13.5px] text-[color:var(--muted)]">Nessun ingrediente: aggiungine uno dalla ricerca.</p>}
                                {draft.ings.map((i) => {
                                    const b = BADGE[i.status];
                                    return (
                                        <div key={i.id} className="border-b last:border-b-0 border-[color:var(--line)] p-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[14.5px] font-medium break-words">{i.name}</p>
                                                    {i.aiName && i.aiName !== i.name && <p className="text-[12px] text-[color:var(--muted)]">l’AI aveva scritto “{i.aiName}”</p>}
                                                    <p className="text-[12px] text-[color:var(--muted)]">{Math.round((Number(i.kcal) * Number(i.weight)) / 100)} kcal</p>
                                                </div>
                                                {b && i.status !== 'ok' && (
                                                    <button className="text-[11.5px] font-semibold px-2 py-1 rounded-full" style={{ background: b.bg, color: b.fg }} onClick={() => setSearchRow(searchRow === i.id ? null : i.id)}>
                                                        {b.t}
                                                    </button>
                                                )}
                                                <div className="dg-stepper">
                                                    <input inputMode="decimal" value={i.weight} onChange={(e) => setIng(i.id, { weight: e.target.value })} aria-label="Grammi" />
                                                    <span>g</span>
                                                </div>
                                                <button className="dg-ghost" aria-label="Cambia alimento" onClick={() => setSearchRow(searchRow === i.id ? null : i.id)}>
                                                    <i className="ph ph-magnifying-glass"></i>
                                                </button>
                                                <button className="dg-ghost" aria-label="Rimuovi" onClick={() => setDraft((d) => ({ ...d, ings: d.ings.filter((x) => x.id !== i.id) }))}>
                                                    <i className="ph ph-trash"></i>
                                                </button>
                                            </div>
                                            {searchRow === i.id && (
                                                <>
                                                    {i.alternatives?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {i.alternatives.map((f) => (
                                                                <button key={f.name} className="dg-chip row !min-h-0 !h-9 !text-[13px]" onClick={() => pickFood(i.id, f)}>
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <FoodSearch index={index} onClose={() => setSearchRow(null)} onPick={(f) => pickFood(i.id, f)} />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {searchRow === 'new' ? (
                                <FoodSearch index={index} onClose={() => setSearchRow(null)} onPick={(f) => pickFood('new', f)} />
                            ) : (
                                <button className="dg-add" onClick={() => setSearchRow('new')}>
                                    <i className="ph ph-plus-circle"></i> Aggiungi ingrediente
                                </button>
                            )}

                            {draft.ings.length > 0 && (
                                <div className="dg-result !mt-5">
                                    <p className="text-[12px] uppercase tracking-wider opacity-70 font-semibold">1 porzione ({Math.round(stats.perServing.grams)} g)</p>
                                    <p className="text-[28px] font-semibold leading-tight">
                                        {Math.round(stats.perServing.kcal)} <span className="text-[15px] font-medium opacity-80">kcal</span>
                                    </p>
                                    <p className="text-[13.5px] opacity-85">
                                        Carboidrati {fmt(stats.perServing.c)} g · Proteine {fmt(stats.perServing.p)} g · Grassi {fmt(stats.perServing.f)} g
                                    </p>
                                    <p className="text-[12px] opacity-60 mt-1">Per 100 g: {Math.round(stats.per100.kcal)} kcal · totale ricetta {Math.round(stats.total.kcal)} kcal</p>
                                </div>
                            )}
                            {unresolved > 0 && <p className="dg-warn">{unresolved} {unresolved === 1 ? 'ingrediente non è stato riconosciuto' : 'ingredienti non sono stati riconosciuti'}: cercalo nel database (lente) o toglilo. Finché non lo scegli non conta nelle kcal.</p>}

                            <p className="dg-q mt-6">Procedimento <span className="font-normal text-[color:var(--muted)]">(facoltativo)</span></p>
                            <textarea
                                className="fld"
                                rows={4}
                                style={{ height: 'auto', padding: 14 }}
                                placeholder="Un passaggio per riga"
                                value={draft.steps.join('\n')}
                                onChange={(e) => setDraft({ ...draft, steps: e.target.value.split('\n') })}
                            />
                        </div>
                    )}

                    {/* ---------- AI: richiesta ---------- */}
                    {view === 'ai' && (
                        <div className="dg-in">
                            <p className="dg-sub !mt-0">Dimmi cosa vuoi: l’AI scrive ingredienti e procedimento, e URBIOS calcola kcal e macro dal tuo database.</p>
                            <label className="fld-label mt-4">Che ricetta?</label>
                            <input className="fld" placeholder="Es. Ciambellone, tiramisù light, pane integrale…" value={ai.title} onChange={(e) => setAi({ ...ai, title: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="fld-label">Porzioni</label>
                                    <input className="fld" inputMode="numeric" value={ai.servings} onChange={(e) => setAi({ ...ai, servings: e.target.value })} />
                                </div>
                            </div>
                            <label className="fld-label mt-3">Richieste particolari (facoltative)</label>
                            <textarea className="fld" rows={3} style={{ height: 'auto', padding: 14 }} placeholder="Es. senza lattosio, poco zucchero, ricca di proteine, adatta a una colazione…" value={ai.notes} onChange={(e) => setAi({ ...ai, notes: e.target.value })} />
                            <p className="dg-hint" style={{ color: '#7A5B0B' }}><i className="ph ph-shield-warning"></i> Non scrivere nome, residenza, contatti o altri dati che identificano il paziente (GDPR e AI Act): solo dati clinici.</p>
                            <label className="flex items-start gap-2.5 mt-4 p-4 rounded-2xl border border-[color:var(--line)] bg-white cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4" checked={ai.includeFoodList} onChange={(e) => setAi({ ...ai, includeFoodList: e.target.checked })} />
                                <span className="text-[14px]">
                                    <b>Includi l’elenco dei tuoi alimenti</b> ({foodDB.length.toLocaleString('it-IT')} voci)
                                    <span className="block text-[12.5px] text-[color:var(--muted)]">Gli ingredienti vengono riconosciuti con più sicurezza. Il prompt diventa più lungo.</span>
                                </span>
                            </label>
                            <button className="vw-next w-full mt-5 !h-14 text-[16px]" onClick={doCopy}>
                                <i className={`ph ${copied ? 'ph-check' : 'ph-copy'}`}></i> {copied ? 'Copiato! Incollalo nel tuo agente AI' : 'Clicca per copiare il prompt'}
                            </button>
                            <p className="dg-hint text-center">Poi copia la risposta dell’AI esattamente com’è e torna qui.</p>
                        </div>
                    )}

                    {/* ---------- AI: risposta ---------- */}
                    {view === 'paste' && (
                        <div className="dg-in">
                            <p className="dg-sub !mt-0">Incolla la risposta dell’AI. Anche con testo prima o dopo: ripulisco io.</p>
                            <textarea
                                autoFocus
                                className="fld mt-4"
                                rows={12}
                                style={{ height: 'auto', padding: 14, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5 }}
                                placeholder={'```json\n{ "format": "URBIOS-AI", "ricetta": { ... } }\n```'}
                                value={pasted}
                                onChange={(e) => {
                                    setPasted(e.target.value);
                                    setErr('');
                                }}
                            />
                            {err && <div className="mt-4 p-4 rounded-2xl text-[14px]" style={{ background: '#FDECEA', color: '#8A1F11' }}>{err}</div>}
                        </div>
                    )}
                </div>

                <div className="flex-none flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-[color:var(--line)]">
                    {view === 'list' && (
                        <>
                            <span></span>
                            <button className="vw-back" onClick={onClose}>Chiudi</button>
                        </>
                    )}
                    {view === 'edit' && (
                        <>
                            <button className="vw-back" disabled={!canSave} style={!canSave ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={() => save(false)}>
                                Salva
                            </button>
                            <button className="vw-next vw-save" disabled={!canSave} style={!canSave ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={() => save(true)}>
                                <i className="ph ph-check"></i> Salva e aggiungi al pasto
                            </button>
                        </>
                    )}
                    {view === 'ai' && (
                        <>
                            <span></span>
                            <button className="vw-next" disabled={!ai.title.trim()} style={!ai.title.trim() ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={async () => { if (!copied) await doCopy(); setView('paste'); }}>
                                Ho la risposta <i className="ph ph-arrow-right"></i>
                            </button>
                        </>
                    )}
                    {view === 'paste' && (
                        <>
                            <span></span>
                            <button className="vw-next" disabled={!pasted.trim()} style={!pasted.trim() ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={readAi}>
                                <i className="ph ph-magic-wand"></i> Leggi la ricetta
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
