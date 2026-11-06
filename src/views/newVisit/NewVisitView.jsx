import React, { useState, useRef, useMemo } from 'react';
import { SmartLabCard } from '../../components/ui/SmartLabCard';
import { usePrintCenter, usePrintDraft } from '../../components/reports/printCenter/PrintCenterProvider';
import { calculateEquation } from '../../logic/calculations';
import { Analisi } from '../analisi/Analisi';
import { Measure3DModal } from './modals/Measure3DModal';
import { DEFAULT_RANGE_EMATO } from '../../logic/db_defaults';
import { VisitWizard } from './layout/VisitWizard';
import { StepContext } from '../../components/ui/Card';
import { PendingChangeModal } from './modals/PendingChangeModal';
import { AnthropometrySection } from './sections/AnthropometrySection';
import { BioimpedanceSection } from './sections/BioimpedanceSection';
import { BloodTestsSection } from './sections/bloodTests/BloodTestsSection';
import { ConclusionsSection } from './sections/ConclusionsSection';
import { GeneralSection } from './sections/GeneralSection';
import { ClinicalAnamnesis } from '../../components/patient/info/ClinicalAnamnesis';
import { buildSections, VISIT_MODES, carryOver } from './data/visitSections';
import { VisitStart } from './layout/VisitStart';
import { PlansWorkspace } from './layout/PlansWorkspace';
import { DietPlan } from '../../components/patient/diet/DietPlan';
import { TrainingPlan } from '../../components/patient/training/TrainingPlan';
import { SkinfoldsSection } from './sections/SkinfoldsSection';

export const NewVisitView = ({ patient, visitDraft, updateDraft, handleFinalizeVisit, updatePatientInfo, configA, setConfigA, configB, setConfigB, db, onUpdateDb, onDone, initialMode, initialVisitId, updateDraftMany }) => {
    const printCenter = usePrintCenter();
    const [showAnalisi, setShowAnalisi] = useState(false);
    const [show3D, setShow3D] = useState(null); // 'circ' | 'pliche': misure guidate sul corpo 3D

    const [pendingChange, setPendingChange] = useState(null);

    // Filtri per le formule (Memoizzati per performance)
    const formulePliche = useMemo(() => db.formule.filter((f) => f.categoria === 'Densità Corporea'), [db.formule]);
    const formuleConv = useMemo(() => db.formule.filter((f) => f.categoria === 'Conversione %FM' || f.titolo.includes('Siri')), [db.formule]);

    // Passo corrente della visita (indice in SECTIONS)
    const [step, setStep] = useState(0);
    // percorso scelto nella schermata iniziale: { mode, rilievi, plans }; null = ancora da scegliere
    const [path, setPath] = useState(() => {
        const m = VISIT_MODES.find((x) => x.id === initialMode);
        return m ? { mode: m, rilievi: m.rilievi, plans: m.plans } : null;
    });
    const sections = useMemo(() => (path ? buildSections(path.rilievi) : []), [path]);
    // fase "piani": Dieta e Training come due lavori distinti; si apre subito se il percorso non ha rilievi
    const [inPlans, setInPlans] = useState(() => !!path && path.rilievi.length === 0);
    const [plan, setPlan] = useState(() => path?.plans?.[0] || 'dieta');
    const sectionRefs = useRef({});
    const noop = () => {};

    // Calcolo Età
    const oggi = new Date();
    const nascita = new Date(patient.dataNascita || oggi);
    let etaPaziente = oggi.getFullYear() - nascita.getFullYear();
    if (oggi.getMonth() < nascita.getMonth() || (oggi.getMonth() === nascita.getMonth() && oggi.getDate() < nascita.getDate())) etaPaziente--;

    // Somma Pliche in tempo reale
    const sommaPliche = useMemo(() => {
        const plicheKeys = [
            'pl_pettorale',
            'pl_tricipite',
            'pl_bicipite',
            'pl_sottoscap',
            'pl_ascellare',
            'pl_addome',
            'pl_sovrailiaca',
            'pl_coscia',
            'pl_polpaccio',
        ];
        const somma = plicheKeys.reduce((acc, key) => {
            const valString = String(visitDraft[key] || '0').replace(',', '.');
            const val = parseFloat(valString) || 0;
            return acc + val;
        }, 0);
        return somma.toFixed(1);
    }, [visitDraft]);

    // Contesto per i calcoli delle formule
    const calculationContext = useMemo(() => {
        const data = {};
        Object.keys(visitDraft).forEach((key) => {
            data[key] = parseFloat(String(visitDraft[key]).replace(',', '.')) || 0;
        });
        data.sesso = (patient.sesso || 'M').toUpperCase();
        data.eta = etaPaziente;
        data.sommaPliche = parseFloat(sommaPliche) || 0;
        data.logSomma = data.sommaPliche > 0 ? Math.log10(data.sommaPliche) : 0;
        return data;
    }, [visitDraft, patient.sesso, etaPaziente, sommaPliche]);

    // Generazione Dati per il Report (Calcoli in tempo reale)
    const getLiveReportData = () => {
        const calcolaMetodo = (cfg) => {
            const fDens = db.formule.find((f) => f.id === Number(cfg.densId));
            const fConv = db.formule.find((f) => f.id === Number(cfg.convId));
            const dcVal = fDens && calculationContext.sommaPliche > 0 ? calculateEquation(fDens.equazione, calculationContext) : 0;
            const ctxConDc = { ...calculationContext, dc: dcVal };
            const fmVal = fDens && fConv && dcVal !== null ? calculateEquation(fConv.equazione, ctxConDc) : 0;
            const peso = calculationContext.peso || 0;

            return {
                formula_densita: fDens?.titolo || 'N/A',
                formula_conv: fConv?.titolo || 'N/A',
                densita: dcVal && dcVal !== 0 ? Number(dcVal).toFixed(4) : '--',
                fm_percent: fmVal && fmVal !== 0 ? Number(fmVal).toFixed(2) : '--',
                fm_kg: fmVal && peso > 0 ? ((peso * fmVal) / 100).toFixed(2) : '--',
                ffm_kg: fmVal && peso > 0 ? (peso - (peso * fmVal) / 100).toFixed(2) : '--',
            };
        };

        return {
            ...visitDraft,
            risultati_metodo_A: calcolaMetodo(configA),
            risultati_metodo_B: calcolaMetodo(configB),
        };
    };
    // il Centro stampa (anche dal tasto in alto) può stampare la visita in corso prima di salvarla
    usePrintDraft(getLiveReportData);

    // Calcoli per BIVA
    const rawRz = visitDraft.biva_rz;
    const rawXc = visitDraft.biva_xc;
    const rawHeight = visitDraft.altezza;
    const monoRz = parseFloat(rawRz);
    const monoXc = parseFloat(rawXc);
    const heightVal = parseFloat(rawHeight);
    const monoPhA = monoRz && monoXc ? (Math.atan2(monoXc, monoRz) * 180) / Math.PI : null;
    const rzH = monoRz && heightVal ? (monoRz / (heightVal / 100)).toFixed(1) : '-';
    const xcH = monoXc && heightVal ? (monoXc / (heightVal / 100)).toFixed(1) : '-';

    const sessoPaziente = patient.sesso && patient.sesso.toUpperCase() === 'F' ? 'F' : 'M';

    const handleSettingsChange = (dbKey, field, oldVal, newVal) => {
        setPendingChange({
            key: dbKey,
            field: field, // 'min', 'max', o 'unit'
            oldVal: oldVal,
            newVal: newVal,
        });
    };

    const confirmSettingsChange = () => {
        if (!pendingChange) return;
        const { key, field, newVal } = pendingChange;

        onUpdateDb((prevDb) => {
            // Copia profonda per evitare mutazioni dirette
            const newRangeEmato = { ...prevDb.rangeEmato };

            // Assicuriamoci che l'oggetto esista
            if (!newRangeEmato[key]) newRangeEmato[key] = { ...DEFAULT_RANGE_EMATO[key] };

            // Aggiorniamo il campo corretto
            if (field === 'unit') {
                newRangeEmato[key].unit = newVal;
            } else if (field === 'min') {
                // Aggiorna minM o minF in base al sesso del paziente attuale
                if (sessoPaziente === 'M') newRangeEmato[key].minM = Number(newVal);
                else newRangeEmato[key].minF = Number(newVal);
            } else if (field === 'max') {
                // Aggiorna maxM o maxF
                if (sessoPaziente === 'M') newRangeEmato[key].maxM = Number(newVal);
                else newRangeEmato[key].maxF = Number(newVal);
            }

            return { ...prevDb, rangeEmato: newRangeEmato };
        });

        setPendingChange(null); // Chiudi modale
    };

    const renderBloodInput = (dbKey) => {
        // PRENDIAMO I DATI DAL DB (o fallback ai default se non esistono nel DB ancora)
        const config = db.rangeEmato?.[dbKey] || DEFAULT_RANGE_EMATO[dbKey];
        if (!config) return null;

        const minVal = sessoPaziente === 'M' ? config.minM : config.minF;
        const maxVal = sessoPaziente === 'M' ? config.maxM : config.maxF;

        return (
            <SmartLabCard
                key={dbKey}
                label={config.label}
                unit={config.unit}
                defaultMin={minVal}
                defaultMax={maxVal}
                name={dbKey}
                value={visitDraft[dbKey]}
                onChange={updateDraft}
                // NUOVO PROP:
                onSettingsChange={(field, oldVal, newVal) => handleSettingsChange(dbKey, field, oldVal, newVal)}
            />
        );
    };

    const btn3D = (layer) => (
        <button
            onClick={() => setShow3D(layer)}
            className="vw-chip mb-4"
        >
            <i className="ph ph-person-simple"></i> Misura sul modello 3D
        </button>
    );

    const renderStep = (id) => {
        const common = { activeSection: id, sectionRefs, setActiveSection: noop, updateDraft, visitDraft };
        return (
            <StepContext.Provider value={true}>
                {id === 'anamnesi' && <ClinicalAnamnesis patient={patient} updatePatientInfo={updatePatientInfo} />}
                {id === 'antropometria' && (
                    <>
                        {btn3D('circ')}
                        <AnthropometrySection {...common} />
                    </>
                )}
                {id === 'plicometria' && (
                    <>
                    {btn3D('pliche')}
                    <SkinfoldsSection
                        {...common}
                        calculationContext={calculationContext}
                        configA={configA}
                        configB={configB}
                        formuleConv={formuleConv}
                        formulePliche={formulePliche}
                        setConfigA={setConfigA}
                        setConfigB={setConfigB}
                        sommaPliche={sommaPliche}
                    />
                    </>
                )}
                {id === 'bioimpedenza' && <BioimpedanceSection {...common} monoPhA={monoPhA} rawRz={rawRz} rawXc={rawXc} rzH={rzH} xcH={xcH} />}
                {id === 'ematochimico' && <BloodTestsSection activeSection={id} renderBloodInput={renderBloodInput} sectionRefs={sectionRefs} setActiveSection={noop} />}
                {id === 'generale' && <GeneralSection {...common} />}
                {id === 'conclusioni' && <ConclusionsSection sectionRefs={sectionRefs} updateDraft={updateDraft} visitDraft={visitDraft} />}
            </StepContext.Provider>
        );
    };

    if (!path) {
        return (
            <VisitStart
                patient={patient}
                onPick={(m) => {
                    setStep(0);
                    setPath({ mode: m, rilievi: m.rilievi, plans: m.plans });
                    setPlan(m.plans[0]);
                    setInPlans(m.rilievi.length === 0);
                    // il controllo parte dai dati stabili dell'ultima visita (altezza, diametri, lunghezze)
                    if (m.id === 'controllo' && updateDraftMany) updateDraftMany(carryOver(patient.visite?.[0]?.dettagli));
                }}
            />
        );
    }

    if (inPlans) {
        return (
            <PlansWorkspace patient={patient} active={plan} setActive={setPlan} onDone={onDone} >
                {plan === 'dieta' ? <DietPlan patient={patient} onUpdateDb={onUpdateDb} db={db} initialVisitId={initialVisitId} /> : <TrainingPlan patient={patient} onUpdateDb={onUpdateDb} db={db} />}
            </PlansWorkspace>
        );
    }

    return (
        <>
            <VisitWizard
                patient={patient}
                visitDraft={visitDraft}
                sections={sections}
                title={path.mode.title}
                onChangeMode={() => setPath(null)}
                step={step}
                setStep={setStep}
                onPreview={() => printCenter && printCenter.open(['visita', 'grafici'])}
                onAnalysis={() => setShowAnalisi(true)}
                onSave={() => {
                    // senza il peso non si puo' salvare: si torna al passo delle misure, dove va inserito
                    if (!visitDraft.peso) {
                        setStep(Math.max(0, sections.findIndex((s) => s.id === 'antropometria')));
                        handleFinalizeVisit();
                        return;
                    }
                    if (handleFinalizeVisit({ stay: true })) setInPlans(true);
                }}
                renderStep={renderStep}
            />
            {show3D && <Measure3DModal layer={show3D} sesso={sessoPaziente} visitDraft={visitDraft} updateDraft={updateDraft} onClose={() => setShow3D(null)} />}
            {showAnalisi && <Analisi patient={patient} visitData={visitDraft} report={getLiveReportData()} sesso={sessoPaziente} eta={etaPaziente} updateDraft={updateDraft} onClose={() => setShowAnalisi(false)} />}

            <PendingChangeModal
                confirmSettingsChange={confirmSettingsChange}
                db={db}
                pendingChange={pendingChange}
                sessoPaziente={sessoPaziente}
                setPendingChange={setPendingChange}
            />
        </>
    );
};
