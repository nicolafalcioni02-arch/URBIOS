import React, { useState } from 'react';
import { Icon, Lst, Count } from './bits.jsx';
import { Ring } from './Schede.jsx';
import { KcalWeek, MealsWeek } from './Progress.jsx';
import { arr, mealKcal, mealKey, ymd, fmtDay, dietDayToday, toolsOf, dayMacros } from './logic.js';


const lastDays = (n) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return ymd(d.getTime()); });
const dayLabel = (dt) => { const s = new Date(dt + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
const dayName = (t) => { const x = String(t || '').replace(/^giorno\s+/i, '').trim(); return x ? x.charAt(0).toUpperCase() + x.slice(1) : t; };
const dayKcal = (log, dt) => Object.entries(log.meals).filter(([k]) => k.endsWith('|' + dt)).reduce((s, [, r]) => s + (r.kcal || 0), 0) + arr(log.extras[dt]).reduce((s, x) => s + (x.kcal || 0), 0);
// Calendario del mese: i giorni con qualcosa di registrato sono in lime, toccando un giorno si apre per correggerlo
const Cal = ({ log, off, setOff, onPick, docId, total }) => {
    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off);
    const y = base.getFullYear(), m = base.getMonth(), first = (base.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(), today = ymd();
    const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
    const title = base.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    return (
        <div className="pt-cal">
            <div className="pt-cal-h"><button type="button" aria-label="Mese prima" onClick={() => setOff(off - 1)}><Icon name="back" size={18} /></button><b>{title.charAt(0).toUpperCase() + title.slice(1)}</b><button type="button" aria-label="Mese dopo" disabled={off >= 0} onClick={() => setOff(off + 1)} style={{ transform: 'rotate(180deg)' }}><Icon name="back" size={18} /></button></div>
            <div className="pt-cal-g">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((x, i) => <span key={i} className="pt-cal-w">{x}</span>)}
                {cells.map((d, i) => { if (!d) return <span key={i} />; const dt = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const n = Object.keys(log.meals).filter((k) => k.startsWith(docId + '|') && k.endsWith('|' + dt)).length, fut = dt > today, full = total > 0 && n >= total, part = !full && (n > 0 || arr(log.extras[dt]).length > 0); return <button key={i} type="button" disabled={fut} className={(full ? 'has ' : '') + (part ? 'part ' : '') + (dt === today ? 'now' : '')} style={part ? { '--p': Math.max(.15, total ? n / total : .15) } : undefined} onClick={() => onPick(dt)}>{d}</button>; })}
            </div>
        </div>
    );
};
const SH = ['#B4E600', '#6B3DFF', '#FF7A59'];
const share = (c, p, f) => { const a = [c * 4, p * 4, f * 9], t = a.reduce((x, y) => x + y, 0) || 1; return a.map((v) => Math.round(v / t * 100)); };
// Ripartizione delle calorie tra carboidrati, proteine e grassi (4-4-9 kcal/g)
const MacroDonut = ({ c, p, f }) => {
    const parts = [['Carboidrati', c * 4], ['Proteine', p * 4], ['Grassi', f * 9]], tot = parts.reduce((s, x) => s + x[1], 0) || 1;
    let acc = 0;
    return (
        <div className="pt-dn">
            <svg viewBox="0 0 120 120" aria-hidden="true"><g>{parts.map(([n, v], i) => { const len = v / tot * 100, off = -acc; acc += len; return <circle key={n} cx="60" cy="60" r="42" fill="none" stroke={SH[i]} strokeWidth="24" pathLength="100" strokeDasharray={`${Math.max(0, len - 1)} ${100 - Math.max(0, len - 1)}`} strokeDashoffset={off} transform="rotate(-90 60 60)" />; })}</g></svg>
        </div>
    );
};
// Calorie per pasto: previste e già registrate
const MealBars = ({ rows }) => {
    const max = Math.max(1, ...rows.map((r) => r.plan));
    return <div className="pt-mb">{rows.map((r) => <div key={r.n}><span>{r.n}<em>{r.eaten > 0 ? `${r.eaten} / ${r.plan}` : r.plan}</em></span><i><u style={{ width: r.plan / max * 100 + '%' }}><s style={{ width: Math.min(100, r.plan ? r.eaten / r.plan * 100 : 0) + '%' }} /></u></i></div>)}</div>;
};

const Extras = ({ rt, date }) => {
    const l = arr(rt.log.get().extras[date]);
    if (!l.length) return null;
    const del = (i) => rt.log.update((r) => { r.extras[date] = arr(r.extras[date]).filter((_, j) => j !== i); });
    return <div className="pt-xt"><b>Fuori piano</b>{l.map((x, i) => <div key={i}><span><b>{x.n}{x.g ? ` (${x.g} g)` : ''}</b><small>{x.when || 'Fuori pasto'}</small></span><em>{x.kcal} kcal</em><button type="button" aria-label="Togli" onClick={() => del(i)}><Icon name="close" size={16} /></button></div>)}</div>;
};

// Dieta del giorno. Il diario dei pasti resta sul telefono: il professionista non lo riceve.
export const Nutrition = ({ rt, id, onMeal, onExtra }) => {
    const docs = rt.docs.list().filter((d) => d.kind === 'diet');
    const [cur, setCur] = useState(id || (docs[0] && docs[0].docId)), [di0, setDi] = useState(null), [info, setInfo] = useState(false), [hist, setHist] = useState(false), [hd, setHd] = useState(null), [hdi, setHdi] = useState(0), [cm, setCm] = useState(0);
    const doc = cur && rt.docs.get(cur);
    if (!doc || !doc.body) return <><header className="pt-top"><b className="pt-hi">Nutrizione</b></header><div className="pt-empty">Nessuna dieta ricevuta ancora.</div></>;
    const days = arr(doc.body.giorni), log = rt.log.get(), date = ymd(), di = di0 ?? dietDayToday(log, cur, days), day = days[Math.min(di, days.length - 1)], meals = arr(day.pasti);
    const o = doc.body.obiettivo, target = (o && o.kcal) || meals.reduce((t, m) => t + mealKcal(m), 0), eaten = dayKcal(log, date);
    const tl = toolsOf(log), dm = dayMacros(log, date);
    const pct = target ? Math.min(100, Math.round(eaten / target * 100)) : 0;
    return (
        <div className="pt-sp">
            <div className="pt-sp-top">
                <div className="pt-sp-list">
                    <div className="pt-sc is-static pt-nh" style={{ background: '#FF7A59', color: '#0B0C0E' }}>
                        {(() => { const inner = <><Ring pct={pct / 100} ink="#0B0C0E" /><span className="pt-sc-t"><b><Count n={eaten} /> / {target}</b> <small>kcal</small></span></>; return o ? <button type="button" className="pt-nh-l" aria-label="La tua alimentazione" onClick={() => setInfo(true)}>{inner}</button> : <div className="pt-nh-l">{inner}</div>; })()}
                        <span className="pt-nh-r">
                            <button type="button" aria-label="Storico" onClick={() => setHist(true)}><Icon name="calendar" size={20} /></button>
                            {o && <button type="button" aria-label="La tua alimentazione" onClick={() => setInfo(true)}><Icon name="chart" size={20} /></button>}
                            <button type="button" aria-label="Fuori piano" onClick={() => onExtra({ names: meals.map((m) => m.nome) })}><Icon name="plus" size={20} /></button>
                        </span>
                    </div>
                </div>
            </div>
            <div className="pt-sp-bot pt-td-bot"><svg className="pt-td-wave" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30V15C40 -3 90 -3 135 13S230 31 275 14 360 -2 400 12V30Z" fill="#fff" /></svg><div className="pt-sp-scroll">
                {docs.length > 1 && <div className="pt-seg3">{docs.map((x, i) => <button key={x.docId} type="button" className={x.docId === cur ? 'is-on' : ''} onClick={() => { setCur(x.docId); setDi(null); }}>Dieta {i + 1}</button>)}</div>}
                {days.length > 1 && <div className="pt-seg3">{days.map((x, i) => <button key={i} type="button" className={i === di ? 'is-on' : ''} onClick={() => { setDi(i); rt.log.update((l) => { toolsOf(l).dietDay = { date: ymd(), docId: cur, d: i }; }); }}>{dayName(x.titolo)}</button>)}</div>}
                {dm.n > 0 && <div className="pt-mm" aria-label="Macro dei prodotti di oggi"><span><b>{Math.round(dm.p)}</b> g proteine</span><span><b>{Math.round(dm.c)}</b> g carboidrati</span><span><b>{Math.round(dm.f)}</b> g grassi</span></div>}
                {meals.map((m, i) => {
                    const rec = log.meals[mealKey(cur, di, i, date)];
                    return (
                        <button key={i} type="button" className={'pt-ml' + (rec ? ' is-done' : '')} onClick={() => onMeal({ docId: cur, d: di, m: i })}>
                            <span className="pt-ml-t"><b>{m.nome}</b><small>{(rec && rec.list ? rec.list.map((v) => v.n) : arr(m.voci).map((v) => { const pr = tl.prods[tl.links[v.n]]; return pr ? pr.n : v.n; })).join(', ')}</small></span>
                            <span className="pt-ml-k"><b>{rec ? rec.kcal : mealKcal(m)}</b> <small>kcal</small></span>
                            <span className={'pt-ml-ck' + (rec ? ' is-on' : '')}><Icon name={rec ? 'check' : 'plus'} size={18} /></span>
                        </button>
                    );
                })}
                <Extras rt={rt} date={date} />
                <div className="pg pg-lt"><MealsWeek log={log} docId={cur} total={meals.length} /></div>
            </div></div>
            {hist && (
                <Lst title={hd ? dayLabel(hd) : 'Storico'} onClose={() => { setHist(false); setHd(null); }} xLabel={hd ? 'Indietro' : 'Chiudi'} xIcon={hd ? 'back' : 'close'} onX={() => (hd ? setHd(null) : setHist(false))}>
                            {!hd && <Cal log={log} off={cm} setOff={setCm} docId={cur} total={meals.length} onPick={(dt) => { setHd(dt); setHdi(di); }} />}
                            {hd && <>
                                {days.length > 1 && <div className="pt-seg3 is-l">{days.map((x, i) => <button key={i} type="button" className={i === hdi ? 'is-on' : ''} onClick={() => setHdi(i)}>{x.titolo}</button>)}</div>}
                                {arr(days[Math.min(hdi, days.length - 1)].pasti).map((m, i) => { const rec = log.meals[mealKey(cur, hdi, i, hd)]; return (
                                    <button key={i} type="button" className="pt-lst-r" onClick={() => onMeal({ docId: cur, d: hdi, m: i, date: hd })}>
                                        <span className="pt-lst-t"><b>{m.nome}</b></span><span className="pt-lst-s">{rec ? rec.kcal + ' kcal' : ''}</span><span className={'pt-ml-ck' + (rec ? ' is-on' : '')}><Icon name={rec ? 'check' : 'plus'} size={18} /></span>
                                    </button>); })}
                                <Extras rt={rt} date={hd} />
                            </>}
                </Lst>
            )}
            {info && o && (
                <Lst title="Macro" label="La tua alimentazione" onClose={() => setInfo(false)}>
                            <div className="pt-tiles">
                                {(() => { const sh = share(o.c, o.p, o.f); return [['Carboidrati', o.c], ['Proteine', o.p], ['Grassi', o.f]].map(([n, g], i) => <div key={n}><b>{g} g <small>{sh[i]}%</small></b><span><u style={{ background: SH[i] }} />{n}</span></div>); })()}
                            </div>
                            <div className="pt-cd"><MacroDonut c={o.c} p={o.p} f={o.f} /></div>
                            <div className="pt-cd"><MealBars rows={meals.map((m, i) => { const rec = log.meals[mealKey(cur, di, i, date)]; return { n: m.nome, plan: mealKcal(m), eaten: rec ? rec.kcal : 0 }; })} /></div>
                            <div className="pg pg-lt"><KcalWeek log={log} goal={target} /></div>
                </Lst>
            )}
        </div>
    );
};
