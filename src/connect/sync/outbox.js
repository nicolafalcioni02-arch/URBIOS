// Coda in uscita persistente (modello at-least-once, SEC-18/84/85/86). Stati: queued → sent → acked.
// Un messaggio resta in coda finché arriva la conferma APPLICATIVA (`ack`): cancellarlo dal broker non è una prova.
// Backoff esponenziale con tetto, priorità, limiti di lunghezza e dimensione. Lo stato è serializzabile
// (va cifrato altrove). Il tempo è iniettato (testabile).
const MAX_QUEUE = 1000;

export const createOutbox = ({ baseDelayMs = 2000, maxDelayMs = 3600_000, maxAttempts = 12, maxBytes = 1024 * 1024 } = {}) => {
    const items = new Map();   // ref -> { ref, payload(Uint8Array), priority, state, attempts, nextAt, createdAt }
    const delay = (n) => Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, n - 1));
    return {
        enqueue(ref, payload, { priority = 5, now }) {
            if (items.has(ref)) return false;               // idempotente
            if (items.size >= MAX_QUEUE) throw new Error('coda piena');
            if (payload.length > maxBytes) throw new Error('messaggio troppo grande');
            items.set(ref, { ref, payload, priority, state: 'queued', attempts: 0, nextAt: now, createdAt: now });
            return true;
        },
        // Messaggi da (re)inviare ora, per priorità (0 = più urgente) poi per età.
        due: (now) => [...items.values()].filter((i) => i.state !== 'acked' && i.nextAt <= now && i.attempts < maxAttempts)
            .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt),
        markSent(ref, now) {
            const i = items.get(ref); if (!i || i.state === 'acked') return;
            i.attempts++; i.state = 'sent'; i.nextAt = now + delay(i.attempts);
        },
        ack(ref) { return items.delete(ref); },              // conferma ricevuta ⇒ fine
        failed: () => [...items.values()].filter((i) => i.attempts >= maxAttempts).map((i) => i.ref),
        size: () => items.size,
        refs: () => [...items.keys()],
        snapshot: () => [...items.values()].map((i) => ({ ...i, payload: Array.from(i.payload) })),
        restore(arr) { items.clear(); for (const i of arr) items.set(i.ref, { ...i, payload: Uint8Array.from(i.payload) }); },
    };
};
