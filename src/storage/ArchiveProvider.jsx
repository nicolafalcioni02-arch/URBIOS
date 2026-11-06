// Gestione dell'archivio: aprire, creare, salvare, bloccare, uscire.
// Il database vive in memoria (`db`). Il browser tiene solo una copia di lavoro (cifrata se l'archivio è cifrato)
// e il FILE scaricato resta la fonte di verità.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createVault, unlockVault, rewrapPassword, rewrapRecovery, isCryptoAvailable } from './cryptoVault';
import { connectManager } from '../connect/manager';
import { buildEncryptedText, buildPlainText, parseArchiveText, openEncrypted } from './archiveFile';
import { createEmptyDb, normalizeDb } from './schema';
import { saveWorking, loadWorking, clearWorking } from './workingCopy';
import { saveTextFile } from './fileIO';
import { hasLegacyData, readLegacyDb, wipeLegacy } from './legacy';
import { freshExample, splitExample, stripExample, withExample } from './example/example';

const ArchiveContext = createContext(null);
export const useArchive = () => useContext(ArchiveContext);

// hash veloce (cyrb53) per capire se il db è cambiato rispetto all'ultimo file salvato
const hashString = (str) => {
    let h1 = 0xdeadbeef,
        h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};
const dbHash = (d) => hashString(JSON.stringify(d));

const STALE = '__da_salvare__'; // forza "modifiche non salvate" (es. cambio password)

const todayStamp = () => new Date().toISOString().split('T')[0];

export const ArchiveProvider = ({ children }) => {
    const [status, setStatus] = useState('start'); // start | locked | open
    const [db, setDbState] = useState(null);
    const [encrypted, setEncryptedState] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [fileName, setFileName] = useState('');
    const [ephemeral, setEphemeral] = useState(false); // demo: niente copia nel browser
    const [resumeInfo, setResumeInfo] = useState(null); // c'è una copia di lavoro nel browser
    const [legacyFound, setLegacyFound] = useState(false);
    const [pendingRecoveryCode, setPendingRecoveryCode] = useState(null);
    const [exitDialogOpen, setExitDialogOpen] = useState(false);
    const [ready, setReady] = useState(false);

    const masterRef = useRef(null);
    const keyBlockRef = useRef(null);
    const handleRef = useRef(null);
    const fileHashRef = useRef(null);
    const dbRef = useRef(null);
    const encryptedRef = useRef(false);
    const ephemeralRef = useRef(false);
    const fileNameRef = useRef('');
    dbRef.current = db;

    const setEncrypted = (v) => {
        encryptedRef.current = v;
        setEncryptedState(v);
    };

    // paziente e ricette di esempio: l'app li vede in ogni archivio, ma restano fuori dal db salvato (vedi example/example.js)
    const [example, setExampleState] = useState(null);
    const exampleRef = useRef(null);
    const view = useMemo(() => withExample(db, example), [db, example]);

    // l'app modifica la vista: la parte vera va nel db (e nel file), quella di esempio resta in memoria
    const setDb = useCallback(
        (upd) =>
            setDbState((prev) => {
                const next = typeof upd === 'function' ? upd(withExample(prev, exampleRef.current)) : upd;
                const parts = splitExample(next, prev);
                exampleRef.current = parts.ex;
                setExampleState(parts.ex);
                return parts.db;
            }),
        []
    );

    // ---- connettività (src/connect): sottochiave derivata dalla chiave master, mai la master stessa ----
    const deriveKey = useCallback(async (purpose) => {
        if (!masterRef.current) return null; // archivio non cifrato o bloccato: connect non parte
        const base = await crypto.subtle.importKey('raw', masterRef.current, 'HKDF', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(`urbios/v1/${purpose}`) }, base, 256);
        return new Uint8Array(bits);
    }, []);
    const connCfg = db && db.connect;
    useEffect(() => {
        // Online solo con archivio aperto, cifrato e interruttore acceso; in ogni altro caso tutto si ferma (anche su Blocca/Esci).
        if (status === 'open' && encrypted && connCfg && connCfg.mode === 'online' && connCfg.relayUrl) connectManager.start({ settings: connCfg, deriveKey });
        else connectManager.stop();
    }, [status, encrypted, connCfg && connCfg.mode, connCfg && connCfg.relayUrl, deriveKey]);

    // ---- avvio: c'è qualcosa da riprendere? ----
    useEffect(() => {
        (async () => {
            try {
                const rec = await loadWorking();
                if (rec) setResumeInfo({ encrypted: rec.encrypted, savedAt: rec.savedAt, fileName: rec.fileName, dirty: rec.fileHash !== rec.currentHash });
            } catch {
                /* IndexedDB non disponibile: si lavora senza copia di lavoro */
            }
            setLegacyFound(hasLegacyData());
            setReady(true);
        })();
    }, []);

    // ---- attivazione di una sessione ----
    const activate = ({ db: newDb, enc, master = null, keyBlock = null, fileHash, name = '', handle = null, eph = false }) => {
        masterRef.current = master;
        keyBlockRef.current = keyBlock;
        handleRef.current = handle;
        fileHashRef.current = fileHash;
        ephemeralRef.current = eph;
        fileNameRef.current = name;
        setEncrypted(enc);
        setFileName(name);
        setEphemeral(eph);
        // un archivio che contiene già l'esempio (es. l'archivio demo) lo perde qui: l'esempio arriva sempre fresco
        const clean = stripExample(newDb);
        if (fileHash && fileHash === dbHash(newDb)) fileHashRef.current = dbHash(clean);
        const ex = freshExample();
        exampleRef.current = ex;
        setExampleState(ex);
        setDbState(clean);
        setStatus('open');
    };

    // ---- persistenza della copia di lavoro + calcolo "da salvare" ----
    const persistNow = useCallback(async (d) => {
        if (!d) return;
        const h = dbHash(d);
        setDirty(h !== fileHashRef.current);
        if (ephemeralRef.current) return;
        try {
            const text = encryptedRef.current ? await buildEncryptedText(d, masterRef.current, keyBlockRef.current) : buildPlainText(d);
            await saveWorking({ text, fileHash: fileHashRef.current, currentHash: h, savedAt: Date.now(), fileName: fileNameRef.current, encrypted: encryptedRef.current });
        } catch (e) {
            console.error('Copia di lavoro non salvata', e);
        }
    }, []);

    useEffect(() => {
        if (status !== 'open' || !db) return;
        const t = setTimeout(() => persistNow(db), 300);
        return () => clearTimeout(t);
    }, [db, status, encrypted, persistNow]);

    // quando la pagina sta per chiudersi/nascondersi: salva subito la copia di lavoro
    useEffect(() => {
        const flush = () => {
            if (status === 'open' && dbRef.current) persistNow(dbRef.current);
        };
        const onVis = () => document.visibilityState === 'hidden' && flush();
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', onVis);
        return () => {
            window.removeEventListener('pagehide', flush);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [status, persistNow]);

    // ---- blocco prima di chiudere/aggiornare con modifiche non salvate ----
    useEffect(() => {
        if (!(status === 'open' && dirty && !ephemeral)) return;
        const guard = (e) => {
            e.preventDefault();
            e.returnValue = ''; // il browser mostra il suo avviso standard (il testo non è personalizzabile)
            return '';
        };
        window.addEventListener('beforeunload', guard);
        return () => window.removeEventListener('beforeunload', guard);
    }, [status, dirty, ephemeral]);

    // ================= AZIONI =================

    const createArchive = async ({ encrypt, password }) => {
        const d = createEmptyDb();
        if (encrypt) {
            if (!isCryptoAvailable()) throw new Error('NO_CRYPTO');
            const v = await createVault(password);
            activate({ db: d, enc: true, master: v.master, keyBlock: v.keyBlock, fileHash: STALE });
            setPendingRecoveryCode(v.recoveryCode);
        } else {
            activate({ db: d, enc: false, fileHash: STALE });
        }
    };

    // Apre il testo di un file. Se è cifrato e manca `secret` restituisce { needsSecret:true }.
    const openFileText = async (text, name, secret, which = 'pwd') => {
        const parsed = parseArchiveText(text);
        if (parsed.encrypted) {
            if (!secret) return { needsSecret: true };
            const { db: raw, master, keyBlock } = await openEncrypted(parsed, secret, which);
            const d = normalizeDb(raw);
            activate({ db: d, enc: true, master, keyBlock, fileHash: dbHash(d), name });
            return { ok: true };
        }
        const d = normalizeDb(parsed.data);
        activate({ db: d, enc: false, fileHash: dbHash(d), name });
        return { ok: true, legacy: !!parsed.legacy };
    };

    // Recupero con codice: apre e imposta subito una nuova password.
    const recoverFromText = async (text, name, recoveryCode, newPassword) => {
        const parsed = parseArchiveText(text);
        if (!parsed.encrypted) throw new Error('NOT_ENCRYPTED');
        const { db: raw, master, keyBlock } = await openEncrypted(parsed, recoveryCode, 'rec');
        const kb = await rewrapPassword(keyBlock, master, newPassword);
        const d = normalizeDb(raw);
        activate({ db: d, enc: true, master, keyBlock: kb, fileHash: STALE, name });
    };

    const resumeWorking = async (secret, which = 'pwd') => {
        const rec = await loadWorking();
        if (!rec) throw new Error('NO_WORKING');
        const parsed = parseArchiveText(rec.text);
        let d, master = null, keyBlock = null;
        if (parsed.encrypted) {
            if (!secret) return { needsSecret: true };
            const o = await openEncrypted(parsed, secret, which);
            d = normalizeDb(o.db);
            master = o.master;
            keyBlock = o.keyBlock;
        } else {
            d = normalizeDb(parsed.data);
        }
        activate({ db: d, enc: parsed.encrypted, master, keyBlock, fileHash: rec.fileHash, name: rec.fileName || '' });
        return { ok: true };
    };

    const recoverWorking = async (recoveryCode, newPassword) => {
        const rec = await loadWorking();
        if (!rec) throw new Error('NO_WORKING');
        const parsed = parseArchiveText(rec.text);
        const { db: raw, master, keyBlock } = await openEncrypted(parsed, recoveryCode, 'rec');
        const kb = await rewrapPassword(keyBlock, master, newPassword);
        activate({ db: normalizeDb(raw), enc: true, master, keyBlock: kb, fileHash: STALE, name: rec.fileName || '' });
    };

    const importLegacy = async () => {
        const raw = readLegacyDb();
        if (!raw) throw new Error('NO_LEGACY');
        const d = normalizeDb(raw);
        activate({ db: d, enc: false, fileHash: STALE });
        await saveWorking({ text: buildPlainText(d), fileHash: STALE, currentHash: dbHash(d), savedAt: Date.now(), fileName: '', encrypted: false });
        wipeLegacy(); // da qui in poi i dati stanno solo nell'archivio
        setLegacyFound(false);
    };

    // demo: l'archivio di esempio completo (profilo, pazienti, agenda); nulla viene salvato
    const enterDemo = async () => {
        try {
            const demo = await import('../../archivio_demo/URBIOS_demo.json');
            activate({ db: normalizeDb((demo.default || demo).data), enc: false, fileHash: null, eph: true });
        } catch {
            activate({ db: createEmptyDb(), enc: false, fileHash: null, eph: true });
        }
    };

    // Salva su file (sovrascrive lo stesso file dove possibile, altrimenti scarica)
    const saveFile = async () => {
        const d = dbRef.current;
        if (!d) return { ok: false };
        const name = `URBIOS_${todayStamp()}${encryptedRef.current ? '_cifrato' : ''}.json`;
        const text = encryptedRef.current ? await buildEncryptedText(d, masterRef.current, keyBlockRef.current) : buildPlainText(d, { pretty: true });
        const res = await saveTextFile(text, { suggestedName: name, handle: handleRef.current });
        if (!res.ok) return res;
        handleRef.current = res.handle;
        fileHashRef.current = dbHash(d);
        fileNameRef.current = res.name;
        setFileName(res.name);
        setLastSavedAt(Date.now());
        setDirty(false);
        await persistNow(d);
        return res;
    };

    // Blocca (solo archivi cifrati): toglie la chiave dalla memoria; i dati restano cifrati nel browser.
    const lock = async () => {
        if (!encryptedRef.current) return;
        await persistNow(dbRef.current);
        const rec = await loadWorking().catch(() => null);
        masterRef.current = null;
        keyBlockRef.current = null;
        setDbState(null);
        setStatus('locked');
        if (rec) setResumeInfo({ encrypted: true, savedAt: rec.savedAt, fileName: rec.fileName, dirty: rec.fileHash !== rec.currentHash });
    };

    // Esci: cancella TUTTO dal browser (copia di lavoro + eventuali residui). Il chiamante deve aver già offerto di salvare.
    const logout = async () => {
        try {
            await clearWorking();
        } catch {
            /* niente */
        }
        wipeLegacy();
        masterRef.current = null;
        keyBlockRef.current = null;
        handleRef.current = null;
        fileHashRef.current = null;
        setDbState(null);
        setEncrypted(false);
        setDirty(false);
        setFileName('');
        setLastSavedAt(null);
        setEphemeral(false);
        setResumeInfo(null);
        setPendingRecoveryCode(null);
        setExitDialogOpen(false);
        setStatus('start');
    };

    // ---- impostazioni di sicurezza ----
    const markStale = () => {
        fileHashRef.current = STALE;
        setDirty(true);
    };

    const verifyPassword = async (password) => {
        await unlockVault(keyBlockRef.current, password, 'pwd'); // lancia WRONG_SECRET
    };

    const enableEncryption = async (password) => {
        if (!isCryptoAvailable()) throw new Error('NO_CRYPTO');
        const v = await createVault(password);
        masterRef.current = v.master;
        keyBlockRef.current = v.keyBlock;
        setEncrypted(true);
        markStale();
        setPendingRecoveryCode(v.recoveryCode);
    };

    const disableEncryption = async (password) => {
        await verifyPassword(password);
        masterRef.current = null;
        keyBlockRef.current = null;
        setEncrypted(false);
        markStale();
    };

    const changePassword = async (oldPassword, newPassword) => {
        await verifyPassword(oldPassword);
        keyBlockRef.current = await rewrapPassword(keyBlockRef.current, masterRef.current, newPassword);
        markStale();
    };

    const regenerateRecoveryCode = async (password) => {
        await verifyPassword(password);
        const r = await rewrapRecovery(keyBlockRef.current, masterRef.current);
        keyBlockRef.current = r.keyBlock;
        markStale();
        setPendingRecoveryCode(r.recoveryCode);
    };

    const value = {
        ready,
        status,
        db: view,
        setDb,
        encrypted,
        dirty,
        lastSavedAt,
        fileName,
        ephemeral,
        resumeInfo,
        legacyFound,
        pendingRecoveryCode,
        acknowledgeRecoveryCode: () => setPendingRecoveryCode(null),
        exitDialogOpen,
        openExitDialog: () => setExitDialogOpen(true),
        closeExitDialog: () => setExitDialogOpen(false),
        cryptoAvailable: isCryptoAvailable(),
        verifyPassword,
        createArchive,
        openFileText,
        recoverFromText,
        resumeWorking,
        recoverWorking,
        importLegacy,
        enterDemo,
        saveFile,
        lock,
        logout,
        enableEncryption,
        disableEncryption,
        changePassword,
        regenerateRecoveryCode,
    };

    return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};
