import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ACCENTS, LAYOUTS, layoutById } from './layouts';
import { SOURCE_TYPES, availability, buildSectionHtml, defaultOptions, optionChoices } from './sources';
import { studioCss } from './studioStyles';

let seq = 0;
const newId = () => `s${Date.now().toString(36)}${seq++}`;

const TABLE_HTML = `<table class="rs-t"><tbody>${'<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>'.repeat(3)}</tbody></table><p><br></p>`;

// Report Studio: un solo documento in cui mettere visita, dieta, allenamento e lettera, con layout pronti e un editor di testo semplice.
// Le sezioni nascono dai dati del paziente; ogni sezione resta modificabile a mano come in un editor di testo.
export const ReportStudio = ({ patient, db, visitDraft, initial = [], layout: layout0 = 'classico', onClose, onPrint }) => {
    const ctx = useMemo(() => ({ patient, db, visitDraft }), [patient, db, visitDraft]);
    const [layoutId, setLayoutId] = useState(layout0);
    const [accent, setAccent] = useState(() => layoutById(layout0).accent);
    const [sideOpen, setSideOpen] = useState(false);
    const [optOpen, setOptOpen] = useState(null);
    const refs = useRef({});
    const savedRange = useRef(null);

    const makeSection = (type, first) => {
        const opts = defaultOptions(type, ctx);
        return { id: newId(), type, opts, newPage: !first, html: buildSectionHtml(type, opts, ctx) };
    };

    const [sections, setSections] = useState(() => {
        const want = (Array.isArray(initial) ? initial : [initial]).filter((t) => SOURCE_TYPES[t] && availability(t, ctx).ok);
        const list = want.length ? want : Object.keys(SOURCE_TYPES).filter((t) => availability(t, ctx).ok).slice(0, 1);
        return list.map((t, i) => makeSection(t, i === 0));
    });

    // porta nello stato quello che l'utente ha scritto a mano (prima di spostare, rigenerare, aggiungere)
    const snapshot = useCallback(
        () => sections.map((s) => (refs.current[s.id] ? { ...s, html: refs.current[s.id].innerHTML } : s)),
        [sections]
    );
    const update = (fn) => setSections(fn(snapshot()));

    const pickLayout = (l) => {
        setLayoutId(l.id);
        setAccent(l.accent);
    };

    const move = (i, d) =>
        update((list) => {
            const j = i + d;
            if (j < 0 || j >= list.length) return list;
            const c = [...list];
            [c[i], c[j]] = [c[j], c[i]];
            return c;
        });
    const remove = (i) => update((list) => list.filter((_, k) => k !== i));
    const toggleNewPage = (i) => update((list) => list.map((s, k) => (k === i ? { ...s, newPage: !s.newPage } : s)));
    const add = (type) => update((list) => [...list, makeSection(type, list.length === 0)]);
    const setOpt = (i, patch) => setSections((list) => list.map((s, k) => (k === i ? { ...s, opts: { ...s.opts, ...patch } } : s)));
    const regenerate = (i) => {
        if (!window.confirm('Rigenerare la sezione? Le modifiche fatte a mano a questa sezione andranno perse.')) return;
        update((list) => list.map((s, k) => (k === i ? { ...s, html: buildSectionHtml(s.type, s.opts, ctx) } : s)));
    };

    // ---- editor di testo ----
    const saveSel = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && Object.values(refs.current).some((el) => el && el.contains(sel.anchorNode))) savedRange.current = sel.getRangeAt(0).cloneRange();
    };
    const restoreSel = () => {
        const sel = window.getSelection();
        if (savedRange.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
    };
    const exec = (cmd, value = null) => {
        restoreSel();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(cmd, false, value);
        saveSel();
    };
    const keep = (e) => e.preventDefault(); // i pulsanti non tolgono il cursore dal testo
    const insertHtml = (html) => exec('insertHTML', html);

    const Btn = ({ icon, title, onClick, on }) => (
        <button className={`rs-tb ${on ? 'on' : ''}`} title={title} onMouseDown={keep} onClick={onClick}>
            <i className={`ph-bold ${icon}`}></i>
        </button>
    );

    const print = () => {
        setSections(snapshot());
        if (onPrint && sections.some((s) => s.type === 'lettera')) onPrint();
        setTimeout(() => window.print(), 60);
    };

    const layout = layoutById(layoutId);
    const types = Object.keys(SOURCE_TYPES);

    return ReactDOM.createPortal(
        <div className="rs-overlay" onKeyUp={saveSel} onMouseUp={saveSel}>
            <style>{studioCss}</style>

            <div className="rs-top">
                <div className="rs-title">
                    <button className="rs-tb rs-side-toggle" onClick={() => setSideOpen((o) => !o)} title="Layout e sezioni">
                        <i className="ph-bold ph-sidebar-simple"></i>
                    </button>
                    <i className="ph-fill ph-file-text"></i> Report
                </div>
                <div className="rs-grp">
                    <Btn icon="ph-arrow-u-up-left" title="Annulla" onClick={() => exec('undo')} />
                    <Btn icon="ph-arrow-u-up-right" title="Ripeti" onClick={() => exec('redo')} />
                </div>
                <div className="rs-grp">
                    <select className="rs-select" title="Stile del paragrafo" defaultValue="" onMouseDown={saveSel} onChange={(e) => { if (e.target.value) exec('formatBlock', e.target.value); e.target.value = ''; }}>
                        <option value="">Stile…</option>
                        <option value="p">Testo</option>
                        <option value="h1">Titolo</option>
                        <option value="h2">Sottotitolo</option>
                        <option value="h3">Titoletto</option>
                    </select>
                </div>
                <div className="rs-grp">
                    <Btn icon="ph-text-b" title="Grassetto" onClick={() => exec('bold')} />
                    <Btn icon="ph-text-italic" title="Corsivo" onClick={() => exec('italic')} />
                    <Btn icon="ph-text-underline" title="Sottolineato" onClick={() => exec('underline')} />
                    <input type="color" title="Colore del testo" defaultValue="#111111" onMouseDown={saveSel} onChange={(e) => exec('foreColor', e.target.value)} />
                    <Btn icon="ph-highlighter" title="Evidenzia" onClick={() => exec('hiliteColor', '#FFF1A8')} />
                    <Btn icon="ph-text-t-slash" title="Togli formattazione" onClick={() => exec('removeFormat')} />
                </div>
                <div className="rs-grp">
                    <Btn icon="ph-text-align-left" title="Allinea a sinistra" onClick={() => exec('justifyLeft')} />
                    <Btn icon="ph-text-align-center" title="Centra" onClick={() => exec('justifyCenter')} />
                    <Btn icon="ph-text-align-right" title="Allinea a destra" onClick={() => exec('justifyRight')} />
                    <Btn icon="ph-text-align-justify" title="Giustifica" onClick={() => exec('justifyFull')} />
                </div>
                <div className="rs-grp">
                    <Btn icon="ph-list-bullets" title="Elenco puntato" onClick={() => exec('insertUnorderedList')} />
                    <Btn icon="ph-list-numbers" title="Elenco numerato" onClick={() => exec('insertOrderedList')} />
                    <Btn icon="ph-table" title="Inserisci tabella" onClick={() => insertHtml(TABLE_HTML)} />
                    <Btn icon="ph-minus" title="Linea di separazione" onClick={() => exec('insertHorizontalRule')} />
                    <Btn icon="ph-file-dashed" title="Vai a pagina nuova da qui" onClick={() => insertHtml('<div class="rs-pb" contenteditable="false"></div><p><br></p>')} />
                </div>
                <span className="rs-spacer" />
                <button className="rs-main-btn" onClick={print}>
                    <i className="ph-fill ph-printer"></i> Stampa / Salva PDF
                </button>
                <button className="rs-alt-btn" onClick={onClose}>
                    Chiudi
                </button>
            </div>

            <div className="rs-body-row">
                <aside className={`rs-side ${sideOpen ? 'open' : ''}`}>
                    <h4>Layout</h4>
                    <div className="rs-layouts">
                        {LAYOUTS.map((l) => (
                            <button key={l.id} className={`rs-lay ${l.id === layoutId ? 'on' : ''}`} onClick={() => pickLayout(l)} style={{ '--c': l.accent }}>
                                <div className="sw"></div>
                                <b>{l.label}</b>
                                <span>{l.desc}</span>
                            </button>
                        ))}
                    </div>
                    <h4>Colore guida</h4>
                    <div className="rs-accents">
                        {ACCENTS.map((c) => (
                            <button key={c} className={`rs-dot ${c.toLowerCase() === accent.toLowerCase() ? 'on' : ''}`} style={{ background: c }} onClick={() => setAccent(c)} title={c} />
                        ))}
                        <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} title="Colore a scelta" style={{ width: 30, height: 26, border: 'none', background: 'none', padding: 0 }} />
                    </div>

                    <h4>Contenuto del report</h4>
                    {sections.map((s, i) => {
                        const meta = SOURCE_TYPES[s.type];
                        const choices = optOpen === s.id ? optionChoices(s.type, ctx, s.opts) : null;
                        return (
                            <div className="rs-sec" key={s.id}>
                                <div className="rs-sec-head">
                                    <div className="name">
                                        <i className={`ph-bold ${meta.icon}`}></i>
                                        <span>{meta.label}</span>
                                    </div>
                                    <button className="rs-mini" title="Sposta su" disabled={i === 0} onClick={() => move(i, -1)}><i className="ph-bold ph-arrow-up"></i></button>
                                    <button className="rs-mini" title="Sposta giù" disabled={i === sections.length - 1} onClick={() => move(i, 1)}><i className="ph-bold ph-arrow-down"></i></button>
                                    <button className="rs-mini" title={s.newPage ? 'Inizia su pagina nuova: sì' : 'Inizia su pagina nuova: no'} style={{ color: s.newPage ? '#0A84FF' : undefined }} onClick={() => toggleNewPage(i)}><i className="ph-bold ph-file-dashed"></i></button>
                                    {s.opts && <button className="rs-mini" title="Opzioni" onClick={() => setOptOpen(optOpen === s.id ? null : s.id)}><i className="ph-bold ph-sliders-horizontal"></i></button>}
                                    <button className="rs-mini" title="Togli dal report" onClick={() => remove(i)}><i className="ph-bold ph-x"></i></button>
                                </div>
                                {choices && (
                                    <div className="rs-opts">
                                        {s.type === 'dieta' && choices.visite.length > 1 && (
                                            <select className="rs-select" value={s.opts.visitId} onChange={(e) => setOpt(i, { visitId: e.target.value })}>
                                                {choices.visite.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                                            </select>
                                        )}
                                        {s.type === 'training' && (
                                            <>
                                                {choices.schede.length > 1 && (
                                                    <select className="rs-select" value={s.opts.schedaId} onChange={(e) => setOpt(i, { schedaId: e.target.value, weekId: 'all' })}>
                                                        {choices.schede.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                                                    </select>
                                                )}
                                                <select className="rs-select" value={s.opts.weekId} onChange={(e) => setOpt(i, { weekId: e.target.value })}>
                                                    <option value="all">Tutta la scheda</option>
                                                    {choices.weeks.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                                                </select>
                                                {[['images', 'Figure esercizi'], ['pagePerDay', 'Un giorno per pagina'], ['notes', 'Note'], ['summary', 'Riepilogo seduta'], ['legend', 'Legenda'], ['studio', 'Intestazione studio']].map(([k, label]) => (
                                                    <label key={k}><input type="checkbox" checked={!!s.opts[k]} onChange={(e) => setOpt(i, { [k]: e.target.checked })} /> {label}</label>
                                                ))}
                                            </>
                                        )}
                                        <button className="rs-apply" onClick={() => regenerate(i)}>Applica (rigenera la sezione)</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {sections.length === 0 && <div className="rs-hint">Il report è vuoto: aggiungi una sezione qui sotto.</div>}

                    <h4 style={{ marginTop: 14 }}>Aggiungi</h4>
                    {types.map((t) => {
                        const a = availability(t, ctx);
                        return (
                            <button key={t} className="rs-add" disabled={!a.ok} onClick={() => add(t)}>
                                <i className={`ph-bold ${SOURCE_TYPES[t].icon}`}></i>
                                <span>{SOURCE_TYPES[t].label}{!a.ok && <small>{a.reason}</small>}</span>
                            </button>
                        );
                    })}
                    <div className="rs-hint">Ogni sezione si modifica direttamente sul foglio, come in un editor di testo. Se cambi layout o colore il testo scritto resta com'è.</div>
                </aside>

                <div className="rs-scroll" onClick={() => setSideOpen(false)}>
                    <div className={`rs-page rs-layout-${layout.id}`} style={{ '--accent': accent }}>
                                                {sections.map((s, i) => (
                            <React.Fragment key={s.id}>
                                {i > 0 && s.newPage && <div className="rs-sep"><span>nuova pagina</span></div>}
                                <div
                                    className={`rs-body ${i > 0 && s.newPage ? 'rs-newpage' : ''}`}
                                    ref={(el) => { if (el) refs.current[s.id] = el; else delete refs.current[s.id]; }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                    dangerouslySetInnerHTML={{ __html: s.html }}
                                />
                            </React.Fragment>
                        ))}
                        {sections.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '40mm 0' }}>Nessuna sezione nel report.</p>}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
