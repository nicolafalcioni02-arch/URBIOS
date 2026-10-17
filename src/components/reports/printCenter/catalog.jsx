import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildLetterHtml } from '../letterHtml';
import { TrainingDocBody, TRAINING_DEFAULT_OPTS } from '../../patient/training/print/TrainingDocBody';
import { getMassimali, getProfile, getSchede, pickActiveScheda } from '../../patient/training/logic/trainingModel';
import { defaultDB } from '../../patient/training/data/defaultExerciseDB';
import { VISIT_VIEWS, buildVisitReportHtml } from './docs/visitReport';
import { PROGRESS_VIEWS, buildProgressHtml } from './docs/progressReport';
import { DIET_DEFAULT_PARTS, DIET_VIEWS, buildDietHtml } from './docs/dietReport';
import { TRAINING_VIEWS, buildTrainingViewHtml } from './docs/trainingViews';
import { COOKBOOK_DEFAULT_OPTS, COOKBOOK_VIEWS, buildCookbookHtml, pickRecipes, recipesOf } from './docs/cookbook';
import { fmtDate, visitsOf } from './logic/visits';

// Tutto quello che si può mettere nel documento. kind: 'flow' = testo impaginato e modificabile,
// 'fixed' = pagine già composte (grafici), 'cover' = copertina con indice.
export const DOC_TYPES = {
    copertina: { label: 'Copertina e indice', icon: 'ph-book-open-text', kind: 'cover', desc: 'Prima pagina elegante con il sommario' },
    visita: { label: 'Report visita', icon: 'ph-clipboard-text', kind: 'flow', desc: 'Indici, misure, esami e valutazione' },
    grafici: { label: 'Grafici corporei', icon: 'ph-chart-pie-slice', kind: 'fixed', desc: 'Corpo 3D, composizione e parametri' },
    andamento: { label: 'I tuoi progressi', icon: 'ph-chart-line-up', kind: 'flow', desc: 'Andamento di tutte le visite' },
    dieta: { label: 'Piano alimentare', icon: 'ph-fork-knife', kind: 'flow', desc: 'Menu, spesa e indicazioni' },
    training: { label: 'Scheda di allenamento', icon: 'ph-barbell', kind: 'flow', desc: 'Esercizi, serie e carichi' },
    ricettario: { label: 'Ricettario', icon: 'ph-cooking-pot', kind: 'flow', desc: 'Le ricette in un libro firmato dallo studio' },
    lettera: { label: 'Incarico e privacy', icon: 'ph-signature', kind: 'flow', desc: 'Da far firmare al paziente' },
    nota: { label: 'Pagina libera', icon: 'ph-note-pencil', kind: 'flow', desc: 'Un foglio bianco da scrivere' },
};
export const TYPE_ORDER = ['copertina', 'visita', 'grafici', 'andamento', 'dieta', 'ricettario', 'training', 'lettera', 'nota'];

// pacchetti pronti: si tengono solo i documenti per cui ci sono dati
export const PRESETS = [
    { id: 'consegna', label: 'Consegna completa', icon: 'ph-package', types: ['copertina', 'visita', 'grafici', 'andamento', 'dieta', 'ricettario', 'training'] },
    { id: 'visita', label: 'Esito della visita', icon: 'ph-clipboard-text', types: ['visita', 'grafici'] },
    { id: 'progressi', label: 'Progressi', icon: 'ph-chart-line-up', types: ['andamento', 'grafici'] },
    { id: 'dieta', label: 'Solo dieta', icon: 'ph-fork-knife', types: ['dieta', 'ricettario'] },
    { id: 'training', label: 'Solo allenamento', icon: 'ph-barbell', types: ['training'] },
    { id: 'prima', label: 'Prima visita', icon: 'ph-handshake', types: ['lettera', 'visita'] },
];

const dietVisits = (p) => [...(p.visite || [])].filter((v) => v.dettagli?.diet_plan_data?.length).sort((a, b) => new Date(b.data) - new Date(a.data));

export const availability = (type, ctx) => {
    const p = ctx.patient;
    const visits = visitsOf(p, ctx.draft);
    if (type === 'visita' || type === 'grafici') return visits.length ? { ok: true } : { ok: false, reason: 'Serve almeno una visita' };
    if (type === 'andamento') return visits.length ? { ok: true } : { ok: false, reason: 'Serve almeno una visita' };
    if (type === 'dieta') return dietVisits(p).length ? { ok: true } : { ok: false, reason: 'Nessun piano alimentare salvato' };
    if (type === 'training') return getSchede(p).length ? { ok: true } : { ok: false, reason: 'Nessuna scheda salvata' };
    if (type === 'ricettario') return recipesOf(ctx.db).length ? { ok: true } : { ok: false, reason: 'Nessuna ricetta salvata' };
    return { ok: true };
};

export const defaultOptions = (type, ctx, hint = {}) => {
    const p = ctx.patient;
    const firstVisit = visitsOf(p, ctx.draft)[0]?.id || '';
    if (type === 'visita') return { visitId: hint.visitId || firstVisit, masthead: true };
    if (type === 'grafici') return { visitId: hint.visitId || firstVisit, page1: true, page2: true };
    if (type === 'andamento') return { charts: true, table: true, masthead: true };
    if (type === 'dieta') {
        const dv = dietVisits(p);
        const id = hint.visitId && dv.some((v) => String(v.id) === String(hint.visitId)) ? hint.visitId : dv[0]?.id || '';
        return { visitId: String(id), parts: { ...DIET_DEFAULT_PARTS } };
    }
    if (type === 'training') return { ...TRAINING_DEFAULT_OPTS, pagePerDay: false, schedaId: hint.schedaId || pickActiveScheda(p)?.id || '' };
    if (type === 'ricettario') return { ...COOKBOOK_DEFAULT_OPTS, visitId: String(dietVisits(p)[0]?.id || '') };
    if (type === 'copertina') return { title: 'Il tuo percorso', subtitle: 'Report personale', index: true, contacts: true };
    if (type === 'nota') return { title: 'Note per te' };
    return {};
};

// riga di dettaglio mostrata sotto il nome del documento
export const describe = (item, ctx) => {
    const p = ctx.patient;
    const o = item.opts || {};
    if (type(item) === 'visita' || type(item) === 'grafici') return visitsOf(p, ctx.draft).find((v) => v.id === String(o.visitId))?.label || '';
    if (type(item) === 'dieta') {
        const v = dietVisits(p).find((x) => String(x.id) === String(o.visitId));
        return v ? `Piano del ${fmtDate(v.data, 'short')}` : '';
    }
    if (type(item) === 'training') {
        const s = getSchede(p).find((x) => x.id === o.schedaId) || pickActiveScheda(p);
        return s ? s.titolo || s.obiettivo || 'Scheda senza titolo' : '';
    }
    if (type(item) === 'andamento') return `${visitsOf(p, ctx.draft).length} visite`;
    if (type(item) === 'copertina') return o.title || '';
    if (type(item) === 'ricettario') {
        const v = dietVisits(p).find((x) => String(x.id) === String(o.visitId));
        const r = pickRecipes(ctx.db, v, o.scope);
        return `${r.list.length} ${r.list.length === 1 ? 'ricetta' : 'ricette'}${r.fromPlan ? ' del piano' : ''}`;
    }
    return DOC_TYPES[item.type]?.desc || '';
};
const type = (item) => item.type;

// scelte possibili per le opzioni di un documento
export const optionChoices = (item, ctx) => {
    const p = ctx.patient;
    if (item.type === 'visita' || item.type === 'grafici') return { visits: visitsOf(p, ctx.draft).map((v) => ({ id: v.id, label: v.label })) };
    if (item.type === 'dieta' || item.type === 'ricettario') {
        const dv = dietVisits(p);
        const v = dv.find((x) => String(x.id) === String(item.opts?.visitId)) || dv[0];
        const days = ((v && v.dettagli?.diet_plan_data) || []).filter((d) => (d.meals || []).some((m) => (m.items || []).length));
        return { visits: dv.map((x) => ({ id: String(x.id), label: `Piano del ${fmtDate(x.data, 'short')}` })), days: days.map((d, i) => d.title || `Giorno ${i + 1}`) };
    }
    if (item.type === 'training') {
        const schede = getSchede(p);
        const cur = schede.find((s) => s.id === item.opts?.schedaId) || pickActiveScheda(p);
        return {
            schede: schede.map((s) => ({ id: s.id, label: s.titolo || s.obiettivo || 'Scheda senza titolo' })),
            weeks: ((cur && cur.weeks) || []).map((w, i) => ({ id: w.id, label: w.title || `Settimana ${i + 1}` })),
        };
    }
    return {};
};

// "Come mostrarlo": i modi di presentare ogni documento (il primo è quello classico)
export const DOC_VIEWS = { visita: VISIT_VIEWS, andamento: PROGRESS_VIEWS, dieta: DIET_VIEWS, training: TRAINING_VIEWS, ricettario: COOKBOOK_VIEWS };
export const currentView = (item) => {
    const v = DOC_VIEWS[item.type];
    return v ? v.find((x) => x.id === item.opts?.view) || v[0] : null;
};

// da quali dati nasce il documento (visita, piano o scheda): si sceglie direttamente sulla sua riga
export const sourceChoice = (item, ctx) => {
    const ch = optionChoices(item, ctx);
    if ((item.type === 'visita' || item.type === 'grafici') && ch.visits?.length) return { label: 'Visita', key: 'visitId', options: ch.visits };
    if ((item.type === 'dieta' || (item.type === 'ricettario' && item.opts?.scope !== 'tutte')) && ch.visits?.length) return { label: 'Piano', key: 'visitId', options: ch.visits };
    if (item.type === 'training' && ch.schede?.length) return { label: 'Scheda', key: 'schedaId', options: ch.schede, reset: { weekId: 'all' } };
    return null;
};

const notaHtml = (o) => `<div class="d-doc"><h1 class="d-title d-title-solo">${String(o.title || 'Note').replace(/</g, '&lt;')}</h1><p>Scrivi qui le indicazioni per il paziente.</p><p><br></p></div>`;

// HTML iniziale di un documento "flow"
export const buildHtml = (item, ctx) => {
    const p = ctx.patient;
    const prof = ctx.prof;
    const o = item.opts || {};
    if (item.type === 'visita') {
        const v = visitsOf(p, ctx.draft).find((x) => x.id === String(o.visitId)) || visitsOf(p, ctx.draft)[0];
        return v ? buildVisitReportHtml({ patient: p, prof, visit: v, opts: o }) : '<p>Nessuna visita.</p>';
    }
    if (item.type === 'andamento') return buildProgressHtml({ patient: p, prof, draft: ctx.draft, opts: o });
    if (item.type === 'lettera') return `<div class="d-letter">${buildLetterHtml({ patient: p, professional: prof })}</div>`;
    if (item.type === 'nota') return notaHtml(o);
    if (item.type === 'ricettario') return buildCookbookHtml({ patient: p, prof, db: ctx.db, visit: dietVisits(p).find((x) => String(x.id) === String(o.visitId)) || dietVisits(p)[0], opts: o });
    if (item.type === 'dieta') {
        const v = dietVisits(p).find((x) => String(x.id) === String(o.visitId)) || dietVisits(p)[0];
        if (!v) return '<p>Nessun piano alimentare.</p>';
        return buildDietHtml({ patient: p, prof, visit: v, opts: o, foods: ctx.db?.diet_food_db?.length ? ctx.db.diet_food_db : undefined });
    }
    if (item.type === 'training') {
        const s = getSchede(p).find((x) => x.id === o.schedaId) || pickActiveScheda(p);
        if (!s) return '<p>Nessuna scheda.</p>';
        const exerciseDB = ctx.db?.training_exercise_db?.length ? ctx.db.training_exercise_db : defaultDB;
        const header = { titolo: s.titolo || '', cliente: s.cliente || `${p.nome || ''} ${p.cognome || ''}`.trim(), obiettivo: s.obiettivo || '', tipo: s.tipo || '', livello: s.livello || '', extraMin: s.extraMin ?? 10, data: s.data || '' };
        if (o.view && o.view !== 'completa') return buildTrainingViewHtml({ view: o.view, scheda: s, header, exerciseDB, prof, opts: o });
        return renderToStaticMarkup(
            <div className="tp-embed">
                <TrainingDocBody header={header} weeks={s.weeks || []} exerciseDB={exerciseDB} massimali={getMassimali(p)} profile={getProfile(p)} professional={prof} opts={o} />
            </div>
        );
    }
    return '';
};

// pagine di un documento "fixed"
export const fixedPages = (item) => {
    if (item.type === 'grafici') return [item.opts?.page1 !== false && 1, item.opts?.page2 !== false && 2].filter(Boolean);
    return [];
};

// documenti con una propria intestazione dello studio in prima pagina: lì l'intestazione di pagina non serve
export const hasMasthead = (item) => ['visita', 'andamento', 'dieta', 'lettera', 'ricettario'].includes(item.type) || (item.type === 'training' && item.opts?.studio);
