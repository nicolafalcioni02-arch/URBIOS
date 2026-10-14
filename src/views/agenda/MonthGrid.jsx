import React from 'react';
import { dateKey, addDays, mondayOf, isActive, apptTitle, tipoOf, sameDay, birthdaysOn } from '../../components/agenda/agendaLogic';

// Vista Mese: ogni giorno mostra gli appuntamenti (max 3); clic su un giorno = si apre quella giornata.
export const MonthGrid = ({ date, items, db, onPickDay, onOpen }) => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = mondayOf(first);
    const weeks = Math.ceil(((first.getDay() + 6) % 7 + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) / 7);
    const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    const byDay = {};
    items.filter(isActive).forEach((a) => (byDay[a.start.slice(0, 10)] = [...(byDay[a.start.slice(0, 10)] || []), a]));
    return (
        <div className="ag-month">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                <b key={d} className="ag-mh">
                    {d}
                </b>
            ))}
            {days.map((d) => {
                const list = byDay[dateKey(d)] || [];
                const bd = birthdaysOn(db, d);
                return (
                    <div key={dateKey(d)} className={`ag-cell ${d.getMonth() !== date.getMonth() ? 'out' : ''} ${sameDay(d, new Date()) ? 'today' : ''} ${sameDay(d, date) ? 'sel' : ''}`} onClick={() => onPickDay(d)}>
                        <span className="ag-num">
                            {d.getDate()}
                            {bd.length > 0 && <em title="Compleanno">🎂</em>}
                        </span>
                        {list.slice(0, 3).map((a) => (
                            <button
                                key={a.id}
                                className="ag-chip"
                                style={{ '--c': tipoOf(a.tipo).color }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpen(a);
                                }}
                            >
                                <i />
                                <span>{a.start.split('T')[1]}</span> {apptTitle(db, a)}
                            </button>
                        ))}
                        {list.length > 3 && <small className="ag-more">+ altri {list.length - 3}</small>}
                    </div>
                );
            })}
        </div>
    );
};
