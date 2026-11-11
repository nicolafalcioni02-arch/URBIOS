// Ricerca di un prodotto per codice a barre su Open Food Facts (catalogo pubblico, https). Esce SOLO il codice a barre del prodotto:
// niente cookie, niente referrer, nessun dato dell'utente. Senza rete o prodotto sconosciuto ritorna null (si compila a mano).
import { validEan } from './barcode.js';

export const lookupEan = async (ean) => {
    if (!validEan(ean)) return null;
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000);
    try {
        const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=product_name,brands,quantity,product_quantity,nutriments,nutriscore_grade,nova_group,ingredients_text_it,ingredients_text,allergens_tags,origins,categories`, { signal: ac.signal, credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
        if (!r.ok) return null;
        const j = await r.json(), p = j && j.status === 1 && j.product;
        if (!p) return null;
        const g = parseFloat(p.product_quantity), kcal = p.nutriments && parseFloat(p.nutriments['energy-kcal_100g']);
        const name = String(p.product_name || '').trim().slice(0, 80);
        if (!name) return null;
        const n = p.nutriments || {}, num = (k) => { const v = parseFloat(n[k]); return Number.isFinite(v) ? Math.round(v * 10) / 10 : null; };
        const txt = (v, m) => String(v || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, m);
        const ns = String(p.nutriscore_grade || '').toLowerCase(), nova = parseInt(p.nova_group, 10);
        const info = {
            ns: /^[a-e]$/.test(ns) ? ns.toUpperCase() : '', nova: nova >= 1 && nova <= 4 ? nova : 0,
            fat: num('fat_100g'), sat: num('saturated-fat_100g'), carb: num('carbohydrates_100g'), sug: num('sugars_100g'), fib: num('fiber_100g'), pro: num('proteins_100g'), salt: num('salt_100g'),
            ing: txt(String(p.ingredients_text_it || p.ingredients_text || '').replace(/_/g, ''), 600),
            all: (Array.isArray(p.allergens_tags) ? p.allergens_tags : []).slice(0, 12).map((a) => txt(String(a).replace(/^[a-z]{2}:/, '').replace(/-/g, ' '), 30)).filter(Boolean),
            orig: txt(String(p.origins || '').replace(/(^|,\s*)[a-z]{2}:/g, '$1'), 80), cat: txt(String(p.categories || '').split(',').slice(-1)[0], 60), qty: txt(p.quantity, 30)
        };
        return { ean, name, info, brand: String(p.brands || '').split(',')[0].trim().slice(0, 40), g: Number.isFinite(g) && g > 0 ? Math.round(g) : 0, kcal: Number.isFinite(kcal) ? Math.round(kcal) : null };
    } catch (e) { return null; } finally { clearTimeout(t); }
};
