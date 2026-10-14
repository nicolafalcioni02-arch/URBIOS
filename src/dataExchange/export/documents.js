// Documenti leggibili: testo semplice (.txt) o "Word semplice" (.doc = HTML minimale, font di default, nessuna formattazione).
// Si costruiscono dei "blocchi" neutri e poi si rendono nel formato scelto.
import { flattenScalars, humanize, toNum } from '../util';

const fmt = (n) => (Number.isFinite(n) ? String(Math.round(n * 10) / 10).replace('.', ',') : '');
const val = (v) => (v === undefined || v === null ? '' : Array.isArray(v) ? v.join(', ') : String(v));
const nonEmpty = (pairs) => pairs.filter(([, v]) => v !== '' && v !== undefined && v !== null);

// ---------- blocchi ----------
export const patientSheetBlocks = (p) => {
    const nomeCompleto = [p.nome, p.cognome].filter(Boolean).join(' ') || `Paziente ${p.id}`;
    const b = [{ type: 'title', text: `Scheda paziente - ${nomeCompleto}` }];
    b.push({ type: 'h2', text: 'Dati anagrafici' });
    b.push({
        type: 'kv',
        rows: nonEmpty(
            [
                ['ID', p.id],
                ['Sesso', p.sesso],
                ['Data di nascita', p.dataNascita],
                ['Anno di nascita', p.anno_nascita],
                ['Fascia di età', p.fascia_eta],
                ['Età', p.eta],
                ['Luogo di nascita', p.luogoNascita],
                ['Codice fiscale', p.cf],
                ['Professione', p.professione],
                ['Stato civile', p.statoCivile],
                ['Cellulare', p.cellulare],
                ['Email', p.email],
                ['Indirizzo', p.indirizzo],
                ['CAP', p.cap],
                ['Città', p.citta],
                ['Stato', p.status],
            ].map(([k, v]) => [k, val(v)])
        ),
    });
    const clin = nonEmpty([
        ['Anamnesi familiare', val(p.anamnesi_familiare)],
        ['Patologie e interventi', val(p.patologie)],
        ['Terapie farmacologiche', val(p.farmaci)],
        ['Allergie e intolleranze', val(p.allergie)],
        ['Anamnesi verificata il', val(p.anamnesi_verificata)],
        ['Lettera di incarico', p.documenti?.incarico ? `${p.documenti.incarico.stato} ${p.documenti.incarico.dataFirma || p.documenti.incarico.dataConsegna || ''}`.trim() : ''],
        ['Informativa privacy', p.documenti?.privacy ? `${p.documenti.privacy.stato} ${p.documenti.privacy.dataFirma || p.documenti.privacy.dataConsegna || ''}`.trim() : ''],
        ['Obiettivo', val(p.obiettivo)],
        ['Note', val(p.note)],
    ]);
    if (clin.length) {
        b.push({ type: 'h2', text: 'Anamnesi e note' });
        b.push({ type: 'kv', rows: clin });
    }
    const visits = [...(p.visite || [])].sort((a, c) => String(a.data).localeCompare(String(c.data)));
    if (visits.length) {
        b.push({ type: 'h2', text: `Visite (${visits.length})` });
        b.push({
            type: 'table',
            head: ['Visita', 'Data', 'Peso (kg)', 'Stato dieta'],
            rows: visits.map((v) => [
                val(v.id),
                val(v.data) || (v.giorni_da_prima_visita !== undefined ? `T+${v.giorni_da_prima_visita}` : ''),
                val(v.peso),
                val(v.dietStatus),
            ]),
        });
    }
    return b;
};

export const visitBlocks = (p, v) => {
    const when = v.data || (v.giorni_da_prima_visita !== undefined ? `T+${v.giorni_da_prima_visita} giorni` : v.id);
    const b = [{ type: 'title', text: `Visita del ${when}` }];
    b.push({
        type: 'kv',
        rows: nonEmpty([
            ['Paziente', [p.nome, p.cognome].filter(Boolean).join(' ') || p.id],
            ['ID paziente', p.id],
            ['ID visita', v.id],
            ['Peso (kg)', val(v.peso)],
            ['Note', val(v.note)],
        ]),
    });
    const flat = flattenScalars(v.dettagli || {}, { skip: (full, k, depth) => depth === 0 && /^(diet_|training)/.test(k) });
    const simple = [];
    const results = [];
    Object.entries(flat).forEach(([k, x]) => {
        if (x === '' || x === undefined || x === null) return;
        (k.startsWith('risultati_') ? results : simple).push([humanize(k), val(x)]);
    });
    if (simple.length) {
        b.push({ type: 'h2', text: 'Misure ed esami' });
        b.push({ type: 'kv', rows: simple });
    }
    if (results.length) {
        b.push({ type: 'h2', text: 'Risultati dei calcoli' });
        b.push({ type: 'kv', rows: results });
    }
    return b;
};

export const dietBlocks = (p, v) => {
    const d = v.dettagli || {};
    const days = d.diet_plan_data;
    if (!Array.isArray(days) || !days.length) return null;
    const when = v.data || (v.giorni_da_prima_visita !== undefined ? `T+${v.giorni_da_prima_visita} giorni` : v.id);
    const b = [{ type: 'title', text: `Piano alimentare - visita del ${when}` }];
    const t = d.diet_targets || {};
    if (t.isConfigured) {
        b.push({
            type: 'kv',
            rows: nonEmpty([
                ['Obiettivo kcal', fmt(toNum(t.kcal))],
                ['Proteine (g)', fmt(toNum(t.p))],
                ['Carboidrati (g)', fmt(toNum(t.c))],
                ['Grassi (g)', fmt(toNum(t.f))],
            ]),
        });
    }
    const macro = (it) => {
        const f = toNum(it.weight) / 100;
        const m = (x) => (Number.isFinite(f) && Number.isFinite(toNum(x)) ? toNum(x) * f : NaN);
        return { kcal: m(it.kcal), p: m(it.p), c: m(it.c), f: m(it.f) };
    };
    const line = (it) => {
        const m = macro(it);
        return `${it.name || '(senza nome)'} - ${val(it.weight)} g (kcal ${fmt(m.kcal)}; P ${fmt(m.p)}; C ${fmt(m.c)}; F ${fmt(m.f)})`;
    };
    days.forEach((day) => {
        b.push({ type: 'h2', text: day.title || 'Giorno' });
        const tot = { kcal: 0, p: 0, c: 0, f: 0 };
        (day.meals || []).forEach((meal) => {
            const items = [];
            (meal.items || []).forEach((it) => {
                const m = macro(it);
                ['kcal', 'p', 'c', 'f'].forEach((k) => Number.isFinite(m[k]) && (tot[k] += m[k]));
                items.push(line(it));
                (it.subs || []).forEach((s) => items.push(`   in alternativa: ${line(s)}`));
            });
            b.push({ type: 'h3', text: meal.title || 'Pasto' });
            b.push({ type: 'list', items: items.length ? items : ['(vuoto)'] });
        });
        b.push({ type: 'p', text: `Totale giorno: kcal ${fmt(tot.kcal)}; P ${fmt(tot.p)}; C ${fmt(tot.c)}; F ${fmt(tot.f)}` });
    });
    return b;
};

export const trainingBlocks = (p, scheda) => {
    const weeks = scheda && scheda.weeks;
    if (!Array.isArray(weeks) || !weeks.length) return null;
    const b = [{ type: 'title', text: `Scheda di allenamento${scheda.titolo ? ' - ' + scheda.titolo : ''}` }];
    b.push({
        type: 'kv',
        rows: nonEmpty([
            ['Cliente', val(scheda.cliente)],
            ['Obiettivo', val(scheda.obiettivo)],
            ['Data', val(scheda.data)],
        ]),
    });
    weeks.forEach((w) => {
        b.push({ type: 'h2', text: w.title || 'Settimana' });
        (w.days || []).forEach((d, di) => {
            b.push({ type: 'h3', text: d.title ? `Giorno ${di + 1} - ${d.title}` : `Giorno ${di + 1}` });
            const items = (d.exercises || [])
                .filter((ex) => ex.name || (ex.sets || []).some((s) => s.reps || s.rec || s.note))
                .map((ex) => {
                    const sets = ex.sets || [];
                    const work = sets.filter((x) => x.tipo !== 'riscaldamento');
                    const warm = sets.length - work.length;
                    const join = (f) => {
                        const v = work.map((x) => val(x[f]));
                        if (!v.some(Boolean)) return '';
                        return [...new Set(v)].length === 1 ? v[0] : v.map((x) => x || '-').join(' / ');
                    };
                    const reps = join('reps');
                    const rec = [...new Set(work.map((x) => val(x.rec)).filter(Boolean))].join(' / ');
                    const note = [...new Set(work.map((x) => val(x.note)).filter(Boolean))].join('; ');
                    const parts = [`${work.length} serie`, reps && `rip. ${reps}`, join('load') && `${join('load')} kg`, join('pct') && `${join('pct')}% 1RM`, join('rpe') && `RPE ${join('rpe')}`, join('tempo') && `tempo ${join('tempo')}`, rec && `recupero ${rec}`, warm && `+${warm} riscaldamento`, note && note].filter(Boolean);
                    return `${ex.ss ? ex.ss + ': ' : ''}${ex.name || '(senza nome)'}${ex.group ? ' [' + ex.group + ']' : ''}: ${parts.join(', ')}${ex.note ? ' (' + ex.note + ')' : ''}`;
                });
            b.push({ type: 'list', items: items.length ? items : ['(vuoto)'] });
        });
    });
    return b;
};

export const studioBlocks = (utente) => {
    const rows = nonEmpty(
        Object.entries(utente || {})
            .filter(([, v]) => typeof v !== 'object')
            .map(([k, v]) => [humanize(k), val(v)])
    );
    return rows.length
        ? [
              { type: 'title', text: 'Dati del professionista' },
              { type: 'kv', rows },
          ]
        : null;
};

// ---------- rendering ----------
export const renderTxt = (blocks) => {
    const out = [];
    blocks.forEach((b) => {
        if (b.type === 'title') out.push(b.text, '='.repeat(Math.min(b.text.length, 70)), '');
        else if (b.type === 'h2') out.push('', b.text, '-'.repeat(Math.min(b.text.length, 70)));
        else if (b.type === 'h3') out.push('', b.text);
        else if (b.type === 'kv') b.rows.forEach(([k, v]) => out.push(`${k}: ${v}`));
        else if (b.type === 'p') out.push('', b.text);
        else if (b.type === 'list') b.items.forEach((i) => out.push(`  - ${i}`));
        else if (b.type === 'table') {
            out.push(b.head.join(' | '));
            b.rows.forEach((r) => out.push(r.join(' | ')));
        }
    });
    return out.join('\r\n') + '\r\n';
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const multi = (s) => esc(s).replace(/\r?\n/g, '<br>');

export const renderDoc = (blocks) => {
    const title = (blocks.find((b) => b.type === 'title') || { text: 'URBIOS' }).text;
    const body = blocks
        .map((b) => {
            if (b.type === 'title') return `<h1>${esc(b.text)}</h1>`;
            if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`;
            if (b.type === 'h3') return `<h3>${esc(b.text)}</h3>`;
            if (b.type === 'kv') return b.rows.map(([k, v]) => `<p><b>${esc(k)}:</b> ${multi(v)}</p>`).join('\n');
            if (b.type === 'p') return `<p>${multi(b.text)}</p>`;
            if (b.type === 'list') return '<ul>' + b.items.map((i) => `<li>${esc(i)}</li>`).join('') + '</ul>';
            if (b.type === 'table')
                return `<table border="1" cellspacing="0" cellpadding="3"><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
            return '';
        })
        .join('\n');
    return `<html><head><meta charset="utf-8"><title>${esc(title)}</title></head><body>\n${body}\n</body></html>\n`;
};
