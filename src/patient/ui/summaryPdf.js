// «Riassunto del percorso»: PDF compilato e non modificabile, generato SUL TELEFONO (nessun dato esce dall'app).
// Layout ispirato alla fattura URBIOS (logo + intestazione, riquadri dati, tabelle a righe sottili, piè di pagina).
// Nessuna libreria: un piccolo scrittore PDF con font standard Helvetica (WinAnsi).
import { arr, toolsOf, fmtKg, fmtDay } from './logic.js';
import { shopItems } from './Tools.jsx';

const W = 595.28, H = 841.89, M = 42, BOT = 60;
const INK = [0.122, 0.141, 0.169], MUTED = [0.45, 0.47, 0.5], LINE = [0.86, 0.87, 0.89], SOFT = [0.955, 0.96, 0.97];
const LOGO = 'M945.28,614.13 A317.54,317.54 0 1,0 940.29,670.16 A92.62,92.62 0 1,0 757.31,641.74 A211.69,211.69 0 0,1 378.07,741.14 A145.54,145.54 0 0,1 403.97,539.87 L534.29,436.27 A277.85,277.85 0 0,1 783.13,386.57 A105.85,105.85 0 0,1 859.53,478.14 A52.92,52.92 0 0,0 887.94,520.05 A105.85,105.85 0 0,1 945.28,614.13 Z';

// Larghezze Helvetica / Helvetica-Bold (caratteri 32–126, unità 1/1000)
const WR = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const WB = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];

const CP = { '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '': 0x97, '×': 0xd7, '·': 0xb7 };
const code = (ch) => { const c = ch.charCodeAt(0); return CP[ch] || (c < 256 ? c : 63); };
const clean = (s) => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/[^\x20-\x7e\xa0-\xff€‚„…‘’“”•–—]/g, '').replace(/ {2,}/g, ' ');
const tw = (s, size, bold) => { let w = 0; for (const ch of clean(s)) { const c = code(ch); w += c >= 32 && c <= 126 ? (bold ? WB : WR)[c - 32] : 556; } return w * size / 1000; };
const esc = (s) => { let o = ''; for (const ch of clean(s)) { const c = code(ch); o += c === 40 || c === 41 || c === 92 ? '\\' + ch : c < 32 ? ' ' : c > 126 ? '\\' + c.toString(8).padStart(3, '0') : ch; } return o; };
const col = (c) => c.map((x) => +x.toFixed(3)).join(' ');
const n2 = (x) => +x.toFixed(2);

// Arco SVG → curve di Bézier (per disegnare il logo)
const arcToBez = (x1, y1, rx, ry, large, sweep, x2, y2) => {
    if (rx === 0 || ry === 0) return [['L', x2, y2]];
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, lam = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    const sq = Math.max(0, (rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx) / (rx * rx * dy * dy + ry * ry * dx * dx));
    const k = (large === sweep ? -1 : 1) * Math.sqrt(sq), cxp = k * (rx * dy) / ry, cyp = -k * (ry * dx) / rx, cx = cxp + (x1 + x2) / 2, cy = cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (dx - cxp) / rx, (dy - cyp) / ry);
    let dt = ang((dx - cxp) / rx, (dy - cyp) / ry, (-dx - cxp) / rx, (-dy - cyp) / ry);
    if (!sweep && dt > 0) dt -= 2 * Math.PI; else if (sweep && dt < 0) dt += 2 * Math.PI;
    const segs = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2))), d = dt / segs, a = (4 / 3) * Math.tan(d / 4), out = [];
    for (let i = 0; i < segs; i++) {
        const s = t1 + i * d, e = s + d, c1 = Math.cos(s), s1 = Math.sin(s), c2 = Math.cos(e), s2 = Math.sin(e);
        out.push(['C', cx + rx * (c1 - a * s1), cy + ry * (s1 + a * c1), cx + rx * (c2 + a * s2), cy + ry * (s2 - a * c2), cx + rx * c2, cy + ry * s2]);
    }
    return out;
};
const logoOps = (x, y, size) => {
    const k = size / 647.1, X = (v) => n2(x + (v - 304.2) * k), Y = (v) => n2(y - (v - 290.6) * k);
    const t = LOGO.match(/[MALZ]|-?\d*\.?\d+/g) || [];
    let i = 0, cx = 0, cy = 0, o = '';
    while (i < t.length) {
        const c = t[i++];
        if (c === 'M') { cx = +t[i++]; cy = +t[i++]; o += `${X(cx)} ${Y(cy)} m `; }
        else if (c === 'L') { cx = +t[i++]; cy = +t[i++]; o += `${X(cx)} ${Y(cy)} l `; }
        else if (c === 'A') {
            const rx = +t[i++], ry = +t[i++]; i++; const lg = +t[i++], sw = +t[i++], ex = +t[i++], ey = +t[i++];
            arcToBez(cx, cy, rx, ry, lg, sw, ex, ey).forEach((s) => { o += s[0] === 'L' ? `${X(s[1])} ${Y(s[2])} l ` : `${X(s[1])} ${Y(s[2])} ${X(s[3])} ${Y(s[4])} ${X(s[5])} ${Y(s[6])} c `; });
            cx = ex; cy = ey;
        } else if (c === 'Z') o += 'h ';
    }
    return o + 'f';
};

class Pdf {
    constructor() { this.pages = []; this.add(); }
    add() { this.cur = []; this.pages.push(this.cur); this.y = H - M; }
    op(s) { this.cur.push(s); }
    text(x, y, s, { size = 10, bold = false, color = INK, align = 'l', max } = {}) {
        let t = clean(s);
        if (max) while (t.length > 1 && tw(t, size, bold) > max) t = t.slice(0, -1);
        const w = tw(t, size, bold), px = align === 'r' ? x - w : align === 'c' ? x - w / 2 : x;
        this.op(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${col(color)} rg ${n2(px)} ${n2(y)} Td (${esc(t)}) Tj ET`);
    }
    line(x1, y1, x2, y2, c = LINE, w = 0.6) { this.op(`${col(c)} RG ${w} w ${n2(x1)} ${n2(y1)} m ${n2(x2)} ${n2(y2)} l S`); }
    rect(x, y, w, h, c, r = 0) {
        if (!r) { this.op(`${col(c)} rg ${n2(x)} ${n2(y)} ${n2(w)} ${n2(h)} re f`); return; }
        const k = r * 0.5523;
        this.op(`${col(c)} rg ${n2(x + r)} ${n2(y)} m ${n2(x + w - r)} ${n2(y)} l ${n2(x + w - r + k)} ${n2(y)} ${n2(x + w)} ${n2(y + r - k)} ${n2(x + w)} ${n2(y + r)} c ${n2(x + w)} ${n2(y + h - r)} l ${n2(x + w)} ${n2(y + h - r + k)} ${n2(x + w - r + k)} ${n2(y + h)} ${n2(x + w - r)} ${n2(y + h)} c ${n2(x + r)} ${n2(y + h)} l ${n2(x + r - k)} ${n2(y + h)} ${n2(x)} ${n2(y + h - r + k)} ${n2(x)} ${n2(y + h - r)} c ${n2(x)} ${n2(y + r)} l ${n2(x)} ${n2(y + r - k)} ${n2(x + r - k)} ${n2(y)} ${n2(x + r)} ${n2(y)} c f`);
    }
    logo(x, y, size, c = INK) { this.op(`${col(c)} rg ${logoOps(x, y, size)}`); }
    wrap(s, size, bold, width) {
        const out = [];
        clean(s).split(/\s+/).filter(Boolean).forEach((w) => {
            const l = out.length ? out[out.length - 1] : null;
            if (l !== null && tw(l + ' ' + w, size, bold) <= width) out[out.length - 1] = l + ' ' + w;
            else { let x = w; while (tw(x, size, bold) > width && x.length > 1) { let k = x.length - 1; while (k > 1 && tw(x.slice(0, k), size, bold) > width) k--; out.push(x.slice(0, k)); x = x.slice(k); } out.push(x); }
        });
        return out.length ? out : [''];
    }
    need(h) { if (this.y - h < BOT) this.add(); }
    bytes(footer) {
        const N = this.pages.length, objs = [];
        const put = (s) => { objs.push(s); return objs.length; };
        const cat = put(''), pgs = put(''), f1 = put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'), f2 = put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'), kids = [];
        this.pages.forEach((ops, i) => {
            const foot = footer(i + 1, N), body = `${col(SOFT)} rg ${logoOps(W / 2 - 190, H / 2 + 190, 380)}\n` + ops.join('\n') + '\n' + foot;
            const c = put(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
            kids.push(put(`<< /Type /Page /Parent ${pgs} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`));
        });
        objs[cat - 1] = `<< /Type /Catalog /Pages ${pgs} 0 R >>`;
        objs[pgs - 1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${N} >>`;
        const info = put('<< /Title (Riassunto del percorso) /Producer (URBIOS) /Creator (URBIOS) >>');
        let out = '%PDF-1.4\n', offs = [];
        objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
        const xr = out.length;
        out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R /Info ${info} 0 R >>\nstartxref\n${xr}\n%%EOF`;
        // stringa "binaria" (ogni carattere = 1 byte, tutti < 256 perché il testo è già in ASCII con escape ottali)
        const u = new Uint8Array(out.length);
        for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255;
        return u;
    }
}

const fullDate = (iso) => { if (!iso) return ''; const [y, m, d] = String(iso).split('-'); return `${d}/${m}/${y}`; };
const longDate = (iso) => { const t = new Date(iso + 'T12:00:00'); return isNaN(t) ? iso : t.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };

// Raccoglie TUTTO il diario in un elenco di sezioni semplici
export const collectSummary = (rt) => {
    const log = rt.log.get(), docs = rt.docs.list(), tools = toolsOf(log), me = rt.status && rt.status();
    const getDoc = rt.docs.get;
    const weights = arr(log.weights).slice().sort((a, b) => String(a.date).localeCompare(b.date));
    const hist = Object.entries(log.hist || {});
    const byDate = {};
    hist.forEach(([name, list]) => arr(list).forEach((h) => { (byDate[h.date] = byDate[h.date] || []).push({ name, sets: arr(h.sets) }); }));
    const pres = (ex) => (ex ? { serie: ex.serie || '', carico: ex.carico || '', pct: ex.pct || '', rpe: ex.rpe || '', rec: ex.rec || '' } : null);
    const byName = {};
    docs.filter((d) => d.kind === 'training').forEach((m) => { const doc = getDoc(m.docId); arr(doc && doc.body && doc.body.settimane).forEach((wk) => arr(wk.giorni).forEach((dy) => arr(dy.esercizi).forEach((e) => { if (!byName[e.nome]) byName[e.nome] = pres(e); }))); });
    const seen = new Set(Object.entries(byDate).flatMap(([d, a]) => a.map((e) => d + '|' + e.name)));
    Object.entries(log.sessions || {}).forEach(([k, r]) => {
        const [docId, w, d, date] = k.split('|'), doc = getDoc(docId), day = doc && doc.body && arr(doc.body.settimane)[+w] && arr(doc.body.settimane[+w].giorni)[+d];
        Object.entries((r && r.sets) || {}).forEach(([i, sets]) => { const ex = day && arr(day.esercizi)[+i], name = ex && ex.nome; if (name && !seen.has(date + '|' + name)) { seen.add(date + '|' + name); (byDate[date] = byDate[date] || []).push({ name, sets: arr(sets), presc: pres(ex) }); } });
    });
    Object.values(byDate).forEach((a) => a.forEach((e) => { if (!e.presc) e.presc = byName[e.name] || null; }));
    const trainDates = Object.keys(byDate).sort();
    // pasti per data
    const mealNames = (docId, d, m) => { const doc = getDoc(docId), p = doc && doc.body && arr(doc.body.giorni)[d] && arr(doc.body.giorni[d].pasti)[m]; return p ? p.nome : 'Pasto'; };
    const meals = {};
    Object.entries(log.meals || {}).forEach(([k, r]) => { const [docId, d, m, date] = k.split('|'), doc = getDoc(docId), pasto = doc && doc.body && arr(doc.body.giorni)[+d] && arr(doc.body.giorni[+d].pasti)[+m];
        const list = arr(r.list).length ? arr(r.list).map((e) => ({ n: e.n, g: e.g })) : arr(pasto && pasto.voci).map((v, i) => ({ n: v.n, g: arr(r.items)[i] != null ? r.items[i] : v.g }));
        (meals[date] = meals[date] || []).push({ n: mealNames(docId, +d, +m), m: +m, list, kcal: r.kcal || 0 }); });
    Object.values(meals).forEach((a) => a.sort((x, y) => x.m - y.m));
    const extras = log.extras || {};
    const mealDates = [...new Set([...Object.keys(meals), ...Object.keys(extras).filter((d) => arr(extras[d]).length)])].sort();
    const cfg = tools.cfg || {};
    const shop = shopItems(docs, getDoc, cfg.days, cfg.people);
    const dd = docs.find((d) => d.kind === 'diet'), goal = dd && getDoc(dd.docId) && getDoc(dd.docId).body ? getDoc(dd.docId).body.obiettivo : null;
    return { goal, docs, tools, me, weights, byDate, trainDates, meals, extras, mealDates, shop };
};

export const buildSummaryPdf = (rt) => {
    const s = collectSummary(rt), pdf = new Pdf(), CW = W - 2 * M;
    const now = new Date(), today = now.toISOString().slice(0, 10);
    const kicker = (t) => { pdf.need(60); pdf.y -= 22; pdf.text(M, pdf.y, t.toUpperCase(), { size: 8, bold: true, color: MUTED }); pdf.y -= 6; pdf.line(M, pdf.y, W - M, pdf.y, INK, 0.8); pdf.y -= 14; };
    const para = (t, { size = 10, bold = false, color = INK, x = M, width = CW, lead = 1.38 } = {}) => { pdf.wrap(t, size, bold, width).forEach((l) => { pdf.need(size * lead); pdf.text(x, pdf.y - size, l, { size, bold, color }); pdf.y -= size * lead; }); };
    const row = (cols) => {
        // cols: [{t, w, bold, align, color}] ; riga con righe sottili sotto, altezza = colonna più alta
        const wr = cols.map((c) => pdf.wrap(c.t, 9.5, !!c.bold, c.w - 6)), sb = cols.map((c) => (c.sub ? pdf.wrap(c.sub, 8.5, false, c.w - 6) : [])), n = Math.max(...cols.map((c, i) => wr[i].length + sb[i].length)), h = n * 13 + 7;
        pdf.need(h);
        const top = pdf.y;
        cols.forEach((c, i) => { const x = cols.slice(0, i).reduce((a, k) => a + k.w, M); wr[i].forEach((l, j) => pdf.text(c.align === 'r' ? x + c.w - 6 : x, top - 11 - j * 13, l, { size: 9.5, bold: !!c.bold, color: c.color || INK, align: c.align === 'r' ? 'r' : 'l' })); sb[i].forEach((l, j) => pdf.text(x, top - 11 - (wr[i].length + j) * 13, l, { size: 8.5, color: MUTED })); });
        pdf.y -= h; pdf.line(M, pdf.y + 2, W - M, pdf.y + 2);
    };
    const head = (cols) => { pdf.need(30); cols.forEach((c, i) => { const x = cols.slice(0, i).reduce((a, k) => a + k.w, M); pdf.text(c.align === 'r' ? x + c.w - 6 : x, pdf.y - 9, c.t, { size: 7.5, bold: true, color: MUTED, align: c.align === 'r' ? 'r' : 'l' }); }); pdf.y -= 14; pdf.line(M, pdf.y + 2, W - M, pdf.y + 2, LINE); };
    const sub = (t) => { pdf.need(110); pdf.y -= 8; pdf.rect(M, pdf.y - 16, CW, 18, SOFT, 4); pdf.text(M + 8, pdf.y - 10, t, { size: 9.5, bold: true }); pdf.y -= 24; };

    // Intestazione (come la fattura: marchio a sinistra, contatti a destra)
    pdf.logo(M, H - M, 26); pdf.text(M + 36, H - M - 18, 'URBIOS', { size: 15, bold: true });
    pdf.y = H - M - 52;
    pdf.text(M, pdf.y, 'RIASSUNTO', { size: 8, bold: true, color: MUTED });
    pdf.text(M, pdf.y - 24, 'del percorso', { size: 24, bold: true });
    const chip = fullDate(today); pdf.rect(W - M - tw(chip, 9, true) - 20, pdf.y - 20, tw(chip, 9, true) + 20, 20, SOFT, 10); pdf.text(W - M - 10, pdf.y - 14, chip, { size: 9, bold: true, align: 'r' });
    pdf.y -= 42;

    // Riquadri dati
    const lastW = s.weights[s.weights.length - 1], firstW = s.weights[0];
    const tSessions = s.trainDates.length, tSets = s.trainDates.reduce((t, d) => t + s.byDate[d].reduce((a, e) => a + e.sets.length, 0), 0);
    const cells = [['Data di creazione', fullDate(today)], ['Peso attuale', lastW ? fmtKg(lastW.kg) + ' kg' : 'Non inserito'], ['Prossimo controllo', s.tools.visit ? fullDate(s.tools.visit) : 'Non impostato'], ['Allenamenti', tSessions + ' giorni, ' + tSets + ' serie']];
    const cw = CW / cells.length;
    cells.forEach(([l, v], i) => { const x = M + i * cw; pdf.rect(x + (i ? 4 : 0), pdf.y - 40, cw - (i === cells.length - 1 ? 0 : 4) - (i ? 0 : 0), 40, SOFT, 6); pdf.text(x + 10, pdf.y - 14, l, { size: 7.5, color: MUTED, max: cw - 18 }); pdf.text(x + 10, pdf.y - 31, v, { size: 10, bold: true, max: cw - 18 }); });
    pdf.y -= 52;
    if (s.docs.length) para('Piani ricevuti: ' + s.docs.map((d) => d.title).join(', '), { size: 9, color: MUTED });

    // Appunti
    const notes = arr(s.tools.notes);
    if (notes.length) { kicker('Da dire al professionista'); notes.forEach((n) => row([{ t: n.at ? fullDate(new Date(n.at).toISOString().slice(0, 10)) : '', w: 72, color: MUTED }, { t: n.t, w: CW - 72 }])); }

    // Peso
    if (s.weights.length) {
        kicker('Peso');
        head([{ t: 'DATA', w: 140 }, { t: 'PESO', w: 120, align: 'r' }, { t: 'VARIAZIONE', w: 120, align: 'r' }]);
        s.weights.forEach((x, i) => { const d = i ? x.kg - s.weights[i - 1].kg : null; row([{ t: fullDate(x.date), w: 140 }, { t: fmtKg(x.kg) + ' kg', w: 120, align: 'r', bold: true }, { t: d === null ? '' : (d > 0 ? '+' : d < 0 ? '-' : '') + fmtKg(Math.abs(Math.round(d * 10) / 10)) + ' kg', w: 120, align: 'r', color: MUTED }]); });
        if (firstW && lastW && s.weights.length > 1) para(`Dal ${fullDate(firstW.date)}: ${(lastW.kg - firstW.kg > 0 ? '+' : lastW.kg - firstW.kg < 0 ? '-' : '') + fmtKg(Math.abs(Math.round((lastW.kg - firstW.kg) * 10) / 10))} kg`, { size: 9, color: MUTED });
    }

    // Allenamenti
    if (s.trainDates.length) {
        kicker('Allenamenti');
        s.trainDates.slice().reverse().forEach((d) => {
            sub(longDate(d));
            head([{ t: '', w: 78 }, { t: 'SERIE', w: 70 }, { t: 'CARICO', w: 90 }, { t: 'RPE', w: 50 }, { t: 'NOTE', w: CW - 288 }]);
            s.byDate[d].forEach((e) => {
                const p = e.presc;
                pdf.need(60); row([{ t: e.name, w: CW, bold: true }]);
                if (p) row([{ t: 'Prescritto', w: 78, color: MUTED }, { t: p.serie || '', w: 70 }, { t: p.carico ? p.carico + ' kg' : p.pct ? p.pct + '%' : '', w: 90 }, { t: p.rpe || '', w: 50 }, { t: p.rec ? 'rec ' + p.rec : '', w: CW - 288, color: MUTED }]);
                e.sets.forEach((x, i) => row([{ t: i ? '' : 'Fatto', w: 78, bold: true }, { t: i + 1 + 'ª serie', w: 70 }, { t: x.kg != null && Number.isFinite(x.kg) && x.kg > 0 ? fmtKg(x.kg) + ' kg' : 'corpo libero', w: 90, bold: true }, { t: x.rpe ? String(x.rpe) : '', w: 50 }, { t: x.note || '', w: CW - 288, color: MUTED }]));
            });
        });
    }

    // Alimentazione
    if (s.mealDates.length) {
        kicker('Alimentazione');
        const ob = s.goal, kc = ob && ob.kcal ? ob.kcal : 0;
        if (ob) para(`Obiettivo giornaliero: ${ob.kcal || 0} kcal, proteine ${ob.p || 0} g, carboidrati ${ob.c || 0} g, grassi ${ob.f || 0} g`, { size: 9, color: MUTED });
        s.mealDates.slice().reverse().forEach((d) => {
            const ms = s.meals[d] || [], ex = arr(s.extras[d]), tot = ms.reduce((t, m) => t + m.kcal, 0) + ex.reduce((t, x) => t + (x.kcal || 0), 0);
            sub(longDate(d) + (kc ? ':  ' + Math.round(tot) + ' kcal su ' + kc : ':  ' + Math.round(tot) + ' kcal'));
            ms.forEach((m) => row([{ t: m.n, w: 110, bold: true }, { t: m.list.map((e) => `${e.n} ${e.g ? e.g + ' g' : ''}`.trim()).join(', ') || '', w: CW - 110 - 70 }, { t: Math.round(m.kcal) + ' kcal', w: 70, align: 'r', color: MUTED }]));
            ex.forEach((x) => row([{ t: 'Fuori piano', w: 110, bold: true }, { t: `${x.n}${x.g ? ' ' + x.g + ' g' : ''}${x.when ? ', ' + x.when : ''}`, w: CW - 110 - 70 }, { t: Math.round(x.kcal || 0) + ' kcal', w: 70, align: 'r', color: MUTED }]));
        });
    }

    // Spesa
    if (s.shop.length) {
        kicker('Lista della spesa');
        s.shop.forEach((x) => row([{ t: s.tools.shop[x.k] ? 'Preso' : '', w: 40, color: MUTED }, { t: x.n, w: CW - 40 - 80 }, { t: x.g >= 1000 ? String(Math.round(x.g / 100) / 10).replace('.', ',') + ' kg' : x.g + ' g', w: 80, align: 'r', color: MUTED }]));
    }

    if (!notes.length && !s.weights.length && !s.trainDates.length && !s.mealDates.length) para('Nel diario non c’è ancora nulla: pesi, allenamenti e pasti registrati compariranno qui.', { color: MUTED });

    const yr = now.getFullYear(), tz = 6.5, ls = tz * 0.3, wU = tw('URBIOS', tz, true) + ls * 6, wC = tw('\xa9 ' + yr, tz, false), tot = 9.6 + 3.7 + wU + 3.7 + wC, x0 = W / 2 - tot / 2, cy = 34, base = cy - 2.3;
    const left = 'Documento personale e riservato, ' + fullDate(today);
    return pdf.bytes((i, n) => `${col(LINE)} RG 0.6 w ${M} 46 m ${W - M} 46 l S\n${col(INK)} rg ${logoOps(x0, cy + 4.8, 9.6)}\nBT /F2 ${tz} Tf ${col(INK)} rg ${ls.toFixed(2)} Tc ${n2(x0 + 13.3)} ${n2(base)} Td (URBIOS) Tj ET\nBT /F1 ${tz} Tf ${col(MUTED)} rg 0 Tc ${n2(x0 + 13.3 + wU + 3.7)} ${n2(base)} Td (\\251 ${yr}) Tj ET\nBT /F1 7.5 Tf ${col(MUTED)} rg ${M} ${n2(base)} Td (${esc(left)}) Tj ET\nBT /F2 ${tz} Tf ${col(INK)} rg ${n2(W - M - tw('Pagina ' + i + ' di ' + n, tz, true))} ${n2(base)} Td (Pagina ${i} di ${n}) Tj ET`);
};

// Crea il file e lo passa a WhatsApp & co. dal foglio di condivisione del telefono; se non c'è, lo scarica.
export const shareSummary = async (rt) => {
    const bytes = buildSummaryPdf(rt), name = `Riassunto-percorso-${new Date().toISOString().slice(0, 10)}.pdf`;
    const file = new File([bytes], name, { type: 'application/pdf' });
    try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Riassunto del percorso' }); return 'shared'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
};
