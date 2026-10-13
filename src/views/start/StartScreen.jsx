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

const Card = ({ children }) => <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-left">{children}</div>;

const Btn = ({ children, onClick, variant = 'dark', disabled, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-6 py-3.5 rounded-full text-sm font-medium tracking-wide transition-all disabled:opacity-50 ${
            variant === 'dark' ? 'bg-black text-white shadow-xl hover:bg-gray-900' : 'bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white'
        } ${className}`}
    >
        {children}
    </button>
);

const Field = ({ label, ...props }) => (
    <label className="block mb-3">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</span>
        <input {...props} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black bg-white" />
    </label>
);

export const StartScreen = () => {
    const a = useArchive();
    const fileInput = useRef(null);
    const [mode, setMode] = useState('home'); // home | new | secret | recover
    const [source, setSource] = useState(null); // { kind:'file', text, name } | { kind:'working' }
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [canvasSize, setCanvasSize] = useState(500);

    // form
    const [encrypt, setEncrypt] = useState(true);
    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        const resize = () => setCanvasSize(Math.min(window.innerWidth, window.innerHeight) * 0.7);
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
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
    const Err = () => (error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null);

    let body;
    if (mode === 'home') {
        const r = a.resumeInfo;
        body = (
            <div className="space-y-3 flex flex-col items-center w-full max-w-xs">
                {r && (
                    <div className="w-full bg-white/90 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-lg">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            {r.encrypted && <i className="ph-fill ph-lock-key"></i>} Lavoro in corso su questo browser
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 mb-3">
                            Ultima modifica: {new Date(r.savedAt).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}
                            {r.dirty ? ' · non ancora salvato nel file' : ''}
                        </p>
                        <Btn onClick={onResume} disabled={busy}>
                            Riprendi
                        </Btn>
                    </div>
                )}
                <input type="file" ref={fileInput} onChange={onFile} accept=".json,application/json" className="hidden" />
                <Btn onClick={() => fileInput.current.click()} disabled={busy} variant={r ? 'light' : 'dark'}>
                    Apri archivio (.json)
                </Btn>
                <Btn variant="light" onClick={() => go('new')}>
                    Nuovo archivio
                </Btn>
                {a.legacyFound && (
                    <Btn variant="light" onClick={() => run(a.importLegacy)} disabled={busy}>
                        Recupera i dati della versione precedente
                    </Btn>
                )}
                {ALLOW_DEMO_ENTRY && (
                    <button onClick={a.enterDemo} className="text-xs text-gray-500 underline pt-1">
                        Entra (Demo, solo sviluppo)
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

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-white overflow-hidden py-8 px-4">
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <ShaderCanvas size={canvasSize} className="rounded-full" />
            </div>
            <div className="relative z-10 text-center flex flex-col items-center w-full">
                <h1 className="font-['Times'] font-extrabold text-7xl md:text-[10rem] leading-none tracking-tighter text-black mix-blend-overlay select-none">Hello</h1>
                <h2 className="text-black/60 text-xs font-bold tracking-[0.4em] uppercase mb-8 mt-4">U R B I O S</h2>
                {body}
            </div>
            <div className="absolute bottom-4 text-black/30 text-[10px] uppercase tracking-widest text-center px-4">&copy; 2026 URBIOS · dati solo su questo dispositivo</div>
        </div>
    );
};
