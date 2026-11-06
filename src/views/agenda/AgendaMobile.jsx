// Agenda su telefono: striscia della settimana (si scorre col dito), mese che si apre toccando il titolo,
// filtro per sede quando ce n'e' piu' d'una, e la giornata come elenco con gli spazi liberi gia' pronti da prenotare.
import { Button } from 'glisse';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { addDays, apptTitle, isOnline, placeColor as placeColorOf, placeMark, dateKey, fmtTime, isActive, minutesOf, mondayOf, sameDay, startOf, tipoOf } from '../../components/agenda/agendaLogic';
import { ActionSheet, GlassIconButton } from '../../components/mobile/MobileChrome';
import { DayList } from './DayList';

const WD = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const AgendaMobile = ({ db, items, settings, date, setDate, onNew, onOpen, onExport, onOpenSettings }) => {
    const [place, setPlace] = useState('all');
    const [monthOpen, setMonthOpen] = useState(false);
    const [menu, setMenu] = useState(false);
    const [slide, setSlide] = useState('');
    const touch = useRef(null);

    const places = settings.places;
    const placeColor = (p) => placeColorOf(places, p);
    const inPlace = (a) => place === 'all' || String(a.luogo || '').trim() === place;
    const visible = useMemo(() => items.filter(inPlace), [items, place]); // eslint-disable-line react-hooks/exhaustive-deps

    // quanti appuntamenti per giorno (puntini su settimana e mese)
    const perDay = useMemo(() => {
        const m = {};
        visible.filter(isActive).forEach((a) => (m[a.start.slice(0, 10)] = (m[a.start.slice(0, 10)] || 0) + 1));
        return m;
    }, [visible]);

    // ghiera dei giorni: striscia che scorre con aggancio, il giorno al centro e' quello scelto
    const WHEEL = 200; // giorni mostrati prima e dopo il punto di partenza; vicino ai bordi la striscia si ricentra, quindi non finisce mai
    const ITEM = 52;
    const [anchor, setAnchor] = useState(() => new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    const wheel = useRef(null);
    const settle = useRef(null);
    const dayMs = 86400000;
    const diffDays = (d) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - anchor) / dayMs);
    const wheelDays = useMemo(() => Array.from({ length: WHEEL * 2 + 1 }, (_, i) => addDays(anchor, i - WHEEL)), [anchor]);

    const paint = () => {
        const el = wheel.current;
        if (!el) return;
        const c = el.scrollLeft + el.clientWidth / 2;
        el.querySelectorAll('.agm-wd').forEach((n) => {
            const dist = Math.abs(n.offsetLeft + n.offsetWidth / 2 - c) / ITEM;
            n.style.setProperty('--k', Math.min(dist, 3).toFixed(2));
            n.classList.toggle('is-c', dist < 0.5);
        });
    };
    const recenter = useRef(false);
    const touching = useRef(false); // dito sulla ghiera: non si cambia giorno ne' si muove nulla finche' non lo si toglie
    const fromWheel = useRef(false); // il giorno e' cambiato perche' l'ha scelto la ghiera: non va ririportata la ghiera in posizione
    const onWheelScroll = () => {
        paint();
        const el0 = wheel.current;
        if (el0) {
            const i = Math.round(el0.scrollLeft / ITEM);
            if ((i < 50 || i > WHEEL * 2 - 50) && wheelDays[i]) {
                recenter.current = true;
                setAnchor(wheelDays[i]);
                return;
            }
        }
        clearTimeout(settle.current);
        settle.current = setTimeout(() => {
            const el = wheel.current;
            if (!el || touching.current) return;
            const idx = Math.max(0, Math.min(WHEEL * 2, Math.round(el.scrollLeft / ITEM)));
            const d = wheelDays[idx];
            if (d && !sameDay(d, date)) {
                fromWheel.current = true;
                setDate(d);
            }
        }, 140);
    };
    // quando la data cambia da fuori (Oggi, calendario del mese) la ghiera ruota fino a li'
    useEffect(() => {
        if (fromWheel.current) {
            fromWheel.current = false;
            paint();
            return;
        }
        const el = wheel.current;
        const idx = diffDays(date) + WHEEL;
        if (idx < 0 || idx > WHEEL * 2) {
            setAnchor(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
            return;
        }
        if (el && Math.abs(el.scrollLeft - idx * ITEM) > 2) el.scrollTo({ left: idx * ITEM, behavior: monthOpen || recenter.current ? 'auto' : 'smooth' });
        paint();
    }, [date, anchor, monthOpen]); // eslint-disable-line react-hooks/exhaustive-deps
    // dopo la ricentratura il giorno al centro resta lo stesso: si riporta lo scorrimento a meta' senza che si veda
    useLayoutEffect(() => {
        if (recenter.current && wheel.current) {
            wheel.current.style.scrollSnapType = 'none';
            wheel.current.scrollLeft = WHEEL * ITEM;
            wheel.current.style.scrollSnapType = '';
            recenter.current = false;
            paint();
        }
    }, [anchor]); // eslint-disable-line react-hooks/exhaustive-deps
    const latestScroll = useRef(null);
    latestScroll.current = onWheelScroll;
    // con il mouse (anteprima, tablet con trackpad) la ghiera si trascina e gira anche con la rotellina
    useEffect(() => {
        const el = wheel.current;
        if (!el) return undefined;
        let down = null;
        let moved = false;
        const onDown = (e) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = { x: e.clientX, sl: el.scrollLeft };
            moved = false;
        };
        const onMove = (e) => {
            if (!down) return;
            const dx = e.clientX - down.x;
            if (!moved && Math.abs(dx) < 4) return;
            if (!moved) {
                moved = true;
                touching.current = true;
                el.style.scrollSnapType = 'none';
                el.style.cursor = 'grabbing';
            }
            el.scrollLeft = down.sl - dx;
        };
        const onUp = () => {
            if (!down) return;
            down = null;
            if (!moved) return;
            el.style.scrollSnapType = '';
            el.style.cursor = '';
            touching.current = false;
            el.scrollTo({ left: Math.round(el.scrollLeft / ITEM) * ITEM, behavior: 'smooth' });
            latestScroll.current();
        };
        const onClickCap = (e) => {
            if (moved) {
                e.stopPropagation();
                e.preventDefault();
                moved = false;
            }
        };
        const onWheelEv = (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };
        el.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        el.addEventListener('click', onClickCap, true);
        el.addEventListener('wheel', onWheelEv, { passive: false });
        return () => {
            el.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            el.removeEventListener('click', onClickCap, true);
            el.removeEventListener('wheel', onWheelEv);
        };
    }, [monthOpen]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => clearTimeout(settle.current), []);

    // la giornata: appuntamenti + spazi liberi dentro gli orari di studio
    const day = useMemo(() => visible.filter((a) => a.start.slice(0, 10) === dateKey(date)).sort((a, b) => minutesOf(a) - minutesOf(b)), [visible, date]);
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
                            <Button className="m-gbtn-text agm-today" onClick={() => setDate(new Date())}>Oggi</Button>
                        )}
                    </div>
                    <span className="m-nav-title is-on">Agenda</span>
                    <div className="m-nav-side end">
                        <GlassIconButton icon="ph-dots-three-circle" onClick={() => setMenu(true)} aria-label="Altre azioni" />
                        <GlassIconButton solid icon="ph-plus" onClick={() => onNew(date, null)} aria-label="Nuovo appuntamento" />
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
                            <GlassIconButton icon="ph-caret-left" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} aria-label="Mese precedente" />
                            <GlassIconButton icon="ph-caret-right" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} aria-label="Mese successivo" />
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
                    <div className="agm-wheel">
                        <span className="agm-wheel-pick" aria-hidden="true"></span>
                        <div className="agm-wheel-strip no-scrollbar" ref={wheel} onScroll={onWheelScroll} onTouchStart={() => (touching.current = true)} onTouchEnd={() => { touching.current = false; onWheelScroll(); }} onTouchCancel={() => (touching.current = false)}>
                            {wheelDays.map((d) => (
                                <button key={dateKey(d)} className={`agm-wd ${sameDay(d, new Date()) ? 'today' : ''}`} onClick={() => setDate(d)} aria-label={d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}>
                                    <b>{d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '').slice(0, 3)}</b>
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
                </div>

                <div key={`${dateKey(date)}-${place}`} className="ag-content">
                <DayList day={day} date={date} db={db} settings={settings} onNew={onNew} onOpen={onOpen} />
                </div>
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
