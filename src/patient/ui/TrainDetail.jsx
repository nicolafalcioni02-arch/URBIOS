import React, { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './bits.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { arr, estMinutes, parseSets, parseRest, sessionKey, daySets, suggestLoad, fmtKg, fmtDay, ymd, dayStatus } from './logic.js';

const TONES = ['#BDB2FF', '#F8A8D8', '#A0E7E5', '#FFF3B0', '#C5E1A5'];

// Pillola con "pallino" che scivola sotto il giorno scelto
const DaySwitch = ({ days, cur, set, sts }) => {
    const refs = useRef([]), [thumb, setThumb] = useState({ x: 0, w: 0 });
    useLayoutEffect(() => { const b = refs.current[cur]; if (b) setThumb({ x: b.offsetLeft, w: b.offsetWidth }); }, [cur, days.length]);
    return (
        <div className="pt-dsw" role="tablist">
            <i className="pt-dsw-t" style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} />
            {days.map((x, i) => <button key={i} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" aria-selected={i === cur} className={i === cur ? 'is-on' : ''} onClick={() => set(i)}>{sts[i].state === 'done' ? <Icon name="check" size={14} /> : sts[i].state === 'part' ? <u className="pt-dsw-p" /> : null}{x.titolo}</button>)}
        </div>
    );
};

const WeekTile = ({ i, on, deload, onClick, sts }) => {
    const ref = useRef(null);
    useLayoutEffect(() => { if (on && ref.current && ref.current.scrollIntoView) ref.current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [on]);
    return (
        <button ref={ref} type="button" className={'pt-wk' + (on ? ' is-on' : '')} aria-pressed={on} onClick={onClick}>
            <small>{deload ? 'SCARICO' : 'SETT.'}</small><b>{i + 1}</b>
            <span className="pt-wk-p">{sts.map((x, k) => <u key={k} className={x.state} />)}</span>
        </button>
    );
};

const Ring = ({ pct }) => { const R = 22, C = 2 * Math.PI * R; return (
    <svg className="pt-dh-ring" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r={R} fill="none" stroke="rgba(11,12,14,.15)" strokeWidth="5" /><circle cx="28" cy="28" r={R} fill="none" stroke="#0B0C0E" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.3,1,.4,1)' }} /></svg>
); };

export const TrainDetail = ({ rt, id, w0 = 0, d0 = 0, onBack, onStart }) => {
    const doc = rt.docs.get(id), [w, setW] = useState(w0), [d, setD] = useState(d0), [open, setOpen] = useState(null), [sc, setSc] = useState(0);
    if (!doc || !doc.body) return null;
    const weeks = arr(doc.body.settimane), wk = weeks[Math.min(w, weeks.length - 1)], days = arr(wk && wk.giorni), day = days[Math.min(d, days.length - 1)];
    if (!day) return null;
    const log = rt.log.get(), st = dayStatus(log, id, w, d, day), key = sessionKey(id, w, d), sess = (log.sessions[key] || {}).sets || {};
    const exs = arr(day.esercizi), tot = daySets(day), done = Object.values(sess).reduce((t, a) => t + a.length, 0), pct = tot ? Math.min(1, done / tot) : 0;
    const pick = (fn) => (n) => { setOpen(null); fn(n); };
    return (
        <>
            <div className="pt-sp pt-td">
            <div className="pt-sp-top pt-td-top">
                <button type="button" className="pt-round pt-td-back" aria-label="Indietro" onClick={onBack}><Icon name="back" /></button>
                <UrbiosLogo size={34} className="pt-sp-logo" />
                <b className="pt-td-t">{doc.title || 'Scheda'}</b>
            </div>
            <div className="pt-sp-bot pt-td-bot"><svg className="pt-td-wave" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30V15C40 -3 90 -3 135 13S230 31 275 14 360 -2 400 12V30Z" fill="#fff" /></svg><div className="pt-sp-scroll pt-td-sc">
            {weeks.length > 1 && (
                <div className="pt-wks" role="group" aria-label="Settimana">
                    {weeks.map((x, i) => <WeekTile key={i} i={i} on={i === w} deload={x.scarico} sts={arr(x.giorni).map((dy, k) => dayStatus(log, id, i, k, dy))} onClick={pick(() => { setW(i); setD(0); })} />)}
                </div>
            )}
            {days.length > 1 && <DaySwitch days={days} cur={d} set={pick(setD)} sts={days.map((dy, k) => dayStatus(log, id, w, k, dy))} />}

            <div className="pt-exl" style={{ '--fade': Math.min(64, sc * 1.6) + 'px' }} key={`l${w}-${d}`} onScroll={(e) => setSc(e.currentTarget.scrollTop)}>
            <div className="pt-dh" key={`h${w}-${d}`}>
                <div><b className="pt-dh-t">{day.titolo}</b>
                    <span className="pt-hero-d">{exs.length} esercizi · ~{estMinutes(day)} min{st.state === 'done' ? ` · fatto il ${fmtDay(st.date)}` : ''}</span></div>
                <Ring pct={pct} /><span className="pt-dh-n">{done}/{tot}</span>
            </div>
                {exs.map((e, i) => {
                    const s = parseSets(e.serie), n = s.n, got = arr(sess[i]).length, isOpen = open === i;
                    const kg0 = parseFloat(String(e.carico).replace(',', '.')) || 0, sug = suggestLoad(log.hist, e.nome, kg0);
                    const past = arr(log.hist[e.nome]).filter((h) => h.date !== ymd()).slice(-1)[0];
                    const tone = TONES[i % TONES.length];
                    return (
                        <div key={i} className={'pt-xc' + (isOpen ? ' is-open' : '')} style={{ animationDelay: i * 55 + 'ms' }}>
                            <button type="button" className="pt-xc-h" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                                <span className="pt-xc-n" style={{ background: tone }}>{i + 1}</span>
                                <span className="pt-xc-b">
                                    <b>{e.ss ? <em>{e.ss}</em> : null}{e.nome}</b>
                                    <span className="pt-chp">
                                        <i>{e.serie || `${n} serie`}</i>
                                        {e.carico ? <i>{e.carico} kg</i> : null}
                                        <i>{parseRest(e.rec)}s riposo</i>
                                    </span>
                                    <span className="pt-dots" aria-label={`${got} di ${n} serie fatte`}>{Array.from({ length: Math.min(n, 10) }, (_, k) => <u key={k} className={k < got ? 'on' : ''} style={k < got ? { background: tone } : undefined} />)}</span>
                                </span>
                                <span className="pt-xc-c" aria-hidden="true"><Icon name="back" size={18} /></span>
                            </button>
                            <div className="pt-xc-x"><div>
                                {e.note && <p className="pt-xc-note"><Icon name="info" size={16} />{e.note}</p>}
                                <div className="pt-kv">
                                    {e.rpe ? <span><small>RPE</small><b>{e.rpe}</b></span> : null}
                                    {e.tempo ? <span><small>Tempo</small><b>{e.tempo}</b></span> : null}
                                    {e.pct ? <span><small>% 1RM</small><b>{e.pct}</b></span> : null}
                                    {sug ? <span><small>Suggerito</small><b>{fmtKg(sug.kg)} kg</b></span> : null}
                                </div>
                                {past && <p className="pt-xc-past"><b>{fmtDay(past.date)}:</b> {past.sets.map((x) => fmtKg(x.kg) + ' kg' + (x.rpe ? ' (RPE ' + x.rpe + ')' : '')).join(', ')}</p>}
                                
                            </div></div>
                        </div>
                    );
                })}
            </div>
            </div></div></div>
            <div className="pt-cta-w is-light"><button type="button" className="pt-cta" onClick={() => onStart({ id, w, d })}>{done && done < tot ? 'RIPRENDI ALLENAMENTO' : st.state === 'done' ? 'RIFAI L\'ALLENAMENTO' : 'INIZIA ALLENAMENTO GUIDATO'}</button></div>
        </>
    );
};
