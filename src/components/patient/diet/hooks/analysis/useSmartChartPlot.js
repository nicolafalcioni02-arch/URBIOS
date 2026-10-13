import { useRef, useEffect } from 'react';
import { METRIC_CATALOG } from '../../data/metricCatalog';
import { NUTRIENT_MAPPING } from '../../data/nutrientMapping';
import { calculateTotals } from '../../logic/dietTotals';
import { buildLipidPanel } from './plotBuilders/buildLipidPanel';
import { buildAminoPanel } from './plotBuilders/buildAminoPanel';
import { buildMicroPanel } from './plotBuilders/buildMicroPanel';
import { buildVitaminPanel } from './plotBuilders/buildVitaminPanel';
import { buildBioactivePanel } from './plotBuilders/buildBioactivePanel';
import { buildDrvRadar } from './plotBuilders/buildDrvRadar';
import { buildSingleMetric } from './plotBuilders/buildSingleMetric';
import { buildKcalChart } from './plotBuilders/buildKcalChart';
import { buildMacroChart } from './plotBuilders/buildMacroChart';

// Disegna il grafico Plotly dello Smart Report Maker quando il modale è aperto
export const useSmartChartPlot = ({ activeDay, dietDays, drvDB, getPatientTargets, isSmartOpen, smartConfig, sumFieldFromDB, targets }) => {
    // --- MOTORE PLOTLY.JS (Senza Menu fluttuante e con etichette chiare) ---
    const plotRef = useRef(null);

    useEffect(() => {
        if (!isSmartOpen || !window.Plotly || !plotRef.current) return;

        const m = METRIC_CATALOG[smartConfig.metric] || METRIC_CATALOG['kcal'];
        const patientTargets = getPatientTargets(); // usa la funzione già esistente

        // ── Costruzione Labels & Dataset ─────────────────────────────────────────
        let labels = [];
        let sourceItems = []; // array di arrays-of-items per ogni label

        if (smartConfig.scope === 'activeDay') {
            if (!activeDay) return;
            labels = activeDay.meals.map((meal, i) => meal.title || `Pasto ${i + 1}`);
            sourceItems = activeDay.meals.map((meal) => meal.items);
        } else {
            labels = dietDays.map((d, i) => d.title || `Giorno ${i + 1}`);
            sourceItems = dietDays.map((day) => day.meals.flatMap((m) => m.items));
        }

        // ── Palette Colori Pro ────────────────────────────────────────────────────
        const PALETTE = {
            primary: '#0A84FF',
            green: '#30D158',
            gray: '#636366',
            orange: '#FF9F0A',
            red: '#FF453A',
            purple: '#BF5AF2',
            teal: '#5AC8FA',
            pink: '#FF375F',
            bg: 'rgba(0,0,0,0)',
            grid: 'rgba(0,0,0,0.04)',
            text: '#1D1D1F',
            subtext: '#8E8E93',
        };

        const GROUP_COLORS = {
            'Macro Base': PALETTE.primary,
            'Profilo Lipidico': PALETTE.orange,
            Aminoacidi: PALETTE.purple,
            Micronutrienti: PALETTE.teal,
            Vitamine: PALETTE.green,
            Bioattivi: PALETTE.pink,
            'Analisi DRV': PALETTE.gray,
        };
        const barColor = GROUP_COLORS[m.group] || PALETTE.primary;

        // ── Layout base ───────────────────────────────────────────────────────────
        const baseLayout = {
            autosize: true,
            margin: { t: 50, l: 65, r: 65, b: 70 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', color: PALETTE.subtext, size: 11 },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.22,
                x: 0.5,
                xanchor: 'center',
                bgcolor: 'rgba(255,255,255,0.9)',
                bordercolor: 'rgba(0,0,0,0.05)',
                borderwidth: 1,
                font: { size: 10, color: PALETTE.text },
            },
            xaxis: {
                tickangle: labels.length > 5 ? -40 : 0,
                gridcolor: PALETTE.grid,
                zeroline: false,
                showline: false,
            },
            yaxis: {
                gridcolor: PALETTE.grid,
                zeroline: false,
                showline: false,
            },
        };

        // ── Helpers ───────────────────────────────────────────────────────────────
        const makeDRVLine = (targetVal, label, color = PALETTE.red) => ({
            type: 'scatter',
            mode: 'lines',
            name: `Target ${label}`,
            x: [...labels, labels[labels.length - 1]],
            y: Array(labels.length + 1).fill(targetVal),
            line: { color, width: 2, dash: 'dot' },
            hoverinfo: 'name+y',
        });

        let plotData = [];
        let layout = { ...baseLayout };

        // ══════════════════════════════════════════════════════════════════════════
        // ROUTING PER AGGREGATION SPECIALI (pannelli multi-serie)
        // ══════════════════════════════════════════════════════════════════════════

        // ── PANNELLO LIPIDICO ─────────────────────────────────────────────────────
        if (m.aggregation === 'lipid_panel') {
            buildLipidPanel({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB });
        }

        // ── PANNELLO AMINOACIDI ───────────────────────────────────────────────────
        else if (m.aggregation === 'amino_panel') {
            buildAminoPanel({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB });
        }

        // ── PANNELLO MICRONUTRIENTI ───────────────────────────────────────────────
        else if (m.aggregation === 'micro_panel') {
            buildMicroPanel({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB });
        }

        // ── PANNELLO VITAMINE ─────────────────────────────────────────────────────
        else if (m.aggregation === 'vita_panel') {
            buildVitaminPanel({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB });
        }

        // ── PANNELLO BIOATTIVI ────────────────────────────────────────────────────
        else if (m.aggregation === 'bio_panel') {
            buildBioactivePanel({ PALETTE, labels, layout, plotData, sourceItems, sumFieldFromDB });
        }

        // ── RADAR DRV COVERAGE ───────────────────────────────────────────────────
        else if (m.aggregation === 'drv_radar') {
            buildDrvRadar({ PALETTE, labels, layout, patientTargets, plotData, sourceItems, sumFieldFromDB });
        }

        // ══════════════════════════════════════════════════════════════════════════
        // ROUTING STANDARD (singola metrica)
        // ══════════════════════════════════════════════════════════════════════════
        else if (m.keys) {
            buildSingleMetric({ PALETTE, barColor, labels, layout, m, makeDRVLine, patientTargets, plotData, smartConfig, sourceItems, sumFieldFromDB });
        }

        // ── Macro base legacy (kcal / macro comparison) ───────────────────────────
        else if (m.aggregation === 'kcal') {
            buildKcalChart({ PALETTE, labels, layout, makeDRVLine, plotData, smartConfig, sourceItems, targets });
        } else if (m.aggregation === 'macro') {
            buildMacroChart({ PALETTE, labels, layout, plotData, smartConfig, sourceItems });
        }

        // ── Render finale ─────────────────────────────────────────────────────────
        window.Plotly.purge(plotRef.current);
        window.Plotly.newPlot(plotRef.current, plotData, layout, {
            displayModeBar: false,
            responsive: true,
            scrollZoom: false,
        });
    }, [isSmartOpen, activeDay, smartConfig, dietDays, drvDB]);

    return { plotRef };
};
