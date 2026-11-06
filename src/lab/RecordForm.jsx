import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './ui/icons';
import { FiguresEditor } from './FiguresEditor';
import { fmtDay } from './labLogic';
import { AiFill } from './parts/AiFill';

// Editor di un record: i campi vengono dal registro (sections.js). Salva da solo (come le Impostazioni): niente tasto Salva.
// Un record nuovo viene creato appena il primo campo (titolo/codice) è compilato.
// inline = pannello accanto all'elenco (schermi larghi); altrimenti finestra a tutta altezza (telefono, tablet).
// Dettatura (Safari/Chrome): il microfono aggiunge in fondo al testo quello che dici. Non compare dove il browser non la offre.
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const Mic = ({ onText }) => {
    const [on, setOn] = useState(false);
    const rec = useRef(null);
    const cb = useRef(onText);
    cb.current = onText;
    useEffect(() => () => { try { rec.current && rec.current.stop(); } catch (e) { /* già fermo */ } }, []);
    if (!SR) return null;
    const toggle = () => {
        if (on) { try { rec.current.stop(); } catch (e) { /* già fermo */ } return; }
        const r = new SR();
        r.lang = 'it-IT'; r.continuous = true; r.interimResults = false;
        r.onresult = (e) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript; if (t.trim()) cb.current(t.trim()); };
        r.onend = () => setOn(false);
        r.onerror = () => setOn(false);
        rec.current = r;
        try { r.start(); setOn(true); } catch (e) { setOn(false); }
    };
    return <button type="button" className={`lab-mic${on ? ' on' : ''}`} onClick={toggle} aria-pressed={on} aria-label={on ? 'Ferma dettatura' : 'Detta a voce'}><Icon name="mic" size={17} /></button>;
};
export const addText = (cur, t) => (cur ? `${cur.replace(/\s+$/, '')} ${t}` : t.charAt(0).toUpperCase() + t.slice(1));

// Riga che si elimina con lo swipe a sinistra (come in Mail): compare «Elimina», si tocca per confermare.
const SwipeRow = ({ onDelete, children }) => {
    const [x, setX] = useState(0);
    const [drag, setDrag] = useState(false);
    const st = useRef(null);
    const start = (e) => { const t = e.touches[0]; st.current = { x: t.clientX, y: t.clientY, base: x, lock: null }; };
    const move = (e) => {
        const s = st.current; if (!s) return;
        const t = e.touches[0]; const dx = t.clientX - s.x; const dy = t.clientY - s.y;
        if (!s.lock && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) s.lock = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        if (s.lock === 'h') { setDrag(true); setX(Math.max(-96, Math.min(0, s.base + dx))); }
    };
    const end = () => { const s = st.current; st.current = null; setDrag(false); if (s && s.lock === 'h') setX((v) => (v < -44 ? -96 : 0)); };
    return (
        <div className="sw">
            <button type="button" className="sw-act" onClick={onDelete} tabIndex={x ? 0 : -1} aria-label="Elimina">Elimina</button>
            <div className={`sw-in${drag ? ' drag' : ''}`} style={{ transform: `translateX(${x}px)` }} onTouchStart={start} onTouchMove={move} onTouchEnd={end} onClick={() => x && setX(0)}>{children}</div>
        </div>
    );
};

// «15 min», «2 h», «1h 30», «45 s» → secondi (null se non c'è un tempo)
export const parseDur = (s) => {
    const t = String(s || '').toLowerCase().replace(',', '.');
    let sec = 0; let found = false;
    const h = t.match(/(\d+(?:\.\d+)?)\s*(?:h|ore|ora)\b/); if (h) { sec += parseFloat(h[1]) * 3600; found = true; }
    const m = t.match(/(\d+(?:\.\d+)?)\s*(?:min|m)\b/); if (m) { sec += parseFloat(m[1]) * 60; found = true; }
    const sc = t.match(/(\d+(?:\.\d+)?)\s*(?:sec|s)\b/); if (sc) { sec += parseFloat(sc[1]); found = true; }
    if (!found) { const n = t.match(/^\s*(\d+(?:\.\d+)?)\s*$/); if (n) return parseFloat(n[1]) * 60; }
    return found ? Math.round(sec) : null;
};
export const clock = (s) => { const m = Math.floor(s / 60); const h = Math.floor(m / 60); const p = (n) => String(n).padStart(2, '0'); return h ? `${h}:${p(m % 60)}:${p(s % 60)}` : `${m}:${p(s % 60)}`; };
export const beep = () => { try { const A = window.AudioContext || window.webkitAudioContext; const ctx = new A(); [0, 0.25, 0.5].forEach((d) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.2; o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.15); }); } catch (e) { /* senza audio */ } if (navigator.vibrate) navigator.vibrate([200, 100, 200]); };

const Steps = ({ value, onChange, phone }) => {
    const list = value || [];
    const set = (i, patch) => onChange(list.map((s, k) => (k === i ? { ...s, ...patch } : s)));
    const [timers, setTimers] = useState({}); // indice → istante di fine
    const [, tick] = useState(0);
    const listRef = useRef(list); listRef.current = list;
    useEffect(() => {
        if (!Object.keys(timers).length) return undefined;
        const id = setInterval(() => {
            tick((n) => n + 1);
            const now = Date.now();
            setTimers((t) => { const next = { ...t }; let fired = false; Object.entries(t).forEach(([i, end]) => { if (now >= end) { delete next[i]; fired = true; onChange(listRef.current.map((s, k) => (k === +i ? { ...s, fatto: true } : s))); } }); if (fired) beep(); return next; });
        }, 500);
        return () => clearInterval(id);
    }, [Object.keys(timers).length]); // eslint-disable-line react-hooks/exhaustive-deps
    const toggleTimer = (i, secs) => setTimers((t) => { const n = { ...t }; if (n[i]) delete n[i]; else n[i] = Date.now() + secs * 1000; return n; });
    const key = (e, s, i) => { if (e.key === 'Enter' && !e.shiftKey && (s.testo || '').trim()) { e.preventDefault(); onChange([...list.slice(0, i + 1), { testo: '', durata: '' }, ...list.slice(i + 1)]); setTimeout(() => e.target.closest('.lab-rows')?.querySelectorAll('textarea')[i + 1]?.focus(), 0); } };
    return (
        <div className="lab-rows">
            {list.map((s, i) => {
                const secs = phone ? parseDur(s.durata) : null;
                const left = timers[i] ? Math.max(0, Math.round((timers[i] - Date.now()) / 1000)) : null;
                const body = (
                    <div className={`lab-step${s.fatto ? ' is-done' : ''}`}>
                        {phone ? <button type="button" className={`lab-tick${s.fatto ? ' on' : ''}`} aria-pressed={!!s.fatto} aria-label={s.fatto ? 'Passaggio fatto' : 'Segna come fatto'} onClick={() => set(i, { fatto: !s.fatto })}>{s.fatto ? <Icon name="check" size={16} stroke={2.4} /> : i + 1}</button> : <span>{i + 1}</span>}
                        <div className="lab-dict">
                            <textarea className="fld" rows={1} value={s.testo || ''} placeholder="Descrivi il passaggio" onChange={(e) => set(i, { testo: e.target.value })} onKeyDown={(e) => key(e, s, i)} />
                            {phone && <Mic onText={(t) => set(i, { testo: addText(s.testo || '', t) })} />}
                        </div>
                        <input className="fld" style={{ height: 40 }} value={s.durata || ''} placeholder="Tempo (es. 15 min)" onChange={(e) => set(i, { durata: e.target.value })} />
                        {secs ? <button type="button" className={`lab-timer${left !== null ? ' on' : ''}`} onClick={() => toggleTimer(i, secs)}>{left !== null ? `${clock(left)}, Ferma` : `Avvia timer ${clock(secs)}`}</button> : null}
                        <button type="button" className="lab-x" aria-label="Togli passaggio" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>
                    </div>
                );
                return phone ? <SwipeRow key={i} onDelete={() => onChange(list.filter((_, k) => k !== i))}>{body}</SwipeRow> : React.cloneElement(body, { key: i });
            })}
            <button type="button" className="lab-add" onClick={() => onChange([...list, { testo: '', durata: '' }])}><Icon name="plus" size={15} />Aggiungi passaggio</button>
            {phone && list.length > 0 && <small className="lab-swhint">Scorri a sinistra per eliminare</small>}
        </div>
    );
};

const Storico = ({ list, unit }) => {
    const l = list || [];
    if (!l.length) return <p className="lab-none">Nessun cambio registrato.</p>;
    return (
        <ul className="lab-log">
            {l.map((e, i) => (
                <li key={i}>
                    <span>{fmtDay(e.g)}</span>
                    {e.tipo === 'esperimento' ? <span>−{String(e.usato).replace('.', ',')} {unit || ''}, {e.titolo}</span> : <span>{e.da === '' ? '—' : e.da} → {e.a === '' ? '—' : e.a} {unit || ''}, a mano</span>}
                </li>
            ))}
        </ul>
    );
};

const Rows = ({ cols, value, onChange, lab, compact }) => {
    const list = value || [];
    const [more, setMore] = useState({}); // telefono: dettagli della riga aperti
    const hasStock = cols.some((x) => x.type === 'stock');
    const addFromStock = (id) => {
        const a = lab.magazzino.find((x) => x.id === id);
        if (a) onChange([...list, { nome: a.nome, unita: a.unita || '', articoloId: a.id }]);
    };
    const set = (i, key, v) => onChange(list.map((r, k) => (k === i ? { ...r, [key]: v } : r)));
    // scelto un articolo del magazzino: nome e unità si compilano da soli (se vuoti)
    const pickStock = (i, id) => {
        const a = lab.magazzino.find((x) => x.id === id);
        onChange(list.map((r, k) => (k === i ? { ...r, articoloId: id, ...(a && !r.nome ? { nome: a.nome } : {}), ...(a && !r.unita ? { unita: a.unita } : {}) } : r)));
    };
    return (
        <div className="lab-rows">
            {compact && hasStock && lab.magazzino.length > 0 && (
                <select className="fld lab-stockpick" value="" aria-label="Aggiungi dal magazzino" onChange={(e) => addFromStock(e.target.value)}>
                    <option value="">+ Aggiungi dal magazzino…</option>
                    {lab.magazzino.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
            )}
            {list.map((r, i) => {
                const rowEl = (
                <div className="lab-row" key={i}>
                    {cols.map((c, ci) => (compact && ci >= 3 && !more[i] ? null : (
                        <label key={c.key} className="lab-cell" style={{ flexGrow: c.w }}>
                            <span className="lab-cell-l">{c.label}</span>
                            {c.type === 'stock'
                                ? <select className="fld" value={r[c.key] || ''} onChange={(e) => pickStock(i, e.target.value)}><option value="">—</option>{lab.magazzino.map((a) => <option key={a.id} value={a.id}>{a.nome || 'Articolo'}{a.quantita !== undefined && a.quantita !== '' ? ` (${a.quantita} ${a.unita || ''})` : ''}</option>)}</select>
                                : <input className="fld" value={r[c.key] || ''} onChange={(e) => set(i, c.key, e.target.value)} />}
                        </label>
                    )))}
                    {compact && cols.length > 3 && <button type="button" className="lab-more" onClick={() => setMore((m) => ({ ...m, [i]: !m[i] }))}>{more[i] ? 'Meno dettagli' : 'Più dettagli (magazzino, lotto)'}</button>}
                    <button type="button" className="lab-x" aria-label="Togli riga" onClick={() => onChange(list.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>
                </div>
                            );
                return compact ? <SwipeRow key={i} onDelete={() => onChange(list.filter((_, k) => k !== i))}>{rowEl}</SwipeRow> : rowEl;
            })}
            <button type="button" className="lab-add" onClick={() => onChange([...list, {}])}><Icon name="plus" size={15} />Aggiungi riga</button>
            {compact && list.length > 0 && <small className="lab-swhint">Scorri a sinistra per eliminare</small>}
        </div>
    );
};

export const RecordForm = ({ section, record, lab, isNew, inline, accordion, onSave, onDelete, onPrint, onClose }) => {
    const [d, setD] = useState(record);
    const [saved, setSaved] = useState(!isNew);
    const [aiOpen, setAiOpen] = useState(false);
    const [openG, setOpenG] = useState(isNew ? 0 : -1); // accordion (telefono): una scheda aperta alla volta
    const dirty = useRef(false);
    const dead = useRef(false);
    const latest = useRef(d);
    latest.current = d;
    const save = useRef(onSave);
    save.current = onSave;
    const ok = Boolean(String(d[section.fields[0].key] || '').trim());

    const flush = () => {
        if (dirty.current && !dead.current && String(latest.current[section.fields[0].key] || '').trim()) {
            dirty.current = false;
            save.current(latest.current);
            setSaved(true);
        }
    };
    // mentre si scrive il modulo non deve spostarsi: se il browser (Safari) lo fa scorrere da solo, lo si rimette dov'era
    const scroller = useRef(null);
    const hold = useRef({ top: null, until: 0, user: 0 });
    const set = (k, v) => {
        const el = scroller.current;
        if (el) hold.current = { ...hold.current, top: el.scrollTop, until: Date.now() + 2500 };
        dirty.current = true; setSaved(false); setD((x) => ({ ...x, [k]: v }));
    };
    const restore = () => {
        const el = scroller.current;
        const h = hold.current;
        if (el && h.top !== null && Date.now() < h.until && Date.now() - h.user > 400 && Math.abs(el.scrollTop - h.top) > 1) el.scrollTop = h.top;
    };
    useLayoutEffect(restore);
    useEffect(() => {
        const el = scroller.current;
        if (!el) return undefined;
        const mark = () => { hold.current = { ...hold.current, top: null, user: Date.now() }; };
        // clic su un campo: Safari lo porta al centro anche se è già visibile, quindi si tiene ferma la posizione; clic sulla barra di scorrimento = scorre l'utente
        const press = (e) => { if (e.target === el) mark(); else hold.current = { ...hold.current, top: el.scrollTop, until: Date.now() + 600 }; };
        el.addEventListener('scroll', restore);
        el.addEventListener('pointerdown', press, { passive: true });
        ['wheel', 'touchstart'].forEach((ev) => el.addEventListener(ev, mark, { passive: true }));
        return () => { el.removeEventListener('scroll', restore); el.removeEventListener('pointerdown', press); ['wheel', 'touchstart'].forEach((ev) => el.removeEventListener(ev, mark)); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!dirty.current) return undefined;
        const t = setTimeout(flush, 500);
        return () => clearTimeout(t);
    }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => { if (dirty.current && !dead.current && String(latest.current[section.fields[0].key] || '').trim()) save.current(latest.current); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const suggestions = (f) => [...new Set(lab[section.key].map((r) => String(r[f.key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));

    // scelto il protocollo nel quaderno, i suoi passaggi e materiali si copiano nell'esperimento (se ancora vuoti), da modificare liberamente
    const pickRef = (f, v) => {
        set(f.key, v);
        const p = section.key === 'quaderno' && f.key === 'protocolloId' ? lab.protocolli.find((x) => x.id === v) : null;
        if (!p) return;
        if (!d.stanza && p.stanza) set('stanza', p.stanza);
        if (!d.posizioni && p.posizioni) set('posizioni', p.posizioni);
        if (!(d.passaggi || []).length && (p.passaggi || []).length) set('passaggi', p.passaggi.map((s) => ({ ...s })));
        if (!(d.materiali || []).length && (p.materiali || []).length) set('materiali', p.materiali.map((m) => ({ ...m })));
    };

    const input = (f) => {
        if (f.type === 'area') return <div className="lab-dict"><textarea className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} placeholder={f.ph} value={d[f.key] || ''} onChange={(e) => { if (accordion) { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; } set(f.key, e.target.value); }} ref={accordion ? (el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } } : undefined} />{accordion && <Mic onText={(t) => set(f.key, addText(d[f.key] || '', t))} />}</div>;
        if (f.type === 'select' && f.options.length <= 5) return <div className="lab-opts" role="group" aria-label={f.label}>{f.options.map((o) => <button type="button" key={o} className={`lab-chip${(d[f.key] || '') === o ? ' on' : ''}`} aria-pressed={(d[f.key] || '') === o} onClick={() => set(f.key, o)}>{o}</button>)}</div>;
        if (f.type === 'select') return <select className="fld" value={d[f.key] || ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
        if (f.type === 'ref') return <select className="fld" value={d[f.key] || ''} onChange={(e) => pickRef(f, e.target.value)}><option value="">—</option>{lab[f.from].map((r) => <option key={r.id} value={r.id}>{[r.codice, r.titolo].filter(Boolean).join(', ')}</option>)}</select>;
        if (f.type === 'steps') return <Steps phone={accordion} value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'figures') return <FiguresEditor value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'rows') return <Rows compact={accordion} cols={f.cols} lab={lab} value={d[f.key]} onChange={(v) => set(f.key, v)} />;
        if (f.type === 'storico') return <Storico list={(lab.magazzino.find((x) => x.id === d.id) || {}).storico} unit={d.unita} />;
        if (section.key === 'magazzino' && f.key === 'quantita') {
            const stored = lab.magazzino.find((x) => x.id === d.id) || {};
            const step = (n) => { const x = parseFloat(String(d.quantita ?? '').replace(',', '.')) || 0; set('quantita', String(Math.max(0, Math.round((x + n) * 1e6) / 1e6)).replace('.', ',')); };
            return (
                <>
                    <div className="lab-qty">
                        <button type="button" className="lab-ib" aria-label="Meno uno" onClick={() => step(-1)}>−</button>
                        <input className="fld" inputMode="decimal" value={d.quantita ?? ''} onChange={(e) => set('quantita', e.target.value)} />
                        <button type="button" className="lab-ib" aria-label="Più uno" onClick={() => step(1)}>+</button>
                    </div>
                    {stored.aggiornato && <small className="lab-hintline">Aggiornato il {fmtDay(stored.aggiornato)}</small>}
                </>
            );
        }
        const listId = f.list ? `lab-dl-${section.key}-${f.key}` : undefined;
        return (
            <>
                <input className="fld" enterKeyHint="next" type={f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} list={listId} placeholder={f.ph} value={d[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                {listId && <datalist id={listId}>{suggestions(f).map((s) => <option key={s} value={s} />)}</datalist>}
            </>
        );
    };

    // telefono: Invio in un campo di una riga porta al campo successivo
    const nextOnEnter = (e) => {
        if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
        e.preventDefault();
        const all = [...e.currentTarget.closest('.lab-pane').querySelectorAll('input:not([type=hidden]),textarea,select')];
        const n = all[all.indexOf(e.target) + 1];
        if (n) n.focus(); else e.target.blur();
    };
    const groups = ((accordion && section.phoneGroups) || section.groups || [{ title: 'Dati', keys: section.fields.map((f) => f.key) }]).map((g) => ({ ...g, fields: g.keys.map((k) => section.fields.find((f) => f.key === k)).filter(Boolean) }));
    const body = (
        <>
            <div className="lab-pane-head">
                <div className="min-w-0">
                    <h2 className="lab-title lab-pane-title">{section.title(d)}</h2>
                </div>
                <div className="lab-pane-actions">
                    <span className="lab-saved" aria-live="polite">{!ok ? '' : saved ? 'Salvato' : 'Salvataggio…'}</span>
                    {(section.key === 'protocolli' || section.key === 'magazzino') && <button className="lab-btn is-secondary" onClick={() => setAiOpen(true)} aria-label="Compila con l’AI"><Icon name="sparkle" size={16} /><span className="lab-hide-s">Compila con AI</span></button>}
                    {ok && onPrint && <button className="lab-btn is-secondary" onClick={() => { flush(); onPrint(d); }} aria-label="Stampa"><Icon name="printer" size={16} /><span className="lab-hide-s">Stampa</span></button>}
                    {ok && <button className="lab-btn is-danger" aria-label="Elimina" onClick={() => { if (window.confirm(`Eliminare questo ${section.single}?`)) { dead.current = true; onDelete(); } }}><Icon name="trash" size={16} /><span className="lab-hide-s">Elimina</span></button>}
                    {!inline && <button className="lab-btn is-primary" onClick={() => { flush(); onClose(); }}>Fatto</button>}
                </div>
            </div>
            {aiOpen && <AiFill kind={section.key === 'magazzino' ? 'articolo' : 'protocollo'} current={d} onClose={() => setAiOpen(false)} onApply={(patch) => Object.entries(patch).forEach(([k, v]) => set(k, v))} />}
            {groups.map((g, i) => {
                const shut = accordion && openG !== i;
                const filled = g.fields.filter((f) => { const v = d[f.key]; return Array.isArray(v) ? v.length : String(v ?? '').trim(); }).length;
                return (
                    <section className={`lab-card${accordion ? ' acc' : ''}${shut ? ' shut' : ''}`} key={g.title}>
                        {accordion ? (
                            <button type="button" className="lab-card-h lab-acc-h" aria-expanded={!shut} onClick={() => setOpenG(shut ? i : -1)}>
                                <span className="lab-card-n">{i + 1}</span><span className="lab-acc-t">{g.title}</span><small>{filled}/{g.fields.length}</small><Icon name={shut ? 'chevron-down' : 'chevron-up'} size={18} />
                            </button>
                        ) : (
                            <h3 className="lab-card-h"><span className="lab-card-n">{i + 1}</span>{g.title}</h3>
                        )}
                        {!shut && (
                            <div className="lab-form" onKeyDown={accordion ? nextOnEnter : undefined}>
                                {g.fields.map((f) => (
                                    <div key={f.key} className={f.full || ['steps', 'rows', 'figures', 'area'].includes(f.type) ? 'full' : ''}>
                                        <label className="fld-label">{f.label}{f === section.fields[0] && <span className="lab-req" title="Obbligatorio per salvare"> *</span>}</label>
                                        {input(f)}
                                    </div>
                                ))}
                            </div>
                        )}
                        {accordion && !shut && (
                            <button type="button" className="lab-next" onClick={() => { setOpenG(i + 1 < groups.length ? i + 1 : -1); const el = scroller.current; if (el) setTimeout(() => { el.scrollTop = 0; }, 30); }}>{i + 1 < groups.length ? `Avanti: ${groups[i + 1].title}` : 'Chiudi'}<Icon name="chevron" size={18} /></button>
                        )}
                    </section>
                );
            })}
        </>
    );

    if (inline) return <div className="lab-pane" ref={scroller}>{body}</div>;
    return (
        <div className="sheet-back" onClick={() => { flush(); onClose(); }}>
            <div className="lab-modal" ref={scroller} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={isNew ? `Nuovo ${section.single}` : `Modifica ${section.single}`}>{body}</div>
        </div>
    );
};
