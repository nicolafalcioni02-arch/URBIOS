// Prontuario alimenti: i 900 del database del professionista (tabelle CREA), solo nome e kcal per 100 g (data/foods.json, generato da
// src/components/patient/diet/data/foodDB.json). Il paziente sceglie l'alimento e i grammi, le kcal le calcola l'app.
// Nomi semplici per il paziente ("Mela", "Pizza margherita") che puntano a una voce esatta del database; compaiono per primi nella ricerca.
const FRIENDLY = "Pane|Pane bianco;Pane integrale|Pane di tipo integrale;Fette biscottate|Fette biscottate;Biscotti|Biscotti, secchi;Fiocchi d'avena|Fiocchi d'avena;Pasta (cotta)|Pasta di semola, cotta, bollita;Pasta integrale (cotta)|Pasta di semola, integrale, cotta, bollita;Riso (cotto)|Riso, brillato, cotto, bollito;Riso integrale (cotto)|Riso, integrale, cotto, bollito;Pizza margherita|Pizza Napoletana Margherita STG;Patate arrosto|Patate, cotte, arrosto;Patate fritte|Patate, fritte;Petto di pollo (cotto)|Pollo, petto, cotto, in padella;Prosciutto cotto|Prosciutto cotto;Prosciutto crudo|Prosciutto crudo DOP, di Parma;Bresaola|Bresaola della Valtellina IGP;Tonno al naturale|Tonno in salamoia, sgocciolato;Tonno sott'olio|Tonno sott'olio, sgocciolato;Salmone|Salmone, fresco;Hamburger|Hamburger, fast food;Uovo|Uova di gallina, intero;Albume|Uova di gallina, albume;Latte intero|Latte di vacca, pastorizzato, intero;Latte parzialmente scremato|Latte di vacca, pastorizzato, parzialmente scremato;Yogurt bianco|Yogurt, da latte intero;Yogurt greco 0%|Yogurt greco, 0% lipidi;Parmigiano|Parmigiano Reggiano DOP;Mozzarella|Mozzarella di vacca;Ricotta|Ricotta di vacca;Burro|Burro;Olio d'oliva|Olio di oliva;Mela|Mele, fresche, golden;Banana|Banane, fresche;Fragole|Fragole, fresche;Kiwi|Kiwi, freschi;Uva|Uva, fresca;Carote|Carote, crude;Zucchine|Zucchine, crude;Spinaci|Spinaci, crudi;Lattuga|Lattuga, fresca;Cetrioli|Cetrioli, freschi;Pomodori|Pomodori, da insalata, freschi;Ceci (cotti)|Ceci, secchi, cotti, bolliti;Lenticchie (cotte)|Lenticchie, secche, cotte, bollite;Fagioli (cotti)|Fagioli, cotti, bolliti;Noci|Noci;Mandorle|Mandorle dolci, secche;Olive verdi|Olive, verdi;Cioccolato fondente|Cioccolato, fondente;Miele|Miele;Zucchero|Zucchero, saccarosio;Birra|Bevanda alcolica, Birra chiara";
let cache = null;
export const loadFoods = () => (cache ? Promise.resolve(cache) : import('../data/foods.json').then((m) => {
    const db = new Map(m.default), fr = FRIENDLY.split(';').map((s) => s.split('|')).filter(([, d]) => db.has(d)).map(([n, d]) => ({ n, k: db.get(d), f: true, d }));
    const hide = new Set(fr.map((x) => x.d));
    return (cache = [...fr, ...m.default.filter(([n]) => !hide.has(n)).map(([n, k]) => ({ n, k }))]);
}));
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const findFoods = (list, q, max = 6) => {
    const w = norm(q).split(/\s+/).filter(Boolean);
    if (!w.length || !list) return [];
    // 0: parola quasi uguale (mela ~ mele), 1: parola che inizia così, 2: contenuto in qualche punto
    const one = (words, x) => { const s = x.length > 3 ? x.slice(0, -1) : x; let m = 3; for (const k of words) { if (k.startsWith(s) && k.length <= x.length + 1) return 0; if (k.startsWith(x)) m = Math.min(m, 1); else if (k.includes(x)) m = Math.min(m, 2); } return m; };
    const res = [];
    for (const f of list) { const words = norm(f.n).split(/[^a-z0-9]+/).filter(Boolean); let s = 0, ok = true; for (const x of w) { const m = one(words, x); if (m > 2) { ok = false; break; } s += m; } if (ok) res.push([s, words[0] && w[0] && one(words.slice(0, 1), w[0]) < 1 ? 0 : 1, f.n.length, f]); }
    return res.sort((a, b) => (a[3].f ? 0 : 1) - (b[3].f ? 0 : 1) || a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).slice(0, max).map((r) => r[3]);
};
// Alimento non trovato: stima prudente per categoria, scelta dal paziente.
export const GENERIC = [{ n: 'Piatto di verdure', k: 40 }, { n: 'Piatto di carne o pesce', k: 180 }, { n: 'Piatto di pasta o riso', k: 160 }, { n: 'Dolce', k: 380 }, { n: 'Snack salato', k: 450 }];


// Prodotti scansionati dal paziente (Spesa): valgono come alimenti, con i macro per 100 g, e compaiono per primi nella ricerca.
export const prodFoods = (prods) => Object.values(prods || {}).filter((x) => x && x.n).map((x) => ({ n: x.br ? x.n + ' · ' + x.br : x.n, k: x.kcal || 0, f: true, mm: { p: x.p || 0, c: x.c || 0, f: x.f || 0 }, prod: true }));
