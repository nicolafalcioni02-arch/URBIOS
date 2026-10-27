import React, { useMemo, useRef, useState } from 'react';
import { analyzeText, KIND_LABEL } from '../../../../dataExchange/import/analyze';
import { mergeIncoming, defaultMergeOptions } from '../../../../dataExchange/import/merge';
import { CSV_TEMPLATES } from '../../../../dataExchange/import/csvImport';
import { toCsv } from '../../../../dataExchange/csv';
import { readFileAsText, downloadBlob } from '../../../../storage/fileIO';
import { Group as Section, Check, Radio, Btn, Note } from '../../ui/kit';

const errText = (e) =>
    ({
        WRONG_SECRET: 'Password o codice non corretti.',
        CORRUPTED: 'File danneggiato o modificato.',
        NOT_URBIOS: 'Il file non è un formato riconosciuto da URBIOS.',
        TOO_NEW: 'File creato con una versione più recente di URBIOS.',
    })[e && e.message] || 'Errore: ' + ((e && e.message) || e);

const describe = (inc) => {
    const parts = [];
    if (inc.pazienti)
        parts.push(
            `${inc.pazienti.filter((p) => !p._stub).length || inc.pazienti.length} pazienti`,
            `${inc.pazienti.reduce((a, p) => a + (p.visite || []).length, 0)} visite`
        );
    if (inc.diet_food_db) parts.push(`${inc.diet_food_db.length} alimenti`);
    if (inc.training_exercise_db) parts.push(`${inc.training_exercise_db.length} esercizi`);
    if (inc.formule) parts.push(`${inc.formule.length} formule`);
    if (inc.diet_drv_db && inc.diet_drv_db.length) parts.push(`${inc.diet_drv_db.length} voci DRV`);
    if (inc.diet_meal_library && inc.diet_meal_library.length) parts.push(`${inc.diet_meal_library.length} pasti in libreria`);
    return parts.filter((x) => !x.startsWith('0 ')).join(' · ');
};

export const ImportSection = ({ db, onUpdateDb }) => {
    const input = useRef(null);
    const [file, setFile] = useState(null); // { text, name }
    const [res, setRes] = useState(null); // risultato analisi
    const [secret, setSecret] = useState('');
    const [opts, setOpts] = useState(defaultMergeOptions());
    const [error, setError] = useState('');
    const [done, setDone] = useState(null);
    const [busy, setBusy] = useState(false);

    const analyze = async (f, sec) => {
        setBusy(true);
        setError('');
        try {
            const r = await analyzeText(f.text, f.name, sec);
            setRes(r);
            if (r.incoming) setOpts({ ...defaultMergeOptions(), createStubs: r.kind !== 'visite' });
        } catch (e) {
            setError(errText(e));
        }
        setBusy(false);
    };

    const onFile = async (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        setDone(null);
        setRes(null);
        setSecret('');
        const text = await readFileAsText(f);
        const fo = { text, name: f.name };
        setFile(fo);
        analyze(fo, null);
    };

    const preview = useMemo(() => (res && res.incoming ? mergeIncoming(db, res.incoming, opts).report : null), [db, res, opts]);

    const apply = () => {
        let rep = null;
        onUpdateDb((prev) => {
            const m = mergeIncoming(prev, res.incoming, opts);
            rep = m.report;
            return m.db;
        });
        setDone(preview);
        setRes(null);
        setFile(null);
    };

    const template = (k) => {
        const t = CSV_TEMPLATES[k];
        downloadBlob(new Blob([toCsv(t.columns, [t.example], { sep: ';', decimal: ',' })], { type: 'text/csv;charset=utf-8' }), `modello_${k}.csv`);
    };

    const inc = res && res.incoming;
    const hasLib = inc && (inc.diet_food_db || inc.training_exercise_db || inc.formule || inc.diet_drv_db || inc.diet_meal_library);
    const lib = (k) => (v) => setOpts((o) => ({ ...o, libraries: { ...o.libraries, [k]: v } }));

    return (
        <div>
            <Section
                title="Importa un file"
                hint="URBIOS riconosce da solo il contenuto: archivio o esportazione URBIOS (.json), tabelle CSV di pazienti, visite, alimenti, esercizi e formule. I dati vengono UNITI a quelli attuali, senza cancellare nulla."
            >
                <input ref={input} type="file" accept=".json,.csv,.txt,text/csv,application/json" onChange={onFile} className="hidden" />
                <Btn icon="upload" onClick={() => input.current.click()} disabled={busy}>
                    {busy ? 'Lettura…' : 'Scegli un file…'}
                </Btn>
                {file && <span className="ml-3 st-hint">{file.name}</span>}
                {error && <p className="st-error mt-3">{error}</p>}

                {res && res.needsSecret && (
                    <div className="mt-4">
                        <p className="st-text mb-2">Questo archivio è protetto: inserisci la sua password.</p>
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && analyze(file, secret)}
                            className="fld !w-auto mr-2"
                            placeholder="Password dell'archivio"
                            autoComplete="off"
                        />
                        <Btn onClick={() => analyze(file, secret)} disabled={busy}>
                            Apri
                        </Btn>
                    </div>
                )}

                {res && res.kind === 'sconosciuto' && (
                    <p className="st-error mt-3">
                        Formato non riconosciuto. Controlla che sia un file URBIOS o un CSV con le intestazioni dei modelli qui sotto.
                    </p>
                )}

                {inc && (
                    <div className="mt-4 st-box">
                        <p className="text-[14px] font-semibold text-[color:var(--ink)]">{KIND_LABEL[res.kind]}</p>
                        <p className="st-hint mb-3">
                            {describe(inc)}
                            {res.anonymized ? ' · esportazione ANONIMA' : ''}
                        </p>

                        {inc.pazienti && (
                            <>
                                <p className="st-sub">Se un paziente esiste già</p>
                                <Radio
                                    name="conf"
                                    value="merge"
                                    current={opts.conflict}
                                    onChange={(v) => setOpts({ ...opts, conflict: v })}
                                    label="Tieni quello attuale e aggiungi solo le visite mancanti"
                                    hint="consigliato per unire due archivi"
                                />
                                <Radio
                                    name="conf"
                                    value="skip"
                                    current={opts.conflict}
                                    onChange={(v) => setOpts({ ...opts, conflict: v })}
                                    label="Salta (non toccare)"
                                />
                                <Radio
                                    name="conf"
                                    value="replace"
                                    current={opts.conflict}
                                    onChange={(v) => setOpts({ ...opts, conflict: v })}
                                    label="Sostituisci con quello del file"
                                />
                                <Radio
                                    name="conf"
                                    value="duplicate"
                                    current={opts.conflict}
                                    onChange={(v) => setOpts({ ...opts, conflict: v })}
                                    label="Importa come nuovo paziente (duplicato)"
                                />
                                <p className="st-hint mt-1">
                                    Lo stesso paziente viene riconosciuto da ID, codice fiscale oppure nome + cognome + data di nascita.
                                </p>
                            </>
                        )}
                        {hasLib && (
                            <div className="mt-3">
                                <p className="st-sub">
                                    Archivi (si aggiungono solo le voci mancanti)
                                </p>
                                {inc.diet_food_db && <Check label="Alimenti" checked={opts.libraries.foods} onChange={lib('foods')} />}
                                {inc.training_exercise_db && <Check label="Esercizi" checked={opts.libraries.exercises} onChange={lib('exercises')} />}
                                {inc.formule && <Check label="Formule" checked={opts.libraries.formulas} onChange={lib('formulas')} />}
                                {inc.diet_drv_db && inc.diet_drv_db.length > 0 && <Check label="DRV" checked={opts.libraries.drv} onChange={lib('drv')} />}
                                {inc.diet_meal_library && inc.diet_meal_library.length > 0 && (
                                    <Check label="Libreria pasti" checked={opts.libraries.meals} onChange={lib('meals')} />
                                )}
                                {inc.rangeEmato && <Check label="Range ematici mancanti" checked={opts.libraries.ranges} onChange={lib('ranges')} />}
                            </div>
                        )}
                        {inc.utente && Object.keys(inc.utente).length > 0 && res.kind === 'archivio' && (
                            <Check
                                label="Importa anche i dati dello studio / professionista"
                                checked={opts.studio}
                                onChange={(v) => setOpts({ ...opts, studio: v })}
                            />
                        )}
                        {!inc.pazienti && res.kind !== 'archivio' && null}

                        {preview && (
                            <div className="mt-3 st-note">
                                <div className="min-w-0">
                                <p className="st-note-title">Anteprima: cosa succederà</p>
                                <ul className="list-disc pl-5">
                                    {preview.patientsAdded > 0 && <li>{preview.patientsAdded} pazienti nuovi</li>}
                                    {preview.patientsMerged > 0 && <li>{preview.patientsMerged} pazienti già presenti aggiornati</li>}
                                    {preview.patientsReplaced > 0 && <li>{preview.patientsReplaced} pazienti sostituiti</li>}
                                    {preview.patientsDuplicated > 0 && <li>{preview.patientsDuplicated} pazienti importati come duplicati</li>}
                                    {preview.patientsSkipped > 0 && <li>{preview.patientsSkipped} pazienti saltati</li>}
                                    {preview.visitsAdded > 0 && <li>{preview.visitsAdded} visite aggiunte</li>}
                                    {preview.visitsSkipped > 0 && <li>{preview.visitsSkipped} visite già presenti (ignorate)</li>}
                                    {preview.orphans > 0 && (
                                        <li className="text-[color:var(--bad)]">
                                            {preview.orphans} visite ignorate: il paziente non esiste (importa prima la tabella pazienti)
                                        </li>
                                    )}
                                    {preview.foodsAdded > 0 && <li>{preview.foodsAdded} alimenti nuovi</li>}
                                    {preview.exercisesAdded > 0 && <li>{preview.exercisesAdded} esercizi nuovi</li>}
                                    {preview.formulasAdded > 0 && <li>{preview.formulasAdded} formule nuove</li>}
                                    {preview.drvAdded > 0 && <li>{preview.drvAdded} voci DRV nuove</li>}
                                    {preview.mealsAdded > 0 && <li>{preview.mealsAdded} pasti nuovi</li>}
                                    {preview.rangesAdded > 0 && <li>{preview.rangesAdded} range ematici nuovi</li>}
                                    {Object.entries(preview).every(([k, v]) => k === 'possibleDuplicates' || !v) && <li>Niente di nuovo da importare.</li>}
                                </ul>
                                {preview.possibleDuplicates.length > 0 && (
                                    <p className="mt-1 text-[color:var(--warn)]">
                                        Riconosciuti come già presenti (ID diverso): {preview.possibleDuplicates.slice(0, 5).join(', ')}
                                    </p>
                                )}
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex gap-2">
                            <Btn icon="check" onClick={apply}>Importa</Btn>
                            <Btn
                                variant="secondary"
                                onClick={() => {
                                    setRes(null);
                                    setFile(null);
                                }}
                            >
                                Annulla
                            </Btn>
                        </div>
                    </div>
                )}

                {done && (
                    <Note tone="ok" title="Importazione completata." className="mt-4">
                        <p>
                            Ricorda di <strong>salvare l'archivio</strong> (pulsante in basso a sinistra) per rendere le modifiche permanenti nel tuo file.
                        </p>
                    </Note>
                )}
            </Section>

            <Section
                title="Modelli CSV"
                hint="Scarica un file vuoto con le colonne giuste, compilalo in Excel e reimportalo. Per importare le visite, importa prima i pazienti: le righe sono collegate dalla colonna paziente_id."
            >
                <div className="flex flex-wrap gap-2">
                    {Object.keys(CSV_TEMPLATES).map((k) => (
                        <Btn key={k} variant="secondary" size="sm" icon="download" onClick={() => template(k)}>
                            Modello {k}
                        </Btn>
                    ))}
                </div>
            </Section>
        </div>
    );
};
