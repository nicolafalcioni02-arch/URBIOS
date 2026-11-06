// Scrivania laterale della schermata principale: due colonne FISSE (non scorrono con la pagina), a griglia.
// Si trascina un widget direttamente (nessuna pressione prolungata), si ridimensiona dai lati/angoli come una
// figura di Word (1×1, 2×1, 3×2…) e lo si lascia dove si vuole. "Widget" in alto apre la modifica (tremolio
// stile iOS, cassetto, toni, rimozione). Solo desktop: sotto i 1360px di larghezza il dock sparisce.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { widgetsFor, widgetByType, sizeIn, minIn, fixedIn } from './widgetCatalog';
import { useWidgetStore } from './useWidgetStore';
import { COLS, PADX, PADY, geom, pixelRect, isFree, nearestFree, firstFree } from './grid';
import { WidgetItem } from './WidgetItem';
import { WidgetPicker } from './WidgetPicker';
import { widgetStyles } from './widgetStyles';

const LONG_PRESS_MS = 550;
const NODRAG = 'input,textarea,select,button,a,[data-wd-nodrag]';

const Rail = ({ reserve, band, list, side, store, db, onOpenAgenda, editing, drag, ghost, preview, setRef, onItemDown, onHandleDown, rows, onRows }) => {
    const ref = useRef(null);
    const [g, setG] = useState({ pitch: 60, rows: 10, left: 0, top: 0, width: 240, height: 800 });
    const [picker, setPicker] = useState(false);
    const [notice, setNotice] = useState('');
    const plusRef = useRef(null);
    const items = store.lists[side];

    useLayoutEffect(() => {
        setRef(side, ref.current);
        const el = ref.current;
        const upd = () => {
            const ng = geom(el);
            setG(ng);
            onRows(side, ng.rows);
        };
        upd();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(upd);
        ro.observe(el);
        return () => ro.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // widget nuovi (o salvati con un formato vecchio): primo posto libero; se non c'è, la colonna è piena
    useLayoutEffect(() => {
        // i widget a misura bloccata tornano alla loro misura (anche se erano stati salvati ridimensionati)
        // colonne basse (fascia del laboratorio): il widget si rimpicciolisce in altezza per starci
        const fitSize = (d, w, h) => (h > g.rows ? [fixedIn(d, band) ? Math.max(minIn(d, band)[0], Math.round((w * g.rows) / h)) : w, g.rows] : [w, h]);
        const wrongSize = (i) => {
            const d = widgetByType(i.type);
            if (!d || !fixedIn(d, band)) return false;
            const [w, h] = fitSize(d, ...sizeIn(d, band));
            return i.w !== w || i.h !== h;
        };
        const fresh = items.filter((i) => i.c == null || i.r == null || !i.w || wrongSize(i));
        if (!fresh.length) return;
        const placed = items.filter((i) => i.c != null && i.r != null && i.w && !wrongSize(i));
        const updates = {};
        const gone = [];
        fresh.forEach((it) => {
            const def = widgetByType(it.type);
            const [w, h] = def ? fitSize(def, ...(fixedIn(def, band) ? sizeIn(def, band) : [it.w || sizeIn(def, band)[0], it.h || sizeIn(def, band)[1]])) : [2, 2];
            const spot = firstFree(placed, g.rows, w, h);
            if (!spot) {
                gone.push(it.id);
                return;
            }
            updates[it.id] = { ...spot, w, h };
            placed.push({ ...it, ...spot, w, h });
        });
        if (Object.keys(updates).length) store.patchItems(updates);
        if (gone.length) {
            gone.forEach((id) => store.remove(id));
            setNotice('Colonna piena: fai spazio o ridimensiona i widget');
            setTimeout(() => setNotice(''), 3500);
        }
    }, [items, g.rows]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <aside
            ref={ref}
            data-pitch={band ? 60 : undefined}
            data-reserve={reserve || undefined}
            className={`wd-rail wd-${side} ${items.length === 0 ? 'empty' : ''} ${drag ? 'armed' : ''}`}
            style={{ '--wd-reserve': `${reserve || 0}px`, '--wd-pitch': `${g.pitch}px`, '--wd-padx': `${PADX}px`, '--wd-pady': `${PADY}px` }}
            aria-label={side === 'left' ? 'Scrivania sinistra' : 'Scrivania destra'}
        >
            {items
                .filter((it) => it.c != null && it.r != null && it.w)
                .map((it, n) => {
                    const raw = preview && preview.id === it.id ? { ...it, ...preview.box } : it;
                    const hh = Math.min(raw.h, g.rows);
                    const box = { ...raw, h: hh, r: Math.max(0, Math.min(raw.r, g.rows - hh)) }; // colonne più basse: il widget resta in vista
                    return (
                        <WidgetItem
                            key={it.id}
                            item={it}
                            rect={pixelRect(g, box)}
                            editing={editing}
                            lift={drag && drag.id === it.id ? drag : null}
                            onItemDown={onItemDown}
                            onHandleDown={onHandleDown}
                            store={store}
                            db={db}
                            onOpenAgenda={onOpenAgenda}
                            index={n}
                        />
                    );
                })}
            {ghost && ghost.side === side && <div className={`wd-ghost ${ghost.invalid ? 'bad' : ''}`} style={pixelRect(g, ghost)} />}
            <div className="wd-add">
                <button ref={plusRef} className="wd-plus" onClick={() => setPicker((v) => !v)} aria-label="Aggiungi un widget">
                    <i className="ph ph-plus" />
                </button>
                {notice && <p className="wd-notice">{notice}</p>}
            </div>
            {picker && (
                <WidgetPicker
                    list={list}
                    below={!!band}
                    hint={band ? 'Per modificare un widget, tieni premuto su di esso' : ''}
                    anchor={plusRef.current}
                    onClose={() => setPicker(false)}
                    onPick={(type) => {
                        store.add(side, type);
                        setPicker(false);
                    }}
                />
            )}
        </aside>
    );
};

export const WidgetDock = ({ db, onUpdateDb, editing, onEditingChange, onOpenAgenda, mode = 'home', top = 6, hidden = false, reserve = 0 }) => {
    const lab = mode === 'lab'; // Laboratorio: una sola colonna a destra, widget propri (db.widgetsLab)
    const list = widgetsFor(mode);
    const store = useWidgetStore(db, onUpdateDb, lab ? 'widgetsLab' : 'widgets');
    const storeRef = useRef(store);
    storeRef.current = store;
    const rails = useRef({});
    const rowsRef = useRef({ left: 10, right: 10 });
    const [drag, setDrag] = useState(null); // { id, dx, dy } mentre si trascina un widget già presente
    const [ghost, setGhost] = useState(null);
    const [preview, setPreview] = useState(null); // { id, box } mentre si ridimensiona
    const [tray, setTray] = useState(null); // { type, x, y } widget del cassetto che segue il mouse
    const ghostRef = useRef(null);
    const previewRef = useRef(null);
    const press = useRef(null);
    // Laboratorio, in modifica: tutto lo schermo si scurisce tranne la fascia dei widget e il cassetto appena sotto
    const dockRef = useRef(null);
    const [hole, setHole] = useState(null);
    const shaded = lab && editing;
    useLayoutEffect(() => {
        if (!shaded) return setHole(null);
        const upd = () => {
            const d = dockRef.current && dockRef.current.getBoundingClientRect();
            const t = dockRef.current && dockRef.current.querySelector('.wd-tray');
            const tr = t && t.getBoundingClientRect();
            if (d) setHole({ band: [d.left, d.top, d.right, d.bottom], tray: null });
        };
        upd();
        const raf = requestAnimationFrame(upd); // il cassetto compare dopo il primo disegno
        window.addEventListener('resize', upd);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', upd); };
    }, [shaded]);

    useEffect(() => {
        if (!editing) return undefined;
        const onKey = (e) => e.key === 'Escape' && onEditingChange(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [editing, onEditingChange]);

    const setGhostBoth = (v) => {
        ghostRef.current = v;
        setGhost(v);
    };
    const setPreviewBoth = (v) => {
        previewRef.current = v;
        setPreview(v);
    };
    const placedOf = (side) => storeRef.current.lists[side].filter((i) => i.c != null && i.r != null && i.w);

    // quale colonna sta sotto il puntatore (con un po' di tolleranza)
    const railAt = (x, y) => {
        for (const side of ['left', 'right']) {
            const el = rails.current[side];
            if (!el) continue;
            const r = el.getBoundingClientRect();
            if (x >= r.left - 28 && x <= r.right + 28 && y >= r.top - 28 && y <= r.bottom + 28) return { side, g: geom(el) };
        }
        return null;
    };

    // trascinamento comune: sposta un widget presente, oppure ne porta uno nuovo dal cassetto
    const beginDrag = (e, spec) => {
        if (e.button !== 0) return;
        const sx = e.clientX;
        const sy = e.clientY;
        let begun = false;
        const el = spec.item ? document.querySelector(`[data-wd-id="${spec.item.id}"]`) : null;
        const startRect = el ? el.getBoundingClientRect() : null;
        const size = spec.item ? [spec.item.w, spec.item.h] : sizeIn(widgetByType(spec.type), lab);

        const onMove = (ev) => {
            const dx = ev.clientX - sx;
            const dy = ev.clientY - sy;
            if (!begun) {
                if (Math.hypot(dx, dy) < 5) return;
                begun = true;
                document.body.classList.add('wd-dragging');
            }
            if (spec.item) setDrag({ id: spec.item.id, dx, dy });
            else setTray({ type: spec.type, x: ev.clientX, y: ev.clientY });
            const hit = railAt(ev.clientX, ev.clientY);
            if (!hit) return setGhostBoth(null);
            const [w, h] = size;
            // cella dell'angolo in alto a sinistra del widget trascinato
            const tlx = spec.item ? startRect.left + dx : ev.clientX - (w * hit.g.pitch) / 2;
            const tly = spec.item ? startRect.top + dy : ev.clientY - (h * hit.g.pitch) / 2;
            const want = { c: Math.round((tlx - hit.g.left - PADX - (hit.g.off || 0)) / hit.g.pitch), r: Math.round((tly - hit.g.top - PADY) / hit.g.pitch), w, h };
            const found = nearestFree(placedOf(hit.side), hit.g.rows, want, spec.item && spec.item.id);
            setGhostBoth(found ? { side: hit.side, ...found, w, h } : { side: hit.side, c: Math.max(0, Math.min(COLS - w, want.c)), r: Math.max(0, Math.min(hit.g.rows - h, want.r)), w, h, invalid: true });
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.classList.remove('wd-dragging');
            const gh = ghostRef.current;
            if (begun && gh && !gh.invalid) {
                if (spec.item) storeRef.current.move(spec.item.id, gh.side, { c: gh.c, r: gh.r });
                else storeRef.current.add(gh.side, spec.type, { c: gh.c, r: gh.r });
            }
            setDrag(null);
            setTray(null);
            setGhostBoth(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // pressione su un widget: trascinamento immediato; tenendo premuto fermi si entra in modifica
    const onItemDown = (e, item) => {
        if (e.button !== 0 || e.target.closest('.wd-h,.wd-remove,.wd-bar')) return;
        const interactive = e.target.closest(NODRAG);
        if (!editing) {
            const x = e.clientX;
            const y = e.clientY;
            const cancel = () => {
                clearTimeout(press.current);
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', cancel);
            };
            const move = (ev) => Math.hypot(ev.clientX - x, ev.clientY - y) > 6 && cancel();
            if (!interactive) {
                press.current = setTimeout(() => {
                    cancel();
                    onEditingChange(true);
                }, LONG_PRESS_MS);
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', cancel);
            }
        }
        if (!interactive) {
            e.preventDefault();
            beginDrag(e, { item });
        }
    };

    // maniglie di ridimensionamento: spostando il bordo si cambia il numero di celle
    const onHandleDown = (e, item, dir) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const side = storeRef.current.lists.left.some((i) => i.id === item.id) ? 'left' : 'right';
        const def = widgetByType(item.type);
        const [minW, minH] = minIn(def, lab);
        const sx = e.clientX;
        const sy = e.clientY;
        document.body.classList.add('wd-dragging', 'wd-resizing');
        const onMove = (ev) => {
            const g = geom(rails.current[side]);
            const dc = Math.round((ev.clientX - sx) / g.pitch);
            const dr = Math.round((ev.clientY - sy) / g.pitch);
            let { c, r, w, h } = item;
            if (dir.r) w = Math.min(COLS - item.c, Math.max(minW, item.w + dc));
            if (dir.l) {
                const k = Math.max(-item.c, Math.min(item.w - minW, dc));
                c = item.c + k;
                w = item.w - k;
            }
            if (dir.b) h = Math.min(g.rows - item.r, Math.max(minH, item.h + dr));
            if (dir.t) {
                const k = Math.max(-item.r, Math.min(item.h - minH, dr));
                r = item.r + k;
                h = item.h - k;
            }
            const box = { c, r, w, h };
            if (isFree(placedOf(side), g.rows, box, item.id)) setPreviewBoth({ id: item.id, box });
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.classList.remove('wd-dragging', 'wd-resizing');
            const pv = previewRef.current;
            if (pv) storeRef.current.patchItems({ [pv.id]: pv.box });
            setPreviewBoth(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const railProps = {
        store,
        db,
        onOpenAgenda,
        editing,
        drag: drag || tray,
        ghost,
        preview,
        setRef: (s, el) => (rails.current[s] = el),
        onItemDown,
        onHandleDown,
        rows: rowsRef.current,
        onRows: (s, n) => (rowsRef.current[s] = n),
    };
    const trayDef = tray && widgetByType(tray.type);
    if (hidden) return null;
    return (
        <div ref={dockRef} className={`wd-dock ${mode === 'patient' ? 'patient' : ''} ${lab ? 'lab' : ''} ${editing ? 'is-editing' : ''}`} style={{ '--wd-top': `${top}px` }}>
            <style>{widgetStyles}</style>
            {hole && createPortal(
                <div className="wd-labshade" aria-hidden="true" onPointerDown={() => onEditingChange(false)}
                    style={{ clipPath: `path(evenodd, 'M0 0H${window.innerWidth}V${window.innerHeight}H0Z ${[hole.band, hole.tray].filter(Boolean).map(([l, t, r, b]) => `M${l} ${t}H${r}V${b}H${l}Z`).join(' ')}')` }} />,
                document.body
            )}
            {!lab && <Rail list={list} side="left" {...railProps} />}
            <Rail reserve={reserve} band={lab} list={list} side="right" {...railProps} />
            {editing && (lab ? createPortal(
                <div className={`wd-tray${lab ? ' in-lab' : ''}`} style={lab && hole ? { top: hole.band[3] + 10 } : undefined} role="toolbar" aria-label="Strumenti">
                    <span className="wd-tray-hint">Trascina uno strumento su una colonna</span>
                    {list.map((w) => (
                        <div key={w.type} className="wd-tile" onMouseDown={(e) => e.preventDefault()} onPointerDown={(e) => {
                                e.preventDefault(); // niente selezione di testo mentre si trascina
                                beginDrag(e, { type: w.type });
                            }}>
                            <i className={`ph ${w.icon}`} />
                            <span>{w.label}</span>
                        </div>
                    ))}
                    <button className="wd-done" onClick={() => onEditingChange(false)}>
                        Fine
                    </button>
                </div>,
                document.body
            ) : (
                <div className={`wd-tray${lab ? ' in-lab' : ''}`} style={lab && hole ? { top: hole.band[3] + 10 } : undefined} role="toolbar" aria-label="Strumenti">
                    <span className="wd-tray-hint">Trascina uno strumento su una colonna</span>
                    {list.map((w) => (
                        <div key={w.type} className="wd-tile" onMouseDown={(e) => e.preventDefault()} onPointerDown={(e) => {
                                e.preventDefault(); // niente selezione di testo mentre si trascina
                                beginDrag(e, { type: w.type });
                            }}>
                            <i className={`ph ${w.icon}`} />
                            <span>{w.label}</span>
                        </div>
                    ))}
                    <button className="wd-done" onClick={() => onEditingChange(false)}>
                        Fine
                    </button>
                </div>
            ))}
            {tray && trayDef && (
                <div className="wd-fly" style={{ left: tray.x, top: tray.y }}>
                    <i className={`ph ${trayDef.icon}`} />
                    <span>{trayDef.label}</span>
                </div>
            )}
        </div>
    );
};
