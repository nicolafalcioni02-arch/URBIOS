import { calculateTotals } from '../../../logic/dietTotals';

export const buildSingleMetric = ({
    PALETTE,
    barColor,
    labels,
    layout,
    m,
    makeDRVLine,
    patientTargets,
    plotData,
    smartConfig,
    sourceItems,
    sumFieldFromDB,
}) => {
    const vals = sourceItems.map((items) => sumFieldFromDB(items, m.keys));

    if (smartConfig.type === 'bar' || smartConfig.type === 'line') {
        const type = smartConfig.type === 'bar' ? 'bar' : 'scatter';
        const mode = smartConfig.type === 'line' ? 'lines+markers' : undefined;
        plotData.push({
            x: labels,
            y: vals,
            type,
            mode,
            name: m.label,
            marker: { color: barColor, opacity: 0.9, line: { color: 'rgba(0,0,0,0.05)', width: 1 } },
            line: { color: barColor, width: 3, shape: 'spline' },
            fill: smartConfig.type === 'line' ? 'tozeroy' : 'none',
            fillcolor: smartConfig.type === 'line' ? barColor.replace(')', ',0.08)').replace('rgb', 'rgba') : undefined,
            text: vals.map((v) => `${v.toFixed(2)} ${m.unit}`),
            textposition: 'outside',
            textfont: { size: 9, color: PALETTE.text },
            hovertemplate: `<b>%{x}</b><br>${m.label}: %{y:.2f} ${m.unit}<extra></extra>`,
        });

        // Linea target DRV (se disponibile e attivata)
        if (smartConfig.showTarget && m.drvKey && patientTargets[m.drvKey]) {
            const targetVal = patientTargets[m.drvKey].target;
            plotData.push(makeDRVLine(targetVal, `${m.label} (DRV)`, PALETTE.red));
            // Linea UL (limite superiore)
            if (patientTargets[m.drvKey].ul) {
                plotData.push(makeDRVLine(patientTargets[m.drvKey].ul, 'UL Limite', PALETTE.orange));
            }
        }
        layout.yaxis.title = { text: `${m.label} (${m.unit})` };
    } else if (smartConfig.type === 'pie') {
        plotData.push({
            labels,
            values: vals,
            type: 'pie',
            hole: 0.42,
            textinfo: 'label+percent',
            hovertemplate: `<b>%{label}</b><br>${m.label}: %{value:.2f} ${m.unit}<br>(%{percent})<extra></extra>`,
            marker: {
                colors: labels.map((_, i) => `hsl(${(i * 47 + 195) % 360}, 65%, 58%)`),
                line: { color: 'white', width: 2 },
            },
        });
        layout.margin = { t: 30, l: 30, r: 30, b: 60 };
    } else if (smartConfig.type === 'radar') {
        plotData.push({
            type: 'scatterpolar',
            r: [...vals, vals[0]],
            theta: [...labels, labels[0]],
            fill: 'toself',
            name: m.label,
            line: { color: barColor, width: 2 },
            marker: { color: barColor },
            fillcolor: barColor.replace(')', ',0.15)').replace('rgb', 'rgba'),
        });
        layout.polar = { radialaxis: { visible: true, gridcolor: PALETTE.grid } };
        delete layout.xaxis;
        delete layout.yaxis;
    } else if (smartConfig.type === 'mixed') {
        const kcalVals = sourceItems.map((items) => calculateTotals(items).kcal);
        plotData.push({
            x: labels,
            y: kcalVals,
            type: 'bar',
            name: 'Kcal',
            marker: { color: PALETTE.gray, opacity: 0.7 },
            yaxis: 'y1',
        });
        plotData.push({
            x: labels,
            y: vals,
            type: 'scatter',
            mode: 'lines+markers',
            name: m.label,
            line: { color: barColor, width: 3, shape: 'spline' },
            marker: { color: barColor, size: 8 },
            yaxis: 'y2',
        });
        layout.yaxis = { title: { text: 'Kcal', font: { color: PALETTE.gray } }, tickfont: { color: PALETTE.gray } };
        layout.yaxis2 = { title: { text: `${m.label} (${m.unit})`, font: { color: barColor } }, tickfont: { color: barColor }, overlaying: 'y', side: 'right' };
    } else if (smartConfig.type === '3d') {
        const cVals = sourceItems.map((items) => calculateTotals(items).c);
        const pVals = sourceItems.map((items) => calculateTotals(items).p);
        plotData.push({
            x: cVals,
            y: pVals,
            z: vals,
            mode: 'markers+text',
            type: 'scatter3d',
            text: labels,
            textposition: 'top center',
            marker: { size: 9, color: vals, colorscale: 'Viridis', opacity: 0.85, showscale: true, colorbar: { title: m.unit } },
        });
        layout.scene = {
            xaxis: { title: { text: 'Carboidrati (g)' } },
            yaxis: { title: { text: 'Proteine (g)' } },
            zaxis: { title: { text: m.label + ` (${m.unit})` } },
        };
        layout.margin = { l: 0, r: 0, b: 0, t: 0 };
    }
};
