import { sectionOf } from './sections';
import { newId } from './labLogic';

// Import del magazzino da un foglio Excel (anche quello condiviso): le colonne si riconoscono dall'intestazione,
// le righe si abbinano agli articoli già presenti (N. inventario, poi codice + lotto, poi nome + lotto) e li aggiornano.
import { serialToIso } from './xlsxRead';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const SKIP = new Set(['giorni', 'stato', 'aggiornato']);
const ALIAS = { 'n': 'numero', 'numero': 'numero', 'n inv': 'numero', 'marca': 'marca', 'prodotto': 'nome', 'articolo': 'nome', 'reagente': 'nome', 'codice': 'codice', 'cat': 'codice', 'quantita attuale': 'quantita', 'q ta attuale': 'quantita', 'inserito il': 'dataArrivo', 'data arrivo': 'dataArrivo', 'scorta min': 'sogliaMin' };
const DATES = new Set(['dataArrivo', 'scadenza', 'apertura']);
const NUMS = new Set(['quantita', 'sogliaMin', 'prezzo', 'numero']);

const toIso = (v) => {
    if (typeof v === 'number') return serialToIso(v);
    const s = String(v || '').trim();
    let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
    if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};
const toStr = (v) => (typeof v === 'number' ? String(Math.round(v * 1e6) / 1e6).replace('.', ',') : String(v ?? '').trim());

// colonne attese (per la guida nel box) e nome del campo
export const expectedColumns = () => sectionOf('magazzino').xlsx.filter(([key]) => !SKIP.has(key)).map(([key, label]) => ({ key, label, required: key === 'nome' }));

export const planStockImport = (rows, lab) => {
    const sec = sectionOf('magazzino');
    const map = {};
    const fieldLabel = {};
    sec.xlsx.forEach(([key, label]) => { fieldLabel[key] = label; if (!SKIP.has(key)) map[norm(label)] = key; });
    Object.entries(ALIAS).forEach(([a, k]) => { if (!map[a]) map[a] = k; });
    const hi = rows.findIndex((r) => r.filter((c) => map[norm(c)]).length >= 2);
    if (hi < 0) throw new Error('Non trovo le colonne del magazzino: la prima riga dovrebbe avere Nome, Lotto, Quantità…');
    const cols = rows[hi].map((c) => map[norm(c)] || null);
    const header = rows[hi].map((c, i) => ({ label: String(c ?? '').trim(), key: cols[i], field: cols[i] ? fieldLabel[cols[i]] : '' })).filter((h) => h.label);
    const found = new Set(cols.filter(Boolean));
    const missing = expectedColumns().filter((c) => !found.has(c.key));
    const items = [];
    const lines = [];
    let skipped = 0;
    const find = (r) => lab.magazzino.find((x) => (r.numero && String(x.numero) === r.numero) || (!r.numero && ((r.codice && x.codice === r.codice && (x.lotto || '') === (r.lotto || '')) || (norm(x.nome) === norm(r.nome) && (x.lotto || '') === (r.lotto || '')))));
    rows.slice(hi + 1).forEach((row, ri) => {
        if (row.every((c) => c === '' || c === undefined)) return;
        const line = { n: hi + ri + 2, row, status: 'saltata', changed: [] };
        lines.push(line);
        const r = {};
        cols.forEach((k, i) => {
            if (!k || row[i] === '' || row[i] === undefined) return;
            const v = DATES.has(k) ? toIso(row[i]) : toStr(row[i]);
            if (v !== '') r[k] = v;
        });
        if (!r.nome) { skipped += 1; return; }
        const old = find(r);
        if (!old) { line.status = 'nuovo'; line.changed = Object.keys(r); items.push({ status: 'nuovo', r, rec: { unita: 'pz', ...r, id: newId('mag') }, changed: Object.keys(r) }); return; }
        const changed = Object.keys(r).filter((k) => String(old[k] ?? '') !== r[k]);
        line.status = changed.length ? 'aggiornato' : 'uguale';
        line.changed = changed;
        items.push({ status: line.status, r, rec: { ...old, ...r }, changed });
    });
    const count = (s) => items.filter((x) => x.status === s).length;
    return { sheet: rows.sheet || '', header, cols, headRaw: rows[hi], lines, missing, items, skipped, adds: count('nuovo'), updates: count('aggiornato'), same: count('uguale'), usedKeys: cols.filter(Boolean).filter((k, i, a) => a.indexOf(k) === i) };
};
