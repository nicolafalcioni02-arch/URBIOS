// --- DATABASE ALIMENTI DI DEFAULT ---
// 900 alimenti (valori per 100 g, formato esteso: macro, fibre, minerali, vitamine, amminoacidi, acidi grassi).
// Fonte: dbALIMENTI.json (tabelle CREA). Il database vive nell'archivio dell'utente solo se lo modifica:
// finché è quello di serie non viene scritto nel file (vedi useDietPlanData).
import foods from './foodDB.json';

export const defaultFoodDB = foods;
