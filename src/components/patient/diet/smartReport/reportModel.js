import { METRICS, resolveType } from './metrics';

// Dal piano alla struttura da disegnare: {labels, series, refs, unit, empty, reason, notes}.
// Funzione pura. Regola: un dato mancante nel database alimenti NON è zero, e si dice.

const num = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0; // "tr" (tracce) → 0
};
const has = (food, k) => food[k] !== undefined && food[k] !== null && food[k] !== '';

// valore per 100 g di un alimento, oppure null se il database non ha il dato
const readFood = (food, def) => {
    let ks = def.keys.filter((k) => has(food, k));
    if (!ks.length && def.fallback) ks = def.fallback.filter((k) => has(food, k));
    return ks.length ? ks.reduce((s, k) => s + num(food[k]), 0) : null;
};

// totale di una metrica su un gruppo di righe del piano
const measure = (def, items, foodByName) => {
    let value = 0;
    let total = 0;
    let known = 0;
    items.forEach((it) => {
        const w = num(it.weight);
        total += w;
        if (def.item) {
            value += (num(it[def.item]) * w) / 100;
            known += w;
            return;
        }
        const food = foodByName.get(it.name);
        const per100 = food ? readFood(food, def) : null;
        if (per100 === null) return;
        known += w;
        value += (per100 * w) / 100;
    });
    return { value, total, known };
};

const dayGroups = (days) => days.map((d, i) => ({ label: d.title || `Giorno ${i + 1}`, items: (d.meals || []).flatMap((ml) => ml.items || []) }));
const mealGroups = (day) => (day?.meals || []).map((ml, i) => ({ label: ml.title || `Pasto ${i + 1}`, items: ml.items || [] }));

export const buildReport = ({ config, dietDays, foodDB, patientTargets, kcalTarget }) => {
    const metricId = METRICS[config.metric] ? config.metric : 'kcal';
    const metric = METRICS[metricId];
    const allDays = config.scope === 'allDays';
    const day = dietDays.find((d) => d.id === config.dayId) || dietDays[0];
    const groups = allDays ? dayGroups(dietDays) : mealGroups(day);
    const type = resolveType(metricId, config.type);
    const base = { type, metricId, metric, labels: groups.map((g) => g.label), series: [], refs: [], unit: metric.unit, percent: !!metric.percent, empty: true, reason: '', notes: [], canTarget: false };

    if (!groups.length) return { ...base, reason: allDays ? 'Il piano non ha ancora giorni.' : 'Questo giorno non ha ancora pasti.' };

    // definizioni delle serie da disegnare
    let defs;
    if (metric.panel === 'ALL_DRV') {
        defs = Object.entries(patientTargets).map(([key, t]) => ({ id: key, label: t.name, unit: t.unit, keys: [key], drvKey: key }));
    } else if (metric.panel) {
        defs = metric.panel.map((id) => ({ id, ...METRICS[id] }));
    } else {
        defs = [{ id: metricId, ...metric }];
    }
    if (metric.percent) {
        defs = defs.filter((d) => patientTargets[d.drvKey]);
        if (!defs.length) return { ...base, reason: 'Mancano i riferimenti EFSA per questo paziente (età e sesso).' };
    }

    const foodByName = new Map(foodDB.map((f) => [f.name, f]));
    let anyWeight = false;
    let anyKnown = false;
    const partial = [];

    const series = defs.map((def) => {
        const target = metric.percent ? patientTargets[def.drvKey].target : 1;
        let totW = 0;
        let knownW = 0;
        const values = groups.map((g) => {
            const r = measure(def, g.items, foodByName);
            totW += r.total;
            knownW += r.known;
            return metric.percent ? (r.value / target) * 100 : r.value;
        });
        if (totW > 0) anyWeight = true;
        if (knownW > 0) anyKnown = true;
        const coverage = totW > 0 ? knownW / totW : 1;
        if (totW > 0 && coverage < 0.999) partial.push({ name: def.label, coverage });
        return { id: def.id, name: def.label, unit: metric.percent ? '%' : def.unit, values, coverage: totW > 0 ? coverage : 0 };
    });

    if (!anyWeight) return { ...base, series, reason: 'Gli alimenti del piano non hanno una quantità.' };
    if (!anyKnown) {
        return { ...base, series, reason: `Nel database alimenti non c'è il dato "${metric.label}" per gli alimenti di questo piano: il grafico sarebbe vuoto, non zero.` };
    }

    // le serie senza alcun dato non si disegnano (sarebbero uno zero falso)
    const drawn = series.filter((s) => s.coverage > 0);
    const hidden = series.filter((s) => s.coverage === 0).map((s) => s.name);
    const notes = [];
    if (hidden.length) notes.push(`Senza dati nel database: ${hidden.join(', ')}.`);
    const lowest = partial.filter((p) => p.coverage > 0).sort((a, b) => a.coverage - b.coverage)[0];
    if (lowest) {
        const pct = Math.round(lowest.coverage * 100);
        notes.push(
            drawn.length === 1
                ? `Dato presente per il ${pct}% del peso degli alimenti: il valore reale può essere più alto.`
                : `Dato incompleto in alcune serie (fino al ${pct}% del peso, ${lowest.name}): i valori reali possono essere più alti.`
        );
    }
    if (metric.percent) notes.push(allDays ? 'Percentuale del fabbisogno giornaliero EFSA.' : 'Quota del fabbisogno giornaliero EFSA coperta da ciascun pasto.');

    // riferimenti: hanno senso solo quando ogni punto è un giorno intero
    const refs = [];
    if (allDays) {
        if (metric.percent) refs.push({ value: 100, label: 'Fabbisogno', kind: 'target' });
        else if (metric.target === 'kcal' && kcalTarget) refs.push({ value: kcalTarget, label: 'Obiettivo', kind: 'target' });
        else if (metric.drvKey && patientTargets[metric.drvKey]) {
            const t = patientTargets[metric.drvKey];
            refs.push({ value: t.target, label: 'Riferimento EFSA', kind: 'target' });
            if (t.ul) refs.push({ value: t.ul, label: 'Limite massimo (UL)', kind: 'ul' });
        }
    }
    const canTarget = refs.length > 0;
    return { ...base, empty: false, series: drawn, refs: config.showTarget === false ? [] : refs, canTarget, notes };
};

// Il riferimento esiste solo nel Report a giorni: per la modale (spiega perché è spento)
export const targetHint = (config, model) => {
    if (config.scope !== 'allDays') return 'Disponibile nella vista "Tutti i giorni" (il riferimento è giornaliero).';
    if (!model.canTarget) return 'Per questa metrica non c\'è un riferimento.';
    return '';
};
