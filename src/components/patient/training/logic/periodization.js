// Generatore di periodizzazione: a partire dalla settimana "base" costruisce le settimane successive con una progressione.
// I carichi si arrotondano al passo dei dischi (2,5 kg). L'ultima settimana può essere di SCARICO (meno serie e carichi più bassi).
import { cloneWeeks } from './trainingModel';
import { parseReps, numOrNull } from './science/parse';
import { roundTo } from './science/oneRm';
import { isCardio, oneRmFor } from './analysis';

export const MODELS = [
    {
        id: 'lineare',
        label: 'Progressione lineare del carico',
        desc: 'Ogni settimana il carico (o la % del massimale) sale di un piccolo incremento. Adatta a principianti e intermedi.',
    },
    {
        id: 'doppia',
        label: 'Doppia progressione (range di ripetizioni)',
        desc: 'Scrivi un range (es. 8-12): ogni settimana +1 ripetizione; arrivato al massimo del range sale il carico e si riparte dal minimo.',
    },
    {
        id: 'onda531',
        label: 'Onda 5/3/1 (sul 1° esercizio di ogni giorno)',
        desc: 'Cicli di 4 settimane con percentuali crescenti (5 → 3 → 5/3/1 → scarico) sul "training max" (90% del massimale). Gli altri esercizi seguono la progressione lineare.',
    },
    {
        id: 'rpe',
        label: 'Progressione per sforzo (RPE)',
        desc: "Il carico si sceglie in base allo sforzo: l'RPE target cresce di 0,5 a settimana (da 7 verso 9) e si chiude con uno scarico.",
    },
];

const cloneBase = (base) => cloneWeeks([base])[0];
const eachStrengthSet = (week, fn) =>
    week.days.forEach((d) =>
        d.exercises.forEach((e, ei) => {
            if (isCardio(e)) return;
            e.sets.forEach((s, j) => fn(s, e, j, ei, d));
        })
    );

const applyDeload = (week, { volume = 0.6, load = 0.9, step = 2.5 }) => {
    week.kind = 'deload';
    week.days.forEach((d) =>
        d.exercises.forEach((e) => {
            if (isCardio(e)) return;
            const keep = Math.max(1, Math.ceil(e.sets.length * volume));
            e.sets = e.sets.slice(0, keep);
            e.sets.forEach((s) => {
                const l = numOrNull(s.load);
                if (l !== null) s.load = String(roundTo(l * load, step));
                const p = numOrNull(s.pct);
                if (p !== null) s.pct = String(Math.round(p * load));
                const r = numOrNull(s.rpe);
                if (r !== null) s.rpe = String(Math.max(5, r - 1.5));
            });
        })
    );
};

const fmt = (n) => String(Math.round(n * 100) / 100).replace(/\.0+$/, '');

// Restituisce TUTTE le settimane della progressione, la prima è la settimana base (stessi ID, adattata se il modello lo richiede).
// startNumber = numero con cui si chiama la prima settimana (per aggiungere in coda a una scheda già avviata).
export const generateWeeks = (base, opts) => {
    const {
        model,
        total = 4,
        increment = 2.5,
        unit = 'kg',
        deload = true,
        deloadVolume = 0.6,
        deloadLoad = 0.9,
        step = 2.5,
        massimali = {},
        baseRpe = 7,
        startNumber = 1,
    } = opts;
    // incremento del carico alla n-esima progressione: in kg (es. +2,5 kg) oppure in % (es. +2,5%)
    const bump = (l, n) => (unit === 'pct' ? l * (1 + (increment / 100) * n) : l + increment * n);
    const out = [];
    const WAVES = [
        { pct: [65, 75, 85], reps: ['5', '5', '5+'] },
        { pct: [70, 80, 90], reps: ['3', '3', '3+'] },
        { pct: [75, 85, 95], reps: ['5', '3', '1+'] },
        { pct: [40, 50, 60], reps: ['5', '5', '5'], deload: true },
    ];
    for (let i = 0; i < total; i++) {
        const w = i === 0 ? JSON.parse(JSON.stringify(base)) : cloneBase(base);
        const isLast = i === total - 1;
        const doDeload = deload && isLast && i > 0 && model !== 'onda531';
        if (i > 0) {
            w.title = `Settimana ${startNumber + i}`;
            w.kind = '';
            w.note = '';
        }

        if ((model === 'lineare' || model === 'onda531') && i > 0) {
            eachStrengthSet(w, (s, e, j, ei) => {
                if (model === 'onda531' && ei === 0) return; // gestito sotto
                const l = numOrNull(s.load);
                const p = numOrNull(s.pct);
                if (p !== null) {
                    s.pct = fmt(p + increment * i);
                    const rm = oneRmFor(massimali, e.name);
                    if (rm) s.load = String(roundTo((rm * (p + increment * i)) / 100, step));
                } else if (l !== null) s.load = String(roundTo(bump(l, i), step));
            });
        }

        if (model === 'doppia' && i > 0) {
            eachStrengthSet(w, (s) => {
                const { range } = parseReps(s.reps);
                const l = numOrNull(s.load);
                if (!range) {
                    if (l !== null) s.load = String(roundTo(bump(l, i), step));
                    return;
                }
                const [a, b] = range;
                const L = b - a + 1;
                const target = a + (i % L);
                const bumps = Math.floor(i / L);
                s.note = [s.note, `target ${target} rip.`].filter(Boolean).join(' · ');
                if (l !== null) s.load = String(roundTo(bump(l, bumps), step));
            });
        }

        if (model === 'onda531') {
            const wave = WAVES[i % 4];
            if (wave.deload) w.kind = 'deload';
            w.days.forEach((d) => {
                const e = d.exercises.find((x) => !isCardio(x));
                if (!e) return;
                const rm = oneRmFor(massimali, e.name);
                const tm = 0.9;
                const template = e.sets[0] || {};
                e.sets = wave.pct.map((p, j) => ({
                    ...template,
                    id: 'id-' + Math.random().toString(36).slice(2, 11),
                    reps: wave.reps[j],
                    pct: fmt(p * tm),
                    load: rm ? String(roundTo((rm * p * tm) / 100, step)) : '',
                    rpe: '',
                }));
                e.note = 'training max = 90% del massimale';
            });
        }

        if (model === 'rpe') {
            const r = Math.min(9, baseRpe + 0.5 * i);
            eachStrengthSet(w, (s) => {
                s.rpe = fmt(r);
            });
            w.note = 'Carico autoregolato: scegli il peso che porta allo sforzo (RPE) indicato.';
        }

        if (doDeload) applyDeload(w, { volume: deloadVolume, load: deloadLoad, step });
        if (w.kind === 'deload') w.title = `${w.title.replace(/ \(scarico\)$/, '')} (scarico)`;
        out.push(w);
    }
    return out;
};
