import React from 'react';
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
    onUpdateDb,
    patient,
    setConfigA,
    setConfigB,
    setDietViewMode,
    updateDraft,
    updatePatientInfo,
    view,
    visitDraft,
}) => {
    return (
        <div className={`flex-1 overflow-y-auto relative ${['visit', 'diet', 'Allenamento'].includes(view) ? '' : 'p-4 md:p-8'}`}>
            {view === 'info' && <ClinicalFolder patient={patient} updatePatientInfo={updatePatientInfo} professionalData={db.utente} />}

            {view === 'history' && <HistoryView patient={patient} onUpdateDb={onUpdateDb} />}

            {view === 'visit' && (
                <NewVisitView
                    patient={patient}
                    visitDraft={visitDraft}
                    updateDraft={updateDraft}
                    handleFinalizeVisit={handleFinalizeVisit}
                    configA={configA}
                    setConfigA={setConfigA}
                    configB={configB}
                    setConfigB={setConfigB}
                    db={db}
                    onUpdateDb={onUpdateDb}
                />
            )}

            {/* --- ECCO IL BLOCCO ALLENAMENTO REINSERITO --- */}
            {view === 'Allenamento' && (
                <TrainingPlan patient={patient} onUpdateDb={onUpdateDb} db={db} />
            )}

            {view === 'diet' && <DietPlan patient={patient} onUpdateDb={onUpdateDb} db={db} />}
        </div>
    );
};
