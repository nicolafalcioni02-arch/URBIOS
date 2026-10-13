// Creazione di file ZIP senza librerie (metodo "store", nessuna compressione: i dati sono testo di poche centinaia di KB).
// Nomi in UTF-8 (cartelle con lettere accentate ok).
const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

export const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

const enc = new TextEncoder();
const u16 = (v) => [v & 255, (v >>> 8) & 255];
const u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];

const dosDateTime = (d) => {
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { time, date };
};

// files: [{ path: 'cartella/file.txt', content: string | Uint8Array }]
export const createZip = (files, when = new Date()) => {
    const { time, date } = dosDateTime(when);
    const parts = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
        const name = enc.encode(f.path);
        const data = typeof f.content === 'string' ? enc.encode(f.content) : f.content;
        const crc = crc32(data);
        const header = new Uint8Array([
            ...u32(0x04034b50),
            ...u16(20),
            ...u16(0x0800),
            ...u16(0),
            ...u16(time),
            ...u16(date),
            ...u32(crc),
            ...u32(data.length),
            ...u32(data.length),
            ...u16(name.length),
            ...u16(0),
        ]);
        parts.push(header, name, data);
        central.push(
            new Uint8Array([
                ...u32(0x02014b50),
                ...u16(20),
                ...u16(20),
                ...u16(0x0800),
                ...u16(0),
                ...u16(time),
                ...u16(date),
                ...u32(crc),
                ...u32(data.length),
                ...u32(data.length),
                ...u16(name.length),
                ...u16(0),
                ...u16(0),
                ...u16(0),
                ...u16(0),
                ...u32(0),
                ...u32(offset),
            ]),
            name
        );
        offset += header.length + name.length + data.length;
    }
    const centralSize = central.reduce((a, b) => a + b.length, 0);
    const end = new Uint8Array([
        ...u32(0x06054b50),
        ...u16(0),
        ...u16(0),
        ...u16(files.length),
        ...u16(files.length),
        ...u32(centralSize),
        ...u32(offset),
        ...u16(0),
    ]);
    const all = [...parts, ...central, end];
    const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
    let p = 0;
    for (const b of all) {
        out.set(b, p);
        p += b.length;
    }
    return out;
};
