import React, { useState } from 'react';
import { Icon, Lst } from './bits.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Ring } from './Schede.jsx';
import { KcalWeek, MealsWeek } from './Progress.jsx';
import { arr, mealKcal, mealKey, ymd, fmtDay, dietDayToday, toolsOf } from './logic.js';


const lastDays = (n) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return ymd(d.getTime()); });
const dayLabel = (dt) => { const s = new Date(dt + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
const dayKcal = (log, dt) => Object.entries(log.meals).filter(([k]) => k.endsWith('|' + dt)).reduce((s, [, r]) => s + (r.kcal || 0), 0) + arr(log.extras[dt]).reduce((s, x) => s + (x.kcal || 0), 0);
// Calendario del mese: i giorni con qualcosa di registrato sono in lime, toccando un giorno si apre per correggerlo
const Cal = ({ log, off, setOff, onPick }) => {
    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off);
    const y = base.getFullYear(), m = base.getMonth(), first = (base.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(), today = ymd();
    const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
    const title = base.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    return (
        <div className="pt-cal">
            <div className="pt-cal-h"><button type="button" aria-label="Mese prima" onClick={() => setOff(off - 1)}><Icon name="back" size={18} /></button><b>{title.charAt(0).toUpperCase() + title.slice(1)}</b><button type="button" aria-label="Mese dopo" disabled={off >= 0} onClick={() => setOff(off + 1)} style={{ transform: 'rotate(180deg)' }}><Icon name="back" size={18} /></button></div>
            <div className="pt-cal-g">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((x, i) => <span key={i} className="pt-cal-w">{x}</span>)}
                {cells.map((d, i) => { if (!d) return <span key={i} />; const dt = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const has = dayKcal(log, dt) > 0, fut = dt > today; return <button key={i} type="button" disabled={fut} className={(has ? 'has ' : '') + (dt === today ? 'now' : '')} onClick={() => onPick(dt)}>{d}</button>; })}
            </div>
            <span className="pt-cal-l"><i />Giorni con qualcosa di registrato</span>
        </div>
    );
};
const SH = ['#B4E600', '#7FA800', '#3F5400'];
// Ripartizione delle calorie tra carboidrati, proteine e grassi (4-4-9 kcal/g)
const MacroDonut = ({ c, p, f }) => {
    const parts = [['Carboidrati', c * 4], ['Proteine', p * 4], ['Grassi', f * 9]], tot = parts.reduce((s, x) => s + x[1], 0) || 1;
    let acc = 0;
    return (
        <div className="pt-dn">
            <svg viewBox="0 0 120 120" aria-hidden="true"><g>{parts.map(([n, v], i) => { const len = v / tot * 100, off = -acc; acc += len; return <circle key={n} cx="60" cy="60" r="42" fill="none" stroke={SH[i]} strokeWidth="24" pathLength="100" strokeDasharray={`${Math.max(0, len - 1)} ${100 - Math.max(0, len - 1)}`} strokeDashoffset={off} transform="rotate(-90 60 60)" />; })}</g></svg>
            <ul>{parts.map(([n, v], i) => <li key={n}><u style={{ background: SH[i] }} />{n}<b>{Math.round(v / tot * 100)}%</b></li>)}</ul>
        </div>
    );
};
// Calorie per pasto: previste e già registrate
const MealBars = ({ rows }) => {
    const max = Math.max(1, ...rows.map((r) => r.plan));
    return <div className="pt-mb">{rows.map((r) => <div key={r.n}><span>{r.n}</span><i><u style={{ width: r.plan / max * 100 + '%' }}><s style={{ width: Math.min(100, r.plan ? r.eaten / r.plan * 100 : 0) + '%' }} /></u></i></div>)}</div>;
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
    const pct = target ? Math.min(100, Math.round(eaten / target * 100)) : 0;
    return (
        <div className="pt-sp">
            <div className="pt-sp-top">
                <div className="pt-sp-brand"><UrbiosLogo size={34} /><b>URBIOS</b></div>
                <div className="pt-sp-list">
                    <div className="pt-sc is-static" style={{ background: '#D8FD38', color: '#0B0C0E' }}>
                        <Ring pct={pct / 100} ink="#0B0C0E" /><span className="pt-sc-t"><small>Oggi</small><b>{eaten} / {target} kcal</b></span>
                    </div>
                    <button type="button" className="pt-sc" style={{ background: '#DCD2FF', color: '#0B0C0E' }} onClick={() => onExtra({ names: meals.map((m) => m.nome) })}>
                        <span className="pt-sc-i"><Icon name="plus" size={20} /></span><span className="pt-sc-t"><b>Fuori piano</b></span><Icon name="back" size={18} />
                    </button>
                </div>
            </div>
            <div className="pt-sp-bot"><div className="pt-sp-scroll">
                {docs.length > 1 && <div className="pt-seg3">{docs.map((x, i) => <button key={x.docId} type="button" className={x.docId === cur ? 'is-on' : ''} onClick={() => { setCur(x.docId); setDi(null); }}>Dieta {i + 1}</button>)}</div>}
                {days.length > 1 && <div className="pt-seg3">{days.map((x, i) => <button key={i} type="button" className={i === di ? 'is-on' : ''} onClick={() => { setDi(i); rt.log.update((l) => { toolsOf(l).dietDay = { date: ymd(), docId: cur, d: i }; }); }}>{x.titolo}</button>)}</div>}
                {meals.map((m, i) => {
                    const rec = log.meals[mealKey(cur, di, i, date)];
                    return (
                        <button key={i} type="button" className="pt-ml" onClick={() => onMeal({ docId: cur, d: di, m: i })}>
                            <span className="pt-ml-t"><b>{m.nome}</b><small>{arr(m.voci).map((v) => `${v.n} (${v.g} g)`).join(', ')}</small></span>
                            <span className="pt-ml-k">{rec ? rec.kcal : mealKcal(m)} kcal</span>
                            <span className={'pt-ml-ck' + (rec ? ' is-on' : '')}><Icon name={rec ? 'check' : 'plus'} size={18} /></span>
                        </button>
                    );
                })}
                <Extras rt={rt} date={date} />
                <div className="pg pg-lt"><MealsWeek log={log} docId={cur} total={meals.length} /></div>
                <button type="button" className="pt-gr" onClick={() => setHist(true)}><Icon name="calendar" size={20} /><b>Storico e modifica dei giorni</b><Icon name="back" size={18} /></button>
                {o && <button type="button" className="pt-gr" onClick={() => setInfo(true)}><Icon name="info" size={20} /><b>Alcune info sulla tua alimentazione</b><Icon name="back" size={18} /></button>}
            </div></div>
            {hist && (
                <Lst title={hd ? dayLabel(hd) : 'Storico'} onClose={() => { setHist(false); setHd(null); }} xLabel={hd ? 'Indietro' : 'Chiudi'} xIcon={hd ? 'back' : 'close'} onX={() => (hd ? setHd(null) : setHist(false))}>
                            {!hd && <Cal log={log} off={cm} setOff={setCm} onPick={(dt) => { setHd(dt); setHdi(di); }} />}
                            {hd && <>
                                {days.length > 1 && <div className="pt-seg3 is-l">{days.map((x, i) => <button key={i} type="button" className={i === hdi ? 'is-on' : ''} onClick={() => setHdi(i)}>{x.titolo}</button>)}</div>}
                                {arr(days[Math.min(hdi, days.length - 1)].pasti).map((m, i) => { const rec = log.meals[mealKey(cur, hdi, i, hd)]; return (
                                    <button key={i} type="button" className="pt-lst-r" onClick={() => onMeal({ docId: cur, d: hdi, m: i, date: hd })}>
                                        <span className="pt-lst-t"><b>{m.nome}</b></span><span className="pt-lst-s">{rec ? rec.kcal + ' kcal' : 'Da registrare'}</span><span className={'pt-ml-ck' + (rec ? ' is-on' : '')}><Icon name={rec ? 'check' : 'plus'} size={18} /></span>
                                    </button>); })}
                                <Extras rt={rt} date={hd} />
                            </>}
                </Lst>
            )}
            {info && o && (
                <Lst title="La tua alimentazione" onClose={() => setInfo(false)}>
                            <div className="pt-tiles">
                                <div><b>{o.c} g</b><span>Carboidrati</span></div>
                                <div><b>{o.p} g</b><span>Proteine</span></div>
                                <div><b>{o.f} g</b><span>Grassi</span></div>
                            </div>
                            <div className="pt-cd"><MacroDonut c={o.c} p={o.p} f={o.f} /></div>
                            <div className="pt-cd"><MealBars rows={meals.map((m, i) => { const rec = log.meals[mealKey(cur, di, i, date)]; return { n: m.nome, plan: mealKcal(m), eaten: rec ? rec.kcal : 0 }; })} /></div>
                            <div className="pg pg-lt"><KcalWeek log={log} goal={target} /></div>
                </Lst>
            )}
        </div>
    );
};
