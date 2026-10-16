// Agenda su telefono: striscia della settimana (si scorre col dito), mese che si apre toccando il titolo,
// filtro per sede quando ce n'e' piu' d'una, e la giornata come elenco con gli spazi liberi gia' pronti da prenotare.
import React, { useMemo, useRef, useState } from 'react';
import { addDays, apptTitle, dateKey, fmtTime, isActive, minutesOf, mondayOf, sameDay, startOf, tipoOf } from '../../components/agenda/agendaLogic';
import { ActionSheet } from '../../components/mobile/MobileChrome';
import { DayTimeline } from './DayTimeline';

const PLACE_COLORS = ['#3B5BDB', '#0C8F7E', '#C26A1B', '#8E44C9', '#C23A64'];
const WD = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const AgendaMobile = ({ db, items, settings, bounds, date, setDate, onNew, onOpen, onExport, onOpenSettings }) => {
    const [place, setPlace] = useState('all');
    const [monthOpen, setMonthOpen] = useState(false);
    const [mode, setMode] = useState('list');
    const [menu, setMenu] = useState(false);
    const [slide, setSlide] = useState('');
    const touch = useRef(null);

    const places = settings.places;
    const placeColor = (p) => {
        const i = places.indexOf(String(p || '').trim());
        return i >= 0 ? PLACE_COLORS[i % PLACE_COLORS.length] : '#A09E98';
    };
    const inPlace = (a) => place === 'all' || String(a.luogo || '').trim() === place;
    const visible = useMemo(() => items.filter(inPlace), [items, place]); // eslint-disable-line react-hooks/exhaustive-deps

    // quanti appuntamenti per giorno (puntini su settimana e mese)
    const perDay = useMemo(() => {
        const m = {};
        visible.filter(isActive).forEach((a) => (m[a.start.slice(0, 10)] = (m[a.start.slice(0, 10)] || 0) + 1));
        return m;
    }, [visible]);

    const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i));
    const moveWeek = (dir) => {
        setSlide(dir > 0 ? 'step-fwd' : 'step-back');
        setDate(addDays(date, dir * 7));
    };
    const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
    const onTouchEnd = (e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 45) moveWeek(dx < 0 ? 1 : -1);
    };

    // la giornata: appuntamenti + spazi liberi dentro gli orari di studio
    const day = useMemo(() => visible.filter((a) => a.start.slice(0, 10) === dateKey(date)).sort((a, b) => minutesOf(a) - minutesOf(b)), [visible, date]);
    const rows = useMemo(() => {
        const out = [];
        const ranges = settings.hours[date.getDay()] || [];
        const busy = day.filter(isActive).map((a) => [minutesOf(a), minutesOf(a) + (a.dur || 30)]);
        const now = new Date();
        const nowMin = sameDay(date, now) ? now.getHours() * 60 + now.getMinutes() : date < now ? 24 * 60 : -1;
        const free = [];
        ranges.forEach(([s, e]) => {
            let cur = s;
            busy.filter(([bs, be]) => be > s && bs < e).forEach(([bs, be]) => {
                if (bs - cur >= 30) free.push([cur, bs]);
                cur = Math.max(cur, be);
            });
            if (e - cur >= 30) free.push([cur, e]);
        });
        free.forEach(([s, e]) => {
            // niente spazi liberi nel passato; quelli in corso partono dalla prossima mezz'ora
            const from = Math.max(s, Math.ceil(nowMin / 30) * 30);
            if (e - from >= 30) out.push({ free: true, s: from, e, key: `f${from}` });
        });
        day.forEach((a) => out.push({ a, s: minutesOf(a), key: a.id }));
        return out.sort((x, y) => x.s - y.s || (x.free ? 1 : -1));
    }, [day, date, settings]);

    const active = day.filter(isActive);
    const booked = active.reduce((t, a) => t + (a.dur || 30), 0);
    const isToday = sameDay(date, new Date());
    const dayLabel = cap(date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));

    // mese compatto
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const gridStart = mondayOf(monthStart);
    const weeks = Math.ceil((((monthStart.getDay() + 6) % 7) + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) / 7);
    const monthDays = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));

    return (
        <div className="m-shell agm">
            <div className="m-scroll">
                <header className="m-nav is-solid">
                    <div className="m-nav-side">
                        {!isToday && (
                            <button className="m-pill agm-today" onClick={() => setDate(new Date())}>
                                Oggi
                            </button>
                        )}
                    </div>
                    <span className="m-nav-title is-on">Agenda</span>
                    <div className="m-nav-side end">
                        <button className="m-icon" onClick={() => setMenu(true)} aria-label="Altre azioni">
                            <i className="ph ph-dots-three-circle"></i>
                        </button>
                        <button className="m-icon solid" onClick={() => onNew(date, null)} aria-label="Nuovo appuntamento">
                            <i className="ph-bold ph-plus"></i>
                        </button>
                    </div>
                </header>

                {/* mese: tocca per aprire il calendario intero */}
                <button className="agm-month" onClick={() => setMonthOpen((v) => !v)} aria-expanded={monthOpen}>
                    {cap(date.toLocaleDateString('it-IT', { month: 'long' }))}
                    <span>{date.getFullYear()}</span>
                    <i className={`ph-bold ph-caret-down ${monthOpen ? 'up' : ''}`}></i>
                </button>

                {monthOpen ? (
                    <div className="agm-cal rise">
                        <div className="agm-cal-nav">
                            <button className="m-icon" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} aria-label="Mese precedente">
                                <i className="ph ph-caret-left"></i>
                            </button>
                            <button className="m-icon" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} aria-label="Mese successivo">
                                <i className="ph ph-caret-right"></i>
                            </button>
                        </div>
                        <div className="agm-grid">
                            {WD.map((d, i) => (
                                <b key={i}>{d}</b>
                            ))}
                            {monthDays.map((d) => (
                                <button
                                    key={dateKey(d)}
                                    className={`agm-d ${d.getMonth() !== date.getMonth() ? 'out' : ''} ${sameDay(d, new Date()) ? 'today' : ''} ${sameDay(d, date) ? 'sel' : ''}`}
                                    onClick={() => {
                                        setDate(d);
                                        setMonthOpen(false);
                                    }}
                                >
                                    {d.getDate()}
                                    {perDay[dateKey(d)] ? <i /> : null}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="agm-week" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                        <div key={dateKey(week[0])} className={`agm-grid ${slide}`}>
                            {week.map((d, i) => (
                                <button key={dateKey(d)} className={`agm-d ${sameDay(d, new Date()) ? 'today' : ''} ${sameDay(d, date) ? 'sel' : ''}`} onClick={() => setDate(d)}>
                                    <b>{WD[i]}</b>
                                    <span>{d.getDate()}</span>
                                    {perDay[dateKey(d)] ? <i /> : <i className="none" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* sedi: compaiono solo se ce n'e' piu' d'una */}
                {places.length > 1 && (
                    <div className="agm-places no-scrollbar">
                        {[{ id: 'all', label: 'Tutte le sedi' }, ...places.map((p) => ({ id: p, label: p }))].map((p) => (
                            <button key={p.id} className={place === p.id ? 'on' : ''} onClick={() => setPlace(p.id)}>
                                {p.id !== 'all' && <span className="dot" style={{ background: placeColor(p.id) }} />}
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* giornata */}
                <div className="agm-dayhead">
                    <div className="min-w-0">
                        <h2>{isToday ? 'Oggi' : dayLabel}</h2>
                        <p>
                            {isToday && `${dayLabel} · `}
                            {active.length === 0 ? 'Nessun appuntamento' : `${active.length} ${active.length === 1 ? 'appuntamento' : 'appuntamenti'} · ${Math.floor(booked / 60) ? `${Math.floor(booked / 60)} h ` : ''}${booked % 60 ? `${booked % 60}'` : ''}`}
                        </p>
                    </div>
                    <div className="seg agm-seg">
                        <button className={mode === 'list' ? 'on' : ''} onClick={() => setMode('list')} aria-label="Elenco">
                            <i className="ph ph-list-bullets"></i>
                        </button>
                        <button className={mode === 'hours' ? 'on' : ''} onClick={() => setMode('hours')} aria-label="Ore">
                            <i className="ph ph-clock"></i>
                        </button>
                    </div>
                </div>

                {mode === 'hours' ? (
                    <div className="agm-hours">
                        <DayTimeline dates={[date]} items={visible} db={db} settings={settings} bounds={bounds} onSlot={(d, min) => onNew(d, min)} onOpen={onOpen} />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="agm-empty">
                        <i className="ph ph-coffee"></i>
                        <p>{(settings.hours[date.getDay()] || []).length ? 'Giornata libera' : 'Studio chiuso'}</p>
                        <button className="vw-chip" onClick={() => onNew(date, null)}>
                            <i className="ph ph-plus"></i> Aggiungi
                        </button>
                    </div>
                ) : (
                    <div className="agm-list">
                        {rows.map((r) =>
                            r.free ? (
                                <button key={r.key} className="agm-free" onClick={() => onNew(date, r.s)}>
                                    <span className="agm-time">{fmtTime(r.s)}</span>
                                    <span className="agm-free-body">
                                        <i className="ph ph-plus"></i>
                                        Libero fino alle {fmtTime(r.e)}
                                    </span>
                                </button>
                            ) : (
                                <button key={r.key} className={`agm-appt ${r.a.stato === 'annullato' ? 'off' : ''} ${r.a.stato === 'completato' ? 'done' : ''}`} onClick={() => onOpen(r.a)}>
                                    <span className="agm-time">
                                        {fmtTime(r.s)}
                                        <small>{fmtTime(r.s + (r.a.dur || 30))}</small>
                                    </span>
                                    <span className="agm-card" style={{ '--c': tipoOf(r.a.tipo).color }}>
                                        <span className="agm-who">{apptTitle(db, r.a)}</span>
                                        <span className="agm-what">
                                            {tipoOf(r.a.tipo).label}
                                            {r.a.stato === 'annullato' && ' · annullato'}
                                            {r.a.stato === 'assente' && ' · non presentato'}
                                            {r.a.stato === 'completato' && ' · completato'}
                                        </span>
                                        {r.a.luogo && r.a.luogo.trim() && (
                                            <span className="agm-where">
                                                <span className="dot" style={{ background: placeColor(r.a.luogo) }} />
                                                {r.a.luogo.trim()}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            )
                        )}
                    </div>
                )}
                <div style={{ height: 24 }}></div>
            </div>

            {menu && (
                <ActionSheet
                    title="Agenda"
                    subtitle={settings.hoursDefault ? 'Orari non impostati: uso lun–ven 9–18' : settings.hoursText.replace(/\s*\n\s*/g, ' · ')}
                    onClose={() => setMenu(false)}
                    groups={[
                        [
                            { label: 'Vai a oggi', icon: 'ph-calendar-check', onClick: () => setDate(new Date()) },
                            { label: 'Orari, durate e sedi', icon: 'ph-gear', onClick: onOpenSettings },
                        ],
                        [
                            { label: 'Esporta calendario (.ics)', icon: 'ph-export', note: 'senza nomi', onClick: () => onExport(false) },
                            { label: 'Esporta con i nomi', icon: 'ph-identification-card', onClick: () => onExport(true) },
                        ],
                    ]}
                />
            )}
        </div>
    );
};
