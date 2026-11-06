// Salvataggio/ripristino atomico dello stato di connect/ (SEC-45, SEC-55, SEC-101).
// parts: { nome: { snapshot(): oggetto JSON, restore(obj), reset(), sessionBound: bool } }
//   sessionBound = vale solo per la sessione crittografica corrente (ratchet, anti-replay, coda in uscita, cursori).
// Anti-rollback: due posti — il blob (`state`) e un'àncora locale al dispositivo (`anchor`) con la generazione.
//   blob.gen  <  anchor  ⇒ ripristino di un backup vecchio ⇒ NUOVA SESSIONE (le parti sessionBound si azzerano)
//   anchor assente        ⇒ dispositivo nuovo / dati locali persi ⇒ stesso trattamento
// Ordine di scrittura: prima il blob, poi l'àncora (un crash in mezzo non genera falsi allarmi).
// LIMITE: se un attaccante ripristina ENTRAMBI (blob e àncora) il rollback non è rilevabile da qui.
import { sealState, openState } from './stateBox.js';

const STATE = 'state', ANCHOR = 'anchor';

export const createPersistence = ({ kv, parts, getDek }) => {
    let gen = 0;
    return {
        get generation() { return gen; },
        async save() {
            const next = gen + 1;
            const obj = {};
            for (const [n, p] of Object.entries(parts)) obj[n] = p.snapshot();
            const dek = getDek();
            await kv.put(STATE, await sealState(dek, STATE, next, obj));
            await kv.put(ANCHOR, await sealState(dek, ANCHOR, next, { gen: next }));
            gen = next;
        },
        // Ritorna { status: 'empty'|'ok'|'rollback'|'fresh', resetParts: [...] }. Errori di cifratura/forma ⇒ eccezione
        // (DEK sbagliata o dati manomessi): il chiamante NON deve proseguire come se nulla fosse.
        async load() {
            const blob = await kv.get(STATE);
            if (!blob) { gen = 0; return { status: 'empty', resetParts: [] }; }
            const { gen: g, obj } = await openState(getDek(), STATE, blob);
            const a = await kv.get(ANCHOR);
            const anchorGen = a ? (await openState(getDek(), ANCHOR, a)).obj.gen : -1;
            const lost = anchorGen < 0 ? 'fresh' : g < anchorGen ? 'rollback' : 'ok';
            const resetParts = [];
            for (const [n, p] of Object.entries(parts)) {
                if (lost !== 'ok' && p.sessionBound) { p.reset(); resetParts.push(n); }
                else if (obj[n] !== undefined) p.restore(obj[n]);
                else p.reset();
            }
            gen = Math.max(g, anchorGen);
            return { status: lost, resetParts };
        },
        async wipe() { await kv.delete(STATE); await kv.delete(ANCHOR); gen = 0; },
    };
};
