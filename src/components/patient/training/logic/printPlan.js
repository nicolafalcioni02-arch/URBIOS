// Prepara la scheda per la stampa: solo ciò che serve, con serie riassunte, figure già collegate e (opzionale) il riepilogo di ogni seduta.
import { summarizeSets } from './trainingModel';
import { getExerciseImages } from './exerciseMedia';
import { analyzeDay } from './analysis';

const hasContent = (e) => e.name || e.sets.some((s) => s.reps || s.rec || s.note || s.load);

export const buildPrintPlan = (weeks, exerciseDB, { weekId = 'all', ctx = null } = {}) =>
    weeks
        .map((w, wi) => ({ w, wi }))
        .filter(({ w }) => weekId === 'all' || w.id === weekId)
        .map(({ w, wi }) => ({
            id: w.id,
            title: w.title || `Settimana ${wi + 1}`,
            kind: w.kind || '',
            note: w.note || '',
            days: w.days
                .map((d, di) => {
                    const exs = d.exercises.filter(hasContent);
                    // sigla delle superserie (A1, A2, B1...)
                    let n = 0;
                    const rows = exs.map((e, i) => {
                        const prev = exs[i - 1];
                        n = e.ss && prev && prev.ss === e.ss ? n + 1 : 1;
                        return {
                            id: e.id,
                            name: e.name || '(senza nome)',
                            group: e.group || '',
                            ss: e.ss ? `${e.ss}${n}` : '',
                            note: e.note || '',
                            images: getExerciseImages(e.name, exerciseDB).slice(0, 4),
                            ...summarizeSets(e.sets),
                        };
                    });
                    const summary = ctx && rows.length ? analyzeDay(d, ctx) : null;
                    return { id: d.id, number: di + 1, title: d.title || '', note: d.note || '', rows, summary };
                })
                .filter((d) => d.rows.length),
        }))
        .filter((w) => w.days.length);

// colonne visibili in un giorno (le colonne senza alcun dato non si stampano) e loro larghezze in mm
export const columnsFor = (rows, { images, notes }, total = 186) => {
    const has = (k) => rows.some((r) => r[k]);
    const cols = [
        images && rows.some((r) => r.images.length) ? { k: 'img', label: 'Figura', w: 36 } : null,
        { k: 'name', label: 'Esercizio', w: 44 },
        { k: 'serie', label: 'Serie × Rip.', w: 26 },
        has('load') || has('pct') ? { k: 'load', label: 'Carico', w: 21 } : null,
        has('rpe') ? { k: 'rpe', label: 'RPE', w: 13 } : null,
        has('tempo') ? { k: 'tempo', label: 'Tempo', w: 17 } : null,
        { k: 'rec', label: 'Recupero', w: 16 },
        notes ? { k: 'note', label: 'Note', w: 0 } : null,
    ].filter(Boolean);
    const fixed = cols.reduce((a, c) => a + c.w, 0);
    const noteCol = cols.find((c) => c.k === 'note');
    let rest = total - fixed;
    if (noteCol) {
        // la colonna note deve avere almeno 24 mm: se manca spazio si stringono figure e nome
        let shrink = Math.max(0, 24 - rest);
        ['img', 'name'].forEach((k) => {
            const c = cols.find((x) => x.k === k);
            if (c && shrink > 0) {
                const cut = Math.min(shrink, c.w - (k === 'img' ? 26 : 34));
                c.w -= cut;
                shrink -= cut;
            }
        });
        rest = total - cols.reduce((a, c) => a + c.w, 0);
        noteCol.w = Math.max(rest, 24);
    } else {
        const name = cols.find((c) => c.k === 'name');
        name.w += rest; // senza note il nome prende lo spazio libero
    }
    return cols;
};
