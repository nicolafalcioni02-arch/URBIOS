import React, { createContext, useContext, useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CompactCtx = createContext(false); // report: riquadri piccoli, tre per riga
const num = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const r1 = (v) => Math.round(v * 10) / 10;

// Fasce di % massa grassa (ACE, adattate): [min, max] per sesso
const FM_BANDS = {
    M: [
        { label: 'Essenziale', max: 6, color: '#93c5fd' },
        { label: 'Atletico', max: 14, color: '#6ee7b7' },
        { label: 'Fitness', max: 18, color: '#a7f3d0' },
        { label: 'Nella media', max: 25, color: '#fde68a' },
        { label: 'Eccesso', max: 40, color: '#fca5a5' },
    ],
    F: [
        { label: 'Essenziale', max: 14, color: '#93c5fd' },
        { label: 'Atletico', max: 21, color: '#6ee7b7' },
        { label: 'Fitness', max: 25, color: '#a7f3d0' },
        { label: 'Nella media', max: 32, color: '#fde68a' },
        { label: 'Eccesso', max: 45, color: '#fca5a5' },
    ],
};

const PLICHE = [
    ['pl_pettorale', 'Pettorale'],
    ['pl_tricipite', 'Tricipite'],
    ['pl_bicipite', 'Bicipite'],
    ['pl_sottoscap', 'Sottoscapolare'],
    ['pl_ascellare', 'Ascellare'],
    ['pl_addome', 'Addome'],
    ['pl_sovrailiaca', 'Sovrailiaca'],
    ['pl_coscia', 'Coscia'],
    ['pl_polpaccio', 'Polpaccio'],
];

const CIRC = [
    ['cm_collo', 'Collo'],
    ['cm_torace', 'Torace'],
    ['circ_braccio', 'Braccio'],
    ['circ_avambr', 'Avambraccio'],
    ['cm_vita_min', 'Vita'],
    ['cm_fianchi_max', 'Fianchi'],
    ['circ_coscia', 'Coscia'],
    ['circ_polpaccio', 'Polpaccio'],
];

const Card = ({ icon, title, sub, children, empty }) => {
    const compact = useContext(CompactCtx);
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col ${compact ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center gap-2 border-b border-gray-100 ${compact ? 'mb-1 pb-1' : 'mb-2 pb-2 gap-3'}`}>
                <div className={`rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-none ${compact ? 'w-5 h-5' : 'w-7 h-7'}`}>
                    <i className={`ph-fill ${icon} ${compact ? 'text-[10px]' : 'text-sm'}`}></i>
                </div>
                <div className="min-w-0">
                    <h4 className={`font-bold text-gray-900 leading-tight ${compact ? 'text-[11px]' : 'text-sm'}`}>{title}</h4>
                    {sub && <p className={`text-gray-400 font-semibold ${compact ? 'text-[8px] leading-tight' : 'text-[10px]'}`}>{sub}</p>}
                </div>
            </div>
            {empty ? (
                <p className={`text-gray-400 italic text-center text-xs ${compact ? 'py-3 text-[10px]' : 'py-6'}`}>{empty}</p>
            ) : (
                <div className={`relative ${compact ? 'h-[92px]' : 'h-[170px]'}`}>{children}</div>
            )}
        </div>
    );
};

const Stat = ({ label, value, unit, note }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-2 py-1.5 text-center">
        <div className="text-[9px] font-bold text-gray-400 uppercase">{label}</div>
        <div className="text-lg font-black text-gray-800 leading-tight">
            {value}
            <span className="text-xs font-semibold text-gray-400 ml-1">{unit}</span>
        </div>
        {note && <div className="text-[10px] font-semibold text-gray-500">{note}</div>}
    </div>
);

const baseOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

// `only`: elenco di grafici da mostrare (per il report); `fixed`: misure fisse e niente animazioni, per la stampa.
export const BodyCompositionCharts = ({ visitData = {}, report = {}, sesso = 'M', eta = 30, only = null, fixed: fixed0 = false, compact = false }) => {
    const fixed = fixed0 || compact;
    const show = (id) => !only || only.includes(id);
    const R = fixed ? { responsive: false, animation: false, ...(compact ? { font: { size: 8 } } : {}) } : {};
    const legendBottom = compact ? { display: true, position: 'bottom', labels: { boxWidth: 7, padding: 4, font: { size: 8 } } } : { display: true, position: 'bottom' };
    const cp = compact ? { width: 218, height: 92 } : fixed ? { width: 330, height: 170 } : {};
    const d = useMemo(() => {
        const peso = num(visitData.peso);
        const altezza = num(visitData.altezza);
        const m = (k) => num(report?.risultati_metodo_A?.[k] === '--' ? 0 : report?.risultati_metodo_A?.[k]);
        const mb = (k) => num(report?.risultati_metodo_B?.[k] === '--' ? 0 : report?.risultati_metodo_B?.[k]);
        const A = { fm: m('fm_percent'), fmKg: m('fm_kg'), ffmKg: m('ffm_kg') };
        const B = { fm: mb('fm_percent'), fmKg: mb('fm_kg'), ffmKg: mb('ffm_kg') };
        const main = A.fm > 0 ? A : B;
        const h = altezza / 100;
        const bmi = h > 0 && peso > 0 ? peso / (h * h) : 0;
        const vita = num(visitData.cm_vita_min);
        const fianchi = num(visitData.cm_fianchi_max);
        const rz = num(visitData.biva_rz);
        const xc = num(visitData.biva_xc);
        return {
            peso,
            altezza,
            A,
            B,
            main,
            bmi,
            vita,
            fianchi,
            whr: vita > 0 && fianchi > 0 ? vita / fianchi : 0,
            whtr: vita > 0 && altezza > 0 ? vita / altezza : 0,
            fmi: main.fmKg > 0 && h > 0 ? main.fmKg / (h * h) : 0,
            ffmi: main.ffmKg > 0 && h > 0 ? main.ffmKg / (h * h) : 0,
            pha: rz > 0 && xc > 0 ? (Math.atan2(xc, rz) * 180) / Math.PI : 0,
            rzH: rz > 0 && h > 0 ? rz / h : 0,
            xcH: xc > 0 && h > 0 ? xc / h : 0,
            pliche: PLICHE.map(([k, l]) => [l, num(visitData[k])]).filter(([, v]) => v > 0),
            circ: CIRC.map(([k, l]) => [l, num(visitData[k]) || num(visitData[`${k}_dx`]) || num(visitData[`${k}_sx`]) || (k === 'circ_braccio' ? num(visitData.circ_braccio_flesso) : 0)]).filter(([, v]) => v > 0),
        };
    }, [visitData, report]);

    const bands = FM_BANDS[sesso] || FM_BANDS.M;
    const hasFm = d.main.fm > 0;
    const bandOf = (v) => bands.find((b) => v <= b.max) || bands[bands.length - 1];
    const bmiCat = d.bmi < 18.5 ? 'Sottopeso' : d.bmi < 25 ? 'Normopeso' : d.bmi < 30 ? 'Sovrappeso' : 'Obesità';
    const whrLimit = sesso === 'F' ? 0.85 : 0.9;

    // Per i grafici a barre orizzontali a fasce: segmenti impilati con il marcatore del paziente
    const bandChart = (value, bandsArr, max, unit = '%') => ({
        labels: [''],
        datasets: [
            ...bandsArr.map((b, i) => {
                const prev = i === 0 ? 0 : bandsArr[i - 1].max;
                return { label: b.label, data: [Math.max(0, Math.min(b.max, max) - prev)], backgroundColor: b.color, borderWidth: 0, stack: 's' };
            }),
        ],
        _v: value,
        _u: unit,
    });
    const markerPlugin = (value, max) => ({
        id: 'marker',
        afterDatasetsDraw(chart) {
            const { ctx, scales, chartArea } = chart;
            const x = scales.x.getPixelForValue(Math.min(value, max));
            ctx.save();
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top - 2);
            ctx.lineTo(x - 7, chartArea.top - 14);
            ctx.lineTo(x + 7, chartArea.top - 14);
            ctx.fill();
            ctx.fillRect(x - 1.5, chartArea.top, 3, chartArea.bottom - chartArea.top);
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(r1(value)), x, chartArea.top - 18);
            ctx.restore();
        },
    });
    const bandOpts = (max) => ({
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        ...R,
        layout: { padding: { top: compact ? 16 : 24 } },
        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: compact ? 7 : 10, padding: compact ? 4 : 10, font: { size: compact ? 8 : 10 } } } },
        scales: { x: { stacked: true, max, grid: { display: false } }, y: { stacked: true, display: false } },
    });

    const imcBands = [
        { label: 'Sottopeso', max: 18.5, color: '#93c5fd' },
        { label: 'Normopeso', max: 25, color: '#6ee7b7' },
        { label: 'Sovrappeso', max: 30, color: '#fde68a' },
        { label: 'Obesità', max: 40, color: '#fca5a5' },
    ];
    const whtrBands = [
        { label: 'Basso', max: 0.4, color: '#93c5fd' },
        { label: 'Ottimale', max: 0.5, color: '#6ee7b7' },
        { label: 'Rischio', max: 0.6, color: '#fde68a' },
        { label: 'Alto rischio', max: 0.8, color: '#fca5a5' },
    ];

    return (
        <CompactCtx.Provider value={compact}>
        <div className="flex flex-col gap-3">
            <div className="hidden">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <i className="ph-fill ph-chart-pie-slice text-2xl"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-xl">Composizione corporea</h3>
                    <p className="text-xs text-gray-400 font-bold">Calcolata dalle misure della visita in corso</p>
                </div>
            </div>

            {show('stats') && <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <Stat label="Peso" value={d.peso ? r1(d.peso) : '--'} unit="kg" />
                <Stat label="BMI" value={d.bmi ? r1(d.bmi) : '--'} note={d.bmi ? bmiCat : ''} />
                <Stat label="Massa grassa" value={hasFm ? r1(d.main.fm) : '--'} unit="%" note={hasFm ? bandOf(d.main.fm).label : 'serve la plicometria'} />
                <Stat label="Massa magra" value={d.main.ffmKg ? r1(d.main.ffmKg) : '--'} unit="kg" />
                <Stat label="FMI" value={d.fmi ? r1(d.fmi) : '--'} unit="kg/m²" />
                <Stat label="FFMI" value={d.ffmi ? r1(d.ffmi) : '--'} unit="kg/m²" />
            </div>}

            <div className={fixed ? `grid ${only && only.length === 1 ? 'grid-cols-1' : compact ? 'grid-cols-3 gap-2' : 'grid-cols-2'} gap-3` : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3'}>
                {show('donut') && (
                <Card icon="ph-chart-donut" title="Massa grassa / magra" sub="In kg sul peso totale" empty={!hasFm && 'Compila la plicometria per vedere la ripartizione.'}>
                    {hasFm && (
                        <Doughnut
                            {...cp}
                            data={{
                                labels: ['Massa grassa', 'Massa magra'],
                                datasets: [{ data: [r1(d.main.fmKg), r1(d.main.ffmKg)], backgroundColor: ['#fb7185', '#34d399'], borderWidth: 0 }],
                            }}
                            options={{
                                ...baseOpts, ...R,
                                cutout: '62%',
                                plugins: {
                                    legend: legendBottom,
                                    tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed} kg` } },
                                },
                            }}
                        />
                    )}
                </Card>
                )}

                {show('fasce') && (
                <Card icon="ph-gauge" title="% massa grassa nelle fasce" sub={`Riferimento ${sesso === 'F' ? 'donna' : 'uomo'}`} empty={!hasFm && 'Dato non disponibile.'}>
                    {hasFm && <Bar {...cp} data={bandChart(d.main.fm, bands, 40)} options={bandOpts(40)} plugins={[markerPlugin(d.main.fm, 40)]} />}
                </Card>
                )}

                {show('confronto') && (
                <Card icon="ph-scales" title="Confronto metodi plicometrici" sub="% massa grassa: Metodo A vs B" empty={!(d.A.fm > 0 || d.B.fm > 0) && 'Nessun metodo calcolabile.'}>
                    <Bar
                        {...cp}
                        data={{
                            labels: ['Metodo A', 'Metodo B'],
                            datasets: [{ data: [r1(d.A.fm), r1(d.B.fm)], backgroundColor: ['#6366f1', '#a78bfa'], borderRadius: 8 }],
                        }}
                        options={{ ...baseOpts, ...R, scales: { y: { beginAtZero: true, title: { display: true, text: '% FM' } } } }}
                    />
                </Card>
                )}

                {show('composizione') && (
                <Card icon="ph-stack" title="Composizione per metodo" sub="Massa grassa e magra (kg)" empty={!(d.A.fm > 0 || d.B.fm > 0) && 'Nessun metodo calcolabile.'}>
                    <Bar
                        {...cp}
                        data={{
                            labels: ['Metodo A', 'Metodo B'],
                            datasets: [
                                { label: 'Massa grassa', data: [r1(d.A.fmKg), r1(d.B.fmKg)], backgroundColor: '#fb7185', borderRadius: 6 },
                                { label: 'Massa magra', data: [r1(d.A.ffmKg), r1(d.B.ffmKg)], backgroundColor: '#34d399', borderRadius: 6 },
                            ],
                        }}
                        options={{
                            ...baseOpts, ...R,
                            plugins: { legend: legendBottom },
                            scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: 'kg' } } },
                        }}
                    />
                </Card>
                )}

                {show('pliche') && (
                <Card icon="ph-ruler" title="Spessori delle pliche" sub="Millimetri per sito" empty={!d.pliche.length && 'Nessuna plica inserita.'}>
                    <Bar
                        {...cp}
                        data={{
                            labels: d.pliche.map(([l]) => l),
                            datasets: [{ data: d.pliche.map(([, v]) => v), backgroundColor: '#f59e0b', borderRadius: 6 }],
                        }}
                        options={{ ...baseOpts, ...R, indexAxis: compact ? 'x' : 'y', scales: compact ? { x: { ticks: { autoSkip: false, font: { size: 7 } } }, y: { title: { display: true, text: 'mm', font: { size: 8 } } } } : { x: { title: { display: true, text: 'mm' } }, y: { ticks: { autoSkip: false } } } }}
                    />
                </Card>
                )}

                {show('circ') && (
                <Card icon="ph-tape" title="Circonferenze" sub="Centimetri per distretto" empty={!d.circ.length && 'Nessuna circonferenza inserita.'}>
                    <Bar
                        {...cp}
                        data={{
                            labels: d.circ.map(([l]) => l),
                            datasets: [{ data: d.circ.map(([, v]) => v), backgroundColor: '#0ea5e9', borderRadius: 6 }],
                        }}
                        options={{ ...baseOpts, ...R, scales: { y: { title: { display: true, text: 'cm' } } } }}
                    />
                </Card>
                )}

                {show('bmi') && (
                <Card icon="ph-person-simple" title="BMI" sub="Indice di massa corporea" empty={!d.bmi && 'Servono peso e altezza.'}>
                    {d.bmi > 0 && <Bar {...cp} data={bandChart(d.bmi, imcBands, 40)} options={bandOpts(40)} plugins={[markerPlugin(d.bmi, 40)]} />}
                </Card>
                )}

                {show('whtr') && (
                <Card icon="ph-heartbeat" title="Rapporto vita / altezza" sub={d.whr > 0 ? `Vita/fianchi ${d.whr.toFixed(2)} ${d.whr > whrLimit ? '(sopra il limite)' : '(nella norma)'}` : 'Rischio cardiometabolico'} empty={!d.whtr && 'Servono vita e altezza.'}>
                    {d.whtr > 0 && <Bar {...cp} data={bandChart(d.whtr, whtrBands, 0.8)} options={bandOpts(0.8)} plugins={[markerPlugin(Number(d.whtr.toFixed(2)), 0.8)]} />}
                </Card>
                )}

                {show('bia') && (
                <Card icon="ph-lightning" title="Bioimpedenza vettoriale" sub="Angolo di fase, Rz/H e Xc/H" empty={!d.pha && 'Inserisci Rz e Xc nella bioimpedenza.'}>
                    <Bar
                        {...cp}
                        data={{
                            labels: ['Angolo di fase (°)', 'Rz/H (Ω/m)', 'Xc/H (Ω/m)'],
                            datasets: [{ data: [r1(d.pha), r1(d.rzH), r1(d.xcH)], backgroundColor: ['#8b5cf6', '#14b8a6', '#f43f5e'], borderRadius: 6 }],
                        }}
                        options={{ ...baseOpts, ...R, scales: { y: { beginAtZero: true } } }}
                    />
                </Card>
                )}
            </div>
        </div>
        </CompactCtx.Provider>
    );
};
