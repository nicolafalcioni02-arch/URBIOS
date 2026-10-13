import React, { useState, useRef, useMemo } from 'react';
import { SmartLabCard } from '../../components/ui/SmartLabCard';
import { ReportPreviewModal } from '../../components/reports/reportPreview/ReportPreviewModal';
import { calculateEquation } from '../../logic/calculations';
import { Analisi } from '../analisi/Analisi';
import { DEFAULT_RANGE_EMATO } from '../../logic/db_defaults';
import { VisitHeaderBar } from './layout/VisitHeaderBar';
import { PendingChangeModal } from './modals/PendingChangeModal';
import { AnthropometrySection } from './sections/AnthropometrySection';
import { BioimpedanceSection } from './sections/BioimpedanceSection';
import { BloodTestsSection } from './sections/bloodTests/BloodTestsSection';
import { ConclusionsSection } from './sections/ConclusionsSection';
import { GeneralSection } from './sections/GeneralSection';
import { SkinfoldsSection } from './sections/SkinfoldsSection';

export const NewVisitView = ({ patient, visitDraft, updateDraft, handleFinalizeVisit, configA, setConfigA, configB, setConfigB, db, onUpdateDb }) => {
    const [showReport, setShowReport] = useState(false);
    const [showAnalisi, setShowAnalisi] = useState(false);

    const [pendingChange, setPendingChange] = useState(null);

    // Filtri per le formule (Memoizzati per performance)
    const formulePliche = useMemo(() => db.formule.filter((f) => f.categoria === 'Densità Corporea'), [db.formule]);
    const formuleConv = useMemo(() => db.formule.filter((f) => f.categoria === 'Conversione %FM' || f.titolo.includes('Siri')), [db.formule]);

    const [activeSection, setActiveSection] = useState(null);
    const sectionRefs = useRef({});

    // Gestione Scroll Intelligente
    const handleNavClick = (sectionId) => {
        if (activeSection === sectionId) {
            setActiveSection(null);
            return;
        }
        setActiveSection(sectionId);

        setTimeout(() => {
            const element = sectionRefs.current[sectionId];
            if (element) {
                const MARGINE_SUPERIORE_MANUALE = 200;
                const scrollContainer = element.closest('.overflow-y-auto');

                if (scrollContainer) {
                    const topPos = element.offsetTop - MARGINE_SUPERIORE_MANUALE;
                    scrollContainer.scrollTo({ top: topPos, behavior: 'smooth' });
                } else {
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: elementPosition - MARGINE_SUPERIORE_MANUALE, behavior: 'smooth' });
                }
            }
        }, 350);
    };

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
            const dcVal = fDens ? calculateEquation(fDens.equazione, calculationContext) : 0;
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

    return (
        <div className="max-w-[1600px] mx-auto pb-40 px-6 pt-0">
            {/* Layer Blur per l'header fisso */}
            <div
                className="fixed left-0 right-0 z-20 pointer-events-none"
                style={{
                    top: '0px',
                    height: '300px',
                    backdropFilter: 'blur(100px)',
                    WebkitBackdropFilter: 'blur(100px)',
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                }}
            ></div>

            {/* Banner Superiore */}
            <VisitHeaderBar
                activeSection={activeSection}
                handleFinalizeVisit={handleFinalizeVisit}
                handleNavClick={handleNavClick}
                setShowAnalisi={setShowAnalisi}
                setShowReport={setShowReport}
            />

            {/* Modale Anteprima Report */}
            {showReport && (
                <ReportPreviewModal visitDraft={getLiveReportData()} patient={patient} professionalData={db.utente} onClose={() => setShowReport(false)} />
            )}
            {/* --- MODALE ANALISI --- */}
            {showAnalisi && <Analisi patient={patient} visitData={visitDraft} updateDraft={updateDraft} onClose={() => setShowAnalisi(false)} />}

            {/* SEZIONE 1: ANTROPOMETRIA */}
            <AnthropometrySection
                activeSection={activeSection}
                sectionRefs={sectionRefs}
                setActiveSection={setActiveSection}
                updateDraft={updateDraft}
                visitDraft={visitDraft}
            />

            {/* SEZIONE 2: PLICOMETRIA */}
            <SkinfoldsSection
                activeSection={activeSection}
                calculationContext={calculationContext}
                configA={configA}
                configB={configB}
                formuleConv={formuleConv}
                formulePliche={formulePliche}
                sectionRefs={sectionRefs}
                setActiveSection={setActiveSection}
                setConfigA={setConfigA}
                setConfigB={setConfigB}
                sommaPliche={sommaPliche}
                updateDraft={updateDraft}
                visitDraft={visitDraft}
            />

            {/* SEZIONE 3: BIVA */}
            <BioimpedanceSection
                activeSection={activeSection}
                monoPhA={monoPhA}
                rawRz={rawRz}
                rawXc={rawXc}
                rzH={rzH}
                sectionRefs={sectionRefs}
                setActiveSection={setActiveSection}
                updateDraft={updateDraft}
                visitDraft={visitDraft}
                xcH={xcH}
            />

            {/* --- EMATOCHIMICO --- */}
            <BloodTestsSection
                activeSection={activeSection}
                renderBloodInput={renderBloodInput}
                sectionRefs={sectionRefs}
                setActiveSection={setActiveSection}
            />

            {/* SEZIONE 5: GENERALE */}
            <GeneralSection
                activeSection={activeSection}
                sectionRefs={sectionRefs}
                setActiveSection={setActiveSection}
                updateDraft={updateDraft}
                visitDraft={visitDraft}
            />

            {/* SEZIONE 6: CONCLUSIONI */}
            <ConclusionsSection sectionRefs={sectionRefs} updateDraft={updateDraft} visitDraft={visitDraft} />

            {
                <PendingChangeModal
                    confirmSettingsChange={confirmSettingsChange}
                    db={db}
                    pendingChange={pendingChange}
                    sessoPaziente={sessoPaziente}
                    setPendingChange={setPendingChange}
                />
            }
        </div>
    );
};
