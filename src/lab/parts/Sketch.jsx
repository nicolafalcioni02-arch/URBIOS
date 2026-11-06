import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';

// Appunti a mano: scrivi o disegna con il dito (o la Apple Pencil), anche sopra una foto.
// Strumenti: penna, evidenziatore, gomma, forme (linea, freccia, rettangolo, ellisse), testo, forbici (ritaglia / taglia via un'area).
// Si salva come immagine (`img`, si stampa) + `tratti` (i segni, per riprenderli e correggerli) + `orig` (la foto sotto).
const INK = [['#121317', 'Nero'], ['#1F4FD8', 'Blu'], ['#D4281F', 'Rosso'], ['#1E8E3E', 'Verde'], ['#E8710A', 'Arancio'], ['#7B3FD1', 'Viola'], ['#F2C200', 'Giallo'], ['#E5539B', 'Rosa']];
const SIZES = [['Sottile', 3], ['Medio', 7], ['Grosso', 15]];
const SHAPES = [['line', 'Linea'], ['arrow', 'Freccia'], ['rect', 'Rettangolo'], ['ell', 'Ellisse']];
const TEXT_PX = [32, 56, 96];

// scarica un'immagine (data URL) come file
export const downloadImage = async (url, name) => {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${String(name || 'immagine').replace(/[\\/:*?"<>|]/g, ' ').trim() || 'immagine'}.${/jpeg/.test(blob.type) ? 'jpg' : 'png'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
};
const loadImg = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

const paint = (ctx, s) => {
    ctx.save();
    ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
    ctx.globalAlpha = s.h === true ? 0.38 : 1;
    ctx.strokeStyle = s.c; ctx.fillStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = s.h === true ? 'butt' : 'round'; ctx.lineJoin = 'round';
    if (s.k === 'cut') { ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, s.w, s.hh); }
    else if (s.k === 'text') {
        ctx.font = `600 ${s.fs}px -apple-system, "Helvetica Neue", Arial, sans-serif`; ctx.textBaseline = 'top';
        String(s.t).split('\n').forEach((line, i) => ctx.fillText(line, s.x, s.y + i * s.fs * 1.2));
    } else if (s.k) {
        const [x1, y1] = s.a; const [x2, y2] = s.b;
        ctx.beginPath();
        if (s.k === 'rect') ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
        else if (s.k === 'ell') ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
        else {
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            if (s.k === 'arrow') {
                const ang = Math.atan2(y2 - y1, x2 - x1); const hl = Math.max(18, s.w * 4);
                ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(ang - 0.45), y2 - hl * Math.sin(ang - 0.45));
                ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(ang + 0.45), y2 - hl * Math.sin(ang + 0.45));
            }
        }
        ctx.stroke();
    } else {
        const p = s.p;
        if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], s.w / 2, 0, Math.PI * 2); ctx.fill(); }
        else {
            ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
            for (let i = 1; i < p.length - 1; i += 1) ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
            ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]); ctx.stroke();
        }
    }
    ctx.restore();
};

const norm = (a, b) => ({ x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) });

export const Sketch = ({ initial, onSave, onDelete, onClose }) => {
    const wrap = useRef(null);
    const cv = useRef(null);
    const cur = useRef(null);
    const pen = useRef(false);
    const [dim, setDim] = useState(initial ? { w: initial.w, h: initial.h } : null);
    const [bg, setBg] = useState(initial ? initial.bg : undefined);
    const [view, setView] = useState(null);
    const [strokes, setStrokes] = useState(initial ? initial.tratti : []);
    const [snaps, setSnaps] = useState([]);
    const [redos, setRedos] = useState([]);
    const [penColor, setPenColor] = useState(INK[0][0]);
    const [hlColor, setHlColor] = useState('#F2C200');
    const [size, setSize] = useState(1);
    const [tool, setTool] = useState('pen'); // pen | hl | erase | shape | text | cut
    const [shape, setShape] = useState('rect');
    const [sel, setSel] = useState(null); // area scelta con le forbici
    const [txt, setTxt] = useState(null); // { x, y, t } testo in attesa
    const [ask, setAsk] = useState(false);
    const dirty = useRef(false);
    const all = useRef(strokes); all.current = strokes;
    const erase = tool === 'erase';
    const color = tool === 'hl' ? hlColor : penColor;
    const setColor = (c) => { if (tool === 'hl') setHlColor(c); else { setPenColor(c); if (tool === 'erase') setTool('pen'); } };
    const scale = dim ? dim.w / 1000 : 1;

    useLayoutEffect(() => {
        const r = wrap.current.getBoundingClientRect();
        const d = dim || { w: 1000, h: Math.round((1000 * r.height) / r.width) };
        if (!dim) setDim(d);
        const k = Math.min(r.width / d.w, r.height / d.h);
        setView({ w: Math.floor(d.w * k), h: Math.floor(d.h * k) });
    }, [dim && dim.w, dim && dim.h]); // eslint-disable-line react-hooks/exhaustive-deps

    const redraw = (list, extra) => {
        const c = cv.current; if (!c || !dim) return;
        const ctx = c.getContext('2d'); ctx.clearRect(0, 0, dim.w, dim.h);
        list.forEach((s) => paint(ctx, s));
        if (extra) extra(ctx);
    };
    const selOverlay = (box) => (ctx) => { if (!box) return; ctx.save(); ctx.setLineDash([14 * scale, 10 * scale]); ctx.lineWidth = 3 * scale; ctx.strokeStyle = '#121317'; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore(); };
    useEffect(() => { redraw(strokes, tool === 'cut' && sel ? selOverlay(sel) : null); }, [strokes, dim, view, sel, tool]); // eslint-disable-line react-hooks/exhaustive-deps

    const pos = (e) => { const r = cv.current.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) * dim.w) / r.width), Math.round(((e.clientY - r.top) * dim.h) / r.height)]; };
    const remember = () => { dirty.current = true; setRedos([]); const snap = { strokes: all.current, bg, dim }; setSnaps((l) => [...l, snap]); };
    const push = (s) => { remember(); all.current = [...all.current, s]; setStrokes(all.current); };

    const down = (e) => {
        if (e.pointerType === 'pen') pen.current = true;
        else if (e.pointerType === 'touch' && pen.current) return; // palmo appoggiato mentre si scrive con la penna
        e.preventDefault();
        cv.current.setPointerCapture(e.pointerId);
        const p = pos(e);
        const w = Math.round(SIZES[size][1] * (erase ? 3 : tool === 'hl' ? 4 : 1) * scale);
        if (tool === 'text') { cur.current = null; setTxt({ x: p[0], y: p[1], t: '' }); return; }
        if (tool === 'cut') { cur.current = { cut: true, a: p, b: p }; setSel(null); return; }
        if (tool === 'shape') cur.current = { k: shape, c: color, w: Math.max(2, Math.round(SIZES[size][1] * scale)), a: p, b: p };
        else cur.current = { c: erase ? '#000000' : color, w, e: erase, h: tool === 'hl', p: [p] };
        if (!cur.current.k) paint(cv.current.getContext('2d'), cur.current);
    };
    const move = (e) => {
        const s = cur.current; if (!s) return;
        const q = pos(e);
        if (s.cut) { s.b = q; redraw(all.current, selOverlay(norm(s.a, q))); return; }
        if (s.k) { s.b = q; redraw(all.current, (ctx) => paint(ctx, s)); return; }
        const last = s.p[s.p.length - 1];
        if (Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) < 2) return;
        s.p.push(q);
        if (s.h === true) redraw([...all.current, s]);
        else paint(cv.current.getContext('2d'), { ...s, p: [last, q] });
    };
    const up = () => {
        const s = cur.current; cur.current = null;
        if (!s) return;
        if (s.cut) { const b = norm(s.a, s.b); setSel(b.w > 8 && b.h > 8 ? b : null); return; }
        if (s.k && Math.abs(s.b[0] - s.a[0]) + Math.abs(s.b[1] - s.a[1]) < 6) { redraw(all.current); return; }
        push(s);
    };

    const restore = (s) => { all.current = s.strokes; setStrokes(s.strokes); setBg(s.bg); setDim(s.dim); setSel(null); };
    const undo = () => {
        const s = snaps[snaps.length - 1]; if (!s) return;
        const now = { strokes: all.current, bg, dim }; setRedos((l) => [...l, now]); setSnaps(snaps.slice(0, -1)); restore(s);
    };
    const redo = () => {
        const s = redos[redos.length - 1]; if (!s) return;
        const now = { strokes: all.current, bg, dim }; setSnaps((l) => [...l, now]); setRedos(redos.slice(0, -1)); restore(s);
    };
    const clear = () => { remember(); all.current = []; setStrokes([]); };
    const addText = () => { if (txt && txt.t.trim()) push({ k: 'text', c: color, t: txt.t.trim(), x: txt.x, y: txt.y, fs: Math.round(TEXT_PX[size] * scale) }); setTxt(null); };

    // immagine completa (foto + segni), senza le linee tratteggiate delle forbici
    const compose = async (list = strokes, d = dim, base = bg) => {
        const out = document.createElement('canvas'); out.width = d.w; out.height = d.h;
        const x = out.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, d.w, d.h);
        if (base) { const im = await loadImg(base); if (im) x.drawImage(im, 0, 0, d.w, d.h); }
        const layer = document.createElement('canvas'); layer.width = d.w; layer.height = d.h;
        const lx = layer.getContext('2d'); list.forEach((s) => paint(lx, s));
        x.drawImage(layer, 0, 0);
        return out;
    };
    const flat = async () => (await compose()).toDataURL(bg ? 'image/jpeg' : 'image/png', 0.9);
    const save = async () => onSave({ img: await flat(), ...(bg ? { orig: bg } : {}), tratti: strokes, w: dim.w, h: dim.h });
    const download = async () => downloadImage(await flat(), 'Disegno');

    const cutOut = () => { push({ k: 'cut', x: sel.x, y: sel.y, w: sel.w, hh: sel.h }); setSel(null); };
    const crop = async () => {
        const full = await compose();
        const out = document.createElement('canvas'); out.width = sel.w; out.height = sel.h;
        out.getContext('2d').drawImage(full, sel.x, sel.y, sel.w, sel.h, 0, 0, sel.w, sel.h);
        remember();
        all.current = []; setStrokes([]); setBg(out.toDataURL('image/jpeg', 0.92)); setDim({ w: sel.w, h: sel.h }); setSel(null);
    };
    const close = () => (dirty.current ? setAsk(true) : onClose());

    const TOOLS = [['pen', 'Penna'], ['hl', 'Evidenziatore'], ['erase', 'Gomma'], ['shape', 'Forme'], ['text', 'Testo'], ['cut', 'Forbici']];
    const canSave = strokes.length > 0 || snaps.length > 0;

    return (
        <div className="sk" role="dialog" aria-label="Scrivi o disegna">
            <header className="sk-top">
                <button type="button" className="sk-ib" onClick={close} aria-label="Chiudi"><Icon name="x" size={22} /></button>
                <b>A mano</b>
                <button type="button" className="sk-ib" disabled={!canSave && !bg} onClick={download} aria-label="Scarica"><Icon name="download" size={22} /></button>
                <button type="button" className="sk-save" disabled={!canSave} onClick={save}>Salva</button>
            </header>
            <div className="sk-area" ref={wrap}>
                {view && dim && (
                    <canvas ref={cv} width={dim.w} height={dim.h} className="sk-cv" style={{ width: view.w, height: view.h, ...(bg ? { backgroundImage: `url(${bg})`, backgroundSize: '100% 100%' } : {}) }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
                )}
            </div>
            <div className="sk-tools">
                <div className="sk-colors sk-toolrow" role="group" aria-label="Strumenti">
                    <button type="button" className="sk-ib sk-arrow" onClick={undo} disabled={!snaps.length} aria-label="Annulla l’ultima modifica"><Icon name="undo" size={22} /></button>
                    <button type="button" className="sk-ib sk-arrow" onClick={redo} disabled={!redos.length} aria-label="Rifai la modifica annullata"><Icon name="redo" size={22} /></button>
                    {TOOLS.map(([k, l]) => <button key={k} type="button" className={`sk-t${tool === k ? ' on' : ''}`} onClick={() => { setTool(k); setSel(null); }} aria-pressed={tool === k}>{l}</button>)}
                </div>
                {tool === 'shape' && (
                    <div className="sk-colors sk-toolrow">{SHAPES.map(([k, l]) => <button key={k} type="button" className={`sk-t${shape === k ? ' on' : ''}`} onClick={() => setShape(k)}>{l}</button>)}</div>
                )}
                {tool === 'cut' && (
                    <div className="sk-row">
                        {sel ? (<><button type="button" className="sk-t on" onClick={crop}>Ritaglia qui</button><button type="button" className="sk-t" onClick={cutOut}>Taglia via l’area</button></>) : <span className="sk-hint">Trascina per scegliere un’area</span>}
                    </div>
                )}
                <div className="sk-row">
                    {SIZES.map(([name, w], i) => <button key={name} type="button" className={`sk-s${size === i ? ' on' : ''}`} onClick={() => setSize(i)} aria-label={name}><i style={{ width: w + 4, height: w + 4 }} /></button>)}
                    <button type="button" className="sk-t" onClick={clear} disabled={!strokes.length}>Cancella tutto</button>
                    {onDelete && <button type="button" className="sk-t sk-bad" onClick={onDelete}>Elimina</button>}
                </div>
                {!erase && tool !== 'cut' && (
                    <div className="sk-colors" role="group" aria-label="Colore">
                        {INK.map(([hex, name]) => <button key={hex} type="button" className={`sk-c${color === hex ? ' on' : ''}`} style={{ background: hex }} onClick={() => setColor(hex)} aria-label={name} />)}
                        <label className={`sk-c sk-custom${INK.every((x) => x[0] !== color) ? ' on' : ''}`} style={INK.every((x) => x[0] !== color) ? { background: color } : undefined} aria-label="Altro colore"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
                    </div>
                )}
            </div>
            {txt && (
                <div className="ui-back" style={{ zIndex: 9700 }} onClick={() => setTxt(null)}>
                    <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Testo">
                        <header><h3>Testo</h3><button type="button" onClick={() => setTxt(null)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                        <div className="ui-body">
                            <label className="wh-f wh-big"><span>Cosa scrivi</span><input autoFocus value={txt.t} onChange={(e) => setTxt({ ...txt, t: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') addText(); }} /></label>
                            <p className="wh-note">Colore e grandezza sono quelli scelti sotto (sottile, medio, grosso).</p>
                            <button type="button" className="wh-add" disabled={!txt.t.trim()} onClick={addText}>Aggiungi</button>
                        </div>
                    </div>
                </div>
            )}
            {ask && (
                <div className="ui-back" style={{ zIndex: 9700 }} onClick={() => setAsk(false)}>
                    <div className="ui-sheet" onClick={(e) => e.stopPropagation()}>
                        <header><h3>Scartare le modifiche?</h3></header>
                        <div className="ui-body">
                            <button type="button" className="wh-add" onClick={save}>Salva</button>
                            <button type="button" className="ms-del" onClick={onClose}>Scarta</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
