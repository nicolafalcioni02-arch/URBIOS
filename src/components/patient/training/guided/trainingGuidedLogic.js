// Training guidato — logica pura (niente React).
import { blankDay, blankWeek, cloneWeeks, getSchede, summarize } from '../logic/trainingModel';
import { GOALS, LEVELS, goalById } from '../logic/science/guidelines';
import { genId, todayIso } from '../../shared/planCommon';

export { genId, todayIso };

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Struttura vuota: N settimane da M sedute; l'ultima può essere di scarico.
export const buildStructure = ({ weeks, sessions, deload }) =>
    Array.from({ length: weeks }, (_, i) => ({
        ...blankWeek(i + 1),
        kind: deload && weeks >= 4 && i === weeks - 1 ? 'deload' : '',
        days: Array.from({ length: sessions }, (_, j) => ({ ...blankDay(), title: `Giorno ${LETTERS[j] || j + 1}` })),
    }));

export const move = (arr, from, to) => {
    if (from === to || to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    return next;
};

export const goalShort = (id) => (goalById(id) ? goalById(id).label.split(' (')[0].split(' / ')[0] : '');
export const levelShort = (id) => {
    const l = LEVELS.find((x) => x.id === id);
    return l ? l.label.split(' (')[0] : '';
};

export const schedaTitle = (h) => h.titolo || (h.tipo ? `Scheda ${goalShort(h.tipo).toLowerCase()}` : 'Scheda senza nome');
export const schedaLabel = (h) => `${schedaTitle(h)}${h.data ? ' · ' + new Date(h.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`;
export const schedaSummary = (s) => {
    const m = summarize(s);
    return `${m.weeks} ${m.weeks === 1 ? 'settimana' : 'settimane'} · ${m.days} ${m.days === 1 ? 'seduta' : 'sedute'} · ${m.exercises} esercizi`;
};

// testo leggibile della scheda (per i prompt di aiuto)
export const schedaText = (weeks) =>
    weeks
        .slice(0, 2)
        .map(
            (w) =>
                `${w.title}${w.kind === 'deload' ? ' (scarico)' : ''}:\n` +
                w.days
                    .map(
                        (d) =>
                            `  ${d.title || 'Giorno'}: ` +
                            (d.exercises
                                .filter((e) => e.name)
                                .map((e) => {
                                    const work = e.sets.filter((s) => s.tipo !== 'riscaldamento');
                                    return `${e.name} ${work.length}×${work[0]?.reps || '?'}${work[0]?.rpe ? ' RPE' + work[0].rpe : ''}`;
                                })
                                .join('; ') || '(vuoto)')
                    )
                    .join('\n')
        )
        .join('\n') + (weeks.length > 2 ? `\n(+ altre ${weeks.length - 2} settimane)` : '');

// ---- libro delle schede ----
export const bookEntryFrom = ({ id, name, note, header, weeks }) => ({
    id: id || 'tbook-' + Date.now(),
    name: String(name || '').trim() || 'Scheda senza nome',
    note: String(note || '').trim(),
    savedAt: todayIso(),
    tipo: header.tipo || '',
    livello: header.livello || '',
    obiettivo: header.obiettivo || '',
    extraMin: header.extraMin ?? 10,
    weeks: cloneWeeks(weeks),
});

// Una voce del libro diventa una scheda per QUESTO paziente (nuovi id, nome del cliente corrente).
export const schedaFromBook = (entry, patient) => ({
    titolo: entry.name,
    cliente: `${patient.nome || ''} ${patient.cognome || ''}`.trim(),
    obiettivo: entry.obiettivo,
    tipo: entry.tipo,
    livello: entry.livello,
    extraMin: entry.extraMin,
    data: todayIso(),
    stato: 'draft',
    weeks: cloneWeeks(entry.weeks),
    updatedAt: new Date().toISOString(),
});

export { GOALS, LEVELS, getSchede };
