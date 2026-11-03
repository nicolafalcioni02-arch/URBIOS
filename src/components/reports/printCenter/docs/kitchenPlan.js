import { esc, multiline } from '../logic/visits';
import { titoloProf } from '../../../../logic/titolo';
import { dishNutrition, gramsOf, normalizeMenu } from '../../../../chef/chefLogic';
import { menusOf, pickMenu } from './menu';

// Piano di lavoro per gli chef: dal menù (db.chef_menus) e per N persone, il riepilogo, la lista della spesa
// (tutti gli ingredienti sommati) e una scheda di produzione per ogni piatto con le quantità già moltiplicate.

export const KITCHEN_VIEWS = [
    { id: 'foglio', label: 'Un foglio', desc: 'Tutto su un solo foglio da appendere in cucina', icon: 'ph-file' },
    { id: 'completo', label: 'Completo', desc: 'Spesa e una scheda per ogni piatto', icon: 'ph-files' },
];
export const KITCHEN_DEFAULT_OPTS = { view: 'foglio', menuId: '', persons: '50', extra: '0', summary: true, shopping: true, recipes: true, checks: true, notes: false, special: true, letter: true, coverText: 'Questo è quello che abbiamo pensato per il nostro cliente. Qui trovate il menù, la spesa e le schede di ogni piatto, con le quantità già calcolate.', eventName: '', location: '' };

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');
const qty = (g) => (g >= 1000 ? `${(g / 1000).toLocaleString('it-IT', { maximumFractionDigits: 2 })}&nbsp;kg` : `${r0(g)}&nbsp;g`);
const num = (v, d) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) && x >= 0 ? x : d;
};

export const kitchenMenus = menusOf;
export const pickKitchenMenu = pickMenu;

export const buildKitchenHtml = ({ prof, db, opts = {} }) => {
    const o = { ...KITCHEN_DEFAULT_OPTS, ...opts };
    const menu = pickMenu(db, o.menuId);
    if (!menu) return '<div class="d-doc"><p class="d-placeholder">Non c’è ancora nessun menù: si crea da Chef, nella scheda «Menù».</p></div>';
    const persons = Math.max(1, Math.round(num(o.persons, 50)));
    const f = 1 + num(o.extra, 0) / 100;
    const byId = Object.fromEntries((db?.diet_meal_library || []).filter((m) => m && m.kind === 'ricetta').map((r) => [r.id, r]));
    const author = [prof?.nome, prof?.cognome].filter(Boolean).join(' ');
    const sections = normalizeMenu(menu).sections
        .map((s) => ({ ...s, rows: s.dishes.filter((d) => byId[d.rid]).map((d) => ({ r: byId[d.rid], d, nut: dishNutrition(byId[d.rid], d) })) }))
        .filter((s) => s.rows.length);
    if (!sections.length) return '<div class="d-doc"><p class="d-placeholder">Questo menù non ha ancora piatti: aggiungili da Chef.</p></div>';
    const dishes = sections.flatMap((s) => s.rows.map((x) => ({ ...x, course: s.name })));

    // spesa: ogni ingrediente di ogni piatto, grammi di una porzione × persone × (1 + scorta)
    const shop = new Map();
    dishes.forEach(({ r, d, course }) =>
        (r.items || []).forEach((i) => {
            const key = String(i.name || '').trim().toLowerCase();
            const e = shop.get(key) || { name: i.name, g: 0, used: [] };
            e.g += gramsOf(r, d, i) * persons * f;
            if (!e.used.includes(r.title)) e.used.push(r.title);
            shop.set(key, e);
        }),
    );
    // special: per gli ospiti con allergie/intolleranze l'ingrediente «al posto di» esce dalla spesa e entra quello da usare
    const specs = (menu.specials || []).map((sp) => ({ ...sp, dishes: (sp.dishes || []).filter((d) => byId[d.rid]), n: Math.max(0, Math.round(num(sp.persons, 0))) || String(sp.who || '').split(/[,;]/).filter((x) => x.trim()).length }));
    // menù bimbi: i loro piatti si aggiungono alla spesa per i bimbi indicati
    specs.filter((sp) => sp.kind === 'bimbi').forEach((sp) => sp.dishes.forEach((d) => (byId[d.rid].items || []).forEach((i) => {
        const key = String(i.name || '').trim().toLowerCase();
        const e = shop.get(key) || { name: i.name, g: 0, used: [] };
        e.g += gramsOf(byId[d.rid], d, i) * sp.n * f;
        const tag = `Bimbi ${byId[d.rid].title}`;
        if (!e.used.includes(tag)) e.used.push(tag);
        shop.set(key, e);
    })));
    const subG = new Map();
    specs.forEach((sp) =>
        (sp.subs || []).filter((b) => b.from && b.to).forEach((b) => {
            const from = b.from.trim().toLowerCase();
            let tot = 0;
            dishes.forEach(({ r, d }) =>
                (r.items || []).forEach((i) => {
                    if (!String(i.name || '').toLowerCase().includes(from)) return;
                    const g = gramsOf(r, d, i) * Math.min(sp.n, persons) * f;
                    const e = shop.get(String(i.name).trim().toLowerCase());
                    if (e) e.g = Math.max(0, e.g - g);
                    tot += g;
                }),
            );
            subG.set(b, tot);
            if (!tot) return;
            const key = b.to.trim().toLowerCase();
            const e = shop.get(key) || { name: b.to, g: 0, used: [] };
            e.g += tot;
            const tag = `Special ${sp.name || ''}`.trim();
            if (!e.used.includes(tag)) e.used.push(tag);
            shop.set(key, e);
        }),
    );
    const shopRows = [...shop.values()].filter((x) => x.g > 0.5).sort((a, b) => a.name.localeCompare(b.name, 'it'));
    const totalKg = shopRows.reduce((a, x) => a + x.g, 0);
    const box = o.checks ? '<i class="d-kp-box"></i>' : '';

    const head = (kicker, title) => `<div class="d-kp-top"><span class="d-kicker">${esc(kicker)}</span><h2 class="d-title d-kp-title">${esc(title)}</h2></div>`;

    const initials = (author || 'U').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    const month = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    const cover = o.summary
        ? `<div class="d-rb"><section class="d-rb-front"><div class="d-rb-frame">
<div class="d-rb-mono"><span>${esc(initials)}</span></div>
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-kicker">Il piano di lavoro</div>
<h1 class="d-title d-mn-covertitle">${esc(o.eventName || menu.title)}</h1>
${o.eventName && menu.title && o.eventName !== menu.title ? `<p class="d-rb-for">${esc(menu.title)}</p>` : ''}
<div class="d-rb-orn"><span></span><i>✦</i><span></span></div>
<div class="d-rb-by"><small>a cura di</small>${author ? `<b>${titoloProf(prof)} ${esc(author)}</b>` : ''}${o.location ? `<span>${esc(o.location)}</span>` : ''}</div>
<div class="d-rb-ed">${esc(month)}</div>
</div></section></div>`
        : '';

    const hit = (sp) => (sp.subs || []).filter((b) => b.from && b.to).map((b) => ({ b, dishes: dishes.filter(({ r }) => (r.items || []).some((i) => String(i.name || '').toLowerCase().includes(b.from.trim().toLowerCase()))).map((x) => x.r.title) }));
    const activeSp = specs.filter((sp) => sp.name || sp.who || sp.dishes.length || (sp.subs || []).some((b) => b.from && b.to));
    const spBrief = o.special && activeSp.length
        ? `<div class="d-kp-alert d-panel"><h3>Special: ${activeSp.length} ${activeSp.length === 1 ? 'menù' : 'menù'} da preparare a parte</h3>${activeSp
              .map((sp) => `<p><b>${esc(sp.kind === 'bimbi' ? 'Menù bimbi' : sp.name || 'Special')}</b>${sp.who ? ` · ${esc(sp.who)}` : ''} · ${sp.n || '?'} ${sp.n === 1 ? 'persona' : 'persone'}${sp.care ? `. ${esc(sp.care)}` : ''}</p>`)
              .join('')}<small>Dettagli e sostituzioni nelle pagine Special in fondo.</small></div>`
        : '';

    const letter = o.letter && (menu.letter || '').trim()
        ? `<section class="d-kp-letter pc-break"><div class="d-kicker">${esc(o.eventName || menu.title)}</div><h2 class="d-title d-kp-title">Ai nostri chef</h2>
<div class="d-kp-letterbody">${multiline(menu.letter)}</div>
<div class="d-kp-sign">${author ? `<span>${titoloProf(prof)} ${esc(author)}</span>` : ''}</div></section>`
        : '';

    const summary = o.summary
        ? `<section class="d-kp-sum pc-break">
<div class="d-kp-band"><span class="d-kicker">Piano di lavoro${o.eventName ? ` · ${esc(o.eventName)}` : ''}</span><h1 class="d-title d-kp-main">${esc(menu.title)}</h1><p class="d-kp-menu">${[menu.subtitle, o.location, author ? `${titoloProf(prof)} ${author}` : ''].filter(Boolean).map(esc).join(' · ')}</p></div>
<div class="d-kp-facts"><div class="d-kpi"><b>${persons}</b><span>persone</span></div><div class="d-kpi"><b>${dishes.length}</b><span>${dishes.length === 1 ? 'piatto' : 'piatti'}</span></div><div class="d-kpi"><b>${shopRows.length}</b><span>ingredienti</span></div><div class="d-kpi"><b>${qty(totalKg)}</b><span>di spesa${num(o.extra, 0) ? ` (+${r0(num(o.extra, 0))}%)` : ''}</span></div></div>
<div class="d-kp-menuList">${sections.map((s) => `<div class="d-kp-mrow"><h3>${esc(s.name)}</h3><div>${s.rows.map((x) => `<p>${esc(x.r.title)}<small>${r0(x.nut.grams)} g a porzione · ${r0(x.nut.kcal)} kcal</small></p>`).join('')}</div></div>`).join('')}</div>
${spBrief}</section>`
        : '';

    const shopping = o.shopping
        ? `<section class="d-kp-shop pc-break">${head('Lista della spesa', `Per ${persons} persone`)}
<p class="d-kp-note">Tutti gli ingredienti dei piatti del menù, sommati${num(o.extra, 0) ? `, con il ${r0(num(o.extra, 0))}% in più per scarti e imprevisti` : ''}.</p>
<table class="d-kp-table d-table"><thead><tr>${o.checks ? '<th></th>' : ''}<th>Ingrediente</th><th>Serve per</th><th class="r">Quantità</th></tr></thead><tbody>${shopRows
              .map((x) => `<tr>${o.checks ? '<td class="c"><i class="d-kp-box"></i></td>' : ''}<td><b>${esc(x.name)}</b></td><td class="u">${esc(x.used.join(', '))}</td><td class="r">${qty(x.g)}</td></tr>`)
              .join('')}</tbody></table></section>`
        : '';

    const dishCard = ({ r, d, nut, course }, idx) => {
        const ings = (r.items || [])
            .map((i) => {
                const g1 = gramsOf(r, d, i);
                return `<tr>${o.checks ? '<td class="c"><i class="d-kp-box"></i></td>' : ''}<td>${esc(i.name)}</td><td class="r u">${r0(g1)}&nbsp;g</td><td class="r"><b>${qty(g1 * persons * f)}</b></td></tr>`;
            })
            .join('');
        const steps = (r.steps || []).length ? `<ol class="d-kp-steps">${r.steps.map((t) => `<li>${multiline(t)}</li>`).join('')}</ol>` : '';
        const warn = o.special ? activeSp.map((sp) => { const h = hit(sp).filter((x) => x.dishes.includes(r.title)); return h.length ? `<p><strong>${esc(sp.name || 'Special')}</strong> (${esc(sp.persons || '?')}): ${h.map((x) => `${esc(x.b.from)} → ${esc(x.b.to)}`).join('; ')}</p>` : ''; }).join('') : '';
        return `<article class="d-kp-dish"><div class="d-kp-dh"><div><span class="d-kicker">${esc(course)} · ${idx + 1}/${dishes.length}</span><h2 class="d-title d-kp-title">${esc(r.title)}</h2><p class="d-kp-dsub">${r0(nut.grams)} g a porzione · ${r0(nut.kcal)} kcal${r.minutes ? ` · ${r0(r.minutes)}′` : ''}</p></div><div class="d-kp-n"><b>${persons}</b><span>porzioni</span></div></div>
<table class="d-kp-table d-table"><thead><tr>${o.checks ? '<th></th>' : ''}<th>Ingrediente</th><th class="r">A porzione</th><th class="r">Totale</th></tr></thead><tbody>${ings}</tbody></table>
${steps}${r.note ? `<p class="d-kp-dnote"><b>Nota</b> ${esc(r.note)}</p>` : ''}${warn ? `<p class="d-kp-dwarn"><b>Special</b>${warn}</p>` : ''}
${o.notes ? '<div class="d-rb-notes"><b>Note della cucina</b><i></i><i></i></div>' : ''}</article>`;
    };
    const recipes = o.recipes
        ? dishes
              .reduce((acc, x, i) => { (i % 2 ? acc[acc.length - 1] : (acc.push([]), acc[acc.length - 1])).push(dishCard(x, i)); return acc; }, [])
              .map((pair, k) => `<div class="d-kp-pair${k === 0 ? ' pc-break' : ''}">${pair.join('')}</div>`)
              .join('')
        : '';

    // special: tutti insieme in una pagina; per ogni ospite i piatti toccati, con gli ingredienti alternativi già per il numero di ospiti
    const swapOf = (sp) => (name) => { const b = (sp.subs || []).find((x) => x.from && x.to && String(name).toLowerCase().includes(x.from.trim().toLowerCase())); return b ? b.to : null; };
    const specials = o.special && activeSp.length
        ? `<section class="d-kp-specials pc-break">${head('Special', 'Menù da preparare a parte')}<p class="d-kp-note">Preparare a parte, con utensili e piani di lavoro puliti. Cambiano solo gli ingredienti in evidenza; la preparazione è quella della scheda del piatto.</p>${activeSp
              .map((sp) => {
                  const sw = swapOf(sp);
                  const n = Math.min(sp.n || 1, persons);
                  const alts = sp.kind === 'bimbi'
                      ? sp.dishes.map((d) => ({ r: byId[d.rid], d, hl: false, k: sp.n || 1 }))
                      : dishes.filter(({ r }) => (r.items || []).some((i) => sw(i.name))).map(({ r, d }) => ({ r, d, hl: true, k: n }));
                  const rows = alts.map(({ r, d, hl, k }) => `<div class="d-kp-alt"><h4>${esc(r.title)}</h4><p>${(r.items || []).map((i) => { const to = hl ? sw(i.name) : null; return `<span class="${to ? 'sw' : ''}">${o.checks ? '<i class="d-kp-box"></i>' : ''}${esc(to || String(i.name).split(',')[0])} <b>${qty(gramsOf(r, d, i) * k * f)}</b></span>`; }).join('')}</p></div>`).join('');
                  return `<div class="d-kp-sp"><div class="d-kp-sph"><b>${esc(sp.kind === 'bimbi' ? 'Menù bimbi' : sp.name || 'Special')}</b><span>${sp.n || '?'} ${sp.n === 1 ? 'persona' : 'persone'}${sp.who ? ` · ${esc(sp.who)}` : ''}</span></div>${sp.care ? `<p class="d-kp-spcare">${esc(sp.care)}</p>` : ''}${rows || '<p class="d-kp-note">Nessun piatto del menù contiene gli ingredienti indicati.</p>'}</div>`;
              })
              .join('')}</section>`
        : '';

    // un solo foglio da appendere: intestazione, tutti i piatti con le quantità totali, gli special con gli ingredienti alternativi
    if (o.view !== 'completo') {
        const cards = sections.map((sec) => sec.rows.map((x) => ({ ...x, course: sec.name }))).flat().map(({ r, d, nut, course }) => `<div class="d-kp-oc d-panel"><span class="d-kp-oc-k">${esc(course)}</span><h3>${esc(r.title)}<small>${r0(nut.kcal)} kcal</small></h3>${(r.items || []).map((i) => `<p>${o.checks ? '<i class="d-kp-box"></i>' : ''}<span>${esc(String(i.name).split(',')[0])}</span><b>${qty(gramsOf(r, d, i) * persons * f)}</b></p>`).join('')}</div>`).join('');
        const sw = (sp) => (name) => { const b = (sp.subs || []).find((x) => x.from && x.to && String(name).toLowerCase().includes(x.from.trim().toLowerCase())); return b ? b.to : null; };
        const spHtml = o.special ? activeSp.map((sp) => {
            const w = sw(sp);
            const n = Math.min(sp.n || 1, persons);
            const lines = sp.kind === 'bimbi'
                ? sp.dishes.map((d) => `<p><span>${esc(byId[d.rid].title)}</span><b>${sp.n || 1} porz.</b></p>`).join('')
                : dishes.filter(({ r }) => (r.items || []).some((i) => w(i.name))).map(({ r, d }) => `<p><span>${esc(r.title)}: ${(r.items || []).filter((i) => w(i.name)).map((i) => `${esc(String(i.name).split(',')[0])} → <em>${esc(w(i.name))}</em>`).join(', ')}</span><b>${qty((r.items || []).filter((i) => w(i.name)).reduce((a, i) => a + gramsOf(r, d, i), 0) * n * f)}</b></p>`).join('');
            return `<div class="d-kp-os"><h4>${esc(sp.kind === 'bimbi' ? 'Menù bimbi' : sp.name || 'Special')}<small>${sp.n || '?'} ${sp.n === 1 ? 'persona' : 'persone'}${sp.who ? ` · ${esc(sp.who)}` : ''}</small></h4>${sp.care ? `<i>${esc(String(sp.care).split(/(?<=[.!])\s/)[0])}</i>` : ''}${lines}</div>`;
        }).join('') : '';
        return `<div class="d-doc d-kp"><section class="d-kp-one"><div class="d-kp-band"><span class="d-kicker">Piano di lavoro${o.eventName ? ` · ${esc(o.eventName)}` : ''}</span><h1 class="d-title d-kp-main">${esc(menu.title)}</h1><p class="d-kp-menu">${[`${persons} persone`, `${dishes.length} piatti`, menu.subtitle, o.location && !String(menu.subtitle || '').includes(o.location) ? o.location : ''].filter(Boolean).map(esc).join(' · ')}</p></div><div class="d-kp-ogrid">${cards}</div>${spHtml ? `<h2 class="d-kp-oh d-h">Special, da preparare a parte</h2><div class="d-kp-osgrid">${spHtml}</div>` : ''}</section></div>`;
    }

    return `<div class="d-doc d-kp">${cover}${letter}${summary}${shopping}${recipes}${specials}</div>`;
};
