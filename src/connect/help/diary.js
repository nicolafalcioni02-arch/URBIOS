// Diario ANONIMO delle azioni dell'utente nella connettività, per l'aiuto guidato da un'AI (vedi help/prompt.js).
// Regole: tipi chiusi; dettaglio = testo breve ripulito (niente URL completi, niente sequenze lunghe che somigliano a
// codici, chiavi o QR). Mai nomi, password, chiavi, contenuto dei piani. Vive solo in memoria (si perde al ricaricamento).
export const EVENT_TYPES = ['stato', 'finestra', 'informativa', 'attivazione', 'pairing', 'invio', 'ritiro', 'scollega', 'errore', 'aiuto'];
const MAX = 80;

export const scrub = (v) => {
    let s = String(v ?? '').replace(/\s+/g, ' ').trim();
    s = s.replace(/\b(wss?|https?):\/\/([A-Za-z0-9.-]+)(:\d+)?\S*/gi, (_, sch, host) => `${sch.toLowerCase()}://${host}`);   // solo schema e host
    s = s.replace(/[A-Za-z0-9_+\/=-]{20,}/g, '[…]');                                                                   // codici, chiavi, QR
    return s.slice(0, 140);
};

export const createDiary = ({ now = () => Date.now() } = {}) => {
    const items = []; let n = 0;
    return {
        record(type, detail = '') {
            if (!EVENT_TYPES.includes(type)) return;
            items.push({ n: ++n, t: now(), type, d: scrub(detail) });
            if (items.length > MAX) items.shift();
        },
        all: () => items.slice(),
        since: (k) => items.filter((i) => i.n > k),
        last: () => n,
        clear() { items.length = 0; },
    };
};
export const diary = createDiary();
