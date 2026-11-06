// Geometria della griglia delle colonne: 4 celle in larghezza, righe quadrate quanto la cella.
// Un widget occupa w×h celle (1×1, 2×1, 3×2, 3×4…) e non può sovrapporsi agli altri.
export let COLS = 4; // in fascia (Laboratorio, data-pitch) cambia con la larghezza
export const PADX = 14;
export const PADY = 14;
export const PADB = 64; // spazio in fondo per il "+"
export const GAPPX = 10; // spazio visivo tra due widget

export const geom = (el) => {
    const r = el.getBoundingClientRect();
    const band = +el.dataset.pitch; // fascia orizzontale: celle di misura fissa, tante colonne quante ne entrano
    if (band) {
        const off = +el.dataset.reserve || 0;
        COLS = Math.max(4, Math.floor((el.clientWidth - off - PADX * 2) / band)); // reserve: larghezza non usabile (come nelle schede, dove la fascia è più stretta)
        return { left: r.left, top: r.top, width: r.width, height: r.height, pitch: band, off, rows: Math.max(1, Math.floor((el.clientHeight - PADY * 2) / band)) };
    }
    COLS = 4;
    const pitch = (el.clientWidth - PADX * 2) / COLS;
    return { left: r.left, top: r.top, width: r.width, height: r.height, pitch, rows: Math.max(1, Math.floor((el.clientHeight - PADY - PADB) / pitch)) };
};

export const pixelRect = (g, b) => ({ left: PADX + (g.off || 0) + b.c * g.pitch, top: PADY + b.r * g.pitch, width: b.w * g.pitch - GAPPX, height: b.h * g.pitch - GAPPX });

const overlap = (a, b) => a.c < b.c + b.w && b.c < a.c + a.w && a.r < b.r + b.h && b.r < a.r + a.h;

export const isFree = (items, rows, box, ignoreId) =>
    box.c >= 0 && box.r >= 0 && box.c + box.w <= COLS && box.r + box.h <= rows && items.every((it) => it.id === ignoreId || it.c == null || !overlap(it, box));

// posto libero più vicino alla cella desiderata (null se la colonna non ha spazio)
export const nearestFree = (items, rows, box, ignoreId) => {
    let best = null;
    for (let r = 0; r + box.h <= rows; r++)
        for (let c = 0; c + box.w <= COLS; c++) {
            const cand = { ...box, c, r };
            if (!isFree(items, rows, cand, ignoreId)) continue;
            const d = Math.abs(c - box.c) + Math.abs(r - box.r);
            if (!best || d < best.d) best = { ...cand, d };
        }
    return best && { c: best.c, r: best.r };
};

// primo posto libero in ordine di lettura (alto-sinistra → basso-destra)
export const firstFree = (items, rows, w, h) => nearestFree(items, rows, { c: 0, r: 0, w, h });
