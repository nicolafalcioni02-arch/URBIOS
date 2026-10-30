// Modello dati dell'allenamento.
//
//   paziente.allenamento = {
//     attiva: <id scheda aperta per ultima>,
//     schede: [ { id, titolo, cliente, obiettivo, data, updatedAt,
//                 weeks: [ { id, title, days: [ { id, title, collapsed, exercises: [ { id, name, group, sets: [ { id, reps, rec, note } ] } ] } ] } ] } ]
//   }
export const genId = () => 'id-' + Math.random().toString(36).slice(2, 11);

// serie: reps (anche "8-12" o "45''"), load (kg), pct (% del 1RM), rpe (1-10), tempo ("3-1-1-0"), rec (recupero), note, tipo ('' lavoro | 'riscaldamento' | 'drop')
export const blankSet = () => ({ id: genId(), reps: '', load: '', pct: '', rpe: '', tempo: '', rec: '', note: '', tipo: '' });
// esercizio: ss = sigla di superserie (es. "A": gli esercizi consecutivi con la stessa sigla si eseguono in sequenza), note, met (solo cardio)
export const blankExercise = () => ({ id: genId(), name: '', group: '', ss: '', note: '', sets: [blankSet(), blankSet(), blankSet()] });
// giorno: minutes (durata reale/stimata manuale), sessionRpe (sforzo percepito della seduta, scala 1-10), note
export const blankDay = () => ({ id: genId(), title: '', collapsed: false, minutes: '', sessionRpe: '', note: '', exercises: [blankExercise()] });
// settimana: kind = '' | 'deload' (scarico)
export const blankWeek = (n = 1) => ({ id: genId(), title: `Settimana ${n}`, kind: '', note: '', days: [blankDay()] });

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const defaultHeader = (patient) => ({
    titolo: '',
    cliente: patient ? `${patient.nome || ''} ${patient.cognome || ''}`.trim() : '',
    obiettivo: '',
    tipo: '', // tipo di obiettivo (forza, ipertrofia, ...): guida le linee guida e gli avvisi
    livello: '', // principiante | intermedio | avanzato
    extraMin: 10, // minuti di riscaldamento generale + defaticamento per seduta
    data: todayIso(),
    stato: 'draft', // da creare | da finire | pronta da inviare | consegnata | da modificare | attiva (come la Dieta)
});

// vero se la scheda è ancora quella "vuota" di partenza (così aprire la scheda Allenamento non segna modifiche)
export const isBlankPlan = (weeks) =>
    weeks.length <= 1 &&
    weeks.every(
        (w) =>
            w.days.length <= 1 &&
            w.days.every((d) => !d.title && d.exercises.every((e) => !e.name && !e.group && e.sets.every((s) => !s.reps && !s.rec && !s.note)))
    );

// copia profonda con nuovi ID (per duplicare una scheda)
export const cloneWeeks = (weeks) =>
    JSON.parse(JSON.stringify(weeks)).map((w) => ({
        ...w,
        id: genId(),
        days: w.days.map((d) => ({
            ...d,
            id: genId(),
            exercises: d.exercises.map((e) => ({ ...e, id: genId(), sets: e.sets.map((s) => ({ ...s, id: genId() })) })),
        })),
    }));

export const getSchede = (patient) => (patient && patient.allenamento && Array.isArray(patient.allenamento.schede) ? patient.allenamento.schede : []);

export const pickActiveScheda = (patient) => {
    const list = getSchede(patient);
    return list.find((s) => s.id === (patient.allenamento || {}).attiva) || list[0] || null;
};

// restituisce il nuovo db con la scheda inserita/aggiornata
export const upsertScheda = (db, patientId, scheda) => ({
    ...db,
    pazienti: db.pazienti.map((p) => {
        if (String(p.id) !== String(patientId)) return p;
        const list = getSchede(p);
        const exists = list.some((s) => s.id === scheda.id);
        const schede = exists ? list.map((s) => (s.id === scheda.id ? scheda : s)) : [...list, scheda];
        return { ...p, allenamento: { ...(p.allenamento || {}), schede, attiva: scheda.id } };
    }),
});

export const removeScheda = (db, patientId, schedaId, nextActive) => ({
    ...db,
    pazienti: db.pazienti.map((p) =>
        String(p.id) !== String(patientId)
            ? p
            : { ...p, allenamento: { ...(p.allenamento || {}), schede: getSchede(p).filter((s) => s.id !== schedaId), attiva: nextActive || undefined } }
    ),
});

export const setAttiva = (db, patientId, schedaId) => ({
    ...db,
    pazienti: db.pazienti.map((p) => (String(p.id) !== String(patientId) ? p : { ...p, allenamento: { ...(p.allenamento || {}), attiva: schedaId } })),
});

// riepilogo di una scheda per elenchi e stampa
export const summarize = (scheda) => {
    const weeks = scheda.weeks || [];
    const days = weeks.reduce((a, w) => a + w.days.length, 0);
    const exercises = weeks.reduce((a, w) => a + w.days.reduce((b, d) => b + d.exercises.filter((e) => e.name).length, 0), 0);
    return { weeks: weeks.length, days, exercises };
};

// "3 × 10" se uguali, altrimenti "12 / 10 / 8"; stessa logica per carico, %1RM, RPE, tempo e recupero
const uniq = (arr) => [...new Set(arr)];
const join = (vals) => {
    const f = vals.map((v) => String(v === undefined || v === null ? '' : v).trim());
    if (!f.some(Boolean)) return '';
    return uniq(f).length === 1 ? f[0] : f.map((x) => x || '–').join(' / ');
};
export const summarizeSets = (allSets) => {
    const warm = allSets.filter((s) => s.tipo === 'riscaldamento');
    const drops = allSets.filter((s) => s.tipo === 'drop');
    // le serie "drop" si indicano a parte (+ N drop): le serie principali restano leggibili
    const sets = allSets.filter((s) => s.tipo !== 'riscaldamento' && (s.tipo !== 'drop' || allSets.every((x) => x.tipo === 'drop' || x.tipo === 'riscaldamento')));
    const reps = sets.map((s) => String(s.reps || '').trim());
    const filled = reps.filter(Boolean);
    const rec = uniq(sets.map((s) => String(s.rec || '').trim()).filter(Boolean));
    const notes = uniq(sets.map((s) => String(s.note || '').trim()).filter(Boolean));
    let serie = '';
    if (sets.length) {
        if (filled.length === 0) serie = `${sets.length} serie`;
        else if (uniq(reps).length === 1) serie = `${sets.length} × ${reps[0]}`;
        else serie = `${sets.length} serie: ${reps.map((r) => r || '–').join(' / ')}`;
    }
    if (drops.length && sets.length && !sets.includes(drops[0])) serie += ` + ${drops.length} drop`;
    if (warm.length) serie += `${serie ? ' ' : ''}(+${warm.length} risc.)`;
    return {
        serie,
        rec: rec.join(' / '),
        notes,
        load: join(sets.map((s) => s.load)),
        pct: join(sets.map((s) => s.pct)),
        rpe: join(sets.map((s) => s.rpe)),
        tempo: join(sets.map((s) => s.tempo)),
    };
};

// ---- massimali (1RM) del cliente: paziente.allenamento.massimali = { [nome esercizio normalizzato]: { name, kg, date, method } } ----
export const getMassimali = (patient) => (patient && patient.allenamento && patient.allenamento.massimali) || {};
export const setMassimali = (db, patientId, massimali) => ({
    ...db,
    pazienti: db.pazienti.map((p) => (String(p.id) !== String(patientId) ? p : { ...p, allenamento: { ...(p.allenamento || {}), massimali } })),
});

// dati del cliente per i calcolatori (peso, altezza, età, sesso) presi dall'anagrafica e dall'ultima visita
export const getProfile = (patient) => {
    if (!patient) return null;
    const visits = [...(patient.visite || [])].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const num = (v) => {
        const n = parseFloat(String(v === undefined || v === null ? '' : v).replace(',', '.'));
        return Number.isFinite(n) && n > 0 ? n : null;
    };
    const withWeight = visits.find((v) => num(v.peso));
    const withHeight = visits.find((v) => v.dettagli && num(v.dettagli.altezza));
    let age = null;
    if (patient.dataNascita) {
        const b = new Date(patient.dataNascita);
        if (!Number.isNaN(b.getTime())) age = Math.floor((Date.now() - b.getTime()) / (365.2425 * 24 * 3600 * 1000));
    }
    return {
        weightKg: withWeight ? num(withWeight.peso) : null,
        heightCm: withHeight ? num(withHeight.dettagli.altezza) : null,
        age,
        sex: String(patient.sesso || 'M').toUpperCase() === 'F' ? 'F' : 'M',
    };
};
