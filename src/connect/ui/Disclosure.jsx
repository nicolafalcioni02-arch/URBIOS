import React, { useRef, useState } from 'react';
import './disclosure.css';
import { Btn } from '../../views/settings/ui/kit';
import { DISCLOSURE, DISCLOSURE_VERSION } from './disclosureText';

// Lettura obbligatoria prima di attivare la modalità Online: il testo va scorso fino in fondo, poi due conferme distinte.
export const Disclosure = ({ onAccept, onCancel, lead = 'Prima di attivare la modalità Online leggi con attenzione questo testo fino in fondo.' }) => {
    const box = useRef(null);
    const [end, setEnd] = useState(false);
    const [c1, setC1] = useState(false);
    const [c2, setC2] = useState(false);
    const onScroll = (e) => { const t = e.currentTarget; if (t.scrollTop + t.clientHeight >= t.scrollHeight - 8) setEnd(true); };
    return (
        <div className="dz">
            <p className="dz-lead">{lead}</p>
            <div className="dz-box" ref={box} onScroll={onScroll} tabIndex={0} role="region" aria-label="Informativa tecnica sulla connessione">
                {DISCLOSURE.map((s, i) => (
                    <section key={i}>
                        <h4>{i + 1}. {s.h}</h4>
                        {s.p.map((t, j) => <p key={j}>{t}</p>)}
                    </section>
                ))}
                <p className="dz-ver">Versione del testo: {DISCLOSURE_VERSION}</p>
            </div>
            {!end && <p className="st-hint">Scorri il testo fino alla fine per continuare.</p>}
            <label className={`dz-chk ${end ? '' : 'is-off'}`}><input type="checkbox" disabled={!end} checked={c1} onChange={(e) => setC1(e.target.checked)} /> Ho letto e capito come funziona la connessione, i suoi limiti e i suoi rischi.</label>
            <label className={`dz-chk ${end ? '' : 'is-off'}`}><input type="checkbox" disabled={!end} checked={c2} onChange={(e) => setC2(e.target.checked)} /> Mi assumo totalmente la responsabilità dell'uso: se non so cosa sto facendo, chiedo una consulenza esterna.</label>
            <div className="st-btns">
                <Btn icon="check" disabled={!(end && c1 && c2)} onClick={() => onAccept({ versione: DISCLOSURE_VERSION, il: Date.now() })}>Accetto e continuo</Btn>
                <Btn variant="ghost" onClick={onCancel}>Annulla</Btn>
            </div>
        </div>
    );
};
