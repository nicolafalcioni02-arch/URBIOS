import React, { useEffect, useRef } from 'react';

const TABLE_HTML = `<table class="d-table" style="width:100%"><thead><tr><th>Voce</th><th>Dettaglio</th><th>Note</th></tr></thead><tbody>${'<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>'.repeat(3)}</tbody></table><p><br></p>`;
const COLORS = ['#1B1B1F', '#C2413A', '#1F8A5B', '#2F54EB', '#B7791F', '#6D28D9'];

// Barra di scrittura: agisce sul foglio in cui si trova il cursore. I pulsanti non tolgono il cursore dal testo.
export const TextTools = ({ active }) => {
    const range = useRef(null);
    const fileRef = useRef(null);

    // ricorda l'ultima selezione dentro un foglio (serve a menu e colori, che prendono il fuoco)
    useEffect(() => {
        const onSel = () => {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const node = sel.anchorNode;
            const el = node && (node.nodeType === 1 ? node : node.parentElement);
            if (el && el.closest && el.closest('.pc-flow[contenteditable=true]')) range.current = sel.getRangeAt(0).cloneRange();
        };
        document.addEventListener('selectionchange', onSel);
        return () => document.removeEventListener('selectionchange', onSel);
    }, []);

    const restore = () => {
        const sel = window.getSelection();
        if (!range.current || !sel) return;
        const host = range.current.startContainer;
        const el = host && (host.nodeType === 1 ? host : host.parentElement);
        const flow = el && el.closest && el.closest('.pc-flow');
        if (!flow || !document.contains(flow)) return;
        flow.focus({ preventScroll: true });
        sel.removeAllRanges();
        sel.addRange(range.current);
    };
    const exec = (cmd, value = null) => {
        restore();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(cmd, false, value);
    };
    const keep = (e) => e.preventDefault();

    const B = ({ icon, title, onClick, label }) => (
        <button className="pc-tb" title={title} aria-label={title} onMouseDown={keep} onClick={onClick} disabled={!active}>
            <i className={`ph ${icon}`}></i>
            {label}
        </button>
    );

    const onImage = (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        const r = new FileReader();
        r.onload = () => exec('insertHTML', `<img src="${r.result}" alt="" style="max-width:100%;height:auto;display:block;margin:2mm 0;border-radius:2mm">`);
        r.readAsDataURL(f);
    };

    return (
        <div className="pc-tools" role="toolbar" aria-label="Formattazione del testo">
            <B icon="ph-arrow-u-up-left" title="Annulla" onClick={() => exec('undo')} />
            <B icon="ph-arrow-u-up-right" title="Ripeti" onClick={() => exec('redo')} />
            <span className="sep" />
            <select
                disabled={!active}
                value=""
                title="Stile del paragrafo"
                onMouseDown={() => {}}
                onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'h-sec') exec('insertHTML', '<h2 class="d-h">Nuova sezione</h2>');
                    else if (v) exec('formatBlock', v);
                }}
            >
                <option value="">Stile…</option>
                <option value="p">Testo normale</option>
                <option value="h1">Titolo grande</option>
                <option value="h2">Titolo</option>
                <option value="h3">Sottotitolo</option>
                <option value="h-sec">Titolo di sezione (stile report)</option>
            </select>
            <B icon="ph-text-b" title="Grassetto" onClick={() => exec('bold')} />
            <B icon="ph-text-italic" title="Corsivo" onClick={() => exec('italic')} />
            <B icon="ph-text-underline" title="Sottolineato" onClick={() => exec('underline')} />
            <B icon="ph-highlighter" title="Evidenzia" onClick={() => exec('hiliteColor', '#FFF1A8')} />
            {COLORS.map((c) => (
                <button key={c} className="pc-swatch" style={{ background: c }} title="Colore del testo" aria-label={`Colore ${c}`} onMouseDown={keep} onClick={() => exec('foreColor', c)} disabled={!active} />
            ))}
            <B icon="ph-text-t-slash" title="Togli la formattazione" onClick={() => exec('removeFormat')} />
            <span className="sep" />
            <B icon="ph-text-align-left" title="Allinea a sinistra" onClick={() => exec('justifyLeft')} />
            <B icon="ph-text-align-center" title="Centra" onClick={() => exec('justifyCenter')} />
            <B icon="ph-text-align-right" title="Allinea a destra" onClick={() => exec('justifyRight')} />
            <B icon="ph-text-align-justify" title="Giustifica" onClick={() => exec('justifyFull')} />
            <span className="sep" />
            <B icon="ph-list-bullets" title="Elenco puntato" onClick={() => exec('insertUnorderedList')} />
            <B icon="ph-list-numbers" title="Elenco numerato" onClick={() => exec('insertOrderedList')} />
            <B icon="ph-table" title="Inserisci una tabella" onClick={() => exec('insertHTML', TABLE_HTML)} />
            <B icon="ph-image" title="Inserisci un'immagine" onClick={() => fileRef.current && fileRef.current.click()} />
            <B icon="ph-file-plus" title="Continua su una pagina nuova da qui" onClick={() => exec('insertHTML', '<div class="pc-pb" contenteditable="false"></div><p><br></p>')} />
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
            {!active && (
                <span className="pc-tools-hint">
                    <i className="ph ph-hand-pointing"></i> Clicca su un foglio per scrivere
                </span>
            )}
        </div>
    );
};
