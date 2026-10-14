import React, { useMemo, useState } from 'react';
import { buildPrompt, newRequestId, redactText } from '../../../../ai/promptBuilder';
import { parseAiResponse } from '../../../../ai/responseParser';
import { DietReview } from '../../../../ai/DietReview';
import { alignToPlan, computeRmr, computeTdee, planSummary } from './guidedLogic';

// Aiuto AI — "Dimmi qual è il problema": scegli cosa ti serve, copia il prompt, incollalo nel tuo agente AI.
// Per "costruire un menù" la risposta si incolla qui e il piano viene compilato in automatico.

const PROBLEMS = [
    { id: 'start', icon: 'ph-compass', label: 'Non so da dove iniziare', ask: 'Guidami passo passo nella costruzione del piano alimentare per questo paziente, dalle domande da fare fino alla consegna.' },
    { id: 'menu', icon: 'ph-magic-wand', label: 'Costruisci tu il menù', ask: 'Costruisci il menù.', fillsPlan: true },
    { id: 'kcal', icon: 'ph-scales', label: 'Il menù non arriva alle kcal', ask: 'Il menù attuale non è in linea con le kcal obiettivo. Dimmi quali alimenti e quali quantità cambiare, in modo concreto, mantenendo i macro.' },
    { id: 'macro', icon: 'ph-chart-pie-slice', label: 'Macro sbilanciati', ask: 'I macro del menù attuale non rispettano le percentuali obiettivo. Proponi modifiche precise (alimenti e grammi).' },
    { id: 'swap', icon: 'ph-arrows-left-right', label: 'Devo sostituire un alimento', ask: 'Devo sostituire un alimento mantenendo kcal e macro simili. Proponi alternative equivalenti con i grammi.' },
    { id: 'variety', icon: 'ph-shuffle', label: 'Rendere il piano più vario', ask: 'Il piano è ripetitivo. Suggerisci varianti realistiche per ogni pasto con i grammi.' },
    { id: 'clinical', icon: 'ph-first-aid-kit', label: 'Patologia o intolleranza', ask: 'Il paziente ha una condizione clinica da considerare. Indica le attenzioni alimentari principali e cosa cambiare nel menù.' },
    { id: 'other', icon: 'ph-chat-circle-text', label: 'Altro', ask: '' },
];

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch {
            return false;
        }
    }
};

export const DietHelpModal = ({ patient, calcData, targets, dietDays, foodDB, db, onClose, onApply }) => {
    const [step, setStep] = useState('problema');
    const [kind, setKind] = useState(null);
    const [detail, setDetail] = useState('');
    const [days, setDays] = useState(3);
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [result, setResult] = useState(null);
    const [aligned, setAligned] = useState(null);
    const [mode, setMode] = useState(dietDays.length ? 'append' : 'replace');
    const [built, setBuilt] = useState(null);
    const [requestId] = useState(newRequestId);

    const problem = PROBLEMS.find((p) => p.id === kind);
    const configured = !!targets?.isConfigured;
    const tdee = computeTdee(calcData);
    const ctx = useMemo(() => ({ calc: calcData, rmr: computeRmr(calcData) }), [calcData]);
    const sex = calcData.sex === 'F' ? 'donna' : 'uomo';

    const prompt = useMemo(() => {
        if (!problem) return '';
        const profile = `${sex}, ${calcData.age || '?'} anni, ${calcData.weight || '?'} kg, ${calcData.height || '?'} cm`;
        if (problem.fillsPlan) {
            const fixed = configured ? { kcal: tdee, laf: Number(calcData.laf), macro: calcData.macroTargets, meals: calcData.distribution } : null;
            const pat = { ...patient, sesso: calcData.sex };
            return buildPrompt({
                patient: pat,
                visitDraft: { peso: calcData.weight, altezza: calcData.height },
                db,
                answers: { help: detail },
                questions: [{ id: 'help', q: 'Indicazioni del professionista per il menù (preferenze, vincoli, obiettivo, intolleranze):' }],
                sections: ['dieta'],
                requestId,
                foodDB,
                dietOpts: { days, supplements: false, includeFoodList: true, ctx, fixed },
            });
        }
        const plan = dietDays.length ? planSummary(dietDays) : '(nessun menù ancora inserito)';
        return `Sei un assistente per dietisti e nutrizionisti che usano il software URBIOS. La schermata "Dieta" ha 3 passi: 1) Obiettivi (fabbisogno, macro, pasti), 2) Menù (giorni, pasti, alimenti e grammi), 3) Consegna (controllo, stampa, analisi).
Rispondi in italiano semplice, con passi numerati brevi e concreti. Se non sei sicuro di una funzione del software, dillo invece di inventarla.

PAZIENTE (anonimo): ${profile}.
${patient.patologie ? `Patologie: ${redactText(Array.isArray(patient.patologie) ? patient.patologie.join(', ') : patient.patologie, patient)}.\n` : ''}${patient.allergie ? `Allergie/intolleranze: ${redactText(Array.isArray(patient.allergie) ? patient.allergie.join(', ') : patient.allergie, patient)}.\n` : ''}${patient.farmaci ? `Farmaci: ${redactText(patient.farmaci, patient)}.\n` : ''}${patient.obiettivo ? `Obiettivo: ${redactText(patient.obiettivo, patient)}.\n` : ''}
OBIETTIVO IMPOSTATO: ${configured ? `${tdee} kcal/die, carboidrati ${calcData.macroTargets.c}% / proteine ${calcData.macroTargets.p}% / grassi ${calcData.macroTargets.f}%.` : 'non ancora impostato.'}

MENÙ ATTUALE:
${plan}

PROBLEMA: ${problem.label}${problem.ask ? `\n${problem.ask}` : ''}${detail.trim() ? `\nDettagli del professionista: ${redactText(detail.trim(), patient)}` : ''}
`;
    }, [problem, detail, days, patient, calcData, configured, tdee, dietDays, foodDB, db, ctx, requestId, sex]);

    const doCopy = async () => {
        const ok = await copyText(prompt);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 4000);
    };

    const read = () => {
        const r = parseAiResponse(pasted, { patient, visitDraft: {}, db, requestId, foodDB, exerciseDB: [] });
        if (r.ok && r.diet) {
            // con un piano già impostato, pasti/LAF/macro del piano sono la fonte di verità
            if (configured) {
                const b = alignToPlan(r.diet, calcData);
                setAligned(b.parsed);
                r.notes.push(...b.warnings);
            } else setAligned({ ...r.diet, adjustPct: Number(calcData.kcalAdjustPct) || 0 });
        } else if (r.ok && !r.diet) {
            r.ok = false;
            r.fatal = 'La risposta non contiene la sezione "dieta".';
        }
        setResult(r);
        if (r.ok) setStep('verifica');
    };

    const apply = () => {
        if (!built) return;
        onApply({ payload: built.payload, mode, configured });
        onClose();
    };

    return (
        <div className="dg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center text-white" style={{ background: 'var(--ink)' }}>
                        <i className="ph ph-sparkle text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-semibold leading-tight">Aiuto AI</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)]">
                            {step === 'problema' && 'Dimmi qual è il problema'}
                            {step === 'prompt' && 'Copia e incolla nel tuo agente AI'}
                            {step === 'risposta' && 'Incolla la risposta'}
                            {step === 'verifica' && 'Controlla prima di applicare'}
                        </p>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    {step === 'problema' && (
                        <div className="dg-in">
                            <h3 className="text-[22px] font-semibold">Cosa ti serve?</h3>
                            <div className="grid sm:grid-cols-2 gap-2.5 mt-4">
                                {PROBLEMS.map((p) => (
                                    <button key={p.id} className={`dg-action ${kind === p.id ? 'primary' : ''}`} onClick={() => setKind(p.id)}>
                                        <i className={`ph ${p.icon}`}></i>
                                        <span className="flex-1 text-left">
                                            <b>{p.label}</b>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {kind && (
                                <div className="mt-5 dg-in">
                                    <label className="fld-label">{problem.fillsPlan ? 'Indicazioni per il menù (facoltative)' : 'Descrivi meglio il problema (facoltativo)'}</label>
                                    <textarea
                                        className="fld"
                                        rows={3}
                                        style={{ height: 'auto', padding: 14 }}
                                        placeholder={problem.fillsPlan ? 'Es. non mangia pesce, pranza in ufficio, vuole 3 pasti, allenamento la sera…' : 'Es. il giorno 2 è a 1500 kcal invece di 2000…'}
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                    />
                                    <p className="dg-hint" style={{ color: '#7A5B0B' }}><i className="ph ph-shield-warning"></i> Non scrivere nome, residenza, contatti o altri dati che identificano il paziente (GDPR e AI Act): solo dati clinici.</p>
                                    {problem.fillsPlan && (
                                        <div className="mt-4">
                                            <p className="fld-label">Quanti giorni di menù?</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {[1, 3, 5, 7].map((n) => (
                                                    <button key={n} className={`dg-chip ${days === n ? 'on' : ''}`} onClick={() => setDays(n)}>
                                                        {n === 1 ? '1 giorno tipo' : `${n} giorni`}
                                                    </button>
                                                ))}
                                            </div>
                                            {!configured && <p className="dg-hint mt-3">Non hai ancora impostato gli obiettivi: l’AI sceglierà anche kcal, macro e pasti, e li applico io.</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'prompt' && (
                        <div className="dg-in">
                            <h3 className="text-[22px] font-semibold">Copia il prompt</h3>
                            <p className="dg-sub">Incollalo nel tuo agente AI preferito (ChatGPT, Claude, Gemini…) e aspetta la risposta.{problem?.fillsPlan ? ' Poi copiala esattamente com’è e torna qui.' : ''}</p>
                            <p className="dg-hint" style={{ color: '#7A5B0B' }}><i className="ph ph-shield-warning"></i> Non scrivere nome, residenza, contatti o altri dati che identificano il paziente (GDPR e AI Act): solo dati clinici.</p>
                            <details className="mt-4">
                                <summary className="cursor-pointer text-[13px] text-[color:var(--muted)]">Mostra il testo ({prompt.length.toLocaleString('it-IT')} caratteri)</summary>
                                <pre className="mt-2 p-4 rounded-2xl bg-[color:var(--soft)] max-h-64 overflow-auto text-[12px] whitespace-pre-wrap">{prompt}</pre>
                            </details>
                            <button className="vw-next w-full mt-5 !h-14 text-[16px]" onClick={doCopy}>
                                <i className={`ph ${copied ? 'ph-check' : 'ph-copy'}`}></i> {copied ? 'Copiato!' : 'Clicca per copiare il prompt'}
                            </button>
                        </div>
                    )}

                    {step === 'risposta' && (
                        <div className="dg-in">
                            <h3 className="text-[22px] font-semibold">Incolla la risposta dell’AI</h3>
                            <p className="dg-sub">Anche con testo prima o dopo: ripulisco io.</p>
                            <textarea
                                autoFocus
                                className="fld mt-4"
                                rows={12}
                                style={{ height: 'auto', padding: 14, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5 }}
                                placeholder={'```json\n{ "format": "URBIOS-AI", ... }\n```'}
                                value={pasted}
                                onChange={(e) => {
                                    setPasted(e.target.value);
                                    setResult(null);
                                }}
                            />
                            {dietDays.length > 0 && (
                                <div className="flex gap-2 mt-4 flex-wrap">
                                    <button className={`dg-chip ${mode === 'append' ? 'on' : ''}`} onClick={() => setMode('append')}>
                                        Aggiungi ai giorni esistenti
                                    </button>
                                    <button className={`dg-chip ${mode === 'replace' ? 'on' : ''}`} onClick={() => setMode('replace')}>
                                        Sostituisci i giorni
                                    </button>
                                </div>
                            )}
                            {result && !result.ok && <div className="mt-4 p-4 rounded-2xl text-[14px]" style={{ background: '#FDECEA', color: '#8A1F11' }}>{result.fatal}</div>}
                        </div>
                    )}

                    {step === 'verifica' && result?.ok && aligned && (
                        <div className="dg-in">
                            {result.notes.length > 0 && (
                                <div className="p-4 rounded-2xl text-[13.5px] space-y-1" style={{ background: '#FFF6E5' }}>
                                    {result.notes.map((n, i) => (
                                        <p key={i}>
                                            <i className="ph ph-warning mr-1"></i>
                                            {n}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <DietReview parsed={aligned} foodDB={foodDB} ctx={ctx} onPayload={setBuilt} />
                        </div>
                    )}
                </div>

                <div className="flex-none flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-[color:var(--line)]">
                    {step === 'problema' && (
                        <>
                            <span></span>
                            <button className="vw-next" disabled={!kind} style={!kind ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={() => setStep('prompt')}>
                                Genera il prompt <i className="ph ph-arrow-right"></i>
                            </button>
                        </>
                    )}
                    {step === 'prompt' && (
                        <>
                            <button className="vw-back" onClick={() => setStep('problema')}>
                                <i className="ph ph-arrow-left"></i> Indietro
                            </button>
                            {problem?.fillsPlan ? (
                                <button
                                    className="vw-next"
                                    onClick={async () => {
                                        if (!copied) await doCopy();
                                        setStep('risposta');
                                    }}
                                >
                                    Ho la risposta <i className="ph ph-arrow-right"></i>
                                </button>
                            ) : (
                                <button className="vw-next" onClick={onClose}>
                                    Fatto
                                </button>
                            )}
                        </>
                    )}
                    {step === 'risposta' && (
                        <>
                            <button className="vw-back" onClick={() => setStep('prompt')}>
                                <i className="ph ph-arrow-left"></i> Indietro
                            </button>
                            <button className="vw-next" disabled={!pasted.trim()} style={!pasted.trim() ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={read}>
                                <i className="ph ph-magic-wand"></i> Leggi la risposta
                            </button>
                        </>
                    )}
                    {step === 'verifica' && (
                        <>
                            <button className="vw-back" onClick={() => setStep('risposta')}>
                                <i className="ph ph-arrow-left"></i> Indietro
                            </button>
                            <button className="vw-next vw-save" disabled={!built} onClick={apply}>
                                <i className="ph ph-sparkle"></i> {mode === 'append' && dietDays.length ? 'Aggiungi al piano' : 'Applica il piano'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
