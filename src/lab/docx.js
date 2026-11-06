import { createZip } from '../dataExchange/zip';
import { unzip } from './xlsxRead';

// Word (.docx) senza librerie, per le pagine libere del quaderno.
// blocchi: { t: 'testo', html } | { t: 'img' | 'mano', img: dataURL, w, h, nome }
// html ammesso: h2, h3, p, div, b, strong, i, em, u, ul, ol, li, br (vedi cleanHtml)

const xml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const ALLOWED = new Set(['H2', 'H3', 'P', 'DIV', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR']);

// pulisce l'HTML di un blocco di testo: solo i tag ammessi, niente attributi
export const cleanHtml = (html) => {
    const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
    const walk = (node) => {
        let out = '';
        node.childNodes.forEach((n) => {
            if (n.nodeType === 3) out += String(n.textContent).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
            else if (n.nodeType === 1) {
                const inner = walk(n);
                const t = n.tagName;
                if (t === 'BR') out += '<br>';
                else if (ALLOWED.has(t)) { const tag = t === 'STRONG' ? 'b' : t === 'EM' ? 'i' : t.toLowerCase(); out += `<${tag}>${inner}</${tag}>`; }
                else out += inner;
            }
        });
        return out;
    };
    return walk(doc.body);
};

const dataBytes = (url) => { const b = atob(String(url).split(',')[1] || ''); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i += 1) u[i] = b.charCodeAt(i); return u; };

const run = (text, st, size) => `<w:r><w:rPr>${st.b ? '<w:b/>' : ''}${st.i ? '<w:i/>' : ''}${st.u ? '<w:u w:val="single"/>' : ''}${size ? `<w:sz w:val="${size}"/>` : ''}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
const runs = (node, st, size) => {
    let out = '';
    node.childNodes.forEach((n) => {
        if (n.nodeType === 3) { if (n.textContent) out += run(n.textContent, st, size); }
        else if (n.nodeType === 1) {
            const t = n.tagName;
            if (t === 'BR') out += '<w:r><w:br/></w:r>';
            else out += runs(n, { b: st.b || t === 'B' || t === 'STRONG', i: st.i || t === 'I' || t === 'EM', u: st.u || t === 'U' }, size);
        }
    });
    return out;
};
const para = (inner, ppr = '') => `<w:p>${ppr ? `<w:pPr>${ppr}</w:pPr>` : ''}${inner}</w:p>`;

const htmlToParas = (html) => {
    const doc = new DOMParser().parseFromString(`<body>${cleanHtml(html)}</body>`, 'text/html');
    let out = '';
    let loose = [];
    const flush = () => { if (loose.length) { const tmp = document.createElement('div'); loose.forEach((n) => tmp.appendChild(n.cloneNode(true))); out += para(runs(tmp, {}, 0)); loose = []; } };
    doc.body.childNodes.forEach((n) => {
        const t = n.nodeType === 1 ? n.tagName : '';
        if (t === 'H2' || t === 'H3') { flush(); out += para(runs(n, { b: true }, t === 'H2' ? 32 : 26), '<w:spacing w:before="200" w:after="80"/>'); }
        else if (t === 'P' || t === 'DIV') { flush(); out += para(runs(n, {}, 0)); }
        else if (t === 'UL' || t === 'OL') {
            flush();
            [...n.children].forEach((li, k) => { out += para(run(t === 'UL' ? '•  ' : `${k + 1}.  `, {}, 0) + runs(li, {}, 0), '<w:ind w:left="567" w:hanging="283"/>'); });
        } else loose.push(n);
    });
    flush();
    return out;
};

export const buildDocx = ({ title, blocks, orient, margin }) => {
    const media = [];
    let body = title ? para(run(title, { b: true }, 40), '<w:spacing w:after="200"/>') : '';
    (blocks || []).forEach((b) => {
        if (b.t === 'tabella') {
            const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((k) => `<w:${k} w:val="single" w:sz="4" w:color="808080"/>`).join('');
            body += `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${bd}</w:tblBorders></w:tblPr>${b.rows.map((rw) => `<w:tr>${rw.map((v) => `<w:tc><w:tcPr/>${para(run(v, {}, 0))}</w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>${para('')}`;
        } else if (b.t === 'testo') body += htmlToParas(b.html);
        else if (b.img) {
            const png = String(b.img).startsWith('data:image/png');
            const id = media.length + 1;
            media.push({ id, ext: png ? 'png' : 'jpg', bytes: dataBytes(b.img) });
            const cx = Math.round(6100000 * (b.k || 0.885)); const cy = Math.round(cx * ((b.h || 3) / (b.w || 4)));
            body += para(`<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Immagine ${id}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="img${id}.${png ? 'png' : 'jpg'}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`);
        }
    });
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${body}${(() => { const m = margin || 1134; return `<w:sectPr>${orient === 'o' ? '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' : '<w:pgSz w:w="11906" w:h="16838"/>'}<w:pgMar w:top="${m}" w:right="${m}" w:bottom="${m}" w:left="${m}" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`; })()}</w:body></w:document>`;
    const files = [
        { path: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
        { path: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
        { path: 'word/document.xml', content: doc },
        { path: 'word/_rels/document.xml.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${media.map((m) => `<Relationship Id="rId${m.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${m.id}.${m.ext}"/>`).join('')}</Relationships>` },
        ...media.map((m) => ({ path: `word/media/img${m.id}.${m.ext}`, content: m.bytes })),
    ];
    return createZip(files);
};

export const downloadDocx = (name, page) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buildDocx(page)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    a.download = name.replace(/[\\/:*?"<>|]/g, ' ').trim() + '.docx';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

// ---- lettura di un .docx: titoli, grassetto/corsivo/sottolineato, elenchi, tabelle (righe di testo) e immagini
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const shrink = (url, max = 1400) => new Promise((res) => {
    const im = new Image();
    im.onerror = () => res({ img: url, w: 4, h: 3 });
    im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        res({ img: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height });
    };
    im.src = url;
});
const toDataUrl = (bytes, mime) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(new Blob([bytes], { type: mime })); });
const els = (n, name) => [...n.getElementsByTagNameNS(W, name)];

export const readDocx = async (file) => {
    const z = await unzip(await file.arrayBuffer());
    const main = await z.text('word/document.xml');
    if (!main) throw new Error('Non è un file Word (.docx)');
    const doc = new DOMParser().parseFromString(main, 'application/xml');
    const relDoc = new DOMParser().parseFromString((await z.text('word/_rels/document.xml.rels')) || '<r/>', 'application/xml');
    const rels = {};
    [...relDoc.getElementsByTagName('Relationship')].forEach((r) => { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const blocks = [];
    let html = '';
    let list = '';
    const closeList = () => { if (list) { html += `</${list}>`; list = ''; } };
    const flush = () => { closeList(); if (html.trim()) blocks.push({ t: 'testo', html }); html = ''; };

    const runHtml = (p) => {
        let out = '';
        const imgs = [];
        els(p, 'r').forEach((r) => {
            const pr = els(r, 'rPr')[0];
            const on = (tag) => pr && els(pr, tag).some((x) => x.getAttributeNS(W, 'val') !== '0' && x.getAttributeNS(W, 'val') !== 'false');
            let t = '';
            [...r.childNodes].forEach((c) => {
                if (c.localName === 't') t += esc(c.textContent);
                else if (c.localName === 'tab') t += ' ';
                else if (c.localName === 'br') t += '<br>';
            });
            els(r, 'blip').concat([...r.getElementsByTagName('a:blip')]).forEach((b) => { const id = b.getAttribute('r:embed'); if (id && !imgs.includes(id)) imgs.push(id); });
            if (t) { if (on('b')) t = `<b>${t}</b>`; if (on('i')) t = `<i>${t}</i>`; if (on('u')) t = `<u>${t}</u>`; out += t; }
        });
        return { out, imgs };
    };

    const body = els(doc, 'body')[0];
    for (const n of [...body.childNodes]) {
        if (n.localName === 'p') {
            const style = (els(n, 'pStyle')[0] || { getAttributeNS: () => '' }).getAttributeNS(W, 'val') || '';
            const isList = els(n, 'numPr').length > 0;
            const { out, imgs } = runHtml(n);
            if (out.trim()) {
                if (/^(Heading|Titolo|Title)/i.test(style)) { closeList(); html += `<h2>${out}</h2>`; }
                else if (isList) { if (list !== 'ul') { closeList(); html += '<ul>'; list = 'ul'; } html += `<li>${out}</li>`; }
                else { closeList(); html += `<p>${out}</p>`; }
            }
            for (const id of imgs) {
                const target = rels[id]; if (!target) continue;
                const ext = (target.split('.').pop() || '').toLowerCase();
                if (!['png', 'jpg', 'jpeg', 'gif'].includes(ext)) continue;
                const bytes = await z.bin(`word/${target.replace(/^\/?(word\/)?/, '')}`);
                if (!bytes) continue;
                flush();
                const { img, w, h } = await shrink(await toDataUrl(bytes, ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'));
                blocks.push({ t: 'img', img, w, h, nome: 'Immagine' });
            }
        } else if (n.localName === 'tbl') {
            closeList();
            els(n, 'tr').forEach((tr) => { const cells = els(tr, 'tc').map((tc) => els(tc, 't').map((t) => t.textContent).join('').trim()); html += `<p>${esc(cells.join(' | '))}</p>`; });
        }
    }
    flush();
    const title = String(file.name || '').replace(/\.docx$/i, '');
    return { title, blocks: blocks.length ? blocks : [{ t: 'testo', html: '' }] };
};
