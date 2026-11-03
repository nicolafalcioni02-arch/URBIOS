import React, { useEffect, useRef, useState } from 'react';
import { GoalsStep } from './GoalsStep';
import { MenuStep } from './MenuStep';
import { DeliverStep } from './DeliverStep';
import { DietHelpModal } from './DietHelpModal';
import { RecipeModal } from './RecipeModal';
import { PlanLinkModal } from './PlanLinkModal';
import { DietBookModal } from './DietBookModal';
import { MeasuresModal } from '../../MeasuresModal';
import { addItems, makeIndependentVisit, planLabel, statusOf, todayIso } from './guidedLogic';
import { guidedCss } from './guidedStyles';
import { GuidedHead, GuidedSteps, StepTitle, stepDir } from '../../shared/GuidedParts';
import { createPortal } from 'react-dom';
import { useCompact } from '../../../../hooks/useCompact';
import { ActionSheet } from '../../../mobile/MobileChrome';

// Dieta — un'unica schermata guidata. Gerarchia (dall'alto):
//  1. testata: il piano (nome, data, stato) + gli strumenti globali (Libro diete, Aiuto AI)
//  2. i 3 passi del lavoro: Obiettivi → Menù → Consegna, ognuno con un'informazione di riepilogo
//  3. il contenuto del passo, con i suoi strumenti (database alimenti e analisi nel Menù; stampa e grafici nella Consegna)

const STEPS = [
    { id: 'goals', n: 1, label: 'Obiettivi' },
    { id: 'menu', n: 2, label: 'Menù' },
    { id: 'deliver', n: 3, label: 'Consegna' },
];

const TITLES = {
    goals: ['Partiamo dall’obiettivo', 'Poche domande: kcal, macro e pasti li calcolo io.'],
    menu: ['Costruiamo il menù', 'Giorni, pasti e alimenti: tutto in questa pagina.'],
    deliver: ['Ultimo controllo', 'Verifica il piano, imposta lo stato e consegna.'],
};
const ORDER = ['goals', 'menu', 'deliver'];

export const DietGuided = ({
    patient,
    db,
    onUpdateDb,
    listaVisite,
    visitaAttiva,
    selectedVisitaId,
    setSelectedVisitaId,
    calcData,
    setCalcData,
    targets,
    setTargets,
    dietDays,
    setDietDays,
    savedReports,
    foodDB,
    mealLibrary,
    setMealLibrary,
    dietBook,
    setDietBook,
    onFoods,
    onAnalysis,
    onChart,
    onPrint,
    onLaf,
    onActiveDay,
}) => {
    const configured = !!targets?.isConfigured;
    const [hint, setHint] = useState('');
    const [step, setStep] = useState(configured ? 'menu' : 'goals');
    const [helpOpen, setHelpOpen] = useState(false);
    const [recipeFor, setRecipeFor] = useState(null); // { dayId, mealId }
    const [planOpen, setPlanOpen] = useState(false);
    const [bookOpen, setBookOpen] = useState(false);
    const [measuresOpen, setMeasuresOpen] = useState(false);
    const compact = useCompact(639);
    const [menuOpen, setMenuOpen] = useState(false);
    const [newDate, setNewDate] = useState(todayIso());
    const [newNoDate, setNewNoDate] = useState(false);

    // cambiando piano si riparte dal passo giusto (obiettivi se il piano non è ancora impostato, altrimenti menù)
    useEffect(() => {
        const t = visitaAttiva?.dettagli?.diet_targets;
        setStep(t && t.isConfigured ? 'menu' : 'goals');
        setHint('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVisitaId]);

    const go = (id) => {
        if (id !== 'goals' && !configured) {
            setStep('goals');
            setHint('Prima imposta gli obiettivi: servono per calcolare kcal e pasti.');
            return;
        }
        setHint('');
        setStep(id);
    };

    // nessun piano: se ne crea uno INDIPENDENTE (non legato a una visita), con la data scelta o senza data
    const createPlan = () => {
        const v = makeIndependentVisit({ calcData, dateIso: newDate, noDate: newNoDate, targets, dietDays, savedReports });
        onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: [v, ...(p.visite || [])] } : p)) }));
        setSelectedVisitaId(v.id);
    };

    const applyAiPlan = ({ payload, mode, configured: wasConfigured }) => {
        if (mode === 'replace' || !dietDays.length) setDietDays(payload.diet_plan_data);
        else setDietDays((d) => [...d, ...payload.diet_plan_data]);
        if (!wasConfigured && payload.diet_calc_data) {
            setCalcData({ ...payload.diet_calc_data, guided: {} });
            setTargets(payload.diet_targets);
        }
        if ((payload.diet_supplements?.length || payload.diet_notes?.length) && selectedVisitaId) {
            onUpdateDb((prev) => ({
                ...prev,
                pazienti: prev.pazienti.map((p) =>
                    p.id !== patient.id
                        ? p
                        : {
                              ...p,
                              visite: (p.visite || []).map((v) =>
                                  v.id !== selectedVisitaId
                                      ? v
                                      : {
                                            ...v,
                                            dettagli: {
                                                ...v.dettagli,
                                                ...(payload.diet_supplements?.length && { diet_supplements: payload.diet_supplements }),
                                                ...(payload.diet_notes?.length && { diet_notes: payload.diet_notes }),
                                            },
                                        }
                              ),
                          }
                ),
            }));
        }
        setHint('');
        setStep('menu');
    };

    const st = visitaAttiva ? statusOf(visitaAttiva) : null;
    // transizione laterale tra i passi e avanzamento del lavoro
    const idx = ORDER.indexOf(step);
    const prevIdx = useRef(idx);
    const dir = stepDir(prevIdx.current, idx);
    useEffect(() => {
        prevIdx.current = idx;
    }, [idx]);
    const hasFood = dietDays.some((d) => d.meals.some((m) => m.items.length));
    const progress = ((configured ? 1 : 0) + (hasFood ? 1 : 0) + (st && ['pending', 'delivery', 'active'].includes(st.id) ? 1 : 0)) / 3;
    const sub = {
        goals: configured ? `${Math.round(targets.kcal).toLocaleString('it-IT')} kcal` : 'da impostare',
        menu: !configured ? 'dopo gli obiettivi' : dietDays.length ? `${dietDays.length} ${dietDays.length === 1 ? 'giorno' : 'giorni'}` : 'vuoto',
        deliver: st ? st.label : '',
    };

    return (
        <div className="dg-root">
            <style>{guidedCss}</style>

            {/* 1 · Testata: il piano e gli strumenti globali · 2 · I passi del lavoro */}
            <GuidedHead
                progress={progress}
                kicker="Piano alimentare"
                plan={visitaAttiva ? { label: compact ? planLabel(visitaAttiva).split(' · ')[0] : planLabel(visitaAttiva), status: st, onClick: () => setPlanOpen(true), title: 'Nome, data, stato e collegamento del piano' } : null}
                tools={compact ? [
                    { label: 'Altro', icon: 'ph-dots-three-outline', onClick: () => setMenuOpen(true), title: 'Strumenti, libro diete, misure, Aiuto AI' },
                ] : [
                    { label: 'Misure', icon: 'ph-ruler', onClick: () => setMeasuresOpen(true), title: 'Le misure del paziente registrate in archivio' },
                    { label: 'Libro diete', icon: 'ph-books', onClick: () => setBookOpen(true), title: 'Le diete già fatte, da riusare' },
                    { label: 'Aiuto AI', icon: 'ph-sparkle', onClick: () => setHelpOpen(true), primary: true, title: "Fatti aiutare dall'intelligenza artificiale" },
                ]}
            />
            {visitaAttiva && (
                <GuidedSteps
                    progress={progress}
                    current={step}
                    onGo={go}
                    steps={STEPS.map((s) => ({
                        ...s,
                        sub: sub[s.id],
                        locked: s.id !== 'goals' && !configured,
                        done: (s.id === 'goals' && configured) || (s.id === 'menu' && configured && dietDays.length > 0),
                    }))}
                />
            )}

            {/* 3 · Il passo */}
            <div className="dg-body" data-step={step}>
                {hint && <p className="dg-warn max-w-3xl mx-auto mb-3">{hint}</p>}

                {!visitaAttiva ? (
                    <div className="max-w-xl mx-auto text-center dg-in py-10">
                        <div className="mx-auto w-16 h-16 rounded-full grid place-items-center text-3xl" style={{ background: 'var(--soft)' }}>
                            <i className="ph ph-carrot"></i>
                        </div>
                        <h2 className="dg-h mt-5">Piano alimentare per {patient.nome}</h2>
                        <p className="dg-sub">Crea un piano indipendente: non serve una visita. Potrai collegarlo a una visita più avanti, quando vuoi.</p>
                        <div className="flex items-center justify-center gap-3 flex-wrap mt-5">
                            <input type="date" className="fld !w-auto" disabled={newNoDate} value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Data del piano" />
                            <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                                <input type="checkbox" className="w-4 h-4" checked={newNoDate} onChange={(e) => setNewNoDate(e.target.checked)} />
                                Senza data
                            </label>
                        </div>
                        <button className="vw-next mt-5" onClick={createPlan}>
                            Crea il piano <i className="ph ph-arrow-right"></i>
                        </button>
                        <p className="dg-hint mt-6">
                            Oppure parti da una dieta già fatta: <button className="dg-link" onClick={() => setBookOpen(true)}>apri il Libro diete</button>.
                        </p>
                    </div>
                ) : (
                    <div key={step} className={dir}>
                        <div className="max-w-3xl mx-auto">
                            <StepTitle id={step} dir="" title={TITLES[step][0]} hint={TITLES[step][1]} />
                        </div>
                        {step === 'goals' && (
                            <GoalsStep
                                patient={patient}
                                calcData={calcData}
                                setCalcData={setCalcData}
                                setTargets={setTargets}
                                setDietDays={setDietDays}
                                targets={targets}
                                onLaf={onLaf}
                                onDone={() => {
                                    setHint('');
                                    setStep('menu');
                                }}
                            />
                        )}
                        {step === 'menu' && configured && (
                            <MenuStep
                                calcData={calcData}
                                targets={targets}
                                dietDays={dietDays}
                                setDietDays={setDietDays}
                                foodDB={foodDB}
                                mealLibrary={mealLibrary || []}
                                setMealLibrary={setMealLibrary}
                                onLaf={onLaf}
                                onFoods={onFoods}
                                onAnalysis={onAnalysis}
                                onActiveDay={onActiveDay}
                                onRecipe={(dayId, mealId) => setRecipeFor({ dayId, mealId })}
                                onGoals={() => setStep('goals')}
                                onNext={() => setStep('deliver')}
                            />
                        )}
                        {step === 'deliver' && configured && (
                            <DeliverStep
                                patient={patient}
                                targets={targets}
                                dietDays={dietDays}
                                visitaAttiva={visitaAttiva}
                                onUpdateDb={onUpdateDb}
                                onPrint={onPrint}
                                onAnalysis={onAnalysis}
                                onChart={onChart}
                                onMenu={() => setStep('menu')}
                            />
                        )}
                    </div>
                )}
            </div>

            {menuOpen && createPortal(
                <ActionSheet
                    title="Altro"
                    subtitle="Strumenti e archivio"
                    onClose={() => setMenuOpen(false)}
                    groups={[
                        [{ label: 'Aiuto AI', icon: 'ph-sparkle', note: 'crea o rivedi la dieta', onClick: () => setHelpOpen(true) }],
                        [
                            { label: 'Database alimenti', icon: 'ph-database', onClick: onFoods },
                            { label: 'Analisi nutrienti', icon: 'ph-stethoscope', onClick: onAnalysis },
                            { label: 'Calcolatore LAF', icon: 'ph-calculator', onClick: onLaf },
                        ],
                        [
                            { label: 'Libro diete', icon: 'ph-books', note: 'da riusare', onClick: () => setBookOpen(true) },
                            { label: 'Misure del paziente', icon: 'ph-ruler', onClick: () => setMeasuresOpen(true) },
                        ],
                    ]}
                />,
                document.body
            )}
            {recipeFor && (
                <RecipeModal
                    patient={patient}
                    db={db}
                    foodDB={foodDB}
                    mealLibrary={mealLibrary || []}
                    setMealLibrary={setMealLibrary}
                    onAdd={(items) => setDietDays((d) => addItems(d, recipeFor.dayId, recipeFor.mealId, items))}
                    onClose={() => setRecipeFor(null)}
                />
            )}
            {planOpen && visitaAttiva && (
                <PlanLinkModal
                    patient={patient}
                    listaVisite={listaVisite}
                    visitaAttiva={visitaAttiva}
                    selectedVisitaId={selectedVisitaId}
                    setSelectedVisitaId={setSelectedVisitaId}
                    calcData={calcData}
                    targets={targets}
                    dietDays={dietDays}
                    savedReports={savedReports}
                    onUpdateDb={onUpdateDb}
                    onClose={() => setPlanOpen(false)}
                />
            )}
            {measuresOpen && <MeasuresModal patient={patient} onClose={() => setMeasuresOpen(false)} />}
            {bookOpen && (
                <DietBookModal
                    patient={patient}
                    visitaAttiva={visitaAttiva}
                    calcData={calcData}
                    targets={targets}
                    dietDays={dietDays}
                    dietBook={dietBook || []}
                    setDietBook={setDietBook}
                    setDietDays={setDietDays}
                    setSelectedVisitaId={setSelectedVisitaId}
                    onUpdateDb={onUpdateDb}
                    onClose={() => setBookOpen(false)}
                />
            )}
            {helpOpen && <DietHelpModal patient={patient} calcData={calcData} targets={targets} dietDays={dietDays} foodDB={foodDB} db={db} onClose={() => setHelpOpen(false)} onApply={applyAiPlan} />}
        </div>
    );
};
