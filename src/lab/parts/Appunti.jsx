import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { Sketch } from './Sketch';
import { downloadDocx } from '../docx';

const PADS = { s: 28, n: 56, w: 84 };
const COLORS = [['Automatico', ''], ['Rosso', '#C0392B'], ['Arancione', '#D9730D'], ['Verde', '#217346'], ['Blu', '#2A5DB0'], ['Grigio', '#7A7D85']];
const MARKS = [['Nessuno', ''], ['Giallo', '#FFF2A8'], ['Verde', '#C9EBD3'], ['Azzurro', '#CFE3FA'], ['Rosa', '#F8D7E0']];
const escH = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Appunti: mini programma della scrivania. Elenco di note a sinistra, a destra la nota a righe:
// testo semplice, elenco puntato, elenco con le caselle da spuntare e disegni a mano (lo stesso «A mano» del quaderno).
// Salvataggio automatico, solo nel browser; «Salva con nome» ne fa un documento sulla scrivania o un file .txt.
const KEY = 'urbios-lab-appunti-app';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; } };
const uid = () => Math.random().toString(36).slice(2, 9);
const row = (t = 'p', text = '') => ({ id: uid(), t, text, done: false });
const blank = () => ({ id: uid(), title: '', rows: [row()], at: Date.now() });
const titleOf = (n) => n.title.trim() || (n.rows.find((r) => r.text.trim()) || {}).text || 'Nuovo appunto';
const bodyOf = (n) => { let k = 0; return n.rows.filter((r) => r.t !== 'mano').map((r) => { k = r.t === 'ol' ? k + 1 : 0; return r.t === 'hr' ? '————' : r.t === 'tab' ? r.cells.map((x) => x.join(' | ')).join('\n') : r.t === 'ol' ? `${k}. ${r.text}` : (r.t === 'ul' ? `• ${r.text}` : r.t === 'todo' ? `[${r.done ? 'x' : ' '}] ${r.text}` : r.text); }).join('\n').trim(); };
const when = (at) => new Date(at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

const Line = React.forwardRef(({ r, num, onText, onKey, onFocus, onDone }, ref) => {
    const fit = (el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } };
    if (r.t === 'hr') return <hr className="ap-hr" />;
    if (r.t === 'tab') return null;
    return (
        <div className={`ap-row t-${r.t}${r.done ? ' done' : ''}`} style={{ textAlign: r.al || 'left', paddingLeft: (r.ind || 0) * 28, lineHeight: r.ls || undefined }}>
            {r.t === 'todo' && <button className={`ap-box${r.done ? ' on' : ''}`} onClick={onDone} aria-label={r.done ? 'Togli la spunta' : 'Spunta'} aria-pressed={r.done}>{r.done && <Icon name="check" size={12} stroke={2.4} />}</button>}
            {r.t === 'ul' && <i className="ap-dot" />}
            {r.t === 'ol' && <span className="ap-num">{num}.</span>}
            <textarea className={`h${r.h || 0}`} style={{ fontWeight: r.b ? 700 : undefined, fontStyle: r.i || r.h === 3 ? 'italic' : undefined, color: r.col || undefined, background: r.hl || undefined, textDecoration: [r.u && 'underline', r.s && 'line-through'].filter(Boolean).join(' ') || undefined, lineHeight: r.ls || undefined, textAlign: r.al || 'left', fontSize: r.sz ? `${r.sz}px` : undefined }} ref={(el) => { fit(el); if (typeof ref === 'function') ref(el); }} rows={1} value={r.text} onChange={(e) => { fit(e.target); onText(e.target.value); }} onKeyDown={onKey} onFocus={onFocus} placeholder="▏" aria-label="Riga dell’appunto" />
        </div>
    );
});

export const Appunti = ({ onSaveAs }) => {
    const [notes, setNotes] = useState(load);
    const [sel, setSel] = useState(() => (load()[0] || {}).id || null);
    const [q, setQ] = useState('');
    const [err, setErr] = useState('');
    const [sketch, setSketch] = useState(null); // { rid } = disegno da correggere, { rid: null } = nuovo
    const [tab, setTab] = useState('home'); const [zoom, setZoom] = useState(100); const [file, setFile] = useState(false);
    const [find, setFind] = useState(''); const [repl, setRepl] = useState('');
    const hist = useRef({ undo: [], redo: [], last: 0, id: null });
    const [as, setAs] = useState(null); // nome nella finestrella «Salva con nome»
    const refs = useRef({}); const focus = useRef(null); const cur = useRef(null);
    const note = notes.find((n) => n.id === sel) || null;
    const commit = (fn) => setNotes((o) => { const n = fn(o); if (!save(n)) setErr('Memoria del browser piena: l’ultima modifica non è salvata.'); else setErr(''); return n; });
    const patch = (id, p, nohist) => {
        const h = hist.current; const now = Date.now();
        if (!nohist) {
            const n0 = notes.find((n) => n.id === id);
            if (h.id !== id) { h.undo = []; h.redo = []; h.id = id; }
            if (n0 && now - h.last > 700) { h.undo.push({ title: n0.title, rows: n0.rows }); if (h.undo.length > 100) h.undo.shift(); }
            h.redo = []; h.last = now;
        }
        commit((o) => o.map((n) => (n.id === id ? { ...n, ...p, at: Date.now() } : n)));
    };
    const step = (from, to) => { const h = hist.current; if (!note || h.id !== note.id || !h[from].length) return; h[to].push({ title: note.title, rows: note.rows }); patch(note.id, h[from].pop(), true); h.last = 0; };
    const undo = () => step('undo', 'redo'); const redo = () => step('redo', 'undo');
    useEffect(() => { if (focus.current && refs.current[focus.current]) { refs.current[focus.current].focus(); focus.current = null; } });
    const add = () => { const n = blank(); commit((o) => [n, ...o]); setSel(n.id); focus.current = n.rows[0].id; };
    const del = (id) => { commit((o) => o.filter((n) => n.id !== id)); setSel((s) => (s === id ? (notes.find((n) => n.id !== id) || {}).id || null : s)); };
    const setRow = (rid, p) => patch(note.id, { rows: note.rows.map((r) => (r.id === rid ? { ...r, ...p } : r)) });
    const typeNow = (t) => { const id = cur.current && note.rows.some((r) => r.id === cur.current) ? cur.current : note.rows[note.rows.length - 1].id; patch(note.id, { rows: note.rows.map((r) => (r.id === id ? { ...r, t: r.t === t ? 'p' : t } : r)) }); focus.current = id; };
    const obj = (r) => r.t === 'mano' || r.t === 'hr' || r.t === 'tab';
    const setCells = (rid, fn) => { const r = note.rows.find((x) => x.id === rid); setRow(rid, { cells: fn(r.cells.map((x) => [...x])) }); };
    const curRow = () => note.rows.find((r) => r.id === cur.current && !obj(r)) || note.rows.filter((r) => !obj(r)).slice(-1)[0] || {};
    const hits = find && note ? note.rows.reduce((n, r) => n + (r.text.split(find).length - 1), 0) + (note.title.split(find).length - 1) : 0;
    const replAll = () => { if (!find || !hits) return; patch(note.id, { title: note.title.split(find).join(repl), rows: note.rows.map((r) => (r.text ? { ...r, text: r.text.split(find).join(repl) } : r)) }); };
    const insertRows = (list) => { const i = Math.max(0, note.rows.findIndex((x) => x.id === cur.current)); const at = cur.current ? i : note.rows.length - 1; const after = at === note.rows.length - 1 ? [row()] : []; patch(note.id, { rows: [...note.rows.slice(0, at + 1), ...list, ...after, ...note.rows.slice(at + 1)] }); };
    const addImage = (f) => { if (!f) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1200 / Math.max(im.width, im.height)); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); insertRows([{ id: uid(), t: 'mano', text: '', done: false, img: cv.toDataURL('image/jpeg', 0.85) }]); }; im.src = rd.result; }; rd.readAsDataURL(f); };
    const fmt = (p) => { const r = curRow(); if (!r.id) return; setRow(r.id, p); focus.current = r.id; };
    const toggle = (k) => fmt({ [k]: !curRow()[k] });
    const style = (h) => fmt({ h, b: false, sz: 0 });
    const words = note ? note.rows.reduce((n, r) => n + (r.text.trim() ? r.text.trim().split(/\s+/).length : 0), 0) : 0;
    const chars = note ? note.rows.reduce((n, r) => n + r.text.length, note.title.length) : 0;
    const drawn = (o) => {
        if (sketch.rid) { setRow(sketch.rid, o); return; }
        const at = cur.current ? note.rows.findIndex((x) => x.id === cur.current) : note.rows.length - 1;
        const i = at < 0 ? note.rows.length - 1 : at;
        const m = { id: uid(), t: 'mano', text: '', done: false, ...o };
        const after = i === note.rows.length - 1 ? [row()] : [];
        patch(note.id, { rows: [...note.rows.slice(0, i + 1), m, ...after, ...note.rows.slice(i + 1)] });
    };
    const saveOnDesk = () => { onSaveAs({ name: as.trim() || titleOf(note), body: bodyOf(note), imgs: note.rows.filter((r) => r.t === 'mano').map((r) => r.img) }); setAs(null); };
    const exportWord = () => {
        const blocks = []; let list = null; const fl = () => { list = null; };
        const html = (r) => { let h = escH(r.text); if (r.b) h = `<b>${h}</b>`; if (r.i) h = `<i>${h}</i>`; if (r.u) h = `<u>${h}</u>`; return h; };
        note.rows.forEach((r) => {
            if (r.t === 'mano') { fl(); blocks.push({ t: 'img', img: r.img, w: r.w, h: r.h, k: (r.wp || 60) / 100 }); return; }
            if (r.t === 'tab') { fl(); blocks.push({ t: 'tabella', rows: r.cells }); return; }
            if (r.t === 'hr') { fl(); blocks.push({ t: 'testo', html: '<p>————————</p>' }); return; }
            if (r.t === 'ul' || r.t === 'ol') { const tag = r.t; if (!list || list.tag !== tag) { list = { tag, items: [] }; blocks.push({ t: 'testo', list }); } list.items.push(html(r)); return; }
            fl();
            const t = r.t === 'todo' ? `${r.done ? '☑' : '☐'} ${html(r)}` : html(r);
            blocks.push({ t: 'testo', html: r.h === 1 ? `<h2>${t}</h2>` : r.h === 2 ? `<h3>${t}</h3>` : `<p>${t || '<br>'}</p>` });
        });
        const out = blocks.map((b) => (b.list ? { t: 'testo', html: `<${b.list.tag}>${b.list.items.map((x) => `<li>${x}</li>`).join('')}</${b.list.tag}>` } : b));
        downloadDocx(titleOf(note), { title: note.title.trim(), blocks: out, orient: note.o, margin: { s: 567, n: 1134, w: 1701 }[note.m || 'n'] });
    };
    const resize = (r) => (e) => {
        e.preventDefault(); e.stopPropagation();
        const fig = e.currentTarget.parentElement; const par = fig.parentElement; const handle = e.currentTarget;
        handle.setPointerCapture(e.pointerId);
        const pr = par.getBoundingClientRect(); const full = pr.width - 2 * PADS[note.m || 'n'] * (zoom / 100); const left = fig.getBoundingClientRect().left;
        let wp = r.wp || 60;
        const move = (ev) => { wp = Math.max(10, Math.min(100, Math.round(((ev.clientX - left) / full) * 100))); fig.style.width = `${wp}%`; };
        const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); setRow(r.id, { wp }); };
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
    };
    const print = () => {
        const w = window.open('', '_blank'); if (!w) { setErr('Il browser ha bloccato la finestra di stampa.'); return; }
        const body = []; let list = null;
        const h = (r) => { let t = escH(r.text) || '<br>'; if (r.b) t = `<b>${t}</b>`; if (r.i) t = `<i>${t}</i>`; const d = [r.u && 'underline', r.s && 'line-through'].filter(Boolean).join(' '); return `<p style="margin:0 0 .3em ${(r.ind || 0) * 28}px;text-align:${r.al || 'left'};line-height:${r.ls || 1.5};${r.h === 1 ? 'font-size:22px;font-weight:700;' : r.h === 2 ? 'font-size:17px;font-weight:700;' : r.h === 4 ? 'background:#E8F3EC;padding:6px 10px;border-radius:4px;' : r.h === 3 ? 'font-style:italic;color:#555;border-left:3px solid #999;padding-left:10px;' : r.sz ? `font-size:${r.sz}px;` : ''}${r.col ? `color:${r.col};` : ''}${r.hl ? `background:${r.hl};` : ''}${d ? `text-decoration:${d};` : ''}">${t}</p>`; };
        let k = 0;
        note.rows.forEach((r) => {
            k = r.t === 'ol' ? k + 1 : 0;
            if (r.t === 'mano') body.push(`<img src="${r.img}" style="width:${r.wp || 60}%;display:block;margin:8px 0">`);
            else if (r.t === 'hr') body.push('<hr>');
            else if (r.t === 'tab') body.push(`<table>${r.cells.map((rw) => `<tr>${rw.map((v) => `<td>${escH(v)}</td>`).join('')}</tr>`).join('')}</table>`);
            else body.push(h({ ...r, text: r.t === 'ul' ? `• ${r.text}` : r.t === 'ol' ? `${k}. ${r.text}` : r.t === 'todo' ? `${r.done ? '☑' : '☐'} ${r.text}` : r.text }));
        });
        w.document.write(`<!doctype html><title>${escH(titleOf(note))}</title><style>body{font:14px/1.5 -apple-system,Helvetica,Arial,sans-serif;margin:0;padding:${{ s: 10, n: 20, w: 30 }[note.m || 'n']}mm;color:#17181B}h1{font-size:24px;margin:0 0 12px}table{border-collapse:collapse;margin:8px 0;width:100%}td{border:1px solid #888;padding:4px 8px}@page{size:A4 ${note.o === 'o' ? 'landscape' : 'portrait'};margin:0}</style>${note.title.trim() ? `<h1>${escH(note.title)}</h1>` : ''}${body.join('')}`);
        w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
    };
    const moveRow = (d) => { const r = curRow(); if (!r.id) return; const i = note.rows.findIndex((x) => x.id === r.id); const j = i + d; if (j < 0 || j >= note.rows.length) return; const a = [...note.rows]; [a[i], a[j]] = [a[j], a[i]]; patch(note.id, { rows: a }); focus.current = r.id; };
    const dupRow = () => { const r = curRow(); if (!r.id) return; const i = note.rows.findIndex((x) => x.id === r.id); const n = { ...r, id: uid() }; patch(note.id, { rows: [...note.rows.slice(0, i + 1), n, ...note.rows.slice(i + 1)] }); focus.current = n.id; };
    const delRow = () => { const r = curRow(); if (!r.id || note.rows.length < 2) return; patch(note.id, { rows: note.rows.filter((x) => x.id !== r.id) }); };
    const dupNote = () => { const n = { ...note, id: uid(), title: `${note.title.trim() || titleOf(note)} (copia)`, rows: note.rows.map((r) => ({ ...r, id: uid() })), at: Date.now() }; commit((o) => [n, ...o]); setSel(n.id); setFile(false); };
    const upper = () => { const r = curRow(); if (!r.id) return; const t = r.text; fmt({ text: t === t.toUpperCase() ? t.toLowerCase() : t.toUpperCase() }); };
    const download = () => {
        const name = (as.trim() || titleOf(note)).replace(/[\\/:*?"<>|]/g, ' ').trim() || 'Appunto';
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`${note.title.trim() ? `${note.title.trim()}\n\n` : ''}${bodyOf(note)}\n`], { type: 'text/plain;charset=utf-8' }));
        a.download = `${name}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); setAs(null);
    };
    const key = (r, i) => (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); (e.shiftKey ? redo : undo)(); return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === 'Tab') { e.preventDefault(); setRow(r.id, { ind: Math.max(0, Math.min(6, (r.ind || 0) + (e.shiftKey ? -1 : 1))) }); return; }
        if ((e.metaKey || e.ctrlKey) && 'biu'.includes(e.key.toLowerCase()) && e.key.length === 1) { e.preventDefault(); setRow(r.id, { [e.key.toLowerCase()]: !r[e.key.toLowerCase()] }); return; }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (r.t !== 'p' && !r.text.trim()) { setRow(r.id, { t: 'p' }); return; } // riga vuota in un elenco = esci dall'elenco
            const nr = { ...row(r.t), al: r.al, ind: r.ind, ls: r.ls };
            patch(note.id, { rows: [...note.rows.slice(0, i + 1), nr, ...note.rows.slice(i + 1)] }); focus.current = nr.id;
        } else if (e.key === 'Backspace' && !r.text) {
            e.preventDefault();
            if (r.t !== 'p') { setRow(r.id, { t: 'p' }); return; }
            if (note.rows.length > 1) { const prev = note.rows[i - 1] || note.rows[i + 1]; patch(note.id, { rows: note.rows.filter((x) => x.id !== r.id) }); focus.current = prev.id; }
        }
    };
    const list = useMemo(() => notes.filter((n) => !q.trim() || (titleOf(n) + n.rows.map((r) => r.text).join(' ')).toLowerCase().includes(q.trim().toLowerCase())), [notes, q]);
    const todo = note ? note.rows.filter((r) => r.t === 'todo') : [];
    const c = note ? curRow() : {};
    const T = ({ on, onClick, title, children, cls = '' }) => <button className={`ap-r${on ? ' on' : ''} ${cls}`} onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title} aria-label={title} aria-pressed={!!on}>{children}</button>;
    return (
        <div className="ap">
            <div className="ap-title-bar">
                <button className={`ap-filebtn${file ? ' on' : ''}`} onClick={() => setFile((v) => !v)}>File</button>
                {[['home', 'Home'], ['ins', 'Inserisci'], ['lay', 'Layout']].map(([t, n]) => <button key={t} className={`ap-tab${tab === t && !file ? ' on' : ''}`} onClick={() => { setTab(t); setFile(false); }}>{n}</button>)}
                <span className="ap-doc">{note ? `${titleOf(note)} — salvato` : 'Appunti'}</span>
            </div>
            {file ? (
                <div className="ap-ribbon ap-backstage">
                    <button className="ap-big" onClick={() => { add(); setFile(false); }}><Icon name="plus" size={22} /><span>Nuovo</span></button>
                    <button className="ap-big" disabled={!note} onClick={() => { setAs(titleOf(note) === 'Nuovo appunto' ? '' : titleOf(note)); setFile(false); }}><Icon name="download" size={22} /><span>Salva con nome</span></button>
                    <button className="ap-big" disabled={!note} onClick={dupNote}><Icon name="copy" size={22} /><span>Duplica</span></button>
                    <button className="ap-big" disabled={!note} onClick={() => { print(); setFile(false); }}><Icon name="printer" size={22} /><span>Stampa / PDF</span></button>
                    <button className="ap-big" disabled={!note} onClick={() => { exportWord(); setFile(false); }}><Icon name="article" size={22} /><span>Word (.docx)</span></button>
                    <button className="ap-big" disabled={!note} onClick={() => { del(note.id); setFile(false); }}><Icon name="trash" size={22} /><span>Elimina</span></button>
                    <div className="ap-open">
                        <label className="ap-find"><Icon name="search" size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Apri un appunto…" aria-label="Cerca negli appunti" /></label>
                        <div className="ap-ol">{list.map((n) => <button key={n.id} className={n.id === sel ? 'on' : ''} onClick={() => { setSel(n.id); setFile(false); }}>{titleOf(n)} <small>{when(n.at)}</small></button>)}{!list.length && <small>{notes.length ? 'Nessun risultato' : 'Nessun appunto'}</small>}</div>
                    </div>
                </div>
            ) : (
                <div className="ap-ribbon">
                    {tab === 'home' ? (
                        <>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <T onClick={undo} title="Annulla (⌘Z)"><Icon name="undo" size={16} /></T>
                                <T onClick={redo} title="Ripeti (⇧⌘Z)"><Icon name="redo" size={16} /></T>
                            </div><span className="ap-gl">Annulla</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <select className="ap-sel" disabled={!note} value={c.h || 0} onChange={(e) => style(+e.target.value)} aria-label="Stile" style={{ width: 104 }}><option value={0}>Normale</option><option value={1}>Titolo 1</option><option value={2}>Titolo 2</option><option value={3}>Citazione</option><option value={4}>Nota</option></select>
                                <select className="ap-sel" disabled={!note} value={c.sz || ''} onChange={(e) => fmt({ sz: +e.target.value || 0 })} aria-label="Dimensione" style={{ width: 62 }}><option value="">14</option>{[10, 12, 16, 18, 20, 24, 28].map((n) => <option key={n} value={n}>{n}</option>)}</select>
                            </div><div className="ap-row-tools">
                                <T on={c.b} onClick={() => toggle('b')} title="Grassetto (⌘B)"><b>B</b></T>
                                <T on={c.i} onClick={() => toggle('i')} title="Corsivo (⌘I)"><i>I</i></T>
                                <T on={c.u} onClick={() => toggle('u')} title="Sottolineato (⌘U)"><u>U</u></T>
                                <T on={c.s} onClick={() => toggle('s')} title="Barrato"><s>ab</s></T>
                                <T onClick={upper} title="MAIUSCOLO / minuscolo"><span style={{ fontSize: 11.5 }}>Aa</span></T>
                                <select className="ap-sel" disabled={!note} value={c.col || ''} onChange={(e) => fmt({ col: e.target.value })} aria-label="Colore del testo" title="Colore del testo" style={{ width: 92, color: c.col || undefined }}>{COLORS.map(([n, v]) => <option key={n} value={v}>{n === 'Automatico' ? 'Colore' : n}</option>)}</select>
                                <select className="ap-sel" disabled={!note} value={c.hl || ''} onChange={(e) => fmt({ hl: e.target.value })} aria-label="Evidenziatore" title="Evidenziatore" style={{ width: 96, background: c.hl || undefined }}>{MARKS.map(([n, v]) => <option key={n} value={v}>{n === 'Nessuno' ? 'Evidenzia' : n}</option>)}</select>
                            </div><span className="ap-gl">Carattere</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <T on={c.t === 'ul'} onClick={() => note && typeNow('ul')} title="Elenco puntato"><Icon name="protocol" size={16} /></T>
                                <T on={c.t === 'ol'} onClick={() => note && typeNow('ol')} title="Elenco numerato"><Icon name="olist" size={16} /></T>
                                <T on={c.t === 'todo'} onClick={() => note && typeNow('todo')} title="Elenco con caselle"><Icon name="check" size={16} /></T>
                            </div><div className="ap-row-tools">
                                <T on={!c.al || c.al === 'left'} onClick={() => fmt({ al: 'left' })} title="Allinea a sinistra"><Icon name="alignL" size={16} /></T>
                                <T on={c.al === 'center'} onClick={() => fmt({ al: 'center' })} title="Centra"><Icon name="alignC" size={16} /></T>
                                <T on={c.al === 'right'} onClick={() => fmt({ al: 'right' })} title="Allinea a destra"><Icon name="alignR" size={16} /></T>
                                <T onClick={() => fmt({ ind: Math.max(0, (c.ind || 0) - 1) })} title="Riduci rientro"><Icon name="outdent" size={16} /></T>
                                <T onClick={() => fmt({ ind: Math.min(6, (c.ind || 0) + 1) })} title="Aumenta rientro"><Icon name="indent" size={16} /></T>
                                <select className="ap-sel" disabled={!note} value={c.ls || ''} onChange={(e) => fmt({ ls: +e.target.value || 0 })} aria-label="Interlinea" title="Interlinea" style={{ width: 64 }}><option value="">1,55</option>{[1, 1.15, 1.5, 2, 2.5].map((n) => <option key={n} value={n}>{String(n).replace('.', ',')}</option>)}</select>
                            </div><span className="ap-gl">Paragrafo</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <T onClick={() => moveRow(-1)} title="Sposta la riga su"><Icon name="chevron-up" size={16} /></T>
                                <T onClick={() => moveRow(1)} title="Sposta la riga giù"><Icon name="chevron-down" size={16} /></T>
                            </div><div className="ap-row-tools">
                                <T onClick={dupRow} title="Duplica la riga"><Icon name="copy" size={16} /></T>
                                <T onClick={delRow} title="Elimina la riga"><Icon name="trash" size={16} /></T>
                            </div><span className="ap-gl">Righe</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <input className="ap-sel ap-fi" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Trova" aria-label="Trova" />
                                <span className="ap-hits">{find ? `${hits}` : ''}</span>
                            </div><div className="ap-row-tools">
                                <input className="ap-sel ap-fi" value={repl} onChange={(e) => setRepl(e.target.value)} placeholder="Sostituisci con" aria-label="Sostituisci con" />
                                <button className="ap-sel" disabled={!hits} onClick={replAll}>Tutti</button>
                            </div><span className="ap-gl">Modifica</span></div>
                        </>
                    ) : tab === 'lay' ? (
                        <>
                            <div className="ap-grp"><div className="ap-row-tools">
                                {[['s', 'Stretti'], ['n', 'Normali'], ['w', 'Ampi']].map(([k, n]) => <button key={k} className={`ap-chip${note && (note.m || 'n') === k ? ' on' : ''}`} disabled={!note} onClick={() => patch(note.id, { m: k })}>{n}</button>)}
                            </div><span className="ap-gl">Margini</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                {[['v', 'Verticale'], ['o', 'Orizzontale']].map(([k, n]) => <button key={k} className={`ap-chip${note && (note.o || 'v') === k ? ' on' : ''}`} disabled={!note} onClick={() => patch(note.id, { o: k })}>{n}</button>)}
                            </div><span className="ap-gl">Orientamento</span></div>
                        </>
                    ) : (
                        <>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <button className="ap-big" disabled={!note} onClick={() => setSketch({ rid: null })}><Icon name="pen" size={22} /><span>A mano</span></button>
                                <label className={`ap-big${note ? '' : ' dis'}`}><Icon name="image" size={22} /><span>Immagine</span><input type="file" accept="image/*" hidden disabled={!note} onChange={(e) => { addImage(e.target.files[0]); e.target.value = ''; }} /></label>
                            </div><span className="ap-gl">Illustrazioni</span></div>
                            <div className="ap-grp"><div className="ap-row-tools">
                                <button className="ap-big" disabled={!note} onClick={() => insertRows([{ id: uid(), t: 'tab', text: '', done: false, cells: [['', '', ''], ['', '', ''], ['', '', '']] }])}><Icon name="table" size={22} /><span>Tabella</span></button>
                                <button className="ap-big" disabled={!note} onClick={() => insertRows([{ id: uid(), t: 'hr', text: '', done: false }])}><Icon name="hline" size={22} /><span>Linea</span></button>
                                <button className="ap-big" disabled={!note} onClick={() => insertRows([{ ...row(), text: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) }])}><Icon name="calendar" size={22} /><span>Data</span></button>
                            </div><span className="ap-gl">Testo</span></div>
                        </>
                    )}
                </div>
            )}
            <div className="ap-body">
                <section className="ap-main">
                    {note ? (
                        <div className="ap-canvas">
                            <div className="ap-page" style={{ zoom: zoom / 100, padding: `${PADS[note.m || 'n']}px`, maxWidth: note.o === 'o' ? 900 : 640, minHeight: note.o === 'o' ? 600 : 820 }}>
                                <input className="ap-title" value={note.title} onChange={(e) => patch(note.id, { title: e.target.value })} placeholder="Titolo" aria-label="Titolo dell’appunto" />
                                {note.rows.map((r, i) => (r.t === 'tab' ? (
                                    <div key={r.id} className="ap-tabw">
                                        <table className="ap-tab-t"><tbody>{r.cells.map((rw, y) => <tr key={y}>{rw.map((v, x) => <td key={x}><textarea rows={1} value={v} aria-label="Cella" onFocus={() => { cur.current = r.id; }} onChange={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; setCells(r.id, (c) => { c[y][x] = e.target.value; return c; }); }} /></td>)}</tr>)}</tbody></table>
                                        <div className="ap-tabtools">
                                            <button onClick={() => setCells(r.id, (c) => [...c, c[0].map(() => '')])}>+ Riga</button>
                                            <button onClick={() => setCells(r.id, (c) => c.map((rw) => [...rw, '']))}>+ Colonna</button>
                                            <button disabled={r.cells.length < 2} onClick={() => setCells(r.id, (c) => c.slice(0, -1))}>− Riga</button>
                                            <button disabled={r.cells[0].length < 2} onClick={() => setCells(r.id, (c) => c.map((rw) => rw.slice(0, -1)))}>− Colonna</button>
                                            <button onClick={() => patch(note.id, { rows: note.rows.filter((x) => x.id !== r.id) })}>Elimina tabella</button>
                                        </div>
                                    </div>
                                ) : r.t === 'mano' ? (
                                    <figure key={r.id} className="ap-mano" style={{ width: `${r.wp || 60}%` }}>
                                        <img src={r.img} alt="Immagine" onClick={() => setSketch({ rid: r.id })} draggable={false} />
                                        <i className="ap-rz" title="Trascina per ridimensionare" onPointerDown={resize(r)} />
                                        <button className="m-ib" onClick={() => patch(note.id, { rows: note.rows.filter((x) => x.id !== r.id) })} aria-label="Togli il disegno"><Icon name="x" size={14} /></button>
                                    </figure>
                                ) : (
                                    <Line key={r.id} r={r} num={note.rows.slice(0, i + 1).reverse().findIndex((x) => x.t !== 'ol') < 0 ? i + 1 : note.rows.slice(0, i + 1).reverse().findIndex((x) => x.t !== 'ol')} ref={(el) => { refs.current[r.id] = el; }} onText={(text) => setRow(r.id, { text })} onKey={key(r, i)} onDone={() => setRow(r.id, { done: !r.done })} onFocus={() => { cur.current = r.id; }} />
                                )))}
                            </div>
                        </div>
                    ) : (
                        <div className="ap-empty"><p>Nessun appunto aperto</p><button className="m-pillbtn" onClick={add}><Icon name="plus" size={15} /> Nuovo appunto</button></div>
                    )}
                {sketch && note && (() => {
                    const m = sketch.rid ? note.rows.find((x) => x.id === sketch.rid) : null;
                    return <Sketch initial={m ? { tratti: m.tratti || [], w: m.w, h: m.h, bg: m.orig || m.img } : null} onClose={() => setSketch(null)} onDelete={m ? () => { patch(note.id, { rows: note.rows.filter((x) => x.id !== m.id) }); setSketch(null); } : null} onSave={(o) => { drawn(o); setSketch(null); }} />;
                })()}
                {as !== null && note && (
                    <div className="ap-sa-back" onClick={() => setAs(null)}>
                        <form className="dk-ask" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveOnDesk(); }}>
                            <h3>Salva con nome</h3>
                            <input autoFocus className="dk-name" value={as} onChange={(e) => setAs(e.target.value)} placeholder={titleOf(note)} aria-label="Nome del file" />
                            <div><button type="button" className="m-pillbtn light" onClick={download}>Scarica .txt</button><button type="submit" className="m-pillbtn">Sulla scrivania</button></div>
                        </form>
                    </div>
                )}
                    {err && <p className="ap-err" role="alert">{err}</p>}
                </section>
            </div>
            <div className="ap-status">
                <span>Pagina 1 di 1</span><span>{words} {words === 1 ? 'parola' : 'parole'}</span><span>{chars} caratteri</span>
                <span className="ap-zoom"><button onClick={() => setZoom((z) => Math.max(50, z - 10))} aria-label="Riduci">−</button><input type="range" min="50" max="200" step="10" value={zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom" /><button onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label="Ingrandisci">+</button><em>{zoom}%</em></span>
            </div>
        </div>
    );
};
