// Anonimizzazione ("pseudonimizzazione") dei dati prima di un'esportazione, guidata da una checklist per campo.
// ATTENZIONE: togliere i nomi NON rende i dati anonimi in senso assoluto (combinazioni rare di età, patologia, città...
// possono identificare una persona). Per questo le impostazioni di partenza sono prudenti e c'è un rapporto finale.
import { clone, isPlainObject, parseAnyDate, ageAt, daysBetween } from './util';

// ---- Catalogo dei campi del paziente ----
export const PATIENT_FIELDS = [
    { key: 'nome', label: 'Nome', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'cognome', label: 'Cognome', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'cf', label: 'Codice fiscale', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'cellulare', label: 'Cellulare', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'email', label: 'Email', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'indirizzo', label: 'Indirizzo', group: 'Identificativi diretti', defaultRemove: true },
    { key: 'cap', label: 'CAP', group: 'Luoghi', defaultRemove: true },
    { key: 'citta', label: 'Città di residenza', group: 'Luoghi', defaultRemove: true },
    { key: 'luogoNascita', label: 'Luogo di nascita', group: 'Luoghi', defaultRemove: true },
    { key: 'professione', label: 'Professione', group: 'Altri dati personali', defaultRemove: true },
    { key: 'statoCivile', label: 'Stato civile', group: 'Altri dati personali', defaultRemove: true },
    { key: 'anamnesi_familiare', label: 'Anamnesi familiare (testo libero)', group: 'Testi clinici liberi', defaultRemove: true },
    { key: 'patologie', label: 'Patologie e interventi (testo libero)', group: 'Testi clinici liberi', defaultRemove: true },
    { key: 'farmaci', label: 'Terapie farmacologiche (testo libero)', group: 'Testi clinici liberi', defaultRemove: true },
    { key: 'allergie', label: 'Allergie e intolleranze (testo libero)', group: 'Testi clinici liberi', defaultRemove: true },
    { key: 'obiettivo', label: 'Obiettivo del paziente (testo libero)', group: 'Testi clinici liberi', defaultRemove: true },
    { key: 'note', label: 'Note generali del paziente', group: 'Testi clinici liberi', defaultRemove: true },
];

// Chiavi che contengono testo libero (note, valutazioni...). Nei dettagli delle visite e nei report salvati.
export const FREE_TEXT_KEY_RE = /(^|_)(note|nota|anamnesi|valutazione|commento|comment|descrizione|obiettivo|attivita_fisica)(_|$)/i;

export const BIRTH_MODES = [
    { value: 'remove', label: 'Elimina la data di nascita' },
    { value: 'ageband', label: "Sostituisci con fascia d'età (5 anni)" },
    { value: 'year', label: 'Solo anno di nascita' },
    { value: 'age', label: 'Età in anni' },
    { value: 'keep', label: 'Mantieni la data esatta (sconsigliato)' },
];
export const DATE_MODES = [
    { value: 'relative', label: 'Giorni dalla prima visita (T+N)' },
    { value: 'month', label: 'Solo mese e anno' },
    { value: 'remove', label: 'Elimina le date' },
    { value: 'keep', label: 'Mantieni le date esatte (sconsigliato)' },
];
export const ID_MODES = [
    { value: 'keep', label: "Mantieni l'ID del paziente (permette di ricollegarlo al tuo archivio)" },
    { value: 'pseudo', label: 'Sostituisci con un codice casuale (+ tabella di corrispondenza a parte)' },
];

export const defaultAnonOptions = () => ({
    removeFields: Object.fromEntries(PATIENT_FIELDS.map((f) => [f.key, f.defaultRemove])),
    birth: 'ageband',
    dates: 'relative',
    idMode: 'keep',
    removeFreeText: true,
    freeTextKeys: null, // null = tutte quelle rilevate; altrimenti elenco delle chiavi di visita da togliere
    maskIdentifiers: true, // controllo di sicurezza: cancella nome/cognome/CF/email/telefono se compaiono nei testi rimasti
    includeProfessional: false,
});

// Elenca le chiavi di testo libero presenti nei dettagli delle visite (per mostrarle nella checklist).
export const detectFreeTextKeys = (db) => {
    const keys = new Set(['note']);
    (db.pazienti || []).forEach((p) =>
        (p.visite || []).forEach((v) => {
            Object.keys(v.dettagli || {}).forEach((k) => {
                if (k.startsWith('diet_')) return;
                if (FREE_TEXT_KEY_RE.test(k)) keys.add(k);
            });
        })
    );
    return [...keys].sort();
};

const ageBand = (age) => {
    if (age === null || age < 0) return '';
    const lo = Math.floor(age / 5) * 5;
    return `${lo}-${lo + 4}`;
};

const pad = (n, w = 2) => String(n).padStart(w, '0');
const randomCode = (len = 6) => {
    const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// token da cercare nei testi che restano
const identifierTokens = (p) => {
    const t = new Set();
    String(p.nome || '')
        .split(/\s+/)
        .forEach((w) => w.length >= 3 && t.add(w));
    String(p.cognome || '')
        .split(/\s+/)
        .forEach((w) => w.length >= 3 && t.add(w));
    if (p.cf && String(p.cf).length >= 8) t.add(String(p.cf));
    if (p.email) t.add(String(p.email));
    const digits = String(p.cellulare || '').replace(/\D/g, '');
    if (digits.length >= 6) t.add(String(p.cellulare));
    return [...t];
};

// ---- Funzione principale ----
// Restituisce { db, keyTable, report }.  `db` è una copia: l'originale non viene toccato.
export const anonymizeDb = (srcDb, opts = defaultAnonOptions()) => {
    const db = clone(srcDb);
    const report = { patients: 0, visits: 0, removedFields: {}, maskedHits: 0, warnings: [] };
    const keyTable = [];
    const bump = (k, n = 1) => (report.removedFields[k] = (report.removedFields[k] || 0) + n);

    const textKeys = new Set(opts.freeTextKeys || detectFreeTextKeys(srcDb));
    const isTextKey = (k) => opts.removeFreeText && (textKeys.has(k) || FREE_TEXT_KEY_RE.test(k));

    if (!opts.includeProfessional) db.utente = {};
    const usedCodes = new Set();

    db.pazienti = (db.pazienti || []).map((p0) => {
        const p = { ...p0 };
        const visits = Array.isArray(p.visite) ? p.visite.map((v) => ({ ...v, dettagli: v.dettagli ? { ...v.dettagli } : v.dettagli })) : [];
        const tokens = opts.maskIdentifiers ? identifierTokens(p0) : [];

        // ordine cronologico per riferimenti relativi
        const dated = visits.map((v) => parseAnyDate(v.data)).filter(Boolean);
        const firstDate = dated.length ? new Date(Math.min(...dated)) : null;
        const firstStr = firstDate ? firstDate.toISOString().slice(0, 10) : null;
        const sortedIdx = visits.map((v, i) => i).sort((a, b) => String(visits[a].data).localeCompare(String(visits[b].data)));
        const seq = {};
        sortedIdx.forEach((i, n) => (seq[i] = n + 1));

        // ---- campi del paziente ----
        PATIENT_FIELDS.forEach((f) => {
            if (opts.removeFields[f.key] && p[f.key] !== undefined && p[f.key] !== '') {
                delete p[f.key];
                bump(f.label);
            } else if (opts.removeFields[f.key]) delete p[f.key];
        });
        const birth = p0.dataNascita;
        if (birth) {
            const refDate = firstStr || new Date().toISOString().slice(0, 10);
            const age = ageAt(birth, refDate);
            if (opts.birth === 'remove') {
                delete p.dataNascita;
                bump('Data di nascita');
            } else if (opts.birth === 'ageband') {
                delete p.dataNascita;
                p.fascia_eta = ageBand(age);
                bump('Data di nascita');
            } else if (opts.birth === 'year') {
                p.anno_nascita = String(birth).slice(0, 4);
                delete p.dataNascita;
                bump('Data di nascita');
            } else if (opts.birth === 'age') {
                p.eta = age === null ? '' : Math.floor(age);
                delete p.dataNascita;
                bump('Data di nascita');
            }
        }

        // ---- visite ----
        const scrub = (obj) => {
            // rimuove testi liberi in profondità (diet_saved_reports.config.comment ecc.)
            if (Array.isArray(obj)) return obj.map(scrub);
            if (!isPlainObject(obj)) return obj;
            const o = {};
            Object.keys(obj).forEach((k) => {
                if (isTextKey(k) && typeof obj[k] === 'string') {
                    if (obj[k] !== '') bump('Testi liberi');
                    return;
                }
                if (opts.dates !== 'keep' && /^(date|data|createdAt|savedAt|updatedAt|timestamp)$/i.test(k) && typeof obj[k] === 'string') {
                    bump('Date nei report');
                    return;
                }
                o[k] = scrub(obj[k]);
            });
            return o;
        };

        p.visite = visits.map((v, i) => {
            report.visits++;
            const nv = { ...v };
            const id = `V${pad(seq[i], 2)}`; // gli ID originali sono timestamp: rivelerebbero data e ora
            nv.id = id;
            const dateStr = v.data;
            if (opts.dates === 'relative') {
                const d = firstStr ? daysBetween(firstStr, dateStr) : null;
                delete nv.data;
                if (d !== null) nv.giorni_da_prima_visita = d;
                bump('Date visite');
            } else if (opts.dates === 'month') {
                nv.data = String(dateStr || '').slice(0, 7);
                bump('Date visite (giorno)');
            } else if (opts.dates === 'remove') {
                delete nv.data;
                bump('Date visite');
            }
            if (opts.removeFreeText && typeof nv.note === 'string') {
                if (nv.note && nv.note !== 'Nessuna nota principale') bump('Testi liberi');
                delete nv.note;
            }
            if (nv.dettagli) {
                const dd = {};
                Object.keys(nv.dettagli).forEach((k) => {
                    const val = nv.dettagli[k];
                    if (isTextKey(k) && typeof val === 'string') {
                        if (val !== '') bump('Testi liberi');
                        return;
                    }
                    dd[k] = k.startsWith('diet_') || isPlainObject(val) || Array.isArray(val) ? scrub(val) : val;
                });
                nv.dettagli = dd;
            }
            return nv;
        });

        // ---- schede di allenamento: il nome del cliente e i titoli liberi sono dati personali ----
        if (p.allenamento && Array.isArray(p.allenamento.schede)) {
            p.allenamento = {
                ...p.allenamento,
                schede: p.allenamento.schede.map((sc) => {
                    const n = { ...sc };
                    if (n.cliente) bump('Nome cliente nelle schede');
                    delete n.cliente;
                    if (opts.removeFreeText) {
                        if (n.titolo || n.obiettivo) bump('Testi liberi');
                        delete n.titolo;
                        delete n.obiettivo;
                    }
                    if (opts.dates === 'month') {
                        n.data = String(sc.data || '').slice(0, 7);
                        delete n.updatedAt;
                    } else if (opts.dates !== 'keep') {
                        delete n.data;
                        delete n.updatedAt;
                    }
                    n.weeks = scrub(n.weeks);
                    return n;
                }),
            };
            if (p.allenamento.massimali) {
                p.allenamento.massimali = Object.fromEntries(
                    Object.entries(p.allenamento.massimali).map(([k, m]) => {
                        const x = { ...m };
                        if (opts.dates === 'month') x.date = String(x.date || '').slice(0, 7);
                        else if (opts.dates !== 'keep') delete x.date;
                        return [k, x];
                    })
                );
            }
        }

        // ---- controllo di sicurezza sui testi rimasti ----
        if (tokens.length) {
            const re = new RegExp(tokens.map(escapeRe).join('|'), 'gi');
            const mask = (x) => {
                if (typeof x === 'string') return x.replace(re, () => (report.maskedHits++, '[RIMOSSO]'));
                if (Array.isArray(x)) return x.map(mask);
                if (isPlainObject(x)) return Object.fromEntries(Object.entries(x).map(([k, val]) => [k, mask(val)]));
                return x;
            };
            Object.keys(p).forEach((k) => {
                if (k !== 'id' && k !== 'visite') p[k] = mask(p[k]);
            });
            p.visite = p.visite.map(mask);
        }

        // ---- ID ----
        const origId = p0.id;
        if (opts.idMode === 'pseudo') {
            let code;
            do code = 'P-' + randomCode(6);
            while (usedCodes.has(code));
            usedCodes.add(code);
            p.id = code;
            keyTable.push({ codice_anonimo: code, id_originale: origId, nome: p0.nome || '', cognome: p0.cognome || '' });
        }
        report.patients++;
        return p;
    });

    // ---- avvisi ----
    if (opts.dates === 'keep') report.warnings.push('Le date delle visite sono esatte: insieme ad altri dati possono permettere di risalire alla persona.');
    if (opts.birth === 'keep') report.warnings.push('La data di nascita è esatta: è un dato identificativo.');
    if (!opts.removeFreeText) report.warnings.push('I testi liberi sono mantenuti: possono contenere nomi, luoghi o dettagli identificativi.');
    if (!opts.maskIdentifiers) report.warnings.push('Il controllo automatico dei nomi nei testi è disattivato.');
    if (opts.includeProfessional) report.warnings.push('Sono inclusi i dati del professionista.');
    ['nome', 'cognome', 'cf', 'cellulare', 'email', 'indirizzo'].forEach((k) => {
        if (!opts.removeFields[k])
            report.warnings.push(`Il campo "${PATIENT_FIELDS.find((f) => f.key === k).label}" è mantenuto: identifica direttamente il paziente.`);
    });
    report.warnings.push(
        'Anche senza nomi, combinazioni rare (età, patologia, città) possono rendere identificabile una persona. Condividi solo lo stretto necessario.'
    );
    return { db, keyTable, report };
};
