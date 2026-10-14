// Stato dei widget laterali. Vive nel db (db.widgets), così finisce nel file archivio come tutto il resto.
//   db.widgets = { left: [item...], right: [item...], data: { [id]: <dati del widget> } }
//   item = { id, type, tone, c, r, w, h }   (cella di partenza, larghezza e altezza in celle)
// c/r nulli = widget appena aggiunto: la colonna gli trova il primo posto libero.
import { useCallback, useEffect, useRef, useState } from 'react';
import { widgetByType } from './widgetCatalog';

export const MAX_PER_SIDE = 12;
const newId = () => 'w' + Math.random().toString(36).slice(2, 9);

export const useWidgetStore = (db, onUpdateDb) => {
    const w = (db && db.widgets) || {};
    const lists = { left: Array.isArray(w.left) ? w.left : [], right: Array.isArray(w.right) ? w.right : [] };
    const data = w.data || {};

    const write = useCallback(
        (fn) =>
            onUpdateDb((prev) => {
                const cur = prev.widgets || {};
                const next = fn({ left: [...(cur.left || [])], right: [...(cur.right || [])], data: { ...(cur.data || {}) } });
                return { ...prev, widgets: { ...cur, ...next } };
            }),
        [onUpdateDb]
    );

    const add = useCallback(
        (side, type, pos = {}) =>
            write((s) => {
                const def = widgetByType(type);
                if (!def || s[side].length >= MAX_PER_SIDE) return s;
                s[side].push({ id: newId(), type, tone: def.tone || 'carta', c: pos.c ?? null, r: pos.r ?? null, w: def.size[0], h: def.size[1] });
                return s;
            }),
        [write]
    );

    const remove = useCallback(
        (id) =>
            write((s) => {
                s.left = s.left.filter((x) => x.id !== id);
                s.right = s.right.filter((x) => x.id !== id);
                delete s.data[id];
                return s;
            }),
        [write]
    );

    // sposta un widget (anche da una colonna all'altra)
    const move = useCallback(
        (id, side, pos) =>
            write((s) => {
                let item = null;
                ['left', 'right'].forEach((k) => {
                    const i = s[k].findIndex((x) => x.id === id);
                    if (i < 0) return;
                    if (k !== side && s[side].length >= MAX_PER_SIDE) return;
                    item = s[k][i];
                    s[k].splice(i, 1);
                });
                if (item) s[side].push({ ...item, c: pos.c, r: pos.r });
                return s;
            }),
        [write]
    );

    // aggiorna più widget in una volta sola: { [id]: patch }
    const patchItems = useCallback(
        (updates) =>
            write((s) => {
                ['left', 'right'].forEach((k) => {
                    s[k] = s[k].map((x) => (updates[x.id] ? { ...x, ...updates[x.id] } : x));
                });
                return s;
            }),
        [write]
    );

    const setItem = useCallback((id, patch) => patchItems({ [id]: patch }), [patchItems]);

    const setData = useCallback(
        (id, patch) =>
            write((s) => {
                s.data[id] = { ...(s.data[id] || {}), ...(typeof patch === 'function' ? patch(s.data[id] || {}) : patch) };
                return s;
            }),
        [write]
    );

    return { lists, data, add, remove, move, setItem, patchItems, setData };
};

// Testo che si scrive di continuo (foglietti): lo stato locale è immediato, il salvataggio nel db è ritardato.
export const useDraft = (value, save, delay = 500) => {
    const [local, setLocal] = useState(value);
    const timer = useRef(null);
    const pending = useRef(null);
    const saveRef = useRef(save);
    saveRef.current = save;
    const flush = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        if (pending.current !== null) {
            saveRef.current(pending.current);
            pending.current = null;
        }
    }, []);
    useEffect(() => flush, [flush]);
    const set = (v) => {
        setLocal(v);
        pending.current = v;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(flush, delay);
    };
    return [local, set, flush];
};
