import { createReportHelpers } from '../../reportPreview/logic/builders/createReportHelpers';
import { buildPanelsHtml } from '../../reportPreview/logic/builders/buildPanelsHtml';
import { ageAt, esc, fmt, fmtDate, keyFigures, multiline } from '../logic/visits';

// Intestazione dello studio, comune ai documenti del Centro stampa
export const mastheadHtml = (prof) => {
    const name = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    const right = [prof.indirizzo_studio, prof.citta_studio, prof.telefono, prof.email, prof.ordine_appartenenza && `${prof.ordine_appartenenza}${prof.numero_albo ? ` n. ${prof.numero_albo}` : ''}`, prof.p_iva && `P.IVA ${prof.p_iva}`]
        .filter(Boolean)
        .map((x) => `<div>${esc(x)}</div>`)
        .join('');
    if (!name && !right && !prof.logo_url) return '';
    return `<div class="d-mast">
        <div class="d-mast-l">${prof.logo_url ? `<img class="d-logo" src="${esc(prof.logo_url)}" alt="">` : ''}<div><div class="d-studio">${esc(name)}</div><div class="d-role">${esc(prof.titolo_professionale || '')}</div></div></div>
        <div class="d-mast-r">${right}</div>
    </div>`;
};

export const titleHtml = ({ kicker, title, sub, dateLabel, date }) => `<div class="d-titlebar">
    <div><div class="d-kicker">${esc(kicker)}</div><h1 class="d-title">${esc(title)}</h1>${sub ? `<div class="d-sub">${esc(sub)}</div>` : ''}</div>
    ${date ? `<div class="d-date"><span>${esc(dateLabel || 'Data')}</span><b>${esc(date)}</b></div>` : ''}
</div>`;

const kpi = (label, value, unit, hint = '') => (value ? `<div class="d-kpi"><span>${label}</span><b>${value}<small>${unit}</small></b>${hint ? `<em>${hint}</em>` : ''}</div>` : '');

const bmiClass = (b) => (b < 18.5 ? 'sottopeso' : b < 25 ? 'normopeso' : b < 30 ? 'sovrappeso' : 'obesità');

// modi di mostrare il report (opzione "Come mostrarlo")
export const VISIT_VIEWS = [
    { id: 'completo', label: 'Completo', desc: 'Indici, profilo, misure in pannelli', icon: 'ph-article' },
    { id: 'tabella', label: 'Tutto in una tabella', desc: 'Ogni valore in righe compatte', icon: 'ph-table' },
    { id: 'cruscotto', label: 'Cruscotto', desc: 'Indici su scale con le fasce', icon: 'ph-gauge' },
    { id: 'sintesi', label: 'Sintesi', desc: 'Una pagina: numeri e valutazione', icon: 'ph-note' },
];

// Report di visita ridisegnato: intestazione, indici in evidenza, profilo, misure in pannelli, valutazione e firma
export const buildVisitReportHtml = ({ patient: p, prof, visit, opts = {} }) => {
    const d = visit.data || {};
    const k = keyFigures(d);
    const eta = ageAt(p, visit.date);
    const sesso = String(p.sesso || '').toUpperCase().startsWith('F') ? 'Donna' : p.sesso ? 'Uomo' : '';

    const helpers = createReportHelpers({ d, patient: p });
    const panelData = [];
    const renderPanel = (title, items) => {
        const rows = items
            .filter((i) => i.v && !i.v.includes('color:#ccc;">-</span>'))
            .map((i) => `<tr><td>${i.l}</td><td>${i.v}</td></tr>`)
            .join('');
        if (rows) panelData.push({ title, items: items.filter((i) => i.v && !i.v.includes('color:#ccc;">-</span>')) });
        return rows ? `<div class="d-panel"><div class="d-panel-h">${title}</div><table>${rows}</table></div>` : '';
    };
    const { allPanelsHTML } = buildPanelsHtml({ ...helpers, d, renderPanel });

    const profile = [
        ['Obiettivo', p.obiettivo],
        ['Patologie', p.patologie],
        ['Farmaci', p.farmaci],
        ['Allergie e intolleranze', p.allergie],
        ['Attività fisica', d.Attivita_Fisica],
    ].filter(([, v]) => String(v ?? '').trim());

    const notes = [
        ['Metabolismo e cuore', d.Note_Metabolismo_Cardio],
        ['Benessere psico-fisico', d.Note_Benessere_Psico_Fisico],
        ['Funzioni organiche', d.Note_Funzioni_Organiche],
        ['Note generali', d.Note_Rilevanti],
    ].filter(([, v]) => String(v ?? '').trim());

    const methods = ['A', 'B']
        .map((m) => [m, d[`risultati_metodo_${m}`]])
        .filter(([, r]) => r && parseFloat(r.fm_percent) > 0)
        .map(([m, r]) => `<tr><td>Metodo ${m}</td><td>${esc(r.formula_densita || '')}${r.formula_conv ? ` · ${esc(r.formula_conv)}` : ''}</td><td>${esc(r.fm_percent)} %</td><td>${esc(r.fm_kg)} kg</td><td>${esc(r.ffm_kg)} kg</td></tr>`)
        .join('');

    const evaluation = String(d.valutazione_report ?? '').trim();
    const evaluationHtml = `<div class="d-prose">${evaluation ? multiline(evaluation).split(/<br><br>/).map((x) => `<p>${x}</p>`).join('') : '<p class="d-placeholder">Scrivi qui la valutazione e i consigli per il paziente.</p>'}</div>`;
    const disclaimer = prof.disclaimer_report || 'Il presente documento riporta misurazioni e valutazioni dello stato nutrizionale. Non costituisce diagnosi medica né sostituisce il parere del medico curante.';
    const head = `${opts.masthead === false ? '' : mastheadHtml(prof)}
${titleHtml({ kicker: 'Report di visita', title: `${p.nome || ''} ${p.cognome || ''}`.trim(), sub: [sesso, eta != null && `${eta} anni`, p.dataNascita && `nato/a il ${fmtDate(p.dataNascita)}`].filter(Boolean).join(' · '), dateLabel: 'Data della visita', date: fmtDate(visit.date) })}`;
    const figures = [
        ['Peso', fmt(k.peso), 'kg', ''],
        ['BMI', fmt(k.bmi), '', k.bmi ? bmiClass(k.bmi) : ''],
        ['Massa grassa', fmt(k.fm), '%', k.fmKg ? `${fmt(k.fmKg)} kg` : ''],
        ['Massa magra', fmt(k.ffm), 'kg', ''],
        ['Angolo di fase', fmt(k.pha), '°', ''],
        ['Vita / altezza', fmt(k.whtr, 2), '', k.whtr ? (k.whtr < 0.5 ? 'nella norma' : 'da migliorare') : ''],
    ].filter(([, v]) => v);
    const view = VISIT_VIEWS.some((x) => x.id === opts.view) ? opts.view : 'completo';

    // tutto in una tabella: due coppie parametro/valore per riga, gruppi con un titolo
    if (view === 'tabella') {
        const groups = [
            ['Indici principali', figures.map(([l, v, u, h]) => [l, `<b>${v}</b>${u ? ` ${u}` : ''}${h ? ` <small>${esc(h)}</small>` : ''}`])],
            ['Profilo e obiettivi', profile.map(([l, v]) => [l, multiline(v)])],
            ...['A', 'B']
                .map((m) => [m, d[`risultati_metodo_${m}`]])
                .filter(([, r]) => r && parseFloat(r.fm_percent) > 0)
                .map(([m, r]) => [`Composizione · metodo ${m}`, [['Formule', esc([r.formula_densita, r.formula_conv].filter(Boolean).join(' · '))], ['Grasso', `${esc(r.fm_percent)} %`], ['Massa grassa', `${esc(r.fm_kg)} kg`], ['Massa magra', `${esc(r.ffm_kg)} kg`]]]),
            ...panelData.map((g) => [g.title, g.items.map((i) => [i.l, i.v])]),
            ['Note della visita', notes.map(([l, v]) => [l, multiline(v)])],
        ].filter(([, rows]) => rows.length);
        const body = groups
            .map(([t, rows]) => {
                const pairs = [];
                for (let i = 0; i < rows.length; i += 2) pairs.push([rows[i], rows[i + 1]]);
                return `<tr class="d-all-g"><th colspan="4">${t}</th></tr>${pairs.map(([a, b]) => `<tr><td class="l">${a[0]}</td><td>${a[1]}</td><td class="l">${b ? b[0] : ''}</td><td>${b ? b[1] : ''}</td></tr>`).join('')}`;
            })
            .join('');
        return `<div class="d-doc">${head}<table class="d-table d-all"><tbody>${body}</tbody></table><h2 class="d-h">Valutazione del professionista</h2>${evaluationHtml}${signHtml(prof, disclaimer)}</div>`;
    }

    // cruscotto: ogni indice su una scala con le fasce di riferimento
    if (view === 'cruscotto') {
        const F = sesso === 'Donna';
        const gauges = [
            k.bmi && { l: 'BMI', v: k.bmi, d: 1, u: '', min: 15, max: 40, cuts: [18.5, 25, 30], names: ['sottopeso', 'normopeso', 'sovrappeso', 'obesità'], good: 1 },
            k.fm && { l: 'Massa grassa', v: k.fm, d: 1, u: '%', min: F ? 10 : 4, max: F ? 50 : 40, cuts: F ? [21, 33, 39] : [8, 20, 25], names: ['bassa', 'adeguata', 'alta', 'molto alta'], good: 1 },
            k.whtr && { l: 'Vita / altezza', v: k.whtr, d: 2, u: '', min: 0.35, max: 0.75, cuts: [0.4, 0.5, 0.6], names: ['bassa', 'nella norma', 'da migliorare', 'alta'], good: 1 },
            k.pha && { l: 'Angolo di fase', v: k.pha, d: 1, u: '°', min: 3, max: 9, cuts: [4.5, 5.5, 6.5], names: ['basso', 'sotto la media', 'buono', 'ottimo'], good: 3 },
        ].filter(Boolean);
        const pct = (g, x) => Math.max(0, Math.min(100, ((x - g.min) / (g.max - g.min)) * 100));
        const gaugeHtml = (g) => {
            const zone = g.cuts.filter((c) => g.v >= c).length;
            const edges = [g.min, ...g.cuts, g.max];
            const segs = edges.slice(0, -1).map((e, i) => `<i class="${i === g.good ? 'ok' : ''}" style="width:${pct(g, edges[i + 1]) - pct(g, e)}%"></i>`).join('');
            return `<div class="d-gauge"><div class="d-gauge-h"><span>${g.l}</span><b>${fmt(g.v, g.d)}<small>${g.u}</small></b><em>${g.names[zone]}</em></div><div class="d-gauge-bar">${segs}<u style="left:${pct(g, g.v)}%"></u></div><div class="d-gauge-sc">${g.cuts.map((c) => `<span style="left:${pct(g, c)}%">${fmt(c, g.d)}</span>`).join('')}</div></div>`;
        };
        const big = [figures.find((f) => f[0] === 'Peso'), figures.find((f) => f[0] === 'Massa magra'), k.fmKg && ['Massa grassa', fmt(k.fmKg), 'kg', '']].filter(Boolean);
        return `<div class="d-doc">${head}
<div class="d-dash">${big.map(([l, v, u]) => `<div class="d-dash-n"><span>${l}</span><b>${v}</b><small>${u}</small></div>`).join('')}</div>
${gauges.length ? `<h2 class="d-h">Dove ti trovi</h2><div class="d-gauges">${gauges.map(gaugeHtml).join('')}</div>` : ''}
${allPanelsHTML.trim() ? `<h2 class="d-h">Misure e parametri</h2><div class="d-grid d-grid-4">${allPanelsHTML}</div>` : ''}
<h2 class="d-h">Valutazione del professionista</h2>${evaluationHtml}${signHtml(prof, disclaimer)}</div>`;
    }

    // sintesi: una pagina con gli indici e la valutazione
    if (view === 'sintesi') {
        return `<div class="d-doc d-brief">${head}
<div class="d-strip">${figures.map(([l, v, u, h]) => `<div><span>${l}</span><b>${v}<small>${u}</small></b>${h ? `<em>${esc(h)}</em>` : ''}</div>`).join('')}</div>
${p.obiettivo ? `<p class="d-goal"><span>Obiettivo</span> ${multiline(p.obiettivo)}</p>` : ''}
<h2 class="d-h">In sintesi</h2>${evaluationHtml}
${signHtml(prof, disclaimer)}</div>`;
    }

    return `<div class="d-doc">
${opts.masthead === false ? '' : mastheadHtml(prof)}
${titleHtml({ kicker: 'Report di visita', title: `${p.nome || ''} ${p.cognome || ''}`.trim(), sub: [sesso, eta != null && `${eta} anni`, p.dataNascita && `nato/a il ${fmtDate(p.dataNascita)}`].filter(Boolean).join(' · '), dateLabel: 'Data della visita', date: fmtDate(visit.date) })}
<div class="d-kpis">
    ${kpi('Peso', fmt(k.peso), ' kg')}
    ${kpi('BMI', fmt(k.bmi), '', k.bmi ? bmiClass(k.bmi) : '')}
    ${kpi('Massa grassa', fmt(k.fm), ' %', k.fmKg ? `${fmt(k.fmKg)} kg` : '')}
    ${kpi('Massa magra', fmt(k.ffm), ' kg')}
    ${kpi('Angolo di fase', fmt(k.pha), '°')}
    ${kpi('Vita / altezza', fmt(k.whtr, 2), '', k.whtr ? (k.whtr < 0.5 ? 'nella norma' : 'da migliorare') : '')}
</div>
${profile.length ? `<h2 class="d-h">Profilo e obiettivi</h2><table class="d-kv">${profile.map(([l, v]) => `<tr><th>${l}</th><td>${multiline(v)}</td></tr>`).join('')}</table>` : ''}
${methods ? `<h2 class="d-h">Composizione corporea</h2><table class="d-table"><thead><tr><th>Stima</th><th>Formule</th><th>Grasso</th><th>Massa grassa</th><th>Massa magra</th></tr></thead><tbody>${methods}</tbody></table>` : ''}
${allPanelsHTML.trim() ? `<h2 class="d-h">Misure e parametri</h2><div class="d-grid">${allPanelsHTML}</div>` : ''}
${notes.length ? `<h2 class="d-h">Note della visita</h2><div class="d-notes">${notes.map(([l, v]) => `<p><b>${l}.</b> ${multiline(v)}</p>`).join('')}</div>` : ''}
<h2 class="d-h">Valutazione del professionista</h2>
<div class="d-prose">${evaluation ? multiline(evaluation).split(/<br><br>/).map((x) => `<p>${x}</p>`).join('') : '<p class="d-placeholder">Scrivi qui la valutazione e i consigli per il paziente.</p>'}</div>
${signHtml(prof, prof.disclaimer_report || 'Il presente documento riporta misurazioni e valutazioni dello stato nutrizionale. Non costituisce diagnosi medica né sostituisce il parere del medico curante.')}
</div>`;
};

export const signHtml = (prof, disclaimer) => `<div class="d-sign">
    <div class="d-disclaimer">${esc(disclaimer)}${prof.footer ? `<br>${esc(prof.footer)}` : ''}</div>
    <div class="d-firma"><div class="d-firma-line"></div><span>${esc([prof.nome, prof.cognome].filter(Boolean).join(' ') || 'Firma del professionista')}</span></div>
</div>`;
