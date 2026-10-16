import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShaderCanvas } from '../../../components/visuals/ShaderCanvas';
import { countFilled } from '../data/visitSections';

// Cornice dei rilievi di Nuova Visita: una sezione per schermata, indicatore di avanzamento in alto
// e barra Indietro / Avanti sempre ancorata in basso. Il contenuto dei passi arriva da `renderStep`.
export const VisitWizard = ({ patient, visitDraft, sections: SECTIONS, title, step, setStep, onPreview, onAnalysis, onSave, onChangeMode, renderStep }) => {
    const [dir, setDir] = useState('fwd');
    const topRef = useRef(null);

    const counts = useMemo(() => SECTIONS.map((s) => countFilled(s, visitDraft, patient)), [SECTIONS, visitDraft, patient]);
    const started = counts.filter((c) => c > 0).length;
    const current = SECTIONS[step];
    const isLast = step === SECTIONS.length - 1;

    const go = (i) => {
        if (i < 0 || i >= SECTIONS.length || i === step) return;
        setDir(i > step ? 'fwd' : 'back');
        setStep(i);
    };

    // ad ogni cambio di passo si riparte dall'alto
    useEffect(() => {
        const box = topRef.current && topRef.current.closest('.overflow-y-auto');
        if (box) box.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // la sfera cresce man mano che la visita si riempie
    const orbScale = 0.72 + 0.28 * (started / SECTIONS.length);

    return (
        <div className="visit-wizard max-w-5xl mx-auto w-full px-4 md:px-8 pt-4 md:pt-6 overflow-x-clip flex flex-col" style={{ minHeight: '100%' }} ref={topRef}>
            {/* Intestazione */}
            <div className="vw-head flex items-center gap-3 mb-4 rise">
                <div className="vw-orb relative flex-none" style={{ width: 52, height: 52 }}>
                    <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{ transform: `scale(${orbScale})`, transition: 'transform .8s var(--ease)', background: '#fff', boxShadow: '0 6px 18px rgba(18,19,23,.10)' }}
                    >
                        <ShaderCanvas size={52} />
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="vw-title font-semibold text-[17px] leading-tight truncate text-[color:var(--ink)]">{title}</p>
                    <p className="vw-who text-[13px] text-[color:var(--muted)] leading-tight mt-0.5">
                        <span className="vw-who-name">{patient.nome} {patient.cognome}</span>
                        {onChangeMode && (
                            <button onClick={onChangeMode} className="ml-2 underline underline-offset-2 hover:text-[color:var(--ink)]">
                                cambia
                            </button>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 flex-none">
                    <button onClick={onAnalysis} className="vw-chip" title="Analisi clinica">
                        <i className="ph ph-sparkle"></i>
                        <span className="hidden sm:inline">Analisi</span>
                    </button>
                    <button onClick={onPreview} className="vw-chip" title="Anteprima del report">
                        <i className="ph ph-file-text"></i>
                        <span className="hidden sm:inline">Anteprima</span>
                    </button>
                </div>
            </div>

            {/* Indicatore dei passi: il passo attivo si allarga e mostra il nome */}
            <nav className="vw-steps sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-2.5 mb-5" aria-label="Passi della visita">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {SECTIONS.map((s, i) => {
                        const active = i === step;
                        const done = counts[i] > 0;
                        return (
                            <button key={s.id} onClick={() => go(i)} className={`vw-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`} aria-current={active ? 'step' : undefined}>
                                <span className="vw-step-dot">{done && !active ? <i className="ph-bold ph-check text-[11px]"></i> : i + 1}</span>
                                <span className="vw-step-label">{s.short}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Titolo del passo */}
            <div key={`h-${current.id}`} className={dir === 'fwd' ? 'step-fwd' : 'step-back'}>
                <h2 className="text-[26px] sm:text-[30px] leading-[1.1] font-bold tracking-tight text-[color:var(--ink)]">{current.title}</h2>
                <p className="text-[14px] text-[color:var(--muted)] mt-1.5 mb-5 max-w-xl">
                    {current.hint}
                    {counts[step] > 0 && <span className="ml-2 text-[color:var(--ink)] font-medium">{counts[step]} compilati</span>}
                </p>
            </div>

            {/* Contenuto */}
            <div key={current.id} className={`flex-1 ${dir === 'fwd' ? 'step-fwd' : 'step-back'}`}>
                {renderStep(current.id)}
            </div>

            {/* Barra di navigazione: sempre in fondo alla schermata */}
            <div className="visit-bar sticky bottom-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-3 mt-8" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    <button onClick={() => go(step - 1)} disabled={step === 0} className="vw-back" aria-label="Passo precedente">
                        <i className="ph ph-arrow-left"></i>
                        <span>Indietro</span>
                    </button>
                    <span className="hidden sm:block text-[13px] text-[color:var(--muted)]">
                        Passo {step + 1} di {SECTIONS.length}
                    </span>
                    {isLast ? (
                        <button onClick={onSave} className="vw-next vw-save">
                            <i className="ph-bold ph-check"></i>
                            <span>Salva e continua</span>
                        </button>
                    ) : (
                        <button onClick={() => go(step + 1)} className="vw-next">
                            <span>Avanti</span>
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
