import React from 'react';

const GOAL = 8;
const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-GG locale

// Contatore dei bicchieri d'acqua: si azzera da solo ogni giorno.
export const WaterGlasses = ({ data, setData, db }) => {
    const count = data.day === today() ? data.count || 0 : 0;
    const set = (n) => setData({ day: today(), count: n });
    return (
        <div className={`wd-card wd-water${db && db.labOv ? ' lab' : ''}`}>
            <p className="wd-water-title">
                Acqua di oggi <b>{(count * 0.25).toLocaleString('it-IT', { maximumFractionDigits: 2 })} L</b>
            </p>
            <div className="wd-glasses">
                {Array.from({ length: GOAL }, (_, i) => (
                    <button key={i} onClick={() => set(count === i + 1 ? i : i + 1)} aria-label={`Bicchiere ${i + 1}`} className={i < count ? 'full' : ''}>
                        <svg viewBox="0 0 24 30">
                            <path d="M3 3h18l-2.2 22a3 3 0 0 1-3 2.7H8.2a3 3 0 0 1-3-2.7z" style={{ fill: 'var(--wd-bg)', stroke: 'var(--wd-mut)' }} strokeWidth="1.5" strokeLinejoin="round" />
                            <path className="water" d="M4.4 15h15.2l-1.6 10.2a2.3 2.3 0 0 1-2.3 2H8.3a2.3 2.3 0 0 1-2.3-2z" style={{ fill: 'var(--wd-acc)' }} />
                        </svg>
                    </button>
                ))}
            </div>
            <p className="wd-water-sub">{count >= GOAL ? 'Obiettivo raggiunto! 💧' : `${GOAL - count} ${GOAL - count === 1 ? 'bicchiere' : 'bicchieri'} all’obiettivo`}</p>
        </div>
    );
};
