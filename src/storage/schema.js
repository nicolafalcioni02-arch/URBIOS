// Schema unico del database URBIOS + normalizzazione/migrazione.
// Ogni volta che il formato cambia: incrementare SCHEMA_VERSION e gestire il passaggio in `normalizeDb`.
import { DEFAULT_FORMULAS, DEFAULT_RANGE_EMATO, EMPTY_DB } from '../logic/db_defaults';

export const SCHEMA_VERSION = 1;

export const createEmptyDb = () => normalizeDb(JSON.parse(JSON.stringify(EMPTY_DB)));

// Rende "sano" un database qualsiasi (nuovo, vecchio, importato).
// Le chiavi sconosciute vengono CONSERVATE (es. diet_food_db, diet_drv_db, training_exercise_db...).
export const normalizeDb = (raw) => {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        ...src,
        schemaVersion: SCHEMA_VERSION,
        utente: src.utente || { nome: 'Dottore', cognome: '' },
        pazienti: Array.isArray(src.pazienti) ? src.pazienti : [],
        formule: Array.isArray(src.formule) && src.formule.length > 0 ? src.formule : DEFAULT_FORMULAS,
        rangeEmato: src.rangeEmato || DEFAULT_RANGE_EMATO,
    };
};
