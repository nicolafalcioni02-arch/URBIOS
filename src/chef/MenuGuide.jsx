import React, { useMemo, useState } from 'react';
import { ChefPick } from './ChefPick';
import { buildMenuPrompt, parseMenu } from '../ai/menuSection';

// Percorso guidato per comporre un menù con URBIOS AI: evento → esigenze → portate → prompt/risposta → verifica.
// Come per le ricette, l'AI è la tua (copia/incolla): qui non parte nessuna chiamata e non esce nessun dato dei pazienti.
const NEEDS = ['Senza glutine', 'Senza lattosio', 'Senza uova', 'Senza frutta a guscio', 'Senza pesce e crostacei', 'Vegetariano', 'Vegano', 'Halal'];
const STEPS = ['Evento', 'Esigenze', 'Portate', 'Risposta', 'Verifica'];
const sid = () => Math.random().toString(36).slice(2, 9);

const copy = async (t) => {
    try {
        await navigator.clipboard.writeText(t);
        return true;
    } catch {
        return false;
    }
};

export const MenuGuide = ({ user, menu, menus = [], recipes, onApply, onClose }) => {
    const ev = menu?.event || {};
    const [step, setStep] = useState(0);
    const [a, setA] = useState({
        event: ev.name || '', kind: ev.kind || '', guests: ev.guests || '', style: ev.style || '', needs: (ev.needs || []).map((x) => (typeof x === 'string' ? { name: x, n: '' } : x)), custom: '', needsNote: '', notes: '',
        courses: ['Antipasto', 'Primo', 'Secondo', 'Dolce'].map((name) => ({ name, on: true, n: 1, picks: [] })),
    });
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState('');
    const [err, setErr] = useState('');
    const [res, setRes] = useState(null);
    const act = { ...a, courses: a.courses.filter((c) => c.on) };
    const prompt = useMemo(() => buildMenuPrompt({ a: act, recipes, user }), [a, recipes, user]); // eslint-disable-line
    const set = (p) => setA((x) => ({ ...x, ...p }));
    const toggleNeed = (n) => set({ needs: a.needs.some((x) => x.name === n) ? a.needs.filter((x) => x.name !== n) : [...a.needs, { name: n, n: '' }] });
    const setNeedN = (n, v) => set({ needs: a.needs.map((x) => (x.name === n ? { ...x, n: v.replace(/\D/g, '') } : x)) });
    const addCustom = () => {
        const t = a.custom.trim();
        if (t && !a.needs.some((x) => x.name.toLowerCase() === t.toLowerCase())) set({ needs: [...a.needs, { name: t, n: '' }], custom: '' });
    };

    const byRid = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r])), [recipes]);
    const others = menus.filter((m) => m.id !== menu?.id && (m.sections || []).some((x) => x.dishes?.length));
    const setCourse = (i, p) => set({ courses: a.courses.map((x, j) => (j === i ? { ...x, ...p } : x)) });
    const addPick = (i, rid) => {
        const c = a.courses[i];
        if (rid && !c.picks.includes(rid)) setCourse(i, { picks: [...c.picks, rid], n: Math.max(c.n, c.picks.length + 1) });
    };
    const addSection = (i, key) => {
        const [mid, sid2] = key.split('|');
        const sec = menus.find((m) => m.id === mid)?.sections.find((x) => x.id === sid2);
        const c = a.courses[i];
        const add = (sec?.dishes || []).map((d) => d.rid).filter((r) => byRid[r] && !c.picks.includes(r));
        if (add.length) setCourse(i, { picks: [...c.picks, ...add], n: Math.max(c.n, c.picks.length + add.length) });
    };
    const fromMenu = (mid) => {
        const m = menus.find((x) => x.id === mid);
        if (!m) return;
        set({
            courses: m.sections.map((x) => {
                const picks = x.dishes.map((d) => d.rid).filter((r) => byRid[r]);
                return { name: x.name, on: true, n: Math.max(1, picks.length), picks };
            }),
        });
    };
    const suggestOpts = (c) => recipes.filter((r) => !c.picks.includes(r.id)).map((r) => ({ value: r.id, label: r.title, sub: r.category }));
    const sectionOpts = menus.flatMap((m) => (m.sections || []).filter((x) => x.dishes?.length).map((x) => ({ value: m.id + '|' + x.id, label: `${m.title || 'Menù'} · ${x.name}`, sub: `${x.dishes.length} piatti` })));

    const read = () => {
        const r = parseMenu(pasted, recipes);
        if (!r.ok) return setErr(r.error);
        setRes(r);
        setStep(4);
    };
    const apply = () => {
        const base = menu || { id: 'menu-' + Date.now() };
        onApply({
            ...base,
            title: res.title || a.event || base.title || 'Nuovo menù',
            subtitle: res.subtitle,
            sections: res.portate.map((p) => ({ id: sid(), name: p.name, dishes: p.dishes.filter((d) => d.rid).map((d) => ({ rid: d.rid, w: {} })) })),
            specials: res.specials.map((s) => ({ ...s, id: 'sp-' + sid(), persons: s.persons === '0' ? '' : s.persons })),
            letter: res.letter,
            event: { name: a.event, kind: a.kind, guests: a.guests, style: a.style, needs: a.needs },
        });
        onClose();
    };

    const next = step === 0 ? () => setStep(1) : step === 1 ? () => setStep(2) : step === 2 ? async () => { setCopied(await copy(prompt)); setStep(3); } : step === 3 ? read : apply;
    const nextLabel = ['Avanti', 'Avanti', 'Copia il prompt', 'Leggi il menù', 'Crea il menù'][step];
    const canNext = step === 2 ? act.courses.length > 0 : step === 3 ? Boolean(pasted.trim()) : true;

    return (
        <div className="dg-overlay" style={{ zIndex: 9999 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="dg-modal" style={{ maxWidth: 680 }}>
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-3 flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}><i className="ph ph-magic-wand text-lg"></i></div>
                    <h2 className="flex-1 text-[18px] font-semibold">Componi il menù con URBIOS AI</h2>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi"><i className="ph ph-x"></i></button>
                </div>
                <div className="flex gap-2 px-5 sm:px-7 pb-3 border-b border-[color:var(--line)] flex-none">
                    {STEPS.map((s, i) => (
                        <span key={s} className="text-[12px] flex-1" style={{ color: i <= step ? 'var(--ink)' : 'var(--muted)', borderTop: `2px solid ${i <= step ? 'var(--ink)' : 'var(--line)'}`, paddingTop: 6 }}>{s}</span>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-4">
                    {step === 0 && (
                        <>
                            <p className="text-[14px] text-[color:var(--muted)]">Raccontaci l’evento: servono per scrivere il menù e la lettera agli chef.</p>
                            <div><label className="fld-label">Nome dell’evento o del cliente</label><input autoFocus className="fld" placeholder="Es. Matrimonio Rossi–Bianchi" value={a.event} onChange={(e) => set({ event: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="fld-label">Tipo di evento</label><input className="fld" placeholder="Matrimonio, cena aziendale…" value={a.kind} onChange={(e) => set({ kind: e.target.value })} /></div>
                                <div><label className="fld-label">Quanti ospiti</label><input className="fld" inputMode="numeric" value={a.guests} onChange={(e) => set({ guests: e.target.value.replace(/\D/g, '') })} /></div>
                            </div>
                            <div><label className="fld-label">Stile della cucina</label><input className="fld" placeholder="Mediterranea, di stagione, leggera…" value={a.style} onChange={(e) => set({ style: e.target.value })} /></div>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <p className="text-[14px] text-[color:var(--muted)]">Ci sono ospiti con allergie, intolleranze o scelte di dieta? Per ciascuna l’AI prepara le sostituzioni e le attenzioni per la cucina.</p>
                            <div className="flex flex-wrap gap-2">
                                {NEEDS.map((n) => <button key={n} className={`ch-pill ${a.needs.some((x) => x.name === n) ? 'on' : ''}`} onClick={() => toggleNeed(n)}>{n}</button>)}
                            </div>
                            <div>
                                <label className="fld-label">Combinazione particolare (es. Celiaco + senza lattosio)</label>
                                <div className="flex gap-2">
                                    <input className="fld" placeholder="Celiaco + senza lattosio" value={a.custom} onChange={(e) => set({ custom: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
                                    <button className="vw-chip" disabled={!a.custom.trim()} onClick={addCustom}><i className="ph ph-plus"></i>Aggiungi</button>
                                </div>
                            </div>
                            {a.needs.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="fld-label">Quanti special per ogni esigenza</label>
                                    {a.needs.map((x) => (
                                        <div className="ch-dish" key={x.name}>
                                            <span className="flex-1 text-[14px]">{x.name}</span>
                                            <input className="fld" style={{ width: 64, flex: 'none' }} inputMode="numeric" placeholder="N." value={x.n} onChange={(e) => setNeedN(x.name, e.target.value)} aria-label={`Numero di ${x.name}`} />
                                            <button className="dg-ghost" onClick={() => toggleNeed(x.name)} aria-label="Togli"><i className="ph ph-x"></i></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div><label className="fld-label">Dettagli (quanti ospiti, gravità, altro)</label><textarea className="fld" rows={3} style={{ height: 'auto', paddingTop: 10 }} placeholder="Es. 6 celiaci, 2 allergici alla frutta a guscio (anafilassi)" value={a.needsNote} onChange={(e) => set({ needsNote: e.target.value })} /></div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <p className="text-[14px] text-[color:var(--muted)]">Per ogni portata scegli quanti piatti vuoi e, se già li hai in mente, aggiungili: i posti che restano vuoti li sceglie l’AI.</p>
                            {others.length > 0 && (
                                <div>
                                    <label className="fld-label">Parti da un menù già salvato</label>
                                    <ChefPick value="" placeholder="Scegli un menù…" options={others.map((m) => ({ value: m.id, label: m.title || 'Menù', sub: `${m.sections.length} portate` }))} onChange={fromMenu} />
                                </div>
                            )}
                            {a.courses.map((c, i) => {
                                const free = Math.max(0, c.n - c.picks.length);
                                const row = { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, fontSize: 14 };
                                return (
                                    <div key={c.name} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, opacity: c.on ? 1 : 0.55 }}>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 flex-1 text-[15px] font-semibold"><input type="checkbox" checked={c.on} onChange={(e) => setCourse(i, { on: e.target.checked })} />{c.name}</label>
                                            {c.on && (
                                                <div className="flex items-center gap-2 text-[13px] text-[color:var(--muted)]">
                                                    <span>Piatti in tutto</span>
                                                    <input className="fld" style={{ width: 56, flex: 'none', textAlign: 'center' }} inputMode="numeric" value={c.n} onChange={(e) => setCourse(i, { n: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })} aria-label="Piatti in tutto" />
                                                </div>
                                            )}
                                        </div>
                                        {c.on && (
                                            <>
                                                {c.picks.map((rid) => (
                                                    <div key={rid} style={{ ...row, background: 'var(--soft)' }}>
                                                        <i className="ph ph-check" style={{ color: 'var(--ok)' }}></i>
                                                        <span className="flex-1">{byRid[rid]?.title}</span>
                                                        <button className="dg-ghost" onClick={() => setCourse(i, { picks: c.picks.filter((x) => x !== rid) })} aria-label="Togli"><i className="ph ph-x"></i></button>
                                                    </div>
                                                ))}
                                                {Array.from({ length: free }, (_, k) => (
                                                    <div key={'f' + k} style={{ ...row, border: '1px dashed var(--line)', color: 'var(--muted)' }}>
                                                        <i className="ph ph-magic-wand"></i><span>Lo sceglie l’AI</span>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 flex-wrap">
                                                    <div style={{ flex: 1, minWidth: 180 }}><ChefPick value="" placeholder="+ Aggiungi dal ricettario" options={suggestOpts(c)} onChange={(v) => addPick(i, v)} /></div>
                                                    {sectionOpts.length > 0 && <div style={{ flex: 1, minWidth: 180 }}><ChefPick value="" placeholder="+ Aggiungi da un menù salvato" options={sectionOpts} onChange={(v) => addSection(i, v)} /></div>}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                            <div><label className="fld-label">Altre richieste (opzionale)</label><textarea className="fld" rows={2} style={{ height: 'auto', paddingTop: 10 }} placeholder="Es. ricette leggere, dolce al cioccolato, niente fritti" value={a.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <p className="text-[14px] text-[color:var(--muted)]">{copied ? 'Prompt copiato.' : 'Copia il prompt qui sotto.'} Incollalo nella tua AI, poi incolla qui la risposta.</p>
                            {!copied && <textarea readOnly className="fld" rows={5} style={{ height: 'auto', fontSize: 12 }} value={prompt} onFocus={(e) => e.target.select()} />}
                            <textarea className="fld" rows={9} style={{ height: 'auto', paddingTop: 10 }} placeholder="Incolla qui la risposta dell'AI" value={pasted} onChange={(e) => { setPasted(e.target.value); setErr(''); }} />
                            {err && <p className="text-[13px]" style={{ color: 'var(--bad)' }}>{err}</p>}
                        </>
                    )}
                    {step === 4 && res && (
                        <>
                            <h3 className="ch-serif" style={{ fontSize: 22 }}>{res.title || a.event}</h3>
                            {res.portate.map((p) => (
                                <div key={p.name}><p className="ch-h">{p.name}</p>{p.dishes.map((d, k) => <p key={k} className="text-[14px]" style={{ color: d.ok ? 'var(--ink)' : 'var(--warn)' }}>{d.name}{d.ok ? '' : ' · non è nel ricettario'}</p>)}</div>
                            ))}
                            {res.missing.length > 0 && <p className="text-[13px] text-[color:var(--muted)]">I piatti segnati non sono nel ricettario: il menù li lascia da parte, scrivi la ricetta e aggiungili dopo.</p>}
                            <p className="ch-h">Special</p>
                            <p className="text-[14px]">{res.specials.length ? res.specials.map((s) => s.name).join(', ') : 'Nessuno'}</p>
                            <p className="ch-h">Lettera agli chef</p>
                            <textarea className="fld" rows={8} style={{ height: 'auto', paddingTop: 10 }} value={res.letter} onChange={(e) => setRes({ ...res, letter: e.target.value })} />
                        </>
                    )}
                </div>
                <div className="flex gap-2 justify-between px-5 sm:px-7 py-4 border-t border-[color:var(--line)] flex-none">
                    <button className="vw-chip" disabled={step === 0} onClick={() => setStep(step === 4 ? 3 : step - 1)}><i className="ph ph-arrow-left"></i>Indietro</button>
                    <button className="vw-next disabled:opacity-40" disabled={!canNext} onClick={next}><span>{nextLabel}</span><i className="ph ph-arrow-right"></i></button>
                </div>
            </div>
        </div>
    );
};
