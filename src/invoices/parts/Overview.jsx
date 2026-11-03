import React from 'react';
import { MESI, SOGLIA_FORFETTARIO, byKind, byMethod, byPatient, delta, monthly, summarize } from '../accountingLogic';
import { euro } from '../invoiceLogic';

const Kpi = ({ label, value, sub, tone }) => (
    <div className="panel" style={{ padding: 14 }}>
        <span className="fld-label">{label}</span>
        <div className="text-[22px] font-semibold tracking-[-0.01em]" style={{ color: tone ? `var(--${tone})` : 'var(--ink)' }}>{value}</div>
        {sub && <div className="text-[12.5px] text-[color:var(--muted)] mt-0.5">{sub}</div>}
    </div>
);

// Barre orizzontali: una riga per voce, lunghezza proporzionale al valore massimo
const Bars = ({ items, empty }) => {
    const max = Math.max(1, ...items.map((i) => i.value));
    if (!items.length) return <p className="text-[13px] text-[color:var(--muted)] py-3">{empty}</p>;
    return (
        <div className="grid gap-2 mt-1.5">
            {items.map((i) => (
                <div key={i.label}>
                    <div className="flex justify-between text-[13px] text-[color:var(--ink)]"><span className="truncate pr-3">{i.label}</span><b className="font-medium">{euro(i.value)}</b></div>
                    <div style={{ height: 5, background: 'var(--soft)', borderRadius: 3, marginTop: 4 }}><div style={{ height: 5, borderRadius: 3, background: 'var(--ink)', width: `${(i.value / max) * 100}%` }} /></div>
                </div>
            ))}
        </div>
    );
};

// Grafico a barre dei 12 mesi (HTML, riempie l'altezza disponibile): fatturato (chiaro) e incassato (scuro)
const MonthChart = ({ data }) => {
    const max = Math.max(1, ...data.flatMap((d) => [d.fatturato, d.incassato]));
    const h = (v) => `${Math.max(v ? 2 : 0, (v / max) * 100)}%`;
    return (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: '110px auto' }} role="img" aria-label="Fatturato e incassato per mese">
            {data.map((d, i) => (
                <div key={d.m} className="flex items-end justify-center gap-[3px]" style={{ borderBottom: '1px solid var(--line)', minHeight: 0 }}>
                    <div title={`${MESI[i]}: fatturato ${euro(d.fatturato)}`} style={{ width: '38%', maxWidth: 16, height: h(d.fatturato), background: 'var(--line)', borderRadius: '3px 3px 0 0' }} />
                    <div title={`${MESI[i]}: incassato ${euro(d.incassato)}`} style={{ width: '38%', maxWidth: 16, height: h(d.incassato), background: 'var(--ink)', borderRadius: '3px 3px 0 0' }} />
                </div>
            ))}
            {data.map((d) => <span key={d.m} className="text-center text-[11px] text-[color:var(--muted)]">{d.m}</span>)}
        </div>
    );
};

export const Overview = ({ rows, prevRows, expenses, year, prof, nextNumber, compact }) => {
    const top = 5;
    const s = summarize(rows);
    const p = summarize(prevRows);
    const d = delta(s.fatturato, p.fatturato);
    const spese = expenses.reduce((t, e) => t + (Number(String(e.importo).replace(',', '.')) || 0), 0);
    const margine = s.ricavi - spese;
    const forf = prof.regime_fiscale === 'Forfettario';
    const pct = Math.min(100, (s.ricavi / SOGLIA_FORFETTARIO) * 100);
    return (
        <div className="flex flex-col gap-3 xl:h-full">
            <div className="grid gap-3 shrink-0" style={{ gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(4, minmax(0, 1fr))' }}>
                <Kpi label="Fatturato" value={euro(s.fatturato)} sub={d === null ? `${s.n} fatture` : `${d >= 0 ? '+' : ''}${d.toFixed(0)}% sul ${year - 1} · ${s.n} fatt.`} />
                <Kpi label="Incassato" value={euro(s.incassato)} sub={s.fatturato ? `${Math.round((s.incassato / s.fatturato) * 100)}% del fatturato` : ' '} />
                <Kpi label="Da incassare" value={euro(s.daIncassare)} tone={s.daIncassare ? 'warn' : ''} sub={s.n ? `media ${euro(s.media)}` : ' '} />
                <Kpi label="Margine indicativo" value={euro(margine)} sub={`ricavi ${euro(s.ricavi)} − spese ${euro(spese)}`} />
            </div>

            <div className="panel flex flex-col shrink-0" style={{ padding: 14 }}>
                <div className="flex justify-between items-center flex-wrap gap-2 mb-2 shrink-0">
                    <span className="fld-label" style={{ margin: 0 }}>Andamento mensile {year}</span>
                    <span className="flex gap-3 text-[12px] text-[color:var(--muted)]">
                        <span className="flex items-center gap-1.5"><i style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--line)' }} />Fatturato</span>
                        <span className="flex items-center gap-1.5"><i style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--ink)' }} />Incassato</span>
                    </span>
                </div>
                <MonthChart data={monthly(rows)} />
            </div>

            <div className="grid gap-3 xl:flex-1 xl:min-h-0 xl:items-stretch" style={{ gridTemplateColumns: compact ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
                <div className="panel" style={{ padding: 14 }}><span className="fld-label">Pazienti con più fatturato</span><Bars items={byPatient(rows).slice(0, top)} empty="Nessuna fattura" /></div>
                <div className="panel" style={{ padding: 14 }}><span className="fld-label">Da cosa arriva</span><Bars items={byKind(rows)} empty="Nessuna fattura" /></div>
                <div className="panel" style={{ padding: 14 }}><span className="fld-label">Incassato per metodo</span><Bars items={byMethod(rows).slice(0, top)} empty="Nessun incasso" /></div>
            </div>

            <div className="panel shrink-0 flex flex-wrap items-center gap-x-8 gap-y-2" style={{ padding: '10px 14px' }}>
                <span className="text-[13px] text-[color:var(--ink)]">Prossima fattura <b>{prof.fatt_prefisso || ''}{nextNumber}/{year}</b></span>
                <span className="text-[13px] text-[color:var(--muted)]">IVA fatturata {euro(s.iva)}</span>
                {forf && (
                    <span className="flex items-center gap-2 flex-1 min-w-[220px]">
                        <span className="text-[13px] text-[color:var(--muted)] whitespace-nowrap">Soglia forfettario {pct.toFixed(0)}%</span>
                        <span className="flex-1" style={{ height: 6, background: 'var(--soft)', borderRadius: 3 }}><span style={{ display: 'block', height: 6, borderRadius: 3, width: `${pct}%`, background: pct > 90 ? 'var(--warn)' : 'var(--ink)' }} /></span>
                    </span>
                )}
            </div>
        </div>
    );
};
