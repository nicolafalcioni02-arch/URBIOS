import React from 'react';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '');

// Laboratorio: esperimenti in corso o da ripetere e campioni aperti (db.labOv, preparato da Lab.jsx)
export const LabRunning = ({ db }) => {
    const ov = (db && db.labOv) || { inCorso: [], campioniAperti: [] };
    const exp = ov.inCorso.slice(0, 5);
    return (
        <div className="wd-card wd-agenda">
            <p className="wd-title">Esperimenti <small>{ov.inCorso.length} in corso</small></p>
            {exp.length === 0 && <p className="wd-empty-msg">Nessun esperimento in corso.</p>}
            <ul className="wd-list">
                {exp.map((r) => (
                    <li key={r.id}>
                        <span className="wd-row">
                            <span className="wd-when"><b>{fmt(r.data)}</b>{r.stato}</span>
                            <span className="wd-what">{r.titolo || 'Senza titolo'}</span>
                        </span>
                    </li>
                ))}
            </ul>
            {ov.campioniAperti.length > 0 && <p className="wd-more">{ov.campioniAperti.length} campioni aperti</p>}
            {ov.inCorso.length > 5 && <p className="wd-more">+ altri {ov.inCorso.length - 5}</p>}
        </div>
    );
};
