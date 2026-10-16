// Elenco di una giornata: appuntamenti come banner e, tra l'uno e l'altro, gli spazi liberi dentro gli orari di studio
// (un tocco = nuovo appuntamento). Lo usano telefono, tablet e PC: al posto del calendario a ore.
import React, { useMemo } from 'react';
import { apptTitle, dateKey, fmtTime, isOnline, minutesOf, placeColor, placeMark, sameDay, tipoOf } from '../../components/agenda/agendaLogic';

export const dayRows = (day, date, settings, withFree = true, step = 30, showPast = false) => {
    const out = [];
    const busy = day.filter((a) => a.stato !== 'annullato').map((a) => [minutesOf(a), minutesOf(a) + (a.dur || 30)]);
    if (withFree) {
        const now = new Date();
        const nowMin = sameDay(date, now) ? now.getHours() * 60 + now.getMinutes() : date < now && !showPast ? 24 * 60 : -1;
        (settings.hours[date.getDay()] || []).forEach(([s, e]) => {
            let cur = s;
            const free = [];
            busy.filter(([bs, be]) => be > s && bs < e).forEach(([bs, be]) => {
                if (bs - cur >= step) free.push([cur, bs]);
                cur = Math.max(cur, be);
            });
            if (e - cur >= step) free.push([cur, e]);
            // ogni spazio libero viene diviso in slot della durata scelta, uno dopo l'altro
            free.forEach(([fs, fe]) => {
                let t = Math.max(fs, Math.ceil(nowMin / 15) * 15); // niente slot nel passato
                for (; t + step <= fe; t += step) out.push({ free: true, s: t, e: t + step, key: `f${t}` });
            });
        });
    }
    day.forEach((a) => out.push({ a, s: minutesOf(a), key: a.id }));
    return out.sort((x, y) => x.s - y.s || (x.free ? 1 : -1));
};

export const DayList = ({ day, date, db, settings, onNew, onOpen, withFree = true, className = '', compact = false, step = 30, showPast = false }) => {
    const rows = useMemo(() => dayRows(day, date, settings, withFree, step, showPast), [day, date, settings, withFree, step, showPast]);
    const colorOf = (p) => placeColor(settings.places, p);
    // appuntamenti sovrapposti nella stessa fascia = stessa riga; gli slot liberi consecutivi diventano una griglia di orari
    const blocks = useMemo(() => {
        const out = [];
        rows.forEach((r) => {
            const last = out[out.length - 1];
            if (r.free) {
                if (last && last.slots) last.slots.push(r);
                else out.push({ slots: [r], key: `g${r.key}` });
            } else {
                const end = r.s + (r.a.dur || 30);
                if (last && last.group && r.s < last.end) {
                    last.group.push(r);
                    last.end = Math.max(last.end, end);
                } else out.push({ group: [r], end, s: r.s, key: `a${r.key}` });
            }
        });
        return out;
    }, [rows]);
    if (rows.length === 0)
        return (
            <div className="agm-empty">
                <i className="ph ph-coffee"></i>
                <p>{(settings.hours[date.getDay()] || []).length ? 'Giornata libera' : 'Studio chiuso'}</p>
                <button className="vw-chip" onClick={() => onNew(date, null)}>
                    <i className="ph ph-plus"></i> Aggiungi
                </button>
            </div>
        );
    return (
        <div className={`agm-list ${className}`}>
            {blocks.map((r) =>
                r.slots ? (
                    <div key={r.key} className={`agm-slots ${compact ? '' : 'wide'}`}>
                        {r.slots.map((f) => (
                            <button key={f.key} className="agm-slot" title={`${fmtTime(f.s)}–${fmtTime(f.e)}`} onClick={() => onNew(date, f.s)}>
                                {fmtTime(f.s)}
                            </button>
                        ))}
                    </div>
                ) : r.free ? (
                    <button key={r.key} className="agm-free" onClick={() => onNew(date, r.s)}>
                        {!compact && <span className="agm-time">{fmtTime(r.s)}</span>}
                        <span className="agm-free-body">
                            <i className="ph ph-plus"></i>
                            {compact ? `${fmtTime(r.s)}–${fmtTime(r.e)}` : `Libero · ${r.e - r.s}'`}
                        </span>
                    </button>
                ) : compact ? (
                    // colonna della settimana: una riga per appuntamento (ora, tipo, sede) cosi' la giornata resta corta
                    <div key={r.key} className="agm-chips">
                        {r.group.map(({ a }) => {
                            const pl = a.luogo && a.luogo.trim();
                            const st = a.stato === 'annullato' ? ' · annullato' : a.stato === 'assente' ? ' · non presentato' : a.stato === 'completato' ? ' · completato' : '';
                            return (
                                <button
                                    key={a.id}
                                    className={`agm-cardbtn agm-chip ${a.stato === 'annullato' ? 'off' : ''} ${a.stato === 'completato' ? 'done' : ''}`}
                                    style={{ '--c': tipoOf(a.tipo).color, '--p': pl ? colorOf(pl) : tipoOf(a.tipo).color }}
                                    title={`${fmtTime(minutesOf(a))} · ${apptTitle(db, a)} · ${tipoOf(a.tipo).label}${pl ? ' · ' + pl : ''}${st}`}
                                    onClick={() => onOpen(a)}
                                >
                                    <i className="t">{fmtTime(minutesOf(a))}</i>
                                    <b className="ty">{tipoOf(a.tipo).label}</b>
                                    {pl && <em className="pm">{isOnline(pl) ? <i className="ph-fill ph-video-camera"></i> : placeMark(pl)}</em>}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div key={r.key} className="agm-appt">
                        <span className="agm-time">
                            {fmtTime(r.s)}
                            <small>{fmtTime(r.end)}</small>
                        </span>
                        <div className="agm-cards" style={{ '--n': r.group.length }}>
                            {r.group.map(({ a }) => (
                                <button key={a.id} className={`agm-cardbtn ${a.stato === 'annullato' ? 'off' : ''} ${a.stato === 'completato' ? 'done' : ''}`} onClick={() => onOpen(a)}>
                                    <span className="agm-card" style={{ '--c': tipoOf(a.tipo).color, '--p': a.luogo && a.luogo.trim() ? colorOf(a.luogo) : tipoOf(a.tipo).color }}>
                                        {a.luogo && a.luogo.trim() && (
                                            <span className="agm-mark" title={a.luogo.trim()}>
                                                {isOnline(a.luogo) ? <i className="ph-fill ph-video-camera"></i> : placeMark(a.luogo)}
                                            </span>
                                        )}
                                        <span className="agm-who">{compact ? tipoOf(a.tipo).label : apptTitle(db, a)}</span>
                                        <span className="agm-what">
                                            {!compact && tipoOf(a.tipo).label}
                                            {a.stato === 'annullato' && (compact ? 'Annullato' : ' · annullato')}
                                            {a.stato === 'assente' && (compact ? 'Non presentato' : ' · non presentato')}
                                            {a.stato === 'completato' && (compact ? 'Completato' : ' · completato')}
                                        </span>
                                        {a.luogo && a.luogo.trim() && (
                                            <span className="agm-where">
                                                <i className={`ph-fill ${isOnline(a.luogo) ? 'ph-video-camera' : 'ph-map-pin'}`}></i>
                                                {isOnline(a.luogo) ? (compact ? 'Online' : 'Online · videochiamata') : a.luogo.trim()}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

// Settimana: una colonna per giorno, con i banner e gli spazi liberi; in alto un box per regolare la durata minima degli spazi.
const STEPS = [30, 45, 60, 90];
export const WeekBoard = ({ dates, items, db, settings, onNew, onOpen, onPickDay, step, setStep }) => {
    const days = dates.map((d) => {
        const day = items.filter((a) => a.start.slice(0, 10) === dateKey(d)).sort((a, b) => minutesOf(a) - minutesOf(b));
        const free = dayRows(day, d, settings, true, step, true).filter((r) => r.free);
        return { d, day, free };
    });
    const holes = days.reduce((n, x) => n + x.free.length, 0);
    const mins = days.reduce((n, x) => n + x.free.reduce((t, r) => t + (r.e - r.s), 0), 0);
    const hm = `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60}'` : ''}`;
    return (
        <>
            <div className="ag-slotbox">
                <div className="ag-slotsum">
                    <b>{holes}</b>
                    <span>
                        {holes === 1 ? 'slot libero' : 'slot liberi'} da {step}' · {hm} disponibili
                    </span>
                </div>
                <div className="ag-slotctl" role="group" aria-label="Durata degli slot">
                    <small>slot da</small>
                    {STEPS.map((m) => (
                        <button key={m} className={step === m ? 'on' : ''} onClick={() => setStep(m)}>
                            {m}'
                        </button>
                    ))}
                </div>
            </div>
            <div className="ag-board">
                {days.map(({ d, day }) => {
                    const closed = !(settings.hours[d.getDay()] || []).length && day.length === 0;
                    return (
                        <section key={dateKey(d)} className={`ag-bcol ${sameDay(d, new Date()) ? 'today' : ''} ${closed ? 'closed' : ''}`}>
                            <button className="ag-bhead" onClick={() => onPickDay(d)}>
                                <small>{d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}</small>
                                <b>{d.getDate()}</b>
                            </button>
                            <DayList day={day} date={d} db={db} settings={settings} onNew={onNew} onOpen={onOpen} withFree={!closed} className="compact" compact step={step} showPast />
                        </section>
                    );
                })}
            </div>
        </>
    );
};
