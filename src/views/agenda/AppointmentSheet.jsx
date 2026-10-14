// Scheda per creare/modificare un appuntamento. Durate, luoghi e politica di cancellazione arrivano dalle
// impostazioni del professionista (le stesse del contratto).
import React, { useEffect, useMemo, useState } from 'react';
import { TIPI, STATI, defaultDur, conflictsWith, outsideHours, apptTitle, startOf, tipoOf, fmtTime } from '../../components/agenda/agendaLogic';

const DURS = [15, 30, 45, 60, 90];

export const AppointmentSheet = ({ draft, isNew, db, settings, items, onSave, onDelete, onClose, onOpenPatient }) => {
    const [a, setA] = useState(draft);
    const [day, time] = a.start.split('T');
    const set = (patch) => setA((x) => ({ ...x, ...patch }));
    const patients = (db && db.pazienti) || [];

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const clash = useMemo(() => conflictsWith(items, a, a.id), [items, a]);
    const off = useMemo(() => outsideHours(settings, a), [settings, a]);
    const lateCancel = a.stato === 'annullato' && startOf(a).getTime() - Date.now() < 24 * 3600000 && startOf(a).getTime() > Date.now();
    const places = settings.places.length ? settings.places : [];
    const placeOptions = [...places, 'Online'];

    const pickTipo = (tipo) => {
        // cambiando tipo si riprende la durata standard delle impostazioni, ma solo se non è stata cambiata a mano
        const wasStd = a.dur === defaultDur(a.tipo, settings);
        set({ tipo, ...(wasStd ? { dur: defaultDur(tipo, settings) } : {}) });
    };

    return (
        <div className="ag-back" onPointerDown={onClose}>
            <form
                className="ag-sheet"
                onPointerDown={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave({ ...a, titolo: a.pid ? '' : a.titolo.trim() });
                }}
            >
                <div className="ag-sheet-head">
                    <h3>{isNew ? 'Nuovo appuntamento' : 'Appuntamento'}</h3>
                    <button type="button" className="ag-icon" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x" />
                    </button>
                </div>

                <label className="fld-label">Paziente</label>
                <select className="fld" value={a.pid} onChange={(e) => set({ pid: e.target.value })}>
                    <option value="">Nessuno (appuntamento libero)</option>
                    {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nome} {p.cognome}
                        </option>
                    ))}
                </select>
                {!a.pid && <input className="fld mt-2" value={a.titolo} onChange={(e) => set({ titolo: e.target.value })} placeholder="Titolo (es. Riunione, Corso…)" />}

                <label className="fld-label mt-4">Tipo</label>
                <div className="seg">
                    {TIPI.map((t) => (
                        <button type="button" key={t.id} className={a.tipo === t.id ? 'on' : ''} onClick={() => pickTipo(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                        <label className="fld-label">Data</label>
                        <input type="date" className="fld" value={day} onChange={(e) => e.target.value && set({ start: `${e.target.value}T${time}` })} required />
                    </div>
                    <div>
                        <label className="fld-label">Ora</label>
                        <input type="time" step={900} className="fld" value={time} onChange={(e) => e.target.value && set({ start: `${day}T${e.target.value}` })} required />
                    </div>
                </div>

                <label className="fld-label mt-4">
                    Durata <span className="opacity-60">· fino alle {fmtTime((parseInt(time, 10) * 60 + parseInt(time.split(':')[1], 10) + a.dur) % 1440)}</span>
                </label>
                <div className="ag-chips">
                    {[...new Set([...DURS, settings.durFirst, settings.durCheck])]
                        .sort((x, y) => x - y)
                        .map((d) => (
                            <button type="button" key={d} className={a.dur === d ? 'on' : ''} onClick={() => set({ dur: d })}>
                                {d}'
                                {d === settings.durFirst && a.tipo !== 'prima' ? <small> 1ª</small> : null}
                                {d === settings.durCheck && d !== settings.durFirst && a.tipo !== 'controllo' ? <small> ctrl</small> : null}
                            </button>
                        ))}
                    <input type="number" min={5} max={480} step={5} className="ag-dur" value={a.dur} onChange={(e) => set({ dur: Math.max(5, Number(e.target.value) || 30) })} aria-label="Durata in minuti" />
                </div>

                <label className="fld-label mt-4">Luogo</label>
                <select className="fld" value={placeOptions.includes(a.luogo) ? a.luogo : a.luogo ? '__altro' : ''} onChange={(e) => set({ luogo: e.target.value === '__altro' ? a.luogo || ' ' : e.target.value })}>
                    <option value="">Non indicato</option>
                    {placeOptions.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                    <option value="__altro">Altro…</option>
                </select>
                {a.luogo && !placeOptions.includes(a.luogo) && <input className="fld mt-2" value={a.luogo.trim() === '' ? '' : a.luogo} onChange={(e) => set({ luogo: e.target.value || ' ' })} placeholder="Indirizzo o luogo" />}
                {!places.length && <p className="ag-hint">Aggiungi l’indirizzo dello studio in Impostazioni → Dati professionali: comparirà qui.</p>}

                <label className="fld-label mt-4">Note</label>
                <textarea className="fld" rows={2} style={{ height: 'auto', padding: 12 }} value={a.note} onChange={(e) => set({ note: e.target.value })} placeholder="Cosa preparare, cosa portare…" />

                {!isNew && (
                    <>
                        <label className="fld-label mt-4">Stato</label>
                        <div className="ag-chips">
                            {STATI.map((s) => (
                                <button type="button" key={s.id} className={a.stato === s.id ? 'on' : ''} onClick={() => set({ stato: s.id })}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {(clash.length > 0 || off || lateCancel || settings.policy) && (
                    <div className="ag-notes">
                        {clash.length > 0 && (
                            <p className="warn">
                                <i className="ph-fill ph-warning" /> Si sovrappone a: {clash.map((c) => `${apptTitle(db, c)} (${c.start.split('T')[1]})`).join(', ')}
                            </p>
                        )}
                        {off && (
                            <p className="warn">
                                <i className="ph-fill ph-clock-countdown" /> Fuori dalla tua disponibilità{settings.hoursText ? ` (${settings.hoursText.replace(/\s*\n\s*/g, ' · ')})` : ''}.
                            </p>
                        )}
                        {lateCancel && (
                            <p className="warn">
                                <i className="ph-fill ph-receipt" /> Disdetta con meno di 24 ore: valuta la politica di cancellazione.
                            </p>
                        )}
                        {settings.policy && (a.stato === 'annullato' || a.stato === 'assente') && (
                            <p>
                                <i className="ph ph-info" /> Politica di cancellazione: {settings.policy}
                            </p>
                        )}
                    </div>
                )}

                <div className="ag-sheet-actions">
                    {!isNew && (
                        <button type="button" className="ag-danger" onClick={() => onDelete(a.id)}>
                            <i className="ph ph-trash" /> Elimina
                        </button>
                    )}
                    {a.pid && (
                        <button type="button" className="ag-ghost" onClick={() => onOpenPatient(a.pid)}>
                            <i className="ph ph-folder-open" /> Apri scheda
                        </button>
                    )}
                    <span style={{ flex: 1 }} />
                    <button type="submit" className="vw-next" style={{ height: 44 }}>
                        <i className="ph-bold ph-check" /> <span>Salva</span>
                    </button>
                </div>
                <p className="ag-hint" style={{ textAlign: 'right', marginTop: 8 }}>
                    {tipoOf(a.tipo).label}
                    {settings.fee ? ` · compenso da lettera d’incarico: ${settings.fee}` : ''}
                </p>
            </form>
        </div>
    );
};
