import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './ui/icons';
import { GEL_TINTS, LADDERS, defaultProc, gelLayout, gelStyle, gelSvg, laneTop, processGel } from './figures';

// Box di lavoro del gel: un unico spazio. A sinistra gli strumenti (icone), al centro il gel su cui si clicca e si trascina,
// a destra un pannello a gruppi comprimibili con i soli valori che non si possono regolare sul gel.
// La foto lavorata (g.img) si rifà da sola a ogni modifica; l'originale resta in g.src.
const TOOLS = [['ritaglio', 'crop', 'Ritaglia'], ['tagli', 'cut', 'Taglia in parti'], ['corsie', 'lanes', 'Corsie'], ['marker', 'ruler', 'Marcatori di peso'], ['bande', 'arrow', 'Bande indicate']];
const HINTS = {
    ritaglio: 'Trascina le maniglie per ritagliare, o sposta il riquadro.',
    tagli: 'Clicca sul gel per tagliare; trascina le maniglie rosse.',
    corsie: 'Trascina i pallini blu sopra ogni pozzetto; i quadratini agli angoli fissano la prima e l\'ultima corsia.',
    marker: 'Clicca all\'altezza di una banda del marcatore; trascina i quadratini per spostarli.',
    bande: 'Clicca sulla banda da indicare; trascina il pallino per spostarla.',
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const Rng = ({ icon, label, value, min = 0, max = 100, step = 1, onChange, unit = '' }) => (
    <label className="lab-rng" title={label}>
        <Icon name={icon} size={15} />
        <input type="range" min={min} max={max} step={step} value={value || 0} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
        <b>{+Number(value || 0).toFixed(1)}{unit}</b>
    </label>
);
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

export const GelStudio = ({ gel, onChange, onPickPhoto, onClose }) => {
    const [tool, setTool] = useState('corsie');
    const [open, setOpen] = useState({ foto: true, corsie: true });
    const [zoom, setZoom] = useState(100);
    const [cutDir, setCutDir] = useState('v');
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
    const fns = useRef(); fns.current = { undo, redo, onClose };
    useEffect(() => {
        const keyd = (e) => {
            const u = fns.current;
            if (e.key === 'Escape') { u.onClose(); return; }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) { e.preventDefault(); if (e.shiftKey) u.redo(); else u.undo(); }
        };
        window.addEventListener('keydown', keyd);
        return () => window.removeEventListener('keydown', keyd);
    }, []);

    // rifà la foto lavorata quando cambiano sorgente o impostazioni
    const key = JSON.stringify(proc) + (g.src || '').length;
    useEffect(() => {
        const src = gRef.current.src || gRef.current.img;
        if (!src) return undefined;
        let dead = false;
        const t = setTimeout(async () => {
            const r = await processGel(src, proc);
            if (!dead) onChange({ ...gRef.current, src, ...r });
        }, 150);
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

    const pickTool = (k) => { setTool(k); setOpen((o) => ({ ...o, [k]: true })); };
    const upd = (k2, list, i, patch) => set({ [k2]: list.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
    const setLaneCount = (N) => { const k = clamp(N, 1, 40); set({ lanes: Array.from({ length: k }, (_, i) => lanes[i] ?? String(i)), laneDx: (g.laneDx || []).slice(0, k) }); };
    const applyLanes = (txt) => { const arr = txt.split(/[\s,;]+/).filter(Boolean).slice(0, 40); if (arr.length) set({ lanes: arr, laneDx: (g.laneDx || []).slice(0, arr.length) }); };
    const addLadder = (list) => set({ ladder: list.map((text, i) => ({ text, y: +(8 + (i * 80) / Math.max(1, list.length - 1)).toFixed(1) })) });
    const toggleHide = (dir, i) => { const cur = (g.hide && g.hide[dir]) || []; set({ hide: { ...(g.hide || {}), [dir]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] } }); };
    const crop = { l: proc.l, t: proc.t, r: proc.r, b: proc.b };
    const cropped = proc.l || proc.t || proc.r || proc.b;

    const Group = ({ id, icon, title, children }) => (
        <section className="lab-gp">
            <button type="button" className="lab-gp-h" onClick={() => setOpen({ ...open, [id]: !open[id] })} aria-expanded={!!open[id]}>
                <Icon name={icon} size={16} /><span>{title}</span><Icon name={open[id] ? 'chevron-up' : 'chevron-down'} size={14} />
            </button>
            {open[id] && <div className="lab-gp-b">{children}</div>}
        </section>
    );
    const segs = (d) => (d === 'v' ? L.ax : L.ay).segs;

    return createPortal(
        <div className="sheet-back lab-gel-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="lab-gel-win" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Gel">
                <div className="lab-gel-top">
                    <input className="fld" placeholder="Titolo del gel (es. SDS-PAGE 12%)" value={g.title || ''} onChange={(e) => set({ title: e.target.value })} />
                    <Btn icon="undo" label="Annulla (Ctrl/⌘+Z)" onClick={undo} disabled={!past.current.length} />
                    <Btn icon="redo" label="Ripeti (Maiusc+Ctrl/⌘+Z)" onClick={redo} disabled={!future.current.length} />
                    <Btn icon="image" label={g.img ? 'Cambia foto' : 'Carica foto'} onClick={onPickPhoto} />
                    <span className="lab-gel-zoom">
                        <Btn icon="minus" label="Rimpicciolisci" onClick={() => setZoom(Math.max(50, zoom - 25))} />
                        <button type="button" className="lab-ib txt" title="Zoom 100%" onClick={() => setZoom(100)}>{zoom}%</button>
                        <Btn icon="plus" label="Ingrandisci" onClick={() => setZoom(Math.min(300, zoom + 25))} />
                    </span>
                    <button type="button" className="lab-ib done" onClick={onClose}><Icon name="check" size={16} />Fatto</button>
                </div>
                <div className="lab-gel-body">
                    <div className="lab-tools" role="toolbar" aria-label="Strumenti">
                        {TOOLS.map(([k, ic, l]) => <Btn key={k} icon={ic} label={l} on={tool === k} onClick={() => pickTool(k)} />)}
                    </div>
                    <div className="lab-gel-main">
                        <div className="lab-gel-stage" ref={stage} onClick={click} style={{ cursor: ['marker', 'bande', 'tagli'].includes(tool) ? 'crosshair' : 'default' }}>
                            {!g.img && <span className="lab-chart-hint">Carica la foto del gel per cominciare.</span>}
                            {g.img && tool === 'ritaglio' && (base ? <CropBox src={base} crop={crop} onCommit={(c) => setProc(c)} /> : <span className="lab-chart-hint">…</span>)}
                            {g.img && tool !== 'ritaglio' && (
                                <div className="lab-gel-wrap" style={{ width: `${zoom}%` }}>
                                    <div dangerouslySetInnerHTML={{ __html: gelSvg(g, { guides: tool === 'corsie' || tool === 'tagli' }) }} />
                                    {tool === 'corsie' && lanes.map((_, i) => <i key={i} className="lab-lane-h" style={pc(laneTop(g, i), 0)} title="Trascina sopra il pozzetto" onPointerDown={dragLane(i)} onClick={stop} />)}
                                    {tool === 'corsie' && ['x0', 'x1'].map((k) => <i key={k} className="lab-lane-h sq" style={pc(n0(g[k]), 100)} title={k === 'x0' ? 'Prima corsia' : 'Ultima corsia'} onPointerDown={dragEdge(k)} onClick={stop} />)}
                                    {tool === 'marker' && ladder.map((m, i) => <i key={i} className="lab-lane-h sq" style={{ left: `${(L.ml / L.tw) * 100}%`, top: pc(0, m.y).top }} title="Trascina" onPointerDown={dragLadder(i)} onClick={stop} />)}
                                    {tool === 'bande' && marks.map((m, i) => <i key={i} className="lab-lane-h" style={pc(m.x, m.y)} title="Trascina" onPointerDown={dragMark(i)} onClick={stop} />)}
                                    {tool === 'tagli' && cuts.map((c, i) => <i key={i} className="lab-lane-h cut" style={c.dir === 'v' ? pc(c.pos, 0) : { left: `${(L.ml / L.tw) * 100}%`, top: pc(0, c.pos).top }} title="Trascina il taglio" onPointerDown={dragCut(i)} onClick={stop} />)}
                                </div>
                            )}
                        </div>
                        <p className="lab-gel-hint">{HINTS[tool]}</p>
                    </div>
                    <div className="lab-gel-side">
                        <Group id="foto" icon="image" title="Foto">
                            <div className="lab-row">
                                <Btn icon="rot-left" label="Ruota a sinistra" onClick={() => setProc({ rot: (proc.rot + 270) % 360 })} />
                                <Btn icon="rot-right" label="Ruota a destra" onClick={() => setProc({ rot: (proc.rot + 90) % 360 })} />
                                <Btn icon="contrast" label="Scala di grigi" on={proc.gray} onClick={() => setProc({ gray: !proc.gray })} />
                                <Btn icon="swap" label="Inverti i colori" on={proc.invert} onClick={() => setProc({ invert: !proc.invert })} />
                                <Btn icon="undo" label="Foto originale" onClick={() => set({ proc: defaultProc() })} />
                            </div>
                            <Rng icon="straighten" label="Raddrizza (gradi)" value={proc.deg} min={-15} max={15} step={0.1} onChange={(v) => setProc({ deg: v })} unit="°" />
                            <Rng icon="sun" label="Luminosità" value={proc.bright} min={-100} max={100} onChange={(v) => setProc({ bright: v })} />
                            <Rng icon="contrast" label="Contrasto" value={proc.contr} min={-100} max={100} onChange={(v) => setProc({ contr: v })} />
                            <div className="lab-row" title="Colora la foto">
                                <button type="button" className={`lab-dot none${!proc.tint ? ' on' : ''}`} aria-label="Nessun colore" title="Nessun colore" onClick={() => setProc({ tint: '' })} />
                                {GEL_TINTS.filter(([v]) => v).map(([v, l]) => <button type="button" key={v} className={`lab-dot${proc.tint === v ? ' on' : ''}`} style={{ background: v }} aria-label={`Colora: ${l}`} title={`Colora: ${l}`} onClick={() => setProc({ tint: v })} />)}
                            </div>
                        </Group>
                        {tool === 'ritaglio' && (
                            <Group id="ritaglio" icon="crop" title="Ritaglio">
                                <div className="lab-row"><Btn icon="x" label="Togli il ritaglio" disabled={!cropped} onClick={() => setProc({ l: 0, t: 0, r: 0, b: 0 })} /><span className="lab-note">{cropped ? 'Ritagliata' : 'Intera'}</span></div>
                            </Group>
                        )}
                        <Group id="tagli" icon="cut" title="Parti">
                            <div className="lab-row">
                                <Btn icon="vline" label="Taglio verticale" on={cutDir === 'v'} onClick={() => { setCutDir('v'); setTool('tagli'); }} />
                                <Btn icon="hline" label="Taglio orizzontale" on={cutDir === 'h'} onClick={() => { setCutDir('h'); setTool('tagli'); }} />
                                <Rng icon="arrow" label="Spazio tra le parti (px)" value={g.gap === undefined ? 8 : g.gap} max={40} onChange={(v) => set({ gap: v })} />
                            </div>
                            {L && ['v', 'h'].map((d) => segs(d).length > 1 && (
                                <div className="lab-row" key={d}>
                                    <Icon name={d === 'v' ? 'vline' : 'hline'} size={15} />
                                    {segs(d).map((s, i) => <Btn key={i} icon={s.vis ? 'eye' : 'eye-off'} label={`${s.vis ? 'Nascondi' : 'Mostra'} la parte ${i + 1}`} on={!s.vis} onClick={() => toggleHide(d, i)}>{i + 1}</Btn>)}
                                </div>
                            ))}
                            {cuts.length > 0 && <div className="lab-row">{cuts.map((c, i) => <Btn key={i} icon="x" label="Togli questo taglio" onClick={() => set({ cuts: cuts.filter((_, k) => k !== i), hide: {} })}><Icon name={c.dir === 'v' ? 'vline' : 'hline'} size={14} /></Btn>)}</div>}
                        </Group>
                        <Group id="corsie" icon="lanes" title="Corsie">
                            <div className="lab-row">
                                <Btn icon="minus" label="Una corsia in meno" onClick={() => setLaneCount(lanes.length - 1)} />
                                <b className="lab-num">{lanes.length}</b>
                                <Btn icon="plus" label="Una corsia in più" onClick={() => setLaneCount(lanes.length + 1)} />
                                <Btn label="Numera 1, 2, 3…" onClick={() => set({ lanes: lanes.map((_, i) => String(i + 1)) })}>1 2 3</Btn>
                                <Btn label="Marcatore, poi 1, 2…" onClick={() => set({ lanes: lanes.map((_, i) => (i === 0 ? 'M' : String(i))) })}>M 1 2</Btn>
                                <Btn label="Lettere A, B, C…" onClick={() => set({ lanes: lanes.map((_, i) => String.fromCharCode(65 + (i % 26))) })}>A B C</Btn>
                            </div>
                            <input className="fld" key={lanes.join('|')} defaultValue={lanes.join(' ')} aria-label="Etichette delle corsie" placeholder="Etichette: M 1 2 3…  (Invio)" onBlur={(e) => applyLanes(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} />
                            <Rng icon="straighten" label="Inclina tutte le corsie (gradi)" value={g.tilt} min={-20} max={20} step={0.1} onChange={(v) => set({ tilt: v })} unit="°" />
                            <div className="lab-row">
                                {[[0, '0°'], [45, '45°'], [90, '90°']].map(([a, l]) => <Btn key={a} label={`Etichette a ${l}`} on={Number(g.angle) === a} onClick={() => set({ angle: a })}>{l}</Btn>)}
                                <Btn icon="undo" label="Corsie dritte e a distanza uguale" onClick={() => set({ laneDx: [], tilt: 0 })} />
                            </div>
                        </Group>
                        <Group id="marker" icon="ruler" title="Marcatori">
                            <div className="lab-row">{LADDERS.map(([l, list]) => <Btn key={l} label={`Scala: ${l}`} onClick={() => addLadder(list)}>{l.split(' ')[0]}</Btn>)}</div>
                            {ladder.map((m, i) => (
                                <div className="lab-item" key={i}>
                                    <input className="fld" placeholder="es. 75 kDa" autoFocus={i === newIdx && tool === 'marker'} value={m.text} onChange={(e) => upd('ladder', ladder, i, { text: e.target.value })} />
                                    <Btn icon="trash" label="Togli" onClick={() => set({ ladder: ladder.filter((_, k) => k !== i) })} />
                                </div>
                            ))}
                        </Group>
                        <Group id="bande" icon="arrow" title="Bande">
                            {marks.map((m, i) => (
                                <div className="lab-item" key={i}>
                                    <input className="lab-sw-i" type="color" aria-label="Colore" title="Colore di questa banda" value={m.color || st.marks} onChange={(e) => upd('marks', marks, i, { color: e.target.value })} />
                                    <input className="fld" placeholder="es. Proteina X" autoFocus={i === newIdx && tool === 'bande'} value={m.text} onChange={(e) => upd('marks', marks, i, { text: e.target.value })} />
                                    <Btn icon="trash" label="Togli" onClick={() => set({ marks: marks.filter((_, k) => k !== i) })} />
                                </div>
                            ))}
                        </Group>
                        <Group id="testo" icon="text" title="Testi e colori">
                            <div className="lab-sws">
                                <Sw label="Titolo" value={st.title} onChange={(v) => setSt({ title: v })} />
                                <Sw label="Corsie" value={st.lanes} onChange={(v) => setSt({ lanes: v })} />
                                <Sw label="Marcatori" value={st.ladder} onChange={(v) => setSt({ ladder: v })} />
                                <Sw label="Bande" value={st.marks} onChange={(v) => set({ style: { ...(g.style || {}), marks: v }, marks: marks.map((m) => ({ ...m, color: undefined })) })} />
                            </div>
                            <Rng icon="text" label="Dimensione etichette corsie" value={st.size} min={8} max={20} step={0.5} onChange={(v) => setSt({ size: v })} />
                            <Rng icon="text" label="Dimensione marcatori e bande" value={st.size2} min={8} max={18} step={0.5} onChange={(v) => setSt({ size2: v })} />
                            <div className="lab-row"><Btn icon="undo" label="Colori e dimensioni di partenza" onClick={() => set({ style: {} })} /></div>
                        </Group>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
};

const n0 = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
