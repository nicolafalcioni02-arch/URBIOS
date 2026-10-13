// CSV senza librerie. Formato di uscita pensato per Excel italiano: UTF-8 con BOM, separatore ';', decimali con la virgola.
export const BOM = '﻿';

const looksNumeric = (s) => /^-?\d+(\.\d+)?$/.test(s);

export const formatCell = (v, { sep, decimal }) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'SI' : 'NO';
    let s = typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : String(v);
    if (typeof v === 'number' || looksNumeric(s)) {
        if (decimal === ',') s = s.replace('.', ',');
    } else if (/^[=+@]/.test(s) || /^-.*[A-Za-z(]/.test(s)) {
        s = "'" + s; // evita che Excel interpreti il testo come formula
    }
    if (s.includes(sep) || s.includes('"') || s.includes('\n') || s.includes('\r')) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
};

export const toCsv = (columns, rows, { sep = ';', decimal = ',', bom = true } = {}) => {
    const opts = { sep, decimal };
    const head = columns.map((c) => formatCell(String(c), { sep, decimal: '.' })).join(sep);
    const body = rows.map((r) => columns.map((c) => formatCell(r[c], opts)).join(sep));
    return (bom ? BOM : '') + [head, ...body].join('\r\n') + '\r\n';
};

// Legge un CSV (separatore ; , o tab rilevato dalla prima riga). Restituisce { headers, rows:[{col:valore}] }
export const parseCsv = (text) => {
    const t = String(text).replace(/^﻿/, '');
    const firstLine = t.split(/\r?\n/, 1)[0] || '';
    const counts = [';', ',', '\t'].map((d) => [d, firstLine.split(d).length - 1]).sort((a, b) => b[1] - a[1]);
    const delim = counts[0][1] > 0 ? counts[0][0] : ',';

    const records = [];
    let row = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < t.length; i++) {
        const ch = t[i];
        if (inQ) {
            if (ch === '"') {
                if (t[i + 1] === '"') {
                    field += '"';
                    i++;
                } else inQ = false;
            } else field += ch;
        } else if (ch === '"') inQ = true;
        else if (ch === delim) {
            row.push(field);
            field = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && t[i + 1] === '\n') i++;
            row.push(field);
            field = '';
            records.push(row);
            row = [];
        } else field += ch;
    }
    if (field !== '' || row.length) {
        row.push(field);
        records.push(row);
    }
    const nonEmpty = records.filter((r) => r.some((c) => c.trim() !== ''));
    if (!nonEmpty.length) return { headers: [], rows: [], delimiter: delim };
    const headers = nonEmpty[0].map((h) => h.trim());
    const rows = nonEmpty.slice(1).map((r) => {
        const o = {};
        headers.forEach((h, i) => {
            let v = r[i] === undefined ? '' : r[i];
            if (/^'[=+@-]/.test(v)) v = v.slice(1); // toglie l'apice anti-formula
            o[h] = v;
        });
        return o;
    });
    return { headers, rows, delimiter: delim };
};
