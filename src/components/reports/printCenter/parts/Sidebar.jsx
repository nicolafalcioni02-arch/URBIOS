import React, { useState } from 'react';
import { DIET_PARTS, weekDaysOf } from '../docs/dietReport';
import { DOC_TYPES, DOC_VIEWS, TYPE_ORDER, availability, currentView, describe, optionChoices, sourceChoice } from '../catalog';
import { ACCENTS, LAYOUTS, MARGINS } from '../logic/theme';

// Barra laterale del Centro stampa, in due passi:
// 1 Documenti: cosa stampare. Ogni documento è una riga; aperta mostra tutto ciò che lo riguarda (dati, vista, contenuto).
// 2 Aspetto: come appare tutta la stampa (layout, colore, impaginazione).

const Switch = ({ on, onChange, label }) => (
    <div className="pc-row">
        <span>{label}</span>
        <button className={`pc-switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on} aria-label={label} />
    </div>
);

const Check = ({ on, onChange, label }) => (
    <label className="ck">
        <input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
);

const Pick = ({ value, options, onChange, label }) => (
    <label className="pc-pick">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
            {options.map((o) => (
                <option key={o.id} value={o.id}>
                    {o.label}
                </option>
            ))}
        </select>
        <i className="ph ph-caret-down"></i>
    </label>
);

// nome del documento, numerato se ce n'è più d'uno dello stesso tipo (es. due schede con viste diverse)
const docName = (it, items) => {
    const same = items.filter((x) => x.type === it.type);
    return same.length > 1 ? `${DOC_TYPES[it.type].label} ${same.indexOf(it) + 1}` : DOC_TYPES[it.type].label;
};

// riassunto di una riga: in che vista, da quali dati, in che pagine
const summary = (it, ctx, pages) => {
    if (!it.on) return 'Escluso dalla stampa';
    const src = sourceChoice(it, ctx);
    const view = currentView(it);
    const from = src ? (src.options.find((x) => x.id === String(it.opts?.[src.key])) || src.options[0])?.label.replace(/^(Visita|Piano) del /, '') : describe(it, ctx);
    return [view && view.label, from, pages].filter(Boolean).join(' · '); // la vista per prima: si legge sempre
};

// sezione richiudibile (le scelte meno usate restano chiuse)
const Fold = ({ title, sub, children, start = false }) => {
    const [open, setOpen] = useState(start);
    return (
        <div className={`pc-fold ${open ? 'open' : ''}`}>
            <button className="pc-fold-h" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span>
                    <b>{title}</b>
                    {sub && <small>{sub}</small>}
                </span>
                <i className="ph ph-caret-down"></i>
            </button>
            {open && <div className="pc-fold-b">{children}</div>}
        </div>
    );
};

// "Gruppo di documenti": un menu chiuso che dice quali documenti mette in stampa ogni gruppo
const PresetPicker = ({ presets, presetId, ctx, onPreset, onDeletePreset, onSavePreset, canSaveNow }) => {
    const [open, setOpen] = useState(false);
    const [naming, setNaming] = useState(null);
    const cur = presets.find((p) => p.id === presetId);
    const contents = (p) => {
        const ok = (p.types || []).filter((t) => DOC_TYPES[t] && availability(t, ctx).ok);
        return ok.length ? ok.map((t) => DOC_TYPES[t].label).join(' · ') : 'Nessun documento disponibile per questo paziente';
    };
    return (
        <div className={`pc-preset ${open ? 'open' : ''}`}>
            <button className="pc-preset-cur" onClick={() => setOpen(!open)} aria-expanded={open}>
                <i className={`ph ${cur?.icon || 'ph-stack'} pc-preset-ic`}></i>
                <span className="pc-preset-txt">
                    <small>Gruppo di documenti</small>
                    <b>{cur ? cur.label : 'Scelti da te'}</b>
                </span>
                <i className="ph ph-caret-down pc-preset-caret"></i>
            </button>
            {open && (
                <div className="pc-preset-list">
                    <p className="pc-preset-info">Sceglie solo quali documenti stampare. Poi puoi aggiungerne o toglierne.</p>
                    {presets.map((p) => (
                        <div key={p.id} className={`pc-preset-opt ${presetId === p.id ? 'on' : ''}`}>
                            <button
                                onClick={() => {
                                    onPreset(p);
                                    setOpen(false);
                                }}
                            >
                                <i className={`ph ${p.icon || 'ph-bookmark-simple'}`}></i>
                                <span>
                                    <b>{p.label}</b>
                                    <small>{contents(p)}</small>
                                </span>
                                {presetId === p.id && <i className="ph-bold ph-check pc-preset-ok"></i>}
                            </button>
                            {p.custom && (
                                <button className="pc-mini" onClick={() => onDeletePreset(p)} title="Elimina questo gruppo" aria-label="Elimina questo gruppo">
                                    <i className="ph ph-trash"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    {naming === null ? (
                        canSaveNow && (
                            <button className="pc-link pc-preset-save" onClick={() => setNaming('')}>
                                <i className="ph ph-bookmark-simple"></i> Salva i documenti attuali come gruppo
                            </button>
                        )
                    ) : (
                        <form
                            className="pc-preset-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (naming.trim()) onSavePreset(naming.trim());
                                setNaming(null);
                                setOpen(false);
                            }}
                        >
                            <input autoFocus className="pc-input" placeholder="Nome del gruppo" value={naming} onChange={(e) => setNaming(e.target.value)} />
                            <button className="pc-btn primary" style={{ height: 36 }} type="submit">
                                Salva
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

// scelte sul contenuto di un documento (cosa includere)
const ContentOptions = ({ item, ctx, setOpts }) => {
    const o = item.opts || {};
    const ch = optionChoices(item, ctx);
    const field = (label, key) => (
        <label className="pc-field">
            <span>{label}</span>
            <input className="pc-input" value={o[key] || ''} onChange={(e) => setOpts({ [key]: e.target.value })} />
        </label>
    );
    const checks = {
        visita: [['masthead', 'Intestazione dello studio', true]],
        grafici: [
            ['page1', 'Pagina 1 · indici e corpo 3D', true],
            ['page2', 'Pagina 2 · grafici e parametri', true],
        ],
        andamento: [...((o.view || 'completo') === 'completo' ? [['charts', 'Grafici', true], ['table', 'Tabella di tutte le visite', true]] : []), ['masthead', 'Intestazione dello studio', true]],
        training: [
            ...((o.view || 'completa') === 'completa'
                ? [
                      ['images', 'Figure degli esercizi'],
                      ['pagePerDay', 'Un giorno per pagina'],
                      ['notes', 'Note'],
                      ['summary', 'Riepilogo della seduta'],
                      ['legend', 'Legenda'],
                  ]
                : []),
            ['studio', 'Intestazione dello studio'],
        ],
        ricettario: [
            ['intro', 'Lettera «Prima di cominciare»', true],
            ['index', 'Indice delle ricette', true],
            ['notes', 'Righe per le note del paziente', true],
            ['closing', 'Pagina finale «Buon appetito»', true],
        ],
        menu: [
            ['cover', 'Prima pagina', true],
            ['ingredients', 'Ingredienti sotto ogni piatto', true],
            ['macros', 'Calorie di ogni piatto', true],
            ['intro', 'Pagina «Ecco come ho pensato i piatti»', true],
            ['charts', 'Pagina con i grafici del menù', true],
            ['specials', 'Menù special e bimbi', true],
        ],
        cucina: [
            ['summary', 'Copertina e riepilogo', true],
            ['letter', 'Lettera agli chef', true],
            ['shopping', 'Lista della spesa', true],
            ['recipes', 'Scheda di ogni piatto', true],
            ['special', 'Pagine special', true],
        ],
        copertina: [
            ['index', 'Sommario con i numeri di pagina', true],
            ['contacts', 'Recapiti dello studio', true],
        ],
    }[item.type];
    return (
        <>
            {item.type === 'copertina' && (
                <>
                    {field('Titolo', 'title')}
                    {field('Sopra il titolo', 'subtitle')}
                </>
            )}
            {item.type === 'nota' && field('Titolo', 'title')}
            {item.type === 'ricettario' && (
                <>
                    {field('Titolo del libro', 'title')}
                    <Pick
                        label="Quali ricette"
                        value={o.scope || 'piano'}
                        options={[
                            { id: 'piano', label: 'Le ricette del piano (se ci sono)' },
                            { id: 'tutte', label: 'Tutte le mie ricette' },
                        ]}
                        onChange={(v) => setOpts({ scope: v })}
                    />
                </>
            )}
            {item.type === 'menu' && (
                <>
                    {field('Evento o nome', 'eventName')}
                    {field('Location o catering', 'location')}
                    {o.view === 'tavola' && (
                        <Pick label="Quante carte" value={String(o.copies || 4)} options={[2, 4, 6, 8, 10, 12, 16, 20].map((n) => ({ id: String(n), label: `${n} carte (${n / 2} fogli)` }))} onChange={(v) => setOpts({ copies: Number(v) })} />
                    )}
                </>
            )}
            {item.type === 'cucina' && (
                <>
                    {field('Quante persone', 'persons')}
                    {field('Scorta in più (%)', 'extra')}
                    {field('Evento (in alto)', 'eventName')}
                    {field('Location o catering', 'location')}
                </>
            )}
            {item.type === 'training' && ch.weeks.length > 1 && (
                <Pick label="Settimane" value={o.weekId} options={[{ id: 'all', label: 'Tutte le settimane' }, ...ch.weeks]} onChange={(v) => setOpts({ weekId: v })} />
            )}
            {item.type === 'dieta' && DIET_PARTS.map(([k, l]) => <Check key={k} on={o.parts?.[k] !== false} onChange={(v) => setOpts({ parts: { ...(o.parts || {}), [k]: v } })} label={l} />)}
            {item.type === 'dieta' && o.parts?.shopping !== false && ch.days.length > 1 && ch.days.length < 7 && (
                <div className="pc-weekdays">
                    <span>Spesa della settimana: quante volte ogni giornata</span>
                    {(() => {
                        const t = weekDaysOf(ch.days.length, o.weekDays);
                        return ch.days.map((d, i) => (
                            <div key={i} className="pc-row">
                                <span>{d}</span>
                                <span className="pc-stepper">
                                    <button onClick={() => setOpts({ weekDays: t.map((x, j) => (j === i ? Math.max(0, x - 1) : x)) })} aria-label={`Meno ${d}`} disabled={t[i] <= 0}>
                                        −
                                    </button>
                                    <b>{t[i]}</b>
                                    <button onClick={() => setOpts({ weekDays: t.map((x, j) => (j === i ? Math.min(7, x + 1) : x)) })} aria-label={`Più ${d}`} disabled={t[i] >= 7}>
                                        +
                                    </button>
                                </span>
                            </div>
                        ));
                    })()}
                    {weekDaysOf(ch.days.length, o.weekDays).reduce((a, b) => a + b, 0) !== 7 && <small className="pc-warn">In tutto fanno {weekDaysOf(ch.days.length, o.weekDays).reduce((a, b) => a + b, 0)} giorni, non 7.</small>}
                </div>
            )}
            {(checks || []).map(([k, l, defOn]) => (
                <Check key={k} on={defOn ? o[k] !== false : o[k]} onChange={(v) => setOpts({ [k]: v })} label={l} />
            ))}
        </>
    );
};

// un documento aperto: tutto quello che lo riguarda, in ordine
const ItemPanel = ({ item, items, ctx, index, setOpts, onMove, onRemove, onDuplicate, onRegenerate }) => {
    const src = sourceChoice(item, ctx);
    const views = DOC_VIEWS[item.type];
    const view = currentView(item);
    const hasContent = ['visita', 'grafici', 'andamento', 'dieta', 'training', 'copertina', 'nota', 'ricettario', 'menu', 'cucina'].includes(item.type);
    const nextView = views ? views[(views.indexOf(view) + 1) % views.length] : null;
    return (
        <div className="pc-panel">
            {src && (
                <div className="pc-panel-sec">
                    <div className="pc-panel-h">{src.label === 'Visita' ? 'Da quale visita' : src.label === 'Piano' ? 'Quale piano' : src.label === 'Menù' ? 'Da quale menù' : 'Quale scheda'}</div>
                    <Pick label={src.label} value={item.opts?.[src.key] || ''} options={src.options} onChange={(v) => setOpts({ [src.key]: v, ...(src.reset || {}) })} />
                </div>
            )}
            {views && (
                <div className="pc-panel-sec">
                    <div className="pc-panel-h">Come mostrarlo</div>
                    <div className="pc-views" role="radiogroup" aria-label="Come mostrarlo" style={views.length > 4 ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' } : undefined}>
                        {views.map((v) => (
                            <button key={v.id} role="radio" aria-checked={view.id === v.id} className={`pc-view ${view.id === v.id ? 'on' : ''}`} onClick={() => setOpts({ view: v.id })} title={v.desc}>
                                <i className={`ph ${v.icon}`}></i>
                                <span>{v.label}</span>
                            </button>
                        ))}
                    </div>
                    <small className="pc-viewset-d">{view.desc}</small>
                </div>
            )}
            {hasContent && (
                <Fold title="Cosa includere" sub="Sezioni e intestazione">
                    <div className="pc-opts">
                        <ContentOptions item={item} ctx={ctx} setOpts={setOpts} />
                    </div>
                </Fold>
            )}
            <div className="pc-panel-foot">
                {views && (
                    <button className="pc-link" onClick={() => onDuplicate(item.id, { view: nextView.id })} title="Aggiunge una copia con un'altra vista, per stamparle insieme">
                        <i className="ph ph-copy"></i> Duplica con un'altra vista
                    </button>
                )}
                {DOC_TYPES[item.type].kind === 'flow' && item.edited && (
                    <button className="pc-link" onClick={onRegenerate}>
                        <i className="ph ph-arrow-counter-clockwise"></i> Annulla le modifiche a mano
                    </button>
                )}
                <span className="pc-panel-tools">
                    <button className="pc-mini" disabled={index === 0} onClick={() => onMove(index, index - 1)} title="Sposta prima" aria-label="Sposta prima">
                        <i className="ph ph-arrow-up"></i>
                    </button>
                    <button className="pc-mini" disabled={index === items.length - 1} onClick={() => onMove(index, index + 1)} title="Sposta dopo" aria-label="Sposta dopo">
                        <i className="ph ph-arrow-down"></i>
                    </button>
                    <button className="pc-mini" onClick={() => onRemove(item.id)} title="Togli dalla stampa" aria-label="Togli dalla stampa">
                        <i className="ph ph-trash"></i>
                    </button>
                </span>
            </div>
        </div>
    );
};

// "+ Aggiungi un documento": un pulsante solo; l'elenco compare quando serve
const AddMenu = ({ items, ctx, onAdd }) => {
    const [open, setOpen] = useState(false);
    const list = TYPE_ORDER.map((t) => ({ t, a: availability(t, ctx), once: t === 'copertina' && items.some((x) => x.type === 'copertina') }));
    const ok = list.filter((x) => x.a.ok && !x.once);
    const no = list.filter((x) => !x.a.ok);
    if (!open)
        return (
            <button className="pc-addbtn" onClick={() => setOpen(true)}>
                <i className="ph ph-plus"></i> Aggiungi un documento
            </button>
        );
    return (
        <div className="pc-addmenu">
            <div className="pc-addmenu-h">
                <b>Aggiungi un documento</b>
                <button className="pc-mini" onClick={() => setOpen(false)} aria-label="Chiudi">
                    <i className="ph ph-x"></i>
                </button>
            </div>
            <div className="pc-add">
                {ok.map(({ t }) => (
                    <button
                        key={t}
                        onClick={() => {
                            onAdd(t);
                            setOpen(false);
                        }}
                    >
                        <i className={`ph ${DOC_TYPES[t].icon}`}></i>
                        <span>
                            <b>{DOC_TYPES[t].label}</b>
                            <small>{DOC_TYPES[t].desc}</small>
                        </span>
                    </button>
                ))}
            </div>
            {no.length > 0 && <p className="pc-add-no">Non disponibili per questo paziente: {no.map(({ t, a }) => `${DOC_TYPES[t].label.toLowerCase()} (${a.reason.toLowerCase()})`).join(', ')}.</p>}
        </div>
    );
};

const Help = ({ onClose }) => (
    <div className="pc-help">
        <div className="pc-addmenu-h">
            <b>Come funziona</b>
            <button className="pc-mini" onClick={onClose} aria-label="Chiudi">
                <i className="ph ph-x"></i>
            </button>
        </div>
        <dl className="pc-faq">
            <dt>1 · Scegli i documenti</dt>
            <dd>Parti da un <b>gruppo</b> pronto (solo quali documenti stampare) e aggiungi o togli quello che vuoi.</dd>
            <dt>Tocca un documento per impostarlo</dt>
            <dd>Scegli <b>da quale visita</b> (anche vecchie) e <b>come mostrarlo</b>: completo, in tabella, a schede… La riga ti ricorda sempre visita e vista.</dd>
            <dt>Due visite o due viste insieme?</dt>
            <dd>Usa <b>Duplica con un'altra vista</b>, oppure aggiungi di nuovo lo stesso documento: si numerano da soli.</dd>
            <dt>2 · Aspetto</dt>
            <dd>Layout e colore valgono per tutta la stampa e restano salvati per i prossimi pazienti.</dd>
            <dt>Correggere il testo</dt>
            <dd>Clicca su un foglio e scrivi: le pagine si risistemano da sole.</dd>
        </dl>
    </div>
);

export const Sidebar = ({ open, items, ctx, theme, setTheme, presets, presetId, onPreset, onSavePreset, onDeletePreset, onToggle, onMove, onRemove, onAdd, onDuplicate, onSetOpts, onRegenerate, ranges, onGoTo, tab, setTab }) => {
    const [openId, setOpenId] = useState(null);
    const [help, setHelp] = useState(false);
    const [drag, setDrag] = useState(null);
    const [over, setOver] = useState(null);

    const pageText = (id) => {
        const r = ranges[id];
        if (!r) return '';
        return r[0] === r[1] ? `pag. ${r[0]}` : `pag. ${r[0]}–${r[1]}`;
    };
    const lay = LAYOUTS.find((l) => l.id === theme.layout) || LAYOUTS[0];

    return (
        <aside className={`pc-side ${open ? 'open' : ''}`}>
            <div className="pc-tabs">
                <button className={tab === 'contenuto' ? 'on' : ''} onClick={() => setTab('contenuto')}>
                    <span className="pc-step">1</span> Documenti
                </button>
                <button className={tab === 'stile' ? 'on' : ''} onClick={() => setTab('stile')}>
                    <span className="pc-step">2</span> Aspetto
                </button>
                <button className={`pc-helpbtn ${help ? 'on' : ''}`} onClick={() => setHelp(!help)} aria-label="Come funziona" title="Come funziona">
                    <i className="ph ph-question"></i>
                </button>
            </div>
            <div className="pc-side-scroll">
                {help && <Help onClose={() => setHelp(false)} />}

                {tab === 'contenuto' && (
                    <>
                        <PresetPicker presets={presets} presetId={presetId} ctx={ctx} onPreset={onPreset} onDeletePreset={onDeletePreset} onSavePreset={onSavePreset} canSaveNow={items.length > 0} />

                        <div className="pc-list">
                            {items.map((it, i) => {
                                const isOpen = openId === it.id;
                                return (
                                    <div
                                        key={it.id}
                                        className={`pc-item ${it.on ? '' : 'off'} ${isOpen ? 'open' : ''} ${drag === i ? 'drag' : ''} ${over === i && drag !== null && drag !== i ? 'over' : ''}`}
                                        onDragOver={(e) => {
                                            if (drag === null) return;
                                            e.preventDefault();
                                            setOver(i);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (drag !== null && drag !== i) onMove(drag, i);
                                            setDrag(null);
                                            setOver(null);
                                        }}
                                    >
                                        <div className="pc-item-row">
                                            <span
                                                className="pc-grip"
                                                draggable
                                                onDragStart={(e) => {
                                                    setDrag(i);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    e.dataTransfer.setData('text/plain', String(i));
                                                }}
                                                onDragEnd={() => {
                                                    setDrag(null);
                                                    setOver(null);
                                                }}
                                                title="Trascina per cambiare l'ordine"
                                            >
                                                <i className="ph ph-dots-six-vertical"></i>
                                            </span>
                                            <button className={`pc-check ${it.on ? 'on' : ''}`} onClick={() => onToggle(it.id)} aria-label={it.on ? 'Escludi dalla stampa' : 'Includi nella stampa'} title={it.on ? 'In stampa: clic per escluderlo' : 'Escluso: clic per rimetterlo'}>
                                                {it.on && <i className="ph-bold ph-check"></i>}
                                            </button>
                                            <button
                                                className="pc-item-main"
                                                onClick={() => {
                                                    setOpenId(isOpen ? null : it.id);
                                                    if (!isOpen && it.on) onGoTo(it.id);
                                                }}
                                                aria-expanded={isOpen}
                                            >
                                                <i className={`ph ${DOC_TYPES[it.type].icon} pc-item-i`}></i>
                                                <span className="pc-item-txt">
                                                    <b>
                                                        {docName(it, items)}
                                                        {it.edited && <em className="ed" title="Modificato a mano"> · modificato</em>}
                                                    </b>
                                                    <small>{summary(it, ctx, pageText(it.id))}</small>
                                                </span>
                                                <i className="ph ph-caret-down pc-item-caret"></i>
                                            </button>
                                        </div>
                                        {isOpen && (
                                            <ItemPanel
                                                item={it}
                                                items={items}
                                                ctx={ctx}
                                                index={i}
                                                setOpts={(patch) => onSetOpts(it.id, patch)}
                                                onMove={onMove}
                                                onRemove={(id) => {
                                                    setOpenId(null);
                                                    onRemove(id);
                                                }}
                                                onDuplicate={(id, patch) => setOpenId(onDuplicate(id, patch))}
                                                onRegenerate={() => onRegenerate(it.id)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            {items.length === 0 && <div className="pc-empty">Nessun documento: scegli un gruppo qui sopra o aggiungine uno.</div>}
                        </div>

                        <AddMenu items={items} ctx={ctx} onAdd={(t) => setOpenId(onAdd(t))} />
                    </>
                )}

                {tab === 'stile' && (
                    <>
                        <div className="pc-h">Layout</div>
                        <div className="pc-layouts">
                            {LAYOUTS.map((l) => (
                                <button
                                    key={l.id}
                                    className={`pc-lay ${theme.layout === l.id ? 'on' : ''}`}
                                    onClick={() => setTheme({ layout: l.id, accent: l.accent, scale: l.scale || 1, margins: l.margins || 'normali' })}
                                    style={{ '--c': l.accent }}
                                    title={`${l.label}: ${l.desc}`}
                                >
                                    <div className={`pc-lay-prev pv-${l.id}`}>
                                        <div className="pg">
                                            <i className="d1" />
                                            <i className="d2" />
                                            <div className="t" />
                                            {[17, 23, 27, 31, 37, 41, 45].map((y) => (
                                                <div key={y} className="l" style={{ top: y, right: y % 2 ? 9 : 5 }} />
                                            ))}
                                        </div>
                                    </div>
                                    <b>{l.label}</b>
                                </button>
                            ))}
                        </div>
                        <p className="pc-lay-desc">
                            <b>{lay.label}</b> · {lay.desc}
                        </p>

                        <div className="pc-h">Colore</div>
                        <div className="pc-accents">
                            {ACCENTS.map((c) => (
                                <button key={c} className={`pc-dot ${c.toLowerCase() === String(theme.accent).toLowerCase() ? 'on' : ''}`} style={{ background: c }} onClick={() => setTheme({ accent: c })} aria-label={`Colore ${c}`} />
                            ))}
                            <label className="pc-dot pc-dot-any" title="Un altro colore">
                                <input type="color" value={theme.accent} onChange={(e) => setTheme({ accent: e.target.value })} aria-label="Un altro colore" />
                                <i className="ph ph-plus"></i>
                            </label>
                        </div>

                        <Fold title="Impaginazione" sub="Margini, testo, intestazione e piè di pagina">
                            <div className="pc-sub">Margini</div>
                            <div className="pc-seg">
                                {Object.entries(MARGINS).map(([k, v]) => (
                                    <button key={k} className={theme.margins === k ? 'on' : ''} onClick={() => setTheme({ margins: k })}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                            <div className="pc-sub">Dimensione del testo</div>
                            <div className="pc-seg">
                                {[
                                    [0.88, 'Piccolo'],
                                    [1, 'Normale'],
                                    [1.1, 'Grande'],
                                ].map(([v, l]) => (
                                    <button key={v} className={Math.abs(theme.scale - v) < 0.01 ? 'on' : ''} onClick={() => setTheme({ scale: v })}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <div className="pc-sub">Intestazione in alto</div>
                            <div className="pc-seg">
                                {[
                                    ['auto', 'Automatica'],
                                    ['sempre', 'Sempre'],
                                    ['mai', 'Mai'],
                                ].map(([v, l]) => (
                                    <button key={v} className={theme.header === v ? 'on' : ''} onClick={() => setTheme({ header: v })} title={v === 'auto' ? "Non si ripete sulla prima pagina dei documenti che hanno già l'intestazione dello studio" : undefined}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <div className="pc-sub">Piè di pagina</div>
                            <Switch on={theme.footer} onChange={(v) => setTheme({ footer: v })} label="Mostra il piè di pagina" />
                            <Switch on={theme.numbers} onChange={(v) => setTheme({ numbers: v })} label="Numeri di pagina" />
                        </Fold>
                    </>
                )}
            </div>
        </aside>
    );
};
