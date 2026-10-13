// URBIOS AI — abbina i nomi scritti dall'AI al database (alimenti o esercizi).
// Per gli alimenti i valori (kcal e macro per 100 g) arrivano SEMPRE dal database, mai dall'AI
// (a meno che l'alimento non esista e il professionista accetti esplicitamente i valori stimati).
//
// Il database CREA usa nomi tipo "Pollo, petto, crudo": l'ordine delle parole cambia e c'è sempre lo stato (crudo/cotto).
// Per questo si confrontano le PAROLE, non la frase, e si preferisce la forma "base" (cruda, non elaborata)
// quando chi scrive non specifica la cottura.

const STOP = new Set(['di', 'del', 'della', 'dei', 'delle', 'al', 'alla', 'con', 'e', 'in', 'a', 'da', 'il', 'la', 'le', 'lo', 'i', 'gli', 'un', 'una', 'fresco', 'fresca', 'freschi', 'fresche', 'o']);

export const normalize = (s) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9% ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

// radice minima per assorbire singolare/plurale e genere (mela/mele, pomodoro/pomodori)
const stem = (w) => (w.length > 3 ? w.replace(/[aeio]$/, '') : w);

// sigle e abbreviazioni comuni nei menù
const ALIAS = { evo: 'extra vergine oliva', extravergine: 'extra vergine', evoo: 'extra vergine oliva' };
// espressioni equivalenti (bevande vegetali, nomi commerciali comuni)
const PHRASES = [
    [/\blatte di (soia|mandorla|mandorle|riso|avena|cocco|nocciola)\b/g, '$1 bevanda'],
    [/\bbevanda (?:di|alla|al) (soia|mandorla|riso|avena|cocco)\b/g, '$1 bevanda'],
    [/\bsemi di girasole\b/g, 'girasole'],
    [/\bzucchero semolato\b/g, 'zucchero'],
    [/\bfarina 00\b/g, 'farina frumento tipo 00'],
    [/\bfarina (?:di )?frumento 00\b/g, 'farina frumento tipo 00'],
];
const expand = (s) =>
    PHRASES.reduce((t, [re, to]) => t.replace(re, to), normalize(s))
        .split(' ')
        .map((w) => ALIAS[w] || w)
        .join(' ');
const words = (s) => expand(s).split(' ').filter((w) => w && !STOP.has(w));
const tokens = (s) => words(s).map(stem);

// stati di cottura e preparazioni (radici)
const COOKED = ['cott', 'bollit', 'less', 'griglia', 'arrost', 'frit', 'padella', 'forno', 'vapore', 'microonde', 'stufat'];
const DISH = ['sugo', 'umido', 'frit', 'frittur', 'impanat', 'torron', 'pate', 'risott', 'parmigiana', 'conserv', 'succ', 'farin', 'sott', 'salamoia', 'affumicat', 'surgelat', 'polvere', 'aromatizzat', 'zuppa', 'crema', 'gelato', 'torta', 'biscott', 'merend', 'ricett', 'ripien', 'bevand'];
const PREFERRED = ['gallin', 'vacc', 'extra', 'crud', 'integral'];
const hasStem = (toks, list) => toks.some((t) => list.some((p) => t.startsWith(p)));

export const foodValues = (f) => ({
    kcal: Number(f.energy_kcal ?? f.kcal) || 0,
    p: Number(f.proteins ?? f.p) || 0,
    c: Number(f.available_carbohydrates ?? f.c) || 0,
    f: Number(f.lipids ?? f.f) || 0,
});

export const buildIndex = (foodDB) =>
    (foodDB || []).map((f) => ({ food: f, norm: normalize(f.name), toks: tokens(f.name), raw: words(f.name) }));

const score = (q, e) => {
    if (!q.norm || !e.norm) return 0;
    if (q.norm === e.norm) return 1;
    if (!q.toks.length || !e.toks.length) return 0;
    const inter = q.toks.filter((t) => e.toks.includes(t)).length;
    if (!inter) return 0;
    const dice = (2 * inter) / (q.toks.length + e.toks.length);
    const cover = inter / q.toks.length; // quanto della richiesta è coperto
    const rawExact = q.raw.filter((w) => e.raw.includes(w)).length / q.raw.length; // stessa parola, non solo stessa radice
    let s = 0.55 * dice + 0.35 * cover + 0.08 * rawExact;
    if (e.norm.startsWith(q.norm)) s += 0.06;
    // nel database la prima parola è l'alimento principale ("Latte di vacca…", "Yogurt da latte…"): se la richiesta la contiene è un buon segno
    if (q.toks.includes(e.toks[0])) s += 0.05;

    // chi scrive "Petto di pollo" intende il prodotto base, non un piatto: preferisco il crudo/fresco
    const qCooked = hasStem(q.toks, COOKED);
    const eCooked = hasStem(e.toks, COOKED);
    if (!qCooked && e.toks.some((t) => t.startsWith('crud'))) s += 0.05;
    if (!qCooked && eCooked) s -= 0.05;
    if (qCooked && eCooked) s += 0.05;
    // piatti e preparazioni industriali: non devono battere l'alimento semplice (a meno che non siano richiesti)
    const extraDish = DISH.filter((p) => e.toks.some((t) => t.startsWith(p)) && !q.toks.some((t) => t.startsWith(p))).length;
    s -= 0.12 * Math.min(extraDish, 2);
    // varietà più comuni a parità di resto (uova di gallina, latte di vacca, olio extra vergine, pane/pasta integrale)
    if (PREFERRED.some((p) => e.toks.some((t) => t.startsWith(p)) && q.toks.some((t) => t.startsWith(p)))) s += 0.04;
    else if (e.toks.some((t) => t.startsWith('gallin') || t.startsWith('vacc'))) s += 0.03;
    return Math.max(0, Math.min(s, 0.99));
};

const prep = (name) => ({ norm: normalize(name), toks: tokens(name), raw: words(name) });

// -> { status:'ok'|'check'|'none', best, score, alternatives:[food...] }
export const matchFood = (name, index) => {
    const q = prep(name);
    const ranked = index
        .map((e) => ({ food: e.food, s: score(q, e) }))
        .filter((x) => x.s > 0.3)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5);
    if (!ranked.length) return { status: 'none', best: null, score: 0, alternatives: [] };
    const top = ranked[0];
    const second = ranked[1]?.s ?? 0;
    // "ok" solo se è netto: nome identico, oppure ottimo punteggio senza concorrenti vicini
    const gap = top.s - second;
    const status = top.s === 1 || (top.s >= 0.9 && gap >= 0.1) || (top.s >= 0.8 && gap >= 0.2) ? 'ok' : top.s >= 0.5 ? 'check' : 'none';
    // quanta parte delle parole della richiesta si ritrova nel risultato ("Latte di soia" → "Soia, secca" ne copre metà)
    const bestEntry = index.find((e) => e.food === top.food);
    const coverage = bestEntry && q.toks.length ? q.toks.filter((t) => bestEntry.toks.includes(t)).length / q.toks.length : 0;
    return { status, best: status === 'none' ? null : top.food, score: top.s, coverage, alternatives: ranked.map((x) => x.food) };
};

export const searchFoods = (query, index, limit = 8) => {
    const q = prep(query);
    if (q.norm.length < 2) return [];
    return index
        .map((e) => ({ food: e.food, s: e.norm.includes(q.norm) ? 0.7 + (q.norm.length / e.norm.length) * 0.3 : score(q, e) }))
        .filter((x) => x.s > 0.3)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((x) => x.food);
};
