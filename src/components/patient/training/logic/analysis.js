// Analisi di una scheda: volume per muscolo, tonnellaggio, intensità, durata, dispendio energetico, carico interno (sRPE),
// monotonia / strain (Foster), rapporto acuto:cronico e avvisi di programmazione.
// Funzione PURA: dato lo stesso input restituisce lo stesso risultato (si può collaudare senza interfaccia).
//
// ATTENZIONE: sono stime di supporto alla programmazione, non misure. Vanno interpretate dal professionista.
import { findCatalogEntry, normName } from './exerciseMedia';
import { parseReps, parseRest, parseTempo, numOrNull } from './science/parse';
import { kcalFromMet, resistanceMet } from './science/energy';
import { goalById, weeklySetsRange, MAX_SETS_PER_SESSION, MIN_FREQUENCY, MAX_SESSION_MIN, CARDIO_WEEKLY_MIN, PUSH, PULL } from './science/guidelines';

export const SECONDS_PER_REP = 4; // se non c'è il tempo di esecuzione
export const TRANSITION_SEC = 45; // cambio attrezzo
export const SUPERSET_TRANSITION_SEC = 15;
export const DEFAULT_EXTRA_MIN = 10; // riscaldamento generale + defaticamento

// ---------- esercizi ----------
export const isCardio = (ex) => {
    const e = findCatalogEntry(ex.name);
    return String(ex.group || '').toLowerCase() === 'cardio' || (e && e.group === 'Cardio');
};

export const exerciseMuscles = (ex) => {
    const e = findCatalogEntry(ex.name);
    if (e && e.muscles && e.muscles.p.length) return { p: e.muscles.p, s: e.muscles.s || [] };
    const g = String(ex.group || '').trim();
    return g ? { p: [g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()], s: [] } : { p: [], s: [] };
};

export const oneRmFor = (massimali, name) => {
    const m = massimali && massimali[normName(name)];
    return m && Number(m.kg) > 0 ? Number(m.kg) : null;
};

const analyzeSet = (s, oneRm) => {
    const { reps, seconds } = parseReps(s.reps);
    let load = numOrNull(s.load);
    let pct = numOrNull(s.pct);
    if (load === null && pct !== null && oneRm) load = (pct * oneRm) / 100;
    if (pct === null && load !== null && oneRm) pct = (load / oneRm) * 100;
    return {
        reps,
        seconds,
        load,
        pct,
        rpe: numOrNull(s.rpe),
        rest: parseRest(s.rec),
        tempo: parseTempo(s.tempo),
        warm: s.tipo === 'riscaldamento',
        counted: reps !== null || seconds !== null,
    };
};

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

const analyzeExercise = (ex, ctx) => {
    const cardio = isCardio(ex);
    const oneRm = oneRmFor(ctx.massimali, ex.name);
    const sets = (ex.sets || []).map((s) => analyzeSet(s, oneRm)).filter((s) => s.counted);
    const work = sets.filter((s) => !s.warm);
    const out = {
        id: ex.id,
        name: ex.name,
        cardio,
        sets,
        workSets: work.length,
        volumeLoad: 0,
        avgPct: null,
        avgRpe: null,
        cardioSec: 0,
        strengthSec: 0,
        ss: String(ex.ss || '').trim(),
        muscles: exerciseMuscles(ex),
        oneRm,
    };
    if (cardio) {
        out.cardioSec = sets.reduce((a, s) => a + (s.seconds !== null ? s.seconds : s.reps !== null ? s.reps * 60 : 0), 0); // numero semplice = minuti
        const e = findCatalogEntry(ex.name);
        out.met = numOrNull(ex.met) || (e && e.met) || 6;
        return out;
    }
    out.volumeLoad = work.reduce((a, s) => a + (s.reps !== null && s.load !== null ? s.reps * s.load : 0), 0);
    out.avgPct = mean(work.map((s) => s.pct).filter((x) => x !== null));
    out.avgRpe = mean(work.map((s) => s.rpe).filter((x) => x !== null));
    out.reps = work.map((s) => s.reps).filter((x) => x !== null);
    out.rests = work.map((s) => s.rest).filter((x) => x !== null);
    return out;
};

// tempo di lavoro (s) di una serie
const workSeconds = (s) => (s.seconds !== null ? s.seconds : (s.reps || 0) * (s.tempo || SECONDS_PER_REP));

// durata della parte di pesi: tiene conto delle superserie (blocchi di esercizi consecutivi con la stessa sigla)
const strengthSeconds = (exs, defaultRest) => {
    const groups = [];
    exs.filter((e) => !e.cardio && e.sets.length).forEach((e) => {
        const last = groups[groups.length - 1];
        if (e.ss && last && last[0].ss === e.ss) last.push(e);
        else groups.push([e]);
    });
    let total = 0;
    groups.forEach((g, gi) => {
        if (gi > 0) total += TRANSITION_SEC;
        const rounds = Math.max(...g.map((e) => e.sets.length));
        for (let r = 0; r < rounds; r++) {
            g.forEach((e, mi) => {
                const s = e.sets[r];
                if (!s) return;
                total += workSeconds(s);
                if (mi < g.length - 1) total += SUPERSET_TRANSITION_SEC;
            });
            const lastWithSet = [...g].reverse().find((e) => e.sets[r]);
            const s = lastWithSet && lastWithSet.sets[r];
            total += s && s.rest !== null ? s.rest : defaultRest;
        }
    });
    return total;
};

// ---------- giorno ----------
export const analyzeDay = (day, ctx) => {
    const exs = (day.exercises || []).map((e) => analyzeExercise(e, ctx));
    const strengthExs = exs.filter((e) => !e.cardio);
    const goal = ctx.goal;
    const defaultRest = goal ? (goal.rest[0] + goal.rest[1]) / 2 : 90;
    const workSetsAll = strengthExs.reduce((a, e) => a + e.workSets, 0);
    const cardioSec = exs.filter((e) => e.cardio).reduce((a, e) => a + e.cardioSec, 0);
    const hasWork = exs.some((e) => e.sets.length);
    const strengthSec = strengthSeconds(exs, defaultRest);
    const extraSec = hasWork ? (ctx.extraMin ?? DEFAULT_EXTRA_MIN) * 60 : 0;
    const estimatedMin = (strengthSec + cardioSec + extraSec) / 60;
    const override = numOrNull(day.minutes);
    const minutes = override !== null ? override : estimatedMin;
    const cardioMin = cardioSec / 60;
    const strengthMin = Math.max(0, minutes - cardioMin);

    const volumeLoad = strengthExs.reduce((a, e) => a + e.volumeLoad, 0);
    const rpes = strengthExs.flatMap((e) => e.sets.filter((s) => !s.warm && s.rpe !== null).map((s) => s.rpe));
    const pcts = strengthExs.flatMap((e) => e.sets.filter((s) => !s.warm && s.pct !== null).map((s) => s.pct));
    const avgRpe = mean(rpes);
    const avgPct = mean(pcts);

    // muscoli: serie dirette (muscoli principali) e "ponderate" (secondari = 0,5)
    const muscles = {};
    strengthExs.forEach((e) => {
        if (!e.workSets) return;
        e.muscles.p.forEach((m) => {
            const o = (muscles[m] = muscles[m] || { direct: 0, weighted: 0 });
            o.direct += e.workSets;
            o.weighted += e.workSets;
        });
        e.muscles.s.forEach((m) => {
            const o = (muscles[m] = muscles[m] || { direct: 0, weighted: 0 });
            o.weighted += e.workSets * 0.5;
        });
    });

    let sessionRpe = numOrNull(day.sessionRpe);
    if (sessionRpe === null && hasWork) sessionRpe = avgRpe !== null ? avgRpe : workSetsAll > 0 ? (goal ? goal.sessionRpe : 6) : 5;
    const loadAU = sessionRpe !== null && hasWork ? sessionRpe * minutes : 0;

    const w = ctx.profile && Number(ctx.profile.weightKg) > 0 ? Number(ctx.profile.weightKg) : null;
    let kcal = null;
    if (w && hasWork) {
        const resMet = resistanceMet(avgRpe !== null ? avgRpe : goal ? goal.sessionRpe : 6);
        kcal =
            (workSetsAll > 0 ? kcalFromMet(resMet, w, strengthMin) : 0) +
            exs.filter((e) => e.cardio).reduce((a, e) => a + kcalFromMet(e.met, w, e.cardioSec / 60), 0);
    }
    const reps = strengthExs.flatMap((e) => e.sets.filter((s) => !s.warm && s.reps !== null).map((s) => s.reps));
    return {
        id: day.id,
        title: day.title,
        trains: hasWork,
        exercises: exs,
        workSets: workSetsAll,
        volumeLoad,
        avgPct,
        avgRpe,
        sessionRpe,
        minutes,
        estimatedMin,
        overridden: override !== null,
        cardioMin,
        strengthMin,
        loadAU,
        kcal,
        muscles,
        reps,
        rests: strengthExs.flatMap((e) => e.rests || []),
        density: strengthMin > 0 ? volumeLoad / strengthMin : null, // kg sollevati al minuto
    };
};

// ---------- settimana ----------
const sd = (a) => {
    const m = mean(a);
    return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length);
};

export const analyzeWeek = (week, ctx) => {
    const days = (week.days || []).map((d) => analyzeDay(d, ctx));
    const train = days.filter((d) => d.trains);
    const muscles = {};
    days.forEach((d) =>
        Object.entries(d.muscles).forEach(([m, v]) => {
            const o = (muscles[m] = muscles[m] || { direct: 0, weighted: 0, days: 0, maxPerSession: 0 });
            o.direct += v.direct;
            o.weighted += v.weighted;
            if (v.direct > 0) o.days++;
            o.maxPerSession = Math.max(o.maxPerSession, v.direct);
        })
    );
    const weekLoad = days.reduce((a, d) => a + d.loadAU, 0);
    const daily = [...train.map((d) => d.loadAU), ...Array(Math.max(0, 7 - train.length)).fill(0)];
    const s = daily.length ? sd(daily) : 0;
    const monotony = weekLoad > 0 && s > 0 ? mean(daily) / s : null;
    const kcalDays = days.filter((d) => d.kcal !== null);
    return {
        id: week.id,
        title: week.title,
        kind: week.kind || '',
        days,
        trainingDays: train.length,
        muscles,
        workSets: days.reduce((a, d) => a + d.workSets, 0),
        volumeLoad: days.reduce((a, d) => a + d.volumeLoad, 0),
        minutes: days.reduce((a, d) => a + d.minutes, 0),
        cardioMin: days.reduce((a, d) => a + d.cardioMin, 0),
        kcal: kcalDays.length ? kcalDays.reduce((a, d) => a + d.kcal, 0) : null,
        avgPct: mean(days.map((d) => d.avgPct).filter((x) => x !== null)),
        avgRpe: mean(days.map((d) => d.avgRpe).filter((x) => x !== null)),
        weekLoad,
        monotony,
        strain: monotony !== null ? weekLoad * monotony : null,
    };
};

// ---------- scheda ----------
export const analyzeScheda = ({ weeks, header = {}, massimali = {}, profile = null }) => {
    const goal = goalById(header.tipo);
    const ctx = { massimali, profile, goal, extraMin: numOrNull(header.extraMin) ?? DEFAULT_EXTRA_MIN };
    const ws = (weeks || []).map((w) => analyzeWeek(w, ctx));
    // rapporto acuto:cronico (settimana / media delle 4 precedenti) e variazione settimanale
    ws.forEach((w, i) => {
        const prev = ws
            .slice(Math.max(0, i - 4), i)
            .map((x) => x.weekLoad)
            .filter((x) => x > 0);
        w.acwr = i > 0 && prev.length && w.weekLoad > 0 ? w.weekLoad / mean(prev) : null;
        const p = i > 0 ? ws[i - 1].weekLoad : 0;
        w.change = p > 0 && w.weekLoad > 0 ? ((w.weekLoad - p) / p) * 100 : null;
    });
    return { goal, level: header.livello || '', weeks: ws, warnings: buildWarnings(ws, goal, header.livello || '') };
};

// ---------- avvisi ----------
const f1 = (x) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : x);
export const buildWarnings = (weeks, goal, level) => {
    const out = [];
    const add = (week, lvl, text) => out.push({ week: week.id, weekTitle: week.title, level: lvl, text });
    const range = goal && level ? weeklySetsRange(goal.id, level) : null;

    weeks.forEach((w) => {
        const deload = w.kind === 'deload';
        if (!w.trainingDays) return;
        // volume per muscolo
        if (range && !deload) {
            Object.entries(w.muscles).forEach(([m, v]) => {
                if (v.direct > 0 && v.direct < range[0])
                    add(
                        w,
                        'info',
                        `${m}: ${f1(v.direct)} serie dirette a settimana, sotto il minimo indicato per ${goal.label.toLowerCase()} (${range[0]}-${range[1]}).`
                    );
                if (v.direct > range[1])
                    add(
                        w,
                        'warn',
                        `${m}: ${f1(v.direct)} serie dirette a settimana, oltre l'intervallo indicato (${range[0]}-${range[1]}). Valuta il recupero.`
                    );
            });
        }
        Object.entries(w.muscles).forEach(([m, v]) => {
            if (v.maxPerSession > MAX_SETS_PER_SESSION)
                add(
                    w,
                    'warn',
                    `${m}: ${v.maxPerSession} serie dirette in una sola seduta (oltre ~${MAX_SETS_PER_SESSION} il beneficio marginale cala): distribuiscile su più giorni.`
                );
            if (!deload && v.days === 1 && v.direct >= 8 && goal && ['ipertrofia', 'forza'].includes(goal.id))
                add(
                    w,
                    'info',
                    `${m}: allenato una sola volta a settimana con ${f1(v.direct)} serie. Per ${goal.label.toLowerCase()} è preferibile una frequenza di almeno ${MIN_FREQUENCY} volte.`
                );
        });
        // equilibrio spinta / trazione
        const sum = (list) => list.reduce((a, m) => a + ((w.muscles[m] && w.muscles[m].direct) || 0), 0);
        const push = sum(PUSH),
            pull = sum(PULL);
        if (push >= 6 && pull === 0) add(w, 'warn', `Nessun lavoro di trazione (dorso/bicipiti) a fronte di ${f1(push)} serie di spinta.`);
        else if (push > 0 && pull > 0 && push / pull > 1.5)
            add(
                w,
                'info',
                `Più spinta che trazione (${f1(push)} vs ${f1(pull)} serie): per l'equilibrio posturale la trazione dovrebbe essere almeno pari alla spinta.`
            );
        const quad = (w.muscles.Quadricipiti || {}).direct || 0,
            ham = (w.muscles.Femorali || {}).direct || 0;
        if (quad >= 8 && ham < quad * 0.4) add(w, 'info', `Pochi femorali (${f1(ham)}) rispetto ai quadricipiti (${f1(quad)}): rapporto sbilanciato.`);
        // durata e densità
        w.days.forEach((d, i) => {
            if (d.trains && d.minutes > MAX_SESSION_MIN)
                add(w, 'warn', `Giorno ${i + 1}: durata stimata ${Math.round(d.minutes)} min, oltre ${MAX_SESSION_MIN} min.`);
        });
        // coerenza con l'obiettivo: ripetizioni e recuperi
        if (goal && !deload) {
            const reps = w.days.flatMap((d) => d.reps);
            if (reps.length >= 6) {
                const inside = reps.filter((r) => r >= goal.reps[0] && r <= goal.reps[1]).length / reps.length;
                if (inside < 0.6)
                    add(
                        w,
                        'info',
                        `Solo il ${Math.round(inside * 100)}% delle serie è nel range di ripetizioni tipico per ${goal.label.toLowerCase()} (${goal.reps[0]}-${goal.reps[1]}).`
                    );
            }
            const rests = w.days.flatMap((d) => d.rests);
            if (rests.length >= 6) {
                const avg = mean(rests);
                if (avg < goal.rest[0] * 0.7)
                    add(w, 'info', `Recupero medio ${Math.round(avg)} s: breve per ${goal.label.toLowerCase()} (indicato ${goal.rest[0]}-${goal.rest[1]} s).`);
                if (avg > goal.rest[1] * 1.5)
                    add(w, 'info', `Recupero medio ${Math.round(avg)} s: lungo per ${goal.label.toLowerCase()} (indicato ${goal.rest[0]}-${goal.rest[1]} s).`);
            }
        }
        // carico interno
        if (w.monotony !== null && w.monotony > 2)
            add(
                w,
                'warn',
                `Monotonia ${f1(w.monotony)} (> 2): carichi troppo simili tra i giorni, rischio di sovrallenamento. Alterna giorni pesanti e leggeri.`
            );
        if (w.acwr !== null && w.acwr > 1.5)
            add(w, 'alert', `Rapporto acuto:cronico ${f1(w.acwr)} (> 1,5): picco di carico rispetto alle settimane precedenti, zona di rischio infortuni.`);
        else if (w.acwr !== null && w.acwr > 1.3) add(w, 'warn', `Rapporto acuto:cronico ${f1(w.acwr)}: sopra la zona ottimale (0,8-1,3).`);
        else if (w.acwr !== null && w.acwr < 0.8 && !deload)
            add(w, 'info', `Rapporto acuto:cronico ${f1(w.acwr)}: carico in calo rispetto alle settimane precedenti (desallenamento o scarico).`);
        if (w.change !== null && w.change > 30) add(w, 'alert', `Carico settimanale +${Math.round(w.change)}% rispetto alla settimana precedente.`);
        else if (w.change !== null && w.change > 10 && w.acwr === null)
            add(w, 'info', `Carico settimanale +${Math.round(w.change)}% rispetto alla settimana precedente (regola pratica: non oltre +10%).`);
        // cardio per salute / dimagrimento
        if (goal && ['salute', 'dimagrimento'].includes(goal.id) && w.cardioMin < CARDIO_WEEKLY_MIN[0])
            add(
                w,
                'info',
                `Attività aerobica pianificata ${Math.round(w.cardioMin)} min: le linee guida indicano ${CARDIO_WEEKLY_MIN[0]}-${CARDIO_WEEKLY_MIN[1]} min/settimana (anche fuori dalla scheda).`
            );
    });
    return out;
};
