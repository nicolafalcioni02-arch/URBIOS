// Il paziente di esempio (Pino Citosi) e le ricette di esempio: compaiono in ogni archivio per provare l'app e le stampe,
// ma non finiscono MAI nel file. Il database salvato contiene solo i dati veri; all'app si passa una "vista" con l'esempio
// aggiunto, e ogni modifica si separa di nuovo: quella all'esempio resta in memoria fino alla chiusura.
// I dati si generano con: node archivio_demo/genera.mjs
// Nota di biologia: come in ogni buona pinocitosi, l'esempio entra in una vescicola (la vista) e non attraversa mai la membrana del file.
import data from './esempio.json';

export const EXAMPLE_ID = data.paziente.id;
export const isExample = (p) => !!p && (p.esempio === true || p.id === EXAMPLE_ID);
const isExampleRecipe = (r) => !!r && r.esempio === true;
const isExampleMenu = (m) => !!m && m.esempio === true;

// stato iniziale dell'esempio (copia nuova a ogni apertura dell'archivio)
export const freshExample = () => JSON.parse(JSON.stringify({ patient: data.paziente, recipes: data.ricette, menus: data.menus || [] }));

// database vero + esempio → quello che vede l'app
export const withExample = (db, ex) => {
    if (!db || !ex) return db;
    const pazienti = (db.pazienti || []).filter((p) => !isExample(p));
    const library = (db.diet_meal_library || []).filter((r) => !isExampleRecipe(r));
    const menus = (db.chef_menus || []).filter((m) => !isExampleMenu(m));
    return { ...db, pazienti: ex.patient ? [...pazienti, ex.patient] : pazienti, diet_meal_library: [...library, ...ex.recipes], chef_menus: [...menus, ...(ex.menus || [])] };
};

// quello che l'app ha modificato → database vero (da salvare) + esempio (solo in memoria)
// (prev = database vero di prima: serve a non cambiare la forma del file, così l'esempio non crea "modifiche non salvate")
export const splitExample = (view, prev = null) => {
    if (!view) return { db: view, ex: null };
    const pazienti = view.pazienti || [];
    const library = view.diet_meal_library || [];
    const db = { ...view, pazienti: pazienti.filter((p) => !isExample(p)) };
    const real = library.filter((r) => !isExampleRecipe(r));
    const menus = view.chef_menus || [];
    const realMenus = menus.filter((m) => !isExampleMenu(m));
    if (realMenus.length || (prev && 'chef_menus' in prev)) db.chef_menus = realMenus;
    else delete db.chef_menus;
    if (real.length || (prev && 'diet_meal_library' in prev)) db.diet_meal_library = real;
    else delete db.diet_meal_library; // archivio senza ricette sue: resta com'era
    return { db, ex: { patient: pazienti.find(isExample) || null, recipes: library.filter(isExampleRecipe), menus: menus.filter(isExampleMenu) } };
};

// toglie l'esempio da un archivio aperto da file (es. l'archivio demo, che lo contiene già)
export const stripExample = (db) => splitExample(db, db).db;

// il professionista dei documenti: per il paziente di esempio è uno inventato (con tutti i campi compilati),
// così le stampe di prova sono complete senza toccare il profilo vero; per tutti gli altri è il profilo dell'utente
export const professionalFor = (patient, db) => (isExample(patient) && patient.professionista ? patient.professionista : db?.utente || {});
