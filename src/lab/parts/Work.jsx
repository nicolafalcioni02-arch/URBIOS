import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { Mic, addText, beep, clock, parseDur } from '../RecordForm';
import { fmtDay, stockState } from '../labLogic';
import { COND, condOf } from './cond';
import { CondInfo, CondInfoButton } from './CondInfo';
import { Sketch } from './Sketch';
import { MiseEnPlace } from './MiseEnPlace';
import { Measures } from './Measure';
import { MatEditor, PlaceEditor, StepEditor, diffOf } from './WorkEdit';
import { WhereButton, WhereSheet, findArticle } from './WhereSheet';

// Esperimento in lavorazione (telefono): sola lettura + spunte. Dove, cosa serve, passaggi con timer, osservazioni a voce.
// Si modifica solo con «Modifica». Le spunte (preso / fatto) e le osservazioni si salvano da sole.
export const PAGE_COLORS = [['', 'Nessuno'], ['#FFD0CB', 'Rosso'], ['#FFDDA8', 'Arancio'], ['#FFF09A', 'Giallo'], ['#C9EDCB', 'Verde'], ['#C6DCFF', 'Blu'], ['#DCCFFF', 'Viola'], ['#FFCDE6', 'Rosa'], ['#D3D3DA', 'Grigio']];
const norm = (x) => String(x || '').trim().toLowerCase();

export const Work = ({ rec, lab, section, onSave, onEdit, protoVersion, onSaveProto, onSaveStock }) => {
    const [edit, setEdit] = useState(false);
    const [mep, setMep] = useState(false);
    const [sketch, setSketch] = useState(null); // { i: indice in figure | -1 }
    const [palette, setPalette] = useState(false);
    const [info, setInfo] = useState(null);
    const [open, setOpen] = useState(null); // riga aperta in modifica: 'p', 'm0', 's1'
    const base = useRef(rec); // com'era all'apertura: serve a segnare cosa cambia
    const [confirm, setConfirm] = useState(false);
    const [saved, setSaved] = useState(false);
    const [d, setD] = useState(rec);
    const latest = useRef(d);
    const timer = useRef(null);
    const pending = useRef(false);
    const save = useRef(onSave);
    save.current = onSave;
    const commit = (next, delay = 0) => {
        latest.current = next; setD(next); pending.current = true;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => { pending.current = false; save.current(latest.current); }, delay);
    };
    useEffect(() => () => { clearTimeout(timer.current); if (pending.current) save.current(latest.current); }, []);

    // timer dei passaggi
    const [where, setWhere] = useState(null); // materiale di cui si chiede «dov'è»
    const [timers, setTimers] = useState({});
    const [, tick] = useState(0);
    const toggleTimer = (i, secs) => setTimers((t) => { const n = { ...t }; if (n[i]) delete n[i]; else n[i] = Date.now() + secs * 1000; return n; });
    useEffect(() => {
        if (!Object.keys(timers).length) return undefined;
        const id = setInterval(() => {
            tick((n) => n + 1);
            const now = Date.now();
            setTimers((t) => {
                const next = { ...t }; let fired = false;
                Object.entries(t).forEach(([i, end]) => { if (now >= end) { delete next[i]; fired = true; commit({ ...latest.current, passaggi: (latest.current.passaggi || []).map((s, k) => (k === +i ? { ...s, fatto: true } : s)) }); } });
                if (fired) beep();
                return next;
            });
        }, 500);
        return () => clearInterval(id);
    }, [Object.keys(timers).length]); // eslint-disable-line react-hooks/exhaustive-deps

    const steps = d.passaggi || [];
    const mats = d.materiali || [];
    const done = steps.filter((s) => s.fatto).length;
    const proto = lab.protocolli.find((p) => p.id === d.protocolloId);
    const tickStep = (i) => commit({ ...d, passaggi: steps.map((s, k) => (k === i ? { ...s, fatto: !s.fatto } : s)) });
    const tickMat = (i) => commit({ ...d, materiali: mats.map((m, k) => (k === i ? { ...m, preso: !m.preso } : m)) });
    const article = (m) => findArticle(lab, m);
    const sub = [d.data && fmtDay(d.data), proto && (proto.codice || proto.titolo)].filter(Boolean).join(', ');

    const df = diffOf(d, base.current);
    const hit = (key, fn) => (edit ? undefined : fn);
    const pick = (key) => (edit ? () => setOpen((o) => (o === key ? null : key)) : undefined);
    const cls = (s, key) => `${edit ? ' is-edit' : ''}${s ? ' is-chg' : ''}${open === key ? ' is-open' : ''}`;
    const addMat = (i) => { const k = i + 1; commit({ ...d, materiali: [...mats.slice(0, k), { nome: '', quantita: '', unita: '' }, ...mats.slice(k)] }); setOpen('m' + k); };
    const addStep = (i) => { const k = i + 1; commit({ ...d, passaggi: [...steps.slice(0, k), { testo: '', durata: '', fatto: false }, ...steps.slice(k)] }); setOpen('s' + k); };

    return (
        <div className="m-screen">
            <header className="m-bar">
                <h1>{edit ? (df.total ? `${df.total} ${df.total === 1 ? 'modifica' : 'modifiche'}` : 'Tocca per cambiare') : 'Al lavoro'}</h1>
                <div className="m-bar-r">{!edit && <button className="m-pillbtn light" onClick={() => setMep(true)}>Mise en place</button>}<button className={`m-pillbtn${edit ? ' light' : ''}`} onClick={() => { setEdit((x) => !x); setOpen(null); }}>{edit ? 'Fine' : 'Modifica'}</button></div>
            </header>
            <div className="m-scroll m-recipe qd-sheet">
                <div className="wk-title"><h2>{section.title(d)}</h2><button type="button" className="wk-color" style={d.colore ? { background: d.colore } : undefined} onClick={() => setPalette(true)} aria-label="Colore della pagina" /></div>
                {sub && <p className="m-sub">{sub}</p>}
                                {steps.length > 0 && (
                    <div className="m-prog" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done}>
                        <div><i style={{ width: `${(done / steps.length) * 100}%` }} /></div>
                        <span>{done}/{steps.length} passaggi</span>
                    </div>
                )}

                {(d.stanza || d.posizioni) && (
                    <>
                        <h3>Dove</h3>
                        <div className={`m-where${cls(df.place, 'p')}`} onClick={edit ? () => setOpen((o) => (o === 'p' ? null : 'p')) : undefined}>
                            {d.stanza && <div><small>Stanza</small><b>{d.stanza}</b></div>}
                            {d.posizioni && <div><small>Dove metto le cose</small><p>{d.posizioni}</p></div>}
                        </div>
                    </>
                )}

                {mats.length > 0 && (
                    <>
                        <h3>Cosa serve</h3>
                        <div className="m-list">
                            {mats.map((m, i) => {
                                const a = article(m);
                                const st = a ? stockState(a) : null;
                                return (
                                    <React.Fragment key={i}><div className={`m-row m-check m-stepw${m.preso ? ' on' : ''}${cls(df.mats[i], 'm' + i)}${condOf(m, lab) ? ' cond-' + condOf(m, lab) : ''}`} onClick={pick('m' + i)}>
                                        <button type="button" className="m-box" onClick={hit('m' + i, () => tickMat(i))} aria-pressed={!!m.preso} aria-label={m.preso ? 'Preso' : 'Segna come preso'}>{m.preso && <Icon name="check" size={16} stroke={2.4} />}</button>
                                        <span className="m-row-t m-wrap" onClick={hit('m' + i, () => tickMat(i))}>
                                            <b>{m.nome}</b>
                                            {(a && a.posizione) || m.note ? <small>{[a && a.posizione, m.note].filter(Boolean).join(', ')}</small> : null}
                                        </span>
                                        <span className="m-qty m-qty-big" onClick={hit('m' + i, () => tickMat(i))}>{[m.quantita, m.unita].filter(Boolean).join(' ')}</span>
                                        {condOf(m, lab) && <><span className="m-cond" title={COND[condOf(m, lab)].label}><Icon name={COND[condOf(m, lab)].icon} size={22} /></span><CondInfoButton onClick={() => setInfo(m)} /></>}
                                        {st && st.id !== 'ok' && <span className={`m-pill ${st.tone}`}>{st.label}</span>}
                                        <WhereButton label={m.nome} onClick={() => setWhere(m)} />
                                    </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </>
                )}

                {steps.length > 0 && (
                    <>
                        <h3>Procedura</h3>
                        <div className="m-list">
                            {steps.map((s, i) => {
                                const secs = parseDur(s.durata);
                                const left = timers[i] ? Math.max(0, Math.round((timers[i] - Date.now()) / 1000)) : null;
                                return (
                                    <React.Fragment key={i}><div className={`m-row m-check m-stepw${s.fatto ? ' on' : ''}${cls(df.steps[i], 's' + i)}`} onClick={pick('s' + i)}>
                                        <button type="button" className="m-box" onClick={hit('s' + i, () => tickStep(i))} aria-pressed={!!s.fatto} aria-label={s.fatto ? 'Fatto' : 'Segna come fatto'}>{s.fatto ? <Icon name="check" size={16} stroke={2.4} /> : <em>{i + 1}</em>}</button>
                                        <span className="m-row-t m-wrap" onClick={hit('s' + i, () => tickStep(i))}>
                                            <b>{s.testo}</b>
                                            {s.stanza && s.stanza !== d.stanza && <small>{s.stanza}</small>}
                                            {s.durata && <small>{s.durata}</small>}
                                            {s.note && <small className="m-stepnote">{s.note}</small>}
                                            {secs ? <button type="button" className={`lab-timer${left !== null ? ' on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleTimer(i, secs); }}>{left !== null ? `${clock(left)}, Ferma` : `Avvia timer ${clock(secs)}`}</button> : null}
                                        </span>
                                    </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </>
                )}


                <h3>A mano</h3>
                <div className="sk-grid">
                    {(d.figure || []).map((f, i) => (f.tratti ? <button key={i} type="button" className="sk-thumb" onClick={() => setSketch({ i })} aria-label="Apri il disegno"><img src={f.img} alt="" /></button> : null))}
                    <button type="button" className="sk-new" onClick={() => setSketch({ i: -1 })}><Icon name="pen" size={20} />Scrivi o disegna</button>
                </div>

                <Measures list={d.misure || []} onChange={(misure) => commit({ ...d, misure })} />

                <h3>Osservazioni</h3>
                <div className="lab-dict m-obs">
                    <textarea className="fld" rows={3} placeholder="Scrivi o detta quello che noti" value={d.osservazioni || ''} onChange={(e) => commit({ ...d, osservazioni: e.target.value }, 600)} />
                    <Mic onText={(t) => commit({ ...d, osservazioni: addText(d.osservazioni || '', t) }, 300)} />
                </div>

                {edit && open && (() => {
                    const t = open[0]; const i = +open.slice(1);
                    const title = t === 'p' ? 'Dove' : t === 'm' ? (mats[i] && mats[i].nome) || 'Materiale' : `Passaggio ${i + 1}`;
                    return (
                        <div className="ui-back" onClick={() => setOpen(null)}>
                            <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
                                <header><h3>{title}</h3><button type="button" onClick={() => setOpen(null)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                                <div className="ui-body">
                                    {t === 'p' && <PlaceEditor d={d} commit={commit} />}
                                    {t === 'm' && mats[i] && <MatEditor d={d} i={i} commit={commit} onGone={() => setOpen(null)} onAdd={() => addMat(i)} />}
                                    {t === 's' && steps[i] && <StepEditor d={d} i={i} commit={commit} onGone={() => setOpen(null)} onAdd={() => addStep(i)} />}
                                    <button type="button" className="wh-add" onClick={() => setOpen(null)}>Fatto</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
                {palette && (
                    <div className="ui-back" onClick={() => setPalette(false)}>
                        <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Colore della pagina">
                            <header><h3>Colore della pagina</h3><button type="button" onClick={() => setPalette(false)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                            <div className="ui-body">
                                <p className="wh-note">Si vede nell’elenco del Quaderno, sulla data a margine.</p>
                                <div className="pal">
                                    {PAGE_COLORS.map(([hex, name]) => (
                                        <button key={hex || 'none'} type="button" className={(d.colore || '') === hex ? 'on' : ''} style={hex ? { background: hex } : undefined} onClick={() => { commit({ ...d, colore: hex }); setPalette(false); }} aria-label={name}>{(d.colore || '') === hex && <Icon name="check" size={20} stroke={2.4} />}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {sketch && (
                    <Sketch
                        initial={sketch.i >= 0 ? (d.figure || [])[sketch.i] : null}
                        onClose={() => setSketch(null)}
                        onDelete={sketch.i >= 0 ? () => { commit({ ...d, figure: (d.figure || []).filter((_, k) => k !== sketch.i) }); setSketch(null); } : null}
                        onSave={(o) => {
                            const list = d.figure || [];
                            commit({ ...d, figure: sketch.i >= 0 ? list.map((f, k) => (k === sketch.i ? { ...f, ...o } : f)) : [...list, { nome: 'Appunto a mano', ...o }] });
                            setSketch(null);
                        }}
                    />
                )}
                {mep && <MiseEnPlace d={d} lab={lab} commit={commit} onClose={() => setMep(false)} />}
                {info && <CondInfo m={info} lab={lab} onClose={() => setInfo(null)} />}
                {where && <WhereSheet key={where.nome + where.articoloId} item={where} lab={lab} onSaveStock={onSaveStock} onClose={() => setWhere(null)} />}
                <button className="m-again" onClick={() => { setSaved(false); setConfirm(true); }}>Salva</button>
                {confirm && (
                    <div className="ui-back" onClick={() => setConfirm(false)}>
                        <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Salva">
                            <header><h3>{saved ? 'Salvato' : 'Salvare le modifiche?'}</h3><button type="button" onClick={() => setConfirm(false)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                            <div className="ui-body">
                                <p className="wh-note">{saved ? `Nuovo protocollo, versione ${protoVersion(d)}, creato. L’originale è rimasto com’era e l’esperimento di oggi è collegato alla nuova versione.` : `Le modifiche si salvano come versione ${protoVersion(d)} del protocollo, l’originale resta com’è.`}</p>
                                {saved ? <button type="button" className="wh-add" onClick={() => setConfirm(false)}>Fatto</button> : <button type="button" className="wh-add" onClick={() => { onSaveProto(d); setSaved(true); }}>Salva nuova versione</button>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
