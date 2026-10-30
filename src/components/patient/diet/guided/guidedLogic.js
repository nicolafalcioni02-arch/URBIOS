// Dieta guidata — logica pura (niente React): preset, calcolo del fabbisogno, scrittura degli obiettivi, totali.
import { calculateRMR } from '../logic/clinicalFormulas';
import { foodValues, normalize } from '../../../../ai/foodMatcher';

import { genId, todayIso, fmtLong, STATUSES } from '../../shared/planCommon';
export { genId, todayIso, fmtLong, STATUSES };

// ---- preset in parole semplici ----
export const ACTIVITY = [
    { id: 'sed', label: 'Sedentario', hint: 'Scrivania, poco movimento', laf: 1.2 },
    { id: 'lieve', label: 'Poco attivo', hint: 'Cammina, 1-2 allenamenti a settimana', laf: 1.375 },
    { id: 'mod', label: 'Moderato', hint: '3-4 allenamenti a settimana', laf: 1.55 },
    { id: 'att', label: 'Attivo', hint: '5-6 allenamenti o lavoro in piedi', laf: 1.725 },
    { id: 'molto', label: 'Molto attivo', hint: 'Sport intenso o lavoro fisico', laf: 1.9 },
];

export const GOALS = [
    { id: 'dim', label: 'Dimagrire', hint: '−15% delle kcal', adj: -15, icon: 'ph-trend-down' },
    { id: 'man', label: 'Mantenere', hint: 'Fabbisogno pieno', adj: 0, icon: 'ph-equals' },
    { id: 'mass', label: 'Mettere massa', hint: '+10% delle kcal', adj: 10, icon: 'ph-trend-up' },
];

export const MACRO_PRESETS = [
    { id: 'eq', label: 'Equilibrata', c: 50, p: 20, f: 30 },
    { id: 'prot', label: 'Più proteine', c: 40, p: 30, f: 30 },
    { id: 'low', label: 'Meno carboidrati', c: 30, p: 30, f: 40 },
    { id: 'sport', label: 'Sportiva', c: 55, p: 20, f: 25 },
];

const meals = (names, values) => names.map((name, i) => ({ id: i + 1, name, value: values[i] }));
export const MEAL_PRESETS = {
    3: meals(['Colazione', 'Pranzo', 'Cena'], [25, 40, 35]),
    4: meals(['Colazione', 'Pranzo', 'Spuntino', 'Cena'], [25, 35, 10, 30]),
    5: meals(['Colazione', 'Spuntino Mattina', 'Pranzo', 'Spuntino Pomeriggio', 'Cena'], [20, 10, 35, 10, 25]),
    6: meals(['Colazione', 'Spuntino Mattina', 'Pranzo', 'Spuntino Pomeriggio', 'Cena', 'Spuntino Sera'], [20, 10, 30, 10, 25, 5]),
};

// ---- fabbisogno ----
export const computeRmr = (calc) => {
    const n = (v) => parseFloat(String(v).replace(',', '.'));
    if (!(n(calc.weight) > 0 && n(calc.height) > 0 && n(calc.age) > 0)) return 0;
    const v = calculateRMR({ ...calc, weight: n(calc.weight), height: n(calc.height), age: n(calc.age) });
    return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
};

export const computeTdee = (calc) => {
    const rmr = computeRmr(calc);
    if (!rmr) return 0;
    const adj = Number(calc.kcalAdjustPct) || 0;
    return Math.round(rmr * (Number(calc.laf) || 1.2) * (1 + adj / 100));
};

// ---- giornate differenziate: riposo / lavoro / lavoro + allenamento ----
// dLaf = scostamento di partenza dal LAF del piano (si può cambiare a mano o con il calcolatore LAF)
export const DAY_TYPES = [
    { id: 'rest', label: 'Riposo', icon: 'ph-bed', dLaf: -0.15 },
    { id: 'work', label: 'Lavoro', icon: 'ph-briefcase', dLaf: 0 },
    { id: 'train', label: 'Lavoro + allenamento', short: 'Allenamento', icon: 'ph-barbell', dLaf: 0.2 },
    { id: 'custom', label: 'Personalizzata', short: 'Su misura', icon: 'ph-sliders-horizontal', dLaf: 0 },
];
export const dayTypeOf = (day) => DAY_TYPES.find((t) => t.id === day?.type) || null;
// kcal di una giornata con un dato LAF: in proporzione all'obiettivo del piano (quindi con lo stesso deficit/surplus);
// se il piano non ha un LAF o un obiettivo, si ricalcola dal metabolismo basale
export const typeKcal = (calc, laf, planKcal) => {
    const planLaf = Number(calc.laf) || 0;
    if (planKcal > 0 && planLaf > 0) return Math.round((planKcal * laf) / planLaf);
    return computeTdee({ ...calc, laf });
};
export const typeLafDefault = (calc, type) => Math.min(2.4, Math.max(1.2, Math.round(((Number(calc.laf) || 1.5) + (DAY_TYPES.find((t) => t.id === type)?.dLaf || 0)) * 100) / 100));
// obiettivo di un giorno: il suo (se ha un tipo) oppure quello del piano
export const dayTarget = (day, plan) => {
    const t = day?.targets;
    if (day?.type && t && Number(t.kcal) > 0) return { kcal: Number(t.kcal), c: Number(t.c), p: Number(t.p), f: Number(t.f), isConfigured: true, typed: true };
    return plan;
};

// ---- giornate differenziate negli Obiettivi ----
export const TYPE_IDS = ['rest', 'work', 'train'];
// LAF di un tipo: il "lavoro" è il LAF scelto per il piano; gli altri hanno un valore proprio (o di partenza)
export const typeLaf = (calc, id) => {
    if (id === 'work') return Number(calc.laf) || 0;
    const v = parseFloat(String(calc.guided?.lafByType?.[id] ?? '').replace(',', '.'));
    return v > 0 ? v : typeLafDefault(calc, id);
};
export const typeTargetKcal = (calc, id) => computeTdee({ ...calc, laf: typeLaf(calc, id) });
// ripartizione dei pasti: quella del tipo di giornata (se diversa) oppure quella comune
export const distFor = (calc, type) => (type && calc.guided?.distByType?.[type]) || calc.distribution || [];

export const macroGrams = (kcal, pct) => ({
    c: Math.round((kcal * pct.c) / 100 / 4),
    p: Math.round((kcal * pct.p) / 100 / 4),
    f: Math.round((kcal * pct.f) / 100 / 9),
});

// Riempie SOLO i campi vuoti con i dati già noti (anagrafica e ultima visita), senza sovrascrivere nulla.
export const prefillCalc = (calc, known) => {
    const out = { ...calc };
    ['sex', 'age', 'weight', 'height', 'waist', 'hip', 'wrist'].forEach((k) => {
        if ((out[k] === '' || out[k] === undefined || out[k] === null) && known[k] !== '' && known[k] !== undefined) out[k] = known[k];
    });
    return out;
};

export const goalsReady = (calc) => computeTdee(calc) > 0 && sumPct(calc.macroTargets) === 100 && sumDist(calc.distribution) === 100;
export const sumPct = (m) => (Number(m?.c) || 0) + (Number(m?.p) || 0) + (Number(m?.f) || 0);
export const sumDist = (d) => (d || []).reduce((a, x) => a + (Number(x.value) || 0), 0);

// Allinea i pasti di un giorno a una ripartizione, senza perdere alimenti.
const syncMeals = (day, distribution) => {
    const old = day.meals || [];
    const used = new Set();
    const norm = (x) => String(x || '').toLowerCase().trim();
    // 1) stesso nome  2) i pasti rimasti, in ordine (rinominati)  3) i pasti con alimenti non assegnati restano in coda
    const slots = distribution.map((d) => {
        const hit = old.find((m) => !used.has(m.id) && norm(m.title) === norm(d.name));
        if (hit) used.add(hit.id);
        return hit || null;
    });
    const leftovers = old.filter((m) => !used.has(m.id));
    const synced = distribution.map((d, i) => {
        let m = slots[i];
        if (!m) {
            const free = leftovers.find((x) => !used.has(x.id));
            if (free) {
                used.add(free.id);
                m = free;
            }
        }
        return { id: m ? m.id : genId(), title: d.name, items: m ? m.items : [] };
    });
    const keep = leftovers.filter((x) => !used.has(x.id) && x.items.length > 0);
    return [...synced, ...keep];
};

// Scrive gli obiettivi e allinea i giorni. "Tutte uguali": un solo obiettivo. "Differenziate": un giorno per tipo
// (riposo, lavoro, lavoro + allenamento) con le sue kcal e la sua ripartizione dei pasti.
export const applyGoals = ({ calcData, setCalcData, setTargets, setDietDays }) => {
    const tdee = computeTdee(calcData);
    const calc = { ...calcData, matrixMode: 'global', activeMatrixDayId: null, dailyConfigs: {} };
    setCalcData(calc);
    const macro = calc.macroTargets;
    setTargets({ kcal: tdee, c: macro.c, p: macro.p, f: macro.f, isConfigured: true });
    const diff = calc.guided?.dayMode === 'diff';
    const plan = { kcal: tdee, ...macro };
    const typed = (id) => ({ type: id, lafType: typeLaf(calc, id), targets: { kcal: typeTargetKcal(calc, id), ...macro } });

    setDietDays((days) => {
        let list = days.map((d) => ({ ...d }));
        if (diff) {
            // un giorno senza tipo diventa il giorno di lavoro; poi si creano i tipi che mancano
            if (!list.some((d) => d.type === 'work')) {
                const i = list.findIndex((d) => !d.type);
                if (i >= 0) list[i] = { ...list[i], type: 'work' };
            }
            TYPE_IDS.forEach((id) => {
                if (!list.some((d) => d.type === id)) list.push({ id: genId(), title: DAY_TYPES.find((t) => t.id === id).label, meals: [], type: id });
            });
        }
        return list.map((day) => {
            const isTyped = diff && TYPE_IDS.includes(day.type);
            const base = { ...day };
            if (isTyped) Object.assign(base, typed(day.type));
            else if (day.type !== 'custom' || !diff) {
                // giorno "personalizzato" in modalità differenziata: resta com'è; altrimenti torna all'obiettivo del piano
                base.type = diff ? day.type : undefined;
                base.lafType = undefined;
                base.targets = plan;
            }
            return { ...base, meals: syncMeals(day, distFor(calc, isTyped ? day.type : undefined)) };
        });
    });
};

// ---- totali di piano ----
export const dayTotals = (day) =>
    (day?.meals || []).reduce(
        (t, m) =>
            m.items.reduce((s, it) => {
                const w = (parseFloat(it.weight) || 0) / 100;
                return { kcal: s.kcal + (parseFloat(it.kcal) || 0) * w, p: s.p + (parseFloat(it.p) || 0) * w, c: s.c + (parseFloat(it.c) || 0) * w, f: s.f + (parseFloat(it.f) || 0) * w };
            }, t),
        { kcal: 0, p: 0, c: 0, f: 0 }
    );

export const mealKcal = (meal) => dayTotals({ meals: [meal] }).kcal;

// ---- modifiche al menù (immutabili) ----
const mapMeal = (days, dayId, mealId, fn) => days.map((d) => (d.id !== dayId ? d : { ...d, meals: d.meals.map((m) => (m.id !== mealId ? m : fn(m))) }));

export const addFood = (days, dayId, mealId, food, grams = 100) => {
    const v = foodValues(food);
    return mapMeal(days, dayId, mealId, (m) => ({ ...m, items: [...m.items, { id: genId(), name: food.name, weight: grams, kcal: v.kcal, p: v.p, c: v.c, f: v.f }] }));
};
export const addItems = (days, dayId, mealId, items) => mapMeal(days, dayId, mealId, (m) => ({ ...m, items: [...m.items, ...items] }));
export const setGrams = (days, dayId, mealId, itemId, grams) =>
    mapMeal(days, dayId, mealId, (m) => ({ ...m, items: m.items.map((i) => (i.id === itemId ? { ...i, weight: grams } : i)) }));
export const removeItem = (days, dayId, mealId, itemId) => mapMeal(days, dayId, mealId, (m) => ({ ...m, items: m.items.filter((i) => i.id !== itemId) }));

// ---- pasti di un giorno: aggiungere, rinominare, spostare, eliminare ----
export const addMeal = (days, dayId, title, items = []) => days.map((d) => (d.id !== dayId ? d : { ...d, meals: [...d.meals, { id: genId(), title: title || 'Pasto', items }] }));
export const renameMeal = (days, dayId, mealId, title) => mapMeal(days, dayId, mealId, (m) => ({ ...m, title }));
export const removeMeal = (days, dayId, mealId) => days.map((d) => (d.id !== dayId ? d : { ...d, meals: d.meals.filter((m) => m.id !== mealId) }));
export const moveMeal = (days, dayId, mealId, delta) =>
    days.map((d) => {
        if (d.id !== dayId) return d;
        const from = d.meals.findIndex((m) => m.id === mealId);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= d.meals.length) return d;
        const meals = [...d.meals];
        const [m] = meals.splice(from, 1);
        meals.splice(to, 0, m);
        return { ...d, meals };
    });

export const newDay = (calcData, n) => ({
    id: genId(),
    title: `Giorno ${n}`,
    meals: calcData.distribution.map((m) => ({ id: genId(), title: m.name, items: [] })),
});
export const duplicateDay = (day) => ({ ...JSON.parse(JSON.stringify(day)), id: genId(), title: `${day.title} (copia)`, meals: day.meals.map((m) => ({ ...JSON.parse(JSON.stringify(m)), id: genId(), items: m.items.map((i) => ({ ...i, id: genId() })) })) });

// Scala i grammi di un giorno per arrivare alle kcal obiettivo (arrotondando a 5 g).
export const scaleDayTo = (day, targetKcal) => {
    const cur = dayTotals(day).kcal;
    if (!(cur > 0 && targetKcal > 0)) return day;
    const f = targetKcal / cur;
    return { ...day, meals: day.meals.map((m) => ({ ...m, items: m.items.map((i) => ({ ...i, weight: Math.max(5, Math.round(((parseFloat(i.weight) || 0) * f) / 5) * 5) })) })) };
};

// Stato di un giorno rispetto all'obiettivo: ok entro ±8%, altrimenti lontano.
export const dayStatus = (day, tdee) => {
    const k = dayTotals(day).kcal;
    const empty = !day.meals.some((m) => m.items.length);
    if (empty) return { id: 'empty', label: 'Vuoto', color: '#9A988F', kcal: k };
    if (!tdee) return { id: 'na', label: '', color: '#9A988F', kcal: k };
    const d = (k - tdee) / tdee;
    if (Math.abs(d) <= 0.08) return { id: 'ok', label: 'In linea', color: '#1F8A5B', kcal: k };
    return { id: 'off', label: d < 0 ? `${Math.round(-d * 100)}% sotto` : `${Math.round(d * 100)}% sopra`, color: '#C2413A', kcal: k };
};

// Adatta un piano proposto dall'AI al piano già impostato: stessi pasti, stesso LAF e macro.
// I pasti dell'AI si associano per nome, altrimenti per posizione; quelli in eccesso vengono scartati (e segnalati).
export const alignToPlan = (parsed, calcData) => {
    const warnings = [];
    const dist = calcData.distribution || [];
    const days = parsed.days.map((d) => {
        const used = new Set();
        const meals = dist.map((dm, i) => {
            let m = d.meals.find((x, j) => !used.has(j) && normalize(x.title) === normalize(dm.name));
            let j = m ? d.meals.indexOf(m) : -1;
            if (!m && d.meals[i] && !used.has(i) && !dist.some((z) => normalize(z.name) === normalize(d.meals[i].title))) {
                m = d.meals[i];
                j = i;
            }
            if (m) used.add(j);
            return { title: dm.name, items: m ? m.items : [] };
        });
        d.meals.forEach((x, j) => {
            if (!used.has(j) && x.items.length) warnings.push(`${d.title}: il pasto "${x.title}" non corrisponde a nessun pasto del piano e non è stato inserito.`);
        });
        return { ...d, meals };
    });
    return {
        parsed: { ...parsed, days, distribution: dist.map((d) => ({ ...d })), laf: Number(calcData.laf) || parsed.laf, macro: { ...calcData.macroTargets }, adjustPct: Number(calcData.kcalAdjustPct) || 0 },
        warnings,
    };
};

// Testo leggibile del piano attuale (per i prompt di aiuto).
export const planSummary = (days) =>
    days
        .map(
            (d) =>
                `${d.title} (${Math.round(dayTotals(d).kcal)} kcal):\n` +
                d.meals.map((m) => `  - ${m.title}: ${m.items.length ? m.items.map((i) => `${i.name} ${i.weight} g`).join(', ') : '(vuoto)'}`).join('\n')
        )
        .join('\n');

// ---- sostituzioni (alternative equivalenti) ----
// Ogni alimento ha `subs`: alternative con i grammi calcolati per pareggiare kcal (o proteine, carboidrati, grassi) dell'originale.
export const SUB_MODES = [
    { val: 'kcal', label: 'Stesse kcal' },
    { val: 'p', label: 'Stesse proteine' },
    { val: 'c', label: 'Stessi carboidrati' },
    { val: 'f', label: 'Stessi grassi' },
];
const num = (v) => parseFloat(v) || 0;
const origTotal = (item) => ({ kcal: (num(item.kcal) * num(item.weight)) / 100, p: (num(item.p) * num(item.weight)) / 100, c: (num(item.c) * num(item.weight)) / 100, f: (num(item.f) * num(item.weight)) / 100 });
export const subWeight = (item, v, mode = 'kcal') => {
    const per100 = v[mode] || 0;
    return per100 > 0 ? Math.round((origTotal(item)[mode] / per100) * 100) : 0;
};
const mapItem = (days, dayId, mealId, itemId, fn) => days.map((d) => (d.id !== dayId ? d : { ...d, meals: d.meals.map((m) => (m.id !== mealId ? m : { ...m, items: m.items.map((i) => (i.id !== itemId ? i : fn(i))) })) }));

export const addSub = (days, dayId, mealId, itemId, food, mode = 'kcal') =>
    mapItem(days, dayId, mealId, itemId, (i) => {
        const v = foodValues(food);
        return { ...i, subs: [...(i.subs || []), { id: genId(), name: food.name, weight: subWeight(i, v, mode), ...v, mode }] };
    });
export const setSubMode = (days, dayId, mealId, itemId, subId, mode) =>
    mapItem(days, dayId, mealId, itemId, (i) => ({ ...i, subs: (i.subs || []).map((s) => (s.id === subId ? { ...s, mode, weight: subWeight(i, s, mode) } : s)) }));
export const removeSub = (days, dayId, mealId, itemId, subId) => mapItem(days, dayId, mealId, itemId, (i) => ({ ...i, subs: (i.subs || []).filter((s) => s.id !== subId) }));
// Scambia: l'alternativa diventa l'alimento del piano e quello di prima diventa un'alternativa.
export const swapSub = (days, dayId, mealId, itemId, subId) =>
    mapItem(days, dayId, mealId, itemId, (i) => {
        const s = (i.subs || []).find((x) => x.id === subId);
        if (!s) return i;
        const old = { id: genId(), name: i.name, weight: i.weight, kcal: i.kcal, p: i.p, c: i.c, f: i.f, mode: s.mode || 'kcal' };
        const { recipeId, portions, recipeParts, recipeBase, ...rest } = i;
        return { ...rest, name: s.name, weight: s.weight, kcal: s.kcal, p: s.p, c: s.c, f: s.f, subs: [...(i.subs || []).filter((x) => x.id !== subId), old] };
    });

const COMMON = new Set('pollo tacchino manzo bovino vitello maiale suino agnello coniglio prosciutto bresaola salmone merluzzo nasello tonno orata branzino platessa sogliola trota gamberi calamari uova ricotta mozzarella parmigiano grana yogurt latte formaggio tofu seitan riso pasta pane farro orzo avena patate gallette crackers fette ceci lenticchie fagioli piselli fave mela mele pera pere banane banana arance arancia kiwi fragole pesche mandorle noci nocciole zucchine spinaci insalata lattuga carote pomodori broccoli cavolfiore finocchi peperoni olio burro miele zucchero marmellata cioccolato'.split(' '));

// Proposte automatiche: alimenti della stessa categoria con profilo di macro simile e porzione ragionevole.
export const suggestSubs = (item, foodDB, limit = 5) => {
    const key = normalize(item.name);
    const orig = foodDB.find((f) => normalize(f.name) === key);
    if (!orig || !orig.category) return [];
    const ov = foodValues(orig);
    const share = (v) => {
        const e = v.p * 4 + v.c * 4 + v.f * 9 || 1;
        return [(v.p * 4) / e, (v.c * 4) / e, (v.f * 9) / e];
    };
    const os = share(ov);
    const cookedRe = /cott|bollit|less|griglia|frit|arrost/i;
    const origCooked = cookedRe.test(orig.name);
    const have = new Set((item.subs || []).map((s) => normalize(s.name)));
    return foodDB
        .filter((f) => f.category === orig.category && normalize(f.name) !== key && !have.has(normalize(f.name)))
        .map((f) => {
            const v = foodValues(f);
            const w = subWeight(item, v, 'kcal');
            const s = share(v);
            let d = Math.abs(s[0] - os[0]) + Math.abs(s[1] - os[1]) + Math.abs(s[2] - os[2]);
            if (cookedRe.test(f.name) !== origCooked) d += 0.4;
            if (/aromatizzat|conserv|sott|surgelat|in polvere|dolce|ripien/i.test(f.name)) d += 0.3;
            if (COMMON.has(normalize(f.name).split(' ')[0])) d -= 0.35; // alimenti di uso comune prima dei più insoliti (cervo, struzzo…)
            return { f, w, d, ok: v.kcal > 0 && w >= 10 && w <= 400 };
        })
        .filter((x) => x.ok)
        .sort((a, b) => a.d - b.d)
        .slice(0, limit)
        .map((x) => x.f);
};

// ---- piano: indipendente o collegato a una visita ----
// Un piano vive dentro una visita. Se la visita è "Solo Dieta" il piano è INDIPENDENTE (la visita è solo un contenitore).
export const isIndependent = (v) => !!v && String(v.note || '').includes('Solo Dieta');
export const INDEPENDENT_NOTE = 'Piano Nutrizionale Indipendente (Solo Dieta)';

// Data del piano: scelta dal professionista (diet_meta) oppure quella della visita; "senza data" è ammesso.
export const planDateInfo = (v) => {
    const m = v?.dettagli?.diet_meta;
    if (m && m.noDate) return { none: true, iso: null };
    return { none: false, iso: (m && m.date) || v?.data || null };
};
// Nome scelto dal professionista (facoltativo) e stato del piano.
export const planName = (v) => String(v?.dettagli?.diet_meta?.name || '').trim();
export const planTitle = (v) => planName(v) || (isIndependent(v) ? 'Piano indipendente' : `Visita del ${fmtLong(v?.data)}`);
export const planLabel = (v) => {
    if (!v) return '';
    const d = planDateInfo(v);
    const name = planName(v);
    if (isIndependent(v)) return `${name || 'Piano indipendente'} · ${d.none ? 'senza data' : fmtLong(d.iso)}`;
    const base = `Visita del ${fmtLong(v.data)}${v.peso ? ` · ${v.peso} kg` : ''}`;
    return name ? `${name} · ${base}` : base;
};

export const statusOf = (v) => STATUSES.find((x) => x.id === (v?.dietStatus === 'created' ? 'active' : v?.dietStatus)) || STATUSES[0];
export const setPlanStatus = (onUpdateDb, patientId, visitId, status) => patchVisit(onUpdateDb, patientId, visitId, (v) => ({ ...v, dietStatus: status }));
export const setPlanName = (onUpdateDb, patientId, visitId, name) =>
    patchVisit(onUpdateDb, patientId, visitId, (v) => ({ ...v, dettagli: { ...v.dettagli, diet_meta: { ...(v.dettagli.diet_meta || {}), name: String(name).trim() } } }));

export const planSummaryOf = (v) => {
    const t = v?.dettagli?.diet_targets;
    const days = (v?.dettagli?.diet_plan_data || []).length;
    if (!days && !(t && t.isConfigured)) return 'Piano vuoto';
    return `${days} ${days === 1 ? 'giorno' : 'giorni'}${t && t.isConfigured ? ` · ${Math.round(t.kcal)} kcal` : ''}`;
};

// Aggiorna un singolo paziente/visita nell'archivio.
export const patchVisit = (onUpdateDb, patientId, visitId, fn) =>
    onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id !== patientId ? p : { ...p, visite: (p.visite || []).map((v) => (v.id !== visitId ? v : fn(v))) })) }));

// Contenitore di un nuovo piano indipendente.
export const makeIndependentVisit = ({ calcData, dateIso, noDate, blank = false, targets, dietDays, savedReports }) => ({
    id: Date.now(),
    data: todayIso(), // le altre sezioni (storico) hanno bisogno di una data: quella "vera" del piano sta in diet_meta
    peso: parseFloat(calcData?.weight) || 70,
    dietStatus: 'draft', // un piano nuovo parte da "Da finire"; lo stato si cambia dal pannello del piano
    note: INDEPENDENT_NOTE,
    dettagli: {
        diet_calc_data: blank ? { ...calcData, guided: {} } : calcData,
        diet_targets: blank ? { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false } : targets,
        diet_plan_data: blank ? [] : dietDays,
        diet_saved_reports: blank ? [] : savedReports || [],
        diet_meta: noDate ? { noDate: true } : { date: dateIso || todayIso() },
    },
});

// ---- libro delle diete: piani già fatti, riutilizzabili ----
const clone = (x) => JSON.parse(JSON.stringify(x));
const reId = (days) => days.map((d) => ({ ...d, id: genId(), meals: d.meals.map((m) => ({ ...m, id: genId(), items: m.items.map((i) => ({ ...i, id: genId(), subs: i.subs ? i.subs.map((s) => ({ ...s, id: genId() })) : i.subs })) })) }));

export const bookEntryFrom = ({ name, note, calcData, targets, dietDays, visit, id }) => ({
    id: id || 'book-' + Date.now(),
    name: String(name || '').trim() || 'Dieta senza nome',
    note: String(note || '').trim(),
    savedAt: todayIso(),
    kcal: targets && targets.isConfigured ? Math.round(targets.kcal) : null,
    plan: clone(dietDays),
    calc: clone({ laf: calcData.laf, kcalAdjustPct: calcData.kcalAdjustPct || 0, macroTargets: calcData.macroTargets, distribution: calcData.distribution, guided: calcData.guided || {}, formula: calcData.formula, weightTarget: calcData.weightTarget }),
    targets: clone(targets || {}),
    supplements: clone(visit?.dettagli?.diet_supplements || []),
    advice: clone(visit?.dettagli?.diet_notes || []),
    profile: { sex: calcData.sex, age: calcData.age, weight: calcData.weight },
});

// Adatta i giorni di un modello ai pasti del piano in uso (per nome, altrimenti per posizione).
export const refitDays = (days, distribution) =>
    reId(days).map((d) => {
        const used = new Set();
        const meals = distribution.map((dm, i) => {
            let m = d.meals.find((x) => !used.has(x.id) && normalize(x.title) === normalize(dm.name));
            if (!m && d.meals[i] && !used.has(d.meals[i].id) && !distribution.some((z) => normalize(z.name) === normalize(d.meals[i].title))) m = d.meals[i];
            if (m) used.add(m.id);
            return { id: genId(), title: dm.name, items: m ? m.items : [] };
        });
        return { ...d, meals };
    });

// Una voce del libro diventa un piano per QUESTO paziente: si tiene la struttura (pasti, macro, attività, giorni),
// ma peso, età e altezza sono quelli del paziente in uso e il fabbisogno si ricalcola.
export const planFromBookEntry = (entry, calcData) => {
    const calc = { ...calcData, ...entry.calc, matrixMode: 'global', activeMatrixDayId: null, dailyConfigs: {} };
    const tdee = computeTdee(calc);
    const configured = tdee > 0;
    const targets = configured ? { kcal: tdee, ...calc.macroTargets, isConfigured: true } : { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false };
    const days = reId(entry.plan).map((d) => ({ ...d, targets: configured ? { kcal: tdee, ...calc.macroTargets } : undefined }));
    return { calc, targets, days };
};
