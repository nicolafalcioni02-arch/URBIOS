import React from 'react';
import { ShaderCanvas } from '../../visuals/ShaderCanvas';

// Pezzi comuni alle schermate guidate di Dieta e Training: stessa gerarchia, stesso aspetto, stessi effetti
// (gli stessi di "Nuova visita": sfera che cresce, passi sfumati, titolo editoriale, transizioni laterali).
//  1. GuidedHead: la sfera + il piano (nome · data · stato) a sinistra, gli strumenti globali a destra
//  2. GuidedSteps: i passi del lavoro con riepilogo e barra di avanzamento
//  3. StepTitle: titolo e indicazione del passo (scivola avanti/indietro con il passo)

export const GuidedHead = ({ plan, tools, progress = 0, kicker }) => {
    const scale = 0.72 + 0.28 * progress; // la sfera cresce man mano che il lavoro avanza
    return (
        <div className="dg-head no-print">
            <div className="dg-headmain">
                <div className="dg-orb" aria-hidden="true">
                    <div style={{ transform: `scale(${scale})` }}>
                        <ShaderCanvas size={52} />
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    {kicker && <p className="dg-kicker">{kicker}</p>}
                    {plan ? (
                        <button className="dg-planbtn" onClick={plan.onClick} title={plan.title || 'Nome, data, stato del piano'}>
                            <i className={`ph ${plan.icon || 'ph-clipboard-text'}`}></i>
                            <span>{plan.label}</span>
                            {plan.status && (
                                <b className="dg-stat" style={{ background: plan.status.bg, color: plan.status.color }}>
                                    {plan.status.label}
                                </b>
                            )}
                            <i className="ph ph-pencil-simple dg-edit"></i>
                        </button>
                    ) : null}
                </div>
            </div>
            <div className="dg-tools">
                {tools.map((t) => (
                    <button key={t.label} className={`dg-tool ${t.primary ? 'ai' : ''}`} onClick={t.onClick} title={t.title} aria-label={t.label}>
                        <i className={`ph ${t.icon}`}></i> <span className="dg-tool-l">{t.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const GuidedSteps = ({ steps, current, onGo, progress = 0 }) => (
    <nav className="dg-stepbar no-print" aria-label="Passi">
        {steps.map((s) => (
            <button key={s.id} className={`dg-step ${current === s.id ? 'on' : ''} ${s.locked ? 'locked' : ''}`} onClick={() => onGo(s.id)} aria-current={current === s.id ? 'step' : undefined}>
                <span className="dg-dot">{s.done && current !== s.id ? <i className="ph-bold ph-check"></i> : s.n}</span>
                <span className="min-w-0">
                    <b>{s.label}</b>
                    <small>{s.sub}</small>
                </span>
            </button>
        ))}
        <div className="dg-prog" aria-hidden="true">
            <i style={{ width: `${Math.round(progress * 100)}%` }}></i>
        </div>
    </nav>
);

// direzione della transizione: avanti se l'indice del passo cresce
export const stepDir = (prevIdx, idx) => (idx >= prevIdx ? 'dg-fwd' : 'dg-back');

export const StepTitle = ({ id, dir, title, hint }) => (
    <div key={`t-${id}`} className={dir}>
        <h2 className="dg-title">{title}</h2>
        <p className="dg-hint2">{hint}</p>
    </div>
);
