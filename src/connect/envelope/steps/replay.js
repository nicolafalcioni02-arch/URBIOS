// Passi 8-10: contatore monotono con finestra (tollera riordino), unicità id messaggio (SEC-54/55).
// `check` NON modifica nulla; `commit` si chiama solo dopo la persistenza riuscita.
// Backup ripristinato ⇒ lo stato torna indietro: dopo un restore NON si riusa la sessione
// (serve nuova sessione autenticata, SEC-45), altrimenti i replay recenti tornerebbero accettabili.
const MAX_JUMP = 10000;

export const createReplayState = ({ window = 64, retentionMs = 72 * 3600 * 1000 } = {}) => {
    const lanes = new Map();   // "sender|session" -> { high, seen:Set }
    const ids = new Map();     // msgId -> ts
    const lane = (s, ses) => lanes.get(`${s}|${ses}`);
    return {
        check(sender, session, ctr, msgId) {
            if (ids.has(msgId)) throw new Error('replay');
            const l = lane(sender, session);
            if (!l) return;
            if (ctr > l.high + MAX_JUMP) throw new Error('replay');
            if (ctr <= l.high - window || l.seen.has(ctr)) throw new Error('replay');
        },
        commit(sender, session, ctr, msgId, now) {
            const k = `${sender}|${session}`;
            const l = lanes.get(k) || { high: -1, seen: new Set() };
            l.seen.add(ctr);
            if (ctr > l.high) l.high = ctr;
            for (const c of l.seen) if (c <= l.high - window) l.seen.delete(c);
            lanes.set(k, l);
            ids.set(msgId, now);
            for (const [id, t] of ids) if (t < now - retentionMs) ids.delete(id);
        },
        snapshot: () => ({ lanes: [...lanes].map(([k, l]) => [k, l.high, [...l.seen]]), ids: [...ids] }),
        restore(s) {
            lanes.clear(); ids.clear();
            for (const [k, high, seen] of s.lanes) lanes.set(k, { high, seen: new Set(seen) });
            for (const [id, t] of s.ids) ids.set(id, t);
        },
    };
};
