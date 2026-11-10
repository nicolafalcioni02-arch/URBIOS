import React, { useState } from 'react';
import { Head, Note, Icon } from './bits.jsx';
import { About } from './About.jsx';
import { daysTo } from './Tools.jsx';
import { arr, toolsOf } from './logic.js';
import { shareSummary } from './summaryPdf.js';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';


export const Settings = ({ rt, onBack, onLock, onForget, onRefresh, onAct }) => {
    const st = rt.status(), tl = toolsOf(rt.log.get()), dv = daysTo(tl.visit), nn = arr(tl.notes).length, hasDiet = rt.docs.list().some((d) => d.kind === 'diet');
    const rows = [['visit', 'calendar', 'Prossimo controllo', dv === null ? 'Imposta la data' : dv < 0 ? 'Data passata' : dv === 0 ? 'Oggi' : dv === 1 ? 'Domani' : `Tra ${dv} giorni`], ...(hasDiet ? [['shop', 'cart', 'Lista della spesa', 'Dalla tua dieta']] : []), ['notes', 'note', 'Da dire al professionista', nn ? `${nn} appunt${nn === 1 ? 'o' : 'i'}` : 'Scrivi un promemoria']];
    const [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
    const send = async () => { if (busy) return; setBusy(true); setMsg(''); try { const r = await shareSummary(rt); if (r === 'saved') { setMsg('PDF salvato nei file'); setTimeout(() => setMsg(''), 3000); } } catch (e) { setMsg('Non sono riuscito a creare il PDF'); setTimeout(() => setMsg(''), 3000); } setBusy(false); };
    const [sure, setSure] = useState(false), [about, setAbout] = useState(false);
    return (
        <>
            <Head title="Impostazioni" onBack={onBack} />
            <div className="pt-card is-round">
                <h2>Collegamento</h2>
                <p className="pt-sub" style={{ margin: 0 }}>{st.linked ? 'Collegato al tuo professionista.' : 'Nessun professionista collegato.'}</p>
                                {st.consent && <p className="pt-muted">Consenso dato il {new Date(st.consent.at).toLocaleDateString('it-IT')} (informativa {st.consent.version}).</p>}
            </div>
            <div className="pt-card is-round" style={{ marginTop: 16 }}>
                <h2>Il tuo riassunto</h2>
                <p className="pt-sub">Un PDF con tutto il tuo percorso, da inviare al professionista.</p>
                <button type="button" className="pt-btn" onClick={send} disabled={busy}>{busy ? 'Creo il PDF…' : msg || 'Invia il tuo riassunto del percorso'}</button>
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
