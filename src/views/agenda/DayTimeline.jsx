// Timeline a ore per uno o più giorni (vista Giorno e Settimana). Le fasce bianche sono la tua disponibilità
// (dagli orari dello studio), il resto è grigio. Clic su uno spazio vuoto = nuovo appuntamento a quell'ora.
import React, { useEffect, useRef, useState } from 'react';
import { dateKey, startOf, isActive, layoutLanes, minutesOf, tipoOf, apptTitle, fmtTime, sameDay, birthdaysOn } from '../../components/agenda/agendaLogic';

const PPH = 60; // pixel per ora

export const DayTimeline = ({ dates, items, db, settings, bounds, onSlot, onOpen }) => {
    const [now, setNow] = useState(new Date());
    const scroller = useRef(null);
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);
    // all'apertura porta in vista la prima ora utile / adesso
    useEffect(() => {
        const el = scroller.current;
        if (!el) return;
        const today = dates.some((d) => sameDay(d, new Date()));
        const target = today ? new Date().getHours() * 60 - 90 : (bounds.start || 0) + 0;
        el.scrollTop = Math.max(0, ((today ? target : bounds.start) - bounds.start) * (PPH / 60));
    }, [dates[0] && dateKey(dates[0]), bounds.start]); // eslint-disable-line react-hooks/exhaustive-deps

    const hoursList = [];
    for (let m = bounds.start; m < bounds.end; m += 60) hoursList.push(m);
    const total = (bounds.end - bounds.start) * (PPH / 60);
    const y = (min) => (min - bounds.start) * (PPH / 60);

    return (
        <div className="ag-tl">
            <div className="ag-tl-head" style={{ gridTemplateColumns: `52px repeat(${dates.length}, 1fr)` }}>
                <span />
                {dates.map((d) => {
                    const bd = birthdaysOn(db, d);
                    return (
                        <div key={dateKey(d)} className={`ag-colhead ${sameDay(d, now) ? 'today' : ''}`}>
                            <small>{d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}</small>
                            <b>{d.getDate()}</b>
                            {bd.length > 0 && (
                                <span className="ag-bday" title={bd.map((x) => `${x.p.nome} ${x.p.cognome} compie ${x.age} anni`).join('\n')}>
                                    🎂
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="ag-tl-scroll" ref={scroller}>
                <div className="ag-tl-body" style={{ gridTemplateColumns: `52px repeat(${dates.length}, 1fr)`, height: total }}>
                    <div className="ag-hours">
                        {hoursList.map((m) => (
                            <span key={m} style={{ top: y(m) - 7 }}>
                                {fmtTime(m)}
                            </span>
                        ))}
                    </div>
                    {dates.map((d) => {
                        const key = dateKey(d);
                        const day = items.filter((a) => a.start.startsWith(key));
                        const lanes = layoutLanes(day.filter(isActive)).concat(layoutLanes(day.filter((a) => !isActive(a))).map((x) => ({ ...x, ghost: true })));
                        const work = settings.hours[d.getDay()] || [];
                        return (
                            <div
                                key={key}
                                className="ag-col"
                                onClick={(e) => {
                                    if (e.target.closest('.ag-appt')) return;
                                    const r = e.currentTarget.getBoundingClientRect();
                                    const min = Math.floor(((e.clientY - r.top) / (PPH / 60) + bounds.start) / 15) * 15;
                                    onSlot(d, Math.max(bounds.start, Math.min(bounds.end - 15, min)));
                                }}
                            >
                                {work.map(([s, e], i) => (
                                    <div key={i} className="ag-work" style={{ top: y(Math.max(s, bounds.start)), height: y(Math.min(e, bounds.end)) - y(Math.max(s, bounds.start)) }} />
                                ))}
                                {hoursList.map((m) => (
                                    <div key={m} className="ag-line" style={{ top: y(m) }} />
                                ))}
                                {sameDay(d, now) && now.getHours() * 60 + now.getMinutes() >= bounds.start && now.getHours() * 60 + now.getMinutes() <= bounds.end && <div className="ag-now" style={{ top: y(now.getHours() * 60 + now.getMinutes()) }} />}
                                {lanes.map(({ a, lane, lanes: n, ghost }) => {
                                    const t = tipoOf(a.tipo);
                                    const top = y(minutesOf(a));
                                    const h = Math.max(24, (a.dur || 30) * (PPH / 60) - 2);
                                    return (
                                        <button
                                            key={a.id}
                                            className={`ag-appt st-${a.stato || 'confermato'} ${ghost ? 'ghost' : ''}`}
                                            style={{ top, height: h, left: `${(lane / n) * 100 + 1}%`, width: `${100 / n - 2}%`, '--c': t.color }}
                                            onClick={() => onOpen(a)}
                                        >
                                            <b>{apptTitle(db, a)}</b>
                                            <span>
                                                {a.start.split('T')[1]} · {a.dur}'{a.luogo && h > 56 ? ` · ${a.luogo.trim()}` : ''}
                                            </span>
                                            {a.stato === 'completato' && <i className="ph-fill ph-check-circle" />}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
