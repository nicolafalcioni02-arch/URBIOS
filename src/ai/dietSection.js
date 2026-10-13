// URBIOS AI — sezione DIETA: contesto clinico, blocco di prompt, lettura della risposta, costruzione del piano.
// Principio: l'AI decide COSA e QUANTO (alimenti, grammi, LAF, macro %). Il software calcola TUTTO il resto
// (fabbisogno, kcal e macro degli alimenti dal database, totali). Così i numeri non dipendono da un'AI che sbaglia i conti.
import { calculateRMR } from '../components/patient/diet/logic/clinicalFormulas';
import { foodValues, matchFood, normalize } from './foodMatcher';

const genId = () => 'id-' + Math.random().toString(36).slice(2, 11);
const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return isFinite(n) ? n : null;
};

export const DEFAULT_DISTRIBUTION = [
    { name: 'Colazione', value: 20 },
    { name: 'Spuntino Mattina', value: 10 },
    { name: 'Pranzo', value: 35 },
    { name: 'Spuntino Pomeriggio', value: 10 },
    { name: 'Cena', value: 25 },
];

// Dati antropometrici per il calcolo: bozza visita, altrimenti ultima visita salvata.
export const dietContext = (patient, visitDraft) => {
    const last = patient?.visite?.find((v) => v.dettagli && (v.dettagli.altezza || v.dettagli.peso || v.peso))?.dettagli || {};
    // le visite "Solo Dieta" hanno un peso segnaposto (70): non è una misura
    const lastPeso = patient?.visite?.find((v) => !String(v.note || '').includes('Solo Dieta'))?.peso;
    const pick = (k, alt) => num(visitDraft?.[k]) ?? num(last[k]) ?? num(alt);

    let age = null;
    if (patient?.dataNascita) {
        const d = new Date(patient.dataNascita);
        if (!isNaN(d)) {
            const t = new Date();
            age = t.getFullYear() - d.getFullYear();
            if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) age--;
        }
    }
    const calc = {
        sex: (patient?.sesso || 'M').toUpperCase() === 'F' ? 'F' : 'M',
        age: age ?? '',
        weight: pick('peso', lastPeso) ?? '',
        height: pick('altezza') ?? '',
        waist: pick('cm_vita_min') ?? '',
        hip: pick('cm_fianchi_max') ?? '',
        wrist: pick('dm_polso') ?? '',
        fatPct: '',
        weightTarget: 'actual',
        formula: 'mifflin',
    };
    const ok = calc.weight && calc.height && calc.age !== '';
    const rmr = ok ? Math.round(calculateRMR(calc)) : null;
    return { calc, rmr };
};

// ---------------------------------------------------------------- PROMPT
export const foodListText = (foodDB) => {
    const byCat = {};
    (foodDB || []).forEach((f) => {
        const c = f.category || 'Altro';
        (byCat[c] ||= []).push(f.name);
    });
    return Object.entries(byCat)
        .map(([c, names]) => `${c}: ${names.join('; ')}`)
        .join('\n');
};

export const dietPromptBlock = ({ ctx, foodDB, opts }) => {
    const { rmr, calc } = ctx;
    const fixed = opts.fixed;
    const energy = fixed
        ? `L'OBIETTIVO È GIÀ IMPOSTATO in URBIOS e non va cambiato: fabbisogno ${fixed.kcal} kcal/die, LAF ${fixed.laf}, carboidrati ${fixed.macro.c}% / proteine ${fixed.macro.p}% / grassi ${fixed.macro.f}%. Riporta esattamente questi valori in "laf" e "macro_pct". Il menù di ogni giorno deve avvicinarsi a ${fixed.kcal} kcal.`
        : rmr
        ? `Metabolismo basale calcolato da URBIOS (Mifflin-St Jeor): ${rmr} kcal. Il fabbisogno giornaliero sarà ${rmr} × LAF che scegli tu. Il tuo menù deve avvicinarsi a quel valore.`
        : 'Peso, altezza o età mancano: scegli comunque un LAF adeguato e costruisci un menù plausibile per l’adulto medio; il software calcolerà le kcal quando i dati saranno completi.';

    const foods = opts.includeFoodList
        ? `\nDATABASE ALIMENTI DI URBIOS (usa PREFERIBILMENTE questi nomi, scritti identici, perché così vengono riconosciuti con certezza):\n${foodListText(foodDB)}\n`
        : '\nSe un alimento non è tra quelli noti a URBIOS verrà cercato per somiglianza: usa nomi comuni, semplici e italiani (es. "Petto di pollo", "Riso basmati", "Olio extravergine di oliva"), senza marche né aggettivi superflui.\n';

    return `
SEZIONE "dieta" — regole specifiche:
- ${energy}
- "laf" è il livello di attività fisica (numero tra 1.2 e 2.4: 1.2 sedentario, 1.4 lieve, 1.55 moderato, 1.7 attivo, 1.9+ molto attivo).
- "macro_pct": percentuali di energia da carboidrati, proteine, grassi; devono sommare 100.
- "pasti_distribuzione": ${fixed ? `usa ESATTAMENTE questi pasti e queste percentuali: ${fixed.meals.map((m) => `${m.name} ${m.value}%`).join(', ')}.` : "i pasti della giornata con la percentuale di energia di ciascuno; la somma deve essere 100. Rispetta le abitudini emerse nell'intervista (orari, spuntini)."}
- "giorni": ESATTAMENTE ${opts.days} ${opts.days === 1 ? 'giorno tipo' : 'giorni diversi'}. In ogni giorno usa gli stessi nomi di pasto di "pasti_distribuzione".
- Ogni alimento ha "nome" e "grammi" (peso a crudo/come acquistato, salvo che l'alimento sia solitamente pesato cotto). NON scrivere kcal né macro: li calcola URBIOS.
- Se sei sicuro che un alimento NON sia nel database e serve, puoi aggiungere "valori_100g": {"kcal":..,"p":..,"c":..,"f":..} (per 100 g, valori realistici). Altrimenti omettili.
- Rispetta ALLERGIE, INTOLLERANZE, patologie, farmaci, preferenze e restrizioni emerse. In caso di dubbio scegli l'opzione più sicura e segnalalo in "avvisi".
- Porzioni realistiche da persona reale, varietà tra i giorni, cucina italiana, semplicità di preparazione adeguata al tempo disponibile.
- "integratori": ${opts.supplements ? 'consiglia solo integratori sensati e supportati da evidenze, ciascuno con "nome", "dose", "momento" (quando assumerlo) e "motivo". Evita quelli con possibili interazioni con i farmaci indicati; se serve il parere del medico scrivilo in "avvisi". Se non servono, lascia l’elenco vuoto.' : 'lascia l’elenco vuoto.'}
- "consigli": 3-6 indicazioni pratiche brevi per il paziente (idratazione, cottura, abitudini, gestione di eventuali sgarri).
${foods}`;
};

export const dietTemplate = (opts) => ({
    laf: 1.55,
    macro_pct: { carboidrati: 50, proteine: 20, grassi: 30 },
    pasti_distribuzione: [
        { nome: 'Colazione', pct: 20 },
        { nome: 'Pranzo', pct: 40 },
        { nome: 'Cena', pct: 40 },
    ],
    giorni: [{ titolo: 'Giorno 1', pasti: [{ nome: 'Colazione', alimenti: [{ nome: '<alimento>', grammi: 0 }] }] }],
    integratori: opts.supplements ? [{ nome: '<nome>', dose: '<dose>', momento: '<quando>', motivo: '<perché>' }] : [],
    consigli: ['<consiglio>'],
});

// ---------------------------------------------------------------- LETTURA
// Porta a somma esatta 100 con numeri interi (metodo dei resti più grandi).
const toHundred = (values) => {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum <= 0) return values.map(() => 0);
    const raw = values.map((v) => (v / sum) * 100);
    const base = raw.map(Math.floor);
    let left = 100 - base.reduce((a, b) => a + b, 0);
    raw.map((r, i) => ({ i, r: r - base[i] }))
        .sort((a, b) => b.r - a.r)
        .forEach(({ i }) => {
            if (left-- > 0) base[i]++;
        });
    return base;
};

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] !== undefined) return o[k];
    return undefined;
};

export const parseDiet = (raw, { foodIndex, ctx }) => {
    const out = { ok: false, warnings: [], laf: 1.55, macro: { c: 50, p: 20, f: 30 }, distribution: [], days: [], supplements: [], advice: [], rmr: ctx.rmr };
    if (!raw || typeof raw !== 'object') {
        out.warnings.push('La sezione "dieta" è vuota.');
        return out;
    }

    // LAF
    let laf = num(raw.laf);
    if (laf === null) out.warnings.push('LAF mancante: uso 1.55 (moderato). Controllalo.');
    else if (laf < 1.2 || laf > 2.4) {
        out.warnings.push(`LAF ${laf} fuori scala: uso ${Math.min(2.4, Math.max(1.2, laf))}.`);
        laf = Math.min(2.4, Math.max(1.2, laf));
    }
    out.laf = laf ?? 1.55;

    // Macro
    const m = raw.macro_pct || {};
    const mc = [num(pick(m, 'carboidrati', 'c')), num(pick(m, 'proteine', 'p')), num(pick(m, 'grassi', 'f'))];
    if (mc.every((x) => x !== null && x >= 0)) {
        const [c, p, f] = toHundred(mc);
        out.macro = { c, p, f };
        if (Math.abs(mc[0] + mc[1] + mc[2] - 100) > 1) out.warnings.push('Le percentuali dei macro non sommavano 100: le ho riproporzionate.');
    } else out.warnings.push('Macro mancanti o non validi: uso 50/20/30.');

    // Distribuzione pasti
    const dist = Array.isArray(raw.pasti_distribuzione) ? raw.pasti_distribuzione.filter((d) => d && String(pick(d, 'nome', 'name') || '').trim()) : [];
    let names = dist.map((d) => String(pick(d, 'nome', 'name')).trim());
    let vals = dist.map((d) => Math.max(0, num(pick(d, 'pct', 'valore', 'value')) ?? 0));
    if (!names.length) {
        names = DEFAULT_DISTRIBUTION.map((d) => d.name);
        vals = DEFAULT_DISTRIBUTION.map((d) => d.value);
        out.warnings.push('Distribuzione dei pasti mancante: uso quella standard a 5 pasti.');
    }

    // Giorni
    const rawDays = Array.isArray(raw.giorni) ? raw.giorni : [];
    const mealIndexByName = () => Object.fromEntries(names.map((n, i) => [normalize(n), i]));
    rawDays.forEach((d, di) => {
        const meals = (Array.isArray(d?.pasti) ? d.pasti : []).map((meal, mi) => {
            let title = String(pick(meal, 'nome', 'name') || '').trim() || names[mi] || `Pasto ${mi + 1}`;
            const idx = mealIndexByName()[normalize(title)];
            if (idx === undefined) {
                names.push(title); // il pasto esiste nel giorno ma non nella distribuzione: lo aggiungo a 0%
                vals.push(0);
                out.warnings.push(`Il pasto "${title}" non era nella distribuzione: aggiunto con 0%. Regola le percentuali nel setup.`);
            }
            const items = (Array.isArray(meal?.alimenti) ? meal.alimenti : [])
                .map((it, ii) => {
                    const name = String(pick(it, 'nome', 'name') || '').trim();
                    const grams = num(pick(it, 'grammi', 'g', 'peso'));
                    if (!name || grams === null || grams <= 0) return null;
                    const match = matchFood(name, foodIndex);
                    const v = it.valori_100g || it.valori || null;
                    const aiValues = v && num(v.kcal) !== null ? { kcal: num(v.kcal) || 0, p: num(v.p) || 0, c: num(v.c) || 0, f: num(v.f) || 0 } : null;
                    return {
                        key: `${di}.${mi}.${ii}`,
                        aiName: name,
                        grams: Math.round(grams * 10) / 10,
                        match,
                        aiValues,
                        warn: grams > 600 ? `${grams} g sembra molto: controlla` : null,
                    };
                })
                .filter(Boolean);
            return { title, items };
        });
        if (meals.length) out.days.push({ title: String(d.titolo || d.title || `Giorno ${di + 1}`), meals });
    });
    if (!out.days.length) out.warnings.push('Nessun giorno di menù valido nella risposta.');

    out.distribution = toHundred(vals).map((value, i) => ({ id: i + 1, name: names[i], value }));
    // se tutti i valori erano 0 (caso limite) si torna al default
    if (out.distribution.every((d) => d.value === 0)) out.distribution = out.distribution.map((d, i) => ({ ...d, value: i === 0 ? 100 : 0 }));

    out.supplements = (Array.isArray(raw.integratori) ? raw.integratori : [])
        .map((s) => ({
            id: genId(),
            name: String(pick(s, 'nome', 'name') || '').trim(),
            dose: String(pick(s, 'dose') || '').trim(),
            when: String(pick(s, 'momento', 'quando') || '').trim(),
            why: String(pick(s, 'motivo', 'perche') || '').trim(),
        }))
        .filter((s) => s.name && !s.name.startsWith('<'));
    out.advice = (Array.isArray(raw.consigli) ? raw.consigli : []).map((c) => String(c).trim()).filter((c) => c && !c.startsWith('<'));

    out.ok = out.days.length > 0;
    return out;
};

// Alimento risolto: { type:'db', food } | { type:'ai', values } | { type:'skip' }
export const defaultChoice = (item) => {
    // un abbinamento a metà (copre meno del 60% delle parole scritte) non si accetta in automatico: lo sceglie il professionista
    if (item.match.best && item.match.status !== 'none' && (item.match.coverage ?? 1) >= 0.6) return { type: 'db', food: item.match.best };
    if (item.aiValues) return { type: 'ai', values: item.aiValues };
    return { type: 'skip' };
};

const valuesOf = (choice) => (choice.type === 'db' ? foodValues(choice.food) : choice.type === 'ai' ? choice.values : null);

export const dayKcal = (day, choices, scale = 1) =>
    day.meals.reduce(
        (tot, meal) =>
            tot +
            meal.items.reduce((s, it) => {
                const v = valuesOf(choices[it.key] || defaultChoice(it));
                return v ? s + (v.kcal * it.grams * scale) / 100 : s;
            }, 0),
        0
    );

const round5 = (g) => Math.max(5, Math.round(g / 5) * 5);

// Costruisce ciò che va scritto nella visita.
export const buildDietPayload = ({ parsed, choices, ctx, align }) => {
    const calc = {
        ...ctx.calc,
        laf: parsed.laf,
        macroTargets: parsed.macro,
        distribution: parsed.distribution,
        matrixMode: 'global',
        activeMatrixDayId: null,
        dailyConfigs: {},
    };
    const tdee = ctx.rmr ? Math.round(ctx.rmr * parsed.laf * (1 + (Number(parsed.adjustPct) || 0) / 100)) : 0;
    const configured = tdee > 0;
    const notes = [];
    const weights = {};

    const days = parsed.days.map((d) => {
        let scale = 1;
        if (align && configured) {
            const k = dayKcal(d, choices);
            if (k > 0) {
                const f = tdee / k;
                if (f > 0.5 && f < 1.8 && Math.abs(f - 1) > 0.03) scale = f;
                else if (Math.abs(f - 1) > 0.03) notes.push(`${d.title}: kcal troppo distanti dal fabbisogno (${Math.round(k)} vs ${tdee}), quantità lasciate come scritte dall'AI.`);
            }
        }
        return {
            id: genId(),
            title: d.title,
            targets: configured ? { kcal: tdee, ...parsed.macro } : undefined,
            meals: parsed.distribution.map((dm) => {
                const meal = d.meals.find((m) => normalize(m.title) === normalize(dm.name));
                return {
                    id: genId(),
                    title: dm.name,
                    items: (meal?.items || [])
                        .map((it) => {
                            const choice = choices[it.key] || defaultChoice(it);
                            const v = valuesOf(choice);
                            if (!v) return null;
                            const grams = scale === 1 ? it.grams : round5(it.grams * scale);
                            weights[it.key] = grams;
                            return {
                                id: genId(),
                                name: choice.type === 'db' ? choice.food.name : it.aiName,
                                weight: grams,
                                kcal: v.kcal,
                                p: v.p,
                                c: v.c,
                                f: v.f,
                                ...(choice.type === 'ai' && { aiEstimated: true }),
                            };
                        })
                        .filter(Boolean),
                };
            }),
        };
    });

    const payload = {
        diet_plan_data: days,
        diet_supplements: parsed.supplements,
        diet_notes: parsed.advice,
    };
    if (configured) {
        payload.diet_calc_data = calc;
        payload.diet_targets = { kcal: tdee, ...parsed.macro, isConfigured: true };
    }
    return { payload, notes, tdee, configured, weights };
};
