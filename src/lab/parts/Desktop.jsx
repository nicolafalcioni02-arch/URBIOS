import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { SECTIONS, sectionOf } from '../sections';
import { searchAll } from '../labLogic';
import { UrbiosLogo } from '../../brand/UrbiosLogo';
import { Calculator } from './Calculator';
import { Appunti } from './Appunti';
import { Esporta } from './Esporta';
import { GelApp } from './GelApp';
import { TextFile, ImageFile, loadUf, saveUf, newUfId, readImage } from './DeskFiles';

// Panoramica di PC e iPad: una scrivania come quella di un Mac. Le aree sono cartelle (doppio clic = finestra con i file),
// i file sono le voci registrate (doppio clic = si aprono in una scheda della postazione). Su touch basta un tocco.
const AREAS = ['quaderno', 'protocolli', 'reagenti', 'magazzino', 'campioni', 'articoli'];
const coarse = () => { try { return window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };

const BG = 'urbios-lab-sfondo';
const TINTS = { chiaro: ['Chiaro', 'radial-gradient(60% 70% at 92% 0%, rgba(225,234,76,.55), transparent 65%), radial-gradient(55% 60% at 0% 40%, rgba(226,222,248,.95), transparent 62%), radial-gradient(60% 60% at 70% 110%, rgba(252,234,222,.95), transparent 62%), #F1EEE8'], grigio: ['Grigio', '#E9E9EC'], bianco: ['Bianco', '#FFFFFF'], scuro: ['Scuro', '#1B1C20'] };
const loadBg = () => { try { return { tinta: 'chiaro', logo: true, forza: 6, ...JSON.parse(localStorage.getItem(BG)) }; } catch (e) { return { tinta: 'chiaro', logo: true, forza: 6 }; } };
const TRASH = 'urbios-lab-cestino';
const loadTrash = () => { try { return JSON.parse(localStorage.getItem(TRASH)) || []; } catch (e) { return []; } };
const HID = 'urbios-lab-scrivania-riposti';
const loadHid = () => { try { return JSON.parse(localStorage.getItem(HID)) || []; } catch (e) { return []; } };
const STORE = 'urbios-lab-scrivania';
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
const keep = (v) => { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) { /* senza memoria locale le icone tornano al loro posto */ } };

const CF = 'urbios-lab-cartelle';
const CFF = 'urbios-lab-cartelle-file';
const jl = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch (e) { return def; } };
const js = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* senza memoria locale restano solo finché la pagina è aperta */ } };

const FolderArt = ({ icon, n }) => (
    <span className="dk-folder">
        <svg viewBox="0 0 64 52" width="68" height="56" aria-hidden="true"><path d="M3 9a5 5 0 0 1 5-5h14l6 7h28a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" /></svg>
        {icon && <i><Icon name={icon} size={24} stroke={1.6} /></i>}
        {n > 0 && <b>{n}</b>}
    </span>
);
const FileArt = ({ icon }) => (
    <span className="dk-file">
        <svg viewBox="0 0 48 60" width="50" height="62" aria-hidden="true"><path d="M6 4h25l11 11v38a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" /><path d="M31 4v11h11" /></svg>
        <i><Icon name={icon} size={20} stroke={1.6} /></i>
    </span>
);

// Finestra libera sulla scrivania: si sposta dalla barra del titolo, resta dentro lo schermo, quella toccata per ultima sta davanti
const DragWin = ({ exp, cdir, title, x0, y0, w, h, z, dark, min, front, onFront, onClose, onMin, extra, children }) => {
    const [p, setP] = useState({ x: x0, y: y0 });
    const [sz, setSz] = useState({ w, h });
    const [max, setMax] = useState(false);
    const ref = useRef(null);
    const down = (e) => {
        onFront();
        if (e.button !== 0 || max || e.target.closest('button')) return;
        const box = ref.current.offsetParent.getBoundingClientRect(); const me = ref.current.getBoundingClientRect();
        const dx = e.clientX - me.left; const dy = e.clientY - me.top;
        const mv = (ev) => setP({ x: Math.max(-sz.w + 120, Math.min(box.width - 120, ev.clientX - box.left - dx)), y: Math.max(30, Math.min(box.height - 130, ev.clientY - box.top - dy)) });
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
    // ridimensiona da un bordo o da un angolo: dir contiene 'l', 'r' e/o 'b'
    const size = (dir) => (e) => {
        e.stopPropagation(); e.preventDefault(); onFront();
        const sx = e.clientX; const sy = e.clientY; const w0 = sz.w; const h0 = sz.h; const x0p = p.x;
        const mv = (ev) => {
            const dx = ev.clientX - sx; const dy = ev.clientY - sy;
            const nw = dir.includes('r') ? Math.max(320, w0 + dx) : dir.includes('l') ? Math.max(320, w0 - dx) : w0;
            const nh = dir.includes('b') ? Math.max(220, h0 + dy) : h0;
            setSz({ w: nw, h: nh });
            if (dir.includes('l')) setP((o) => ({ ...o, x: x0p + (w0 - nw) }));
        };
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
    const style = max ? { left: 0, top: 30, width: '100%', height: 'calc(100% - 30px)', zIndex: z, borderRadius: 0 } : { left: p.x, top: p.y, width: sz.w, height: sz.h, zIndex: z };
    if (min) style.display = 'none';
    return (
        <div ref={ref} className={`dk-w${dark ? ' dark' : ''}${front ? ' front' : ''}${max ? ' max' : ''}`} data-exp={exp ? '1' : undefined} data-cdir={cdir} style={style} role="dialog" aria-label={title} onPointerDown={onFront}>
            <header onPointerDown={down} onDoubleClick={(e) => { if (!e.target.closest('button')) setMax((m) => !m); }}>
                <span className="dk-tl">
                    <button className="dk-tl-b" onClick={onClose} aria-label="Chiudi" title="Chiudi"><Icon name="x" size={9} stroke={2.4} /></button>
                    <button className="dk-tl-b" onClick={onMin} aria-label="Riduci nel dock" title="Riduci nel dock"><Icon name="minus" size={9} stroke={2.4} /></button>
                    <button className="dk-tl-b" onClick={() => setMax((m) => !m)} aria-label={max ? 'Riduci la finestra' : 'Ingrandisci'} title={max ? 'Riduci la finestra' : 'Ingrandisci'}><Icon name="plus" size={9} stroke={2.4} /></button>
                </span>
                <b>{title}</b>{extra}
            </header>
            <div className="dk-w-body">{children}</div>
            {!max && ['r', 'l', 'b', 'br', 'bl'].map((d) => <i key={d} className={`dk-rs dk-rs-${d}`} onPointerDown={size(d)} />)}
        </div>
    );
};

export const Desktop = ({ renderApp, dock, lab, empty, onExample, onOpen, onGo, onRemove, onRestore, renderDoc, calcReq, onSettings, onBack }) => {
    const [sel, setSel] = useState([]); // icone selezionate (anche più d'una: rettangolo di selezione)
    const [q, setQ] = useState('');
    const [now, setNow] = useState(new Date());
    const [pos, setPos] = useState(load);
    const [drag, setDrag] = useState(null); // { id, x, y, over, folder }
    const [cf, setCf] = useState(() => jl(CF, [])); // cartelle create da te: [{ id, name }]
    const [inCf, setInCf] = useState(() => jl(CFF, {})); // file messi in una tua cartella: { 'area:id': idCartella }
    const [newName, setNewName] = useState(null); // finestrella «Nuova cartella»
    const addCf = (name) => { const n = [...cf, { id: `u:${Date.now()}`, name: name.trim() || 'Nuova cartella' }]; setCf(n); js(CF, n); };
    const moveIn = (fileId, folderId) => setInCf((o) => { const n = { ...o, [fileId]: folderId }; js(CFF, n); return n; });
    const isIn = (fid, anc) => { let c = fid; let n = 0; while (c && n++ < 50) { if (c === anc) return true; c = inCf[c]; } return false; }; // fid è anc o sta dentro anc
    const moveOut = (pred) => setInCf((o) => { const n = Object.fromEntries(Object.entries(o).filter(([f, c]) => !pred(f, c))); js(CFF, n); return n; });
    const delCf = (id) => { const n = cf.filter((c) => c.id !== id); setCf(n); js(CF, n); moveOut((f, c) => c === id || f === id); setWins((l) => l.filter((x) => x.id !== `cdir:${id}`)); };
    const [hid, setHid] = useState(loadHid); // file «riposti» in una cartella: non compaiono più sulla scrivania
    const [wins, setWins] = useState([]); // finestre aperte sulla scrivania, l'ultima sta davanti: { id, kind: 'calc'|'doc'|'dir'|'bin', k, docId }
    // accensione: all'ingresso nella Panoramica compare il logo con una barra di avvio, poi la scrivania
    const [boot, setBoot] = useState(0); // 0 acceso, 1 dissolvenza, 2 finito
    useEffect(() => { const a = setTimeout(() => setBoot(1), 1900); const z = setTimeout(() => setBoot(2), 2800); return () => { clearTimeout(a); clearTimeout(z); }; }, []);
    const [ask, setAsk] = useState(false); // conferma di «Svuota il cestino»
    const [trashed, setTrashed] = useState(loadTrash);
    const [binErr, setBinErr] = useState('');
    const saveBin = (next) => { try { localStorage.setItem(TRASH, JSON.stringify(next)); setTrashed(next); return true; } catch (e) { return false; } };
    // nel cestino il file resta recuperabile; se la memoria del browser non basta non lo tolgo dal laboratorio
    const toBin = (it) => { if (saveBin([...trashed, { k: it.k, rec: it.r, at: Date.now() }])) { setBinErr(''); onRemove(it.k, it.r.id); } else setBinErr('Il cestino è pieno: svuotalo e riprova.'); };
    const [uf, setUf] = useState(loadUf); // file tuoi: documenti di testo e immagini
    const upUf = (fn) => setUf((o) => { const n = fn(o); if (!saveUf(n)) setBinErr('La memoria del browser è piena: l’ultima modifica non è salvata.'); return n; });
    const toBinUf = (f) => { if (saveBin([...trashed, { k: '__uf', f, at: Date.now() }])) { setBinErr(''); upUf((o) => o.filter((x) => x.id !== f.id)); moveOut((fid) => fid === `x:${f.id}`); setWins((l) => l.filter((x) => x.id !== `uf:${f.id}`)); } else setBinErr('Il cestino è pieno: svuotalo e riprova.'); };
    const restore = (t) => { if (t.k === '__uf') upUf((o) => [...o, t.f]); else onRestore(t.k, t.rec); saveBin(trashed.filter((x) => x !== t)); };
    const imgIn = useRef(null);
    const dockEl = useRef(null);
    // il dock sta piccolo e si ingrandisce (vera dimensione, non zoom: le icone restano nitide) quando il puntatore gli si avvicina
    useEffect(() => {
        if (coarse()) return undefined;
        const full = { w: 560 }; let on = -1;
        const set = (k) => { if (k === on) return; on = k; if (dockEl.current) { dockEl.current.style.setProperty('--k', String(k)); if (k) full.w = Math.max(full.w, dockEl.current.getBoundingClientRect().width); } };
        set(0);
        // si ingrandisce solo quando il puntatore è sopra il dock (o a pochi pixel), non appena ti avvicini: niente movimento mentre lavori
        const mv = (e) => {
            const d = dockEl.current; if (!d || !d.parentElement) return;
            const sc = d.parentElement.getBoundingClientRect();
            const dy = sc.bottom - e.clientY; const dx = Math.abs(e.clientX - (sc.left + sc.right) / 2);
            set(dy >= -4 && dy <= 78 && dx <= full.w / 2 + 12 ? 1 : 0);
        };
        const out = () => set(0);
        window.addEventListener('pointermove', mv); document.documentElement.addEventListener('mouseleave', out);
        return () => { window.removeEventListener('pointermove', mv); document.documentElement.removeEventListener('mouseleave', out); };
    }, []);
    const [exp, setExp] = useState([]); // file scelti nell'app Esporta: 'area:id' o 'x:id'
    const addExp = (keys) => { setExp((o) => [...new Set([...o, ...keys])]); setWins((l) => (l.some((x) => x.id === 'export') ? l.map((x) => (x.id === 'export' ? { ...x, min: false } : x)) : l)); };
    const overExp = (ev) => [...document.querySelectorAll('.dk-w[data-exp]')].some((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && ev.clientX > b.left && ev.clientX < b.right && ev.clientY > b.top && ev.clientY < b.bottom; });
    // dal Gel: l'immagine con le etichette diventa un file sulla scrivania (se esiste già con quell'id, la aggiorna)
    const deskGel = ({ imgId, rawId, name, src, gel }) => {
        const iid = imgId && uf.some((x) => x.id === imgId) ? imgId : newUfId();
        const rid = rawId && uf.some((x) => x.id === rawId) ? rawId : newUfId();
        // un altro file con lo stesso nome (non i due di questo gel): niente salvataggio
        const same = (x, y) => String(x || '').trim().toLowerCase() === String(y || '').trim().toLowerCase();
        const dup = uf.find((x) => x.id !== iid && x.id !== rid && (same(x.name, name) || same(x.name, `${name}.gelraw`)));
        if (dup) { window.alert(`Sulla scrivania c'è già un file chiamato «${dup.name}». Dai un altro titolo al gel e salva di nuovo.`); return null; }
        const put = (o, f) => (o.some((x) => x.id === f.id) ? o.map((x) => (x.id === f.id ? { ...x, ...f } : x)) : [...o, f]);
        upUf((o) => put(put(o, { id: iid, type: 'img', name, src }), { id: rid, type: 'gelraw', name: `${name}.gelraw`, gel: { ...gel, deskId: iid, rawId: rid } }));
        setBinErr(`Salvati sulla scrivania: «${name}» (immagine) e «${name}.gelraw» (modificabile).`);
        return { imgId: iid, rawId: rid };
    };
    const newDoc = () => { const f = { id: newUfId(), type: 'txt', name: 'Documento senza titolo', body: '', imgs: [] }; upUf((o) => [...o, f]); openWin({ id: `uf:${f.id}`, kind: 'uf', fid: f.id }); };
    const addImgs = async (e) => {
        const files = [...e.target.files]; e.target.value = '';
        for (const file of files) {
            try { const src = await readImage(file); const f = { id: newUfId(), type: 'img', name: file.name.replace(/\.[^.]+$/, '') || 'Immagine', src }; upUf((o) => [...o, f]); } catch (err) { setBinErr('Immagine non leggibile.'); }
        }
    };
    const [H, setH] = useState(560);
    const [W, setW] = useState(900);
    const field = useRef(null); const trash = useRef(null); const moved = useRef(false);
    useEffect(() => { const i = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(i); }, []);
    useEffect(() => { const f = field.current; if (!f) return undefined; const m = () => { setH(f.clientHeight); setW(f.clientWidth); }; m(); const ro = new ResizeObserver(m); ro.observe(f); return () => ro.disconnect(); }, []);
    const recent = useMemo(() => AREAS.flatMap((k) => (lab[k] || []).map((r) => ({ k, r }))).filter(({ k, r }) => !hid.includes(`${k}:${r.id}`)).sort((a, b) => String(b.r.data || b.r.id).localeCompare(String(a.r.data || a.r.id))).slice(0, 10).filter(({ k, r }) => !inCf[`${k}:${r.id}`]), [lab, hid, inCf]); // le 10 più recenti: chi entra in una cartella sparisce, senza far comparire altri al suo posto
    const items = useMemo(() => [{ id: 'f:lab', folder: true, lab: true }, ...cf.filter((c) => !inCf[c.id]).map((c) => ({ id: c.id, folder: true, custom: true, name: c.name })), ...uf.filter((f) => !inCf[`x:${f.id}`]).map((f) => ({ id: `x:${f.id}`, ufile: true, f })), ...recent.map(({ k, r }) => ({ id: `${k}:${r.id}`, k, r }))], [recent, cf, uf, inCf]);
    const rows = Math.max(2, Math.floor((H - 130) / 128));
    // le icone senza posizione propria prendono la prima cella libera (colonne da sinistra), così non finiscono sopra quelle spostate
    const layout = useMemo(() => {
        const used = new Set(items.filter((it) => pos[it.id]).map((it) => `${Math.round((pos[it.id].x - 18) / 118)},${Math.round((pos[it.id].y - 14) / 128)}`));
        const out = {}; let n = 0;
        items.forEach((it) => {
            if (pos[it.id]) { out[it.id] = pos[it.id]; return; }
            let c; let r;
            do { c = Math.floor(n / rows); r = n % rows; n += 1; } while (used.has(`${c},${r}`));
            out[it.id] = { x: 18 + c * 118, y: 14 + r * 128 };
        });
        return out;
    }, [items, pos, rows]);
    const place = (it) => layout[it.id];
    const openWin = (w) => setWins((l) => { const old = l.find((x) => x.id === w.id); return [...l.filter((x) => x.id !== w.id), old ? { ...old, min: false } : { ...w, n: l.length }]; });
    const minWin = (id) => setWins((l) => l.map((x) => (x.id === id ? { ...x, min: true } : x)));
    const frontWin = (id) => setWins((l) => (l[l.length - 1].id === id ? l : [...l.filter((x) => x.id !== id), l.find((x) => x.id === id)]));
    const topId = (() => { const v = wins.filter((x) => !x.min); return v.length ? v[v.length - 1].id : null; })();
    const closeWin = (id) => setWins((l) => l.filter((x) => x.id !== id));
    useEffect(() => { if (calcReq) openWin({ id: 'calc', kind: 'calc' }); }, [calcReq]); // eslint-disable-line react-hooks/exhaustive-deps
    const hits = q.trim().length >= 2 ? searchAll(lab, SECTIONS, q, 16) : null;
    const showDoc = (k, r) => openWin({ id: `doc:${k}:${r.id}`, kind: 'doc', k, docId: r.id });
    const open = (it) => (it.lab ? openWin({ id: 'labdir', kind: 'labdir' }) : it.ufile ? (it.f.type === 'gelraw' ? openWin({ id: `gel:${it.f.id}`, kind: 'gel', fid: it.f.id }) : openWin({ id: `uf:${it.f.id}`, kind: 'uf', fid: it.f.id })) : it.custom ? openWin({ id: `cdir:${it.id}`, kind: 'cdir', cid: it.id }) : it.folder ? openWin({ id: `dir:${it.k}`, kind: 'dir', k: it.k }) : showDoc(it.k, it.r));
    const label = (it) => (it.lab ? 'URBIOS LAB' : it.ufile ? it.f.name || 'Senza nome' : it.custom ? it.name : it.folder ? sectionOf(it.k).label : sectionOf(it.k).title(it.r));

    // cartella tua sotto il puntatore: la finestra aperta in cima (se è una cartella tua) o l'icona sulla scrivania
    const folderAt = (ev, skip = []) => {
        for (const el of document.elementsFromPoint(ev.clientX, ev.clientY)) {
            const w = el.closest && el.closest('.dk-w'); if (w) return w.dataset.cdir || null;
            const f = el.closest && el.closest('[data-folder^="u:"]'); if (f && !skip.includes(f.dataset.folder)) return f.dataset.folder;
        }
        return null;
    };
    // più file nel cestino in un colpo solo (una sola scrittura, così non se ne perde nessuno)
    const binMany = (list) => {
        const add = list.map((x) => (x.ufile ? { k: '__uf', f: x.f, at: Date.now() } : { k: x.k, rec: x.r, at: Date.now() }));
        if (!saveBin([...trashed, ...add])) { setBinErr('Il cestino è pieno: svuotalo e riprova.'); return; }
        setBinErr('');
        list.forEach((x) => { if (!x.ufile) onRemove(x.k, x.r.id); });
        const ids = list.filter((x) => x.ufile).map((x) => x.f.id);
        if (ids.length) { upUf((o) => o.filter((x) => !ids.includes(x.id))); moveOut((fid) => ids.some((i) => fid === `x:${i}`)); setWins((l) => l.filter((x) => !ids.some((i) => x.id === `uf:${i}`))); }
        setSel([]);
    };
    // rettangolo di selezione: si tiene premuto sullo sfondo e si trascina
    const [marq, setMarq] = useState(null);
    const justMarq = useRef(false);
    const startMarq = (e) => {
        if (e.button !== 0 || coarse() || (e.target.closest && e.target.closest('.dk-item, .dk-w, button, input, textarea'))) return;
        const f = field.current; const box = f.getBoundingClientRect(); const sx = e.clientX; const sy = e.clientY;
        const base = e.shiftKey || e.metaKey || e.ctrlKey ? sel : []; let on = false;
        const mv = (ev) => {
            if (!on && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
            on = true; try { window.getSelection().removeAllRanges(); } catch (err) { /* niente */ }
            const l = Math.min(sx, ev.clientX); const t = Math.min(sy, ev.clientY); const r = Math.max(sx, ev.clientX); const b = Math.max(sy, ev.clientY);
            setMarq({ x: l - box.left + f.scrollLeft, y: t - box.top + f.scrollTop, w: r - l, h: b - t });
            const ids = [...f.querySelectorAll('.dk-item.abs')].filter((el) => { const q = el.getBoundingClientRect(); return q.left < r && q.right > l && q.top < b && q.bottom > t; }).map((el) => el.dataset.iid);
            setSel([...new Set([...base, ...ids])]);
        };
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); setMarq(null); if (on) justMarq.current = true; };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
    const down = (e, it, p) => {
        if (e.button !== 0 || coarse()) return; // su touch un tocco apre, senza trascinare
        const box = field.current.getBoundingClientRect(); const dx = e.clientX - box.left - p.x; const dy = e.clientY - box.top - p.y;
        moved.current = false;
        const multi = e.shiftKey || e.metaKey || e.ctrlKey;
        const grp = sel.includes(it.id) && !multi ? items.filter((x) => sel.includes(x.id)) : [it];
        if (!sel.includes(it.id) && !multi) setSel([it.id]);
        const plainGrp = grp.filter((x) => !x.folder); // nel cestino vanno solo i file (le cartelle si eliminano dal menu)
        const dropGrp = grp.filter((x) => !x.folder || x.custom); // in una tua cartella entrano file e tue cartelle
        const fol = (ev) => { if (!dropGrp.length) return null; const f = folderAt(ev, dropGrp.filter((x) => x.custom).map((x) => x.id)); return f && !dropGrp.some((x) => x.custom && isIn(f, x.id)) ? f : null; };
        const over = (ev) => { const t = trash.current && trash.current.getBoundingClientRect(); return (grp.length > 1 ? plainGrp.length > 0 : !it.folder || it.custom) && !!t && ev.clientX > t.left && ev.clientX < t.right && ev.clientY > t.top && ev.clientY < t.bottom; };
        const mv = (ev) => {
            if (!moved.current && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 5) return;
            moved.current = true;
            setGhost(overExp(ev) || document.elementsFromPoint(ev.clientX, ev.clientY).some((el) => el.closest && el.closest('.dk-w')) ? { x: ev.clientX, y: ev.clientY, icon: it.ufile ? (it.f.type === 'txt' ? 'article' : 'image') : it.folder ? 'package' : sectionOf(it.k).icon } : null);
            const nx = Math.max(0, Math.min(box.width - 104, ev.clientX - box.left - dx)); const ny = Math.max(0, Math.min(box.height - 96, ev.clientY - box.top - dy));
            setDrag({ id: it.id, x: nx, y: ny, ddx: nx - p.x, ddy: ny - p.y, group: grp.map((g) => g.id), over: over(ev), folder: fol(ev) });
        };
        const up = (ev) => {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); setGhost(null);
            const toExp = moved.current && overExp(ev);
            if (toExp) {
                const keysOf = (x) => (x.ufile ? [x.id] : x.custom ? Object.entries(inCf).filter(([f, c]) => c === x.id && !f.startsWith('u:')).map(([f]) => f) : x.lab ? AREAS.flatMap((k) => (lab[k] || []).map((r) => `${k}:${r.id}`)) : x.folder ? (lab[x.k] || []).map((r) => `${x.k}:${r.id}`) : [x.id]);
                addExp(grp.flatMap(keysOf)); setDrag(null); return;
            }
            setDrag((d) => {
                if (d && moved.current) {
                    if (over(ev)) {
                        if (grp.length === 1) { if (it.custom) delCf(it.id); else if (it.ufile) toBinUf(it.f); else toBin(it); } else binMany(plainGrp);
                    } else if (fol(ev)) dropGrp.forEach((x) => moveIn(x.id, fol(ev)));
                    else setPos((o) => { const n = { ...o }; grp.forEach((x) => { const q = place(x); n[x.id] = x.id === it.id ? { x: d.x, y: d.y } : { x: Math.max(0, q.x + d.ddx), y: Math.max(0, q.y + d.ddy) }; }); keep(n); return n; });
                }
                return null;
            });
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
    const item = (it, i) => {
        const q = place(it, i); const p = drag && drag.id === it.id ? drag : drag && drag.group && drag.group.includes(it.id) ? { x: q.x + drag.ddx, y: q.y + drag.ddy } : q;
        return (
            <button key={it.id} data-iid={it.id} data-folder={it.custom ? it.id : undefined} className={`dk-item abs${sel.includes(it.id) ? ' on' : ''}${drag && drag.folder && it.folder && drag.folder === it.id ? ' target' : ''}${drag && drag.group && drag.group.includes(it.id) ? ' drag' : ''}`} style={{ left: p.x, top: p.y }}
                onContextMenu={(e) => showCtx(e, itemActs(it))} onPointerDown={(e) => down(e, it, place(it, i))} onClick={(e) => { e.stopPropagation(); if (moved.current) { moved.current = false; return; } if (coarse()) open(it); else if (e.shiftKey || e.metaKey || e.ctrlKey) setSel((o) => (o.includes(it.id) ? o.filter((x) => x !== it.id) : [...o, it.id])); else setSel([it.id]); }}
                onDoubleClick={() => open(it)} onKeyDown={(e) => e.key === 'Enter' && open(it)}>
                {it.custom ? <FolderArt n={Object.values(inCf).filter((c) => c === it.id).length} /> : it.lab ? <FolderArt icon="package" /> : it.folder ? <FolderArt icon={sectionOf(it.k).icon} n={(lab[it.k] || []).length} /> : <FileArt icon={it.ufile ? (it.f.type === 'txt' ? 'article' : 'image') : sectionOf(it.k).icon} />}
                <span className="dk-l">{label(it)}</span>
                {!it.folder && <span className="dk-s">{it.ufile ? (it.f.type === 'img' ? 'Immagine' : it.f.type === 'gelraw' ? 'Gel modificabile' : 'Documento') : sectionOf(it.k).label}</span>}
            </button>
        );
    };
    const [ghost, setGhost] = useState(null);
    const pullOut = (e, k, r, uf, copy, folder) => {
        if (e.button !== 0 || coarse()) return;
        const id = folder ? r.id : uf ? `x:${r.id}` : `${k}:${r.id}`; const icon = folder ? 'package' : uf ? (r.type === 'txt' ? 'article' : 'image') : sectionOf(k).icon; const sx = e.clientX; const sy = e.clientY; let on = false;
        const hit = (ev, sel) => [...document.querySelectorAll(sel)].find((el) => { const b = el.getBoundingClientRect(); return ev.clientX > b.left && ev.clientX < b.right && ev.clientY > b.top && ev.clientY < b.bottom; });
        const mv = (ev) => { if (!on && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return; on = true; moved.current = true; setGhost({ x: ev.clientX, y: ev.clientY, icon }); };
        const up = (ev) => {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); setGhost(null);
            if (!on) return;
            if (overExp(ev)) { addExp([id]); return; }
            const t = trash.current && trash.current.getBoundingClientRect();
            if (t && ev.clientX > t.left && ev.clientX < t.right && ev.clientY > t.top && ev.clientY < t.bottom) { if (folder) return; if (uf) toBinUf(r); else toBin({ id, k, r }); return; }
            const f = folderAt(ev, folder ? [id] : []);
            if (f) { if (!(folder && isIn(f, id))) moveIn(id, f); return; }
            if (!copy && !hit(ev, '.dk-w')) moveOut((fid) => fid === id);
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
    // tasto destro: menu con le azioni del file (Apri, Copia in una tua cartella, Elimina)
    const [ctx, setCtx] = useState(null);
    const showCtx = (e, acts) => { e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY, acts }); };
    const intoActs = (id, verb) => cf.map((c) => ({ label: `${verb} in «${c.name}»`, fn: () => moveIn(id, c.id) }));
    const recActs = (k, r) => [{ label: 'Apri', fn: () => showDoc(k, r) }, ...intoActs(`${k}:${r.id}`, 'Copia'), ...(inCf[`${k}:${r.id}`] ? [{ label: 'Rimetti fuori', fn: () => moveOut((f) => f === `${k}:${r.id}`) }] : []), { label: 'Elimina', fn: () => toBin({ id: `${k}:${r.id}`, k, r }) }];
    const ufActs = (f) => [{ label: 'Apri', fn: () => open({ ufile: true, f }) }, ...intoActs(`x:${f.id}`, 'Sposta'), ...(inCf[`x:${f.id}`] ? [{ label: 'Rimetti fuori', fn: () => moveOut((x) => x === `x:${f.id}`) }] : []), { label: 'Elimina', fn: () => toBinUf(f) }];
    const itemActs = (it) => (it.ufile ? ufActs(it.f) : it.custom ? [{ label: 'Apri', fn: () => open(it) }, ...cf.filter((c) => !isIn(c.id, it.id)).map((c) => ({ label: `Sposta in «${c.name}»`, fn: () => moveIn(it.id, c.id) })), { label: 'Elimina cartella', fn: () => delCf(it.id) }] : it.folder ? [{ label: 'Apri', fn: () => open(it) }] : recActs(it.k, it.r));
    const dockActs = (spec) => [{ label: 'Apri', fn: () => openWin(spec) }, ...(wins.some((x) => x.id === spec.id) ? [{ label: 'Chiudi', fn: () => closeWin(spec.id) }] : [])];
    const deskActs = () => [{ label: 'Nuova cartella', fn: () => setNewName('') }, { label: 'Nuovo documento', fn: newDoc }, { label: 'Importa immagine', fn: () => imgIn.current && imgIn.current.click() }, { label: 'Allinea le icone', fn: align }, { label: 'Disponi le icone', fn: reset }];
    const plain = (k, r, drag, copy) => (
        <button key={`${k}${r.id}`} className="dk-item" onContextMenu={(e) => showCtx(e, recActs(k, r))} onPointerDown={drag ? (e) => pullOut(e, k, r, false, copy) : undefined} onDoubleClick={() => showDoc(k, r)} onClick={() => { if (moved.current) { moved.current = false; return; } coarse() && showDoc(k, r); }} onKeyDown={(e) => e.key === 'Enter' && showDoc(k, r)}>
            <FileArt icon={sectionOf(k).icon} /><span className="dk-l">{sectionOf(k).title(r)}</span><span className="dk-s">{sectionOf(k).label}</span>
        </button>
    );
    const plainUf = (f) => (
        <button key={`x${f.id}`} className="dk-item" onContextMenu={(e) => showCtx(e, ufActs(f))} onPointerDown={(e) => pullOut(e, '', f, true)} onDoubleClick={() => (f.type === 'gelraw' ? openWin({ id: `gel:${f.id}`, kind: 'gel', fid: f.id }) : openWin({ id: `uf:${f.id}`, kind: 'uf', fid: f.id }))}>
            <FileArt icon={f.type === 'txt' ? 'article' : 'image'} /><span className="dk-l">{f.name || 'Senza nome'}</span><span className="dk-s">{f.type === 'img' ? 'Immagine' : f.type === 'gelraw' ? 'Gel modificabile' : 'Documento'}</span>
        </button>
    );
    const [menu, setMenu] = useState(false);
    const [bg, setBgState] = useState(loadBg);
    const [setts, setSetts] = useState(false);
    const setBg = (patch) => setBgState((o) => { const n = { ...o, ...patch }; try { localStorage.setItem(BG, JSON.stringify(n)); } catch (e) { /* resta solo in pagina */ } return n; });
    const dark = bg.tinta === 'scuro';
    // Allinea: ogni icona va nella cella più vicina della griglia, senza sovrapporsi (l'ordine resta quello che hai dato)
    const align = () => {
        const cols = Math.max(1, Math.floor((W - 18) / 118));
        const taken = new Set(); const n = {};
        items.forEach((it, i) => {
            const p = place(it, i);
            const c0 = Math.min(cols - 1, Math.max(0, Math.round((p.x - 18) / 118)));
            const r0 = Math.min(rows - 1, Math.max(0, Math.round((p.y - 14) / 128)));
            const cells = [];
            for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) cells.push([c, r]);
            cells.sort((a, b) => Math.hypot(a[0] - c0, a[1] - r0) - Math.hypot(b[0] - c0, b[1] - r0));
            const [c, r] = cells.find(([cc, rr]) => !taken.has(`${cc},${rr}`)) || [c0, r0];
            taken.add(`${c},${r}`);
            n[it.id] = { x: 18 + c * 118, y: 14 + r * 128 };
        });
        setPos(n); keep(n);
    };
    const reset = () => { setPos({}); keep({}); setHid([]); try { localStorage.removeItem(HID); } catch (e) { /* niente da fare */ } setMenu(false); };
    return (
        <div className="m-screen dk" onClick={() => { if (justMarq.current) { justMarq.current = false; return; } setSel([]); setMenu(false); setSetts(false); }}>
            {dock}
            <div className={`dk-screen${dark ? ' is-dark' : ''}`} style={{ background: TINTS[bg.tinta][1] }}>
                {boot < 2 && (
                    <div className={`dk-boot${boot === 1 ? ' out' : ''}`} onClick={(e) => { e.stopPropagation(); setBoot(2); }} aria-hidden="true">
                        <UrbiosLogo size={170} />
                        <i><b /></i>
                    </div>
                )}
                <header className="dk-bar">
                    <button className="dk-logo" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} aria-label="Menu URBIOS" aria-expanded={menu}><UrbiosLogo size={17} /></button>
                    <b>Laboratorio</b>
                    <button onClick={reset}>Disponi le icone</button>
                    <button onClick={align}>Allinea</button>
                    <button onClick={() => setNewName('')}>Nuova cartella</button>
                    <button onClick={newDoc}>Nuovo documento</button>
                    <button onClick={() => imgIn.current && imgIn.current.click()}>Importa immagine</button>
                    <input ref={imgIn} type="file" accept="image/*" multiple hidden onChange={addImgs} />
                    <button className="dk-gear" onClick={(e) => { e.stopPropagation(); setSetts((v) => !v); }} aria-label="Impostazioni dello sfondo" aria-expanded={setts} title="Sfondo"><Icon name="gear" size={16} /></button>
                    <label className="dk-find"><Icon name="search" size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca" aria-label="Cerca in tutto il laboratorio" /></label>
                    <span className="dk-time">{now.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}, {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                    {setts && (
                        <div className="dk-menu dk-bgset" onClick={(e) => e.stopPropagation()}>
                            <h4>Sfondo</h4>
                            <div className="dk-chips">{Object.entries(TINTS).map(([k, [l]]) => <button key={k} className={bg.tinta === k ? 'on' : ''} onClick={() => setBg({ tinta: k })}>{l}</button>)}</div>
                            <label className="dk-chk"><input type="checkbox" checked={bg.logo} onChange={(e) => setBg({ logo: e.target.checked })} /> Logo URBIOS</label>
                            {bg.logo && <label className="dk-rng">Intensità del logo<input type="range" min="2" max="30" value={bg.forza} onChange={(e) => setBg({ forza: +e.target.value })} /></label>}
                        </div>
                    )}
                    {menu && (
                        <div className="dk-menu" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setMenu(false); onSettings && onSettings(); }}>Impostazioni</button>
                            <button onClick={() => { setMenu(false); onBack && onBack(); }}>Cambia area</button>
                        </div>
                    )}
                </header>
                <div className="dk-field" ref={field} onPointerDown={startMarq} onMouseDown={(e) => { if (!(e.target.closest && e.target.closest('.dk-w, input, textarea'))) e.preventDefault(); }} onContextMenu={(e) => showCtx(e, deskActs())}>
                    {marq && <div className="dk-marq" style={{ left: marq.x, top: marq.y, width: marq.w, height: marq.h }} />}
                    {bg.logo && <UrbiosLogo size={380} className="dk-wall" style={{ opacity: bg.forza / 100 }} />}
                    {hits ? (
                        <div className="dk-grid dk-hits">{hits.length ? hits.map(({ key, rec }) => plain(key, rec)) : <p className="m-none">Nessun risultato</p>}</div>
                    ) : (
                        <>
                            {items.map(item)}
                            {empty && <button className="m-link dk-ex" onClick={onExample}>Carica dati di esempio</button>}
                        </>
                    )}
                </div>
                <nav ref={dockEl} className="dk-dock" aria-label="App" style={{ '--k': coarse() ? 1 : 0 }}>
                    {AREAS.map((k) => <button onContextMenu={(e) => showCtx(e, dockActs({ id: `app:${k}`, kind: 'app', k }))} key={k} className={`dk-app${wins.some((x) => x.id === `app:${k}`) ? ' run' : ''}`} onClick={() => openWin({ id: `app:${k}`, kind: 'app', k })} aria-label={sectionOf(k).label} data-tip={sectionOf(k).label}><Icon name={sectionOf(k).icon} size={36} stroke={1.5} /></button>)}
                    <button onContextMenu={(e) => showCtx(e, dockActs({ id: 'calc', kind: 'calc' }))} className={`dk-app${wins.some((x) => x.id === 'calc') ? ' run' : ''}`} onClick={() => openWin({ id: 'calc', kind: 'calc' })} aria-label="Calcolatrice" data-tip="Calcolatrice"><Icon name="calc" size={36} stroke={1.6} /></button>
                    {wins.filter((x) => x.kind === 'doc' || x.kind === 'dir' || x.kind === 'cdir' || x.kind === 'uf').map((x) => {
                        const ufx = x.kind === 'uf' ? uf.find((q) => q.id === x.fid) : null;
                        if (x.kind === 'uf' && !ufx) return null;
                        const ic = x.kind === 'uf' ? (ufx.type === 'txt' ? 'article' : 'image') : x.kind === 'doc' ? sectionOf(x.k).icon : x.kind === 'dir' ? sectionOf(x.k).icon : 'package';
                        const nm = x.kind === 'uf' ? ufx.name || 'Senza nome' : x.kind === 'doc' ? (() => { const r = (lab[x.k] || []).find((q) => q.id === x.docId); return r ? sectionOf(x.k).title(r) : 'File'; })() : x.kind === 'dir' ? sectionOf(x.k).label : ((cf.find((c) => c.id === x.cid) || {}).name || 'Cartella');
                        return <button key={x.id} onContextMenu={(e) => showCtx(e, dockActs(x))} className={`dk-app run${x.min ? ' mini' : ''}`} onClick={() => openWin(x)} aria-label={nm} data-tip={nm}><Icon name={ic} size={30} stroke={1.5} /></button>;
                    })}
                    <button onContextMenu={(e) => showCtx(e, dockActs({ id: 'notes', kind: 'notes' }))} className={`dk-app${wins.some((x) => x.id === 'notes') ? ' run' : ''}`} onClick={() => openWin({ id: 'notes', kind: 'notes' })} aria-label="Appunti" data-tip="Appunti"><Icon name="pen" size={34} stroke={1.6} /></button>
                    <button onContextMenu={(e) => showCtx(e, dockActs({ id: 'gel', kind: 'gel' }))} className={`dk-app${wins.some((x) => x.id === 'gel') ? ' run' : ''}`} onClick={() => openWin({ id: 'gel', kind: 'gel' })} aria-label="Gel" data-tip="Gel"><Icon name="gel" size={34} stroke={1.6} /></button>
                    <button onContextMenu={(e) => showCtx(e, dockActs({ id: 'export', kind: 'export' }))} className={`dk-app${wins.some((x) => x.id === 'export') ? ' run' : ''}`} onClick={() => openWin({ id: 'export', kind: 'export' })} aria-label="Esporta" data-tip="Esporta"><Icon name="download" size={34} stroke={1.6} /></button>
                    <i className="dk-sep" />
                    <button ref={trash} onContextMenu={(e) => showCtx(e, [{ label: 'Apri', fn: () => openWin({ id: 'bin', kind: 'bin' }) }, ...(trashed.length ? [{ label: 'Svuota il cestino', fn: () => setAsk(true) }] : [])])} className={`dk-app dk-trash${drag && drag.over ? ' over' : ''}${trashed.length ? ' full' : ''}`} onClick={() => openWin({ id: 'bin', kind: 'bin' })} aria-label="Cestino" data-tip={trashed.length ? `Cestino, ${trashed.length}` : 'Cestino'}><Icon name="trash" size={24} stroke={1.6} />{trashed.length > 0 && <b>{trashed.length}</b>}</button>
                </nav>
            {ctx && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onPointerDown={() => setCtx(null)} onContextMenu={(e) => { e.preventDefault(); setCtx(null); }} />
                    <div className="dk-menu" role="menu" style={{ position: 'fixed', left: Math.max(8, Math.min(ctx.x, window.innerWidth - 240)), top: Math.max(8, Math.min(ctx.y, window.innerHeight - ctx.acts.length * 34 - 20)), zIndex: 9999 }}>
                        {ctx.acts.map((a) => <button key={a.label} role="menuitem" onClick={() => { setCtx(null); a.fn(); }}>{a.label}</button>)}
                    </div>
                </>
            )}
            {ghost && <div className="dk-ghost" style={{ left: ghost.x, top: ghost.y }}><FileArt icon={ghost.icon} /></div>}
            {wins.map((w, i) => {
                const z = 25 + i; const at = (n) => 44 + (n % 6) * 26;
                const common = { z, min: w.min, front: w.id === topId, onMin: () => minWin(w.id), onFront: () => frontWin(w.id), onClose: () => closeWin(w.id) };
                if (w.kind === 'calc') return <DragWin key={w.id} {...common} title="Calcolatrice" dark x0={Math.max(20, W - 430)} y0={44} w={390} h={Math.min(660, H + 6)}><Calculator /></DragWin>;
                if (w.kind === 'export') return <DragWin key={w.id} {...common} exp title="Esporta" x0={Math.max(20, (W - 700) / 2) + 40} y0={44 + (w.n % 4) * 24} w={Math.min(700, W - 40)} h={Math.max(380, Math.min(470, H - 130))}><Esporta lab={lab} uf={uf} keys={exp} onKeys={setExp} /></DragWin>;
                if (w.kind === 'gel') return <DragWin key={w.id} {...common} title="Gel" x0={Math.max(10, (W - 980) / 2)} y0={40} w={Math.min(980, W - 20)} h={Math.max(420, H - 100)}><GelApp key={w.id} initial={w.fid ? (uf.find((q) => q.id === w.fid) || {}).gel : undefined} onDesk={deskGel} onDone={common.onClose} files={uf} /></DragWin>;
                if (w.kind === 'notes') return <DragWin key={w.id} {...common} title="Appunti" x0={Math.max(20, (W - 760) / 2)} y0={44 + (w.n % 4) * 24} w={Math.min(760, W - 40)} h={Math.max(380, H - 130)}><Appunti onSaveAs={({ name, body, imgs }) => { upUf((o) => [...o, { id: newUfId(), type: 'txt', name, body, imgs }]); setBinErr(`Salvato sulla scrivania come «${name}».`); }} /></DragWin>;
                if (w.kind === 'app') return <DragWin key={w.id} {...common} title={sectionOf(w.k).label} x0={60 + at(w.n)} y0={44 + (w.n % 4) * 24} w={Math.min(640, W - 40)} h={Math.max(360, H - 150 - (w.n % 4) * 24)}>{renderApp(w.k, () => closeWin(w.id))}</DragWin>;
                if (w.kind === 'cdir') {
                    const c = cf.find((x) => x.id === w.cid);
                    if (!c) return null;
                    const files = AREAS.flatMap((k) => (lab[k] || []).filter((r) => inCf[`${k}:${r.id}`] === c.id).map((r) => ({ k, r })));
                    const ufs = uf.filter((f) => inCf[`x:${f.id}`] === c.id);
                    const subs = cf.filter((x) => inCf[x.id] === c.id);
                    return (
                        <DragWin key={w.id} {...common} cdir={c.id} title={c.name} x0={90 + at(w.n)} y0={at(w.n)} w={Math.min(540, W - 40)} h={Math.min(380, H)}
                            extra={<button className="m-pillbtn light" disabled={!files.length && !ufs.length && !subs.length} onClick={() => moveOut((f, id) => id === c.id)}>Rimetti fuori tutto</button>}>
                            <div className="dk-grid dk-w-grid">{files.length || ufs.length || subs.length ? <>{subs.map((x) => (
                                <button key={x.id} data-folder={x.id} className="dk-item" onContextMenu={(e) => showCtx(e, [{ label: 'Apri', fn: () => openWin({ id: `cdir:${x.id}`, kind: 'cdir', cid: x.id }) }, { label: 'Rimetti fuori', fn: () => moveOut((f) => f === x.id) }, { label: 'Elimina cartella', fn: () => delCf(x.id) }])} onPointerDown={(e) => pullOut(e, '', x, false, false, true)} onDoubleClick={() => openWin({ id: `cdir:${x.id}`, kind: 'cdir', cid: x.id })}>
                                    <FolderArt n={Object.values(inCf).filter((q) => q === x.id).length} /><span className="dk-l">{x.name}</span>
                                </button>
                            ))}{files.map(({ k, r }) => plain(k, r, true))}{ufs.map(plainUf)}</> : <p className="m-none">La cartella è vuota. Trascina qui i file dalla scrivania.</p>}</div>
                        </DragWin>
                    );
                }
                if (w.kind === 'dir') {
                    const list = lab[w.k] || [];
                    return (
                        <DragWin key={w.id} {...common} title={sectionOf(w.k).label} x0={90 + at(w.n)} y0={at(w.n)} w={Math.min(580, W - 40)} h={Math.min(400, H)}
                            extra={<button className="m-pillbtn light" onClick={() => { closeWin(w.id); onGo(w.k); }}>Apri l’area</button>}>
                            <div className="dk-grid dk-w-grid">{list.length ? list.map((r) => plain(w.k, r, true, true)) : <p className="m-none">La cartella è vuota</p>}</div>
                        </DragWin>
                    );
                }
                if (w.kind === 'labdir') {
                    return (
                        <DragWin key={w.id} {...common} title="URBIOS LAB" x0={90 + at(w.n)} y0={at(w.n)} w={Math.min(560, W - 40)} h={Math.min(360, H)}>
                            <div className="dk-grid dk-w-grid">{AREAS.map((k) => (
                                <button key={k} className="dk-item" onContextMenu={(e) => showCtx(e, [{ label: 'Apri', fn: () => openWin({ id: `dir:${k}`, kind: 'dir', k }) }])} onDoubleClick={() => openWin({ id: `dir:${k}`, kind: 'dir', k })} onClick={() => coarse() && openWin({ id: `dir:${k}`, kind: 'dir', k })} onKeyDown={(e) => e.key === 'Enter' && openWin({ id: `dir:${k}`, kind: 'dir', k })}>
                                    <FolderArt icon={sectionOf(k).icon} n={(lab[k] || []).length} /><span className="dk-l">{sectionOf(k).label}</span>
                                </button>
                            ))}</div>
                        </DragWin>
                    );
                }
                if (w.kind === 'bin') {
                    return (
                        <DragWin key={w.id} {...common} title="Cestino" x0={Math.max(20, W - 560)} y0={90 + at(w.n)} w={Math.min(520, W - 40)} h={Math.min(360, H)}
                            extra={<button className="m-pillbtn" disabled={!trashed.length} onClick={() => setAsk(true)}>Svuota il cestino</button>}>
                            <div className="dk-grid dk-w-grid">{trashed.length ? trashed.map((t, j) => (
                                <button key={j} className="dk-item" onContextMenu={(e) => showCtx(e, [{ label: 'Rimetti nel laboratorio', fn: () => restore(t) }, { label: 'Elimina per sempre', fn: () => saveBin(trashed.filter((x) => x !== t)) }])} onClick={() => restore(t)} title="Rimetti nel laboratorio">
                                    <FileArt icon={t.k === '__uf' ? (t.f.type === 'txt' ? 'article' : 'image') : sectionOf(t.k).icon} /><span className="dk-l">{t.k === '__uf' ? t.f.name || 'Senza nome' : sectionOf(t.k).title(t.rec)}</span><span className="dk-s">Tocca per ripristinare</span>
                                </button>
                            )) : <p className="m-none">Il cestino è vuoto. Trascina qui i file per eliminarli.</p>}</div>
                        </DragWin>
                    );
                }
                if (w.kind === 'uf') {
                    const f = uf.find((x) => x.id === w.fid);
                    if (!f) return null;
                    return (
                        <DragWin key={w.id} {...common} title={f.name || 'Senza nome'} x0={Math.max(20, (W - 760) / 2) + at(w.n)} y0={44 + (w.n % 4) * 24} w={Math.min(760, W - 40)} h={Math.max(380, H - 130 - (w.n % 4) * 24)}>
                            {f.type === 'img' ? <ImageFile f={f} onChange={(p) => upUf((o) => o.map((x) => (x.id === f.id ? { ...x, ...p } : x)))} /> : <TextFile f={f} onError={setBinErr} onChange={(p) => upUf((o) => o.map((x) => (x.id === f.id ? { ...x, ...p } : x)))} />}
                        </DragWin>
                    );
                }
                const rec = (lab[w.k] || []).find((r) => r.id === w.docId);
                if (!rec) return null;
                return (
                    <DragWin key={w.id} {...common} title={sectionOf(w.k).title(rec)} x0={Math.max(20, (W - 820) / 2) + at(w.n)} y0={44 + (w.n % 4) * 24} w={Math.min(820, W - 40)} h={Math.max(380, H - 130 - (w.n % 4) * 24)}
                        extra={<button className="m-pillbtn" onClick={() => { closeWin(w.id); onOpen(w.k, w.docId); }}><Icon name="lanes" size={16} /> Apri nella sezione</button>}>
                        {renderDoc(w.k, rec, () => closeWin(w.id))}
                    </DragWin>
                );
            })}
            {binErr && <div className="dk-toast" role="alert">{binErr}<button onClick={() => setBinErr('')} aria-label="Chiudi"><Icon name="x" size={14} /></button></div>}
            {newName !== null && (
                <div className="dk-win-back" style={{ zIndex: 50 }} onClick={() => setNewName(null)}>
                    <form className="dk-ask" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); addCf(newName); setNewName(null); }}>
                        <h3>Nuova cartella</h3>
                        <input autoFocus className="dk-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome della cartella" aria-label="Nome della cartella" />
                        <div><button type="button" className="m-pillbtn light" onClick={() => setNewName(null)}>Annulla</button><button type="submit" className="m-pillbtn">Crea</button></div>
                    </form>
                </div>
            )}
            {ask && (
                <div className="dk-win-back" style={{ zIndex: 50 }} onClick={() => setAsk(false)}>
                    <div className="dk-ask" role="alertdialog" onClick={(e) => e.stopPropagation()}>
                        <h3>Svuotare il cestino?</h3>
                        <p>{trashed.length === 1 ? 'Il file nel cestino verrà' : `I ${trashed.length} file nel cestino verranno`} eliminati per sempre. Non si può annullare.</p>
                        <div><button className="m-pillbtn light" onClick={() => setAsk(false)}>Annulla</button><button className="m-pillbtn" onClick={() => { saveBin([]); setAsk(false); }}>Svuota</button></div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
