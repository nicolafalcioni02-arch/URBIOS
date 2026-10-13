import React, { useEffect, useRef, useState } from 'react';
import { ShaderCanvas } from '../../components/visuals/ShaderCanvas';
import { useArchive } from '../../storage/ArchiveProvider';
import { readFileAsText } from '../../storage/fileIO';
import { ALLOW_DEMO_ENTRY } from '../../config';

const errText = (e) =>
    ({
        WRONG_SECRET: 'Password o codice non corretti.',
        CORRUPTED: 'Il file è danneggiato o è stato modificato: non è possibile aprirlo.',
        NOT_URBIOS: 'Questo file non è un archivio URBIOS.',
        TOO_NEW: 'Il file è stato creato con una versione più recente di URBIOS.',
        NO_CRYPTO: 'Questo browser non permette la cifratura (apri URBIOS da un browser aggiornato).',
        NOT_ENCRYPTED: "L'archivio non è cifrato: non serve il codice di recupero.",
    }[e && e.message] || 'Errore imprevisto: ' + ((e && e.message) || e));

const Card = ({ children }) => <div className="start-card rise">{children}</div>;

const Btn = ({ children, onClick, variant = 'dark', disabled, className = '' }) => (
    <button onClick={onClick} disabled={disabled} className={`${variant === 'dark' ? 'vw-next' : 'vw-back'} w-full disabled:opacity-50 disabled:pointer-events-none ${className}`} style={{ minWidth: 0 }}>
        {children}
    </button>
);

const Field = ({ label, ...props }) => (
    <label className="block mb-3">
        <span className="fld-label">{label}</span>
        <input {...props} className="fld" />
    </label>
);

export const StartScreen = () => {
    const a = useArchive();
    const fileInput = useRef(null);
    const [mode, setMode] = useState('home'); // home | new | secret | recover
    const [source, setSource] = useState(null); // { kind:'file', text, name } | { kind:'working' }
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [canvasSize, setCanvasSize] = useState(300);
    const heroRef = useRef(null);

    // form
    const [encrypt, setEncrypt] = useState(true);
    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        // la sfera sta sempre nello schermo, con spazio sotto per le azioni
        const resize = () => setCanvasSize(Math.round(Math.max(190, Math.min(window.innerWidth * 0.74, window.innerHeight * 0.36, 340))));
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // la sfera segue appena il puntatore (solo con mouse: sul touch resta ferma)
    useEffect(() => {
        const el = heroRef.current;
        if (!el || !window.matchMedia('(pointer: fine)').matches) return undefined;
        const move = (e) => {
            el.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
            el.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
    }, []);

    // se la sessione è "bloccata" si va direttamente alla richiesta password
    useEffect(() => {
        if (a.status === 'locked') {
            setSource({ kind: 'working' });
            setMode('secret');
        }
    }, [a.status]);

    const go = (m) => {
        setMode(m);
        setError('');
        setPwd('');
        setPwd2('');
        setSecret('');
        setCode('');
    };

    const run = async (fn) => {
        setBusy(true);
        setError('');
        try {
            await fn();
        } catch (e) {
            setError(errText(e));
        }
        setBusy(false);
    };

    // ---- azioni ----
    const onFile = (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        run(async () => {
            const text = await readFileAsText(file);
            const res = await a.openFileText(text, file.name);
            if (res.needsSecret) {
                setSource({ kind: 'file', text, name: file.name });
                go('secret');
            }
        });
    };

    const onResume = () =>
        run(async () => {
            const res = await a.resumeWorking();
            if (res.needsSecret) {
                setSource({ kind: 'working' });
                go('secret');
            }
        });

    const onCreate = () => {
        if (encrypt) {
            if (pwd.length < 8) return setError('La password deve avere almeno 8 caratteri.');
            if (pwd !== pwd2) return setError('Le due password non coincidono.');
        }
        run(() => a.createArchive({ encrypt, password: pwd }));
    };

    const onSecret = () =>
        run(async () => {
            if (!secret) throw new Error('WRONG_SECRET');
            if (source.kind === 'file') await a.openFileText(source.text, source.name, secret);
            else await a.resumeWorking(secret);
        });

    const onRecover = () => {
        if (pwd.length < 8) return setError('La nuova password deve avere almeno 8 caratteri.');
        if (pwd !== pwd2) return setError('Le due password non coincidono.');
        run(async () => {
            if (source.kind === 'file') await a.recoverFromText(source.text, source.name, code, pwd);
            else await a.recoverWorking(code, pwd);
        });
    };

    // ---- viste ----
    const Err = () => (error ? <p className="text-[13px] mb-3" style={{ color: 'var(--bad)' }}>{error}</p> : null);

    let body;
    if (mode === 'home') {
        const r = a.resumeInfo;
        body = (
            <div className="start-actions">
                <input type="file" ref={fileInput} onChange={onFile} accept=".json,application/json" className="hidden" />
                {r && (
                    <button className="start-primary rise" onClick={onResume} disabled={busy}>
                        <span className="min-w-0 text-left">
                            <span className="start-title">Riprendi il lavoro</span>
                            <span className="start-sub">
                                {r.encrypted ? 'Protetto da password · ' : ''}ultima modifica {new Date(r.savedAt).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}
                                {r.dirty ? ' · non ancora salvato nel file' : ''}
                            </span>
                        </span>
                        <i className="ph-bold ph-arrow-right"></i>
                    </button>
                )}
                <button className={r ? 'start-row rise' : 'start-primary rise'} style={{ animationDelay: '.06s' }} onClick={() => fileInput.current.click()} disabled={busy}>
                    <i className="ph ph-folder-open start-ico"></i>
                    <span className="min-w-0 text-left flex-1">
                        <span className="start-title">Apri il mio archivio</span>
                        <span className="start-sub">Scegli il file .json che hai salvato</span>
                    </span>
                    <i className="ph ph-arrow-right start-go"></i>
                </button>
                <button className="start-row rise" style={{ animationDelay: '.12s' }} onClick={() => go('new')}>
                    <i className="ph ph-plus-circle start-ico"></i>
                    <span className="min-w-0 text-left flex-1">
                        <span className="start-title">Inizia da zero</span>
                        <span className="start-sub">Crea un nuovo archivio, con password se vuoi</span>
                    </span>
                    <i className="ph ph-arrow-right start-go"></i>
                </button>
                {a.legacyFound && (
                    <button className="start-link" onClick={() => run(a.importLegacy)} disabled={busy}>
                        Recupera i dati della versione precedente
                    </button>
                )}
                {ALLOW_DEMO_ENTRY && (
                    <button onClick={a.enterDemo} className="start-link">
                        Entra in modalità demo
                    </button>
                )}
                <Err />
            </div>
        );
    } else if (mode === 'new') {
        body = (
            <Card>
                <h3 className="text-lg font-bold mb-1">Nuovo archivio</h3>
                <p className="text-xs text-gray-500 mb-4">I dati restano solo su questo dispositivo, dentro un file che gestisci tu.</p>
                <label className={`flex items-start gap-3 p-3 rounded-xl border mb-4 ${a.cryptoAvailable ? 'cursor-pointer' : 'opacity-50'} ${encrypt ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <input type="checkbox" className="mt-1" checked={encrypt && a.cryptoAvailable} disabled={!a.cryptoAvailable} onChange={(e) => setEncrypt(e.target.checked)} />
                    <span className="text-sm">
                        <strong>Proteggi con password (cifratura)</strong>
                        <span className="block text-xs text-gray-500 mt-0.5">Consigliato. Il file è illeggibile senza password. Se la perdi servirà il codice di recupero.</span>
                    </span>
                </label>
                {encrypt && a.cryptoAvailable && (
                    <>
                        <Field label="Password (min. 8 caratteri)" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
                        <Field label="Ripeti la password" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
                    </>
                )}
                {!encrypt && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">Senza password chiunque abbia il file può leggerlo. Potrai attivare la cifratura più tardi dalle Impostazioni.</p>}
                <Err />
                <Btn onClick={onCreate} disabled={busy}>
                    {busy ? 'Creazione…' : 'Crea archivio'}
                </Btn>
                <button onClick={() => go('home')} className="w-full text-xs text-gray-500 mt-3">
                    ← Indietro
                </button>
            </Card>
        );
    } else if (mode === 'secret') {
        body = (
            <Card>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <i className="ph-fill ph-lock-key"></i> Archivio protetto
                </h3>
                <p className="text-xs text-gray-500 mb-4">{source && source.kind === 'file' ? source.name : 'Inserisci la password per riprendere il lavoro.'}</p>
                <Field label="Password" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoFocus autoComplete="current-password" onKeyDown={(e) => e.key === 'Enter' && onSecret()} />
                <Err />
                <Btn onClick={onSecret} disabled={busy}>
                    {busy ? 'Apertura…' : 'Apri'}
                </Btn>
                <button onClick={() => go('recover')} className="w-full text-xs text-gray-500 underline mt-3">
                    Ho dimenticato la password
                </button>
                {a.status !== 'locked' && (
                    <button onClick={() => go('home')} className="w-full text-xs text-gray-500 mt-2">
                        ← Indietro
                    </button>
                )}
            </Card>
        );
    } else if (mode === 'recover') {
        body = (
            <Card>
                <h3 className="text-lg font-bold mb-1">Recupero con codice</h3>
                <p className="text-xs text-gray-500 mb-4">Inserisci il codice di recupero ricevuto alla creazione dell'archivio e scegli una nuova password.</p>
                <Field label="Codice di recupero" value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" autoComplete="off" autoCapitalize="characters" />
                <Field label="Nuova password (min. 8 caratteri)" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
                <Field label="Ripeti la nuova password" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
                <Err />
                <Btn onClick={onRecover} disabled={busy}>
                    {busy ? 'Recupero…' : 'Recupera e imposta password'}
                </Btn>
                <button onClick={() => go('secret')} className="w-full text-xs text-gray-500 mt-3">
                    ← Indietro
                </button>
            </Card>
        );
    }

    const small = mode !== 'home';
    return (
        <div className="start-wrap">
            {/* La sfera e' il centro della schermata: il saluto sta DENTRO, le azioni sotto. Nelle schermate con campi si rimpicciolisce. */}
            <div className="start-hero-box" style={{ height: small ? Math.round(canvasSize * 0.34) : canvasSize }}>
                <div ref={heroRef} className="start-hero" style={{ width: canvasSize, height: canvasSize, transform: `translate(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 8px)) scale(${small ? 0.34 : 1})` }}>
                    <div className="start-float">
                        <ShaderCanvas size={canvasSize} className="rounded-full" />
                    </div>
                    <h1 className="start-hello" style={{ fontSize: canvasSize * 0.27, opacity: small ? 0 : 1 }}>
                        Hello
                    </h1>
                </div>
            </div>
            <p className="start-brand">U R B I O S</p>
            <div className="start-body">{body}</div>
            <p className="start-foot">I dati restano solo su questo dispositivo</p>
        </div>
    );
};
