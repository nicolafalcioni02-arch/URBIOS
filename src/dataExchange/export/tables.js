// Costruzione delle tabelle (colonne + righe) a partire dal database. Ogni tabella diventa un CSV.
import { ageAt, flattenScalars, isPlainObject, toNum } from '../util';

const round = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : '');
const cellValue = (v) => (Array.isArray(v) ? (v.every((x) => typeof x !== 'object') ? v.join(' | ') : '') : isPlainObject(v) ? '' : v);

// colonne in ordine di prima apparizione, partendo da quelle "fisse"
const collectColumns = (rows, first = []) => {
    const cols = [...first];
    const seen = new Set(cols);
    rows.forEach((r) => Object.keys(r).forEach((k) => !seen.has(k) && (seen.add(k), cols.push(k))));
    // toglie le colonne completamente vuote
    return cols.filter((c) => rows.some((r) => r[c] !== undefined && r[c] !== null && r[c] !== ''));
};

export const buildPatientTable = (db) => {
    const rows = (db.pazienti || []).map((p) => {
        const row = {};
        Object.keys(p).forEach((k) => {
            if (k === 'visite' || k === 'allenamento') return;
            row[k] = cellValue(p[k]);
        });
        row.n_visite = (p.visite || []).length;
        const dates = (p.visite || [])
            .map((v) => v.data)
            .filter(Boolean)
            .sort();
        if (dates.length) row.ultima_visita = dates[dates.length - 1];
        return row;
    });
    const first = [
        'id',
        'nome',
        'cognome',
        'sesso',
        'dataNascita',
        'anno_nascita',
        'eta',
        'fascia_eta',
        'luogoNascita',
        'cf',
        'professione',
        'statoCivile',
        'cellulare',
        'email',
        'indirizzo',
        'cap',
        'citta',
        'status',
        'obiettivo',
        'patologie',
        'farmaci',
        'allergie',
        'anamnesi_familiare',
        'note',
    ];
    return { columns: collectColumns(rows, first), rows };
};

export const buildVisitTable = (db) => {
    const rows = [];
    (db.pazienti || []).forEach((p) =>
        (p.visite || []).forEach((v) => {
            const row = { paziente_id: p.id, visita_id: v.id };
            if (p.sesso) row.sesso = p.sesso;
            if (p.fascia_eta) row.fascia_eta = p.fascia_eta;
            if (p.anno_nascita) row.anno_nascita = p.anno_nascita;
            Object.keys(v).forEach((k) => {
                if (['id', 'dettagli', 'dietStatus'].includes(k)) return;
                const val = cellValue(v[k]);
                if (val !== '' && val !== undefined) row[k] = val;
            });
            if (v.dietStatus) row.stato_dieta = v.dietStatus;
            const age = p.dataNascita && v.data ? ageAt(p.dataNascita, v.data) : null;
            if (age !== null) row.eta_alla_visita = round(age, 1);
            Object.assign(row, flattenScalars(v.dettagli || {}, { skip: (full, k, depth) => depth === 0 && /^(diet_|training)/.test(k) }));
            const peso = toNum(row.peso);
            const h = toNum(row.altezza);
            if (peso > 0 && h > 0) row.bmi_calcolato = round(peso / (h / 100) ** 2, 1);
            rows.push(row);
        })
    );
    return {
        columns: collectColumns(rows, [
            'paziente_id',
            'visita_id',
            'data',
            'giorni_da_prima_visita',
            'sesso',
            'fascia_eta',
            'anno_nascita',
            'eta_alla_visita',
            'peso',
            'altezza',
            'bmi_calcolato',
            'stato_dieta',
            'note',
        ]),
        rows,
    };
};

// Una riga per alimento del piano (principali e sostituzioni), con i totali per la quantità indicata.
export const buildDietFoodTable = (db) => {
    const rows = [];
    (db.pazienti || []).forEach((p) =>
        (p.visite || []).forEach((v) => {
            const days = v.dettagli && v.dettagli.diet_plan_data;
            if (!Array.isArray(days)) return;
            days.forEach((day) =>
                (day.meals || []).forEach((meal) =>
                    (meal.items || []).forEach((item) => {
                        const push = (it, tipo) => {
                            const w = toNum(it.weight);
                            const f = Number.isFinite(w) ? w / 100 : NaN;
                            const per = (x) => (Number.isFinite(f) && Number.isFinite(toNum(x)) ? round(toNum(x) * f) : '');
                            rows.push({
                                paziente_id: p.id,
                                visita_id: v.id,
                                data: v.data,
                                giorno: day.title,
                                pasto: meal.title,
                                tipo,
                                alimento: it.name,
                                grammi: it.weight,
                                kcal_100g: it.kcal,
                                proteine_100g: it.p,
                                carboidrati_100g: it.c,
                                grassi_100g: it.f,
                                kcal: per(it.kcal),
                                proteine_g: per(it.p),
                                carboidrati_g: per(it.c),
                                grassi_g: per(it.f),
                            });
                        };
                        push(item, 'principale');
                        (item.subs || []).forEach((s) => push(s, 'sostituzione'));
                    })
                )
            );
        })
    );
    return {
        columns: collectColumns(rows, [
            'paziente_id',
            'visita_id',
            'data',
            'giorno',
            'pasto',
            'tipo',
            'alimento',
            'grammi',
            'kcal_100g',
            'proteine_100g',
            'carboidrati_100g',
            'grassi_100g',
            'kcal',
            'proteine_g',
            'carboidrati_g',
            'grassi_g',
        ]),
        rows,
    };
};

// Obiettivi nutrizionali e parametri di calcolo della dieta (uno per visita con dieta).
export const buildDietTargetTable = (db) => {
    const rows = [];
    (db.pazienti || []).forEach((p) =>
        (p.visite || []).forEach((v) => {
            const d = v.dettagli || {};
            if (!d.diet_targets && !d.diet_calc_data) return;
            const t = d.diet_targets || {};
            const c = d.diet_calc_data || {};
            rows.push({
                paziente_id: p.id,
                visita_id: v.id,
                data: v.data,
                giorni_da_prima_visita: v.giorni_da_prima_visita,
                target_kcal: t.kcal,
                target_proteine_g: t.p,
                target_carboidrati_g: t.c,
                target_grassi_g: t.f,
                configurato: t.isConfigured,
                sesso: c.sex,
                eta: c.age,
                peso: c.weight,
                altezza: c.height,
                formula_metabolismo: c.formula,
                laf: c.laf,
                perc_carboidrati: c.macroTargets && c.macroTargets.c,
                perc_proteine: c.macroTargets && c.macroTargets.p,
                perc_grassi: c.macroTargets && c.macroTargets.f,
                n_giorni_piano: Array.isArray(d.diet_plan_data) ? d.diet_plan_data.length : 0,
            });
        })
    );
    return { columns: collectColumns(rows, []), rows };
};

// Allenamento: una riga per serie, per ogni scheda salvata del paziente.
export const buildTrainingTable = (db) => {
    const rows = [];
    (db.pazienti || []).forEach((p) => {
        const schede = p.allenamento && p.allenamento.schede;
        if (!Array.isArray(schede)) return;
        schede.forEach((sc) =>
            (sc.weeks || []).forEach((w) =>
                (w.days || []).forEach((d, di) =>
                    (d.exercises || []).forEach((ex) =>
                        (ex.sets || []).forEach((st, i) => {
                            if (!ex.name && !st.reps && !st.rec && !st.note) return;
                            rows.push({
                                paziente_id: p.id,
                                scheda: sc.titolo,
                                data_scheda: sc.data,
                                obiettivo: sc.obiettivo,
                                settimana: w.title,
                                giorno: d.title || `Giorno ${di + 1}`,
                                esercizio: ex.name,
                                gruppo: ex.group,
                                superserie: ex.ss,
                                serie: i + 1,
                                tipo_serie: st.tipo || 'lavoro',
                                ripetizioni: st.reps,
                                carico_kg: st.load,
                                pct_1rm: st.pct,
                                rpe: st.rpe,
                                tempo: st.tempo,
                                recupero: st.rec,
                                note: st.note,
                            });
                        })
                    )
                )
            )
        );
    });
    return {
        columns: collectColumns(rows, [
            'paziente_id',
            'scheda',
            'data_scheda',
            'obiettivo',
            'settimana',
            'giorno',
            'esercizio',
            'gruppo',
            'serie',
            'ripetizioni',
            'recupero',
            'note',
        ]),
        rows,
    };
};

// Massimali (1RM) dei clienti
export const buildMassimaliTable = (db) => {
    const rows = [];
    (db.pazienti || []).forEach((p) => {
        const m = p.allenamento && p.allenamento.massimali;
        if (!m) return;
        Object.values(m).forEach((x) => rows.push({ paziente_id: p.id, esercizio: x.name, massimale_kg: x.kg, data: x.date, metodo: x.method }));
    });
    return { columns: collectColumns(rows, ['paziente_id', 'esercizio', 'massimale_kg', 'data', 'metodo']), rows };
};

// Tabella generica da una lista di oggetti (alimenti, esercizi, formule, DRV...)
export const buildListTable = (list, first = []) => {
    const rows = (list || []).map((o) => flattenScalars(o, { maxDepth: 2 }));
    return { columns: collectColumns(rows, first), rows };
};

export const buildRangeTable = (db) => {
    const rows = Object.entries(db.rangeEmato || {}).map(([chiave, r]) => ({
        chiave,
        etichetta: r.label,
        unita: r.unit,
        min_M: r.minM,
        max_M: r.maxM,
        min_F: r.minF,
        max_F: r.maxF,
    }));
    return { columns: collectColumns(rows, ['chiave', 'etichetta', 'unita', 'min_M', 'max_M', 'min_F', 'max_F']), rows };
};
