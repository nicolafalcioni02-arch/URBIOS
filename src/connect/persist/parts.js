// Adattatori tra i componenti di connect/ e persistence. Ogni componente resta cieco alla persistenza.
import { restoreSession } from '../ratchet/restore.js';

export const ratchetPart = (holder) => ({
    sessionBound: true,
    snapshot: () => (holder.session ? holder.session.exportState() : null),
    restore: (s) => { holder.session = s ? restoreSession(s) : null; },
    reset: () => { holder.session = null; },
});

// Per replay, outbox, mailbox, docStore: oggetti con snapshot()/restore(); `fresh()` ricrea lo stato vuoto.
export const simplePart = (obj, { sessionBound, empty }) => ({
    sessionBound,
    snapshot: () => obj.snapshot(),
    restore: (s) => obj.restore(s),
    reset: () => obj.restore(empty),
});
