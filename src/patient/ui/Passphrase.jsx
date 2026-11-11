import React, { useState } from 'react';
import { AuthShell, Icon, Note } from './bits.jsx';

// mode 'setup' (crea) | 'unlock' (sblocca). onSubmit(passphrase) può lanciare: l'errore si mostra qui.
export const Passphrase = ({ mode, onSubmit, onForgot }) => {
    const [p1, setP1] = useState(''), [p2, setP2] = useState(''), [err, setErr] = useState(null), [busy, setBusy] = useState(false), [show, setShow] = useState(false);
    const setup = mode === 'setup';
    const submit = async (e) => {
        e.preventDefault(); setErr(null);
        if (setup && p1.length < 12) return setErr('Usa almeno 12 caratteri: una frase facile da ricordare funziona meglio di una parola complicata.');
        if (setup && p1 !== p2) return setErr('Le due frasi non coincidono.');
        setBusy(true);
        try { await onSubmit(p1); } catch (x) { setErr(x.message === 'WRONG_SECRET' ? 'Passphrase non corretta.' : 'Errore: ' + x.message); setBusy(false); }
    };
    const eye = <button type="button" className="pt-pw-e" aria-label={show ? 'Nascondi' : 'Mostra'} onClick={() => setShow(!show)}><Icon name={show ? 'eyeoff' : 'eye'} size={22} /></button>;
    const ty = show ? 'text' : 'password', bad = !setup && err === 'Passphrase non corretta.';
    return (
        <AuthShell big={!setup} step={setup ? 2 : 0} title={setup ? 'Scegli la tua passphrase' : ''} sub={setup ? <span className="pt-warn-s"><Icon name="warn" size={18} />Se la perdi non si può recuperare.</span> : null}>
        <form onSubmit={submit} className="pt-auth-f">
            {setup && <label className="pt-label" htmlFor="p1">Passphrase</label>}
            <div className={'pt-pw' + (bad ? ' is-bad' : '')}>
                <input id="p1" className="pt-input" type={ty} placeholder={setup ? undefined : 'Passphrase'} aria-label={setup ? undefined : 'Passphrase'} autoComplete={setup ? 'new-password' : 'current-password'} value={p1} onChange={(e) => setP1(e.target.value)} />{eye}
            </div>
            {setup && <div className="pt-pwm" role="img" aria-label={`${Math.min(p1.length, 12)} di 12 caratteri`}>{Array.from({ length: 12 }, (_, i) => <i key={i} className={i < p1.length ? 'on' : ''} />)}</div>}
            {setup && (<><label className="pt-label" htmlFor="p2">Ripeti la passphrase</label>
                <div className="pt-pw"><input id="p2" className="pt-input" type={ty} autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} />{eye}</div></>)}
            {err && <Note tone="bad">{err}</Note>}
            <button type="submit" className="pt-cta" disabled={busy || !p1}>{busy ? 'Attendi…' : setup ? 'Continua' : 'Accedi'}</button>
            {!setup && onForgot && <button type="button" className="pt-link" onClick={onForgot}>Ho dimenticato la passphrase</button>}
        </form>
        </AuthShell>
    );
};
