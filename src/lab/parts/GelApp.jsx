import React, { useRef, useState } from 'react';
import { GelStudio } from '../GelStudio';
import { Icon } from '../ui/icons';
import { emptyGel, gelPng, readImage } from '../figures';

const KEY = 'urbios-lab-gel-app';
const load = () => { try { const g = JSON.parse(localStorage.getItem(KEY)); return g && typeof g === 'object' ? g : emptyGel(); } catch (e) { return emptyGel(); } };
const imgSize = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.width, im.height]); im.onerror = () => res([4, 3]); im.src = src; });

// App «Gel» della scrivania: lo studio del gel in una finestra. «Salva» tiene il lavoro nel browser.
// immagine del gel con le etichette, in JPEG (1600 px) per stare nella memoria del browser
const gelJpeg = async (g) => {
    const blob = await gelPng(g, true, 1600);
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    try {
        const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
        const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0);
        return c.toDataURL('image/jpeg', 0.9);
    } catch (e) { return ''; } finally { URL.revokeObjectURL(url); }
};

export const GelApp = ({ onDesk, onDone, initial, files }) => {
    const [gel, setGel] = useState(() => initial || load());
    const [n, setN] = useState(0); // «Annulla» rimonta lo studio sull'ultima versione salvata
    const file = useRef(null);
    const save = async (g) => {
        let next = g;
        // «Salva» mette sulla scrivania l'immagine del gel e il file .gelraw (modificabile): sempre gli stessi due file, aggiornati
        if (onDesk && g.img) {
            const src = await gelJpeg(g);
            if (src) { const ids = onDesk({ imgId: g.deskId, rawId: g.rawId, name: (g.title || '').trim() || 'Gel', src, gel: g }); if (!ids) return; next = { ...g, deskId: ids.imgId, rawId: ids.rawId }; }
        }
        setGel(next);
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { window.alert('La memoria del browser è piena: il gel non è salvato.'); return; }
        if (onDone) onDone(); // «Salva» chiude il programma
    };
    const pick = async (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try { const img = await readImage(f); const [w, h] = await imgSize(img); setGel((g) => ({ ...g, src: img, img, w, h })); } catch (err) { window.alert('Immagine non leggibile.'); }
    };
    // Nuovo: gel vuoto. Importa: si sceglie tra i file della scrivania (gel .gelraw o immagini), mai dal dispositivo
    const fresh = () => { if (gel.img && !window.confirm('Cominciare un nuovo gel? Le modifiche non salvate vanno perse.')) return; setGel(emptyGel()); setN((x) => x + 1); };
    const [pickOpen, setPickOpen] = useState(false);
    const list = (files || []).filter((f) => f.type === 'gelraw' || f.type === 'img');
    const importDesk = async (f) => {
        setPickOpen(false);
        if (f.type === 'gelraw') { setGel({ ...emptyGel(), ...f.gel }); setN((x) => x + 1); return; }
        const [w, h] = await imgSize(f.src);
        setGel((g) => ({ ...g, src: f.src, img: f.src, w, h })); setN((x) => x + 1);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div className="ga-bar">
                <button type="button" className="m-pillbtn light" onClick={fresh}><Icon name="plus" size={15} /> Nuovo</button>
                <button type="button" className="m-pillbtn light" aria-expanded={pickOpen} onClick={() => setPickOpen((o) => !o)}><Icon name="upload" size={15} /> Importa</button>
            </div>
            <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <GelStudio key={n} embedded gel={gel} onChange={save} onPickPhoto={() => file.current.click()} onClose={() => { setGel(initial || load()); setN((x) => x + 1); }} />
                {pickOpen && (
                    <>
                        <div className="ga-pick-back" onClick={() => setPickOpen(false)} />
                        <div className="ga-pick" role="menu">
                            <b>Dalla scrivania</b>
                            {list.length === 0 && <p>Sulla scrivania non ci sono ancora gel o immagini.</p>}
                            {list.map((f) => <button key={f.id} role="menuitem" onClick={() => importDesk(f)}><Icon name="image" size={15} /><span>{f.name || 'Senza nome'}</span><em>{f.type === 'gelraw' ? 'Modificabile' : 'Immagine'}</em></button>)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
