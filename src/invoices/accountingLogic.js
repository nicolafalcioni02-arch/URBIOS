import { allInvoices, computeTotals } from './invoiceLogic';

// Aggregazioni della Contabilità (funzioni pure). Le fatture annullate non contano.
export const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
export const SOGLIA_FORFETTARIO = 85000;
export const EXPENSE_CATEGORIES = ['Contributi previdenziali', 'Affitto e utenze', 'Software e abbonamenti', 'Formazione', 'Assicurazione', 'Materiali e attrezzature', 'Commercialista', 'Altro'];

export const rowsOf = (db, year) => allInvoices(db).filter((x) => x.inv.anno === year && x.inv.stato !== 'annullata');
export const expensesOf = (db, year) => (db?.spese || []).filter((s) => String(s.data).slice(0, 4) === String(year)).sort((a, b) => String(b.data).localeCompare(String(a.data)));
const month = (d) => Number(String(d || '').slice(5, 7)) - 1;
const tot = (x) => computeTotals(x.inv);

// compenso netto (imponibile + rivalsa): quello che conta come ricavo, senza IVA e bollo
export const revenue = (x) => tot(x).base;

export const summarize = (rows) => {
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const paid = rows.filter((x) => x.inv.stato === 'pagata');
    const open = rows.filter((x) => x.inv.stato !== 'pagata');
    return { n: rows.length, fatturato: sum(rows, (x) => tot(x).totale), incassato: sum(paid, (x) => tot(x).totale), daIncassare: sum(open, (x) => tot(x).totale), ricavi: sum(paid, revenue), iva: sum(rows, (x) => tot(x).iva), media: rows.length ? sum(rows, (x) => tot(x).totale) / rows.length : 0 };
};

// per mese: fatturato (per data fattura) e incassato (per data di incasso)
export const monthly = (rows) =>
    MESI.map((m, i) => ({
        m,
        fatturato: rows.filter((x) => month(x.inv.data) === i).reduce((s, x) => s + tot(x).totale, 0),
        incassato: rows.filter((x) => x.inv.stato === 'pagata' && month(x.inv.dataPag || x.inv.data) === i).reduce((s, x) => s + tot(x).totale, 0),
    }));

const group = (rows, key) => {
    const m = new Map();
    rows.forEach((x) => { const k = key(x); m.set(k, (m.get(k) || 0) + tot(x).totale); });
    return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};
export const byPatient = (rows) => group(rows, (x) => `${x.patient.nome} ${x.patient.cognome}`);
export const byKind = (rows) => group(rows, (x) => (x.inv.menuId ? 'Servizi menù' : x.inv.visitaId ? 'Visite' : 'Altre prestazioni'));
export const byMethod = (rows) => group(rows.filter((x) => x.inv.stato === 'pagata'), (x) => x.inv.metodo || 'Non indicato');

export const delta = (now, before) => (before > 0 ? ((now - before) / before) * 100 : null);

// ── Da fare e scadenze (pannelli laterali) ───────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
export const isOverdue = (inv) => inv.stato === 'da_incassare' && !!inv.scadenza && inv.scadenza < today();
export const daysTo = (iso) => Math.round((new Date(iso) - new Date(today())) / 86400000);
export const addDays = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// visite (e piani da soli) senza fattura, dalla più recente; service = come proporre la riga in fattura
export const unbilledVisits = (db) =>
    (db?.pazienti || []).flatMap((p) => {
        const billed = new Set((p.fatture || []).filter((f) => f.stato !== 'annullata').map((f) => String(f.visitaId)));
        const visits = [...(p.visite || [])].sort((a, b) => new Date(a.data) - new Date(b.data));
        const first = visits.find((v) => !v.note?.includes('Solo Dieta'));
        return visits.filter((v) => !billed.has(String(v.id))).map((v) => ({ patient: p, visit: v, service: v.note?.includes('Solo Dieta') ? 'dieta' : first && first.id === v.id ? 'prima' : 'controllo' }));
    }).sort((a, b) => new Date(b.visit.data) - new Date(a.visit.data));

// menù-evento associati a un paziente e non ancora fatturati
export const unbilledMenus = (db) =>
    (db?.chef_menus || []).filter((m) => m.patientId).map((m) => ({ menu: m, patient: (db.pazienti || []).find((p) => p.id === m.patientId) })).filter((x) => x.patient && !(x.patient.fatture || []).some((f) => f.menuId === x.menu.id && f.stato !== 'annullata'));

// promemoria fiscali che si possono aggiungere con un clic (date generali: vanno verificate col commercialista)
export const suggestedDeadlines = (year, regime) => [
    { data: `${year}-01-31`, titolo: 'Invio spese sanitarie al Sistema Tessera Sanitaria (anno precedente)' },
    ...(regime === 'Forfettario'
        ? [{ data: `${year}-06-30`, titolo: 'Imposta sostitutiva: saldo e primo acconto' }, { data: `${year}-11-30`, titolo: 'Imposta sostitutiva: secondo acconto' }]
        : [{ data: `${year}-05-16`, titolo: 'Liquidazione IVA 1° trimestre' }, { data: `${year}-08-20`, titolo: 'Liquidazione IVA 2° trimestre' }, { data: `${year}-11-16`, titolo: 'Liquidazione IVA 3° trimestre' }, { data: `${year}-06-30`, titolo: 'Saldo e primo acconto imposte' }, { data: `${year}-11-30`, titolo: 'Secondo acconto imposte' }]),
];
