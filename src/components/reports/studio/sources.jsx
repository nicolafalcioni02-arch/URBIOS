import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getInitialContent } from '../reportPreview/logic/buildReportHtml';
import { buildLetterHtml } from '../letterHtml';
import { DietDocBody } from '../../patient/diet/printReport/dietDocument';
import { planDateInfo, planLabel } from '../../patient/diet/guided/guidedLogic';
import { fmtLong } from '../../patient/shared/planCommon';
import { TrainingDocBody, TRAINING_DEFAULT_OPTS } from '../../patient/training/print/TrainingDocBody';
import { getMassimali, getProfile, getSchede, pickActiveScheda } from '../../patient/training/logic/trainingModel';
import { defaultDB } from '../../patient/training/data/defaultExerciseDB';

// Le sezioni che si possono mettere nel report. Ognuna sa dire se ha dati e produrre il proprio HTML.
export const SOURCE_TYPES = {
    visita: { label: 'Report visita', icon: 'ph-clipboard-text' },
    dieta: { label: 'Piano alimentare', icon: 'ph-fork-knife' },
    training: { label: 'Scheda di allenamento', icon: 'ph-barbell' },
    lettera: { label: 'Lettera di incarico e privacy', icon: 'ph-file-signature' },
};

const fresh = (db, patient) => (db?.pazienti || []).find((p) => String(p.id) === String(patient?.id)) || patient || {};
const dietVisits = (p) => (p.visite || []).filter((v) => v.dettagli?.diet_plan_data?.length);

// { ok, reason } per la sezione richiesta
export const availability = (type, { patient, db, visitDraft }) => {
    const p = fresh(db, patient);
    if (type === 'visita') return visitDraft ? { ok: true } : { ok: false, reason: 'Disponibile dalla Nuova visita' };
    if (type === 'dieta') return dietVisits(p).length ? { ok: true } : { ok: false, reason: 'Nessun piano alimentare salvato' };
    if (type === 'training') return getSchede(p).length ? { ok: true } : { ok: false, reason: 'Nessuna scheda di allenamento salvata' };
    return { ok: true };
};

// opzioni modificabili di una sezione (null = nessuna) e i valori iniziali
export const defaultOptions = (type, ctx) => {
    if (type === 'training') return { ...TRAINING_DEFAULT_OPTS, schedaId: pickActiveScheda(fresh(ctx.db, ctx.patient))?.id || '' };
    if (type === 'dieta') return { visitId: dietVisits(fresh(ctx.db, ctx.patient))[0]?.id || '' };
    return null;
};

export const optionChoices = (type, { patient, db }, opts) => {
    const p = fresh(db, patient);
    if (type === 'training') {
        const schede = getSchede(p);
        const cur = schede.find((s) => s.id === opts?.schedaId) || pickActiveScheda(p);
        return {
            schede: schede.map((s) => ({ id: s.id, label: s.titolo || s.obiettivo || 'Scheda senza titolo' })),
            weeks: ((cur && cur.weeks) || []).map((w, i) => ({ id: w.id, label: w.title || `Settimana ${i + 1}` })),
        };
    }
    if (type === 'dieta') return { visite: dietVisits(p).map((v) => ({ id: v.id, label: planLabel(v) })) };
    return {};
};

export const buildSectionHtml = (type, opts, { patient, db, visitDraft }) => {
    const p = fresh(db, patient);
    const professional = db?.utente || {};
    if (type === 'visita') return getInitialContent({ patient: p, professionalData: professional, visitDraft });
    if (type === 'lettera') return buildLetterHtml({ patient: p, professional });
    if (type === 'dieta') {
        const v = dietVisits(p).find((x) => x.id === opts?.visitId) || dietVisits(p)[0];
        if (!v) return '<p>Nessun piano alimentare.</p>';
        const d = planDateInfo(v);
        const issueDate = d.none ? '' : d.iso ? fmtLong(d.iso) : undefined;
        const dt = v.dettagli;
        return renderToStaticMarkup(
            <DietDocBody patient={p} professionalData={professional} dietDays={dt.diet_plan_data} targets={dt.diet_targets} savedReports={dt.diet_saved_reports || []} issueDate={issueDate} />
        );
    }
    if (type === 'training') {
        const schede = getSchede(p);
        const s = schede.find((x) => x.id === opts?.schedaId) || pickActiveScheda(p);
        if (!s) return '<p>Nessuna scheda.</p>';
        const exerciseDB = db?.training_exercise_db?.length ? db.training_exercise_db : defaultDB;
        const header = { titolo: s.titolo || '', cliente: s.cliente || `${p.nome || ''} ${p.cognome || ''}`.trim(), obiettivo: s.obiettivo || '', tipo: s.tipo || '', livello: s.livello || '', extraMin: s.extraMin ?? 10, data: s.data || '' };
        return renderToStaticMarkup(
            <div className="tp-embed">
                <TrainingDocBody header={header} weeks={s.weeks || []} exerciseDB={exerciseDB} massimali={getMassimali(p)} profile={getProfile(p)} professional={professional} opts={opts} />
            </div>
        );
    }
    return '';
};
