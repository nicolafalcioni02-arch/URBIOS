// Lettura di un .xlsx senza librerie: zip (directory centrale) + DecompressionStream del browser + XML dei fogli.
// readXlsx(file, sheetName?) -> array di righe (array di celle: testo o numero). Date in Excel = numeri seriali (vedi serialToIso).

const inflate = async (bytes) => {
    const ds = new DecompressionStream('deflate-raw');
    const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
};

export const unzip = async (buf) => {
    const v = new DataView(buf);
    const u8 = new Uint8Array(buf);
    let e = u8.length - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e -= 1;
    if (e < 0) throw new Error('Non è un file Excel (.xlsx)');
    const n = v.getUint16(e + 10, true);
    let p = v.getUint32(e + 16, true);
    const files = {};
    const dec = new TextDecoder();
    for (let i = 0; i < n; i += 1) {
        if (v.getUint32(p, true) !== 0x02014b50) break;
        const method = v.getUint16(p + 10, true);
        const csize = v.getUint32(p + 20, true);
        const nl = v.getUint16(p + 28, true);
        const xl = v.getUint16(p + 30, true);
        const cl = v.getUint16(p + 32, true);
        const off = v.getUint32(p + 42, true);
        const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
        const start = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true);
        files[name] = { method, data: u8.subarray(start, start + csize) };
        p += 46 + nl + xl + cl;
    }
    const text = async (name) => {
        const f = files[name];
        if (!f) return null;
        return dec.decode(f.method === 0 ? f.data : await inflate(f.data));
    };
    const bin = async (name) => { const f = files[name]; return f ? (f.method === 0 ? f.data : inflate(f.data)) : null; };
    return { text, bin, has: (n2) => Boolean(files[n2]) };
};

const xmlDoc = (s) => new DOMParser().parseFromString(s, 'application/xml');
const colIndex = (ref) => {
    let n = 0;
    String(ref).replace(/[A-Z]/gi, (c) => { n = n * 26 + (c.toUpperCase().charCodeAt(0) - 64); return ''; });
    return n - 1;
};

export const readXlsx = async (file, sheetName) => {
    const z = await unzip(await file.arrayBuffer());
    const wb = xmlDoc(await z.text('xl/workbook.xml'));
    const rels = xmlDoc((await z.text('xl/_rels/workbook.xml.rels')) || '<r/>');
    const sheets = [...wb.getElementsByTagName('sheet')].map((s) => ({ name: s.getAttribute('name'), rid: s.getAttribute('r:id') }));
    const pick = sheets.find((s) => sheetName && String(s.name).toLowerCase() === sheetName.toLowerCase()) || sheets[0];
    if (!pick) throw new Error('Il file non ha fogli');
    const rel = [...rels.getElementsByTagName('Relationship')].find((r) => r.getAttribute('Id') === pick.rid);
    const target = rel ? rel.getAttribute('Target').replace(/^\//, '') : 'worksheets/sheet1.xml';
    const path = target.startsWith('xl/') ? target : `xl/${target}`;
    const shared = [];
    const ss = await z.text('xl/sharedStrings.xml');
    if (ss) [...xmlDoc(ss).getElementsByTagName('si')].forEach((si) => shared.push([...si.getElementsByTagName('t')].map((t) => t.textContent).join('')));
    const sheet = xmlDoc(await z.text(path));
    const rows = [];
    [...sheet.getElementsByTagName('row')].forEach((row) => {
        const out = [];
        [...row.getElementsByTagName('c')].forEach((c) => {
            const t = c.getAttribute('t');
            const vEl = c.getElementsByTagName('v')[0];
            let val = '';
            if (t === 'inlineStr') val = [...c.getElementsByTagName('t')].map((x) => x.textContent).join('');
            else if (vEl) val = t === 's' ? shared[Number(vEl.textContent)] ?? '' : t === 'str' || t === 'e' ? vEl.textContent : t === 'b' ? (vEl.textContent === '1' ? 'sì' : 'no') : Number(vEl.textContent);
            out[colIndex(c.getAttribute('r'))] = val;
        });
        rows.push(Array.from(out, (x) => (x === undefined ? '' : x)));
    });
    rows.sheet = pick.name;
    return rows;
};

// numero seriale di Excel -> AAAA-MM-GG
export const serialToIso = (n) => new Date(Math.round((n - 25569) * 86400000)).toISOString().slice(0, 10);
