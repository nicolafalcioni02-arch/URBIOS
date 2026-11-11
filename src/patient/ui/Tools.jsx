import React, { useEffect, useRef, useState } from 'react';
import { Icon, Sheet, Step } from './bits.jsx';
import { arr, ymd, toolsOf } from './logic.js';
import { startBarcode, validEan } from '../barcode.js';
import { lookupEan } from '../foodlookup.js';

// Strumenti del paziente: tutto resta sul telefono (nel diario cifrato), il professionista non lo riceve.
const Shell = Sheet;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d.getTime()); };
export const daysTo = (date) => { if (!date) return null; const a = new Date(ymd() + 'T00:00:00'), b = new Date(date + 'T00:00:00'); return Math.round((b - a) / 86400000); };
export const fmtLong = (date) => new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

// Prossimo controllo: data scelta dal paziente (il professionista non invia appuntamenti)
export const VisitSheet = ({ rt, onClose }) => {
    const cur = toolsOf(rt.log.get()).visit, [d, setD] = useState(cur || '');
    const save = async (v) => { await rt.log.update((l) => { toolsOf(l).visit = v || null; }); onClose(); };
    const n = cur ? daysTo(cur) : null;
    return (
        <Shell title="Prossimo controllo" onClose={onClose}>
            {n !== null && n >= 0 && <p className="pt-vd">{n === 0 ? <b>Oggi</b> : <><b>{n}</b><small>{n === 1 ? 'giorno' : 'giorni'}</small></>}</p>}
            <div className="pt-quick pt-quick-4">{[['2 sett', 14], ['1 mese', 30], ['2 mesi', 60], ['3 mesi', 90]].map(([l, k]) => <button key={l} type="button" onClick={() => save(addDays(k))}>{l}</button>)}</div>
            <div className="pt-vdate">
                <input className="pt-input" type="date" aria-label="Data" min={ymd()} value={d} onChange={(e) => setD(e.target.value)} />
                {cur && <button type="button" className="pt-round" aria-label="Togli la data" onClick={() => save(null)}><Icon name="trash" size={20} /></button>}
            </div>
            {d && d !== cur && <button type="button" className="pt-cta" onClick={() => save(d)}>Salva</button>}
        </Shell>
    );
};

// Cose da dire al professionista al prossimo appuntamento
export const NotesSheet = ({ rt, onClose }) => {
    const notes = toolsOf(rt.log.get()).notes, [t, setT] = useState(''), [sure, setSure] = useState(null);
    const add = async () => { const x = t.trim().slice(0, 300); if (!x) return; await rt.log.update((l) => { toolsOf(l).notes.push({ t: x, at: Date.now() }); }); setT(''); };
    const del = async (i) => { setSure(null); await rt.log.update((l) => { toolsOf(l).notes.splice(i, 1); }); };
    return (
        <Shell title="Appunti" onClose={onClose}>
            {notes.map((n, i) => sure === i
                ? <div className="pt-todo is-sure" key={n.at + '-' + i} role="alertdialog" aria-label="Elimina appunto"><span>Eliminare l'appunto? Non si può annullare.</span><div className="pt-todo-c"><button type="button" className="pt-todo-y" onClick={() => del(i)}>Elimina</button><button type="button" className="pt-todo-n" onClick={() => setSure(null)}>Annulla</button></div></div>
                : <div className="pt-todo" key={n.at + '-' + i}><span>{n.t}</span><button type="button" className="pt-todo-x" aria-label="Togli" onClick={() => setSure(i)}><Icon name="close" size={16} /></button></div>)}
            <div className="pt-ns">
                <textarea className="pt-input pt-todo-in" rows={2} maxLength={300} placeholder="Per la prossima visita…" aria-label="Appunto" value={t} onChange={(e) => setT(e.target.value)} />
                <button type="button" className="pt-note-send" aria-label="Aggiungi" disabled={!t.trim()} onClick={add}><Icon name="send" size={20} /></button>
            </div>
        </Shell>
    );
};

// Lista della spesa: media giornaliera degli alimenti della dieta, per i giorni e le persone scelti
export const shopItems = (docs, get, days = 7, people = 1) => {
    const out = [];
    for (const m of docs.filter((d) => d.kind === 'diet')) {
        const map = new Map(), doc = get(m.docId), gs = arr(doc && doc.body && doc.body.giorni), n = Math.max(1, gs.length);
        gs.forEach((g) => arr(g.pasti).forEach((p) => arr(p.voci).forEach((v) => map.set(v.n, (map.get(v.n) || 0) + (v.g || 0) / n))));
        out.push(...[...map].sort((a, b) => a[0].localeCompare(b[0], 'it')).map(([nm, g]) => ({ k: m.docId + '|' + nm, n: nm, g: Math.max(10, Math.ceil(g * days * people / 10) * 10) })));
        break;
    }
    return out;
};
const qty = (g) => (g >= 1000 ? String(Math.round(g / 100) / 10).replace('.', ',') + ' kg' : g + ' g');
const eur = (n) => '€ ' + n.toFixed(2).replace('.', ',');
const words = (t) => String(t || '').toLowerCase().split(/[^a-zàèéìòù]+/).filter((w) => w.length >= 3);
const guess = (name, items) => { const w = words(name); let b = null, bs = 0; items.forEach((x) => { const sc = words(x.n).filter((y) => w.some((z) => z.startsWith(y.slice(0, 4)) || y.startsWith(z.slice(0, 4)))).length; if (sc > bs) { bs = sc; b = x.k; } }); return b; };

// Lettura del codice: fotocamera, oppure il numero scritto a mano
export const Scan = ({ onCode, onBack }) => {
    const video = useRef(null), stop = useRef(null), [err, setErr] = useState(''), [man, setMan] = useState(false), [txt, setTxt] = useState('');
    useEffect(() => {
        let dead = false;
        startBarcode(video.current, onCode).then((f) => { if (dead) f(); else stop.current = f; }).catch(() => { if (!dead) { setErr('Non riesco ad aprire la fotocamera.'); setMan(true); } });
        return () => { dead = true; if (stop.current) stop.current(); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <div className="pt-sc2">
            <div className="pt-sc2-v"><video ref={video} muted playsInline /><i /></div>
            {err && <p className="pt-muted">{err}</p>}
            {!man ? <button type="button" className="pt-link" onClick={() => setMan(true)}>Scrivi il numero</button>
                : <div className="pt-sc2-m"><input className="pt-input" inputMode="numeric" aria-label="Codice a barre" placeholder="Codice a barre" maxLength={14} value={txt} onChange={(e) => setTxt(e.target.value.replace(/\D/g, ''))} /><button type="button" className="pt-cta" disabled={!validEan(txt)} onClick={() => onCode(txt)}>Cerca</button></div>}
        </div>
    );
};

// Tutto quello che il catalogo sa del prodotto, sotto la parte compilata dal cliente (solo lettura)
const NS = { A: 'Qualità nutrizionale ottima', B: 'Qualità nutrizionale buona', C: 'Qualità nutrizionale media', D: 'Qualità nutrizionale scarsa', E: 'Qualità nutrizionale ridotta' };
const GS = { A: 'Impatto ambientale molto basso', B: 'Impatto ambientale basso', C: 'Impatto ambientale moderato', D: 'Impatto ambientale elevato', E: 'Impatto ambientale molto elevato' };
// Loghi ufficiali (Nutri-Score, Green-Score, impronta forestale): scala di lettere con quella del prodotto ingrandita, colori universali
const Logo = ({ kind, v, text, letters = 'ABCDE' }) => (
    <div className={'pt-lg pt-lg-' + kind}>
        <div className="pt-lg-l" role="img" aria-label={text + ' ' + v}>
            <em>{kind === 'ns' ? 'NUTRI-SCORE' : kind === 'gs' ? 'GREEN-SCORE' : 'IMPRONTA FORESTALE'}</em>
            <div>{letters.split('').map((c) => <b key={c} className={'pt-lg-' + c.toLowerCase() + (c === v ? ' is-on' : '')}>{c}</b>)}</div>
        </div>
        <span>{text}</span>
    </div>
);
const Facts = ({ i }) => {
    const f = i.info, v = (x, u) => (x == null ? null : String(x).replace('.', ',') + (u || ''));
    const rows = [['Grassi', v(f.fat, ' g')], ['di cui saturi', v(f.sat, ' g')], ['Carboidrati', v(f.carb, ' g')], ['di cui zuccheri', v(f.sug, ' g')], ['Fibre', v(f.fib, ' g')], ['Proteine', v(f.pro, ' g')], ['Sale', v(f.salt, ' g')]].filter((r) => r[1]);
    const top = [i.brand, f.qty, f.cat].filter(Boolean);
    return (
        <div className="pt-pf-i">
            <h3>Scheda prodotto</h3>
            {(top.length > 0 || f.nova > 0) && <div className="pt-pf-h">{top.map((x) => <span key={x}>{x}</span>)}{f.nova > 0 && <span>NOVA {f.nova}</span>}</div>}
            {f.ns && <Logo kind="ns" v={f.ns} text={NS[f.ns]} />}
            {(i.kcal != null || rows.length > 0) && <dl><div className="is-k"><dt>Energia · 100 g</dt><dd>{i.kcal != null ? i.kcal + ' kcal' : '—'}</dd></div>{rows.map((r) => <div key={r[0]} className={r[0].startsWith('di cui') ? 'is-s' : ''}><dt>{r[0]}</dt><dd>{r[1]}</dd></div>)}</dl>}
            {f.green && <Logo kind="gs" v={f.green} text={GS[f.green]} />}
            {f.forest && <Logo kind="ff" v={f.forest} text="Impronta forestale" letters="ABCD" />}
            {(f.co2 != null || f.palm || f.pack.length > 0) && <div className="pt-pf-e">
                {f.co2 != null && <div className="pt-pf-e1"><Icon name="cloud" size={20} /><span>{String(f.co2).replace('.', ',')} g CO₂ ogni 100 g<small>≈ {(f.co2 / 190).toFixed(1).replace('.', ',')} km in auto a benzina</small></span></div>}
                {f.palm && <div className="pt-pf-e1"><Icon name="drop" size={20} /><span>Contiene olio di palma</span></div>}
                
                {f.pack.length > 0 && <div className="pt-pf-e1"><Icon name="box" size={20} /><span>Imballaggio<small>{f.pack.join(' — ')}</small></span></div>}
            </div>}
            {f.ing && <section><h4>Ingredienti</h4><p>{f.ing}</p></section>}
            {f.all.length > 0 && <section><h4>Allergeni</h4><p>{f.all.join(', ')}</p></section>}
            {f.orig && <section><h4>Origine</h4><p>{f.orig}</p></section>}
        </div>
    );
};

// Prodotto trovato (o da compilare a mano): prezzo e negozio li scrive il cliente; il prezzo vale per la confezione
const PriceForm = ({ init, items, stores, pick, setPick, onSave, onScan }) => {
    const [name, setName] = useState(init.name), [g, setG] = useState(init.g ? String(init.g) : ''), [price, setPrice] = useState(init.price || ''), [store, setStore] = useState(init.store || stores[0] || ''), [key, setKey] = useState(() => init.k || guess(init.name, items) || '');
    const num = (v) => parseFloat(String(v).replace(',', '.')), ok = name.trim() && num(price) > 0 && (!key || num(g) > 0);   // il peso serve solo per la stima della voce
    if (pick) return (
        <div className="pt-pf">
            <button type="button" className={'pt-pf-o' + (!key ? ' is-on' : '')} onClick={() => { setKey(''); setPick(false); }}><span><Icon name="check" size={18} /></span><b>Fuori lista</b></button>
            {[...items].sort((a, b) => a.n.localeCompare(b.n, 'it')).map((x) => <button key={x.k} type="button" className={'pt-pf-o' + (x.k === key ? ' is-on' : '')} onClick={() => { setKey(x.k); setPick(false); }}><span><Icon name="check" size={18} /></span><b>{x.n}</b></button>)}
        </div>
    );
    return (
        <div className="pt-pf">
            {init.miss && <p className="pt-muted">Non lo trovo: compila a mano.</p>}
            <label className="pt-pf-f"><small>Prodotto</small><input className="pt-input" aria-label="Prodotto" placeholder="Prodotto" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
            {!init.ean && <button type="button" className="pt-pf-k" onClick={() => onScan(key, { name, g, price, store })}><Icon name="barcode" size={20} /><b>Leggi il codice a barre</b></button>}
            <div className="pt-pf-r">
                <label className="pt-pf-f"><small>Prezzo €</small><input className="pt-input" inputMode="decimal" aria-label="Prezzo in euro" placeholder="0,00" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
                <label className="pt-pf-f"><small>Peso g</small><input className="pt-input" inputMode="decimal" aria-label="Peso della confezione in grammi" placeholder="0" value={g} onChange={(e) => setG(e.target.value)} /></label>
            </div>
            {num(price) > 0 && num(g) > 0 && <p className="pt-pf-kg"><b>{eur(num(price) / num(g) * 1000)}</b> / kg</p>}
            <label className="pt-pf-f"><small>Negozio</small><input className="pt-input" aria-label="Negozio" placeholder="Negozio" maxLength={40} value={store} onChange={(e) => setStore(e.target.value)} /></label>
            {stores.length > 1 && <div className="pt-pf-s">{stores.map((x) => <button key={x} type="button" className={x === store ? 'is-on' : ''} onClick={() => setStore(x)}>{x}</button>)}</div>}
            <small className="pt-pf-c">Voce della lista</small>
            <button type="button" className="pt-pf-k" aria-label="Voce della lista" onClick={() => setPick(true)}><Icon name="cart" size={20} /><b>{(items.find((x) => x.k === key) || {}).n || 'Fuori lista'}</b><Icon name="chev" size={18} /></button>
            <button type="button" className="pt-cta" disabled={!ok} onClick={() => onSave(key, { ean: init.ean || '', name: name.trim(), store: store.trim(), price: Math.round(num(price) * 100) / 100, g: Math.round(num(g) || 0), prod: init.ean && init.kcal != null ? { ean: init.ean, n: name.trim().slice(0, 80), br: init.brand || '', kcal: init.kcal, p: (init.info && init.info.pro) || 0, c: (init.info && init.info.carb) || 0, f: (init.info && init.info.fat) || 0 } : null })}>Salva</button>
            {init.info && <Facts i={init} />}
        </div>
    );
};

// Registro degli acquisti: cosa hai comprato, dove e quanto hai speso (anche fuori lista); la stima del piano è solo sulle voci con prezzo
const Buys = ({ buys, est, cover, onDel, onBack }) => {
    const [sure, setSure] = useState(null), spent = buys.reduce((t, b) => t + (b.price || 0), 0);
    const day = (at) => new Date(at).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' });
    return (
        <div className="pt-by">
            <div className="pt-shop-t is-static"><b>{eur(spent)}</b><span>{buys.length}</span></div>
            {est > 0 && <p className="pt-by-e"><Icon name="cart" size={16} />{eur(est)}<span>{cover}</span></p>}
            {buys.map((b) => sure === b.id
                ? <div className="pt-todo is-sure" key={b.id} role="alertdialog" aria-label="Elimina acquisto"><span>Eliminare l'acquisto? Non si può annullare.</span><div className="pt-todo-c"><button type="button" className="pt-todo-y" onClick={() => { setSure(null); onDel(b.id); }}>Elimina</button><button type="button" className="pt-todo-n" onClick={() => setSure(null)}>Annulla</button></div></div>
                : <div className="pt-by-r" key={b.id}><div><b>{b.name}</b><small>{[b.store, day(b.at)].filter(Boolean).join(' · ')}</small></div><em>{eur(b.price)}</em><button type="button" className="pt-todo-x" aria-label="Togli" onClick={() => setSure(b.id)}><Icon name="close" size={16} /></button></div>)}
        </div>
    );
};

export const ShopSheet = ({ rt, docs, onClose }) => {
    const tl = toolsOf(rt.log.get()), cfg = tl.cfg, shop = tl.shop, buys = arr(tl.buys), stores = arr(tl.stores);
    const items = shopItems(docs, rt.docs.get, cfg.days, cfg.people);
    // Riordino ritardato: la riga spuntata resta dov'è per 250 ms, poi scende in fondo con una dissolvenza
    const [pick, setPick] = useState(false), [want, setWant] = useState(''), [ask, setAsk] = useState(null), [back, setBack] = useState(null), [lag, setLag] = useState(null), tm = useRef(0), [view, setView] = useState(null);   // view: null | 'scan' | 'load' | { form }
    useEffect(() => () => clearTimeout(tm.current), []);
    const setCfg = async (patch) => { await rt.log.update((l) => { Object.assign(toolsOf(l).cfg, patch); }); };
    const tog = async (k) => {
        setAsk(shop[k] ? null : items.find((x) => x.k === k) || null);
        setLag(k); clearTimeout(tm.current); tm.current = setTimeout(() => setLag(null), 250);
        await rt.log.update((l) => { const s = toolsOf(l).shop; if (s[k]) delete s[k]; else s[k] = 1; });
    };
    const found = async (code) => { setView('load'); const p = await lookupEan(code), d = back ? { price: back.form.price, store: back.form.store } : {}; setBack(null); setView({ form: { ...(p || { ean: code, name: '', g: 0, miss: true }), ...d, k: want } }); };
    const leave = () => { setView(back); setBack(null); };
    // ogni acquisto va nel registro; se corrisponde a una voce della lista, quella risulta anche presa
    const savePrice = async (k, rec) => {
        const { prod, ...buy } = rec;
        await rt.log.update((l) => {
            const t = toolsOf(l); t.buys = [{ id: Date.now(), k, ...buy, at: Date.now() }, ...arr(t.buys)].slice(0, 300);
            // il prodotto entra negli alimenti dell'app; se è collegato a una voce della dieta, quella parte da lui
            if (prod) { t.prods[prod.ean] = prod; if (Object.keys(t.prods).length > 200) delete t.prods[Object.keys(t.prods)[0]]; if (k) t.links[k.split('|').slice(1).join('|')] = prod.ean; }
            if (k) t.shop[k] = 1;
            if (rec.store) t.stores = [rec.store, ...arr(t.stores).filter((x) => x !== rec.store)].slice(0, 5);
        });
        setView(null); setPick(false);
    };
    const delBuy = async (id) => { await rt.log.update((l) => { const t = toolsOf(l); t.buys = arr(t.buys).filter((b) => b.id !== id); }); };
    const taken = items.filter((x) => shop[x.k]).length, all = taken === items.length && items.length > 0;
    const on = (x) => (lag === x.k ? !shop[x.k] : !!shop[x.k]);
    const rows = [...items].sort((a, b) => (on(a) - on(b)) || a.n.localeCompare(b.n, 'it'));
    const cost = (x) => { const p = buys.find((b) => b.k === x.k && b.g > 0); return p ? (x.g * p.price) / p.g : null; };   // ultimo prezzo registrato per la voce
    const priced = items.filter((x) => cost(x) !== null), total = priced.reduce((t, x) => t + cost(x), 0);
    const extra = items.length ? (all ? <em className="pt-sh-k is-all"><Icon name="check" size={14} />{taken}/{items.length}</em> : <em className="pt-sh-k is-n">{taken}/{items.length}</em>) : null;
    return (
        <Shell title={pick ? 'Voce della lista' : 'Spesa'} extra={view ? null : extra} onClose={onClose} onBack={pick ? () => setPick(false) : view === 'scan' ? leave : view && view !== 'load' ? () => setView(null) : undefined}>
            {view === 'scan' ? <Scan onCode={found} onBack={leave} />
                : view === 'load' ? <p className="pt-muted pt-sc2-l" role="status">Cerco il prodotto…</p>
                : view === 'buys' ? <Buys buys={buys} est={total} cover={priced.length + '/' + items.length} onDel={delBuy} onBack={() => setView(null)} />
                : view && view.form ? <PriceForm init={view.form} items={items} stores={stores} pick={pick} setPick={setPick} onSave={savePrice} onScan={(k, d) => { setWant(k); setBack({ form: { ...view.form, ...d, k } }); setView('scan'); }} />
                : items.length === 0 ? <p className="pt-muted">Quando riceverai la dieta, qui troverai gli alimenti da comprare.</p> : <>
                    <div className="pt-shop-r">
                        <span><Icon name="calendar" size={18} /><Step dark value={cfg.days} onChange={(v) => setCfg({ days: v })} step={1} min={1} max={30} label="Per quanti giorni" /></span>
                        <span><Icon name="user" size={18} /><Step dark value={cfg.people} onChange={(v) => setCfg({ people: v })} step={1} min={1} max={8} label="Per quante persone" /></span>
                        <button type="button" className="pt-round pt-shop-bc" aria-label="Leggi il codice a barre" onClick={() => { setWant(''); setView('scan'); }}><Icon name="barcode" size={22} /></button>
                    </div>
                    {buys.length > 0 && <button type="button" className="pt-shop-t" aria-label="Acquisti" onClick={() => setView('buys')}><b>{eur(buys.reduce((t, b) => t + (b.price || 0), 0))}</b><span>{buys.length}</span><Icon name="chev" size={18} /></button>}
                    {ask && <div className="pt-todo is-sure pt-shop-ask" role="alertdialog" aria-label="Registra l'acquisto"><span><b>{ask.n}</b> Registrare peso e prezzo?</span><div className="pt-todo-c"><button type="button" className="pt-todo-y" onClick={() => { setView({ form: { ean: '', name: ask.n, g: ask.g, k: ask.k } }); setAsk(null); }}>Sì</button><button type="button" className="pt-todo-n" onClick={() => setAsk(null)}>No</button></div></div>}
                    {rows.map((x) => { const c = cost(x); return <div key={x.k} className={'pt-shop' + (shop[x.k] ? ' is-on' : '') + (lag === x.k ? ' is-lag' : '')}><button type="button" className="pt-shop-m" onClick={() => tog(x.k)}><span className="pt-shop-c"><Icon name="check" size={18} /></span><b>{x.n}</b><span className="pt-shop-q"><small>{qty(x.g)}</small>{c !== null && <em>{eur(c)}</em>}</span></button><button type="button" className="pt-shop-sc" aria-label={'Leggi il codice a barre: ' + x.n} onClick={() => { setWant(x.k); setView('scan'); }}><Icon name="barcode" size={20} /></button></div>; })}
                    <button type="button" className="pt-add" aria-label="Aggiungi un acquisto fuori lista" onClick={() => setView({ form: { ean: '', name: '', g: 0, k: '' } })}><Icon name="plus" size={20} /></button>
                </>}
        </Shell>
    );
};
