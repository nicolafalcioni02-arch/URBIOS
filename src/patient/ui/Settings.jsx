import React, { useState } from 'react';
import { Head, Note, Icon } from './bits.jsx';
import { About } from './About.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';


export const Settings = ({ rt, onBack, onLock, onForget, onRefresh }) => {
    const st = rt.status(), [sure, setSure] = useState(false), [about, setAbout] = useState(false);
    return (
        <>
            <Head title="Impostazioni" onBack={onBack} />
            <div className="pt-card is-round">
                <h2>Collegamento</h2>
                <p className="pt-sub" style={{ margin: 0 }}>{st.linked ? 'Collegato al tuo professionista.' : 'Nessun professionista collegato.'}</p>
                                {st.consent && <p className="pt-muted">Consenso dato il {new Date(st.consent.at).toLocaleDateString('it-IT')} (informativa {st.consent.version}).</p>}
            </div>
            <div className="pt-btns pt-btns2">{onRefresh && <button type="button" className="pt-btn" onClick={onRefresh}>Aggiorna piani</button>}<button type="button" className="pt-btn ghost" onClick={onLock}>Esci</button></div>
            <div className="pt-card is-round" style={{ marginTop: 16 }}>
                <h2>Revoca ed elimina</h2>
                <p className="pt-sub">Elimina da questo telefono documenti, chiavi e collegamento.</p>
                {!sure ? <button type="button" className="pt-btn danger" onClick={() => setSure(true)}>Elimina tutto</button>
                    : <><Note tone="bad">Operazione definitiva. Confermi?</Note><div className="pt-btns"><button type="button" className="pt-btn danger" onClick={onForget}>Sì, elimina tutto</button><button type="button" className="pt-btn ghost" onClick={() => setSure(false)}>Annulla</button></div></>}
            </div>
            <button type="button" className="pt-about" style={{ marginTop: 16 }} onClick={() => setAbout(true)}>
                <UrbiosLogo size={40} />
                <span><b>URBIOS</b></span>
                <Icon name="back" size={18} />
            </button>
            {about && <About onClose={() => setAbout(false)} />}
        </>
    );
};
