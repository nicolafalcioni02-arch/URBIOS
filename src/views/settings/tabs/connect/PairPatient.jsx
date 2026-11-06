import React, { useEffect, useState } from 'react';
import { Btn, Select, Note } from '../../ui/kit';
import { QrView } from './QrView';
import { diary } from '../../../../connect/help/diary';

// Collega un paziente: QR da mostrare in studio → codice di verifica uguale sui due schermi → conferma.
// `api` = connectManager.api() (pairing). Al successo chiama onLinked(idPazienteLocale, codiceAnonimo).
export const PairPatient = ({ api, patients, onLinked, onClose }) => {
    const [sel, setSel] = useState(patients[0] ? patients[0].id : '');
    const [ctl, setCtl] = useState(null);
    const [view, setView] = useState({ state: 'idle' });
    const [err, setErr] = useState(null);
    const [copied, setCopied] = useState(false);
    const qrText = ctl ? new TextDecoder().decode(ctl.qr) : '';
    const copy = async () => { try { await navigator.clipboard.writeText(qrText); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); } };

    const LBL = { 'waiting-patient': 'QR mostrato, in attesa che il paziente lo inquadri', 'confirm-sas': 'codice di verifica mostrato: confrontarlo con il telefono', 'waiting-peer': 'confermato da te, in attesa del paziente', done: 'collegamento riuscito', failed: 'collegamento NON riuscito' };
    const sync = (c) => { setView((v) => { if (v.state !== c.state && LBL[c.state]) diary.record('pairing', LBL[c.state] + (c.state === 'failed' && c.error ? ': ' + c.error : '')); return { state: c.state, sas: c.sas, error: c.error }; }); };
    const start = async () => {
        setErr(null);
        try { const c = await api.pairing.start(); setCtl(c); sync(c); } catch (e) { setErr(e.message || 'errore'); }
    };
    // controlla ogni 2 secondi le risposte del paziente
    useEffect(() => {
        if (!ctl || ['done', 'failed'].includes(view.state)) return undefined;
        const t = setInterval(async () => { try { await ctl.poll(); sync(ctl); } catch { /* rete: si riprova */ } }, 2000);
        return () => clearInterval(t);
    }, [ctl, view.state]);
    useEffect(() => { if (view.state === 'done' && ctl) onLinked(sel, ctl.patientId); }, [view.state]);
    useEffect(() => () => { if (ctl) ctl.cancel(); }, [ctl]);

    const answer = async (ok) => { await ctl.confirmSas(ok); sync(ctl); };

    return (
        <div className="mt-3">
            {view.state === 'idle' && (
                <>
                    <label className="block max-w-sm mb-3">
                        <span className="fld-label">Paziente da collegare</span>
                        <Select value={sel} onChange={setSel} options={patients.map((p) => ({ value: p.id, label: `${p.cognome || ''} ${p.nome || ''}`.trim() || p.id }))} />
                    </label>
                    <p className="st-hint mb-3">Il paziente deve essere con te: mostra il codice, lui lo inquadra con l'app. Il suo nome non viene mai inviato.</p>
                    <div className="st-btns">
                        <Btn icon="link" disabled={!sel} onClick={start}>Genera il codice QR</Btn>
                        <Btn variant="ghost" onClick={onClose}>Chiudi</Btn>
                    </div>
                </>
            )}
            {view.state === 'waiting-patient' && (
                <>
                    <QrView bytes={ctl.qr} />
                    <p className="st-hint my-3">Il paziente apre l'app URBIOS e inquadra il codice. Vale 2 minuti e una sola volta.</p>
                    <p className="st-hint mb-2">Se la fotocamera non funziona, il paziente può incollare questo codice nell'app. Vale come il QR: non mandarlo a nessuno, mostralo solo a lui.</p>
                    <div className="st-btns mb-3">
                        <Btn variant="ghost" icon="link" onClick={copy}>{copied ? 'Copiato' : 'Copia il codice'}</Btn>
                        <Btn variant="ghost" onClick={() => { ctl.cancel(); setCtl(null); setView({ state: 'idle' }); }}>Annulla</Btn>
                    </div>
                    <details><summary className="st-hint">Mostra il codice</summary><textarea readOnly rows={4} value={qrText} onFocus={(e) => e.target.select()} style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 12 }} /></details>
                </>
            )}
            {view.state === 'confirm-sas' && (
                <>
                    <p className="st-hint">Questo codice deve essere identico a quello che vedi sul telefono del paziente:</p>
                    <p className="st-sas">{view.sas}</p>
                    <div className="st-btns">
                        <Btn icon="check" onClick={() => answer(true)}>È identico</Btn>
                        <Btn variant="ghost" onClick={() => answer(false)}>Non coincide</Btn>
                    </div>
                </>
            )}
            {view.state === 'waiting-peer' && <Note title="In attesa">Aspetto la conferma del paziente sul suo telefono…</Note>}
            {view.state === 'done' && <Note tone="ok" title="Paziente collegato">Da ora puoi inviargli diete e schede, cifrate.</Note>}
            {view.state === 'failed' && (
                <>
                    <Note tone="bad" title="Collegamento non riuscito">{view.error === 'codice non coincide' ? 'I codici non coincidevano: per sicurezza il collegamento è stato annullato.' : `Motivo: ${view.error || 'sconosciuto'}.`}</Note>
                    <div className="st-btns mt-3"><Btn onClick={() => { setCtl(null); setView({ state: 'idle' }); }}>Riprova</Btn><Btn variant="ghost" onClick={onClose}>Chiudi</Btn></div>
                </>
            )}
            {err && <Note tone="bad">{err}</Note>}
        </div>
    );
};
