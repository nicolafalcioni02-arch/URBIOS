// Agenda completa: giorno / settimana / mese, mini calendario, prossimi appuntamenti, export .ics.
// Gli orari di disponibilità, le durate e i luoghi arrivano dalle impostazioni del professionista (quelle del contratto).
import React, { useMemo, useState } from 'react';
import { useAgenda } from '../../components/agenda/useAgenda';
import { addDays, apptTitle, buildIcs, dateKey, defaultDur, endOf, fmtTime, fromKey, isActive, mondayOf, newApptId, sameDay, startOf, timelineBounds, tipoOf } from '../../components/agenda/agendaLogic';
import { AppointmentSheet } from './AppointmentSheet';
import { DayTimeline } from './DayTimeline';
import { MonthGrid } from './MonthGrid';
import { agendaStyles } from './agendaStyles';

const MONTHS_IT = (d) => d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

const MiniMonth = ({ date, onPick, marks }) => {
    const [view, setView] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
    const start = mondayOf(view);
    const weeks = Math.ceil((((view.getDay() + 6) % 7) + new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()) / 7);
    const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    return (
        <div className="ag-card">
            <div className="ag-mini-head">
                <button className="ag-icon" style={{ width: 30, height: 30 }} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} aria-label="Mese precedente">
                    <i className="ph-bold ph-caret-left" />
                </button>
                <span>{MONTHS_IT(view)}</span>
                <button className="ag-icon" style={{ width: 30, height: 30 }} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Mese successivo">
                    <i className="ph-bold ph-caret-right" />
                </button>
            </div>
            <div className="ag-mini">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                    <b key={i}>{d}</b>
                ))}
                {days.map((d) => (
                    <button key={dateKey(d)} className={`${d.getMonth() !== view.getMonth() ? 'out' : ''} ${sameDay(d, new Date()) ? 'today' : ''} ${sameDay(d, date) ? 'sel' : ''}`} onClick={() => onPick(d)}>
                        {d.getDate()}
                        {marks[dateKey(d)] ? <i /> : null}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const AgendaView = ({ db, onUpdateDb, initial, onBack, onOpenPatient, onOpenSettings }) => {
    const { items, settings, save, remove } = useAgenda(db, onUpdateDb);
    const [date, setDate] = useState(() => (initial && initial.date ? fromKey(initial.date) : new Date()));
    const [view, setView] = useState('giorno');
    const [sheet, setSheet] = useState(null); // { draft, isNew }
    const [names, setNames] = useState(false); // nell'export .ics includere i nomi dei pazienti?
    const [menu, setMenu] = useState(false);

    // aperto da un widget: giornata scelta, eventuale appuntamento da aprire o nuovo da creare
    React.useEffect(() => {
        if (!initial) return;
        if (initial.open) {
            const a = items.find((x) => x.id === initial.open);
            if (a) setSheet({ draft: a, isNew: false });
        } else if (initial.newAppt) newAt(initial.date ? fromKey(initial.date) : new Date(), null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const marks = useMemo(() => {
        const m = {};
        items.filter(isActive).forEach((a) => (m[a.start.slice(0, 10)] = true));
        return m;
    }, [items]);

    const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i)), [date]);
    const dates = view === 'settimana' ? weekDates : [date];
    const visible = useMemo(() => {
        const keys = new Set(dates.map(dateKey));
        return items.filter((a) => keys.has(a.start.slice(0, 10)));
    }, [items, dates]); // eslint-disable-line react-hooks/exhaustive-deps
    const bounds = useMemo(() => timelineBounds(settings, visible), [settings, visible]);

    const upcoming = useMemo(() => items.filter((a) => isActive(a) && endOf(a) > new Date()).slice(0, 6), [items]);
    const todayCount = items.filter((a) => isActive(a) && sameDay(startOf(a), new Date())).length;
    const weekCount = items.filter((a) => isActive(a) && weekDates.some((d) => sameDay(d, startOf(a)))).length;

    function newAt(d, minutes, tipo = 'controllo') {
        const now = new Date();
        const base = minutes != null ? minutes : sameDay(d, now) ? Math.min(23 * 60, (now.getHours() + 1) * 60) : (bounds.start || 540) + 60;
        const patient = (db.pazienti || []).length === 1 ? db.pazienti[0].id : '';
        setSheet({
            isNew: true,
            draft: { id: newApptId(), start: `${dateKey(d)}T${fmtTime(base)}`, dur: defaultDur(tipo, settings), pid: patient, titolo: '', tipo, luogo: settings.places[0] || '', note: '', stato: 'confermato' },
        });
    }

    const step = (dir) => {
        if (view === 'mese') setDate(new Date(date.getFullYear(), date.getMonth() + dir, 1));
        else setDate(addDays(date, dir * (view === 'settimana' ? 7 : 1)));
    };
    const title =
        view === 'mese'
            ? MONTHS_IT(date)
            : view === 'settimana'
              ? `${weekDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} – ${weekDates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const exportIcs = () => {
        const blob = new Blob([buildIcs(db, items.filter((a) => startOf(a) > addDays(new Date(), -1)), names)], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a');
        el.href = url;
        el.download = 'URBIOS_agenda.ics';
        el.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMenu(false);
    };

    return (
        <div className="ag-wrap font-sans">
            <style>{agendaStyles}</style>
            <div className="ag-top">
                <button className="ag-icon" onClick={onBack} aria-label="Indietro">
                    <i className="ph ph-arrow-left" />
                </button>
                <h1 className="ag-title">Agenda</h1>
                <span style={{ flex: 1 }} />
                <div className="ag-views" role="tablist">
                    {['giorno', 'settimana', 'mese'].map((v) => (
                        <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)} role="tab">
                            {v[0].toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative' }}>
                    <button className="ag-icon" onClick={() => setMenu((v) => !v)} aria-label="Altro">
                        <i className="ph ph-dots-three" />
                    </button>
                    {menu && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setMenu(false)} />
                            <div className="ag-card" style={{ position: 'absolute', right: 0, top: 44, zIndex: 21, width: 260, boxShadow: '0 16px 40px rgba(0,0,0,.18)' }}>
                                <button className="ag-link" onClick={exportIcs}>
                                    <i className="ph ph-export" /> Esporta .ics (Apple, Google, Outlook)
                                </button>
                                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={names} onChange={(e) => setNames(e.target.checked)} style={{ marginTop: 3 }} />
                                    Includi i nomi dei pazienti nel file (di default no, per la privacy)
                                </label>
                            </div>
                        </>
                    )}
                </div>
                <button className="vw-next" style={{ height: 44 }} onClick={() => newAt(date, null)}>
                    <i className="ph-bold ph-plus" /> <span>Nuovo</span>
                </button>
            </div>

            <div className="ag-layout">
                <aside className="ag-side">
                    <MiniMonth date={date} marks={marks} onPick={(d) => setDate(d)} />
                    <div className="ag-card">
                        <h4>Prossimi</h4>
                        <div className="ag-next">
                            {upcoming.length === 0 && <p className="ag-empty">Nessun appuntamento in programma.</p>}
                            {upcoming.map((a) => {
                                const d = startOf(a);
                                const today = sameDay(d, new Date());
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => {
                                            setDate(d);
                                            setSheet({ draft: a, isNew: false });
                                        }}
                                    >
                                        <span className="dot" style={{ '--c': tipoOf(a.tipo).color }} />
                                        <span className="when">
                                            <b>{today ? 'Oggi' : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}</b>
                                            {a.start.split('T')[1]}
                                        </span>
                                        <span className="what">{apptTitle(db, a)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="ag-card ag-set">
                        <h4>Il tuo studio</h4>
                        <p>
                            Oggi <b>{todayCount}</b> · settimana <b>{weekCount}</b>
                        </p>
                        <p>
                            Disponibilità: <b>{settings.hoursDefault ? 'non impostata (uso lun–ven 9–18)' : settings.hoursText.replace(/\s*\n\s*/g, ' · ')}</b>
                        </p>
                        <p>
                            Prima visita <b>{settings.durFirst}'</b> · controllo <b>{settings.durCheck}'</b>
                        </p>
                        {settings.policy && <p>Disdetta: {settings.policy}</p>}
                        <button className="ag-link" onClick={onOpenSettings}>
                            Modifica orari e durate →
                        </button>
                    </div>
                </aside>

                <section className="ag-main">
                    <div className="ag-bar">
                        <button className="ag-icon" onClick={() => step(-1)} aria-label="Precedente">
                            <i className="ph-bold ph-caret-left" />
                        </button>
                        <button className="ag-icon" onClick={() => step(1)} aria-label="Successivo">
                            <i className="ph-bold ph-caret-right" />
                        </button>
                        <button className="vw-chip" onClick={() => setDate(new Date())}>
                            Oggi
                        </button>
                        <h2>{title}</h2>
                    </div>
                    {view === 'mese' ? (
                        <MonthGrid
                            date={date}
                            items={items}
                            db={db}
                            onPickDay={(d) => {
                                setDate(d);
                                setView('giorno');
                            }}
                            onOpen={(a) => setSheet({ draft: a, isNew: false })}
                        />
                    ) : (
                        <DayTimeline dates={dates} items={items} db={db} settings={settings} bounds={bounds} onSlot={(d, min) => newAt(d, min)} onOpen={(a) => setSheet({ draft: a, isNew: false })} />
                    )}
                </section>
            </div>

            {sheet && (
                <AppointmentSheet
                    key={sheet.draft.id}
                    draft={sheet.draft}
                    isNew={sheet.isNew}
                    db={db}
                    settings={settings}
                    items={items}
                    onClose={() => setSheet(null)}
                    onSave={(a) => {
                        save(a);
                        setDate(startOf(a));
                        setSheet(null);
                    }}
                    onDelete={(id) => {
                        remove(id);
                        setSheet(null);
                    }}
                    onOpenPatient={onOpenPatient}
                />
            )}
        </div>
    );
};
