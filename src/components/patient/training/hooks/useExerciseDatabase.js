import { defaultDB } from '../data/defaultExerciseDB';
import { mergeCatalogIntoDb, normName } from '../logic/exerciseMedia';

// Database esercizi: aggiunta, modifica, import/export JSON
export const useExerciseDatabase = ({ exerciseDB, newEx, setExerciseDB, setNewEx }) => {
    // --- DB MANAGER ---
    const addExerciseToDB = () => {
        if (newEx.name && newEx.group) {
            setExerciseDB([{ name: newEx.name, group: newEx.group, type: newEx.type || 'Generico' }, ...exerciseDB]);
            setNewEx({ name: '', group: '', type: '' });
        } else {
            alert('Inserisci almeno Nome e Gruppo');
        }
    };

    // aggiunge gli esercizi del catalogo (con figure) che mancano nel database dell'utente
    const addCatalog = () => {
        const { list, added } = mergeCatalogIntoDb(exerciseDB);
        if (added === 0) return alert('Il catalogo è già tutto presente nel tuo database.');
        setExerciseDB(list);
        alert(`Aggiunti ${added} esercizi del catalogo.`);
    };

    // foto del professionista per un esercizio (crea la voce nel database se non esiste)
    const setExercisePhotos = (ex, photos, useCatalog) => {
        const k = normName(ex.name);
        if (!k) return;
        const idx = exerciseDB.findIndex((x) => normName(x.name) === k);
        if (idx >= 0) {
            const list = [...exerciseDB];
            const { img, ...rest } = list[idx]; // la vecchia foto singola (img) confluisce in photos
            list[idx] = { ...rest, photos, useCatalog: !!useCatalog };
            if (!photos.length) delete list[idx].photos;
            setExerciseDB(list);
        } else {
            setExerciseDB([...exerciseDB, { name: ex.name.trim(), group: ex.group || 'Altro', type: 'Personalizzato', photos, useCatalog: !!useCatalog }]);
        }
    };

    const updateDbEx = (index, field, value) => {
        const newDb = [...exerciseDB];
        newDb[index][field] = value;
        setExerciseDB(newDb);
    };

    const deleteExDB = (index) => {
        if (window.confirm('Eliminare?')) {
            const newDb = [...exerciseDB];
            newDb.splice(index, 1);
            setExerciseDB(newDb);
        }
    };

    const exportJSON = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exerciseDB, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = 'trainer_db_backup.json';
        a.click();
    };

    const importJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                setExerciseDB(JSON.parse(ev.target.result));
                alert('Importato!');
            } catch (err) {
                alert('File errato');
            }
        };
        reader.readAsText(file);
    };

    const resetDatabase = () => {
        if (window.confirm('Reset Default?')) setExerciseDB([...defaultDB]);
    };

    return { addExerciseToDB, updateDbEx, deleteExDB, exportJSON, importJSON, resetDatabase, addCatalog, setExercisePhotos };
};
