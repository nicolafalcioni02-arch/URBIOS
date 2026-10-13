import React, { useMemo, useState } from 'react';
import { buildPrompt, newRequestId } from '../../../../ai/promptBuilder';
import { parseAiResponse } from '../../../../ai/responseParser';
import { TrainingReview } from '../../../../ai/TrainingReview';
import { trainingContext } from '../../../../ai/trainingSection';
import { analyzeScheda } from '../logic/analysis';
import { goalById } from '../logic/science/guidelines';
import { goalShort, levelShort, schedaText } from './trainingGuidedLogic';

// Aiuto AI per la scheda: scegli il problema, copia il prompt, incollalo nel tuo agente AI.
// Per "costruisci tu la scheda" la risposta si incolla qui e la scheda viene compilata.

const PROBLEMS = [
    { id: 'start', icon: 'ph-compass', label: 'Non so da dove iniziare', ask: 'Guidami passo passo nella costruzione di questa scheda: struttura settimanale, scelta degli esercizi, serie e ripetizioni, recuperi e progressione.' },
    { id: 'build', icon: 'ph-magic-wand', label: 'Costruisci tu la scheda', fillsPlan: true },
    { id: 'volume', icon: 'ph-chart-bar', label: 'Il volume non è adatto', ask: 'Valuta il volume settimanale per gruppo muscolare rispetto a obiettivo e livello e dimmi cosa aggiungere o togliere, in modo concreto (esercizi e serie).' },
    { id: 'swap', icon: 'ph-arrows-left-right', label: 'Devo sostituire un esercizio', ask: 'Devo sostituire un esercizio mantenendo lo stesso stimolo muscolare. Proponi alternative con serie e ripetizioni, tenendo conto di attrezzatura e limitazioni.' },
    { id: 'injury', icon: 'ph-first-aid-kit', label: 'Infortunio o dolore', ask: 'Il cliente ha un dolore o una limitazione. Indica quali esercizi evitare o adattare nella scheda e quali alternative sicure usare.' },
    { id: 'progress', icon: 'ph-trend-up', label: 'Come lo faccio progredire?', ask: 'Proponi come far progredire questa scheda nelle prossime settimane (carico, ripetizioni, RPE, scarico), con numeri concreti.' },
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

export const HelpModal = ({ patient, db, header, weeks, massimali, profile, exerciseDB, onApply, onClose }) => {
    const [step, setStep] = useState('problema');
    const [kind, setKind] = useState(null);
    const [detail, setDetail] = useState('');
    const [nWeeks, setNWeeks] = useState(4);
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [result, setResult] = useState(null);
    const [built, setBuilt] = useState(null);
    const [mode, setMode] = useState('new');
    const [requestId] = useState(newRequestId);

    const problem = PROBLEMS.find((p) => p.id === kind);
    const opts = { weeks: nWeeks, deload: nWeeks >= 4, includeExerciseList: true };
    const ctx = useMemo(() => trainingContext(patient), [patient]);

    const prompt = useMemo(() => {
        if (!problem) return '';
        if (problem.fillsPlan) {
            return buildPrompt({
                patient,
                visitDraft: {},
                db,
                answers: { help: detail },
                questions: [{ id: 'help', q: 'Indicazioni del professionista per la scheda (obiettivo, giorni disponibili, attrezzatura, limitazioni, preferenze):' }],
                sections: ['training'],
                requestId,
                foodDB: [],
                dietOpts: {},
                exerciseDB,
                trainingOpts: opts,
            });
        }
        const A = analyzeScheda({ weeks, header, massimali, profile });
        const warn = A.warnings.slice(0, 6).map((w) => `- ${w.text}`).join('\n');
        const sex = patient.sesso === 'F' ? 'donna' : 'uomo';
        const goal = goalById(header.tipo);
        return `Sei un assistente per preparatori atletici e chinesiologi che usano il software URBIOS. La schermata "Training" ha 3 passi: 1) Obiettivo (tipo di obiettivo, livello, struttura), 2) Scheda (settimane, sedute, esercizi con serie, ripetizioni, carico, %1RM, RPE, tempo, recupero), 3) Consegna (controllo, stato, stampa).
Rispondi in italiano semplice, con passi numerati brevi e concreti, con numeri (serie, ripetizioni, RPE). Se non sei sicuro di una funzione del software, dillo invece di inventarla.

CLIENTE: ${patient.nome} ${patient.cognome}, ${sex}${profile?.age ? `, ${profile.age} anni` : ''}${profile?.weightKg ? `, ${profile.weightKg} kg` : ''}.
${patient.patologie ? `Patologie: ${Array.isArray(patient.patologie) ? patient.patologie.join(', ') : patient.patologie}.\n` : ''}${patient.obiettivo ? `Obiettivo del cliente: ${patient.obiettivo}.\n` : ''}
SCHEDA: ${header.titolo || '(senza nome)'} · obiettivo ${goal ? goal.label : 'non impostato'}${header.livello ? ` · livello ${levelShort(header.livello).toLowerCase()}` : ''}.

CONTENUTO ATTUALE:
${schedaText(weeks)}
${warn ? `\nAVVISI DEL SOFTWARE:\n${warn}\n` : ''}
PROBLEMA: ${problem.label}${problem.ask ? `\n${problem.ask}` : ''}${detail.trim() ? `\nDettagli del professionista: ${detail.trim()}` : ''}
`;
    }, [problem, detail, nWeeks, patient, weeks, header, massimali, profile, db, exerciseDB, requestId]); // eslint-disable-line react-hooks/exhaustive-deps

    const doCopy = async () => {
        const ok = await copyText(prompt);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 4000);
    };

    const read = () => {
        const r = parseAiResponse(pasted, { patient, visitDraft: {}, db, requestId, foodDB: [], exerciseDB });
        if (r.ok && !r.training) {
            r.ok = false;
            r.fatal = 'La risposta non contiene la sezione "allenamento". Rigenera con il prompt di URBIOS.';
        }
        setResult(r);
        if (r.ok) setStep('verifica');
    };

    const apply = () => {
        if (!built) return;
        onApply({ scheda: built.scheda, mode });
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
                                    <label className="fld-label">{problem.fillsPlan ? 'Indicazioni per la scheda' : 'Descrivi meglio il problema (facoltativo)'}</label>
                                    <textarea
                                        className="fld"
                                        rows={3}
                                        style={{ height: 'auto', padding: 14 }}
                                        placeholder={problem.fillsPlan ? 'Es. 3 giorni a settimana, solo manubri, dolore alla spalla destra, vuole più gambe…' : 'Es. la panca mi sembra troppo ripetuta, la spalla fa male…'}
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                    />
                                    {problem.fillsPlan && (
                                        <div className="mt-4">
                                            <p className="fld-label">Quante settimane?</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {[1, 4, 6, 8].map((n) => (
                                                    <button key={n} className={`dg-chip row ${nWeeks === n ? 'on' : ''}`} onClick={() => setNWeeks(n)}>
                                                        {n === 1 ? '1 settimana' : `${n} settimane`}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="dg-hint">L’AI scrive una settimana tipo e URBIOS la ripete (l’ultima di scarico se sono 4 o più). Usa {goalShort(header.tipo) || 'l’obiettivo'} {header.livello ? `e il livello ${levelShort(header.livello).toLowerCase()}` : ''} se li hai impostati.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'prompt' && (
                        <div className="dg-in">
                            <h3 className="text-[22px] font-semibold">Copia il prompt</h3>
                            <p className="dg-sub">Incollalo nel tuo agente AI preferito e aspetta la risposta.{problem?.fillsPlan ? ' Poi copiala esattamente com’è e torna qui.' : ''}</p>
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
                            {result && !result.ok && <div className="mt-4 p-4 rounded-2xl text-[14px]" style={{ background: '#FDECEA', color: '#8A1F11' }}>{result.fatal}</div>}
                        </div>
                    )}

                    {step === 'verifica' && result?.ok && result.training && (
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
                            <TrainingReview parsed={result.training} patient={patient} exerciseDB={exerciseDB} opts={opts} ctx={ctx} onPayload={setBuilt} />
                            <div className="flex gap-2 mt-5 flex-wrap">
                                <button className={`dg-chip row ${mode === 'new' ? 'on' : ''}`} onClick={() => setMode('new')}>
                                    Crea come nuova scheda
                                </button>
                                <button className={`dg-chip row ${mode === 'replace' ? 'on' : ''}`} onClick={() => setMode('replace')}>
                                    Sostituisci la scheda in uso
                                </button>
                            </div>
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
                                <button className="vw-next" onClick={async () => { if (!copied) await doCopy(); setStep('risposta'); }}>
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
                                <i className="ph ph-sparkle"></i> {mode === 'replace' ? 'Sostituisci la scheda' : 'Crea la scheda'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
