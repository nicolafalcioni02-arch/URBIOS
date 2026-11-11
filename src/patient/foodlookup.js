// Ricerca di un prodotto per codice a barre su Open Food Facts (catalogo pubblico, https). Esce SOLO il codice a barre del prodotto:
// niente cookie, niente referrer, nessun dato dell'utente. Senza rete o prodotto sconosciuto ritorna null (si compila a mano).
import { validEan } from './barcode.js';

export const lookupEan = async (ean) => {
    if (!validEan(ean)) return null;
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000);
    try {
        const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=product_name,brands,quantity,product_quantity,nutriments`, { signal: ac.signal, credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
        if (!r.ok) return null;
        const j = await r.json(), p = j && j.status === 1 && j.product;
        if (!p) return null;
        const g = parseFloat(p.product_quantity), kcal = p.nutriments && parseFloat(p.nutriments['energy-kcal_100g']);
        const name = String(p.product_name || '').trim().slice(0, 80);
        if (!name) return null;
        return { ean, name, brand: String(p.brands || '').split(',')[0].trim().slice(0, 40), g: Number.isFinite(g) && g > 0 ? Math.round(g) : 0, kcal: Number.isFinite(kcal) ? Math.round(kcal) : null };
    } catch (e) { return null; } finally { clearTimeout(t); }
};
