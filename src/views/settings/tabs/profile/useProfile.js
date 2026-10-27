// Dati del professionista (db.utente): ogni campo si salva da solo quando si esce dal campo.
export const useProfile = (db, onUpdateDb) => {
    const user = db.utente || {};
    const update = (name, value) => onUpdateDb((prev) => ({ ...prev, utente: { ...(prev.utente || {}), [name]: value } }));
    return [user, update];
};

export const AUTOSAVE_NOTE = 'Le modifiche si salvano da sole quando esci da un campo.';
