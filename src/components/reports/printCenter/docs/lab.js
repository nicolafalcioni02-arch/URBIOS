import { esc, multiline } from '../logic/visits';
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
    return p.length ? `<div class="d-rb-meta">${p.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : '';
};
const block = (title, text) => (String(text || '').trim() ? `<h3 class="d-rb-h">${esc(title)}</h3><div class="d-prose"><p>${multiline(text)}</p></div>` : '');
const steps = (list) => {
    const s = (list || []).filter((x) => String(x.testo || '').trim());
    return s.length ? `<ol class="d-rb-steps">${s.map((x) => `<li>${multiline(x.testo)}${x.durata ? ` <small>· ${esc(x.durata)}</small>` : ''}</li>`).join('')}</ol>` : '';
};
const rowsTable = (head, rows) => (rows.length ? `<table class="d-table"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '');
const withName = (list) => (list || []).filter((x) => String(x.nome || '').trim());

const protocolHtml = (r, i) => {
    const mats = rowsTable(['Voce', 'Quantità', 'Note'], withName(r.materiali).map((m) => [esc(m.nome), cell([m.quantita, m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    return `<section class="d-rb-recipe${i ? ' pc-break' : ''}">
<div class="d-rb-head"><div><span class="d-kicker">${esc([r.codice, r.categoria].filter(Boolean).join(' · ') || 'Protocollo')}</span><h2 class="d-title d-rb-title">${esc(r.titolo || 'Protocollo senza titolo')}</h2></div></div>
${meta([['Versione', r.versione], ['Revisione', fmtDay(r.data)], ['Stato', r.stato], ['Redatto da', r.autore]])}
${block('Scopo', r.scopo)}
${mats ? `<h3 class="d-rb-h">Materiali, reagenti e strumenti</h3>${mats}` : ''}
${steps(r.passaggi) ? `<h3 class="d-rb-h">Procedura</h3>${steps(r.passaggi)}` : ''}
${block('Sicurezza e smaltimento', r.sicurezza)}${block('Riferimenti', r.riferimenti)}${block('Note', r.note)}
</section>`;
};

const sign = (a, b) => `<div class="d-rb-meta" style="margin-top:8mm"><div><span>${a}</span><b>&nbsp;</b></div><div><span>${b}</span><b>&nbsp;</b></div></div>`;
const captions = (r) => (r.figure || []).filter((f) => String(f.nome || '').trim());

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

const entryHtml = (r, i, lab, n) => {
    const proto = lab.protocolli.find((p) => p.id === r.protocolloId);
    const mats = rowsTable(['Voce', 'Quantità', 'Lotto / note'], withName(r.materiali).map((m) => [esc(m.nome), cell([m.quantita, m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    const figs = captions(r);
    return `<section class="d-rb-recipe${i ? ' pc-break' : ''}">
<div class="d-rb-head"><div><span class="d-kicker">${esc([n ? `Pagina ${n.page}` : '', r.codice, fmtDay(r.data), r.progetto].filter(Boolean).join(' · ') || 'Quaderno di laboratorio')}</span><h2 class="d-title d-rb-title">${esc(r.titolo || 'Esperimento senza titolo')}</h2></div></div>
${meta([['Eseguito da', r.operatore], ['Stato', r.stato], ['Protocollo', proto ? [proto.codice, proto.titolo].filter(Boolean).join(' · ') : '']])}
${block('Obiettivo', r.obiettivo)}
${mats ? `<h3 class="d-rb-h">${n && n.tab ? `Tabella ${n.tab} · ` : ''}Materiali, reagenti e lotti</h3>${mats}` : ''}
${block('Procedura svolta', r.procedura)}${block('Osservazioni', r.osservazioni)}${block('Risultati', r.risultati)}
${figs.length ? `<h3 class="d-rb-h">Figure</h3><div class="d-prose">${figs.map((f, k) => `<p><b>Figura ${n ? n.figs[k] : k + 1}.</b> ${esc(f.nome)}${f.note ? ` <small>· ${esc(f.note)}</small>` : ''}</p>`).join('')}</div>` : ''}
${block('Conclusioni', r.conclusioni)}${block('Prossimi passi', r.prossimi)}
${r.verificatoDa ? meta([['Verificato da', r.verificatoDa], ['Data verifica', fmtDay(r.dataVerifica)]]) : sign('Firma di chi ha eseguito', 'Firma del verificatore')}
</section>`;
};

const frontPage = (title, kicker, inner) => `<section class="d-rb-recipe pc-break"><div class="d-rb-head"><div><span class="d-kicker">${esc(kicker)}</span><h2 class="d-title d-rb-title">${esc(title)}</h2></div></div>${inner}</section>`;
const emptyNote = (t) => `<p class="d-placeholder">${esc(t)}</p>`;

// Il quaderno completo, a parti (copertina, indici, reagentario, pagine): ogni parte è un foglio nell'anteprima, in stampa si impagina di seguito.
// onlyId: solo la pagina di quell'esperimento (la numerazione resta quella del quaderno intero)
export const notebookParts = (lab, onlyId) => {
    const sorted = sortedNotebook(lab.quaderno);
    const nums = notebookNumbering(sorted);
    const dates = sorted.map((r) => r.data).filter(Boolean);
    const people = [...new Set(sorted.map((r) => r.operatore).filter(Boolean))];
    const toc = rowsTable(['Pagina', 'Codice', 'Data', 'Esperimento', 'Stato'], sorted.map((r, i) => [String(i + 1), cell(r.codice), cell(fmtDay(r.data)), esc(r.titolo || 'Esperimento senza titolo'), cell(r.stato)]));
    const figRows = [];
    const tabRows = [];
    sorted.forEach((r, i) => {
        if (nums[i].tab) tabRows.push([`Tabella ${nums[i].tab}`, `Materiali, reagenti e lotti · ${esc(r.titolo || '')}`, String(nums[i].page)]);
        captions(r).forEach((f, k) => figRows.push([`Figura ${nums[i].figs[k]}`, esc(f.nome), String(nums[i].page)]));
    });
    const reag = [...lab.reagenti].sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'it'));
    const reagRows = reag.map((r) => [esc(r.nome), cell(r.categoria), cell(r.concentrazione), cell(r.volumeFinale ? `${r.volumeFinale} ${r.unitaVolume || 'mL'}` : ''), cell(r.conservazione), cell(r.validita)]);
    const all = [
        { key: '__cover', html: frontPage('Quaderno di laboratorio', 'Laboratorio', meta([['Periodo', dates.length ? `${fmtDay(dates[0])} – ${fmtDay(dates[dates.length - 1])}` : ''], ['Pagine', String(sorted.length)], ['Operatori', people.join(', ')]])) },
        { key: '__toc', html: frontPage('Indice', 'Quaderno di laboratorio', toc || emptyNote('Nessun esperimento.')) },
        { key: '__fig', html: frontPage('Indice delle figure', 'Quaderno di laboratorio', figRows.length ? rowsTable(['Figura', 'Didascalia', 'Pagina'], figRows) : emptyNote('Nessuna figura registrata.')) },
        { key: '__tab', html: frontPage('Indice delle tabelle', 'Quaderno di laboratorio', tabRows.length ? rowsTable(['Tabella', 'Contenuto', 'Pagina'], tabRows) : emptyNote('Nessuna tabella.')) },
        { key: '__reag', html: frontPage('Reagentario', 'Quaderno di laboratorio', reagRows.length ? rowsTable(['Soluzione', 'Categoria', 'Concentrazione', 'Volume', 'Conservazione', 'Validità'], reagRows) : emptyNote('Nessuna ricetta nel ricettario.')) },
        ...sorted.map((r, i) => ({ key: r.id, html: entryHtml(r, 1, lab, nums[i]) })),
    ];
    return onlyId ? all.filter((p) => p.key === onlyId) : all;
};

const reagentHtml =(r, i, volume) => {
    const f = scaleFactor(r, volume);
    const unit = r.unitaVolume || 'mL';
    const base = num(r.volumeFinale);
    const final = f !== 1 ? `${scaledQty(r.volumeFinale, f)} ${unit}` : base !== null ? `${r.volumeFinale} ${unit}` : '';
    const comps = rowsTable(['Componente', 'Quantità', 'Note'], withName(r.componenti).map((m) => [esc(m.nome), cell([scaledQty(m.quantita, f), m.unita].filter(Boolean).join(' ')), cell(m.note)]));
    return `<section class="d-rb-recipe${i ? ' pc-break' : ''}">
<div class="d-rb-head"><div><span class="d-kicker">${esc(r.categoria || 'Ricetta di laboratorio')}</span><h2 class="d-title d-rb-title">${esc(r.nome || 'Soluzione senza nome')}</h2></div></div>
${meta([['Volume finale', final], ['Solvente', r.solvente], ['pH', r.ph], ['Concentrazione', r.concentrazione]])}
${f !== 1 ? `<p class="d-placeholder">Quantità ricalcolate da ${esc(r.volumeFinale)} ${esc(unit)} a ${esc(final)}.</p>` : ''}
${comps ? `<h3 class="d-rb-h">Componenti</h3>${comps}` : ''}
${steps(r.passaggi) ? `<h3 class="d-rb-h">Preparazione</h3>${steps(r.passaggi)}` : ''}
${meta([['Conservazione', r.conservazione], ['Validità', r.validita]])}
${block('Sicurezza', r.sicurezza)}${block('Note', r.note)}
</section>`;
};

const listHtml = (title, head, rows, count) => `<section class="d-rb-recipe"><div class="d-rb-head"><div><span class="d-kicker">Laboratorio · ${esc(fmtDay(new Date().toISOString().slice(0, 10)))}</span><h2 class="d-title d-rb-title">${esc(title)}</h2></div></div>
<p class="d-placeholder" style="font-style:normal">${count} ${count === 1 ? 'voce' : 'voci'}</p>${rowsTable(head, rows)}</section>`;

export const buildLabHtml = ({ db, opts = {} }) => {
    const o = { ...LAB_DEFAULT_OPTS, ...opts };
    const items = labItems(db, o);
    if (!items.length) return `<div class="d-doc"><p class="d-placeholder">Non c’è ancora nulla da stampare in «${esc(LAB_KINDS[o.kind] || '')}».</p></div>`;
    if (o.kind === 'quaderno') {
        const lab = labOf(db);
        if (o.completo) return `<div class="d-doc d-rb">${notebookParts(lab).map((p) => p.html).join('')}</div>`;
        const sorted = sortedNotebook(lab.quaderno);
        const nums = notebookNumbering(sorted);
        return `<div class="d-doc d-rb">${sorted.map((r, i) => [r, nums[i]]).filter(([r]) => items.includes(r)).map(([r, n], i) => entryHtml(r, i, lab, n)).join('')}</div>`;
    }
    if (o.kind === 'articoli') {
        const rows = [...items].sort((a, b) => String(b.anno || '').localeCompare(String(a.anno || ''))).map((r) => [`<b>${esc(r.titolo)}</b>${r.tag ? `<br><small>${esc(r.tag)}</small>` : ''}`, cell(r.autori), cell(r.rivista), cell(r.anno), cell(r.doi), cell(r.lettura)]);
        return `<div class="d-doc d-rb">${listHtml('Bibliografia', ['Titolo', 'Autori', 'Rivista', 'Anno', 'DOI', 'Lettura'], rows, items.length)}</div>`;
    }
    if (o.kind === 'protocolli') return `<div class="d-doc d-rb">${items.map(protocolHtml).join('')}</div>`;
    if (o.kind === 'reagenti') return `<div class="d-doc d-rb">${items.map((r, i) => reagentHtml(r, i, o.volume)).join('')}</div>`;
    if (o.kind === 'magazzino') {
        const rows = [...items].sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'it')).map((r) => [esc(r.nome), cell(r.lotto), cell([r.quantita, r.unita].filter(Boolean).join(' ')), cell(fmtDay(r.scadenza)), cell(r.posizione), esc(stockState(r).label)]);
        return `<div class="d-doc d-rb">${listHtml('Magazzino reagenti', ['Articolo', 'Lotto', 'Quantità', 'Scadenza', 'Posizione', 'Stato'], rows, items.length)}</div>`;
    }
    const lab = labOf(db);
    const rows = [...items].sort((a, b) => String(a.codice).localeCompare(String(b.codice), 'it')).map((r) => [esc(r.codice), cell(r.tipo), cell(r.descrizione), cell(fmtDay(r.data)), cell(r.posizione), cell(r.stato), cell((lab.protocolli.find((p) => p.id === r.protocolloId) || {}).codice)]);
    return `<div class="d-doc d-rb">${listHtml('Registro campioni', ['Codice', 'Tipo', 'Descrizione', 'Ricezione', 'Posizione', 'Stato', 'Protocollo'], rows, items.length)}</div>`;
};
