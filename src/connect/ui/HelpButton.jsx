import React, { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import './help.css';
import { useArchive } from '../../storage/ArchiveProvider';
import { connectManager } from '../manager';
import { diary } from '../help/diary';
import { buildHelpPrompt, buildUpdate } from '../help/prompt';
import { stateOf } from './SendAction';

// «Ho bisogno di aiuto»: prepara un testo da incollare a un'AI di fiducia, che poi guida passo passo. L'AI non vede lo schermo:
// «vede» il diario ANONIMO delle azioni fatte qui (help/diary.js) e lo stato attuale, che si riincollano con «Copia aggiornamento».
const hostOf = (u) => { try { return new URL(u).host; } catch { return null; } };

const collect = ({ db, patient, encrypted }) => {
    const st = connectManager.getState();
    const api = st.status === 'on' ? connectManager.api() : null;
    const cur = (db && db.connect) || {};
    const url = cur.relayUrl || '';
    const info = api && patient && patient.connessione ? api.peers.list().find((p) => p.pid === patient.connessione.pid) : null;
    const docs = patient && patient.connessione && patient.connessione.documenti ? Object.entries(patient.connessione.documenti).map(([k, l]) => ({ tipo: k.startsWith('diet:') ? 'dieta' : 'scheda', stato: stateOf(l, info).text })) : [];
    return {
        modo: cur.mode === 'online' ? 'online' : 'offline', stato: st.status, errore: st.error ? String(st.error).slice(0, 160) : null, codice: st.code || null,
        archivioCifrato: !!encrypted,
        trasporto: !url ? null : url.startsWith('wss://') ? `broker MQTT (${hostOf(url) || '?'})` : `relay HTTP (${hostOf(url) || '?'})`,
        informativa: db ? !!(cur.accettato && cur.accettato.versione) : null,
        pazienteCollegato: patient ? !!info : null,
        inUscita: info ? info.queued : null, falliti: info ? info.failed : null, documenti: docs,
    };
};

export const HelpButton = ({ db, patient, className = '' }) => {
    const a = useArchive();
    useSyncExternalStore(connectManager.subscribe, connectManager.getState);
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState('');
    const [show, setShow] = useState(false);
    const last = useRef(0);
    const text = open ? buildHelpPrompt({ snapshot: collect({ db, patient, encrypted: a.encrypted }), entries: diary.all() }) : '';

    const copy = async (kind) => {
        const snapshot = collect({ db, patient, encrypted: a.encrypted });
        const out = kind === 'full' ? buildHelpPrompt({ snapshot, entries: diary.all() }) : buildUpdate({ snapshot, entries: diary.since(last.current) });
        try { await navigator.clipboard.writeText(out); setCopied(kind); diary.record('aiuto', kind === 'full' ? 'prompt copiato' : 'aggiornamento copiato'); last.current = diary.last(); setTimeout(() => setCopied(''), 2500); } catch { setCopied('err'); }
    };
    return (
        <>
            <button type="button" className={'hp-btn ' + className} onClick={() => { diary.record('aiuto', 'finestra aperta'); setOpen(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8" /><path d="M12 17h.01" /></svg>
                Ho bisogno di aiuto
            </button>
            {open && createPortal(
                <div className="hp-ov" role="dialog" aria-modal="true" aria-label="Ho bisogno di aiuto" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
                    <div className="hp-card">
                        <header className="hp-head"><h3>Ho bisogno di aiuto</h3><button type="button" className="hp-x" aria-label="Chiudi" onClick={() => setOpen(false)}>×</button></header>
                        <div className="hp-body">
                            <p>Ti preparo un testo da incollare in un'AI di tua fiducia (per esempio Claude o ChatGPT): lì dentro ci sono le regole per guidarti <b>un passo alla volta</b>, come funziona la connessione e a che punto sei.</p>
                            <ol className="hp-how">
                                <li>Premi <b>Copia il prompt</b> e incollalo nella chat con l'AI.</li>
                                <li>Segui il passo che ti indica, qui in URBIOS.</li>
                                <li>Torna qui, premi <b>Copia aggiornamento</b> e incollalo all'AI: così «vede» che cosa hai fatto (le tue azioni e lo stato) e ti dice il passo dopo.</li>
                            </ol>
                            <p className="hp-warn">L'AI <b>non vede il tuo schermo</b>: conosce solo ciò che incolli. Il testo non contiene nomi, password, chiavi né il contenuto del QR, ma lo stai condividendo con un servizio esterno: controllalo prima di incollare, e non scrivere mai all'AI dati dei pazienti.</p>
                            <div className="hp-btns">
                                <button type="button" className="hp-main" onClick={() => copy('full')}>{copied === 'full' ? 'Copiato' : 'Copia il prompt'}</button>
                                <button type="button" className="hp-sec" onClick={() => copy('update')}>{copied === 'update' ? 'Copiato' : 'Copia aggiornamento'}</button>
                            </div>
                            {copied === 'err' && <p className="hp-err">Non riesco a copiare in automatico: apri «Mostra il testo» e copialo a mano.</p>}
                            <button type="button" className="hp-link" onClick={() => setShow((s) => !s)}>{show ? 'Nascondi il testo' : 'Mostra il testo che condividi'}</button>
                            {show && <textarea className="hp-text" readOnly value={text} onFocus={(e) => e.target.select()} />}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
};
