import React from 'react';

// Laboratorio: articoli di magazzino da controllare (scaduti, in scadenza, scorta bassa)
export const LabStock = ({ db }) => {
    const ov = (db && db.labOv) || { scaduti: [], scadenza: [], scorta: [] };
    const rows = [
        ...ov.scaduti.map((r) => ({ r, t: 'Scaduto' })),
        ...ov.scadenza.map((r) => ({ r, t: 'In scadenza' })),
        ...ov.scorta.map((r) => ({ r, t: 'Scorta bassa' })),
    ];
    return (
        <div className="wd-card wd-agenda">
            <p className="wd-title">Magazzino <small>{rows.length ? `${rows.length} da controllare` : 'tutto a posto'}</small></p>
            {rows.length === 0 && <p className="wd-empty-msg">Nessuna scadenza né scorta bassa.</p>}
            <ul className="wd-list">
                {rows.slice(0, 5).map(({ r, t }) => (
                    <li key={t + r.id}>
                        <span className="wd-row">
                            <span className="wd-when"><b>{t}</b></span>
                            <span className="wd-what">{r.nome || r.codice || 'Articolo'}</span>
                        </span>
                    </li>
                ))}
            </ul>
            {rows.length > 5 && <p className="wd-more">+ altri {rows.length - 5}</p>}
        </div>
    );
};
