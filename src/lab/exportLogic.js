import { sectionOf, sheetsFor } from './sections';
import { buildDocx } from './docx';
import { buildXlsx } from './xlsx';
import { fmtDay } from './labLogic';

// Esporta: dagli elementi scelti (voci del laboratorio, documenti e immagini tuoi, file portati dal computer) al formato voluto.
// Elemento: { key, kind: 'rec' | 'txt' | 'img', name, k?, r?, body?, imgs?, src? }. Mappa: README.md
export const FORMATS = [
    { id: 'docx', label: 'Word', ext: 'docx', hint: 'Documento .docx, con le immagini' },
    { id: 'xlsx', label: 'Excel', ext: 'xlsx', hint: 'Fogli per area (solo voci del laboratorio)' },
    { id: 'pdf', label: 'PDF', ext: 'pdf', hint: 'Si apre la stampa: scegli «Salva come PDF»' },
    { id: 'html', label: 'Pagina web', ext: 'html', hint: 'File .html leggibile ovunque' },
    { id: 'txt', label: 'Testo', ext: 'txt', hint: 'Testo semplice, senza immagini' },
    { id: 'json', label: 'JSON', ext: 'json', hint: 'Dati grezzi, per altri programmi' },
];

const clean = (s) => String(s ?? '').trim();
const safe = (s) => clean(s).replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim() || 'Esportazione';
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const day = (v) => (/^\d{4}-\d{2}-\d{2}/.test(String(v)) ? fmtDay(v) : String(v));

// coppie «etichetta, testo» di una voce del laboratorio
export const fieldsOf = (k, r, lab) => {
    const out = [];
    (sectionOf(k).fields || []).forEach((f) => {
        const v = r[f.key];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        let t = '';
        if (f.type === 'ref') { const o = (lab[f.from] || []).find((x) => x.id === v); t = o ? sectionOf(f.from).title(o) : ''; }
        else if (f.type === 'rows') t = v.map((row) => (f.cols || []).map((c) => clean(row[c.key])).filter(Boolean).join(' · ')).filter(Boolean).join('\n');
        else if (f.type === 'steps') t = v.map((p, i) => `${i + 1}. ${clean(typeof p === 'string' ? p : p.testo)}${p && p.durata ? ` (${p.durata})` : ''}`).join('\n');
        else if (f.type === 'figures') t = v.map((x) => x.nome || 'Figura').join(', ');
        else if (typeof v === 'object') return;
        else t = f.type === 'date' ? day(v) : String(v);
        if (clean(t)) out.push([f.label, t]);
    });
    return out;
};

const partsOf = (it, lab) => {
    if (it.kind === 'rec') return { title: it.name, area: sectionOf(it.k).label, fields: fieldsOf(it.k, it.r, lab), text: '', imgs: [] };
    if (it.kind === 'txt') return { title: it.name, area: 'Documento', fields: [], text: it.body || '', imgs: it.imgs || [] };
    return { title: it.name, area: 'Immagine', fields: [], text: '', imgs: [it.src] };
};

export const toTxt = (items, lab) => `${items.map((it) => {
    const p = partsOf(it, lab);
    return [p.title.toUpperCase(), p.area, '', ...p.fields.map(([l, t]) => (t.includes('\n') ? `${l}:\n${t}` : `${l}: ${t}`)), p.text, p.imgs.length ? `(${p.imgs.length} ${p.imgs.length === 1 ? 'immagine non inclusa' : 'immagini non incluse'})` : ''].filter((x, i) => i < 3 || x !== '').join('\n').trim();
}).join('\n\n========================================\n\n')}\n`;

export const toHtml = (items, lab, title = 'Esportazione') => `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body{font:15px/1.55 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#17181B;max-width:780px;margin:32px auto;padding:0 20px}
section{break-inside:avoid-page;margin-bottom:34px;padding-bottom:20px;border-bottom:1px solid #D8DAE0}
h1{font-size:22px;margin:0}small{color:#6B6D76}dl{margin:14px 0 0}dt{font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.04em;color:#6B6D76;margin-top:10px}dd{margin:2px 0 0;white-space:pre-wrap}
img{max-width:100%;max-height:420px;margin:10px 10px 0 0;border-radius:6px;border:1px solid #D8DAE0}p.t{white-space:pre-wrap}
</style></head><body>${items.map((it) => {
    const p = partsOf(it, lab);
    return `<section><h1>${esc(p.title)}</h1><small>${esc(p.area)}</small>${p.fields.length ? `<dl>${p.fields.map(([l, t]) => `<dt>${esc(l)}</dt><dd>${esc(t)}</dd>`).join('')}</dl>` : ''}${p.text ? `<p class="t">${esc(p.text)}</p>` : ''}${p.imgs.length ? `<div>${p.imgs.map((s) => `<img src="${s}" alt="">`).join('')}</div>` : ''}</section>`;
}).join('')}</body></html>`;

export const toJson = (items, lab) => JSON.stringify(items.map((it) => {
    if (it.kind === 'rec') return { tipo: sectionOf(it.k).label, ...it.r };
    if (it.kind === 'txt') return { tipo: 'Documento', nome: it.name, testo: it.body || '', immagini: (it.imgs || []).length };
    return { tipo: 'Immagine', nome: it.name };
}), null, 2);

const dims = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res({ w: im.width, h: im.height }); im.onerror = () => res({ w: 4, h: 3 }); im.src = src; });

export const toDocx = async (items, lab, title) => {
    const blocks = [];
    for (const it of items) {
        const p = partsOf(it, lab);
        const html = `<h2>${esc(p.title)}</h2><p><i>${esc(p.area)}</i></p>${p.fields.map(([l, t]) => `<p><b>${esc(l)}</b><br>${esc(t).replace(/\n/g, '<br>')}</p>`).join('')}${p.text ? `<p>${esc(p.text).replace(/\n/g, '<br>')}</p>` : ''}`;
        blocks.push({ t: 'testo', html });
        for (const src of p.imgs) blocks.push({ t: 'img', img: src, ...(await dims(src)) });
    }
    return buildDocx({ title: items.length > 1 ? title : '', blocks });
};

export const toXlsx = (items, lab) => {
    const sub = {}; const keys = [];
    items.filter((it) => it.kind === 'rec').forEach((it) => { if (!sub[it.k]) { sub[it.k] = []; keys.push(it.k); } sub[it.k].push(it.r); });
    const full = Object.fromEntries(Object.keys(lab).map((k) => [k, sub[k] || []]));
    return buildXlsx(sheetsFor(full, keys));
};

const save = (data, mime, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: mime }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
const MIME = { docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', html: 'text/html;charset=utf-8', txt: 'text/plain;charset=utf-8', json: 'application/json' };
const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });

// esporta; ritorna il testo da mostrare. `one` = un solo file con tutto, altrimenti uno per elemento (non per Excel e PDF)
export const runExport = async ({ items, fmt, one, lab }) => {
    const stamp = new Date().toISOString().slice(0, 10);
    const title = items.length === 1 ? items[0].name : `Esportazione ${stamp}`;
    if (fmt === 'pdf') {
        const w = window.open('', '_blank');
        if (!w) return 'Il browser ha bloccato la finestra: consentila e riprova.';
        w.document.write(toHtml(items, lab, title)); w.document.close(); w.focus();
        setTimeout(() => w.print(), 400);
        return 'Si è aperta la stampa: scegli «Salva come PDF».';
    }
    if (fmt === 'xlsx') {
        const recs = items.filter((it) => it.kind === 'rec');
        if (!recs.length) return 'Excel serve per le voci del laboratorio: aggiungine almeno una.';
        save(toXlsx(items, lab), MIME.xlsx, `${safe(title)}.xlsx`);
        return items.length > recs.length ? 'Fatto. Documenti e immagini non vanno in Excel e sono stati lasciati fuori.' : 'Fatto.';
    }
    const groups = one ? [items] : items.map((it) => [it]);
    const used = new Set();
    for (const g of groups) {
        let base = safe(g.length === 1 ? g[0].name : title); let n = 2;
        while (used.has(base)) { base = `${safe(g[0].name)} ${n}`; n += 1; }
        used.add(base);
        const name = `${base}.${fmt}`;
        if (fmt === 'docx') save(await toDocx(g, lab, title), MIME.docx, name);
        else if (fmt === 'html') save(toHtml(g, lab, base), MIME.html, name);
        else if (fmt === 'txt') save(toTxt(g, lab), MIME.txt, name);
        else save(toJson(g, lab), MIME.json, name);
        if (groups.length > 1) await wait(350);
    }
    return groups.length > 1 ? `Fatto: ${groups.length} file scaricati.` : 'Fatto.';
};
