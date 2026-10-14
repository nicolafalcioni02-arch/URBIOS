import React, { useMemo } from 'react';
import { Somatocarta } from '../../components/charts/somatocarta/Somatocarta';
import { BodyCompositionCharts } from './sections/BodyCompositionCharts';
import { snapshotBody } from './sections/Body3D';
import { TrendChart, trendPoints } from './sections/TrendChart';
import { PLI_SITES } from './sections/measureSites';

// Report grafici: due pagine fisse (corpo 3D e indici; grafici, andamento e parametri) usate dal Centro stampa.
export const chartsCss = `
.cr-page { display: flex; flex-direction: column; gap: 3mm; font-family: Inter, system-ui, sans-serif; color: #111827; }
.cr-hd { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--accent, #111827); padding-bottom: 3mm; }
.cr-hd h1 { font-size: 18px; margin: 0; } .cr-hd p { margin: 2px 0 0; font-size: 11px; color: #6b7280; }
.cr-imgs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
.cr-imgs figure { margin: 0; padding: 0 5mm; text-align: center; font-size: 9px; color: #6b7280; } .cr-imgs img { width: 100%; height: auto; display: block; }
.cr-box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px 8px; font-size: 11px; }
.cr-box > strong { display: block; margin-bottom: 3px; }
.cr-params { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px 12px; font-size: 9px; }
.cr-params table { border-collapse: collapse; width: 100%; align-self: start; } .cr-params th { text-align: left; font-size: 9px; color: var(--accent, #4f46e5); border-bottom: 1px solid #e5e7eb; padding: 1px 0; }
.cr-params td { padding: 1px 0; color: #374151; } .cr-params td:last-child { text-align: right; font-weight: 700; }
`;
const pv = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) && n !== 0 ? String(Math.round(n * 100) / 100).replace('.', ',') : null;
};
const bil = (d, k) => pv(d[k]) ?? pv(d[`${k}_dx`]) ?? pv(d[`${k}_sx`]);

// Tutti i parametri inseriti nella visita, raggruppati: compare solo quello che c'è
const paramGroups = (d, rep) => {
    const rows = (list) => list.map(([l, v, u]) => (v ? [l, v, u] : null)).filter(Boolean);
    const groups = [
        ['Circonferenze', rows([
            ['Collo', pv(d.cm_collo), 'cm'], ['Torace', pv(d.cm_torace), 'cm'], ['Vita', pv(d.cm_vita_min), 'cm'], ['Fianchi', pv(d.cm_fianchi_max), 'cm'],
            ['Braccio', bil(d, 'circ_braccio'), 'cm'], ['Avambraccio', bil(d, 'circ_avambr'), 'cm'], ['Coscia', bil(d, 'circ_coscia'), 'cm'], ['Polpaccio', bil(d, 'circ_polpaccio'), 'cm'],
        ])],
        ['Pliche', rows(PLI_SITES.map((s) => [s.label, pv(d[s.key]), 'mm']))],
        ['Diametri', rows([
            ['Omero', pv(d.dm_omero), 'mm'], ['Femore', pv(d.dm_femore), 'mm'], ['Polso', pv(d.dm_polso), 'mm'],
            ['Biacromiale', pv(d.dm_biacrom), 'mm'], ['Bi-iliaco', pv(d.dm_biiliaco), 'mm'], ['Torace trasv.', pv(d.dm_torace_trasv), 'mm'],
        ])],
    ];
    const rz = parseFloat(d.biva_rz);
    const xc = parseFloat(d.biva_xc);
    const bia = rz > 0 && xc > 0 ? rows([['Rz', pv(rz), 'Ω'], ['Xc', pv(xc), 'Ω'], ['Angolo di fase', pv((Math.atan2(xc, rz) * 180) / Math.PI), '°']]) : [];
    groups.push(['Bioimpedenza', bia]);
    ['A', 'B'].forEach((m) => {
        const r = rep?.[`risultati_metodo_${m}`];
        if (!r) return;
        groups.push([
            `Metodo ${m}`,
            rows([['% massa grassa', pv(r.fm_percent), '%'], ['Massa grassa', pv(r.fm_kg), 'kg'], ['Massa magra', pv(r.ffm_kg), 'kg'], ['Densità', pv(r.densita), '']]),
        ]);
    });
    return groups.filter(([, r]) => r.length);
};

const fmtDate = (d) => {
    const x = d ? new Date(d) : new Date();
    return isNaN(x) ? '' : x.toLocaleDateString('it-IT', { dateStyle: 'long' });
};

// le immagini del corpo 3D costano: si rifanno solo se cambiano le misure
const snapCache = new Map();
const bodyImages = (model) => {
    const key = JSON.stringify(model);
    if (snapCache.has(key)) return snapCache.get(key);
    let imgs = [];
    try {
        imgs = [
            ['Davanti · circonferenze', snapshotBody(model, { showRings: true }, 0, 700, 800)],
            ['Dietro · circonferenze', snapshotBody(model, { showRings: true }, Math.PI, 700, 800)],
            ['Davanti · pliche', snapshotBody(model, { showPliche: true }, 0, 700, 800)],
            ['Dietro · pliche', snapshotBody(model, { showPliche: true }, Math.PI, 700, 800)],
        ];
    } catch (e) {
        imgs = [];
    }
    if (snapCache.size > 12) snapCache.clear();
    snapCache.set(key, imgs);
    return imgs;
};

// page: 1 = indici e corpo 3D, 2 = grafici, andamento, somatotipo e parametri
export const ChartsPage = ({ page, patient, visitData, report, sesso, eta, model, somatoValues, date }) => {
    const imgs = useMemo(() => (page === 1 ? bodyImages(model) : []), [page, model]);
    const trend = useMemo(() => (page === 2 ? trendPoints(patient, visitData, report, date) : null), [page, patient, visitData, report, date]);
    const groups = useMemo(() => paramGroups(visitData || {}, report), [visitData, report]);
    const hasSomato = somatoValues && (somatoValues.endo > 0 || somatoValues.meso > 0 || somatoValues.ecto > 0);
    const name = `${patient?.nome || ''} ${patient?.cognome || ''}`.trim();
    const header = (
        <div className="cr-hd">
            <div>
                <h1>{page === 1 ? 'Composizione corporea' : 'Grafici e parametri'}</h1>
                <p>
                    {name} · {sesso === 'F' ? 'Donna' : 'Uomo'}
                    {eta ? ` · ${eta} anni` : ''}
                    {model.altezza ? ` · ${model.altezza} cm` : ''}
                    {model.peso ? ` · ${model.peso} kg` : ''}
                </p>
            </div>
            <p>{fmtDate(date)}</p>
        </div>
    );

    if (page === 1)
        return (
            <div className="cr-page">
                {header}
                <BodyCompositionCharts visitData={visitData} report={report} sesso={sesso} eta={eta} fixed only={['stats']} />
                {imgs.length > 0 && (
                    <div className="cr-imgs">
                        {imgs.map(([t, src]) => (
                            <figure key={t}>
                                <img src={src} alt={t} />
                                {t}
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        );

    return (
        <div className="cr-page">
            {header}
            <BodyCompositionCharts visitData={visitData} report={report} sesso={sesso} eta={eta} compact only={['donut', 'fasce', 'confronto', 'composizione', 'pliche', 'circ', 'bmi', 'whtr', 'bia']} />
            <div style={{ display: 'grid', gridTemplateColumns: trend && hasSomato ? '2fr 1fr' : '1fr', gap: 8, alignItems: 'start' }}>
                {trend && (
                    <div className="cr-box">
                        <strong>Andamento nel tempo</strong>
                        <TrendChart points={trend} width={470} height={150} />
                    </div>
                )}
                {hasSomato && (
                    <div className="cr-box">
                        <strong>Somatotipo</strong>
                        <div style={{ width: 230, height: 172, overflow: 'hidden' }}>
                            <div style={{ zoom: 0.3 }}>
                                <Somatocarta endo={somatoValues.endo} meso={somatoValues.meso} ecto={somatoValues.ecto} />
                            </div>
                        </div>
                        <span style={{ fontSize: 9 }}>
                            Endo {somatoValues.endo.toFixed(1)} · Meso {somatoValues.meso.toFixed(1)} · Ecto {somatoValues.ecto.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>
            {groups.length > 0 && (
                <div className="cr-box">
                    <strong>Parametri della visita</strong>
                    <div className="cr-params">
                        {groups.map(([g, rows]) => (
                            <table key={g}>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>{g}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(([l, v, u]) => (
                                        <tr key={l}>
                                            <td>{l}</td>
                                            <td>
                                                {v} {u}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
