import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { Pill } from '../ui/Pill';
import { SECTIONS, sectionOf } from '../sections';
import { scaleFactor, scaledQty, searchAll, newId } from '../labLogic';
import { fmtDay, latestVersions, stockState, versionsOf } from '../labLogic';
import { COND, condOf } from './cond';
import { CondInfo, CondInfoButton } from './CondInfo';
import { RecordForm } from '../RecordForm';
import { Calculator } from './Calculator';
import { Work } from './Work';
import { PageView } from './Page';
import { readDocx } from '../docx';
import { WhereButton, WhereSheet } from './WhereSheet';
import { Desktop } from './Desktop';
import { UrbiosWordmark } from '../../brand/UrbiosLogo';
import { Button } from 'glisse';

// Laboratorio per iPhone: una schermata alla volta, tasti grandi in basso (zona del pollice).
// Home a icone → elenco → scheda. Niente barra laterale, niente anteprima del quaderno. Stili: mobileStyles.js
const TILES = ['quaderno', 'protocolli', 'reagenti', 'magazzino', 'campioni', 'articoli'];

// Tasto tondo in vetro (glisse): `on` = attivo, `fill` = azione principale in nero
const GBtn = ({ icon, size = 22, stroke, on, fill, ...rest }) => (
    <Button className={`m-gbtn${on ? ' on' : ''}`} variant={fill ? 'filled' : 'glass'} tint={fill ? 'var(--ink)' : undefined} icon={<Icon name={icon} size={size} stroke={stroke} />} {...rest} />
);

const Bar = ({ title, right }) => (
    <header className="m-bar">
        <h1>{title}</h1>
        <div className="m-bar-r">{right}</div>
    </header>
);

const Home = ({ lab, ov, empty, onExample, onOpen, onGo }) => {
    const [q, setQ] = useState('');
    const [find, setFind] = useState(false);
    const hits = searchAll(lab, SECTIONS, q, 8);
    const apps = TILES.map((k) => ({ key: k, label: sectionOf(k).label, icon: sectionOf(k).icon, n: lab[k].length }));
    return (
        <div className="m-screen">
            <div className="m-scroll m-home">
                <div className="m-hello-row">
                    <h1 className="m-hello">Laboratorio</h1>
                    <div className="m-hello-btns">
                        <GBtn icon="search" on={find} onClick={() => { setFind((f) => !f); setQ(''); }} aria-label="Cerca" />
                        <GBtn icon="calc" onClick={() => onGo('calcolatrice')} aria-label="Calcolatrice" />
                    </div>
                </div>
                {q.trim().length >= 2 ? (
                    <div className="m-list">
                        {hits.length === 0 && <p className="m-none">Nessun risultato</p>}
                        {hits.map(({ key, rec }) => (
                            <button key={rec.id} className="m-row" onClick={() => { setQ(''); setFind(false); onOpen(key, rec.id); }}>
                                <span className="m-ico"><Icon name={sectionOf(key).icon} size={20} /></span>
                                <span className="m-row-t"><b>{sectionOf(key).title(rec)}</b><small>{sectionOf(key).label}</small></span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="m-apps">
                            {apps.map((a) => (
                                <button key={a.key} className="m-app" onClick={() => onGo(a.key)}>
                                    <span className="m-app-i"><Icon name={a.icon} size={32} stroke={1.5} /></span>
                                    <span className="m-app-l">{a.label}</span>
                                </button>
                            ))}
                        </div>
                        {empty && <button className="m-link" onClick={onExample}>Carica dati di esempio</button>}
                    </>
                )}
            </div>
            {find && (
                <label className="m-search m-search-up">
                    <Icon name="search" size={18} />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca ovunque" aria-label="Cerca in tutto il laboratorio" enterKeyHint="search" />
                </label>
            )}
        </div>
    );
};

// Quaderno: pagine su carta a quadretti, raggruppate per mese, con la data a margine come un diario
const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const NotebookList = ({ list, lab, onOpen, selId }) => {
    const groups = [];
    list.forEach((r) => {
        const dt = r.data ? new Date(r.data) : null;
        const ok = dt && !Number.isNaN(dt.getTime());
        const key = ok ? `${dt.getFullYear()}-${dt.getMonth()}` : 'senza';
        let g = groups[groups.length - 1];
        if (!g || g.key !== key) { g = { key, label: ok ? `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}` : 'Senza data', items: [] }; groups.push(g); }
        g.items.push({ r, dt: ok ? dt : null });
    });
    return (
        <div className="qd">
            {groups.map((g) => (
                <section key={g.key}>
                    <h2 className="qd-month">{g.label}</h2>
                    {g.items.map(({ r, dt }) => {
                        const proto = lab.protocolli.find((p) => p.id === r.protocolloId);
                        const steps = r.passaggi || [];
                        const done = steps.filter((s) => s.fatto).length;
                        return (
                            <button key={r.id} className={`qd-page${selId === r.id ? ' on' : ''}`} onClick={() => onOpen(r)}>
                                <span className="qd-date" style={r.colore ? { background: r.colore } : undefined}>{dt ? <><b>{dt.getDate()}</b><small>{MONTHS[dt.getMonth()].slice(0, 3)}</small></> : <small>s.d.</small>}</span>
                                <span className="qd-body">
                                    <b>{r.titolo || (r.tipo === 'pagina' ? 'Pagina senza titolo' : 'Esperimento senza titolo')}</b>
                                    <small>{r.tipo === 'pagina' ? ['Pagina', (r.blocchi || []).filter((b) => b.t !== 'testo').length ? `${(r.blocchi || []).filter((b) => b.t !== 'testo').length} immagini` : ''].filter(Boolean).join(', ') : [proto && (proto.codice || proto.titolo), steps.length ? `${done}/${steps.length} passaggi` : '', r.codice].filter(Boolean).join(', ')}</small>
                                </span>
                            </button>
                        );
                    })}
                </section>
            ))}
        </div>
    );
};

const ListScreen = ({ section, lab, onOpen, onNew, onNewFrom, onNewPage, selId, tools }) => {
    const docRef = React.useRef(null);
    const [docErr, setDocErr] = useState('');
    const importDoc = async (e) => {
        const f = e.target.files && e.target.files[0]; e.target.value = '';
        if (!f) return;
        try { setDocErr(''); const { title, blocks } = await readDocx(f); setPick(false); onNewPage({ titolo: title, blocchi: blocks }); } catch (err) { setDocErr(err.message || 'Non riesco a leggere il file'); }
    };
    const [pick, setPick] = useState(false);
    const protos = latestVersions(lab.protocolli).sort((a, b) => (a.stato === 'In vigore' ? 0 : 1) - (b.stato === 'In vigore' ? 0 : 1));
    const plus = () => (section.key === 'quaderno' ? setPick(true) : onNew());
    const [q, setQ] = useState('');
    const [group, setGroup] = useState('');
    const [find, setFind] = useState(false);
    const all = section.key === 'protocolli' ? latestVersions(lab.protocolli) : lab[section.key];
    const groups = useMemo(() => {
        const m = new Map();
        all.forEach((r) => { const g = section.group(r); if (g) m.set(g, (m.get(g) || 0) + 1); });
        return [...m.keys()];
    }, [all, section]);
    const list = useMemo(() => {
        const s = q.trim().toLowerCase();
        const found = all.filter((r) => (!s || section.search(r).includes(s)) && (!group || section.group(r) === group));
        return section.sort ? [...found].sort(section.sort) : found;
    }, [all, q, group, section]);
    return (
        <div className="m-screen">
            <div className="m-scroll m-home">
                <div className="m-hello-row">
                    <h1 className="m-hello">{section.label}</h1>
                    <div className="m-hello-btns">
                        <GBtn icon="search" on={find || q} onClick={() => { setFind((f) => !f); setQ(''); }} aria-label="Cerca" />
                        {(tools || []).map((t) => <GBtn key={t.label} icon={t.icon} onClick={t.onClick} aria-label={t.label} title={t.label} />)}
                        <GBtn fill icon="plus" stroke={2} onClick={plus} aria-label={`Nuovo ${section.single}`} />
                    </div>
                </div>
                {groups.length > 1 && (
                    <div className="m-chips" role="group" aria-label="Filtro">
                        <button className={!group ? 'on' : ''} onClick={() => setGroup('')}>Tutti</button>
                        {groups.map((g) => <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(group === g ? '' : g)}>{g}</button>)}
                    </div>
                )}
                {list.length === 0 ? (
                    <p className="m-none">{all.length ? 'Nessun risultato.' : `Non c’è ancora nessun ${section.single}.`}</p>
                ) : (
                    section.key === 'quaderno' ? <NotebookList list={list} lab={lab} onOpen={onOpen} selId={selId} /> :
                    <div className="m-list">
                        {list.map((r) => {
                            const b = section.badge(r);
                            return (
                                <button key={r.id} className={`m-row${selId === r.id ? ' on' : ''}`} onClick={() => onOpen(r)}>
                                    <span className="m-row-t"><b>{section.title(r)}</b>{section.sub(r) && <small>{section.sub(r)}</small>}</span>
                                    {b && <span className={`m-pill ${b.tone}`}>{b.label}</span>}
                                    <Icon name="chevron" size={18} />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            {pick && (
                <div className="ui-back" onClick={() => setPick(false)}>
                    <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Nuovo esperimento">
                        <header><h3>Nuovo esperimento</h3><button type="button" onClick={() => setPick(false)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                        <div className="ui-body">
                            {protos.length > 0 && <h4>Da un protocollo</h4>}
                            {protos.map((p) => (
                                <button key={p.id} className="m-pick" onClick={() => { setPick(false); onNewFrom(p); }}>
                                    <b>{p.titolo || 'Protocollo senza titolo'}</b>
                                    <small>{[p.codice, p.versione && `v. ${p.versione}`, p.stato].filter(Boolean).join(', ')}</small>
                                </button>
                            ))}
                            <button className="m-pick m-pick-empty" onClick={() => { setPick(false); onNew(); }}><b>Esperimento vuoto</b><small>Compili tutto a mano</small></button>
                            <h4>Pagina libera</h4>
                            <button className="m-pick m-pick-empty" onClick={() => { setPick(false); onNewPage({}); }}><b>Pagina di appunti</b><small>Testo, disegni a mano e immagini, scaricabile in Word</small></button>
                            <button className="m-pick m-pick-empty" onClick={() => docRef.current && docRef.current.click()}><b>Importa un Word</b><small>Apri un file .docx e continua a lavorarci qui</small></button>
                            {docErr && <p className="wh-note">{docErr}</p>}
                            <input ref={docRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={importDoc} />
                        </div>
                    </div>
                </div>
            )}
            {find && (
                <label className="m-search m-search-up">
                    <Icon name="search" size={18} />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cerca in ${section.label.toLowerCase()}`} aria-label="Cerca" enterKeyHint="search" />
                </label>
            )}
        </div>
    );
};

// Ricetta in sola lettura, per prepararla: quantità scalabili sul volume voluto, voci da spuntare
const Recipe = ({ rec, lab, section, onEdit, onSaveStock }) => {
    const [where, setWhere] = useState(null);
    const [vol, setVol] = useState(String(rec.volumeFinale ?? ''));
    const [done, setDone] = useState({});
    const f = scaleFactor(rec, vol);
    const tick = (k) => setDone((d) => ({ ...d, [k]: !d[k] }));
    const unit = rec.unitaVolume || 'mL';
    return (
        <div className="m-screen">
            <Bar title="Prepara" right={<Pill onClick={onEdit}>Modifica</Pill>} />
            <div className="m-scroll m-recipe">
                <h2>{section.title(rec)}</h2>
                {section.sub(rec) && <p className="m-sub">{section.sub(rec)}</p>}
                {rec.volumeFinale && (
                    <div className="m-vol">
                        <span>Volume da preparare</span>
                        <div><input inputMode="decimal" value={vol} onChange={(e) => setVol(e.target.value)} aria-label="Volume da preparare" /><b>{unit}</b></div>
                    </div>
                )}
                {(rec.componenti || []).length > 0 && (
                    <>
                        <h3>Componenti</h3>
                        <div className="m-list">
                            {rec.componenti.map((c, i) => (
                                <div key={i} className={`m-row m-check m-stepw${done['c' + i] ? ' on' : ''}`}>
                                    <button type="button" className="m-box" onClick={() => tick('c' + i)} aria-pressed={!!done['c' + i]} aria-label="Segna come pesato">{done['c' + i] && <Icon name="check" size={16} stroke={2.4} />}</button>
                                    <span className="m-row-t m-wrap" onClick={() => tick('c' + i)}><b>{c.nome}</b>{c.note && <small>{c.note}</small>}</span>
                                    <span className="m-qty">{scaledQty(c.quantita, f)} {c.unita}</span>
                                    <WhereButton label={c.nome} onClick={() => setWhere(c)} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {(rec.passaggi || []).length > 0 && (
                    <>
                        <h3>Preparazione</h3>
                        <div className="m-list">
                            {rec.passaggi.map((p, i) => (
                                <button key={i} className={`m-row m-check${done['p' + i] ? ' on' : ''}`} onClick={() => tick('p' + i)}>
                                    <span className="m-box">{done['p' + i] ? <Icon name="check" size={16} stroke={2.4} /> : <em>{i + 1}</em>}</span>
                                    <span className="m-row-t m-wrap"><b>{p.testo}</b>{p.durata && <small>{p.durata}</small>}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {[['Conservazione', rec.conservazione], ['Validità', rec.validita], ['Sicurezza', rec.sicurezza], ['Note', rec.note]].filter((x) => x[1]).map(([t, v]) => (
                    <div key={t} className="m-note"><small>{t}</small><p>{v}</p></div>
                ))}
            </div>
            {where && <WhereSheet key={where.nome} item={where} lab={lab} onSaveStock={onSaveStock} onClose={() => setWhere(null)} />}
        </div>
    );
};

// Protocollo: prima le versioni (sola lettura), poi «Usiamo questo» o «Modifica»
const ProtoView = ({ rec, lab, section, onSave, onDelete, onPrint, onUse }) => {
    const [edit, setEdit] = useState(false);
    const vers = versionsOf(lab.protocolli, rec);
    const [vid, setVid] = useState(rec.id);
    const v = vers.find((x) => x.id === vid) || vers[0] || rec;
    if (edit) {
        return (
            <div className="m-screen m-edit">
                <header className="m-bar"><Pill light onClick={() => setEdit(false)}>‹ Fine</Pill></header>
                <RecordForm key={v.id} inline accordion section={section} record={v} isNew={false} lab={lab} onSave={onSave} onDelete={onDelete} onPrint={(r) => onPrint([r.id])} onClose={() => setEdit(false)} />
            </div>
        );
    }
    return (
        <div className="m-screen">
            <Bar title="Protocollo" right={<Pill onClick={() => setEdit(true)}>Modifica</Pill>} />
            <div className="m-scroll m-recipe">
                <h2>{v.titolo || 'Protocollo senza titolo'}</h2>
                {section.sub(v) && <p className="m-sub">{section.sub(v)}</p>}
                {vers.length > 1 && (
                    <>
                        <h3>Versioni</h3>
                        <div className="m-chips" role="group" aria-label="Versioni">
                            {vers.map((x) => <button key={x.id} className={x.id === v.id ? 'on' : ''} onClick={() => setVid(x.id)}>{`v. ${x.versione || '1.0'}${x.data ? `, ${x.data.split('-').reverse().join('/')}` : ''}`}</button>)}
                        </div>
                    </>
                )}
                {v.scopo && <div className="m-note"><small>Scopo</small><p>{v.scopo}</p></div>}
                {(v.stanza || v.posizioni) && <div className="m-note"><small>Dove</small><p>{[v.stanza, v.posizioni].filter(Boolean).join(', ')}</p></div>}
                {(v.materiali || []).length > 0 && (
                    <>
                        <h3>Materiali</h3>
                        <div className="m-list">
                            {v.materiali.map((x, i) => (
                                <div key={i} className="m-row m-stepw"><span className="m-row-t m-wrap"><b>{x.nome}</b>{x.note && <small>{x.note}</small>}</span><span className="m-qty">{x.quantita} {x.unita}</span></div>
                            ))}
                        </div>
                    </>
                )}
                {(v.passaggi || []).length > 0 && (
                    <>
                        <h3>Procedura</h3>
                        <div className="m-list">
                            {v.passaggi.map((p, i) => (
                                <div key={i} className="m-row m-check"><span className="m-box"><em>{i + 1}</em></span><span className="m-row-t m-wrap"><b>{p.testo}</b>{p.durata && <small>{p.durata}</small>}</span></div>
                            ))}
                        </div>
                    </>
                )}
                {[['Sicurezza', v.sicurezza], ['Note', v.note]].filter((x) => x[1]).map(([t, x]) => (
                    <div key={t} className="m-note"><small>{t}</small><p>{x}</p></div>
                ))}
                <button className="m-again" onClick={() => onUse(v)}>Usiamo questo</button>
            </div>
        </div>
    );
};

// Articolo di magazzino: quantità grande con − / +, dov'è, scadenza, scheda tecnica; «Modifica» apre il modulo sulla stessa schermata
const ArticleView = ({ rec, lab, section, onSave, onDelete, onPrint }) => {
    const [edit, setEdit] = useState(false);
    const [info, setInfo] = useState(false);
    if (edit) {
        return (
            <div className="m-screen m-edit">
                <header className="m-bar"><Pill light onClick={() => setEdit(false)}>‹ Fine</Pill></header>
                <RecordForm key={rec.id} inline accordion section={section} record={rec} isNew={false} lab={lab} onSave={onSave} onDelete={onDelete} onPrint={(r) => onPrint([r.id])} onClose={() => setEdit(false)} />
            </div>
        );
    }
    const st = stockState(rec);
    const c = condOf({ nome: rec.nome, articoloId: rec.id }, lab);
    const q = parseFloat(String(rec.quantita ?? '').replace(',', '.'));
    const step = (n) => onSave({ ...rec, quantita: String(Math.max(0, Math.round(((Number.isFinite(q) ? q : 0) + n) * 1e6) / 1e6)).replace('.', ',') });
    const rows = [['Dov’è', rec.posizione], ['Conservazione', rec.conservazione], ['Lotto', rec.lotto], ['Scadenza', rec.scadenza && fmtDay(rec.scadenza)], ['Scorta minima', rec.sogliaMin && `${rec.sogliaMin} ${rec.unita || ''}`], ['N. inventario', rec.numero], ['Pericolo', rec.pericolo], ['N. CAS', rec.cas], ['Produttore', rec.marca], ['Fornitore', rec.fornitore]].filter((x) => x[1]);
    return (
        <div className="m-screen">
            <Bar title="Magazzino" right={<Pill onClick={() => setEdit(true)}>Modifica</Pill>} />
            <div className="m-scroll m-recipe">
                <h2>{rec.nome || 'Articolo senza nome'}</h2>
                {[rec.codice, rec.categoria].filter(Boolean).length > 0 && <p className="m-sub">{[rec.codice, rec.categoria].filter(Boolean).join(', ')}</p>}
                <div className="ar-qty">
                    <button type="button" onClick={() => step(-1)} aria-label="Meno uno">−</button>
                    <div><b>{rec.quantita !== undefined && rec.quantita !== '' ? rec.quantita : '0'}</b><small>{rec.unita || 'pz'}</small></div>
                    <button type="button" onClick={() => step(1)} aria-label="Più uno">+</button>
                </div>
                <div className="ar-badges">
                    <span className={`m-pill ${st.tone}`}>{st.label}</span>
                    {c && <span className={`ar-cond cond-${c}`}><Icon name={COND[c].icon} size={18} />{COND[c].label}<CondInfoButton onClick={() => setInfo(true)} /></span>}
                </div>
                {rows.length > 0 && (
                    <div className="m-list ar-list">
                        {rows.map(([k, v]) => <div key={k} className="m-row ar-row"><small>{k}</small><b>{v}</b></div>)}
                    </div>
                )}
                {rec.scheda && <div className="m-note"><small>Scheda tecnica</small><p className="ci-long">{rec.scheda}</p></div>}
                {rec.note && <div className="m-note"><small>Note</small><p>{rec.note}</p></div>}
            </div>
            {info && <CondInfo m={{ nome: rec.nome, articoloId: rec.id }} lab={lab} onClose={() => setInfo(false)} />}
        </div>
    );
};

// Dettaglio di una voce (lavoro, protocollo, scheda, ricetta, modulo): usato dall'elenco a schermo intero e dai pannelli della postazione
export const Detail = ({ rec, isNew, section, lab, onSave, onDelete, onPrint, onNewFrom, onSaveStock, protoVersion, onSaveProto, onLeave }) => {
    const [editing, setEditing] = useState(false);
    const ed = editing && !isNew;
    if (section.key === 'quaderno' && rec.tipo === 'pagina') return <PageView rec={rec} onSave={onSave} />;
    if (section.key === 'quaderno' && !isNew && !ed) return <Work rec={rec} lab={lab} section={section} onSave={onSave} onSaveStock={onSaveStock} onEdit={() => setEditing(true)} protoVersion={protoVersion} onSaveProto={onSaveProto} />;
    if (section.key === 'protocolli' && !isNew && !ed) return <ProtoView rec={rec} lab={lab} section={section} onSave={onSave} onDelete={onDelete} onPrint={onPrint} onUse={onNewFrom} />;
    if (section.key === 'magazzino' && !isNew && !ed) return <ArticleView rec={rec} lab={lab} section={section} onSave={onSave} onDelete={onDelete} onPrint={onPrint} />;
    if (section.key === 'reagenti' && !isNew && !ed) return <Recipe rec={rec} lab={lab} onSaveStock={onSaveStock} section={section} onEdit={() => setEditing(true)} />;
    return (
        <div className="m-screen m-edit">
            {['quaderno', 'reagenti'].includes(section.key) && !isNew ? (
                <header className="m-bar"><Pill light onClick={() => setEditing(false)}>{section.key === 'quaderno' ? '‹ Lavoro' : '‹ Ricetta'}</Pill></header>
            ) : <Bar title={section.single[0].toUpperCase() + section.single.slice(1)} />}
            <RecordForm inline accordion section={section} record={rec} isNew={isNew} lab={lab} onSave={onSave} onDelete={onDelete} onPrint={(r) => onPrint([r.id])} onClose={onLeave} />
        </div>
    );
};

// Mini programma della scrivania (PC/iPad): elenco e pagina di un'area dentro una finestra, senza lasciare la scrivania.
// Parla con le stesse funzioni della sezione grande (salva, elimina, nuovo da protocollo, pagina libera, stampa).
const MiniApp = ({ k, lab, onSaveIn, onRemove, onPrint, onNewFrom, onNewPage, onSaveStock, protoVersion, onSaveProto, onOpenSection }) => {
    const section = sectionOf(k);
    const [sel, setSel] = useState(null); // { rec, isNew }
    const rec = sel ? (lab[k] || []).find((r) => r.id === sel.rec.id) || sel.rec : null;
    const stay = (make) => (...a) => { const r = make(...a, true); if (r) setSel({ rec: r, isNew: false }); return r; };
    return (
        <div className="m-screen mini">
            <div className="mini-bar">
                {sel ? <Pill light onClick={() => setSel(null)}>‹ {section.label}</Pill> : <span />}
                <Pill light onClick={() => onOpenSection(sel ? { k, id: sel.rec.id } : { k })}><Icon name="lanes" size={16} /> Apri nella sezione</Pill>
            </div>
            {sel ? (
                <Detail key={sel.rec.id} rec={rec} isNew={sel.isNew} section={section} lab={lab}
                    onSave={(r) => { onSaveIn(k, r); if (sel.isNew) setSel({ rec: r, isNew: false }); }}
                    onDelete={() => { onRemove(k, sel.rec.id); setSel(null); }} onPrint={(ids) => onPrint(ids, { kind: k })}
                    onNewFrom={stay(onNewFrom)} onSaveStock={onSaveStock} protoVersion={protoVersion} onSaveProto={onSaveProto} onLeave={() => setSel(null)} />
            ) : (
                <ListScreen key={k} section={section} lab={lab} onOpen={(r) => setSel({ rec: r, isNew: false })}
                    onNew={() => setSel({ rec: { id: newId(section.prefix), ...section.empty(lab) }, isNew: true })}
                    onNewFrom={stay(onNewFrom)} onNewPage={stay(onNewPage)} />
            )}
        </div>
    );
};

const Screens = ({ dock, lab, ov, alerts, empty, view, sel, section, onExample, onGo, onOpen, onNew, onSelect, onSave, onDelete, onPrint, onNewFrom, onNewPage, protoVersion, onSaveProto, onSaveStock, backRef, onBack, split, tools, right, onRemove, onRestore, onSaveIn, calcReq, onSettings }) => {
    const leave = () => onSelect(null);
    backRef.current = view === 'home' ? onBack : sel && sel.record && section ? leave : () => onGo('home');
    if (view === 'home' && split) return <Desktop renderApp={(k, close) => <MiniApp k={k} lab={lab} onSaveIn={onSaveIn} onRemove={onRemove} onPrint={onPrint} onNewFrom={onNewFrom} onNewPage={onNewPage} onSaveStock={onSaveStock} protoVersion={protoVersion} onSaveProto={onSaveProto} onOpenSection={({ k: kk, id }) => { close(); if (id) onOpen(kk, id); else onGo(kk); }} />} dock={dock} lab={lab} empty={empty} onExample={onExample} onOpen={onOpen} onGo={onGo} onRemove={onRemove} onRestore={onRestore} calcReq={calcReq} renderDoc={(k, r, close) => <Detail key={r.id} rec={r} isNew={false} section={sectionOf(k)} lab={lab} onSave={(x) => onSaveIn(k, x)} onDelete={() => { onRemove(k, r.id); close(); }} onPrint={(ids) => onPrint(ids, { kind: k })} onNewFrom={onNewFrom} onSaveStock={onSaveStock} protoVersion={protoVersion} onSaveProto={onSaveProto} onLeave={close} />} onSettings={onSettings} onBack={onBack} />;
    if (view === 'home') return <Home lab={lab} ov={ov} empty={empty} onExample={onExample} onOpen={onOpen} onGo={onGo} />;
    if (view === 'calcolatrice') return <Calculator />;
    const renderDetail = () => <Detail key={sel.record.id} rec={sel.record} isNew={sel.isNew} section={section} lab={lab} onSave={onSave} onDelete={onDelete} onPrint={onPrint} onNewFrom={onNewFrom} onSaveStock={onSaveStock} protoVersion={protoVersion} onSaveProto={onSaveProto} onLeave={leave} />;
    const hasSel = !!(sel && sel.record && section);
    if (!split) return hasSel ? renderDetail() : <ListScreen key={view} section={section} lab={lab} onOpen={(r) => onSelect(r)} onNew={() => onNew(view)} onNewFrom={onNewFrom} onNewPage={onNewPage} />;
    return (
        <div className="m-split">
            <div className="m-pane-l"><ListScreen key={view} section={section} lab={lab} onOpen={(r) => onSelect(r)} onNew={() => onNew(view)} onNewFrom={onNewFrom} onNewPage={onNewPage} selId={hasSel ? sel.record.id : null} tools={tools} /></div>
            <div className="m-pane-r">{right ? right : hasSel ? renderDetail() : <div className="m-empty"><p>Scegli una voce dall’elenco, oppure creane una nuova con il +</p></div>}</div>
        </div>
    );
};

// Barra fissa in basso (sempre presente): indietro, URBIOS, impostazioni.
// Swipe verso destra = stesso effetto del tasto indietro (in home riporta alla scelta dell'area: solo con il tasto)
export const Mobile = (props) => {
    const t0 = React.useRef(null);
    const backRef = React.useRef(null);
    const start = (e) => {
        const t = e.touches[0];
        const skip = e.target.closest('input,textarea,select,.m-chips,.sw');
        t0.current = skip || props.split ? null : { x: t.clientX, y: t.clientY, at: Date.now() };
    };
    const end = (e) => {
        const a = t0.current;
        t0.current = null;
        if (!a || props.view === 'home') return;
        const t = e.changedTouches[0];
        const dx = t.clientX - a.x;
        const dy = Math.abs(t.clientY - a.y);
        if (dx < 70 || dy > dx * 0.6 || Date.now() - a.at > 700) return;
        if (backRef.current) backRef.current();
    };
    return (
        <div className={`m-swipe${props.view === 'calcolatrice' ? ' m-dark' : ''}`} onTouchStart={start} onTouchEnd={end}>
            <Screens {...props} backRef={backRef} />
            {!props.embed && <nav className="m-dock" aria-label="Navigazione">
                <GBtn icon="back" size={24} onClick={() => backRef.current && backRef.current()} aria-label={props.view === 'home' ? 'Cambia area' : 'Indietro'} />
                <span className="m-dock-brand"><UrbiosWordmark size={26} /></span>
                <GBtn icon="sliders" onClick={props.onSettings} aria-label="Impostazioni" />
            </nav>}
        </div>
    );
};
