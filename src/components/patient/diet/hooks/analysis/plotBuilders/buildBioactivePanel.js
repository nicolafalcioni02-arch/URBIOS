export const buildBioactivePanel = ({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB }) => {
    const bioKeys = [
        { keys: ['polyphenols'], name: 'Polifenoli', color: PALETTE.pink },
        { keys: ['lycopene'], name: 'Licopene', color: PALETTE.red },
        { keys: ['lutein', 'zeaxanthin'], name: 'Lut+Zeax', color: PALETTE.orange },
        { keys: ['beta_carotene'], name: 'β-Carotene', color: PALETTE.orange },
        { keys: ['quercetin'], name: 'Quercetina', color: PALETTE.purple },
        { keys: ['phytosterols'], name: 'Fitosteroli', color: PALETTE.teal },
    ];
    bioKeys.forEach((bk) => {
        const vals = sourceItems.map((items) => sumFieldFromDB(items, bk.keys));
        if (vals.some((v) => v > 0)) {
            plotData.push({
                x: labels,
                y: vals,
                type: 'bar',
                name: bk.name,
                marker: { color: bk.color, opacity: 0.85 },
            });
        }
    });
    layout.barmode = 'group';
    layout.yaxis.title = { text: 'Bioattivi (mg)' };
};
