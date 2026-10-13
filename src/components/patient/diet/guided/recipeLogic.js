// Ricette — logica pura. Una ricetta è un "alimento composto": ingredienti con i grammi dell'INTERA preparazione,
// numero di porzioni ed eventuale peso finale dopo la cottura. Si inserisce in un pasto come UN alimento
// (es. "Ciambellone", 80 g) con kcal e macro per 100 g calcolati dagli ingredienti.
// Vive nella libreria pasti già esistente (`diet_meal_library`, kind: 'ricetta'), quindi è visibile anche nella vista avanzata.
import { genId } from './guidedLogic';

const n = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};

export const sumIngredients = (ings) =>
    ings.reduce(
        (t, i) => {
            const w = n(i.weight) / 100;
            return { kcal: t.kcal + n(i.kcal) * w, p: t.p + n(i.p) * w, c: t.c + n(i.c) * w, f: t.f + n(i.f) * w, grams: t.grams + n(i.weight) };
        },
        { kcal: 0, p: 0, c: 0, f: 0, grams: 0 }
    );

// Statistiche della ricetta: totali, per 100 g e per porzione.
// Il peso finale (dopo cottura) cambia i valori per 100 g ma non le kcal totali.
export const recipeStats = ({ ingredients, servings, finalWeight }) => {
    const total = sumIngredients(ingredients);
    const weight = n(finalWeight) > 0 ? n(finalWeight) : total.grams;
    const sv = Math.max(1, n(servings) || 1);
    const per100 = weight > 0 ? { kcal: (total.kcal / weight) * 100, p: (total.p / weight) * 100, c: (total.c / weight) * 100, f: (total.f / weight) * 100 } : { kcal: 0, p: 0, c: 0, f: 0 };
    const perServing = { grams: weight / sv, kcal: total.kcal / sv, p: total.p / sv, c: total.c / sv, f: total.f / sv };
    return { total, weight, servings: sv, per100, perServing };
};

const round1 = (x) => Math.round(x * 10) / 10;

export const makeRecipe = ({ id, title, servings, finalWeight, ingredients, steps, note }) => {
    const clean = ingredients
        .filter((i) => i.name && n(i.weight) > 0)
        .map((i) => ({ id: i.id || genId(), name: i.name, weight: n(i.weight), kcal: n(i.kcal), p: n(i.p), c: n(i.c), f: n(i.f), ...(i.aiEstimated && { aiEstimated: true }) }));
    const st = recipeStats({ ingredients: clean, servings, finalWeight });
    return {
        id: id || 'rec-' + Date.now(),
        kind: 'ricetta',
        title: String(title || '').trim() || 'Ricetta senza nome',
        servings: st.servings,
        finalWeight: n(finalWeight) > 0 ? n(finalWeight) : null,
        items: clean, // ingredienti, per l'intera ricetta (compatibile con la libreria pasti)
        totals: { kcal: round1(st.total.kcal), p: round1(st.total.p), c: round1(st.total.c), f: round1(st.total.f) },
        per100: { kcal: round1(st.per100.kcal), p: round1(st.per100.p), c: round1(st.per100.c), f: round1(st.per100.f) },
        portionGrams: Math.round(st.perServing.grams),
        steps: (steps || []).map((s) => String(s).trim()).filter(Boolean),
        note: note || '',
        savedAt: new Date().toLocaleDateString('it-IT'),
    };
};

// La ricetta inserita in un pasto: un solo alimento con valori per 100 g (come tutti gli altri).
export const recipeToItem = (recipe, portions = 1) => ({
    // ingredienti dell'INTERA ricetta: l'analisi dei micronutrienti li usa per sapere cosa c'è davvero nel piatto
    recipeParts: (recipe.items || []).map((i) => ({ name: i.name, grams: i.weight })),
    recipeBase: (recipe.finalWeight || (recipe.items || []).reduce((s, i) => s + (Number(i.weight) || 0), 0)) || 1,
    id: genId(),
    name: recipe.title,
    weight: Math.max(5, Math.round((recipe.portionGrams || 100) * portions)),
    kcal: recipe.per100.kcal,
    p: recipe.per100.p,
    c: recipe.per100.c,
    f: recipe.per100.f,
    recipeId: recipe.id,
    portions,
});

// Alimenti di un pasto salvato (non ricetta): si inseriscono così come sono, con id nuovi.
export const mealItemsCopy = (meal) => (meal.items || []).map((i) => ({ ...JSON.parse(JSON.stringify(i)), id: genId() }));

export const isRecipe = (m) => m && m.kind === 'ricetta';
