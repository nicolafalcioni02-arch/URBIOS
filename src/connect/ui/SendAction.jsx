import React, { useEffect, useState, useSyncExternalStore } from 'react';
import './sendToPatient.css';
import { connectManager } from '../manager';
import { diary } from '../help/diary';
import { dietToDocument } from '../documents/dietDoc';
import { trainingToDocument } from '../documents/trainingDoc';
import { buildPut, buildWithdraw, forbiddenTermsOf } from '../documents/outgoing';
import { summarizeSets } from '../../components/patient/training/logic/trainingModel';

// Passo «Invio» della finestra «Invia all'app paziente»: invia il piano aperto, mostra lo STATO di ciò che il paziente
// vede nell'app (in attesa / ricevuto / ritirato / non consegnato) e permette di ritirare. Mai nome né dati clinici.
// `source` = piano aperto: dieta { visit }, training { id, scheda }. Ogni invio è una nuova versione dello stesso documento.
const keyOf = (kind, source) => (kind === 'diet' ? 'diet:' + (source && source.visit && source.visit.id) : 'training:' + (source && source.id));
const dateOf = (v) => String(v.data || v.date || '').slice(0, 10);
const labelOf = (patient, key) => {
    const [k, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    if (k === 'diet') { const v = (patient.visite || []).find((x) => x.id === id); return v ? 'Dieta · visita del ' + (dateOf(v) || '—') : 'Dieta'; }
    const s = ((patient.allenamento && patient.allenamento.schede) || []).find((x) => x.id === id);
    return (s && s.titolo) || 'Scheda di allenamento';
};
// stato di un documento in base alla coda in uscita del collegamento
export const stateOf = (link, info) => {
    const gone = link.ritirato === link.rev;
    if (link.ref && info && info.failedRefs.includes(link.ref)) return { id: 'fail', text: gone ? 'Ritiro non consegnato' : 'Non consegnato: riprova più tardi' };
    if (link.ref && info && info.pendingRefs.includes(link.ref)) return { id: 'wait', text: gone ? 'Ritiro in attesa di consegna' : 'In attesa di consegna' };
    return gone ? { id: 'gone', text: 'Ritirato: il paziente non lo vede' } : { id: 'ok', text: `Il paziente lo vede · versione ${link.rev}` };
};

export const SendAction = ({ patient, kind, source, status, onUpdateDb }) => {
    const st = useSyncExternalStore(connectManager.subscribe, connectManager.getState);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [, tick] = useState(0);
    useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 2500); return () => clearInterval(t); }, []);
    const conn = patient.connessione;
    const api = st.status === 'on' ? connectManager.api() : null;
    const key = keyOf(kind, source);
    const docs = (conn && conn.documenti) || {};
    const prev = docs[key];
    const gone = !!prev && prev.ritirato === prev.rev;
    const info = api && conn ? api.peers.list().find((p) => p.pid === conn.pid) : null;

    const setLink = (k, link) => onUpdateDb((d) => ({ ...d, pazienti: (d.pazienti || []).map((x) => x.id !== patient.id ? x : { ...x, connessione: { ...x.connessione, documenti: { ...(x.connessione.documenti || {}), [k]: link } } }) }));
    const toDoc = () => (kind === 'diet'
        ? dietToDocument({ days: source.visit.dettagli.diet_plan_data || [], targets: source.visit.dettagli.diet_targets })
        : trainingToDocument({ scheda: source.scheda, summarizeSets }));

    const send = async () => {
        setBusy(true); setMsg(null);
        try {
            const { msg: m, link } = buildPut({ doc: toDoc(), link: prev, forbidden: forbiddenTermsOf(patient), maxBytes: api.cfg.maxPayloadBytes });
            await api.peers.sendDocument(conn.pid, m);
            setLink(key, link);
            diary.record('invio', `${kind === 'diet' ? 'dieta' : 'scheda'} versione ${link.rev} accodata`);
        } catch (e) { setMsg(e && e.message ? e.message : 'Invio non riuscito.'); diary.record('errore', 'invio: ' + (e && e.message ? e.message : 'non riuscito')); }
        setBusy(false);
    };
    const withdraw = async (k) => {
        const link = docs[k];
        setBusy(true); setMsg(null);
        try {
            const w = buildWithdraw({ link, maxBytes: api.cfg.maxPayloadBytes });
            await api.peers.sendDocument(conn.pid, w);
            setLink(k, { ...link, ritirato: link.rev, ref: w.ref });
            diary.record('ritiro', 'ritiro accodato');
        } catch (e) { setMsg(e && e.message ? e.message : 'Ritiro non riuscito.'); diary.record('errore', 'ritiro: ' + (e && e.message ? e.message : 'non riuscito')); }
        setBusy(false);
    };

    const sameKind = Object.keys(docs).filter((k) => k.startsWith(kind === 'diet' ? 'diet:' : 'training:'));
    const title = busy ? 'Invio…' : gone ? 'Invia di nuovo all\'app' : status === 'delivery' ? 'Invia aggiornamento all\'app' : 'Invia all\'app';
    const noun = kind === 'diet' ? 'diete' : 'schede';
    return (
        <div className="sp-cell">
            <button type="button" className="dg-action sp-tile" disabled={busy || !api} onClick={send}>
                <i className="ph ph-paper-plane-tilt"></i>
                <span className="flex-1 text-left"><b>{title}</b><small>Cifrato, senza nome né dati clinici.</small></span>
            </button>
            {msg && <p className="sp-err" role="alert">{msg}</p>}
            <section className="sp-list" aria-label={`Cosa vede il paziente nell'app`}>
                <h4>Cosa vede il paziente nell'app</h4>
                {sameKind.length === 0 && <p className="sp-empty">Nessuna {kind === 'diet' ? 'dieta' : 'scheda'} inviata finora.</p>}
                {sameKind.map((k) => {
                    const s = stateOf(docs[k], info);
                    return (
                        <div key={k} className={'sp-row' + (k === key ? ' is-cur' : '')}>
                            <span className="sp-name">{labelOf(patient, k)}{k === key && <em> (aperta ora)</em>}</span>
                            <span className={'sp-chip is-' + s.id}>{s.text}</span>
                            {docs[k].ritirato !== docs[k].rev && <button type="button" className="sp-link" disabled={busy} onClick={() => withdraw(k)}>Ritira</button>}
                        </div>
                    );
                })}
                {sameKind.length > 0 && <p className="sp-note">Le {noun} compaiono nell'app del paziente quando la apre. «In attesa» = non ancora confermata dal telefono.</p>}
            </section>
        </div>
    );
};
