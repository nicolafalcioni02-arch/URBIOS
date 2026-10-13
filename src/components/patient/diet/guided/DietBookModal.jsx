import React, { useMemo, useState } from 'react';
import { bookEntryFrom, fmtLong, makeIndependentVisit, planFromBookEntry, planName, planTitle, refitDays } from './guidedLogic';

// Libro delle diete: le diete già fatte, da riusare. Si salva il piano in uso, e da una voce si può
// creare un nuovo piano (ricalcolato su questo paziente) oppure aggiungere i giorni al piano in uso.

export const DietBookModal = ({ patient, visitaAttiva, calcData, targets, dietDays, dietBook, setDietBook, setDietDays, setSelectedVisitaId, onUpdateDb, onClose }) => {
    const [q, setQ] = useState('');
    const [name, setName] = useState(planName(visitaAttiva) || '');
    const [note, setNote] = useState('');
    const [openId, setOpenId] = useState(null);
    const [renameId, setRenameId] = useState(null);
    const [renameVal, setRenameVal] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);
    const [saved, setSaved] = useState('');

    const hasPlan = dietDays.some((d) => d.meals.some((m) => m.items.length));
    const existing = dietBook.find((e) => e.name.toLowerCase() === name.trim().toLowerCase());
    const list = useMemo(() => dietBook.filter((e) => !q.trim() || `${e.name} ${e.note}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))), [dietBook, q]);

    const save = () => {
        const entry = bookEntryFrom({ id: existing?.id, name: name.trim() || planTitle(visitaAttiva), note, calcData, targets, dietDays, visit: visitaAttiva });
        setDietBook((prev) => (existing ? prev.map((e) => (e.id === existing.id ? entry : e)) : [entry, ...prev]));
        setSaved(existing ? `«${entry.name}» aggiornata nel libro.` : `«${entry.name}» salvata nel libro.`);
        setNote('');
    };

    const useAsNew = (e) => {
        const { calc, targets: t, days } = planFromBookEntry(e, calcData);
        const v = makeIndependentVisit({ calcData: calc, dateIso: undefined, noDate: false, targets: t, dietDays: days, savedReports: [] });
        v.dettagli = { ...v.dettagli, diet_meta: { ...v.dettagli.diet_meta, name: e.name }, diet_supplements: e.supplements || [], diet_notes: e.advice || [] };
        onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: [v, ...(p.visite || [])] } : p)) }));
        setSelectedVisitaId(v.id);
        onClose();
    };

    const addDays = (e) => {
        setDietDays((d) => [...d, ...refitDays(e.plan, calcData.distribution)]);
        onClose();
    };

    return (
        <div className="dg-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-books text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-semibold leading-tight">Libro delle diete</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)]">{dietBook.length} {dietBook.length === 1 ? 'dieta salvata' : 'diete salvate'}</p>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    {/* salva il piano in uso */}
                    <section className="dg-card !mt-0">
                        <p className="dg-q">Salva il piano in uso nel libro</p>
                        {!hasPlan ? (
                            <p className="text-[13.5px] text-[color:var(--muted)]">Il piano è ancora vuoto: aggiungi degli alimenti e poi potrai salvarlo.</p>
                        ) : (
                            <>
                                <input className="fld" placeholder="Nome (es. Ipocalorica 1600, Vegetariana, Definizione)" value={name} onChange={(e) => { setName(e.target.value); setSaved(''); }} />
                                <input className="fld mt-2" placeholder="Nota facoltativa (per chi è adatta, come usarla)" value={note} onChange={(e) => setNote(e.target.value)} />
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    <button className="vw-next" onClick={save} disabled={!name.trim()} style={!name.trim() ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
                                        <i className="ph ph-bookmark-simple"></i> {existing ? `Aggiorna «${existing.name}»` : 'Salva nel libro'}
                                    </button>
                                    {saved && <span className="text-[13.5px]" style={{ color: '#1F6B49' }}><i className="ph ph-check-circle"></i> {saved}</span>}
                                </div>
                                <p className="dg-hint">Si salvano giorni, pasti, alimenti, alternative, integratori e consigli. I dati del paziente (peso, età) non vengono tenuti: quando riusi la dieta si ricalcolano.</p>
                            </>
                        )}
                    </section>

                    {/* elenco */}
                    {dietBook.length > 0 && <input className="fld mt-5" placeholder="Cerca nel libro…" value={q} onChange={(e) => setQ(e.target.value)} />}
                    {dietBook.length === 0 && (
                        <div className="text-center py-10">
                            <div className="mx-auto w-14 h-14 rounded-full grid place-items-center text-2xl" style={{ background: 'var(--soft)' }}>
                                <i className="ph ph-books"></i>
                            </div>
                            <p className="dg-h !text-[20px] mt-4">Il libro è vuoto</p>
                            <p className="dg-sub">Salva qui le diete già fatte: la prossima volta le ritrovi e le riusi in un clic.</p>
                        </div>
                    )}
                    {list.map((e) => {
                        const meals = e.plan[0]?.meals || [];
                        return (
                            <div key={e.id} className="dg-card !mt-3 !p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        {renameId === e.id ? (
                                            <input
                                                autoFocus
                                                className="fld"
                                                value={renameVal}
                                                onChange={(ev) => setRenameVal(ev.target.value)}
                                                onBlur={() => {
                                                    if (renameVal.trim()) setDietBook((prev) => prev.map((x) => (x.id === e.id ? { ...x, name: renameVal.trim() } : x)));
                                                    setRenameId(null);
                                                }}
                                                onKeyDown={(ev) => ev.key === 'Enter' && ev.currentTarget.blur()}
                                            />
                                        ) : (
                                            <p className="text-[16px] font-semibold break-words">{e.name}</p>
                                        )}
                                        <p className="text-[12.5px] text-[color:var(--muted)]">
                                            {e.plan.length} {e.plan.length === 1 ? 'giorno' : 'giorni'}
                                            {e.kcal ? ` · ${e.kcal} kcal` : ''} · salvata il {fmtLong(e.savedAt)}
                                        </p>
                                        {e.note && <p className="text-[13px] mt-1">{e.note}</p>}
                                    </div>
                                    <button className="dg-ghost" aria-label="Rinomina" onClick={() => { setRenameId(e.id); setRenameVal(e.name); }}>
                                        <i className="ph ph-pencil-simple"></i>
                                    </button>
                                    {confirmDel === e.id ? (
                                        <button className="dg-link" style={{ color: '#C2413A' }} onClick={() => { setDietBook((prev) => prev.filter((x) => x.id !== e.id)); setConfirmDel(null); }}>
                                            Elimina
                                        </button>
                                    ) : (
                                        <button className="dg-ghost" aria-label="Elimina dal libro" onClick={() => setConfirmDel(e.id)}>
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap mt-3">
                                    <button className="vw-next !h-10 !min-w-0" onClick={() => useAsNew(e)}>
                                        Usa come nuovo piano
                                    </button>
                                    <button className="dg-chip row" onClick={() => addDays(e)}>
                                        <i className="ph ph-plus"></i> Aggiungi i giorni al piano in uso
                                    </button>
                                    <button className="dg-chip row" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
                                        <i className={`ph ${openId === e.id ? 'ph-caret-up' : 'ph-eye'}`}></i> Anteprima
                                    </button>
                                </div>
                                {openId === e.id && (
                                    <div className="mt-3 p-3 rounded-2xl text-[13px] leading-relaxed dg-in" style={{ background: '#FBFAF8' }}>
                                        <p className="font-semibold mb-1">{e.plan[0]?.title}</p>
                                        {meals.map((m) => (
                                            <p key={m.id}>
                                                <b>{m.title}:</b> {m.items.length ? m.items.map((i) => `${i.name} ${i.weight} g`).join(', ') : '—'}
                                            </p>
                                        ))}
                                        {e.plan.length > 1 && <p className="text-[color:var(--muted)] mt-1">…e altri {e.plan.length - 1} {e.plan.length - 1 === 1 ? 'giorno' : 'giorni'}.</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
