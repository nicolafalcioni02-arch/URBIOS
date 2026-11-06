// Scheda di allenamento di URBIOS → corpo del documento. PURO: `summarizeSets` viene passata dal chiamante
// (è la funzione già usata per la stampa), così qui non si importa codice dell'interfaccia.
// Non si inviano: nome/obiettivo del cliente (`cliente`, `obiettivo`), massimali, foto.
const txt = (x, max = 200) => String(x ?? '').trim().slice(0, max);

export const trainingToDocument = ({ scheda, summarizeSets }) => {
    const settimane = (scheda?.weeks || []).map((w, wi) => ({
        titolo: txt(w.title) || `Settimana ${wi + 1}`,
        scarico: w.kind === 'deload',
        nota: txt(w.note, 500),
        giorni: (w.days || []).map((d, di) => ({
            titolo: txt(d.title) || `Giorno ${di + 1}`,
            nota: txt(d.note, 500),
            esercizi: (d.exercises || []).filter((e) => txt(e.name)).map((e) => {
                const s = summarizeSets(e.sets || []);
                return { nome: txt(e.name), ss: txt(e.ss, 8), serie: txt(s.serie), carico: txt(s.load, 60), pct: txt(s.pct, 60), rpe: txt(s.rpe, 60), tempo: txt(s.tempo, 60), rec: txt(s.rec, 60), note: txt([e.note, ...(s.notes || [])].filter(Boolean).join(' · '), 500) };
            }),
        })).filter((d) => d.esercizi.length),
    })).filter((w) => w.giorni.length);
    if (!settimane.length) throw new Error('La scheda è vuota: compila almeno un esercizio.');
    return { kind: 'training', title: txt(scheda.titolo, 120) || 'Scheda di allenamento', body: { settimane } };
};
