import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import { POPULATIONS } from '../../logic/db_defaults';
import { getBivariateZ, getEllipsePoints } from '../../logic/calculations';

export const BivaChart = ({ rz, xc, h }) => {
    const chartRef = useRef(null);
    const [selectedPopId, setSelectedPopId] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    // larghezza della finestra: in modalita' espansa, se e' stretta i due grafici vanno uno sopra l'altro
    const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const onResize = () => setWinW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // STATO PER I VALORI DI RIFERIMENTO
    const [customRef, setCustomRef] = useState({
        mx: POPULATIONS[0].mx,
        my: POPULATIONS[0].my,
        sx: POPULATIONS[0].sx,
        sy: POPULATIONS[0].sy,
        r: POPULATIONS[0].corr,
    });

    useEffect(() => {
        const pop = POPULATIONS.find((p) => p.id == selectedPopId);
        if (pop) setCustomRef({ mx: pop.mx, my: pop.my, sx: pop.sx, sy: pop.sy, r: pop.corr });
    }, [selectedPopId]);

    const handleRefChange = (field, value) => {
        setCustomRef((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    // Preparazione Dati Plotly
    const ref = customRef;
    const el50 = getEllipsePoints(ref.mx, ref.my, ref.sx, ref.sy, ref.r, 0.5);
    const el75 = getEllipsePoints(ref.mx, ref.my, ref.sx, ref.sy, ref.r, 0.75);
    const el95 = getEllipsePoints(ref.mx, ref.my, ref.sx, ref.sy, ref.r, 0.95);

    // Generazione Superficie 3D (Background)
    // Usiamo useMemo per non ricalcolare la superficie 3D ad ogni render (risparmio batteria!)
    const { x_vals, y_vals, z_vals } = React.useMemo(() => {
        const steps = 25;
        const rangeX = 4 * ref.sx;
        const rangeY = 5 * ref.sy;
        let x_vals = [],
            y_vals = [],
            z_vals = [];
        for (let i = 0; i < steps; i++) x_vals.push(ref.mx - rangeX + (2 * rangeX * i) / (steps - 1));
        for (let i = 0; i < steps; i++) y_vals.push(ref.my - rangeY + (2 * rangeY * i) / (steps - 1));
        for (let j = 0; j < steps; j++) {
            let row = [];
            for (let i = 0; i < steps; i++) row.push(getBivariateZ(x_vals[i], y_vals[j], ref.mx, ref.my, ref.sx, ref.sy, ref.r));
            z_vals.push(row);
        }
        return { x_vals, y_vals, z_vals };
    }, [ref]); // Ricalcola solo se cambia la popolazione di riferimento

    let patTraces = [];
    const hasData = rz && xc && h && !isNaN(parseFloat(rz)) && !isNaN(parseFloat(h));

    if (hasData) {
        const H_m = parseFloat(h) / 100;
        const R_val = parseFloat(rz);
        const Xc_val = parseFloat(xc);

        if (H_m > 0) {
            const pat_r = R_val / H_m;
            const pat_xc = Xc_val / H_m;
            const pat_z = getBivariateZ(pat_r, pat_xc, ref.mx, ref.my, ref.sx, ref.sy, ref.r);

            // 3D Point
            patTraces.push({
                type: 'scatter3d',
                mode: 'markers',
                x: [pat_r],
                y: [pat_xc],
                z: [pat_z],
                marker: { size: 6, color: 'white', line: { color: 'black', width: 1 } },
                name: 'Tu',
                scene: 'scene1',
            });
            patTraces.push({
                type: 'scatter3d',
                mode: 'lines',
                x: [pat_r, pat_r],
                y: [pat_xc, pat_xc],
                z: [pat_z, 0],
                line: { color: 'white', width: 2 },
                showlegend: false,
                scene: 'scene1',
            });
            // 2D Point
            patTraces.push({
                type: 'scatter',
                mode: 'markers',
                x: [pat_r],
                y: [pat_xc],
                marker: { size: 14, color: '#000', line: { color: 'white', width: 3 } },
                name: 'Paziente',
                xaxis: 'x',
                yaxis: 'y',
            });
        }
    }

    // Tracce Grafico
    const traceSurf = {
        type: 'surface',
        z: z_vals,
        x: x_vals,
        y: y_vals,
        opacity: 0.2,
        colorscale: 'Viridis',
        showscale: false,
        contours: { x: { show: false }, y: { show: false }, z: { show: true, usecolormap: true, project: { z: false } } },
        hoverinfo: 'skip',
        scene: 'scene1',
    };
    const floor50 = {
        type: 'scatter3d',
        mode: 'lines',
        x: el50.x,
        y: el50.y,
        z: el50.z_floor,
        line: { color: '#10B981', width: 4 },
        showlegend: false,
        scene: 'scene1',
    };
    const floor75 = {
        type: 'scatter3d',
        mode: 'lines',
        x: el75.x,
        y: el75.y,
        z: el75.z_floor,
        line: { color: '#F59E0B', width: 4 },
        showlegend: false,
        scene: 'scene1',
    };
    const floor95 = {
        type: 'scatter3d',
        mode: 'lines',
        x: el95.x,
        y: el95.y,
        z: el95.z_floor,
        line: { color: '#EF4444', width: 4 },
        showlegend: false,
        scene: 'scene1',
    };
    const contour2D = {
        type: 'contour',
        z: z_vals,
        x: x_vals,
        y: y_vals,
        colorscale: 'Greys',
        showscale: false,
        contours: { coloring: 'fill' },
        line: { width: 0 },
        opacity: 0.1,
        xaxis: 'x',
        yaxis: 'y',
        hoverinfo: 'skip',
    };
    const line2D_50 = { type: 'scatter', mode: 'lines', x: el50.x, y: el50.y, line: { color: '#10B981', width: 3 }, name: '50%', xaxis: 'x', yaxis: 'y' };
    const line2D_75 = { type: 'scatter', mode: 'lines', x: el75.x, y: el75.y, line: { color: '#F59E0B', width: 3 }, name: '75%', xaxis: 'x', yaxis: 'y' };
    const line2D_95 = { type: 'scatter', mode: 'lines', x: el95.x, y: el95.y, line: { color: '#EF4444', width: 3 }, name: '95%', xaxis: 'x', yaxis: 'y' };

    // Layout
    const rangeBufferX = 3.5 * ref.sx;
    const rangeBufferY = 3.5 * ref.sy;
    const maxX = ref.mx + 4 * ref.sx;
    const maxY = ref.my + 4 * ref.sy;

    const sideBySide = isExpanded && winW >= 760;
    const gridConfig = sideBySide ? { rows: 1, columns: 2, pattern: 'independent' } : { rows: 2, columns: 1, pattern: 'independent' };

    const sceneDomain = sideBySide ? { x: [0, 0.48], y: [0, 1] } : { row: 0, column: 0 };
    const axes2D_DomainX = sideBySide ? [0.52, 1] : [0, 1];
    const axes2D_DomainY = sideBySide ? [0, 1] : [0, 0.45];

    const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: isExpanded ? '#ffffff' : 'rgba(255,255,255,0.5)',
        font: { family: 'Inter, sans-serif', color: '#333', size: 10 },
        showlegend: false,
        margin: isExpanded ? { l: 50, r: 50, b: 50, t: 50 } : { l: 40, r: 10, b: 40, t: 10 },
        grid: gridConfig,
        // espanso: nessuna altezza fissa, il grafico riempie lo spazio e segue il ridimensionamento della finestra
        height: isExpanded ? undefined : 550,
        autosize: true,

        scene1: {
            domain: sceneDomain,
            xaxis: { title: 'R/H', showgrid: true, gridcolor: '#ddd', showbackground: false, range: [0, maxX], autorange: false },
            yaxis: { title: 'Xc/H', showgrid: true, gridcolor: '#ddd', showbackground: false, range: [0, maxY], autorange: false },
            zaxis: { title: 'Prob', showgrid: true, gridcolor: '#ddd', showbackground: false, range: [0, 'auto'], autorange: false },
            camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } },
            aspectmode: 'cube',
        },

        xaxis: {
            domain: axes2D_DomainX,
            title: 'R/H',
            anchor: 'y',
            gridcolor: '#e5e7eb',
            dtick: 50,
            tick0: 0,
            range: [ref.mx - rangeBufferX, ref.mx + rangeBufferX],
        },
        yaxis: {
            domain: axes2D_DomainY,
            title: 'Xc/H',
            anchor: 'x',
            gridcolor: '#e5e7eb',
            dtick: 5,
            tick0: 0,
            range: [ref.my - rangeBufferY, ref.my + rangeBufferY],
            scaleanchor: 'x',
            scaleratio: 10,
        },
    };

    const plotData = [traceSurf, floor50, floor75, floor95, contour2D, line2D_95, line2D_75, line2D_50, ...patTraces];

    // --- RENDER COMPONENTE ---
    // Usiamo una funzione interna per il contenuto grafico per gestire il "Fullscreen"
    const GraphContent = (
        <div className={`w-full h-full ${isExpanded ? 'bg-white p-4 flex flex-col' : ''}`}>
            {isExpanded && (
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3 pb-3 border-b border-gray-100 flex-none">
                    <h3 className="font-bold text-lg sm:text-xl">Analisi BIVA avanzata</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {/* Selettore Popolazione nel Fullscreen */}
                        <select
                            value={selectedPopId}
                            onChange={(e) => setSelectedPopId(e.target.value)}
                            className="bg-gray-100 border-none rounded-full px-4 py-2 text-sm font-bold text-gray-700 cursor-pointer outline-none max-w-[16rem] sm:max-w-sm truncate"
                        >
                            {POPULATIONS.map((pop) => (
                                <option key={pop.id} value={pop.id}>
                                    {pop.desc}
                                </option>
                            ))}
                        </select>
                        {/* Box Input Rapidi nel Fullscreen */}
                        {['mx', 'my', 'sx', 'sy', 'r'].map((k) => (
                            <div key={k} className="flex items-center gap-1">
                                <span className="text-xs font-bold text-gray-400 ">{k}</span>
                                <input
                                    type="number"
                                    value={customRef[k]}
                                    onChange={(e) => handleRefChange(k, e.target.value)}
                                    className="w-16 text-center text-xs font-bold border-b bg-transparent"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="w-10 h-10 flex-none bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            aria-label="Chiudi"
                        >
                            <i className="ph ph-x"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Controlli Mini (visibili solo se non espanso) */}
            {!isExpanded && (
                <div className="mb-3 border-b border-gray-100 pb-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-400">Riferimento BIVA</label>
                        <select
                            value={selectedPopId}
                            onChange={(e) => setSelectedPopId(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] font-bold text-gray-700 cursor-pointer outline-none w-2/3"
                        >
                            {POPULATIONS.map((pop) => (
                                <option key={pop.id} value={pop.id}>
                                    {pop.desc}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => setIsExpanded(true)} className="ml-2 text-gray-400 hover:text-black">
                            <i className="ph ph-arrows-out-simple"></i>
                        </button>
                    </div>
                </div>
            )}

            <div className={`flex-1 w-full ${isExpanded ? 'min-h-0' : 'min-h-[450px]'}`}>
                <Plot
                    data={plotData}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </div>
    );

    // A schermo intero il grafico va sul body: dentro un genitore animato/trasformato `fixed` non coprirebbe lo schermo
    if (isExpanded) return ReactDOM.createPortal(<div className="fixed inset-0 z-[10000] bg-white">{GraphContent}</div>, document.body);

    return <div className="bg-white rounded-xl border border-gray-200 p-4 h-full flex flex-col shadow-sm relative">{GraphContent}</div>;
};
