import React, { useEffect, useMemo, useRef, useState } from 'react';
import { countFilled } from '../data/visitSections';

// Cornice dei rilievi di Nuova Visita: una sezione per schermata, indicatore di avanzamento in alto
// e barra Indietro / Avanti sempre ancorata in basso. Il contenuto dei passi arriva da `renderStep`.
export const VisitWizard = ({ patient, visitDraft, sections: SECTIONS, title, step, setStep, onPreview, onAnalysis, onSave, onChangeMode, renderStep }) => {
    const [dir, setDir] = useState('fwd');
    const topRef = useRef(null);

    const counts = useMemo(() => SECTIONS.map((s) => countFilled(s, visitDraft, patient)), [SECTIONS, visitDraft, patient]);
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

    return (
        <div className="visit-wizard max-w-5xl mx-auto w-full px-4 md:px-8 pt-4 md:pt-6 overflow-x-clip flex flex-col" style={{ minHeight: '100%' }} ref={topRef}>
            {/* Passi a sinistra, Analisi e Anteprima a destra: il passo attivo si allarga e mostra il nome */}
            <nav className="vw-steps sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-2.5 mb-5 flex items-center gap-3 rise" aria-label="Passi della visita">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0 flex-1">
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
            </nav>

            {/* Titolo del passo */}
            <div key={`h-${current.id}`} className={dir === 'fwd' ? 'step-fwd' : 'step-back'}>
                <h2 className="text-[26px] sm:text-[32px] leading-[1.08] font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{current.title}</h2>
                <p className="text-[14px] text-[color:var(--muted)] mt-1.5 mb-5 max-w-xl">
                    {current.hint}
                    {counts[step] > 0 && <span className="vw-filled">{counts[step]} compilati</span>}
                </p>
            </div>

            {/* Contenuto */}
            <div key={current.id} className={`flex-1 ${dir === 'fwd' ? 'step-fwd' : 'step-back'}`}>
                {renderStep(current.id)}
            </div>

            {/* Barra di navigazione: sempre in fondo alla schermata */}
            <div className="visit-bar sticky bottom-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-3 mt-8" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                <div className="vw-progress" aria-hidden="true">
                    <span style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}></span>
                </div>
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    {/* Indietro dal primo passo torna alla scelta di che visita è */}
                    <button
                        onClick={() => (step === 0 ? onChangeMode && onChangeMode() : go(step - 1))}
                        disabled={step === 0 && !onChangeMode}
                        className="vw-back is-strong"
                        aria-label={step === 0 ? 'Torna alla scelta del tipo di visita' : 'Passo precedente'}
                        title={step === 0 ? 'Torna a scegliere che visita è' : undefined}
                    >
                        <i className="ph ph-arrow-left"></i>
                        <span>Indietro</span>
                    </button>
                    <span className="hidden sm:block text-center leading-tight min-w-0">
                        <span className="block text-[14px] font-semibold text-[color:var(--ink)] truncate">{title}</span>
                        <span className="block text-[12.5px] text-[color:var(--muted)]">
                            Passo {step + 1} di {SECTIONS.length}
                        </span>
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
