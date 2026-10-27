import React, { useMemo, useState } from 'react';
import { buildDataset, LEVELS } from './logic/dataset';
import { isExample } from '../storage/example/example';
import { researchStyles } from './styles/researchStyles';
import { DataPanel } from './sections/DataPanel';
import { DescriptivePanel } from './sections/DescriptivePanel';
import { ComparePanel } from './sections/ComparePanel';
import { PairedPanel } from './sections/PairedPanel';
import { CorrelationPanel } from './sections/CorrelationPanel';
import { RegressionPanel } from './sections/RegressionPanel';
import { CrosstabPanel } from './sections/CrosstabPanel';

const TABS = [
    { id: 'data', label: 'Dati', icon: 'ph-table', C: DataPanel },
    { id: 'desc', label: 'Descrittive', icon: 'ph-chart-bar', C: DescriptivePanel },
    { id: 'compare', label: 'Confronta gruppi', icon: 'ph-users-three', C: ComparePanel },
    { id: 'paired', label: 'Prima / dopo', icon: 'ph-arrows-left-right', C: PairedPanel },
    { id: 'corr', label: 'Correlazione', icon: 'ph-chart-scatter', C: CorrelationPanel },
    { id: 'reg', label: 'Regressione', icon: 'ph-trend-up', C: RegressionPanel },
    { id: 'cross', label: 'Tabelle di contingenza', icon: 'ph-grid-four', C: CrosstabPanel },
];

// Unità "Ricerca": analisi statistica dei dati dei pazienti per tesi e studi. Sola lettura: non modifica mai il db.
// Vedi src/research/DIARIO.md per lo stato dei lavori.
export const Research = ({ db, onBack }) => {
    const realCount = (db.pazienti || []).filter((p) => !isExample(p)).length;
    const [level, setLevel] = useState('prima');
    const [includeExample, setIncludeExample] = useState(realCount === 0);
    const [tab, setTab] = useState('desc');
    const ds = useMemo(() => buildDataset(db, level, { includeExample }), [db, level, includeExample]);
    const T = TABS.find((t) => t.id === tab) || TABS[0];

    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--paper)]">
            <style>{researchStyles}</style>
            <div className="rs-wrap">
                <div className="rs-top">
                    <button className="vw-chip !px-0 w-9 !h-9 justify-center" onClick={onBack} aria-label="Indietro">
                        <i className="ph ph-arrow-left"></i>
                    </button>
                    <div className="min-w-0">
                        <h1 className="display text-[30px] sm:text-[38px] text-[color:var(--ink)] leading-none">Ricerca</h1>
                        <p className="rs-muted mt-1">Statistica sui tuoi pazienti, in forma anonima. Nulla viene modificato o inviato.</p>
                    </div>
                </div>

                <div className="panel flex flex-wrap items-end gap-4">
                    <div className="min-w-[220px] flex-1">
                        <label className="fld-label">Ogni riga è</label>
                        <select className="fld rs-sel" value={level} onChange={(e) => setLevel(e.target.value)}>
                            {LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <label className="rs-check pb-3">
                        <input type="checkbox" checked={includeExample} onChange={(e) => setIncludeExample(e.target.checked)} />
                        Includi il paziente di esempio
                    </label>
                    <p className="rs-muted pb-3">
                        <b className="text-[color:var(--ink)]">{ds.rows.length}</b> righe · {ds.nPatients} pazienti · {ds.nVisits} visite · {ds.vars.length} variabili
                    </p>
                </div>
                {level === 'visite' && tab !== 'data' && <p className="rs-muted mt-2">Attenzione: con “Tutte le visite” lo stesso paziente compare più volte, quindi le osservazioni non sono indipendenti e i p-value dei test classici non sono affidabili.</p>}

                <div className="rs-tabs" role="tablist">
                    {TABS.map((t) => (
                        <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                            <i className={`ph ${t.icon}`}></i>
                            {t.label}
                        </button>
                    ))}
                </div>

                {ds.rows.length === 0 ? (
                    <div className="panel text-center py-10">
                        <p className="font-semibold text-[17px]">Nessun dato da analizzare</p>
                        <p className="rs-muted mt-1">Aggiungi pazienti e visite, oppure includi il paziente di esempio per provare.</p>
                    </div>
                ) : (
                    <T.C key={`${tab}-${level}-${includeExample}`} ds={ds} db={db} includeExample={includeExample} />
                )}
            </div>
        </div>
    );
};
