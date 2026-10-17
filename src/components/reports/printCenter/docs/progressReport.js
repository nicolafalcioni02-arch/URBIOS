import { esc, fmt, fmtDate, keyFigures, visitsOf } from '../logic/visits';
import { mastheadHtml, titleHtml } from './visitReport';

// piccolo grafico a linee in SVG (stampa nitida a qualsiasi zoom); il colore è quello guida del layout
const sparkSvg = (pts, unit) => {
    const W = 300;
    const H = 120;
    const P = { l: 30, r: 10, t: 14, b: 22 };
    const vals = pts.map((p) => p.v);
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    if (max - min < 1e-9) {
        min -= 1;
        max += 1;
    }
    const pad = (max - min) * 0.15;
    min -= pad;
    max += pad;
    const x = (i) => P.l + (pts.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (pts.length - 1));
    const y = (v) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const area = `${line} L${x(pts.length - 1).toFixed(1)},${H - P.b} L${x(0).toFixed(1)},${H - P.b} Z`;
    const grid = [0, 0.5, 1]
        .map((f) => {
            const v = min + pad + (max - min - 2 * pad) * f;
            const yy = y(v).toFixed(1);
            return `<line x1="${P.l}" x2="${W - P.r}" y1="${yy}" y2="${yy}" style="stroke:#e5e7eb;stroke-width:1"/><text x="${P.l - 4}" y="${yy}" text-anchor="end" dominant-baseline="middle" style="font-size:8px;fill:#9ca3af">${fmt(v)}</text>`;
        })
        .join('');
    const labels = pts
        .map((p, i) => (pts.length <= 6 || i === 0 || i === pts.length - 1 || i % Math.ceil(pts.length / 5) === 0 ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" style="font-size:8px;fill:#6b7280">${esc(fmtDate(p.date, 'short').replace(/ \d{4}$/, ''))}</text>` : ''))
        .join('');
    const dots = pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${i === pts.length - 1 ? 4 : 2.6}" style="fill:${i === pts.length - 1 ? 'var(--accent)' : '#fff'};stroke:var(--accent);stroke-width:1.6"/>`).join('');
    const lastV = pts[pts.length - 1].v;
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">${grid}<path d="${area}" style="fill:var(--accent);opacity:.08"/><path d="${line}" style="fill:none;stroke:var(--accent);stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>${dots}${labels}<text x="${W - P.r}" y="9" text-anchor="end" style="font-size:9px;font-weight:700;fill:var(--accent)">${fmt(lastV)} ${unit}</text></svg>`;
};

const delta = (a, b, unit, d = 1) => {
    if (!a || !b) return '';
    const x = Math.round((b - a) * 10 ** d) / 10 ** d;
    if (!x) return `±0${unit}`;
    const s = x > 0 ? '+' : '−';
    return `${s}${fmt(Math.abs(x), d)}${unit}`;
};

// modi di mostrare i progressi (opzione "Come mostrarlo")
export const PROGRESS_VIEWS = [
    { id: 'completo', label: 'Completo', desc: 'Variazioni, grafici e tabella', icon: 'ph-chart-line-up' },
    { id: 'tabella', label: 'Tabella completa', desc: 'Ogni visita, ogni valore', icon: 'ph-table' },
    { id: 'confronto', label: 'Prima e ora', desc: 'Inizio e ultima visita a confronto', icon: 'ph-arrows-left-right' },
];

// "I tuoi progressi": riepilogo dall'inizio, grafici e tabella di tutte le visite
export const buildProgressHtml = ({ patient: p, prof, draft, opts = {} }) => {
    const visits = visitsOf(p, draft)
        .map((v) => ({ ...v, k: keyFigures(v.data) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!visits.length) return '<p>Nessuna visita registrata.</p>';
    const first = visits[0];
    const last = visits[visits.length - 1];
    const series = [
        ['peso', 'Peso', 'kg'],
        ['fm', 'Massa grassa', '%'],
        ['ffm', 'Massa magra', 'kg'],
        ['vita', 'Circonferenza vita', 'cm'],
        ['bmi', 'BMI', ''],
        ['pha', 'Angolo di fase', '°'],
    ]
        .map(([key, label, unit]) => ({ key, label, unit, pts: visits.filter((v) => v.k[key] > 0).map((v) => ({ date: v.date, v: v.k[key] })) }))
        .filter((s) => s.pts.length >= 1);

    const changes = series
        .filter((s) => s.pts.length >= 2 && ['peso', 'fm', 'ffm', 'vita'].includes(s.key))
        .map((s) => `<div class="d-kpi"><span>${s.label}</span><b>${delta(s.pts[0].v, s.pts[s.pts.length - 1].v, '')}<small> ${s.unit}</small></b><em>da ${fmt(s.pts[0].v)} a ${fmt(s.pts[s.pts.length - 1].v)} ${s.unit}</em></div>`)
        .join('');

    const view = PROGRESS_VIEWS.some((x) => x.id === opts.view) ? opts.view : 'completo';
    const head = `${opts.masthead === false ? '' : mastheadHtml(prof)}
${titleHtml({ kicker: 'Andamento nel tempo', title: 'I tuoi progressi', sub: `${p.nome || ''} ${p.cognome || ''} · ${visits.length} ${visits.length === 1 ? 'visita' : 'visite'}${visits.length > 1 ? ` dal ${fmtDate(first.date)} al ${fmtDate(last.date)}` : ''}`, dateLabel: 'Aggiornato al', date: fmtDate(last.date) })}`;
    const note = `<p class="d-foot-note">I valori sono quelli rilevati durante le visite in studio. Piccole variazioni da una visita all'altra sono normali: conta la tendenza.</p>`;

    // tabella completa: tutte le visite e tutti gli indici, con la variazione totale in fondo
    if (view === 'tabella') {
        const cols = [['peso', 'Peso', 'kg', 1], ['bmi', 'BMI', '', 1], ['fm', 'Grasso', '%', 1], ['fmKg', 'Grasso', 'kg', 1], ['ffm', 'Magra', 'kg', 1], ['pha', 'PhA', '°', 1], ['vita', 'Vita', 'cm', 1], ['fianchi', 'Fianchi', 'cm', 1], ['whtr', 'Vita/alt.', '', 2]].filter(([key]) => visits.some((v) => v.k[key] > 0));
        const firstOf = (key) => visits.find((v) => v.k[key] > 0)?.k[key];
        const lastOf = (key) => [...visits].reverse().find((v) => v.k[key] > 0)?.k[key];
        return `<div class="d-doc">${head}
<table class="d-table d-table-num d-prog"><thead><tr><th>Data</th>${cols.map(([, l, u]) => `<th>${l}${u ? `<small> ${u}</small>` : ''}</th>`).join('')}</tr></thead><tbody>
${visits.map((v) => `<tr><td>${fmtDate(v.date, 'short')}${v.id === 'draft' ? ' <small>(in corso)</small>' : ''}</td>${cols.map(([key, , , d]) => `<td>${fmt(v.k[key], d)}</td>`).join('')}</tr>`).join('')}
${visits.length > 1 ? `<tr class="d-prog-tot"><td>Variazione</td>${cols.map(([key, , , d]) => `<td>${delta(firstOf(key), lastOf(key), '', d)}</td>`).join('')}</tr>` : ''}
</tbody></table>${note}</div>`;
    }

    // prima e ora: per ogni indice il primo e l'ultimo valore, e quanto è cambiato
    if (view === 'confronto') {
        const cmp = series.filter((s) => s.pts.length >= 2);
        const row = (s) => {
            const a = s.pts[0];
            const b = s.pts[s.pts.length - 1];
            return `<div class="d-cmp-r"><div class="d-cmp-l">${s.label}</div><div class="d-cmp-v"><span>${fmtDate(a.date, 'short')}</span><b>${fmt(a.v)}<small> ${s.unit}</small></b></div><div class="d-cmp-arrow">→</div><div class="d-cmp-v now"><span>${fmtDate(b.date, 'short')}</span><b>${fmt(b.v)}<small> ${s.unit}</small></b></div><div class="d-cmp-d">${delta(a.v, b.v, ` ${s.unit}`)}</div></div>`;
        };
        return `<div class="d-doc">${head}
${cmp.length ? `<h2 class="d-h">Dalla prima visita a oggi</h2><div class="d-cmp">${cmp.map(row).join('')}</div>` : '<p class="d-placeholder">Servono almeno due visite per il confronto.</p>'}
${note}</div>`;
    }

    const charts = opts.charts !== false ? series.filter((s) => s.pts.length >= 2).slice(0, 6) : [];
    const rows = [...visits].reverse();

    return `<div class="d-doc">
${opts.masthead === false ? '' : mastheadHtml(prof)}
${titleHtml({ kicker: 'Andamento nel tempo', title: 'I tuoi progressi', sub: `${p.nome || ''} ${p.cognome || ''} · ${visits.length} ${visits.length === 1 ? 'visita' : 'visite'}${visits.length > 1 ? ` dal ${fmtDate(first.date)} al ${fmtDate(last.date)}` : ''}`, dateLabel: 'Aggiornato al', date: fmtDate(last.date) })}
${changes ? `<h2 class="d-h">Dall'inizio del percorso</h2><div class="d-kpis">${changes}</div>` : ''}
${charts.length ? `<h2 class="d-h">Grafici</h2><div class="d-charts">${charts.map((s) => `<div class="d-chart"><div class="d-chart-h">${s.label}${s.unit ? ` <small>(${s.unit})</small>` : ''}</div>${sparkSvg(s.pts, s.unit)}</div>`).join('')}</div>` : ''}
${opts.table !== false ? `<h2 class="d-h">Tutte le visite</h2>
<table class="d-table d-table-num"><thead><tr><th>Data</th><th>Peso</th><th>Δ peso</th><th>BMI</th><th>Grasso %</th><th>Magra kg</th><th>Vita</th><th>Fianchi</th></tr></thead><tbody>
${rows.map((v, i) => { const prev = rows[i + 1]; return `<tr><td>${fmtDate(v.date, 'short')}${v.id === 'draft' ? ' <small>(in corso)</small>' : ''}</td><td>${fmt(v.k.peso)}</td><td>${prev ? delta(prev.k.peso, v.k.peso, '') : ''}</td><td>${fmt(v.k.bmi)}</td><td>${fmt(v.k.fm)}</td><td>${fmt(v.k.ffm)}</td><td>${fmt(v.k.vita)}</td><td>${fmt(v.k.fianchi)}</td></tr>`; }).join('')}
</tbody></table>` : ''}
<p class="d-foot-note">I valori sono quelli rilevati durante le visite in studio. Piccole variazioni da una visita all'altra sono normali: conta la tendenza.</p>
</div>`;
};
