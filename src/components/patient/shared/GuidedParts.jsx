import React from 'react';

// Pezzi comuni alle schermate guidate di Dieta e Training: stessa gerarchia, stesso aspetto.
//  1. GuidedHead: il piano (nome · data · stato) a sinistra, gli strumenti globali a destra
//  2. GuidedSteps: i passi del lavoro, ognuno con un riepilogo
//  3. il contenuto del passo (lo scrive ogni sezione)

export const GuidedHead = ({ plan, tools }) => (
    <div className="dg-head no-print">
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
        ) : (
            <span></span>
        )}
        <div className="dg-tools">
            {tools.map((t) => (
                <button key={t.label} className={`dg-tool ${t.primary ? 'ai' : ''}`} onClick={t.onClick} title={t.title}>
                    <i className={`ph ${t.icon}`}></i> {t.label}
                </button>
            ))}
        </div>
    </div>
);

export const GuidedSteps = ({ steps, current, onGo }) => (
    <div className="dg-stepbar no-print">
        {steps.map((s) => (
            <button key={s.id} className={`dg-step ${current === s.id ? 'on' : ''} ${s.locked ? 'locked' : ''}`} onClick={() => onGo(s.id)}>
                <span className="dg-dot">{s.done && current !== s.id ? <i className="ph ph-check"></i> : s.n}</span>
                <span className="min-w-0">
                    <b>{s.label}</b>
                    <small>{s.sub}</small>
                </span>
            </button>
        ))}
    </div>
);
