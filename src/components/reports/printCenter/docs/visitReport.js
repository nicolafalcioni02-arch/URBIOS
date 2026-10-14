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

// Report di visita ridisegnato: intestazione, indici in evidenza, profilo, misure in pannelli, valutazione e firma
export const buildVisitReportHtml = ({ patient: p, prof, visit, opts = {} }) => {
    const d = visit.data || {};
    const k = keyFigures(d);
    const eta = ageAt(p, visit.date);
    const sesso = String(p.sesso || '').toUpperCase().startsWith('F') ? 'Donna' : p.sesso ? 'Uomo' : '';

    const helpers = createReportHelpers({ d, patient: p });
    const renderPanel = (title, items) => {
        const rows = items
            .filter((i) => i.v && !i.v.includes('color:#ccc;">-</span>'))
            .map((i) => `<tr><td>${i.l}</td><td>${i.v}</td></tr>`)
            .join('');
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
