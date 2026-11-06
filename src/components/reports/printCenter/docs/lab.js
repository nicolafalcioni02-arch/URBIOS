import { esc, multiline } from '../logic/visits';
import { figureVisual } from '../../../../lab/figures';
import { labOf, fmtDay, num, scaleFactor, scaledQty, stockState } from '../../../../lab/labLogic';

// Laboratorio: protocolli, ricette di reagenti, magazzino e registro campioni (db.lab). Si apre da Laboratorio (src/lab/).
// opts: { kind: 'protocolli'|'reagenti'|'magazzino'|'campioni', ids?: [id], volume?: volume finale a cui scalare le ricette }

export const LAB_DEFAULT_OPTS = { kind: 'protocolli', ids: null, volume: '', completo: false };
export const LAB_KINDS = { quaderno: 'Quaderno di laboratorio', articoli: 'Bibliografia', protocolli: 'Protocolli', reagenti: 'Ricettario reagenti', magazzino: 'Magazzino', campioni: 'Registro campioni' };

export const labItems = (db, o) => {
    const all = labOf(db)[o.kind] || [];
    return o.ids ? all.filter((r) => o.ids.includes(r.id)) : all;
};

const cell = (v) => (v === undefined || v === null || v === '' ? '<small>—</small>' : esc(v));
const meta = (pairs) => {
    const p = pairs.filter(([, v]) => v);
    return p.length ? `<table class="d-meta"><tr>${p.map(([k]) => `<th>${esc(k)}</th>`).join('')}</tr><tr>${p.map(([, v]) => `<td>${esc(v)}</td>`).join('')}</tr></table>` : '';
};
const rowsTable = (head, rows) => (rows.length ? `<table class="d-table"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '');
const withName = (list) => (list || []).filter((x) => String(x.nome || '').trim());

const txt = (t) => (String(t || '').trim() ? multiline(t) : '');
// Scheda a due colonne: etichetta a sinistra, contenuto a destra (le righe vuote spariscono)
const form = (rows) => {
    const r = rows.filter(([, v]) => v);
    return r.length ? `<table class="d-form">${r.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join('')}</table>` : '';
};
const stepsIn = (list) => {
    const s = (list || []).filter((x) => String(x.testo || '').trim());
    return s.length ? `<ol class="d-rb-steps">${s.map((x) => `<li>${multiline(x.testo)}${x.durata ? ` <small>(${esc(x.durata)})</small>` : ''}${x.note ? `<br><small>${multiline(x.note)}</small>` : ''}</li>`).join('')}</ol>` : '';
};

const protocolHtml = (r, brk) => {
    const mats = rowsTable(['Voce', 'Quantità', 'Note / materiale'], withName(r.materiali).map((m) => [esc(m.nome), cell([m.quantita, m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    return `<section class="d-rb-recipe${brk ? ' pc-break' : ''}">
<div class="d-rb-head"><div><h2 class="d-title d-rb-title">${esc(r.titolo || 'Protocollo senza titolo')}</h2><span class="d-kicker">${esc([r.codice, r.categoria].filter(Boolean).join(', ') || 'Protocollo')}</span></div></div>
${meta([['Versione', r.versione], ['Revisione', fmtDay(r.data)], ['Stato', r.stato], ['Redatto da', r.autore]])}
${form([['Scopo', txt(r.scopo)], ['Materiali', mats], ['Procedura', stepsIn(r.passaggi)], ['Sicurezza', txt(r.sicurezza)], ['Riferimenti', txt(r.riferimenti)], ['Note', txt(r.note)]])}
</section>`;
};

const captions = (r) => (r.figure || []).filter((f) => String(f.nome || '').trim() || f.img || f.chart || f.gel);

// Numerazione del quaderno: pagina, tabella (materiali) e figura progressive su tutto il quaderno
export const notebookNumbering = (sorted) => {
    let t = 0;
    let f = 0;
    return sorted.map((r, i) => ({
        page: i + 1,
        tab: withName(r.materiali).length ? ++t : null,
        figs: captions(r).map(() => ++f),
    }));
};
const sortedNotebook = (items) => [...items].sort((a, b) => String(a.data).localeCompare(String(b.data)));

const entryHtml = (r, brk, lab, n) => {
    const proto = lab.protocolli.find((p) => p.id === r.protocolloId);
    const mats = rowsTable(['Voce', 'Quantità', 'Lotto / note'], withName(r.materiali).map((m) => [esc(m.nome), cell([m.quantita, m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    const figs = captions(r);
    return `<section class="d-rb-recipe${brk ? ' pc-break' : ''}">
<div class="d-rb-head"><div><h2 class="d-title d-rb-title">${esc(r.titolo || 'Esperimento senza titolo')}</h2><span class="d-kicker">${esc([fmtDay(r.data), r.operatore, r.progetto, proto ? [proto.codice, proto.titolo].filter(Boolean).join(' ') : ''].filter(Boolean).join(', '))}</span></div></div>
${form([['Obiettivo', txt(r.obiettivo)], [n && n.tab ? `Materiali (tab. ${n.tab})` : 'Materiali', mats], ['Procedura svolta', stepsIn(r.passaggi) || txt(r.procedura)], ['Misure', rowsTable(['Misura', 'Valore', 'Nota'], withName(r.misure).map((m) => [esc(m.nome), cell([m.valore, m.unita].filter(Boolean).join(' ')), cell(m.note)]))], ['Osservazioni', txt(r.osservazioni)], ['Risultati', txt(r.risultati)]])}
${figs.map((f, k) => `<div class="d-fig" style="break-inside:avoid">${figureVisual(f)}<p><b>Figura ${n ? n.figs[k] : k + 1}:</b> ${esc(f.nome)}${f.note ? ` <small>(${esc(f.note)})</small>` : ''}</p></div>`).join('')}
${form([['Conclusioni', txt(r.conclusioni)], ['Prossimi passi', txt(r.prossimi)]])}
</section>`;
};


// Il quaderno completo, a parti (copertina, indici, reagentario, pagine): ogni parte è un foglio nell'anteprima, in stampa si impagina di seguito.
// onlyId: solo la pagina di quell'esperimento (la numerazione resta quella del quaderno intero)
export const notebookParts = (lab, onlyId) => {
    const sorted = sortedNotebook(lab.quaderno);
    const nums = notebookNumbering(sorted);
    const toc = sorted.length ? rowsTable(['N.', 'Data', 'Esperimento'], sorted.map((r, i) => [String(i + 1), cell(fmtDay(r.data)), esc(r.titolo || 'Esperimento senza titolo')])) : '';
    const figRows = [];
    const tabRows = [];
    sorted.forEach((r, i) => {
        if (nums[i].tab) tabRows.push([`Tabella ${nums[i].tab}`, `Materiali: ${esc(r.titolo || '')}`, String(nums[i].page)]);
        captions(r).forEach((f, k) => figRows.push([`Figura ${nums[i].figs[k]}`, esc(f.nome || ''), String(nums[i].page)]));
    });
    const byName = (k, f) => [...lab[k]].sort((a, b) => String(a[f]).localeCompare(String(b[f]), 'it'));
    const front = (sorted.length > 1 ? toc : '')
        + (figRows.length > 1 ? `<h3 class="d-rb-h">Figure</h3>${rowsTable(['Figura', 'Didascalia', 'Esperimento'], figRows)}` : '')
        + (tabRows.length > 1 ? `<h3 class="d-rb-h">Tabelle</h3>${rowsTable(['Tabella', 'Contenuto', 'Esperimento'], tabRows)}` : '');
    const divider = (key, title) => ({ key, html: `<section class="d-rb-recipe pc-break">${'<p style="margin:0">&nbsp;</p>'.repeat(14)}<h2 class="d-title d-rb-title" style="font-size:26pt">${esc(title)}</h2></section>` });
    const all = [
        divider('__d_cover', 'Quaderno di laboratorio'),
        ...(front ? [{ key: '__cover', html: `<section class="d-rb-recipe pc-break"><h2 class="d-title d-rb-title">Indice</h2>${front}</section>` }] : []),
        ...(sorted.length ? [divider('__d_esp', 'Esperimenti')] : []),
        ...sorted.map((r, i) => ({ key: r.id, html: entryHtml(r, i === 0, lab, nums[i]) })),
        ...(lab.protocolli.length ? [divider('__d_prt', 'Protocolli')] : []),
        ...byName('protocolli', 'titolo').map((r, i) => ({ key: r.id, html: protocolHtml(r, i === 0) })),
        ...(lab.reagenti.length ? [divider('__d_rea', 'Ricettario reagenti')] : []),
        ...byName('reagenti', 'nome').map((r, i) => ({ key: r.id, html: reagentHtml(r, i === 0, '') })),
        ...(lab.magazzino.length ? [divider('__d_mag', 'Magazzino')] : []),
        ...(lab.magazzino.length ? [{ key: '__mag', html: magazzinoHtml(lab.magazzino) }] : []),
        ...(lab.campioni.length ? [divider('__d_cam', 'Registro campioni')] : []),
        ...(lab.campioni.length ? [{ key: '__cam', html: campioniHtml(lab.campioni, lab) }] : []),
        ...(lab.articoli.length ? [divider('__d_art', 'Bibliografia')] : []),
        ...(lab.articoli.length ? [{ key: '__art', html: articoliHtml(lab.articoli) }] : []),
    ];
    return onlyId ? all.filter((p) => p.key === onlyId) : all;
};

const reagentHtml = (r, brk, volume) => {
    const f = scaleFactor(r, volume);
    const unit = r.unitaVolume || 'mL';
    const base = num(r.volumeFinale);
    const final = f !== 1 ? `${scaledQty(r.volumeFinale, f)} ${unit}` : base !== null ? `${r.volumeFinale} ${unit}` : '';
    const comps = rowsTable(['Componente', 'Quantità', 'Note'], withName(r.componenti).map((m) => [esc(m.nome), cell([scaledQty(m.quantita, f), m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    return `<section class="d-rb-recipe${brk ? ' pc-break' : ''}">
<div class="d-rb-head"><div><h2 class="d-title d-rb-title">${esc(r.nome || 'Soluzione senza nome')}</h2><span class="d-kicker">${esc(r.categoria || 'Ricetta di laboratorio')}</span></div></div>
${meta([['Volume finale', final], ['Solvente', r.solvente], ['pH', r.ph], ['Concentrazione', r.concentrazione]])}
${f !== 1 ? `<p class="d-placeholder">Quantità ricalcolate da ${esc(r.volumeFinale)} ${esc(unit)} a ${esc(final)}.</p>` : ''}
${form([['Componenti', comps], ['Preparazione', stepsIn(r.passaggi)], ['Conservazione', [r.conservazione, r.validita && `validità ${r.validita}`].filter(Boolean).map(esc).join(', ')], ['Sicurezza', txt(r.sicurezza)], ['Note', txt(r.note)]])}
</section>`;
};

const listHtml = (title, head, rows, count) => `<section class="d-rb-recipe pc-break"><h2 class="d-title d-rb-title">${esc(title)}</h2>${rowsTable(head, rows)}</section>`;

const articoliHtml = (items) => {
    const rows = [...items].sort((a, b) => String(b.anno || '').localeCompare(String(a.anno || ''))).map((r) => [`<b>${esc(r.titolo)}</b>${r.tag ? `<br><small>${esc(r.tag)}</small>` : ''}`, cell(r.autori), cell(r.rivista), cell(r.anno), cell(r.doi), cell(r.lettura)]);
    return listHtml('Bibliografia', ['Titolo', 'Autori', 'Rivista', 'Anno', 'DOI', 'Lettura'], rows, items.length);
};
const magazzinoHtml = (items) => {
    const blank = '&nbsp;';
    const rows = [...items].sort((a, b) => (parseInt(a.numero, 10) || 1e9) - (parseInt(b.numero, 10) || 1e9) || String(a.nome).localeCompare(String(b.nome), 'it')).map((r) => [cell(r.numero), `<b>${esc(r.nome)}</b>`, cell(r.marca), cell(r.lotto), cell(fmtDay(r.dataArrivo)), cell([r.quantita, r.unita].filter(Boolean).join(' ')), cell(r.posizione), blank, r.aggiornato ? esc(fmtDay(r.aggiornato)) : blank]);
    return listHtml('Magazzino reagenti', ['N.', 'Articolo', 'Produttore', 'Lotto', 'Inserito il', 'Quantità', 'Posizione', 'Q.tà attuale', 'Aggiornato il'], rows, items.length);
};
const campioniHtml = (items, lab) => {
    const rows = [...items].sort((a, b) => String(a.codice).localeCompare(String(b.codice), 'it')).map((r) => [esc(r.codice), cell(r.tipo), cell(r.descrizione), cell(fmtDay(r.data)), cell(r.posizione), cell(r.stato), cell((lab.protocolli.find((p) => p.id === r.protocolloId) || {}).codice)]);
    return listHtml('Registro campioni', ['Codice', 'Tipo', 'Descrizione', 'Ricezione', 'Posizione', 'Stato', 'Protocollo'], rows, items.length);
};

export const buildLabHtml = ({ db, opts = {} }) => {
    const o = { ...LAB_DEFAULT_OPTS, ...opts };
    const items = labItems(db, o);
    const whole = o.kind === 'quaderno' && o.completo; // il quaderno intero ha sempre la copertina e gli indici
    if (!items.length && !whole) return `<div class="d-doc"><p class="d-placeholder">Non c’è ancora nulla da stampare in «${esc(LAB_KINDS[o.kind] || '')}».</p></div>`;
    if (o.kind === 'quaderno') {
        const lab = labOf(db);
        if (o.completo) return `<div class="d-doc d-rb">${notebookParts(lab).map((p) => p.html).join('')}</div>`;
        const sorted = sortedNotebook(lab.quaderno);
        const nums = notebookNumbering(sorted);
        return `<div class="d-doc d-rb">${sorted.map((r, i) => [r, nums[i]]).filter(([r]) => items.includes(r)).map(([r, n]) => entryHtml(r, false, lab, n)).join('')}</div>`;
    }
    if (o.kind === 'articoli') return `<div class="d-doc d-rb">${articoliHtml(items)}</div>`;
    if (o.kind === 'protocolli') return `<div class="d-doc d-rb">${items.map((r) => protocolHtml(r, false)).join('')}</div>`;
    if (o.kind === 'reagenti') return `<div class="d-doc d-rb">${items.map((r) => reagentHtml(r, false, o.volume)).join('')}</div>`;
    if (o.kind === 'magazzino') return `<div class="d-doc d-rb">${magazzinoHtml(items)}</div>`;
    return `<div class="d-doc d-rb">${campioniHtml(items, labOf(db))}</div>`;
};

// Word apre volentieri l'HTML: stessa pagina del quaderno, stile minimo (titoli, tabelle, interruzioni di pagina)
export const wordFile = (html, title = 'Quaderno di laboratorio', logo = '') => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
@page Section1 { size: 21cm 29.7cm; margin: 1.8cm; mso-footer: f1; }
div.Section1 { page: Section1; }
body { font-family: Aptos, Calibri, Arial, sans-serif; font-size: 10pt; color: #000; line-height: 1.3; }
.pc-break { page-break-before: always; }
.d-kicker { display: block; padding-bottom: 6pt; font-size: 8pt; color: #444; }
.d-rb-title { font-size: 16pt; font-weight: bold; margin: 0 0 6pt; }
.d-rb-h { font-size: 10.5pt; margin: 8pt 0 2pt; }
.d-rb-recipe { margin-bottom: 16pt; }
p { margin: 0 0 3pt; }
table { border-collapse: collapse; margin: 2pt 0 6pt; }
th, td { padding: 3pt 5pt; font-size: 9.5pt; text-align: left; vertical-align: top; border: 0; }
th { font-weight: bold; border-bottom: 0.75pt solid #000; }
.d-meta th { font-size: 8pt; color: #444; border: 0; padding-bottom: 0; }
.d-meta td { padding-top: 0; }
.d-form th { width: 2.8cm; font-size: 8.5pt; color: #444; border: 0; }
.d-form td table th { color: #000; font-size: 8.5pt; border-bottom: 0.75pt solid #000; }
.ft td { font-size: 8pt; color: #444; border-top: 0.5pt solid #999; padding-top: 4pt; }
.d-div td { border: 0; }
small { color: #444; }
</style></head><body><div class="Section1">${html.replace(/<table class="/g, '<table width="100%" class="').replace(/<section class="d-rb-recipe pc-break">/g, '<br clear="all" style="page-break-before:always"><section class="d-rb-recipe">').replace('<br clear="all" style="page-break-before:always">', '').replace(/<section class="d-rb-recipe">/g, '<p style="margin:0">&nbsp;</p><p style="margin:0">&nbsp;</p><section class="d-rb-recipe">')}
<div style="mso-element:footer" id="f1"><table width="100%" class="ft"><tr><td align="left">${new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</td><td align="center">${logo}</td><td align="right">Pagina <!--[if supportFields]><span style="mso-element:field-begin"></span><span style="mso-element:field-code"> PAGE </span><span style="mso-element:field-separator"></span><![endif]-->1<!--[if supportFields]><span style="mso-element:field-end"></span><![endif]--></td></tr></table></div></div></body></html>`;

// Word non disegna gli SVG né le immagini incorporate nel testo: grafici e immagini diventano PNG e il file è un MHTML (.doc) con le immagini allegate
const svgToPng = (svg, bg = true) => new Promise((resolve) => {
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    const w = vb ? +vb[1] : 600;
    const h = vb ? +vb[2] : 400;
    const img = new Image();
    img.onload = () => {
        const c = document.createElement('canvas');
        c.width = w * 2; c.height = h * 2;
        const x = c.getContext('2d');
        if (bg) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
        x.drawImage(img, 0, 0, c.width, c.height);
        resolve({ data: c.toDataURL('image/png'), w, h });
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('width="100%"', `width="${w}" height="${h}"`))}`;
});
const imgSize = (src) => new Promise((resolve) => { const i = new Image(); i.onload = () => resolve({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => resolve({ w: 600, h: 400 }); i.src = src; });

export const wordMime = async (html, title, font) => {
    const parts = [];
    const BASE = 'file:///C:/urbios/';
    const add = (dataUrl, w, h) => {
        const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
        if (!m) return null;
        const name = `img${parts.length + 1}.${m[1].split('/')[1].replace('jpeg', 'jpg')}`;
        parts.push({ name, type: m[1], b64: m[2] });
        const url = `${BASE}${name}`;
        const W = Math.min(w, 440); // larghezza massima sul foglio (px a 96 dpi)
        return `<img src="${url}" width="${Math.round(W)}" height="${Math.round((h * W) / w)}" alt="">`;
    };
    const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5030 647" width="100%"><path fill="#1b1b1f" transform="translate(-304.2 -290.6)" d="M945.28,614.13 A317.54,317.54 0 1,0 940.29,670.16 A92.62,92.62 0 1,0 757.31,641.74 A211.69,211.69 0 0,1 378.07,741.14 A145.54,145.54 0 0,1 403.97,539.87 L534.29,436.27 A277.85,277.85 0 0,1 783.13,386.57 A105.85,105.85 0 0,1 859.53,478.14 A52.92,52.92 0 0,0 887.94,520.05 A105.85,105.85 0 0,1 945.28,614.13 Z"/><text x="840" y="470" font-family="Helvetica, Arial, sans-serif" font-size="400" font-weight="700" letter-spacing="130" fill="#1b1b1f">URBIOS</text><text x="3520" y="465" font-family="Helvetica, Arial, sans-serif" font-size="330" fill="#1b1b1f">© 2026</text></svg>';
    const lp = await svgToPng(LOGO, false);
    let logo = '';
    if (lp) { add(lp.data, lp.w, lp.h); logo = `<img src="${BASE}${parts[parts.length - 1].name}" width="101" height="13" alt="">`; }
    const swaps = [];
    for (const m of html.matchAll(/<div style="max-width:130mm;margin:2mm auto">(<svg[\s\S]*?<\/svg>)<\/div>/g)) {
        const png = await svgToPng(m[1]);
        swaps.push([m[0], png ? `<p>${add(png.data, png.w, png.h)}</p>` : '']);
    }
    for (const m of html.matchAll(/<img src="(data:[^"]+)"[^>]*\/?>/g)) {
        const { w, h } = await imgSize(m[1]);
        swaps.push([m[0], `<p>${add(m[1], w, h)}</p>`]);
    }
    let out = html;
    swaps.forEach(([a, b]) => { out = out.replace(a, b); });
    const doc = wordFile(out, title, logo);
    const wrap = (s) => s.replace(/(.{76})/g, '$1\r\n');
    const utf8 = btoa(unescape(encodeURIComponent(doc)));
    const B = '----=_urbios_word';
    return [
        'MIME-Version: 1.0', `Content-Type: multipart/related; boundary="${B}"; type="text/html"`, '',
        `--${B}`, 'Content-Type: text/html; charset="utf-8"', 'Content-Transfer-Encoding: base64', `Content-Location: ${BASE}doc.htm`, '', wrap(utf8), '',
        ...parts.flatMap((p) => [`--${B}`, `Content-Type: ${p.type}`, 'Content-Transfer-Encoding: base64', `Content-Location: ${BASE}${p.name}`, '', wrap(p.b64), '']),
        `--${B}--`, '',
    ].join('\r\n');
};
