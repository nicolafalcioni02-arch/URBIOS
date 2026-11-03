// Chef URBIOS — logica pura. Le ricette stanno in `db.diet_meal_library` (kind 'ricetta'), le stesse della Dieta; i menu in `db.chef_menus`.
import { makeRecipe } from '../components/patient/diet/guided/recipeLogic';

export const CATEGORIES = ['Antipasti', 'Primi', 'Secondi', 'Contorni', 'Dolci', 'Colazione', 'Snack', 'Bevande'];
export const COURSES = ['Antipasto', 'Primo', 'Secondo', 'Contorno', 'Dolce'];

export const recipesOf = (db) => (db?.diet_meal_library || []).filter((m) => m && m.kind === 'ricetta');

// Ricetta completa: calcoli della Dieta + i campi del ricettario (categoria, tempo, difficolta')
export const buildRecipe = (form) => ({
    ...makeRecipe({ id: form.id, title: form.title, servings: form.servings, finalWeight: form.finalWeight, ingredients: form.ingredients, steps: form.steps, note: form.note }),
    category: form.category || '',
    minutes: Number(form.minutes) || 0,
    difficulty: form.difficulty || 'Facile',
});

export const emptyForm = () => ({ title: '', category: 'Primi', minutes: '', difficulty: 'Facile', servings: 2, finalWeight: '', ingredients: [], steps: [''], note: '' });

export const formFrom = (r) => ({
    id: r.id,
    title: r.title,
    category: r.category || '',
    minutes: r.minutes || '',
    difficulty: r.difficulty || 'Facile',
    servings: r.servings || 1,
    finalWeight: r.finalWeight || '',
    ingredients: (r.items || []).map((i) => ({ ...i })),
    steps: r.steps?.length ? [...r.steps] : [''],
    note: r.note || '',
});

export const foodToIngredient = (f, id) => ({ id, name: f.name, weight: f.portion || 100, kcal: f.energy_kcal || 0, p: f.proteins || 0, c: f.available_carbohydrates || 0, f: f.lipids || 0 });

export const searchFoods = (foods, q) => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return foods.filter((f) => f.name.toLowerCase().includes(s)).slice(0, 30);
};

export const dishesOf = (menu) => COURSES.map((c) => ({ course: c, recipeId: menu.courses?.[c] || '' }));

// Menù: una carta in portate (sections), ognuna con uno o più piatti { rid: id ricetta, w: { idIngrediente: grammi a porzione } }.
// w è vuoto finché non si cambiano le quantità: allora vale la porzione della ricetta. I vecchi menù si convertono al volo.
const sid = () => 's' + Math.random().toString(36).slice(2, 8);
const asDish = (d) => (typeof d === 'string' ? { rid: d, w: {} } : { rid: d.rid || '', w: d.w || {} });
export const normalizeMenu = (m) => {
    if (Array.isArray(m.sections)) return { ...m, sections: m.sections.map((s) => ({ ...s, dishes: s.dishes.map(asDish) })) };
    const sections = COURSES.filter((c) => m.courses?.[c]).map((c) => ({ id: sid(), name: c, dishes: [asDish(m.courses[c])] }));
    const { courses, ...rest } = m;
    return { ...rest, subtitle: m.subtitle || '', sections: sections.length ? sections : [{ id: sid(), name: 'Primo', dishes: [] }] };
};
export const newMenu = () => ({ id: 'menu-' + Date.now(), title: 'Nuovo menù', subtitle: '', sections: ['Antipasto', 'Primo', 'Secondo', 'Dolce'].map((name) => ({ id: sid(), name, dishes: [] })) });
export const newSection = (name = 'Nuova portata') => ({ id: sid(), name, dishes: [] });
export const newDish = () => ({ rid: '', w: {} });

// grammi di un ingrediente in UNA porzione di quel piatto: quelli scelti per il menù, altrimenti quelli della ricetta
export const gramsOf = (recipe, dish, item) => {
    const sv = Math.max(1, Number(recipe?.servings) || 1);
    const v = dish?.w?.[item.id];
    return v !== undefined && v !== '' ? Number(v) || 0 : (Number(item.weight) || 0) / sv;
};
// kcal, macro e grammi di UNA porzione di un piatto del menù (con le quantità del menù)
export const dishNutrition = (recipe, dish) => {
    const out = { kcal: 0, p: 0, c: 0, f: 0, grams: 0, items: [], custom: false };
    (recipe?.items || []).forEach((i) => {
        const g = gramsOf(recipe, dish, i);
        out.kcal += ((i.kcal || 0) * g) / 100;
        out.p += ((i.p || 0) * g) / 100;
        out.c += ((i.c || 0) * g) / 100;
        out.f += ((i.f || 0) * g) / 100;
        out.grams += g;
        out.items.push({ name: i.name, grams: g });
    });
    out.custom = Object.keys(dish?.w || {}).some((k) => dish.w[k] !== '' && dish.w[k] !== undefined);
    return out;
};
export const perServing = (r) => dishNutrition(r, null);
// totali del menù: una porzione di ogni piatto
export const menuTotals = (menu, byId) => {
    const tot = { kcal: 0, p: 0, c: 0, f: 0 };
    normalizeMenu(menu).sections.forEach((s) => s.dishes.forEach((d) => {
        const r = byId[d.rid];
        if (!r) return;
        const x = dishNutrition(r, d);
        ['kcal', 'p', 'c', 'f'].forEach((k) => { tot[k] += x[k]; });
    }));
    return tot;
};
