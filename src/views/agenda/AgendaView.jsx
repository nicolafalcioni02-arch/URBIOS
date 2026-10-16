// Agenda completa: giorno / settimana / mese, mini calendario, prossimi appuntamenti, export .ics.
// Gli orari di disponibilità, le durate e i luoghi arrivano dalle impostazioni del professionista (quelle del contratto).
import React, { useMemo, useState } from 'react';
import { useAgenda } from '../../components/agenda/useAgenda';
import { addDays, apptTitle, buildIcs, dateKey, defaultDur, endOf, fmtTime, fromKey, isActive, mondayOf, newApptId, sameDay, startOf, timelineBounds, tipoOf, placeColor, placeMark, isOnline, ONLINE_COLOR } from '../../components/agenda/agendaLogic';
import { AppointmentSheet } from './AppointmentSheet';
import { MonthGrid } from './MonthGrid';
import { agendaStyles } from './agendaStyles';
import { AgendaMobile } from './AgendaMobile';
import { DayList, WeekBoard } from './DayList';
import { useCompact } from '../../hooks/useCompact';

const MONTHS_IT = (d) => d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

export const AgendaView = ({ db, onUpdateDb, initial, onBack, onOpenPatient, onOpenSettings }) => {
    const { items: allItems, settings, save, remove } = useAgenda(db, onUpdateDb);
    // durata minima degli spazi liberi mostrati (si ricorda tra una visita e l'altra)
    const [slotStep, setSlotStepState] = useState(() => {
        try {
            const v = Number(localStorage.getItem('urbios_slotstep'));
            return [30, 45, 60, 90].includes(v) ? v : 30;
        } catch (e) {
            return 30;
        }
    });
    const setSlotStep = (m) => {
        setSlotStepState(m);
        try {
            localStorage.setItem('urbios_slotstep', String(m));
        } catch (e) {} // eslint-disable-line no-empty
    };
    const [place, setPlace] = useState('all'); // filtro per sede (solo se ce n'e' piu' d'una)
    const items = useMemo(() => (place === 'all' ? allItems : allItems.filter((a) => String(a.luogo || '').trim() === place)), [allItems, place]);
    const [date, setDate] = useState(() => (initial && initial.date ? fromKey(initial.date) : new Date()));
    const [view, setView] = useState('giorno');
    const [sheet, setSheet] = useState(null); // { draft, isNew }
    const [names, setNames] = useState(false); // nell'export .ics includere i nomi dei pazienti?
    const [menu, setMenu] = useState(false);
    const compact = useCompact(639);

    // aperto da un widget: giornata scelta, eventuale appuntamento da aprire o nuovo da creare
    React.useEffect(() => {
        if (!initial) return;
        if (initial.open) {
            const a = allItems.find((x) => x.id === initial.open);
            if (a) setSheet({ draft: a, isNew: false });
        } else if (initial.newAppt) newAt(initial.date ? fromKey(initial.date) : new Date(), null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const exportIcs = (withNames = names) => {
        const blob = new Blob([buildIcs(db, items.filter((a) => startOf(a) > addDays(new Date(), -1)), withNames)], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a');
        el.href = url;
        el.download = 'URBIOS_agenda.ics';
        el.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMenu(false);
    };

    const sheetEl = sheet && (
                <AppointmentSheet
                    key={sheet.draft.id}
                    draft={sheet.draft}
                    isNew={sheet.isNew}
                    db={db}
                    settings={settings}
                    items={allItems}
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
    );

    if (compact)
        return (
            <>
                <style>{agendaStyles}</style>
                <AgendaMobile db={db} items={allItems} settings={settings} date={date} setDate={setDate} onNew={(d, min) => newAt(d, min)} onOpen={(a) => setSheet({ draft: a, isNew: false })} onExport={exportIcs} onOpenSettings={onOpenSettings} />
                {sheetEl}
            </>
        );

    return (
        <div className="ag-wrap font-sans">
            <style>{agendaStyles}</style>
            <div className="ag-top">
                {onBack && (
                    <button className="ag-icon" onClick={onBack} aria-label="Indietro">
                        <i className="ph ph-arrow-left" />
                    </button>
                )}
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
                                <button className="ag-link" onClick={() => exportIcs()}>
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
                    <div className="ag-card ag-next-card">
                        <h4>Prossimi</h4>
                        {upcoming.length === 0 && (
                            <p className="ag-empty">
                                <i className="ph ph-calendar-blank" /> Nessun appuntamento in programma.
                            </p>
                        )}
                        <div className="ag-next">
                            {upcoming.map((a) => {
                                const d = startOf(a);
                                const today = sameDay(d, new Date());
                                const place = a.luogo && a.luogo.trim();
                                const c = place ? placeColor(settings.places, place) : tipoOf(a.tipo).color;
                                return (
                                    <button
                                        key={a.id}
                                        style={{ '--p': c }}
                                        onClick={() => {
                                            setDate(d);
                                            setView('giorno');
                                            setSheet({ draft: a, isNew: false });
                                        }}
                                    >
                                        <span className="tile">
                                            <small>{today ? 'oggi' : d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')}</small>
                                            <b>{d.getDate()}</b>
                                        </span>
                                        <span className="body">
                                            <span className="what">{apptTitle(db, a)}</span>
                                            <span className="meta">
                                                {a.start.split('T')[1]} · {tipoOf(a.tipo).label}
                                                {place && (isOnline(place) ? ' · Online' : ` · ${place}`)}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="ag-card ag-set">
                        <h4>Il tuo studio</h4>
                        <div className="ag-stats">
                            <div>
                                <b>{todayCount}</b>
                                <span>oggi</span>
                            </div>
                            <div>
                                <b>{weekCount}</b>
                                <span>questa settimana</span>
                            </div>
                        </div>
                        <div className="ag-kv">
                            <i className="ph ph-clock" />
                            <span>{settings.hoursDefault ? 'Lun–Ven 9–18 (non impostato)' : settings.hoursText.replace(/\s*\n\s*/g, ' · ')}</span>
                        </div>
                        <div className="ag-kv">
                            <i className="ph ph-timer" />
                            <span>
                                Prima visita <b>{settings.durFirst}'</b> · controllo <b>{settings.durCheck}'</b>
                            </span>
                        </div>
                        {settings.places.length > 0 && (
                            <div className="ag-sedi">
                                {settings.places.map((p) => (
                                    <span key={p} style={{ '--p': placeColor(settings.places, p) }}>
                                        <em>{placeMark(p)}</em>
                                        {p}
                                    </span>
                                ))}
                            </div>
                        )}
                        {settings.policy && (
                            <div className="ag-kv">
                                <i className="ph ph-prohibit" />
                                <span>{settings.policy}</span>
                            </div>
                        )}
                        <button className="ag-link" onClick={onOpenSettings}>
                            Modifica orari, durate e sedi →
                        </button>
                    </div>
                </aside>

                <section className="ag-main">
                    {settings.places.length > 1 && (
                        <div className="ag-places no-scrollbar">
                            {[{ id: 'all', label: 'Tutte le sedi' }, ...settings.places.map((p) => ({ id: p, label: p }))].map((p) => (
                                <button key={p.id} className={place === p.id ? 'on' : ''} onClick={() => setPlace(p.id)}>
                                    {p.id !== 'all' && <span className="dot" style={{ background: placeColor(settings.places, p.id) }} />}
                                    {p.label}
                                </button>
                            ))}
                            <button className={place === 'Online' ? 'on' : ''} onClick={() => setPlace(place === 'Online' ? 'all' : 'Online')}>
                                <span className="dot" style={{ background: ONLINE_COLOR }} />
                                Online
                            </button>
                        </div>
                    )}
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
                        <label className="ag-title-pick">
                            <h2>{title}</h2>
                            <i className="ph-bold ph-caret-down" />
                            <input type="date" value={dateKey(date)} onChange={(e) => e.target.value && setDate(fromKey(e.target.value))} aria-label="Vai alla data" />
                        </label>
                    </div>
                    <div key={`${view}-${dateKey(date)}-${slotStep}-${place}`} className="ag-content">
                    {view === 'mese' ? (
                        <MonthGrid
                            date={date}
                            items={items}
                            db={db}
                            settings={settings}
                            onPickDay={(d) => {
                                setDate(d);
                                setView('giorno');
                            }}
                            onOpen={(a) => setSheet({ draft: a, isNew: false })}
                        />
                    ) : (
                        view === 'settimana' ? (
                            <WeekBoard
                                step={slotStep}
                                setStep={setSlotStep}
                                dates={weekDates}
                                items={items}
                                db={db}
                                settings={settings}
                                onNew={(d, min) => newAt(d, min)}
                                onOpen={(a) => setSheet({ draft: a, isNew: false })}
                                onPickDay={(d) => {
                                    setDate(d);
                                    setView('giorno');
                                }}
                            />
                        ) : (
                            <div className="ag-daywrap">
                                <DayList step={slotStep} day={visible} date={date} db={db} settings={settings} onNew={(d, min) => newAt(d, min)} onOpen={(a) => setSheet({ draft: a, isNew: false })} />
                            </div>
                        )
                    )}
                    </div>
                </section>
            </div>

            {sheetEl}
        </div>
    );
};
