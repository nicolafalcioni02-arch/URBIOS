import React, { useMemo } from 'react';
import { bodyIndices, getComposition } from '../logic/composition';
import { BandGauge, Donut, HBars, MiniTrend, fmt } from './svgCharts';

// Grafici della composizione corporea: stessi componenti nella finestra di Analisi e nelle pagine del report.
// `only`: elenco dei riquadri da mostrare; `compact`: versione per la stampa (riquadri piccoli, quelli vuoti spariscono).

const num = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;

const C = { fat: '#f43f5e', lean: '#10b981', blue: '#bfdbfe', green: '#86efac', mint: '#bbf7d0', yellow: '#fde68a', red: '#fecaca' };

const FM_BANDS = {
    M: { min: 2, bands: [{ label: 'Essenziale', max: 5, color: C.blue }, { label: 'Atletico', max: 13, color: C.green }, { label: 'Fitness', max: 17, color: C.mint }, { label: 'Media', max: 24, color: C.yellow }, { label: 'Eccesso', max: 40, color: C.red }] },
    F: { min: 10, bands: [{ label: 'Essenziale', max: 13, color: C.blue }, { label: 'Atletico', max: 20, color: C.green }, { label: 'Fitness', max: 24, color: C.mint }, { label: 'Media', max: 31, color: C.yellow }, { label: 'Eccesso', max: 45, color: C.red }] },
};
const BMI_BANDS = { min: 15, bands: [{ label: 'Sottopeso', max: 18.5, color: C.blue }, { label: 'Normopeso', max: 25, color: C.green }, { label: 'Sovrappeso', max: 30, color: C.yellow }, { label: 'Obesità', max: 40, color: C.red }] };
const WHTR_BANDS = { min: 0.3, bands: [{ label: 'Basso', max: 0.4, color: C.blue }, { label: 'Ottimale', max: 0.5, color: C.green }, { label: 'Rischio', max: 0.6, color: C.yellow }, { label: 'Alto rischio', max: 0.75, color: C.red }] };
const WHR_BANDS = {
    M: { min: 0.7, bands: [{ label: 'Basso', max: 0.9, color: C.green }, { label: 'Moderato', max: 0.99, color: C.yellow }, { label: 'Alto', max: 1.2, color: C.red }] },
    F: { min: 0.6, bands: [{ label: 'Basso', max: 0.8, color: C.green }, { label: 'Moderato', max: 0.85, color: C.yellow }, { label: 'Alto', max: 1.1, color: C.red }] },
};
const FFMI_BANDS = {
    M: { min: 12, bands: [{ label: 'Basso', max: 17, color: C.blue }, { label: 'Nella media', max: 20, color: C.green }, { label: 'Elevato', max: 23, color: C.mint }, { label: 'Molto elevato', max: 28, color: C.yellow }] },
    F: { min: 10, bands: [{ label: 'Basso', max: 14, color: C.blue }, { label: 'Nella media', max: 17, color: C.green }, { label: 'Elevato', max: 20, color: C.mint }, { label: 'Molto elevato', max: 24, color: C.yellow }] },
};
const FMI_BANDS = {
    M: { min: 0, bands: [{ label: 'Basso', max: 3, color: C.blue }, { label: 'Normale', max: 6, color: C.green }, { label: 'Eccesso', max: 9, color: C.yellow }, { label: 'Obesità', max: 15, color: C.red }] },
    F: { min: 0, bands: [{ label: 'Basso', max: 5, color: C.blue }, { label: 'Normale', max: 9, color: C.green }, { label: 'Eccesso', max: 13, color: C.yellow }, { label: 'Obesità', max: 20, color: C.red }] },
};
const PHA_BANDS = {
    M: { min: 3, bands: [{ label: 'Basso', max: 5, color: C.red }, { label: 'Ridotto', max: 6, color: C.yellow }, { label: 'Buono', max: 7.5, color: C.green }, { label: 'Ottimo', max: 10, color: C.mint }] },
    F: { min: 3, bands: [{ label: 'Basso', max: 4.5, color: C.red }, { label: 'Ridotto', max: 5.5, color: C.yellow }, { label: 'Buono', max: 7, color: C.green }, { label: 'Ottimo', max: 9, color: C.mint }] },
};
export const bandOf = (v, def) => def.bands.find((b) => v <= b.max) || def.bands[def.bands.length - 1];

const PLICHE = [
    ['pl_pettorale', 'Pettorale'],
    ['pl_ascellare', 'Ascellare'],
    ['pl_tricipite', 'Tricipite'],
    ['pl_bicipite', 'Bicipite'],
    ['pl_sottoscap', 'Sottoscapolare'],
    ['pl_sovrailiaca', 'Sovrailiaca'],
    ['pl_addome', 'Addome'],
    ['pl_coscia', 'Coscia'],
    ['pl_polpaccio', 'Polpaccio'],
];
const CIRC = [
    ['cm_collo', 'Collo'],
    ['cm_torace', 'Torace'],
    ['cm_vita_min', 'Vita'],
    ['cm_fianchi_max', 'Fianchi'],
    ['circ_braccio', 'Braccio'],
    ['circ_avambr', 'Avambraccio'],
    ['circ_polso', 'Polso'],
    ['circ_coscia', 'Coscia'],
    ['circ_polpaccio', 'Polpaccio'],
    ['circ_caviglia', 'Caviglia'],
];

const Card = ({ icon, title, sub, children, compact, className = '' }) => (
    <div className={`bg-white border border-stone-200 flex flex-col ${compact ? 'rounded-xl p-2.5 gap-1.5' : 'rounded-2xl p-4 gap-3 shadow-[0_1px_2px_rgba(0,0,0,.03)]'} ${className}`} style={compact ? { breakInside: 'avoid' } : null}>
        <div className="flex items-start gap-2.5">
            <span className={`rounded-full bg-stone-100 text-stone-700 grid place-items-center flex-none ${compact ? 'w-5 h-5' : 'w-8 h-8'}`}>
                <i className={`ph-bold ${icon} ${compact ? 'text-[11px]' : 'text-[15px]'}`}></i>
            </span>
            <div className="min-w-0">
                <h4 className={`font-bold text-stone-900 leading-tight ${compact ? 'text-[11px]' : 'text-[14px]'}`}>{title}</h4>
                {sub && <p className={`text-stone-500 leading-snug ${compact ? 'text-[8.5px]' : 'text-[11.5px] mt-0.5'}`}>{sub}</p>}
            </div>
        </div>
        {children}
    </div>
);

const Empty = ({ children }) => <p className="text-stone-400 text-[12px] text-center py-5 px-3 leading-relaxed">{children}</p>;

const Gauge = ({ title, note, compact, ...g }) => (
    <div>
        <div className={`flex justify-between items-baseline ${compact ? 'text-[9px] mb-0.5' : 'text-[12px] mb-1'}`}>
            <span className="font-semibold text-stone-700">{title}</span>
            {note && <span className="text-stone-500">{note}</span>}
        </div>
        <BandGauge {...g} height={compact ? 50 : 54} />
    </div>
);

const Stat = ({ label, value, unit, note, compact, strong }) => (
    <div className={`border rounded-xl text-center ${strong ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200'} ${compact ? 'px-1.5 py-1.5' : 'px-2 py-2.5'}`}>
        <div className={`font-bold uppercase tracking-[.08em] ${strong ? 'text-stone-400' : 'text-stone-400'} ${compact ? 'text-[7px]' : 'text-[9.5px]'}`}>{label}</div>
        <div className={`font-extrabold leading-tight tabular-nums ${strong ? 'text-white' : 'text-stone-900'} ${compact ? 'text-[15px]' : 'text-[22px]'}`}>
            {value}
            {unit && <span className={`font-semibold ml-0.5 ${strong ? 'text-stone-400' : 'text-stone-400'} ${compact ? 'text-[8px]' : 'text-[11px]'}`}>{unit}</span>}
        </div>
        {note && <div className={`font-semibold truncate ${strong ? 'text-stone-300' : 'text-stone-500'} ${compact ? 'text-[7.5px]' : 'text-[10.5px]'}`}>{note}</div>}
    </div>
);

// punti dell'andamento: visite salvate + quella mostrata (se non è già nello storico)
const trendSeries = (patient, visitData, report, sesso, eta, date) => {
    const rows = (patient?.visite || []).map((v) => {
        const d = { ...(v.dettagli || {}), peso: v.peso ?? v.dettagli?.peso };
        return { date: v.data, d, r: v.dettagli || {} };
    });
    const curDate = date || new Date().toISOString().slice(0, 10);
    if (!rows.some((x) => String(x.date) === String(curDate))) rows.push({ date: curDate, d: visitData, r: report });
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));
    const all = rows.map((x) => {
        const c = getComposition(x.d, x.r, sesso, eta);
        return { date: x.date, peso: num(x.d.peso), fm: c.fm, ffm: c.ffmKg, vita: num(x.d.cm_vita_min) };
    });
    return [
        ['peso', 'Peso', 'kg', '#4f46e5'],
        ['fm', 'Massa grassa', '%', C.fat],
        ['ffm', 'Massa magra', 'kg', '#059669'],
        ['vita', 'Vita', 'cm', '#0284c7'],
    ]
        .map(([k, label, unit, color]) => ({ key: k, label, unit, color, pts: all.filter((p) => p[k] > 0).map((p) => ({ date: p.date, v: p[k] })) }))
        .filter((s) => s.pts.length >= 2);
};

export const BodyCompositionCharts = ({ visitData = {}, report = {}, sesso = 'M', eta = 30, only = null, compact = false, patient = null, date = null, columns }) => {
    const sx = sesso === 'F' ? 'F' : 'M';
    const show = (id) => !only || only.includes(id);
    const k = useMemo(() => bodyIndices(visitData, report, sx, eta), [visitData, report, sx, eta]);
    const comp = k.comp;
    const hasFm = comp.fm > 0;
    const pliche = PLICHE.map(([key, label]) => ({ label, value: num(visitData[key]) })).filter((r) => r.value > 0);
    const circ = CIRC.map(([key, label]) => {
        const dx = num(visitData[`${key}_dx`]);
        const sxv = num(visitData[`${key}_sx`]);
        const single = num(visitData[key]) || (key === 'circ_braccio' ? num(visitData.circ_braccio_flesso) : 0);
        return dx || sxv ? { label, value: dx || sxv, value2: dx && sxv ? sxv : 0 } : { label, value: single };
    }).filter((r) => r.value > 0);
    const trend = useMemo(() => (show('trend') && patient ? trendSeries(patient, visitData, report, sx, eta, date) : []), [patient, visitData, report, sx, eta, date]); // eslint-disable-line react-hooks/exhaustive-deps

    const fmDef = FM_BANDS[sx];
    const srcNote = comp.source === 'stima' ? `stima ${comp.method}` : comp.source ? `Metodo ${comp.source}${comp.method ? ` · ${comp.method}` : ''}` : '';
    const sumPl = pliche.reduce((a, r) => a + r.value, 0);

    const cards = [];
    const push = (id, node, ok, wide) => {
        if (!show(id)) return;
        if (!ok && compact) return;
        cards.push({ id, node, wide });
    };

    push(
        'composizione',
        <Card key="composizione" compact={compact} icon="ph-chart-donut" title="Composizione corporea" sub={hasFm ? srcNote : 'Massa grassa e massa magra'}>
            {hasFm ? (
                <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4'}`}>
                    <div style={{ width: compact ? 70 : 132, flex: 'none' }}>
                        <Donut size={150} thick={22} parts={[{ value: comp.fmKg || comp.fm, color: C.fat }, { value: comp.ffmKg || 100 - comp.fm, color: C.lean }]} center={`${fmt(comp.fm)}%`} sub="GRASSO" />
                    </div>
                    <div className={`flex-1 grid ${compact ? 'gap-1 text-[9px]' : 'gap-2 text-[12.5px]'}`}>
                        {[
                            ['Massa grassa', comp.fmKg, C.fat, `${fmt(comp.fm)}%`],
                            ['Massa magra', comp.ffmKg, C.lean, `${fmt(100 - comp.fm)}%`],
                        ].map(([l, kg, c, p]) => (
                            <div key={l} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: c }} />
                                <span className="text-stone-600 flex-1 whitespace-nowrap">{l}</span>
                                <b className="tabular-nums text-stone-900">{kg ? `${fmt(kg)} kg` : p}</b>
                            </div>
                        ))}
                        {k.peso > 0 && (
                            <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-stone-500">
                                <span className="w-2.5 flex-none" />
                                <span className="flex-1 whitespace-nowrap">Peso totale</span>
                                <b className="tabular-nums text-stone-900">{fmt(k.peso)} kg</b>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <Empty>Inserisci le pliche nella visita: la massa grassa viene calcolata (o stimata) in automatico.</Empty>
            )}
        </Card>,
        hasFm
    );

    push(
        'grasso',
        <Card key="grasso" compact={compact} icon="ph-drop" title="Massa grassa" sub={`Riferimenti ${sx === 'F' ? 'donna' : 'uomo'} (ACE)`}>
            {hasFm ? (
                <>
                    <Gauge compact={compact} title="% massa grassa" note={bandOf(comp.fm, fmDef).label} value={comp.fm} unit="%" min={fmDef.min} bands={fmDef.bands} />
                    {k.fmi > 0 && <Gauge compact={compact} title="Indice di massa grassa (FMI)" note="kg/m²" value={k.fmi} min={FMI_BANDS[sx].min} bands={FMI_BANDS[sx].bands} />}
                </>
            ) : (
                <Empty>Dato non disponibile senza plicometria.</Empty>
            )}
        </Card>,
        hasFm
    );

    const risk = k.bmi > 0 || k.whtr > 0 || k.whr > 0;
    push(
        'rischio',
        <Card key="rischio" compact={compact} icon="ph-heartbeat" title="Indici di rischio" sub="Peso, girovita e salute cardiometabolica">
            {risk ? (
                <>
                    {k.bmi > 0 && <Gauge compact={compact} title="BMI" note={bandOf(k.bmi, BMI_BANDS).label} value={k.bmi} min={BMI_BANDS.min} bands={BMI_BANDS.bands} />}
                    {k.whtr > 0 && <Gauge compact={compact} title="Vita / altezza" note={bandOf(k.whtr, WHTR_BANDS).label} value={k.whtr} digits={2} min={WHTR_BANDS.min} bands={WHTR_BANDS.bands} />}
                    {k.whr > 0 && <Gauge compact={compact} title="Vita / fianchi" note={bandOf(k.whr, WHR_BANDS[sx]).label} value={k.whr} digits={2} min={WHR_BANDS[sx].min} bands={WHR_BANDS[sx].bands} />}
                </>
            ) : (
                <Empty>Servono peso, altezza e circonferenza vita.</Empty>
            )}
        </Card>,
        risk
    );

    push(
        'magra',
        <Card key="magra" compact={compact} icon="ph-barbell" title="Massa magra" sub="Muscoli, ossa e acqua in rapporto all'altezza">
            {k.ffmi > 0 ? (
                <>
                    <Gauge compact={compact} title="Indice di massa magra (FFMI)" note={`${fmt(comp.ffmKg)} kg`} value={k.ffmi} min={FFMI_BANDS[sx].min} bands={FFMI_BANDS[sx].bands} />
                    {!compact && <p className="text-[11.5px] text-stone-500 leading-relaxed">FFMI = massa magra / altezza². Utile per seguire il mantenimento muscolare durante il dimagrimento.</p>}
                </>
            ) : (
                <Empty>Serve la massa grassa per calcolare la massa magra.</Empty>
            )}
        </Card>,
        k.ffmi > 0
    );

    push(
        'pliche',
        <Card key="pliche" compact={compact} icon="ph-ruler" title="Pliche" sub={pliche.length ? `Somma di ${pliche.length}: ${fmt(sumPl)} mm` : 'Spessore in millimetri'}>
            {pliche.length ? <HBars rows={pliche} unit="mm" color="#f59e0b" rowH={compact ? 17 : 22} /> : <Empty>Nessuna plica inserita.</Empty>}
        </Card>,
        pliche.length > 0
    );

    push(
        'circ',
        <Card key="circ" compact={compact} icon="ph-arrows-out-line-horizontal" title="Circonferenze" sub={circ.some((r) => r.value2) ? 'Centimetri · destra e sinistra' : 'Centimetri per distretto'}>
            {circ.length ? <HBars rows={circ} unit="cm" color="#0ea5e9" legend={['Destra', 'Sinistra']} rowH={compact ? 17 : 22} /> : <Empty>Nessuna circonferenza inserita.</Empty>}
        </Card>,
        circ.length > 0
    );

    push(
        'bia',
        <Card key="bia" compact={compact} icon="ph-lightning" title="Bioimpedenza" sub="Angolo di fase: qualità e integrità delle cellule">
            {k.pha > 0 ? (
                <>
                    <Gauge compact={compact} title="Angolo di fase" note={bandOf(k.pha, PHA_BANDS[sx]).label} value={k.pha} unit="°" min={PHA_BANDS[sx].min} bands={PHA_BANDS[sx].bands} />
                    <div className={`grid grid-cols-4 gap-1.5 text-center ${compact ? 'text-[8px]' : 'text-[11px]'}`}>
                        {[
                            ['Rz', k.rz, 'Ω'],
                            ['Xc', k.xc, 'Ω'],
                            ['Rz/H', k.rzH, 'Ω/m'],
                            ['Xc/H', k.xcH, 'Ω/m'],
                        ].map(([l, v, u]) => (
                            <div key={l} className="bg-stone-50 rounded-lg py-1">
                                <div className="text-stone-400 font-semibold">{l}</div>
                                <b className="text-stone-900 tabular-nums">{fmt(v, 0)}</b> <span className="text-stone-400">{u}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <Empty>Inserisci resistenza (Rz) e reattanza (Xc) nella bioimpedenza.</Empty>
            )}
        </Card>,
        k.pha > 0
    );

    if (comp.A && comp.B)
        push(
            'metodi',
            <Card key="metodi" compact={compact} icon="ph-scales" title="Confronto dei metodi" sub="% massa grassa con le due formule scelte">
                <HBars
                    rows={[
                        { label: 'Metodo A', value: comp.A.fm, color: '#6366f1' },
                        { label: 'Metodo B', value: comp.B.fm, color: '#a78bfa' },
                    ]}
                    unit="%"
                    rowH={compact ? 18 : 24}
                />
                <p className={`text-stone-500 ${compact ? 'text-[8px]' : 'text-[11px]'}`}>Differenza: {fmt(Math.abs(comp.A.fm - comp.B.fm))} punti percentuali.</p>
            </Card>,
            true
        );

    push(
        'trend',
        <Card key="trend" compact={compact} icon="ph-chart-line-up" title="Andamento nel tempo" sub={trend.length ? `${trend[0].pts.length} rilevazioni` : 'Servono almeno due visite'}>
            {trend.length ? (
                <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'}`}>
                    {trend.map((s) => (
                        <div key={s.key}>
                            <div className={`font-semibold text-stone-700 ${compact ? 'text-[8.5px]' : 'text-[12px]'}`}>{s.label}</div>
                            <MiniTrend pts={s.pts} unit={s.unit} color={s.color} height={compact ? 100 : 110} />
                        </div>
                    ))}
                </div>
            ) : (
                <Empty>Con la prossima visita qui vedrai come cambiano peso, massa grassa e girovita.</Empty>
            )}
        </Card>,
        trend.length > 0,
        true
    );

    // nel report i riquadri seguono l'ordine richiesto
    if (only) cards.sort((a, b) => only.indexOf(a.id) - only.indexOf(b.id));

    return (
        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
            {show('stats') && (
                <div className={`grid ${compact ? 'grid-cols-6 gap-1.5' : 'grid-cols-3 sm:grid-cols-6 gap-2'}`}>
                    <Stat compact={compact} strong label="Peso" value={k.peso ? fmt(k.peso) : '--'} unit="kg" />
                    <Stat compact={compact} label="BMI" value={k.bmi ? fmt(k.bmi) : '--'} note={k.bmi ? bandOf(k.bmi, BMI_BANDS).label : ''} />
                    <Stat compact={compact} label="Massa grassa" value={hasFm ? fmt(comp.fm) : '--'} unit="%" note={hasFm ? (comp.source === 'stima' ? 'stima dalle pliche' : bandOf(comp.fm, fmDef).label) : 'servono le pliche'} />
                    <Stat compact={compact} label="Grasso" value={comp.fmKg ? fmt(comp.fmKg) : '--'} unit="kg" />
                    <Stat compact={compact} label="Massa magra" value={comp.ffmKg ? fmt(comp.ffmKg) : '--'} unit="kg" />
                    <Stat compact={compact} label="Angolo di fase" value={k.pha ? fmt(k.pha) : '--'} unit="°" note={k.pha ? bandOf(k.pha, PHA_BANDS[sx]).label : ''} />
                </div>
            )}
            {cards.length > 0 && (
                <div className={compact ? `grid gap-2 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}` : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 items-start'}>
                    {cards.map((c) => (
                        <div key={c.id} className={c.wide ? (compact ? (columns === 1 ? '' : columns === 2 ? 'col-span-2' : 'col-span-3') : 'md:col-span-2') : ''}>
                            {c.node}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
