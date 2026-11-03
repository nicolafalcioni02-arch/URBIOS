import React, { useState } from 'react';
import { ChefMore } from './ChefMore';
import { ChefPick } from './ChefPick';
import { MenuOverview, MenuTools } from './MenuSide';
import { COURSES, dishNutrition, menuTotals, newDish, newSection } from './chefLogic';

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');
const TABS = [['evento', 'Evento'], ['portate', 'Menù'], ['special', 'Special'], ['lettera', 'Lettera agli chef']];
const EVENT_KINDS = ['Matrimonio', 'Compleanno', 'Battesimo', 'Comunione e cresima', 'Laurea', 'Cena aziendale', 'Cena privata'];

// Box del menù: si apre dalla scheda in elenco, con le sezioni in schede (evento, menù, special, lettera)
export const MenuBox = ({ menu: m, patients, recipes, byId, onPatch, onQty, onGuide, onPrint, onDelete, onClose, onEditRecipe }) => {
    const [tab, setTab] = useState('evento');
    const [activeSid, setActiveSid] = useState(null);
    const [saved, setSaved] = useState(false);
    const ev = m.event || {};
    const [adv, setAdv] = useState(Boolean(ev.adults || ev.kids || ev.staff)); // ospiti divisi in adulti, bambini, staff
    const setCount = (k, v) => {
        const n = { ...ev, [k]: v.replace(/\D/g, '') };
        onPatch({ event: { ...n, guests: String(['adults', 'kids', 'staff'].reduce((t, x) => t + (Number(n[x]) || 0), 0) || '') } });
    };
    // il menù si salva da solo a ogni modifica: il tasto conferma e chiude
    const save = () => { setSaved(true); setTimeout(onClose, 700); };
    const active = m.sections.find((s) => s.id === activeSid) || m.sections[0];
    const patchSection = (sid, p) => onPatch({ sections: m.sections.map((s) => (s.id === sid ? { ...s, ...p } : s)) });
    const move = (i, d) => {
        const a = [...m.sections];
        const j = i + d;
        if (j < 0 || j >= a.length) return;
        [a[i], a[j]] = [a[j], a[i]];
        onPatch({ sections: a });
    };
    const tot = menuTotals(m, byId);
    const used = new Set(m.sections.map((s) => s.name));
    const suggest = COURSES.find((c) => !used.has(c));
    const count = { portate: m.sections.reduce((n, s) => n + s.dishes.length, 0), special: (m.specials || []).length };
    const kc = tot.p * 4 + tot.c * 4 + tot.f * 9 || 1;
    const mp = [tot.p * 4, tot.c * 4, tot.f * 9].map((x) => Math.round((x / kc) * 100));
    const opts = [{ value: '', label: 'Nessun piatto' }, ...recipes.map((r) => ({ value: r.id, label: r.title, sub: `${r.category || 'Ricetta'} · ${r0(r.totals.kcal / (r.servings || 1))} kcal` }))];
    const picker = (value, onPick) => <ChefPick value={value} options={opts} onChange={onPick} placeholder="Scegli un piatto" />;
    const today = new Date().toISOString().slice(0, 10);
    const patientOpts = [{ value: '', label: 'Nessun paziente' }, ...(patients || []).map((p) => ({ value: p.id, label: `${p.nome || ''} ${p.cognome || ''}`.trim() || 'Paziente' }))];
    const KINDS = [{ value: 'dieta', label: 'Allergia o dieta' }, { value: 'bimbi', label: 'Bimbi' }];

    return (
        <div className="dg-overlay ch-mbw" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <MenuTools menu={m} byId={byId} />
            <MenuOverview menu={m} byId={byId} />
            <div className="dg-modal" style={{ maxWidth: 720 }}>
                <div className="ch-mbox-head">
                    <div className="flex-1 min-w-0">
                        <input className="ch-mb-title ch-serif" value={m.title} onChange={(e) => onPatch({ title: e.target.value })} aria-label="Nome del menù" />
                        <input className="ch-mb-sub" placeholder="Sottotitolo (es. Menù degustazione, 4 portate)" value={m.subtitle || ''} onChange={(e) => onPatch({ subtitle: e.target.value })} aria-label="Sottotitolo" />
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi"><i className="ph ph-x"></i></button>
                </div>
                <div className="ch-mb-stats">
                    <div><b>{m.sections.length}</b><span>portate</span></div>
                    <div><b>{count.portate}</b><span>piatti</span></div>
                    <div><b>{r0(tot.kcal)}</b><span>kcal</span></div>
                    {tot.kcal > 0 && <div className="ch-mb-macro" title={`P ${r0(tot.p)} g · C ${r0(tot.c)} g · G ${r0(tot.f)} g`}>
                        <div className="ch-mb-bar"><i style={{ width: `${mp[0]}%` }}></i><i style={{ width: `${mp[1]}%` }}></i><i style={{ width: `${mp[2]}%` }}></i></div>
                        <span>P {r0(tot.p)} · C {r0(tot.c)} · G {r0(tot.f)} g</span>
                    </div>}
                </div>
                <div className="ch-mb-seg" role="tablist">
                    {TABS.map(([k, label]) => (
                        <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}{count[k] > 0 && <em>{count[k]}</em>}</button>
                    ))}
                </div>
                <div className="ch-mbox-body">
                    {tab === 'portate' && (
                        <>
                            {m.sections.map((s, i) => (
                                <div className={`ch-mb-course ${active?.id === s.id ? 'act' : ''}`} key={s.id} onClick={() => setActiveSid(s.id)} onFocusCapture={() => setActiveSid(s.id)}>
                                    <div className="ch-course-h">
                                        <span className="ch-mb-n">{i + 1}</span>
                                        <input className="ch-course-name" value={s.name} onChange={(e) => patchSection(s.id, { name: e.target.value })} aria-label="Nome della portata" />
                                        <span className="ch-course-tools">
                                            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Sposta su"><i className="ph ph-caret-up"></i></button>
                                            <button onClick={() => move(i, 1)} disabled={i === m.sections.length - 1} aria-label="Sposta giù"><i className="ph ph-caret-down"></i></button>
                                            <button onClick={() => onPatch({ sections: m.sections.filter((x) => x.id !== s.id) })} aria-label="Togli la portata"><i className="ph ph-x"></i></button>
                                        </span>
                                    </div>
                                    {s.dishes.map((d, k) => (
                                        <div className="ch-dish ch-mb-dish" key={k}>
                                            {byId[d.rid] ? <span className="ch-dish-name" title={byId[d.rid].title}>{byId[d.rid].title}</span> : picker(d.rid, (rid) => patchSection(s.id, { dishes: s.dishes.map((x, j) => (j === k ? { rid, w: {} } : x)) }))}
                                            {byId[d.rid] && <small>{r0(dishNutrition(byId[d.rid], d).kcal)} kcal</small>}
                                            {byId[d.rid] && <button className="ch-qty" onClick={() => onEditRecipe(d.rid)} aria-label="Modifica la ricetta" title="Modifica la ricetta (ingredienti, passaggi)"><i className="ph ph-pencil-simple"></i></button>}
                                            {byId[d.rid] && (
                                                <button className={`ch-qty ${dishNutrition(byId[d.rid], d).custom ? 'on' : ''}`} onClick={() => onQty(s.id, k)} aria-label="Quantità per questo menù" title="Quantità per questo menù"><i className="ph ph-scales"></i></button>
                                            )}
                                            <button className="ch-x" onClick={() => patchSection(s.id, { dishes: s.dishes.filter((_, j) => j !== k) })} aria-label="Togli il piatto"><i className="ph ph-x"></i></button>
                                        </div>
                                    ))}
                                    <button className="ch-add" onClick={() => patchSection(s.id, { dishes: [...s.dishes, newDish()] })}><i className="ph ph-plus"></i>Aggiungi un piatto</button>
                                </div>
                            ))}
                            <button className="ch-add ch-mb-addc" onClick={() => onPatch({ sections: [...m.sections, newSection(suggest || 'Nuova portata')] })}><i className="ph ph-plus"></i>Aggiungi una portata{suggest ? ` · ${suggest}` : ''}</button>
                        </>
                    )}
                    {tab === 'evento' && (
                        <div className="ch-mb-course">
                            <div className="ch-mb-f2">
                                <div><label className="fld-label">Tipo di evento</label>
                                    <input className="fld" list="ch-event-kinds" placeholder="Es. Matrimonio" value={m.event?.kind || ''} onChange={(e) => onPatch({ event: { ...m.event, kind: e.target.value } })} />
                                    <datalist id="ch-event-kinds">{EVENT_KINDS.map((k) => <option key={k} value={k} />)}</datalist></div>
                                <div><label className="fld-label">Evento o cliente</label>
                                    <input className="fld" placeholder="Es. Rossi–Bianchi" value={m.event?.name || ''} onChange={(e) => onPatch({ event: { ...m.event, name: e.target.value } })} /></div>
                                <div><label className="fld-label">Location</label>
                                    <input className="fld" placeholder="Dove si svolge" value={m.event?.location || ''} onChange={(e) => onPatch({ event: { ...m.event, location: e.target.value } })} /></div>
                                <div><label className="fld-label">Data</label>
                                    <input className="fld" type="date" value={m.event?.date || ''} onChange={(e) => onPatch({ event: { ...m.event, date: e.target.value } })} /></div>
                                <div><label className="fld-label">Ospiti{adv ? ' (totale)' : ''}</label>
                                    <input className="fld" inputMode="numeric" placeholder="Quanti" disabled={adv} value={m.event?.guests || ''} onChange={(e) => onPatch({ event: { ...m.event, guests: e.target.value.replace(/\D/g, '') } })} /></div>
                                <div><label className="fld-label">Paziente</label>
                                    <ChefPick minSearch={0} value={m.patientId || ''} options={patientOpts} onChange={(v) => onPatch({ patientId: v, event: { ...m.event, date: m.event?.date || (v ? today : '') } })} placeholder="Facoltativo" /></div>
                            </div>
                            <button className="ch-add" style={{ marginTop: 10 }} onClick={() => setAdv(!adv)}><i className={`ph ph-${adv ? 'minus' : 'plus'}`}></i>{adv ? 'Ospiti semplici' : 'Dettaglia gli ospiti: adulti, bambini, staff'}</button>
                            {adv && (
                                <div className="ch-mb-f3">
                                    {[['adults', 'Adulti'], ['kids', 'Bambini'], ['staff', 'Staff']].map(([k, label]) => (
                                        <div key={k}><label className="fld-label">{label}</label><input className="fld" inputMode="numeric" placeholder="0" value={ev[k] || ''} onChange={(e) => setCount(k, e.target.value)} /></div>
                                    ))}
                                </div>
                            )}
                            <p className="ch-qty-hint" style={{ marginBottom: 0 }}>{m.patientId ? 'Compare nello storico del paziente come evento speciale, non come visita.' : 'Associa un paziente per ritrovare il menù nel suo storico.'}</p>
                        </div>
                    )}
                    {tab === 'lettera' && (
                        <div className="ch-mb-course">
                            <textarea className="fld" rows={14} style={{ height: 'auto', paddingTop: 10 }} placeholder="Scrivi agli chef: l’idea del menù, HACCP, catena del freddo, contaminazioni… oppure fatti aiutare dal percorso guidato." value={m.letter || ''} onChange={(e) => onPatch({ letter: e.target.value })} />
                        </div>
                    )}
                    {tab === 'special' && (
                        <>
                            <p className="ch-qty-hint" style={{ margin: 0 }}>Allergie e intolleranze: per ogni caso le sostituzioni e le attenzioni per la cucina.</p>
                            {(m.specials || []).map((sp, n) => {
                                const upd = (q) => onPatch({ specials: m.specials.map((x) => (x.id === sp.id ? { ...x, ...q } : x)) });
                                return (
                                    <div key={sp.id} className="ch-sp">
                                        <div className="ch-sp-h">
                                            <span className="ch-mb-n">{n + 1}</span>
                                            <ChefPick style={{ width: 170, flex: 'none' }} searchable={false} value={sp.kind || 'dieta'} options={KINDS} onChange={(v) => upd({ kind: v })} />
                                            <span className="flex-1"></span>
                                            <button className="ch-x" onClick={() => window.confirm('Togliere questo caso dal menù?') && onPatch({ specials: m.specials.filter((x) => x.id !== sp.id) })} aria-label="Togli il caso" title="Togli il caso"><i className="ph ph-trash"></i></button>
                                        </div>
                                        <div className="ch-sp-g">
                                            <div><label className="fld-label">Caso</label><input className="fld" placeholder="Es. Senza glutine, celiaci" value={sp.name} onChange={(e) => upd({ name: e.target.value })} /></div>
                                            <div style={{ width: 90 }}><label className="fld-label">Persone</label><input className="fld" inputMode="numeric" placeholder="0" value={sp.persons || ''} onChange={(e) => upd({ persons: e.target.value.replace(/\D/g, '') })} /></div>
                                        </div>
                                        <div className="ch-sp-b"><label className="fld-label">Per chi</label><input className="fld" placeholder="Nome della persona o dei bimbi, es. Sofia, Luca" value={sp.who || ''} onChange={(e) => upd({ who: e.target.value })} /></div>
                                        {sp.kind === 'bimbi' && (
                                            <div className="ch-sp-b">
                                                <label className="fld-label">Menù bimbi</label>
                                                {(sp.dishes || []).map((d, k) => (
                                                    <div className="ch-dish" key={'d' + k}>
                                                        {picker(d.rid, (rid) => upd({ dishes: sp.dishes.map((x, j) => (j === k ? { rid, w: {} } : x)) }))}
                                                        <button className="ch-x" onClick={() => upd({ dishes: sp.dishes.filter((_, j) => j !== k) })} aria-label="Togli il piatto"><i className="ph ph-x"></i></button>
                                                    </div>
                                                ))}
                                                <button className="ch-add" onClick={() => upd({ dishes: [...(sp.dishes || []), newDish()] })}><i className="ph ph-plus"></i>Piatto del menù bimbi</button>
                                            </div>
                                        )}
                                        <div className="ch-sp-b">
                                            <label className="fld-label">Sostituzioni</label>
                                            {(sp.subs || []).map((b, k) => (
                                                <div className="ch-dish" key={k}>
                                                    <input className="fld" placeholder="Al posto di (es. pasta di grano)" value={b.from} onChange={(e) => upd({ subs: sp.subs.map((y, j) => (j === k ? { ...y, from: e.target.value } : y)) })} />
                                                    <i className="ph ph-arrow-right" style={{ color: 'var(--muted)' }}></i>
                                                    <input className="fld" placeholder="Usa (es. pasta di riso)" value={b.to} onChange={(e) => upd({ subs: sp.subs.map((y, j) => (j === k ? { ...y, to: e.target.value } : y)) })} />
                                                    <button className="ch-x" onClick={() => upd({ subs: sp.subs.filter((_, j) => j !== k) })} aria-label="Togli la sostituzione"><i className="ph ph-x"></i></button>
                                                </div>
                                            ))}
                                            <button className="ch-add" onClick={() => upd({ subs: [...(sp.subs || []), { from: '', to: '' }] })}><i className="ph ph-plus"></i>Aggiungi una sostituzione</button>
                                        </div>
                                        <div className="ch-sp-b">
                                            <label className="fld-label">Attenzioni in cucina</label>
                                            <textarea className="fld" rows={2} style={{ height: 'auto', paddingTop: 10 }} placeholder="Es. utensili separati, nessuna traccia di glutine, piatto con segnale" value={sp.care || ''} onChange={(e) => upd({ care: e.target.value })} />
                                        </div>
                                    </div>
                                );
                            })}
                            <button className="ch-add ch-mb-addc" onClick={() => onPatch({ specials: [...(m.specials || []), { id: 'sp-' + Date.now(), name: '', persons: '', subs: [{ from: '', to: '' }] }] })}><i className="ph ph-plus"></i>Aggiungi un menù special o bimbi</button>
                        </>
                    )}
                </div>
                <div className="ch-mbox-foot">
                    <ChefMore up items={[
                        { label: 'Percorso guidato', icon: 'magic-wand', onClick: onGuide },
                        { label: 'Stampa', icon: 'printer', onClick: () => onPrint(true) },
                        { label: 'Elimina menù', icon: 'trash', danger: true, onClick: onDelete },
                    ]} />
                    <span className="flex-1"></span>
                    <button className="vw-next" style={{ background: saved ? 'var(--ok)' : undefined }} onClick={save}><i className={`ph ph-${saved ? 'check' : 'floppy-disk'}`}></i><span>{saved ? 'Salvato' : 'Salva'}</span></button>
                </div>
            </div>
        </div>
    );
};
