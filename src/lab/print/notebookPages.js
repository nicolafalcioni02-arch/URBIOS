import { labOf, fmtDay } from '../labLogic';

// Pagine del quaderno di laboratorio (stampa): ogni pagina è un A4 a quadretti da 5 mm con intestazione, righe di firma e numero di pagina.
// Il testo di un esperimento va a capo con le misure vere del carattere (canvas) e si appoggia ai quadretti, una riga per quadretto.
// Pura: nessun React. Restituisce una lista di pagine { num, from, to, title, project, book, date, signer, checker, checkDate, lines }.
export const GRID_ROWS = 44; // righe di testo in una pagina (la prima e l'ultima riga di quadretti restano per «Dalla/Alla pagina»)
const MM = 96 / 25.4;
const TEXT_W = 180 * MM * 0.96; // larghezza utile del testo (px), con un po' di margine
const FONT = `${(9.5 * 96) / 72}px Inter, system-ui, sans-serif`;

const makeMeasure = () => {
    try {
        const ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
        if (ctx) {
            ctx.font = FONT;
            return (s) => ctx.measureText(s).width;
        }
    } catch (e) { /* si usa la stima */ }
    return (s) => s.length * 6.6;
};

// va a capo il testo (anche parole più lunghe di una riga)
const wrap = (text, measure, prefix = '') => {
    const out = [];
    String(text || '').split(/\r?\n/).forEach((para, pi) => {
        const words = para.split(/\s+/).filter(Boolean);
        if (!words.length) { out.push(''); return; }
        let line = pi === 0 || !prefix ? prefix : prefix;
        let first = true;
        words.forEach((w) => {
            const cand = first ? line + w : `${line} ${w}`;
            if (measure(cand) <= TEXT_W) { line = cand; first = false; return; }
            if (!first) out.push(line);
            let rest = w;
            while (measure(rest) > TEXT_W) {
                let k = rest.length - 1;
                while (k > 1 && measure(rest.slice(0, k)) > TEXT_W) k--;
                out.push(rest.slice(0, k));
                rest = rest.slice(k);
            }
            line = rest;
            first = false;
        });
        out.push(line);
    });
    return out;
};

const entryLines = (r, lab, measure) => {
    const lines = [];
    const gap = () => { if (lines.length && lines[lines.length - 1].k !== 'gap') lines.push({ k: 'gap' }); };
    const block = (title, text) => {
        if (!String(text || '').trim()) return;
        gap();
        lines.push({ k: 'h', t: title.toUpperCase() });
        wrap(text, measure).forEach((t) => lines.push({ k: 'p', t }));
    };
    const proto = lab.protocolli.find((p) => p.id === r.protocolloId);
    if (proto) lines.push({ k: 'p', t: `Protocollo seguito: ${[proto.codice, proto.titolo].filter(Boolean).join(' · ')}` });
    block('Obiettivo', r.obiettivo);
    const mats = (r.materiali || []).filter((m) => String(m.nome || '').trim());
    if (mats.length) {
        gap();
        lines.push({ k: 'h', t: 'MATERIALI, REAGENTI E LOTTI' });
        mats.forEach((m) => wrap([m.nome, [m.quantita, m.unita].filter(Boolean).join(' '), m.note].filter(Boolean).join(' · '), measure, '– ').forEach((t) => lines.push({ k: 'p', t })));
    }
    block('Procedura svolta', r.procedura);
    block('Osservazioni', r.osservazioni);
    block('Risultati', r.risultati);
    block('Conclusioni', r.conclusioni);
    block('Prossimi passi', r.prossimi);
    return lines;
};

// distribuisce le righe sulle pagine (un titolo non resta mai solo in fondo)
const paginate = (lines) => {
    const pages = [[]];
    lines.forEach((ln, i) => {
        let cur = pages[pages.length - 1];
        if (ln.k === 'gap' && !cur.length) return;
        const need = ln.k === 'h' && lines[i + 1] ? 2 : 1;
        if (cur.length + need > GRID_ROWS) { pages.push([]); cur = pages[pages.length - 1]; if (ln.k === 'gap') return; }
        cur.push(ln);
    });
    return pages;
};

export const notebookPages = (db, opts = {}) => {
    const o = { view: 'compilato', ids: null, book: '', startPage: 1, count: 10, ...opts };
    const start = Math.max(1, parseInt(o.startPage, 10) || 1);
    const base = { book: o.book || '', project: '', title: '', date: '', signer: '', checker: '', checkDate: '', lines: [], from: null, to: null };
    if (o.view === 'vuote') {
        const n = Math.min(200, Math.max(1, parseInt(o.count, 10) || 1));
        return Array.from({ length: n }, (_, i) => ({ ...base, num: start + i, blank: true }));
    }
    const lab = labOf(db);
    const entries = [...lab.quaderno].filter((r) => !o.ids || o.ids.includes(r.id)).sort((a, b) => String(a.data || '').localeCompare(String(b.data || '')));
    const measure = makeMeasure();
    const out = [];
    entries.forEach((r) => {
        const chunks = paginate(entryLines(r, lab, measure));
        chunks.forEach((lines, i) => {
            const num = start + out.length;
            out.push({
                ...base,
                num,
                lines,
                title: r.titolo || '',
                project: r.progetto || '',
                date: fmtDay(r.data),
                signer: r.operatore || '',
                checker: r.verificatoDa || '',
                checkDate: fmtDay(r.dataVerifica),
                from: i > 0 ? num - 1 : null,
                to: i < chunks.length - 1 ? num + 1 : null,
            });
        });
    });
    return out;
};
