import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useArchive } from '../../storage/ArchiveProvider';

// "Esci": salva il file aggiornato e cancella tutto dal browser (così nulla resta su questo computer).
export const ExitDialog = () => {
    const { dirty, ephemeral, saveFile, logout, closeExitDialog } = useArchive();
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

    const saveAndExit = async () => {
        setBusy(true);
        setMsg('');
        try {
            const res = await saveFile();
            if (res.ok) await logout();
            else setMsg('Salvataggio annullato: non sei uscito.');
        } catch (e) {
            setMsg('Salvataggio non riuscito: ' + (e.message || e));
        }
        setBusy(false);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${dirty && !ephemeral ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                    <i className={`ph-fill ${dirty && !ephemeral ? 'ph-warning' : 'ph-sign-out'} text-2xl`}></i>
                </div>
                {ephemeral ? (
                    <>
                        <h3 className="text-xl font-bold mb-2">Uscire dalla demo?</h3>
                        <p className="text-sm text-gray-600 mb-6">In modalità demo non viene salvato nulla.</p>
                        <div className="flex gap-3">
                            <button onClick={closeExitDialog} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-sm">Annulla</button>
                            <button onClick={logout} className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm">Esci</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold mb-2">{dirty ? 'Hai modifiche non salvate' : 'Uscire da URBIOS?'}</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {dirty
                                ? 'Salva il file aggiornato prima di uscire: i dati verranno poi rimossi da questo browser e restano solo nel file.'
                                : 'I dati verranno rimossi da questo browser e resteranno solo nel tuo file archivio.'}
                        </p>
                        {msg && <p className="text-sm text-red-600 mb-3">{msg}</p>}
                        <div className="flex flex-col gap-2">
                            {dirty ? (
                                <>
                                    <button disabled={busy} onClick={saveAndExit} className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm disabled:opacity-50">
                                        {busy ? 'Salvataggio…' : 'Salva ed esci'}
                                    </button>
                                    <button
                                        disabled={busy}
                                        onClick={() => confirm('Le modifiche non salvate andranno perse per sempre. Uscire comunque?') && logout()}
                                        className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50"
                                    >
                                        Esci senza salvare
                                    </button>
                                </>
                            ) : (
                                <button disabled={busy} onClick={logout} className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm">Esci</button>
                            )}
                            <button disabled={busy} onClick={closeExitDialog} className="w-full py-3 rounded-xl border border-gray-200 font-bold text-sm">Annulla</button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};
