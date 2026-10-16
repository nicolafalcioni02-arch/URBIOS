import React, { useMemo, useState } from 'react';

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const ym = (iso) => {
    const [y, m] = String(iso).split('-').map(Number);
    return { y, m: m - 1 };
};

// Calendario del filtro: si apre sul mese dell'ultima visita (o del giorno già scelto), si sfoglia per mese o saltando ai mesi con visite
export const MiniCalendar = ({ visitDates, selected, onSelectDate }) => {
    const today = new Date();
    const sorted = useMemo(() => [...new Set(visitDates)].sort(), [visitDates]);
    const start = ym(selected || sorted[sorted.length - 1] || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`);
    const [view, setView] = useState(start);
    const [dir, setDir] = useState('fwd');

    const visitSet = useMemo(() => new Set(sorted), [sorted]);
    const monthsWithVisits = useMemo(() => {
        const seen = new Map();
        sorted.forEach((iso) => {
            const { y, m } = ym(iso);
            const k = `${y}-${m}`;
            seen.set(k, { y, m, n: (seen.get(k)?.n || 0) + 1 });
        });
        return [...seen.values()].reverse();
    }, [sorted]);

    const go = (y, m) => {
        setDir(y * 12 + m >= view.y * 12 + view.m ? 'fwd' : 'back');
        setView({ y, m });
    };
    const step = (delta) => {
        const t = view.y * 12 + view.m + delta;
        go(Math.floor(t / 12), ((t % 12) + 12) % 12);
    };

    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // lunedì = 0
    const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const iso = (d) => `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const monthVisits = cells.filter((d) => d && visitSet.has(iso(d))).length;
    const isToday = (d) => d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();

    return (
        <div className="fc">
            <div className="fc-nav">
                <button onClick={() => step(-1)} className="hs-icon" aria-label="Mese precedente">
                    <i className="ph-bold ph-caret-left"></i>
                </button>
                <p className="fc-month">
                    {MONTHS[view.m]} <span>{view.y}</span>
                </p>
                <button onClick={() => step(1)} className="hs-icon" aria-label="Mese successivo">
                    <i className="ph-bold ph-caret-right"></i>
                </button>
            </div>

            <div className="fc-week" aria-hidden="true">
                {DAYS.map((d) => (
                    <span key={d}>{d}</span>
                ))}
            </div>

            <div key={`${view.y}-${view.m}`} className={`fc-grid ${dir === 'fwd' ? 'step-fwd' : 'step-back'}`}>
                {cells.map((d, i) => {
                    if (!d) return <span key={`e-${i}`} />;
                    const has = visitSet.has(iso(d));
                    const sel = selected === iso(d);
                    const label = new Date(view.y, view.m, d).toLocaleDateString('it-IT', { dateStyle: 'long' });
                    return has ? (
                        <button key={d} onClick={() => onSelectDate(iso(d))} className={`fc-day is-visit ${sel ? 'is-sel' : ''}`} aria-label={`Visita del ${label}`} aria-pressed={sel}>
                            {d}
                        </button>
                    ) : (
                        <span key={d} className={`fc-day ${isToday(d) ? 'is-today' : ''}`} aria-label={label}>
                            {d}
                        </span>
                    );
                })}
            </div>

            <p className="fc-count">{monthVisits === 0 ? 'Nessuna visita in questo mese' : monthVisits === 1 ? '1 visita in questo mese' : `${monthVisits} visite in questo mese`}</p>

            {monthsWithVisits.length > 0 && (
                <div className="fc-jump">
                    <p>Salta a</p>
                    <div>
                        {monthsWithVisits.map((mv) => (
                            <button key={`${mv.y}-${mv.m}`} onClick={() => go(mv.y, mv.m)} className={mv.y === view.y && mv.m === view.m ? 'is-on' : ''}>
                                {MONTHS_SHORT[mv.m]} {String(mv.y).slice(2)}
                                <b>{mv.n}</b>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
