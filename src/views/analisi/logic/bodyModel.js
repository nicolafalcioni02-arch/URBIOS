import { PLI_SITES } from '../sections/measureSites';

// Dati per il corpo 3D e per il report grafici, a partire da una visita.
export const buildBodyModel = (visitData, report, sesso) => {
    const gv = (k) => parseFloat(String(visitData?.[k] ?? '').replace(',', '.')) || 0;
    const fm = parseFloat(report?.risultati_metodo_A?.fm_percent) || parseFloat(report?.risultati_metodo_B?.fm_percent) || 0;
    const bil = (k) => gv(`${k}_dx`) || gv(`${k}_sx`) || gv(k);
    return {
        sesso: sesso || 'M',
        altezza: gv('altezza'),
        peso: gv('peso'),
        fm,
        collo: gv('cm_collo'),
        torace: gv('cm_torace'),
        vita: gv('cm_vita_min'),
        fianchi: gv('cm_fianchi_max'),
        braccio: bil('circ_braccio') || gv('circ_braccio_flesso'),
        coscia: bil('circ_coscia'),
        polpaccio: bil('circ_polpaccio'),
        pl: Object.fromEntries(PLI_SITES.map((p) => [p.key, gv(p.key)])),
    };
};
