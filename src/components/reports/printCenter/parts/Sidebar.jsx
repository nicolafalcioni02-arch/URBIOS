import React, { useState } from 'react';
import { DIET_PARTS } from '../docs/dietReport';
import { DOC_TYPES, TYPE_ORDER, availability, describe, optionChoices } from '../catalog';
import { ACCENTS, LAYOUTS, MARGINS } from '../logic/theme';

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

const Select = ({ label, value, options, onChange }) => (
    <label className="pc-field">
        <span>{label}</span>
        <select className="pc-input" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((o) => (
                <option key={o.id} value={o.id}>
                    {o.label}
                </option>
            ))}
        </select>
    </label>
);

// opzioni di un documento: cambiano il contenuto generato dai dati
const ItemOptions = ({ item, ctx, setOpts, onRegenerate, onMove, index, count }) => {
    const o = item.opts || {};
    const ch = optionChoices(item, ctx);
    return (
        <div className="pc-opts">
            {(item.type === 'visita' || item.type === 'grafici') && ch.visits.length > 0 && <Select label="Visita" value={o.visitId} options={ch.visits} onChange={(v) => setOpts({ visitId: v })} />}
            {item.type === 'visita' && <Check on={o.masthead !== false} onChange={(v) => setOpts({ masthead: v })} label="Intestazione dello studio" />}
            {item.type === 'grafici' && (
                <>
                    <Check on={o.page1 !== false} onChange={(v) => setOpts({ page1: v })} label="Pagina 1 · indici e corpo 3D" />
                    <Check on={o.page2 !== false} onChange={(v) => setOpts({ page2: v })} label="Pagina 2 · grafici e parametri" />
                </>
            )}
            {item.type === 'andamento' && (
                <>
                    <Check on={o.charts !== false} onChange={(v) => setOpts({ charts: v })} label="Grafici" />
                    <Check on={o.table !== false} onChange={(v) => setOpts({ table: v })} label="Tabella di tutte le visite" />
                    <Check on={o.masthead !== false} onChange={(v) => setOpts({ masthead: v })} label="Intestazione dello studio" />
                </>
            )}
            {item.type === 'dieta' && (
                <>
                    {ch.visits.length > 1 && <Select label="Piano" value={o.visitId} options={ch.visits} onChange={(v) => setOpts({ visitId: v })} />}
                    {DIET_PARTS.map(([k, l]) => (
                        <Check key={k} on={o.parts?.[k] !== false} onChange={(v) => setOpts({ parts: { ...(o.parts || {}), [k]: v } })} label={l} />
                    ))}
                </>
            )}
            {item.type === 'training' && (
                <>
                    {ch.schede.length > 1 && <Select label="Scheda" value={o.schedaId} options={ch.schede} onChange={(v) => setOpts({ schedaId: v, weekId: 'all' })} />}
                    <Select label="Settimane" value={o.weekId} options={[{ id: 'all', label: 'Tutta la scheda' }, ...ch.weeks]} onChange={(v) => setOpts({ weekId: v })} />
                    {[
                        ['images', 'Figure degli esercizi'],
                        ['pagePerDay', 'Un giorno per pagina'],
                        ['notes', 'Note'],
                        ['summary', 'Riepilogo della seduta'],
                        ['legend', 'Legenda'],
                        ['studio', 'Intestazione dello studio'],
                    ].map(([k, l]) => (
                        <Check key={k} on={o[k]} onChange={(v) => setOpts({ [k]: v })} label={l} />
                    ))}
                </>
            )}
            {item.type === 'copertina' && (
                <>
                    <label className="pc-field">
                        <span>Titolo</span>
                        <input className="pc-input" value={o.title || ''} onChange={(e) => setOpts({ title: e.target.value })} />
                    </label>
                    <label className="pc-field">
                        <span>Sopra il titolo</span>
                        <input className="pc-input" value={o.subtitle || ''} onChange={(e) => setOpts({ subtitle: e.target.value })} />
                    </label>
                    <Check on={o.index !== false} onChange={(v) => setOpts({ index: v })} label="Sommario con i numeri di pagina" />
                    <Check on={o.contacts !== false} onChange={(v) => setOpts({ contacts: v })} label="Recapiti dello studio" />
                </>
            )}
            {item.type === 'nota' && (
                <label className="pc-field">
                    <span>Titolo</span>
                    <input className="pc-input" value={o.title || ''} onChange={(e) => setOpts({ title: e.target.value })} />
                </label>
            )}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
                {DOC_TYPES[item.type].kind === 'flow' && item.edited && (
                    <button className="pc-link" onClick={onRegenerate}>
                        <i className="ph ph-arrow-counter-clockwise"></i> Ripristina dai dati
                    </button>
                )}
                <button className="pc-link" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
                    <i className="ph ph-arrow-up"></i> Su
                </button>
                <button className="pc-link" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
                    <i className="ph ph-arrow-down"></i> Giù
                </button>
            </div>
        </div>
    );
};

export const Sidebar = ({ open, items, ctx, theme, setTheme, presets, presetId, onPreset, onSavePreset, onDeletePreset, onToggle, onMove, onRemove, onAdd, onSetOpts, onRegenerate, ranges, onGoTo }) => {
    const [tab, setTab] = useState('contenuto');
    const [optOpen, setOptOpen] = useState(null);
    const [drag, setDrag] = useState(null);
    const [over, setOver] = useState(null);
    const [naming, setNaming] = useState(null);

    const pageText = (id) => {
        const r = ranges[id];
        if (!r) return '';
        return r[0] === r[1] ? `pag. ${r[0]}` : `pag. ${r[0]}–${r[1]}`;
    };

    return (
        <aside className={`pc-side ${open ? 'open' : ''}`}>
            <div className="pc-tabs">
                <button className={tab === 'contenuto' ? 'on' : ''} onClick={() => setTab('contenuto')}>
                    <i className="ph ph-stack"></i> Contenuto
                </button>
                <button className={tab === 'stile' ? 'on' : ''} onClick={() => setTab('stile')}>
                    <i className="ph ph-palette"></i> Stile
                </button>
            </div>
            <div className="pc-side-scroll">
                {tab === 'contenuto' && (
                    <>
                        <div className="pc-h">Pacchetti pronti</div>
                        <div className="pc-presets">
                            {presets.map((p) => (
                                <button key={p.id} className={`pc-chip ${presetId === p.id ? 'on' : ''}`} onClick={() => onPreset(p)} title={p.custom ? 'Pacchetto salvato da te' : undefined}>
                                    <i className={`ph ${p.icon || 'ph-bookmark-simple'}`}></i>
                                    {p.label}
                                    {p.custom && (
                                        <span
                                            className="x"
                                            role="button"
                                            aria-label="Elimina pacchetto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePreset(p);
                                            }}
                                        >
                                            <i className="ph ph-x"></i>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pc-h">
                            <span>Nel documento</span>
                            {items.length > 0 && naming === null && (
                                <button className="pc-link" onClick={() => setNaming('')} title="Salva questa composizione per riusarla con altri pazienti">
                                    <i className="ph ph-bookmark-simple"></i> Salva pacchetto
                                </button>
                            )}
                        </div>
                        {naming !== null && (
                            <form
                                style={{ display: 'flex', gap: 6, marginBottom: 8 }}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (naming.trim()) onSavePreset(naming.trim());
                                    setNaming(null);
                                }}
                            >
                                <input autoFocus className="pc-input" placeholder="Nome del pacchetto" value={naming} onChange={(e) => setNaming(e.target.value)} />
                                <button className="pc-btn primary" style={{ height: 36 }} type="submit">
                                    Salva
                                </button>
                                <button className="pc-ic" style={{ width: 36, height: 36 }} type="button" onClick={() => setNaming(null)} aria-label="Annulla">
                                    <i className="ph ph-x"></i>
                                </button>
                            </form>
                        )}
                        {items.map((it, i) => (
                            <div
                                key={it.id}
                                className={`pc-item ${it.on ? '' : 'off'} ${drag === i ? 'drag' : ''} ${over === i && drag !== null && drag !== i ? 'over' : ''}`}
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
                                        title="Trascina per spostare"
                                    >
                                        <i className="ph ph-dots-six-vertical"></i>
                                    </span>
                                    <button className={`pc-check ${it.on ? 'on' : ''}`} onClick={() => onToggle(it.id)} aria-label={it.on ? 'Escludi dalla stampa' : 'Includi nella stampa'} title={it.on ? 'Incluso: clic per escluderlo' : 'Escluso: clic per includerlo'}>
                                        {it.on && <i className="ph-bold ph-check"></i>}
                                    </button>
                                    <span className="pc-item-ic">
                                        <i className={`ph ${DOC_TYPES[it.type].icon}`}></i>
                                    </span>
                                    <span className="pc-item-txt" onClick={() => it.on && onGoTo(it.id)}>
                                        <b>{DOC_TYPES[it.type].label}</b>
                                        <small>
                                            {it.on && pageText(it.id) && <span className="pg">{pageText(it.id)} · </span>}
                                            {it.edited && <span className="ed">modificato · </span>}
                                            {describe(it, ctx)}
                                        </small>
                                    </span>
                                    <button className={`pc-mini ${optOpen === it.id ? 'on' : ''}`} onClick={() => setOptOpen(optOpen === it.id ? null : it.id)} title="Opzioni" aria-label="Opzioni">
                                        <i className="ph ph-sliders-horizontal"></i>
                                    </button>
                                    <button className="pc-mini" onClick={() => onRemove(it.id)} title="Togli dal documento" aria-label="Togli dal documento">
                                        <i className="ph ph-trash"></i>
                                    </button>
                                </div>
                                {optOpen === it.id && <ItemOptions item={it} ctx={ctx} index={i} count={items.length} onMove={onMove} setOpts={(patch) => onSetOpts(it.id, patch)} onRegenerate={() => onRegenerate(it.id)} />}
                            </div>
                        ))}
                        {items.length === 0 && <div className="pc-empty">Scegli un pacchetto pronto o aggiungi i documenti qui sotto.</div>}

                        <div className="pc-h">Aggiungi</div>
                        <div className="pc-add">
                            {TYPE_ORDER.map((t) => {
                                const a = availability(t, ctx);
                                const once = t === 'copertina' && items.some((x) => x.type === 'copertina');
                                return (
                                    <button key={t} disabled={!a.ok || once} onClick={() => onAdd(t)} title={a.ok ? DOC_TYPES[t].desc : a.reason}>
                                        <i className={`ph ${DOC_TYPES[t].icon}`}></i>
                                        <b>{DOC_TYPES[t].label}</b>
                                        <small>{a.ok ? (once ? 'Già presente' : DOC_TYPES[t].desc) : a.reason}</small>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="pc-note">
                            <i className="ph ph-cursor-text"></i>
                            <span>Clicca su un foglio per scrivere o correggere: le pagine si risistemano da sole quando esci dalla modifica.</span>
                        </p>
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
                                >
                                    <div className="pc-lay-prev">
                                        <div className="pg">
                                            {l.deco === 'band' && <div className="band" />}
                                            {l.deco === 'frame' && <div className="frame" />}
                                            <div className="t" style={l.deco === 'serif' ? { borderRadius: 0, height: 3 } : null} />
                                            {[17, 23, 27, 31, 37, 41, 45].map((y) => (
                                                <div key={y} className="l" style={{ top: y, right: y % 2 ? 9 : 5 }} />
                                            ))}
                                        </div>
                                    </div>
                                    <b>{l.label}</b>
                                    <small>{l.desc}</small>
                                </button>
                            ))}
                        </div>

                        <div className="pc-h">Colore guida</div>
                        <div className="pc-accents">
                            {ACCENTS.map((c) => (
                                <button key={c} className={`pc-dot ${c.toLowerCase() === String(theme.accent).toLowerCase() ? 'on' : ''}`} style={{ background: c }} onClick={() => setTheme({ accent: c })} aria-label={`Colore ${c}`} />
                            ))}
                            <input type="color" value={theme.accent} onChange={(e) => setTheme({ accent: e.target.value })} title="Colore a scelta" style={{ width: 30, height: 30, border: 0, background: 'none', padding: 0, cursor: 'pointer' }} />
                        </div>

                        <div className="pc-h">Margini</div>
                        <div className="pc-seg">
                            {Object.entries(MARGINS).map(([k, v]) => (
                                <button key={k} className={theme.margins === k ? 'on' : ''} onClick={() => setTheme({ margins: k })}>
                                    {v.label}
                                </button>
                            ))}
                        </div>

                        <div className="pc-h">Dimensione del testo</div>
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

                        <div className="pc-h">Intestazione di pagina</div>
                        <div className="pc-seg">
                            {[
                                ['auto', 'Automatica'],
                                ['sempre', 'Sempre'],
                                ['mai', 'Mai'],
                            ].map(([v, l]) => (
                                <button key={v} className={theme.header === v ? 'on' : ''} onClick={() => setTheme({ header: v })}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        <p className="pc-note" style={{ marginTop: 8 }}>
                            <i className="ph ph-info"></i>
                            <span>Automatica: non si ripete sulla prima pagina dei documenti che hanno già l'intestazione dello studio.</span>
                        </p>

                        <div className="pc-h">Piè di pagina</div>
                        <Switch on={theme.footer} onChange={(v) => setTheme({ footer: v })} label="Mostra il piè di pagina" />
                        {theme.footer && <Switch on={theme.numbers} onChange={(v) => setTheme({ numbers: v })} label="Numeri di pagina" />}
                        <p className="pc-note">
                            <i className="ph ph-floppy-disk"></i>
                            <span>Lo stile resta salvato per i prossimi documenti, per tutti i pazienti.</span>
                        </p>
                    </>
                )}
            </div>
        </aside>
    );
};
