import { useState, useEffect, useMemo, useRef } from 'react';
import { defaultDB } from './data/defaultExerciseDB';
import { ExerciseDatabaseModal } from './modals/ExerciseDatabaseModal';
import { ExercisePhotosModal } from './modals/ExercisePhotosModal';
import { trainingCss } from './trainingStyles';
import { useTrainingEditing } from './hooks/useTrainingEditing';
import { useExerciseDatabase } from './hooks/useExerciseDatabase';
import { useTrainingPersistence } from './hooks/useTrainingPersistence';
import { usePrintCenter } from '../../reports/printCenter/PrintCenterProvider';
import { ToolsModal } from './tools/ToolsModal';
import { AnalysisModal } from './analysis/AnalysisModal';
import { ProgressionModal } from './analysis/ProgressionModal';
import { TrainingGuided } from './guided/TrainingGuided';
import { getProfile } from './logic/trainingModel';
import { goalById } from './logic/science/guidelines';

// Modulo Training. La schermata è una sola (guidata, in 3 passi: Obiettivo → Scheda → Consegna), vedi guided/.
// Qui vivono lo stato della scheda aperta e le finestre di servizio (database esercizi, foto, calcolatori, analisi, progressione, stampa).
// (la vecchia "vista avanzata" è stata tolta: una copia è in .claude/backup/TrainingPlan.avanzata.jsx)
export const TrainingPlan = ({ patient, db, onUpdateDb }) => {
    // La scheda aperta (settimane + intestazione) viene salvata nell'archivio, per paziente (vedi hooks/useTrainingPersistence.js)
    const { schedaId, weeks, setWeeks, header, setHeader, loadScheda, openScheda, newScheda, duplicateScheda, deleteScheda, massimali, saveMassimale, deleteMassimale } =
        useTrainingPersistence({ patient, onUpdateDb });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const printCenter = usePrintCenter();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isProgressionOpen, setIsProgressionOpen] = useState(false);
    const [photosFor, setPhotosFor] = useState(null); // esercizio di cui gestire le foto

    // Il database esercizi vive nell'archivio dell'utente (db.training_exercise_db)
    const [exerciseDB, setExerciseDB] = useState(() => (db?.training_exercise_db?.length ? db.training_exercise_db : defaultDB));
    const [dbSearch, setDbSearch] = useState('');
    const [newEx, setNewEx] = useState({ name: '', group: '', type: '' });
    const [suggestions, setSuggestions] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (db?.training_exercise_db === exerciseDB) return;
        if (!db?.training_exercise_db && exerciseDB === defaultDB) return; // nessuna modifica: non toccare l'archivio
        onUpdateDb?.((prev) => ({ ...prev, training_exercise_db: exerciseDB }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseDB]);

    // Libro delle schede: le schede già fatte, valide per tutti i pazienti (db.training_book)
    const [book, setBook] = useState(() => db?.training_book || []);
    useEffect(() => {
        if (db?.training_book === book) return;
        if (!db?.training_book && book.length === 0) return;
        onUpdateDb?.((prev) => ({ ...prev, training_book: book }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [book]);

    const editing = useTrainingEditing({ exerciseDB, setSuggestions, setWeeks });
    const { addExerciseToDB, updateDbEx, deleteExDB, exportJSON, importJSON, resetDatabase, addCatalog, setExercisePhotos } = useExerciseDatabase({ exerciseDB, newEx, setExerciseDB, setNewEx });

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

    // operazioni passate all'editor delle sedute
    const ops = { ...editing, updateSetFieldValue, saveMassimale, openPhotos: (ex) => setPhotosFor(ex) };

    return (
        <div className="t-root dg-page">
            <style>{trainingCss}</style>

            <TrainingGuided
                patient={patient}
                db={db}
                schedaId={schedaId}
                header={header}
                setHeader={setHeader}
                weeks={weeks}
                setWeeks={setWeeks}
                openScheda={openScheda}
                newScheda={newScheda}
                duplicateScheda={duplicateScheda}
                deleteScheda={deleteScheda}
                loadScheda={loadScheda}
                ops={ops}
                exerciseDB={exerciseDB}
                suggestions={suggestions}
                massimali={massimali}
                analysisCtx={analysisCtx}
                profile={profile}
                book={book}
                setBook={setBook}
                onExercises={() => setIsSettingsOpen(true)}
                onTools={() => setIsToolsOpen(true)}
                onProgression={() => setIsProgressionOpen(true)}
                onAnalysis={() => setIsAnalysisOpen(true)}
                onPrint={printCenter ? () => printCenter.open(['training']) : undefined}
            />
            {isToolsOpen && <ToolsModal profile={profile} massimali={massimali} exerciseDB={exerciseDB} saveMassimale={saveMassimale} deleteMassimale={deleteMassimale} onClose={() => setIsToolsOpen(false)} />}
            {isAnalysisOpen && <AnalysisModal weeks={weeks} header={header} massimali={massimali} profile={profile} onClose={() => setIsAnalysisOpen(false)} />}
            {isProgressionOpen && <ProgressionModal weeks={weeks} header={header} massimali={massimali} profile={profile} onApply={(w) => setWeeks(w)} onClose={() => setIsProgressionOpen(false)} />}
            {photosFor && <ExercisePhotosModal exercise={photosFor} exerciseDB={exerciseDB} onSave={setExercisePhotos} onClose={() => setPhotosFor(null)} />}

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
        </div>
    );
};
