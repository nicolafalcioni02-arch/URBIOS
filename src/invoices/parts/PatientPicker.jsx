import React, { useMemo, useState } from 'react';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const initials = (p) => `${(p.nome || '')[0] || ''}${(p.cognome || '')[0] || ''}`.toUpperCase() || '?';

// Scelta del paziente nell'app (al posto del <select> del browser): ricerca e, per distinguere gli omonimi,
// data di nascita, numero di visite e ultima visita.
export const PatientPicker = ({ patients, onPick }) => {
    const [q, setQ] = useState('');
    const list = useMemo(() => {
        const t = q.trim().toLowerCase();
        return [...patients]
            .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`))
            .filter((p) => !t || `${p.cognome} ${p.nome} ${p.nome} ${p.cognome} ${fmt(p.dataNascita)} ${p.dataNascita || ''}`.toLowerCase().includes(t));
    }, [patients, q]);
    return (
        <div className="mb-4">
            <div className="relative mb-2">
                    <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"></i>
                    <input className="fld" style={{ paddingLeft: 38 }} placeholder="Cerca nome, cognome o nascita" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches} />
            </div>
            <div role="listbox" aria-label="Pazienti" className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 'min(46vh, 360px)', scrollbarWidth: 'thin' }}>
                {list.length === 0 && <p className="text-[13px] text-[color:var(--muted)] text-center py-5">Nessun paziente trovato</p>}
                {patients.length > 12 && <p className="text-[12px] text-[color:var(--muted)] px-1">{q.trim() ? `${list.length} trovati` : `${patients.length} pazienti`}</p>}
                {list.map((p, i) => {
                    const letter = (p.cognome || p.nome || '?')[0].toUpperCase();
                    const head = patients.length > 20 && !q.trim() && (i === 0 || letter !== (list[i - 1].cognome || list[i - 1].nome || '?')[0].toUpperCase());
                    const n = (p.visite || []).length;
                    const last = n ? fmt(p.visite[0].data) : '';
                    const born = p.dataNascita ? `Nato/a il ${fmt(p.dataNascita)}` : '';
                    const visits = n ? `${n} ${n === 1 ? 'visita' : 'visite'}${last ? ` · ultima ${last}` : ''}` : 'Nessuna visita';
                    return (
                        <React.Fragment key={p.id}>
                        {head && <p className="text-[12px] font-semibold text-[color:var(--muted)] px-1 pt-2 sticky top-0">{letter}</p>}
                        <button type="button" role="option" className="flex items-center gap-3 text-left w-full rounded-2xl px-3 py-2.5" style={{ background: 'var(--soft)' }} onClick={() => onPick(p)}>
                            <span className="grid place-items-center shrink-0 rounded-full text-[12px] font-semibold" style={{ width: 36, height: 36, background: 'var(--surface)', color: 'var(--ink)' }}>{initials(p)}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-medium text-[color:var(--ink)] truncate">{p.cognome} {p.nome}</span>
                                {born && <span className="block text-[12px] text-[color:var(--muted)] truncate">{born}</span>}
                                <span className="block text-[12px] text-[color:var(--muted)] truncate">{visits}</span>
                            </span>
                            <i className="ph ph-caret-right text-[color:var(--muted)]"></i>
                        </button>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
