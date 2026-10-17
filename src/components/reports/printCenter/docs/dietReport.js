import { planDateInfo, planName } from '../../../patient/diet/guided/guidedLogic';
import { defaultFoodDB } from '../../../patient/diet/data/defaultFoodDB';
import { esc, fmt, fmtDate, num } from '../logic/visits';
import { mastheadHtml, signHtml, titleHtml } from './visitReport';

// parti del piano alimentare che si possono includere o togliere
export const DIET_PARTS = [
    ['cover', 'Obiettivi del piano'],
    ['settings', 'Indicazioni e integratori'],
    ['days', 'Menu dei giorni'],
    ['pagePerDay', 'Un giorno per pagina'],
    ['macros', 'Valori nutrizionali degli alimenti'],
    ['shopping', 'Lista della spesa'],
    ['diary', 'Diario alimentare da compilare'],
    ['final', 'Controlli, avvertenze e firma'],
];
export const DIET_DEFAULT_PARTS = { cover: true, settings: true, days: true, pagePerDay: true, macros: true, shopping: true, diary: false, final: true };

const DISCLAIMER =
    'Piano nutrizionale strettamente personale, elaborato sulle caratteristiche del paziente: non va ceduto a terzi. Le indicazioni non sostituiscono il parere del medico curante; eventuali variazioni dello stato di salute o terapie in corso vanno comunicate al professionista.';

const itemValues = (it) => {
    const r = num(it.weight) / 100;
    return { kcal: num(it.kcal) * r, c: num(it.c) * r, p: num(it.p) * r, f: num(it.f) * r };
};
const sumMeal = (meal) => (meal.items || []).reduce((a, it) => {
    const v = itemValues(it);
    return { kcal: a.kcal + v.kcal, c: a.c + v.c, p: a.p + v.p, f: a.f + v.f };
}, { kcal: 0, c: 0, p: 0, f: 0 });
const sumDay = (day) => (day.meals || []).map(sumMeal).reduce((a, m) => ({ kcal: a.kcal + m.kcal, c: a.c + m.c, p: a.p + m.p, f: a.f + m.f }), { kcal: 0, c: 0, p: 0, f: 0 });
const macroLine = (v) => `${Math.round(v.kcal)} kcal · C ${fmt(v.c) || 0} g · P ${fmt(v.p) || 0} g · G ${fmt(v.f) || 0} g`;

// modi di mostrare il menu dei giorni (opzione "Come mostrarlo")
export const DIET_VIEWS = [
    { id: 'giorni', label: 'Giorno per giorno', desc: 'Ogni pasto con grammi e valori', icon: 'ph-rows' },
    { id: 'settimana', label: 'Settimana in tabella', desc: 'Tutti i giorni in un colpo d\u2019occhio', icon: 'ph-table' },
    { id: 'schede', label: 'Schede dei giorni', desc: 'Un riquadro per giorno, affiancati', icon: 'ph-squares-four' },
    { id: 'elenco', label: 'Elenco essenziale', desc: 'Solo testo, il più breve possibile', icon: 'ph-list-dashes' },
];

const dayTitle = (day, i) => day.title || `Giorno ${i + 1}`;
const mealsOf = (day) => (day.meals || []).filter((m) => (m.items || []).length);
const foodLine = (it) => `${esc(it.name)}${it.weight ? ` ${esc(it.weight)}&nbsp;g` : ''}`;
const subsText = (it) => ((it.subs || []).length ? ` <span class="d-alt">o ${(it.subs || []).map(foodLine).join(', o ')}</span>` : '');

// settimana in tabella: righe = giorni, colonne = pasti (nell'ordine in cui compaiono)
const weekTableHtml = (days, part, brk) => {
    const titles = [];
    days.forEach((d) => mealsOf(d).forEach((m) => !titles.includes(m.title) && titles.push(m.title)));
    const head = `<tr><th>Giorno</th>${titles.map((t) => `<th>${esc(t)}</th>`).join('')}</tr>`;
    const rows = days
        .map((day, i) => {
            const cells = titles
                .map((t) => {
                    const m = mealsOf(day).find((x) => x.title === t);
                    return `<td>${m ? m.items.map((it) => `<div class="d-wk-f">${foodLine(it)}${subsText(it)}</div>`).join('') : '<span class="d-placeholder">—</span>'}</td>`;
                })
                .join('');
            return `<tr><th class="d-wk-day">${esc(dayTitle(day, i))}${part.macros ? `<small>${Math.round(sumDay(day).kcal)} kcal</small>` : ''}</th>${cells}</tr>`;
        })
        .join('');
    return `<div class="d-block${brk}"><h2 class="d-h">Il menu della settimana</h2><table class="d-table d-week"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
};

// schede dei giorni: riquadri affiancati, i pasti in una riga di testo
const dayCardsHtml = (days, part, brk) =>
    `<div class="d-block${brk}"><h2 class="d-h">I tuoi menu</h2><div class="d-cards">${days
        .map(
            (day, i) => `<div class="d-card"><div class="d-card-h"><b>${esc(dayTitle(day, i))}</b>${part.macros ? `<em>${Math.round(sumDay(day).kcal)} kcal</em>` : ''}</div>${mealsOf(day)
                .map((m) => `<div class="d-card-m"><span>${esc(m.title)}</span><p>${m.items.map((it) => `${foodLine(it)}${subsText(it)}`).join(' · ')}</p></div>`)
                .join('')}</div>`,
        )
        .join('')}</div></div>`;

// elenco essenziale: una riga per pasto, niente valori
const plainListHtml = (days, brk) =>
    `<div class="d-block${brk}"><h2 class="d-h">Cosa mangiare</h2>${days
        .map((day, i) => `<div class="d-ls"><h3 class="d-ls-day">${esc(dayTitle(day, i))}</h3>${mealsOf(day).map((m) => `<p><b>${esc(m.title)}</b> ${m.items.map((it) => `${foodLine(it)}${subsText(it)}`).join(', ')}</p>`).join('')}</div>`)
        .join('')}</div>`;

// ---- lista della spesa della settimana ----
// quante volte ogni giornata tipo capita in 7 giorni: con 7 giorni (o più) ciascuno vale una volta,
// altrimenti i 7 giorni si dividono tra le giornate tipo (2 → 4 + 3) e il professionista può cambiarlo
export const defaultWeekDays = (n) => {
    if (n >= 7) return Array.from({ length: n }, () => 1);
    return Array.from({ length: n }, (_, i) => Math.floor(7 / n) + (i < 7 % n ? 1 : 0));
};
export const weekDaysOf = (n, saved) => {
    const def = defaultWeekDays(n);
    return def.map((d, i) => {
        const x = parseInt(saved?.[i], 10);
        return Number.isFinite(x) && x >= 0 ? x : d;
    });
};
// reparti del supermercato, dalle categorie del database alimenti
const AISLES = [
    ['Frutta e verdura', ['Verdure e ortaggi', 'Frutta']],
    ['Pane, pasta e cereali', ['Cereali e derivati']],
    ['Carne e pesce', ['Carni fresche', 'Carni trasformate e conservate', 'Frattaglie', 'Prodotti della pesca', 'Fast-food a base di carne']],
    ['Latte, latticini e uova', ['Latte e yogurt', 'Formaggi e latticini', 'Uova']],
    ['Legumi, frutta secca e semi', ['Legumi', 'Frutta secca a guscio e semi oleaginosi']],
    ['Dispensa', ['Oli e grassi', 'Prodotti vari', 'Dolci', 'Ricette Italiane', 'Alimenti Etnici', 'Bevande alcoliche']],
];
const aisleOf = (cat) => (AISLES.find(([, cats]) => cats.includes(cat)) || ['Altro'])[0];
// quantità comode da comprare: per eccesso, ai 5 o 10 g, in kg sopra il chilo
const qty = (g) => {
    if (g >= 1000) return `${(Math.ceil(g / 100) / 10).toLocaleString('it-IT')} kg`;
    return `${g >= 100 ? Math.ceil(g / 10) * 10 : Math.ceil(g / 5) * 5} g`;
};

const weeklyShoppingHtml = (days, saved, foods) => {
    if (!days.length) return '';
    const times = weekDaysOf(days.length, saved);
    const factor = days.length > 7 ? 7 / days.length : 1; // piano più lungo di una settimana: si riporta a 7 giorni
    const cat = new Map((foods || []).map((f) => [f.name, f.category]));
    const list = new Map();
    days.forEach((d, i) =>
        (d.meals || []).forEach((m) =>
            (m.items || []).forEach((it) => {
                const g = num(it.weight) * times[i] * factor;
                if (it.name && g) list.set(it.name, (list.get(it.name) || 0) + g);
            }),
        ),
    );
    if (!list.size) return '';
    const groups = [...AISLES.map(([a]) => a), 'Altro']
        .map((a) => [a, [...list].filter(([n]) => aisleOf(cat.get(n)) === a).sort((x, y) => x[0].localeCompare(y[0], 'it'))])
        .filter(([, rows]) => rows.length);
    const how =
        days.length === 7
            ? 'Per i 7 giorni del piano.'
            : days.length > 7
              ? `Per 7 giorni (il piano ne ha ${days.length}: le quantità sono riportate a una settimana).`
              : `Per ${times.reduce((a, b) => a + b, 0)} giorni: ${days.map((d, i) => `${esc(dayTitle(d, i))} × ${times[i]}`).join(', ')}.`;
    return `<h2 class="d-h">Lista della spesa della settimana</h2><p class="d-foot-note" style="margin:0 0 3mm">${how} Quantità arrotondate per eccesso; le alternative ("oppure") non sono comprese.</p>${groups
        .map(([a, rows]) => `<div class="d-aisle"><h3 class="d-aisle-h">${a}</h3><div class="d-shop">${rows.map(([n, g]) => `<div><span class="d-box"></span><span>${esc(n)}${/^uova\b/i.test(n) ? ` <small>(circa ${Math.max(1, Math.round(g / 60))})</small>` : ''}</span><b>${qty(g)}</b></div>`).join('')}</div></div>`)
        .join('')}`;
};

// Piano alimentare ridisegnato: obiettivi, indicazioni, un giorno per pagina con pasti e alternative, spesa, controlli
export const buildDietHtml = ({ patient: p, prof, visit: v, opts = {}, foods = defaultFoodDB }) => {
    const part = { ...DIET_DEFAULT_PARTS, ...(opts.parts || {}) };
    const dt = v.dettagli || {};
    const days = (dt.diet_plan_data || []).filter((d) => (d.meals || []).some((m) => (m.items || []).length));
    const t = dt.diet_targets || {};
    const di = planDateInfo(v);
    const name = planName(v);
    const out = [];

    if (part.cover) {
        out.push(mastheadHtml(prof));
        out.push(titleHtml({ kicker: 'Piano alimentare', title: `${p.nome || ''} ${p.cognome || ''}`.trim(), sub: name || `${days.length} ${days.length === 1 ? 'giornata tipo' : 'giornate tipo'}`, dateLabel: 'Valido dal', date: di.none ? '' : fmtDate(di.iso) }));
        if (t.isConfigured) {
            const g = { c: (t.kcal * t.c) / 400, p: (t.kcal * t.p) / 400, f: (t.kcal * t.f) / 900 };
            out.push(`<div class="d-kpis d-kpis-4">
                <div class="d-kpi"><span>Energia</span><b>${Math.round(t.kcal)}<small> kcal</small></b><em>al giorno, in media</em></div>
                <div class="d-kpi"><span>Carboidrati</span><b>${Math.round(g.c)}<small> g</small></b><em>${t.c}% dell'energia</em></div>
                <div class="d-kpi"><span>Proteine</span><b>${Math.round(g.p)}<small> g</small></b><em>${t.p}% dell'energia</em></div>
                <div class="d-kpi"><span>Grassi</span><b>${Math.round(g.f)}<small> g</small></b><em>${t.f}% dell'energia</em></div>
            </div>`);
        }
    }

    if (part.settings) {
        const notes = (Array.isArray(dt.diet_notes) ? dt.diet_notes : String(dt.diet_notes || '').split('\n')).map((x) => String(x).trim()).filter(Boolean);
        const supp = (dt.diet_supplements || []).filter((s) => s && s.name);
        const comments = (dt.diet_saved_reports || []).filter((r) => r?.config?.comment).map((r) => r.config.comment);
        if (notes.length) out.push(`<h2 class="d-h">Indicazioni per te</h2><ul class="d-list">${notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`);
        if (supp.length) out.push(`<h2 class="d-h">Integratori</h2><table class="d-table"><thead><tr><th>Prodotto</th><th>Dose</th><th>Quando</th></tr></thead><tbody>${supp.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.dose || '')}</td><td>${esc(s.when || '')}</td></tr>`).join('')}</tbody></table>`);
        if (comments.length) out.push(`<h2 class="d-h">Note del professionista</h2><div class="d-prose">${comments.map((c) => `<p>${esc(c)}</p>`).join('')}</div>`);
    }

    if (part.days && days.length) {
        const view = DIET_VIEWS.some((x) => x.id === opts.view) ? opts.view : 'giorni';
        const brk = ''; // le viste compatte continuano sulla stessa pagina: lo scopo è stare in meno fogli
        if (view === 'settimana') out.push(weekTableHtml(days, part, brk));
        else if (view === 'schede') out.push(dayCardsHtml(days, part, brk));
        else if (view === 'elenco') out.push(plainListHtml(days, brk));
        else
            days.forEach((day, i) => {
                const tot = sumDay(day);
                const dbrk = part.pagePerDay && (i > 0 || out.length > 0) ? ' pc-break' : '';
                const meals = mealsOf(day)
                    .map((m) => {
                        const ms = sumMeal(m);
                        const rows = m.items
                            .map((it) => {
                                const subs = (it.subs || [])
                                    .map((s) => `<tr class="d-sub"><td><span class="d-or">oppure</span> ${esc(s.name)}${part.macros ? `<small>${macroLine(itemValues(s))}</small>` : ''}</td><td>${esc(s.weight)} g</td></tr>`)
                                    .join('');
                                return `<tr><td><b>${esc(it.name)}</b>${part.macros ? `<small>${macroLine(itemValues(it))}</small>` : ''}</td><td>${esc(it.weight)} g</td></tr>${subs}`;
                            })
                            .join('');
                        return `<div class="d-meal"><div class="d-meal-h"><span>${esc(m.title)}</span>${part.macros ? `<em>${Math.round(ms.kcal)} kcal</em>` : ''}</div><table class="d-foods"><tbody>${rows}</tbody></table></div>`;
                    })
                    .join('');
                out.push(`<div class="d-day${dbrk}" data-title="${esc(dayTitle(day, i))}"><div class="d-day-h"><div><div class="d-kicker">Menu</div><h2 class="d-day-title">${esc(dayTitle(day, i))}</h2></div>${part.macros ? `<div class="d-day-tot">${macroLine(tot)}</div>` : ''}</div>${meals}</div>`);
            });
    }

    if (part.shopping) {
        const html = weeklyShoppingHtml(days, opts.weekDays, foods);
        if (html) out.push(`<div class="d-block${part.pagePerDay ? ' pc-break' : ''}">${html}</div>`);
    }

    if (part.diary) {
        days.forEach((day, i) => {
            out.push(`<div class="d-block pc-break"><h2 class="d-h">Diario alimentare · ${esc(day.title || `Giorno ${i + 1}`)}</h2><p class="d-foot-note" style="margin:0 0 4mm">Annota cosa mangi e bevi: ci aiuterà alla prossima visita.</p>${(day.meals || []).map((m) => `<div class="d-diary"><b>${esc(m.title)}</b><i></i><i></i></div>`).join('')}</div>`);
        });
    }

    if (part.final) {
        out.push(`<div class="d-block${part.pagePerDay ? ' pc-break' : ''}"><h2 class="d-h">I tuoi controlli</h2><table class="d-table d-check"><thead><tr><th>Data</th><th>Peso (kg)</th><th>Vita (cm)</th><th>Fianchi (cm)</th><th>Note</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(6)}</tbody></table>${signHtml(prof, DISCLAIMER)}</div>`);
    }

    return `<div class="d-doc">${out.join('\n')}</div>`;
};
