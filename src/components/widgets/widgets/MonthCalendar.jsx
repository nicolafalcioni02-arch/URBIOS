import React, { useState } from 'react';
import { dateKey, isActive } from '../../agenda/agendaLogic';

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

// Calendario del mese in sincrono con l'agenda: un puntino sotto i giorni con appuntamenti, clic = si apre la giornata.
export const MonthCalendar = ({ db, onOpenAgenda }) => {
    const today = new Date();
    const lab = !!(db && db.labOv);
    const [wk, setWk] = useState(0); // laboratorio: due settimane alla volta, si sfoglia di una settimana
    const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
    const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // lunedì per primo
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    const go = (d) => setView(({ y, m }) => ({ y: y + Math.floor((m + d) / 12), m: (m + d + 12) % 12 }));
    const isToday = (d) => d && d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
    const marks = {};
    (Array.isArray(db && db.agenda) ? db.agenda : []).filter(isActive).forEach((a) => (marks[a.start.slice(0, 10)] = (marks[a.start.slice(0, 10)] || 0) + 1));
    if (lab) {
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) + wk * 7);
        const days = Array.from({ length: 14 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
        const same = (a, b) => dateKey(a) === dateKey(b);
        return (
            <div className="wd-card wd-cal lab">
                <div className="wd-cal-head">
                    <button onClick={() => setWk((n) => n - 1)} aria-label="Settimana precedente"><i className="ph-bold ph-caret-left" /></button>
                    <span>{MONTHS[days[6].getMonth()]} <small>{days[6].getFullYear()}</small></span>
                    <button onClick={() => setWk((n) => n + 1)} aria-label="Settimana successiva"><i className="ph-bold ph-caret-right" /></button>
                </div>
                <div className="wd-cal-grid">
                    {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => <b key={i}>{d}</b>)}
                    {days.map((d) => (
                        <button key={dateKey(d)} className={`${same(d, today) ? 'today' : ''} ${d.getDay() === 0 ? 'sun' : ''} ${marks[dateKey(d)] ? 'has' : ''}`} onClick={() => onOpenAgenda({ date: dateKey(d) })}>{d.getDate()}</button>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="wd-card wd-cal">
            <div className="wd-cal-head">
                <button onClick={() => go(-1)} aria-label="Mese precedente">
                    <i className="ph-bold ph-caret-left" />
                </button>
                <span>
                    {MONTHS[view.m]} <small>{view.y}</small>
                </span>
                <button onClick={() => go(1)} aria-label="Mese successivo">
                    <i className="ph-bold ph-caret-right" />
                </button>
            </div>
            <div className="wd-cal-grid">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                    <b key={i}>{d}</b>
                ))}
                {cells.map((d, i) =>
                    d ? (
                        <button key={i} className={`${isToday(d) ? 'today' : ''} ${i % 7 === 6 ? 'sun' : ''} ${marks[dateKey(new Date(view.y, view.m, d))] ? 'has' : ''}`} onClick={() => onOpenAgenda({ date: dateKey(new Date(view.y, view.m, d)) })} title="Apri la giornata nell'agenda">
                            {d}
                        </button>
                    ) : (
                        <span key={i} />
                    )
                )}
            </div>
        </div>
    );
};
