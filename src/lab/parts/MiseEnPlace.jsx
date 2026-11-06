import React from 'react';
import { Icon } from '../ui/icons';
import { parseDur, clock } from '../RecordForm';
import { stockState } from '../labLogic';
import { COND, condOf } from './cond';
import { CondInfo, CondInfoButton } from './CondInfo';
import { findArticle } from './WhereSheet';

// Mise en place: tutto quello che serve prima di iniziare, raggruppato per dove si prende (un giro solo), con le spunte «preso».
export const MiseEnPlace = ({ d, lab, commit, onClose }) => {
    const [info, setInfo] = React.useState(null);
    const mats = d.materiali || [];
    const steps = d.passaggi || [];
    // prima per stanza (se ce n'è più d'una), poi per posto dove si prende
    const rooms = new Map();
    mats.forEach((m, i) => {
        const a = findArticle(lab, m);
        const room = m.stanza || d.stanza || '';
        const where = (a && (a.posizione || a.conservazione)) || 'Altro, posizione non registrata';
        if (!rooms.has(room)) rooms.set(room, new Map());
        const g = rooms.get(room);
        if (!g.has(where)) g.set(where, []);
        g.get(where).push({ m, i, a });
    });
    const multi = rooms.size > 1;
    const stepRooms = [...new Set(steps.map((s) => s.stanza).filter(Boolean))];
    const used = new Set(mats.map((m) => condOf(m, lab)).filter(Boolean));
    const legend = [used.has('ice') && 'fondo blu: tieni in ghiaccio', used.has('hazard') && 'fondo giallo: pericoloso'].filter(Boolean);
    const taken = mats.filter((m) => m.preso).length;
    const tick = (i) => commit({ ...d, materiali: mats.map((m, k) => (k === i ? { ...m, preso: !m.preso } : m)) });
    const problems = mats.map((m) => ({ m, st: findArticle(lab, m) ? stockState(findArticle(lab, m)) : null })).filter((x) => x.st && x.st.id !== 'ok');
    const wait = steps.reduce((t, s) => t + (parseDur(s.durata) || 0), 0);
    const timers = steps.filter((s) => parseDur(s.durata)).length;
    return (
        <div className="ui-back" onClick={onClose}>
            <div className="ui-sheet mep" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Mise en place">
                <header><h3>Mise en place</h3><button type="button" onClick={onClose} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                <div className="ui-body">
                    {(d.stanza || d.posizioni) && (
                        <div className="mep-block">
                            <small>Prepara il posto</small>
                            {d.stanza && <b>{d.stanza}</b>}
                            {d.posizioni && <p>{d.posizioni}</p>}
                        </div>
                    )}
                    {problems.length > 0 && (
                        <div className="mep-block mep-warn">
                            <small>Da controllare</small>
                            {problems.map((x, k) => <p key={k}><b>{x.m.nome}</b>, {x.st.label.toLowerCase()}</p>)}
                        </div>
                    )}
                    {mats.length > 0 && <h4>Da prendere, {taken}/{mats.length}</h4>}
                    {[...rooms.entries()].map(([room, groups]) => (
                        <div key={room || '_'} className={multi ? 'mep-room' : undefined}>
                            {multi && <h5>{room || 'Senza stanza'}</h5>}
                            {[...groups.entries()].sort((x, y) => (x[0].startsWith('Altro') ? 1 : 0) - (y[0].startsWith('Altro') ? 1 : 0)).map(([where, list]) => (
                                <div key={where} className="mep-group">
                                    <small>{where}</small>
                                    {list.map(({ m, i }) => {
                                        const c = condOf(m, lab);
                                        return (
                                            <button key={i} type="button" className={`mep-item${m.preso ? ' on' : ''}${c ? ' cond-' + c : ''}`} onClick={() => tick(i)} aria-pressed={!!m.preso}>
                                                <span className="m-box">{m.preso && <Icon name="check" size={16} stroke={2.4} />}</span>
                                                <span className="mep-n">{m.nome}</span>
                                                {c && <><span className="m-cond" title={COND[c].label}><Icon name={COND[c].icon} size={22} /></span><CondInfoButton onClick={() => setInfo(m)} /></>}
                                                <b>{[m.quantita, m.unita].filter(Boolean).join(' ')}</b>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                    {legend.length > 0 && <p className="mep-legend">{legend.join(', ')}</p>}
                    {steps.length > 0 && (
                        <div className="mep-block">
                            <small>Procedura</small>
                            <p>{steps.length} {steps.length === 1 ? 'passaggio' : 'passaggi'}{timers ? `, ${timers} con timer` : ''}{wait ? `, attese in tutto ${clock(wait)}` : ''}</p>
                            {stepRooms.length > 0 && <p>Si cambia stanza: {[d.stanza, ...stepRooms].filter(Boolean).filter((x, k, a) => a.indexOf(x) === k).join(', ')}</p>}
                        </div>
                    )}
                    {!mats.length && !steps.length && !d.stanza && !d.posizioni && <p className="wh-note">Non c’è ancora niente da preparare.</p>}
                    <button type="button" className="wh-add" onClick={onClose}>Iniziamo</button>
                    {info && <CondInfo m={info} lab={lab} onClose={() => setInfo(null)} />}
                </div>
            </div>
        </div>
    );
};
