import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { cleanHtml, downloadDocx } from '../docx';
import { readImage } from '../figures';
import { Sketch, downloadImage } from './Sketch';
import { PAGE_COLORS } from './Work';

// Pagina libera del quaderno (telefono): titolo + blocchi di testo (titoli, grassetto, elenchi), disegni a mano e immagini.
// Si salva da sola; «Word» la scarica come .docx. Record: { tipo: 'pagina', titolo, blocchi: [{ t, html | img, w, h }] }
const imgSize = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.width, im.height]); im.onerror = () => res([4, 3]); im.src = src; });

const RichText = ({ html, onChange, placeholder }) => {
    const ref = useRef(null);
    useEffect(() => { if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html || ''; }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div ref={ref} className="pg-rich" contentEditable suppressContentEditableWarning data-ph={placeholder} onInput={() => onChange(cleanHtml(ref.current.innerHTML))} />;
};

const FORMATS = [['Titolo', 'h2', 'H'], ['Grassetto', 'b', 'B'], ['Corsivo', 'i', 'I'], ['Elenco', 'ul', '•'], ['Numerato', 'ol', '1.']];

export const PageView = ({ rec, onSave }) => {
    const [d, setD] = useState(rec);
    const latest = useRef(d);
    const timer = useRef(null);
    const pending = useRef(false);
    const save = useRef(onSave); save.current = onSave;
    const [sketch, setSketch] = useState(null);
    const [palette, setPalette] = useState(false);
    const [act, setAct] = useState({}); // formato attivo dove sta il cursore
    const file = useRef(null);
    const commit = (next, delay = 600) => {
        latest.current = next; setD(next); pending.current = true;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => { pending.current = false; save.current(latest.current); }, delay);
    };
    useEffect(() => () => { clearTimeout(timer.current); if (pending.current) save.current(latest.current); }, []);

    useEffect(() => {
        const upd = () => {
            const sel = window.getSelection();
            const n = sel && sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
            if (!n || !n.closest || !n.closest('.pg-rich')) { setAct({}); return; }
            const q = (c) => { try { return document.queryCommandState(c); } catch { return false; } };
            setAct({ b: q('bold'), i: q('italic'), ul: q('insertUnorderedList'), ol: q('insertOrderedList'), h2: /h2/i.test(document.queryCommandValue('formatBlock') || '') });
        };
        document.addEventListener('selectionchange', upd);
        return () => document.removeEventListener('selectionchange', upd);
    }, []);

    const blocks = d.blocchi || [];
    const setBlock = (i, patch) => commit({ ...latest.current, blocchi: (latest.current.blocchi || []).map((b, k) => (k === i ? { ...b, ...patch } : b)) });
    const add = (b) => commit({ ...latest.current, blocchi: [...(latest.current.blocchi || []), b] }, 0);
    const drop = (i) => commit({ ...latest.current, blocchi: (latest.current.blocchi || []).filter((_, k) => k !== i) }, 0);
    const fmt = (k) => {
        if (k === 'h2') { const blk = document.queryCommandValue('formatBlock'); document.execCommand('formatBlock', false, /h2/i.test(blk) ? 'p' : 'h2'); }
        else if (k === 'b') document.execCommand('bold');
        else if (k === 'i') document.execCommand('italic');
        else if (k === 'ul') document.execCommand('insertUnorderedList');
        else document.execCommand('insertOrderedList');
        const el = document.activeElement; if (el && el.classList.contains('pg-rich')) el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const pickImage = async (e) => {
        const f = e.target.files && e.target.files[0]; e.target.value = '';
        if (!f) return;
        try { const img = await readImage(f); const [w, h] = await imgSize(img); add({ t: 'img', img, w, h, nome: f.name || 'Immagine' }); } catch { /* file non leggibile */ }
    };
    const word = () => downloadDocx(d.titolo || 'Pagina', { title: d.titolo, blocks });

    return (
        <div className="m-screen">
            <header className="m-bar">
                <h1>Pagina</h1>
                <div className="m-bar-r"><button className="m-pillbtn m-word" onClick={word} aria-label="Scarica in Word"><Icon name="download" size={16} />Word</button></div>
            </header>
            <div className="m-scroll m-recipe qd-sheet pg">
                <div className="wk-title">
                    <input className="pg-title" value={d.titolo || ''} placeholder="Titolo della pagina" onChange={(e) => commit({ ...d, titolo: e.target.value })} aria-label="Titolo" />
                    <button type="button" className="wk-color" style={d.colore ? { background: d.colore } : undefined} onClick={() => setPalette(true)} aria-label="Colore della pagina" />
                </div>
                <div className="pg-fmt" role="toolbar" aria-label="Formato del testo">
                    {FORMATS.map(([name, k, glyph]) => <button key={k} type="button" aria-label={name} className={`pg-f pg-f-${k}${act[k] ? ' on' : ''}`} aria-pressed={!!act[k]} onPointerDown={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()} onClick={() => fmt(k)}>{glyph}</button>)}
                </div>
                {blocks.map((b, i) => (
                    <div key={i} className="pg-block">
                        {b.t === 'testo' ? (
                            <RichText html={b.html} placeholder="Scrivi qui" onChange={(html) => setBlock(i, { html })} />
                        ) : (
                            <button type="button" className="pg-img" onClick={() => setSketch({ i })} aria-label={b.t === 'mano' ? 'Apri il disegno' : 'Disegna sulla foto'}><img src={b.img} alt="" />{b.t !== 'mano' && <span className="pg-draw"><Icon name="pen" size={16} />Disegna sopra</span>}</button>
                        )}
                        {b.t !== 'testo' && <button type="button" className="pg-x pg-dl" onClick={() => downloadImage(b.img, b.nome || d.titolo || 'Immagine')} aria-label="Scarica l’immagine"><Icon name="download" size={16} /></button>}
                        {(blocks.length > 1 || b.t !== 'testo') && <button type="button" className="pg-x" onClick={() => drop(i)} aria-label="Togli questo blocco"><Icon name="trash" size={16} /></button>}
                    </div>
                ))}
                <div className="pg-add">
                    <button type="button" onClick={() => add({ t: 'testo', html: '' })}><Icon name="plus" size={18} />Testo</button>
                    <button type="button" onClick={() => setSketch({ i: -1 })}><Icon name="pen" size={18} />A mano</button>
                    <button type="button" onClick={() => file.current && file.current.click()}><Icon name="camera" size={18} />Immagine</button>
                </div>
                <input ref={file} type="file" accept="image/*" hidden onChange={pickImage} />
            </div>
            {sketch && (
                <Sketch
                    initial={sketch.i >= 0 ? (blocks[sketch.i].t === 'img' ? { tratti: blocks[sketch.i].tratti || [], w: blocks[sketch.i].w, h: blocks[sketch.i].h, bg: blocks[sketch.i].orig || blocks[sketch.i].img } : blocks[sketch.i]) : null}
                    onClose={() => setSketch(null)}
                    onDelete={sketch.i >= 0 ? () => { drop(sketch.i); setSketch(null); } : null}
                    onSave={(o) => { if (sketch.i >= 0) setBlock(sketch.i, o); else add({ t: 'mano', ...o }); setSketch(null); }}
                />
            )}
            {palette && (
                <div className="ui-back" onClick={() => setPalette(false)}>
                    <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Colore della pagina">
                        <header><h3>Colore della pagina</h3><button type="button" onClick={() => setPalette(false)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                        <div className="ui-body"><div className="pal">
                            {PAGE_COLORS.map(([hex, name]) => <button key={hex || 'none'} type="button" className={(d.colore || '') === hex ? 'on' : ''} style={hex ? { background: hex } : undefined} onClick={() => { commit({ ...d, colore: hex }, 0); setPalette(false); }} aria-label={name}>{(d.colore || '') === hex && <Icon name="check" size={20} stroke={2.4} />}</button>)}
                        </div></div>
                    </div>
                </div>
            )}
        </div>
    );
};
