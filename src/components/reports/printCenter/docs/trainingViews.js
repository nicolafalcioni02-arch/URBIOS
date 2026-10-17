import { buildPrintPlan } from '../../../patient/training/logic/printPlan';
import { esc, fmtDate } from '../logic/visits';
import { mastheadHtml, titleHtml } from './visitReport';

// modi di mostrare la scheda di allenamento (opzione "Come mostrarlo"); 'completa' è la scheda classica (TrainingDocBody)
export const TRAINING_VIEWS = [
    { id: 'completa', label: 'Completa', desc: 'Figure, carichi, recuperi e note', icon: 'ph-barbell' },
    { id: 'settimana', label: 'Settimana in tabella', desc: 'I giorni affiancati, un esercizio per riga', icon: 'ph-table' },
    { id: 'schede', label: 'Schede da palestra', desc: 'Un riquadro per giorno, serie da spuntare', icon: 'ph-check-square' },
    { id: 'immagini', label: 'Solo immagini', desc: 'Le figure degli esercizi, grandi', icon: 'ph-images' },
    { id: 'registro', label: 'Registro dei carichi', desc: 'Il cliente scrive carichi e ripetizioni', icon: 'ph-notebook' },
    { id: 'pagina', label: 'Tutto in una pagina', desc: 'Giorni e settimane in una sola tabella', icon: 'ph-squares-four' },
];

const loadText = (r) => [r.load && (r.load.includes('/') ? r.load : `${r.load}&nbsp;kg`), r.pct && `${r.pct.includes('/') ? r.pct : `${r.pct}%`} 1RM`, r.rpe && `RPE&nbsp;${esc(r.rpe)}`].filter(Boolean).join(' · ');
const prescription = (r) => [esc(r.serie), loadText(r), r.rec && `rec. ${esc(r.rec)}`].filter(Boolean).join(' · ');
const exName = (r) => `${r.ss ? `<span class="d-or">${esc(r.ss)}</span>` : ''}${esc(r.name)}`;
const dayLabel = (d) => `Giorno ${d.number}${d.title ? ` · ${esc(d.title)}` : ''}`;
const setCount = (r) => Math.max(1, Math.min(10, parseInt(String(r.serie), 10) || 3));
const short = (r) => [esc(r.serie), loadText(r)].filter(Boolean).join(' · ');

// i giorni della scheda attraverso le settimane: per il giorno N, ogni esercizio con quello che è previsto in ogni settimana
const byDay = (plan) => {
    const out = [];
    plan.forEach((w, wi) =>
        w.days.forEach((d) => {
            let g = out.find((x) => x.number === d.number);
            if (!g) out.push((g = { number: d.number, title: d.title, rows: [] }));
            d.rows.forEach((r) => {
                let e = g.rows.find((x) => x.name === r.name);
                if (!e) g.rows.push((e = { name: r.name, ss: r.ss, weeks: {} }));
                e.weeks[wi] = r;
            });
        }),
    );
    return out.sort((a, b) => a.number - b.number);
};

// HTML della scheda nelle viste compatte (le classi d-* prendono la grafica del layout)
export const buildTrainingViewHtml = ({ view, scheda, header, exerciseDB, prof, opts = {} }) => {
    const plan = buildPrintPlan(scheda.weeks || [], exerciseDB, { weekId: opts.weekId || 'all' });
    // intestazione: di solito il nome del cliente; il registro e la pagina unica hanno un titolo loro (il cliente va sotto)
    const headWith = (title) =>
        `${opts.studio === false ? '' : mastheadHtml(prof)}
${titleHtml({ kicker: 'Scheda di allenamento', title: title || header.cliente || 'Allenamento', sub: [title && header.cliente, header.titolo, header.obiettivo].filter(Boolean).join(' · '), dateLabel: 'Data', date: header.data ? fmtDate(header.data) : '' })}`;
    const head = headWith();
    if (!plan.length) return `<div class="d-doc">${head}<p class="d-placeholder">La scheda è vuota: compila almeno un esercizio.</p></div>`;
    const weekTitle = (w) => (plan.length > 1 || w.kind === 'deload' ? `<h2 class="d-h">${esc(w.title)}${w.kind === 'deload' ? ' · scarico' : ''}</h2>` : '');

    // settimana in tabella: una colonna per giorno, alla riga n l'n-esimo esercizio di ogni giorno
    if (view === 'settimana') {
        const body = plan
            .map((w) => {
                const max = Math.max(...w.days.map((d) => d.rows.length));
                const rows = Array.from({ length: max }, (_, i) => `<tr><th class="d-wk-day">${i + 1}</th>${w.days.map((d) => {
                    const r = d.rows[i];
                    return `<td>${r ? `<div class="d-wk-f"><b>${exName(r)}</b></div><div class="d-tw-p">${prescription(r)}</div>` : ''}</td>`;
                }).join('')}</tr>`).join('');
                return `<div class="d-block">${weekTitle(w)}<table class="d-table d-week d-tw"><thead><tr><th>#</th>${w.days.map((d) => `<th>${dayLabel(d)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>${w.note ? `<p class="d-foot-note">${esc(w.note)}</p>` : ''}</div>`;
            })
            .join('');
        return `<div class="d-doc">${head}${body}</div>`;
    }

    // schede da palestra: riquadri per giorno con una casella per ogni serie
    if (view === 'schede') {
        const body = plan
            .map((w) => `<div class="d-block">${weekTitle(w) || '<h2 class="d-h">I tuoi allenamenti</h2>'}<div class="d-cards">${w.days
                .map(
                    (d) => `<div class="d-card"><div class="d-card-h"><b>${dayLabel(d)}</b><em>${d.rows.length} esercizi</em></div>${d.rows
                        .map((r) => `<div class="d-tc"><div class="d-tc-n"><b>${exName(r)}</b><small>${prescription(r)}</small></div><div class="d-tc-b">${'<span class="d-box"></span>'.repeat(setCount(r))}</div></div>`)
                        .join('')}${d.note ? `<p class="d-tc-note">${esc(d.note)}</p>` : ''}</div>`,
                )
                .join('')}</div></div>`)
            .join('');
        return `<div class="d-doc">${head}${body}<p class="d-foot-note">Spunta una casella per ogni serie completata.</p></div>`;
    }

    // solo immagini: per ogni giorno una griglia di figure con nome e serie, da tenere sott'occhio in palestra
    if (view === 'immagini') {
        const body = plan
            .flatMap((w) => w.days.map((d) => ({ d, w })))
            .map(({ d, w }) => `<div class="d-block"><h2 class="d-h">${plan.length > 1 ? `${esc(w.title)} · ` : ''}${dayLabel(d)}</h2><div class="d-gal">${d.rows
                .map(
                    (r, i) => `<div class="d-gal-i"><div class="d-gal-img n${Math.min(r.images.length, 2)}">${r.images.length ? r.images.slice(0, 2).map((src) => `<img src="${esc(src)}" alt="">`).join('') : '<span class="d-gal-none"></span>'}</div><div class="d-gal-t"><span class="d-gal-n">${i + 1}</span><b>${exName(r)}</b></div><small>${esc(r.serie)}${r.rec ? ` · rec. ${esc(r.rec)}` : ''}</small></div>`,
                )
                .join('')}</div></div>`)
            .join('');
        return `<div class="d-doc">${head}${body}</div>`;
    }

    const weeks = plan.length;
    const groups = byDay(plan);
    const exCell = (e) => `<b>${exName(e)}</b>`;

    // tutto in una pagina: tutti i giorni e tutte le settimane in una sola tabella (righe = esercizi, colonne = settimane)
    if (view === 'pagina') {
        const cols = weeks > 1 ? plan.map((w) => `<th>${esc(w.title)}${w.kind === 'deload' && !/scaric/i.test(w.title) ? '<small>scarico</small>' : ''}</th>`).join('') : '<th>Serie e carico</th><th>Recupero</th>';
        const body = groups
            .map(
                (g) =>
                    `<tr class="d-all-g"><th colspan="${weeks > 1 ? weeks + 1 : 3}">${dayLabel(g)}</th></tr>${g.rows
                        .map((e) => `<tr><td>${exCell(e)}</td>${weeks > 1 ? plan.map((_, wi) => `<td>${e.weeks[wi] ? short(e.weeks[wi]) : '<span class="d-placeholder">—</span>'}</td>`).join('') : `<td>${short(e.weeks[0])}</td><td>${esc(e.weeks[0].rec || '')}</td>`}</tr>`)
                        .join('')}`,
            )
            .join('');
        return `<div class="d-doc">${headWith('Il tuo programma')}<table class="d-table d-onepage"><thead><tr><th>Esercizio</th>${cols}</tr></thead><tbody>${body}</tbody></table></div>`;
    }

    // registro dei carichi: per ogni giorno gli esercizi; una colonna per settimana (con il carico previsto) o per volta
    const N = weeks > 1 ? weeks : 6;
    const colH = (i) => (weeks > 1 ? `${esc(plan[i].title)}<small>data ________</small>` : `${i + 1}ª volta<small>data ________</small>`);
    const howto = `<div class="d-howto"><b>Come si compila</b><ol>
<li>${weeks > 1 ? 'Ogni colonna è una <strong>settimana</strong> della scheda: in piccolo trovi serie e carico previsti.' : 'Ogni colonna è <strong>una volta</strong> che fai questo allenamento.'} In alto scrivi la data.</li>
<li>In ogni casella scrivi il <strong>carico usato × le ripetizioni fatte</strong>, per esempio <strong>60 × 8</strong>. Con più serie: 60 × 8 / 60 × 7 / 55 × 8.</li>
<li>Se è stato troppo facile segna <strong>↑</strong>, se troppo difficile <strong>↓</strong>. Porta il registro alla prossima visita: lo guardiamo insieme.</li>
</ol></div>`;
    const body = groups
        .map(
            (g) =>
                `<div class="d-block"><h2 class="d-h">${dayLabel(g)}</h2><table class="d-table d-log"><thead><tr><th>Esercizio</th>${Array.from({ length: N }, (_, i) => `<th>${colH(i)}</th>`).join('')}</tr></thead><tbody>${g.rows
                    .map((e) => {
                        const first = e.weeks[0] || Object.values(e.weeks)[0];
                        return `<tr><td>${exCell(e)}${weeks > 1 ? '' : `<small>${prescription(first)}</small>`}</td>${Array.from({ length: N }, (_, i) => `<td>${weeks > 1 && e.weeks[i] ? `<small class="d-log-p">${short(e.weeks[i])}</small>` : ''}</td>`).join('')}</tr>`;
                    })
                    .join('')}</tbody></table></div>`,
        )
        .join('');
    return `<div class="d-doc">${headWith('Registro dei carichi')}${howto}${body}</div>`;
};
