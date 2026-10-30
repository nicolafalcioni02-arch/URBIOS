import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LAF_ACTIVITIES, LAF_LEVELS } from './lafData';

const f2 = (x) => (x === undefined ? '–' : String(x).replace('.', ','));

// Tabelle di riferimento del calcolatore LAF: livelli di attività (LARN, FAO/WHO/UNU, EFSA) e coefficienti per attività.
export const LafInfo = ({ onClose, onAdd, activities, sex = 'M' }) => {
    const mine = sex === 'F' ? 'f' : 'm'; // colonna del paziente
    const other = sex === 'F' ? 'm' : 'f';
    const sexLabel = sex === 'F' ? 'donna' : 'uomo';
    const [tab, setTab] = useState('livelli');
    const [q, setQ] = useState('');
    const [group, setGroup] = useState('tutte');
    const [added, setAdded] = useState({});
    const query = q.trim().toLowerCase();
    const groups = LAF_ACTIVITIES.map((g) => ({
        ...g,
        rows: g.rows.filter((r) => (group === 'tutte' || group === g.group) && (!query || r.n.toLowerCase().includes(query))),
    })).filter((g) => g.rows.length);
    const has = (n) => activities.some((a) => a.name === n);

    return createPortal(
        <div className="lafi" role="dialog" aria-label="Informazioni sul LAF" onClick={(e) => e.stopPropagation()}>
            <div className="lafm-head">
                <div>
                    <h3>Riferimenti LAF</h3>
                    <span>Livelli di attività e coefficienti per attività</span>
                </div>
                <button className="lafm-x" onClick={onClose} aria-label="Chiudi">
                    <i className="ph-bold ph-x"></i>
                </button>
            </div>
            <div className="lafm-modes" role="tablist">
                <button role="tab" aria-selected={tab === 'livelli'} className={tab === 'livelli' ? 'on' : ''} onClick={() => setTab('livelli')}>
                    <i className="ph ph-gauge"></i> Livelli
                </button>
                <button role="tab" aria-selected={tab === 'attivita'} className={tab === 'attivita' ? 'on' : ''} onClick={() => setTab('attivita')}>
                    <i className="ph ph-person-simple-walk"></i> Attività
                </button>
            </div>

            <div className="lafm-body">
                {tab === 'livelli' ? (
                    <>
                        <div className="lafi-how">
                            <b>Come si calcola</b>
                            <p>
                                LAF (o PAL) = Σ (coefficiente × ore) ÷ 24. Il coefficiente di ogni attività è un multiplo del metabolismo basale. Il fabbisogno giornaliero è <b>metabolismo basale × LAF</b>.
                            </p>
                        </div>
                        {LAF_LEVELS.map((l) => (
                            <section className="lafi-card" key={l.source}>
                                <div className="lafi-src">
                                    <div>
                                        <b>{l.source}</b>
                                        <small>{l.note}</small>
                                    </div>
                                    <a href={l.link} target="_blank" rel="noreferrer" aria-label={`Fonte: ${l.source}`}>
                                        Fonte <i className="ph ph-arrow-up-right"></i>
                                    </a>
                                </div>
                                {l.rows.map((r) => (
                                    <div className="lafi-lvl" key={r.v}>
                                        <span className="lafi-v">{r.v}</span>
                                        <div>
                                            <b>{r.t}</b>
                                            {r.d && <small>{r.d}</small>}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        ))}
                        <p className="lafm-hint">
                            Sono valori medi di popolazione: indicativi, non misure individuali. Il calcolatore usa le fasce FAO/WHO/UNU per l’etichetta del livello (sotto 1,70 sedentario o poco attivo, 1,70–1,99 attivo, da 2,00 molto attivo).
                        </p>
                    </>
                ) : (
                    <>
                        <div className="lafi-search">
                            <i className="ph ph-magnifying-glass"></i>
                            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un’attività" aria-label="Cerca" />
                        </div>
                        <div className="lafi-groups no-scrollbar">
                            {['tutte', ...LAF_ACTIVITIES.map((g) => g.group)].map((g) => (
                                <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>
                                    {g === 'tutte' ? 'Tutte' : g}
                                </button>
                            ))}
                        </div>
                        <p className="lafi-sexnote">
                            Paziente: <b>{sexLabel}</b>. Per l’aggiunta uso il valore del suo sesso; dove la FAO riporta solo l’altro, uso quello e lo segnalo.
                        </p>
                        <p className="lafi-cols">
                            <span>Attività</span>
                            <span className={mine === 'm' ? 'me' : ''}>Uomo</span>
                            <span className={mine === 'f' ? 'me' : ''}>Donna</span>
                            <span></span>
                        </p>
                        {groups.map((g) => (
                            <section className="lafi-card" key={g.group}>
                                <p className="lafi-gh">{g.group}</p>
                                {g.rows.map((r) => {
                                    // valore del sesso del paziente; se manca, quello dell'altro sesso (segnalato)
                                    const own = r[mine];
                                    const val = own !== undefined ? own : r[other];
                                    const onlyOther = own === undefined && r[other] !== undefined;
                                    const done = added[r.n] || has(r.n);
                                    return (
                                        <div className="lafi-row" key={r.n}>
                                            <span className="lafi-n">
                                                {r.n}
                                                {onlyOther && <small className="lafi-only">solo {other === 'm' ? 'uomini' : 'donne'}</small>}
                                            </span>
                                            <b className={mine === 'm' ? 'me' : ''}>{f2(r.m)}</b>
                                            <b className={mine === 'f' ? 'me' : ''}>{f2(r.f)}</b>
                                            <button
                                                disabled={done}
                                                onClick={() => {
                                                    onAdd(r.n, Math.round(val * 100) / 100, onlyOther ? `Valore FAO riportato solo per ${other === 'm' ? 'gli uomini' : 'le donne'}: controlla` : '');
                                                    setAdded({ ...added, [r.n]: true });
                                                }}
                                                aria-label={done ? `${r.n}: già nel calcolatore` : `Aggiungi ${r.n} al calcolatore`}
                                            >
                                                <i className={`ph ${done ? 'ph-check' : 'ph-plus'}`}></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </section>
                        ))}
                        {groups.length === 0 && <p className="lafm-hint">Nessuna attività trovata.</p>}
                        <p className="lafm-hint">
                            Valori PAR (multipli del metabolismo basale), FAO/WHO/UNU 2001, Annex 5. “–” = non riportato per quel sesso. Il tasto + aggiunge l’attività al calcolatore con il valore del sesso del paziente: poi scegli le ore. Nel calcolatore il sonno vale 0,95 (valore usato in alcune tabelle italiane); la FAO riporta 1,0.
                        </p>
                        <p className="lafm-hint">
                            <a href="https://www.fao.org/4/y5686e/y5686e0e.htm" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                                Annex 5 · FAO/WHO/UNU 2001
                            </a>
                        </p>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};
