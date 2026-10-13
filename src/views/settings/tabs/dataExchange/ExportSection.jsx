import React, { useMemo, useState } from 'react';
import { buildExport, packExport, keyTableCsv, defaultExportOptions } from '../../../../dataExchange/export/bundle';
import { defaultAnonOptions } from '../../../../dataExchange/anonymize';
import { downloadBlob } from '../../../../storage/fileIO';
import { AnonymizePanel } from './AnonymizePanel';
import { Section, Check, Radio, Btn } from './ui';

const PRESETS = {
    excel: {
        label: 'Per Excel / statistica',
        hint: 'Tabelle CSV (pazienti, visite, diete)',
        include: { pazienti: true, visite: true, dieta: true, allenamento: true, archivi: false, studio: false, json: false },
        documents: 'none',
        anon: false,
    },
    ricerca: {
        label: 'Per ricerca / AI (anonimo)',
        hint: 'Tabelle senza dati personali',
        include: { pazienti: true, visite: true, dieta: true, allenamento: true, archivi: false, studio: false, json: false },
        documents: 'none',
        anon: true,
    },
    documenti: {
        label: 'Tutti i documenti in cartelle',
        hint: 'Una cartella per paziente (testo)',
        include: { pazienti: true, visite: true, dieta: true, allenamento: true, archivi: false, studio: false, json: false },
        documents: 'txt',
        anon: false,
    },
    completo: {
        label: 'Tutto',
        hint: 'Tabelle, documenti, archivi e JSON',
        include: { pazienti: true, visite: true, dieta: true, allenamento: true, archivi: true, studio: true, json: true },
        documents: 'txt',
        anon: false,
    },
};

export const ExportSection = ({ db }) => {
    const base = defaultExportOptions();
    const [include, setInclude] = useState(PRESETS.excel.include);
    const [documents, setDocuments] = useState('none');
    const [decimal, setDecimal] = useState(',');
    const [mode, setMode] = useState('all');
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [anonOn, setAnonOn] = useState(false);
    const [anon, setAnon] = useState(defaultAnonOptions());
    const [last, setLast] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const patients = db.pazienti || [];
    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();
        return patients.filter((p) => !q || `${p.nome || ''} ${p.cognome || ''} ${p.id}`.toLowerCase().includes(q)).slice(0, 200);
    }, [patients, search]);

    const applyPreset = (k) => {
        const p = PRESETS[k];
        setInclude(p.include);
        setDocuments(p.documents);
        setAnonOn(p.anon);
        if (p.anon) setAnon(defaultAnonOptions());
        setLast(null);
    };

    const inc = (k) => (v) => setInclude((s) => ({ ...s, [k]: v }));
    const count = mode === 'all' ? patients.length : selected.length;

    const run = () => {
        setBusy(true);
        setError('');
        // lascia respirare l'interfaccia prima del calcolo
        setTimeout(() => {
            try {
                const res = buildExport(db, {
                    ...base,
                    scope: { mode, ids: selected },
                    include,
                    documents,
                    csv: { sep: ';', decimal },
                    anonymize: anonOn ? anon : null,
                });
                if (res.stats.patients === 0 && !include.archivi) throw new Error('Nessun paziente da esportare.');
                const pack = packExport(res);
                downloadBlob(pack.blob, pack.name);
                setLast({ name: pack.name, res });
            } catch (e) {
                setError(e.message || String(e));
            }
            setBusy(false);
        }, 30);
    };

    const downloadKey = () => {
        const text = keyTableCsv(last.res.keyTable, { sep: ';', decimal });
        downloadBlob(new Blob([text], { type: 'text/csv;charset=utf-8' }), 'URBIOS_tabella_corrispondenza_NON_CONDIVIDERE.csv');
    };

    return (
        <div>
            <Section title="Scelte rapide" hint="Parti da qui, poi puoi modificare tutto.">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(PRESETS).map(([k, p]) => (
                        <button
                            key={k}
                            onClick={() => applyPreset(k)}
                            title={p.hint}
                            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-bold hover:bg-black hover:text-white transition-all"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </Section>

            <Section title="Cosa esportare">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Check label="Anagrafica pazienti" hint="pazienti.csv" checked={include.pazienti} onChange={inc('pazienti')} />
                    <Check
                        label="Visite e misure"
                        hint="visite.csv: una riga per visita, pronta per la statistica"
                        checked={include.visite}
                        onChange={inc('visite')}
                    />
                    <Check label="Piani alimentari" hint="alimenti del piano + obiettivi nutrizionali" checked={include.dieta} onChange={inc('dieta')} />
                    <Check label="Allenamento" hint="una riga per serie (solo se presente)" checked={include.allenamento} onChange={inc('allenamento')} />
                    <Check
                        label="Archivi"
                        hint="database alimenti, esercizi, formule, range ematici, DRV"
                        checked={include.archivi}
                        onChange={inc('archivi')}
                    />
                    <Check label="Dati dello studio / professionista" checked={include.studio} onChange={inc('studio')} />
                    <Check label="Copia completa in JSON" hint="dati_completi.json: riesportabile in URBIOS" checked={include.json} onChange={inc('json')} />
                </div>
            </Section>

            <Section
                title="Documenti per paziente"
                hint="Una cartella per ogni paziente con scheda, visite e diete. Formato volutamente semplice, con il font di default."
            >
                <Radio name="docs" value="none" current={documents} onChange={setDocuments} label="Nessun documento (solo tabelle)" />
                <Radio name="docs" value="txt" current={documents} onChange={setDocuments} label="Testo semplice (.txt)" hint="si apre ovunque" />
                <Radio
                    name="docs"
                    value="doc"
                    current={documents}
                    onChange={setDocuments}
                    label="Word semplice (.doc)"
                    hint="si apre con Word / LibreOffice, nessuna formattazione"
                />
            </Section>

            <Section title="Pazienti">
                <Radio name="scope" value="all" current={mode} onChange={setMode} label={`Tutti i pazienti (${patients.length})`} />
                <Radio name="scope" value="selected" current={mode} onChange={setMode} label="Solo alcuni pazienti" />
                {mode === 'selected' && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl p-3">
                        <div className="flex gap-2 mb-2 flex-wrap">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cerca per nome o ID…"
                                className="flex-1 min-w-[10rem] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                            />
                            <Btn variant="light" onClick={() => setSelected([...new Set([...selected, ...shown.map((p) => String(p.id))])])}>
                                Seleziona i visibili
                            </Btn>
                            <Btn variant="light" onClick={() => setSelected([])}>
                                Nessuno
                            </Btn>
                        </div>
                        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                            {shown.map((p) => (
                                <Check
                                    key={p.id}
                                    label={`${p.cognome || ''} ${p.nome || ''}`.trim() || `Paziente ${p.id}`}
                                    hint={`ID ${p.id} · ${(p.visite || []).length} visite`}
                                    checked={selected.includes(String(p.id))}
                                    onChange={(v) => setSelected(v ? [...selected, String(p.id)] : selected.filter((x) => x !== String(p.id)))}
                                />
                            ))}
                            {shown.length === 0 && <p className="text-xs text-gray-500 py-2">Nessun paziente trovato.</p>}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{selected.length} selezionati</p>
                    </div>
                )}
            </Section>

            <Section title="Formato dei numeri nei CSV">
                <Radio name="dec" value="," current={decimal} onChange={setDecimal} label="Virgola decimale (80,5) — Excel italiano" />
                <Radio name="dec" value="." current={decimal} onChange={setDecimal} label="Punto decimale (80.5) — Excel inglese, R, Python, SPSS" />
            </Section>

            <Section title="Anonimizzazione" hint="Per condividere i dati per ricerca o per caricarli in uno strumento di intelligenza artificiale.">
                <Check label="Esporta in forma anonima (rimuovi i dati personali)" checked={anonOn} onChange={setAnonOn} />
                {anonOn && <AnonymizePanel db={db} value={anon} onChange={setAnon} />}
            </Section>

            <div className="flex flex-wrap items-center gap-3">
                <Btn onClick={run} disabled={busy || (mode === 'selected' && selected.length === 0 && !include.archivi)}>
                    {busy ? 'Preparazione…' : `Esporta${anonOn ? ' (anonimo)' : ''} · ${count} pazienti`}
                </Btn>
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>

            {last && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-gray-800">
                    <p className="font-bold text-green-800 mb-1">Esportazione pronta: {last.name}</p>
                    <p>
                        {last.res.stats.patients} pazienti · {last.res.stats.visits} visite · {last.res.files.length - 1} file
                    </p>
                    {last.res.report && (
                        <div className="mt-2 text-xs text-gray-700">
                            <p className="font-bold">Anonimizzazione applicata:</p>
                            <ul className="list-disc pl-5">
                                {Object.entries(last.res.report.removedFields).map(([k, n]) => (
                                    <li key={k}>
                                        {k}: {n}
                                    </li>
                                ))}
                                {last.res.report.maskedHits > 0 && <li>Nomi/identificativi mascherati nei testi rimasti: {last.res.report.maskedHits}</li>}
                            </ul>
                            {last.res.report.warnings.map((w) => (
                                <p key={w} className="text-amber-800 mt-1">
                                    ⚠ {w}
                                </p>
                            ))}
                        </div>
                    )}
                    {last.res.keyTable.length > 0 && (
                        <div className="mt-3">
                            <Btn variant="light" onClick={downloadKey}>
                                Scarica la tabella di corrispondenza codici ↔ pazienti
                            </Btn>
                            <p className="text-xs text-red-700 mt-1">Tienila separata e NON condividerla: permette di risalire ai pazienti.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
