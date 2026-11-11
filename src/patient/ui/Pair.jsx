import React, { useEffect, useRef, useState } from 'react';
import { startScan } from '../scan.js';
import { AuthShell, Icon, Note } from './bits.jsx';

// Collegamento al professionista: inquadra il QR mostrato in studio, confronta il codice, conferma.
export const Pair = ({ rt, onDone }) => {
    const [mode, setMode] = useState('choose'); // choose | scan | pairing
    const [text, setText] = useState(''), [err, setErr] = useState(null), [paste, setPaste] = useState(false);
    const [ctl, setCtl] = useState(null), [view, setView] = useState({});
    const video = useRef(null), stopScan = useRef(null);

    const begin = async (qr) => {
        setErr(null);
        try { const c = await rt.beginPairing(qr.trim()); setCtl(c); setMode('pairing'); setView({ state: c.state }); }
        catch (e) { setMode('choose'); setErr('Codice non valido o scaduto. Chiedi al professionista di generarne uno nuovo.'); }
    };
    const scan = async () => {
        setErr(null); setMode('scan');
        try { stopScan.current = await startScan(video.current, (t) => begin(t)); }
        catch { setMode('choose'); setPaste(true); setErr('Non riesco ad aprire la fotocamera. Puoi incollare il codice qui sotto.'); }
    };
    useEffect(() => () => { if (stopScan.current) stopScan.current(); }, []);
    useEffect(() => {
        if (!ctl || ['done', 'failed'].includes(view.state)) return undefined;
        const t = setInterval(async () => { try { await ctl.poll(); setView({ state: ctl.state, sas: ctl.sas, error: ctl.error }); } catch { /* si riprova */ } }, 2000);
        return () => clearInterval(t);
    }, [ctl, view.state]);
    useEffect(() => { if (view.state === 'done') onDone(); }, [view.state]);
    const answer = async (ok) => { await ctl.confirmSas(ok); setView({ state: ctl.state, sas: ctl.sas, error: ctl.error }); };

    return (
        <AuthShell step={3} title="Collega il professionista">
            {mode === 'choose' && (
                <>
                    <button type="button" className="pt-cta pt-cta-qr" onClick={scan}><Icon name="qr" size={20} />Inquadra il QR</button>
                    {!paste && <button type="button" className="pt-link" onClick={() => setPaste(true)}>Incolla il codice</button>}
                    {paste && <>
                        <textarea id="qrtext" className="pt-input" aria-label="Codice" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" spellCheck="false" />
                        <button type="button" className="pt-btn ghost wide" disabled={!text.trim()} onClick={() => begin(text)}>Collega</button>
                    </>}
                    {err && <Note tone="bad">{err}</Note>}
                </>
            )}
            {mode === 'scan' && (
                <>
                    <video ref={video} className="pt-video" muted playsInline />
                    <div className="pt-btns"><button type="button" className="pt-btn ghost" onClick={() => { if (stopScan.current) stopScan.current(); setMode('choose'); }}>Annulla</button></div>
                </>
            )}
            {mode === 'pairing' && (
                <>
                    {view.state === 'waiting-record' && <Note>Mi collego al professionista…</Note>}
                    {view.state === 'confirm-sas' && (
                        <>
                            <p className="pt-auth-s">Deve essere <b>identico</b> a quello del professionista.</p>
                            <p className="pt-sas">{view.sas}</p>
                            <div className="pt-btns"><button type="button" className="pt-btn" onClick={() => answer(true)}>È identico</button>
                                <button type="button" className="pt-btn ghost" onClick={() => answer(false)}>Non coincide</button></div>
                        </>
                    )}
                    {view.state === 'waiting-peer' && <Note>Aspetto la conferma del professionista…</Note>}
                    {view.state === 'failed' && (
                        <>
                            <Note tone="bad">{view.error === 'codice non coincide' ? 'I codici non coincidevano: per sicurezza il collegamento è stato annullato.' : `Collegamento non riuscito (${view.error || 'errore'}).`}</Note>
                            <div className="pt-btns"><button type="button" className="pt-btn" onClick={() => { setCtl(null); setMode('choose'); }}>Riprova</button></div>
                        </>
                    )}
                </>
            )}
        </AuthShell>
    );
};
