// Figure del quaderno: una figura è { nome (didascalia), note, img?, chart? }.
// img = data URL ridotta; chart = { type: 'bar'|'line'|'pie', title, xLabel, yLabel, cats: [..], series: [{ name, vals: [..] }] }.
// Pura: chartSvg() restituisce una stringa SVG (serve sia all'editor sia ad anteprima/stampa).

export const CHART_TYPES = [['bar', 'Istogramma'], ['line', 'Linee'], ['pie', 'Torta']];
export const emptyChart = () => ({ type: 'bar', title: '', xLabel: '', yLabel: '', cats: ['A', 'B', 'C'], series: [{ name: 'Serie 1', vals: ['', '', ''] }] });
const TONES = ['#2F54EB', '#121317', '#6E6D69', '#1F8A5B', '#B7791F', '#C2413A'];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : 0; };
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
    const series = (c.series || []).filter((s) => s);
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
            body += `<rect x="300" y="${y - 10}" width="12" height="12" rx="2" fill="${TONES[i % TONES.length]}"/><text x="320" y="${y}" font-size="12" fill="#121317" ${fs}>${esc(k)} · ${Math.round((vals[i] / tot) * 100)}%</text>`;
        });
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

// HTML della figura per anteprima e stampa
export const figureVisual = (f) => {
    if (f.img) return `<img src="${f.img}" alt="" style="max-width:100%;max-height:90mm;display:block;margin:2mm auto"/>`;
    if (hasChart(f.chart)) return `<div style="max-width:130mm;margin:2mm auto">${chartSvg(f.chart)}</div>`;
    return '';
};
