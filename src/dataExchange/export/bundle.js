// Assembla un'esportazione: sceglie i pazienti, (opzionale) anonimizza, produce i file e li impacchetta.
import { toCsv } from '../csv';
import { createZip } from '../zip';
import { anonymizeDb } from '../anonymize';
import { clone, safeName, todayStamp } from '../util';
import { buildPatientTable, buildVisitTable, buildDietFoodTable, buildDietTargetTable, buildTrainingTable, buildMassimaliTable, buildListTable, buildRangeTable } from './tables';
import { patientSheetBlocks, visitBlocks, dietBlocks, trainingBlocks, studioBlocks, renderTxt, renderDoc } from './documents';

export const defaultExportOptions = () => ({
    scope: { mode: 'all', ids: [] },
    include: { pazienti: true, visite: true, dieta: true, allenamento: true, archivi: true, studio: false, json: true },
    documents: 'none', // none | txt | doc
    csv: { sep: ';', decimal: ',' },
    anonymize: null, // null oppure opzioni di anonymizeDb
});

const readme = ({ date, anonymized, stats, report, files }) =>
    [
        'URBIOS - ESPORTAZIONE DATI',
        '==========================',
        `Data: ${date}`,
        `Pazienti: ${stats.patients}   Visite: ${stats.visits}`,
        `Anonimizzata: ${anonymized ? 'SI' : 'NO (contiene dati personali: conservala come un archivio clinico)'}`,
        '',
        'FILE CSV: aprili con Excel (UTF-8, separatore ";", decimali con la virgola).',
        'Una riga per visita in "visite.csv": è la tabella pronta per l\'analisi statistica.',
        'I campi "paziente_id" e "visita_id" collegano le tabelle tra loro.',
        '',
        ...(anonymized
            ? [
                  'ANONIMIZZAZIONE APPLICATA',
                  ...Object.entries(report.removedFields).map(([k, n]) => `  - ${k}: rimosso/trasformato (${n})`),
                  `  - Occorrenze di nomi/identificativi mascherate nei testi rimasti: ${report.maskedHits}`,
                  ...report.warnings.map((w) => `  ! ${w}`),
                  '',
              ]
            : []),
        'CONTENUTO',
        ...files.map((f) => `  ${f}`),
        '',
    ].join('\r\n');

// Restituisce { files:[{path,content}], stats, keyTable, report, single } — `single` è il file da scaricare direttamente se ce n'è uno solo.
export const buildExport = (db, options) => {
    const o = { ...defaultExportOptions(), ...options, include: { ...defaultExportOptions().include, ...(options.include || {}) } };
    let work = clone(db);
    if (o.scope.mode === 'selected') {
        const ids = new Set(o.scope.ids.map(String));
        work.pazienti = (work.pazienti || []).filter((p) => ids.has(String(p.id)));
    }
    let keyTable = [];
    let report = null;
    if (o.anonymize) {
        const r = anonymizeDb(work, o.anonymize);
        work = r.db;
        keyTable = r.keyTable;
        report = r.report;
    }
    const anonymized = !!o.anonymize;
    const stats = { patients: (work.pazienti || []).length, visits: (work.pazienti || []).reduce((a, p) => a + (p.visite || []).length, 0) };
    const date = todayStamp();
    const files = [];
    const csv = (name, table) => table.rows.length && files.push({ path: name, content: toCsv(table.columns, table.rows, o.csv) });

    if (o.include.pazienti) csv('tabelle/pazienti.csv', buildPatientTable(work));
    if (o.include.visite) csv('tabelle/visite.csv', buildVisitTable(work));
    if (o.include.dieta) {
        csv('tabelle/dieta_alimenti.csv', buildDietFoodTable(work));
        csv('tabelle/dieta_obiettivi.csv', buildDietTargetTable(work));
    }
    if (o.include.allenamento) {
        csv('tabelle/allenamento.csv', buildTrainingTable(work));
        csv('tabelle/massimali.csv', buildMassimaliTable(work));
    }
    if (o.include.archivi) {
        csv('archivi/alimenti.csv', buildListTable(work.diet_food_db, ['category', 'name', 'kcal', 'p', 'c', 'f']));
        csv('archivi/esercizi.csv', buildListTable(work.training_exercise_db, ['group', 'name', 'type']));
        csv('archivi/formule.csv', buildListTable(work.formule, ['id', 'categoria', 'titolo', 'equazione', 'note']));
        csv('archivi/drv.csv', buildListTable(work.diet_drv_db));
        csv('archivi/range_ematici.csv', buildRangeTable(work));
    }

    if (o.documents !== 'none') {
        const ext = o.documents === 'doc' ? 'doc' : 'txt';
        const render = o.documents === 'doc' ? renderDoc : renderTxt;
        (work.pazienti || []).forEach((p) => {
            const folder = `pazienti/${safeName(anonymized ? p.id : [p.cognome, p.nome, p.id].filter(Boolean).join('_'))}`;
            const add = (name, blocks) => blocks && files.push({ path: `${folder}/${name}.${ext}`, content: render(blocks) });
            add('scheda_paziente', patientSheetBlocks(p));
            (p.visite || []).forEach((v) => {
                const tag = safeName(v.data || (v.giorni_da_prima_visita !== undefined ? `T+${v.giorni_da_prima_visita}` : '') || v.id);
                if (o.include.visite) add(`visita_${tag}_${safeName(v.id)}`, visitBlocks(p, v));
                if (o.include.dieta) add(`dieta_${tag}_${safeName(v.id)}`, dietBlocks(p, v));
            });
            if (o.include.allenamento)
                ((p.allenamento && p.allenamento.schede) || []).forEach((sc, i) =>
                    add(`allenamento_${safeName(sc.titolo || sc.data || i + 1)}`, trainingBlocks(p, sc))
                );
        });
    }
    if (o.include.studio && (!anonymized || o.anonymize.includeProfessional)) {
        const sb = studioBlocks(work.utente);
        if (sb) files.push({ path: `studio.${o.documents === 'doc' ? 'doc' : 'txt'}`, content: (o.documents === 'doc' ? renderDoc : renderTxt)(sb) });
    }

    if (o.include.json) {
        const data = o.include.studio || !anonymized ? work : { ...work, utente: {} };
        const out = { ...data };
        if (!o.include.archivi)
            ['formule', 'rangeEmato', 'diet_food_db', 'diet_meal_library', 'diet_drv_db', 'training_exercise_db'].forEach((k) => delete out[k]);
        files.push({
            path: 'dati_completi.json',
            content: JSON.stringify({ format: 'URBIOS-EXPORT', exportedAt: new Date().toISOString(), anonymized, data: out }, null, 2),
        });
    }

    const list = files.map((f) => f.path);
    files.unshift({ path: 'LEGGIMI.txt', content: readme({ date, anonymized, stats, report, files: list }) });
    return { files, stats, keyTable, report, anonymized, folderName: `URBIOS_export_${date}${anonymized ? '_anonimo' : ''}` };
};

// Trasforma i file in un unico "pacco" scaricabile: ZIP se sono più file, file singolo altrimenti.
export const packExport = (result) => {
    const real = result.files.filter((f) => f.path !== 'LEGGIMI.txt');
    if (real.length === 1) {
        const f = real[0];
        const name = f.path.split('/').pop();
        const isCsv = name.endsWith('.csv');
        return { name, blob: new Blob([f.content], { type: isCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' }) };
    }
    const prefix = result.folderName + '/';
    const zip = createZip(result.files.map((f) => ({ path: prefix + f.path, content: f.content })));
    return { name: result.folderName + '.zip', blob: new Blob([zip], { type: 'application/zip' }) };
};

export const keyTableCsv = (keyTable, csvOpts) => toCsv(['codice_anonimo', 'id_originale', 'nome', 'cognome'], keyTable, csvOpts);
