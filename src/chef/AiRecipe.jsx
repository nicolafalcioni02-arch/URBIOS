import React, { useMemo, useState } from 'react';
import { AiTextTools } from '../ai/AiTextTools';
import { buildIndex, foodValues } from '../ai/foodMatcher';
import { newRequestId } from '../ai/promptBuilder';
import { parseAiResponse } from '../ai/responseParser';
import { buildRecipePrompt } from '../ai/recipeSection';
import { defaultChoice } from '../ai/dietSection';
import { genId } from '../components/patient/diet/guided/guidedLogic';
import { emptyForm } from './chefLogic';

// URBIOS AI per Chef: stesso flusso della Dieta (prompt → risposta incollata → verifica), ma senza paziente.
// La ricetta letta arriva nell'editor con ingredienti e valori presi dal database alimenti.
const copy = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

export const AiRecipe = ({ db, foods, onForm, onClose }) => {
    const index = useMemo(() => buildIndex(foods), [foods]);
    const [requestId] = useState(newRequestId);
    const [a, setA] = useState({ title: '', servings: 4, notes: '', includeFoodList: true });
    const [step, setStep] = useState('ask');
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [err, setErr] = useState('');
    const patient = { id: 'chef', nome: '', cognome: '' };
    const prompt = useMemo(() => buildRecipePrompt({ patient, foodDB: foods, requestId, title: a.title, servings: a.servings, notes: a.notes, includeFoodList: a.includeFoodList }), [foods, requestId, a]);

    const read = () => {
        const r = parseAiResponse(pasted, { patient, visitDraft: {}, db, requestId, foodDB: foods, exerciseDB: [] });
        if (!r.ok) return setErr(r.fatal);
        if (!r.recipe) return setErr('La risposta non contiene la sezione "ricetta". Rigenera con il prompt di URBIOS.');
        const rc = r.recipe;
        const ingredients = rc.ingredients.map((it) => {
            const c = defaultChoice(it);
            const base = { id: genId(), weight: it.grams };
            if (c.type === 'db') return { ...base, name: c.food.name, ...foodValues(c.food) };
            if (c.type === 'ai') return { ...base, name: it.aiName, ...c.values, aiEstimated: true };
            return { ...base, name: it.aiName, kcal: 0, p: 0, c: 0, f: 0 };
        });
        onForm({ ...emptyForm(), title: rc.title, servings: rc.servings, finalWeight: rc.finalWeight || '', ingredients, steps: rc.steps.length ? rc.steps : [''], note: rc.note });
    };

    return (
        <div className="dg-overlay" style={{ zIndex: 9999 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal" style={{ maxWidth: 640 }}>
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}><i className="ph ph-magic-wand text-lg"></i></div>
                    <h2 className="flex-1 text-[18px] font-semibold">Crea la ricetta con URBIOS AI</h2>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi"><i className="ph ph-x"></i></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-4">
                    {step === 'ask' ? (
                        <>
                            <div><label className="fld-label">Che ricetta vuoi?</label><input autoFocus className="fld" placeholder="Es. Torta di mele senza burro" value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} /></div>
                            <div><label className="fld-label">Porzioni</label><input className="fld" inputMode="numeric" value={a.servings} onChange={(e) => setA({ ...a, servings: e.target.value })} /></div>
                            <div><label className="fld-label">Richieste (opzionale)</label><AiTextTools value={a.notes} onChange={(v) => setA({ ...a, notes: v })} getEl={() => document.getElementById('ch-ai-notes')} /><textarea id="ch-ai-notes" className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} placeholder="Senza glutine, ricca di proteine, pronta in 20 minuti…" value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} /></div>
                            <label className="flex items-center gap-2 text-[13.5px] text-[color:var(--muted)]"><input type="checkbox" checked={a.includeFoodList} onChange={(e) => setA({ ...a, includeFoodList: e.target.checked })} />Includi l'elenco alimenti di URBIOS (ingredienti riconosciuti meglio)</label>
                            <button className="vw-next" onClick={async () => { setCopied(await copy(prompt)); setStep('paste'); }}><i className="ph ph-clipboard-text"></i><span>Copia il prompt</span></button>
                        </>
                    ) : (
                        <>
                            <p className="text-[14px] text-[color:var(--muted)]">{copied ? 'Prompt copiato.' : 'Copia il prompt qui sotto.'} Incollalo nella tua AI, poi incolla qui la risposta.</p>
                            {!copied && <><AiTextTools value={prompt} getEl={() => document.getElementById('ch-ai-prompt')} /><textarea id="ch-ai-prompt" readOnly className="fld" rows={5} style={{ height: 'auto', fontSize: 12 }} value={prompt} onFocus={(e) => e.target.select()} /></>}
                            <AiTextTools value={pasted} onChange={(v) => { setPasted(v); setErr(''); }} getEl={() => document.getElementById('ch-ai-pasted')} />
                            <textarea id="ch-ai-pasted" className="fld" rows={9} style={{ height: 'auto', paddingTop: 10 }} placeholder="Incolla qui la risposta dell'AI" value={pasted} onChange={(e) => { setPasted(e.target.value); setErr(''); }} />
                            {err && <p className="text-[13px]" style={{ color: 'var(--bad)' }}>{err}</p>}
                            <div className="flex gap-2 justify-between">
                                <button className="vw-chip" onClick={() => setStep('ask')}><i className="ph ph-arrow-left"></i>Indietro</button>
                                <button className="vw-next disabled:opacity-40" disabled={!pasted.trim()} onClick={read}><span>Leggi la ricetta</span><i className="ph ph-arrow-right"></i></button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
