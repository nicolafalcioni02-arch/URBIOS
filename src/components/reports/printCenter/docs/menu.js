import { esc, fmtDate, multiline } from '../logic/visits';
import { titoloProf } from '../../../../logic/titolo';
import { dishNutrition, menuTotals, normalizeMenu } from '../../../../chef/chefLogic';

// Menù: una carta in portate (db.chef_menus) con i piatti del ricettario, le calorie e i macro di ogni piatto
// e, in fondo, i grafici del menù (calorie per portata e ripartizione dei macro): pensato anche per locali ed eventi.

export const MENU_VIEWS = [
    { id: 'foglio', label: 'Foglio A4', desc: 'Il menù su un foglio intero, con i dettagli di ogni piatto', icon: 'ph-file-text' },
    { id: 'tavola', label: 'Da tavola', desc: 'Carte strette da ritagliare, 2 per foglio: una per ogni posto', icon: 'ph-cards' },
];
export const COVER_TEXT = 'Questo è quello che ho pensato per il tuo giorno speciale';
export const MENU_DEFAULT_OPTS = { menuId: '', view: 'foglio', cover: true, coverText: COVER_TEXT, eventName: '', location: '', copies: 4, subtitle: true, ingredients: true, grams: false, macros: true, charts: true, intro: true, footer: true, specials: true };

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');
const kc = (x) => x.c * 4 + x.p * 4 + x.f * 9 || 1;

export const menusOf = (db) => (db?.chef_menus || []).map(normalizeMenu);
export const pickMenu = (db, id) => {
    const all = menusOf(db);
    return all.find((m) => m.id === id) || all[0] || null;
};

const macroLine = (s) => {
    const t = kc(s);
    const seg = (cls, k) => `<span class="${cls}" style="width:${((k / t) * 100).toFixed(1)}%"></span>`;
    return `<div class="d-mn-macro"><div class="d-rb-bar">${seg('c', s.c * 4)}${seg('p', s.p * 4)}${seg('f', s.f * 9)}</div>
<div class="d-mn-g"><span>Carbo <b>${r0(s.c)} g</b></span><span>Proteine <b>${r0(s.p)} g</b></span><span>Grassi <b>${r0(s.f)} g</b></span></div></div>`;
};

const donut = (s) => {
    const t = kc(s);
    const R = 38;
    const C = 2 * Math.PI * R;
    const parts = [['c', s.c * 4, 'var(--accent)'], ['p', s.p * 4, 'color-mix(in srgb, var(--accent) 55%, #fff)'], ['f', s.f * 9, 'color-mix(in srgb, var(--accent) 22%, #fff)']];
    let off = 0;
    const arcs = parts
        .map(([, k, col]) => {
            const len = (k / t) * C;
            const el = `<circle cx="50" cy="50" r="${R}" fill="none" style="stroke:${col}" stroke-width="13" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
            off += len;
            return el;
        })
        .join('');
    return `<svg viewBox="0 0 100 100" class="d-mn-donut"><circle cx="50" cy="50" r="${R}" fill="none" stroke="#eeeef0" stroke-width="13"/>${arcs}
<text x="50" y="49" text-anchor="middle" class="d-mn-dk">${r0(s.kcal)}</text><text x="50" y="60" text-anchor="middle" class="d-mn-ds">kcal</text></svg>`;
};

export const buildMenuHtml = ({ prof, db, opts = {} }) => {
    const o = { ...MENU_DEFAULT_OPTS, ...opts };
    const menu = pickMenu(db, o.menuId);
    if (!menu) return '<div class="d-doc"><p class="d-placeholder">Non c’è ancora nessun menù: si crea da Chef, nella scheda «Menù».</p></div>';
    const byId = Object.fromEntries((db?.diet_meal_library || []).filter((m) => m && m.kind === 'ricetta').map((r) => [r.id, r]));
    const author = [prof?.nome, prof?.cognome].filter(Boolean).join(' ');
    // firma piccola: «Dott. Nome Cognome» e, sotto, la location o il catering
    const credit = `<div class="d-mn-credit">${author ? `<span>${titoloProf(prof)} ${esc(author)}</span>` : ''}${o.location ? `<b>${esc(o.location)}</b>` : ''}</div>`;
    const hasCredit = Boolean(author || o.location);
    const forWho = o.eventName && o.eventName !== menu.title ? `<div class="d-kicker d-mn-for">${esc(o.eventName)}</div>` : '';

    const sections = menu.sections
        .map((s) => ({ ...s, rows: s.dishes.filter((d) => byId[d.rid]).map((d) => ({ r: byId[d.rid], d, ps: dishNutrition(byId[d.rid], d) })) }))
        .filter((s) => s.rows.length);
    if (!sections.length) return '<div class="d-doc"><p class="d-placeholder">Questo menù non ha ancora piatti: aggiungili da Chef.</p></div>';

    const head = `<section class="d-mn-head${o.cover || (o.intro && o.view !== 'tavola') ? ' pc-break' : ''}"><div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
${forWho}
<h1 class="d-title d-mn-title">${esc(menu.title)}</h1>
${o.subtitle && menu.subtitle ? `<p class="d-mn-sub">${esc(menu.subtitle)}</p>` : ''}
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>${hasCredit ? credit : ''}</section>`;

    const swap = (sp) => (name) => {
        const n = String(name).toLowerCase();
        const b = (sp?.subs || []).find((x) => x.from && x.to && n.includes(x.from.trim().toLowerCase()));
        return b ? b.to : name;
    };
    const bodyOf = (sp) => {
        const sw = swap(sp);
        const kids = sp?.kind === 'bimbi' ? sp.dishes.filter((d) => byId[d.rid]).map((d) => ({ r: byId[d.rid], d, ps: dishNutrition(byId[d.rid], d) })) : [];
        return (kids.length ? [{ id: 'k', name: 'Menù bimbi', rows: kids }] : sections)
        .map((s) => {
            const dishes = s.rows
                .map(({ r, ps }) => {
                    const ing = o.ingredients ? ps.items.slice(0, 10).map((x) => `${esc(sw(x.name).split(',')[0])}${o.grams ? ` ${r0(x.grams)} g` : ''}`).join(' · ') : '';
                    return `<div class="d-mn-dish"><div class="d-mn-dtop"><h3 class="d-mn-dname">${esc(r.title)}</h3><i></i><b>${r0(ps.kcal)} kcal</b></div>
${ing ? `<p class="d-mn-ing">${ing}</p>` : ''}${o.macros ? macroLine(ps) : ''}</div>`;
                })
                .join('');
            return `<section class="d-mn-sec"><h2 class="d-mn-h">${esc(s.name)}</h2>${dishes}</section>`;
        })
        .join('');
    };
    const body = bodyOf(null);
    const specialsHtml = o.specials && o.view !== 'tavola'
        ? (menu.specials || []).map((sp) => ({ ...sp, dishes: sp.dishes || [] })).filter((sp) => sp.name || sp.who || (sp.subs || []).some((b) => b.from && b.to) || sp.dishes.length)
              .map((sp) => `<section class="d-mn-head pc-break"><div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-kicker d-mn-for">${sp.kind === 'bimbi' ? 'Menù bimbi' : 'Menù special'}${sp.name ? ` · ${esc(sp.name)}` : ''}</div>
${sp.who ? `<p class="d-mn-sub">per ${esc(sp.who)}</p>` : ''}
<h1 class="d-title d-mn-title">${esc(menu.title)}</h1>${o.subtitle && menu.subtitle ? `<p class="d-mn-sub">${esc(menu.subtitle)}</p>` : ''}
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div></section>${bodyOf(sp)}`)
              .join('')
        : '';

    let charts = '';
    if (o.charts) {
        const tot = menuTotals(menu, byId);
        const per = sections.map((s) => ({ name: s.name, kcal: s.rows.reduce((a, x) => a + x.ps.kcal, 0) }));
        const max = Math.max(1, ...per.map((x) => x.kcal));
        const t = kc(tot);
        const leg = [['c', 'Carboidrati', tot.c, tot.c * 4], ['p', 'Proteine', tot.p, tot.p * 4], ['f', 'Grassi', tot.f, tot.f * 9]]
            .map(([cls, l, g, k]) => `<div class="d-mn-lg"><i class="${cls}"></i><span>${l}</span><b>${r0(g)} g</b><em>${Math.round((k / t) * 100)}%</em></div>`)
            .join('');
        const all = sections.flatMap((s) => s.rows.map((x) => ({ name: x.r.title, kcal: x.ps.kcal })));
        const maxD = Math.max(1, ...all.map((x) => x.kcal));
        const dishBars = all
            .sort((a, b) => b.kcal - a.kcal)
            .map((x) => `<div class="d-mn-br"><span>${esc(x.name)}</span><div><i style="width:${((x.kcal / maxD) * 100).toFixed(1)}%"></i></div><em>${r0(x.kcal)}</em></div>`)
            .join('');
        charts = `<section class="d-mn-charts pc-break"><h2 class="d-h">Il menù in numeri</h2>
<p class="d-mn-note">Valori per una porzione di ogni piatto.</p>
<div class="d-mn-grid"><div class="d-mn-card d-chart">${donut(tot)}<div class="d-mn-legend">${leg}</div></div>
<div class="d-mn-card d-chart"><h3 class="d-rb-h">Calorie per portata</h3>${per.map((x) => `<div class="d-mn-br"><span>${esc(x.name)}</span><div><i style="width:${((x.kcal / max) * 100).toFixed(1)}%"></i></div><em>${r0(x.kcal)}</em></div>`).join('')}</div></div>
<div class="d-mn-card wide d-chart"><h3 class="d-rb-h">Calorie per piatto <small>kcal a porzione</small></h3>${dishBars}</div></section>`;
    }

    // pagina «Ecco come ho pensato i piatti»: prima dei piatti, spiega da dove vengono i numeri
    const introHtml = o.intro && o.view !== 'tavola'
        ? `<section class="d-mn-intro pc-break"><div class="d-rb-orn"><span></span><i>✦</i><span></span></div><div class="d-kicker">Prima di leggere il menù</div>
<h1 class="d-title d-mn-title">Ecco come ho pensato i piatti</h1>
<p class="d-mn-sub">I calcoli nutrizionali sono su queste proporzioni: eventuali variazioni comportano una ripartizione differente!</p>
<div class="d-mn-ilist">${sections.map((s) => `<div><b>${esc(s.name)}</b><span>${s.rows.map((x) => esc(x.r.title)).join(' · ')}</span><em>${r0(s.rows.reduce((a, x) => a + x.ps.kcal, 0))} kcal</em></div>`).join('')}</div>
<p class="d-mn-note">Ogni piatto riporta le calorie e i macro di una porzione.</p></section>`
        : '';

    const initials = (author || 'M').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    const month = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    const cover = o.cover
        ? `<div class="d-rb"><section class="d-rb-front"><div class="d-rb-frame">
<div class="d-rb-mono"><span>${esc(initials)}</span></div>
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-kicker">${esc(menu.title)}</div>
<h1 class="d-title d-mn-covertitle">${esc(o.coverText || COVER_TEXT)}</h1>
${o.eventName && o.eventName !== menu.title ? `<p class="d-rb-for">per <b>${esc(o.eventName)}</b></p>` : ''}
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-rb-by"><small>a cura di</small>${author ? `<b>${titoloProf(prof)} ${esc(author)}</b>` : ''}${o.location ? `<span>${esc(o.location)}</span>` : ''}</div>
<div class="d-rb-ed">${esc(month)}</div>
</div></section></div>`
        : '';

    // carte da tavola: stretti rettangoli da ritagliare, con i nomi dei piatti; 2 per foglio.
    // Menù normale: `copies` carte uguali. Special: una carta a testa col nome dell'ospite (se c'è), altrimenti senza nome per il numero di ospiti;
    // il menù bimbi ne ha una sola, senza nome. Nei piatti toccati dalle sostituzioni compare cosa cambia.
    let main = `${head}${body}`;
    if (o.view === 'tavola') {
        const cardOf = (rows, who, sp) => {
            const dishCount = rows.reduce((a, x) => a + x.rows.length, 0);
            const size = dishCount > 10 ? 'sm' : dishCount > 6 ? 'md' : 'lg';
            const subs = (sp?.subs || []).filter((b) => b.from && b.to);
            const change = (ps) => {
                const hits = subs.filter((b) => ps.items.some((i) => String(i.name).toLowerCase().includes(b.from.trim().toLowerCase())));
                return hits.length ? `<em>${hits.map((b) => esc(b.to)).join(', ')}</em>` : '';
            };
            return `<div class="d-mn-tcard ${size}"><div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
${forWho}<h1 class="d-title d-mn-ttitle">${esc(menu.title)}</h1>${o.subtitle && menu.subtitle ? `<p class="d-mn-tsub">${esc(menu.subtitle)}</p>` : ''}
${who ? `<p class="d-mn-twho">${esc(who)}</p>` : sp ? `<p class="d-mn-twho">${esc(sp.kind === 'bimbi' ? 'Menù bimbi' : sp.name || 'Menù special')}</p>` : ''}
${rows.map((s) => `<div class="d-mn-tsec"><h2>${esc(s.name)}</h2>${s.rows.map((x) => `<p>${esc(x.r.title)}${change(x.ps)}${o.macros && !sp ? `<small>${r0(x.ps.kcal)} kcal</small>` : ''}</p>`).join('')}</div>`).join('')}
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>${hasCredit ? credit : ''}</div>`;
        };
        const sheetsOf = (cards, first) => {
            const out = [];
            for (let i = 0; i < cards.length; i += 2) out.push(`<section class="d-mn-sheet${out.length || first ? ' pc-break' : ''}">${cards[i]}${cards[i + 1] || '<div class="d-mn-tcard empty"></div>'}</section>`);
            return out.join('');
        };
        const std = cardOf(sections, '', null);
        const stdCards = Array.from({ length: Math.max(1, Number(o.copies) || 2) }, () => std);
        const spGroups = o.specials
            ? (menu.specials || [])
                  .filter((sp) => sp.name || sp.who || sp.kind === 'bimbi' || (sp.subs || []).some((b) => b.from && b.to) || (sp.dishes || []).length)
                  .map((sp) => {
                      if (sp.kind === 'bimbi') {
                          const kids = (sp.dishes || []).filter((d) => byId[d.rid]).map((d) => ({ r: byId[d.rid], ps: dishNutrition(byId[d.rid], d) }));
                          return kids.length ? [cardOf([{ name: 'Menù bimbi', rows: kids }], '', sp)] : [];
                      }
                      const names = String(sp.who || '').split(/[,;]/).map((x) => x.trim()).filter(Boolean).filter((x) => !/\d/.test(x));
                      const n = Math.max(names.length, Math.round(parseFloat(String(sp.persons || '').replace(',', '.')) || 0), 1);
                      const card = (who) => cardOf(sections, who, sp);
                      return [...names.map(card), ...Array.from({ length: n - names.length }, () => card(''))];
                  })
                  .filter((g) => g.length)
            : [];
        main = sheetsOf(stdCards, o.cover) + spGroups.map((g) => sheetsOf(g, true)).join('');
    }

    const foot = o.footer && o.view !== 'tavola' ? `<div class="d-mn-foot">${[prof?.indirizzo_studio, prof?.telefono, prof?.email].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('')}<small>${esc(fmtDate(new Date()))}</small></div>` : '';
    return `<div class="d-doc d-mn">${cover}${introHtml}${main}${o.view === 'tavola' ? '' : foot}${specialsHtml}${charts}</div>`;
};
