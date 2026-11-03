// Laboratorio: funzioni pure (niente React). Dati in db.lab = { protocolli, reagenti, magazzino, campioni }.

export const LAB_KEYS = ['quaderno', 'protocolli', 'reagenti', 'magazzino', 'campioni', 'articoli'];

export const labOf = (db) => {
    const l = (db && db.lab) || {};
    return Object.fromEntries(LAB_KEYS.map((k) => [k, Array.isArray(l[k]) ? l[k] : []]));
};

export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// salva un record (nuovo o modificato) / lo elimina
export const saveRecord = (onUpdateDb, key, rec) =>
    onUpdateDb((prev) => {
        const lab = labOf(prev);
        const list = lab[key].some((x) => x.id === rec.id) ? lab[key].map((x) => (x.id === rec.id ? rec : x)) : [...lab[key], rec];
        return { ...prev, lab: { ...(prev.lab || {}), [key]: list } };
    });
export const removeRecord = (onUpdateDb, key, id) =>
    onUpdateDb((prev) => ({ ...prev, lab: { ...(prev.lab || {}), [key]: labOf(prev)[key].filter((x) => x.id !== id) } }));

export const num = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : null;
};

const DAY = 86400000;
export const daysTo = (iso) => {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / DAY);
};
export const fmtDay = (iso) => (iso && !Number.isNaN(new Date(iso).getTime()) ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

// stato di una voce di magazzino: scaduto, in scadenza (30 giorni), sotto scorta, ok
export const WARN_DAYS = 30;
export const stockState = (r) => {
    const d = daysTo(r.scadenza);
    if (d !== null && d < 0) return { id: 'scaduto', label: 'Scaduto', tone: 'bad' };
    const q = num(r.quantita);
    const min = num(r.sogliaMin);
    if (q !== null && min !== null && q <= min) return { id: 'scorta', label: 'Sotto scorta', tone: 'warn' };
    if (d !== null && d <= WARN_DAYS) return { id: 'scadenza', label: `Scade tra ${d} g`, tone: 'warn' };
    return { id: 'ok', label: 'Disponibile', tone: 'ok' };
};

// quantità scalata per un nuovo volume finale (ricettario reagenti). factor = voluto / ricetta
export const scaleFactor = (rec, target) => {
    const base = num(rec.volumeFinale);
    const want = num(target);
    return base && want ? want / base : 1;
};
export const fmtNum = (x) => {
    if (!Number.isFinite(x)) return '';
    const a = Math.abs(x);
    const r = a >= 100 ? Math.round(x) : a >= 10 ? Math.round(x * 10) / 10 : Math.round(x * 1000) / 1000;
    return String(r).replace('.', ',');
};
export const scaledQty = (q, f) => {
    const x = num(q);
    return x === null || f === 1 ? String(q ?? '') : fmtNum(x * f);
};

// Calcoli di banco
export const dilution = ({ c1, v1, c2, v2 }) => {
    const a = [c1, v1, c2, v2].map(num);
    const empty = a.map((x, i) => (x === null ? i : -1)).filter((i) => i >= 0);
    if (empty.length !== 1) return null;
    const [C1, V1, C2, V2] = a;
    const i = empty[0];
    const v = i === 0 ? (C2 * V2) / V1 : i === 1 ? (C2 * V2) / C1 : i === 2 ? (C1 * V1) / V2 : (C1 * V1) / C2;
    return Number.isFinite(v) ? { field: ['c1', 'v1', 'c2', 'v2'][i], value: v } : null;
};
// massa (g) = molarità (mol/L) × volume (L) × PM (g/mol)
export const massForMolar = ({ molarita, volume, pm }) => {
    const m = num(molarita), v = num(volume), p = num(pm);
    return m !== null && v !== null && p !== null ? m * v * p : null;
};
