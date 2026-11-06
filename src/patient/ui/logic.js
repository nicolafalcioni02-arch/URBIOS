// Funzioni pure dell'interfaccia paziente (nessun React): lettura delle prescrizioni e chiavi del diario locale.
export const arr = (x) => (Array.isArray(x) ? x : []);
export const ymd = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const mmss = (s) => { const x = Math.max(0, Math.floor(s)); return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };

// «4x10», «3×8-10» → numero di serie e ripetizioni. Se non si capisce: 3 serie.
export const parseSets = (s) => {
    const t = String(s || '').trim();
    const m = /^(\d{1,2})\s*[x×*]\s*(.*)$/i.exec(t);
    if (m) return { n: Math.max(1, Math.min(12, +m[1])), reps: m[2].trim() };
    if (/^\d{1,2}$/.test(t)) return { n: Math.max(1, +t), reps: '' };
    return { n: 3, reps: t };
};
// «90s», «2'», «1,5 min», «90» → secondi di recupero (10–600). Non indicato: 60.
export const parseRest = (r) => {
    const m = /(\d+(?:[.,]\d+)?)\s*(min|m|')?/i.exec(String(r || ''));
    if (!m) return 60;
    const v = parseFloat(m[1].replace(',', '.')), sec = m[2] ? v * 60 : v <= 8 && !/s/i.test(String(r)) ? v * 60 : v;
    return Math.max(10, Math.min(600, Math.round(sec)));
};
export const estMinutes = (day) => Math.max(5, Math.round(arr(day && day.esercizi).reduce((t, e) => t + parseSets(e.serie).n * (40 + parseRest(e.rec)), 0) / 60));
export const mealKcal = (m) => arr(m && m.voci).reduce((t, v) => t + (v.kcal || 0), 0);

// Chiavi del diario (tutto resta sul telefono)
export const sessionKey = (docId, w, d, date = ymd()) => `${docId}|${w}|${d}|${date}`;
export const mealKey = (docId, d, m, date = ymd()) => `${docId}|${d}|${m}|${date}`;
export const setsDone = (log, key) => Object.values((log.sessions[key] && log.sessions[key].sets) || {}).reduce((t, a) => t + a.length, 0);
export const daySets = (day) => arr(day && day.esercizi).reduce((t, e) => t + parseSets(e.serie).n, 0);
export const eatenKcal = (log, date, docId, dayIdx, meals) => arr(meals).reduce((t, m, i) => { const r = log.meals[mealKey(docId, dayIdx, i, date)]; return t + (r ? r.kcal : 0); }, 0) + arr(log.extras[date]).reduce((t, x) => t + (x.kcal || 0), 0);

export const todayLabel = (t = Date.now()) => { const s = new Date(t).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
export const lastWeight = (log) => (log.weights.length ? log.weights[log.weights.length - 1] : null);
export const fmtKg = (x) => String(x).replace('.', ',');
// Primo pasto di oggi non ancora registrato (prima dieta, primo giorno): serve a «Cosa mangiamo?»
export const nextMeal = (docs, getDoc, log, date = ymd()) => {
    for (const meta of docs.filter((d) => d.kind === 'diet')) {
        const day = arr(getDoc(meta.docId) && getDoc(meta.docId).body && getDoc(meta.docId).body.giorni)[0];
        const i = arr(day && day.pasti).findIndex((_, k) => !log.meals[mealKey(meta.docId, 0, k, date)]);
        if (i >= 0) return { docId: meta.docId, d: 0, m: i };
    }
    return null;
};

export const fmtDay = (d) => String(d || '').split('-').reverse().slice(0, 2).join('/');
// Peso suggerito per oggi: semplice e prudente, parte da ciò che hai fatto l'ultima volta. Il carico indicato dal professionista prevale.
export const suggestLoad = (hist, name, prescribed, today = ymd()) => {
    const past = arr(hist[name]).filter((h) => h.date !== today && arr(h.sets).length);
    const last = past[past.length - 1];
    if (!last) return prescribed ? { kg: prescribed, why: 'Carico indicato dal professionista.' } : null;
    const kgs = last.sets.map((s) => s.kg).filter((x) => Number.isFinite(x)), rp = last.sets.map((s) => s.rpe).filter((x) => Number.isFinite(x));
    if (!kgs.length) return prescribed ? { kg: prescribed, why: 'Carico indicato dal professionista.' } : null;
    const top = Math.max(...kgs), r = rp.length ? Math.max(...rp) : null;
    const base = r !== null && r <= 7 ? { kg: +(top + 2.5).toFixed(1), why: `L'ultima volta ${top} kg con RPE ${r}: puoi salire un po'.` }
        : r !== null && r >= 9 ? { kg: top, why: `L'ultima volta RPE ${r}: tieni ${top} kg.` } : { kg: top, why: `Come l'ultima volta (${top} kg).` };
    return prescribed && prescribed !== base.kg ? { ...base, why: base.why + ` Il professionista indica ${prescribed} kg: se hai dubbi segui lui.` } : base;
};

// Stato di un allenamento (doc + settimana + giorno): fatto (tutte le serie, in una qualsiasi data), iniziato o da fare.
export const dayStatus = (log, docId, w, d, day) => {
    const tot = daySets(day), pre = `${docId}|${w}|${d}|`;
    let best = null, part = 0, partDate = null;
    for (const k of Object.keys(log.sessions)) {
        if (!k.startsWith(pre)) continue;
        const date = k.slice(pre.length), n = setsDone(log, k);
        if (tot && n >= tot) { if (!best || date > best) best = date; }
        else if (n > part || (n === part && n > 0 && date > (partDate || ''))) { part = n; partDate = date; }
    }
    if (best) return { state: 'done', date: best, done: tot, tot };
    if (part) return { state: 'part', date: partDate, done: part, tot };
    return { state: 'todo', done: 0, tot };
};
// Settimana da mostrare: la prima con almeno un allenamento non fatto (altrimenti l'ultima).
export const currentWeek = (log, docId, weeks) => {
    for (let w = 0; w < weeks.length; w++) if (arr(weeks[w].giorni).some((day, d) => dayStatus(log, docId, w, d, day).state !== 'done')) return w;
    return Math.max(0, weeks.length - 1);
};
// Strumenti del paziente nel diario (visita, appunti, spesa): crea i campi se mancano (anche nella modalità prova)
export const toolsOf = (log) => { const x = log.tools || (log.tools = {}); if (!Array.isArray(x.notes)) x.notes = []; if (!x.shop) x.shop = {}; if (x.visit === undefined) x.visit = null; if (!x.cfg) x.cfg = { days: 7, people: 1 }; return x; };

// Riepilogo di fine allenamento: kg sollevati (kg × ripetizioni prescritte, 10 se non indicate), confronto con l'ultima volta e nuovi record
export const repsNum = (s) => { const m = /\d+/.exec(String(s || '')); return m ? +m[0] : 10; };
const volOf = (sess, list) => Object.entries((sess && sess.sets) || {}).reduce((t, [i, a]) => t + arr(a).reduce((s, r) => s + (Number.isFinite(r.kg) ? r.kg * (r.reps || repsNum(list[i] && list[i].reps)) : 0), 0), 0);
export const workoutSummary = (log, docId, w, d, list, date = ymd()) => {
    const pre = `${docId}|${w}|${d}|`, cur = log.sessions[pre + date], vol = Math.round(volOf(cur, list));
    const olds = Object.keys(log.sessions).filter((k) => k.startsWith(pre) && k !== pre + date && k.slice(pre.length) < date).sort();
    const prevVol = olds.length ? Math.round(volOf(log.sessions[olds[olds.length - 1]], list)) : null;
    const records = [];
    list.forEach((e) => {
        const h = arr(log.hist[e.name]), today = h.find((x) => x.date === date), prev = h.filter((x) => x.date !== date).flatMap((x) => arr(x.sets).map((s) => s.kg)).filter(Number.isFinite);
        const top = today ? Math.max(0, ...arr(today.sets).map((s) => s.kg).filter(Number.isFinite)) : 0;
        if (prev.length && top > Math.max(...prev)) records.push({ name: e.name, kg: top });
    });
    return { vol, prevVol, records, sets: Object.values((cur && cur.sets) || {}).reduce((t, a) => t + arr(a).length, 0) };
};
export const HYPE_START = ['Spingi al massimo e divertiti!', 'Oggi si va forte: dai che ci siamo!', 'Un esercizio alla volta. Tu ce la fai!', 'Scalda i muscoli: si parte!'];
export const HYPE_BACK = ['Si riparte da dove eri: ottimo!', 'Bentrovati in palestra: continuiamo!'];
export const HYPE_END = ['Grande lavoro, oggi hai fatto la differenza!', 'Un allenamento in più nel tuo diario: bravissimo!', 'Costanza e impegno: i risultati arrivano così!', 'Ce l\'hai fatta. Ora riposa e recupera!'];
