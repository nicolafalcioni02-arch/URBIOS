// Laboratorio: funzioni pure (niente React). Dati in db.lab = { protocolli, reagenti, magazzino, campioni }.

export const LAB_KEYS = ['quaderno', 'protocolli', 'reagenti', 'magazzino', 'campioni', 'articoli'];

export const labOf = (db) => {
    const l = (db && db.lab) || {};
    return Object.fromEntries(LAB_KEYS.map((k) => [k, Array.isArray(l[k]) ? l[k] : []]));
};

export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const today = () => new Date().toISOString().slice(0, 10);
const round6 = (x) => Math.round(x * 1e6) / 1e6;

// conversione tra unità della stessa famiglia (massa, volume); stessa unità o unità vuota = nessuna conversione
const UNITS = { ug: ['m', 1e-6], mg: ['m', 1e-3], g: ['m', 1], kg: ['m', 1e3], ul: ['v', 1e-6], ml: ['v', 1e-3], l: ['v', 1] };
const unitKey = (u) => String(u || '').trim().toLowerCase().replace(/[µμ]/g, 'u');
export const convertQty = (q, from, to) => {
    const a = unitKey(from);
    const b = unitKey(to);
    if (!a || !b || a === b) return q;
    const x = UNITS[a];
    const y = UNITS[b];
    return x && y && x[0] === y[0] ? (q * x[1]) / y[1] : null;
};

const addLog = (art, entry, rif) => {
    const list = (art.storico || []).filter((e) => !(rif && e.rif === rif));
    return [entry, ...list].slice(0, 120);
};

// aggiornamento a mano della quantità: data «aggiornato» e riga nello storico (più cambi nello stesso giorno si uniscono)
const trackManual = (old, rec) => {
    const out = { ...rec, storico: old ? old.storico || [] : [], aggiornato: old ? old.aggiornato : undefined };
    if (!old || String(old.quantita ?? '') === String(rec.quantita ?? '')) return out;
    out.aggiornato = today();
    const last = out.storico[0];
    if (last && last.tipo === 'manuale' && last.g === today()) {
        out.storico = last.da === rec.quantita ? out.storico.slice(1) : [{ ...last, a: rec.quantita }, ...out.storico.slice(1)];
    } else out.storico = addLog(out, { g: today(), tipo: 'manuale', da: old.quantita ?? '', a: rec.quantita ?? '' });
    return out;
};

// scarico automatico: i materiali dell'esperimento collegati a un articolo scalgono la scorta; si ricalcola a ogni salvataggio
// (rec.scaricato = quanto è già stato tolto per articolo, così il totale non si somma due volte)
const deduct = (old, rec, mag) => {
    const prevSc = (old && old.scaricato) || {};
    const want = {};
    (rec.materiali || []).forEach((m) => {
        const art = m.articoloId && mag.find((a) => a.id === m.articoloId);
        const q = num(m.quantita);
        if (!art || q === null) return;
        const c = convertQty(q, m.unita, art.unita);
        if (c !== null) want[art.id] = round6((want[art.id] || 0) + c);
    });
    const ids = [...new Set([...Object.keys(prevSc), ...Object.keys(want)])];
    const newSc = {};
    let list = mag;
    ids.forEach((id) => {
        const art = list.find((a) => a.id === id);
        if (!art) return;
        const had = prevSc[id] || 0;
        const now = want[id] || 0;
        const stock = num(art.quantita);
        if (stock === null) return;
        if (now) newSc[id] = now;
        if (Math.abs(now - had) < 1e-9) return;
        const qty = String(Math.max(0, round6(stock - (now - had)))).replace('.', ',');
        const entry = now ? { g: today(), tipo: 'esperimento', rif: rec.id, titolo: rec.titolo || rec.codice || 'Esperimento', usato: now } : null;
        const upd = { ...art, quantita: qty, aggiornato: today(), storico: entry ? addLog(art, entry, rec.id) : (art.storico || []).filter((e) => e.rif !== rec.id) };
        list = list.map((a) => (a.id === id ? upd : a));
    });
    return { rec: { ...rec, scaricato: newSc }, mag: list };
};

// salva un record (nuovo o modificato) / lo elimina
export const saveRecord = (onUpdateDb, key, rec) =>
    onUpdateDb((prev) => {
        const lab = labOf(prev);
        const old = lab[key].find((x) => x.id === rec.id);
        let next = rec;
        let mag = lab.magazzino;
        if (key === 'magazzino') next = trackManual(old, rec);
        if (key === 'quaderno') ({ rec: next, mag } = deduct(old, rec, mag));
        const list = old ? lab[key].map((x) => (x.id === rec.id ? next : x)) : [...lab[key], next];
        return { ...prev, lab: { ...(prev.lab || {}), [key]: list, ...(key === 'quaderno' ? { magazzino: mag } : {}) } };
    });
export const removeRecord = (onUpdateDb, key, id) =>
    onUpdateDb((prev) => {
        const lab = labOf(prev);
        const old = lab[key].find((x) => x.id === id);
        const mag = key === 'quaderno' && old ? deduct(old, { ...old, materiali: [] }, lab.magazzino).mag : lab.magazzino; // tolto l'esperimento, la scorta torna
        return { ...prev, lab: { ...(prev.lab || {}), [key]: lab[key].filter((x) => x.id !== id), ...(key === 'quaderno' ? { magazzino: mag } : {}) } };
    });

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

// Panoramica della home: tutto ciò che richiede attenzione, calcolato dai dati
export const overview = (lab) => {
    const st = lab.magazzino.map((r) => ({ r, s: stockState(r) }));
    const pick = (id) => st.filter((x) => x.s.id === id).map((x) => x.r);
    return {
        scaduti: pick('scaduto'),
        scorta: pick('scorta'),
        scadenza: pick('scadenza'),
        inCorso: lab.quaderno.filter((r) => r.stato === 'In corso' || r.stato === 'Da ripetere'),
        campioniAperti: lab.campioni.filter((c) => c.stato === 'Ricevuto' || c.stato === 'In lavorazione'),
        bozze: lab.protocolli.filter((p) => p.stato === 'Bozza'),
        daLeggere: lab.articoli.filter((a) => a.lettura === 'Da leggere' || a.lettura === 'In lettura'),
        recenti: [...lab.quaderno].sort((a, b) => String(b.data || '').localeCompare(String(a.data || ''))).slice(0, 5),
    };
};

// ricerca su tutto il laboratorio: [{ key, rec }]
export const searchAll = (lab, sections, q, max = 12) => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return sections.flatMap((sec) => lab[sec.key].filter((r) => sec.search(r).includes(s)).map((rec) => ({ key: sec.key, rec }))).slice(0, max);
};

// Versioni di un protocollo: le copie salvate dal lavoro portano `origineId` (il primo della famiglia)
const rootOf = (r) => r.origineId || r.id;
const vnum = (v) => String(v || '0').split('.').map((n) => +n || 0);
export const versionsOf = (protocolli, rec) => protocolli.filter((p) => rootOf(p) === rootOf(rec)).sort((a, b) => { const x = vnum(a.versione); const y = vnum(b.versione); return (y[0] - x[0]) || ((y[1] || 0) - (x[1] || 0)) || String(b.data || '').localeCompare(String(a.data || '')); });
export const latestVersions = (protocolli) => { const seen = new Set(); return protocolli.filter((p) => (seen.has(rootOf(p)) ? false : (seen.add(rootOf(p)), true))).map((p) => versionsOf(protocolli, p)[0]); };
