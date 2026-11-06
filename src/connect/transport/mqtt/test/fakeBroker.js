// Broker MQTT 3.1.1 finto IN MEMORIA (solo per i test): CONNECT, SUBSCRIBE (con `+` finale), PUBLISH retained/QoS0-1, DISCONNECT.
// Espone una classe tipo WebSocket da passare come `WebSocketImpl`. Opzioni per rendere il broker "cattivo": spezza i frame, perde i retained.
const dec = new TextDecoder();
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const varint = (n) => { const o = []; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; o.push(b); } while (n); return Uint8Array.from(o); };
const frame = (first, body) => cat(Uint8Array.from([first]), varint(body.length), body);
const str = (s) => { const b = new TextEncoder().encode(s); return cat(Uint8Array.from([b.length >> 8, b.length & 255]), b); };

export const createFakeBroker = ({ chunk = 0, dropRetained = false, rejectConnect = false } = {}) => {
    const retained = new Map(), subs = new Set(), log = { connects: 0, published: [] };
    const match = (filter, topic) => (filter.endsWith('/+') ? topic.startsWith(filter.slice(0, -1)) && !topic.slice(filter.length - 1).includes('/') : filter === topic);
    class FakeWebSocket {
        constructor(url, proto) { this.url = url; this.proto = proto; this.readyState = 0; this.buf = new Uint8Array(0); this.filters = []; setTimeout(() => { this.readyState = 1; this.onopen && this.onopen(); }, 0); }
        _out(bytes) {
            if (this.readyState !== 1) return;
            const parts = chunk ? Array.from({ length: Math.ceil(bytes.length / chunk) }, (_, i) => bytes.slice(i * chunk, (i + 1) * chunk)) : [bytes];
            for (const p of parts) setTimeout(() => this.onmessage && this.onmessage({ data: p.buffer.slice(p.byteOffset, p.byteOffset + p.byteLength) }), 0);
        }
        _publishTo(sub, topic, payload) { sub._out(frame(0x30, cat(str(topic), payload))); }
        send(data) {
            this.buf = cat(this.buf, data);
            for (;;) {
                if (this.buf.length < 2) return;
                let len = 0, mul = 1, i = 1;
                for (; ; i++) { len += (this.buf[i] & 127) * mul; mul *= 128; if (!(this.buf[i] & 128)) break; }
                if (this.buf.length < i + 1 + len) return;
                const t = this.buf[0] >> 4, flags = this.buf[0] & 15, body = this.buf.slice(i + 1, i + 1 + len);
                this.buf = this.buf.slice(i + 1 + len);
                this._packet(t, flags, body);
            }
        }
        _packet(t, flags, b) {
            if (t === 1) { log.connects++; this._out(frame(0x20, Uint8Array.from([0, rejectConnect ? 5 : 0]))); }
            else if (t === 8) {
                const id = (b[0] << 8) | b[1], n = (b[2] << 8) | b[3], filter = dec.decode(b.slice(4, 4 + n));
                this.filters.push(filter); subs.add(this);
                this._out(frame(0x90, Uint8Array.from([id >> 8, id & 255, 0])));
                for (const [topic, payload] of retained) if (match(filter, topic)) this._publishTo(this, topic, payload);
            } else if (t === 3) {
                const qos = (flags >> 1) & 3, retain = flags & 1, n = (b[0] << 8) | b[1], topic = dec.decode(b.slice(2, 2 + n));
                let o = 2 + n, id = 0; if (qos) { id = (b[o] << 8) | b[o + 1]; o += 2; }
                const payload = b.slice(o);
                log.published.push({ topic, len: payload.length, retain: !!retain });
                if (retain) { if (payload.length === 0 || dropRetained) retained.delete(topic); else retained.set(topic, payload); }
                for (const s of subs) if (s.filters.some((f) => match(f, topic)) && payload.length) this._publishTo(s, topic, payload);
                if (qos) this._out(frame(0x40, Uint8Array.from([id >> 8, id & 255])));
            } else if (t === 14) this.close();
        }
        close() { if (this.readyState === 3) return; this.readyState = 3; subs.delete(this); setTimeout(() => this.onclose && this.onclose(), 0); }
    }
    return { WebSocket: FakeWebSocket, retained, log };
};
