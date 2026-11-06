// Archivio documenti lato ricevente (paziente). Regole (SEC-73/74/75), nessuna perdita silenziosa:
//  - si accetta solo da mittenti autorizzati (`allowedSenders`), PRIMA di toccare lo stato
//  - rev maggiore ⇒ nuova versione corrente; rev uguale e contenuto uguale ⇒ idempotente (no-op)
//  - rev uguale ma contenuto DIVERSO ⇒ conflitto: si conservano entrambe, si segnala, nessuna sostituzione
//  - rev minore ⇒ conservata nella storia, non diventa corrente
//  - ritiro: segna la revisione come ritirata, il contenuto resta nella storia
import { canonicalBytes } from '../crypto/canonical.js';

const MAX_DOCS = 500, MAX_VERSIONS = 200;
const same = (a, b) => { const x = canonicalBytes(a), y = canonicalBytes(b); return x.length === y.length && x.every((v, i) => v === y[i]); };

export const createDocStore = ({ allowedSenders }) => {
    const docs = new Map();    // docId -> { versions: Map rev -> content, current, withdrawn:Set, conflicts:[] }
    const events = [];
    const get = (id) => docs.get(id);
    return {
        apply(msg, from) {
            if (!allowedSenders.has(from)) { events.push({ type: 'rejected', from }); return { status: 'unauthorized' }; }
            if (msg.t === 'doc.put') {
                let d = get(msg.docId);
                if (!d) {
                    if (docs.size >= MAX_DOCS) return { status: 'limit' };
                    d = { kind: msg.kind, versions: new Map(), current: 0, withdrawn: new Set(), conflicts: [] };
                    docs.set(msg.docId, d);
                }
                if (d.kind !== msg.kind) return { status: 'kind-mismatch' };
                const content = { title: msg.title, body: msg.body, at: msg.at, parentRev: msg.parentRev };
                const prev = d.versions.get(msg.rev);
                if (prev) {
                    if (same(prev, content)) return { status: 'duplicate' };
                    d.conflicts.push({ rev: msg.rev, content });
                    events.push({ type: 'conflict', docId: msg.docId, rev: msg.rev });
                    return { status: 'conflict' };
                }
                if (d.versions.size >= MAX_VERSIONS) return { status: 'limit' };
                d.versions.set(msg.rev, content);
                if (msg.rev > d.current) d.current = msg.rev;
                return { status: msg.rev === d.current ? 'applied' : 'stored-old' };
            }
            if (msg.t === 'doc.withdraw') {
                const d = get(msg.docId);
                if (!d || !d.versions.has(msg.rev)) return { status: 'unknown' };
                d.withdrawn.add(msg.rev);
                return { status: 'withdrawn' };
            }
            return { status: 'ignored' };
        },
        // Vista per l'interfaccia: documento corrente non ritirato.
        current(docId) {
            const d = get(docId);
            if (!d || d.withdrawn.has(d.current)) return null;
            return { docId, kind: d.kind, rev: d.current, ...d.versions.get(d.current) };
        },
        list: () => [...docs.keys()].map((id) => get(id) && { docId: id, kind: get(id).kind, rev: get(id).current }),
        conflicts: () => [...docs].flatMap(([id, d]) => d.conflicts.map((c) => ({ docId: id, ...c }))),
        events: () => events.slice(),
        snapshot: () => ({ docs: [...docs].map(([id, d]) => [id, d.kind, [...d.versions], d.current, [...d.withdrawn], d.conflicts]) }),
        restore(s) {
            docs.clear();
            for (const [id, kind, v, current, w, conflicts] of s.docs) docs.set(id, { kind, versions: new Map(v), current, withdrawn: new Set(w), conflicts });
        },
    };
};
