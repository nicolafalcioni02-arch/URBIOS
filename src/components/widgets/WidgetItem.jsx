// Un widget nella colonna: scheda scalata per riempire il riquadro w×h, maniglie di ridimensionamento sui lati
// (come una figura di Word) e, in modifica, il pallino "−" e la barra dei toni.
import React, { useLayoutEffect, useRef, useState } from 'react';
import { widgetByType, fitIn, fixedIn } from './widgetCatalog';
import { TONES, toneVars } from './tones';

export const DESIGN_W = 220; // larghezza di progetto dei widget: poi si scala per riempire il riquadro
const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const DIRS = { n: { t: 1 }, s: { b: 1 }, e: { r: 1 }, w: { l: 1 }, ne: { t: 1, r: 1 }, nw: { t: 1, l: 1 }, se: { b: 1, r: 1 }, sw: { b: 1, l: 1 } };

// Scala il contenuto (largo DESIGN_W) dentro il riquadro: 'contain' = ci sta tutto, 'width' = riempie la larghezza e scorre.
const Fit = ({ w, h, mode, children }) => {
    const inner = useRef(null);
    const [natH, setNatH] = useState(200);
    useLayoutEffect(() => {
        const el = inner.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(() => setNatH(el.offsetHeight || 200));
        ro.observe(el);
        setNatH(el.offsetHeight || 200);
        return () => ro.disconnect();
    }, []);
    const zw = w / DESIGN_W;
    const z = mode === 'contain' ? Math.max(0.3, Math.min(zw, h / natH)) : Math.max(0.3, zw);
    const left = (w - DESIGN_W * z) / 2;
    const top = mode === 'contain' ? Math.max(0, (h - natH * z) / 2) : 0;
    return (
        <div className={`wd-fit ${mode === 'contain' ? '' : 'scroll'}`}>
            <div style={{ position: 'relative', width: '100%', height: mode === 'contain' ? '100%' : natH * z }}>
                <div ref={inner} className="wd-fit-in" style={{ width: DESIGN_W, transform: `scale(${z})`, left, top }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export const WidgetItem = ({ item, rect, editing, lift, onItemDown, onHandleDown, store, db, onOpenAgenda, index }) => {
    const def = widgetByType(item.type);
    if (!def) return null;
    const { Component } = def;
    const lab = !!(db && db.labOv);
    return (
        <div
            className={`wd-item ${editing ? 'editing' : ''} ${lift ? 'is-lifted' : ''}`}
            data-wd-id={item.id}
            onPointerDown={(e) => onItemDown(e, item)}
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, '--wd-delay': `${-((index * 97) % 260)}ms`, transform: lift ? `translate(${lift.dx}px, ${lift.dy}px)` : undefined }}
        >
            <div className="wd-jig">
                <div className="wd-box" style={toneVars(item.tone)}>
                    {fitIn(def, lab) === 'fill' ? (
                        <div className="wd-fit wd-fill">
                            <Component id={item.id} data={store.data[item.id] || {}} setData={(patch) => store.setData(item.id, patch)} db={db} tone={item.tone} onOpenAgenda={onOpenAgenda} />
                        </div>
                    ) : (
                    <Fit w={rect.width} h={rect.height} mode={fitIn(def, lab)}>
                        <Component id={item.id} data={store.data[item.id] || {}} setData={(patch) => store.setData(item.id, patch)} db={db} tone={item.tone} onOpenAgenda={onOpenAgenda} />
                    </Fit>
                    )}
                </div>
            </div>
            {editing && (
                <>
                    {!fixedIn(def, lab) && HANDLES.map((d) => (
                        <span key={d} className={`wd-h wd-h-${d}`} onPointerDown={(e) => onHandleDown(e, item, DIRS[d])} aria-hidden="true" />
                    ))}
                    <button className="wd-remove" onClick={() => store.remove(item.id)} aria-label="Togli il widget">
                        <i className="ph-bold ph-minus" />
                    </button>
                    <div className="wd-bar" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="wd-dots">
                            {TONES.map((t) => (
                                <button key={t.id} title={t.label} aria-label={`Tono ${t.label}`} className={item.tone === t.id ? 'on' : ''} style={{ background: t.bg }} onClick={() => store.setItem(item.id, { tone: t.id })} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
