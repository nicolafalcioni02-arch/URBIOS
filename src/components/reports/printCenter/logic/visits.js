// Visite del paziente nel formato che serve ai documenti: { id, date, label, data } con data = misure + risultati.
// 'draft' è la visita in corso (Nuova visita), se ha almeno qualche misura.

export const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};
export const fmt = (v, d = 1) => (v && Number.isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('it-IT', { maximumFractionDigits: d }) : '');
export const fmtDate = (d, style = 'long') => {
    const x = d ? new Date(d) : new Date();
    if (Number.isNaN(x.getTime())) return '';
    return style === 'short' ? x.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : x.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};
export const todayIso = () => new Date().toISOString().slice(0, 10);

export const freshPatient = (db, patient) => (db?.pazienti || []).find((p) => String(p.id) === String(patient?.id)) || patient || {};

const draftHasData = (d) => !!d && ['peso', 'altezza', 'biva_rz', 'pl_tricipite', 'cm_vita_min', 'valutazione_report'].some((k) => String(d[k] ?? '').trim());

export const visitsOf = (p, draft) => {
    const saved = [...(p.visite || [])]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .map((v) => ({ id: String(v.id), date: v.data, label: `Visita del ${fmtDate(v.data, 'short')}`, data: { ...(v.dettagli || {}), peso: v.peso ?? v.dettagli?.peso, data: v.data }, visit: v }));
    if (draftHasData(draft)) return [{ id: 'draft', date: todayIso(), label: 'Visita in corso (oggi)', data: { ...draft, data: todayIso() } }, ...saved];
    return saved;
};

export const findVisit = (p, draft, id) => {
    const all = visitsOf(p, draft);
    return all.find((v) => v.id === String(id)) || all[0] || null;
};

export const ageAt = (p, date) => {
    if (!p.dataNascita) return null;
    const n = new Date(p.dataNascita);
    const at = date ? new Date(date) : new Date();
    if (Number.isNaN(n.getTime())) return null;
    let e = at.getFullYear() - n.getFullYear();
    if (at.getMonth() < n.getMonth() || (at.getMonth() === n.getMonth() && at.getDate() < n.getDate())) e--;
    return e;
};

export const sexOf = (p) => (p.sesso && String(p.sesso).toUpperCase().startsWith('F') ? 'F' : 'M');

// indici principali di una visita (vuoti se mancano i dati)
export const keyFigures = (d) => {
    const peso = num(d.peso);
    const alt = num(d.altezza);
    const rA = d.risultati_metodo_A || {};
    const rB = d.risultati_metodo_B || {};
    const fm = num(rA.fm_percent) || num(rB.fm_percent);
    const ffm = num(rA.ffm_kg) || num(rB.ffm_kg) || (fm && peso ? peso - (peso * fm) / 100 : 0);
    const rz = num(d.biva_rz);
    const xc = num(d.biva_xc);
    const vita = num(d.cm_vita_min);
    return {
        peso,
        altezza: alt,
        bmi: peso && alt ? peso / (alt / 100) ** 2 : 0,
        fm,
        fmKg: fm && peso ? (peso * fm) / 100 : 0,
        ffm,
        pha: rz > 0 && xc > 0 ? (Math.atan2(xc, rz) * 180) / Math.PI : 0,
        vita,
        fianchi: num(d.cm_fianchi_max),
        whtr: vita && alt ? vita / alt : 0,
    };
};

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const multiline = (s) => esc(s).replace(/\n/g, '<br>');
