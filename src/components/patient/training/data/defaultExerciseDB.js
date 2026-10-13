// --- DATABASE ESERCIZI DI DEFAULT ---
// Derivato dal catalogo (data/exerciseCatalog.js), che contiene anche i riferimenti alle figure.
import { EXERCISE_CATALOG } from './exerciseCatalog';

export const defaultDB = EXERCISE_CATALOG.map(({ name, group, type }) => ({ name, group, type }));
