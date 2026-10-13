import React, { useMemo, useState } from 'react';
import { cloneWeeks, isBlankPlan, summarize } from '../logic/trainingModel';
import { fmtLong } from '../../shared/planCommon';
import { bookEntryFrom, goalShort, levelShort, schedaFromBook, schedaTitle } from './trainingGuidedLogic';

// Libro delle schede: i programmi già fatti, da riusare. Vale per tutti i pazienti.
// Da una voce si crea una nuova scheda per il paziente in uso, oppure si aggiungono le sue settimane alla scheda aperta.

export const BookModal = ({ patient, header, weeks, book, setBook, setWeeks, loadScheda, onClose }) => {
    const [q, setQ] = useState('');
    const [name, setName] = useState(header.titolo || '');
    const [note, setNote] = useState('');
    const [openId, setOpenId] = useState(null);
    const [renameId, setRenameId] = useState(null);
    const [renameVal, setRenameVal] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);
    const [saved, setSaved] = useState('');

    const hasPlan = !isBlankPlan(weeks);
    const existing = book.find((e) => e.name.toLowerCase() === name.trim().toLowerCase());
    const list = useMemo(() => book.filter((e) => !q.trim() || `${e.name} ${e.note}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt))), [book, q]);

    const save = () => {
        const entry = bookEntryFrom({ id: existing?.id, name: name.trim() || schedaTitle(header), note, header, weeks });
        setBook((prev) => (existing ? prev.map((e) => (e.id === existing.id ? entry : e)) : [entry, ...prev]));
        setSaved(existing ? `«${entry.name}» aggiornata nel libro.` : `«${entry.name}» salvata nel libro.`);
        setNote('');
    };

    return (
        <div className="dg-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-books text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-semibold leading-tight">Libro delle schede</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)]">{book.length} {book.length === 1 ? 'scheda salvata' : 'schede salvate'}</p>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    <section className="dg-card !mt-0">
                        <p className="dg-q">Salva la scheda in uso nel libro</p>
                        {!hasPlan ? (
                            <p className="text-[13.5px] text-[color:var(--muted)]">La scheda è ancora vuota: aggiungi degli esercizi e poi potrai salvarla.</p>
                        ) : (
                            <>
                                <input className="fld" placeholder="Nome (es. Full body principianti, Upper/Lower 4 giorni)" value={name} onChange={(e) => { setName(e.target.value); setSaved(''); }} />
                                <input className="fld mt-2" placeholder="Nota facoltativa (per chi è adatta, come usarla)" value={note} onChange={(e) => setNote(e.target.value)} />
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    <button className="vw-next" onClick={save} disabled={!name.trim()} style={!name.trim() ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
                                        <i className="ph ph-bookmark-simple"></i> {existing ? `Aggiorna «${existing.name}»` : 'Salva nel libro'}
                                    </button>
                                    {saved && <span className="text-[13.5px]" style={{ color: '#1F6B49' }}><i className="ph ph-check-circle"></i> {saved}</span>}
                                </div>
                                <p className="dg-hint">Si salvano settimane, sedute, esercizi e serie. Il nome del paziente e i suoi massimali non vengono tenuti.</p>
                            </>
                        )}
                    </section>

                    {book.length > 0 && <input className="fld mt-5" placeholder="Cerca nel libro…" value={q} onChange={(e) => setQ(e.target.value)} />}
                    {book.length === 0 && (
                        <div className="text-center py-10">
                            <div className="mx-auto w-14 h-14 rounded-full grid place-items-center text-2xl" style={{ background: 'var(--soft)' }}>
                                <i className="ph ph-books"></i>
                            </div>
                            <p className="dg-h !text-[20px] mt-4">Il libro è vuoto</p>
                            <p className="dg-sub">Salva qui le schede già fatte: la prossima volta le ritrovi e le riusi in un clic.</p>
                        </div>
                    )}

                    {list.map((e) => {
                        const m = summarize({ weeks: e.weeks });
                        const day = e.weeks[0]?.days[0];
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
                                                    if (renameVal.trim()) setBook((prev) => prev.map((x) => (x.id === e.id ? { ...x, name: renameVal.trim() } : x)));
                                                    setRenameId(null);
                                                }}
                                                onKeyDown={(ev) => ev.key === 'Enter' && ev.currentTarget.blur()}
                                            />
                                        ) : (
                                            <p className="text-[16px] font-semibold break-words">{e.name}</p>
                                        )}
                                        <p className="text-[12.5px] text-[color:var(--muted)]">
                                            {[goalShort(e.tipo), levelShort(e.livello)].filter(Boolean).join(' · ')}
                                            {e.tipo || e.livello ? ' · ' : ''}
                                            {m.weeks} sett. · {m.days} sedute · salvata il {fmtLong(e.savedAt)}
                                        </p>
                                        {e.note && <p className="text-[13px] mt-1">{e.note}</p>}
                                    </div>
                                    <button className="dg-ghost" aria-label="Rinomina" onClick={() => { setRenameId(e.id); setRenameVal(e.name); }}>
                                        <i className="ph ph-pencil-simple"></i>
                                    </button>
                                    {confirmDel === e.id ? (
                                        <button className="dg-link" style={{ color: '#C2413A' }} onClick={() => { setBook((prev) => prev.filter((x) => x.id !== e.id)); setConfirmDel(null); }}>
                                            Elimina
                                        </button>
                                    ) : (
                                        <button className="dg-ghost" aria-label="Elimina dal libro" onClick={() => setConfirmDel(e.id)}>
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap mt-3">
                                    <button className="vw-next !h-10 !min-w-0" onClick={() => { loadScheda(schedaFromBook(e, patient)); onClose(); }}>
                                        Usa come nuova scheda
                                    </button>
                                    <button className="dg-chip row" onClick={() => { setWeeks((w) => [...w, ...cloneWeeks(e.weeks)]); onClose(); }}>
                                        <i className="ph ph-plus"></i> Aggiungi le settimane a questa scheda
                                    </button>
                                    <button className="dg-chip row" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
                                        <i className={`ph ${openId === e.id ? 'ph-caret-up' : 'ph-eye'}`}></i> Anteprima
                                    </button>
                                </div>
                                {openId === e.id && day && (
                                    <div className="mt-3 p-3 rounded-2xl text-[13px] leading-relaxed dg-in" style={{ background: '#FBFAF8' }}>
                                        {e.weeks[0].days.map((d) => (
                                            <p key={d.id}>
                                                <b>{d.title || 'Seduta'}:</b> {d.exercises.filter((x) => x.name).map((x) => `${x.name} (${x.sets.filter((s) => s.tipo !== 'riscaldamento').length}×)`).join(', ') || '—'}
                                            </p>
                                        ))}
                                        {e.weeks.length > 1 && <p className="text-[color:var(--muted)] mt-1">…e altre {e.weeks.length - 1} settimane.</p>}
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
