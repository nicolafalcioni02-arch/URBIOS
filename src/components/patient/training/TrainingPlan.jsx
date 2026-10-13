import { useState, useEffect, useMemo, useRef } from 'react';
import { defaultDB } from './data/defaultExerciseDB';
import { ExerciseDatabaseModal } from './modals/ExerciseDatabaseModal';
import { ExercisePhotosModal } from './modals/ExercisePhotosModal';
import { SchedeModal } from './modals/SchedeModal';
import { trainingCss } from './trainingStyles';
import { TrainingMainContent } from './views/TrainingMainContent';
import { TrainingSidebar } from './views/TrainingSidebar';
import { useTrainingEditing } from './hooks/useTrainingEditing';
import { useExerciseDatabase } from './hooks/useExerciseDatabase';
import { useTrainingDragDrop } from './hooks/useTrainingDragDrop';
import { useTrainingPersistence } from './hooks/useTrainingPersistence';
import { TrainingPrintView } from './print/TrainingPrintView';
import { ToolsModal } from './tools/ToolsModal';
import { AnalysisModal } from './analysis/AnalysisModal';
import { ProgressionModal } from './analysis/ProgressionModal';
import { getProfile } from './logic/trainingModel';
import { goalById } from './logic/science/guidelines';

export const TrainingPlan = ({ patient, db, onUpdateDb }) => {
    // --- STATI PRINCIPALI ---
    // La scheda aperta (settimane + intestazione) viene salvata nell'archivio, per paziente (vedi hooks/useTrainingPersistence.js)
    const { schedaId, weeks, setWeeks, header, setHeader, openScheda, newScheda, duplicateScheda, deleteScheda, massimali, saveMassimale, deleteMassimale } =
        useTrainingPersistence({
            patient,
            onUpdateDb,
        });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [isSchedeOpen, setIsSchedeOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isProgressionOpen, setIsProgressionOpen] = useState(false);
    const [photosFor, setPhotosFor] = useState(null); // esercizio di cui gestire le foto

    // Il database esercizi vive nell'archivio dell'utente (db.training_exercise_db), non più nel browser
    const [exerciseDB, setExerciseDB] = useState(() => (db?.training_exercise_db?.length ? db.training_exercise_db : defaultDB));

    const [dbSearch, setDbSearch] = useState('');
    const [newEx, setNewEx] = useState({ name: '', group: '', type: '' });

    // Autocompletamento
    const [suggestions, setSuggestions] = useState({});

    // Ref per Import JSON
    const fileInputRef = useRef(null);

    // Salvataggio DB
    useEffect(() => {
        if (db?.training_exercise_db === exerciseDB) return;
        if (!db?.training_exercise_db && exerciseDB === defaultDB) return; // nessuna modifica: non toccare l'archivio
        onUpdateDb?.((prev) => ({ ...prev, training_exercise_db: exerciseDB }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseDB]);

    const editing = useTrainingEditing({ exerciseDB, setSuggestions, setWeeks });
    const { addNewWeek, duplicateWeek, removeWeek, duplicateDay, removeDay } = editing;

    const { addExerciseToDB, updateDbEx, deleteExDB, exportJSON, importJSON, resetDatabase, addCatalog, setExercisePhotos } = useExerciseDatabase({
        exerciseDB,
        newEx,
        setExerciseDB,
        setNewEx,
    });

    const { dragOverId, setDragOverId, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useTrainingDragDrop({ setWeeks });

    // --- STATO FINESTRA CENTRALE ---
    const [activeDayInfo, setActiveDayInfo] = useState(null); // { weekId, dayId }

    const updateSetFieldValue = (weekId, dayId, exId, setId, field, value) => {
        setWeeks((prev) =>
            prev.map((w) =>
                w.id === weekId
                    ? {
                          ...w,
                          days: w.days.map((d) =>
                              d.id === dayId
                                  ? {
                                        ...d,
                                        exercises: d.exercises.map((e) =>
                                            e.id === exId
                                                ? {
                                                      ...e,
                                                      sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
                                                  }
                                                : e
                                        ),
                                    }
                                  : d
                          ),
                      }
                    : w
            )
        );
    };

    // dati del cliente per i calcoli (peso, altezza, età, sesso) e contesto di analisi
    const profile = useMemo(() => getProfile(patient), [patient]);
    const analysisCtx = useMemo(
        () => ({ massimali, profile, goal: goalById(header.tipo), extraMin: Number.isFinite(parseFloat(header.extraMin)) ? parseFloat(header.extraMin) : 10 }),
        [massimali, profile, header.tipo, header.extraMin]
    );

    // operazioni passate all'editor del giorno
    const ops = {
        ...editing,
        updateSetFieldValue,
        saveMassimale,
        openPhotos: (ex) => setPhotosFor(ex),
    };

    return (
        <div
            style={{
                display: 'flex',
                height: '100%',
                minHeight: '80vh',
                backgroundColor: '#F5F5F7',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                color: '#1D1D1F',
                margin: '-16px',
                textAlign: 'left', // margin compensa padding genitore
            }}
        >
            {/* CSS INIETTATO E MIGLIORATO (Premium Motion & Sticky Sidebar) */}
            <style>{trainingCss}</style>

            <TrainingSidebar
                activeDayInfo={activeDayInfo}
                addNewWeek={addNewWeek}
                dragOverId={dragOverId}
                duplicateDay={duplicateDay}
                duplicateWeek={duplicateWeek}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                removeDay={removeDay}
                removeWeek={removeWeek}
                setActiveDayInfo={setActiveDayInfo}
                setDragOverId={setDragOverId}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsSchedeOpen={setIsSchedeOpen}
                weeks={weeks}
            />

            {/* MAIN CONTENT / FINESTRA CENTRALE */}
            <TrainingMainContent
                activeDayInfo={activeDayInfo}
                weeks={weeks}
                header={header}
                setHeader={setHeader}
                exerciseDB={exerciseDB}
                suggestions={suggestions}
                massimali={massimali}
                analysisCtx={analysisCtx}
                ops={ops}
                setActiveDayInfo={setActiveDayInfo}
                onOpenAnalysis={() => setIsAnalysisOpen(true)}
                onOpenTools={() => setIsToolsOpen(true)}
                onOpenProgression={() => setIsProgressionOpen(true)}
                onPrint={() => setIsPrintOpen(true)}
            />

            <button className="t-fab-print" title="Stampa la scheda" onClick={() => setIsPrintOpen(true)}>
                <i className="ph ph-printer" style={{ fontSize: '28px' }}></i>
            </button>

            {isPrintOpen && (
                <TrainingPrintView
                    header={header}
                    weeks={weeks}
                    exerciseDB={exerciseDB}
                    massimali={massimali}
                    profile={profile}
                    professional={db && db.utente}
                    onClose={() => setIsPrintOpen(false)}
                />
            )}

            {isSchedeOpen && (
                <SchedeModal
                    patient={patient}
                    schedaId={schedaId}
                    header={header}
                    weeks={weeks}
                    onOpen={openScheda}
                    onNew={newScheda}
                    onDuplicate={duplicateScheda}
                    onDelete={deleteScheda}
                    onClose={() => setIsSchedeOpen(false)}
                />
            )}

            {isToolsOpen && (
                <ToolsModal
                    profile={profile}
                    massimali={massimali}
                    exerciseDB={exerciseDB}
                    saveMassimale={saveMassimale}
                    deleteMassimale={deleteMassimale}
                    onClose={() => setIsToolsOpen(false)}
                />
            )}
            {isAnalysisOpen && <AnalysisModal weeks={weeks} header={header} massimali={massimali} profile={profile} onClose={() => setIsAnalysisOpen(false)} />}
            {isProgressionOpen && (
                <ProgressionModal
                    weeks={weeks}
                    header={header}
                    massimali={massimali}
                    profile={profile}
                    onApply={(w) => {
                        setWeeks(w);
                        setActiveDayInfo(null);
                    }}
                    onClose={() => setIsProgressionOpen(false)}
                />
            )}
            {photosFor && <ExercisePhotosModal exercise={photosFor} exerciseDB={exerciseDB} onSave={setExercisePhotos} onClose={() => setPhotosFor(null)} />}

            {
                <ExerciseDatabaseModal
                    addCatalog={addCatalog}
                    addExerciseToDB={addExerciseToDB}
                    dbSearch={dbSearch}
                    deleteExDB={deleteExDB}
                    exerciseDB={exerciseDB}
                    exportJSON={exportJSON}
                    fileInputRef={fileInputRef}
                    importJSON={importJSON}
                    isSettingsOpen={isSettingsOpen}
                    newEx={newEx}
                    openPhotos={(ex) => setPhotosFor({ name: ex.name, group: ex.group })}
                    resetDatabase={resetDatabase}
                    setDbSearch={setDbSearch}
                    setIsSettingsOpen={setIsSettingsOpen}
                    setNewEx={setNewEx}
                    updateDbEx={updateDbEx}
                />
            }
        </div>
    );
};
