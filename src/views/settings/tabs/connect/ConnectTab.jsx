import React, { useState, useSyncExternalStore } from 'react';
import { useArchive } from '../../../../storage/ArchiveProvider';
import { connectManager } from '../../../../connect/manager';
import { Page, Group, Btn, Field, Note, Status, Segmented } from '../../ui/kit';
import { PairPatient } from './PairPatient';
import { HelpButton } from '../../../../connect/ui/HelpButton';
import { diary } from '../../../../connect/help/diary';
import { Disclosure } from '../../../../connect/ui/Disclosure';
import { DISCLOSURE_VERSION } from '../../../../connect/ui/disclosureText';

// Interruttore Offline / Online (app paziente e dispositivi). Il valore sta in db.connect = { mode, relayUrl }.
// Il cambio richiede la password dell'archivio (autenticazione recente). Avvio/arresto: ArchiveProvider.
export const ConnectTab = ({ db, onUpdateDb }) => {
    const a = useArchive();
    const st = useSyncExternalStore(connectManager.subscribe, connectManager.getState);
    const cur = (db && db.connect) || { mode: 'offline', relayUrl: '' };
    const [want, setWant] = useState(cur.mode);
    const [url, setUrl] = useState(cur.relayUrl || '');
    const [pwd, setPwd] = useState('');
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const [pairing, setPairing] = useState(false);
    const accepted = !!(cur.accettato && cur.accettato.versione === DISCLOSURE_VERSION);
    const [reading, setReading] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const api = st.status === 'on' ? connectManager.api() : null;
    const patients = ((db && db.pazienti) || []).filter((p) => !p.esempio);
    const linked = api ? api.peers.list() : [];
    const setLink = (id, conn) => onUpdateDb((prev) => ({ ...prev, pazienti: (prev.pazienti || []).map((p) => { if (p.id !== id) return p; const { connessione, ...rest } = p; return conn ? { ...rest, connessione: conn } : rest; }) }));
    const unlink = async (p) => { const r = await api.peers.unlink(p.connessione.pid); diary.record('scollega', r && r.notified ? 'paziente scollegato e avvisato' : 'paziente scollegato, avviso non consegnato'); setLink(p.id, null); setMsg(r && r.notified ? { text: 'Paziente scollegato e avvisato.' } : { text: 'Paziente scollegato da qui. Non sono riuscito ad avvisarlo: la sua app resterà collegata finché non elimina il collegamento da sé.', tone: 'warn' }); };

    const changed = want !== cur.mode || (want === 'online' && url !== (cur.relayUrl || ''));
    const confirm = async () => {
        setMsg(null);
        if (want === 'online' && !accepted) return setMsg({ text: 'Per attivare la modalità Online devi prima leggere e accettare l\'informativa.', bad: true });
        if (want === 'online' && !/^(https|wss):\/\/[^\s/]+/.test(url)) return setMsg({ text: 'Indirizzo non valido: serve https://… oppure wss://… (broker MQTT)', bad: true });
        setBusy(true);
        let ok = true;
        try { await a.verifyPassword(pwd); } catch { ok = false; } // lancia WRONG_SECRET se errata
        setBusy(false);
        if (!ok) { diary.record('attivazione', 'password dell\'archivio non corretta'); return setMsg({ text: 'Password non corretta.', bad: true }); }
        diary.record('attivazione', want === 'online' ? 'richiesta modalità Online' : 'richiesta modalità Offline');
        onUpdateDb((prev) => ({ ...prev, connect: { ...(prev.connect || {}), mode: want, relayUrl: want === 'online' ? url : (prev.connect && prev.connect.relayUrl) || '' } }));
        setPwd('');
        setMsg({ text: want === 'online' ? 'Connettività attivata.' : 'Connettività disattivata: nessuna connessione aperta.' });
    };

    const label = { off: 'Offline', starting: 'Avvio…', on: 'Online', error: 'Errore' }[st.status];
    const tone = { off: 'neutral', starting: 'warn', on: 'ok', error: 'bad' }[st.status];

    return (
        <Page title="Connettività" actions={<HelpButton db={db} />} intro="Collega l'app del paziente e gli altri tuoi dispositivi. Spenta di default: URBIOS resta completamente offline.">
            <Group title="Modalità" icon="link">
                <p className="mb-3">
                    <Status tone={tone}>{label}</Status>
                    {st.deviceId && <span className="st-hint"> · dispositivo {st.deviceId.slice(0, 8)}…</span>}
                </p>
                {st.error && <Note tone="bad" title="Non si è avviata">{st.error}</Note>}
                {st.code === 'KEY_MISMATCH' && (
                    <Note tone="warn" title="Dati di connessione non apribili">
                        Le chiavi di connessione salvate qui sono state create con un altro archivio o un'altra password, quindi non si possono aprire e non vengono mai sostituite di nascosto.
                        Se questo è un archivio nuovo o di prova puoi azzerarle: verranno create chiavi nuove e i pazienti già collegati andranno ricollegati con un nuovo QR. L'azione non si può annullare.
                        <div className="st-btns mt-3">
                            {!confirmReset
                                ? <Btn variant="ghost" onClick={() => setConfirmReset(true)}>Azzera i dati di connessione</Btn>
                                : <><Btn onClick={async () => { setConfirmReset(false); diary.record('attivazione', 'azzeramento dei dati di connessione'); await connectManager.resetData(); }}>Sì, azzera e riparti</Btn><Btn variant="ghost" onClick={() => setConfirmReset(false)}>Annulla</Btn></>}
                        </div>
                    </Note>
                )}
                {!a.encrypted ? (
                    <Note tone="warn" title="Serve un archivio cifrato">
                        Le chiavi di connessione si proteggono con la chiave dell'archivio. Attiva prima la cifratura in «Sicurezza e archivio».
                    </Note>
                ) : (
                    <>
                        <div className="mb-4">
                            <Segmented options={[['offline', 'Offline'], ['online', 'Online']]} value={want} onChange={setWant} />
                        </div>
                        {want === 'online' && !accepted && !reading && (
                            <Note tone="warn" title="Serve leggere un testo prima">
                                Per attivarla devi leggere con attenzione come funziona la connessione, con tutti i limiti e le responsabilità.
                                <div className="st-btns mt-3"><Btn onClick={() => setReading(true)}>Leggi l'informativa</Btn></div>
                            </Note>
                        )}
                        {want === 'online' && !accepted && reading && (
                            <Disclosure onCancel={() => { setReading(false); setWant(cur.mode); }} onAccept={(acc) => { diary.record('informativa', 'accettata nelle Impostazioni'); onUpdateDb((prev) => ({ ...prev, connect: { ...(prev.connect || { mode: 'offline', relayUrl: '' }), accettato: acc } })); setReading(false); }} />
                        )}
                        {want === 'online' && accepted && (
                            <Field className="max-w-md mb-3" label="Indirizzo del relay (https://) o del broker (wss://)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" autoComplete="off" />
                        )}
                        {changed && (want !== 'online' || accepted) && (
                            <>
                                <Field className="max-w-sm mb-3" label="Password dell'archivio per confermare" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
                                <div className="st-btns">
                                    <Btn icon="check" disabled={busy || !pwd} onClick={confirm}>{want === 'online' ? 'Attiva' : 'Disattiva'}</Btn>
                                </div>
                            </>
                        )}
                        {msg && <Note tone={msg.tone || (msg.bad ? 'bad' : 'ok')}>{msg.text}</Note>}
                    </>
                )}
            </Group>
            {st.status === 'on' && api && (
                <Group title="Pazienti collegati" icon="link">
                    {patients.filter((p) => p.connessione).map((p) => {
                        const peer = linked.find((x) => x.pid === p.connessione.pid);
                        return (
                            <div key={p.id} className="st-row">
                                <span>{`${p.cognome || ''} ${p.nome || ''}`.trim()}{' '}
                                    {peer ? <Status tone="ok">collegato{peer.queued ? ` · ${peer.queued} in uscita` : ''}</Status> : <Status tone="warn">da ricollegare</Status>}</span>
                                <Btn variant="ghost" onClick={() => unlink(p)}>Scollega</Btn>
                            </div>
                        );
                    })}
                    {!pairing && <div className="st-btns mt-3"><Btn icon="plus" disabled={!patients.length} onClick={() => setPairing(true)}>Collega un paziente</Btn></div>}
                    {pairing && <PairPatient api={api} patients={patients.filter((p) => !p.connessione)} onClose={() => setPairing(false)} onLinked={(id, pid) => setLink(id, { pid, collegatoIl: Date.now() })} />}
                </Group>
            )}
            <Group title="Cosa succede" hint="In breve">
                <p className="st-hint mb-2">Offline: nessuna connessione, nessun dato esce dal computer.</p>
                <p className="st-hint mb-2">Online: il relay vede solo messaggi cifrati e codici anonimi, mai nomi né contenuti. Il paziente non ha il nome nell'app.</p>
                <p className="st-hint">Per attivarla si deve leggere e accettare un'informativa tecnica dettagliata: la modalità Online è facoltativa e ci si assume la piena responsabilità dell'uso.</p>
            </Group>
        </Page>
    );
};
