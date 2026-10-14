import React, { useEffect, useRef, useState } from 'react';
import { GuidedHead, GuidedSteps, StepTitle, stepDir } from '../../shared/GuidedParts';
import { guidedCss } from '../../shared/guidedStyles';
import { statusById } from '../../shared/planCommon';
import { isBlankPlan } from '../logic/trainingModel';
import { SetupStep } from './SetupStep';
import { ProgramStep } from './ProgramStep';
import { DeliverStep } from './DeliverStep';
import { PlanPanel } from './PlanPanel';
import { BookModal } from './BookModal';
import { MeasuresModal } from '../../MeasuresModal';
import { HelpModal } from './HelpModal';
import { goalShort, levelShort, schedaLabel } from './trainingGuidedLogic';

// Training — un'unica schermata guidata, uguale alla Dieta. Gerarchia (dall'alto):
//  1. testata: la scheda (nome · data · stato) + Libro schede e Aiuto AI
//  2. i 3 passi: Obiettivo → Scheda → Consegna, ognuno con un riepilogo
//  3. il contenuto del passo, con i suoi strumenti

const STEPS = [
    { id: 'setup', n: 1, label: 'Obiettivo' },
    { id: 'program', n: 2, label: 'Scheda' },
    { id: 'deliver', n: 3, label: 'Consegna' },
];

const TITLES = {
    setup: ['Partiamo dall’obiettivo', 'Poche scelte: poi ti preparo la struttura della scheda.'],
    program: ['Costruiamo la scheda', 'Settimane, sedute ed esercizi: tutto in questa pagina.'],
    deliver: ['Ultimo controllo', 'Verifica la scheda, imposta lo stato e consegna.'],
};
const ORDER = ['setup', 'program', 'deliver'];

export const TrainingGuided = ({
    patient,
    db,
    schedaId,
    header,
    setHeader,
    weeks,
    setWeeks,
    openScheda,
    newScheda,
    duplicateScheda,
    deleteScheda,
    loadScheda,
    ops,
    exerciseDB,
    suggestions,
    massimali,
    analysisCtx,
    profile,
    book,
    setBook,
    onExercises,
    onTools,
    onProgression,
    onAnalysis,
    onPrint,
}) => {
    const blank = isBlankPlan(weeks);
    const [step, setStep] = useState(blank ? 'setup' : 'program');
    const [planOpen, setPlanOpen] = useState(false);
    const [bookOpen, setBookOpen] = useState(false);
    const [measuresOpen, setMeasuresOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    // cambiando scheda si riparte dal passo giusto
    useEffect(() => {
        setStep(isBlankPlan(weeks) ? 'setup' : 'program');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schedaId]);

    const st = statusById(header.stato);
    const idx = ORDER.indexOf(step);
    const prevIdx = useRef(idx);
    const dir = stepDir(prevIdx.current, idx);
    useEffect(() => {
        prevIdx.current = idx;
    }, [idx]);
    const nDays = weeks.reduce((n, w) => n + w.days.length, 0);
    const setupDone = !!header.tipo && !!header.livello;
    const sub = {
        setup: setupDone ? `${goalShort(header.tipo)} · ${levelShort(header.livello)}` : 'da impostare',
        program: blank ? 'vuota' : `${weeks.length} ${weeks.length === 1 ? 'sett.' : 'sett.'} · ${nDays} sedute`,
        deliver: st.label,
    };

    const progress = (((!!header.tipo && !!header.livello) ? 1 : 0) + (blank ? 0 : 1) + (['pending', 'delivery', 'active'].includes(st.id) ? 1 : 0)) / 3;

    const applyAi = ({ scheda, mode }) => {
        if (mode === 'replace') {
            setWeeks(scheda.weeks);
            setHeader({ ...header, titolo: scheda.titolo || header.titolo, obiettivo: scheda.obiettivo || header.obiettivo, tipo: scheda.tipo || header.tipo, livello: scheda.livello || header.livello });
        } else loadScheda(scheda);
        setStep('program');
    };

    return (
        <div className="dg-root">
            <style>{guidedCss}</style>

            <GuidedHead
                progress={progress}
                kicker="Scheda di allenamento"
                plan={{ label: schedaLabel(header), status: st, onClick: () => setPlanOpen(true), title: 'Nome, data e stato della scheda; altre schede del paziente', icon: 'ph-barbell' }}
                tools={[
                    { label: 'Misure', icon: 'ph-ruler', onClick: () => setMeasuresOpen(true), title: 'Le misure del paziente registrate in archivio' },
                    { label: 'Libro schede', icon: 'ph-books', onClick: () => setBookOpen(true), title: 'Le schede già fatte, da riusare' },
                    { label: 'Aiuto AI', icon: 'ph-sparkle', onClick: () => setHelpOpen(true), primary: true, title: "Fatti aiutare dall'intelligenza artificiale" },
                ]}
            />
            <GuidedSteps progress={progress} current={step} onGo={setStep} steps={STEPS.map((s) => ({ ...s, sub: sub[s.id], done: (s.id === 'setup' && setupDone) || (s.id === 'program' && !blank) }))} />

            <div className="dg-body">
                <div key={step} className={dir}>
                <StepTitle id={step} dir="" title={TITLES[step][0]} hint={TITLES[step][1]} />
                {step === 'setup' && <SetupStep header={header} setHeader={setHeader} weeks={weeks} setWeeks={setWeeks} onDone={() => setStep('program')} />}
                {step === 'program' && (
                    <ProgramStep
                        weeks={weeks}
                        setWeeks={setWeeks}
                        ops={ops}
                        exerciseDB={exerciseDB}
                        suggestions={suggestions}
                        massimali={massimali}
                        analysisCtx={analysisCtx}
                        onExercises={onExercises}
                        onTools={onTools}
                        onProgression={onProgression}
                        onAnalysis={onAnalysis}
                        onSetup={() => setStep('setup')}
                        onNext={() => setStep('deliver')}
                    />
                )}
                {step === 'deliver' && (
                    <DeliverStep weeks={weeks} header={header} setHeader={setHeader} massimali={massimali} profile={profile} onPrint={onPrint} onAnalysis={onAnalysis} onProgression={onProgression} onTools={onTools} onProgram={() => setStep('program')} />
                )}
                </div>
            </div>

            {planOpen && (
                <PlanPanel patient={patient} schedaId={schedaId} header={header} setHeader={setHeader} weeks={weeks} onOpen={openScheda} onNew={newScheda} onDuplicate={duplicateScheda} onDelete={deleteScheda} onClose={() => setPlanOpen(false)} />
            )}
            {measuresOpen && <MeasuresModal patient={patient} onClose={() => setMeasuresOpen(false)} />}
            {bookOpen && <BookModal patient={patient} header={header} weeks={weeks} book={book} setBook={setBook} setWeeks={setWeeks} loadScheda={loadScheda} onClose={() => setBookOpen(false)} />}
            {helpOpen && <HelpModal patient={patient} db={db} header={header} weeks={weeks} massimali={massimali} profile={profile} exerciseDB={exerciseDB} onApply={applyAi} onClose={() => setHelpOpen(false)} />}
        </div>
    );
};
