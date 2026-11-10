import React, { useEffect, useState } from 'react';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Icon } from './bits.jsx';
import { BodyMap } from './BodyMap.jsx';
import { arr, dayStatus, currentWeek, fmtDay, fmtKg } from './logic.js';
import { Streak, ExProgress, Records, RpeMix } from './Progress.jsx';
import { setsByMuscle, summary, weekly, strength, MUSCLES } from './muscles.js';

const ACTIVE = { bg: '#D8FD38', ink: '#0B0C0E' };
const OLD = { bg: '#DADDE5', ink: '#0B0C0E' };
const TONES = [{ bg: '#BDB2FF', ink: '#1D1738' }, { bg: '#F8A8D8', ink: '#3B132C' }, { bg: '#A0E7E5', ink: '#0B2F2E' }, { bg: '#FFF3B0', ink: '#3A3210' }];
const LIME = '#B4E600', LIME_L = '#E4F99A', INK = '#0B0C0E';

const Count = ({ n }) => {
    const [v, setV] = useState(0);
    useEffect(() => { let raf, t0; const step = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 700); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [n]);
    return <>{v}</>;
};

// Torta: quota di serie per muscolo (primi 5, il resto «altri»); i segmenti si disegnano in sequenza
const SHADES = ['#0B0C0E', '#B4E600', '#8FB800', '#D6F46A', '#5E8A00', '#C9CDD4'];
const Donut = ({ sets }) => {
    const rows = Object.entries(sets).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]), tot = rows.reduce((t, r) => t + r[1], 0); if (!tot) return null;
    const top = rows.slice(0, 5), rest = rows.slice(5).reduce((t, r) => t + r[1], 0), items = [...top.map(([k, v]) => [MUSCLES[k], v]), ...(rest > 0 ? [['Altri', rest]] : [])];
    let acc = 0;
    return (
        <div className="pt-dn">
            <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label="Muscoli">
                <mask id="pt-dn-m" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><circle className="pt-dn-m" cx="60" cy="60" r="42" fill="none" stroke="#fff" strokeWidth="30" pathLength="100" strokeDasharray="100" transform="rotate(-90 60 60)" /></mask>
                <g mask="url(#pt-dn-m)">{items.map(([n, v], i) => { const len = v / tot * 100, off = -acc; acc += len; return (
                    <circle key={n} cx="60" cy="60" r="42" fill="none" stroke={SHADES[i]} strokeWidth="24" pathLength="100" strokeDasharray={`${Math.max(0, len - 1)} ${100 - Math.max(0, len - 1)}`} strokeDashoffset={off} transform="rotate(-90 60 60)" />
                ); })}</g>
            </svg>
            <ul>{items.map(([n, v], i) => <li key={n} style={{ animationDelay: i * 80 + 'ms' }}><u style={{ background: SHADES[i] }} />{n}<b>{Math.round(v / tot * 100)}%</b></li>)}</ul>
        </div>
    );
};

export const Ring = ({ pct, ink }) => { const R = 18, C = 2 * Math.PI * R; return (
    <svg className="pt-sc-r" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r={R} fill="none" stroke={ink} strokeOpacity=".2" strokeWidth="5" /><circle cx="22" cy="22" r={R} fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 22 22)" /></svg>
); };

// Serie per settimana: barre, l'ultima (settimana corrente) in viola
const WeekBars = ({ data }) => {
    const max = Math.max(1, ...data.map((d) => d.sets)), W = 300, H = 96, bw = 32, gap = (W - bw * data.length) / (data.length - 1 || 1);
    return (
        <svg viewBox={`0 0 ${W} ${H + 38}`} className="pt-chart" role="img" aria-label="Serie per settimana">
            {data.map((d, i) => { const h = Math.max(3, d.sets / max * H), x = i * (bw + gap), cur = i === data.length - 1; return (
                <g key={i} className="pt-gr" style={{ animationDelay: i * 70 + 'ms' }}><rect x={x} y={H - h + 14} width={bw} height={h} rx="9" fill={cur ? LIME : LIME_L} />
                    <text x={x + bw / 2} y={H - h + 9} textAnchor="middle" className="pt-ct">{d.sets || ''}</text>
                    <text x={x + bw / 2} y={H + 30} textAnchor="middle" className="pt-ct is-m">{d.label}</text></g>
            ); })}
        </svg>
    );
};

const MuscleBars = ({ sets }) => {
    const rows = Object.entries(sets).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6), max = rows.length ? rows[0][1] : 1;
    if (!rows.length) return null;
    return (
        <div className="pt-mus">{rows.map(([k, v], i) => (
            <div key={k} className="pt-mus-r"><span>{MUSCLES[k]}</span><i><u style={{ width: Math.max(6, v / max * 100) + '%', animationDelay: i * 70 + 'ms' }} /></i><b>{Math.round(v)}</b></div>
        ))}</div>
    );
};

const sign = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n * 10) / 10);
// Forza: per ogni esercizio due barre (periodo prima / adesso) e la variazione
const Strength = ({ st }) => {
    if (!st.rows.length) return null;
    const rows = [...st.rows.slice(0, 4), ...st.rows.slice(4).slice(-1)], max = Math.max(...rows.map((r) => r.cur));
    return (
        <div className="pt-sx">{rows.map((r, i) => (
            <div key={r.name} className="pt-sx-r"><span>{r.name}</span><b className={r.pct >= 0 ? 'is-up' : 'is-dn'}>{sign(r.pct)}%</b>
                <i><u className="is-old" style={{ width: r.old / max * 100 + '%', animationDelay: i * 80 + 'ms' }} /></i>
                <i><u style={{ width: r.cur / max * 100 + '%', animationDelay: i * 80 + 60 + 'ms' }} /></i></div>
        ))}</div>
    );
};

// Tab Schede. Parte alta FISSA (logo + una voce per scheda: ogni scheda è una visita, es. «Mesociclo 1»; le voci si rimpiccioliscono se
// sono tante ma non spariscono). Parte bassa bianca che scorre: riepilogo, omino, grafici, archivio. Tutto calcolato dal diario del telefono.
export const Schede = ({ rt, docs, onOpen }) => {
    const log = rt.log.get(), [range, setRange] = useState(7), [tab, setTab] = useState('a'), [sheet, setSheet] = useState(null);
    const active = [], archive = [];
    for (const meta of docs.filter((d) => d.kind === 'training')) {
        const doc = rt.docs.get(meta.docId), weeks = arr(doc && doc.body && doc.body.settimane); if (!weeks.length) continue;
        const all = weeks.flatMap((wk, w) => arr(wk.giorni).map((day, di) => ({ w, di, st: dayStatus(log, meta.docId, w, di, day) })));
        const fatti = all.filter((x) => x.st.state === 'done').length;
        if (all.length && fatti === all.length) { archive.push({ meta, last: all.map((x) => x.st.date).sort().pop() }); continue; }
        const w = currentWeek(log, meta.docId, weeks), nxt = all.find((x) => x.w === w && x.st.state !== 'done');
        active.push({ meta, last: all.map((x) => x.st.date).filter(Boolean).sort().pop() || null, pct: all.length ? fatti / all.length : 0, open: { name: 'train', id: meta.docId, w, d: nxt ? nxt.di : 0 } });
    }
    // una sola scheda attiva: la più recente non finita; le altre non finite diventano «vecchie»
    active.sort((a, b) => (b.meta.at || 0) - (a.meta.at || 0) || (b.meta.rev || 0) - (a.meta.rev || 0));
    for (const x of active.splice(1)) archive.push({ meta: x.meta, last: x.last, pct: x.pct, open: x.open });
    archive.sort((a, b) => String(b.last || '').localeCompare(String(a.last || '')));
    const sets = setsByMuscle(log.hist, range), sm = summary(log.hist, range), lav = Object.values(sets).filter((v) => v > 0).length;
    const st = strength(log.hist, range), wk = weekly(log.hist, 6), hasData = sm.sets > 0 || wk.some((x) => x.sets > 0);
    return (
        <div className="pt-sp">
            <div className="pt-sp-top">
                <div className="pt-sp-brand"><UrbiosLogo size={34} /><b>URBIOS</b></div>
                <div className="pt-sp-list">
                    <button type="button" className="pt-sc" style={{ background: ACTIVE.bg, color: ACTIVE.ink }} disabled={!active.length} onClick={() => onOpen(active[0].open)}>
                        <Ring pct={active.length ? active[0].pct : 0} ink={ACTIVE.ink} /><b>La tua scheda</b><Icon name="back" size={18} />
                    </button>
                    <button type="button" className="pt-sc" style={{ background: OLD.bg, color: OLD.ink }} disabled={!archive.length} onClick={() => setSheet('old')}>
                        <span className="pt-sc-i"><Icon name="check" size={20} /></span><b>Le tue vecchie schede</b><Icon name="back" size={18} />
                    </button>
                </div>
            </div>
            <div className="pt-sp-bot"><div className="pt-sp-scroll">
                <button type="button" className="pt-rng" aria-label={`Periodo: ultimi ${range} giorni. Tocca per cambiare`} onClick={() => setRange(range === 7 ? 30 : 7)}>Ultimi <b key={range}>{range} giorni</b><Icon name="swap" size={14} /></button>
                <div className="pt-tiles is-sel" role="tablist">
                    {[['a', sm.workouts, 'Sedute'], ['s', sm.sets, 'Serie'], ['m', lav, 'Muscoli']].map(([k, n, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}><b><Count n={n} /></b><span>{l}</span></button>)}
                    <button type="button" role="tab" aria-selected={tab === 'f'} className={tab === 'f' ? 'is-on' : ''} onClick={() => setTab('f')}><b>{st.avg != null ? sign(st.avg) + '%' : '–'}</b><span>Forza</span></button>
                </div>
                <div className="pt-stage" key={tab + range}>
                    {tab === 'a' && <div className="pg pg-lt"><Streak log={log} /></div>}
                    {tab === 's' && hasData && <><div className="pt-cd"><WeekBars data={wk} /></div><div className="pg pg-lt"><RpeMix hist={log.hist} /></div></>}
                    {tab === 'm' && <><div className="pt-cd"><BodyMap sets={sets} full={range === 7 ? 10 : 40} /></div><div className="pt-cd"><MuscleBars sets={sets} /></div></>}
                    {tab === 'f' && <><div className="pg pg-lt"><ExProgress hist={log.hist} /><Records hist={log.hist} /></div>{st.avg == null && <p className="pt-sp-e">Servono due periodi per il confronto</p>}</>}
                </div>
                {(() => { const top = Object.entries(sets).sort((x, y) => y[1] - x[1])[0], c = tab === 'a' ? (sm.workouts ? <><em>{sm.workouts}</em> {sm.workouts === 1 ? 'seduta' : 'sedute'} negli ultimi {range} giorni</> : null) : tab === 's' ? (sm.sets ? <><em>{sm.sets}</em> serie negli ultimi {range} giorni</> : null) : tab === 'm' ? (top && top[1] > 0 ? <><em>{MUSCLES[top[0]]}</em> è il muscolo più lavorato</> : null) : (st.avg != null ? <>Forza <em>{sign(st.avg)}%</em> rispetto al periodo prima</> : null); return c ? <p className="pg-cap">{c}</p> : null; })()}
            </div></div>
            {sheet && (
                <div className="pt-lst-ov" role="dialog" aria-modal="true" onClick={() => setSheet(null)}>
                    <div className="pt-lst" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-lst-h"><b>Le tue vecchie schede</b><button type="button" className="pt-lst-x" aria-label="Chiudi" onClick={() => setSheet(null)}><Icon name="close" size={18} /></button></div>
                        <div className="pt-lst-b">{archive.map((a) => ({ key: a.meta.docId, title: a.meta.title, sub: a.last ? fmtDay(a.last) : Math.round((a.pct || 0) * 100) + '%', open: a.open || { name: 'train', id: a.meta.docId, w: 0, d: 0 } })).map((r, i) => (
                            <button key={r.key} type="button" className="pt-lst-r" onClick={() => { setSheet(null); onOpen(r.open); }}>
                                <span className="pt-lst-n">{i + 1}</span><span className="pt-lst-t"><b>{r.title || 'Scheda'}</b></span><span className="pt-lst-s">{r.sub}</span>
                            </button>
                        ))}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
