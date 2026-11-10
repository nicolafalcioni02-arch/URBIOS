import { Icon } from './bits.jsx';
import { Clamp } from './Clamp.jsx';
import React, { useState } from 'react';
import { arr, ymd, fmtKg, mealKey, eatenKcal, dayStatus, currentWeek } from './logic.js';

// Grafici minimal della pagina Progressi (tab Profilo): peso, kcal della settimana, costanza. Tutto dal diario del telefono, nessun asse.
const DAY = 86400000;
const dkey = (t) => ymd(t);
const mondayOf = (now) => { const d = new Date(now), dow = (d.getDay() + 6) % 7; return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime(); };

// Curva liscia (Catmull-Rom → Bézier) su punti già in coordinate
const smooth = (p) => p.reduce((s, [x, y], i) => {
    if (!i) return `M${x},${y}`;
    const [x0, y0] = p[i - 2] || p[i - 1], [x1, y1] = p[i - 1], [x3, y3] = p[i + 1] || [x, y];
    return `${s} C${x1 + (x - x0) / 6},${y1 + (y - y0) / 6} ${x - (x3 - x1) / 6},${y - (y3 - y1) / 6} ${x},${y}`;
}, '');

export const WeightTrend = ({ weights }) => {
    const w = arr(weights).filter((x) => Number.isFinite(x.kg)), [sel, setSel] = useState(null);
    if (!w.length) return <div className="pg-card"><span className="pg-k">Peso</span><p className="pg-empty">Registra il primo peso dalla Home.</p></div>;
    const last = w[w.length - 1], cur = sel !== null && w[sel] ? w[sel] : last;
    let delta = null;
    if (w.length >= 2) { const a = w[0], span = (new Date(last.date) - new Date(a.date)) / (7 * DAY); if (span > 0) delta = (last.kg - a.kg) / span; }
    const W = 300, H = 84, pad = 8, kgs = w.map((x) => x.kg), lo = Math.min(...kgs), hi = Math.max(...kgs), rng = hi - lo || 1;
    const t0 = +new Date(w[0].date), tn = +new Date(last.date) || t0 + 1, sp = tn - t0 || 1;
    const pts = w.map((x) => [pad + ((+new Date(x.date) - t0) / sp) * (W - pad * 2), H - pad - ((x.kg - lo) / rng) * (H - pad * 2)]);
    const pick = (e) => { const r = e.currentTarget.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * W; let b = 0; pts.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(pts[b][0] - x)) b = i; }); setSel(b); };
    return (
        <div className="pg-card">
            <span className="pg-k">Peso</span>
            <div className="pg-big"><b>{fmtKg(cur.kg)}</b><small>kg</small>{sel === null && delta !== null && <em className={delta <= 0 ? 'is-dn' : 'is-up'}>{delta > 0 ? '+' : '−'}{fmtKg(Math.abs(Math.round(delta * 10) / 10))} / sett.</em>}{sel !== null && <em>{cur.date.split('-').reverse().slice(0, 2).join('/')}</em>}</div>
            {w.length >= 3 ? (
                <svg viewBox={`0 0 ${W} ${H}`} className="pg-svg" role="img" aria-label="Andamento del peso" onPointerMove={(e) => e.buttons || e.pointerType === 'mouse' ? pick(e) : null} onPointerDown={pick} onPointerLeave={() => setSel(null)}>
                    <path d={smooth(pts)} className="pg-line" pathLength="100" />
                    {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={sel === i || (sel === null && i === pts.length - 1) ? 4.5 : 2} className={sel === i || (sel === null && i === pts.length - 1) ? 'pg-dot is-on' : 'pg-dot'} />)}
                </svg>
            ) : <p className="pg-empty">Con tre pesi compare la linea.</p>}
        </div>
    );
};

// kcal registrate per giorno (pasti + fuori piano)
const kcalOn = (log, date) => {
    let t = 0;
    for (const [k, r] of Object.entries(log.meals || {})) if (k.endsWith('|' + date)) t += r.kcal || 0;
    for (const x of arr((log.extras || {})[date])) t += x.kcal || 0;
    return Math.round(t);
};

export const KcalWeek = ({ log, goal, now = Date.now() }) => {
    const days = Array.from({ length: 7 }, (_, i) => { const t = mondayOf(now) + i * DAY, d = dkey(t); return { d, k: kcalOn(log, d), fut: d > dkey(now), lab: ['L', 'M', 'M', 'G', 'V', 'S', 'D'][i], today: d === dkey(now) }; });
    const logged = days.filter((x) => x.k > 0);
    if (!logged.length) return null;
    const top = Math.max(goal || 0, ...days.map((x) => x.k)) * 1.12, H = 80, avg = Math.round(logged.reduce((t, x) => t + x.k, 0) / logged.length);
    return (
        <div className="pg-card">
            <span className="pg-k">Kcal della settimana</span>
            <div className="pg-big"><b>{avg.toLocaleString('it-IT')}</b><small>media</small></div>
            <div className="pg-bars" style={{ height: H + 20 }}>
                {goal > 0 && <i className="pg-goal" style={{ bottom: 20 + (goal / top) * H }} />}
                {days.map((x) => <div key={x.d} className={'pg-bar' + (x.today ? ' is-today' : '')}><u className={goal && x.k > goal * 1.15 ? 'is-over' : ''} style={{ height: x.k ? Math.max(4, (x.k / top) * H) : 0 }} /><span>{x.lab}</span></div>)}
            </div>
        </div>
    );
};

// Quadratini: ultime 4 settimane, pieno = giorno con almeno una serie registrata
export const Streak = ({ log, now = Date.now() }) => {
    const trained = new Set();
    for (const k of Object.keys(log.sessions || {})) if (Object.values((log.sessions[k] && log.sessions[k].sets) || {}).some((a) => arr(a).length)) trained.add(k.split('|').pop());
    for (const list of Object.values(log.hist || {})) for (const h of arr(list)) if (arr(h.sets).length) trained.add(h.date);
    const start = mondayOf(now) - 21 * DAY, cells = Array.from({ length: 28 }, (_, i) => { const d = dkey(start + i * DAY); return { d, on: trained.has(d), fut: d > dkey(now), today: d === dkey(now) }; });
    const weeks = [0, 1, 2, 3].map((w) => cells.slice(w * 7, w * 7 + 7).filter((c) => c.on).length);
    let run = 0; for (let i = weeks.length - 1; i >= 0; i--) { if (weeks[i] > 0) run++; else if (i !== weeks.length - 1) break; }
    const n = cells.filter((c) => c.on).length;
    if (!n) return null;
    return (
        <div className="pg-card">
            <span className="pg-k">Costanza</span>
            <div className="pg-big"><b>{n}</b><small>allenamenti in 4 settimane</small></div>
            <div className="pg-grid" role="img" aria-label="Giorni di allenamento">{cells.map((c) => <i key={c.d} className={(c.on ? 'is-on ' : '') + (c.fut ? 'is-fut ' : '') + (c.today ? 'is-today' : '')} />)}</div>
            {run >= 2 && <p className="pg-note">{run} settimane di fila</p>}
        </div>
    );
};

export const Progress = ({ rt }) => {
    const log = rt.log.get(), diet = rt.docs.list().filter((d) => d.kind === 'diet').map((d) => rt.docs.get(d.docId)).find(Boolean);
    const goal = diet && diet.body && diet.body.obiettivo ? diet.body.obiettivo.kcal : 0;
    return <section className="pg"><WeightTrend weights={log.weights} /><Streak log={log} /><KcalWeek log={log} goal={goal} /></section>;
};

// «Oggi» (Home): tre anelli concentrici come un solo oggetto, a destra una riga per anello. Un solo colore, anelli distinti da raggio e intensità.
const SHADE = [1, .55, .28];
const Concentric = ({ rows, big }) => (
    <svg viewBox="0 0 96 96" width="76" height="76" aria-hidden="true">
        {rows.map((r, i) => { const R = big ? 45 - i * 7.5 : 42 - i * 12, C = 2 * Math.PI * R; return (
            <g key={r.k}><circle cx="48" cy="48" r={R} className="pg-rg-bg" /><circle cx="48" cy="48" r={R} className="pg-rg-fg" style={{ opacity: SHADE[i] * (big ? .6 : 1), '--c': C }} strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, Math.min(1, r.pct)))} transform="rotate(-90 48 48)" />{false && <g className="pg-rg-ic"><circle cx="48" cy={48 - R - .4} r="3" fill="#fff" fillOpacity=".55" /><g transform={`translate(${48 - 2.3} ${48 - R - 2.7})`} style={{ color: '#0B0C0E' }}><Icon name={r.ic} size={4.6} /></g></g>}</g>
        ); })}
    </svg>
);

const Day = () => { const d = new Date(), cap = (x) => x.charAt(0).toUpperCase() + x.slice(1); return (
    <div className="pg-day"><b>{d.getDate()}</b><span>{cap(d.toLocaleDateString('it-IT', { weekday: 'long' }))}</span><small>{cap(d.toLocaleDateString('it-IT', { month: 'long' }))}</small></div>
); };

export const Rings = ({ rt, big }) => {
    const log = rt.log.get(), docs = rt.docs.list(), today = ymd(), out = [];
    const tr = docs.filter((d) => d.kind === 'training').map((d) => ({ d, doc: rt.docs.get(d.docId) })).find((x) => x.doc && arr(x.doc.body && x.doc.body.settimane).length);
    if (tr) {
        const weeks = arr(tr.doc.body.settimane), w = currentWeek(log, tr.d.docId, weeks), days = arr(weeks[w].giorni), done = days.filter((day, i) => dayStatus(log, tr.d.docId, w, i, day).state === 'done').length;
        if (days.length) out.push({ k: 't', label: 'Allenamenti', pct: done / days.length, val: `${done}/${days.length}`, unit: 'giorni', ic: 'dumbbell' });
    }
    const dt = docs.filter((d) => d.kind === 'diet').map((d) => ({ d, doc: rt.docs.get(d.docId) })).find((x) => x.doc && x.doc.body && arr(x.doc.body.giorni).length);
    if (dt) {
        const day = arr(dt.doc.body.giorni)[0], pasti = arr(day && day.pasti), n = pasti.filter((_, m) => log.meals[mealKey(dt.d.docId, 0, m, today)]).length, goal = dt.doc.body.obiettivo && dt.doc.body.obiettivo.kcal;
        if (pasti.length) out.push({ k: 'p', label: 'Pasti', pct: n / pasti.length, val: `${n}/${pasti.length}`, unit: 'pasti', ic: 'fork' });
        if (goal > 0) { const e = eatenKcal(log, today, dt.d.docId, 0, pasti); out.push({ k: 'k', label: 'Kcal', pct: e / goal, val: Math.round(e).toLocaleString('it-IT') + '/' + Math.round(goal).toLocaleString('it-IT'), unit: 'kcal', ic: 'bolt' }); }
    }
    if (big) {
        return (
            <div>
                <div className="hm2-ring" role="img" aria-label="Il tuo giorno">
                    <Concentric big rows={[{ k: 'a', pct: .34 }, { k: 'b', pct: .74 }, { k: 'c', pct: .7 }]} />
                    <div className="hm2-day"><b>{new Date().getDate()}</b><span>{new Date().toLocaleDateString('it-IT', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase())}</span></div>
                </div>
            </div>
        );
    }
    return out.length ? (
        <div className="pg-rgs" role="group" aria-label="Oggi">
            <Concentric rows={out} />
            <ul>{out.map((r, i) => <li key={r.k}><u style={{ opacity: SHADE[i] }} /><span>{r.label}</span></li>)}</ul>
            <Day />
        </div>
    ) : null;
};

// ---- Forza ed esecuzione (tab Schede) ----
const fd = (d) => String(d || '').split('-').reverse().slice(0, 2).join('/');
const topKg = (h) => Math.max(0, ...arr(h.sets).map((s) => +s.kg).filter(Number.isFinite));

// Carichi: in alto la linea dell'esercizio scelto (i record sono punti pieni), sotto l'elenco: si tocca una riga per cambiare esercizio.
export const ExProgress = ({ hist }) => {
    const rows = Object.entries(hist || {}).map(([name, list]) => ({ name, pts: arr(list).filter((h) => arr(h.sets).length && topKg(h) > 0).sort((a, b) => a.date.localeCompare(b.date)).map((h) => ({ date: h.date, kg: topKg(h) })) }))
        .filter((r) => r.pts.length >= 2).sort((a, b) => b.pts[b.pts.length - 1].date.localeCompare(a.pts[a.pts.length - 1].date)).slice(0, 6);
    const [sel, setSel] = useState(null);
    if (!rows.length) return null;
    const cur = rows.find((r) => r.name === sel) || rows[0], p = cur.pts.slice(-10);
    let best = 0; const pr = cur.pts.map((x) => { const is = best && x.kg > best; if (x.kg > best) best = x.kg; return is; }).slice(-10);
    const W = 300, H = 84, pad = 10, lo = Math.min(...p.map((x) => x.kg)), hi = Math.max(...p.map((x) => x.kg)), rg = hi - lo || 1;
    const xy = p.map((x, i) => [pad + (i / (p.length - 1)) * (W - pad * 2), H - pad - ((x.kg - lo) / rg) * (H - pad * 2)]);
    const last = p[p.length - 1].kg, d = last - p[p.length - 2].kg;
    return (
        <div className="pg-card pg-ex">
            <span className="pg-k">{cur.name}</span>
            <div className="pg-big"><b>{fmtKg(last)}</b><small>kg</small><em>{d === 0 ? 'invariato' : (d > 0 ? '+' : '−') + fmtKg(Math.abs(d)) + ' kg'}</em></div>
            <svg key={cur.name} viewBox={`0 0 ${W} ${H}`} className="pg-svg" role="img" aria-label={'Carico ' + cur.name}>
                <path d={smooth(xy)} className="pg-line" pathLength="100" />
                {xy.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={pr[i] ? 5 : i === xy.length - 1 ? 4.5 : 2.5} className={pr[i] || i === xy.length - 1 ? 'pg-dot is-on' : 'pg-dot'} />)}
            </svg>
            <div className="pg-ex-l">{rows.map((r) => <button key={r.name} type="button" className={r.name === cur.name ? 'is-on' : ''} onClick={() => setSel(r.name)}>{r.name}</button>)}</div>
        </div>
    );
};

// Record: ogni volta che il carico massimo di un esercizio supera tutti i precedenti
export const Records = ({ hist }) => {
    const out = [];
    for (const [name, list] of Object.entries(hist || {})) {
        let best = 0;
        for (const h of arr(list).filter((x) => arr(x.sets).length).sort((a, b) => a.date.localeCompare(b.date))) { const k = topKg(h); if (best && k > best) out.push({ name, kg: k, date: h.date }); if (k > best) best = k; }
    }
    out.sort((a, b) => b.date.localeCompare(a.date));
    if (!out.length) return null;
    return (
        <div className="pg-card pg-pr">
            <span className="pg-k">Record</span>
            {out.slice(0, 4).map((r) => <div key={r.name + r.date} className="pg-pr-r"><u /><span className="pg-pr-n"><Clamp lines={2} title="Esercizio" text={r.name} /></span><b>{fmtKg(r.kg)} kg</b><small>{fd(r.date)}</small></div>)}
        </div>
    );
};

// Fatica: quota di serie leggere (RPE ≤ 7), buone (8) e dure (9-10) negli ultimi giorni
export const RpeMix = ({ hist, days = 30, now = Date.now() }) => {
    const from = ymd(now - (days - 1) * DAY), c = [0, 0, 0];
    for (const list of Object.values(hist || {})) for (const h of arr(list)) if (h.date >= from) for (const s of arr(h.sets)) { const r = +s.rpe; if (!Number.isFinite(r) || r <= 0) continue; c[r <= 7 ? 0 : r === 8 ? 1 : 2]++; }
    const t = c[0] + c[1] + c[2];
    if (t < 5) return null;
    return (
        <div className="pg-card pg-rpe">
            <span className="pg-k">Fatica</span>
            <div className="pg-rpe-bar" role="img" aria-label="Distribuzione RPE">{c.map((n, i) => n > 0 && <u key={i} className={'k' + i} style={{ flexGrow: n }} />)}</div>
            <div className="pg-rpe-l">{['≤ 7', '8', '9–10'].map((l, i) => <span key={l}><u className={'k' + i} />{l}<b>{Math.round((c[i] / t) * 100)}%</b></span>)}</div>
        </div>
    );
};

// Pasti registrati di ogni giorno della settimana: capsule che si riempiono
export const MealsWeek = ({ log, docId, total, now = Date.now() }) => {
    if (!total) return null;
    const days = Array.from({ length: 7 }, (_, i) => { const d = dkey(mondayOf(now) + i * DAY); let n = 0; for (const k of Object.keys(log.meals || {})) if (k.startsWith(docId + '|') && k.endsWith('|' + d)) n++; return { d, n: Math.min(total, n), today: d === dkey(now), lab: ['L', 'M', 'M', 'G', 'V', 'S', 'D'][i] }; });
    if (!days.some((x) => x.n)) return null;
    const done = days.reduce((t, x) => t + x.n, 0);
    return (
        <div className="pg-card">
            <span className="pg-k">Pasti registrati</span>
            <div className="pg-big"><b>{done}</b><small>questa settimana</small></div>
            <div className="pg-caps">{days.map((x) => <div key={x.d} className={x.today ? 'is-today' : ''}><i><u style={{ height: (x.n / total) * 100 + '%' }} /></i><span>{x.lab}</span></div>)}</div>
        </div>
    );
};
