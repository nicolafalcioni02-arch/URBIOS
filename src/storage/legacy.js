// Dati lasciati in chiaro nel browser dalle versioni precedenti (localStorage).
// Vengono proposti per il recupero e poi cancellati. Dopo il recupero vivono solo nell'archivio.
const KEYS = ['URBIOS_db', 'trainer_db', 'diet_saved_reports', 'diet_drv_db'];

export const hasLegacyData = () => {
    try {
        return !!localStorage.getItem('URBIOS_db');
    } catch {
        return false;
    }
};

export const readLegacyDb = () => {
    try {
        const db = JSON.parse(localStorage.getItem('URBIOS_db'));
        const trainer = localStorage.getItem('trainer_db');
        if (db && trainer && !db.training_exercise_db) db.training_exercise_db = JSON.parse(trainer);
        return db;
    } catch {
        return null;
    }
};

export const wipeLegacy = () => {
    try {
        KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
        /* niente */
    }
};
