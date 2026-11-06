import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './ui/icons';
import { GEL_TINTS, curveLut, gelPng, zoneDef, LADDERS, defaultProc, gelLayout, gelStyle, gelSvg, laneTop, processGel } from './figures';

// Box di lavoro del gel: un unico spazio. A sinistra gli strumenti (icone), al centro il gel su cui si clicca e si trascina,
// a destra un pannello a gruppi comprimibili con i soli valori che non si possono regolare sul gel.
// La foto lavorata (g.img) si rifà da sola a ogni modifica; l'originale resta in g.src.
const STEPS = [
    { k: 'foto', t: 'Foto', h: 'Carica la foto del gel e raddrizzala. Regola luminosità e contrasto se serve.' },
    { k: 'zone', t: 'Zone colore', h: 'Disegna zone di qualsiasi forma (rettangolo, ellisse, a mano libera) e regola i colori di ognuna.' },
    { k: 'ritaglio', t: 'Ritaglia', h: 'Trascina i bordi del riquadro per tenere solo la parte che ti serve.' },
    { k: 'tagli', t: 'Parti', h: 'Facoltativo: taglia il gel in parti (es. per togliere corsie). Clicca sul gel dove tagliare.' },
    { k: 'corsie', t: 'Corsie', h: 'Trascina i pallini neri sopra ogni pozzetto. I quadratini agli angoli fissano la prima e l\'ultima corsia.' },
    { k: 'marker', t: 'Marcatori', h: 'Clicca sul gel all\'altezza di ogni banda del marcatore, poi scrivi il peso. Oppure scegli una scala pronta.' },
    { k: 'bande', t: 'Bande', h: 'Clicca sulla banda da indicare e scrivi il nome. Trascina il pallino per spostarla.' },
    { k: 'stile', t: 'Aspetto', h: 'Colori e dimensione dei testi.' },
    { k: 'esporta', t: 'Esporta', h: 'Aggiungi una didascalia e salva il gel come immagine PNG ad alta risoluzione.' },
];
const DOCK_A = [['curve', 'Istogramma e curva', 'ruler'], ['foto', 'Immagine', 'image'], ['zone', 'Zone colore', 'contrast'], ['ritaglio', 'Ritaglio', 'crop'], ['tagli', 'Parti', 'cut']];
const DOCK_B = [['corsie', 'Corsie', 'lanes'], ['marker', 'Marcatori', 'ruler'], ['bande', 'Bande', 'arrow'], ['stile', 'Aspetto', 'text'], ['esporta', 'Didascalia ed esporta', 'image']];
const SHORT = { curve: 'Curva', foto: 'Immagine', zone: 'Zone', ritaglio: 'Ritaglia', tagli: 'Parti', corsie: 'Corsie', marker: 'Misure', bande: 'Bande', stile: 'Aspetto', esporta: 'Esporta' };
const COLS = [['curve', 'ritaglio', 'esporta'], ['foto'], ['zone', 'tagli', 'marker', 'bande'], ['corsie', 'stile']];
const GROUPS = [
    { k: 'img', t: 'Immagine', ic: 'image', first: 'foto', cols: [['curve', 'ritaglio', 'tagli'], ['foto', 'zone']] },
    { k: 'ann', t: 'Annotazioni', ic: 'lanes', first: 'corsie', cols: [['corsie', 'esporta'], ['marker', 'bande', 'stile']] },
];
const WIDE_COLS = [['curve'], ['foto', 'zone'], ['ritaglio', 'tagli'], ['corsie'], ['marker'], ['bande'], ['stile', 'esporta']];
const WIDE_HEADS = [['Immagine', 3], ['Annotazioni', 3], ['Aspetto ed esporta', 1]];
const SECS = [...DOCK_A, ...DOCK_B];
const Sec = ({ title, icon, open, onToggle, children }) => (
    <section className={`gs-sec${open ? ' open' : ''}`}>
        <button type="button" className="gs-sec-h" onClick={onToggle} aria-expanded={open}><Icon name={icon} size={16} /><span>{title}</span><Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} /></button>
        {open && <div className="gs-sec-b">{children}</div>}
    </section>
);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

// regolatore a pillola: cerchio − · numero scrivibile · cerchio + (tieni premuto per ripetere; frecce su/giù; ↺ ripristina)
const niceStep = (range, step) => { const raw = range / 40; const p = 10 ** Math.floor(Math.log10(raw)); const f = raw / p; const n = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; return Math.max(step, n); };
const Rng = ({ label, value, min = 0, max = 100, step = 1, onChange, unit = '', def }) => {
    const d = def !== undefined ? def : (min < 0 ? 0 : min);
    const v = Number(value || 0);
    const bs = niceStep(max - min, step);
    const [draft, setDraft] = useState(null);
    const fix = (x) => +clamp(Math.round(x / step) * step, min, max).toFixed(2);
    const commit = (txt) => { const x = parseFloat(String(txt).replace(',', '.')); if (Number.isFinite(x)) onChange(fix(x)); setDraft(null); };
    const cur = useRef(v); cur.current = v;
    const hold = useRef(null);
    const stop = () => { clearTimeout(hold.current); clearInterval(hold.current); };
    const press = (dir) => (e) => {
        e.preventDefault(); stop();
        const go = () => { const nv = fix(cur.current + dir * bs); cur.current = nv; onChange(nv); };
        go();
        hold.current = setTimeout(() => { hold.current = setInterval(go, 70); }, 380);
        window.addEventListener('pointerup', stop, { once: true });
    };
    return (
        <div className="gs-rng">
            <span className="gs-rng-l">{label}</span>
            <span className="gs-pill">
                <button type="button" className="gs-circ" title="Diminuisci" aria-label={`${label}: diminuisci`} onPointerDown={press(-1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(fix(v - bs)); }}>−</button>
                <input className="gs-num" inputMode="decimal" aria-label={`${label}: valore`} value={draft === null ? `${+v.toFixed(1)}${unit}` : draft}
                    onFocus={(e) => { setDraft(String(+v.toFixed(1))); e.target.select(); }} onChange={(e) => setDraft(e.target.value)} onBlur={(e) => commit(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                        else if (e.key === 'ArrowUp') { e.preventDefault(); onChange(fix(v + step)); setDraft(null); }
                        else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(fix(v - step)); setDraft(null); }
                    }} />
                <button type="button" className="gs-circ" title="Aumenta" aria-label={`${label}: aumenta`} onPointerDown={press(1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(fix(v + bs)); }}>+</button>
            </span>
            <button type="button" className="gs-mini" title="Ripristina" aria-label={`${label}: ripristina`} disabled={v === d} onClick={() => onChange(d)}><Icon name="undo" size={13} /></button>
        </div>
    );
};

const CURVE_PRESETS = [['Lineare', null], ['Ombre +', [[0, 0], [60, 95], [255, 255]]], ['Mezzi +', [[0, 0], [128, 152], [255, 255]]], ['Luci −', [[0, 0], [190, 165], [255, 255]]], ['Contrasto', [[0, 0], [64, 46], [192, 210], [255, 255]]]];

// istogramma + curva dei toni: aggiungi punti sulla curva (clic) e trascinali per alzare o abbassare solo certe regioni di grigi;
// doppio clic su un punto lo toglie; sotto, punto nero e bianco
const Histogram = ({ gel, proc, onLevels }) => {
    const cv = useRef(null); const box = useRef(null);
    const [sel, setSel] = useState(-1); const binsRef = useRef(null);
    const src = gel.src || gel.img;
    const key = JSON.stringify({ ...proc, lo: 0, hi: 255, curve: null }) + (src || '').length;
    useEffect(() => {
        if (!src) return undefined;
        let dead = false;
        const t = setTimeout(async () => {
            const r = await processGel(src, { ...proc, lo: 0, hi: 255, curve: null }, false, 300);
            const im = new Image();
            im.onload = () => {
                if (dead || !cv.current) return;
                const k = Math.min(1, 300 / Math.max(im.width, im.height));
                const tc = document.createElement('canvas'); tc.width = Math.max(1, Math.round(im.width * k)); tc.height = Math.max(1, Math.round(im.height * k));
                const x = tc.getContext('2d'); x.drawImage(im, 0, 0, tc.width, tc.height);
                const d = x.getImageData(0, 0, tc.width, tc.height).data; const bins = new Array(64).fill(0);
                for (let i = 0; i < d.length; i += 4) bins[Math.min(63, ((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 4) | 0)]++;
                binsRef.current = bins;
                const mx = Math.max(...bins.map((v) => Math.sqrt(v)));
                const c = cv.current; const g = c.getContext('2d'); const W = c.width; const H = c.height;
                g.clearRect(0, 0, W, H); g.fillStyle = '#C9C9CF';
                bins.forEach((v, i) => { const h = (Math.sqrt(v) / mx) * (H - 2); g.fillRect((i * W) / 64, H - h, W / 64 - 1, h); });
            };
            im.src = r.img;
        }, 200);
        return () => { dead = true; clearTimeout(t); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    const lo = proc.lo || 0; const hi = proc.hi === undefined ? 255 : proc.hi;
    const pts = proc.curve && proc.curve.length ? proc.curve : null;
    const lut = curveLut(pts);
    const path = Array.from({ length: 64 }, (_, i) => { const x = Math.round((i * 255) / 63); return `${i ? 'L' : 'M'}${x},${255 - lut[x]}`; }).join(' ');
    const setPts = (next) => onLevels({ curve: next });
    const local = (ev) => { const rc = box.current.getBoundingClientRect(); return [clamp(((ev.clientX - rc.left) / rc.width) * 255, 0, 255), clamp(255 - ((ev.clientY - rc.top) / rc.height) * 255, 0, 255)]; };
    const track = (move) => { const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }; window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); };
    const dragPoint = (list, i) => (e) => {
        e.preventDefault(); e.stopPropagation(); setSel(i);
        const last = list.length - 1;
        track((ev) => {
            const [x, y] = local(ev);
            const nx = i === 0 ? 0 : i === last ? 255 : clamp(x, list[i - 1][0] + 3, list[i + 1][0] - 3);
            setPts(list.map((q, k) => (k === i ? [Math.round(nx), Math.round(y)] : q)));
        });
    };
    const addPoint = (e) => {
        e.preventDefault();
        const base = pts || [[0, 0], [255, 255]];
        const [x] = local(e); const nx = Math.round(x);
        if (base.some((q) => Math.abs(q[0] - nx) < 8)) return;
        const y = Math.round(lut[nx]);
        const list = [...base, [nx, y]].sort((a, b) => a[0] - b[0]);
        setPts(list); const i = list.findIndex((q) => q[0] === nx); setSel(i);
        dragPoint(list, i)(e);
    };
    const list = pts || [[0, 0], [255, 255]];
    const dragLv = (which) => (e) => {
        e.preventDefault(); e.stopPropagation();
        const rc = box.current.getBoundingClientRect();
        track((ev) => { const v = Math.round(clamp(((ev.clientX - rc.left) / rc.width) * 255, 0, 255)); if (which === 'lo') onLevels({ lo: clamp(v, 0, hi - 10) }); else onLevels({ hi: clamp(v, lo + 10, 255) }); });
    };
    const movePt = (i, x, y) => { const last = list.length - 1; const nx = i === 0 ? 0 : i === last ? 255 : x; setPts(list.map((q, k) => (k === i ? [Math.round(nx), Math.round(clamp(y, 0, 255))] : q))); };
    const setRegion = (x, d) => {
        const y = Math.round(clamp(x + d, 0, 255));
        const keep = list.filter((q) => q[0] === 0 || q[0] === 255 || Math.abs(q[0] - x) >= 24);
        const next = [...keep, [x, y]].sort((a, b) => a[0] - b[0]);
        setPts(next); setSel(next.findIndex((q) => q[0] === x));
    };
    const autoLv = () => {
        const b = binsRef.current; if (!b) return;
        const tot = b.reduce((a, v) => a + v, 0); let c = 0; let a = 0; let z = 63;
        for (let i = 0; i < 64; i++) { c += b[i]; if (c > tot * 0.005) { a = i; break; } }
        c = 0; for (let i = 63; i >= 0; i--) { c += b[i]; if (c > tot * 0.005) { z = i; break; } }
        onLevels({ lo: Math.min(a * 4, 240), hi: Math.max(z * 4 + 3, a * 4 + 20 > 255 ? 255 : a * 4 + 20) });
    };
    const P = sel >= 0 && list[sel];
    return (
        <div className="gs-hist">
            <div className="gs-hist-box" ref={box} onPointerDown={addPoint}>
                <canvas ref={cv} width={256} height={110} aria-label="Istogramma" />
                <svg viewBox="0 0 255 255" preserveAspectRatio="none">
                    <line x1="0" y1="255" x2="255" y2="0" className="gs-diag" />
                    <path d={path} className="gs-curve" />
                </svg>
                {list.map((q, i) => <i key={i} className={`gs-cp${sel === i ? ' on' : ''}`} style={{ left: `${(q[0] / 255) * 100}%`, top: `${((255 - q[1]) / 255) * 100}%` }} title="Trascina, doppio clic per togliere"
                    onPointerDown={dragPoint(list, i)} onDoubleClick={(e) => { e.stopPropagation(); if (pts && i > 0 && i < list.length - 1) { setPts(list.filter((_, k) => k !== i)); setSel(-1); } }} />)}
            </div>
            <div className="gs-lvstrip" ref={null}>
                <i className="gs-lv lo" style={{ left: `${(lo / 255) * 100}%` }} title="Punto nero" onPointerDown={dragLv('lo')} onDoubleClick={() => onLevels({ lo: 0 })} />
                <i className="gs-lv hi" style={{ left: `${(hi / 255) * 100}%` }} title="Punto bianco" onPointerDown={dragLv('hi')} onDoubleClick={() => onLevels({ hi: 255 })} />
            </div>
            <div className="gs-hist-info"><span>{P ? `punto ${sel + 1} di ${list.length}` : 'clic sulla curva = nuovo punto'}</span></div>
            <Rng label="Nero" value={lo} min={0} max={hi - 10} step={1} def={0} onChange={(v) => onLevels({ lo: clamp(v, 0, hi - 10) })} />
            <Rng label="Bianco" value={hi} min={lo + 10} max={255} step={1} def={255} onChange={(v) => onLevels({ hi: clamp(v, lo + 10, 255) })} />
            {[['Ombre', 64], ['Mezzi', 128], ['Luci', 192]].map(([l, x]) => <Rng key={l} label={l} value={Math.round(lut[x] - x)} min={-x} max={255 - x} step={1} def={0} onChange={(v) => setRegion(x, v)} />)}
            {P && <><Rng label="Punto X" value={P[0]} min={sel === 0 ? 0 : list[sel - 1][0] + 3} max={sel === list.length - 1 ? 255 : list[sel + 1][0] - 3} step={1} def={P[0]} onChange={(v) => movePt(sel, v, P[1])} />
                <Rng label="Punto Y" value={P[1]} min={0} max={255} step={1} def={P[1]} onChange={(v) => movePt(sel, P[0], v)} /></>}
            <div className="gs-btns">
                <Btn icon="ruler" label="Livelli automatici: imposta nero e bianco sui limiti dell'istogramma" onClick={autoLv}>Auto</Btn>
                <Btn icon="arrow" label="Inverti la curva" onClick={() => setPts(list.map(([x, y]) => [x, 255 - y]).sort((a, b) => a[0] - b[0]))}>Inverti curva</Btn>
                <Btn icon="x" label="Togli il punto selezionato" disabled={!(pts && sel > 0 && sel < list.length - 1)} onClick={() => { setPts(list.filter((_, k) => k !== sel)); setSel(-1); }}>Togli punto</Btn>
            </div>
            <div className="gs-btns four">{CURVE_PRESETS.map(([l, c]) => <Btn key={l} label={`Curva: ${l}`} onClick={() => { setPts(c); setSel(-1); }}>{l}</Btn>)}</div>
            <div className="gs-btns"><Btn icon="undo" label="Ripristina istogramma: curva, punto nero e punto bianco" disabled={!pts && lo === 0 && hi === 255} onClick={() => { setSel(-1); onLevels({ curve: null, lo: 0, hi: 255 }); }}>Ripristina istogramma</Btn></div>
        </div>
    );
};
const Btn = ({ icon, label, on, onClick, disabled, children }) => (
    <button type="button" className={`lab-ib${on ? ' on' : ''}`} title={label} aria-label={label} disabled={disabled} onClick={onClick}>{icon && <Icon name={icon} size={17} />}{children}</button>
);
const Sw = ({ label, value, onChange }) => (
    <label className="lab-sw" title={label}><input type="color" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} /><span>{label}</span></label>
);

// ritaglio a maniglie: trascina i bordi o sposta tutto il riquadro
const CropBox = ({ src, crop, onCommit }) => {
    const box = useRef(null);
    const [c, setC] = useState(crop);
    const cRef = useRef(crop);
    useEffect(() => { setC(crop); cRef.current = crop; }, [crop.l, crop.t, crop.r, crop.b]); // eslint-disable-line react-hooks/exhaustive-deps
    const start = (mode) => (e) => {
        e.preventDefault(); e.stopPropagation();
        const rc = box.current.getBoundingClientRect();
        const s = { x: e.clientX, y: e.clientY, c: { ...cRef.current } };
        const move = (ev) => {
            const dx = ((ev.clientX - s.x) / rc.width) * 100; const dy = ((ev.clientY - s.y) / rc.height) * 100;
            let { l, t, r, b } = s.c;
            if (mode === 'move') {
                const w = 100 - l - r; const h = 100 - t - b;
                l = clamp(l + dx, 0, 100 - w); r = 100 - w - l; t = clamp(t + dy, 0, 100 - h); b = 100 - h - t;
            } else {
                if (mode.includes('w')) l = clamp(l + dx, 0, 100 - r - 5);
                if (mode.includes('e')) r = clamp(r - dx, 0, 100 - l - 5);
                if (mode.includes('n')) t = clamp(t + dy, 0, 100 - b - 5);
                if (mode.includes('s')) b = clamp(b - dy, 0, 100 - t - 5);
            }
            cRef.current = { l, t, r, b }; setC(cRef.current);
        };
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); onCommit(cRef.current); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    };
    return (
        <div className="lab-crop" ref={box}>
            <img src={src} alt="" draggable={false} />
            <div className="lab-crop-box" style={{ left: `${c.l}%`, top: `${c.t}%`, right: `${c.r}%`, bottom: `${c.b}%` }} onPointerDown={start('move')}>
                {HANDLES.map((h) => <i key={h} className={`lab-crop-h ${h}`} onPointerDown={start(h)} />)}
            </div>
        </div>
    );
};

const GelStudioInner = ({ gel, onChange, onPickPhoto, onClose, onSave, embedded }) => {
    const [tool, setTool] = useState('foto');
    const [zoom, setZoom] = useState(100);
    const [cutDir, setCutDir] = useState('v');
    const [zoneTool, setZoneTool] = useState(null); // forma che stai disegnando: rect | ell | free
    const [selZ, setSelZ] = useState(-1);
    const [draft, setDraft] = useState([]);
    const [newIdx, setNewIdx] = useState(-1);
    const [base, setBase] = useState(null); // foto senza ritaglio (per lo strumento Ritaglia)
    const g = gel;
    const gRef = useRef(g);
    gRef.current = g;
    const proc = { ...defaultProc(), ...(g.proc || {}) };
    const lanes = g.lanes || [];
    const ladder = g.ladder || [];
    const marks = g.marks || [];
    const cuts = g.cuts || [];
    const st = gelStyle(g);
    const stage = useRef(null);

    // cronologia per Annulla/Ripeti: le modifiche ravvicinate (cursori, trascinamenti) contano come una sola
    const past = useRef([]); const future = useRef([]); const lastAt = useRef(0);
    const [, bump] = useState(0);
    const commit = (next) => {
        const now = Date.now();
        if (now - lastAt.current > 700) { past.current.push(gRef.current); if (past.current.length > 60) past.current.shift(); }
        lastAt.current = now; future.current = [];
        gRef.current = next; onChange(next); bump((x) => x + 1);
    };
    const set = (patch) => commit({ ...gRef.current, ...patch });
    const setProc = (patch) => set({ proc: { ...proc, ...patch } });
    const setSt = (patch) => set({ style: { ...(g.style || {}), ...patch } });
    const undo = () => { const p = past.current.pop(); if (!p) return; future.current.push(gRef.current); lastAt.current = 0; gRef.current = p; onChange(p); bump((x) => x + 1); };
    const redo = () => { const f = future.current.pop(); if (!f) return; past.current.push(gRef.current); lastAt.current = 0; gRef.current = f; onChange(f); bump((x) => x + 1); };
    // le modifiche restano nel box finché non premi Salva: il resto dell'app non si muove mentre lavori
    const askClose = () => { if (!past.current.length || window.confirm('Chiudere senza salvare le modifiche al gel?')) onClose(); };
    const [saving, setSaving] = useState(false);
    const saveGel = async () => {
        setSaving(true);
        const cur = gRef.current; const src = cur.src || cur.img;
        let next = cur;
        if (src) { try { next = { ...cur, src, ...(await processGel(src, { ...defaultProc(), ...(cur.proc || {}) })) }; } catch (e) { next = cur; } }
        try { await onSave(next); } finally { setSaving(false); }
    };
    const fns = useRef(); fns.current = { undo, redo, onClose: askClose };
    useEffect(() => {
        const keyd = (e) => {
            const u = fns.current;
            if (e.key === 'Escape') { u.onClose(); return; }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) { e.preventDefault(); if (e.shiftKey) u.redo(); else u.undo(); }
        };
        window.addEventListener('keydown', keyd);
        return () => window.removeEventListener('keydown', keyd);
    }, []);

    // anteprima veloce (foto ridotta) mentre muovi i cursori; la foto piena si rifà a mano ferma
    const [preview, setPreview] = useState(null);
    const [showOrig, setShowOrig] = useState(false); // tieni premuto «Originale» per confrontare con la foto di partenza
    const shown = showOrig ? (g.src || g.img) : (preview || g.img);
    const pvKey = JSON.stringify(proc) + (g.src || '').length;
    const procRef = useRef(proc); procRef.current = proc;
    const pv = useRef({ busy: false, again: false, dead: false });
    useEffect(() => { pv.current.dead = false; return () => { pv.current.dead = true; }; }, []);
    useEffect(() => {
        const src = gRef.current.src || gRef.current.img;
        if (!src) return;
        const st = pv.current;
        if (st.busy) { st.again = true; return; }
        // un solo calcolo alla volta: mentre trascini si rifà sempre l'ultimo valore, senza accumulare lavoro
        (async () => {
            st.busy = true;
            do {
                st.again = false;
                const r = await processGel(src, procRef.current, false, 400);
                if (!st.dead) setPreview(r.img);
            } while (st.again && !st.dead);
            st.busy = false;
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pvKey]);

    // rifà la foto lavorata quando cambiano sorgente o impostazioni
    const key = JSON.stringify(proc) + (g.src || '').length;
    useEffect(() => {
        const src = gRef.current.src || gRef.current.img;
        if (!src) return undefined;
        let dead = false;
        const t = setTimeout(async () => {
            const r = await processGel(src, proc);
            if (!dead) { onChange({ ...gRef.current, src, ...r }); setPreview(null); }
        }, 500);
        return () => { dead = true; clearTimeout(t); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    // foto intera (rotazione e colori sì, ritaglio no) per disegnare il riquadro di ritaglio
    const baseKey = JSON.stringify({ ...proc, l: 0, t: 0, r: 0, b: 0 }) + (g.src || '').length;
    useEffect(() => {
        if (tool !== 'ritaglio') return undefined;
        const src = gRef.current.src || gRef.current.img;
        if (!src) return undefined;
        let dead = false;
        processGel(src, proc, true).then((r) => { if (!dead) setBase(r.img); });
        return () => { dead = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tool, baseKey]);

    const L = g.img ? gelLayout(g) : null;
    const toPct = (e) => {
        const svg = stage.current && stage.current.querySelector('svg');
        const r = svg.getBoundingClientRect();
        const vx = ((e.clientX - r.left) / r.width) * L.tw - L.ml;
        const vy = ((e.clientY - r.top) / r.height) * L.th - L.mt;
        return [+L.ax.inv(vx).toFixed(1), +L.ay.inv(vy).toFixed(1)];
    };
    const click = (e) => {
        if (!stage.current || !stage.current.querySelector('svg')) return;
        const [px, py] = toPct(e);
        if (tool === 'marker') { setNewIdx(ladder.length); set({ ladder: [...ladder, { text: '', y: py }] }); }
        else if (tool === 'bande') { setNewIdx(marks.length); set({ marks: [...marks, { text: '', x: px, y: py }] }); }
        else if (tool === 'tagli') set({ cuts: [...cuts, { dir: cutDir, pos: cutDir === 'v' ? px : py }], hide: {} });
    };
    // trascinamento diretto di un elemento sul gel: apply riceve la posizione in % e restituisce le modifiche
    const drag = (apply) => (e) => {
        e.preventDefault(); e.stopPropagation();
        const move = (ev) => { if (stage.current && stage.current.querySelector('svg')) set(apply(toPct(ev), gRef.current)); };
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    };
    const dragLane = (i) => drag(([px], cur) => {
        const dx = lanes.map((_, k) => (cur.laneDx || [])[k] || 0);
        dx[i] = +(px - laneTop({ ...cur, laneDx: [] }, i)).toFixed(1);
        return { laneDx: dx };
    });
    const dragEdge = (k) => drag(([px]) => ({ [k]: px }));
    const dragLadder = (i) => drag(([, py], cur) => ({ ladder: cur.ladder.map((m, k) => (k === i ? { ...m, y: py } : m)) }));
    const dragMark = (i) => drag(([px, py], cur) => ({ marks: cur.marks.map((m, k) => (k === i ? { ...m, x: px, y: py } : m)) }));
    const dragCut = (i) => drag(([px, py], cur) => ({ cuts: cur.cuts.map((c, k) => (k === i ? { ...c, pos: c.dir === 'v' ? px : py } : c)) }));
    const stop = (e) => e.stopPropagation();
    const pc = (px, py) => ({ left: `${((L.ml + L.ax.f(px)) / L.tw) * 100}%`, top: `${((L.mt + L.ay.f(py)) / L.th) * 100}%` });

    const [openS, setOpenS] = useState('foto');
    const [grp, setGrp] = useState('img');
    // su schermi larghi i due gruppi stanno insieme, su quelli stretti si sceglie dalla barra
    const [wide, setWide] = useState(() => !embedded && window.innerWidth >= 1680);
    useEffect(() => { const f = () => setWide(!embedded && window.innerWidth >= 1680); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
    const ANNOT = ['corsie', 'marker', 'bande', 'tagli'];
    const openSec = (k) => {
        setOpenS(k);
        if (k !== 'stile' && k !== 'esporta' && k !== 'curve') { setTool(k); }
    };
    // le etichette restano sempre visibili appena c'è qualcosa di compilato
    const annot = !!(g.title || ladder.length || marks.length || cuts.length || g.caption || JSON.stringify(lanes) !== '["M","1","2","3"]');
    const view = tool === 'ritaglio' || tool === 'zone' ? tool : (annot || ANNOT.includes(tool)) ? 'svg' : 'photo';
    // misura del gel nel riquadro: sempre intero, senza scorrere (lo zoom parte da lì)
    const [stSize, setStSize] = useState({ w: 600, h: 500 });
    useEffect(() => {
        const el = stage.current; if (!el || !window.ResizeObserver) return undefined;
        const ro = new ResizeObserver(() => setStSize({ w: el.clientWidth, h: el.clientHeight }));
        ro.observe(el); return () => ro.disconnect();
    }, []);
    const fitW = (a) => `${Math.max(120, (Math.min(stSize.w - 32, (stSize.h - 32) * a) * zoom) / 100)}px`;
    const upd = (k2, list, i, patch) => set({ [k2]: list.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
    const setLaneCount = (N) => { const k = clamp(N, 1, 40); set({ lanes: Array.from({ length: k }, (_, i) => lanes[i] ?? String(i)), laneDx: (g.laneDx || []).slice(0, k) }); };
    const applyLanes = (txt) => { const arr = txt.split(/[\s,;]+/).filter(Boolean).slice(0, 40); if (arr.length) set({ lanes: arr, laneDx: (g.laneDx || []).slice(0, arr.length) }); };
    const addLadder = (list) => set({ ladder: list.map((text, i) => ({ text, y: +(8 + (i * 80) / Math.max(1, list.length - 1)).toFixed(1) })) });
    const toggleHide = (dir, i) => { const cur = (g.hide && g.hide[dir]) || []; set({ hide: { ...(g.hide || {}), [dir]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] } }); };
    const crop = { l: proc.l, t: proc.t, r: proc.r, b: proc.b };
    const cropped = proc.l || proc.t || proc.r || proc.b;
    const segs = (d) => (d === 'v' ? L.ax : L.ay).segs;
    useEffect(() => { // sfondo fermo: la pagina sotto non scorre mentre il box è aperto
        if (embedded) return undefined;
        const b = document.body; const prev = b.style.overflow;
        b.style.overflow = 'hidden';
        return () => { b.style.overflow = prev; };
    }, []);

    const save = async (withLabels) => {
        const blob = await gelPng(gRef.current, withLabels);
        if (!blob) return;
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${(g.title || 'gel').replace(/[^\w-]+/g, '_')}${withLabels ? '' : '_foto'}.png`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    const zoneBox = useRef(null);
    const zones = proc.zones || [];
    const curZ = () => (gRef.current.proc && gRef.current.proc.zones) || [];
    const setZones = (next) => set({ proc: { ...(gRef.current.proc || defaultProc()), zones: next } });
    const pct = (ev) => { const rc = zoneBox.current.getBoundingClientRect(); return [clamp(((ev.clientX - rc.left) / rc.width) * 100, 0, 100), clamp(((ev.clientY - rc.top) / rc.height) * 100, 0, 100)]; };
    const track = (move, end) => {
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); if (end) end(); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    };
    const finishFree = () => {
        if (draft.length >= 3) { const n = curZ().length; setZones([...curZ(), { type: 'poly', pts: draft, feather: 0, inv: false, adj: zoneDef() }]); setSelZ(n); }
        setDraft([]); setZoneTool(null);
    };
    const zBg = (e) => {
        if (!zoneTool) { setSelZ(-1); return; }
        e.preventDefault(); e.stopPropagation();
        const [x, y] = pct(e);
        if (zoneTool === 'free') {
            if (draft.length >= 3 && Math.hypot(x - draft[0][0], y - draft[0][1]) < 2.5) finishFree(); else setDraft((d) => [...d, [x, y]]);
            return;
        }
        const idx = curZ().length; setSelZ(idx);
        setZones([...curZ(), { type: zoneTool, x0: x, y0: y, x1: x, y1: y, feather: 0, inv: false, adj: zoneDef() }]);
        track((ev) => { const [mx, my] = pct(ev); setZones(curZ().map((z, k) => (k === idx ? { ...z, x1: mx, y1: my } : z))); },
            () => { const z = curZ()[idx]; if (z && (Math.abs(z.x1 - z.x0) < 2 || Math.abs(z.y1 - z.y0) < 2)) { setZones(curZ().filter((_, k) => k !== idx)); setSelZ(-1); } setZoneTool(null); });
    };
    const moveZ = (i) => (e) => {
        if (zoneTool) return;
        e.preventDefault(); e.stopPropagation(); setSelZ(i);
        const [sx, sy] = pct(e); const o = curZ()[i];
        track((ev) => {
            const [mx, my] = pct(ev); const dx = mx - sx; const dy = my - sy;
            setZones(curZ().map((z, k) => (k !== i ? z : o.type === 'poly' ? { ...o, pts: o.pts.map((q) => [q[0] + dx, q[1] + dy]) } : { ...o, x0: o.x0 + dx, x1: o.x1 + dx, y0: o.y0 + dy, y1: o.y1 + dy })));
        });
    };
    const dragPt = (i, kx, ky, j) => (e) => {
        e.preventDefault(); e.stopPropagation();
        track((ev) => {
            const [mx, my] = pct(ev);
            setZones(curZ().map((z, k) => (k !== i ? z : j !== undefined ? { ...z, pts: z.pts.map((q, n) => (n === j ? [mx, my] : q)) } : { ...z, [kx]: mx, [ky]: my })));
        });
    };
    const patchZ = (patch) => setZones(curZ().map((z, k) => (k === selZ ? { ...z, ...patch } : z)));
    const panel = (tool) => {
        if (tool === 'foto') return (<>
            {!g.img && <div className="gs-btns"><Btn icon="image" label="Carica foto" onClick={onPickPhoto}>Carica foto</Btn></div>}
            {g.img && (<>
                <div className="gs-btns four">
                    <Btn icon="rot-left" label="Ruota a sinistra" onClick={() => setProc({ rot: (proc.rot + 270) % 360 })}>Sinistra</Btn>
                    <Btn icon="rot-right" label="Ruota a destra" onClick={() => setProc({ rot: (proc.rot + 90) % 360 })}>Destra</Btn>
                    <Btn icon="contrast" label="Scala di grigi" on={proc.gray} onClick={() => setProc({ gray: !proc.gray })}>Grigi</Btn>
                    <Btn icon="swap" label="Inverti i colori" on={proc.invert} onClick={() => setProc({ invert: !proc.invert })}>Inverti</Btn>
                </div>
                <Rng label="Raddrizza" value={proc.deg} min={-15} max={15} step={0.1} onChange={(v) => setProc({ deg: v })} unit="°" />
                <Rng label="Luminosità" value={proc.bright} min={-100} max={100} onChange={(v) => setProc({ bright: v })} />
                <Rng label="Contrasto" value={proc.contr} min={-100} max={100} onChange={(v) => setProc({ contr: v })} />
                <Rng label="Contrasto locale" value={proc.local} min={0} max={100} onChange={(v) => setProc({ local: v })} />
                <Rng label="Fondo piatto" value={proc.flat} min={0} max={100} onChange={(v) => setProc({ flat: v })} />
                <Rng label="Meno rumore" value={proc.denoise} min={0} max={4} step={1} onChange={(v) => setProc({ denoise: v })} />
                <div className="lab-row gs-tint"><span className="gs-lbl">Colora</span>
                    <button type="button" className={`lab-dot none${!proc.tint ? ' on' : ''}`} aria-label="Nessun colore" title="Nessun colore" onClick={() => setProc({ tint: '' })} />
                    {GEL_TINTS.filter(([v]) => v).map(([v, l]) => <button type="button" key={v} className={`lab-dot${proc.tint === v ? ' on' : ''}`} style={{ background: v }} aria-label={`Colora: ${l}`} title={`Colora: ${l}`} onClick={() => setProc({ tint: proc.tint === v ? '' : v })} />)}
                </div>
                <div className="gs-btns four">
                    <Btn icon="image" label="Cambia foto" onClick={onPickPhoto}>Foto</Btn>
                    <Btn icon="undo" label="Ripristina filtri (luminosità, contrasto, pulizia, colori)" onClick={() => setProc({ gray: false, invert: false, bright: 0, contr: 0, tint: '', flat: 0, denoise: 0, local: 0, lo: 0, hi: 255, zones: [], curve: null })}>Filtri</Btn>
                    <Btn icon="undo" label="Ripristina tutto: anche rotazione e ritaglio" onClick={() => set({ proc: defaultProc() })}>Tutto</Btn>
                </div>
            </>)}
        </>);
        if (tool === 'curve') return g.img ? <Histogram gel={g} proc={proc} onLevels={(v) => setProc(v)} /> : <span className="lab-note">Carica prima la foto.</span>;
        if (tool === 'zone') {
            const Zs = zones[selZ];
            const Z = Zs ? { ...zoneDef(), ...Zs.adj } : null;
            const setZ = (patch) => patchZ({ adj: { ...Z, ...patch } });
            return (<>
                <div className="gs-btns four">
                    {[['rect', 'Rettangolo'], ['ell', 'Ellisse'], ['free', 'Libera']].map(([k, l]) => <Btn key={k} label={l} on={zoneTool === k} disabled={!g.img} onClick={() => { setZoneTool(zoneTool === k ? null : k); setDraft([]); }}>{l}</Btn>)}
                </div>
                {zoneTool === 'free' && <div className="gs-btns"><span className="lab-note">Clicca i punti; chiudi con doppio clic o sul primo punto.</span><Btn icon="check" label="Chiudi la forma" disabled={draft.length < 3} onClick={finishFree}>Chiudi</Btn></div>}
                {zoneTool && zoneTool !== 'free' && <span className="lab-note">Trascina sulla foto.</span>}
                {!zoneTool && zones.length === 0 && <span className="lab-note">Scegli una forma e disegnala sulla foto: puoi farne quante vuoi.</span>}
                {zones.length > 0 && (<>
                    <div className="gs-lbl">Zone ({zones.length}), clicca per modificare</div>
                    <div className="gs-btns">{zones.map((_, i) => <Btn key={i} label={`Zona ${i + 1}`} on={selZ === i} onClick={() => setSelZ(i)}>{i + 1}</Btn>)}</div>
                </>)}
                {Z && (<>
                    <Rng label="Sfumatura del bordo" value={Zs.feather} min={0} max={30} onChange={(v) => patchZ({ feather: v })} unit="%" />
                    <Rng label="Luminosità" value={Z.bright} min={-100} max={100} onChange={(v) => setZ({ bright: v })} />
                    <Rng label="Contrasto" value={Z.contr} min={-100} max={100} onChange={(v) => setZ({ contr: v })} />
                    <Rng label="Saturazione" value={Z.sat} min={-100} max={100} onChange={(v) => setZ({ sat: v })} />
                    <div className="gs-btns four">
                        <Btn icon="contrast" label="Scala di grigi" on={Z.gray} onClick={() => setZ({ gray: !Z.gray })}>Grigi</Btn>
                        <Btn icon="swap" label="Inverti i colori" on={Z.invert} onClick={() => setZ({ invert: !Z.invert })}>Inverti</Btn>
                        <Btn label="Applica a tutto tranne la zona" on={Zs.inv} onClick={() => patchZ({ inv: !Zs.inv })}>Fuori</Btn>
                    </div>
                    <div className="lab-row gs-tint"><span className="gs-lbl">Colora</span>
                        <button type="button" className={`lab-dot none${!Z.tint ? ' on' : ''}`} aria-label="Nessun colore" title="Nessun colore" onClick={() => setZ({ tint: '' })} />
                        {GEL_TINTS.filter(([v]) => v).map(([v, l]) => <button type="button" key={v} className={`lab-dot${Z.tint === v ? ' on' : ''}`} style={{ background: v }} aria-label={`Colora: ${l}`} title={`Colora: ${l}`} onClick={() => setZ({ tint: Z.tint === v ? '' : v })} />)}
                    </div>
                    <div className="gs-btns four">
                        <Btn icon="undo" label="Ripristina questa zona" onClick={() => patchZ({ adj: zoneDef(), feather: 0, inv: false })}>Ripristina</Btn>
                        <Btn icon="trash" label="Elimina questa zona" onClick={() => { setZones(zones.filter((_, k) => k !== selZ)); setSelZ(-1); }}>Elimina</Btn>
                    </div>
                </>)}
            </>);
        }
        if (tool === 'ritaglio') return (
            <>
                <div className="gs-btns">
                    <Btn icon="crop" label="Scegli la parte da tenere: trascina i bordi sulla foto" on={openS === 'ritaglio'} disabled={!g.img} onClick={() => openSec('ritaglio')}>Ritaglia</Btn>
                    <Btn icon="x" label="Togli il ritaglio" disabled={!cropped} onClick={() => setProc({ l: 0, t: 0, r: 0, b: 0 })}>Togli ritaglio</Btn>
                </div>
                <span className="lab-note">{cropped ? 'Foto ritagliata' : 'Foto intera'}</span>
            </>
        );
        if (tool === 'tagli') return (<>
            <div className="gs-lbl">Dove tagliare (poi clicca sul gel)</div>
            <div className="gs-btns">
                <Btn icon="vline" label="Taglio verticale" on={cutDir === 'v'} onClick={() => setCutDir('v')}>Verticale</Btn>
                <Btn icon="hline" label="Taglio orizzontale" on={cutDir === 'h'} onClick={() => setCutDir('h')}>Orizzontale</Btn>
            </div>
            <Rng label="Spazio tra le parti" value={g.gap === undefined ? 8 : g.gap} max={40} onChange={(v) => set({ gap: v })} />
            {L && ['v', 'h'].map((d) => segs(d).length > 1 && (
                <div key={d}>
                    <div className="gs-lbl">Parti {d === 'v' ? 'verticali' : 'orizzontali'} (clic per nascondere)</div>
                    <div className="gs-btns">{segs(d).map((s, i) => <Btn key={i} icon={s.vis ? 'eye' : 'eye-off'} label={`${s.vis ? 'Nascondi' : 'Mostra'} la parte ${i + 1}`} on={!s.vis} onClick={() => toggleHide(d, i)}>{i + 1}</Btn>)}</div>
                </div>
            ))}
            {cuts.length > 0 && (<><div className="gs-lbl">Tagli fatti</div><div className="gs-btns">{cuts.map((c, i) => <Btn key={i} icon={c.dir === 'v' ? 'vline' : 'hline'} label="Togli questo taglio" onClick={() => set({ cuts: cuts.filter((_, k) => k !== i), hide: {} })}>Togli {i + 1}</Btn>)}</div></>)}
        </>);
        if (tool === 'corsie') return (<>
            <div className="gs-lbl">Quante corsie</div>
            <div className="gs-btns">
                <Btn icon="minus" label="Una corsia in meno" onClick={() => setLaneCount(lanes.length - 1)} />
                <b className="lab-num">{lanes.length}</b>
                <Btn icon="plus" label="Una corsia in più" onClick={() => setLaneCount(lanes.length + 1)} />
            </div>
            <div className="gs-lbl">Nomi (scrivi separati da spazio, poi Invio)</div>
            <input className="fld" key={lanes.join('|')} defaultValue={lanes.join(' ')} aria-label="Etichette delle corsie" placeholder="M 1 2 3…" onBlur={(e) => applyLanes(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} />
            <div className="gs-btns">
                <Btn label="Numera 1, 2, 3…" onClick={() => set({ lanes: lanes.map((_, i) => String(i + 1)) })}>1 2 3</Btn>
                <Btn label="Marcatore, poi 1, 2…" onClick={() => set({ lanes: lanes.map((_, i) => (i === 0 ? 'M' : String(i))) })}>M 1 2</Btn>
                <Btn label="Lettere A, B, C…" onClick={() => set({ lanes: lanes.map((_, i) => String.fromCharCode(65 + (i % 26))) })}>A B C</Btn>
            </div>
            <div className="gs-lbl">Inclinazione dei nomi</div>
            <div className="gs-btns">{[[0, '0°'], [45, '45°'], [90, '90°']].map(([a, l]) => <Btn key={a} label={`Etichette a ${l}`} on={Number(g.angle) === a} onClick={() => set({ angle: a })}>{l}</Btn>)}</div>
            <Rng label="Inclina le corsie" value={g.tilt} min={-20} max={20} step={0.1} onChange={(v) => set({ tilt: v })} unit="°" />
            <div className="gs-btns"><Btn icon="undo" label="Corsie dritte e a distanza uguale" onClick={() => set({ laneDx: [], tilt: 0 })}>Rimetti dritte</Btn></div>
        </>);
        if (tool === 'marker') return (<>
            <div className="gs-lbl">Scala di pesi</div>
            <div className="gs-btns">{LADDERS.map(([l, list]) => <Btn key={l} label={`Scala: ${l}`} onClick={() => addLadder(list)}>{l.split(' ')[0]}</Btn>)}</div>
            {ladder.length > 0 && <div className="gs-lbl">Marcatori</div>}
            {ladder.map((m, i) => (
                <div className="lab-item" key={i}>
                    <input className="fld" placeholder="es. 75 kDa" autoFocus={i === newIdx} value={m.text} onChange={(e) => upd('ladder', ladder, i, { text: e.target.value })} />
                    <Btn icon="trash" label="Togli" onClick={() => set({ ladder: ladder.filter((_, k) => k !== i) })} />
                </div>
            ))}
        </>);
        if (tool === 'bande') return (<>
            <Rng label="Testo bande" value={st.size3 || st.size2} def={st.size2} min={8} max={24} step={0.5} onChange={(v) => setSt({ size3: v })} />
            {marks.length === 0 && <p className="lab-note">Nessuna banda indicata. Clicca sul gel.</p>}
            {marks.map((m, i) => (
                <div className="lab-item" key={i}>
                    <input className="lab-sw-i" type="color" aria-label="Colore" title="Colore di questa banda" value={m.color || st.marks} onChange={(e) => upd('marks', marks, i, { color: e.target.value })} />
                    <input className="fld" placeholder="es. Proteina X" autoFocus={i === newIdx} value={m.text} onChange={(e) => upd('marks', marks, i, { text: e.target.value })} />
                    <Btn icon="trash" label="Togli" onClick={() => set({ marks: marks.filter((_, k) => k !== i) })} />
                </div>
            ))}
        </>);
        if (tool === 'esporta') return (<>
            <div className="gs-lbl">Didascalia (sotto il gel)</div>
            <textarea className="fld" rows={2} style={{ height: 'auto', padding: 10 }} placeholder="es. SDS-PAGE 12%, colorazione Coomassie. M: marcatore; 1–3: campioni." value={g.caption || ''} onChange={(e) => set({ caption: e.target.value })} />
            <div className="gs-lbl">Salva immagine (PNG, 2400 px)</div>
            <div className="gs-btns">
                <Btn icon="image" label="PNG con etichette" disabled={!g.img} onClick={() => save(true)}>Con etichette</Btn>
                <Btn icon="image" label="PNG solo foto" disabled={!g.img} onClick={() => save(false)}>Solo foto</Btn>
            </div>
        </>);
        return (<>
            <div className="lab-sws">
                <Sw label="Titolo" value={st.title} onChange={(v) => setSt({ title: v })} />
                <Sw label="Corsie" value={st.lanes} onChange={(v) => setSt({ lanes: v })} />
                <Sw label="Marcatori" value={st.ladder} onChange={(v) => setSt({ ladder: v })} />
                <Sw label="Bande" value={st.marks} onChange={(v) => set({ style: { ...(g.style || {}), marks: v }, marks: marks.map((m) => ({ ...m, color: undefined })) })} />
            </div>
            <Rng label="Testo corsie" value={st.size} min={8} max={40} step={0.5} onChange={(v) => setSt({ size: v })} />
            <Rng label="Testo misure" value={st.size2} min={8} max={18} step={0.5} onChange={(v) => setSt({ size2: v })} />
            <Rng label="Testo bande" value={st.size3 || st.size2} def={st.size2} min={8} max={24} step={0.5} onChange={(v) => setSt({ size3: v })} />
            <div className="gs-btns"><Btn icon="undo" label="Colori e dimensioni di partenza" onClick={() => set({ style: {} })}>Ripristina</Btn></div>
        </>);
    };

    const wrap = (node) => (embedded ? <div className="lab-gel-emb">{node}</div> : createPortal(node, document.body));
    return wrap(
        <div className="sheet-back lab-gel-back" onMouseDown={(e) => { if (e.target === e.currentTarget && !embedded) askClose(); }}>
            <div className={`lab-gel-win${wide ? ' gs-wide' : ''}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Gel">
                <header className="gs-head">
                    <input className="fld" placeholder="Titolo del gel (es. SDS-PAGE 12%)" value={g.title || ''} onChange={(e) => set({ title: e.target.value })} />
                    <Btn icon="undo" label="Annulla (Ctrl/⌘+Z)" onClick={undo} disabled={!past.current.length} />
                    <Btn icon="redo" label="Ripeti (Maiusc+Ctrl/⌘+Z)" onClick={redo} disabled={!future.current.length} />
                    <button type="button" className="lab-ib txt" title="Tieni premuto per vedere la foto originale, senza filtri" disabled={!g.img} onPointerDown={(e) => { e.preventDefault(); setShowOrig(true); window.addEventListener('pointerup', () => setShowOrig(false), { once: true }); }}>Originale</button>
                    <span className="gs-zoom">
                        <Btn icon="minus" label="Rimpicciolisci" onClick={() => setZoom(Math.max(50, zoom - 25))} />
                        <button type="button" className="lab-ib txt" title="Zoom 100%" onClick={() => setZoom(100)}>{zoom}%</button>
                        <Btn icon="plus" label="Ingrandisci" onClick={() => setZoom(Math.min(300, zoom + 25))} />
                    </span>
                    <button type="button" className="lab-ib txt" onClick={askClose}>Annulla</button>
                    <button type="button" className="lab-ib done" disabled={saving} onClick={saveGel}><Icon name="check" size={16} />{saving ? 'Salvo…' : 'Salva'}</button>
                </header>
                <div className="lab-gel-body">
                    {!wide && <nav className="gs-rail" aria-label="Strumenti">
                        {GROUPS.map((G) => <button key={G.k} type="button" className={`gs-tool${grp === G.k ? ' on' : ''}`} title={G.t} aria-pressed={grp === G.k} onClick={() => { setGrp(G.k); openSec(G.first); }}><Icon name={G.ic} size={22} /><span>{G.t}</span></button>)}
                    </nav>}
                    <div className="lab-gel-main">
                        <div className="lab-gel-stage" ref={stage} onClick={click} style={{ cursor: ['marker', 'bande', 'tagli'].includes(tool) ? 'crosshair' : 'default' }}>
                            {!g.img && (
                                <button type="button" className="lab-gel-empty" onClick={(e) => { e.stopPropagation(); onPickPhoto(); }}>
                                    <Icon name="image" size={30} /><b>Carica la foto del gel</b><span>Poi regola, ritaglia e annota.</span>
                                </button>
                            )}
                            {g.img && tool === 'ritaglio' && (base ? <CropBox src={base} crop={crop} onCommit={(c) => setProc(c)} /> : <span className="lab-chart-hint">…</span>)}
                            {g.img && tool === 'zone' && (
                                <div className="gs-zonewrap" style={{ width: fitW(annot ? L.tw / L.th : (g.w || 4) / (g.h || 3)) }}>
                                    {annot ? <div className="gs-svgbg" dangerouslySetInnerHTML={{ __html: gelSvg({ ...g, img: shown }) }} /> : <img className="gs-photo" src={shown} alt="Foto del gel" draggable={false} style={{ width: '100%' }} />}
                                    <div className="gs-zin" ref={zoneBox} style={annot ? { left: `${(L.ml / L.tw) * 100}%`, top: `${(L.mt / L.th) * 100}%`, width: `${(L.W / L.tw) * 100}%`, height: `${(L.H / L.th) * 100}%` } : { left: 0, top: 0, right: 0, bottom: 0 }}>
                                    <svg className={`gs-zsvg${zoneTool ? ' draw' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" onPointerDown={zBg} onDoubleClick={() => zoneTool === 'free' && finishFree()}>
                                        {zones.map((Z, i) => {
                                            const cls = `gs-zs${selZ === i ? ' on' : ''}`;
                                            if (Z.type === 'poly') return <polygon key={i} className={cls} points={Z.pts.map((q) => q.join(',')).join(' ')} onPointerDown={moveZ(i)} />;
                                            if (Z.type === 'ell') return <ellipse key={i} className={cls} cx={(Z.x0 + Z.x1) / 2} cy={(Z.y0 + Z.y1) / 2} rx={Math.abs(Z.x1 - Z.x0) / 2} ry={Math.abs(Z.y1 - Z.y0) / 2} onPointerDown={moveZ(i)} />;
                                            return <rect key={i} className={cls} x={Math.min(Z.x0, Z.x1)} y={Math.min(Z.y0, Z.y1)} width={Math.abs(Z.x1 - Z.x0)} height={Math.abs(Z.y1 - Z.y0)} onPointerDown={moveZ(i)} />;
                                        })}
                                        {draft.length > 0 && <polyline className="gs-zs on" fill="none" points={draft.map((q) => q.join(',')).join(' ')} />}
                                    </svg>
                                    {draft.map((q, j) => <i key={`d${j}`} className="gs-zh" style={{ left: `${q[0]}%`, top: `${q[1]}%` }} />)}
                                    {zones.map((Z, i) => {
                                        const c = Z.type === 'poly' ? [Z.pts.reduce((a, q) => a + q[0], 0) / Z.pts.length, Z.pts.reduce((a, q) => a + q[1], 0) / Z.pts.length] : [(Z.x0 + Z.x1) / 2, (Z.y0 + Z.y1) / 2];
                                        return <b key={`t${i}`} className="gs-ztag" style={{ left: `${c[0]}%`, top: `${c[1]}%` }}>{i + 1}</b>;
                                    })}
                                    {selZ >= 0 && zones[selZ] && !zoneTool && (zones[selZ].type === 'poly'
                                        ? zones[selZ].pts.map((q, j) => <i key={j} className="gs-zh" style={{ left: `${q[0]}%`, top: `${q[1]}%` }} onPointerDown={dragPt(selZ, 0, 0, j)} />)
                                        : [['x0', 'y0'], ['x1', 'y0'], ['x0', 'y1'], ['x1', 'y1']].map(([kx, ky]) => <i key={kx + ky} className="gs-zh" style={{ left: `${zones[selZ][kx]}%`, top: `${zones[selZ][ky]}%` }} onPointerDown={dragPt(selZ, kx, ky)} />))}
                                    </div>
                                </div>
                            )}
                            {g.img && view === 'photo' && <img className="gs-photo" src={shown} alt="Foto del gel" style={{ width: fitW((g.w || 4) / (g.h || 3)) }} draggable={false} />}
                            {g.img && view === 'svg' && (
                                <div className="lab-gel-wrap" style={{ width: fitW(L.tw / L.th) }}>
                                    <div dangerouslySetInnerHTML={{ __html: gelSvg({ ...g, img: shown }, { guides: tool === 'corsie' || tool === 'tagli' }) }} />
                                    {tool === 'corsie' && lanes.map((_, i) => <i key={i} className="lab-lane-h" style={pc(laneTop(g, i), 0)} title="Trascina sopra il pozzetto" onPointerDown={dragLane(i)} onClick={stop} />)}
                                    {tool === 'corsie' && ['x0', 'x1'].map((k) => <i key={k} className="lab-lane-h sq" style={pc(n0(g[k]), 100)} title={k === 'x0' ? 'Prima corsia' : 'Ultima corsia'} onPointerDown={dragEdge(k)} onClick={stop} />)}
                                    {tool === 'marker' && ladder.map((m, i) => <i key={i} className="lab-lane-h sq" style={{ left: `${(L.ml / L.tw) * 100}%`, top: pc(0, m.y).top }} title="Trascina" onPointerDown={dragLadder(i)} onClick={stop} />)}
                                    {tool === 'bande' && marks.map((m, i) => <i key={i} className="lab-lane-h" style={pc(m.x, m.y)} title="Trascina" onPointerDown={dragMark(i)} onClick={stop} />)}
                                    {tool === 'tagli' && cuts.map((c, i) => <i key={i} className="lab-lane-h cut" style={c.dir === 'v' ? pc(c.pos, 0) : { left: `${(L.ml / L.tw) * 100}%`, top: pc(0, c.pos).top }} title="Trascina il taglio" onPointerDown={dragCut(i)} onClick={stop} />)}
                                </div>
                            )}
                        </div>
                        
                    </div>
                    <aside className="gs-side" style={wide ? { gridTemplateColumns: '1.3fr 1.25fr 1fr 1fr 0.9fr 0.9fr 1.1fr' } : undefined}>
                        {wide && WIDE_HEADS.map(([t, n]) => <div key={t} className="gs-gh" style={{ gridColumn: `span ${n}` }}>{t}</div>)}
                        {(() => { const cs = wide ? WIDE_COLS : GROUPS.find((G) => G.k === grp).cols; return cs; })().map((col, ci) => (
                            <div key={ci} className="gs-sidecol">
                                {col.filter((k) => k !== 'curve' || g.img).map((k) => { const [, t] = SECS.find((x) => x[0] === k); return (
                                    <section key={k} className={`gs-prop${openS === k ? ' on' : ''}`} onPointerDownCapture={() => openSec(k)}>
                                        <h4>{t}</h4>
                                        {panel(k)}
                                    </section>
                                ); })}
                            </div>
                        ))}
                    </aside>
                </div>
            </div>
        </div>,
    );
};

const n0 = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };

// il box lavora su una copia: il quaderno si aggiorna solo con Salva
export const GelStudio = ({ gel, onChange, onPickPhoto, onClose, embedded }) => {
    const [local, setLocal] = useState(gel);
    const first = useRef(true);
    useEffect(() => { if (first.current) { first.current = false; return; } setLocal(gel); }, [gel]);
    return <GelStudioInner gel={local} onChange={setLocal} onPickPhoto={onPickPhoto} onClose={onClose} embedded={embedded} onSave={async (g) => { await onChange(g); if (!embedded) onClose(); }} />;
};
