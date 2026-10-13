import { NUTRIENT_MAPPING } from '../../../data/nutrientMapping';

export const buildDrvRadar = ({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB }) => {
    const drvKeys = Object.keys(patientTargets).slice(0, 12); // max 12 spokes
    const spokes = drvKeys.map((k) => patientTargets[k].name || k);

    sourceItems.forEach((items, i) => {
        const r = drvKeys.map((key) => {
            const fieldKeys = Object.values(NUTRIENT_MAPPING)
                .map((v, idx) => (v === key ? Object.keys(NUTRIENT_MAPPING)[idx] : null))
                .filter(Boolean);
            const raw = sumFieldFromDB(items, [key]);
            const target = patientTargets[key]?.target || 1;
            return Math.min((raw / target) * 100, 150);
        });

        plotData.push({
            type: 'scatterpolar',
            r: [...r, r[0]],
            theta: [...spokes, spokes[0]],
            fill: 'toself',
            name: labels[i],
            opacity: 0.65,
        });
    });
    layout.polar = {
        radialaxis: { visible: true, range: [0, 150], ticksuffix: '%', gridcolor: PALETTE.grid },
        angularaxis: { gridcolor: PALETTE.grid },
    };
    layout.title = { text: 'Copertura DRV (100% = target EFSA)', font: { size: 12, color: PALETTE.subtext } };
    delete layout.xaxis;
    delete layout.yaxis;
};
