// Utilità comuni di import/export.
export const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export const clone = (o) => JSON.parse(JSON.stringify(o));

// "pl_pettorale" -> "Pl pettorale"
export const humanize = (key) => {
    const s = String(key).replace(/[._]+/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

// numero da stringa italiana o inglese ("80,5" / "80.5"); NaN se non numerico
export const toNum = (v) => {
    if (v === null || v === undefined || v === '') return NaN;
    if (typeof v === 'number') return v;
    const s = String(v).trim().replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
};

// nome sicuro per file/cartella
export const safeName = (s) =>
    String(s || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9._-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60) || 'senza_nome';

export const todayStamp = () => new Date().toISOString().split('T')[0];

const parseDate = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    const it = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); // gg/mm/aaaa
    if (it) return new Date(Date.UTC(+it[3], +it[2] - 1, +it[1]));
    return null;
};
export const parseAnyDate = parseDate;

// età in anni (con decimali) alla data `atStr`
export const ageAt = (birthStr, atStr) => {
    const b = parseDate(birthStr);
    const a = parseDate(atStr);
    if (!b || !a) return null;
    return (a - b) / (365.2425 * 24 * 3600 * 1000);
};

export const daysBetween = (fromStr, toStr) => {
    const a = parseDate(fromStr);
    const b = parseDate(toStr);
    if (!a || !b) return null;
    return Math.round((b - a) / (24 * 3600 * 1000));
};

// appiattisce un oggetto in { "chiave": scalare, "padre.figlio": scalare }. Salta array/oggetti profondi e le chiavi in `skip`.
export const flattenScalars = (obj, { skip = () => false, maxDepth = 2 } = {}) => {
    const out = {};
    const walk = (o, prefix, depth) => {
        Object.keys(o || {}).forEach((k) => {
            const full = prefix + k;
            if (skip(full, k, depth)) return;
            const v = o[k];
            if (v === null || v === undefined) return;
            if (Array.isArray(v)) {
                if (v.every((x) => typeof x !== 'object')) out[full] = v.join(' | ');
            } else if (typeof v === 'object') {
                if (depth + 1 < maxDepth) walk(v, full + '.', depth + 1);
            } else out[full] = v;
        });
    };
    walk(obj, '', 0);
    return out;
};
