import React, { useEffect, useRef, useState } from 'react';
import { Icon, Sheet, Step } from './bits.jsx';
import { arr, ymd, toolsOf } from './logic.js';

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
    const notes = toolsOf(rt.log.get()).notes, [t, setT] = useState('');
    const add = async () => { const x = t.trim().slice(0, 300); if (!x) return; await rt.log.update((l) => { toolsOf(l).notes.push({ t: x, at: Date.now() }); }); setT(''); };
    const del = async (i) => { await rt.log.update((l) => { toolsOf(l).notes.splice(i, 1); }); };
    return (
        <Shell title="Appunti" onClose={onClose}>
            {notes.map((n, i) => <div className="pt-todo" key={n.at + '-' + i}><span>{n.t}</span><button type="button" className="pt-todo-x" aria-label="Togli" onClick={() => del(i)}><Icon name="close" size={16} /></button></div>)}
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
export const ShopSheet = ({ rt, docs, onClose }) => {
    const tl = toolsOf(rt.log.get()), cfg = tl.cfg, shop = tl.shop;
    const items = shopItems(docs, rt.docs.get, cfg.days, cfg.people);
    // Riordino ritardato: la riga spuntata resta dov'è per 250 ms, poi scende in fondo con una dissolvenza
    const [lag, setLag] = useState(null), tm = useRef(0);
    useEffect(() => () => clearTimeout(tm.current), []);
    const setCfg = async (patch) => { await rt.log.update((l) => { Object.assign(toolsOf(l).cfg, patch); }); };
    const tog = async (k) => {
        setLag(k); clearTimeout(tm.current); tm.current = setTimeout(() => setLag(null), 250);
        await rt.log.update((l) => { const s = toolsOf(l).shop; if (s[k]) delete s[k]; else s[k] = 1; });
    };
    const taken = items.filter((x) => shop[x.k]).length, all = taken === items.length && items.length > 0;
    const on = (x) => (lag === x.k ? !shop[x.k] : !!shop[x.k]);
    const rows = [...items].sort((a, b) => (on(a) - on(b)) || a.n.localeCompare(b.n, 'it'));
    const extra = items.length ? (all ? <em className="pt-sh-k is-all"><Icon name="check" size={14} />{taken}/{items.length}</em> : <em className="pt-sh-k">{taken}/{items.length}</em>) : null;
    return (
        <Shell title="Spesa" extra={extra} onClose={onClose}>
            {items.length === 0 ? <p className="pt-muted">Quando riceverai la dieta, qui troverai gli alimenti da comprare.</p> : <>
                <div className="pt-shop-r">
                    <span><Icon name="calendar" size={18} /><Step dark value={cfg.days} onChange={(v) => setCfg({ days: v })} step={1} min={1} max={30} label="Per quanti giorni" /></span>
                    <span><Icon name="user" size={18} /><Step dark value={cfg.people} onChange={(v) => setCfg({ people: v })} step={1} min={1} max={8} label="Per quante persone" /></span>
                </div>
                {rows.map((x) => <button key={x.k} type="button" className={'pt-shop' + (shop[x.k] ? ' is-on' : '') + (lag === x.k ? ' is-lag' : '')} onClick={() => tog(x.k)}><span className="pt-shop-c"><Icon name="check" size={18} /></span><b>{x.n}</b><small>{qty(x.g)}</small></button>)}
            </>}
        </Shell>
    );
};
