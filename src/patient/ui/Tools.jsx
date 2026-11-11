import React, { useState } from 'react';
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
    return (
        <Shell title="Prossimo controllo" onClose={onClose}>
            <p className="pt-muted">Quando devi rivedere il professionista? Ti ricordo quanti giorni mancano.</p>
            <div className="pt-quick">{[['2 settimane', 14], ['1 mese', 30], ['2 mesi', 60], ['3 mesi', 90]].map(([l, n]) => <button key={l} type="button" onClick={() => save(addDays(n))}>Tra {l}</button>)}</div>
            <label className="pt-label">Oppure scegli la data<input className="pt-input" type="date" min={ymd()} value={d} onChange={(e) => setD(e.target.value)} /></label>
            <button type="button" className="pt-cta" disabled={!d} onClick={() => save(d)}>Salva</button>
            {cur && <button type="button" className="pt-link" onClick={() => save(null)}>Togli la data</button>}
        </Shell>
    );
};

// Cose da dire al professionista al prossimo appuntamento
export const NotesSheet = ({ rt, onClose }) => {
    const notes = toolsOf(rt.log.get()).notes, [t, setT] = useState('');
    const add = async () => { const x = t.trim().slice(0, 300); if (!x) return; await rt.log.update((l) => { toolsOf(l).notes.push({ t: x, at: Date.now() }); }); setT(''); };
    const del = async (i) => { await rt.log.update((l) => { toolsOf(l).notes.splice(i, 1); }); };
    return (
        <Shell title="Da dire al professionista" onClose={onClose}>
            <p className="pt-muted">Scrivi qui domande e cose da ricordare: restano solo sul tuo telefono, così le hai sotto mano alla prossima visita.</p>
            {notes.map((n, i) => <div className="pt-todo" key={n.at + '-' + i}><span>{n.t}</span><button type="button" onClick={() => del(i)}>Togli</button></div>)}
            <textarea className="pt-input pt-todo-in" rows={3} maxLength={300} placeholder="Scrivi qui…" value={t} onChange={(e) => setT(e.target.value)} />
            <button type="button" className="pt-cta" disabled={!t.trim()} onClick={add}>Aggiungi</button>
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
const Stepper = ({ label, value, set, min, max, unit }) => (
    <div className="pt-shop-s"><span>{label}</span>
        <Step dark value={value} onChange={set} step={1} min={min} max={max} text={`${value} ${unit(value)}`} label={label} />
    </div>
);
export const ShopSheet = ({ rt, docs, onClose }) => {
    const tl = toolsOf(rt.log.get()), cfg = tl.cfg, shop = tl.shop;
    const items = shopItems(docs, rt.docs.get, cfg.days, cfg.people);
    const setCfg = async (patch) => { await rt.log.update((l) => { Object.assign(toolsOf(l).cfg, patch); }); };
    const tog = async (k) => { await rt.log.update((l) => { const s = toolsOf(l).shop; if (s[k]) delete s[k]; else s[k] = 1; }); };
    const left = items.filter((x) => !shop[x.k]).length;
    return (
        <Shell title="Lista della spesa" onClose={onClose}>
            {items.length === 0 ? <p className="pt-muted">Quando riceverai la dieta, qui troverai gli alimenti da comprare.</p> : <>
                <Stepper label="Per quanti giorni" value={cfg.days} set={(v) => setCfg({ days: v })} min={1} max={30} unit={(v) => (v === 1 ? 'giorno' : 'giorni')} />
                <Stepper label="Per quante persone" value={cfg.people} set={(v) => setCfg({ people: v })} min={1} max={8} unit={(v) => (v === 1 ? 'persona' : 'persone')} />
                {items.map((x) => <button key={x.k} type="button" className={'pt-shop' + (shop[x.k] ? ' is-on' : '')} onClick={() => tog(x.k)}><span className="pt-shop-c"><Icon name="check" size={18} /></span><b>{x.n}</b><small>{qty(x.g)}</small></button>)}
                <div className={'pt-miss' + (left ? '' : ' is-ok')}>
                    <b>{left ? `Ti manca ancora ${left === 1 ? '1 cosa' : left + ' cose'}` : 'Hai preso tutto'}</b>
                    {left > 0 && <div>{items.filter((x) => !shop[x.k]).map((x) => <button key={x.k} type="button" onClick={() => tog(x.k)}>{x.n}</button>)}</div>}
                </div>
            </>}
        </Shell>
    );
};
