import React, { useState } from 'react';
import { Icon } from '../ui/icons';
import { UrbiosWordmark } from '../../brand/UrbiosLogo';
import { SECTIONS, sectionOf } from '../sections';
import { searchAll } from '../labLogic';

// Barra laterale come quella delle Impostazioni (classi set-side di index.css): ricerca su tutto, aree raggruppate, azioni globali.
const HOME = { key: 'home', label: 'Panoramica', icon: 'home' };
const CALC = { key: 'calcoli', label: 'Calcoli', icon: 'calc' };
export const GROUPS = [
    { label: '', items: [HOME] },
    { label: 'Lavoro', items: ['quaderno', 'protocolli', 'reagenti'].map(sectionOf) },
    { label: 'Materiali', items: ['magazzino', 'campioni'].map(sectionOf) },
    { label: 'Letteratura', items: [sectionOf('articoli')] },
    { label: 'Strumenti', items: [CALC] },
];
export const NAV = GROUPS.flatMap((g) => g.items);

export const Sidebar = ({ lab, view, alerts, onView, onOpen, onExcel, onSaveDay, saveState, onBack, onSettings }) => {
    const [q, setQ] = useState('');
    const hits = searchAll(lab, SECTIONS, q);
    return (
        <aside className="lab-side">
            <div>
                <h2 className="lab-side-title">Laboratorio</h2>
                <div className="lab-search">
                    <Icon name="search" size={16} />
                    <input className="fld" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca ovunque" aria-label="Cerca in tutto il laboratorio" />
                    {q.trim().length >= 2 && (
                        <div className="lab-hits" role="listbox">
                            {hits.length === 0 && <p>Nessun risultato</p>}
                            {hits.map(({ key, rec }) => (
                                <button key={rec.id} role="option" onClick={() => { setQ(''); onOpen(key, rec.id); }}>
                                    <Icon name={sectionOf(key).icon} />
                                    <span><b>{sectionOf(key).title(rec)}</b><small>{sectionOf(key).label}</small></span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <nav aria-label="Aree del laboratorio">
                    {GROUPS.map((g, i) => (
                        <div key={i} className="lab-side-group">
                            {g.label && <p className="lab-side-label">{g.label}</p>}
                            {g.items.map((n) => (
                                <button key={n.key} className={`set-side ${view === n.key ? 'on' : ''}`} aria-current={view === n.key ? 'page' : undefined} onClick={() => onView(n.key)}>
                                    <Icon name={n.icon} />
                                    <span className="lab-side-text">{n.label}</span>
                                    {n.key === 'home' ? (alerts ? <em className="is-alert">{alerts}</em> : null) : lab[n.key] ? <em>{lab[n.key].length}</em> : null}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
            </div>
            <div>
                {onSaveDay && (
                    <button className="set-side lab-foot-btn" onClick={onSaveDay} title={saveState === 'dirty' ? 'Ci sono modifiche non salvate' : 'Salva l’archivio nel file'}>
                        <Icon name={saveState === 'saved' ? 'check' : saveState === 'demo' ? 'info' : 'save'} /><span className="lab-side-text">{saveState === 'saved' ? 'Giornata salvata' : saveState === 'demo' ? 'Demo: nulla si salva' : 'Salva giornata di lavoro'}</span>
                        {saveState === 'dirty' && <i className="lab-dirty" aria-label="modifiche non salvate" />}
                    </button>
                )}
                <button className="set-side lab-foot-btn" onClick={onExcel}><Icon name="table" /><span className="lab-side-text">Esporta tutto in Excel</span></button>
                {onSettings && <button className="set-side lab-foot-btn" onClick={onSettings}><Icon name="sliders" /><span className="lab-side-text">Impostazioni</span></button>}
                <button className="set-side lab-foot-btn" onClick={onBack}><Icon name="swap" /><span className="lab-side-text">Cambia area</span></button>
                <div className="px-2.5 pt-4"><UrbiosWordmark size={30} /></div>
            </div>
        </aside>
    );
};
