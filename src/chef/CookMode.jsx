import React, { useEffect, useState } from 'react';

// Modalità "Cucina": un passaggio alla volta, a tutto schermo; frecce da tastiera, anello di avanzamento
export const CookMode = ({ recipe, onClose }) => {
    const steps = recipe.steps?.length ? recipe.steps : ['Nessun passaggio scritto per questa ricetta.'];
    const [k, setK] = useState(0);
    const go = (d) => setK((x) => Math.min(steps.length - 1, Math.max(0, x + d)));
    useEffect(() => {
        const h = (e) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    });
    const R = 26, C = 2 * Math.PI * R;
    return (
        <div className="ch-cook">
            <div className="ch-cook-top">
                <span className="ch-serif text-[22px] flex-1 truncate">{recipe.title}</span>
                <button className="vw-chip !px-0 w-9 !h-9 justify-center" onClick={onClose} aria-label="Chiudi"><i className="ph ph-x"></i></button>
            </div>
            <div className="ch-cook-bar"><i style={{ width: `${((k + 1) / steps.length) * 100}%` }}></i></div>
            <div className="ch-cook-main" key={k}>
                <div className="ch-cook-n ch-serif">{k + 1}</div>
                <p>{steps[k]}</p>
            </div>
            <div className="ch-cook-foot">
                <button className="vw-chip" onClick={() => go(-1)} disabled={k === 0} style={{ opacity: k === 0 ? 0.35 : 1 }}><i className="ph ph-arrow-left"></i>Indietro</button>
                <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r={R} fill="none" stroke="var(--line)" strokeWidth="4" />
                    <circle cx="32" cy="32" r={R} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - (k + 1) / steps.length)} transform="rotate(-90 32 32)" style={{ transition: 'stroke-dashoffset .5s var(--ease)' }} />
                    <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">{k + 1}/{steps.length}</text></svg>
                {k < steps.length - 1 ? <button className="vw-next" style={{ height: 44 }} onClick={() => go(1)}><span>Avanti</span><i className="ph ph-arrow-right"></i></button>
                    : <button className="vw-next" style={{ height: 44 }} onClick={onClose}><span>Buon appetito</span><i className="ph ph-check"></i></button>}
            </div>
        </div>
    );
};
