import { useState, useEffect, useRef } from 'react';
import { DietPrintReport } from './printReport/DietPrintReport';
import { METRIC_CATALOG } from './data/metricCatalog';
import { dietCss } from './dietStyles';
import { calculateTotals } from './logic/dietTotals';
import { ChangeVisitModal } from './modals/ChangeVisitModal';
import { ClinicalAnalysisModal } from './modals/clinicalAnalysis/ClinicalAnalysisModal';
import { DrvEditorModal } from './modals/DrvEditorModal';
import { FoodDatabaseModal } from './modals/FoodDatabaseModal';
import { LafCalculatorModal } from './modals/LafCalculatorModal';
import { MealEditorModal } from './modals/mealEditor/MealEditorModal';
import { MealLibraryModal } from './modals/MealLibraryModal';
import { NutritionSetupModal } from './modals/nutritionSetup/NutritionSetupModal';
import { SaveMealToLibraryModal } from './modals/SaveMealToLibraryModal';
import { SaveStatusModal } from './modals/SaveStatusModal';
import { SmartChartModal } from './modals/SmartChartModal';
import { DietMainContent } from './views/dietMain/DietMainContent';
import { DietMenuView } from './views/DietMenuView';
import { DietSidebar } from './views/DietSidebar';
import { FloatingActions } from './views/FloatingActions';
import { useDietEditing } from './hooks/useDietEditing';
import { useDietDragDrop } from './hooks/useDietDragDrop';
import { useMatrixMeals } from './hooks/useMatrixMeals';
import { useFoodDatabase } from './hooks/useFoodDatabase';
import { useLafCalculator } from './hooks/useLafCalculator';
import { useDietAnalysis } from './hooks/useDietAnalysis';
import { useDietPlanData } from './hooks/useDietPlanData';

export const DietPlan = ({ patient, onUpdateDb, db, dietViewMode, setDietViewMode }) => {
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
        patientProfile,
    } = useDietPlanData({ db, onUpdateDb, patient });

    // Funzione helper per salvare la dieta corrente come una NUOVA visita ("Solo Dieta")
    const handleSalvaNuovaVisitaSoloDieta = () => {
        const nuovoId = Date.now();
        const nuovaVisitaSoloDieta = {
            id: nuovoId,
            data: new Date().toLocaleDateString('en-CA'),
            peso: calcData.weight || 70,
            dietStatus: 'active',
            note: 'Piano Nutrizionale Indipendente (Solo Dieta)',
            dettagli: {
                diet_calc_data: calcData,
                diet_targets: targets,
                diet_plan_data: dietDays,
                diet_saved_reports: savedReports,
            },
        };

        onUpdateDb((prevDb) => {
            const updatedPazienti = prevDb.pazienti.map((p) => {
                if (p.id !== currentPatient.id) return p;
                return { ...p, visite: [nuovaVisitaSoloDieta, ...(p.visite || [])] };
            });
            return { ...prevDb, pazienti: updatedPazienti };
        });

        setSelectedVisitaId(nuovoId);
        alert("Nuova istanza 'Solo Dieta' creata nello storico!");
    };

    // Stati per la ricerca e l'inserimento nel database
    const [dbSearch, setDbSearch] = useState('');
    const [newFood, setNewFood] = useState({ name: '', category: '', kcal: '', p: '', c: '', f: '' });

    // --- STATI DATABASE AVANZATO ---
    const [editingFood, setEditingFood] = useState(null); // Se null, mostra la lista. Se oggetto, mostra l'editor
    const [editorTab, setEditorTab] = useState('base'); // 'base', 'macro', 'micro', 'grassi', 'amino', 'altro'

    // Template vuoto con TUTTI i campi del tuo JSON
    const emptyFoodTemplate = {
        name: '',
        category: '',
        food_code: '',
        scientific_name: '',
        english_name: '',
        info: '',
        samples_number: 0,
        edible_part: 1.0,
        portion: 100,
        image: '',
        water: 0,
        energy_kcal: 0,
        energy_kj: 0,
        proteins: 0,
        lipids: 0,
        cholesterol: 0,
        available_carbohydrates: 0,
        starch: 0,
        soluble_sugars: 0,
        alcohol: 0,
        total_fiber: 0,
        soluble_fiber: 0,
        insoluble_fiber: 0,
        sucrose: 0,
        glucose: 0,
        fructose: 0,
        lactose: 0,
        galactose: 0,
        maltose: 0,
        maltotriosium: 0,
        raffinose: 0,
        fluorine: 0,
        sodium: 0,
        magnesium: 0,
        phosphorus: 0,
        chlorine: 0,
        potassium: 0,
        calcium: 0,
        chromium: 0,
        manganese: 0,
        iron: 0,
        nickel: 0,
        copper: 0,
        zinc: 0,
        selenium: 0,
        iodine: 0,
        total_carotenoids: 0,
        alpha_carotene: 0,
        beta_carotene: 0,
        cryptoxanthin: 0,
        lycopene: 0,
        lutein: 0,
        retinol: 0,
        zeaxanthin: 0,
        vitamin_a_retinol_equivalent: 0,
        thiamine: 0,
        riboflavin: 0,
        niacin: 0,
        pantothenic_acid: 0,
        vitamin_b6: 0,
        biotin: 0,
        folate: 0,
        vitamin_b12: 0,
        vitamin_c: 0,
        vitamin_d: 0,
        vitamin_e: 0,
        alpha_tocopherol: 0,
        beta_tocopherol: 0,
        gamma_tocopherol: 0,
        delta_tocopherol: 0,
        vitamin_k: 0,
        Saturated_fatty_acids: 0,
        'C4:0-C10:0': 0,
        'C4:0_butyric_acid': 0,
        'C6:0_capronic_acid': 0,
        'C7:0_enanthic_acid': 0,
        'C8:0_caprylic_acid': 0,
        'C10:0_caprinic_acid': 0,
        'C12:0_lauric_acid': 0,
        'C13:0_tridecanoic_acid': 0,
        'C14:0_myristic_acid': 0,
        'C15:0_pentadecanoic_acid': 0,
        'C16:0_palmitic_acid': 0,
        'C17:0_heptadecanoic_acid': 0,
        'C18:0_stearic_acid': 0,
        'C20:0_arachidic_acid': 0,
        'C22:0_behenic_acid': 0,
        'C24:0_lignoceric_acid': 0,
        monounsaturated_fatty_acids: 0,
        'C10:1_caproleic_acid': 0,
        'C12:1_lauroleic_acid': 0,
        'C13:1_tridecenoic_acid': 0,
        'C14:1_myristoleic_acid': 0,
        'C15:1_pentadecenoic_acid': 0,
        'C16:1 palmitoleic_acid': 0,
        'C17:1_heptadecenoic_acid': 0,
        'C18:1_oleic_acid': 0,
        'C20:1_eicosenoic_acid': 0,
        'C22:1_erucic_acid': 0,
        polyunsaturated_fatty_acids: 0,
        'C18:2_linoleic_acid': 0,
        'C18:3_linolenic_acid': 0,
        'C20:4_arachidonic_acid': 0,
        'C20:5_eicosapentaenoic_acid_EPA': 0,
        'C22:6_docosahexaenoic_acid_DHA': 0,
        polyunsaturated_saturated: 0,
        alanine: 0,
        cystine: 0,
        aspartic_acid: 0,
        glutamic_acid: 0,
        phenylalanine: 0,
        glycine: 0,
        histidine: 0,
        isoleucine: 0,
        lysine: 0,
        leucine: 0,
        methionine: 0,
        proline: 0,
        arginine: 0,
        serine: 0,
        threonine: 0,
        valine: 0,
        tryptophan: 0,
        tyrosine: 0,
        chemical_index: 0,
        limiting_amino_acid: '',
        caffeic_acid: 0,
        citric_acid: 0,
        phytic_acid: 0,
        malic_acid: 0,
        apigenin: 0,
        antioxidant_activity: 0,
        campferol: 0,
        phytosterols: 0,
        'fructo-oligosaccharides': 0,
        myricetin: 0,
        polyphenols: 0,
        quercetin: 0,
        violaxanthin: 0,
    };

    const handleSaveEditedFood = () => {
        if (!editingFood.name) return alert('Il nome è obbligatorio!');

        // Se ha un indice (_editIndex) lo stiamo modificando, altrimenti è nuovo
        if (editingFood._editIndex !== undefined) {
            const newDb = [...foodDB];
            const idx = editingFood._editIndex;
            delete editingFood._editIndex; // pulizia
            newDb[idx] = editingFood;
            setFoodDB(newDb);
        } else {
            setFoodDB([editingFood, ...foodDB]);
        }
        setEditingFood(null);
    };

    // Autocompletamento per la ricerca degli alimenti durante la compilazione del pasto
    const [suggestions, setSuggestions] = useState({});
    const [activeMealInfo, setActiveMealInfo] = useState(null);
    const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
    const [isDbOpen, setIsDbOpen] = useState(false);
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaveStatusOpen, setIsSaveStatusOpen] = useState(false);

    const [mealToSave, setMealToSave] = useState(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [libFilter, setLibFilter] = useState('Tutti');

    // Ref per Import JSON del database
    const fileInputRef = useRef(null);

    // --- FUNZIONI CORE ---

    const {
        genId,
        addNewDay,
        duplicateDay,
        removeDay,
        updateDayTitle,
        updateMealTitle,
        addFoodItem,
        removeFoodItem,
        updateFoodValue,
        addSubstitution,
        removeSubstitution,
        updateSubstitutionValue,
        applySubSuggestion,
        swapSubstitution,
        handleSaveClick,
        confirmSaveToLibrary,
        loadFromLibrary,
        applyFoodSuggestion,
    } = useDietEditing({
        activeMealInfo,
        calcData,
        foodDB,
        mealToSave,
        setDietDays,
        setIsLibraryOpen,
        setIsSaveModalOpen,
        setMealLibrary,
        setMealToSave,
        setSuggestions,
    });

    const {
        dragOverId,
        setDragOverId,
        matrixDragId,
        setMatrixDragId,
        matrixDragOverId,
        setMatrixDragOverId,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
    } = useDietDragDrop({ setDietDays });

    // ==========================================
    // --- FUNZIONI DI GESTIONE MATRICE PASTI ---
    // ==========================================

    const { updateMatrixMeal, addMatrixMeal, removeMatrixMeal, duplicateMatrixMeal, handleMatrixDrop, updateMatrixMacro } = useMatrixMeals({
        genId,
        matrixDragId,
        setCalcData,
        setMatrixDragId,
        setMatrixDragOverId,
    });

    // --- GESTIONE DATABASE ALIMENTI ---

    const { isChangeVisitOpen, setIsChangeVisitOpen, deleteFoodDB, exportJSON, importJSON } = useFoodDatabase({ foodDB, newFood, setFoodDB, setNewFood });

    // --- CALCOLI TARGET E PROGRESSI ---

    // Trova il giorno attualmente attivo in base al pasto selezionato
    const activeDay = dietDays.find((d) => d.id === activeMealInfo?.dayId) || dietDays[0];

    // Calcola il totale dei macronutrienti per l'intera giornata attiva
    const activeDayTotals = activeDay ? calculateTotals(activeDay.meals.flatMap((m) => m.items)) : { kcal: 0, p: 0, c: 0, f: 0 };

    // Converte le percentuali dei target (es. 40% carbo) in grammi effettivi basati sulle Kcal totali
    // Proteine e Carbo: 4 kcal per grammo | Grassi: 9 kcal per grammo
    const targetGrams = {
        p: Math.round((targets.kcal * (targets.p / 100)) / 4),
        c: Math.round((targets.kcal * (targets.c / 100)) / 4),
        f: Math.round((targets.kcal * (targets.f / 100)) / 9),
    };

    // --- COMPONENTE AUSILIARIO: PROGRESS BAR ---
    // Definito all'interno per accedere comodamente agli stili
    const renderProgressBar = (label, current, max, color) => {
        const pct = Math.min((current / (max || 1)) * 100, 100) || 0;
        const isOver = current > max;
        return (
            <div style={{ marginBottom: '12px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#86868B',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                    }}
                >
                    <span>{label}</span>
                    <span style={{ color: isOver ? '#FF3B30' : '#1D1D1F' }}>
                        {current.toFixed(0)} / {max}
                    </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E5E5EA', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                        style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', background: isOver ? '#FF3B30' : color, transition: 'width 0.4s ease' }}
                    />
                </div>
            </div>
        );
    };

    // --- STATI PER DASHBOARD E MODALE SMART ---
    const [smartConfig, setSmartConfig] = useState({
        type: 'bar',
        metric: 'kcal', // vedi METRIC_CATALOG per tutte le opzioni
        scope: 'activeDay',
        comment: '',
        showTarget: true, // NUOVO: mostra linea target EFSA/DRV
    });
    const [isSmartOpen, setIsSmartOpen] = useState(false);

    // --- STATO LAF ACTIVITIES ---
    const [drvSearch, setDrvSearch] = useState('');

    const { lafActivities, setLafActivities, totalLafHours, calculatedLAF, applyLafTemplate } = useLafCalculator();

    const [selectedMealForAnalysis, setSelectedMealForAnalysis] = useState(null); // ID del pasto se 'meal'

    const [analysisTargetId, setAnalysisTargetId] = useState('all');
    const [setupTab, setSetupTab] = useState('antropometria');
    const [showGlossary, setShowGlossary] = useState(false);
    const [isLafModalOpen, setIsLafModalOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [analysisTimeframe, setAnalysisTimeframe] = useState('day');
    const [isDrvEditorOpen, setIsDrvEditorOpen] = useState(false);
    const drvFileInputRef = useRef(null);

    const { plotRef, getPatientTargets, saveSmartReport, deleteReport, analyzeCompleteBioProfile } = useDietAnalysis({
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

    // --- INIZIO RENDER COMPONENTE ---
    // --- INIZIO RENDER COMPONENTE ---
    if (dietViewMode === 'menu') {
        return (
            <DietMenuView
                calcData={calcData}
                currentPatient={currentPatient}
                listaVisite={listaVisite}
                onUpdateDb={onUpdateDb}
                setCalcData={setCalcData}
                setDietDays={setDietDays}
                setDietViewMode={setDietViewMode}
                setSavedReports={setSavedReports}
                setSelectedVisitaId={setSelectedVisitaId}
                setTargets={setTargets}
            />
        );
    }
    // =========================================================================
    // --- 2. SCHERMATA EDITOR PRINCIPALE ---
    // =========================================================================

    // --- INIZIO RENDER COMPONENTE ---
    return (
        <div
            style={{
                display: 'flex',
                height: '88vh' /* Blocca l'altezza alla finestra del browser */,
                width: '100%',
                overflow: 'hidden' /* Impedisce lo scroll dell'intera pagina */,
                backgroundColor: '#F5F5F7',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                color: '#1D1D1F',
                margin: '-16px' /* Compensa i margini di default del body se presenti */,
                textAlign: 'left',
            }}
        >
            {/* STILI CSS INIETTATI E ADATTATI AL TEMA NUTRIZIONE (VERDE #00C853) */}
            <style>{dietCss}</style>

            {/* --- SIDEBAR DI NAVIGAZIONE --- */}
            <DietSidebar
                activeMealInfo={activeMealInfo}
                addNewDay={addNewDay}
                dietDays={dietDays}
                dragOverId={dragOverId}
                duplicateDay={duplicateDay}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                removeDay={removeDay}
                setActiveMealInfo={setActiveMealInfo}
                setDragOverId={setDragOverId}
                setIsDbOpen={setIsDbOpen}
                setIsSetupOpen={setIsSetupOpen}
                targets={targets}
            />

            {/* --- AREA CENTRALE (DASHBOARD E STAMPA) --- */}
            <DietMainContent
                analysisTargetId={analysisTargetId}
                deleteReport={deleteReport}
                dietDays={dietDays}
                listaVisite={listaVisite}
                patient={patient}
                savedReports={savedReports}
                setActiveMealInfo={setActiveMealInfo}
                setAnalysisTargetId={setAnalysisTargetId}
                setCalcData={setCalcData}
                setDietDays={setDietDays}
                setDietViewMode={setDietViewMode}
                setIsChangeVisitOpen={setIsChangeVisitOpen}
                setIsSaveStatusOpen={setIsSaveStatusOpen}
                setIsSetupOpen={setIsSetupOpen}
                setSavedReports={setSavedReports}
                setSelectedVisitaId={setSelectedVisitaId}
                setTargets={setTargets}
                targets={targets}
                updateDayTitle={updateDayTitle}
                updateMealTitle={updateMealTitle}
                visitaAttiva={visitaAttiva}
            />

            {/* --- FINESTRA MODALE IN SOVRAPPRESSIONE PER COMPILARE IL PASTO --- */}
            {/* --- FINESTRA MODALE IN SOVRAPPRESSIONE PER COMPILARE IL PASTO --- */}
            {
                <MealEditorModal
                    activeMealInfo={activeMealInfo}
                    addFoodItem={addFoodItem}
                    addSubstitution={addSubstitution}
                    applyFoodSuggestion={applyFoodSuggestion}
                    applySubSuggestion={applySubSuggestion}
                    calcData={calcData}
                    dietDays={dietDays}
                    handleSaveClick={handleSaveClick}
                    removeFoodItem={removeFoodItem}
                    removeSubstitution={removeSubstitution}
                    setActiveMealInfo={setActiveMealInfo}
                    setIsLibraryOpen={setIsLibraryOpen}
                    suggestions={suggestions}
                    swapSubstitution={swapSubstitution}
                    targets={targets}
                    updateFoodValue={updateFoodValue}
                    updateMealTitle={updateMealTitle}
                    updateSubstitutionValue={updateSubstitutionValue}
                />
            }

            {/* MODALE SELEZIONE STATO E SALVATAGGIO FINALE */}
            {
                <SaveStatusModal
                    calcData={calcData}
                    currentPatient={currentPatient}
                    dietDays={dietDays}
                    isSaveStatusOpen={isSaveStatusOpen}
                    onUpdateDb={onUpdateDb}
                    savedReports={savedReports}
                    selectedVisitaId={selectedVisitaId}
                    setIsSaveStatusOpen={setIsSaveStatusOpen}
                    targets={targets}
                />
            }

            {/* --- MODALE CAMBIO VISITA ATTIVA (SOLO VISITE CLINICHE) --- */}
            {
                <ChangeVisitModal
                    isChangeVisitOpen={isChangeVisitOpen}
                    listaVisite={listaVisite}
                    selectedVisitaId={selectedVisitaId}
                    setIsChangeVisitOpen={setIsChangeVisitOpen}
                    setSelectedVisitaId={setSelectedVisitaId}
                />
            }

            {/* --- CONTENITORE UNICO PULSANTI FLUTTUANTI DOPPI --- */}
            <FloatingActions setIsAnalysisOpen={setIsAnalysisOpen} setIsPrintReportOpen={setIsPrintReportOpen} setIsSmartOpen={setIsSmartOpen} />

            {/* --- MODALE STORICO PASTI (CON FILTRI DINAMICI) --- */}
            {
                <MealLibraryModal
                    isLibraryOpen={isLibraryOpen}
                    libFilter={libFilter}
                    loadFromLibrary={loadFromLibrary}
                    mealLibrary={mealLibrary}
                    setIsLibraryOpen={setIsLibraryOpen}
                    setLibFilter={setLibFilter}
                    setMealLibrary={setMealLibrary}
                />
            }

            {/* --- SUB-MODALE: CALCOLATORE LAF 24 ORE (METODO FATTORIALE) --- */}
            {
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
            }

            {/* --- MODALE SETUP OBIETTIVI (TARGET NUTRIZIONALI) --- */}
            {/* --- MODALE SETUP OBIETTIVI CLINICO --- */}

            {/* --- MODALE SETUP OBIETTIVI CLINICO (PRO) --- */}
            {
                <NutritionSetupModal
                    addMatrixMeal={addMatrixMeal}
                    calcData={calcData}
                    dietDays={dietDays}
                    duplicateMatrixMeal={duplicateMatrixMeal}
                    genId={genId}
                    handleMatrixDrop={handleMatrixDrop}
                    isSetupOpen={isSetupOpen}
                    matrixDragOverId={matrixDragOverId}
                    removeDay={removeDay}
                    removeMatrixMeal={removeMatrixMeal}
                    setCalcData={setCalcData}
                    setDietDays={setDietDays}
                    setIsLafModalOpen={setIsLafModalOpen}
                    setIsSetupOpen={setIsSetupOpen}
                    setMatrixDragId={setMatrixDragId}
                    setMatrixDragOverId={setMatrixDragOverId}
                    setSetupTab={setSetupTab}
                    setTargets={setTargets}
                    setupTab={setupTab}
                    updateDayTitle={updateDayTitle}
                    updateMatrixMacro={updateMatrixMacro}
                    updateMatrixMeal={updateMatrixMeal}
                />
            }

            {/* --- MODALE DATABASE ALIMENTI --- */}
            {/* --- MODALE DATABASE ALIMENTI AVANZATO --- */}
            {
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
            }

            {
                <SaveMealToLibraryModal
                    confirmSaveToLibrary={confirmSaveToLibrary}
                    isSaveModalOpen={isSaveModalOpen}
                    mealToSave={mealToSave}
                    setIsSaveModalOpen={setIsSaveModalOpen}
                    setMealToSave={setMealToSave}
                />
            }
            {/* --- MODALE SMART CHART MAKER --- */}
            {
                <SmartChartModal
                    activeDay={activeDay}
                    isSmartOpen={isSmartOpen}
                    plotRef={plotRef}
                    saveSmartReport={saveSmartReport}
                    setIsSmartOpen={setIsSmartOpen}
                    setSmartConfig={setSmartConfig}
                    smartConfig={smartConfig}
                />
            }

            {/* --- MODALE 1: ANALISI CLINICA AVANZATA (UI/UX MINIMAL & SMART) --- */}
            {
                <ClinicalAnalysisModal
                    analysisTimeframe={analysisTimeframe}
                    analyzeCompleteBioProfile={analyzeCompleteBioProfile}
                    dietDays={dietDays}
                    getPatientTargets={getPatientTargets}
                    isAnalysisOpen={isAnalysisOpen}
                    patientProfile={patientProfile}
                    setAnalysisTimeframe={setAnalysisTimeframe}
                    setIsAnalysisOpen={setIsAnalysisOpen}
                    setIsDrvEditorOpen={setIsDrvEditorOpen}
                    setShowGlossary={setShowGlossary}
                    showGlossary={showGlossary}
                />
            }

            {/* --- MODALE 2: EDITOR DRV (EFSA) UI/UX PREMIUM --- */}
            {/* --- MODALE 2: EDITOR DRV (EFSA) UI/UX PREMIUM --- */}
            {
                <DrvEditorModal
                    drvDB={drvDB}
                    drvFileInputRef={drvFileInputRef}
                    drvSearch={drvSearch}
                    isDrvEditorOpen={isDrvEditorOpen}
                    setDrvDB={setDrvDB}
                    setDrvSearch={setDrvSearch}
                    setIsDrvEditorOpen={setIsDrvEditorOpen}
                />
            }

            {/* --- MODALE DI STAMPA UFFICIALE A4 --- */}
            {isPrintReportOpen && (
                <DietPrintReport
                    patient={patientProfile} // Usiamo il patientProfile che hai già definito
                    dietDays={dietDays}
                    targets={targets}
                    savedReports={savedReports}
                    onClose={() => setIsPrintReportOpen(false)}
                />
            )}
        </div>
    );
};
