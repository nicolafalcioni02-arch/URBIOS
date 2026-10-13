import React, { useState } from 'react';
import { useArchive } from '../../../storage/ArchiveProvider';

const errText = (e) =>
    e && e.message === 'WRONG_SECRET'
        ? 'Password non corretta.'
        : e && e.message === 'NO_CRYPTO'
          ? 'Questo browser non supporta la cifratura.'
          : 'Errore: ' + ((e && e.message) || e);

const Section = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4">
        <h4 className="text-xs font-bold text-gray-700 mb-3">{title}</h4>
        {children}
    </div>
);

const Input = ({ label, ...props }) => (
    <label className="block mb-3">
        <span className="block text-xs font-bold text-gray-500 mb-1">{label}</span>
        <input {...props} className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white" />
    </label>
);

const Btn = ({ children, danger, ...props }) => (
    <button
        {...props}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${danger ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-black text-white hover:bg-gray-900'}`}
    >
        {children}
    </button>
);

export const SecurityTab = ({ tab, onClose }) => {
    const a = useArchive();
    const [open, setOpen] = useState(null); // enable | change | recovery | disable
    const [p0, setP0] = useState('');
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);

    if (tab !== 'sicurezza') return null;

    const reset = (which) => {
        setOpen(which);
        setP0('');
        setP1('');
        setP2('');
        setMsg('');
    };

    const run = async (fn, okMsg) => {
        setBusy(true);
        setMsg('');
        try {
            await fn();
            if (okMsg) setMsg(okMsg);
            setOpen(null);
        } catch (e) {
            setMsg(errText(e));
        }
        setBusy(false);
    };

    const newPwdCheck = () => {
        if (p1.length < 8) return 'La password deve avere almeno 8 caratteri.';
        if (p1 !== p2) return 'Le due password non coincidono.';
        return null;
    };

    const when = a.lastSavedAt ? new Date(a.lastSavedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <div className="max-w-3xl mx-auto fade-enter pb-20">
            <h3 className="text-3xl font-[Helvetica] font-bold mb-1">Sicurezza & Archivio</h3>
            <p className="text-sm text-gray-500 mb-6">I dati restano solo su questo dispositivo. Il tuo file archivio è la copia che conta.</p>

            <Section title="Salvataggio">
                <p className="text-sm text-gray-700 mb-3">
                    {a.dirty ? (
                        <span className="text-red-600 font-bold">Ci sono modifiche non salvate nel file.</span>
                    ) : (
                        <span>Tutto salvato{when ? ` (alle ${when})` : ''}.</span>
                    )}{' '}
                    Il browser tiene una copia di lavoro solo per non perdere nulla se aggiorni la pagina;{' '}
                    <strong>il file va scaricato/salvato a ogni sessione</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Btn
                        disabled={busy}
                        onClick={() =>
                            run(async () => {
                                await a.saveFile();
                            })
                        }
                    >
                        Salva archivio ora
                    </Btn>
                    <Btn
                        danger
                        onClick={() => {
                            onClose();
                            a.openExitDialog();
                        }}
                    >
                        Esci e cancella dal browser…
                    </Btn>
                </div>
            </Section>

            <Section title="Cifratura">
                <p className="text-sm text-gray-700 mb-3">
                    Stato:{' '}
                    {a.encrypted ? (
                        <strong className="text-green-700">
                            <i className="ph-fill ph-lock-key"></i> archivio cifrato con password
                        </strong>
                    ) : (
                        <strong className="text-amber-700">non cifrato (chi ha il file può leggerlo)</strong>
                    )}
                </p>

                {!a.encrypted && open !== 'enable' && (
                    <Btn onClick={() => reset('enable')} disabled={!a.cryptoAvailable}>
                        Attiva la cifratura
                    </Btn>
                )}
                {!a.cryptoAvailable && <p className="text-xs text-red-600 mt-2">Questo browser non supporta la cifratura.</p>}
                {!a.encrypted && open === 'enable' && (
                    <div>
                        <Input
                            label="Nuova password (min. 8 caratteri)"
                            type="password"
                            value={p1}
                            onChange={(e) => setP1(e.target.value)}
                            autoComplete="new-password"
                        />
                        <Input label="Ripeti la password" type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />
                        <div className="flex gap-2">
                            <Btn
                                disabled={busy}
                                onClick={() => {
                                    const er = newPwdCheck();
                                    if (er) return setMsg(er);
                                    run(() => a.enableEncryption(p1));
                                }}
                            >
                                Attiva
                            </Btn>
                            <Btn danger onClick={() => setOpen(null)}>
                                Annulla
                            </Btn>
                        </div>
                    </div>
                )}

                {a.encrypted && (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Btn onClick={() => reset('change')}>Cambia password</Btn>
                            <Btn onClick={() => reset('recovery')}>Nuovo codice di recupero</Btn>
                            <Btn onClick={() => a.lock()}>Blocca ora</Btn>
                            <Btn danger onClick={() => reset('disable')}>
                                Disattiva cifratura
                            </Btn>
                        </div>
                        {open === 'change' && (
                            <div className="pt-3">
                                <Input
                                    label="Password attuale"
                                    type="password"
                                    value={p0}
                                    onChange={(e) => setP0(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <Input
                                    label="Nuova password (min. 8 caratteri)"
                                    type="password"
                                    value={p1}
                                    onChange={(e) => setP1(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <Input
                                    label="Ripeti la nuova password"
                                    type="password"
                                    value={p2}
                                    onChange={(e) => setP2(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <Btn
                                    disabled={busy}
                                    onClick={() => {
                                        const er = newPwdCheck();
                                        if (er) return setMsg(er);
                                        run(() => a.changePassword(p0, p1), 'Password cambiata. Salva il file per rendere effettiva la modifica.');
                                    }}
                                >
                                    Conferma
                                </Btn>
                            </div>
                        )}
                        {open === 'recovery' && (
                            <div className="pt-3">
                                <p className="text-xs text-gray-600 mb-2">
                                    Genera un nuovo codice: <strong>il vecchio smette di funzionare</strong>.
                                </p>
                                <Input
                                    label="Password attuale"
                                    type="password"
                                    value={p0}
                                    onChange={(e) => setP0(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <Btn disabled={busy} onClick={() => run(() => a.regenerateRecoveryCode(p0))}>
                                    Genera nuovo codice
                                </Btn>
                            </div>
                        )}
                        {open === 'disable' && (
                            <div className="pt-3">
                                <p className="text-xs text-red-600 mb-2">Il file diventerà leggibile da chiunque lo possieda.</p>
                                <Input
                                    label="Password attuale"
                                    type="password"
                                    value={p0}
                                    onChange={(e) => setP0(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <Btn
                                    danger
                                    disabled={busy}
                                    onClick={() =>
                                        run(() => a.disableEncryption(p0), 'Cifratura disattivata. Salva il file per rendere effettiva la modifica.')
                                    }
                                >
                                    Disattiva
                                </Btn>
                            </div>
                        )}
                    </div>
                )}
                {msg && <p className={`text-sm mt-3 ${/non|errore|coincid|almeno/i.test(msg) ? 'text-red-600' : 'text-green-700'}`}>{msg}</p>}
            </Section>

            <Section title="Come funziona">
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                    <li>Nessun dato esce da questo dispositivo: non esistono server né account online.</li>
                    <li>Se aggiorni o chiudi la pagina con modifiche non salvate, il browser ti avvisa. Il file va salvato a ogni sessione.</li>
                    <li>
                        Con "Esci" il file viene salvato e i dati vengono <strong>cancellati dal browser</strong>: nulla resta su questo computer.
                    </li>
                    <li>Per cambiare computer porta con te il file (e la password); sul vecchio computer usa "Esci".</li>
                    <li>
                        Senza password <em>e</em> senza codice di recupero un archivio cifrato non è recuperabile da nessuno.
                    </li>
                </ul>
            </Section>
        </div>
    );
};
