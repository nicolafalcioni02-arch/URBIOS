// Riconosce cosa contiene un file e lo trasforma in "dati in arrivo" pronti per mergeIncoming.
import { parseArchiveText, openEncrypted } from '../../storage/archiveFile';
import { normalizeDb } from '../../storage/schema';
import { analyzeCsv, csvToPatients, csvToVisitPatients, csvToFoods, csvToExercises, csvToFormulas } from './csvImport';

export const KIND_LABEL = {
    archivio: 'Archivio URBIOS',
    esportazione: 'Esportazione URBIOS (dati_completi.json)',
    pazienti: 'Tabella pazienti (CSV)',
    visite: 'Tabella visite (CSV)',
    alimenti: 'Database alimenti',
    esercizi: 'Database esercizi',
    formule: 'Formule',
    sconosciuto: 'Formato non riconosciuto',
};

const listKind = (arr) => {
    const f = arr.find((x) => x && typeof x === 'object');
    if (!f) return 'sconosciuto';
    if ('titolo' in f && 'equazione' in f) return 'formule';
    if ('name' in f && 'group' in f && !('kcal' in f)) return 'esercizi';
    if ('name' in f && ('kcal' in f || 'energy_kcal' in f)) return 'alimenti';
    return 'sconosciuto';
};

const fromList = (kind, arr) => {
    if (kind === 'alimenti') return { diet_food_db: arr };
    if (kind === 'esercizi') return { training_exercise_db: arr };
    if (kind === 'formule') return { formule: arr };
    return null;
};

// Restituisce { kind, incoming, summary } oppure { needsSecret:true } per archivi cifrati.
export const analyzeText = async (text, name = '', secret = null, which = 'pwd') => {
    const trimmed = text.replace(/^﻿/, '').trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        let obj;
        try {
            obj = JSON.parse(trimmed);
        } catch {
            return { kind: 'sconosciuto', incoming: null };
        }
        if (Array.isArray(obj)) {
            const kind = listKind(obj);
            const incoming = fromList(kind, obj);
            return { kind, incoming };
        }
        if (obj && obj.format === 'URBIOS-EXPORT' && obj.data) return { kind: 'esportazione', incoming: normalizeDb(obj.data), anonymized: !!obj.anonymized };
        const parsed = parseArchiveText(trimmed); // lancia NOT_URBIOS / TOO_NEW
        if (parsed.encrypted) {
            if (!secret) return { needsSecret: true };
            const { db } = await openEncrypted(parsed, secret, which); // lancia WRONG_SECRET
            return { kind: 'archivio', incoming: normalizeDb(db) };
        }
        return { kind: 'archivio', incoming: normalizeDb(parsed.data) };
    }
    const { kind, rows } = analyzeCsv(text);
    if (kind === 'pazienti') return { kind, incoming: { pazienti: csvToPatients(rows) } };
    if (kind === 'visite') return { kind, incoming: { pazienti: csvToVisitPatients(rows) } };
    if (kind === 'alimenti') return { kind, incoming: { diet_food_db: csvToFoods(rows) } };
    if (kind === 'esercizi') return { kind, incoming: { training_exercise_db: csvToExercises(rows) } };
    if (kind === 'formule') return { kind, incoming: { formule: csvToFormulas(rows) } };
    return { kind: 'sconosciuto', incoming: null };
};
