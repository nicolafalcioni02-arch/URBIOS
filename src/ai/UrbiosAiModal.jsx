import React, { useEffect, useMemo, useRef, useState } from 'react';
import { activeQuestions } from './interview';
import { buildPrompt, newRequestId } from './promptBuilder';
import { parseAiResponse } from './responseParser';
import { GROUP_ICON, SECTIONS } from './fieldRegistry';
import { DietReview } from './DietReview';
import { dietContext } from './dietSection';
import { TrainingReview } from './TrainingReview';
import { trainingContext } from './trainingSection';
import { mergeAnswers, prefillAnswers } from './prefill';
import { makeIndependentVisit, todayIso } from '../components/patient/diet/guided/guidedLogic';
import { defaultDB as defaultExerciseDB } from '../components/patient/training/data/defaultExerciseDB';
import { defaultFoodDB } from '../components/patient/diet/data/defaultFoodDB';

// URBIOS AI — workflow guidato: intervista → misure → prompt → risposta → anteprima → fatto.
// Il professionista non scrive nei campi: risponde alle domande, misura, copia/incolla.

const PHASES = [
    { id: 'scelta', label: 'Obiettivo', icon: 'ph-target' },
    { id: 'intervista', label: 'Intervista', icon: 'ph-chats-circle' },
    { id: 'misure', label: 'Misure', icon: 'ph-ruler' },
    { id: 'prompt', label: 'Prompt', icon: 'ph-clipboard-text' },
    { id: 'risposta', label: 'Risposta', icon: 'ph-magic-wand' },
    { id: 'anteprima', label: 'Verifica', icon: 'ph-list-checks' },
];

const MEASURES = [
    { key: 'peso', label: 'Peso', unit: 'kg' },
    { key: 'altezza', label: 'Altezza', unit: 'cm' },
    { key: 'cm_vita_min', label: 'Vita', unit: 'cm' },
    { key: 'cm_fianchi_max', label: 'Fianchi', unit: 'cm' },
    { key: 'cm_collo', label: 'Collo', unit: 'cm' },
    { key: 'cm_torace', label: 'Torace', unit: 'cm' },
    { key: 'pa_max', label: 'Pressione max', unit: 'mmHg' },
    { key: 'pa_min', label: 'Pressione min', unit: 'mmHg' },
    { key: 'hr', label: 'Frequenza cardiaca', unit: 'bpm' },
    { key: 'spo2', label: 'SpO2', unit: '%' },
];

const STYLE = `
@keyframes uaiIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes uaiPop { 0% { transform: scale(.3); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
@keyframes uaiGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(31,138,91,.35); } 50% { box-shadow: 0 0 0 18px rgba(31,138,91,0); } }
@keyframes uaiShim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.uai-in { animation: uaiIn .45s var(--ease, ease) both; }
.uai-chip { display:inline-flex; align-items:center; height:40px; padding:0 16px; border-radius:999px; border:1px solid var(--line); background:var(--surface,#fff); font-size:14px; font-weight:500; cursor:pointer; transition:all .2s; }
.uai-chip:hover { border-color: var(--ink); }
.uai-chip.on { background: var(--ink); color:#fff; border-color: var(--ink); }
.uai-bar { height:4px; border-radius:99px; background:var(--soft); overflow:hidden; }
.uai-bar > i { display:block; height:100%; background:var(--ink); border-radius:99px; transition:width .5s var(--ease, ease); }
.uai-magic { background: linear-gradient(110deg, var(--ink) 30%, #5b5f6b 50%, var(--ink) 70%); background-size: 200% 100%; animation: uaiShim 2.4s linear infinite; }
.uai-pre { font: 12.5px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
`;

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
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

const store = (k, v) => {
    try {
        if (v === undefined) sessionStorage.removeItem(k);
        else sessionStorage.setItem(k, JSON.stringify(v));
    } catch {
        /* storage non disponibile: si lavora in memoria */
    }
};
const load = (k, fb) => {
    try {
        const v = sessionStorage.getItem(k);
        return v ? JSON.parse(v) : fb;
    } catch {
        return fb;
    }
};

export const UrbiosAiModal = ({ patient, visitDraft, db, onClose, onApplyPatient, onApplyDraft, onGoVisit, onGoTraining, onGoDiet }) => {
    const key = `urbios-ai:${patient.id}`;
    const saved = useMemo(() => load(key, {}), [key]);

    const [phase, setPhase] = useState(saved.phase || 'scelta');
    // risposte già note (scheda, ultima visita, sessioni AI precedenti): l'intervista parte già compilata, basta confermare
    const prefill = useMemo(() => prefillAnswers(patient), [patient?.id]); // eslint-disable-line react-hooks/exhaustive-deps
    const [answers, setAnswers] = useState({ ...prefill.answers, ...(saved.answers || {}) });
    const [skipFilled, setSkipFilled] = useState(!!saved.skipFilled);
    const [qi, setQi] = useState(saved.qi || 0);
    const [sections, setSections] = useState(saved.sections || ['anagrafica', 'visita']);
    const [measures, setMeasures] = useState(() => Object.fromEntries(MEASURES.map((m) => [m.key, visitDraft[m.key] ?? ''])));
    const [dietOpts, setDietOpts] = useState(saved.dietOpts || { days: 3, supplements: true, includeFoodList: true, target: 'visit', date: todayIso(), noDate: false });
    const [dietPayload, setDietPayload] = useState(null);
    const [trainingOpts, setTrainingOpts] = useState(saved.trainingOpts || { weeks: 4, deload: true, includeExerciseList: true });
    const [trainingPayload, setTrainingPayload] = useState(null);
    const [requestId, setRequestId] = useState(saved.requestId || newRequestId());
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [result, setResult] = useState(null);
    const [selected, setSelected] = useState({});
    const [applied, setApplied] = useState(null);
    const bodyRef = useRef(null);

    const foodDB = useMemo(() => (db?.diet_food_db?.length ? db.diet_food_db : defaultFoodDB), [db?.diet_food_db]);
    const exerciseDB = useMemo(() => (db?.training_exercise_db?.length ? db.training_exercise_db : defaultExerciseDB), [db?.training_exercise_db]);
    const questions = useMemo(() => activeQuestions(answers, patient, sections), [answers, patient, sections]);
    const isPrefilled = (id) => !!prefill.answers[id] && answers[id] === prefill.answers[id];
    const askQs = skipFilled ? questions.filter((x) => !isPrefilled(x.id)) : questions;
    const q = askQs[Math.min(qi, askQs.length - 1)];
    const filledCount = questions.filter((x) => isPrefilled(x.id)).length;

    useEffect(() => {
        store(key, { phase: phase === 'anteprima' || phase === 'fatto' ? 'risposta' : phase, answers, qi, sections, requestId, dietOpts, trainingOpts, skipFilled });
    }, [key, phase, answers, qi, sections, requestId, dietOpts, trainingOpts, skipFilled]);

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
    }, [phase, qi]);

    // il prompt tiene conto di quanto misurato, anche se non ancora scritto nella bozza
    const prompt = useMemo(() => {
        if (phase !== 'prompt') return '';
        const draft = { ...visitDraft };
        Object.entries(measures).forEach(([k, v]) => {
            if (String(v).trim()) draft[k] = v;
        });
        return buildPrompt({ patient, visitDraft: draft, db, answers, questions, sections, requestId, foodDB, dietOpts, exerciseDB, trainingOpts });
    }, [phase, patient, visitDraft, db, answers, questions, sections, requestId, measures, foodDB, dietOpts, exerciseDB, trainingOpts]);

    const answered = questions.filter((x) => (answers[x.id] || '').trim()).length;

    const setAnswer = (id, text) => setAnswers((a) => ({ ...a, [id]: text }));
    const toggleChip = (id, chip) => {
        const cur = (answers[id] || '').trim();
        const parts = cur ? cur.split(/,\s*/) : [];
        const next = parts.includes(chip) ? parts.filter((p) => p !== chip) : [...parts, chip];
        setAnswer(id, next.join(', '));
    };

    const goMeasures = () => setPhase('misure');
    const saveMeasures = () => {
        const clean = Object.fromEntries(Object.entries(measures).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).replace(',', '.')]));
        if (Object.keys(clean).length) onApplyDraft(clean);
        setRequestId(newRequestId());
        setPhase('prompt');
    };

    const doCopy = async () => {
        const ok = await copyText(prompt);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 4000);
    };

    const readResponse = () => {
        const r = parseAiResponse(pasted, { patient, visitDraft, db, requestId, foodDB, exerciseDB });
        setResult(r);
        setSelected(Object.fromEntries(r.changes.map((c) => [c.id, c.selected])));
        setDietPayload(null);
        setTrainingPayload(null);
        if (r.ok) setPhase('anteprima');
    };

    const apply = () => {
        const chosen = (result?.changes || []).filter((c) => selected[c.id]);
        const pat = Object.fromEntries(chosen.filter((c) => c.scope === 'anagrafica').map((c) => [c.key, c.new]));
        const vis = Object.fromEntries(chosen.filter((c) => c.scope === 'visita').map((c) => [c.key, c.new]));
        if (result?.training && trainingPayload) pat.allenamento = trainingPayload.allenamento;
        if (result?.diet && dietPayload && dietOpts.target === 'independent') {
            // piano alimentare indipendente: non entra nella bozza della visita, ma in un proprio contenitore
            const v = makeIndependentVisit({ calcData: dietPayload.payload.diet_calc_data || { weight: visitDraft.peso }, dateIso: dietOpts.date, noDate: dietOpts.noDate, targets: dietPayload.payload.diet_targets, dietDays: dietPayload.payload.diet_plan_data, savedReports: [] });
            v.dettagli = { ...v.dettagli, diet_supplements: dietPayload.payload.diet_supplements, diet_notes: dietPayload.payload.diet_notes };
            pat.visite = [v, ...(patient.visite || [])];
        } else if (result?.diet && dietPayload) Object.assign(vis, dietPayload.payload);
        const mem = mergeAnswers(patient, answers);
        if (mem) pat.ai_answers = mem;
        if (Object.keys(pat).length) onApplyPatient(pat);
        if (Object.keys(vis).length) onApplyDraft(vis);
        store(key, undefined);
        setApplied(chosen);
    };

    const restart = () => {
        store(key, undefined);
        setAnswers({});
        setQi(0);
        setPasted('');
        setResult(null);
        setApplied(null);
        setRequestId(newRequestId());
        setPhase('scelta');
    };

    const phaseIdx = PHASES.findIndex((p) => p.id === phase);
    const dietItems = result?.diet && dietPayload ? dietPayload.payload.diet_plan_data.reduce((n, d) => n + d.meals.reduce((k, ml) => k + ml.items.length, 0), 0) : 0;
    const draftHasData = !!applied?.some((c) => c.scope === 'visita') || (!!(result?.diet && dietPayload) && dietOpts.target !== 'independent');
    const goDest = draftHasData
        ? { go: onGoVisit, label: 'Vai alla visita' }
        : result?.diet && dietPayload
          ? { go: onGoDiet || onGoVisit, label: 'Vai alla dieta' }
          : result?.training && trainingPayload
            ? { go: onGoTraining, label: 'Vai all’allenamento' }
            : { go: onGoVisit, label: 'Vai alla visita' };
    const trainItems = result?.training && trainingPayload ? trainingPayload.exercisesCount : 0;
    const trainCtx = useMemo(() => trainingContext(patient), [patient]);
    const selCount = Object.values(selected).filter(Boolean).length + (dietItems ? 1 : 0) + (trainItems ? 1 : 0);
    const dietCtx = useMemo(() => dietContext(patient, visitDraft), [patient, visitDraft]);
    const groups = result ? [...new Set(result.changes.map((c) => c.group))] : [];

    // ---------- schermata finale ----------
    if (applied) {
        const byGroup = [...new Set(applied.map((c) => c.group))];
        return (
            <Shell onClose={onClose}>
                <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                    <div className="text-center">
                        <div className="mx-auto w-20 h-20 rounded-full grid place-items-center text-white text-4xl" style={{ background: 'var(--ok)', animation: 'uaiPop .6s both, uaiGlow 1.8s .6s 2' }}>
                            <i className="ph ph-check"></i>
                        </div>
                        <h2 className="text-[26px] font-semibold mt-5 uai-in" style={{ animationDelay: '.3s' }}>
                            Tutto compilato
                        </h2>
                        <p className="text-[15px] text-[color:var(--muted)] mt-1 uai-in" style={{ animationDelay: '.4s' }}>
                            {applied.length} campi scritti in {byGroup.length} sezioni{dietItems ? `, un piano alimentare${dietOpts.target === 'independent' ? ' indipendente' : ''} di ${dietPayload.payload.diet_plan_data.length} giorni (${dietItems} alimenti)` : ''}{trainItems ? ` e una scheda di allenamento (${trainItems} esercizi)` : ''}. {applied.some((c) => c.scope === 'visita') || (dietItems && dietOpts.target !== 'independent') ? 'La visita è in bozza: controllala e salvala quando vuoi.' : ''}
                        </p>
                    </div>
                    <div className="max-w-xl mx-auto mt-8 space-y-2">
                        {byGroup.map((g, gi) => (
                            <div key={g} className="uai-in flex items-center gap-3 p-3 rounded-2xl border border-[color:var(--line)] bg-white" style={{ animationDelay: `${0.5 + gi * 0.12}s` }}>
                                <i className={`ph ${GROUP_ICON[g] || 'ph-check'} text-xl text-[color:var(--ok)]`}></i>
                                <span className="flex-1 font-medium">{g}</span>
                                <span className="text-[13px] text-[color:var(--muted)]">{applied.filter((c) => c.group === g).length} campi</span>
                                <i className="ph ph-check-circle text-xl text-[color:var(--ok)]"></i>
                            </div>
                        ))}
                    </div>
                    {dietItems > 0 && (
                        <div className="max-w-xl mx-auto mt-2 uai-in flex items-center gap-3 p-3 rounded-2xl border border-[color:var(--line)] bg-white" style={{ animationDelay: '.9s' }}>
                            <i className="ph ph-carrot text-xl text-[color:var(--ok)]"></i>
                            <span className="flex-1 font-medium">Piano alimentare</span>
                            <span className="text-[13px] text-[color:var(--muted)]">{dietPayload.payload.diet_plan_data.length} giorni</span>
                            <i className="ph ph-check-circle text-xl text-[color:var(--ok)]"></i>
                        </div>
                    )}
                    {trainItems > 0 && (
                        <div className="max-w-xl mx-auto mt-2 uai-in flex items-center gap-3 p-3 rounded-2xl border border-[color:var(--line)] bg-white" style={{ animationDelay: '1.05s' }}>
                            <i className="ph ph-barbell text-xl text-[color:var(--ok)]"></i>
                            <span className="flex-1 font-medium">Scheda di allenamento</span>
                            <span className="text-[13px] text-[color:var(--muted)]">{trainingPayload.scheda.weeks.length} settimane</span>
                            <i className="ph ph-check-circle text-xl text-[color:var(--ok)]"></i>
                        </div>
                    )}
                    {result?.aiNotes?.length > 0 && (
                        <div className="max-w-xl mx-auto mt-6 p-4 rounded-2xl" style={{ background: '#FFF6E5' }}>
                            <p className="text-[13px] font-semibold mb-1">L’AI ti segnala:</p>
                            <ul className="text-[13.5px] list-disc pl-5 space-y-1">
                                {result.aiNotes.map((n, i) => (
                                    <li key={i}>{n}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <Footer>
                    <button className="vw-back" onClick={restart}>
                        Nuova sessione
                    </button>
                    <div className="flex gap-2">
                        <button className="vw-back" onClick={onClose}>
                            Chiudi
                        </button>
                        <button className="vw-next" onClick={() => { goDest.go(); onClose(); }}>
                            {goDest.label} <i className="ph ph-arrow-right"></i>
                        </button>
                    </div>
                </Footer>
            </Shell>
        );
    }

    return (
        <Shell onClose={onClose}>
            {/* Intestazione + passi */}
            <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full grid place-items-center text-white uai-magic">
                        <i className="ph ph-sparkle text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[18px] font-semibold leading-tight">URBIOS AI</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)] truncate">
                            {patient.nome} {patient.cognome}
                        </p>
                    </div>
                    <button className="vw-chip !px-0 w-10 !h-10 justify-center" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>
                <div className="flex gap-1.5 mt-4 overflow-x-auto no-scrollbar">
                    {PHASES.map((p, i) => (
                        <div key={p.id} className={`vw-step ${i === phaseIdx ? 'is-active' : i < phaseIdx ? 'is-done' : ''}`}>
                            <span className="vw-step-dot">
                                <i className={`ph ${i < phaseIdx ? 'ph-check' : p.icon}`}></i>
                            </span>
                            <span className="vw-step-label">{p.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 sm:p-8">
                {/* ---------- SCELTA ---------- */}
                {phase === 'scelta' && (
                    <div className="max-w-2xl mx-auto uai-in">
                        <h3 className="text-[24px] sm:text-[28px] font-semibold leading-tight">Cosa vuoi che l’AI prepari?</h3>
                        <p className="text-[14.5px] text-[color:var(--muted)] mt-1">In base alla scelta ti farò le domande giuste. Puoi sceglierne più di una.</p>
                        <div className="mt-6 grid gap-2.5">
                            {SECTIONS.map((s) => {
                                const on = sections.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        disabled={!s.ready}
                                        onClick={() => setSections(on ? sections.filter((x) => x !== s.id) : [...sections, s.id])}
                                        className="flex items-center gap-3 p-4 rounded-2xl border text-left disabled:opacity-45 transition-all"
                                        style={{ borderColor: on ? 'var(--ink)' : 'var(--line)', background: '#fff', boxShadow: on ? '0 6px 18px rgba(18,19,23,.08)' : 'none' }}
                                    >
                                        <i className={`ph ${s.icon} text-2xl`}></i>
                                        <span className="flex-1 text-[15px] font-medium">{s.title}</span>
                                        {!s.ready ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[color:var(--soft)]">presto</span> : <i className={`ph ${on ? 'ph-check-circle' : 'ph-circle'} text-2xl`}></i>}
                                    </button>
                                );
                            })}
                        </div>
                        {sections.includes('dieta') && (
                            <div className="mt-5 p-4 rounded-2xl border border-[color:var(--line)] bg-white uai-in">
                                <p className="text-[13px] font-semibold mb-3">Opzioni del piano alimentare</p>
                                <p className="text-[12.5px] text-[color:var(--muted)] mb-2">Quanti giorni di menù?</p>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 3, 5, 7].map((n) => (
                                        <button key={n} className={`uai-chip ${dietOpts.days === n ? 'on' : ''}`} onClick={() => setDietOpts({ ...dietOpts, days: n })}>
                                            {n === 1 ? '1 giorno tipo' : `${n} giorni`}
                                        </button>
                                    ))}
                                </div>
                                <label className="flex items-center gap-2.5 mt-4 cursor-pointer text-[14px]">
                                    <input type="checkbox" className="w-4 h-4" checked={dietOpts.supplements} onChange={(e) => setDietOpts({ ...dietOpts, supplements: e.target.checked })} />
                                    Chiedi all’AI di consigliare anche gli integratori
                                </label>
                                <p className="text-[12.5px] text-[color:var(--muted)] mt-4 mb-2">Dove salvare il piano alimentare?</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className={`uai-chip ${dietOpts.target !== 'independent' ? 'on' : ''}`} onClick={() => setDietOpts({ ...dietOpts, target: 'visit' })}>
                                        Nella visita in corso
                                    </button>
                                    <button className={`uai-chip ${dietOpts.target === 'independent' ? 'on' : ''}`} onClick={() => setDietOpts({ ...dietOpts, target: 'independent' })}>
                                        Piano indipendente
                                    </button>
                                </div>
                                {dietOpts.target === 'independent' && (
                                    <div className="flex items-center gap-3 flex-wrap mt-3 uai-in">
                                        <input type="date" className="fld !w-auto" disabled={dietOpts.noDate} value={dietOpts.date || ''} onChange={(e) => setDietOpts({ ...dietOpts, date: e.target.value })} aria-label="Data del piano" />
                                        <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4" checked={!!dietOpts.noDate} onChange={(e) => setDietOpts({ ...dietOpts, noDate: e.target.checked })} />
                                            Senza data
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                        {sections.includes('training') && (
                            <div className="mt-5 p-4 rounded-2xl border border-[color:var(--line)] bg-white uai-in">
                                <p className="text-[13px] font-semibold mb-3">Opzioni della scheda di allenamento</p>
                                <p className="text-[12.5px] text-[color:var(--muted)] mb-2">Quante settimane?</p>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 4, 6, 8].map((n) => (
                                        <button key={n} className={`uai-chip ${trainingOpts.weeks === n ? 'on' : ''}`} onClick={() => setTrainingOpts({ ...trainingOpts, weeks: n })}>
                                            {n === 1 ? '1 settimana' : `${n} settimane`}
                                        </button>
                                    ))}
                                </div>
                                {trainingOpts.weeks >= 4 && (
                                    <label className="flex items-center gap-2.5 mt-4 cursor-pointer text-[14px]">
                                        <input type="checkbox" className="w-4 h-4" checked={trainingOpts.deload} onChange={(e) => setTrainingOpts({ ...trainingOpts, deload: e.target.checked })} />
                                        Ultima settimana di scarico
                                    </label>
                                )}
                                <p className="text-[12px] text-[color:var(--muted)] mt-3">L’AI scrive una settimana tipo che URBIOS ripete. La progressione dei carichi la imposti poi dal generatore di progressioni.</p>
                            </div>
                        )}
                        {filledCount > 0 && (
                            <label className="flex items-start gap-2.5 mt-5 p-4 rounded-2xl border border-[color:var(--line)] bg-white cursor-pointer uai-in">
                                <input type="checkbox" className="mt-1 w-4 h-4" checked={skipFilled} onChange={(e) => { setSkipFilled(e.target.checked); setQi(0); }} />
                                <span className="text-[14px]">
                                    <b>Salta le {filledCount} domande già compilate</b>
                                    <span className="block text-[12.5px] text-[color:var(--muted)]">Ho già le risposte dalla scheda, dall’ultima visita e dalle sessioni precedenti. Se non spunti, te le mostro già compilate da confermare.</span>
                                </span>
                            </label>
                        )}
                    </div>
                )}

                {/* ---------- INTERVISTA ---------- */}
                {phase === 'intervista' && q && (
                    <div key={q.id} className="max-w-2xl mx-auto uai-in">
                        <div className="uai-bar mb-6">
                            <i style={{ width: `${((qi + 1) / askQs.length) * 100}%` }}></i>
                        </div>
                        <p className="text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)]">
                            {q.group} · {qi + 1}/{askQs.length}
                        </p>
                        <p className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--soft)' }}>
                            <i className={`ph ${q.forDoctor ? 'ph-pencil-simple' : 'ph-speaker-high'}`}></i>
                            {q.forDoctor ? 'Per te' : 'Leggi al paziente'}
                        </p>
                        {isPrefilled(q.id) && (
                            <p className="inline-flex items-center gap-1.5 mt-3 ml-2 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#DCE9E1', color: '#1F6B49' }}>
                                <i className="ph ph-check-circle"></i> Già compilata {prefill.source[q.id]}: conferma o correggi
                            </p>
                        )}
                        <h3 className="text-[24px] sm:text-[28px] font-semibold leading-tight mt-2">{q.q}</h3>
                        {q.chips.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-5">
                                {q.chips.map((c) => (
                                    <button key={c} className={`uai-chip ${(answers[q.id] || '').split(/,\s*/).includes(c) ? 'on' : ''}`} onClick={() => toggleChip(q.id, c)}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                        <textarea
                            autoFocus
                            className="fld mt-5"
                            rows={q.long ? 8 : 3}
                            style={{ height: 'auto', padding: 14, resize: 'vertical' }}
                            placeholder={q.placeholder}
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') qi < askQs.length - 1 ? setQi(qi + 1) : goMeasures();
                            }}
                        />
                        <p className="text-[12px] text-[color:var(--muted)] mt-2">Chiedi al paziente, poi tocca le risposte rapide e/o trascrivi quello che dice. “Avanti” senza rispondere salta la domanda. ⌘/Ctrl + Invio per proseguire.</p>
                    </div>
                )}

                {/* ---------- MISURE ---------- */}
                {phase === 'misure' && (
                    <div className="max-w-2xl mx-auto uai-in">
                        <h3 className="text-[24px] font-semibold">Ora le misure</h3>
                        <p className="text-[14.5px] text-[color:var(--muted)] mt-1 mb-6">
                            Questi valori vanno <b>direttamente</b> nella visita, senza passare dall’AI: i numeri misurati non si toccano. Pliche e bioimpedenza le inserisci poi nella visita.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {MEASURES.map((m) => (
                                <div key={m.key}>
                                    <label className="fld-label">
                                        {m.label} <span className="opacity-60">({m.unit})</span>
                                    </label>
                                    <input className="fld" inputMode="decimal" value={measures[m.key]} onChange={(e) => setMeasures({ ...measures, [m.key]: e.target.value })} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ---------- PROMPT ---------- */}
                {phase === 'prompt' && (
                    <div className="max-w-3xl mx-auto uai-in">
                        <h3 className="text-[24px] font-semibold">Ci siamo: copia il prompt</h3>
                        <p className="text-[14.5px] text-[color:var(--muted)] mt-1">
                            {answered} risposte raccolte. Vai sul tuo agente AI preferito, incolla il testo e aspetta il risultato.
                        </p>
                        {sections.includes('dieta') && (
                            <label className="flex items-start gap-2.5 mt-5 p-4 rounded-2xl border border-[color:var(--line)] bg-white cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4" checked={dietOpts.includeFoodList} onChange={(e) => setDietOpts({ ...dietOpts, includeFoodList: e.target.checked })} />
                                <span className="text-[14px]">
                                    <b>Includi l’elenco degli alimenti del tuo database</b> ({foodDB.length.toLocaleString('it-IT')} voci)
                                    <span className="block text-[12.5px] text-[color:var(--muted)]">L’AI userà i tuoi nomi esatti e il riconoscimento è praticamente sicuro. Rende il prompt più lungo: se l’agente ha limiti di testo, toglila e li abbinerò per somiglianza.</span>
                                </span>
                            </label>
                        )}
                        {sections.includes('training') && (
                            <label className="flex items-start gap-2.5 mt-3 p-4 rounded-2xl border border-[color:var(--line)] bg-white cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4" checked={trainingOpts.includeExerciseList} onChange={(e) => setTrainingOpts({ ...trainingOpts, includeExerciseList: e.target.checked })} />
                                <span className="text-[14px]">
                                    <b>Includi l’elenco degli esercizi del tuo database</b> ({exerciseDB.length.toLocaleString('it-IT')} voci)
                                    <span className="block text-[12.5px] text-[color:var(--muted)]">L’AI userà i nomi esatti, così figure e analisi dei muscoli funzionano subito.</span>
                                </span>
                            </label>
                        )}
                        <details className="mt-5">
                            <summary className="cursor-pointer text-[13px] text-[color:var(--muted)]">Mostra il prompt ({prompt.length.toLocaleString('it-IT')} caratteri)</summary>
                            <pre className="uai-pre mt-2 p-4 rounded-2xl bg-[color:var(--soft)] max-h-72 overflow-auto">{prompt}</pre>
                        </details>
                        <button className="vw-next w-full mt-5 !h-14 text-[16px]" disabled={!sections.length} onClick={doCopy}>
                            <i className={`ph ${copied ? 'ph-check' : 'ph-copy'}`}></i> {copied ? 'Copiato! Incollalo nel tuo agente AI' : 'Clicca per copiare il prompt'}
                        </button>
                        <ol className="mt-5 space-y-2 text-[14px] text-[color:var(--muted)] list-decimal pl-5">
                            <li>Apri il tuo agente AI (ChatGPT, Claude, Gemini… quello che preferisci).</li>
                            <li>Incolla il prompt e invia. Aspetta che finisca di scrivere.</li>
                            <li>Copia la risposta <b>esattamente come te la dà</b> e torna qui.</li>
                        </ol>
                    </div>
                )}

                {/* ---------- RISPOSTA ---------- */}
                {phase === 'risposta' && (
                    <div className="max-w-3xl mx-auto uai-in">
                        <h3 className="text-[24px] font-semibold">Incolla la risposta dell’AI</h3>
                        <p className="text-[14.5px] text-[color:var(--muted)] mt-1">Anche con testo prima o dopo il blocco: mi occupo io di ripulirla.</p>
                        <textarea
                            autoFocus
                            className="fld mt-5 uai-pre"
                            rows={14}
                            style={{ height: 'auto', padding: 14 }}
                            placeholder={'```json\n{ "format": "URBIOS-AI", ... }\n```'}
                            value={pasted}
                            onChange={(e) => {
                                setPasted(e.target.value);
                                setResult(null);
                            }}
                        />
                        {result && !result.ok && (
                            <div className="mt-4 p-4 rounded-2xl text-[14px]" style={{ background: '#FDECEA', color: '#8A1F11' }}>
                                <i className="ph ph-warning-circle mr-1"></i> {result.fatal}
                            </div>
                        )}
                    </div>
                )}

                {/* ---------- ANTEPRIMA ---------- */}
                {phase === 'anteprima' && result?.ok && (
                    <div className="max-w-3xl mx-auto">
                        <div className="uai-in">
                            <h3 className="text-[24px] font-semibold">Ecco cosa scrivo nel paziente</h3>
                            <p className="text-[14.5px] text-[color:var(--muted)] mt-1">
                                {result.changes.length === 0 && !result.diet ? 'Nessuna modifica da applicare.' : result.changes.length === 0 ? 'Controlla il piano alimentare qui sotto.' : `${Object.values(selected).filter(Boolean).length} di ${result.changes.length} campi selezionati. Togli la spunta a ciò che non vuoi.`}
                            </p>
                        </div>
                        {result.notes.length > 0 && (
                            <div className="mt-4 p-4 rounded-2xl text-[13.5px] space-y-1 uai-in" style={{ background: '#FFF6E5' }}>
                                {result.notes.map((n, i) => (
                                    <p key={i}>
                                        <i className="ph ph-warning mr-1"></i>
                                        {n}
                                    </p>
                                ))}
                            </div>
                        )}
                        {result.aiNotes.length > 0 && (
                            <div className="mt-3 p-4 rounded-2xl text-[13.5px] space-y-1 uai-in" style={{ background: '#EAF1FB' }}>
                                <p className="font-semibold">L’AI ti segnala:</p>
                                {result.aiNotes.map((n, i) => (
                                    <p key={i}>• {n}</p>
                                ))}
                            </div>
                        )}
                        {groups.map((g, gi) => (
                            <div key={g} className="mt-5 uai-in" style={{ animationDelay: `${gi * 0.08}s` }}>
                                <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[color:var(--muted)] mb-2">
                                    <i className={`ph ${GROUP_ICON[g] || 'ph-dot'} text-base`}></i>
                                    {g}
                                </p>
                                <div className="rounded-2xl border border-[color:var(--line)] bg-white overflow-hidden">
                                    {result.changes
                                        .filter((c) => c.group === g)
                                        .map((c) => (
                                            <label key={c.id} className="flex items-start gap-3 p-3.5 border-b last:border-b-0 border-[color:var(--line)] cursor-pointer">
                                                <input type="checkbox" className="mt-1 w-4 h-4" checked={!!selected[c.id]} onChange={(e) => setSelected({ ...selected, [c.id]: e.target.checked })} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] text-[color:var(--muted)] flex items-center gap-2">
                                                        {c.label}
                                                        {c.kind === 'update' && <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#FFF1D6' }}>sostituisce</span>}
                                                    </p>
                                                    {c.old && <p className="text-[13px] line-through text-[color:var(--muted)] break-words">{c.old}</p>}
                                                    <p className="text-[15px] font-medium break-words">
                                                        {c.new}
                                                        {c.unit ? ` ${c.unit}` : ''}
                                                    </p>
                                                    {c.warn && (
                                                        <p className="text-[12.5px] mt-0.5" style={{ color: '#B25E00' }}>
                                                            <i className="ph ph-warning"></i> {c.warn}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        ))}
                        {result.training && <TrainingReview parsed={result.training} patient={patient} exerciseDB={exerciseDB} opts={trainingOpts} ctx={trainCtx} onPayload={setTrainingPayload} />}
                        {result.diet && <DietReview parsed={result.diet} foodDB={foodDB} ctx={dietCtx} onPayload={setDietPayload} />}
                        {result.ignored.length > 0 && <p className="text-[12px] text-[color:var(--muted)] mt-4">Chiavi non riconosciute e ignorate: {result.ignored.join(', ')}</p>}
                    </div>
                )}
            </div>

            {/* Piede: navigazione */}
            <Footer>
                {phase === 'scelta' && (
                    <>
                        <span></span>
                        <button className="vw-next" disabled={!sections.length} onClick={() => { setQi(0); setPhase(askQs.length ? 'intervista' : 'misure'); }}>
                            Inizia <i className="ph ph-arrow-right"></i>
                        </button>
                    </>
                )}
                {phase === 'intervista' && (
                    <>
                        <button className="vw-back" onClick={() => (qi === 0 ? setPhase('scelta') : setQi(qi - 1))}>
                            <i className="ph ph-arrow-left"></i>
                            <span>Indietro</span>
                        </button>
                        <button className="vw-next" onClick={() => (qi < askQs.length - 1 ? setQi(qi + 1) : goMeasures())}>
                            {qi < askQs.length - 1 ? 'Avanti' : 'Alle misure'} <i className="ph ph-arrow-right"></i>
                        </button>
                    </>
                )}
                {phase === 'misure' && (
                    <>
                        <button className="vw-back" onClick={() => setPhase('intervista')}>
                            <i className="ph ph-arrow-left"></i>
                            <span>Indietro</span>
                        </button>
                        <button className="vw-next" onClick={saveMeasures}>
                            Registra e genera <i className="ph ph-arrow-right"></i>
                        </button>
                    </>
                )}
                {phase === 'prompt' && (
                    <>
                        <button className="vw-back" onClick={() => setPhase('misure')}>
                            <i className="ph ph-arrow-left"></i>
                            <span>Indietro</span>
                        </button>
                        <button className="vw-next" onClick={async () => { if (!copied) await doCopy(); setPhase('risposta'); }}>
                            Ho la risposta <i className="ph ph-arrow-right"></i>
                        </button>
                    </>
                )}
                {phase === 'risposta' && (
                    <>
                        <button className="vw-back" onClick={() => setPhase('prompt')}>
                            <i className="ph ph-arrow-left"></i>
                            <span>Indietro</span>
                        </button>
                        <button className="vw-next" disabled={!pasted.trim()} onClick={readResponse}>
                            <i className="ph ph-magic-wand"></i> Leggi la risposta
                        </button>
                    </>
                )}
                {phase === 'anteprima' && (
                    <>
                        <button className="vw-back" onClick={() => setPhase('risposta')}>
                            <i className="ph ph-arrow-left"></i>
                            <span>Indietro</span>
                        </button>
                        <button className="vw-next vw-save" disabled={!selCount} onClick={apply}>
                            <i className="ph ph-sparkle"></i> Applica {selCount} campi
                        </button>
                    </>
                )}
            </Footer>
        </Shell>
    );
};

const Shell = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6" style={{ background: 'rgba(18,19,23,.45)', backdropFilter: 'blur(6px)' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <style>{STYLE}</style>
        <div className="w-full sm:max-w-3xl h-[100dvh] sm:h-[88vh] flex flex-col bg-[var(--paper)] sm:rounded-[28px] overflow-hidden shadow-2xl">{children}</div>
    </div>
);

const Footer = ({ children }) => <div className="flex-none flex items-center justify-between gap-3 px-5 sm:px-8 py-4 border-t border-[color:var(--line)] bg-[var(--paper)]">{children}</div>;
