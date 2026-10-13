export const buildLipidPanel = ({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB }) => {
    const lipidKeys = [
        { key: 'Saturated_fatty_acids', name: 'SFA', color: PALETTE.red },
        { key: 'monounsaturated_fatty_acids', name: 'MUFA', color: PALETTE.orange },
        { key: 'polyunsaturated_fatty_acids', name: 'PUFA', color: PALETTE.green },
        { key: 'C20:5_eicosapentaenoic_acid_EPA', name: 'EPA', color: PALETTE.teal },
        { key: 'C22:6_docosahexaenoic_acid_DHA', name: 'DHA', color: PALETTE.primary },
    ];
    lipidKeys.forEach((lk) => {
        plotData.push({
            x: labels,
            y: sourceItems.map((items) => sumFieldFromDB(items, [lk.key])),
            type: 'bar',
            name: lk.name,
            marker: { color: lk.color, opacity: 0.85 },
            text: sourceItems.map((items) => sumFieldFromDB(items, [lk.key]).toFixed(2) + 'g'),
            textposition: 'outside',
            textfont: { size: 9 },
        });
    });
    layout.barmode = 'group';
    layout.yaxis.title = { text: 'Acidi Grassi (g)' };
};
