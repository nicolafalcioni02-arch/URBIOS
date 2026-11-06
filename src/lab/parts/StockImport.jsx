import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/icons';
import { readXlsx, serialToIso } from '../xlsxRead';
import { expectedColumns, planStockImport } from '../stockImport';
import { fmtDay } from '../labLogic';

const SAMPLE = [
    { numero: '1', nome: 'Proteinasi K', codice: 'P2308', marca: 'Sigma-Aldrich', cas: '39450-01-6', categoria: 'Enzimi', fornitore: 'Sigma-Aldrich', dataArrivo: '12/03/2026', ordine: 'DDT-2201', prezzo: '85', lotto: 'SLCD1234', quantita: '4', unita: 'mL', sogliaMin: '2', scadenza: '30/06/2027', apertura: '', posizione: 'Freezer -20 °C' },
    { numero: '2', nome: 'Etanolo assoluto', codice: 'E7023', marca: 'Carlo Erba', cas: '64-17-5', categoria: 'Solventi', fornitore: 'Carlo Erba', dataArrivo: '02/09/2026', ordine: 'DDT-2202', prezzo: '28', lotto: 'L2201', quantita: '1', unita: 'L', sogliaMin: '2', scadenza: '', apertura: '', posizione: 'Armadio infiammabili' },
];
const EXAMPLE_KEYS = ['numero', 'nome', 'codice', 'marca', 'lotto', 'quantita', 'unita', 'scadenza', 'posizione'];
const letter = (i) => { let t = ''; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) t = String.fromCharCode(65 + ((n - 1) % 26)) + t; return t; };

// Foglio Excel simulato: lettere delle colonne, numeri di riga, intestazione, celle con linee; in basso la linguetta del foglio
const Sheet = ({ head, rows, tab, maxRows = 9 }) => {
    const sc = useRef(null);
    useEffect(() => { if (sc.current) { sc.current.scrollLeft = 0; sc.current.scrollTop = 0; } }, [head.length, tab]);
    return (
    <div className="xl">
        <div className="xl-scroll" ref={sc}>
            <table>
                <thead>
                    <tr><th className="xl-corner" />{head.map((h, i) => <th key={i} className="xl-let">{letter(i)}</th>)}</tr>
                </thead>
                <tbody>
                    <tr>
                        <th className="xl-num">1</th>
                        {head.map((h, i) => <td key={i} className={`xl-head ${h.state || ''}`} title={h.tip || ''}>{h.label}</td>)}
                    </tr>
                    {rows.slice(0, maxRows).map((r, ri) => (
                        <tr key={ri} className={r.status ? `xl-r-${r.status}` : ''}>
                            <th className="xl-num">{r.n}</th>
                            {head.map((h, i) => <td key={i} className={r.chg && r.chg.includes(i) ? 'chg' : ''}>{r.cells[i] ?? ''}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="xl-tabs"><span>{tab}</span></div>
    </div>
    );
};

const DATE_KEYS = ['dataArrivo', 'scadenza', 'apertura'];
const cellText = (v, key) => (typeof v === 'number' ? (DATE_KEYS.includes(key) ? fmtDay(serialToIso(v)) : String(Math.round(v * 1e6) / 1e6).replace('.', ',')) : v ?? '');

// Box di importazione: com'è fatto il file (foglio Excel simulato), se viene riconosciuto, che cosa legge il programma e che cosa cambierà
export const StockImport = ({ lab, onApply, onClose }) => {
    const input = useRef(null);
    const [file, setFile] = useState(null);
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const cols = expectedColumns();

    const pick = async (f) => {
        setFile(f);
        setPlan(null);
        setError('');
        setBusy(true);
        try { setPlan(planStockImport(await readXlsx(f, 'Magazzino'), lab)); } catch (e) { setError(e.message || 'File non leggibile'); }
        setBusy(false);
    };
    const todo = plan ? plan.adds + plan.updates : 0;

    let head;
    let rows;
    if (plan) {
        const width = Math.max(plan.headRaw.length, ...plan.lines.map((l) => l.row.length));
        head = Array.from({ length: width }, (_, i) => {
            const label = String(plan.headRaw[i] ?? '').trim();
            const key = plan.cols[i];
            return { label, state: !label ? '' : key ? 'ok' : 'off', tip: !label ? '' : key ? 'Riconosciuta' : 'Non riconosciuta: ignorata' };
        });
        rows = plan.lines.map((l) => ({ n: l.n, status: l.status, chg: l.status !== 'aggiornato' ? [] : plan.cols.map((k, i) => (l.changed.includes(k) ? i : -1)).filter((i) => i >= 0), cells: head.map((_, i) => cellText(l.row[i], plan.cols[i])) }));
    } else {
        const ex = cols.filter((c) => EXAMPLE_KEYS.includes(c.key));
        head = ex.map((c) => ({ label: c.label, state: c.required ? 'req' : '' }));
        rows = SAMPLE.map((sm, i) => ({ n: i + 2, cells: ex.map((c) => sm[c.key] || '') }));
    }

    return (
        <div className="sheet-back" onClick={onClose}>
            <div className="lab-modal lab-imp" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Importa il magazzino da Excel">
                <div className="lab-pane-head"><h2 className="lab-pane-title">Importa il magazzino da Excel</h2><button type="button" className="lab-x" aria-label="Chiudi" onClick={onClose}><Icon name="x" size={18} /></button></div>

                <section className="lab-imp-sec">
                    <h3>{plan ? `Il tuo file${plan.sheet ? `, foglio «${plan.sheet}»` : ''}` : 'Com’è fatto il file'}</h3>
                    {!plan && <p>File <b>.xlsx</b>: titoli delle colonne nella prima riga, un articolo per riga. Obbligatoria solo <b>Nome</b>.</p>}
                    <Sheet head={head} rows={rows} tab={plan ? plan.sheet || 'Foglio1' : 'Magazzino'} maxRows={plan ? 12 : 4} />
                    {!plan ? (
                        <>
                        <p className="lab-imp-note">Facoltative: {cols.filter((c) => !EXAMPLE_KEYS.includes(c.key)).map((c) => c.label).join(', ')}</p>
                        <p className="lab-imp-note">Abbinamento: N. inventario, poi codice + lotto, poi nome + lotto. Le celle vuote non cancellano nulla.</p>
                        </>
                    ) : (
                        <div className="lab-imp-leg">
                            <span><i className="k ok" />Colonna riconosciuta</span>
                            <span><i className="k off" />Ignorata</span>
                            <span><i className="k chg" />Cella che cambia</span>
                            <span><i className="k nuovo" />Riga nuova</span>
                            <span><i className="b aggiornato" />Articolo da aggiornare</span>
                        </div>
                    )}
                </section>

                <section className="lab-imp-sec">
                    <button type="button" className="lab-btn is-secondary is-sm" onClick={() => input.current && input.current.click()}><Icon name="upload" size={16} />{file ? 'Scegli un altro file' : 'Scegli il file'}</button>
                    <input ref={input} type="file" accept=".xlsx" hidden onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; if (f) pick(f); }} />
                    {file && <span className="lab-imp-file">{file.name}</span>}
                    {busy && <p className="lab-imp-note">Leggo il file…</p>}
                    {error && <p className="lab-imp-bad">Non riconosciuto: {error}</p>}
                </section>

                {plan && (
                    <section className="lab-imp-sec">
                        <h3>Che cosa farà il programma</h3>
                        <div className="lab-imp-sum"><b>{plan.adds}</b> nuovi, <b>{plan.updates}</b> da aggiornare, <b>{plan.same}</b> già uguali{plan.skipped > 0 && <>, {plan.skipped} {plan.skipped === 1 ? 'riga' : 'righe'} senza nome (saltate)</>}</div>
                        {plan.header.some((h) => !h.key) && <p className="lab-imp-note">Colonne ignorate: {plan.header.filter((h) => !h.key).map((h) => h.label).join(', ')}.</p>}
                        {plan.missing.length > 0 && <p className="lab-imp-note">Non presenti nel file: {plan.missing.map((m) => m.label).join(', ')}.</p>}
                        {plan.lines.length > 12 && <p className="lab-imp-note">Nel foglio qui sopra vedi le prime 12 righe di {plan.lines.length}; le altre vengono importate comunque.</p>}
                    </section>
                )}

                <div className="lab-imp-foot">
                    <button type="button" className="lab-btn is-secondary" onClick={onClose}>Annulla</button>
                    <button type="button" className="lab-btn is-primary" disabled={!plan || !todo} onClick={() => { onApply(plan.items.filter((x) => x.status !== 'uguale').map((x) => x.rec)); onClose(); }}>{plan && todo ? `Importa ${todo} ${todo === 1 ? 'articolo' : 'articoli'}` : 'Importa'}</button>
                </div>
            </div>
        </div>
    );
};
