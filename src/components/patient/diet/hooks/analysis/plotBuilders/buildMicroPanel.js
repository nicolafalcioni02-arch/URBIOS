export const buildMicroPanel = ({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB }) => {
    // Radar micronutrienti: ogni spoke = un minerale, valore = % del target EFSA
    const microKeys = [
        { key: 'calcium', name: 'Ca', drvKey: 'calcium' },
        { key: 'iron', name: 'Fe', drvKey: 'iron' },
        { key: 'magnesium', name: 'Mg', drvKey: 'magnesium' },
        { key: 'zinc', name: 'Zn', drvKey: 'zinc' },
        { key: 'potassium', name: 'K', drvKey: 'potassium' },
        { key: 'selenium', name: 'Se', drvKey: 'selenium' },
        { key: 'copper', name: 'Cu', drvKey: 'copper' },
        { key: 'iodine', name: 'I', drvKey: 'iodine' },
    ];
    const spokes = microKeys.map((k) => k.name);
    sourceItems.forEach((items, i) => {
        const vals = microKeys.map((k) => {
            const raw = sumFieldFromDB(items, [k.key]);
            const target = patientTargets[k.drvKey]?.target || 1;
            return Math.min((raw / target) * 100, 150);
        });
        plotData.push({
            type: 'scatterpolar',
            r: [...vals, vals[0]],
            theta: [...spokes, spokes[0]],
            fill: 'toself',
            name: labels[i],
            opacity: 0.6,
        });
    });
    layout.polar = {
        radialaxis: { visible: true, range: [0, 150], ticksuffix: '%', gridcolor: PALETTE.grid },
        angularaxis: { gridcolor: PALETTE.grid },
    };
    layout.showlegend = true;
    delete layout.xaxis;
    delete layout.yaxis;
};
