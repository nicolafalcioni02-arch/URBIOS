import React from 'react';
import { agendaSettings, apptTitle, dateKey, endOf, isActive, sameDay, startOf, tipoOf } from '../../agenda/agendaLogic';

const dayLabel = (d) => {
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 86400000);
    if (diff === 0) return 'Oggi';
    if (diff === 1) return 'Domani';
    if (diff < 7) return d.toLocaleDateString('it-IT', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase());
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
};

// Prossimi appuntamenti: legge l'agenda condivisa (db.agenda). Un clic apre la giornata nell'Agenda.
export const Agenda = ({ db, onOpenAgenda }) => {
    const all = Array.isArray(db && db.agenda) ? db.agenda : [];
    const settings = agendaSettings((db && db.utente) || {});
    const now = new Date();
    const upcoming = all.filter((a) => isActive(a) && endOf(a) > now).sort((a, b) => startOf(a) - startOf(b));
    const today = upcoming.filter((a) => sameDay(startOf(a), now));
    const next = upcoming[0];
    return (
        <div className="wd-card wd-agenda">
            <p className="wd-title">
                Appuntamenti
                <button className="wd-round" onClick={() => onOpenAgenda({ date: dateKey(now), newAppt: true })} aria-label="Nuovo appuntamento">
                    <i className="ph-bold ph-plus" />
                </button>
            </p>
            <p className="wd-sum">
                {today.length === 0 ? 'Oggi libero' : `Oggi ${today.length} ${today.length === 1 ? 'appuntamento' : 'appuntamenti'}`}
                {next && ` · prossimo ${sameDay(startOf(next), now) ? 'alle ' + next.start.split('T')[1] : dayLabel(startOf(next)).toLowerCase()}`}
            </p>
            {upcoming.length === 0 && (
                <p className="wd-empty-msg">
                    Nessun appuntamento in programma.
                    <br />
                    {settings.hoursDefault ? 'Imposta la disponibilità in Impostazioni.' : 'Tocca + per aggiungerne uno.'}
                </p>
            )}
            <ul className="wd-list">
                {upcoming.slice(0, 8).map((a) => {
                    const d = startOf(a);
                    return (
                        <li key={a.id} className={sameDay(d, now) ? 'today' : ''}>
                            <button className="wd-row" onClick={() => onOpenAgenda({ date: dateKey(d), open: a.id })}>
                                <i className="wd-dot" style={{ background: tipoOf(a.tipo).color }} />
                                <span className="wd-when">
                                    <b>{dayLabel(d)}</b>
                                    {a.start.split('T')[1]}
                                </span>
                                <span className="wd-what">{apptTitle(db, a)}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            <button className="wd-open" onClick={() => onOpenAgenda({ date: dateKey(now) })}>
                Apri agenda <i className="ph ph-arrow-right" />
            </button>
        </div>
    );
};
