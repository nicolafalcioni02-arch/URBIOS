import { esc, fmtDate, multiline } from '../logic/visits';

// Ricettario: un piccolo libro di cucina firmato dallo studio, con le ricette salvate (db.diet_meal_library, kind 'ricetta').
// Frontespizio, lettera "Prima di cominciare", indice, una ricetta per pagina (o due, nella vista compatta) e chiusura.

export const COOKBOOK_VIEWS = [
    { id: 'compatto', label: 'Compatto', desc: 'Più ricette per pagina, meno fogli', icon: 'ph-rows' },
    { id: 'libro', label: 'Libro', desc: 'Una ricetta per pagina, con note da scrivere', icon: 'ph-book-open' },
];
export const COOKBOOK_DEFAULT_OPTS = { scope: 'piano', title: 'Il ricettario', intro: true, index: true, notes: false, closing: true, view: 'compatto' };

const n = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};
const r0 = (x) => Math.round(x).toLocaleString('it-IT');
const pad = (i) => String(i + 1).padStart(2, '0');

export const recipesOf = (db) => (db?.diet_meal_library || []).filter((m) => m && m.kind === 'ricetta');

// in quali pasti del piano compare ogni ricetta (per l'occhiello sopra il titolo)
const usesInPlan = (visit) => {
    const map = new Map();
    ((visit && visit.dettagli?.diet_plan_data) || []).forEach((d) =>
        (d.meals || []).forEach((m) =>
            (m.items || []).forEach((it) => {
                if (!it.recipeId) return;
                const s = map.get(it.recipeId) || new Set();
                s.add(m.title);
                map.set(it.recipeId, s);
            }),
        ),
    );
    return map;
};

// ricette da stampare: quelle del piano (se ce ne sono) oppure tutta la libreria
export const pickRecipes = (db, visit, scope, ids) => {
    const all = recipesOf(db).filter((r) => !ids || ids.includes(r.id)); // ids: ricette scelte dal Chef
    const uses = usesInPlan(visit);
    const inPlan = all.filter((r) => uses.has(r.id));
    const list = scope === 'tutte' || !inPlan.length ? all : inPlan;
    return { list, uses, fromPlan: list === inPlan && inPlan.length > 0 };
};

// ordine da libro: per pasto (colazione → cena), poi alfabetico
const COURSE_ORDER = ['colazione', 'spuntino', 'pranzo', 'merenda', 'cena', 'antipast', 'prim', 'second', 'contorn', 'dolc', 'snack'];
// pasto del piano; se la ricetta non è nel piano, la sua categoria (Primi, Dolci…). "Le altre ricette" solo accanto a ricette del piano
const courseOf = (r, uses, fromPlan) => {
    const m = uses.get(r.id);
    if (m && m.size) return [...m][0];
    return String(r.category || '').trim() || (fromPlan ? 'Le altre ricette' : 'Ricette');
};
const courseRank = (c) => {
    const i = COURSE_ORDER.findIndex((x) => String(c).toLowerCase().includes(x));
    return i < 0 ? 99 : i;
};

const perServing = (r) => {
    const sv = Math.max(1, n(r.servings) || 1);
    const t = r.totals || {};
    return { sv, grams: n(r.portionGrams), kcal: n(t.kcal) / sv, c: n(t.c) / sv, p: n(t.p) / sv, f: n(t.f) / sv };
};

const macroBar = (s) => {
    const kc = s.c * 4 + s.p * 4 + s.f * 9 || 1;
    const seg = (cls, label, g, k) => `<span class="${cls}" style="width:${((k / kc) * 100).toFixed(1)}%"></span>`;
    return `<div class="d-rb-macro"><div class="d-rb-bar">${seg('c', 'Carboidrati', s.c, s.c * 4)}${seg('p', 'Proteine', s.p, s.p * 4)}${seg('f', 'Grassi', s.f, s.f * 9)}</div>
<div class="d-rb-leg"><span><i class="c"></i>Carboidrati <b>${r0(s.c)} g</b></span><span><i class="p"></i>Proteine <b>${r0(s.p)} g</b></span><span><i class="f"></i>Grassi <b>${r0(s.f)} g</b></span></div></div>`;
};

const recipeHtml = (r, i, course, { notes, compact, breakBefore }) => {
    const s = perServing(r);
    const ings = (r.items || []).map((x) => `<li><span>${esc(x.name)}</span><i></i><b>${r0(n(x.weight))}&nbsp;g</b></li>`).join('');
    const steps = (r.steps || []).length
        ? `<ol class="d-rb-steps">${r.steps.map((t) => `<li>${multiline(t)}</li>`).join('')}</ol>`
        : '<p class="d-placeholder">Scrivi qui come si prepara.</p>';
    return `<section class="d-rb-recipe${compact ? ' compact' : ''}${breakBefore ? ' pc-break' : ''}">
<div class="d-rb-head"><span class="d-rb-num">${pad(i)}</span><div><span class="d-kicker">Ricetta n. ${i + 1} · ${esc(course)}</span><h2 class="d-title d-rb-title">${esc(r.title)}</h2></div></div>
<div class="d-rb-meta"><div><span>Porzioni</span><b>${s.sv}</b></div>${s.grams ? `<div><span>Una porzione</span><b>${r0(s.grams)} g</b></div>` : ''}<div><span>Energia a porzione</span><b>${r0(s.kcal)} kcal</b></div></div>
${macroBar(s)}
<div class="d-rb-cols"><div class="d-rb-ings"><h3 class="d-rb-h">Ingredienti <small>per ${s.sv} ${s.sv === 1 ? 'porzione' : 'porzioni'}</small></h3><ul>${ings}</ul></div>
<div class="d-rb-prep"><h3 class="d-rb-h">Preparazione</h3>${steps}</div></div>
${r.note ? `<div class="d-rb-tip"><b>Il consiglio</b><p>${multiline(r.note)}</p></div>` : ''}
${notes && !compact ? '<div class="d-rb-notes"><b>Le tue note</b><i></i><i></i><i></i><i></i></div>' : ''}
</section>`;
};

export const buildCookbookHtml = ({ patient: p, prof, db, visit, opts = {} }) => {
    const o = { ...COOKBOOK_DEFAULT_OPTS, ...opts };
    const compact = o.view !== 'libro';
    const { list, uses, fromPlan } = pickRecipes(db, visit, o.scope, o.ids);
    if (!list.length) return '<div class="d-doc"><p class="d-placeholder">Non ci sono ancora ricette salvate: si creano dal piano alimentare, con il pulsante «Ricetta».</p></div>';
    const recipes = [...list].sort((a, b) => courseRank(courseOf(a, uses, fromPlan)) - courseRank(courseOf(b, uses, fromPlan)) || a.title.localeCompare(b.title, 'it'));
    const author = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    const role = prof.titolo_professionale || '';
    const patientName = `${p.nome || ''} ${p.cognome || ''}`.trim();
    const month = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    const sig = author ? `<div class="d-sig">${esc(author)}</div>` : '';

    const initials = (author || 'R')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
    const front = `<section class="d-rb-front"><div class="d-rb-frame">
<div class="d-rb-mono"><span>${esc(initials)}</span></div>
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-kicker">${fromPlan ? 'Le ricette del tuo piano' : 'Ricette sane e golose'}</div>
<h1 class="d-title d-rb-booktitle">${esc(o.title || 'Il ricettario')}</h1>
<p class="d-rb-for">${patientName ? `pensato per <b>${esc(patientName)}</b>` : 'pensato per te'}</p>
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-rb-by"><small>a cura di</small><b>${esc(author || 'Il tuo nutrizionista')}</b>${role ? `<span>${esc(role)}</span>` : ''}</div>
${sig}
<div class="d-rb-ed">${recipes.length} ${recipes.length === 1 ? 'ricetta' : 'ricette'} · Edizione ${esc(month)}</div>
</div></section>`;

    const intro = o.intro
        ? `<section class="d-rb-intro pc-break"><h2 class="d-h">Prima di cominciare</h2>
<div class="d-prose"><p>${p.nome ? `${String(p.sesso || '').toUpperCase().startsWith('M') ? 'Caro' : String(p.sesso || '').toUpperCase().startsWith('F') ? 'Cara' : 'Ciao'} ${esc(p.nome)}` : 'Ciao'}, queste ricette sono state scelte per accompagnare il tuo percorso: buone, semplici da preparare e con le giuste quantità.</p>
<p>Ogni ricetta indica per quante porzioni sono pensati gli ingredienti, quanto pesa una porzione e quanta energia ti dà. Se nel tuo piano trovi una ricetta, mangiane la quantità indicata lì.</p>
<p>Prova, assaggia, prendi appunti negli spazi in fondo alle pagine: alla prossima visita ne parliamo insieme.</p></div>
${sig}
<div class="d-rb-legend"><div><b>N. 01</b><span>il numero della ricetta, come nell'indice</span></div><div><b>kcal</b><span>energia di una porzione</span></div><div><i class="c"></i><i class="p"></i><i class="f"></i><span>carboidrati, proteine e grassi di una porzione</span></div></div>
</section>`
        : '';

    const idx = o.index
        ? (() => {
              const groups = [];
              recipes.forEach((r, i) => {
                  const c = courseOf(r, uses, fromPlan);
                  let g = groups.find((x) => x.c === c);
                  if (!g) groups.push((g = { c, rows: [] }));
                  g.rows.push(`<div class="d-rb-idx-r"><span class="d-rb-idx-n">${pad(i)}</span><span>${esc(r.title)}</span><i></i><small>${r0(perServing(r).kcal)} kcal</small></div>`);
              });
              return `<section class="d-rb-index${o.intro ? ' d-rb-after' : ' pc-break'}"><h2 class="d-h">Indice delle ricette</h2>${groups.map((g) => `<div class="d-rb-idx-g"><h3 class="d-rb-h">${esc(g.c)}</h3>${g.rows.join('')}</div>`).join('')}</section>`;
          })()
        : '';

    const body = recipes.map((r, i) => recipeHtml(r, i, courseOf(r, uses, fromPlan), { notes: o.notes, compact, breakBefore: !compact || (i === 0 && (o.intro || o.index)) })).join('');

    const closing = o.closing
        ? `<section class="d-rb-end${compact ? ' d-rb-endc' : ' pc-break'}"><div class="d-rb-orn"><span></span><i>✦</i><span></span></div><h2 class="d-title d-rb-booktitle small">Buon appetito!</h2>
<p class="d-rb-for">Cucinare per sé è un gesto di cura. Grazie per averlo fatto insieme a noi.</p>${sig}
<div class="d-rb-contacts">${[prof.indirizzo_studio, prof.citta_studio, prof.telefono, prof.email].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('')}</div>
<div class="d-rb-ed">${esc(fmtDate(new Date()))}</div></section>`
        : '';

    return `<div class="d-doc d-rb">${front}${intro}${idx}${body}${closing}</div>`;
};
