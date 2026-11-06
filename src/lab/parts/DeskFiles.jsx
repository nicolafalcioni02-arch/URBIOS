import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';

// File tuoi sulla scrivania (documenti di testo con immagini, immagini sciolte). Stanno solo nel browser (localStorage).
// Il Desktop li mostra come icone e li apre in finestra; qui ci sono archivio, lettura delle immagini e i due editor.
const KEY = 'urbios-lab-file-tuoi';
export const loadUf = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
export const saveUf = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } };
export const newUfId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// riduce a max 1600px e comprime, così la memoria del browser regge
export const readImage = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
        const img = new Image();
        img.onerror = rej;
        img.onload = () => {
            const s = Math.min(1, 1600 / Math.max(img.width, img.height));
            const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            res(c.toDataURL('image/jpeg', 0.82));
        };
        img.src = fr.result;
    };
    fr.readAsDataURL(file);
});

// salva dopo una breve pausa di scrittura
const useLater = (fn, delay = 450) => {
    const t = useRef(null); const last = useRef(fn); last.current = fn;
    useEffect(() => () => { if (t.current) { clearTimeout(t.current); t.current = null; } }, []);
    return (...a) => { if (t.current) clearTimeout(t.current); t.current = setTimeout(() => { t.current = null; last.current(...a); }, delay); };
};

export const TextFile = ({ f, onChange, onError }) => {
    const [name, setName] = useState(f.name);
    const [body, setBody] = useState(f.body || '');
    const [imgs, setImgs] = useState(f.imgs || []);
    const [saved, setSaved] = useState(true);
    const pick = useRef(null);
    const later = useLater((patch) => { onChange(patch); setSaved(true); });
    const upd = (patch) => { setSaved(false); later({ name, body, imgs, ...patch }); };
    const add = async (e) => {
        const files = [...e.target.files]; e.target.value = '';
        try { const urls = await Promise.all(files.map(readImage)); const n = [...imgs, ...urls]; setImgs(n); upd({ imgs: n }); } catch (err) { onError('Immagine non leggibile.'); }
    };
    const words = body.trim() ? body.trim().split(/\s+/).length : 0;
    return (
        <div className="uf uf-text">
            <div className="uf-bar">
                <input className="uf-name" value={name} onChange={(e) => { setName(e.target.value); upd({ name: e.target.value }); }} placeholder="Titolo" aria-label="Titolo del documento" />
                <button className="m-pillbtn light" onClick={() => pick.current.click()}><Icon name="image" size={15} /> Aggiungi immagine</button>
                <input ref={pick} type="file" accept="image/*" multiple hidden onChange={add} />
            </div>
            <textarea className="uf-body" value={body} onChange={(e) => { setBody(e.target.value); upd({ body: e.target.value }); }} placeholder="Scrivi qui…" aria-label="Testo" />
            {imgs.length > 0 && (
                <div className="uf-imgs">
                    {imgs.map((u, i) => (
                        <figure key={i}><img src={u} alt="" /><button className="m-ib" onClick={() => { const n = imgs.filter((_, j) => j !== i); setImgs(n); upd({ imgs: n }); }} aria-label="Togli l’immagine"><Icon name="x" size={14} /></button></figure>
                    ))}
                </div>
            )}
            <div className="uf-foot"><span>{words} {words === 1 ? 'parola' : 'parole'}</span><span>{saved ? 'Salvato' : 'Salvo…'}</span></div>
        </div>
    );
};

export const ImageFile = ({ f, onChange }) => {
    const [name, setName] = useState(f.name);
    const [fit, setFit] = useState(true);
    const later = useLater((n) => onChange({ name: n }));
    return (
        <div className="uf uf-img">
            <div className="uf-bar">
                <input className="uf-name" value={name} onChange={(e) => { setName(e.target.value); later(e.target.value); }} placeholder="Nome" aria-label="Nome dell’immagine" />
                <button className="m-pillbtn light" onClick={() => setFit((v) => !v)}>{fit ? 'Dimensione reale' : 'Adatta alla finestra'}</button>
                <a className="m-pillbtn light" href={f.src} download={`${name || 'immagine'}.jpg`}><Icon name="download" size={15} /> Scarica</a>
            </div>
            <div className={`uf-view${fit ? ' fit' : ''}`}><img src={f.src} alt={name} /></div>
        </div>
    );
};
