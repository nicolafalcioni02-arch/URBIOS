import React, { useState } from 'react';
import { useArchive } from '../../../../storage/ArchiveProvider';
import { Page, Group, Btn, Field, Status, Note } from '../../ui/kit';

const errText = (e) =>
    e && e.message === 'WRONG_SECRET' ? 'Password non corretta.' : e && e.message === 'NO_CRYPTO' ? 'Questo browser non supporta la cifratura.' : 'Errore: ' + ((e && e.message) || e);

const Pwd = ({ label, value, onChange, auto = 'new-password' }) => (
    <Field className="max-w-sm mb-3" label={label} type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} />
);

// Salvataggio del file archivio e cifratura con password
export const SecurityTab = ({ onClose }) => {
    const a = useArchive();
    const [open, setOpen] = useState(null); // enable | change | recovery | disable
    const [p0, setP0] = useState('');
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [msg, setMsg] = useState(null); // { text, bad }
    const [busy, setBusy] = useState(false);

    const reset = (which) => {
        setOpen(which);
        setP0('');
        setP1('');
        setP2('');
        setMsg(null);
    };
    const run = async (fn, okMsg) => {
        setBusy(true);
        setMsg(null);
        try {
            await fn();
            if (okMsg) setMsg({ text: okMsg });
            setOpen(null);
        } catch (e) {
            setMsg({ text: errText(e), bad: true });
        }
        setBusy(false);
    };
    const checkNew = () => (p1.length < 8 ? 'La password deve avere almeno 8 caratteri.' : p1 !== p2 ? 'Le due password non coincidono.' : null);
    const withNew = (fn) => () => {
        const er = checkNew();
        if (er) return setMsg({ text: er, bad: true });
        fn();
    };

    const when = a.lastSavedAt ? new Date(a.lastSavedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <Page title="Sicurezza e archivio" intro="I dati restano solo su questo dispositivo. Il tuo file archivio è la copia che conta.">
            <Group title="Salvataggio" icon="save">
                <p className="mb-2">
                    {a.dirty ? <Status tone="warn">Modifiche non ancora salvate nel file</Status> : <Status tone="ok">Tutto salvato{when ? ` alle ${when}` : ''}</Status>}
                </p>
                <p className="st-hint mb-4">
                    Il browser tiene una copia di lavoro solo per non perdere nulla se aggiorni la pagina: il file va salvato a ogni sessione.
                </p>
                <div className="st-btns">
                    <Btn icon="save" disabled={busy} onClick={() => run(() => a.saveFile())}>
                        Salva archivio ora
                    </Btn>
                    <Btn
                        variant="danger"
                        icon="logout"
                        onClick={() => {
                            onClose();
                            a.openExitDialog();
                        }}
                    >
                        Esci e cancella dal browser…
                    </Btn>
                </div>
            </Group>

            <Group title="Cifratura" icon="lock">
                <p className="mb-4">
                    {a.encrypted ? <Status tone="ok">Archivio cifrato con password</Status> : <Status tone="warn">Non cifrato: chi ha il file può leggerlo</Status>}
                </p>
                {!a.cryptoAvailable && <p className="st-error mb-3">Questo browser non supporta la cifratura.</p>}

                {!a.encrypted && open !== 'enable' && (
                    <Btn icon="lock" onClick={() => reset('enable')} disabled={!a.cryptoAvailable}>
                        Attiva la cifratura
                    </Btn>
                )}
                {!a.encrypted && open === 'enable' && (
                    <div className="st-box">
                        <Pwd label="Nuova password (min. 8 caratteri)" value={p1} onChange={setP1} />
                        <Pwd label="Ripeti la password" value={p2} onChange={setP2} />
                        <div className="st-btns">
                            <Btn disabled={busy} onClick={withNew(() => run(() => a.enableEncryption(p1)))}>
                                Attiva
                            </Btn>
                            <Btn variant="secondary" onClick={() => setOpen(null)}>
                                Annulla
                            </Btn>
                        </div>
                    </div>
                )}

                {a.encrypted && (
                    <>
                        <div className="st-btns">
                            <Btn variant="secondary" onClick={() => reset('change')}>
                                Cambia password
                            </Btn>
                            <Btn variant="secondary" onClick={() => reset('recovery')}>
                                Nuovo codice di recupero
                            </Btn>
                            <Btn variant="secondary" icon="lock" onClick={() => a.lock()}>
                                Blocca ora
                            </Btn>
                            <Btn variant="danger" onClick={() => reset('disable')}>
                                Disattiva cifratura
                            </Btn>
                        </div>
                        {open === 'change' && (
                            <div className="st-box mt-4">
                                <Pwd label="Password attuale" value={p0} onChange={setP0} auto="current-password" />
                                <Pwd label="Nuova password (min. 8 caratteri)" value={p1} onChange={setP1} />
                                <Pwd label="Ripeti la nuova password" value={p2} onChange={setP2} />
                                <Btn disabled={busy} onClick={withNew(() => run(() => a.changePassword(p0, p1), 'Password cambiata. Salva il file per rendere effettiva la modifica.'))}>
                                    Conferma
                                </Btn>
                            </div>
                        )}
                        {open === 'recovery' && (
                            <div className="st-box mt-4">
                                <p className="st-hint mb-3">Genera un nuovo codice: il vecchio smette di funzionare.</p>
                                <Pwd label="Password attuale" value={p0} onChange={setP0} auto="current-password" />
                                <Btn disabled={busy} onClick={() => run(() => a.regenerateRecoveryCode(p0))}>
                                    Genera nuovo codice
                                </Btn>
                            </div>
                        )}
                        {open === 'disable' && (
                            <div className="st-box mt-4">
                                <p className="st-hint mb-3">Il file diventerà leggibile da chiunque lo possieda.</p>
                                <Pwd label="Password attuale" value={p0} onChange={setP0} auto="current-password" />
                                <Btn
                                    variant="danger"
                                    disabled={busy}
                                    onClick={() => run(() => a.disableEncryption(p0), 'Cifratura disattivata. Salva il file per rendere effettiva la modifica.')}
                                >
                                    Disattiva
                                </Btn>
                            </div>
                        )}
                    </>
                )}
                {msg && (
                    <Note tone={msg.bad ? 'bad' : 'ok'} className="mt-4">
                        {msg.text}
                    </Note>
                )}
            </Group>

            <Group title="Come funziona" icon="info">
                <ul className="st-text space-y-1.5 list-disc pl-4 text-[13.5px]">
                    <li>Nessun dato esce da questo dispositivo: non esistono server né account online.</li>
                    <li>Se aggiorni o chiudi la pagina con modifiche non salvate, il browser ti avvisa.</li>
                    <li>Con «Esci» il file viene salvato e i dati vengono cancellati dal browser: nulla resta su questo computer.</li>
                    <li>Per cambiare computer porta con te il file (e la password); sul vecchio computer usa «Esci».</li>
                    <li>Senza password e senza codice di recupero un archivio cifrato non è recuperabile da nessuno.</li>
                </ul>
            </Group>
        </Page>
    );
};
