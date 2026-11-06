import React, { useState } from 'react';
import { AuthShell, Note } from './bits.jsx';

// mode 'setup' (crea) | 'unlock' (sblocca). onSubmit(passphrase) può lanciare: l'errore si mostra qui.
export const Passphrase = ({ mode, onSubmit, onForgot }) => {
    const [p1, setP1] = useState(''), [p2, setP2] = useState(''), [err, setErr] = useState(null), [busy, setBusy] = useState(false);
    const setup = mode === 'setup';
    const submit = async (e) => {
        e.preventDefault(); setErr(null);
        if (setup && p1.length < 12) return setErr('Usa almeno 12 caratteri: una frase facile da ricordare funziona meglio di una parola complicata.');
        if (setup && p1 !== p2) return setErr('Le due frasi non coincidono.');
        setBusy(true);
        try { await onSubmit(p1); } catch (x) { setErr(x.message === 'WRONG_SECRET' ? 'Passphrase non corretta.' : 'Errore: ' + x.message); setBusy(false); }
    };
    return (
        <AuthShell big={!setup} step={setup ? 2 : 0} title={setup ? 'Scegli la tua passphrase' : 'Ciao'} sub={setup ? 'Se la perdi non si può recuperare.' : null}>
        <form onSubmit={submit} className="pt-auth-f">
            <label className="pt-label" htmlFor="p1">{setup ? 'Passphrase (almeno 12 caratteri)' : 'Passphrase'}</label>
            <input id="p1" className="pt-input" type="password" autoComplete={setup ? 'new-password' : 'current-password'} value={p1} onChange={(e) => setP1(e.target.value)} />
            {setup && (<><label className="pt-label" htmlFor="p2">Ripeti la passphrase</label>
                <input id="p2" className="pt-input" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></>)}
            {err && <Note tone="bad">{err}</Note>}
            <button type="submit" className="pt-cta" disabled={busy || !p1}>{busy ? 'Attendi…' : setup ? 'Continua' : 'Accedi'}</button>
            {!setup && onForgot && <button type="button" className="pt-link" onClick={onForgot}>Ho dimenticato la passphrase</button>}
        </form>
        </AuthShell>
    );
};
