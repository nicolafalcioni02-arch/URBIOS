export const buildVitaminPanel = ({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB }) => {
    const vitKeys = [
        { key: 'vitamin_a_retinol_equivalent', name: 'Vit A', drvKey: 'vitamin_a_retinol_equivalent', scale: 1 },
        { key: 'vitamin_c', name: 'Vit C', drvKey: 'vitamin_c', scale: 1 },
        { key: 'vitamin_d', name: 'Vit D', drvKey: 'vitamin_d', scale: 100 }, // μg→ scala ×100 per visibilità
        { key: 'vitamin_e', name: 'Vit E', drvKey: 'vitamin_e', scale: 1 },
        { key: 'folate', name: 'Folato', drvKey: 'folate', scale: 1 },
        { key: 'vitamin_b12', name: 'Vit B12', drvKey: 'vitamin_b12', scale: 1000 },
        { key: 'vitamin_k', name: 'Vit K', drvKey: 'vitamin_k', scale: 1 },
        { key: 'thiamine', name: 'B1', drvKey: 'thiamine', scale: 1 },
        { key: 'riboflavin', name: 'B2', drvKey: 'riboflavin', scale: 1 },
        { key: 'niacin', name: 'Niacina', drvKey: 'niacin', scale: 1 },
    ];
    const spokes = vitKeys.map((k) => k.name);
    sourceItems.forEach((items, i) => {
        const vals = vitKeys.map((k) => {
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
    delete layout.xaxis;
    delete layout.yaxis;
};
