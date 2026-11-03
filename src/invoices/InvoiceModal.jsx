import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCompact } from '../hooks/useCompact';
import { SERVICES, STATES, computeTotals, draftInvoice, euro, label, removeInvoice, saveInvoice, serviceRow } from './invoiceLogic';

const NOTE_SANITARIA = 'Prestazione sanitaria esente IVA ai sensi dell’art. 10, n. 18, DPR 633/72.';
const NOTE_FORFETTARIO = 'Operazione effettuata ai sensi dell’art. 1, commi 54-89, L. 190/2014 (regime forfettario).';

const Sec = ({ title, children }) => (<div className="mb-5"><span className="fld-label" style={{ display: 'block', marginBottom: 8 }}>{title}</span>{children}</div>);

// Crea o modifica una fattura di un paziente (di solito da una visita). Salvata come fotografia: vedi invoiceLogic.js
export const InvoiceModal = ({ patient, prof, visit = null, menu = null, service = null, invoice = null, onUpdateDb, onPrint, onClose }) => {
    const compact = useCompact(639);
    const [inv, setInv] = useState(() => invoice || draftInvoice(patient, prof, visit, menu, service));
    const set = (k, v) => setInv((x) => ({ ...x, [k]: v }));
    const setRow = (i, k, v) => set('righe', inv.righe.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    const t = computeTotals(inv);
    const isNew = !invoice;
    // nota di esenzione/regime: si sceglie da un elenco, il testo resta modificabile qui sotto
    const notes = [['', 'Nessuna nota'], [NOTE_SANITARIA, 'Esente IVA – prestazione sanitaria (art. 10 n. 18)'], [NOTE_FORFETTARIO, 'Regime forfettario'], ...(prof.note_fattura && ![NOTE_SANITARIA, NOTE_FORFETTARIO].includes(prof.note_fattura) ? [[prof.note_fattura, 'Nota del profilo']] : [])];
    const noteKey = notes.some(([t]) => t === (inv.note || '')) ? inv.note || '' : '__custom';

    const save = (print) => {
        const out = { ...inv, anno: Number(String(inv.data).slice(0, 4)) || inv.anno };
        saveInvoice(onUpdateDb, patient.id, out, prof, patient);
        onClose();
        if (print && onPrint) onPrint(out.id);
    };
    const del = () => {
        if (!window.confirm('Eliminare questa fattura? Il numero resterà vuoto: se serve conservarla, segnala "Annullata".')) return;
        removeInvoice(onUpdateDb, patient.id, inv.id);
        onClose();
    };

    const chip = { height: 30, fontSize: 12.5 };

    return ReactDOM.createPortal(
        <div className="sheet-back" onClick={onClose}>
            <div className="sheet" style={{ background: 'color-mix(in srgb, var(--paper) 97%, #fff)', backdropFilter: 'none', WebkitBackdropFilter: 'none', maxHeight: compact ? '94dvh' : '92vh', maxWidth: compact ? '100%' : 640, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start gap-4" style={{ padding: compact ? '16px 16px 12px' : '20px 24px 14px', borderBottom: '1px solid var(--line)' }}>
                    <div className="min-w-0">
                        <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">{isNew ? 'Nuova fattura' : `Fattura ${label(inv)}`}</h3>
                        <p className="text-[13px] text-[color:var(--muted)] mt-0.5 truncate">{patient.nome} {patient.cognome}{menu ? ` · menù «${menu.title}»` : visit ? ` · visita del ${new Date(visit.data).toLocaleDateString('it-IT')}` : ''}</p>
                    </div>
                    <button onClick={onClose} className="hs-icon" aria-label="Chiudi"><i className="ph ph-x"></i></button>
                </div>

                <div style={{ padding: compact ? '14px 16px 4px' : '18px 24px 4px', overflowY: 'auto', flex: 1 }}>
                    <Sec title="Dati">
                        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                            <div><label className="fld-label">Data</label><input type="date" className="fld" value={inv.data} onChange={(e) => set('data', e.target.value)} /></div>
                            <div><label className="fld-label">Scadenza pagamento</label><input type="date" className="fld" value={inv.scadenza || ''} onChange={(e) => set('scadenza', e.target.value)} /></div>
                            <div style={compact ? { gridColumn: '1 / -1' } : undefined}><label className="fld-label">Metodo di pagamento</label><input className="fld" placeholder="Contanti, POS, Bonifico" value={inv.metodo || ''} onChange={(e) => set('metodo', e.target.value)} /></div>
                        </div>
                    </Sec>

                    <Sec title="Prestazioni">
                        <div className="grid gap-2">
                            {!compact && <div className="grid gap-2 text-[11.5px] text-[color:var(--muted)]" style={{ gridTemplateColumns: '1fr 60px 96px 34px', padding: '0 2px' }}><span>Descrizione</span><span>Qtà</span><span>Prezzo €</span><span></span></div>}
                            {inv.righe.map((r, i) => (
                                <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: compact ? '72px 1fr 40px' : '1fr 60px 96px 34px', ...(compact && { padding: '10px 0', borderBottom: '1px solid var(--line)' }) }}>
                                    <input className="fld" style={compact ? { gridColumn: '1 / -1' } : undefined} placeholder="Descrizione" value={r.desc} onChange={(e) => setRow(i, 'desc', e.target.value)} />
                                    <input className="fld" inputMode="decimal" aria-label="Quantità" placeholder="Qtà" value={r.qta} onChange={(e) => setRow(i, 'qta', e.target.value)} />
                                    <input className="fld" inputMode="decimal" aria-label="Prezzo" placeholder="0,00" value={r.prezzo} onChange={(e) => setRow(i, 'prezzo', e.target.value)} />
                                    <button type="button" className="hs-icon" aria-label="Togli riga" title="Togli riga" disabled={inv.righe.length < 2} onClick={() => set('righe', inv.righe.filter((_, j) => j !== i))}><i className="ph ph-x"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                            <span className="text-[12px] text-[color:var(--muted)] mr-1">Aggiungi</span>
                            {SERVICES.map((s) => <button key={s.id} type="button" className="vw-chip" style={chip} onClick={() => set('righe', [...inv.righe.filter((r) => String(r.desc).trim() || r.prezzo), serviceRow(s.id, prof, visit ? new Date(visit.data).toLocaleDateString('it-IT') : '')])}>{s.label}</button>)}
                            <button type="button" className="vw-chip" style={chip} onClick={() => set('righe', [...inv.righe, { desc: '', qta: 1, prezzo: '' }])}>Altra voce</button>
                        </div>
                    </Sec>

                    <Sec title="Imposte">
                        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                            <div><label className="fld-label">IVA %</label><input className="fld" inputMode="decimal" value={inv.ivaPerc} onChange={(e) => set('ivaPerc', e.target.value)} /></div>
                            <div><label className="fld-label">Rivalsa %</label><input className="fld" inputMode="decimal" value={inv.rivalsaPerc} onChange={(e) => set('rivalsaPerc', e.target.value)} /></div>
                            <div><label className="fld-label">Bollo 2 €</label><div className="seg">{[true, false].map((b) => <button key={String(b)} type="button" className={!!inv.bollo === b ? 'on' : ''} onClick={() => set('bollo', b)}>{b ? 'Sì' : 'No'}</button>)}</div></div>
                        </div>
                    </Sec>

                    <Sec title="Incasso">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="seg">{STATES.map((s) => <button key={s.id} type="button" className={inv.stato === s.id ? 'on' : ''} onClick={() => set('stato', s.id)}>{s.label}</button>)}</div>
                            {inv.stato === 'pagata' && <div style={{ minWidth: 170 }}><label className="fld-label">Incassata il</label><input type="date" className="fld" value={inv.dataPag || inv.data} onChange={(e) => set('dataPag', e.target.value)} /></div>}
                        </div>
                    </Sec>

                    <Sec title="Note">
                        <select className="fld mb-2" value={noteKey} onChange={(e) => e.target.value !== '__custom' && set('note', e.target.value)} aria-label="Nota di esenzione o regime">
                            {notes.map(([t, l]) => <option key={l} value={t}>{l}</option>)}
                            {noteKey === '__custom' && <option value="__custom">Testo personalizzato</option>}
                        </select>
                        <textarea className="fld" rows={2} placeholder="Testo che compare in fondo alla fattura" value={inv.note || ''} onChange={(e) => set('note', e.target.value)} />
                    </Sec>
                </div>

                <div style={{ padding: compact ? '12px 16px calc(14px + env(safe-area-inset-bottom))' : '14px 24px 18px', borderTop: '1px solid var(--line)' }}>
                    <div className="flex justify-between items-baseline mb-3 text-[color:var(--ink)]">
                        <span className="text-[12.5px] text-[color:var(--muted)]">Imponibile {euro(t.imponibile)}{t.rivalsa ? ` · rivalsa ${euro(t.rivalsa)}` : ''}{t.iva ? ` · IVA ${euro(t.iva)}` : ''}{t.bollo ? ' · bollo 2 €' : ''}</span>
                        <span className="flex items-baseline gap-2"><span className="text-[12px] text-[color:var(--muted)]">Totale</span><b className="text-[22px] tracking-[-0.01em]">{euro(t.totale)}</b></span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {!isNew && <button type="button" onClick={del} className="hs-icon is-danger" aria-label="Elimina fattura" title="Elimina"><i className="ph ph-trash"></i></button>}
                        <button type="button" onClick={() => save(false)} className="vw-chip justify-center flex-1" style={{ height: 46 }}>Salva</button>
                        <button type="button" onClick={() => save(true)} className="vw-next flex-1 justify-center" style={{ height: 46, whiteSpace: 'nowrap', paddingInline: 12 }}><i className="ph ph-printer"></i><span>Salva e stampa</span></button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
