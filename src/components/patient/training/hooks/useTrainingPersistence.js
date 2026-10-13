import { useEffect, useState } from 'react';
import {
    blankWeek,
    cloneWeeks,
    defaultHeader,
    genId,
    getMassimali,
    getSchede,
    isBlankPlan,
    pickActiveScheda,
    removeScheda,
    setAttiva,
    setMassimali,
    upsertScheda,
} from '../logic/trainingModel';
import { normName } from '../logic/exerciseMedia';

const HEADER_KEYS = ['titolo', 'cliente', 'obiettivo', 'tipo', 'livello', 'extraMin', 'data', 'stato'];

// La scheda aperta (weeks + intestazione) vive nello stato React per una modifica fluida; ogni modifica viene
// riportata nell'archivio in `paziente.allenamento.schede`. I massimali (1RM) sono per cliente: `paziente.allenamento.massimali`.
export const useTrainingPersistence = ({ patient, onUpdateDb }) => {
    const headerOf = (s) => ({
        ...defaultHeader(patient),
        titolo: s.titolo || '',
        cliente: s.cliente || '',
        obiettivo: s.obiettivo || '',
        tipo: s.tipo || '',
        livello: s.livello || '',
        extraMin: s.extraMin ?? 10,
        data: s.data || '',
        stato: s.stato || 'draft',
    });

    const initial = patient ? pickActiveScheda(patient) : null;
    const [schedaId, setSchedaId] = useState(() => (initial ? initial.id : genId()));
    const [weeks, setWeeks] = useState(() => (initial && initial.weeks && initial.weeks.length ? initial.weeks : [blankWeek(1)]));
    const [header, setHeader] = useState(() => (initial ? headerOf(initial) : defaultHeader(patient)));

    // riporta nell'archivio ogni modifica
    useEffect(() => {
        if (!patient || !onUpdateDb) return;
        const existing = getSchede(patient).find((s) => s.id === schedaId);
        const untouched = isBlankPlan(weeks) && !header.obiettivo && !header.titolo && !header.tipo && !header.livello;
        if (!existing && untouched) return; // scheda vuota mai modificata: non toccare l'archivio
        if (existing && existing.weeks === weeks && HEADER_KEYS.every((k) => (existing[k] ?? '') === (header[k] ?? ''))) return;
        onUpdateDb((prev) => upsertScheda(prev, patient.id, { id: schedaId, ...header, weeks, updatedAt: new Date().toISOString() }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weeks, header, schedaId]);

    const load = (s) => {
        setSchedaId(s.id);
        setWeeks(s.weeks && s.weeks.length ? s.weeks : [blankWeek(1)]);
        setHeader(headerOf(s));
    };

    const openScheda = (id) => {
        const s = getSchede(patient).find((x) => x.id === id);
        if (!s) return;
        load(s);
        onUpdateDb && onUpdateDb((prev) => setAttiva(prev, patient.id, id));
    };

    const newScheda = () => {
        setSchedaId(genId());
        setWeeks([blankWeek(1)]);
        setHeader(defaultHeader(patient));
    };

    const duplicateScheda = (id) => {
        const src = id === schedaId ? { ...header, weeks } : getSchede(patient).find((x) => x.id === id);
        if (!src) return;
        const copy = {
            id: genId(),
            titolo: (src.titolo || 'Scheda') + ' (copia)',
            cliente: src.cliente,
            obiettivo: src.obiettivo,
            tipo: src.tipo,
            livello: src.livello,
            extraMin: src.extraMin,
            data: src.data,
            stato: 'draft',
            weeks: cloneWeeks(src.weeks),
            updatedAt: new Date().toISOString(),
        };
        onUpdateDb && onUpdateDb((prev) => upsertScheda(prev, patient.id, copy));
        load(copy);
    };

    const deleteScheda = (id) => {
        const rest = getSchede(patient).filter((x) => x.id !== id);
        onUpdateDb && onUpdateDb((prev) => removeScheda(prev, patient.id, id, rest[0] && rest[0].id));
        if (id === schedaId) rest[0] ? load(rest[0]) : newScheda();
    };

    // massimali (1RM) del cliente, validi per tutte le sue schede
    const massimali = getMassimali(patient);
    const saveMassimale = (name, kg, method = 'manuale') => {
        const k = normName(name);
        if (!k || !(Number(kg) > 0) || !onUpdateDb) return;
        const rec = { name, kg: Number(kg), date: new Date().toISOString().slice(0, 10), method };
        onUpdateDb((prev) => {
            const p = prev.pazienti.find((x) => String(x.id) === String(patient.id));
            return setMassimali(prev, patient.id, { ...getMassimali(p), [k]: rec });
        });
    };
    const deleteMassimale = (name) => {
        const k = normName(name);
        onUpdateDb &&
            onUpdateDb((prev) => {
                const p = prev.pazienti.find((x) => String(x.id) === String(patient.id));
                const m = { ...getMassimali(p) };
                delete m[k];
                return setMassimali(prev, patient.id, m);
            });
    };

    // apre una scheda costruita altrove (libro schede, AI): si salva da sola nell'archivio come ogni modifica
    const loadScheda = (s) => load({ id: genId(), titolo: '', ...s });

    return { schedaId, weeks, setWeeks, header, setHeader, loadScheda, openScheda, newScheda, duplicateScheda, deleteScheda, massimali, saveMassimale, deleteMassimale };
};
