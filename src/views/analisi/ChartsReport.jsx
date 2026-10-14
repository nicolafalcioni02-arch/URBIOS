import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Somatocarta } from '../../components/charts/somatocarta/Somatocarta';
import { BodyCompositionCharts } from './sections/BodyCompositionCharts';
import { snapshotBody } from './sections/Body3D';
import { TrendChart, trendPoints } from './sections/TrendChart';
import { PLI_SITES } from './sections/measureSites';

// Report solo grafici: due pagine A4 fisse, non modificabili. Si stampa o si salva in PDF dal browser.
const css = `
.cr-overlay { position: fixed; inset: 0; z-index: 10000; background: #e5e7eb; overflow: auto; font-family: Inter, system-ui, sans-serif; color: #111827; }
.cr-top { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #e5e7eb; }
.cr-top button { border: 0; border-radius: 12px; padding: 8px 16px; font-weight: 700; font-size: 13px; cursor: pointer; }
.cr-wrap { padding: 20px 0 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
.cr-page { width: 210mm; height: 297mm; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.12); padding: 10mm 12mm 8mm; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; gap: 3mm; }
.cr-hd { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111827; padding-bottom: 3mm; }
.cr-hd h1 { font-size: 18px; margin: 0; } .cr-hd p { margin: 2px 0 0; font-size: 11px; color: #6b7280; }
.cr-ft { margin-top: auto; font-size: 9px; color: #9ca3af; display: flex; justify-content: space-between; }
.cr-imgs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
.cr-imgs figure { margin: 0; padding: 0 5mm; text-align: center; font-size: 9px; color: #6b7280; } .cr-imgs img { width: 100%; height: auto; display: block; }
.cr-box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px 8px; font-size: 11px; }
.cr-box > strong { display: block; margin-bottom: 3px; }
.cr-params { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px 12px; font-size: 9px; }
.cr-params table { border-collapse: collapse; width: 100%; align-self: start; } .cr-params th { text-align: left; font-size: 9px; color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding: 1px 0; }
.cr-params td { padding: 1px 0; color: #374151; } .cr-params td:last-child { text-align: right; font-weight: 700; }
@media screen and (max-width: 800px) { .cr-page { zoom: .45; } }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; height: auto !important; overflow: visible !important; }
  body > *:not(.cr-overlay), body > #root { display: none !important; height: 0 !important; overflow: hidden !important; }
  /* index.css nasconde tutto (body * { visibility: hidden }) per la stampa dei report: qui va ripristinato */
  .cr-overlay, .cr-overlay * { visibility: visible !important; }
  .cr-overlay { position: static !important; overflow: visible !important; background: #fff !important; }
  .cr-top { display: none !important; }
  .cr-wrap { padding: 0; gap: 0; display: block; }
  .cr-page { box-shadow: none; break-after: page; page-break-after: always; zoom: 1 !important; }
  .cr-page:last-child { break-after: auto; page-break-after: auto; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
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

export const ChartsReport = ({ patient, visitData, report, sesso, eta, model, somatoValues, date, onClose }) => {
    // immagini del modello: davanti e dietro, con anelli e con pliche
    const imgs = useMemo(() => {
        try {
            return [
                ['Davanti · circonferenze', snapshotBody(model, { showRings: true }, 0, 700, 800)],
                ['Dietro · circonferenze', snapshotBody(model, { showRings: true }, Math.PI, 700, 800)],
                ['Davanti · pliche', snapshotBody(model, { showPliche: true }, 0, 700, 800)],
                ['Dietro · pliche', snapshotBody(model, { showPliche: true }, Math.PI, 700, 800)],
            ];
        } catch (e) {
            return [];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(model)]);

    const trend = useMemo(() => trendPoints(patient, visitData, report, date), [patient, visitData, report, date]);
    const groups = useMemo(() => paramGroups(visitData || {}, report), [visitData, report]);
    const hasSomato = somatoValues && (somatoValues.endo > 0 || somatoValues.meso > 0 || somatoValues.ecto > 0);
    const name = `${patient?.nome || ''} ${patient?.cognome || ''}`.trim();
    const Header = ({ page }) => (
        <div className="cr-hd">
            <div>
                <h1>Composizione corporea</h1>
                <p>
                    {name} · {sesso === 'F' ? 'Donna' : 'Uomo'}
                    {eta ? ` · ${eta} anni` : ''}
                    {model.altezza ? ` · ${model.altezza} cm` : ''}
                    {model.peso ? ` · ${model.peso} kg` : ''}
                </p>
            </div>
            <p>
                {fmtDate(date)} · pag. {page}/2
            </p>
        </div>
    );
    const Footer = () => (
        <div className="cr-ft">
            <span>URBIOS · report grafici</span>
            <span>Documento non modificabile</span>
        </div>
    );

    return ReactDOM.createPortal(
        <div className="cr-overlay">
            <style>{css}</style>
            <div className="cr-top">
                <strong style={{ fontSize: 14 }}>Report grafici · A4</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: '#111827', color: '#fff' }} onClick={() => window.print()}>
                        <i className="ph-bold ph-printer"></i> Stampa / PDF
                    </button>
                    <button style={{ background: '#f3f4f6', color: '#374151' }} onClick={onClose}>
                        Chiudi
                    </button>
                </div>
            </div>
            <div className="cr-wrap">
                <div className="cr-page">
                    <Header page={1} />
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
                    <Footer />
                </div>
                <div className="cr-page">
                    <Header page={2} />
                    <BodyCompositionCharts visitData={visitData} report={report} sesso={sesso} eta={eta} compact only={['donut', 'fasce', 'confronto', 'composizione', 'pliche', 'circ', 'bmi', 'whtr', 'bia']} />
                    <div style={{ display: 'grid', gridTemplateColumns: trend ? '2fr 1fr' : '1fr', gap: 8, alignItems: 'start' }}>
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
                                {groups.map(([name, rows]) => (
                                    <table key={name}>
                                        <thead>
                                            <tr>
                                                <th colSpan={2}>{name}</th>
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
                    <Footer />
                </div>
            </div>
        </div>,
        document.body
    );
};
