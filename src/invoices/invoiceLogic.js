// Fatture: ogni fattura è una FOTOGRAFIA (emittente, cliente, righe, aliquote) salvata in patient.fatture.
// Cambiare dopo il profilo o l'anagrafica non altera quelle già emesse: si può sempre ristampare identica.

export const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};
export const euro = (v) => num(v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
export const BOLLO = 2;

// Listino: le prestazioni che si fatturano di solito. Il prezzo viene da Impostazioni → Fatturazione → Nuove fatture.
export const SERVICES = [
    { id: 'prima', label: 'Prima visita', key: 'fatt_prezzo_prima' },
    { id: 'controllo', label: 'Visita di controllo', key: 'fatt_prezzo_controllo' },
    { id: 'dieta', label: 'Piano alimentare', key: 'fatt_prezzo_dieta' },
    { id: 'training', label: 'Piano di allenamento', key: 'fatt_prezzo_training' },
];
export const serviceRow = (id, prof = {}, when = '') => {
    const s = SERVICES.find((x) => x.id === id);
    return { desc: `${s.label}${when ? ` del ${when}` : ''}`, qta: 1, prezzo: String(prof[s.key] || prof.fatt_tariffa || '') };
};
export const STATES = [
    { id: 'da_incassare', label: 'Da incassare', tone: 'warn' },
    { id: 'pagata', label: 'Pagata', tone: 'ok' },
    { id: 'annullata', label: 'Annullata', tone: 'bad' },
];
export const stateOf = (inv) => STATES.find((s) => s.id === inv.stato) || STATES[0];

export const computeTotals = (inv) => {
    const imponibile = (inv.righe || []).reduce((s, r) => s + num(r.qta || 1) * num(r.prezzo), 0);
    const rivalsa = (imponibile * num(inv.rivalsaPerc)) / 100;
    const base = imponibile + rivalsa;
    const iva = (base * num(inv.ivaPerc)) / 100;
    const bollo = inv.bollo ? BOLLO : 0;
    return { imponibile, rivalsa, base, iva, bollo, totale: base + iva + bollo };
};

// tutte le fatture dell'archivio, con il paziente, dalla più recente
export const allInvoices = (db) =>
    (db?.pazienti || [])
        .flatMap((p) => (p.fatture || []).map((inv) => ({ inv, patient: p })))
        .sort((a, b) => String(b.inv.data).localeCompare(String(a.inv.data)) || b.inv.numero - a.inv.numero);

// numero progressivo dell'anno su tutto l'archivio
export const nextNumber = (db, year) => 1 + Math.max(0, ...allInvoices(db).filter((x) => x.inv.anno === year).map((x) => x.inv.numero || 0));
export const label = (inv) => `${inv.prefisso || ''}${inv.numero}/${inv.anno}`;

const join = (...a) => a.filter(Boolean).join(' ');

// nuova fattura per una visita, con i valori predefiniti del profilo (Impostazioni → Fatturazione)
export const draftInvoice = (patient, prof = {}, visit = null, menu = null, service = null) => {
    const data = new Date().toISOString().slice(0, 10);
    const when = visit?.data ? new Date(visit.data).toLocaleDateString('it-IT') : '';
    const forf = (prof.regime_fiscale || '') === 'Forfettario';
    return {
        id: `fat_${Date.now()}`,
        data,
        anno: Number(data.slice(0, 4)),
        visitaId: visit ? String(visit.id) : '',
        menuId: menu ? menu.id : '',
        righe: [service ? serviceRow(service, prof, when) : { desc: menu ? `Servizio menù «${menu.title || 'senza titolo'}»${menu.event?.name ? ` · ${menu.event.name}` : ''}${menu.event?.date ? ` del ${new Date(menu.event.date).toLocaleDateString('it-IT')}` : ''}` : visit ? `Visita${when ? ` del ${when}` : ''}` : 'Prestazione professionale', qta: 1, prezzo: String(prof.fatt_tariffa || '') }],
        // il servizio di menù non è una prestazione sanitaria: IVA ordinaria (salvo forfettario) e niente nota di esenzione
        ivaPerc: String(menu ? (forf ? 0 : 22) : prof.fatt_iva ?? (forf ? 0 : 22)),
        rivalsaPerc: String(prof.fatt_rivalsa ?? 0),
        bollo: forf,
        metodo: String(prof.metodi_pagamento || '').split(',')[0].trim(),
        stato: 'da_incassare',
        scadenza: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        note: (menu ? '' : prof.note_fattura) || (forf ? 'Operazione effettuata ai sensi dell’art. 1, commi 54-89, L. 190/2014 (regime forfettario).' : ''),
    };
};

// fotografia di emittente e cliente al momento dell'emissione
export const snapshotParties = (patient, prof = {}) => ({
    emittente: {
        nome: join(prof.nome, prof.cognome),
        titolo: prof.titolo_professionale || '',
        indirizzo: join(prof.indirizzo_studio, prof.citta_studio),
        piva: prof.p_iva || '',
        cf: prof.codice_fiscale || '',
        regime: prof.regime_fiscale || '',
        albo: prof.ordine_appartenenza ? join(prof.ordine_appartenenza, prof.numero_albo && `n. ${prof.numero_albo}`) : '',
        iban: prof.iban || '',
        banca: prof.banca || '',
        sdi: prof.codice_sdi || '',
        pec: prof.pec_fatturazione || '',
        contatti: [prof.telefono, prof.email].filter(Boolean).join(' · '),
        logo: prof.logo_url || '',
    },
    cliente: {
        nome: join(patient.nome, patient.cognome),
        cf: patient.cf || '',
        indirizzo: join(patient.indirizzo, patient.citta),
        email: patient.email || '',
    },
});

// salva (nuova o modificata) la fattura nella scheda del paziente; il numero si assegna una volta sola
export const saveInvoice = (onUpdateDb, patientId, inv, prof, patient) =>
    onUpdateDb((prev) => ({
        ...prev,
        pazienti: prev.pazienti.map((p) => {
            if (p.id !== patientId) return p;
            const list = p.fatture || [];
            const exists = list.some((x) => x.id === inv.id);
            const full = exists ? { ...inv } : { ...inv, numero: nextNumber(prev, inv.anno), prefisso: prof?.fatt_prefisso || '', ...snapshotParties(patient || p, prof) };
            return { ...p, fatture: exists ? list.map((x) => (x.id === inv.id ? full : x)) : [...list, full] };
        }),
    }));

export const removeInvoice = (onUpdateDb, patientId, id) =>
    onUpdateDb((prev) => ({ ...prev, pazienti: prev.pazienti.map((p) => (p.id === patientId ? { ...p, fatture: (p.fatture || []).filter((x) => x.id !== id) } : p)) }));
