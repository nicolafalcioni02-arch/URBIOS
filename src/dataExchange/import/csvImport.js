// Dal CSV ai dati dell'archivio. Riconosce il tipo di tabella dalle intestazioni.
import { parseCsv } from '../csv';
import { toNum } from '../util';

const DERIVED_VISIT_COLS = new Set(['paziente_id', 'visita_id', 'sesso', 'fascia_eta', 'anno_nascita', 'eta_alla_visita', 'bmi_calcolato', 'eta']);
const DERIVED_PATIENT_COLS = new Set(['n_visite', 'ultima_visita']);

// "80,5" -> "80.5" (solo se è davvero un numero); il resto resta com'è
const fixDecimal = (s) => (/^-?\d+,\d+$/.test(String(s).trim()) ? String(s).trim().replace(',', '.') : String(s));
const asId = (s) => (/^\d{1,15}$/.test(String(s).trim()) ? Number(s) : String(s).trim());

export const detectCsvKind = (headers) => {
    const h = new Set(headers.map((x) => x.toLowerCase()));
    if (h.has('paziente_id') && (h.has('data') || h.has('peso') || h.has('giorni_da_prima_visita'))) return 'visite';
    if (h.has('titolo') && h.has('equazione')) return 'formule';
    if (h.has('name') && (h.has('kcal') || h.has('energy_kcal'))) return 'alimenti';
    if ((h.has('name') || h.has('esercizio')) && (h.has('group') || h.has('gruppo'))) return 'esercizi';
    if (h.has('nome') || h.has('cognome') || (h.has('id') && h.has('sesso'))) return 'pazienti';
    return 'sconosciuto';
};

export const csvToPatients = (rows) =>
    rows.map((r) => {
        const p = {};
        Object.keys(r).forEach((k) => {
            const v = String(r[k]).trim();
            if (v === '' || DERIVED_PATIENT_COLS.has(k)) return;
            p[k] = v;
        });
        if (p.id === undefined) p.id = '';
        p.visite = [];
        if (!p.status) p.status = 'Attivo';
        return p;
    });

export const csvToVisitPatients = (rows) => {
    const byPatient = new Map();
    rows.forEach((r) => {
        const pid = String(r.paziente_id || '').trim();
        if (!pid) return;
        const v = { dettagli: {} };
        v.id = r.visita_id !== undefined && String(r.visita_id).trim() !== '' ? asId(r.visita_id) : Date.now() + byPatient.size;
        if (r.data) v.data = String(r.data).trim();
        const peso = toNum(fixDecimal(r.peso));
        if (Number.isFinite(peso)) v.peso = peso;
        if (r.note) v.note = String(r.note);
        if (r.stato_dieta) v.dietStatus = String(r.stato_dieta);
        if (r.giorni_da_prima_visita !== undefined && r.giorni_da_prima_visita !== '') v.giorni_da_prima_visita = Number(r.giorni_da_prima_visita);
        Object.keys(r).forEach((k) => {
            if (['data', 'peso', 'note', 'stato_dieta', 'giorni_da_prima_visita'].includes(k) || DERIVED_VISIT_COLS.has(k)) return;
            const raw = String(r[k]).trim();
            if (raw === '') return;
            const val = fixDecimal(raw);
            if (k.includes('.')) {
                const [a, b] = k.split('.');
                v.dettagli[a] = v.dettagli[a] || {};
                v.dettagli[a][b] = val;
            } else v.dettagli[k] = val;
        });
        if (v.peso !== undefined && v.dettagli.peso === undefined) v.dettagli.peso = String(v.peso);
        if (!byPatient.has(pid)) byPatient.set(pid, { id: pid, visite: [], _stub: true });
        byPatient.get(pid).visite.push(v);
    });
    return [...byPatient.values()];
};

const numericCols = (rows, skip) => {
    const nums = new Set();
    if (!rows.length) return nums;
    Object.keys(rows[0]).forEach((k) => {
        if (skip.has(k)) return;
        const vals = rows.map((r) => String(r[k]).trim()).filter((x) => x !== '');
        if (vals.length && vals.every((x) => Number.isFinite(toNum(fixDecimal(x))))) nums.add(k);
    });
    return nums;
};

export const csvToFoods = (rows) => {
    const nums = numericCols(rows, new Set(['name', 'category']));
    return rows
        .filter((r) => String(r.name || '').trim() !== '')
        .map((r) => {
            const o = {};
            Object.keys(r).forEach((k) => {
                const v = String(r[k]).trim();
                if (v === '') return;
                o[k] = nums.has(k) ? toNum(fixDecimal(v)) : v;
            });
            return o;
        });
};

export const csvToExercises = (rows) =>
    rows
        .map((r) => ({
            name: String(r.name || r.esercizio || '').trim(),
            group: String(r.group || r.gruppo || '').trim(),
            type: String(r.type || r.tipo || '').trim(),
        }))
        .filter((x) => x.name);

export const csvToFormulas = (rows) =>
    rows
        .filter((r) => r.titolo && r.equazione)
        .map((r, i) => ({
            id: Number(r.id) || Date.now() + i,
            categoria: r.categoria || 'Generale',
            titolo: r.titolo,
            equazione: r.equazione,
            note: r.note || '',
        }));

// Modelli vuoti scaricabili
export const CSV_TEMPLATES = {
    pazienti: {
        columns: [
            'id',
            'nome',
            'cognome',
            'sesso',
            'dataNascita',
            'luogoNascita',
            'provinciaNascita',
            'cf',
            'professione',
            'cellulare',
            'email',
            'indirizzo',
            'cap',
            'citta',
            'patologie',
            'farmaci',
            'allergie',
            'obiettivo',
        ],
        example: { id: '', nome: 'Mario', cognome: 'Rossi', sesso: 'M', dataNascita: '1985-03-12', citta: 'Urbino' },
    },
    visite: {
        columns: ['paziente_id', 'visita_id', 'data', 'peso', 'altezza', 'note'],
        example: { paziente_id: '123456', visita_id: '', data: '2026-03-01', peso: '80,5', altezza: '178' },
    },
    alimenti: {
        columns: ['category', 'name', 'kcal', 'p', 'c', 'f'],
        example: { category: 'Proteine', name: 'Petto di pollo', kcal: 165, p: 31, c: 0, f: '3,6' },
    },
    esercizi: { columns: ['group', 'name', 'type'], example: { group: 'Petto', name: 'Panca piana', type: 'Forza' } },
};

export const analyzeCsv = (text) => {
    const { headers, rows } = parseCsv(text);
    const kind = detectCsvKind(headers);
    return { kind, headers, rows };
};
