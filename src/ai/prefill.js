// URBIOS AI — risposte già note: la scheda del paziente, l'ultima visita e le sessioni AI precedenti.
// Servono a precompilare l'intervista: se i dati ci sono, basta confermarli o correggerli.
const str = (v) => (Array.isArray(v) ? v.join(', ') : v === undefined || v === null ? '' : String(v)).trim();
const dmy = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const prefillAnswers = (patient) => {
    const answers = {};
    const source = {};
    const set = (id, val, src) => {
        const v = str(val);
        if (v && !answers[id]) {
            answers[id] = v;
            source[id] = src;
        }
    };
    // 1) campi strutturati della scheda e ultima visita clinica (i più aggiornati: l'AI li ha scritti lì)
    set('obiettivo', patient.obiettivo, 'dalla scheda');
    set('patologie', patient.patologie, 'dalla scheda');
    set('farmaci', patient.farmaci, 'dalla scheda');
    set('allergie', patient.allergie, 'dalla scheda');
    set('familiarita', patient.anamnesi_familiare, 'dalla scheda');
    const last = (patient.visite || []).find((v) => v.dettagli && !String(v.note || '').includes('Solo Dieta'));
    if (last) {
        const d = last.dettagli;
        const from = `dalla visita del ${dmy(last.data)}`;
        set('sonno', d.ore_sonno ? `${d.ore_sonno} ore` : '', from);
        set('stress', d.stress, from);
        set('attivita', d.Attivita_Fisica, from);
        set('intestino', d.alvo, from);
    }
    // 2) le risposte dell'ultima sessione AI (per le domande senza un campo proprio: stile di vita, alimentazione, preferenze…)
    const prev = patient.ai_answers;
    if (prev && prev.answers) Object.entries(prev.answers).forEach(([id, v]) => set(id, v, `dalla sessione AI del ${dmy(prev.date)}`));
    return { answers, source };
};

// Memorizza le risposte (unendo quelle vecchie con le nuove) per la prossima volta.
export const mergeAnswers = (patient, answers) => {
    const clean = Object.fromEntries(Object.entries(answers).filter(([, v]) => String(v || '').trim()));
    if (!Object.keys(clean).length) return null;
    return { date: new Date().toISOString().slice(0, 10), answers: { ...((patient.ai_answers && patient.ai_answers.answers) || {}), ...clean } };
};
