import { useState, useRef } from 'react';
import { DietPrintReport } from './printReport/DietPrintReport';
import { dietCss } from './dietStyles';
import { AnalysisModal } from './analysis/AnalysisModal';
import { DrvEditorModal } from './modals/DrvEditorModal';
import { FoodDatabaseModal } from './modals/FoodDatabaseModal';
import { LafCalculatorModal } from './modals/LafCalculatorModal';
import { SmartChartModal } from './modals/SmartChartModal';
import { DietGuided } from './guided/DietGuided';
import { fmtLong, genId, planDateInfo } from './guided/guidedLogic';
import { emptyFoodTemplate } from './data/emptyFoodTemplate';
import { useFoodDatabase } from './hooks/useFoodDatabase';
import { useLafCalculator } from './hooks/useLafCalculator';
import { useDietAnalysis } from './hooks/useDietAnalysis';
import { useDietPlanData } from './hooks/useDietPlanData';

// Modulo Dieta. La schermata è una sola (guidata, in 3 passi: Obiettivi → Menù → Consegna), vedi guided/.
// Qui vivono lo stato del piano e le finestre di servizio (database alimenti, analisi, grafici, stampa, riferimenti, calcolatore LAF).
// (la vecchia "vista avanzata" è stata tolta: una copia è in .claude/backup/DietPlan.avanzata.jsx)
export const DietPlan = ({ patient, onUpdateDb, db }) => {
    const {
        currentPatient,
        listaVisite,
        selectedVisitaId,
        setSelectedVisitaId,
        visitaAttiva,
        calcData,
        setCalcData,
        targets,
        setTargets,
        dietDays,
        setDietDays,
        savedReports,
        setSavedReports,
        foodDB,
        setFoodDB,
        mealLibrary,
        setMealLibrary,
        drvDB,
        setDrvDB,
        dietBook,
        setDietBook,
        patientProfile,
    } = useDietPlanData({ db, onUpdateDb, patient });

    // finestre di servizio
    const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
    const [isDbOpen, setIsDbOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isSmartOpen, setIsSmartOpen] = useState(false);
    const [isDrvEditorOpen, setIsDrvEditorOpen] = useState(false);
    const [isLafModalOpen, setIsLafModalOpen] = useState(false);

    // database alimenti
    const [dbSearch, setDbSearch] = useState('');
    const [newFood, setNewFood] = useState({ name: '', category: '', kcal: '', p: '', c: '', f: '' });
    const [editingFood, setEditingFood] = useState(null); // null = elenco; oggetto = editor
    const [editorTab, setEditorTab] = useState('base');
    const fileInputRef = useRef(null);
    const { deleteFoodDB, exportJSON, importJSON } = useFoodDatabase({ foodDB, newFood, setFoodDB, setNewFood });

    const handleSaveEditedFood = () => {
        if (!editingFood.name) return alert('Il nome è obbligatorio!');
        if (editingFood._editIndex !== undefined) {
            const newDb = [...foodDB];
            const idx = editingFood._editIndex;
            delete editingFood._editIndex;
            newDb[idx] = editingFood;
            setFoodDB(newDb);
        } else setFoodDB([editingFood, ...foodDB]);
        setEditingFood(null);
    };

    // riferimenti (DRV) e calcolatore LAF
    const [drvSearch, setDrvSearch] = useState('');
    const drvFileInputRef = useRef(null);
    const { lafActivities, setLafActivities, totalLafHours, calculatedLAF, applyLafTemplate } = useLafCalculator();

    // grafici: il giorno "attivo" è quello aperto nel menù
    const [activeDayId, setActiveDayId] = useState(null);
    const activeDay = dietDays.find((d) => d.id === activeDayId) || dietDays[0];
    const [smartConfig, setSmartConfig] = useState({ type: 'bar', metric: 'kcal', scope: 'activeDay', comment: '', showTarget: true });
    const { plotRef, saveSmartReport } = useDietAnalysis({
        activeDay,
        dietDays,
        drvDB,
        emptyFoodTemplate,
        foodDB,
        genId,
        isSmartOpen,
        patientProfile,
        savedReports,
        setIsSmartOpen,
        setSavedReports,
        setSmartConfig,
        smartConfig,
        targets,
    });

    const issueDate = (() => {
        const di = planDateInfo(visitaAttiva);
        return di.none ? '' : di.iso ? fmtLong(di.iso) : undefined;
    })();

    return (
        <div className="d-root dg-page">
            <style>{dietCss}</style>

            <DietGuided
                patient={currentPatient}
                db={db}
                onUpdateDb={onUpdateDb}
                listaVisite={listaVisite}
                visitaAttiva={visitaAttiva}
                selectedVisitaId={selectedVisitaId}
                setSelectedVisitaId={setSelectedVisitaId}
                calcData={calcData}
                setCalcData={setCalcData}
                targets={targets}
                setTargets={setTargets}
                dietDays={dietDays}
                setDietDays={setDietDays}
                savedReports={savedReports}
                foodDB={foodDB}
                mealLibrary={mealLibrary}
                setMealLibrary={setMealLibrary}
                dietBook={dietBook}
                setDietBook={setDietBook}
                onFoods={() => setIsDbOpen(true)}
                onAnalysis={() => setIsAnalysisOpen(true)}
                onChart={() => setIsSmartOpen(true)}
                onPrint={() => setIsPrintReportOpen(true)}
                onLaf={() => setIsLafModalOpen(true)}
                onActiveDay={setActiveDayId}
            />

            <FoodDatabaseModal
                dbSearch={dbSearch}
                deleteFoodDB={deleteFoodDB}
                editingFood={editingFood}
                editorTab={editorTab}
                emptyFoodTemplate={emptyFoodTemplate}
                exportJSON={exportJSON}
                fileInputRef={fileInputRef}
                foodDB={foodDB}
                handleSaveEditedFood={handleSaveEditedFood}
                importJSON={importJSON}
                isDbOpen={isDbOpen}
                setDbSearch={setDbSearch}
                setEditingFood={setEditingFood}
                setEditorTab={setEditorTab}
                setIsDbOpen={setIsDbOpen}
            />

            <SmartChartModal
                activeDay={activeDay}
                isSmartOpen={isSmartOpen}
                plotRef={plotRef}
                saveSmartReport={saveSmartReport}
                setIsSmartOpen={setIsSmartOpen}
                setSmartConfig={setSmartConfig}
                smartConfig={smartConfig}
            />

            <AnalysisModal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                patient={currentPatient}
                calcData={calcData}
                targets={targets}
                dietDays={dietDays}
                foodDB={foodDB}
                drvDB={drvDB}
                onOpenDrv={() => setIsDrvEditorOpen(true)}
            />

            <DrvEditorModal
                drvDB={drvDB}
                drvFileInputRef={drvFileInputRef}
                drvSearch={drvSearch}
                isDrvEditorOpen={isDrvEditorOpen}
                setDrvDB={setDrvDB}
                setDrvSearch={setDrvSearch}
                setIsDrvEditorOpen={setIsDrvEditorOpen}
            />

            <LafCalculatorModal
                applyLafTemplate={applyLafTemplate}
                calcData={calcData}
                calculatedLAF={calculatedLAF}
                isLafModalOpen={isLafModalOpen}
                lafActivities={lafActivities}
                setCalcData={setCalcData}
                setIsLafModalOpen={setIsLafModalOpen}
                setLafActivities={setLafActivities}
                totalLafHours={totalLafHours}
            />

            {isPrintReportOpen && (
                <DietPrintReport
                    patient={patientProfile}
                    professionalData={db?.utente}
                    dietDays={dietDays}
                    targets={targets}
                    savedReports={savedReports}
                    issueDate={issueDate}
                    onClose={() => setIsPrintReportOpen(false)}
                />
            )}
        </div>
    );
};
