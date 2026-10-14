import React, { useMemo } from 'react';
import { Somatocarta } from '../../components/charts/somatocarta/Somatocarta';
import { BodyCompositionCharts } from './sections/BodyCompositionCharts';
import { snapshotBody } from './sections/Body3D';
import { PLI_SITES } from './sections/measureSites';

// Report grafici: due pagine fisse (corpo 3D e indici; grafici, andamento e parametri) usate dal Centro stampa.
export const chartsCss = `
.cr-page { display: flex; flex-direction: column; gap: 3mm; font-family: Inter, system-ui, sans-serif; color: #1c1917; }
.cr-hd { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: .4mm solid var(--accent, #1c1917); padding-bottom: 2.5mm; }
.cr-kicker { font-size: 7.5pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--accent, #4f46e5); }
.cr-hd h1 { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 600; font-size: 20pt; line-height: 1.1; margin: .5mm 0 0; }
.cr-hd p { margin: 1mm 0 0; font-size: 8.5pt; color: #78716c; } .cr-hd .cr-date { font-weight: 600; color: #1c1917; }
.cr-p1 { display: flex; flex-direction: column; gap: 3mm; }
.cr-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; border: 1px solid #e7e5e4; border-radius: 3mm; padding: 2mm; background: radial-gradient(ellipse at 50% 35%, #fff 0%, #f5f3f0 75%); }
.cr-imgs figure { margin: 0; text-align: center; } .cr-imgs img { width: 100%; height: auto; display: block; }
.cr-imgs figcaption { font-size: 7.5pt; color: #78716c; font-weight: 600; margin-top: 1mm; }
.cr-empty { grid-column: 1 / -1; text-align: center; color: #a8a29e; font-size: 9pt; padding: 30mm 4mm; }
.cr-p2 { display: grid; grid-template-columns: 1fr 2fr; gap: 2mm; align-items: start; }
.cr-p2 > .cr-box:only-child { grid-column: 1 / -1; }
.cr-box { border: 1px solid #e7e5e4; border-radius: 3mm; padding: 2.5mm 3mm; font-size: 9pt; background: #fff; }
.cr-box > strong { display: block; margin-bottom: 1.5mm; font-size: 8.5pt; }
.cr-somato { font-size: 8pt; color: #57534e; }
.cr-params { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm 4mm; font-size: 7.5pt; }
.cr-params table { border-collapse: collapse; width: 100%; align-self: start; } .cr-params th { text-align: left; font-size: 7pt; letter-spacing: .08em; text-transform: uppercase; color: var(--accent, #4f46e5); border-bottom: 1px solid #e7e5e4; padding: .5mm 0; }
.cr-params td { padding: .4mm 0; color: #44403c; } .cr-params td:last-child { text-align: right; font-weight: 700; white-space: nowrap; }
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
    const hasCirc = ['collo', 'torace', 'vita', 'fianchi', 'braccio', 'coscia', 'polpaccio'].some((k) => model[k] > 0);
    const hasPl = Object.values(model.pl || {}).some((v) => v > 0);
    let imgs = [];
    try {
        if (hasCirc) imgs.push(['Circonferenze · vista frontale', snapshotBody(model, { showRings: true }, 0, 440, 680)]);
        if (hasPl) imgs.push(['Pliche · vista di tre quarti', snapshotBody(model, { showPliche: true }, -0.75, 440, 680)]);
        if (imgs.length === 1) imgs.push([hasCirc ? 'Vista laterale' : 'Pliche · vista frontale', snapshotBody(model, hasCirc ? { showRings: true } : { showPliche: true }, hasCirc ? -Math.PI / 2 : 0, 440, 680)]);
    } catch (e) {
        imgs = [];
    }
    if (snapCache.size > 12) snapCache.clear();
    snapCache.set(key, imgs);
    return imgs;
};

// page: 1 = indici, corpo 3D e composizione; 2 = misure, andamento, somatotipo e parametri
export const ChartsPage = ({ page, patient, visitData, report, sesso, eta, model, somatoValues, date }) => {
    const imgs = useMemo(() => (page === 1 ? bodyImages(model) : []), [page, model]);
    const groups = useMemo(() => paramGroups(visitData || {}, report), [visitData, report]);
    const hasSomato = somatoValues && (somatoValues.endo > 0.1 || somatoValues.meso > 0.1 || somatoValues.ecto > 0.1);
    const name = `${patient?.nome || ''} ${patient?.cognome || ''}`.trim();
    const common = { visitData, report, sesso, eta, patient, date, compact: true };
    const header = (
        <div className="cr-hd">
            <div>
                <div className="cr-kicker">{page === 1 ? 'Composizione corporea' : 'Misure e andamento'}</div>
                <h1>{name}</h1>
                <p>
                    {sesso === 'F' ? 'Donna' : 'Uomo'}
                    {eta ? ` · ${eta} anni` : ''}
                    {model.altezza ? ` · ${model.altezza} cm` : ''}
                    {model.peso ? ` · ${model.peso} kg` : ''}
                </p>
            </div>
            <p className="cr-date">{fmtDate(date)}</p>
        </div>
    );

    if (page === 1)
        return (
            <div className="cr-page">
                {header}
                <BodyCompositionCharts {...common} only={['stats']} />
                <div className="cr-p1">
                    <div className="cr-imgs">
                        {imgs.map(([t, src]) => (
                            <figure key={t}>
                                <img src={src} alt={t} />
                                <figcaption>{t}</figcaption>
                            </figure>
                        ))}
                        {!imgs.length && <p className="cr-empty">Inserisci circonferenze o pliche per vedere il modello corporeo.</p>}
                    </div>
                    <BodyCompositionCharts {...common} only={['composizione', 'grasso', 'rischio']} columns={3} />
                </div>
            </div>
        );

    return (
        <div className="cr-page">
            {header}
            <BodyCompositionCharts {...common} only={['pliche', 'circ', 'magra', 'bia', 'metodi', 'trend']} columns={2} />
            {(hasSomato || groups.length > 0) && (
                <div className="cr-p2">
                    {hasSomato && (
                        <div className="cr-box">
                            <strong>Somatotipo</strong>
                            <div style={{ width: '100%', aspectRatio: '1.33', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ zoom: 0.3, position: 'absolute', left: 0, top: 0 }}>
                                    <Somatocarta endo={somatoValues.endo} meso={somatoValues.meso} ecto={somatoValues.ecto} />
                                </div>
                            </div>
                            <span className="cr-somato">
                                Endo <b>{somatoValues.endo.toFixed(1)}</b> · Meso <b>{somatoValues.meso.toFixed(1)}</b> · Ecto <b>{somatoValues.ecto.toFixed(1)}</b>
                            </span>
                        </div>
                    )}
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
            )}
        </div>
    );
};
