import { calculateTotals } from '../../../logic/dietTotals';

export const buildKcalChart = ({ PALETTE, labels, layout, makeDRVLine, plotData, smartConfig, sourceItems, targets }) => {
    const kcalVals = sourceItems.map((items) => calculateTotals(items).kcal);
    if (smartConfig.type === 'bar' || smartConfig.type === 'line') {
        const type = smartConfig.type === 'bar' ? 'bar' : 'scatter';
        const mode = smartConfig.type === 'line' ? 'lines+markers' : undefined;
        plotData.push({
            x: labels,
            y: kcalVals,
            type,
            mode,
            name: 'Kcal',
            marker: { color: PALETTE.primary },
            line: { color: PALETTE.primary, width: 3 },
            fill: smartConfig.type === 'line' ? 'tozeroy' : 'none',
        });
        if (smartConfig.showTarget && targets.kcal) {
            plotData.push(makeDRVLine(targets.kcal, 'Target Kcal', PALETTE.green));
        }
    } else if (smartConfig.type === 'pie') {
        plotData.push({ labels, values: kcalVals, type: 'pie', hole: 0.42, textinfo: 'label+percent' });
    }
    layout.yaxis.title = { text: 'Calorie (Kcal)' };
};
