import React from 'react';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Compleanni dei pazienti (dalla data di nascita in anagrafica): oggi e prossimi 30 giorni.
export const Birthdays = ({ db }) => {
    const today = startOfDay(new Date());
    const list = ((db && db.pazienti) || [])
        .map((p) => {
            const b = p.dataNascita ? new Date(p.dataNascita) : null;
            if (!b || isNaN(b)) return null;
            let next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
            if (next < today) next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
            return { p, days: Math.round((next - today) / 86400000), age: next.getFullYear() - b.getFullYear(), next };
        })
        .filter((x) => x && x.days <= 30)
        .sort((a, b) => a.days - b.days);
    const now = list.filter((x) => x.days === 0);
    const soon = list.filter((x) => x.days > 0).slice(0, 3);
    return (
        <div className="wd-card wd-bday">
            <p className="wd-title">
                <span>
                    <i className="ph-fill ph-cake" /> Compleanni
                </span>
            </p>
            {now.length > 0 ? (
                <div className="wd-bday-now">
                    <small>Oggi</small>
                    {now.map((x) => (
                        <p key={x.p.id}>
                            <b>
                                {x.p.nome} {x.p.cognome}
                            </b>
                            <span>compie {x.age} anni 🎉</span>
                        </p>
                    ))}
                </div>
            ) : (
                <p className="wd-empty-msg">Oggi nessun compleanno</p>
            )}
            {soon.length > 0 && (
                <ul>
                    {soon.map((x) => (
                        <li key={x.p.id}>
                            <span>
                                {x.p.nome} {x.p.cognome}
                            </span>
                            <em>{x.days === 1 ? 'domani' : `tra ${x.days} giorni`}</em>
                        </li>
                    ))}
                </ul>
            )}
            {list.length === 0 && <p className="wd-more">Nessuno nei prossimi 30 giorni</p>}
        </div>
    );
};
