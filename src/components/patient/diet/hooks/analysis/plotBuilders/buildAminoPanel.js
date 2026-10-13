export const buildAminoPanel = ({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB }) => {
    const aminoKeys = [
        { key: 'leucine', name: 'Leu', color: PALETTE.purple },
        { key: 'isoleucine', name: 'Ile', color: '#9B59B6' },
        { key: 'valine', name: 'Val', color: '#8E44AD' },
        { key: 'lysine', name: 'Lys', color: PALETTE.teal },
        { key: 'threonine', name: 'Thr', color: PALETTE.orange },
        { key: 'methionine', name: 'Met', color: PALETTE.green },
        { key: 'phenylalanine', name: 'Phe', color: PALETTE.primary },
        { key: 'tryptophan', name: 'Trp', color: PALETTE.pink },
        { key: 'histidine', name: 'His', color: '#F39C12' },
    ];
    aminoKeys.forEach((ak) => {
        const vals = sourceItems.map((items) => sumFieldFromDB(items, [ak.key]));
        if (vals.some((v) => v > 0)) {
            plotData.push({
                x: labels,
                y: vals,
                type: 'bar',
                name: ak.name,
                marker: { color: ak.color, opacity: 0.85 },
            });
        }
    });
    layout.barmode = 'stack';
    layout.yaxis.title = { text: 'Aminoacidi (g)' };
};
