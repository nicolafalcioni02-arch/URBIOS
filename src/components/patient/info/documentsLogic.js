// Documenti da far firmare al paziente e loro stato. Salvati in patient.documenti = { [id]: { stato, dataConsegna, dataFirma } }
export const DOCS = [
    { id: 'incarico', label: 'Lettera di incarico', hint: 'Contratto di prestazione professionale', icon: 'ph-file-signature' },
    { id: 'privacy', label: 'Informativa e consenso privacy', hint: 'Trattamento dati (GDPR)', icon: 'ph-shield-check' },
];

export const STATI = [
    { id: 'da_consegnare', label: 'Da consegnare' },
    { id: 'consegnato', label: 'Consegnato' },
    { id: 'firmato', label: 'Firmato' },
];

export const oggi = () => new Date().toLocaleDateString('en-CA');

export const docOf = (patient, id) => patient.documenti?.[id] || { stato: 'da_consegnare' };

// campi anagrafici che finiscono nella lettera: se mancano restano righe vuote da compilare a penna
export const LETTER_FIELDS = [
    ['nome', 'nome'],
    ['cognome', 'cognome'],
    ['luogoNascita', 'luogo di nascita'],
    ['dataNascita', 'data di nascita'],
    ['cf', 'codice fiscale'],
    ['indirizzo', 'indirizzo'],
    ['citta', 'città'],
    ['cap', 'CAP'],
];
export const missingForLetter = (p) => LETTER_FIELDS.filter(([k]) => !String(p[k] || '').trim()).map(([, l]) => l);

export const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const daysSince = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d) ? null : Math.floor((Date.now() - d.getTime()) / 86400000);
};

// riepilogo per la testata: quanti documenti sono firmati
export const docsSummary = (patient) => {
    const firmati = DOCS.filter((d) => docOf(patient, d.id).stato === 'firmato').length;
    return { firmati, totale: DOCS.length, completo: firmati === DOCS.length };
};
