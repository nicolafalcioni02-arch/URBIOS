import React, { useEffect, useState } from 'react';
import { ClinicalFolder } from '../../../components/patient/ClinicalFolder';
import { HistoryView } from '../../../components/patient/history/HistoryView';
import { NewVisitView } from '../../newVisit/NewVisitView';
import { TrainingPlan } from '../../../components/patient/training/TrainingPlan';
import { DietPlan } from '../../../components/patient/diet/DietPlan';

export const PatientTabContent = ({
    configA,
    configB,
    db,
    dietViewMode,
    handleFinalizeVisit,
    onDone,
    updateDraftMany,
    visitStart,
    visitStartId = null,
    visitKey = 0,
    onUpdateDb,
    onOpenDiet,
    patient,
    setConfigA,
    setConfigB,
    setDietViewMode,
    updateDraft,
    updatePatientInfo,
    view,
    visitDraft,
    widgetsPad = false,
}) => {
    // Nuova visita, una volta aperta, resta montata (solo nascosta): cambiare scheda per guardare lo storico non fa perdere il lavoro
    const [visitOpened, setVisitOpened] = useState(view === 'visit');
    useEffect(() => {
        if (view === 'visit') setVisitOpened(true);
    }, [view]);

    return (
        <div className={`flex-1 overflow-y-auto relative ${['visit', 'diet', 'Allenamento'].includes(view) ? '' : 'p-4 md:p-8'} ${widgetsPad ? 'wd-padded' : ''}`}>
            {view === 'info' && <ClinicalFolder patient={patient} updatePatientInfo={updatePatientInfo} professionalData={db.utente} />}

            {view === 'history' && <HistoryView patient={patient} onUpdateDb={onUpdateDb} onOpenDiet={onOpenDiet} />}

            {(visitOpened || view === 'visit') && (
                <div hidden={view !== 'visit'} className="h-full">
                <NewVisitView
                    key={visitKey}
                    initialMode={visitStart}
                    initialVisitId={visitStartId}
                    updateDraftMany={updateDraftMany}
                    patient={patient}
                    visitDraft={visitDraft}
                    updateDraft={updateDraft}
                    updatePatientInfo={updatePatientInfo}
                    handleFinalizeVisit={handleFinalizeVisit}
                    configA={configA}
                    setConfigA={setConfigA}
                    configB={configB}
                    setConfigB={setConfigB}
                    db={db}
                    onUpdateDb={onUpdateDb}
                    onDone={onDone}
                />
                </div>
            )}

            {/* --- ECCO IL BLOCCO ALLENAMENTO REINSERITO --- */}
            {view === 'Allenamento' && (
                <TrainingPlan patient={patient} onUpdateDb={onUpdateDb} db={db} />
            )}

            {view === 'diet' && <DietPlan patient={patient} onUpdateDb={onUpdateDb} db={db} />}
        </div>
    );
};
