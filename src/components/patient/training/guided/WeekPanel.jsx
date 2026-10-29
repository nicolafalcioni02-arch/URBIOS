import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { move } from './trainingGuidedLogic';

// Dettagli di una settimana (dalla griglia): nome, scarico, posizione, duplica, elimina (con conferma).
export const WeekPanel = ({ weeks, setWeeks, weekId, ops, onClose }) => {
    const [confirm, setConfirm] = useState(false);
    const i = weeks.findIndex((w) => w.id === weekId);
    const w = weeks[i];
    if (!w) return null;
    const shift = (to) => setWeeks((ws) => move(ws, i, to));

    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <div className="sheet t-cellsheet" onClick={(e) => e.stopPropagation()}>
                <div className="t-cell-head">
                    <div className="min-w-0">
                        <p>{w.title || `Settimana ${i + 1}`}</p>
                        <span>Settimana {i + 1} di {weeks.length} · {w.days.length} {w.days.length === 1 ? 'seduta' : 'sedute'}</span>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>

                <div className="t-wk-field">
                    <label className="fld-label">Nome</label>
                    <input className="fld" value={w.title} onChange={(e) => ops.updateWeekField(w.id, 'title', e.target.value)} placeholder={`Settimana ${i + 1}`} />
                </div>
                <label className="t-wk-switch">
                    <span>
                        <b>Settimana di scarico</b>
                        <small>Meno volume e/o carico per recuperare</small>
                    </span>
                    <input type="checkbox" checked={w.kind === 'deload'} onChange={(e) => ops.updateWeekField(w.id, 'kind', e.target.checked ? 'deload' : '')} />
                </label>

                <div className="t-wk-actions">
                    <button className="dg-sm" disabled={i === 0} onClick={() => shift(i - 1)}>
                        <i className="ph ph-arrow-left"></i> Prima
                    </button>
                    <button className="dg-sm" disabled={i === weeks.length - 1} onClick={() => shift(i + 1)}>
                        Dopo <i className="ph ph-arrow-right"></i>
                    </button>
                    <button className="dg-sm" onClick={() => { ops.duplicateWeek(w.id); onClose(); }}>
                        <i className="ph ph-copy"></i> Duplica
                    </button>
                </div>

                {weeks.length > 1 && (confirm ? (
                    <div className="t-wk-del">
                        <p>Eliminare questa settimana? Sedute ed esercizi andranno persi.</p>
                        <div>
                            <button className="dg-sm" onClick={() => setConfirm(false)}>Annulla</button>
                            <button className="dg-sm t-danger" onClick={() => { ops.removeWeek(w.id); onClose(); }}>Sì, elimina</button>
                        </div>
                    </div>
                ) : (
                    <button className="t-wk-delbtn" onClick={() => setConfirm(true)}>
                        <i className="ph ph-trash"></i> Elimina la settimana
                    </button>
                ))}
                <button className="vw-next t-cell-done" onClick={onClose}>Fatto</button>
            </div>
        </div>,
        document.body
    );
};
