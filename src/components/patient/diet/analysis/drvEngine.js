// Analisi del piano — motore (funzioni pure, niente React).
//
// Confronta ciò che il piano fornisce con i valori di riferimento EFSA (dbMICRO: AR, PRI, AI, UL).
// Tre regole di onestà:
//  1. il riferimento si sceglie per ETÀ, SESSO e condizione (gravidanza/allattamento), mai "l'ultima riga trovata";
//  2. un dato mancante nel database alimenti NON è una carenza: se mancano i dati si dice "dato incompleto";
//  3. se la quantità già trovata supera il riferimento, l'esito è certo anche con dati incompleti (è un minimo).

// ---------------------------------------------------------------- nutrienti
// drv = nome nel database dei riferimenti · key = campo nel database alimenti · unit = unità del campo alimenti
export const NUTRIENTS = [
    { drv: 'Dietary fibre', key: 'total_fiber', label: 'Fibre', group: 'Macro', unit: 'g' },
    { drv: 'Vitamin A', key: 'vitamin_a_retinol_equivalent', label: 'Vitamina A', group: 'Vitamine', unit: 'μg', ignoreUL: true },
    { drv: 'Thiamin', key: 'thiamine', label: 'Tiamina (B1)', group: 'Vitamine', unit: 'mg' },
    { drv: 'Riboflavin', key: 'riboflavin', label: 'Riboflavina (B2)', group: 'Vitamine', unit: 'mg' },
    { drv: 'Niacin', key: 'niacin', label: 'Niacina (B3)', group: 'Vitamine', unit: 'mg', ignoreUL: true },
    { drv: 'Pantothenic acid', key: 'pantothenic_acid', label: 'Acido pantotenico (B5)', group: 'Vitamine', unit: 'mg' },
    { drv: 'Vitamin B6', key: 'vitamin_b6', label: 'Vitamina B6', group: 'Vitamine', unit: 'mg' },
    { drv: 'Biotin', key: 'biotin', label: 'Biotina (B7)', group: 'Vitamine', unit: 'μg' },
    { drv: 'Folate', key: 'folate', label: 'Folati (B9)', group: 'Vitamine', unit: 'μg', ignoreUL: true },
    { drv: 'Cobalamin (vitamin B12)', key: 'vitamin_b12', label: 'Vitamina B12', group: 'Vitamine', unit: 'μg' },
    { drv: 'Vitamin C', key: 'vitamin_c', label: 'Vitamina C', group: 'Vitamine', unit: 'mg' },
    { drv: 'Vitamin D', key: 'vitamin_d', label: 'Vitamina D', group: 'Vitamine', unit: 'μg' },
    { drv: 'Vitamin E', key: 'vitamin_e', label: 'Vitamina E', group: 'Vitamine', unit: 'mg' },
    { drv: 'Vitamin K as phylloquinone', key: 'vitamin_k', label: 'Vitamina K', group: 'Vitamine', unit: 'μg' },
    { drv: 'Calcium', key: 'calcium', label: 'Calcio', group: 'Minerali', unit: 'mg' },
    { drv: 'Phosphorus', key: 'phosphorus', label: 'Fosforo', group: 'Minerali', unit: 'mg' },
    { drv: 'Magnesium', key: 'magnesium', label: 'Magnesio', group: 'Minerali', unit: 'mg', ignoreUL: true }, // l'UL vale solo per gli integratori
    { drv: 'Potassium', key: 'potassium', label: 'Potassio', group: 'Minerali', unit: 'mg' },
    { drv: 'Sodium', key: 'sodium', label: 'Sodio', group: 'Minerali', unit: 'mg', limitOnly: true },
    { drv: 'Iron', key: 'iron', label: 'Ferro', group: 'Minerali', unit: 'mg' },
    { drv: 'Zinc', key: 'zinc', label: 'Zinco', group: 'Minerali', unit: 'mg' },
    { drv: 'Copper', key: 'copper', label: 'Rame', group: 'Minerali', unit: 'mg' },
    { drv: 'Manganese', key: 'manganese', label: 'Manganese', group: 'Minerali', unit: 'mg' },
    { drv: 'Selenium', key: 'selenium', label: 'Selenio', group: 'Minerali', unit: 'μg' },
    { drv: 'Iodine', key: 'iodine', label: 'Iodio', group: 'Minerali', unit: 'μg' },
];

export const GROUPS = ['Vitamine', 'Minerali'];
const keysOf = (def) => (Array.isArray(def.key) ? def.key : [def.key]);

const UNIT_G = { g: 1, mg: 1e-3, 'μg': 1e-6, ug: 1e-6, kg: 1000 };
const PROTEIN_REF = 'Protein';
const MIN_RELIABLE_COVERAGE = 0.25; // sotto questa quota di alimenti con un valore, il database non permette di valutare il nutriente
const MIN_KNOWN_SHARE = 0.5; // quota minima del piano (in peso) che deve avere il dato per dire "carenza"

const num = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0; // "tr" (tracce) e testo → 0
};
export const normName = (s) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

// ---------------------------------------------------------------- lettura dei riferimenti
// "1000 mg/day", "0.83 g/kg bw per day", "1.3 mg NE/MJ", "20–35 E%", "(+) 9 g/day", "ND"
export const parseDrv = (raw) => {
    if (raw === null || raw === undefined) return null;
    let s = String(raw).trim();
    if (!s || /^(ND|NA)\b/i.test(s)) return null;
    const increment = s.startsWith('(+)');
    s = s.replace(/^\(\+\)\s*/, '');
    const m = s.match(/^(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(.*)$/);
    if (!m) return null;
    const lo = parseFloat(m[1].replace(',', '.'));
    const hi = m[2] ? parseFloat(m[2].replace(',', '.')) : null;
    const rest = m[3].trim();
    if (/E%/.test(rest)) return { value: lo, max: hi, per: 'E%', unit: 'E%', increment, qualifier: '' };
    const u = rest.match(/^(g|mg|μg|µg|L|MJ)\b/);
    if (!u) return null;
    const unit = u[1].replace('µ', 'μ');
    const per = /\/kg bw/.test(rest) ? 'kg' : /\/MJ/.test(rest) ? 'MJ' : 'day';
    const qualifier = rest.slice(u[0].length).replace(/\/(day|MJ|kg bw per day)/, '').trim();
    return { value: lo, max: hi, unit, per, increment, qualifier };
};

// Intervallo di età [da, a) in anni.
export const parseAge = (raw) => {
    const t = String(raw || '')
        .toLowerCase()
        .replace(/pal\s*=\s*[\d.]+/, '')
        .replace(/[–—]/g, '-')
        .trim();
    let m = t.match(/≥\s*(\d+)\s*year/);
    if (m) return [Number(m[1]), 200];
    m = t.match(/(\d+)\s*-\s*(\d+)\s*(year|month)/);
    if (m) {
        const k = m[3] === 'month' ? 1 / 12 : 1;
        return [Number(m[1]) * k, (Number(m[2]) + 1) * k];
    }
    m = t.match(/(\d+)\s*(year|month)/);
    if (m) {
        const k = m[2] === 'month' ? 1 / 12 : 1;
        return [Number(m[1]) * k, (Number(m[1]) + 1) * k];
    }
    return null;
};

const genderOk = (g, sex) => {
    const x = String(g || '').toLowerCase().trim();
    if (!x || x.startsWith('both') || x === 'all') return true;
    return sex === 'F' ? x.startsWith('f') : x.startsWith('m');
};

// Popolazioni da provare, in ordine di priorità.
const populationsFor = ({ age, sex, mode }) => {
    const base = [];
    if (age < 1) base.push('Infants');
    else if (age < 18) base.push('Children');
    else {
        if (sex === 'F') base.push(age >= 50 ? 'Postmenopausal women' : 'Premenopausal women');
        base.push('Adults', 'Adults (LPI 900 mg/day)'); // zinco: dipende dai fitati, scelgo la fascia di una dieta mista ricca di cereali
    }
    if (mode === 'pregnant') return ['Pregnant women', ...base];
    if (mode === 'lactating') return ['Lactating women', ...base];
    return base;
};

export const describeReference = ({ age, sex, mode }) => {
    const a = Number(age);
    const who = a < 1 ? 'Lattanti' : a < 18 ? (sex === 'F' ? 'Ragazze' : 'Ragazzi') : mode === 'pregnant' ? 'Gravidanza' : mode === 'lactating' ? 'Allattamento' : sex === 'F' ? 'Donne adulte' : 'Uomini adulti';
    return `${who}${a >= 1 ? `, ${Math.floor(a)} anni` : ''} · EFSA`;
};

// -> { [nome nutriente EFSA]: { ar, pri, ai, ul, ri, safe, population } } con i valori ancora "grezzi" (parseDrv)
export const referenceFor = (drvDB, { age, sex = 'M', mode = 'standard' }) => {
    const a = Number(age) > 0 ? Number(age) : 30;
    const pops = populationsFor({ age: a, sex, mode });
    const byNutrient = {};
    (drvDB || []).forEach((row) => {
        if (!genderOk(row.Gender, sex)) return;
        const range = parseAge(row.Age);
        if (!range || a < range[0] || a >= range[1]) return;
        const pi = pops.findIndex((p) => String(row['Target population'] || '').trim() === p);
        if (pi < 0) return;
        (byNutrient[row.Nutrient] ||= []).push({ row, pi });
    });
    const out = {};
    Object.entries(byNutrient).forEach(([nutrient, list]) => {
        // la popolazione più specifica che ha valori "pieni" (le righe con (+) sono incrementi, non valori assoluti)
        const usable = list.filter(({ row }) => ![row.AR, row.PRI, row.AI].some((v) => String(v).trim().startsWith('(+)')));
        if (!usable.length) return;
        const best = Math.min(...usable.map((x) => x.pi));
        const rows = usable.filter((x) => x.pi === best).map((x) => x.row);
        const first = (f) => rows.map((r) => parseDrv(r[f])).find(Boolean) || null;
        const ul = rows.map((r) => parseDrv(r.UL)).find((p) => p && !/nicotin/i.test(p.qualifier)) || null; // gli UL di niacina riguardano solo integratori
        const safe = rows.map((r) => parseDrv(r['Safe and adequate intake'])).find(Boolean) || null;
        out[nutrient] = { ar: first('AR'), pri: first('PRI'), ai: first('AI'), ri: first('RI'), ul, safe, population: pops[best] };
    });
    return out;
};

// valore di riferimento → quantità al giorno nell'unità del campo alimenti
const toDay = (p, def, ctx) => {
    if (!p || p.per === 'E%') return null;
    let g;
    if (p.unit === 'L' || p.unit === 'MJ') return null;
    if (p.per === 'kg') g = p.value * (ctx.weight || 0) * (UNIT_G[p.unit] ?? 1);
    else if (p.per === 'MJ') g = p.value * (ctx.mj || 0) * (UNIT_G[p.unit] ?? 1);
    else g = p.value * (UNIT_G[p.unit] ?? 1);
    const out = g / UNIT_G[def.unit];
    return out > 0 ? out : null;
};

// ---------------------------------------------------------------- consumo del piano
export const buildFoodMap = (foodDB) => new Map((foodDB || []).map((f) => [normName(f.name), f]));

// Copertura del database: quota di alimenti che riportano un valore per ogni campo.
export const dbCoverage = (foodDB) => {
    const cov = {};
    const n = Math.max(1, (foodDB || []).length);
    NUTRIENTS.forEach((def) =>
        keysOf(def).forEach((k) => {
            if (cov[k] === undefined) cov[k] = (foodDB || []).filter((f) => num(f[k]) > 0).length / n;
        })
    );
    return cov;
};

// Ogni alimento del piano diventa (alimento del database, grammi). Le ricette si scompongono negli ingredienti.
const expandItem = (item, map) => {
    const w = num(item.weight);
    if (Array.isArray(item.recipeParts) && item.recipeParts.length && num(item.recipeBase) > 0) {
        const k = w / num(item.recipeBase);
        return item.recipeParts.map((p) => ({ name: p.name, food: map.get(normName(p.name)) || null, grams: num(p.grams) * k }));
    }
    return [{ name: item.name, food: map.get(normName(item.name)) || null, grams: w, item }];
};

export const intakeOf = (days, foodMap) => {
    const totals = {};
    const known = {};
    let totalWeight = 0;
    let kcal = 0;
    let p = 0;
    let c = 0;
    let f = 0;
    const unmatched = new Set();
    const keys = [...new Set(NUTRIENTS.flatMap(keysOf))];
    keys.forEach((k) => ((totals[k] = 0), (known[k] = 0)));

    days.forEach((day) =>
        day.meals.forEach((meal) =>
            meal.items.forEach((item) => {
                const w = num(item.weight) / 100;
                kcal += num(item.kcal) * w;
                p += num(item.p) * w;
                c += num(item.c) * w;
                f += num(item.f) * w;
                expandItem(item, foodMap).forEach((part) => {
                    if (part.grams <= 0) return;
                    if (!part.food) {
                        unmatched.add(part.name);
                        return;
                    }
                    totalWeight += part.grams;
                    keys.forEach((k) => {
                        const v = num(part.food[k]);
                        totals[k] += (v * part.grams) / 100;
                        if (v > 0) known[k] += part.grams;
                    });
                });
            })
        )
    );
    const n = Math.max(1, days.length);
    return { totals, known, totalWeight, kcal: kcal / n, p: p / n, c: c / n, f: f / n, days: n, unmatched: [...unmatched] };
};

// ---------------------------------------------------------------- valutazione
export const STATUS = {
    ok: { label: 'Adeguato', color: '#1F8A5B', bg: '#DCE9E1', rank: 4 },
    mid: { label: 'Da migliorare', color: '#9A5B00', bg: '#FFF1D6', rank: 1 },
    low: { label: 'Insufficiente', color: '#C2413A', bg: '#FDECEA', rank: 0 },
    high: { label: 'Sopra il limite', color: '#C2413A', bg: '#FDECEA', rank: 0 },
    partial: { label: 'Dato incompleto', color: '#6E6D69', bg: '#EDEBE6', rank: 3 },
    nodata: { label: 'Non valutabile', color: '#6E6D69', bg: '#EDEBE6', rank: 5 },
};

export const analyzePlan = ({ days, foodDB, drvDB, profile, mode = 'standard', targets = null }) => {
    const sex = profile.sex === 'F' ? 'F' : 'M';
    const age = Number(profile.age) > 0 ? Number(profile.age) : null;
    const weight = Number(profile.weight) > 0 ? Number(profile.weight) : null;
    const foodMap = buildFoodMap(foodDB);
    const cov = dbCoverage(foodDB);
    const intake = intakeOf(days, foodMap);
    const refs = referenceFor(drvDB, { age: age ?? 30, sex, mode });
    const mj = (intake.kcal * 4.184) / 1000;
    const ctx = { weight, mj };

    const nutrients = NUTRIENTS.map((def) => {
        const ref = refs[def.drv] || null;
        const ks = keysOf(def);
        const value = ks.reduce((s, k) => s + intake.totals[k] / intake.days, 0);
        const knownShare = intake.totalWeight > 0 ? Math.max(...ks.map((k) => intake.known[k])) / intake.totalWeight : 0;
        const coverage = Math.max(...ks.map((k) => cov[k] ?? 0));
        const out = { def, value, knownShare, coverage, ref, target: null, ar: null, ul: null, limit: null, pct: 0, status: 'nodata' };
        if (!ref) return out;

        const pri = toDay(ref.pri, def, ctx);
        const ai = toDay(ref.ai, def, ctx);
        out.ar = toDay(ref.ar, def, ctx);
        out.target = pri ?? ai;
        out.basis = pri ? 'PRI' : ai ? 'AI' : null;
        out.ul = def.ignoreUL ? null : toDay(ref.ul, def, ctx);
        if (def.limitOnly) out.limit = toDay(ref.safe, { ...def, unit: def.unit }, ctx) ?? (ref.safe && ref.safe.unit === 'g' ? ref.safe.value * 1000 : null);

        if (def.limitOnly) {
            if (!out.limit) return out;
            out.pct = (value / out.limit) * 100;
            out.status = value > out.limit ? 'high' : value > 0 ? 'ok' : 'partial';
            return out;
        }
        if (!out.target) return out;
        out.pct = (value / out.target) * 100;

        if (out.ul && value > out.ul) out.status = 'high';
        else if (value >= out.target) out.status = 'ok';
        else {
            const floor = ref.pri && out.ar ? out.ar : out.target * 0.5; // con la sola AI (non è un fabbisogno) 'insufficiente' solo sotto metà
            out.status = value < floor ? 'low' : 'mid';
            // dato mancante ≠ carenza
            if (coverage < MIN_RELIABLE_COVERAGE) out.status = value > 0 ? 'partial' : 'nodata';
            else if (knownShare < MIN_KNOWN_SHARE) out.status = 'partial';
        }
        return out;
    });

    // macro
    const kcal = intake.kcal;
    const eShare = (g, k) => (kcal > 0 ? ((g * k) / kcal) * 100 : 0);
    const protRef = refs[PROTEIN_REF];
    const protPerKg = weight ? intake.p / weight : null;
    const protPri = protRef && protRef.pri && protRef.pri.per === 'kg' ? protRef.pri.value : null;
    const range = (name) => {
        const r = refs[name] && refs[name].ri;
        return r && r.max ? [r.value, r.max] : null;
    };
    const macros = {
        kcal,
        kcalTarget: targets && targets.isConfigured ? targets.kcal : null,
        c: { g: intake.c, e: eShare(intake.c, 4), range: range('Total carbohydrates') },
        p: { g: intake.p, e: eShare(intake.p, 4), perKg: protPerKg, ref: protPri, refG: protPri && weight ? protPri * weight : null },
        f: { g: intake.f, e: eShare(intake.f, 9), range: range('Total fat') },
    };

    const sorted = nutrients.filter((n) => n.status !== 'nodata');
    return {
        ready: intake.totalWeight > 0 || intake.kcal > 0,
        reference: describeReference({ age: age ?? 30, sex, mode }),
        missingProfile: [!age && 'età', !weight && 'peso'].filter(Boolean),
        macros,
        nutrients,
        problems: sorted.filter((n) => ['low', 'mid', 'high'].includes(n.status)).sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank || a.pct - b.pct),
        adequate: sorted.filter((n) => n.status === 'ok'),
        partial: sorted.filter((n) => n.status === 'partial'),
        nodata: nutrients.filter((n) => n.status === 'nodata'),
        unmatched: intake.unmatched,
        days: intake.days,
    };
};

// Alimenti comuni ricchi di un nutriente (per 100 g) — per "cosa mangiare per…".
const COMMON = new Set('pollo tacchino manzo bovino vitello maiale suino agnello coniglio prosciutto bresaola salmone merluzzo nasello tonno orata branzino platessa sogliola trota gamberi calamari uova ricotta mozzarella parmigiano grana yogurt latte formaggio tofu seitan riso pasta pane farro orzo avena patate ceci lenticchie fagioli piselli fave mele pere banane arance kiwi fragole pesche mandorle noci nocciole zucchine spinaci insalata lattuga carote pomodori broccoli cavolfiore finocchi peperoni bietole rucola cicoria cime semi sesamo lino zucca arachidi pistacchi'.split(' '));
export const richFoods = (def, foodDB, limit = 4) => {
    const ks = keysOf(def);
    const val = (f) => ks.reduce((s, k) => s + num(f[k]), 0);
    return (foodDB || [])
        .filter((f) => COMMON.has(normName(f.name).split(' ')[0]) && val(f) > 0 && !/aromatizzat|conserv|sott|polvere|secc|disidrat|tuorlo|concentrat|estratto|lievito|cacao|spezi|erbe/i.test(f.name))
        .sort((a, b) => val(b) - val(a))
        .slice(0, limit)
        .map((f) => ({ name: f.name, value: val(f) }));
};

// Compatibilità con il grafico "Smart": { chiaveAlimento: { name, target, ul, unit } } scelto per età e sesso.
export const legacyTargets = (drvDB, { age, sex, weight, kcal, mode }) => {
    const refs = referenceFor(drvDB, { age, sex: sex === 'F' ? 'F' : 'M', mode });
    const mj = ((kcal || 0) * 4.184) / 1000;
    const out = {};
    NUTRIENTS.forEach((def) => {
        const r = refs[def.drv];
        if (!r || Array.isArray(def.key)) return;
        const t = toDay(r.pri, def, { weight, mj }) ?? toDay(r.ai, def, { weight, mj });
        if (!t) return;
        out[def.key] = { name: def.label, target: t, ul: def.ignoreUL ? null : toDay(r.ul, def, { weight, mj }), unit: def.unit };
    });
    return out;
};
