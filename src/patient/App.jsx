import React, { useEffect, useReducer, useRef, useState } from 'react';
import { idbKv } from '../connect/persist/kv.js';
import { hasVault, createPatientVault, unlockPatientVault, startPatient } from './runtime.js';
import { Welcome } from './ui/Welcome.jsx';
import { Consent } from './ui/Consent.jsx';
import { Passphrase } from './ui/Passphrase.jsx';
import { Pair } from './ui/Pair.jsx';
import { Shell } from './ui/Shell.jsx';
import { createDemoRuntime } from './demo.js';
import { Note, Backdrop } from './ui/bits.jsx';

const kv = idbKv('urbios-patient');
const IDLE_MS = 5 * 60 * 1000;

// Blocco per inattività: si azzera SOLO con azioni dell'utente (non con sincronizzazioni o timer) e si ricontrolla al ritorno in primo piano.
const useIdleLock = (active, onLock) => {
    useEffect(() => {
        if (!active) return undefined;
        let last = Date.now();
        const bump = () => { last = Date.now(); };
        const check = () => { if (Date.now() - last >= IDLE_MS) onLock(); };
        const evs = ['pointerdown', 'keydown', 'touchstart'];
        evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
        const iv = setInterval(check, 5000);
        const vis = () => { if (document.visibilityState === 'visible') check(); };
        document.addEventListener('visibilitychange', vis);
        return () => { evs.forEach((e) => window.removeEventListener(e, bump)); clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
    }, [active]);
};

export default function App() {
    const [stage, setStage] = useState('boot'); // boot | consent | setup | unlock | main | forgotten
    const [view, setView] = useState({ name: 'home' });
    const [rt, setRt] = useState(null);
    const [consent, setConsent] = useState(null);
    const [, bump] = useReducer((x) => x + 1, 0);
    const rtRef = useRef(null);

    useEffect(() => { hasVault(kv).then((v) => setStage(v ? 'unlock' : 'welcome')).catch(() => setStage('consent')); }, []);
    const open = async (master, c) => {
        const r = await startPatient({ master, kv, consent: c, onChange: bump });
        rtRef.current = r; setRt(r); setView({ name: 'home' }); setStage('main');
        r.sync();
    };
    const lock = () => { if (stage === 'demo') { setRt(null); setStage('welcome'); return; } if (rtRef.current) rtRef.current.stop(); rtRef.current = null; setRt(null); setStage('unlock'); };
    useIdleLock(stage === 'main', lock);
    // SOLO sviluppo: salta accesso e collegamento con dati finti (import.meta.env.DEV è falso nella versione pubblicata)
    const skip = () => { setRt(createDemoRuntime({ onChange: bump })); setView({ name: 'home' }); setStage('demo'); };

    if (stage === 'boot') return <div className="pt-app" />;
    const showSkip = import.meta.env.DEV && ['welcome', 'consent', 'setup', 'unlock'].includes(stage);
    return (
        <main className="pt-app">
            <Backdrop />
            {stage === 'demo' && rt && <><Shell rt={rt} onRefresh={() => {}} onReconnect={() => {}} onLock={lock} onForget={lock} /></>}
            {stage === 'welcome' && <Welcome onStart={() => setStage('consent')} />}
            {stage === 'consent' && <Consent onContinue={(c) => { setConsent(c); setStage('setup'); }} />}
            {stage === 'setup' && <Passphrase mode="setup" onSubmit={async (p) => { const v = await createPatientVault(kv, p, consent); await open(v.master, v.consent); }} />}
            {stage === 'unlock' && <Passphrase mode="unlock" onSubmit={async (p) => open(await unlockPatientVault(kv, p))}
                onForgot={() => setView({ name: 'forgot' })} />}
            {stage === 'unlock' && view.name === 'forgot' && (
                <Note tone="warn">Senza la passphrase i dati non si possono recuperare. Puoi cancellare questa app e ricollegarti al professionista, che ti invierà di nuovo i piani.
                    <div className="pt-btns"><button type="button" className="pt-btn danger" onClick={async () => { for (const k of ['vault', 'identity', 'state', 'anchor']) await kv.delete(k); setView({ name: 'home' }); setStage('welcome'); }}>Cancella e ricomincia</button></div></Note>
            )}
            {stage === 'main' && rt && ((!rt.status().linked && rt.docs.list().length === 0) || view.name === 'pair' ? <Pair rt={rt} onDone={() => { setView({ name: 'home' }); bump(); }} /> : (
                <Shell rt={rt} onRefresh={() => rt.sync().then(bump)} onReconnect={() => setView({ name: 'pair' })} onLock={lock} onForget={async () => { await rt.forgetAll(); rtRef.current = null; setRt(null); setStage('welcome'); }} />
            ))}
            {showSkip && <button type="button" className="pt-skip" onClick={skip}>Salta (solo prova)</button>}
        </main>
    );
}
