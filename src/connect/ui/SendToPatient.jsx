import React, { useState, useSyncExternalStore } from 'react';
import './sendToPatient.css';
import { connectManager } from '../manager';
import { AppWizard } from './AppWizard';

// Riquadro nel passo Consegna di Dieta e Training, accanto ad «Anteprima e stampa». Compare SOLO con la connettività Online
// (si attiva dalle Impostazioni). Paziente non collegato ⇒ «Paziente non collegato» e il clic apre la configurazione (QR).
// Collegato ⇒ «Invia all'app paziente» e il clic apre informativa (da riaccettare ogni volta) → invio.
export const SendToPatient = ({ db, patient, kind, source, status, onUpdateDb }) => {
    const st = useSyncExternalStore(connectManager.subscribe, connectManager.getState);
    const [open, setOpen] = useState(false);
    const api = st.status === 'on' ? connectManager.api() : null;
    if (!api) return null;
    const linked = !!(patient.connessione && api.peers.list().some((p) => p.pid === patient.connessione.pid));
    return (
        <>
            <button type="button" className="dg-action sp-tile" onClick={() => setOpen(true)}>
                <i className="ph ph-paper-plane-tilt"></i>
                <span className="flex-1 text-left"><b>{linked ? 'Invia all\'app paziente' : 'Paziente non collegato'}</b></span>
                <i className="ph ph-caret-right opacity-60"></i>
            </button>
            {open && <AppWizard db={db} mode={linked ? 'send' : 'pair'} patient={patient} kind={kind} source={source} status={status} onUpdateDb={onUpdateDb} onClose={() => setOpen(false)} />}
        </>
    );
};
