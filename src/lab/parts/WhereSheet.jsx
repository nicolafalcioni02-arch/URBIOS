import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { newId, stockState } from '../labLogic';
import { sectionOf } from '../sections';

// «Dov'è?»: scheda dal basso con la posizione di un materiale in magazzino (e conservazione, scorta, lotto, scadenza).
const norm = (x) => String(x || '').trim().toLowerCase();

// articolo del magazzino per un materiale: collegamento diretto, nome uguale o uno contenuto nell'altro
export const findArticle = (lab, m) => {
    if (!m) return null;
    const byId = m.articoloId && lab.magazzino.find((a) => a.id === m.articoloId);
    if (byId) return byId;
    const n = norm(m.nome);
    if (!n) return null;
    return lab.magazzino.find((a) => norm(a.nome) === n) || lab.magazzino.find((a) => { const b = norm(a.nome); return b.length >= 4 && n.length >= 4 && (b.includes(n) || n.includes(b)); }) || null;
};

export const WhereButton = ({ onClick, label }) => (
    <button type="button" className="m-where-btn" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label={`Dov’è ${label}`}><Icon name="pin" size={20} /></button>
);

const num = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : 0; };

// Dov'è + scorciatoia per compilare il magazzino da qui: se l'articolo c'è si modificano posizione, quantità, lotto, scadenza (si salva da solo); se non c'è lo si aggiunge con un tasto.
export const WhereSheet = ({ item, lab, onClose, onSaveStock }) => {
    const found = item ? findArticle(lab, item) : null;
    const [d, setD] = useState(() => found ? { ...found } : { ...sectionOf('magazzino').empty(lab), id: newId('mag'), nome: item ? item.nome : '', unita: (item && item.unita) || 'pz', quantita: '' });
    const [exists, setExists] = useState(!!found);
    const [saved, setSaved] = useState(true);
    const [adding, setAdding] = useState(false);
    const dirty = useRef(false);
    const latest = useRef(d); latest.current = d;
    const save = useRef(onSaveStock); save.current = onSaveStock;
    const set = (k, v) => { dirty.current = true; setSaved(false); setD((x) => ({ ...x, [k]: v })); };
    useEffect(() => {
        if (!exists || !dirty.current || !save.current) return undefined;
        const t = setTimeout(() => { dirty.current = false; save.current(latest.current); setSaved(true); }, 600);
        return () => clearTimeout(t);
    }, [d, exists]);
    useEffect(() => () => { if (exists && dirty.current && save.current) save.current(latest.current); }, [exists]);
    if (!item) return null;
    const st = exists ? stockState(d) : null;
    const step = (n) => set('quantita', String(Math.max(0, Math.round((num(d.quantita) + n) * 1e6) / 1e6)).replace('.', ','));
    const add = () => { if (!save.current || !String(d.nome).trim()) return; save.current(d); dirty.current = false; setExists(true); setSaved(true); };
    const close = () => { if (exists && dirty.current && save.current) { dirty.current = false; save.current(latest.current); } onClose(); };
    return (
        <div className="ui-back" onClick={close}>
            <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Dov’è ${item.nome}`}>
                <header><h3>{d.nome || item.nome}</h3><button type="button" onClick={close} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                <div className="ui-body">
                    {!exists && !adding && (<>
                        <p className="wh-none">Non è nel magazzino</p>
                        <button type="button" className="wh-add" onClick={() => setAdding(true)}>Aggiungi da qui</button>
                    </>)}
                    {(exists || adding) && (<>
                    {st && st.id !== 'ok' && <p className={`wh-state ${st.tone}`}>{st.label}</p>}
                    <label className="wh-f wh-big"><span>Dov’è</span><input value={d.posizione || ''} placeholder="es. freezer -20 °C, ripiano 2" onChange={(e) => set('posizione', e.target.value)} /></label>
                    <div className="wh-f"><span>Disponibile{d.unita ? ` (${d.unita})` : ''}</span>
                        <div className="wh-qty">
                            <button type="button" onClick={() => step(-1)} aria-label="Meno uno">−</button>
                            <input inputMode="decimal" value={d.quantita ?? ''} placeholder="0" onChange={(e) => set('quantita', e.target.value)} />
                            <button type="button" onClick={() => step(1)} aria-label="Più uno">+</button>
                        </div>
                    </div>
                    {!exists && <label className="wh-f"><span>Unità</span><input value={d.unita || ''} onChange={(e) => set('unita', e.target.value)} /></label>}
                    <label className="wh-f"><span>Lotto</span><input value={d.lotto || ''} onChange={(e) => set('lotto', e.target.value)} /></label>
                    <label className="wh-f"><span>Scadenza</span><input type="date" value={d.scadenza || ''} onChange={(e) => set('scadenza', e.target.value)} /></label>
                    <label className="wh-f"><span>Conservazione</span><input value={d.conservazione || ''} placeholder="es. -20 °C" onChange={(e) => set('conservazione', e.target.value)} /></label>
                    {exists ? <p className="wh-saved" aria-live="polite">{saved ? 'Salvato nel magazzino' : 'Salvataggio…'}</p> : <button type="button" className="wh-add" onClick={add}>Aggiungi al magazzino</button>}
                    </>)}
                </div>
            </div>
        </div>
    );
};
