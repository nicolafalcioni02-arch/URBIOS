// Figure del quaderno: una figura è { nome (didascalia), note, img?, chart? }.
// img = data URL ridotta; chart = { type: 'bar'|'line'|'pie', title, xLabel, yLabel, cats: [..], series: [{ name, vals: [..] }] }.
// Pura: chartSvg() restituisce una stringa SVG (serve sia all'editor sia ad anteprima/stampa).

export const CHART_TYPES = [['bar', 'Istogramma'], ['line', 'Linee'], ['pie', 'Torta'], ['scatter', 'Curva / regressione']];
export const NORMS = [['', 'Nessuna'], ['blank', 'Sottrai il bianco (prima riga)'], ['ctrl', 'Dividi per il controllo (prima riga)'], ['pct', '% del massimo'], ['z', 'Punteggio z']];
export const emptyChart = () => ({ type: 'bar', title: '', xLabel: '', yLabel: '', cats: ['A', 'B', 'C'], series: [{ name: 'Serie 1', vals: ['', '', ''] }] });
const TONES = ['#2F54EB', '#121317', '#6E6D69', '#1F8A5B', '#B7791F', '#C2413A'];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (v) => { const t = String(v ?? '').trim().replace(',', '.'); if (t === '') return NaN; const x = Number(t); return Number.isFinite(x) ? x : NaN; };
const fmt = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '–');
const n = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : 0; };

// normalizzazione di una colonna di valori: restituisce la funzione v -> v' (le caselle vuote restano vuote)
const normFn = (norm, vals) => {
    const v = (vals || []).map(num);
    const ok = v.filter(Number.isFinite);
    const ref = v.length ? v[0] : NaN;
    if (norm === 'blank') return (x) => x - (Number.isFinite(ref) ? ref : 0);
    if (norm === 'ctrl') return (x) => (Number.isFinite(ref) && ref !== 0 ? x / ref : NaN);
    if (norm === 'pct') { const mx = Math.max(...ok.map(Math.abs), 0); return (x) => (mx ? (x / mx) * 100 : NaN); }
    if (norm === 'z') {
        const m = ok.reduce((a, b) => a + b, 0) / (ok.length || 1);
        const sd = Math.sqrt(ok.reduce((a, b) => a + (b - m) ** 2, 0) / (ok.length > 1 ? ok.length - 1 : 1));
        return (x) => (sd ? (x - m) / sd : NaN);
    }
    return (x) => x;
};
export const normSeries = (c) => (c.series || []).map((s) => {
    const f = normFn(c.norm, s.vals);
    return { ...s, vals: (s.vals || []).map((x) => { const v = num(x); return Number.isNaN(v) ? '' : f(v); }) };
});

// regressione lineare (minimi quadrati) e r di Pearson su x (cats numeriche) e y; null se servono più punti
export const regress = (xs, ys) => {
    const p = xs.map((x, i) => [num(x), num(ys[i])]).filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]));
    const N = p.length;
    if (N < 2) return null;
    const mx = p.reduce((a, q) => a + q[0], 0) / N;
    const my = p.reduce((a, q) => a + q[1], 0) / N;
    const sxx = p.reduce((a, q) => a + (q[0] - mx) ** 2, 0);
    const syy = p.reduce((a, q) => a + (q[1] - my) ** 2, 0);
    const sxy = p.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0);
    if (!sxx) return null;
    const m = sxy / sxx;
    const r = syy ? sxy / Math.sqrt(sxx * syy) : NaN;
    return { n: N, m, b: my - m * mx, r, r2: r * r };
};
export const eqText = (g) => `y = ${fmt(g.m)}x ${g.b < 0 ? '−' : '+'} ${fmt(Math.abs(g.b))}`;
export const statText = (g) => `${eqText(g)}, R² = ${fmt(g.r2)}, r = ${fmt(g.r)}, n = ${g.n}`;
// regressioni di tutte le serie del grafico (sui valori già normalizzati)
export const regressions = (c) => normSeries(c).map((s) => regress(c.cats || [], s.vals));
// concentrazione dei campioni ignoti: x = (y − b) / m sulla curva della prima serie
export const unknownResults = (c) => {
    const g = regressions(c)[0];
    const f = normFn(c.norm, (c.series[0] || {}).vals);
    return (c.unknowns || []).map((u) => {
        const y = num(u.y);
        const v = Number.isFinite(y) ? f(y) : NaN;
        const x = g && g.m && Number.isFinite(v) ? (v - g.b) / g.m : NaN;
        const fuori = Number.isFinite(x) && (c.cats || []).map(num).filter(Number.isFinite).length > 1 && (x < Math.min(...c.cats.map(num).filter(Number.isFinite)) || x > Math.max(...c.cats.map(num).filter(Number.isFinite)));
        return { nome: u.nome, y, x: Number.isFinite(x) ? x * (num(u.dil) || 1) : NaN, fuori };
    });
};

export const hasChart = (c) => Boolean(c && c.cats && c.cats.length && c.series && c.series.some((s) => (s.vals || []).some((v) => String(v).trim() !== '')));

// ridimensiona un'immagine caricata (lato lungo max 1200 px, JPEG) per non gonfiare l'archivio
export const readImage = (file, max = 1200) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('lettura'));
    fr.onload = () => {
        const im = new Image();
        im.onerror = () => reject(new Error('immagine'));
        im.onload = () => {
            const k = Math.min(1, max / Math.max(im.width, im.height));
            const c = document.createElement('canvas');
            c.width = Math.round(im.width * k);
            c.height = Math.round(im.height * k);
            const g = c.getContext('2d');
            g.fillStyle = '#fff';
            g.fillRect(0, 0, c.width, c.height);
            g.drawImage(im, 0, 0, c.width, c.height);
            resolve(c.toDataURL('image/jpeg', 0.85));
        };
        im.src = fr.result;
    };
    fr.readAsDataURL(file);
});

const niceMax = (m) => {
    if (m <= 0) return 1;
    const p = 10 ** Math.floor(Math.log10(m));
    const f = m / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
};

export const chartSvg = (c) => {
    const W = 520;
    const H = 300;
    const cats = c.cats || [];
    const series = normSeries(c).filter((s) => s);
    const fs = 'font-family="Inter,system-ui,sans-serif"';
    let body = '';
    const legend = series.length > 1 || c.type === 'pie';
    let top = c.title ? 26 : 10;
    if (c.title) body += `<text x="${W / 2}" y="17" text-anchor="middle" font-size="13" font-weight="600" fill="#121317" ${fs}>${esc(c.title)}</text>`;
    if (c.type === 'pie') {
        const vals = cats.map((_, i) => Math.max(0, n(series[0] && series[0].vals[i])));
        const tot = vals.reduce((a, b) => a + b, 0) || 1;
        const cx = 150; const cy = top + (H - top) / 2; const r = Math.min(110, (H - top) / 2 - 8);
        let a0 = -Math.PI / 2;
        vals.forEach((v, i) => {
            const a1 = a0 + (v / tot) * Math.PI * 2;
            if (v > 0) {
                const big = a1 - a0 > Math.PI ? 1 : 0;
                body += v === tot
                    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${TONES[i % TONES.length]}"/>`
                    : `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z" fill="${TONES[i % TONES.length]}" stroke="#fff" stroke-width="1.5"/>`;
            }
            a0 = a1;
        });
        cats.forEach((k, i) => {
            const y = top + 14 + i * 20;
            body += `<rect x="300" y="${y - 10}" width="12" height="12" rx="2" fill="${TONES[i % TONES.length]}"/><text x="320" y="${y}" font-size="12" fill="#121317" ${fs}>${esc(k)}: ${Math.round((vals[i] / tot) * 100)}%</text>`;
        });
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img">${body}</svg>`;
    }
    if (c.type === 'scatter') {
        const L = c.yLabel ? 58 : 46; const R = 16; const B = 38 + (c.xLabel ? 16 : 0) + (legend ? 18 : 0);
        const pw = W - L - R; const ph = H - top - B;
        const xs = cats.map(num);
        const pts = series.map((s) => cats.map((_, i) => [xs[i], num(s.vals[i])]).filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1])));
        const ax = pts.flat().map((q) => q[0]); const ay = pts.flat().map((q) => q[1]);
        if (!ax.length) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img">${body}</svg>`;
        const gs = series.map((s) => regress(cats, s.vals));
        const x0 = Math.min(0, ...ax); const x1 = niceMax(Math.max(0, ...ax)) || 1;
        const y0 = Math.min(0, ...ay); const y1 = Math.max(0, ...ay);
        const yhi = y1 > 0 ? niceMax(y1) : 0; const ylo = y0 < 0 ? -niceMax(-y0) : 0;
        const X = (v) => L + ((v - x0) / (x1 - x0 || 1)) * pw;
        const Y = (v) => top + ph - ((v - ylo) / ((yhi - ylo) || 1)) * ph;
        for (let t = 0; t <= 5; t++) {
            const v = ylo + ((yhi - ylo) * t) / 5; const yy = Y(v);
            body += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="#E6E4DE"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" font-size="10.5" fill="#6E6D69" ${fs}>${+v.toFixed(3)}</text>`;
            const xv = x0 + ((x1 - x0) * t) / 5;
            body += `<text x="${X(xv)}" y="${top + ph + 15}" text-anchor="middle" font-size="10.5" fill="#6E6D69" ${fs}>${+xv.toFixed(3)}</text>`;
        }
        body += `<line x1="${L}" x2="${W - R}" y1="${Y(Math.max(ylo, 0))}" y2="${Y(Math.max(ylo, 0))}" stroke="#6E6D69"/><line x1="${L}" x2="${L}" y1="${top}" y2="${top + ph}" stroke="#6E6D69"/>`;
        series.forEach((s, si) => {
            const col = TONES[si % TONES.length];
            if (gs[si]) body += `<line x1="${X(x0)}" y1="${Y(gs[si].m * x0 + gs[si].b)}" x2="${X(x1)}" y2="${Y(gs[si].m * x1 + gs[si].b)}" stroke="${col}" stroke-width="1.6" stroke-dasharray="5 3"/>`;
            body += pts[si].map((q) => `<circle cx="${X(q[0])}" cy="${Y(q[1])}" r="3.6" fill="${col}"/>`).join('');
            if (gs[si]) body += `<text x="${L + 8}" y="${top + 14 + si * 14}" font-size="10.5" fill="${col}" ${fs}>${esc(series.length > 1 ? `${s.name || `Serie ${si + 1}`}: ` : '')}${esc(eqText(gs[si]))} · R² = ${fmt(gs[si].r2)}</text>`;
        });
        const g0 = gs[0];
        if (g0 && g0.m) (c.unknowns || []).forEach((u) => {
            const r = unknownResults({ ...c, unknowns: [u] })[0];
            if (Number.isFinite(r.x) && !(num(u.dil) > 0 && num(u.dil) !== 1)) body += `<circle cx="${X(r.x)}" cy="${Y(g0.m * r.x + g0.b)}" r="4.2" fill="#fff" stroke="#121317" stroke-width="1.6"/>`;
        });
        if (c.xLabel) body += `<text x="${L + pw / 2}" y="${top + ph + 32}" text-anchor="middle" font-size="11.5" fill="#121317" ${fs}>${esc(c.xLabel)}</text>`;
        if (c.yLabel) body += `<text transform="translate(13 ${top + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="#121317" ${fs}>${esc(c.yLabel)}</text>`;
        if (legend) {
            let x = L;
            series.forEach((s, si) => { body += `<rect x="${x}" y="${H - 14}" width="11" height="11" rx="2" fill="${TONES[si % TONES.length]}"/><text x="${x + 16}" y="${H - 4.5}" font-size="11" fill="#121317" ${fs}>${esc(s.name || `Serie ${si + 1}`)}</text>`; x += 30 + String(s.name || 'Serie 1').length * 6.4; });
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img">${body}</svg>`;
    }
    const L = c.yLabel ? 58 : 44; const R = 14; const B = 34 + (c.xLabel ? 16 : 0) + (legend ? 18 : 0);
    const pw = W - L - R; const ph = H - top - B;
    const all = series.flatMap((s) => cats.map((_, i) => n(s.vals[i])));
    const mx = niceMax(Math.max(0, ...all)); const mn = Math.min(0, ...all);
    const lo = mn < 0 ? -niceMax(-mn) : 0;
    const y = (v) => top + ph - ((v - lo) / (mx - lo)) * ph;
    for (let t = 0; t <= 5; t++) {
        const v = lo + ((mx - lo) * t) / 5; const yy = y(v);
        body += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="#E6E4DE"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" font-size="10.5" fill="#6E6D69" ${fs}>${+v.toFixed(2)}</text>`;
    }
    body += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="#6E6D69"/><line x1="${L}" x2="${L}" y1="${top}" y2="${top + ph}" stroke="#6E6D69"/>`;
    const slot = pw / Math.max(1, cats.length);
    cats.forEach((k, i) => { body += `<text x="${L + slot * (i + 0.5)}" y="${top + ph + 15}" text-anchor="middle" font-size="10.5" fill="#6E6D69" ${fs}>${esc(String(k).slice(0, 14))}</text>`; });
    if (c.type === 'line') {
        series.forEach((s, si) => {
            const pts = cats.map((_, i) => [L + slot * (i + 0.5), y(n(s.vals[i]))]);
            body += `<polyline fill="none" stroke="${TONES[si % TONES.length]}" stroke-width="2" points="${pts.map((p) => p.join(',')).join(' ')}"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="${TONES[si % TONES.length]}"/>`).join('')}`;
        });
    } else {
        const bw = (slot * 0.74) / Math.max(1, series.length);
        series.forEach((s, si) => cats.forEach((_, i) => {
            const v = n(s.vals[i]); const x = L + slot * i + slot * 0.13 + bw * si;
            body += `<rect x="${x}" y="${Math.min(y(v), y(0))}" width="${bw - 1}" height="${Math.abs(y(v) - y(0))}" fill="${TONES[si % TONES.length]}"/>`;
        }));
    }
    if (c.xLabel) body += `<text x="${L + pw / 2}" y="${top + ph + 32}" text-anchor="middle" font-size="11.5" fill="#121317" ${fs}>${esc(c.xLabel)}</text>`;
    if (c.yLabel) body += `<text transform="translate(13 ${top + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="#121317" ${fs}>${esc(c.yLabel)}</text>`;
    if (legend) {
        let x = L;
        series.forEach((s, si) => { body += `<rect x="${x}" y="${H - 14}" width="11" height="11" rx="2" fill="${TONES[si % TONES.length]}"/><text x="${x + 16}" y="${H - 4.5}" font-size="11" fill="#121317" ${fs}>${esc(s.name || `Serie ${si + 1}`)}</text>`; x += 30 + String(s.name || 'Serie 1').length * 6.4; });
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img">${body}</svg>`;
};

// Gel: gel = { src (foto originale), img (foto lavorata), w, h, title, lanes: [etichette], x0, x1 (% larghezza: corsie), laneDx: [% di spostamento per corsia],
// tilt (gradi: inclinazione delle corsie), angle (0|45|90), ladder: [{ text, y }], marks: [{ text, x, y, color? }],
// cuts: [{ dir: 'v'|'h', pos }] (taglia la foto in parti), hide: { v: [n parte], h: [n parte] }, gap (px tra le parti),
// proc: { l, t, r, b (% ritaglio), rot (0|90|180|270), deg (raddrizza, gradi), gray, invert, bright, contr (-100..100), tint },
// style: { title, lanes, ladder, marks (colori), size (corsie), size2 (marcatori e bande) } }
export const defaultProc = () => ({ l: 0, t: 0, r: 0, b: 0, rot: 0, deg: 0, gray: false, invert: false, bright: 0, contr: 0, tint: '' });
export const gelStyle = (g) => ({ title: '#121317', lanes: '#121317', ladder: '#121317', marks: '#121317', size: 11.5, size2: 11, ...(g.style || {}) });
export const emptyGel = () => ({ img: '', src: '', w: 0, h: 0, title: '', lanes: ['M', '1', '2', '3'], x0: 8, x1: 92, laneDx: [], tilt: 0, angle: 45, ladder: [], marks: [], cuts: [], hide: {}, gap: 8, proc: defaultProc(), style: {} });
export const hasGel = (g) => Boolean(g && g.img);
export const GEL_TINTS = [['', 'Nessuna'], ['#2F54EB', 'Blu'], ['#1F8A5B', 'Verde'], ['#C2413A', 'Rosso'], ['#B7791F', 'Ambra']];
export const LADDERS = [
    ['Proteine (kDa)', ['180', '130', '100', '70', '55', '40', '35', '25', '15', '10'].map((t) => `${t} kDa`)],
    ['DNA (bp)', ['10000', '5000', '3000', '2000', '1500', '1000', '750', '500', '250'].map((t) => `${t} bp`)],
];

// lavora la foto: raddrizza/ruota, ritaglia, grigi, inverti, luminosità, contrasto, colore (pixel a mano: Safari non supporta ctx.filter)
export const processGel = (src, p, noCrop) => new Promise((resolve) => {
    const im = new Image();
    im.onerror = () => resolve({ img: src, w: 4, h: 3 });
    im.onload = () => {
        const P = { ...defaultProc(), ...(p || {}) };
        if (noCrop) { P.l = 0; P.t = 0; P.r = 0; P.b = 0; }
        const sw = im.width; const sh = im.height;
        if (!P.l && !P.t && !P.r && !P.b && !P.rot && !P.deg && !P.gray && !P.invert && !P.bright && !P.contr && !P.tint) { resolve({ img: src, w: sw, h: sh }); return; }
        const rad = (((P.rot + Number(P.deg || 0)) % 360) * Math.PI) / 180;
        const co = Math.abs(Math.cos(rad)); const si = Math.abs(Math.sin(rad));
        const bw = Math.ceil(sw * co + sh * si); const bh = Math.ceil(sw * si + sh * co);
        const c1 = document.createElement('canvas');
        c1.width = bw; c1.height = bh;
        const g1 = c1.getContext('2d');
        g1.fillStyle = '#fff'; g1.fillRect(0, 0, bw, bh);
        g1.translate(bw / 2, bh / 2); g1.rotate(rad); g1.drawImage(im, -sw / 2, -sh / 2);
        const cx = Math.round((bw * P.l) / 100); const cy = Math.round((bh * P.t) / 100);
        const cw = Math.max(8, Math.round(bw * (1 - (P.l + P.r) / 100))); const ch = Math.max(8, Math.round(bh * (1 - (P.t + P.b) / 100)));
        const c = document.createElement('canvas');
        c.width = cw; c.height = ch;
        const g = c.getContext('2d');
        g.drawImage(c1, cx, cy, cw, ch, 0, 0, cw, ch);
        const d = g.getImageData(0, 0, cw, ch);
        const px = d.data;
        const cf = (259 * (P.contr * 2.55 + 255)) / (255 * (259 - P.contr * 2.55));
        const t = P.tint ? [parseInt(P.tint.slice(1, 3), 16), parseInt(P.tint.slice(3, 5), 16), parseInt(P.tint.slice(5, 7), 16)] : null;
        for (let i = 0; i < px.length; i += 4) {
            let r = px[i]; let gg = px[i + 1]; let b = px[i + 2];
            if (P.gray || t) { const y = 0.299 * r + 0.587 * gg + 0.114 * b; r = y; gg = y; b = y; }
            r = cf * (r - 128) + 128 + P.bright * 2.55; gg = cf * (gg - 128) + 128 + P.bright * 2.55; b = cf * (b - 128) + 128 + P.bright * 2.55;
            if (P.invert) { r = 255 - r; gg = 255 - gg; b = 255 - b; }
            if (t) { const k = Math.max(0, Math.min(255, r)) / 255; r = t[0] * k; gg = t[1] * k; b = t[2] * k; }
            px[i] = r; px[i + 1] = gg; px[i + 2] = b;
        }
        g.putImageData(d, 0, 0);
        resolve({ img: c.toDataURL('image/jpeg', 0.9), w: cw, h: ch });
    };
    im.src = src;
});

// un asse (larghezza o altezza) diviso dai tagli in parti; f: % della foto -> pixel del disegno, inv: il contrario
const axis = (g, dir, len) => {
    const cuts = (g.cuts || []).filter((c) => c.dir === dir).map((c) => n(c.pos)).sort((a, b) => a - b);
    const bd = [0, ...cuts, 100];
    const hid = (g.hide && g.hide[dir]) || [];
    const gap = g.gap === undefined ? 8 : n(g.gap);
    const segs = [];
    let off = 0;
    for (let i = 0; i < bd.length - 1; i++) {
        const vis = !hid.includes(i);
        const l = vis ? ((bd[i + 1] - bd[i]) / 100) * len : 0;
        segs.push({ a: bd[i], z: bd[i + 1], vis, off, len: l });
        if (vis) off += l + gap;
    }
    const total = Math.max(1, off - (segs.some((s) => s.vis) ? gap : 0));
    const f = (p) => {
        if (p < 0) return (p / 100) * len;
        if (p > 100) return total + ((p - 100) / 100) * len;
        const s = segs.find((q) => p <= q.z) || segs[segs.length - 1];
        return s.vis ? s.off + ((p - s.a) / 100) * len : s.off;
    };
    const inv = (d) => {
        const vs = segs.filter((q) => q.vis);
        if (!vs.length) return 0;
        const s = vs.find((q) => d <= q.off + q.len + gap / 2) || vs[vs.length - 1];
        return Math.max(s.a, Math.min(s.z, s.a + ((d - s.off) / (s.len || 1)) * (s.z - s.a)));
    };
    return { segs, total, f, inv };
};

// misure del disegno (servono anche all'editor per tradurre un clic in posizione sul gel)
export const gelLayout = (g) => {
    const Wb = 420;
    const Hb = Math.round((Wb * (g.h || 3)) / (g.w || 4));
    const ax = axis(g, 'v', Wb); const ay = axis(g, 'h', Hb);
    const st = gelStyle(g);
    const ang = Number(g.angle) || 0;
    const mt = (g.title ? 24 : 8) + (ang === 0 ? st.size + 10 : ang === 45 ? st.size * 4.4 + 6 : st.size * 5.4 + 6);
    const ml = (g.ladder || []).length ? 62 : 14;
    const mr = (g.marks || []).length ? 120 : 14;
    const shift = (Math.tan(((Number(g.tilt) || 0) * Math.PI) / 180) * Hb) / Wb * 100; // spostamento (% larghezza) della corsia dall'alto al basso
    return { Wb, Hb, ax, ay, W: ax.total, H: ay.total, mt, ml, mr, shift, tw: ml + ax.total + mr, th: mt + ay.total + 8 };
};
export const laneTop = (g, i) => n(g.x0) + ((n(g.x1) - n(g.x0)) * (i + 0.5)) / Math.max(1, (g.lanes || []).length) + n((g.laneDx || [])[i]);

export const gelSvg = (g, opt = {}) => {
    const L = gelLayout(g);
    const { Wb, Hb, ax, ay, mt, ml, tw, th, W, H } = L;
    const st = gelStyle(g);
    const lanes = g.lanes || [];
    const ang = Number(g.angle) || 0;
    const fs = 'font-family="Inter,system-ui,sans-serif"';
    const X = (p) => ml + ax.f(p); const Y = (p) => mt + ay.f(p);
    let b = '';
    ay.segs.forEach((sy) => ax.segs.forEach((sx) => {
        if (!sx.vis || !sy.vis || !sx.len || !sy.len) return;
        b += `<svg x="${ml + sx.off}" y="${mt + sy.off}" width="${sx.len}" height="${sy.len}" viewBox="${(sx.a / 100) * Wb} ${(sy.a / 100) * Hb} ${(sx.len / Wb) * Wb * 1} ${sy.len}" preserveAspectRatio="none"><image href="${g.img}" x="0" y="0" width="${Wb}" height="${Hb}" preserveAspectRatio="none"/></svg><rect x="${ml + sx.off}" y="${mt + sy.off}" width="${sx.len}" height="${sy.len}" fill="none" stroke="#6E6D69"/>`;
    }));
    if (opt.guides) {
        (g.cuts || []).forEach((c) => { b += c.dir === 'v' ? `<line x1="${X(n(c.pos))}" x2="${X(n(c.pos))}" y1="${mt - 4}" y2="${mt + H + 4}" stroke="#C2413A" stroke-dasharray="4 3"/>` : `<line y1="${Y(n(c.pos))}" y2="${Y(n(c.pos))}" x1="${ml - 4}" x2="${ml + W + 4}" stroke="#C2413A" stroke-dasharray="4 3"/>`; });
        lanes.forEach((_, i) => { const p = laneTop(g, i); b += `<line x1="${X(p)}" x2="${X(p + L.shift)}" y1="${mt}" y2="${mt + H}" stroke="#2F54EB" stroke-width="1" stroke-dasharray="3 3" opacity=".75"/>`; });
    }
    if (g.title) b += `<text x="${ml + W / 2}" y="16" text-anchor="middle" font-size="13" font-weight="600" fill="${st.title}" ${fs}>${esc(g.title)}</text>`;
    lanes.forEach((l, i) => {
        const cx = X(laneTop(g, i)); const y = mt - 6;
        b += ang === 0
            ? `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${st.size}" fill="${st.lanes}" ${fs}>${esc(l)}</text>`
            : `<text transform="translate(${cx} ${y}) rotate(${-ang})" font-size="${st.size}" fill="${st.lanes}" ${fs}>${esc(l)}</text>`;
    });
    (g.ladder || []).forEach((m) => {
        const y = Y(n(m.y));
        b += `<line x1="${ml - 5}" x2="${ml}" y1="${y}" y2="${y}" stroke="${st.ladder}"/><text x="${ml - 8}" y="${y + st.size2 / 3}" text-anchor="end" font-size="${st.size2}" fill="${st.ladder}" ${fs}>${esc(m.text)}</text>`;
    });
    (g.marks || []).forEach((m) => {
        const y = Y(n(m.y)); const x = X(n(m.x)); const col = m.color || st.marks;
        b += `<line x1="${x}" x2="${ml + W + 8}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="2.2" fill="${col}"/><text x="${ml + W + 12}" y="${y + st.size2 / 3}" font-size="${st.size2}" fill="${col}" ${fs}>${esc(m.text)}</text>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tw} ${th}" width="100%" role="img">${b}</svg>`;
};

// HTML della figura per anteprima e stampa
export const figureVisual = (f) => {
    if (hasGel(f.gel)) return `<div style="max-width:140mm;margin:2mm auto">${gelSvg(f.gel)}</div>`;
    if (f.img) return `<img src="${f.img}" alt="" style="max-width:100%;max-height:90mm;display:block;margin:2mm auto"/>`;
    if (hasChart(f.chart)) return `<div style="max-width:130mm;margin:2mm auto">${chartSvg(f.chart)}${chartNotes(f.chart)}</div>`;
    return '';
};

// riepilogo sotto il grafico a curva: statistiche per serie e concentrazioni dei campioni ignoti
export const chartNotes = (c) => {
    if (c.type !== 'scatter') return '';
    const gs = regressions(c);
    let h = gs.map((g, i) => (g ? `<div style="font-size:10pt;margin-top:1mm">${esc((c.series[i].name || `Serie ${i + 1}`))}: ${esc(statText(g))}</div>` : '')).join('');
    const u = unknownResults(c).filter((r) => Number.isFinite(r.x));
    if (u.length) {
        h += `<table style="font-size:10pt;border-collapse:collapse;margin-top:2mm;width:100%"><tr><th align="left">Campione</th><th align="right">Segnale</th><th align="right">Concentrazione${c.unit ? ` (${esc(c.unit)})` : ''}</th></tr>${u.map((r) => `<tr><td>${esc(r.nome || '')}</td><td align="right">${fmt(r.y)}</td><td align="right">${fmt(r.x)}${r.fuori ? ' *' : ''}</td></tr>`).join('')}</table>`;
        if (u.some((r) => r.fuori)) h += '<div style="font-size:9pt;margin-top:1mm">* fuori dall\'intervallo della curva: stima per estrapolazione.</div>';
    }
    return h;
};
