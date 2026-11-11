import React, { useEffect, useState } from 'react';
import { Icon, Sheet, Step, useHold } from './bits.jsx';
import { Ruler } from './Ruler.jsx';
import { WeightTrend } from './Progress.jsx';
import { arr, mealKey, ymd } from './logic.js';
import { findFoods, loadFoods, GENERIC } from './foods.js';

// Registra un pasto: grammatura corretta, alimento sostituito o aggiunto. Salvato solo sul telefono.
const kc = (e) => (e.b ? Math.round(e.kcal * e.g / e.b) : 0);
// Scelta dell'alimento: cerca nel prontuario. Con `instant` toccare un risultato lo sceglie subito (i grammi si correggono nella riga);
// senza, dopo la scelta resta il passo grammi e «Salva». Le kcal le calcola l'app.
const FoodForm = ({ title, onDone, onCancel, target, instant }) => {
    const [q, setQ] = useState(''), [f, setF] = useState(null), [g, setG] = useState(100);
    const [all, setAll] = useState(null);
    useEffect(() => { let on = true; loadFoods().then((l) => on && setAll(l)); return () => { on = false; }; }, []);
    const hits = f ? [] : findFoods(all, q);
    // Sostituzione: i grammi di partenza danno le stesse kcal dell'alimento tolto; altrimenti 100 g
    const grams = (h) => (target && h.k ? Math.max(10, Math.min(1000, Math.round(target / h.k * 100 / 10) * 10)) : 100);
    const pick = (h) => { if (instant) { const gg = grams(h); onDone({ n: h.n, g: gg, kcal: Math.round(h.k * gg / 100) }); return; } setF(h); setQ(''); setG(grams(h)); };
    return (
        <div className="pt-food-f">
            {f ? <div className="pt-food-sel"><span>{f.n}</span><button type="button" onClick={() => setF(null)}>Cambia</button></div>
                : <div className="pt-food-q"><input className="pt-input" placeholder="Cerca alimento" aria-label={title} value={q} maxLength={40} autoFocus onChange={(e) => setQ(e.target.value)} />{onCancel && <button type="button" aria-label="Annulla" onClick={onCancel}><Icon name="close" size={18} /></button>}</div>}
            {!f && hits.map((h) => <button key={h.n} type="button" className="pt-food-h" onClick={() => pick(h)}>{h.n}</button>)}
            {!f && q.trim() && all && !hits.length && <><span className="pt-food-no">Non lo trovo: scegli il più simile</span>{GENERIC.map((h) => <button key={h.n} type="button" className="pt-food-h" onClick={() => pick(h)}>{h.n}</button>)}</>}
            {f && <><Step dark value={g} onChange={setG} step={10} min={10} max={2000} unit="g" label="Grammi" /><button type="button" className="pt-cta" onClick={() => onDone({ n: f.n, g, kcal: Math.round(f.k * g / 100) })}>Salva</button></>}
        </div>
    );
};

export const MealSheet = ({ rt, docId, d, m, date, onClose }) => {
    const doc = rt.docs.get(docId), meal = doc && arr(doc.body.giorni)[d] && arr(doc.body.giorni[d].pasti)[m];
    const key = mealKey(docId, d, m, date || ymd()), prev = rt.log.get().meals[key];
    const base = () => arr(meal && meal.voci).map((v) => ({ n: v.n, kcal: v.kcal, b: v.g, g: v.g, p: v.g }));
    const [list, setList] = useState(() => (prev && prev.list ? prev.list : base().map((e, i) => (prev ? { ...e, g: prev.items[i] } : e))));
    const [form, setForm] = useState(null);
    if (!meal) return null;
    const set = (i, x) => setList((a) => a.map((y, j) => (j === i ? { ...y, g: Math.max(0, Math.min(2000, x)) } : y)));
    const save = async (l) => { const k = l.reduce((s, e) => s + kc(e), 0); await rt.log.update((r) => { r.meals[key] = { items: l.map((e) => e.g), list: l, kcal: k, at: Date.now() }; }); onClose(); };
    const apply = (x) => {
        const e = { n: x.n, g: x.g, b: x.g, kcal: x.kcal, p: null };
        setList((a) => (form === 'add' ? [...a, e] : a.map((y, j) => (j === form ? { ...e, p: y.p, was: y.was || y.n } : y))));
        setForm(null);
    };
    const FORM = <FoodForm instant target={typeof form === 'number' && list[form] ? kc(list[form]) : 0} title={form === 'add' ? 'Aggiungi un alimento' : 'Sostituisci con'} onDone={apply} onCancel={() => setForm(null)} />;
    return (
        <Sheet title={meal.nome} extra={<em className="pt-sh-k">{list.reduce((t, e) => t + kc(e), 0)} kcal</em>} onClose={onClose}>
                {list.map((v, i) => (
                    form === i ? <React.Fragment key={i}>{FORM}</React.Fragment> : <div className="pt-food" key={i}>
                        {v.p === null && !v.was
                            ? <button type="button" className="pt-food-x" aria-label="Togli" onClick={() => setList((a) => a.filter((_, j) => j !== i))}><Icon name="close" size={18} /></button>
                            : <button type="button" className="pt-food-x" aria-label="Sostituisci" onClick={() => setForm(i)}><Icon name="swap" size={18} /></button>}
                        <div className="pt-food-n"><b>{v.n}</b>{v.was ? <s>{v.was}</s> : null}{v.p && v.g !== v.p ? <s>{v.p} g</s> : null}</div>
                        <Step dark hot={!!v.p && v.g !== v.p} value={v.g} onChange={(x) => set(i, x)} step={5} min={0} max={2000} unit="g" label="Grammi" />
                    </div>
                ))}
                {form === null ? <button type="button" className="pt-add" aria-label="Aggiungi un alimento" onClick={() => setForm('add')}><Icon name="plus" size={20} /></button> : form === 'add' && FORM}
                <button type="button" className="pt-cta" onClick={() => save(list)}>Salva</button>
        </Sheet>
    );
};

export const ExtraSheet = ({ rt, names, date, onClose }) => {
    const opts = [...arr(names).length ? names : ['Colazione', 'Pranzo', 'Cena'], 'Spuntino'].filter((x, i, a) => a.indexOf(x) === i).concat('Fuori pasto');
    const h = new Date().getHours(), re = h < 11 ? /colaz/i : h < 15 ? /pranz/i : h < 18 ? /spunt|merend/i : /cena/i;
    const [when, setWhen] = useState(opts.find((x) => re.test(x)) || 'Fuori pasto');
    const save = async (x) => { const dt = date || ymd(); await rt.log.update((l) => { (l.extras[dt] = l.extras[dt] || []).push({ n: x.n, g: x.g, kcal: Math.min(5000, x.kcal), when, at: Date.now() }); }); onClose(); };
    return (
        <Sheet title="Fuori piano" onClose={onClose}>
                <div className="pt-when" role="group" aria-label="Quando l'hai mangiato">{opts.map((o) => <button key={o} type="button" className={o === when ? 'is-on' : ''} onClick={() => setWhen(o)}>{o}</button>)}</div>
                <FoodForm title="Che cosa hai mangiato" onDone={save} onCancel={onClose} />
        </Sheet>
    );
};

export const WeightSheet = ({ rt, onClose }) => {
    const w = rt.log.get().weights, last = w.length ? w[w.length - 1] : null;
    const [kg, setKg] = useState(last ? last.kg : 70);
    const hm = useHold((k) => setKg((x) => Math.max(20, +(x - 0.1 * k).toFixed(1)))), hp = useHold((k) => setKg((x) => Math.min(300, +(x + 0.1 * k).toFixed(1))));
    const save = async () => { const date = ymd(); await rt.log.update((l) => { const i = l.weights.findIndex((x) => x.date === date); const r = { date, kg, at: Date.now() }; if (i >= 0) l.weights[i] = r; else l.weights.push(r); l.weights = l.weights.slice(-400); }); onClose(); };
    return (
        <Sheet title="Registra il peso" label="Peso" onClose={onClose}>
                <div className="pg pt-wt-g"><WeightTrend weights={w} bare /></div>
                <div className="pt-wt">
                    <button type="button" className="pt-round" aria-label="Meno" {...hm}><Icon name="minus" /></button>
                    <b>{String(kg.toFixed(1)).replace('.', ',')} <small>kg</small></b>
                    <button type="button" className="pt-round" aria-label="Più" {...hp}><Icon name="plus" /></button>
                </div>
                <Ruler value={kg} onChange={setKg} min={20} max={300} />
                <button type="button" className="pt-cta" onClick={save}>Salva</button>
        </Sheet>
    );
};
