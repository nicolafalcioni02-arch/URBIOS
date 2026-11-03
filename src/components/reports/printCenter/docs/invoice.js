import { esc, fmtDate, multiline } from '../logic/visits';
import { computeTotals, euro, label, num } from '../../../../invoices/invoiceLogic';

// Fattura/parcella: si compone SOLO dalla fotografia salvata in patient.fatture, quindi si ristampa sempre uguale.

const LOGO = '<svg class="d-inv-logo" xmlns="http://www.w3.org/2000/svg" viewBox="304.2 290.6 647.1 647.1"><path fill="#1F242B" d="M945.28,614.13 A317.54,317.54 0 1,0 940.29,670.16 A92.62,92.62 0 1,0 757.31,641.74 A211.69,211.69 0 0,1 378.07,741.14 A145.54,145.54 0 0,1 403.97,539.87 L534.29,436.27 A277.85,277.85 0 0,1 783.13,386.57 A105.85,105.85 0 0,1 859.53,478.14 A52.92,52.92 0 0,0 887.94,520.05 A105.85,105.85 0 0,1 945.28,614.13 Z"/></svg>';

export const invoicesOf = (patient) => [...(patient?.fatture || [])].sort((a, b) => String(b.data).localeCompare(String(a.data)) || b.numero - a.numero);
export const pickInvoice = (patient, id) => invoicesOf(patient).find((x) => x.id === id) || invoicesOf(patient)[0];
export const invoiceTitle = (inv) => `Fattura n. ${label(inv)} del ${fmtDate(inv.data, 'short')}`;

const party = (title, lines) => `<div class="d-inv-box"><div class="d-inv-kick">${title}</div><div class="d-inv-party">${lines.filter(Boolean).map((x, i) => (i === 0 ? `<b>${esc(x)}</b>` : `<div>${esc(x)}</div>`)).join('')}</div></div>`;
const cell = (l, v) => `<div class="d-inv-cell"><span>${l}</span><b>${esc(v)}</b></div>`;

export const buildInvoiceHtml = ({ patient, opts = {} }) => {
    const inv = pickInvoice(patient, opts.invoiceId);
    if (!inv) return '<div class="d-doc"><p class="d-placeholder">Non c’è ancora nessuna fattura per questo paziente.</p></div>';
    const e = inv.emittente || {};
    const c = inv.cliente || {};
    const t = computeTotals(inv);
    const paid = inv.stato === 'pagata';
    const status = inv.stato === 'annullata' ? ['Annullata', 'is-void'] : paid ? ['Pagata', 'is-paid'] : ['Da incassare', ''];
    const rows = (inv.righe || [])
        .filter((r) => String(r.desc || '').trim() || num(r.prezzo))
        .map((r) => `<tr><td>${esc(r.desc)}</td><td>${num(r.qta || 1)}</td><td>${euro(r.prezzo)}</td><td>${euro(num(r.qta || 1) * num(r.prezzo))}</td></tr>`)
        .join('');
    const sum = [
        ['Imponibile', euro(t.imponibile)],
        t.rivalsa && [`Rivalsa ${num(inv.rivalsaPerc)}%`, euro(t.rivalsa)],
        num(inv.ivaPerc) ? [`IVA ${num(inv.ivaPerc)}%`, euro(t.iva)] : ['IVA', 'esente'],
        t.bollo && ['Imposta di bollo', euro(t.bollo)],
    ].filter(Boolean);
    const pay = [inv.metodo && `<div><b>${esc(inv.metodo)}</b></div>`, e.iban && `<div>IBAN ${esc(e.iban)}</div>`, e.banca && `<div>${esc(e.banca)}</div>`].filter(Boolean).join('');
    const foot = [e.nome, e.indirizzo, e.piva && `P.IVA ${e.piva}`].filter(Boolean).join(' · ');
    return `<div class="d-doc d-inv-doc">
        <div class="d-inv-head"><div class="d-inv-brand">${LOGO}<span>URBIOS</span></div>
        <div class="d-inv-contact">${String(e.contatti || '').split(' · ').filter(Boolean).map((x) => `<div>${esc(x)}</div>`).join('')}</div></div>
        <div class="d-inv-title"><div><div class="d-inv-kick">Fattura</div><div class="d-inv-num">N. ${esc(label(inv))}</div></div><span class="d-inv-chip ${status[1]}">${status[0]}</span></div>
        <div class="d-inv-meta">${cell('Data di emissione', fmtDate(inv.data))}${cell('Pagamento', inv.metodo || '—')}${cell(paid ? 'Incassata il' : 'Da pagare entro', paid ? fmtDate(inv.dataPag || inv.data) : inv.scadenza ? fmtDate(inv.scadenza) : status[0])}</div>
        <div class="d-inv-parties">${party('Emessa da', [e.nome, e.titolo, e.albo, e.piva && `P.IVA ${e.piva}`, e.cf && `C.F. ${e.cf}`])}${party('Intestata a', [c.nome, c.indirizzo, c.cf && `C.F. ${c.cf}`, c.email])}</div>
        <table class="d-table d-table-num"><thead><tr><th>Descrizione</th><th>Qtà</th><th>Prezzo</th><th>Importo</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="d-inv-bottom">
            <div class="d-inv-pay">${pay ? `<div class="d-inv-kick">Come pagare</div>${pay}` : ''}${inv.note ? `<div class="d-inv-kick" style="margin-top:5mm">Note</div><div class="d-inv-note">${multiline(inv.note)}</div>` : ''}</div>
            <div class="d-inv-totals">${sum.map(([l, v]) => `<div class="d-inv-line"><span>${esc(l)}</span><span>${v}</span></div>`).join('')}<div class="d-inv-due"><span>Totale</span><b>${euro(t.totale)}</b></div></div>
        </div>
        <div class="d-inv-foot"><i></i><span>${esc(foot)}</span></div>
    </div>`;
};
