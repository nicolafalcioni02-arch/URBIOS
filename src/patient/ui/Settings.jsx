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
    const send = async () => { if (busy) return; setBusy(true); setMsg(''); try { const r = await shareSummary(rt); if (r === 'saved') setMsg('PDF salvato nei file'); else if (r === 'shared') setMsg('Riassunto inviato'); } catch (e) { setMsg('Non sono riuscito a creare il PDF'); } setBusy(false); };
    const [sure, setSure] = useState(false), [about, setAbout] = useState(false), [spin, setSpin] = useState(false);
    const refresh = () => { setSpin(true); setTimeout(() => setSpin(false), 600); onRefresh(); };
    return (
        <div className="pt-prof">
            <Head title="Profilo" />
            <div className="pt-set">
                <div className="pt-set-r"><Icon name="link" size={22} /><b>{st.linked ? 'Collegato' : 'Non collegato'}</b><i className={'pt-set-dot' + (st.linked ? '' : ' is-off')} aria-hidden="true" /></div>
                <button type="button" className={'pt-set-r' + (busy ? ' is-busy' : '')} onClick={send} disabled={busy}><Icon name="doc" size={22} /><b>Riassunto PDF</b><span className="pt-set-e"><Icon name="share" size={20} /></span></button>
                {onRefresh && <button type="button" className={'pt-set-r' + (spin ? ' is-spin' : '')} onClick={refresh}><Icon name="refresh" size={22} /><b>Aggiorna</b></button>}
                <button type="button" className="pt-set-r" onClick={onLock}><Icon name="lock" size={22} /><b>Blocca</b></button>
                <button type="button" className="pt-set-r" onClick={() => setAbout(true)}><UrbiosLogo size={22} /><b>URBIOS</b><span className="pt-set-e"><Icon name="chev" size={18} /></span></button>
            </div>
            {msg && <p className="pt-set-n">{msg}</p>}
            {st.consent && <p className="pt-set-n">Consenso dato il {new Date(st.consent.at).toLocaleDateString('it-IT')} (informativa {st.consent.version}).</p>}
            {!sure ? <button type="button" className="pt-set-del" onClick={() => setSure(true)}><Icon name="trash" size={22} /><b>Elimina tutto</b></button>
                : <div className="pt-set-del-c"><Note tone="bad">Operazione definitiva. Confermi?</Note><div className="pt-btns"><button type="button" className="pt-btn danger pt-set-yes" onClick={onForget}>Sì, elimina tutto</button><button type="button" className="pt-btn ghost" onClick={() => setSure(false)}>Annulla</button></div></div>}
            {about && <About onClose={() => setAbout(false)} />}
        </div>
    );
};
