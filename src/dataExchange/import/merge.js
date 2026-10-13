// Unione di dati in arrivo (da un altro archivio o da un CSV) nell'archivio corrente. Funzione PURA: restituisce il nuovo db + un rapporto.
// Così l'anteprima ("cosa succederebbe?") e l'importazione vera usano lo stesso codice.
import { clone } from '../util';

export const defaultMergeOptions = () => ({
    conflict: 'merge', // merge = tieni il paziente esistente e aggiungi le visite mancanti | skip | replace | duplicate
    patients: true,
    libraries: { foods: true, exercises: true, formulas: true, drv: true, meals: true, ranges: false },
    studio: false,
    createStubs: true, // false: i pazienti "vuoti" (solo ID, da CSV visite) non vengono creati se non esistono già
});

const norm = (s) =>
    String(s || '')
        .trim()
        .toLowerCase();
const randomId = (used) => {
    let id;
    do id = String(Math.floor(100000 + Math.random() * 900000));
    while (used.has(id));
    used.add(id);
    return id;
};

const sameVisit = (a, b) => String(a.id) === String(b.id);

const findMatch = (list, p) => {
    const byId = list.find((x) => String(x.id) === String(p.id));
    if (byId) return byId;
    if (p.cf && String(p.cf).length >= 8) {
        const byCf = list.find((x) => norm(x.cf) === norm(p.cf));
        if (byCf) return byCf;
    }
    if (p.nome && p.cognome && p.dataNascita) {
        return list.find((x) => norm(x.nome) === norm(p.nome) && norm(x.cognome) === norm(p.cognome) && String(x.dataNascita) === String(p.dataNascita));
    }
    return null;
};

const mergeList = (cur, inc, keyFn) => {
    const out = [...(cur || [])];
    const have = new Set(out.map(keyFn));
    let added = 0;
    (inc || []).forEach((x) => {
        const k = keyFn(x);
        if (k && !have.has(k)) {
            have.add(k);
            out.push(x);
            added++;
        }
    });
    return { list: out, added };
};

export const mergeIncoming = (current, incoming, options = {}) => {
    const o = { ...defaultMergeOptions(), ...options, libraries: { ...defaultMergeOptions().libraries, ...(options.libraries || {}) } };
    const db = clone(current);
    const inc = clone(incoming);
    const r = {
        patientsAdded: 0,
        patientsMerged: 0,
        patientsReplaced: 0,
        patientsSkipped: 0,
        patientsDuplicated: 0,
        visitsAdded: 0,
        visitsSkipped: 0,
        orphans: 0,
        foodsAdded: 0,
        exercisesAdded: 0,
        formulasAdded: 0,
        drvAdded: 0,
        mealsAdded: 0,
        rangesAdded: 0,
        possibleDuplicates: [],
    };
    db.pazienti = db.pazienti || [];
    const usedIds = new Set(db.pazienti.map((p) => String(p.id)));

    if (o.patients) {
        (inc.pazienti || []).forEach((p) => {
            const match = findMatch(db.pazienti, p);
            if (!match) {
                if (p._stub && !o.createStubs) {
                    r.orphans += (p.visite || []).length;
                    return;
                }
                const np = { ...p };
                delete np._stub;
                np.visite = np.visite || [];
                if (usedIds.has(String(np.id)) || np.id === undefined || np.id === '') np.id = randomId(usedIds);
                usedIds.add(String(np.id));
                db.pazienti.push(np);
                r.patientsAdded++;
                r.visitsAdded += np.visite.length;
                return;
            }
            const byId = String(match.id) === String(p.id);
            if (!byId) r.possibleDuplicates.push(`${p.nome || ''} ${p.cognome || ''}`.trim() || p.id);
            if (o.conflict === 'skip') return void r.patientsSkipped++;
            if (o.conflict === 'replace') {
                const idx = db.pazienti.indexOf(match);
                const np = { ...p, id: match.id };
                delete np._stub;
                if (p._stub) np.visite = [...(match.visite || [])];
                db.pazienti[idx] = np;
                r.patientsReplaced++;
                r.visitsAdded += (p.visite || []).length;
                return;
            }
            if (o.conflict === 'duplicate') {
                const np = { ...p };
                delete np._stub;
                np.id = randomId(usedIds);
                np.visite = np.visite || [];
                db.pazienti.push(np);
                r.patientsDuplicated++;
                r.visitsAdded += np.visite.length;
                return;
            }
            // merge: tieni l'esistente, riempi i campi vuoti, aggiungi le visite mancanti
            const filled = { ...match };
            Object.keys(p).forEach((k) => {
                if (k === 'visite' || k === 'id' || k === '_stub') return;
                if (filled[k] === undefined || filled[k] === '') filled[k] = p[k];
            });
            const visits = [...(match.visite || [])];
            (p.visite || []).forEach((v) => {
                if (visits.some((x) => sameVisit(x, v))) r.visitsSkipped++;
                else {
                    visits.push(v);
                    r.visitsAdded++;
                }
            });
            visits.sort((a, b) => String(b.data).localeCompare(String(a.data)));
            filled.visite = visits;
            db.pazienti[db.pazienti.indexOf(match)] = filled;
            r.patientsMerged++;
        });
    }

    const L = o.libraries;
    if (L.foods && inc.diet_food_db) {
        const m = mergeList(db.diet_food_db, inc.diet_food_db, (x) => norm(x.name));
        db.diet_food_db = m.list;
        r.foodsAdded = m.added;
    }
    if (L.exercises && inc.training_exercise_db) {
        const m = mergeList(db.training_exercise_db, inc.training_exercise_db, (x) => norm(x.name));
        db.training_exercise_db = m.list;
        r.exercisesAdded = m.added;
    }
    if (L.formulas && inc.formule) {
        const m = mergeList(db.formule, inc.formule, (x) => norm(x.titolo));
        db.formule = m.list;
        r.formulasAdded = m.added;
    }
    if (L.drv && inc.diet_drv_db) {
        const m = mergeList(db.diet_drv_db, inc.diet_drv_db, (x) => JSON.stringify(x));
        db.diet_drv_db = m.list;
        r.drvAdded = m.added;
    }
    if (L.meals && inc.diet_meal_library) {
        const m = mergeList(db.diet_meal_library, inc.diet_meal_library, (x) => String(x.id));
        db.diet_meal_library = m.list;
        r.mealsAdded = m.added;
    }
    if (L.ranges && inc.rangeEmato) {
        const cur = db.rangeEmato || {};
        Object.keys(inc.rangeEmato).forEach((k) => {
            if (!cur[k]) {
                cur[k] = inc.rangeEmato[k];
                r.rangesAdded++;
            }
        });
        db.rangeEmato = cur;
    }
    if (o.studio && inc.utente && Object.keys(inc.utente).length) db.utente = { ...db.utente, ...inc.utente };
    return { db, report: r };
};
