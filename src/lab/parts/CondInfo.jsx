import React from 'react';
import { Icon } from '../ui/icons';
import { COND, condOf } from './cond';
import { findArticle } from './WhereSheet';

// «i» accanto a ghiaccio / pericolo: informativa sul materiale (dati dal magazzino, se c'è)
export const CondInfoButton = ({ onClick }) => (
    <button type="button" className="m-cond-i" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label="Informativa"><Icon name="info" size={18} /></button>
);

export const CondInfo = ({ m, lab, onClose }) => {
    const c = condOf(m, lab);
    const a = findArticle(lab, m);
    const rows = [
        c === 'hazard' && ['Pericolo', m.pericolo || (a && a.pericolo) || 'Non registrato'],
        a && a.cas && ['N. CAS', a.cas],
        a && a.marca && ['Produttore', a.marca],
        a && (a.conservazione || a.posizione) && ['Conservazione', [a.conservazione, a.posizione].filter(Boolean).join(', ')],
        a && a.scadenza && ['Scadenza', a.scadenza.split('-').reverse().join('/')],
        m.note && ['Nota', m.note],
        a && a.scheda && ['Scheda tecnica', a.scheda],
    ].filter(Boolean);
    return (
        <div className="ui-back" onClick={onClose}>
            <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Informativa ${m.nome}`}>
                <header><h3>{m.nome}</h3><button type="button" onClick={onClose} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                <div className="ui-body">
                    {c && <p className={`ci-head cond-${c}`}><span className="m-cond"><Icon name={COND[c].icon} size={22} /></span>{COND[c].label}</p>}
                    <p className="wh-note">{c === 'ice' ? 'Tienilo su ghiaccio dal prelievo fino alla fine dell’uso e rimettilo a posto appena possibile.' : c === 'hazard' ? 'Prima di usarlo controlla la scheda di sicurezza, lavora con i dispositivi di protezione previsti e smaltiscilo come da procedura.' : 'Nessuna condizione particolare.'}</p>
                    {rows.map(([k, v]) => <div key={k} className="ci-row"><small>{k}</small><b className={k === 'Scheda tecnica' ? 'ci-long' : undefined}>{v}</b></div>)}
                    {!a && <p className="wh-note">Non è nel magazzino: i dettagli si vedono quando lo aggiungi da «Dov’è».</p>}
                </div>
            </div>
        </div>
    );
};
