import React, { useRef, useEffect } from 'react';
import { calculateTotals } from '../logic/dietTotals';

// --- SOTTO-COMPONENTE: GENERATORE MINI GRAFICI ---
export const MiniReportChart = ({ report, allDays }) => {
    const miniPlotRef = useRef(null);

    useEffect(() => {
        if (!window.Plotly || !miniPlotRef.current) return;

        const config = report.config;
        let labels = [];
        let dataMap = { kcal: [], p: [], c: [], f: [], weight: [] };

        // Ricostruzione dati in base allo scope salvato
        if (config.scope === 'activeDay') {
            const targetDay = allDays.find((d) => d.id === report.dayId) || allDays[0];
            if (!targetDay) return;
            labels = (targetDay.meals || []).map((m, i) => m.title || `Pasto ${i + 1}`);
            dataMap.kcal = targetDay.meals.map((m) => calculateTotals(m.items).kcal);
            dataMap.p = targetDay.meals.map((m) => calculateTotals(m.items).p);
            dataMap.c = targetDay.meals.map((m) => calculateTotals(m.items).c);
            dataMap.f = targetDay.meals.map((m) => calculateTotals(m.items).f);
            dataMap.weight = targetDay.meals.map((m) => m.items.reduce((acc, it) => acc + (Number(it.weight) || 0), 0));
        } else {
            labels = allDays.map((d, i) => d.title || `Giorno ${i + 1}`);
            allDays.forEach((day) => {
                const dayItems = day.meals.flatMap((m) => m.items);
                const dayTotals = calculateTotals(dayItems);
                dataMap.kcal.push(dayTotals.kcal);
                dataMap.p.push(dayTotals.p);
                dataMap.c.push(dayTotals.c);
                dataMap.f.push(dayTotals.f);
                dataMap.weight.push(dayItems.reduce((acc, it) => acc + (Number(it.weight) || 0), 0));
            });
        }

        const cColor = '#1D1D1F';
        const pColor = '#00C853';
        const fColor = '#86868B';
        const accColor = '#007AFF';
        let plotData = [];
        let layout = {
            autosize: true,
            margin: { t: 10, l: 30, r: 30, b: 30 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { family: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#86868B', size: 10 },
            showlegend: false, // Legenda nascosta per le card compatte
        };

        // Mappatura compatta dei grafici
        if (config.type === 'bar' || config.type === 'line') {
            const type = config.type === 'bar' ? 'bar' : 'scatter';
            const mode = config.type === 'line' ? 'lines+markers' : undefined;
            if (config.metric === 'macro') {
                plotData.push({ x: labels, y: dataMap.c, type, mode, marker: { color: cColor }, line: { color: cColor } });
                plotData.push({ x: labels, y: dataMap.p, type, mode, marker: { color: pColor }, line: { color: pColor } });
                plotData.push({ x: labels, y: dataMap.f, type, mode, marker: { color: fColor }, line: { color: fColor } });
                if (config.type === 'bar') layout.barmode = 'stack';
            } else {
                const col = config.metric === 'weight' ? accColor : config.metric === 'p' ? pColor : cColor;
                plotData.push({
                    x: labels,
                    y: dataMap[config.metric],
                    type,
                    mode,
                    marker: { color: col },
                    line: { color: col },
                    fill: config.type === 'line' ? 'tozeroy' : 'none',
                });
            }
        } else if (config.type === 'pie') {
            if (config.metric === 'macro') {
                plotData.push({
                    labels: ['C', 'P', 'F'],
                    values: [dataMap.c.reduce((a, b) => a + b, 0), dataMap.p.reduce((a, b) => a + b, 0), dataMap.f.reduce((a, b) => a + b, 0)],
                    type: 'pie',
                    hole: 0.5,
                    marker: { colors: [cColor, pColor, fColor] },
                    textinfo: 'percent',
                });
            } else {
                plotData.push({ labels: labels, values: dataMap[config.metric], type: 'pie', hole: 0.5, textinfo: 'percent' });
            }
        } else if (config.type === 'mixed') {
            plotData.push({ x: labels, y: dataMap.kcal, type: 'bar', marker: { color: cColor }, yaxis: 'y1' });
            plotData.push({ x: labels, y: dataMap.weight, type: 'scatter', mode: 'lines+markers', line: { color: accColor }, yaxis: 'y2' });
            layout.yaxis2 = { overlaying: 'y', side: 'right', showticklabels: false };
        } else if (config.type === 'radar') {
            labels.forEach((label, i) => {
                plotData.push({
                    type: 'scatterpolar',
                    r: [dataMap.c[i], dataMap.p[i], dataMap.f[i], dataMap.c[i]],
                    theta: ['C', 'P', 'F', 'C'],
                    fill: 'toself',
                });
            });
            layout.polar = { radialaxis: { visible: false } };
        } else if (config.type === '3d') {
            plotData.push({
                x: dataMap.c,
                y: dataMap.p,
                z: dataMap.f,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: 5, color: dataMap.kcal, colorscale: 'Viridis' },
            });
            layout.margin = { l: 0, r: 0, b: 0, t: 0 };
        }

        window.Plotly.purge(miniPlotRef.current);
        window.Plotly.newPlot(miniPlotRef.current, plotData, layout, { displayModeBar: false, responsive: true, staticPlot: true }); // staticPlot disabilita interazioni pesanti sulle card
    }, [report, allDays]);

    return <div ref={miniPlotRef} style={{ width: '100%', height: '220px', marginTop: 'auto' }}></div>;
};
