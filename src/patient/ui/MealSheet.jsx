import React, { useEffect, useState } from 'react';
import { Icon } from './bits.jsx';
import { WeightTrend } from './Progress.jsx';
import { arr, mealKey, ymd } from './logic.js';
import { findFoods, loadFoods, GENERIC } from './foods.js';

// Registra un pasto: grammatura corretta, alimento sostituito o aggiunto. Salvato solo sul telefono.
const kc = (e) => (e.b ? Math.round(e.kcal * e.g / e.b) : 0);
// Scelta dell'alimento: cerca nel prontuario, poi i grammi. Le kcal le calcola l'app.
const FoodForm = ({ title, onDone, onCancel, target }) => {
    const [q, setQ] = useState(''), [f, setF] = useState(null), [g, setG] = useState(100);
    const [all, setAll] = useState(null);
    useEffect(() => { let on = true; loadFoods().then((l) => on && setAll(l)); return () => { on = false; }; }, []);
    const hits = f ? [] : findFoods(all, q);
    // Sostituzione: i grammi di partenza danno le stesse kcal dell'alimento tolto; altrimenti 100 g
    const pick = (h) => { setF(h); setQ(''); setG(target && h.k ? Math.max(10, Math.min(1000, Math.round(target / h.k * 100 / 10) * 10)) : 100); };
    const ok = f && g > 0;
    return (
        <div className="pt-food-f">
            <b>{title}</b>
            {f ? <div className="pt-food-sel"><span>{f.n}</span><button type="button" onClick={() => setF(null)}>Cambia</button></div>
                : <input className="pt-input" placeholder="Cerca alimento" value={q} maxLength={40} autoFocus onChange={(e) => setQ(e.target.value)} />}
            {!f && hits.map((h) => <button key={h.n} type="button" className="pt-food-h" onClick={() => pick(h)}>{h.n}</button>)}
            {!f && q.trim() && all && !hits.length && <><span className="pt-food-no">Non lo trovo: scegli il più simile</span>{GENERIC.map((h) => <button key={h.n} type="button" className="pt-food-h" onClick={() => pick(h)}>{h.n}</button>)}</>}
            {f && <><span className="pt-food-no">{target ? 'Quantità con le stesse calorie di prima: puoi cambiarla' : 'Quanti grammi'}</span><div className="pt-step dark"><button type="button" aria-label="Meno" onClick={() => setG((x) => Math.max(10, x - 10))}><Icon name="minus" size={16} /></button><b>{g} g</b><button type="button" aria-label="Più" onClick={() => setG((x) => Math.min(2000, x + 10))}><Icon name="plus" size={16} /></button></div></>}
            <div><button type="button" className="pt-btn ghost" onClick={onCancel}>Annulla</button><button type="button" className="pt-btn" disabled={!ok} onClick={() => onDone({ n: f.n, g, kcal: Math.round(f.k * g / 100) })}>Conferma</button></div>
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
    const FORM = <FoodForm target={typeof form === 'number' && list[form] ? kc(list[form]) : 0} title={form === 'add' ? 'Aggiungi un alimento' : 'Sostituisci con'} onDone={apply} onCancel={() => setForm(null)} />;
    return (
        <div className="pt-ov" role="dialog" aria-modal="true" aria-label={meal.nome}>
            <div className="pt-ov-back" onClick={onClose} />
            <section className="pt-dsheet">
                <header><b>{meal.nome}</b><button type="button" className="pt-round" aria-label="Chiudi" onClick={onClose}><Icon name="close" /></button></header>
                {list.map((v, i) => (
                    form === i ? <React.Fragment key={i}>{FORM}</React.Fragment> : <div className="pt-food" key={i}>
                        <div><b>{v.n}</b><span>{v.was ? `Al posto di ${v.was}` : v.p ? `Prescritti ${v.p} g` : 'Aggiunto da te'}</span>
                            <span className="pt-food-a"><button type="button" onClick={() => setForm(i)}>Sostituisci</button>{v.p === null && !v.was && <button type="button" onClick={() => setList((a) => a.filter((_, j) => j !== i))}>Togli</button>}</span></div>
                        <div className="pt-step dark">
                            <button type="button" aria-label="Meno" onClick={() => set(i, v.g - 5)}><Icon name="minus" size={16} /></button>
                            <b>{v.g} g</b>
                            <button type="button" aria-label="Più" onClick={() => set(i, v.g + 5)}><Icon name="plus" size={16} /></button>
                        </div>
                    </div>
                ))}
                {form === null ? <button type="button" className="pt-btn ghost wide" onClick={() => setForm('add')}>Aggiungi un alimento</button> : form === 'add' && FORM}
                <button type="button" className="pt-cta" onClick={() => save(list)}>Conferma e salva nel diario</button>
                <button type="button" className="pt-link" onClick={onClose}>Annulla</button>
            </section>
        </div>
    );
};

export const ExtraSheet = ({ rt, names, date, onClose }) => {
    const opts = [...arr(names).length ? names : ['Colazione', 'Pranzo', 'Cena'], 'Spuntino'].filter((x, i, a) => a.indexOf(x) === i).concat('Fuori pasto');
    const h = new Date().getHours(), re = h < 11 ? /colaz/i : h < 15 ? /pranz/i : h < 18 ? /spunt|merend/i : /cena/i;
    const [when, setWhen] = useState(opts.find((x) => re.test(x)) || 'Fuori pasto');
    const save = async (x) => { const dt = date || ymd(); await rt.log.update((l) => { (l.extras[dt] = l.extras[dt] || []).push({ n: x.n, g: x.g, kcal: Math.min(5000, x.kcal), when, at: Date.now() }); }); onClose(); };
    return (
        <div className="pt-ov" role="dialog" aria-modal="true" aria-label="Fuori piano">
            <div className="pt-ov-back" onClick={onClose} />
            <section className="pt-dsheet">
                <header><b>Fuori piano</b><button type="button" className="pt-round" aria-label="Chiudi" onClick={onClose}><Icon name="close" /></button></header>
                <b className="pt-when-t">Quando l'hai mangiato</b>
                <div className="pt-when">{opts.map((o) => <button key={o} type="button" className={o === when ? 'is-on' : ''} onClick={() => setWhen(o)}>{o}</button>)}</div>
                <FoodForm title="Che cosa hai mangiato" onDone={save} onCancel={onClose} />
            </section>
        </div>
    );
};

export const WeightSheet = ({ rt, onClose }) => {
    const w = rt.log.get().weights, last = w.length ? w[w.length - 1] : null;
    const [kg, setKg] = useState(last ? last.kg : 70);
    const save = async () => { const date = ymd(); await rt.log.update((l) => { const i = l.weights.findIndex((x) => x.date === date); const r = { date, kg, at: Date.now() }; if (i >= 0) l.weights[i] = r; else l.weights.push(r); l.weights = l.weights.slice(-400); }); onClose(); };
    return (
        <div className="pt-ov" role="dialog" aria-modal="true" aria-label="Peso">
            <div className="pt-ov-back" onClick={onClose} />
            <section className="pt-dsheet">
                <header><b>Registra il peso</b><button type="button" className="pt-round" aria-label="Chiudi" onClick={onClose}><Icon name="close" /></button></header>
                <div className="pg" style={{ margin: '4px 0 12px' }}><WeightTrend weights={w} /></div>
                <div className="pt-wt">
                    <button type="button" className="pt-round" aria-label="Meno" onClick={() => setKg((x) => Math.max(20, +(x - 0.1).toFixed(1)))}><Icon name="minus" /></button>
                    <b>{String(kg.toFixed(1)).replace('.', ',')} <small>kg</small></b>
                    <button type="button" className="pt-round" aria-label="Più" onClick={() => setKg((x) => Math.min(300, +(x + 0.1).toFixed(1)))}><Icon name="plus" /></button>
                </div>
                <button type="button" className="pt-cta" onClick={save}>Salva</button>
                <button type="button" className="pt-link" onClick={onClose}>Annulla</button>
            </section>
        </div>
    );
};
