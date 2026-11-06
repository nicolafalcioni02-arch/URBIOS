import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './appWizard.css';
import { PairPatient } from '../../views/settings/tabs/connect/PairPatient';
import { connectManager } from '../manager';
import { Disclosure } from './Disclosure';
import { SendAction } from './SendAction';
import { HelpButton } from './HelpButton';
import { diary } from '../help/diary';

// Finestra del riquadro «Invia all'app paziente». Due usi (la modalità Online si attiva SOLO dalle Impostazioni):
//  - mode 'pair': il paziente non è collegato ⇒ si configura (QR + codice di verifica).
//  - mode 'send': 1 informativa (da rileggere e riaccettare OGNI volta, non si salva) → 2 invio.
const STEPS = ['Informativa', 'Invio'];

export const AppWizard = ({ db, mode, patient, kind, source, status, onUpdateDb, onClose }) => {
    const [accepted, setAccepted] = useState(false);
    useEffect(() => { diary.record('finestra', mode === 'pair' ? 'aperta: collegare il paziente' : 'aperta: invio all\'app (informativa da riaccettare)'); }, []);
    useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
    const setLink = (id, conn) => onUpdateDb((p) => ({ ...p, pazienti: (p.pazienti || []).map((x) => (x.id !== id ? x : { ...x, connessione: conn })) }));
    const step = accepted ? 1 : 0;

    const body = mode === 'pair'
        ? <PairPatient api={connectManager.api()} patients={[patient]} onClose={onClose} onLinked={(id, pid) => setLink(id, { pid, collegatoIl: Date.now() })} />
        : !accepted
            ? <Disclosure lead="Accetta di nuovo le condizioni per proseguire." onCancel={onClose} onAccept={() => { diary.record('informativa', 'riaccettata per questo invio'); setAccepted(true); }} />
            : <div className="aw-send"><SendAction patient={patient} kind={kind} source={source} status={status} onUpdateDb={onUpdateDb} /></div>;

    return createPortal(
        <div className="aw-ov" role="dialog" aria-modal="true" aria-label="App del paziente">
            <div className="aw-card">
                <header className="aw-head">
                    <h3>{mode === 'pair' ? 'Collega il paziente' : 'Invia all\'app paziente'}</h3>
                    <span className="aw-hd-r"><HelpButton db={db} patient={patient} /><button type="button" className="aw-x" aria-label="Chiudi" onClick={onClose}>×</button></span>
                </header>
                {mode === 'send' && <ol className="aw-steps">{STEPS.map((s, i) => <li key={s} className={i === step ? 'is-on' : i < step ? 'is-done' : ''}><span>{i < step ? '✓' : i + 1}</span>{s}</li>)}</ol>}
                <div className="aw-body">{body}</div>
            </div>
        </div>,
        document.body,
    );
};
