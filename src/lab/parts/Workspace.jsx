import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { sectionOf } from '../sections';
import { Detail } from './Mobile';
import { NotebookPreview } from './NotebookPreview';

// Postazione di lavoro (PC e iPad): schede delle voci aperte, fino a due pannelli affiancati.
// Lo stato (schede, pannello attivo, affiancato) sta in Lab.jsx. Mappa: README.md

export const titleOf = (r) => (r && (r.titolo || r.nome || r.codice)) || 'Nuova voce';
const ICON = { quaderno: 'notebook', protocolli: 'protocol', reagenti: 'flask', magazzino: 'package', campioni: 'tube', articoli: 'article' };

export const Workspace = ({ lab, db, desk, dock, tabs, active, second, onActive, onSecond, onSwap, onPlace, onClose, onOpenPrint, onSave, onDelete, onPrint, onNewFrom, onSaveStock, protoVersion, onSaveProto }) => {
    const [dragId, setDragId] = useState(null);
    const [over, setOver] = useState(null);
    const drop = (slot) => { if (dragId) onPlace(slot, dragId); setDragId(null); setOver(null); };
    const shown = [active, second].filter((id, i, a) => id && a.indexOf(id) === i);
    const byId = (id) => tabs.find((t) => t.id === id);
    // suggerimento nella barra: anteprima di stampa della voce attiva; sparisce quando è già aperta e resta aperta
    const cur = byId(active);
    const sugg = cur && cur.kind === 'rec' && !cur.isNew && !tabs.some((x) => x.id === `print:${cur.key}:${cur.recId}`) ? cur : null;
    const panel = (t) => {
        if (t.kind === 'book') return <NotebookPreview db={db} />;
        if (t.kind === 'print') return <NotebookPreview db={db} activeId={t.recId} kind={t.key} startOnly />;
        const section = sectionOf(t.key);
        const rec = (lab[t.key] || []).find((r) => r.id === t.recId) || t.rec;
        if (!rec || !section) return <div className="m-empty"><p>Questa voce non c’è più</p></div>;
        return (
            <>
                <Detail key={t.id} rec={rec} isNew={!!t.isNew} section={section} lab={lab}
                    onSave={(r) => onSave(t.key, r, t.id)} onDelete={() => onDelete(t.key, rec.id, t.id)} onPrint={(ids) => onPrint(ids, { kind: t.key })}
                    onNewFrom={onNewFrom} onSaveStock={onSaveStock} protoVersion={protoVersion} onSaveProto={onSaveProto} onLeave={() => onClose(t.id)} />
            </>
        );
    };
    return (
        <div className="ws">
            {dock}
            <div className="ws-tabs" role="tablist">
                {tabs.map((t) => {
                    const r = t.kind === 'print' ? null : (lab[t.key] || []).find((x) => x.id === t.recId) || t.rec;
                    const on = shown.includes(t.id);
                    return (
                        <div key={t.id} role="tab" aria-selected={on} className={`ws-tab${on ? ' on' : ''}${t.id === active ? ' cur' : ''}${dragId === t.id ? ' dragging' : ''}`} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; setDragId(t.id); }} onDragEnd={() => { setDragId(null); setOver(null); }}>
                            <button className="ws-tab-b" onClick={() => onActive(t.id)}>
                                <Icon name={t.kind === 'print' ? 'printer' : t.kind === 'book' ? 'notebook' : ICON[t.key] || 'notebook'} size={15} />
                                <span>{t.kind === 'book' ? 'Quaderno completo' : <>{t.kind === 'print' ? 'Anteprima: ' : ''}{titleOf(t.kind === 'print' ? (lab[t.key] || []).find((x) => x.id === t.recId) : r)}</>}</span>
                            </button>
                            {t.id !== active && <button className={`ws-tab-s${t.id === second ? ' on' : ''}`} onClick={() => onSecond(t.id === second ? null : t.id)} aria-label={t.id === second ? 'Chiudi l’affiancamento' : 'Affianca'} title={t.id === second ? 'Chiudi l’affiancamento' : 'Affianca'}><Icon name="lanes" size={15} /></button>}
                            <button className="ws-tab-x" onClick={() => onClose(t.id)} aria-label="Chiudi la scheda"><Icon name="x" size={14} /></button>
                        </div>
                    );
                })}
                {sugg && <button className="ws-sugg" onClick={() => onOpenPrint(sugg)} title="Apri l’anteprima di stampa accanto"><Icon name="eye" size={15} /> Anteprima accanto</button>}
            </div>
            <div className={`ws-panes${shown.length > 1 ? ' two' : ''}`}>
                {shown.length ? shown.map((id, i) => byId(id) && <div key={id} className={`ws-pane${dragId && over === i ? ' drop' : ''}`} onDragOver={(e) => { if (dragId) { e.preventDefault(); setOver(i); } }} onDragLeave={() => setOver(null)} onDrop={(e) => { e.preventDefault(); drop(i === 0 ? 'a' : 'b'); }}>{panel(byId(id))}</div>)
                    : <div className="m-empty"><p>Scegli una voce dall’elenco, oppure creane una nuova con il +</p></div>}
            </div>
        </div>
    );
};
