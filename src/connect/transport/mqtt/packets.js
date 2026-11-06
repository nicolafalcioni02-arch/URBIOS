// Pacchetti MQTT 3.1.1 (solo quelli che servono): codifica e lettura a flusso. PURO, nessuna rete.
// Il broker è NON FIDATO: ogni lunghezza è limitata e un pacchetto malformato è un errore, mai un crash o un'allocazione enorme.
import { utf8 } from '../../crypto/bytes.js';

export const T = { CONNECT: 1, CONNACK: 2, PUBLISH: 3, PUBACK: 4, SUBSCRIBE: 8, SUBACK: 9, PINGREQ: 12, PINGRESP: 13, DISCONNECT: 14 };
const MAX_PACKET = 2 * 1024 * 1024;

const varint = (n) => { const o = []; do { let b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 128; o.push(b); } while (n > 0); return Uint8Array.from(o); };
const str = (s) => { const b = utf8(s); if (b.length > 65535) throw new Error('stringa troppo lunga'); return Uint8Array.from([b.length >> 8, b.length & 255, ...b]); };
const u16 = (n) => Uint8Array.from([n >> 8, n & 255]);
const cat = (...a) => { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; };
const frame = (first, body) => cat(Uint8Array.from([first]), varint(body.length), body);

export const encode = {
    connect: ({ clientId, keepAlive = 30 }) => frame(T.CONNECT << 4, cat(str('MQTT'), Uint8Array.from([4, 0x02]), u16(keepAlive), str(clientId))),
    publish: ({ topic, payload, qos = 0, retain = false, id = 0 }) => frame((T.PUBLISH << 4) | (qos << 1) | (retain ? 1 : 0), cat(str(topic), qos ? u16(id) : new Uint8Array(0), payload)),
    subscribe: ({ id, topic }) => frame((T.SUBSCRIBE << 4) | 2, cat(u16(id), str(topic), Uint8Array.from([0]))),
    pingreq: () => Uint8Array.from([T.PINGREQ << 4, 0]),
    disconnect: () => Uint8Array.from([T.DISCONNECT << 4, 0]),
    puback: (id) => frame(T.PUBACK << 4, u16(id)),
};

const readStr = (b, o) => { if (o + 2 > b.length) throw new Error('pacchetto non valido'); const n = (b[o] << 8) | b[o + 1]; if (o + 2 + n > b.length) throw new Error('pacchetto non valido'); return [new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(o + 2, o + 2 + n)), o + 2 + n]; };

const parseBody = (type, flags, b) => {
    switch (type) {
        case T.CONNACK: if (b.length !== 2) throw new Error('pacchetto non valido'); return { type: 'connack', rc: b[1] };
        case T.SUBACK: if (b.length < 3) throw new Error('pacchetto non valido'); return { type: 'suback', id: (b[0] << 8) | b[1], rc: b[2] };
        case T.PUBACK: if (b.length !== 2) throw new Error('pacchetto non valido'); return { type: 'puback', id: (b[0] << 8) | b[1] };
        case T.PINGRESP: return { type: 'pingresp' };
        case T.PUBLISH: {
            const qos = (flags >> 1) & 3, retain = !!(flags & 1);
            if (qos === 3) throw new Error('pacchetto non valido');
            const [topic, o] = readStr(b, 0);
            let off = o, id = 0;
            if (qos) { if (off + 2 > b.length) throw new Error('pacchetto non valido'); id = (b[off] << 8) | b[off + 1]; off += 2; }
            return { type: 'publish', topic, qos, retain, id, payload: b.slice(off) };
        }
        default: return { type: 'other' };
    }
};

// Lettore a flusso: i frame WebSocket possono contenere pacchetti spezzati o più pacchetti.
export const createReader = () => {
    let buf = new Uint8Array(0);
    return {
        push(chunk) {
            buf = cat(buf, chunk);
            if (buf.length > MAX_PACKET + 8) throw new Error('pacchetto troppo grande');
            const out = [];
            for (;;) {
                if (buf.length < 2) break;
                let len = 0, mul = 1, i = 1, ok = false;
                for (; i < 5 && i < buf.length; i++) { len += (buf[i] & 127) * mul; mul *= 128; if (!(buf[i] & 128)) { ok = true; break; } }
                if (!ok) { if (i >= 5) throw new Error('pacchetto non valido'); break; }
                if (len > MAX_PACKET) throw new Error('pacchetto troppo grande');
                if (buf.length < i + 1 + len) break;
                out.push(parseBody(buf[0] >> 4, buf[0] & 15, buf.subarray(i + 1, i + 1 + len)));
                buf = buf.slice(i + 1 + len);
            }
            return out;
        },
    };
};
