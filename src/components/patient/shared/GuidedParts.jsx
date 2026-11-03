import React, { useState } from 'react';
import { ShaderCanvas } from '../../visuals/ShaderCanvas';

// Pezzi comuni alle schermate guidate di Dieta e Training: stessa gerarchia, stesso aspetto, stessi effetti
// (gli stessi di "Nuova visita": sfera che cresce, passi sfumati, titolo editoriale, transizioni laterali).
//  1. GuidedHead: la sfera + il piano (nome · data · stato) a sinistra, gli strumenti globali a destra
//  2. GuidedSteps: i passi del lavoro con riepilogo e barra di avanzamento
//  3. StepTitle: titolo e indicazione del passo (scivola avanti/indietro con il passo)

// Un tasto principale che, premuto, fa uscire gli altri con una piccola animazione (prima/dopo il tasto con side).
export const ToolFan = ({ label, icon = 'ph-dots-three-outline', items, side = 'after', small = false }) => {
    const [open, setOpen] = useState(false);
    const main = (
        <button key="main" className={`${small ? 'dg-sm' : 'dg-tool'} dg-fan-main ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={label} title={label}>
            <i className={`ph ${open ? 'ph-x' : icon}`}></i> <span className="dg-tool-l">{label}</span>
        </button>
    );
    const list = (
        <div key="items" className="dg-fan-items" aria-hidden={!open}>
            {items.map((t, i) => (
                <button key={t.label} className={small ? 'dg-sm' : 'dg-tool'} style={{ '--i': i }} tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); t.onClick(); }} title={t.title} aria-label={t.label}>
                    <i className={`ph ${t.icon}`}></i> <span className="dg-tool-l">{t.label}</span>
                </button>
            ))}
        </div>
    );
    return <div className={`dg-fan ${open ? 'open' : ''}`}>{side === 'before' ? [list, main] : [main, list]}</div>;
};

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
                {(() => {
                    const rest = tools.filter((t) => !t.primary);
                    const main = tools.filter((t) => t.primary);
                    const row = (t) => (
                        <button key={t.label} className={`dg-tool ${t.primary ? 'ai' : ''}`} onClick={t.onClick} title={t.title} aria-label={t.label}>
                            <i className={`ph ${t.icon}`}></i> <span className="dg-tool-l">{t.label}</span>
                        </button>
                    );
                    if (rest.length < 2) return tools.map(row);
                    return [<ToolFan key="fan" label="Strumenti" side="before" items={rest} />, ...main.map(row)];
                })()}
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
