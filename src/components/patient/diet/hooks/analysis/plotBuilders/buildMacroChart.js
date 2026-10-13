import { calculateTotals } from '../../../logic/dietTotals';

export const buildMacroChart = ({ PALETTE, labels, layout, plotData, smartConfig, sourceItems }) => {
    const cVals = sourceItems.map((items) => calculateTotals(items).c);
    const pVals = sourceItems.map((items) => calculateTotals(items).p);
    const fVals = sourceItems.map((items) => calculateTotals(items).f);
    const type = smartConfig.type === 'line' ? 'scatter' : 'bar';
    const mode = smartConfig.type === 'line' ? 'lines+markers' : undefined;
    // (nel file originale era una riassegnazione di plotData: qui si riempie lo stesso array, che parte vuoto)
    plotData.push(
        ...[
            { x: labels, y: cVals, type, mode, name: 'Carbo (g)', marker: { color: '#1D1D1F' }, line: { color: '#1D1D1F', width: 2 } },
            { x: labels, y: pVals, type, mode, name: 'Pro (g)', marker: { color: PALETTE.green }, line: { color: PALETTE.green, width: 2 } },
            { x: labels, y: fVals, type, mode, name: 'Fat (g)', marker: { color: PALETTE.gray }, line: { color: PALETTE.gray, width: 2 } },
        ]
    );
    layout.barmode = smartConfig.type === 'bar' ? 'stack' : undefined;
    layout.yaxis.title = { text: 'Grammi (g)' };
};
