// Motore di impaginazione A4 del Centro stampa.
// Prende l'HTML di un documento e lo divide in pagine vere: misura il contenuto in un foglio nascosto identico a quello
// visibile e spezza blocchi, tabelle (ripetendo l'intestazione), elenchi e perfino paragrafi lunghi.
// Ogni pezzo ricorda da quale elemento viene (data-pc-id), così dopo una modifica a mano le pagine si ricuciono
// in un unico documento (mergeFragments) e si reimpaginano.

const ATOMIC = new Set(['IMG', 'SVG', 'CANVAS', 'VIDEO', 'IFRAME', 'HR', 'INPUT', 'SELECT', 'TEXTAREA', 'TR', 'FIGURE', 'svg', 'BR', 'PICTURE']);
const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const PC_ATTRS = ['data-pc-id', 'data-pc-cont', 'data-pc-rep', 'data-pc-over'];

// toglie i segni lasciati da un'impaginazione precedente e ne mette di nuovi
// (numerati da capo ogni volta: le pagine che non cambiano restano identiche e non vengono ridisegnate)
const stamp = (root) => {
    let n = 0;
    root.querySelectorAll('[data-pc-rep]').forEach((el) => el.remove());
    root.querySelectorAll('*').forEach((el) => {
        PC_ATTRS.forEach((a) => el.removeAttribute(a));
        el.setAttribute('data-pc-id', String(++n));
    });
};

export const cleanHtml = (html) => {
    const d = document.createElement('div');
    d.innerHTML = html;
    d.querySelectorAll('[data-pc-rep]').forEach((el) => el.remove());
    d.querySelectorAll('*').forEach((el) => PC_ATTRS.forEach((a) => el.removeAttribute(a)));
    return d.innerHTML;
};

const waitImages = (root, ms = 2500) => {
    const imgs = [...root.querySelectorAll('img')].filter((i) => !i.complete);
    if (!imgs.length) return Promise.resolve();
    return Promise.race([
        Promise.all(imgs.map((i) => new Promise((r) => { i.onload = r; i.onerror = r; }))),
        new Promise((r) => setTimeout(r, ms)),
    ]);
};

const isBlank = (n) => n.nodeType === 3 && !n.textContent.trim();

// Dati: html del documento, il contenitore di misura (.pc-flow dentro un .pc-body) e l'altezza utile per pagina.
// limits(i) = altezza in px disponibile per la pagina i del documento. Restituisce l'innerHTML di ogni pagina.
export const paginateHtml = async (html, { body, flow, limits, isCancelled = () => false }) => {
    const src = document.createElement('div');
    src.innerHTML = html;
    stamp(src);

    // le immagini devono essere caricate per sapere quanto occupano
    flow.innerHTML = '';
    flow.appendChild(src.cloneNode(true));
    await waitImages(flow);
    if (isCancelled()) return null;
    flow.innerHTML = '';

    const pages = [];
    let pageNo = 0;
    let limit = limits(0);
    let placed = 0; // contenuti veri messi sulla pagina corrente (i gusci delle continuazioni non contano)
    let cur = [flow]; // cur[k] = clone che fa da contenitore al livello k
    let chain = []; // elementi sorgente aperti (dal più esterno)

    const fits = () => body.getBoundingClientRect().height <= limit + 0.5;
    const style = (el) => (el.nodeType === 1 ? getComputedStyle(el) : null);
    const forcedBefore = (el) => {
        const s = style(el);
        return !!s && (s.breakBefore === 'page' || s.pageBreakBefore === 'always' || el.classList.contains('tp-newpage'));
    };
    const forcedAfter = (el) => {
        const s = style(el);
        return !!s && (s.breakAfter === 'page' || s.pageBreakAfter === 'always' || el.classList.contains('rs-pb') || el.classList.contains('pc-pb'));
    };
    const avoidInside = (el) => {
        const s = style(el);
        return !!s && (s.breakInside === 'avoid' || s.pageBreakInside === 'avoid' || el.classList.contains('tp-row'));
    };
    const keepWithNext = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (HEADINGS.has(el.tagName) || el.classList.contains('d-h') || el.classList.contains('tp-week-title') || el.classList.contains('tp-day-title')) return true;
        const s = style(el);
        return !!s && (s.breakAfter === 'avoid' || s.pageBreakAfter === 'avoid');
    };
    const atomic = (el) => ATOMIC.has(el.tagName) || el.getAttribute('contenteditable') === 'false' || !el.childNodes.length;

    const shell = (srcEl, cont) => {
        const c = srcEl.cloneNode(false);
        if (cont) c.setAttribute('data-pc-cont', '1');
        return c;
    };

    // chiude la pagina corrente e ne apre una nuova con gli stessi contenitori aperti
    const breakPage = () => {
        const depth = chain.length;
        // i contenitori rimasti vuoti in fondo alla pagina si tolgono (e la pagina dopo non li considera continuazioni);
        // una tabella con la sola intestazione conta come vuota: l'intestazione da sola in fondo non serve
        const emptyNode = (el) =>
            [...el.childNodes].every((n) => isBlank(n) || (n.nodeType === 1 && (n.hasAttribute('data-pc-rep') || (el.tagName === 'TABLE' && (n.tagName === 'THEAD' || n.tagName === 'COLGROUP')))));
        const fresh = new Array(depth + 1).fill(false);
        for (let k = depth; k >= 1; k--) {
            const el = cur[k];
            if (emptyNode(el)) {
                el.remove();
                fresh[k] = true;
            } else break;
        }
        // un titolo rimasto in fondo alla pagina va con quello che segue (anche se il salto è avvenuto più in profondità)
        let carry = null;
        let carryAt = depth;
        while (carryAt > 0 && fresh[carryAt]) carryAt--;
        const host = cur[carryAt];
        let last = host.lastChild;
        while (last && last.nodeType === 3 && isBlank(last)) last = last.previousSibling;
        if (last && keepWithNext(last)) {
            host.removeChild(last);
            if (flow.textContent.trim() || flow.querySelector('img, svg, canvas')) carry = last;
            else host.appendChild(last); // sulla pagina c'era solo il titolo: resta dov'è
        }
        pages.push(flow.innerHTML);
        pageNo += 1;
        limit = limits(pageNo);
        flow.innerHTML = '';
        placed = 0;
        const next = [flow];
        chain.forEach((srcEl, i) => {
            const k = i + 1;
            const c = shell(srcEl, !fresh[k]);
            if (srcEl.tagName === 'TABLE') {
                // le larghezze delle colonne restano uguali anche sulla pagina dopo
                [...srcEl.children].filter((x) => x.tagName === 'COLGROUP').forEach((cg) => {
                    const x = cg.cloneNode(true);
                    if (!fresh[k]) x.setAttribute('data-pc-rep', '1'); // copia: sparisce quando le pagine si ricuciono
                    c.appendChild(x);
                });
                const th = [...srcEl.children].find((x) => x.tagName === 'THEAD');
                if (th) {
                    const t = th.cloneNode(true);
                    if (!fresh[k]) t.setAttribute('data-pc-rep', '1');
                    c.appendChild(t);
                }
            }
            if (srcEl.tagName === 'OL' && !fresh[k]) {
                const before = cur[k] ? cur[k].querySelectorAll(':scope > li').length : 0;
                c.setAttribute('start', String((parseInt(srcEl.getAttribute('start'), 10) || 1) + before));
            }
            next[k - 1].appendChild(c);
            next.push(c);
        });
        cur = next;
        if (carry) {
            const after = cur[carryAt + 1];
            if (after && after.parentNode === cur[carryAt]) cur[carryAt].insertBefore(carry, after);
            else cur[carryAt].appendChild(carry);
            placed = 1;
        }
    };

    const placeText = (node) => {
        let text = node.textContent;
        while (text) {
            const parent = cur[chain.length];
            const t = document.createTextNode(text);
            parent.appendChild(t);
            if (fits()) {
                placed++;
                return;
            }
            parent.removeChild(t);
            const words = text.split(/(\s+)/);
            let lo = 0;
            let hi = words.length;
            while (lo < hi) {
                const mid = Math.ceil((lo + hi) / 2);
                t.textContent = words.slice(0, mid).join('');
                parent.appendChild(t);
                const ok = fits();
                parent.removeChild(t);
                if (ok) lo = mid;
                else hi = mid - 1;
            }
            if (lo === 0) {
                if (placed === 0) {
                    parent.appendChild(document.createTextNode(text)); // non sta nemmeno in una pagina vuota: si lascia
                    placed++;
                    return;
                }
                breakPage();
                continue;
            }
            parent.appendChild(document.createTextNode(words.slice(0, lo).join('')));
            placed++;
            text = words.slice(lo).join('').replace(/^\s+/, '');
            if (text) breakPage();
        }
    };

    const placeNode = (node) => {
        if (node.nodeType === 8) return;
        if (node.nodeType === 3) {
            if (isBlank(node)) {
                cur[chain.length].appendChild(node.cloneNode());
                return;
            }
            placeText(node);
            return;
        }
        if (node.nodeType !== 1) return;
        const parent = cur[chain.length];
        // le misure delle colonne una volta sola (sulla pagina nuova le ha già messe la continuazione della tabella)
        if (node.tagName === 'COLGROUP' && parent.querySelector(':scope > colgroup')) return;
        let clone = node.cloneNode(true);
        parent.appendChild(clone);
        if (placed > 0 && forcedBefore(clone)) {
            parent.removeChild(clone);
            breakPage();
            clone = node.cloneNode(true);
            cur[chain.length].appendChild(clone);
        }
        // un contenitore che sta tutto in una pagina ma ha dentro interruzioni forzate (.pc-break) si scompone comunque
        if (fits() && !(clone.querySelector && clone.querySelector('.pc-break'))) {
            placed++;
            if (forcedAfter(clone)) breakPage();
            return;
        }
        const host = cur[chain.length];
        const avoid = avoidInside(clone); // (va letto finché il clone è nel foglio)
        host.removeChild(clone);

        // blocco da non spezzare: se c'è già altro sulla pagina va su quella dopo
        if ((atomic(node) || avoid) && placed > 0) {
            breakPage();
            placeNode(node);
            return;
        }
        if (atomic(node)) {
            // più alto di una pagina intera: si mette lo stesso, ridotto all'altezza della pagina
            if (node.tagName === 'IMG') clone.style.maxHeight = `${Math.floor(limit - 4)}px`;
            clone.setAttribute('data-pc-over', '1');
            cur[chain.length].appendChild(clone);
            placed++;
            return;
        }

        // si apre il contenitore e si mettono i figli uno alla volta
        const sh = shell(node, false);
        host.appendChild(sh);
        if (!fits() && placed > 0) {
            host.removeChild(sh);
            breakPage();
            placeNode(node);
            return;
        }
        chain.push(node);
        cur.push(sh);
        let kids = [...node.childNodes];
        if (node.tagName === 'TABLE') {
            const th = kids.find((x) => x.tagName === 'THEAD');
            if (th) {
                sh.appendChild(th.cloneNode(true));
                kids = kids.filter((x) => x !== th);
            }
        }
        for (const k of kids) placeNode(k);
        chain.pop();
        cur.pop();
        if (forcedAfter(sh)) breakPage();
    };

    for (const n of [...src.childNodes]) {
        placeNode(n);
        if (isCancelled()) return null;
    }
    if (flow.childNodes.length && (placed > 0 || !pages.length)) pages.push(flow.innerHTML);
    flow.innerHTML = '';
    return pages.length ? pages : [''];
};

// Ricuce le pagine (anche modificate a mano) in un solo documento
export const mergeFragments = (htmls) => {
    const out = document.createElement('div');
    const into = (target, src) => {
        const first = src.firstElementChild;
        let lead = src.firstChild;
        while (lead && isBlank(lead)) lead = lead.nextSibling;
        let last = target.lastChild;
        while (last && isBlank(last)) last = last.previousSibling;
        if (first && lead === first && last && last.nodeType === 1 && first.getAttribute('data-pc-cont') && first.getAttribute('data-pc-id') === last.getAttribute('data-pc-id')) {
            [...first.children].forEach((c) => c.hasAttribute('data-pc-rep') && c.remove());
            into(last, first);
            first.remove();
        }
        while (src.firstChild) target.appendChild(src.firstChild);
    };
    htmls.forEach((h) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = h;
        into(out, tmp);
    });
    return cleanHtml(out.innerHTML);
};
