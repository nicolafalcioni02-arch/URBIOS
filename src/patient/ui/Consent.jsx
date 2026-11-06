import React, { useState } from 'react';
import { AuthShell, Note } from './bits.jsx';

// Informativa e consensi distinti (SEC-95/96). TESTO DA FAR REVISIONARE da un consulente privacy/DPO prima dell'uso reale.
export const Consent = ({ onContinue }) => {
    const [read, setRead] = useState(false);
    const onScroll = (e) => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setRead(true); };
    const [c, setC] = useState({ terms: false, sync: false });
    const set = (k) => (e) => setC({ ...c, [k]: e.target.checked });
    return (
        <AuthShell step={1} title="Prima di iniziare" fit>
            <div className="pt-card pt-waiver" tabIndex={0} aria-label="Condizioni di utilizzo">
                <div className="pt-waiver-t" onScroll={onScroll} ref={(el) => { if (el && el.scrollHeight <= el.clientHeight + 8 && !read) setRead(true); }}>
                    <p><b>1. Trattamento dei dati.</b> Nell'applicazione non viene inserito il nome dell'utente: il professionista lo identifica tramite un codice anonimo. I documenti ricevuti sono cifrati, restano cifrati sul dispositivo e sono protetti dalla passphrase scelta dall'utente; solo l'utente e il professionista possono leggerli. L'utente può revocare il consenso ed eliminare ogni dato dal dispositivo in qualsiasi momento, dalle Impostazioni.</p>
                    <p><b>2. Trasmissione e protezione dei dati.</b> La trasmissione avviene con cifratura end-to-end: i documenti sono cifrati sul dispositivo del professionista con AES-256-GCM (cifratura autenticata, che rileva qualsiasi alterazione) e possono essere decifrati unicamente sul dispositivo dell'utente. Le chiavi di sessione sono concordate con uno scambio ibrido X25519 + ML-KEM, che unisce la crittografia a curve ellittiche a un algoritmo post-quantistico standardizzato NIST, così da proteggere i dati anche da futuri computer quantistici, e sono derivate con HKDF. L'autenticità del mittente è garantita da firme digitali Ed25519. Sul dispositivo i dati restano cifrati e sono protetti da una chiave ricavata dalla passphrase con Argon2id, funzione resistente agli attacchi a forza bruta. Nessun server o intermediario ha accesso al contenuto in chiaro. Pur adottando le tecnologie più avanzate oggi disponibili, nessun sistema informatico può essere dichiarato immune da rischi.</p>
                    <p><b>3. Natura dell'applicazione.</b> L'applicazione è un mero strumento informatico, paragonabile a un programma di videoscrittura, che consente di consultare i documenti trasmessi dal professionista e di tenere un diario personale. URBIOS non presta prestazioni sanitarie o professionali, non fornisce diagnosi, cure o prescrizioni e non interviene nel rapporto tra utente e professionista.</p>
                    <p><b>4. Responsabilità del professionista.</b> URBIOS non esercita alcun controllo, vigilanza o verifica sui professionisti che utilizzano il servizio. Piani alimentari, schede di allenamento e ogni altro contenuto visualizzato nell'applicazione sono redatti e trasmessi esclusivamente dal professionista, che ne è l'unico responsabile quanto a correttezza, adeguatezza e sicurezza. URBIOS non ne ha conoscenza e non risponde in alcun modo del loro contenuto né dell'uso che ne viene fatto.</p>
                    <p><b>5. Salute e attività fisica.</b> Prima di avviare o modificare un regime alimentare o un'attività fisica l'utente è tenuto a consultare il proprio medico, in particolare in presenza di patologie, gravidanza, allergie o intolleranze. In caso di dolore, malessere o sintomi anomali l'utente deve interrompere l'attività e rivolgersi a un professionista. L'utente utilizza l'applicazione e svolge ogni attività a proprio rischio.</p>
                    <p><b>6. Calcoli automatici.</b> Calorie, volumi di carico, liste della spesa, confronti e statistiche sono stime puramente indicative, elaborate su tabelle generiche e sui dati inseriti dall'utente; possono contenere errori e non costituiscono valori clinici.</p>
                    <p><b>7. Passphrase e dispositivo.</b> L'utente è l'unico responsabile della custodia della passphrase e della sicurezza del proprio dispositivo. In caso di smarrimento della passphrase non è possibile recuperare i dati.</p>
                    <p><b>8. Assenza di garanzie.</b> L'applicazione è software libero, pubblicato su GitHub e fornito «così com'è», senza garanzie di alcun genere, espresse o implicite. Non si garantisce l'assenza di errori o interruzioni né la corretta ricezione dei documenti o la conservazione dei dati.</p>
                    <p><b>9. Limitazione di responsabilità.</b> Nella misura massima consentita dalla legge, URBIOS, i suoi autori, collaboratori e consulenti non rispondono di alcun danno, diretto o indiretto, patrimoniale o non patrimoniale, a persone o cose (ivi inclusi danni alla salute, perdita di dati, lucro cessante e danno morale), derivante dall'uso o dall'impossibilità di usare l'applicazione o dai contenuti trasmessi dal professionista.</p>
                    <p><b>10. Accettazione.</b> L'utilizzo dell'applicazione comporta la lettura e l'integrale accettazione delle presenti condizioni.</p>
                </div>
            </div>
            <label className={'pt-check' + (read ? '' : ' is-off')}><input type="checkbox" disabled={!read} checked={c.terms} onChange={set('terms')} /><span>Ho letto e accetto le condizioni di utilizzo.</span></label>
            <label className={'pt-check' + (read ? '' : ' is-off')}><input type="checkbox" disabled={!read} checked={c.sync} onChange={set('sync')} /><span>Autorizzo la ricezione dei documenti dal mio professionista, che restano solo sul mio telefono.</span></label>
            <button type="button" className="pt-cta" disabled={!(read && c.terms && c.sync)} onClick={() => onContinue(c)}>{read ? 'Continua' : 'Leggi fino in fondo per continuare'}</button>
        </AuthShell>
    );
};
