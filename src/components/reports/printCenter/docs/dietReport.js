import { planDateInfo, planName } from '../../../patient/diet/guided/guidedLogic';
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

// Piano alimentare ridisegnato: obiettivi, indicazioni, un giorno per pagina con pasti e alternative, spesa, controlli
export const buildDietHtml = ({ patient: p, prof, visit: v, opts = {} }) => {
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

    if (part.days) {
        days.forEach((day, i) => {
            const tot = sumDay(day);
            const brk = part.pagePerDay && (i > 0 || out.length > 0) ? ' pc-break' : '';
            const meals = (day.meals || [])
                .filter((m) => (m.items || []).length)
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
            out.push(`<div class="d-day${brk}" data-title="${esc(day.title || `Giorno ${i + 1}`)}"><div class="d-day-h"><div><div class="d-kicker">Menu</div><h2 class="d-day-title">${esc(day.title || `Giorno ${i + 1}`)}</h2></div>${part.macros ? `<div class="d-day-tot">${macroLine(tot)}</div>` : ''}</div>${meals}</div>`);
        });
    }

    if (part.shopping) {
        const list = {};
        days.forEach((d) => (d.meals || []).forEach((m) => (m.items || []).forEach((it) => {
            if (it.name && num(it.weight)) list[it.name] = (list[it.name] || 0) + num(it.weight);
        })));
        const rows = Object.entries(list).sort((a, b) => a[0].localeCompare(b[0], 'it'));
        if (rows.length)
            out.push(`<div class="d-block${part.pagePerDay ? ' pc-break' : ''}"><h2 class="d-h">Lista della spesa</h2><p class="d-foot-note" style="margin:0 0 3mm">Quantità totali di ${days.length === 1 ? 'una giornata' : `tutte le ${days.length} giornate del piano`}, da adattare ai giorni della settimana.</p><div class="d-shop">${rows.map(([n, g]) => `<div><span class="d-box"></span><span>${esc(n)}</span><b>${Math.round(g)} g</b></div>`).join('')}</div></div>`);
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
