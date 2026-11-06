// Casella tra due dispositivi: scrive sul topic corrente, interroga i topic attivi, ricorda i cursori.
// La CONSEGNA non è garantita (relay non fidato): completezza, ordine e dedup si verificano ai livelli superiori
// (outbox + ack, replay della busta). Qui: nessun duplicato di item già visti, errori di rete non fatali.
import { sendTopic, listenTopics } from './topics.js';

// Cursore robusto: millisecondo dell'ultimo id meno 1 (il relay confronta id > cursore; stesso ms ⇒ ordine incerto).
const cursorFor = (id) => String(Math.max(0, Number(id.slice(0, 15)) - 1)).padStart(15, '0');

export const createMailbox = ({ relay, outTopicKey, inTopicKey, sid, now = () => Date.now() }) => {
    const cursors = new Map();      // topic -> ultimo id visto
    const seen = new Set();         // id già consegnati in questa sessione (limitato)
    return {
        async send(bytes) { return relay.put(sendTopic(outTopicKey, sid, now()), bytes); },
        // Ritorna i nuovi messaggi (byte opachi). Un topic che fallisce non blocca gli altri.
        async poll() {
            const out = [], errors = [];
            for (const topic of listenTopics(inTopicKey, sid, now())) {
                try {
                    const items = await relay.fetchNew(topic, cursors.get(topic) || '');
                    for (const i of items) {
                        cursors.set(topic, cursorFor(i.id));
                        if (seen.has(`${topic}|${i.id}`)) continue;
                        seen.add(`${topic}|${i.id}`);
                        out.push(i.data);
                    }
                } catch (e) { errors.push(e.message); }
            }
            if (seen.size > 5000) for (const k of [...seen].slice(0, 2500)) seen.delete(k);
            return { messages: out, errors };
        },
        snapshot: () => ({ cursors: [...cursors] }),
        restore(s) { cursors.clear(); for (const [k, v] of s.cursors) cursors.set(k, v); },
    };
};
